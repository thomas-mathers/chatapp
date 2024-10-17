import { CircularProgress, Link, Stack } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SortDirection } from 'chatapp.account-service-contracts';
import { MessageSummary } from 'chatapp.message-service-contracts';
import { useEffect, useMemo, useState } from 'react';

import { useMessageService } from '@app/hooks/useMessageService';
import { useRealtimeMessageService } from '@app/hooks/useRealtimeMessageService';

import { Message } from './message';

export const MessageList = () => {
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

  const oldMessages = useMemo(
    () =>
      oldMessagesStream?.pages.flatMap((page) => page.records).reverse() ?? [],
    [oldMessagesStream],
  );

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
        <Link component="button" onClick={() => fetchNextPage()}>
          Load More
        </Link>
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
