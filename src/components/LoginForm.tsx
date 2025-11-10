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
  onSwitchToRegister?: () => void;
};

const LoginForm = ({ onSuccess, onSwitchToRegister }: Props) => {
  const { login, error, clearError, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    try {
      await login({ email, password });
      // Success - clear form
      setEmail('');
      setPassword('');
      if (onSuccess) onSuccess();
    } catch {
      // Error is handled by auth context
    }
  };

  const displayError = error || localError;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, maxWidth: 480 }}>
      <Typography variant="h6" gutterBottom>
        Log In
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
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          autoComplete="current-password"
          disabled={isLoading}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </Button>

        {onSwitchToRegister && (
          <Button
            variant="text"
            fullWidth
            onClick={onSwitchToRegister}
            disabled={isLoading}
          >
            Don't have an account? Register
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default LoginForm;
