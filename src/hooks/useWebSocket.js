import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Hook personalizado para manejar conexiones WebSocket en tiempo real
 */
const useWebSocket = (url, options = {}) => {
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [isConnectedState, setIsConnectedState] = useState(false);
  const isConnectedRef = useRef(false);

  // Configuración por defecto
  const defaultOptions = {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    timeout: 10000,
    ...options
  };

  // Conectar al WebSocket
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('🔗 WebSocket ya está conectado');
      return socketRef.current;
    }

    // Evitar múltiples conexiones simultáneas
    if (socketRef.current && !socketRef.current.disconnected) {
      console.log('🔗 WebSocket ya existe, no reconectando');
      return socketRef.current;
    }

    try {
      console.log('🚀 Conectando a WebSocket:', url);
      
      socketRef.current = io(url, defaultOptions);

      // Eventos de conexión
      socketRef.current.on('connect', () => {
        isConnectedRef.current = true;
        setIsConnectedState(true);
        console.log('✅ WebSocket conectado:', socketRef.current.id);
        
        // Limpiar timeout de reconexión si existe
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      socketRef.current.on('disconnect', (reason) => {
        isConnectedRef.current = false;
        setIsConnectedState(false);
        console.log('❌ WebSocket desconectado:', reason);
        
        // Intentar reconexión automática si no fue intencional
        if (reason !== 'io client disconnect' && defaultOptions.reconnection) {
          scheduleReconnection();
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('🚫 Error de conexión WebSocket:', error.message);
        isConnectedRef.current = false;
        setIsConnectedState(false);
        
        if (defaultOptions.reconnection) {
          scheduleReconnection();
        }
      });

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Reconectado en intento #${attemptNumber}`);
        isConnectedRef.current = true;
        setIsConnectedState(true);
      });

      socketRef.current.on('reconnect_error', (error) => {
        console.error('❌ Error de reconexión:', error.message);
      });

      socketRef.current.on('reconnect_failed', () => {
        console.error('💥 Falló la reconexión después de todos los intentos');
        isConnectedRef.current = false;
        setIsConnectedState(false);
      });

      return socketRef.current;
      
    } catch (error) {
      console.error('💥 Error al crear conexión WebSocket:', error);
      return null;
    }
  }, [url, defaultOptions]);

  // Programar reconexión
  const scheduleReconnection = useCallback(() => {
    if (reconnectTimeoutRef.current) return;

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Intentando reconexión...');
      connect();
    }, defaultOptions.reconnectionDelay);
  }, [connect, defaultOptions.reconnectionDelay]);

  // Desconectar WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      console.log('🔌 Desconectando WebSocket...');
      socketRef.current.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
      setIsConnectedState(false);
    }
  }, []);

  // Suscribirse a un evento
  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      console.log(`📡 Suscrito a evento: ${event}`);
    } else {
      console.warn(`⚠️ Intento de suscripción a ${event} sin conexión activa`);
    }
  }, []);

  // Desuscribirse de un evento
  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
      console.log(`📴 Desuscrito de evento: ${event}`);
    }
  }, []);

  // Emitir un evento
  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      console.log(`📤 Evento emitido: ${event}`, data);
    } else {
      console.warn(`⚠️ Intento de emisión de ${event} sin conexión activa`);
    }
  }, []);

  // Verificar estado de conexión
  const isConnected = useCallback(() => {
    return isConnectedState && socketRef.current?.connected;
  }, [isConnectedState]);

  // Auto-conectar al montar el componente
  useEffect(() => {
    if (defaultOptions.autoConnect && url) {
      connect();
    }

    // Cleanup al desmontar
    return () => {
      disconnect();
    };
  }, [url]); // Solo depende de URL

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