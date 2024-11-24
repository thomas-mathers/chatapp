import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'usehooks-ts';

import { RealtimeService } from '@app/lib/realtime-service';

import { RealtimeServiceContext } from '../contexts/realtime-service-context';
import { MessageInput } from './message-input';
import { MessageList } from './message-list';
import { UserList } from './user-list';

const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const menuId = 'primary-search-account-menu';

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isAccountMenuOpen = Boolean(anchorEl);

  const [, , removeJwt] = useLocalStorage('jwt', '');

  const navigate = useNavigate();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    removeJwt();
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
  const [realtimeService, setRealtimeService] =
    useState<RealtimeService | null>(null);

  const [jwt] = useLocalStorage('jwt', '');

  useEffect(() => {
    const url = `${import.meta.env.VITE_REALTIME_MESSAGE_SERVICE_BASE_URL}?token=${jwt}`;

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
  }, [jwt]);

  if (!realtimeService) {
    return <LoadingScreen />;
  }

  return (
    <RealtimeServiceContext.Provider value={realtimeService}>
      <Stack sx={{ height: '100%' }}>
        <Header />
        <Body />
      </Stack>
    </RealtimeServiceContext.Provider>
  );
};
