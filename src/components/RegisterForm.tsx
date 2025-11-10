import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useAuth } from '../contexts/auth';

type Props = {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
};

const RegisterForm = ({ onSuccess, onSwitchToLogin }: Props) => {
  const { register, error, clearError, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    // Validation
    if (!email || !password) {
      setLocalError('Email and password are required');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      setLocalError('Password must contain at least one letter and one number');
      return;
    }

    try {
      await register({
        email,
        password,
        display_name: displayName || undefined
      });
      // Success - clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
      if (onSuccess) onSuccess();
    } catch {
      // Error is handled by auth context
    }
  };

  const displayError = error || localError;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, maxWidth: 480 }}>
      <Typography variant="h6" gutterBottom>
        Create Account
      </Typography>

      {displayError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => { clearError(); setLocalError(''); }}>
          {displayError}
        </Alert>
      )}

      <Stack spacing={2}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          autoComplete="email"
          disabled={isLoading}
        />

        <TextField
          label="Display Name (optional)"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          fullWidth
          autoComplete="name"
          disabled={isLoading}
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          autoComplete="new-password"
          disabled={isLoading}
          helperText="Min 8 characters, must contain letters and numbers"
        />

        <TextField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
          autoComplete="new-password"
          disabled={isLoading}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Creating Account...' : 'Register'}
        </Button>

        {onSwitchToLogin && (
          <Button
            variant="text"
            fullWidth
            onClick={onSwitchToLogin}
            disabled={isLoading}
          >
            Already have an account? Log In
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default RegisterForm;
