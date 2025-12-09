// Format date to "DD.MM.YYYY — Ден от седмицата"
export function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    
    const daysOfWeek = ["Неделя", "Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота"];
    const dayOfWeek = daysOfWeek[date.getDay()];
    
    return `${day}.${month}.${year} — ${dayOfWeek}`;
  } catch {
    return dateString;
  }
}

// Helper function to format date for input[type="date"]
export function formatDateForInput(dateString) {
  if (!dateString) return "";
  // If date is already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  // Try to parse and format the date
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
}




