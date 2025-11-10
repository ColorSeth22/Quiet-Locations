import { useState, useEffect } from 'react';

type GeolocationState = {
  coords: { latitude: number; longitude: number } | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
};

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }

    // High accuracy options for better positioning
    const options: PositionOptions = {
      enableHighAccuracy: true,  // Use GPS if available
      timeout: 10000,             // Wait up to 10 seconds
      maximumAge: 0               // Don't use cached position
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage = error.message;
        if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out. Please try again.';
        } else if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location access denied. Please enable location services.';
        }
        setState({
          coords: null,
          accuracy: null,
          error: errorMessage,
          loading: false,
        });
      },
      options
    );
  }, []);

  return state;
};

export default useGeolocation;