export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
}

export function toDateInput(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}

export function toDateTimeInput(value?: Date | string | null) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}
