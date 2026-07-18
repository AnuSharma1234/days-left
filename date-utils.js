function parseDateInput(dateStr) {
  if (!dateStr) {
    return new Date();
  }

  const parsed = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysLeft(targetDate, today) {
  const target = parseDateInput(targetDate);
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = target.getTime() - current.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getWeeksLeft(targetDate, today) {
  return Math.max(0, Math.ceil(getDaysLeft(targetDate, today) / 7));
}

function formatWeeksLeft(weeksLeft) {
  return `${Math.max(0, weeksLeft)}`;
}
