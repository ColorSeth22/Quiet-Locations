import { useState, useEffect, useCallback } from 'react';

type GeolocationState = {
  coords: { latitude: number; longitude: number } | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
};

export const useGeolocation = () => {
  const [state, setState] = useState<Omit<GeolocationState, 'refetch'>>({
    coords: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        coords: null,
        accuracy: null,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

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

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { ...state, refetch: fetchLocation };
};

export default useGeolocation;