import { useState, useEffect, useCallback, useMemo } from 'react';
import parkingService from '../services/parkingService';
import { useRealTimeParking } from '../context/RealTimeParkingContext';

export const useParkingSpots = (parkingLotId = null) => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { realtimeSpots, isConnected } = useRealTimeParking();

  const fetchParkingSpots = useCallback(async () => {
    if (parkingLotId === null) {
      setParkingSpots([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let spots;
      if (parkingLotId) {
        spots = await parkingService.getParkingSpotsByLot(parkingLotId);
      } else {
        spots = await parkingService.getAllParkingSpots();
      }
      
      setParkingSpots(spots);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [parkingLotId]);

  const finalSpots = useMemo(() => {
    if (!parkingSpots.length) return [];

    const merged = parkingSpots.map(apiSpot => {
      const realtimeUpdate = realtimeSpots.find(rtSpot => 
        rtSpot.id === apiSpot.id || rtSpot.code === apiSpot.code
      );

      if (realtimeUpdate && realtimeUpdate.parkingLotId === parkingLotId) {
        return {
          ...apiSpot,
          status: realtimeUpdate.status,
          lastUpdate: realtimeUpdate.lastUpdate,
          sensorData: realtimeUpdate.sensorData,
          isRealTimeUpdated: true
        };
      }

      let normalizedStatus = apiSpot.status;
      const statusMapping = {
        'available': 'LIBRE',
        'occupied': 'OCUPADO', 
        'reserved': 'RESERVADO',
        'maintenance': 'MANTENIMIENTO'
      };
      
      if (statusMapping[apiSpot.status]) {
        normalizedStatus = statusMapping[apiSpot.status];
      }

      return {
        ...apiSpot,
        isRealTimeUpdated: false
      };
    });

    return merged;
  }, [parkingSpots, realtimeSpots, parkingLotId]);

  const stats = useMemo(() => {
    const normalizeStatus = (status) => {
      const statusMap = {
        'LIBRE': 'available',
        'OCUPADO': 'occupied', 
        'RESERVADO': 'reserved',
        'MANTENIMIENTO': 'maintenance',
        'available': 'available',
        'occupied': 'occupied',
        'reserved': 'reserved',
        'maintenance': 'maintenance'
      };
      return statusMap[status] || status;
    };

    if (finalSpots.length === 0) {
      return { total: 0, available: 0, occupied: 0, reserved: 0, maintenance: 0 };
    }

    let available = 0, occupied = 0, reserved = 0, maintenance = 0;
    
    finalSpots.forEach(spot => {
      const normalized = normalizeStatus(spot.status);
      switch (normalized) {
        case 'available': available++; break;
        case 'occupied': occupied++; break;
        case 'reserved': reserved++; break;
        case 'maintenance': maintenance++; break;
        default: break;
      }
    });

    return {
      total: finalSpots.length,
      available,
      occupied,
      reserved,
      maintenance
    };
  }, [finalSpots]);

  const updateSpotStatus = useCallback(async (id, newStatus) => {
    try {
      const updatedSpot = await parkingService.updateParkingSpotStatus(id, newStatus);
      
      setParkingSpots(prevSpots => 
        prevSpots.map(spot => 
          spot.id === id ? { ...spot, ...updatedSpot } : spot
        )
      );
      
      return updatedSpot;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const createSpot = useCallback(async (spotData) => {
    try {
      const newSpot = await parkingService.createParkingSpot(spotData);
      
      setParkingSpots(prevSpots => [...prevSpots, newSpot]);
      
      return newSpot;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteSpot = useCallback(async (id) => {
    try {
      await parkingService.deleteParkingSpot(id);
      
      setParkingSpots(prevSpots => 
        prevSpots.filter(spot => spot.id !== id)
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const refresh = useCallback(() => {
    fetchParkingSpots();
  }, [fetchParkingSpots]);

  useEffect(() => {
    fetchParkingSpots();
  }, [fetchParkingSpots]);

  const floors = [...new Set(finalSpots.map(spot => spot.floor))].sort();

  return {
    parkingSpots: finalSpots,
    loading,
    error,
    stats,
    floors,
    updateSpotStatus,
    createSpot,
    deleteSpot,
    refresh,
    isConnected,
    hasRealtimeUpdates: realtimeSpots.length > 0
  };
};