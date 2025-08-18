import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useToast } from './toast.context';
import { SocketMessage } from '../interfaces/socket-message';
import { SocketMessageType } from '../enums/socket-message-type';
import { StartStreamMessage } from '../interfaces/start-stream-message';

type SocketContextType = {
  socket: WebSocket | null;
};

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<WebSocket | null>(null);
  const { showToast } = useToast();

  const handleShowStreamToast = (message: StartStreamMessage) => {
    showToast(<p>{message.streamerId} went live</p>);
  };
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = new WebSocket(
        `ws://${process.env.VITE_BACKEND_HOST}:${process.env.VITE_BACKEND_PORT}/api/v1/global-sockets/ws/testID`,
      );
      socketRef.current?.addEventListener('message', (e) => {
        const message: SocketMessage<any> = e.data;

        switch (message.type) {
          case SocketMessageType.StartStream:
            handleShowStreamToast(message.data);
            break;
        }
      });
    }

    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
