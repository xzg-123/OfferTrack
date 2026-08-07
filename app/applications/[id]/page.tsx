import Link from "next/link";
import { notFound } from "next/navigation";
import { createStage, deleteApplication, deleteStage, moveStage, updateStage } from "@/app/actions";
import { StatusBadge } from "@/components/status-badge";
import { stageStatusLabels, stageStatuses } from "@/lib/constants";
import { formatDate, formatDateTime, toDateTimeInput } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const application = await prisma.application.findUnique({ where: { id }, include: { stages: { orderBy: { order: "asc" } } } });
  if (!application) notFound();

  return <div className="space-y-8">
    <Link href="/applications" className="inline-flex text-sm font-medium text-slate-500 hover:text-indigo-600">← 返回投递列表</Link>
    <section className="card p-5 sm:p-7">
      <div className="flex flex-col justify-between gap-5 sm:flex-row"><div>
        <div className="flex items-center gap-3"><h1 className="text-3xl font-semibold tracking-tight text-slate-950">{application.company}</h1><StatusBadge status={application.status} /></div>
        <p className="mt-1 text-lg text-slate-600">{application.jobTitle}</p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500"><span>投递日期：<strong className="font-medium text-slate-700">{formatDate(application.applicationDate)}</strong></span>{application.location && <span>地点：<strong className="font-medium text-slate-700">{application.location}</strong></span>}{application.channel && <span>渠道：<strong className="font-medium text-slate-700">{application.channel}</strong></span>}{application.jobUrl && <a href={application.jobUrl} target="_blank" rel="noreferrer" className="font-medium text-indigo-600">打开职位链接 ↗</a>}{application.resumePath && <a href={application.resumePath} target="_blank" rel="noreferrer" className="font-medium text-indigo-600">查看简历：{application.resumeName ?? "已上传文件"} ↗</a>}</div>
      </div><div className="flex shrink-0 items-start gap-2"><Link className="button-secondary" href={`/applications/${id}/edit`}>编辑</Link><form action={deleteApplication}><input type="hidden" name="id" value={id} /><button className="button-danger">删除</button></form></div></div>
      {application.notes && <div className="mt-6 border-t border-slate-100 pt-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">投递备注</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{application.notes}</p></div>}
    </section>
    <section className="grid gap-6 lg:grid-cols-[1fr_330px]">
      <div className="card overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-slate-900">招聘流程时间线</h2><p className="mt-0.5 text-xs text-slate-500">每份投递都可以自定义阶段和顺序。</p></div><span className="text-sm text-slate-400">{application.stages.length} 个阶段</span></div>
        {application.stages.length === 0 ? <div className="px-5 py-12 text-center text-sm text-slate-500">尚未添加阶段，请从右侧添加第一个流程。</div> : <ol className="divide-y divide-slate-100">{application.stages.map((stage, index) => <li className="px-5 py-4" key={stage.id}><div className="flex gap-3"><div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${["passed", "completed"].includes(stage.status) ? "bg-emerald-500" : stage.status === "failed" ? "bg-red-500" : stage.status === "scheduled" ? "bg-amber-400" : "bg-slate-300"}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-slate-900">{stage.name}</p><StatusBadge status={stage.status} /></div><p className="mt-1 text-sm text-slate-500">{stage.scheduledAt ? formatDateTime(stage.scheduledAt) : "暂未设置时间"}</p>{stage.notes && <p className="mt-2 whitespace-pre-wrap rounded-md bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">{stage.notes}</p>}
          <details className="mt-3"><summary className="cursor-pointer text-sm font-medium text-indigo-600">编辑阶段</summary><form action={updateStage} className="mt-3 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"><input type="hidden" name="id" value={stage.id} /><input type="hidden" name="applicationId" value={id} /><div><label className="label">阶段名称</label><input className="input" name="name" required defaultValue={stage.name} /></div><div className="grid grid-cols-2 gap-3"><div><label className="label">日期与时间</label><input className="input" name="scheduledAt" type="datetime-local" defaultValue={toDateTimeInput(stage.scheduledAt)} /></div><div><label className="label">状态</label><select className="input" name="status" defaultValue={stage.status}>{stageStatuses.map((status) => <option key={status} value={status}>{stageStatusLabels[status]}</option>)}</select></div></div><div><label className="label">备注</label><textarea className="input min-h-24 resize-y" name="notes" defaultValue={stage.notes ?? ""} placeholder="面试题目、结果和复盘…" /></div><div className="flex justify-between"><button className="text-sm font-medium text-red-600" formAction={deleteStage}>删除阶段</button><button className="button-primary">保存阶段</button></div></form></details>
        </div><div className="flex shrink-0 gap-1"><form action={moveStage}><input type="hidden" name="id" value={stage.id} /><input type="hidden" name="applicationId" value={id} /><input type="hidden" name="direction" value="up" /><button className="button-secondary !px-2 !py-1" disabled={index === 0} title="上移">↑</button></form><form action={moveStage}><input type="hidden" name="id" value={stage.id} /><input type="hidden" name="applicationId" value={id} /><input type="hidden" name="direction" value="down" /><button className="button-secondary !px-2 !py-1" disabled={index === application.stages.length - 1} title="下移">↓</button></form></div></div></li>)}</ol>}
      </div>
      <aside className="card h-fit p-5"><h2 className="font-semibold text-slate-900">添加阶段</h2><p className="mt-1 text-sm leading-5 text-slate-500">阶段名称和顺序完全由你决定，不预设固定流程。</p><form action={createStage} className="mt-5 space-y-4"><input type="hidden" name="applicationId" value={id} /><div><label className="label">阶段名称 <span className="text-red-500">*</span></label><input className="input" name="name" required placeholder="例如：一面" /></div><div><label className="label">日期与时间</label><input className="input" name="scheduledAt" type="datetime-local" /></div><div><label className="label">状态</label><select className="input" name="status" defaultValue="pending">{stageStatuses.map((status) => <option key={status} value={status}>{stageStatusLabels[status]}</option>)}</select></div><div><label className="label">备注</label><textarea className="input min-h-28 resize-y" name="notes" placeholder="面试问题、结果和后续安排…" /></div><button className="button-primary w-full">添加阶段</button></form></aside>
    </section>
  </div>;
}
