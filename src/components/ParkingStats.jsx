import PropTypes from "prop-types";
import { FaCheck, FaCar, FaClock, FaTools } from "react-icons/fa";

const ParkingStats = ({ stats }) => {
  console.log('🎯 ParkingStats renderizando con:', stats);

  const statCards = [
    {
      label: "Disponibles",
      value: stats.available || 0,
      icon: <FaCheck className="text-3xl" />,
      gradient: "from-green-400 to-green-600",
      bgLight: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
    },
    {
      label: "Ocupados",
      value: stats.occupied || 0,
      icon: <FaCar className="text-3xl" />,
      gradient: "from-[#780D80] to-[#8a1091]",
      bgLight: "bg-purple-50",
      textColor: "text-[#780D80]",
      borderColor: "border-purple-200",
    },
    {
      label: "Reservados",
      value: stats.reserved || 0,
      icon: <FaClock className="text-3xl" />,
      gradient: "from-[#00386D] to-[#004a8a]",
      bgLight: "bg-blue-50",
      textColor: "text-[#00386D]",
      borderColor: "border-blue-200",
    },
    {
      label: "Mantenimiento",
      value: stats.maintenance || 0,
      icon: <FaTools className="text-3xl" />,
      gradient: "from-gray-400 to-gray-600",
      bgLight: "bg-gray-50",
      textColor: "text-gray-700",
      borderColor: "border-gray-200",
    },
  ];

  const total = stats.total || 0;
  const availabilityPercentage = total > 0 ? ((stats.available / total) * 100).toFixed(1) : 0;

  return (
    <div className="w-full mb-8">
      {/* Indicador de disponibilidad general */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#00386D]">Disponibilidad General</h2>
            <p className="text-gray-600">
              {stats.available} de {stats.total} espacios disponibles
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-green-600">{availabilityPercentage}%</div>
            <div className="text-sm text-gray-500">Disponible</div>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${availabilityPercentage}%` }}
          >
            {availabilityPercentage > 10 && (
              <span className="text-xs text-white font-bold">{availabilityPercentage}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgLight} ${card.borderColor} border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer`}
          >
            <div className="flex flex-col items-center text-center">
              {/* Icono con gradiente */}
              <div
                className={`bg-gradient-to-br ${card.gradient} text-white p-4 rounded-full mb-4 shadow-lg`}
              >
                {card.icon}
              </div>
              
              {/* Número */}
              <div className={`text-4xl font-bold ${card.textColor} mb-2`}>
                {card.value}
              </div>
              
              {/* Etiqueta */}
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {card.label}
              </div>
              
              {/* Porcentaje */}
              <div className="text-xs text-gray-500 mt-2">
                {total > 0 ? ((card.value / total) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

ParkingStats.propTypes = {
  stats: PropTypes.shape({
    total: PropTypes.number.isRequired,
    available: PropTypes.number.isRequired,
    occupied: PropTypes.number.isRequired,
    reserved: PropTypes.number.isRequired,
    maintenance: PropTypes.number.isRequired,
  }).isRequired,
};

export default ParkingStats;
