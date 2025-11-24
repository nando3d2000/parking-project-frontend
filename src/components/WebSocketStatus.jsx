import { useRealTimeParking } from '../context/RealTimeParkingContext';
import { useMemo } from 'react';

const WebSocketStatus = ({ parkingLotId = null }) => {
  const { connectionStatus, lastUpdate, isConnected, realtimeSpots } = useRealTimeParking();

  // Filtrar spots solo del parking lot actual
  const filteredSpots = useMemo(() => {
    if (!parkingLotId) return realtimeSpots; // Si no hay parkingLotId, mostrar todos
    return realtimeSpots.filter(spot => spot.parkingLotId === parkingLotId);
  }, [realtimeSpots, parkingLotId]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'disconnected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return '🟢';
      case 'connecting':
        return '🟡';
      case 'disconnected':
        return '🔴';
      default:
        return '⚫';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Nunca';
    return new Date(timestamp).toLocaleTimeString('es-ES');
  };

  return (
    <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-300 ${getStatusColor()}`}>
      <div className="flex items-center gap-2">
        <span>{getStatusIcon()}</span>
        <span className="font-semibold">
          {connectionStatus === 'connected' ? 'En Vivo' : 'Sin Conexión'}
        </span>
        {connectionStatus === 'connected' && (
          <span className="text-xs opacity-75">
            • {filteredSpots.length} spots{parkingLotId ? ' (este parqueadero)' : ' (total)'}
          </span>
        )}
      </div>
      {lastUpdate && (
        <div className="text-xs opacity-75 mt-1">
          Última actualización: {formatTime(lastUpdate)}
        </div>
      )}
    </div>
  );
};

export default WebSocketStatus;