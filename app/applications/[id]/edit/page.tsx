import { notFound } from "next/navigation";
import Link from "next/link";
import { updateApplication } from "@/app/actions";
import { ApplicationForm } from "@/components/application-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const application = await prisma.application.findUnique({ where: { id } }); if (!application) notFound();
  return <div><Link href={`/applications/${id}`} className="inline-flex text-sm font-medium text-slate-500 hover:text-indigo-600">← 返回投递详情</Link><div className="mb-7 mt-5"><p className="text-sm font-medium text-indigo-600">编辑投递</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{application.company}</h1><p className="mt-2 text-sm text-slate-500">更新职位信息或整体投递状态。</p></div><ApplicationForm action={updateApplication} application={application} /></div>;
}
