import { Application } from "@/lib/generated/prisma";
import { applicationStatusLabels, applicationStatuses, channels } from "@/lib/constants";
import { toDateInput } from "@/lib/format";

type Props = { action: (form: FormData) => void | Promise<void>; application?: Application };

export function ApplicationForm({ action, application }: Props) {
  return <form action={action} encType="multipart/form-data" className="card max-w-3xl p-5 sm:p-7">
    {application && <input type="hidden" name="id" value={application.id} />}
    <div className="grid gap-5 sm:grid-cols-2">
      <div><label className="label" htmlFor="company">公司 <span className="text-red-500">*</span></label><input className="input" id="company" name="company" required defaultValue={application?.company} placeholder="例如：字节跳动" /></div>
      <div><label className="label" htmlFor="jobTitle">职位名称 <span className="text-red-500">*</span></label><input className="input" id="jobTitle" name="jobTitle" required defaultValue={application?.jobTitle} placeholder="例如：AI 产品经理" /></div>
      <div><label className="label" htmlFor="applicationDate">投递日期 <span className="text-red-500">*</span></label><input className="input" id="applicationDate" name="applicationDate" type="date" required defaultValue={application ? toDateInput(application.applicationDate) : new Date().toISOString().slice(0, 10)} /></div>
      <div><label className="label" htmlFor="status">投递状态</label><select className="input" id="status" name="status" defaultValue={application?.status ?? "applied"}>{applicationStatuses.map((status) => <option key={status} value={status}>{applicationStatusLabels[status]}</option>)}</select></div>
      <div><label className="label" htmlFor="location">工作地点</label><input className="input" id="location" name="location" defaultValue={application?.location ?? ""} placeholder="例如：北京" /></div>
      <div><label className="label" htmlFor="channel">投递渠道</label><select className="input" id="channel" name="channel" defaultValue={application?.channel ?? ""}><option value="">请选择渠道</option>{channels.map((channel) => <option key={channel}>{channel}</option>)}</select></div>
      <div className="sm:col-span-2"><label className="label" htmlFor="jobUrl">职位链接</label><input className="input" id="jobUrl" name="jobUrl" type="url" defaultValue={application?.jobUrl ?? ""} placeholder="https://…" /></div>
      <div className="sm:col-span-2"><label className="label" htmlFor="resume">本次投递的简历</label><input className="input file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-sm file:font-medium file:text-indigo-700" id="resume" name="resume" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /><p className="mt-1.5 text-xs text-slate-500">支持 PDF、DOC、DOCX，最大 10MB。{application?.resumeName ? `当前文件：${application.resumeName}` : "未上传简历"}</p></div>
      <div className="sm:col-span-2"><label className="label" htmlFor="notes">投递备注</label><textarea className="input min-h-28 resize-y" id="notes" name="notes" defaultValue={application?.notes ?? ""} placeholder="记录与这个职位相关的整体备注…" /></div>
    </div>
    <div className="mt-7 flex justify-end gap-3"><a href={application ? `/applications/${application.id}` : "/applications"} className="button-secondary">取消</a><button className="button-primary" type="submit">{application ? "保存修改" : "创建投递"}</button></div>
  </form>;
}
