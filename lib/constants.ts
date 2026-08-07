export const applicationStatuses = ["wishlist", "applied", "in_progress", "offer", "rejected", "withdrawn"] as const;
export const stageStatuses = ["pending", "scheduled", "completed", "passed", "failed", "cancelled"] as const;

export const applicationStatusLabels: Record<(typeof applicationStatuses)[number], string> = {
  wishlist: "心愿清单", applied: "已投递", in_progress: "进行中", offer: "已获 Offer", rejected: "已拒绝", withdrawn: "已撤回",
};

export const stageStatusLabels: Record<(typeof stageStatuses)[number], string> = {
  pending: "待处理", scheduled: "已安排", completed: "已完成", passed: "已通过", failed: "未通过", cancelled: "已取消",
};

export const channels = ["官网", "LinkedIn", "内推", "BOSS 直聘", "猎聘", "校园招聘", "其他"];
