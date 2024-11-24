import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MessageSummary } from 'chatapp.message-service-contracts';
import { useMemo } from 'react';

export const Message = ({ message }: { message: MessageSummary }) => {
  const dateCreated = useMemo(
    () => new Date(message.dateCreated).toLocaleString(),
    [message.dateCreated],
  );
  return (
    <Stack direction="row" gap={2}>
      <Avatar src={message.profilePictureUrl}>{message.username[0]}</Avatar>
      <Box>
        <Box>
          <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
            <strong>{message.username}</strong>
          </Typography>
          <Typography variant="body1" component="span">
            {dateCreated}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
          {message.content}
        </Typography>
      </Box>
    </Stack>
  );
};
