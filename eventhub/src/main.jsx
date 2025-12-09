import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/system/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'

// Ensure body scroll is restored on app start (in case of previous crash or modal issue)
document.body.style.overflow = '';
document.body.style.pointerEvents = 'auto';

// Remove any orphaned modal overlays that might be blocking the screen
// This can happen if a modal was open during a crash or hot reload
const removeOrphanedOverlays = () => {
  // Force restore body styles
  document.body.style.overflow = '';
  document.body.style.pointerEvents = 'auto';
  document.documentElement.style.overflow = '';
  document.documentElement.style.pointerEvents = 'auto';
  
  // Remove any elements with fixed positioning that cover the entire screen
  // but only if they don't have visible content (orphaned backdrops)
  const overlays = document.querySelectorAll('[class*="fixed"]');
  overlays.forEach(overlay => {
    const zIndex = parseInt(window.getComputedStyle(overlay).zIndex) || 0;
    const opacity = parseFloat(window.getComputedStyle(overlay).opacity) || 1;
    const display = window.getComputedStyle(overlay).display;
    
    // Remove high z-index overlays that are invisible or have no content
    if (zIndex >= 40 && (opacity === 0 || display === 'none')) {
      overlay.remove();
    }
    
    // Check if it's a backdrop without modal content
    if (overlay.classList.contains('backdrop') || overlay.getAttribute('aria-hidden') === 'true') {
      const hasModalContent = overlay.parentElement?.querySelector('[role="dialog"]');
      if (!hasModalContent && zIndex >= 40) {
        overlay.remove();
      }
    }
  });
  
  // Remove any orphaned backdrop elements
  const backdrops = document.querySelectorAll('[class*="backdrop"]');
  backdrops.forEach(backdrop => {
    const position = window.getComputedStyle(backdrop).position;
    const parent = backdrop.parentElement;
    const hasDialog = parent?.querySelector('[role="dialog"]');
    
    if (position === 'fixed' && !hasDialog) {
      backdrop.remove();
    }
  });
};

// Run cleanup immediately
removeOrphanedOverlays();

// Also run after delays to catch any that are created during render
setTimeout(removeOrphanedOverlays, 100);
setTimeout(removeOrphanedOverlays, 500);
setTimeout(removeOrphanedOverlays, 1000);

// Add global click handler to detect and remove blocking overlays
// If user clicks but nothing happens, there might be an invisible overlay
let clickCount = 0;
document.addEventListener('click', (e) => {
  // Check if click is being blocked by an invisible overlay
  const target = e.target;
  const isBlocked = target === document.body || target === document.documentElement;
  
  if (isBlocked) {
    clickCount++;
    // If multiple clicks on body, likely an invisible overlay
    if (clickCount > 2) {
      removeOrphanedOverlays();
      clickCount = 0;
    }
  } else {
    clickCount = 0;
  }
}, true); // Use capture phase to catch blocked clicks

// Add global keyboard handler to force cleanup
window.addEventListener('keydown', (e) => {
  if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
    // Force cleanup when dev tools are opened
    removeOrphanedOverlays();
  }
  // Also allow Escape to force cleanup
  if (e.key === 'Escape' && e.ctrlKey) {
    removeOrphanedOverlays();
  }
});

// Temporarily disable StrictMode to avoid double rendering issues
// that might cause modal/overlay problems
createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>
)
