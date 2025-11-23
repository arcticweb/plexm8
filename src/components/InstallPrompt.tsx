import { useState } from 'react';

/**
 * InstallPrompt Component
 * 
 * Detects when the app is installable as a PWA and shows
 * an install prompt for Chrome, Edge, and Android browsers.
 */

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  const handleInstall = async () => {
    const event = (window as any).deferredPrompt;
    if (!event) return;

    event.prompt();
    const { outcome } = await event.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }

    (window as any).deferredPrompt = null;
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <h3>Install PlexM8</h3>
        <p>Install this app on your device for quick access and offline support.</p>
        <div className="install-buttons">
          <button onClick={handleInstall} className="install-button-primary">
            Install
          </button>
          <button onClick={handleDismiss} className="install-button-secondary">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
