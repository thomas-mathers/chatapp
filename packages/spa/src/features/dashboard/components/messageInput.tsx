import SendIcon from '@mui/icons-material/Send';
import { IconButton, Stack, TextField } from '@mui/material';
import { useState } from 'react';

import { useRealtimeMessageService } from '@app/hooks/useRealtimeMessageService';

export const MessageInput = () => {
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
