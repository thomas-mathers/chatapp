import { AccountCircle } from '@mui/icons-material';
import SendIcon from '@mui/icons-material/Send';
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  MessageSummary,
  SortDirection,
} from 'chatapp.message-service-contracts';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuthService } from '@app/hooks';
import { useJwtService } from '@app/hooks/useJwtService';
import { useMessageService } from '@app/hooks/useMessageService';
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

const Message = ({ message }: { message: MessageSummary }) => {
  return (
    <Typography>
      {message.accountUsername}: {message.content}
    </Typography>
  );
};

const MessageList = () => {
  const messageService = useMessageService();

  const {
    data: oldMessagesStream,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['messages'],
    queryFn: async ({ pageParam: page }) => {
      return await messageService.getMessages({
        page,
        pageSize: 10,
        sortBy: 'dateCreated',
        sortDirection: SortDirection.Desc,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });

  const oldMessages = useMemo(() => {
    return oldMessagesStream?.pages.flatMap((page) => page.records) ?? [];
  }, [oldMessagesStream]);

  const [newMessages, setNewMessages] = useState<MessageSummary[]>([]);

  const realtimeMessageService = useRealtimeMessageService();

  useEffect(() => {
    const subscription = realtimeMessageService.subscribe((message) => {
      setNewMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [realtimeMessageService]);

  return (
    <Stack sx={{ flexGrow: 1, gap: 2 }}>
      {hasNextPage && (
        <Button onClick={() => fetchNextPage()}>Load More</Button>
      )}
      {isFetching && <CircularProgress />}
      {oldMessages.map((message, index) => (
        <Message key={index} message={message} />
      ))}
      {newMessages.map((message, index) => (
        <Message key={index} message={message} />
      ))}
    </Stack>
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
        `${import.meta.env.VITE_REALTIME_MESSAGE_SERVICE_BASE_URL}?token=${token}`,
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
