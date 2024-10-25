import { CircularProgress, Link, Stack } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SortDirection } from 'chatapp.account-service-contracts';
import { MessageSummary } from 'chatapp.message-service-contracts';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useMessageService } from '@app/hooks/useMessageService';
import { useRealtimeService } from '@app/hooks/useRealtimeService';

import { Message } from './message';

export const MessageList = () => {
  const firstMessageRef = useRef<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  const messageService = useMessageService();

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: ['messages'],
    queryFn: async ({ pageParam: page }) => {
      const answer = await messageService.getMessages({
        page,
        pageSize: 50,
        sortBy: 'dateCreated',
        sortDirection: SortDirection.Desc,
      });
      return answer;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });

  const numPagesFetched = data?.pages.length;

  const oldMessages = useMemo(
    () => data?.pages.flatMap((page) => page.records).reverse() ?? [],
    [data],
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

  useLayoutEffect(() => {
    if (numPagesFetched === 1) {
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      firstMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [oldMessages, numPagesFetched]);

  useLayoutEffect(() => {
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
