import { useState } from 'react';
import { useAuthStore, getOrCreateClientId } from '../utils/storage';
import { initPlexClient } from '../api/plex';

/**
 * PlexAuth Component
 * 
 * Handles OAuth authentication with Plex Media Server.
 * Uses the PIN-based authentication flow from Plex API.
 * See: ../../docs/api/plex-integration.md
 */

export default function PlexAuth() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState<string | null>(null);
  const { setToken, setClientId } = useAuthStore();

  const handleStartAuth = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);

      const clientId = getOrCreateClientId();
      const client = initPlexClient(clientId);
      setClientId(clientId);

      const pin = await client.createPin();
      setPinCode(pin.code);

      // Open Plex auth app
      const authUrl = `https://app.plex.tv/auth#?clientID=${clientId}&code=${pin.code}&context%5Bdevice%5D%5Bproduct%5D=PlexM8&forwardUrl=${encodeURIComponent(window.location.href)}`;
      window.open(authUrl, '_blank');

      // Poll for token every 2 seconds for up to 5 minutes
      let attempts = 0;
      const maxAttempts = 150; // 5 minutes

      const pollInterval = setInterval(async () => {
        attempts++;

        try {
          const updatedPin = await client.checkPin(pin.id);

          if (updatedPin.authToken) {
            client.setToken(updatedPin.authToken);
            setToken(updatedPin.authToken);
            clearInterval(pollInterval);
            setIsAuthenticating(false);
            setPinCode(null);
          } else if (attempts > maxAttempts) {
            clearInterval(pollInterval);
            setIsAuthenticating(false);
            setError('Authentication timeout. Please try again.');
          }
        } catch (err) {
          if (attempts > maxAttempts) {
            clearInterval(pollInterval);
            setIsAuthenticating(false);
            setError('Authentication failed. Please try again.');
          }
        }
      }, 2000);
    } catch (err) {
      setIsAuthenticating(false);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>PlexM8</h1>
        <p>Sign in to your Plex account to manage playlists</p>

        {pinCode && (
          <div className="auth-pin-display">
            <p>Enter this PIN on the authentication page:</p>
            <div className="pin-code">{pinCode}</div>
            <p className="auth-status">Waiting for authentication...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={handleStartAuth}
          disabled={isAuthenticating}
          className="auth-button"
        >
          {isAuthenticating ? 'Authenticating...' : 'Sign in with Plex'}
        </button>

        <div className="auth-info">
          <p>
            <strong>Privacy:</strong> Your authentication token is stored locally
            in your browser and never sent to our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
