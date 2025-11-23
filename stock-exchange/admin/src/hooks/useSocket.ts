import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (
  url: string,
  events: Record<string, (data: any) => void>,
) => {
  const socketRef = useRef<Socket>(null);

  useEffect(() => {
    const socket = io(url, {
      autoConnect: true,
      auth: { token: localStorage.getItem('accessToken') },
      query: { page: window.location.pathname },
    });

    socketRef.current = socket;

    Object.entries(events).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url]);

  return socketRef;
};
