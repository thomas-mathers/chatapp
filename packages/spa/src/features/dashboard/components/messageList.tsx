import { CircularProgress, Link, Stack } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SortDirection } from 'chatapp.account-service-contracts';
import { MessageSummary } from 'chatapp.message-service-contracts';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useMessageService } from '@app/hooks/useMessageService';
import { useRealtimeService } from '@app/hooks/useRealtimeService';

import { Message } from './message';

export const MessageList = () => {
  const firstMessageRef = useRef<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

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

  const realtimeMessageService = useRealtimeService();

  useEffect(() => {
    const subscription = realtimeMessageService.subscribe((message) =>
      setNewMessages((prevMessages) => [...prevMessages, message]),
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [realtimeMessageService]);

  useEffect(() => {
    firstMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [oldMessages]);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [newMessages]);

  return (
    <Stack sx={{ flexGrow: 1, gap: 2, overflowY: 'auto', overflowX: 'hidden' }}>
      <div ref={firstMessageRef} />
      {isFetching && <CircularProgress sx={{ alignSelf: 'center' }} />}
      {hasNextPage && (
        <Link component="button" onClick={() => fetchNextPage()}>
          Load More
        </Link>
      )}
      {oldMessages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      {newMessages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      <div ref={lastMessageRef} />
    </Stack>
  );
};
