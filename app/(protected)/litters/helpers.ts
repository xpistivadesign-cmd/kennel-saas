export function getWhelpingPrediction(startDateStr: string | null) {
  if (!startDateStr) return { due: "Nincs megadva", daysLeft: 0 };
  const start = new Date(startDateStr);
  const due = new Date(start);
  due.setDate(start.getDate() + 63); // 63 napos vemhesség

  const today = new Date();
  const diff = due.getTime() - today.getTime();
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return {
    due: due.toISOString().split("T")[0],
    daysLeft: daysLeft < 0 ? 0 : daysLeft
  };
}
