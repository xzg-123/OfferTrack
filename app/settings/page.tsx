import { DataManagement } from "@/components/data-management";

export default function SettingsPage() {
  return <div><div className="mb-7"><p className="text-sm font-medium text-indigo-600">数据管理</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">备份与恢复</h1><p className="mt-2 text-sm text-slate-500">OfferTrack 始终只在本地保存你的求职数据。</p></div><DataManagement /></div>;
}
