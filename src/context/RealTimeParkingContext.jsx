import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import useWebSocket from '../hooks/useWebSocket';

const RealTimeParkingContext = createContext();

const WEBSOCKET_URL = 'http://localhost:8081';

export const RealTimeParkingProvider = ({ children }) => {
  const [realtimeSpots, setRealtimeSpots] = useState(new Map());
  const [parkingLotStats, setParkingLotStats] = useState(new Map());
  const [iotSensorData, setIotSensorData] = useState(new Map());
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);

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

  const handleSpotUpdate = useCallback((event) => {
    if (event.data) {
      const { spotId, code, newStatus, parkingLotId, sensorData } = event.data;
      
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
        
        return updated;
      });

      setLastUpdate(event.timestamp);
    }
  }, []);

  const handleParkingLotStatsUpdate = useCallback((event) => {
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

  const handleIoTSensorUpdate = useCallback((event) => {
    if (event.data) {
      const { sensorId } = event.data;
      
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

  useEffect(() => {
    setConnectionStatus(connected ? 'connected' : 'disconnected');
  }, [connected]);

  const handleConnection = useCallback(() => {
    emit('request-parking-status');
  }, [emit, socket]);

  const handleDisconnection = useCallback((reason) => {
  }, []);

  useEffect(() => {
    if (socket) {
      on('connect', handleConnection);
      on('disconnect', handleDisconnection);

      on('parking-spot-update', handleSpotUpdate);
      on('parking-lot-stats-update', handleParkingLotStatsUpdate);
      on('iot-sensor-update', handleIoTSensorUpdate);

      on('test-event', (data) => {});

      socket.onAny((eventName, data) => {});

      return () => {
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
  }, [socket]);

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

  const contextValue = {
    connectionStatus,
    lastUpdate,
    isConnected: connected,
    
    realtimeSpots: getAllRealtimeSpots(),
    parkingLotStats: Array.from(parkingLotStats.entries()),
    iotSensorData: Array.from(iotSensorData.entries()),
    
    getSpotById,
    getSpotsByParkingLot,
    getParkingLotStats,
    getSensorData,
    
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

export const useRealTimeParking = () => {
  const context = useContext(RealTimeParkingContext);
  
  if (!context) {
    throw new Error('useRealTimeParking debe usarse dentro de RealTimeParkingProvider');
  }
  
  return context;
};

export default RealTimeParkingContext;