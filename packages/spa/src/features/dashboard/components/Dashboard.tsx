import { AccountCircle } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthService } from '@app/hooks';
import { useJwtService } from '@app/hooks/useJwtService';
import { RealtimeServiceProvider } from '@app/providers/realtimeServiceProvider';
import { RealtimeService } from '@app/services/realtimeService';

import { MessageInput } from './messageInput';
import { MessageList } from './messageList';
import { UserList } from './userList';

const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const menuId = 'primary-search-account-menu';

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isAccountMenuOpen = Boolean(anchorEl);

  const authService = useAuthService();
  const navigate = useNavigate();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    authService.logout();
    navigate('/');
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => setIsDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            ChatApp
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <Box sx={{ width: 250, padding: 2 }}>
          <UserList />
        </Box>
      </Drawer>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        keepMounted
        open={isAccountMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </Box>
  );
};

const Body = () => {
  return (
    <Stack
      sx={{
        flexGrow: 1,
        padding: 2,
        gap: 2,
        overflow: 'hidden',
      }}
    >
      <MessageList />
      <MessageInput />
    </Stack>
  );
};

const LoadingScreen = () => {
  return (
    <Stack
      sx={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}
    >
      <CircularProgress />
    </Stack>
  );
};

export const Dashboard = () => {
  const jwtService = useJwtService();

  const token = jwtService.get();

  const [realtimeService, setRealtimeService] =
    useState<RealtimeService | null>(null);

  useEffect(() => {
    const url = `${import.meta.env.VITE_REALTIME_MESSAGE_SERVICE_BASE_URL}?token=${token}`;

    const createRealtimeServiceTask = RealtimeService.create(url).then(
      (realtimeService) => {
        setRealtimeService(realtimeService);
        return realtimeService;
      },
    );

    return () => {
      createRealtimeServiceTask.then((realtimeService) => {
        realtimeService.close();
      });
    };
  }, [token]);

  if (!realtimeService) {
    return <LoadingScreen />;
  }

  return (
    <RealtimeServiceProvider value={realtimeService}>
      <Stack sx={{ height: '100%' }}>
        <Header />
        <Body />
      </Stack>
    </RealtimeServiceProvider>
  );
};
