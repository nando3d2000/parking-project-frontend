import PropTypes from "prop-types";
import { FaCar, FaTools, FaClock, FaCheck } from "react-icons/fa";

const ParkingMap = ({ parkingSpots, onSpotClick }) => {
  if (!parkingSpots || parkingSpots.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No hay espacios de estacionamiento disponibles
      </div>
    );
  }

  const groupedByFloor = parkingSpots.reduce((acc, spot) => {
    if (!acc[spot.floor]) {
      acc[spot.floor] = [];
    }
    acc[spot.floor].push(spot);
    return acc;
  }, {});

  const getStatusStyles = (status) => {
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
        bg: "bg-green-500",
        border: "border-green-600",
        icon: <FaCheck className="text-white text-xs" />,
      },
      occupied: {
        bg: "bg-[#780D80]",
        border: "border-[#8a1091]",
        icon: <FaCar className="text-white text-xs" />,
      },
      reserved: {
        bg: "bg-[#00386D]",
        border: "border-[#004a8a]",
        icon: <FaClock className="text-white text-xs" />,
      },
      maintenance: {
        bg: "bg-gray-500",
        border: "border-gray-600",
        icon: <FaTools className="text-white text-xs" />,
      },
    };
    return styles[mappedStatus] || styles.available;
  };

  return (
    <div className="w-full p-6">
      {Object.keys(groupedByFloor)
        .sort((a, b) => Number(b) - Number(a))
        .map((floor) => (
          <div key={floor} className="mb-8">
            {/* Encabezado del piso */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#00386D] text-white px-4 py-2 rounded-lg font-bold">
                Piso {floor}
              </div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-[#780D80] to-transparent"></div>
            </div>

            {/* Plano del parqueadero */}
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 border-4 border-gray-300 shadow-inner">
              {/* Marcas de carril */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <div className="w-full h-full">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="h-[10%] border-b-2 border-dashed border-gray-400"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Entrada/Salida */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                  🚗 ENTRADA/SALIDA
                </div>
              </div>

              {/* Grid de espacios */}
              <div className="relative grid grid-cols-2 gap-8">
                {/* Lado izquierdo */}
                <div className="space-y-3">
                  {groupedByFloor[floor]
                    .filter((_, index) => index % 2 === 0)
                    .map((spot) => {
                      const style = getStatusStyles(spot.status);
                      return (
                        <div
                          key={spot.code}
                          onClick={() => onSpotClick?.(spot)}
                          className={`
                            relative flex items-center justify-between
                            ${style.bg} ${style.border}
                            border-4 rounded-lg p-3
                            cursor-pointer transition-all duration-300
                            hover:scale-105 hover:shadow-xl
                            group
                          `}
                        >
                          {/* Líneas de estacionamiento */}
                          <div className="absolute inset-0 flex">
                            <div className="w-1 bg-white/30 h-full"></div>
                            <div className="flex-1"></div>
                            <div className="w-1 bg-white/30 h-full"></div>
                          </div>

                          {/* Contenido */}
                          <div className="relative z-10 flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              {style.icon}
                              <span className="font-bold text-white text-sm">
                                {spot.code}
                              </span>
                            </div>
                            <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
                              {style.icon}
                            </div>
                          </div>

                          {/* Tooltip */}
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                            {spot.code} - {spot.status === "available" ? "Disponible" : spot.status === "occupied" ? "Ocupado" : spot.status === "reserved" ? "Reservado" : "Mantenimiento"}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Carril central */}
                <div className="absolute left-1/2 top-0 bottom-0 w-12 -translate-x-1/2 flex flex-col items-center justify-center">
                  <div className="w-1 h-full bg-yellow-400 relative">
                    {[...Array(15)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-full bg-gray-700"
                        style={{
                          height: "8px",
                          top: `${i * 7}%`,
                        }}
                      ></div>
                    ))}
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 transform rotate-90 text-xs font-bold text-yellow-600 tracking-widest whitespace-nowrap">
                    CARRIL
                  </div>
                </div>

                {/* Lado derecho */}
                <div className="space-y-3">
                  {groupedByFloor[floor]
                    .filter((_, index) => index % 2 !== 0)
                    .map((spot) => {
                      const style = getStatusStyles(spot.status);
                      return (
                        <div
                          key={spot.code}
                          onClick={() => onSpotClick?.(spot)}
                          className={`
                            relative flex items-center justify-between
                            ${style.bg} ${style.border}
                            border-4 rounded-lg p-3
                            cursor-pointer transition-all duration-300
                            hover:scale-105 hover:shadow-xl
                            group
                          `}
                        >
                          {/* Líneas de estacionamiento */}
                          <div className="absolute inset-0 flex">
                            <div className="w-1 bg-white/30 h-full"></div>
                            <div className="flex-1"></div>
                            <div className="w-1 bg-white/30 h-full"></div>
                          </div>

                          {/* Contenido */}
                          <div className="relative z-10 flex items-center justify-between w-full">
                            <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
                              {style.icon}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">
                                {spot.code}
                              </span>
                              {style.icon}
                            </div>
                          </div>

                          {/* Tooltip */}
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                            {spot.code} - {spot.status === "available" ? "Disponible" : spot.status === "occupied" ? "Ocupado" : spot.status === "reserved" ? "Reservado" : "Mantenimiento"}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

ParkingMap.propTypes = {
  parkingSpots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      code: PropTypes.string.isRequired,
      floor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      status: PropTypes.oneOf(["available", "occupied", "reserved", "maintenance"]).isRequired,
    })
  ).isRequired,
  onSpotClick: PropTypes.func,
};

export default ParkingMap;
