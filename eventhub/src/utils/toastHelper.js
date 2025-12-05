// Helper function to show toast and auto-hide after delay
export function showToast(setToast, type, message, delay = 3000) {
  setToast({ type, message });
  setTimeout(() => setToast(null), delay);
}



