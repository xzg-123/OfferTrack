import { applicationStatusLabels, stageStatusLabels } from "@/lib/constants";

const styles: Record<string, string> = {
  wishlist: "bg-slate-100 text-slate-700", applied: "bg-blue-50 text-blue-700", in_progress: "bg-violet-50 text-violet-700", offer: "bg-emerald-50 text-emerald-700", rejected: "bg-red-50 text-red-700", withdrawn: "bg-slate-100 text-slate-600",
  pending: "bg-slate-100 text-slate-700", scheduled: "bg-amber-50 text-amber-700", completed: "bg-blue-50 text-blue-700", passed: "bg-emerald-50 text-emerald-700", failed: "bg-red-50 text-red-700", cancelled: "bg-slate-100 text-slate-600",
};

export function StatusBadge({ status }: { status: string }) {
  const label = applicationStatusLabels[status as keyof typeof applicationStatusLabels] ?? stageStatusLabels[status as keyof typeof stageStatusLabels] ?? status;
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>{label}</span>;
}
