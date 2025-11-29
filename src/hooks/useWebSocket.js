import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';

const useWebSocket = (url, options = {}) => {
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [isConnectedState, setIsConnectedState] = useState(false);
  const isConnectedRef = useRef(false);

  const defaultOptions = {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    timeout: 10000,
    ...options
  };

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return socketRef.current;
    }

    if (socketRef.current && !socketRef.current.disconnected) {
      return socketRef.current;
    }

    try {
      
      socketRef.current = io(url, defaultOptions);

      socketRef.current.on('connect', () => {
        isConnectedRef.current = true;
        setIsConnectedState(true);
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      socketRef.current.on('disconnect', (reason) => {
        isConnectedRef.current = false;
        setIsConnectedState(false);
        
        if (reason !== 'io client disconnect' && defaultOptions.reconnection) {
          scheduleReconnection();
        }
      });

      socketRef.current.on('connect_error', (error) => {
        isConnectedRef.current = false;
        setIsConnectedState(false);
        
        if (defaultOptions.reconnection) {
          scheduleReconnection();
        }
      });

      socketRef.current.on('reconnect', (attemptNumber) => {
        isConnectedRef.current = true;
        setIsConnectedState(true);
      });

      socketRef.current.on('reconnect_error', (error) => {
      });

      socketRef.current.on('reconnect_failed', () => {
        isConnectedRef.current = false;
        setIsConnectedState(false);
      });

      return socketRef.current;
      
    } catch (error) {
      return null;
    }
  }, [url, defaultOptions]);

  const scheduleReconnection = useCallback(() => {
    if (reconnectTimeoutRef.current) return;

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, defaultOptions.reconnectionDelay);
  }, [connect, defaultOptions.reconnectionDelay]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
      setIsConnectedState(false);
    }
  }, []);

  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const isConnected = useCallback(() => {
    return isConnectedState && socketRef.current?.connected;
  }, [isConnectedState]);

  useEffect(() => {
    if (defaultOptions.autoConnect && url) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [url]);

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    on,
    off,
    emit,
    isConnected,
    connected: isConnectedState
  };
};

export default useWebSocket;