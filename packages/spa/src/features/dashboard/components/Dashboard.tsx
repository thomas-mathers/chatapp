import { AccountCircle } from '@mui/icons-material';
import SendIcon from '@mui/icons-material/Send';
import {
  AppBar,
  Box,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { MessageSummary } from 'chatapp.message-service-contracts';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthService } from '@app/hooks';
import { useJwtService } from '@app/hooks/useJwtService';
import { useRealtimeMessageService } from '@app/hooks/useRealtimeMessageService';
import { RealtimeMessageServiceProvider } from '@app/providers/realtimeMessageServiceProvider';
import { RealtimeMessageService } from '@app/services/realtimeMessageService';

const Header = () => {
  const menuId = 'primary-search-account-menu';

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(anchorEl);

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
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        keepMounted
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </Box>
  );
};

const MessageList = () => {
  const [messages, setMessages] = useState<MessageSummary[]>([]);

  const realtimeMessageService = useRealtimeMessageService();

  useEffect(() => {
    const subscription = realtimeMessageService.subscribe((message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [realtimeMessageService]);

  return (
    <TextField
      multiline
      fullWidth
      slotProps={{
        input: {
          sx: {
            height: '100%',
            alignItems: 'start',
          },
          readOnly: true,
        },
      }}
      sx={{ display: 'flex', flexGrow: 1 }}
      value={messages
        .map((message) => `${message.accountUsername}: ${message.content}`)
        .join('\n')}
    />
  );
};

const MessageInput = () => {
  const [message, setMessage] = useState('');

  const realtimeMessageService = useRealtimeMessageService();

  const handleSend = () => {
    realtimeMessageService.send({
      content: message,
    });
    setMessage('');
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  return (
    <Stack direction="row" alignItems="center" gap={2}>
      <TextField sx={{ flexGrow: 1 }} value={message} onChange={handleChange} />
      <IconButton color="primary" onClick={handleSend}>
        <SendIcon />
      </IconButton>
    </Stack>
  );
};

const Body = () => {
  return (
    <Stack
      sx={{
        flexGrow: 1,
        padding: 2,
        gap: 2,
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

  const token = jwtService.getJwt();

  const { data: realtimeMessageService } = useQuery({
    queryKey: ['realtimeMessageService'],
    queryFn: () =>
      RealtimeMessageService.create(
        `${import.meta.env.VITE_MESSAGE_SERVICE_BASE_URL}?token=${token}`,
      ),
    enabled: Boolean(token),
  });

  if (!realtimeMessageService) {
    return <LoadingScreen />;
  }

  return (
    <RealtimeMessageServiceProvider value={realtimeMessageService}>
      <Stack sx={{ height: '100%' }}>
        <Header />
        <Body />
      </Stack>
    </RealtimeMessageServiceProvider>
  );
};
