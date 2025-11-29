import { useState, useEffect, useMemo } from 'react';
import authService from '../services/authService';
import { useRealTimeParking } from '../context/RealTimeParkingContext';

const ParkingSpotManager = ({ parkingLot, onClose, onUpdate }) => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    spotType: 'car'
  });
  const [createLoading, setCreateLoading] = useState(false);

  const { realtimeSpots, isConnected } = useRealTimeParking();

  const finalSpots = useMemo(() => {
    if (spots.length === 0) return [];
    
    return spots.map(staticSpot => {
      const realtimeSpot = realtimeSpots.find(rt => rt.id === staticSpot.id);
      
      if (realtimeSpot) {
        return {
          ...staticSpot,
          status: realtimeSpot.status,
          lastUpdate: realtimeSpot.lastUpdate,
          sensorData: realtimeSpot.sensorData,
          isRealtime: true
        };
      }
      
      return {
        ...staticSpot,
        isRealtime: false
      };
    });
  }, [spots, realtimeSpots]);

  useEffect(() => {
    loadParkingSpots();
  }, [parkingLot.id]);

  const loadParkingSpots = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.authenticatedRequest(`/spots?parkingLotId=${parkingLot.id}`);
      
      if (response.ok) {
        const data = await response.json();
        
        let spotsArray = [];
        if (data.data?.parkingSpots) {
          spotsArray = data.data.parkingSpots;
        } else if (data.data?.rows) {
          spotsArray = data.data.rows;
        } else if (data.data && Array.isArray(data.data)) {
          spotsArray = data.data;
        } else if (data.rows) {
          spotsArray = data.rows;
        } else if (Array.isArray(data)) {
          spotsArray = data;
        }
        
        setSpots(spotsArray);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar espacios');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpot = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      const spotData = {
        ...formData,
        parkingLotId: parkingLot.id
      };

      const response = await authService.authenticatedRequest('/spots', {
        method: 'POST',
        body: JSON.stringify(spotData)
      });

      if (response.ok) {
        const result = await response.json();
        setFormData({ spotType: 'car' });
        setShowCreateForm(false);
        loadParkingSpots();
        onUpdate && onUpdate();
      } else {
        const errorData = await response.json();
        
        if (response.status === 401 || response.status === 403) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        
        throw new Error(errorData.message || 'Error al crear espacio');
      }
    } catch (error) {
      setError(error.message);
      
      if (error.message.includes('sesión') || error.message.includes('token')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteSpot = async (spotId) => {
    if (!window.confirm('¿Estás seguro de eliminar este espacio?')) return;

    try {
      const response = await authService.authenticatedRequest(`/spots/${spotId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadParkingSpots();
        onUpdate && onUpdate();
      } else {
        throw new Error('Error al eliminar espacio');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      LIBRE: 'bg-green-100 text-green-700',
      OCUPADO: 'bg-red-100 text-red-700',
      RESERVADO: 'bg-yellow-100 text-yellow-700',
      MANTENIMIENTO: 'bg-orange-100 text-orange-700',
      available: 'bg-green-100 text-green-700',
      occupied: 'bg-red-100 text-red-700',
      reserved: 'bg-yellow-100 text-yellow-700',
      maintenance: 'bg-orange-100 text-orange-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status) => {
    const texts = {
      LIBRE: '🟢 Libre',
      OCUPADO: '🔴 Ocupado',
      RESERVADO: '🟡 Reservado',
      MANTENIMIENTO: '🟠 Mantenimiento',
      available: '🟢 Libre',
      occupied: '🔴 Ocupado',
      reserved: '🟡 Reservado',
      maintenance: '🟠 Mantenimiento'
    };
    return texts[status] || status;
  };

  const getSpotTypeText = (type) => {
    const texts = {
      car: '🚗 Automóvil',
      motorcycle: '🏍️ Motocicleta'
    };
    return texts[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Gestión de Espacios - {parkingLot.name}
              </h2>
              <p className="text-blue-100">
                📍 {parkingLot.location}
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Espacios de Estacionamiento ({finalSpots.length})
              </h3>
              <p className="text-gray-600 text-sm">
                Gestiona los espacios individuales del parqueadero
                {isConnected && (
                  <span className="ml-2 text-green-600 text-xs">
                    🔗 Datos en tiempo real
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Espacio
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <span>{error}</span>
              </div>
              <div className="flex gap-2">
                {error.includes('token') || error.includes('sesión') ? (
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Ir a Login
                  </button>
                ) : null}
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {showCreateForm && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold mb-4">Crear Nuevo Espacio</h4>
                  <form onSubmit={handleCreateSpot} className="flex flex-col gap-4">
                    <div className="max-w-xs">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Vehículo *
                      </label>
                      <select
                        value={formData.spotType}
                        onChange={(e) => setFormData({...formData, spotType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="car">🚗 Automóvil</option>
                        <option value="motorcycle">🏍️ Motocicleta</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        El código se generará automáticamente (CAR-# o MOTO-#)
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={createLoading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {createLoading ? 'Creando...' : 'Crear Espacio'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {finalSpots.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🚗</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No hay espacios creados
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Comienza creando espacios para este parqueadero
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crear Primer Espacio
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {finalSpots.map((spot) => (
                    <div
                      key={spot.id}
                      className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                        spot.isRealtime ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-lg">{spot.code}</h4>
                          {spot.isRealtime && (
                            <span className="text-green-600 text-sm" title="Conectado a IoT">
                              🔗
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(spot.status)}`}>
                          {getStatusText(spot.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Tipo:</span>
                          <span>{getSpotTypeText(spot.spotType)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Creado:</span>
                          <span>{new Date(spot.createdAt).toLocaleDateString('es-ES')}</span>
                        </div>

                        {spot.isRealtime && spot.lastUpdate && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Última actualización:</span>
                            <span className="text-green-600">
                              {new Date(spot.lastUpdate).toLocaleTimeString('es-ES')}
                            </span>
                          </div>
                        )}

                        {spot.sensorData && (
                          <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                            <div className="text-xs text-blue-700 font-medium mb-1">
                              📡 Sensor IoT: {spot.sensorData.sensorId}
                            </div>
                            <div className="text-xs text-blue-600">
                              Confianza: {spot.sensorData.confidence}%
                              {spot.sensorData.detectionMethod && (
                                <span className="ml-2">
                                  • {spot.sensorData.detectionMethod}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleDeleteSpot(spot.id)}
                          className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkingSpotManager;