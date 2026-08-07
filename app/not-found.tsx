import Link from "next/link";
export default function NotFound() { return <div className="card mx-auto max-w-lg p-10 text-center"><p className="text-sm font-medium text-indigo-600">404</p><h1 className="mt-2 text-2xl font-semibold">未找到该投递记录</h1><p className="mt-2 text-sm text-slate-500">该记录可能已删除，或访问链接已失效。</p><Link href="/applications" className="button-primary mt-6">返回投递列表</Link></div>; }
