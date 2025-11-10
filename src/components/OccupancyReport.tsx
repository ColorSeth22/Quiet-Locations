import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import CrowdIcon from '@mui/icons-material/Group';
import { useAuth } from '../contexts/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

// Haversine formula to calculate distance between two points in km
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

type Props = {
  locationId: string;
  locationName: string;
  locationLat: number;
  locationLng: number;
  onReported?: () => void;
};

const occupancyLevels = [
  { level: 1, label: 'Empty', icon: <PersonIcon />, description: 'Almost no one here' },
  { level: 2, label: 'Few People', icon: <PeopleIcon />, description: 'Very quiet, few people' },
  { level: 3, label: 'Moderate', icon: <GroupsIcon />, description: 'Some people, still peaceful' },
  { level: 4, label: 'Busy', icon: <Diversity3Icon />, description: 'Quite a few people' },
  { level: 5, label: 'Crowded', icon: <CrowdIcon />, description: 'Very busy, hard to find space' },
];

const OccupancyReport = ({ locationId, locationName, locationLat, locationLng, onReported }: Props) => {
  const { token, user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verifyingLocation, setVerifyingLocation] = useState(false);
  const [tooFar, setTooFar] = useState(false);
  const [userDistance, setUserDistance] = useState<number | null>(null);

  const MAX_DISTANCE_KM = 0.5; // User must be within 500 meters

  const handleSubmit = async () => {
    if (!selectedLevel) return;

    setSubmitting(true);
    setError(null);
    setTooFar(false);

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Get user's current location (REQUIRED for location verification)
      setVerifyingLocation(true);
      let coords: { latitude: number; longitude: number } | null = null;
      
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      } catch {
        setVerifyingLocation(false);
        setError('Unable to verify your location. Please enable GPS/location services and try again.');
        setSubmitting(false);
        return;
      }

      setVerifyingLocation(false);

      // Verify user is close enough to the location
      const distance = getDistanceKm(coords.latitude, coords.longitude, locationLat, locationLng);
      setUserDistance(distance);

      if (distance > MAX_DISTANCE_KM) {
        setTooFar(true);
        setError(`You must be within ${Math.round(MAX_DISTANCE_KM * 1000)}m of the location to report occupancy. You are currently ${Math.round(distance * 1000)}m away.`);
        setSubmitting(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/occupancy/report`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          location_id: locationId,
          occupancy_level: selectedLevel,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          device_type: 'web'
        })
      });

      if (res.status === 403) {
        const data = await res.json();
        setError(data.error || 'Please enable data collection in your profile to report occupancy.');
        return;
      }

      if (res.ok) {
        setSuccess(true);
        setSelectedLevel(null);
        if (onReported) onReported();
        
        // Close success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit report');
      }
    } catch {
      setError('Error submitting report');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">Please log in to report occupancy levels</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          How busy is {locationName}?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Help others by reporting the current crowd level. You'll earn +1 point!
        </Typography>

        {verifyingLocation && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Verifying your location...
          </Alert>
        )}

        {tooFar && userDistance !== null && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You are {Math.round(userDistance * 1000)}m away from this location. 
            You must be within {Math.round(MAX_DISTANCE_KM * 1000)}m to report occupancy.
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {occupancyLevels.map((option) => (
            <Button
              key={option.level}
              variant={selectedLevel === option.level ? 'contained' : 'outlined'}
              onClick={() => setSelectedLevel(option.level)}
              startIcon={option.icon}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                py: 1.5
              }}
            >
              <Box>
                <Typography variant="body1" component="span">
                  {option.label}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  {option.description}
                </Typography>
              </Box>
            </Button>
          ))}
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={!selectedLevel || submitting}
          sx={{ mt: 2 }}
        >
          {submitting ? <CircularProgress size={24} /> : 'Submit Report'}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            Thank you! Report submitted successfully (+1 point)
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default OccupancyReport;
