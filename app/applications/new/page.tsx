import { createApplication } from "@/app/actions";
import { ApplicationForm } from "@/components/application-form";

export default function NewApplicationPage() { return <div><div className="mb-7"><p className="text-sm font-medium text-indigo-600">新建投递</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">添加职位</h1><p className="mt-2 text-sm text-slate-500">先填写基本信息，保存后即可创建专属招聘流程。</p></div><ApplicationForm action={createApplication} /></div>; }
