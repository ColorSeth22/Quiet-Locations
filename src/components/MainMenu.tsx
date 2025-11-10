import { useState } from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DialogContentText from '@mui/material/DialogContentText';
import MapIcon from '@mui/icons-material/Map';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/List';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/auth';

type ViewType = 'welcome' | 'map' | 'add' | 'update' | 'login' | 'register' | 'nearby';

type Props = {
  currentView: ViewType;
  setView: (view: ViewType) => void;
};

const MainMenu = ({ currentView, setView }: Props) => {
  const { isAuthenticated, logout } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Derive the navigation value (exclude auth-only views from selection highlighting)
  const navValue = ['map', 'nearby', 'add', 'update'].includes(currentView)
    ? currentView
    : 'map';

  const handleAuthAction = () => {
    if (isAuthenticated) {
      // Open confirmation dialog instead of navigating to login
      setLogoutDialogOpen(true);
    } else {
      setView('login');
    }
  };

  const handleLogoutConfirm = () => {
    logout();
    setLogoutDialogOpen(false);
    setView('map');
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <Paper
      elevation={8}
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderRadius: 0 }}
    >
      <BottomNavigation
        showLabels
        value={navValue}
        onChange={(_event, newValue) => {
          // Custom handling: 'auth' value should not change view automatically
            if (newValue === 'auth') {
              handleAuthAction();
              return;
            }
            // Type guard: newValue is one of our view strings (except 'auth')
            setView(newValue as ViewType);
        }}
        sx={{
          height: 64,
          px: 1,
          bgcolor: 'background.paper',
        }}
      >
        <BottomNavigationAction
          value="map"
          label="Map"
          icon={<MapIcon />}
          sx={{
            '& .MuiBottomNavigationAction-label': { fontSize: '0.75rem' },
          }}
        />
        <BottomNavigationAction
          value="nearby"
          label="Nearby"
          icon={<ListIcon />}
          sx={{
            '& .MuiBottomNavigationAction-label': { fontSize: '0.75rem' },
          }}
        />
        <BottomNavigationAction
          value="add"
          label="Add"
          icon={<AddLocationIcon />}
          sx={{
            '& .MuiBottomNavigationAction-label': { fontSize: '0.75rem' },
          }}
        />
        <BottomNavigationAction
          value="update"
          label="Edit"
          icon={<EditIcon />}
          sx={{
            '& .MuiBottomNavigationAction-label': { fontSize: '0.75rem' },
          }}
        />
        <BottomNavigationAction
          value="auth"
          label={isAuthenticated ? 'Logout' : 'Login'}
          icon={isAuthenticated ? <LogoutIcon /> : <LoginIcon />}
          // onClick also for accessibility / direct intent, but onChange handles value="auth"
          onClick={(e) => {
            e.preventDefault();
            handleAuthAction();
          }}
          sx={{
            '& .MuiBottomNavigationAction-label': { fontSize: '0.75rem' },
          }}
        />
      </BottomNavigation>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out? You'll need to log in again to add locations or report occupancy.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel}>Cancel</Button>
          <Button onClick={handleLogoutConfirm} color="error" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default MainMenu;
