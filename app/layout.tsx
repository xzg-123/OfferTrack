import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "OfferTrack · 求职进度管理", description: "个人求职投递进度管理工具" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body><header className="border-b border-slate-200 bg-white"><div className="shell flex h-[72px] items-center justify-between"><Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-slate-900"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-700 text-sm font-bold text-white shadow-[0_4px_12px_rgba(79,70,229,.3)]">O</span><span>OfferTrack</span><span className="hidden rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:inline">个人版</span></Link><nav className="flex items-center gap-1 text-sm font-medium text-slate-600"><Link className="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-slate-900" href="/">仪表盘</Link><Link className="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-slate-900" href="/applications">我的投递</Link><Link className="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-slate-900" href="/settings">数据管理</Link><Link className="button-primary ml-2" href="/applications/new">+ 新建投递</Link></nav></div></header><main className="shell py-8 sm:py-10">{children}</main></body></html>;
}
