import { useState, useEffect, useMemo } from 'react';
import authService from '../services/authService';
import ParkingSpotManager from './ParkingSpotManager';
import { useRealTimeParking } from '../context/RealTimeParkingContext';

const AdminParkingLots = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParkingLot, setSelectedParkingLot] = useState(null);
  const [showSpotManager, setShowSpotManager] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Datos en tiempo real del WebSocket
  const { realtimeSpots, requestParkingStatus, isConnected } = useRealTimeParking();

  // Solicitar estado inicial cuando se conecte el WebSocket
  useEffect(() => {
    if (isConnected) {
      requestParkingStatus();
    }
  }, [isConnected, requestParkingStatus]);

  useEffect(() => {
    loadParkingLots();
  }, []);

  const loadParkingLots = async () => {
    try {
      setLoading(true);
      const response = await authService.authenticatedRequest('/parking-lots');
      
      if (response.ok) {
        const data = await response.json();
        setParkingLots(data.data?.parkingLots || []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar parking lots');
      }
    } catch (error) {
      setError(error.message);
      console.error('Error cargando parking lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageLot = (lot) => {
    setSelectedParkingLot(lot);
    setShowSpotManager(true);
  };

  const handleManageSpots = (parkingLot) => {
    setSelectedParkingLot(parkingLot);
    setShowSpotManager(true);
  };

  const handleCloseSpotManager = () => {
    setShowSpotManager(false);
    setSelectedParkingLot(null);
  };

  const handleSpotManagerUpdate = () => {
    loadParkingLots();
  };

  const calculateRealTimeStats = useMemo(() => {
    const getStatsForLot = (lotId, originalStats) => {
      const rtSpots = realtimeSpots.filter(spot => spot.parkingLotId === lotId);
      
      if (rtSpots.length === 0) {
        return originalStats;
      }

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

      return realtimeStats;
    };

    return getStatsForLot;
  }, [realtimeSpots]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando parking lots...</p>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Parqueaderos
          </h1>
          <p className="text-gray-600">
            Administra los parqueaderos y sus espacios de estacionamiento
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Parqueadero
        </button>
      </div>

      {parkingLots.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <div className="text-gray-400 text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No hay parqueaderos registrados
          </h3>
          <p className="text-gray-500 mb-6">
            Comienza creando tu primer parqueadero
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crear Parqueadero
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parkingLots.map((lot) => {
            const stats = calculateRealTimeStats(lot.id, lot.statistics);
            
            return (
              <div
              key={lot.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
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
                      <span className="text-2xl font-bold">{stats?.total || lot.totalSpots || 0}</span>
                      <p className="text-xs text-blue-100">espacios</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {lot.description || 'Sin descripción disponible'}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
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

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">Estado:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    lot.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {lot.isActive ? '🟢 Activo' : '🔴 Inactivo'}
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleManageLot(lot)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Gestionar Espacios
                  </button>
                </div>
              </div>

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
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Crear Nuevo Parqueadero
            </h2>
            <p className="text-gray-600 mb-6">
              Esta funcionalidad se implementará próximamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showSpotManager && selectedParkingLot && (
        <ParkingSpotManager
          parkingLot={selectedParkingLot}
          onClose={handleCloseSpotManager}
          onUpdate={handleSpotManagerUpdate}
        />
      )}
    </div>
  );
};

export default AdminParkingLots;