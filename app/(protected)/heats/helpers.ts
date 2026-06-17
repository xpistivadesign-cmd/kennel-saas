export const calculateBreedingData = (startDateStr: string) => {
  const start = new Date(startDateStr);
  const today = new Date();
  
  const diffTime = today.getTime() - start.getTime();
  const elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const endDate = new Date(start);
  endDate.setDate(start.getDate() + 21);

  const nextHeatDate = new Date(start);
  nextHeatDate.setDate(start.getDate() + 180);

  const windowStart = new Date(start);
  windowStart.setDate(start.getDate() + 10); 
  const windowEnd = new Date(start);
  windowEnd.setDate(start.getDate() + 13); 

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  let statusText = "";
  let statusColor = "";
  let progressPercent = 0;

  if (elapsedDays < 1) {
    statusText = "Ütemezett / Jövőbeli";
    statusColor = "text-zinc-400 bg-zinc-900 border-zinc-800";
    progressPercent = 0;
  } else if (elapsedDays <= 9) {
    statusText = `Elő-ciklus (Proestrus) - ${elapsedDays}. nap`;
    statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    progressPercent = Math.min(100, Math.round((elapsedDays / 21) * 100));
  } else if (elapsedDays <= 14) {
    statusText = `🔥 TERMÉKENY SZAKASZ (Estrus) - ${elapsedDays}. nap`;
    statusColor = "text-pink-500 bg-pink-500/10 border-pink-500/20 animate-pulse";
    progressPercent = Math.min(100, Math.round((elapsedDays / 21) * 100));
  } else if (elapsedDays <= 21) {
    statusText = `Levezető szakasz (Diestrus) - ${elapsedDays}. nap`;
    statusColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    progressPercent = Math.min(100, Math.round((elapsedDays / 21) * 100));
  } else {
    statusText = "Lezajlott / Inaktív ciklus";
    statusColor = "text-zinc-500 bg-zinc-950 border-zinc-900";
    progressPercent = 100;
  }

  return {
    elapsedDays,
    endDate: formatDate(endDate),
    nextHeatDate: formatDate(nextHeatDate),
    windowStart: formatDate(windowStart),
    windowEnd: formatDate(windowEnd),
    statusText,
    statusColor,
    progressPercent
  };
};
