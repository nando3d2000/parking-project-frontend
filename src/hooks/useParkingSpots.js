import { useState, useEffect, useCallback, useMemo } from 'react';
import parkingService from '../services/parkingService';
import { useRealTimeParking } from '../context/RealTimeParkingContext';

export const useParkingSpots = (parkingLotId = null) => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datos en tiempo real del WebSocket
  const { realtimeSpots, isConnected } = useRealTimeParking();

  // Cargar parking spots (todos o de un parqueadero específico)
  const fetchParkingSpots = useCallback(async () => {
    // Si no hay parkingLotId, no cargar nada
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
      console.error('Error loading parking spots:', err);
    } finally {
      setLoading(false);
    }
  }, [parkingLotId]);

  // Mergear datos de API con datos en tiempo real (reactivo)
  const finalSpots = useMemo(() => {
    if (!parkingSpots.length) return [];

    console.log('🔄 Recalculando spots mergeados...', {
      spotsAPI: parkingSpots.length,
      spotsRealtime: realtimeSpots.length,
      parkingLotId
    });

    const merged = parkingSpots.map(apiSpot => {
      // Buscar actualización en tiempo real para este spot
      const realtimeUpdate = realtimeSpots.find(rtSpot => 
        rtSpot.id === apiSpot.id || rtSpot.code === apiSpot.code
      );

      if (realtimeUpdate && realtimeUpdate.parkingLotId === parkingLotId) {
        console.log(`🔄 Spot ${apiSpot.code}: API(${apiSpot.status}) → RT(${realtimeUpdate.status})`);
        // Si hay actualización en tiempo real, usar esos datos
        return {
          ...apiSpot,
          status: realtimeUpdate.status,
          lastUpdate: realtimeUpdate.lastUpdate,
          sensorData: realtimeUpdate.sensorData,
          isRealTimeUpdated: true
        };
      }

      // NORMALIZAR: Si no hay actualización en tiempo real, convertir estados inglés → español
      let normalizedStatus = apiSpot.status;
      const statusMapping = {
        'available': 'LIBRE',
        'occupied': 'OCUPADO', 
        'reserved': 'RESERVADO',
        'maintenance': 'MANTENIMIENTO'
      };
      
      if (statusMapping[apiSpot.status]) {
        normalizedStatus = statusMapping[apiSpot.status];
        console.log(`🔄 Normalizando ${apiSpot.code}: ${apiSpot.status} → ${normalizedStatus}`);
      }

      return {
        ...apiSpot,
        status: normalizedStatus, // Usar estado normalizado
        isRealTimeUpdated: false
      };
    });

    console.log('📦 Spots finales después del merge:', merged.map(s => ({
      code: s.code, 
      status: s.status, 
      isRT: s.isRealTimeUpdated
    })));

    return merged;
  }, [parkingSpots, realtimeSpots, parkingLotId]);

  // Estadísticas calculadas usando datos mergeados (reactivo)
  const stats = useMemo(() => {
    // Función para normalizar estados (ahora principalmente español)
    const normalizeStatus = (status) => {
      const statusMap = {
        // Estados principales (español)
        'LIBRE': 'available',
        'OCUPADO': 'occupied', 
        'RESERVADO': 'reserved',
        'MANTENIMIENTO': 'maintenance',
        // Fallback para inglés (por si acaso)
        'available': 'available',
        'occupied': 'occupied',
        'reserved': 'reserved',
        'maintenance': 'maintenance'
      };
      return statusMap[status] || status;
    };

    // Validar que no se pierdan spots
    if (finalSpots.length === 0) {
      console.warn('⚠️ finalSpots está vacío!');
      return { total: 0, available: 0, occupied: 0, reserved: 0, maintenance: 0 };
    }

    // Contar por categoría
    let available = 0, occupied = 0, reserved = 0, maintenance = 0, unknown = 0;
    
    finalSpots.forEach(spot => {
      const normalized = normalizeStatus(spot.status);
      switch (normalized) {
        case 'available': available++; break;
        case 'occupied': occupied++; break;
        case 'reserved': reserved++; break;
        case 'maintenance': maintenance++; break;
        default: 
          unknown++;
          console.warn(`⚠️ Estado desconocido: ${spot.status} en spot ${spot.code}`);
      }
    });

    const statistics = {
      total: finalSpots.length,
      available,
      occupied,
      reserved,
      maintenance
    };

    // Validar integridad
    const suma = available + occupied + reserved + maintenance + unknown;
    if (suma !== finalSpots.length) {
      console.error(`❌ ERROR DE CONTEO: Total spots=${finalSpots.length}, Suma categorías=${suma}`, {
        available, occupied, reserved, maintenance, unknown
      });
    }

    console.log('📊 Estadísticas recalculadas:', statistics);
    console.log('📋 Estados detallados:', finalSpots.map(s => ({
      code: s.code, 
      status: s.status, 
      normalized: normalizeStatus(s.status),
      isRT: s.isRealTimeUpdated
    })));
    
    return statistics;
  }, [finalSpots]);

  // Actualizar el estado de un parking spot
  const updateSpotStatus = useCallback(async (id, newStatus) => {
    try {
      const updatedSpot = await parkingService.updateParkingSpotStatus(id, newStatus);
      
      // Actualizar el estado local
      setParkingSpots(prevSpots => 
        prevSpots.map(spot => 
          spot.id === id ? { ...spot, ...updatedSpot } : spot
        )
      );
      
      return updatedSpot;
    } catch (err) {
      setError(err.message);
      console.error('Error updating parking spot status:', err);
      throw err;
    }
  }, []);

  // Crear un nuevo parking spot
  const createSpot = useCallback(async (spotData) => {
    try {
      const newSpot = await parkingService.createParkingSpot(spotData);
      
      // Agregar al estado local
      setParkingSpots(prevSpots => [...prevSpots, newSpot]);
      
      return newSpot;
    } catch (err) {
      setError(err.message);
      console.error('Error creating parking spot:', err);
      throw err;
    }
  }, []);

  // Eliminar un parking spot
  const deleteSpot = useCallback(async (id) => {
    try {
      await parkingService.deleteParkingSpot(id);
      
      // Remover del estado local
      setParkingSpots(prevSpots => 
        prevSpots.filter(spot => spot.id !== id)
      );
    } catch (err) {
      setError(err.message);
      console.error('Error deleting parking spot:', err);
      throw err;
    }
  }, []);

  // Refrescar los datos
  const refresh = useCallback(() => {
    fetchParkingSpots();
  }, [fetchParkingSpots]);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchParkingSpots();
  }, [fetchParkingSpots]);

  // Obtener pisos únicos usando datos mergeados
  const floors = [...new Set(finalSpots.map(spot => spot.floor))].sort();

  return {
    parkingSpots: finalSpots, // Usar datos mergeados
    loading,
    error,
    stats,
    floors,
    updateSpotStatus,
    createSpot,
    deleteSpot,
    refresh,
    // Información adicional del WebSocket
    isConnected,
    hasRealtimeUpdates: realtimeSpots.length > 0
  };
};