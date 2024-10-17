import { Avatar, Box, Stack, Typography } from '@mui/material';
import { MessageSummary } from 'chatapp.message-service-contracts';

export const Message = ({ message }: { message: MessageSummary }) => {
  return (
    <Stack direction="row" gap={2}>
      <Avatar>{message.accountUsername[0]}</Avatar>
      <Box>
        <Box>
          <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
            <strong>{message.accountUsername}</strong>
          </Typography>
          <Typography variant="body1" component="span">
            {message.dateCreated}
          </Typography>
        </Box>
        <Typography variant="body1">{message.content}</Typography>
      </Box>
    </Stack>
  );
};
