import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // This script intentionally replaces local demo data only. Do not run it against personal records.
  await prisma.application.deleteMany();
  await prisma.application.create({ data: { company: "ByteDance", jobTitle: "AI Product Manager", location: "Beijing", applicationDate: new Date("2026-08-07"), channel: "Official Website", status: "in_progress", stages: { create: [
    { name: "Application submitted", order: 0, status: "completed" },
    { name: "Online assessment", order: 1, status: "passed", scheduledAt: new Date("2026-08-09T20:00:00") },
    { name: "First interview", order: 2, status: "passed", scheduledAt: new Date("2026-08-12T14:00:00"), notes: "Discussed product sense and RAG evaluation." },
    { name: "Second interview", order: 3, status: "scheduled", scheduledAt: new Date("2026-08-18T14:00:00") },
  ] } } });
  await prisma.application.create({ data: { company: "Tencent", jobTitle: "Product Manager", location: "Shenzhen", applicationDate: new Date("2026-08-06"), channel: "Campus Recruitment", status: "applied", stages: { create: [{ name: "Online assessment", order: 0, status: "scheduled", scheduledAt: new Date("2026-08-10T20:00:00") }] } } });
  await prisma.application.create({ data: { company: "Meituan", jobTitle: "AI Product Manager", location: "Beijing", applicationDate: new Date("2026-08-05"), channel: "Referral", status: "offer", stages: { create: [{ name: "Final interview", order: 0, status: "passed" }, { name: "Offer", order: 1, status: "completed" }] } } });
}

main().then(() => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
