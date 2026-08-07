import Link from "next/link";

export function EmptyState({ title, body, action = true }: { title: string; body: string; action?: boolean }) {
  return <div className="card px-6 py-14 text-center"><div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-lg text-indigo-700">+</div><h3 className="font-semibold text-slate-900">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{body}</p>{action && <Link href="/applications/new" className="button-primary mt-5">新建投递</Link>}</div>;
}
