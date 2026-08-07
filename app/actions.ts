"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const optional = (form: FormData, key: string) => text(form, key) || null;
const date = (value: string) => new Date(value);

async function saveResume(form: FormData) {
  const resume = form.get("resume");
  if (!(resume instanceof File) || resume.size === 0) return null;
  if (resume.size > 10 * 1024 * 1024) throw new Error("简历文件不能超过 10MB。");
  const extension = path.extname(resume.name).toLowerCase();
  if (![".pdf", ".doc", ".docx"].includes(extension)) throw new Error("仅支持 PDF、DOC 或 DOCX 格式的简历。");
  const directory = process.env.OFFERTRACK_UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
  const filename = `${crypto.randomUUID()}${extension}`;
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), Buffer.from(await resume.arrayBuffer()));
  return { resumePath: process.env.OFFERTRACK_UPLOAD_DIR ? `/api/resumes/${filename}` : `/uploads/${filename}`, resumeName: resume.name };
}

function refresh(applicationId?: string) {
  revalidatePath("/"); revalidatePath("/applications");
  if (applicationId) revalidatePath(`/applications/${applicationId}`);
}

export async function createApplication(form: FormData) {
  const company = text(form, "company"); const jobTitle = text(form, "jobTitle"); const applicationDate = text(form, "applicationDate");
  if (!company || !jobTitle || !applicationDate) return;
  const resume = await saveResume(form);
  const application = await prisma.application.create({ data: {
    company, jobTitle, applicationDate: date(applicationDate), location: optional(form, "location"), jobUrl: optional(form, "jobUrl"),
    channel: optional(form, "channel"), notes: optional(form, "notes"), status: text(form, "status") || "applied", ...resume,
  } });
  refresh(application.id); redirect(`/applications/${application.id}`);
}

export async function updateApplication(form: FormData) {
  const id = text(form, "id"); const company = text(form, "company"); const jobTitle = text(form, "jobTitle"); const applicationDate = text(form, "applicationDate");
  if (!id || !company || !jobTitle || !applicationDate) return;
  const resume = await saveResume(form);
  await prisma.application.update({ where: { id }, data: {
    company, jobTitle, applicationDate: date(applicationDate), location: optional(form, "location"), jobUrl: optional(form, "jobUrl"), channel: optional(form, "channel"), notes: optional(form, "notes"), status: text(form, "status"), ...(resume ?? {}),
  } });
  refresh(id); redirect(`/applications/${id}`);
}

export async function deleteApplication(form: FormData) {
  const id = text(form, "id"); if (!id) return;
  await prisma.application.delete({ where: { id } }); refresh(); redirect("/applications");
}

export async function createStage(form: FormData) {
  const applicationId = text(form, "applicationId"); const name = text(form, "name"); if (!applicationId || !name) return;
  const last = await prisma.stage.aggregate({ where: { applicationId }, _max: { order: true } });
  const scheduledAt = optional(form, "scheduledAt");
  await prisma.stage.create({ data: { applicationId, name, order: (last._max.order ?? -1) + 1, scheduledAt: scheduledAt ? date(scheduledAt) : null, status: text(form, "status") || "pending", notes: optional(form, "notes") } });
  refresh(applicationId);
}

export async function updateStage(form: FormData) {
  const id = text(form, "id"); const applicationId = text(form, "applicationId"); const name = text(form, "name"); if (!id || !applicationId || !name) return;
  const scheduledAt = optional(form, "scheduledAt");
  await prisma.stage.update({ where: { id }, data: { name, scheduledAt: scheduledAt ? date(scheduledAt) : null, status: text(form, "status"), notes: optional(form, "notes") } });
  refresh(applicationId);
}

export async function deleteStage(form: FormData) {
  const id = text(form, "id"); const applicationId = text(form, "applicationId"); if (!id || !applicationId) return;
  await prisma.stage.delete({ where: { id } }); refresh(applicationId);
}

export async function moveStage(form: FormData) {
  const id = text(form, "id"); const applicationId = text(form, "applicationId"); const direction = text(form, "direction");
  const stages = await prisma.stage.findMany({ where: { applicationId }, orderBy: { order: "asc" } }); const index = stages.findIndex((stage) => stage.id === id); const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= stages.length) return;
  await prisma.$transaction([prisma.stage.update({ where: { id: stages[index].id }, data: { order: stages[targetIndex].order } }), prisma.stage.update({ where: { id: stages[targetIndex].id }, data: { order: stages[index].order } })]);
  refresh(applicationId);
}
