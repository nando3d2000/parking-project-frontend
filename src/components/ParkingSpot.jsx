import {FaCar, FaTools, FaClock, FaCheck, FaParking, FaWifi} from "react-icons/fa";


const ParkingSpot = ({ cell, onClick }) => {
  if (!cell) return null;

  // Verificar si hay actualización en tiempo real
  const isRealtimeUpdated = cell.isRealTimeUpdated;
  const hasWifi = cell.sensorData; // Si tiene datos del sensor IoT

  const base =
    "relative flex flex-col items-center justify-center rounded-2xl w-28 h-28 text-center font-semibold text-xs cursor-pointer transition-all duration-500 transform hover:scale-[1.08] hover:-translate-y-1 shadow-[0_4px_10px_rgba(0,0,0,0.15)] border border-transparent overflow-hidden";

  const getStyles = (status) => {
    // Normalizar el estado (manejar tanto inglés como español)
    const normalizedStatus = status.toLowerCase();
    const statusMap = {
      'available': 'available',
      'libre': 'available',
      'occupied': 'occupied', 
      'ocupado': 'occupied',
      'reserved': 'reserved',
      'reservado': 'reserved',
      'maintenance': 'maintenance',
      'mantenimiento': 'maintenance'
    };
    
    const mappedStatus = statusMap[normalizedStatus] || normalizedStatus;
    const styles = {
      available: {
        container: `${base} bg-gradient-to-br from-green-400 to-green-600 text-white border-green-300`,
        icon: <FaCheck className="text-2xl mb-2" />,
        text: "Disponible",
        glow: "shadow-[0_0_20px_4px_rgba(34,197,94,0.6)]",
      },
      occupied: {
        container: `${base} bg-gradient-to-br from-[#780D80] to-[#8a1091] text-white border-purple-400`,
        icon: <FaCar className="text-2xl mb-2" />,
        text: "Ocupado",
        glow: "shadow-[0_0_20px_4px_rgba(120,13,128,0.5)]",
      },
      reserved: {
        container: `${base} bg-gradient-to-br from-[#00386D] to-[#004a8a] text-white border-blue-300`,
        icon: <FaClock className="text-2xl mb-2" />,
        text: "Reservado",
        glow: "shadow-[0_0_20px_4px_rgba(0,56,109,0.5)]",
      },
      maintenance: {
        container: `${base} bg-gradient-to-br from-gray-400 to-gray-600 text-white border-gray-300`,
        icon: <FaTools className="text-2xl mb-2" />,
        text: "Mantenimiento",
        glow: "shadow-[0_0_20px_4px_rgba(156,163,175,0.5)]",
      },
    };
    return (
      styles[mappedStatus] || {
        container: `${base} bg-gradient-to-br from-blue-400 to-blue-600 text-white border-blue-300`,
        icon: <FaParking className="text-2xl mb-2" />,
        text: "Desconocido",
        glow: "shadow-[0_0_20px_4px_rgba(59,130,246,0.5)]",
      }
    );
  };

  const style = getStyles(cell.status);

  return (
    <div
      onClick={() => onClick?.(cell)}
      className={`${style.container} ${isRealtimeUpdated ? 'ring-2 ring-green-400 ring-opacity-50' : ''} hover:${style.glow} group`}
      title={`Celda ${cell.code} - Piso ${cell.floor}${isRealtimeUpdated ? ' (Actualizado en tiempo real)' : ''}`}
    >
      {/* Animación de actualización en tiempo real */}
      {isRealtimeUpdated && (
        <div className="absolute inset-0 bg-green-400/20 rounded-2xl animate-ping opacity-75"></div>
      )}

      {/* Capa de luz animada */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500" />

      {/* Badge del piso */}
      <div className="absolute top-2 left-2 bg-white/20 text-white text-[10px] px-2 py-[2px] rounded-full font-bold backdrop-blur-sm shadow-md">
        Piso {cell.floor}
      </div>

      {/* Indicador de conexión IoT en tiempo real */}
      {isRealtimeUpdated && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {hasWifi && (
            <FaWifi className="text-green-300 text-[8px] animate-pulse" title="Sensor IoT conectado" />
          )}
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Actualización en tiempo real"></div>
        </div>
      )}

      {/* Icono principal */}
      <div className="z-10">{style.icon}</div>

      {/* Código de celda */}
      <div className="z-10 text-sm font-bold bg-white/10 px-3 py-1 rounded-xl backdrop-blur-sm border border-white/20">
        {cell.code}
      </div>

      {/* Estado */}
      <div className="z-10 text-[10px] opacity-90 mt-1">{style.text}</div>

      {/* Indicador inferior tipo LED */}
      <div
        className={`absolute bottom-2 w-2.5 h-2.5 rounded-full ${
          cell.status === "available"
            ? "bg-green-300 animate-pulse"
            : cell.status === "occupied"
            ? "bg-red-400"
            : cell.status === "reserved"
            ? "bg-yellow-300"
            : "bg-gray-300"
        }`}
      ></div>

      {/* Sombra reflejo */}
      <div className="absolute bottom-0 w-full h-[6px] bg-black/20 rounded-b-2xl blur-sm" />
    </div>
  );
};

export default ParkingSpot;
