const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const next = require("next");
const { PrismaClient } = require("../lib/generated/prisma");
const fs = require("fs/promises");
const http = require("http");
const path = require("path");

let database;
let server;
let mainWindow;
const appRoot = path.resolve(__dirname, "..");

function sqliteUrl(filePath) { return `file:${filePath.replace(/\\/g, "/")}`; }
function prismaEngineName() {
  if (process.platform === "win32") return "query_engine-windows.dll.node";
  if (process.platform === "darwin") return process.arch === "arm64" ? "libquery_engine-darwin-arm64.dylib.node" : "libquery_engine-darwin.dylib.node";
  throw new Error(`Unsupported desktop platform: ${process.platform}`);
}

async function ensureDatabase() {
  const dataDirectory = app.getPath("userData");
  const uploadsDirectory = path.join(dataDirectory, "uploads");
  await fs.mkdir(uploadsDirectory, { recursive: true });
  process.env.DATABASE_URL = sqliteUrl(path.join(dataDirectory, "offertrack.db"));
  process.env.OFFERTRACK_UPLOAD_DIR = uploadsDirectory;
  if (app.isPackaged) process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(process.resourcesPath, "app.asar.unpacked", "lib", "generated", "prisma", prismaEngineName());
  database = new PrismaClient();
  await database.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Application" (
    "id" TEXT NOT NULL PRIMARY KEY, "company" TEXT NOT NULL, "jobTitle" TEXT NOT NULL,
    "location" TEXT, "jobUrl" TEXT, "applicationDate" DATETIME NOT NULL, "channel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'applied', "notes" TEXT, "resumePath" TEXT,
    "resumeName" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await database.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Stage" (
    "id" TEXT NOT NULL PRIMARY KEY, "applicationId" TEXT NOT NULL, "name" TEXT NOT NULL,
    "scheduledAt" DATETIME, "status" TEXT NOT NULL DEFAULT 'pending', "notes" TEXT,
    "order" INTEGER NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`);
  await database.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Application_status_idx" ON "Application"("status")');
  await database.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Stage_applicationId_order_idx" ON "Stage"("applicationId", "order")');
  const columns = await database.$queryRawUnsafe('PRAGMA table_info("Application")');
  const names = new Set(columns.map((column) => column.name));
  if (!names.has("resumePath")) await database.$executeRawUnsafe('ALTER TABLE "Application" ADD COLUMN "resumePath" TEXT');
  if (!names.has("resumeName")) await database.$executeRawUnsafe('ALTER TABLE "Application" ADD COLUMN "resumeName" TEXT');
}

function backupFileName() { return `OfferTrack-backup-${new Date().toISOString().slice(0, 10)}.json`; }

async function exportBackup() {
  const target = await dialog.showSaveDialog(mainWindow, { title: "导出 OfferTrack 数据备份", defaultPath: path.join(app.getPath("documents"), backupFileName()), filters: [{ name: "OfferTrack 备份", extensions: ["json"] }] });
  if (target.canceled || !target.filePath) return { canceled: true };
  const applications = await database.application.findMany({ include: { stages: { orderBy: { order: "asc" } } }, orderBy: { createdAt: "asc" } });
  const uploadsDirectory = process.env.OFFERTRACK_UPLOAD_DIR;
  const resumes = [];
  for (const item of applications) {
    if (!item.resumePath || !uploadsDirectory) continue;
    const filename = path.basename(item.resumePath);
    try { resumes.push({ filename, data: (await fs.readFile(path.join(uploadsDirectory, filename))).toString("base64") }); } catch { /* a missing attachment must not block the data backup */ }
  }
  await fs.writeFile(target.filePath, JSON.stringify({ format: "offertrack-backup", version: 1, exportedAt: new Date().toISOString(), applications, resumes }, null, 2), "utf8");
  return { filePath: target.filePath, count: applications.length };
}

async function importBackup() {
  const source = await dialog.showOpenDialog(mainWindow, { title: "选择 OfferTrack 数据备份", properties: ["openFile"], filters: [{ name: "OfferTrack 备份", extensions: ["json"] }] });
  if (source.canceled || !source.filePaths[0]) return { canceled: true };
  const backup = JSON.parse(await fs.readFile(source.filePaths[0], "utf8"));
  if (backup.format !== "offertrack-backup" || !Array.isArray(backup.applications)) throw new Error("这不是有效的 OfferTrack 备份文件。");
  await database.$transaction(async (tx) => {
    await tx.stage.deleteMany(); await tx.application.deleteMany();
    for (const item of backup.applications) {
      const { stages = [], ...application } = item;
      await tx.application.create({ data: { ...application, applicationDate: new Date(application.applicationDate), createdAt: new Date(application.createdAt), updatedAt: new Date(application.updatedAt), stages: { create: stages.map((stage) => ({ ...stage, scheduledAt: stage.scheduledAt ? new Date(stage.scheduledAt) : null, createdAt: new Date(stage.createdAt), updatedAt: new Date(stage.updatedAt) })) } } });
    }
  });
  if (Array.isArray(backup.resumes) && process.env.OFFERTRACK_UPLOAD_DIR) for (const file of backup.resumes) if (typeof file.filename === "string" && typeof file.data === "string" && path.basename(file.filename) === file.filename) await fs.writeFile(path.join(process.env.OFFERTRACK_UPLOAD_DIR, file.filename), Buffer.from(file.data, "base64"));
  return { count: backup.applications.length };
}

function registerIpc() {
  ipcMain.handle("data:export-backup", exportBackup);
  ipcMain.handle("data:import-backup", importBackup);
  ipcMain.handle("data:open-folder", async () => ({ result: await shell.openPath(app.getPath("userData")), folder: app.getPath("userData") }));
}

async function start() {
  await ensureDatabase(); registerIpc();
  const nextApp = next({ dev: false, dir: appRoot, hostname: "127.0.0.1" });
  await nextApp.prepare();
  const handler = nextApp.getRequestHandler();
  server = http.createServer((request, response) => handler(request, response));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  mainWindow = new BrowserWindow({ width: 1360, height: 900, minWidth: 1040, minHeight: 700, show: false, backgroundColor: "#f7f8fb", webPreferences: { preload: path.join(__dirname, "preload.cjs"), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  mainWindow.once("ready-to-show", () => mainWindow.show());
  await mainWindow.loadURL(`http://127.0.0.1:${port}`);
}

app.whenReady().then(start);
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) start(); });
app.on("before-quit", async () => { if (server) server.close(); if (database) await database.$disconnect(); });
