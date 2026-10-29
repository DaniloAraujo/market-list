import { useEffect, useRef } from 'react';
import { ApiError, api } from '@/lib/api';

const PING_MS = 25_000;
const MAX_BACKOFF_MS = 30_000;
const TERMINAL = { 4403: 'removed', 4404: 'deleted' };

export function useListSocket(listId, { onEvent, onStatus, onResync, onTerminal }) {
  const handlers = useRef({ onEvent, onStatus, onResync, onTerminal });
  useEffect(() => {
    handlers.current = { onEvent, onStatus, onResync, onTerminal };
  });

  useEffect(() => {
    if (!listId) return undefined;

    let socket = null;
    let stopped = false;
    let attempt = 0;
    let everConnected = false;
    let pingTimer = null;
    let retryTimer = null;

    const clearTimers = () => {
      clearInterval(pingTimer);
      clearTimeout(retryTimer);
    };

    const scheduleRetry = () => {
      if (stopped) return;
      handlers.current.onStatus?.('offline');
      const delay = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** attempt);
      attempt += 1;
      retryTimer = setTimeout(connect, delay);
    };

    async function connect() {
      if (stopped) return;
      handlers.current.onStatus?.('connecting');
      try {
        const { url } = await api(`/v1/lists/${listId}/ws-ticket`, { method: 'POST', body: {} });
        if (stopped) return;

        socket = new WebSocket(url);
        socket.onopen = () => {
          attempt = 0;
          handlers.current.onStatus?.('online');
          if (everConnected) handlers.current.onResync?.(listId);
          everConnected = true;
          pingTimer = setInterval(() => socket?.readyState === WebSocket.OPEN && socket.send('ping'), PING_MS);
        };
        socket.onmessage = (message) => {
          if (message.data === 'pong') return;
          try {
            handlers.current.onEvent?.(JSON.parse(message.data), listId);
          } catch {
          }
        };
        socket.onclose = (event) => {
          clearInterval(pingTimer);
          if (stopped) return;
          if (TERMINAL[event.code]) {
            handlers.current.onTerminal?.(TERMINAL[event.code], listId);
            return;
          }
          scheduleRetry();
        };
      } catch (error) {
        if (stopped) return;
        if (error instanceof ApiError && error.status === 404) {
          handlers.current.onTerminal?.('removed', listId);
          return;
        }
        scheduleRetry();
      }
    }

    const onVisible = () => {
      if (document.visibilityState !== 'visible' || stopped) return;
      if (socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) return;
      clearTimeout(retryTimer);
      attempt = 0;
      connect();
    };
    document.addEventListener('visibilitychange', onVisible);

    connect();

    return () => {
      stopped = true;
      clearTimers();
      document.removeEventListener('visibilitychange', onVisible);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [listId]);
}
