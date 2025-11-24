import { useState, useEffect, useMemo } from 'react';
import authService from '../services/authService';
import { useRealTimeParking } from '../context/RealTimeParkingContext';

const UserParkingLots = ({ onSelectParkingLot }) => {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datos en tiempo real del WebSocket
  const { realtimeSpots, requestParkingStatus, isConnected } = useRealTimeParking();

  // Solicitar estado inicial cuando se conecte el WebSocket
  useEffect(() => {
    if (isConnected) {
      console.log('🌐 User - WebSocket conectado, solicitando estado inicial...');
      requestParkingStatus();
    }
  }, [isConnected, requestParkingStatus]);

  // Cargar parking lots
  useEffect(() => {
    loadParkingLots();
  }, []);

  const loadParkingLots = async () => {
    try {
      setLoading(true);
      const response = await authService.authenticatedRequest('/parking-lots');
      
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo parqueaderos activos
        const activeLots = data.data?.parkingLots?.filter(lot => lot.isActive) || [];
        setParkingLots(activeLots);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar parqueaderos');
      }
    } catch (error) {
      setError(error.message);
      console.error('Error cargando parqueaderos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas en tiempo real para cada parking lot
  const calculateRealTimeStats = useMemo(() => {
    const getStatsForLot = (lotId, originalStats) => {
      // Obtener spots en tiempo real para este parking lot
      const rtSpots = realtimeSpots.filter(spot => spot.parkingLotId === lotId);
      
      if (rtSpots.length === 0) {
        // Si no hay datos en tiempo real, usar las estadísticas originales
        return originalStats;
      }

      // Normalizar estados para el conteo
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

      // Contar estados
      let available = 0, occupied = 0, reserved = 0, maintenance = 0;
      
      rtSpots.forEach(spot => {
        const normalized = normalizeStatus(spot.status);
        switch (normalized) {
          case 'available': available++; break;
          case 'occupied': occupied++; break;
          case 'reserved': reserved++; break;
          case 'maintenance': maintenance++; break;
        }
      });

      const realtimeStats = {
        total: rtSpots.length,
        available,
        occupied,
        reserved,
        maintenance
      };

      console.log(`📊 Estadísticas RT para lot ${lotId}:`, realtimeStats);
      return realtimeStats;
    };

    return getStatsForLot;
  }, [realtimeSpots]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando parqueaderos disponibles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadParkingLots}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (parkingLots.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
        <div className="text-gray-400 text-6xl mb-4">🏢</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No hay parqueaderos disponibles
        </h3>
        <p className="text-gray-500">
          No se encontraron parqueaderos activos en este momento
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Parqueaderos Disponibles
        </h1>
        <p className="text-gray-600">
          Selecciona un parqueadero para ver los espacios disponibles
        </p>
      </div>

      {/* Grid de Parqueaderos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parkingLots.map((lot) => {
          // Calcular estadísticas en tiempo real o usar las originales
          const stats = calculateRealTimeStats(lot.id, lot.statistics);
          
          const occupancyPercentage = stats?.total > 0 
            ? ((stats.occupied / stats.total) * 100).toFixed(0)
            : 0;

          return (
            <div
              key={lot.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer transform hover:scale-105"
              onClick={() => onSelectParkingLot(lot)}
            >
              {/* Header de la tarjeta */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{lot.name}</h3>
                    <p className="text-blue-100 text-sm">
                      📍 {lot.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 rounded-lg px-3 py-1">
                      <span className="text-2xl font-bold">{lot.statistics?.total || lot.totalSpots}</span>
                      <p className="text-xs text-blue-100">espacios</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-6">
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {lot.description || 'Parqueadero disponible para uso general'}
                </p>

                {/* Disponibilidad */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Ocupación</span>
                    <span className="text-sm text-gray-600">{occupancyPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        occupancyPercentage < 50 
                          ? 'bg-green-500' 
                          : occupancyPercentage < 80 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${occupancyPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.available || 0}
                    </div>
                    <p className="text-xs text-green-700">Disponibles</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {stats?.occupied || 0}
                    </div>
                    <p className="text-xs text-red-700">Ocupados</p>
                  </div>
                </div>

                {/* Indicador de disponibilidad */}
                <div className="flex items-center justify-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${
                    (stats?.available || 0) > 0 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {(stats?.available || 0) > 0 ? (
                      <>
                        🟢 Espacios disponibles
                      </>
                    ) : (
                      <>
                        🔴 Sin espacios
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Footer con fecha */}
              <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500">
                Parqueadero existente desde: {new Date(lot.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserParkingLots;