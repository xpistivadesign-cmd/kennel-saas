export function getDueDate(matingDate: string) {
  const d = new Date(matingDate);
  d.setDate(d.getDate() + 63);
  return d;
}

export function getCountdown(dueDate: Date) {
  const now = new Date().getTime();
  const diff = dueDate.getTime() - now;

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}