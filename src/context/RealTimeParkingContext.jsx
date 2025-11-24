import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import useWebSocket from '../hooks/useWebSocket';

// Crear contexto
const RealTimeParkingContext = createContext();

// URL del WebSocket server
const WEBSOCKET_URL = 'http://localhost:8081';

/**
 * Provider para manejar actualizaciones de parking en tiempo real
 */
export const RealTimeParkingProvider = ({ children }) => {
  // Estados para manejar los datos en tiempo real
  const [realtimeSpots, setRealtimeSpots] = useState(new Map());
  const [parkingLotStats, setParkingLotStats] = useState(new Map());
  const [iotSensorData, setIotSensorData] = useState(new Map());
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);

  // Hook de WebSocket
  const { socket, connect, disconnect, on, off, emit, isConnected, connected } = useWebSocket(WEBSOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    timeout: 30000,
    forceNew: false,
    transports: ["polling", "websocket"],
    upgrade: true,
    rememberUpgrade: true
  });

  // Manejar cambios de estado de spots
  const handleSpotUpdate = useCallback((event) => {
    console.log('📡 Actualización de spot recibida:', event);
    
    if (event.data) {
      const { spotId, code, newStatus, oldStatus, parkingLotId, sensorData } = event.data;
      
      console.log('📍 Detalles del evento:', {
        spotId, 
        code, 
        newStatus, 
        oldStatus, 
        parkingLotId, 
        sensorData: !!sensorData
      });
      
      // Actualizar el mapa de spots
      setRealtimeSpots(prev => {
        const updated = new Map(prev);
        updated.set(spotId, {
          id: spotId,
          code,
          status: newStatus,
          parkingLotId,
          lastUpdate: event.timestamp,
          sensorData
        });
        
        console.log('🗺️ Total spots en tiempo real:', updated.size);
        console.log('🔍 Spots por parking lot:', 
          Array.from(updated.values()).reduce((acc, spot) => {
            acc[spot.parkingLotId] = (acc[spot.parkingLotId] || 0) + 1;
            return acc;
          }, {})
        );
        
        return updated;
      });

      // Actualizar timestamp de última actualización
      setLastUpdate(event.timestamp);

      console.log(`🔄 Spot ${code}: ${oldStatus} → ${newStatus}`);
    }
  }, []);

  // Manejar actualizaciones de estadísticas de parking lot
  const handleParkingLotStatsUpdate = useCallback((event) => {
    console.log('📊 Estadísticas de parking lot actualizadas:', event);
    
    if (event.parkingLotId && event.stats) {
      setParkingLotStats(prev => {
        const updated = new Map(prev);
        updated.set(event.parkingLotId, {
          ...event.stats,
          lastUpdate: event.timestamp
        });
        return updated;
      });
    }
  }, []);

  // Manejar datos de sensores IoT
  const handleIoTSensorUpdate = useCallback((event) => {
    console.log('🤖 Datos de sensor IoT recibidos:', event);
    
    if (event.data) {
      const { sensorId, spotId } = event.data;
      
      setIotSensorData(prev => {
        const updated = new Map(prev);
        updated.set(sensorId, {
          ...event.data,
          lastUpdate: event.timestamp
        });
        return updated;
      });
    }
  }, []);

  // Sincronizar estado de conexión
  useEffect(() => {
    setConnectionStatus(connected ? 'connected' : 'disconnected');
  }, [connected]);

  // Manejar eventos de conexión
  const handleConnection = useCallback(() => {
    console.log('✅ Conectado al WebSocket de parking - ID:', socket?.id);
    console.log('🔄 Estado del socket:', socket);
    
    // Solicitar estado actual al conectarse
    emit('request-parking-status');
    
    // Log de eventos suscritos
    console.log('📋 Eventos suscritos: connect, disconnect, parking-spot-update, parking-lot-stats-update, iot-sensor-update, test-event');
  }, [emit, socket]);

  const handleDisconnection = useCallback((reason) => {
    console.log('❌ Desconectado del WebSocket de parking. Razón:', reason);
  }, []);

  // Configurar listeners de eventos
  useEffect(() => {
    console.log('🔧 Configurando listeners de WebSocket... Socket existe:', !!socket);
    
    if (socket) {
      console.log('📡 Socket ID:', socket.id);
      console.log('📡 Socket conectado:', socket.connected);
      
      // Eventos de conexión
      on('connect', handleConnection);
      on('disconnect', handleDisconnection);

      // Eventos de datos de parking
      on('parking-spot-update', handleSpotUpdate);
      on('parking-lot-stats-update', handleParkingLotStatsUpdate);
      on('iot-sensor-update', handleIoTSensorUpdate);

      // Eventos de prueba
      on('test-event', (data) => {
        console.log('🧪 Evento de prueba recibido:', data);
      });

      // Evento genérico para debug
      socket.onAny((eventName, data) => {
        console.log('🎯 Evento WebSocket recibido:', eventName, data);
      });

      // Cleanup
      return () => {
        console.log('🧹 Limpiando listeners de WebSocket');
        if (socket) {
          off('connect', handleConnection);
          off('disconnect', handleDisconnection);
          off('parking-spot-update', handleSpotUpdate);
          off('parking-lot-stats-update', handleParkingLotStatsUpdate);
          off('iot-sensor-update', handleIoTSensorUpdate);
          off('test-event');
          socket.offAny();
        }
      };
    }
  }, [socket]); // Solo depende del socket

  // Funciones públicas del contexto
  const getSpotById = useCallback((spotId) => {
    return realtimeSpots.get(spotId);
  }, [realtimeSpots]);

  const getSpotsByParkingLot = useCallback((parkingLotId) => {
    return Array.from(realtimeSpots.values()).filter(
      spot => spot.parkingLotId === parkingLotId
    );
  }, [realtimeSpots]);

  const getParkingLotStats = useCallback((parkingLotId) => {
    return parkingLotStats.get(parkingLotId);
  }, [parkingLotStats]);

  const getSensorData = useCallback((sensorId) => {
    return iotSensorData.get(sensorId);
  }, [iotSensorData]);

  const requestParkingStatus = useCallback(() => {
    emit('request-parking-status');
  }, [emit]);

  const getAllRealtimeSpots = useCallback(() => {
    return Array.from(realtimeSpots.values());
  }, [realtimeSpots]);

  // Valor del contexto
  const contextValue = {
    // Estados
    connectionStatus,
    lastUpdate,
    isConnected: connected,
    
    // Datos en tiempo real
    realtimeSpots: getAllRealtimeSpots(),
    parkingLotStats: Array.from(parkingLotStats.entries()),
    iotSensorData: Array.from(iotSensorData.entries()),
    
    // Funciones de acceso
    getSpotById,
    getSpotsByParkingLot,
    getParkingLotStats,
    getSensorData,
    
    // Funciones de control
    requestParkingStatus,
    connect,
    disconnect
  };

  return (
    <RealTimeParkingContext.Provider value={contextValue}>
      {children}
    </RealTimeParkingContext.Provider>
  );
};

/**
 * Hook para usar el contexto de parking en tiempo real
 */
export const useRealTimeParking = () => {
  const context = useContext(RealTimeParkingContext);
  
  if (!context) {
    throw new Error('useRealTimeParking debe usarse dentro de RealTimeParkingProvider');
  }
  
  return context;
};

export default RealTimeParkingContext;