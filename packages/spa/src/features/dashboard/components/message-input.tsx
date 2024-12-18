import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

import { useRealtimeService } from '../contexts/realtime-service-context';

export const MessageInput = () => {
  const [message, setMessage] = useState('');

  const realtimeMessageService = useRealtimeService();

  const handleSend = () => {
    realtimeMessageService.send({
      content: message,
    });
    setMessage('');
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <TextField
        sx={{ flexGrow: 1 }}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <IconButton
        color="primary"
        onClick={handleSend}
        disabled={message.length === 0}
      >
        <SendIcon />
      </IconButton>
    </Stack>
  );
};
