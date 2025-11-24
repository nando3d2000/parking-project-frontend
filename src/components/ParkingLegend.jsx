import PropTypes from "prop-types";
import { FaCheck, FaCar, FaClock, FaTools, FaInfoCircle } from "react-icons/fa";

const ParkingLegend = ({ className = "" }) => {
  const legendItems = [
    {
      status: "available",
      label: "Disponible",
      icon: <FaCheck className="text-lg" />,
      gradient: "from-green-400 to-green-600",
      description: "Espacio libre para uso inmediato",
    },
    {
      status: "occupied",
      label: "Ocupado",
      icon: <FaCar className="text-lg" />,
      gradient: "from-[#780D80] to-[#8a1091]",
      description: "Espacio actualmente en uso",
    },
    {
      status: "reserved",
      label: "Reservado",
      icon: <FaClock className="text-lg" />,
      gradient: "from-[#00386D] to-[#004a8a]",
      description: "Espacio reservado temporalmente",
    },
    {
      status: "maintenance",
      label: "Mantenimiento",
      icon: <FaTools className="text-lg" />,
      gradient: "from-gray-400 to-gray-600",
      description: "Espacio fuera de servicio",
    },
  ];

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-5">
        <FaInfoCircle className="text-[#780D80] text-xl" />
        <h3 className="text-lg font-bold text-[#00386D]">Leyenda de Estados</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {legendItems.map((item) => (
          <div
            key={item.status}
            className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md"
          >
            {/* Icono con gradiente */}
            <div
              className={`bg-gradient-to-br ${item.gradient} text-white p-3 rounded-full mb-3 shadow-md`}
            >
              {item.icon}
            </div>

            {/* Etiqueta */}
            <div className="font-bold text-gray-800 mb-1">{item.label}</div>

            {/* Descripción */}
            <div className="text-xs text-gray-600">{item.description}</div>
          </div>
        ))}
      </div>

      {/* Nota adicional */}
      <div className="mt-5 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          💡 Haz clic en cualquier espacio disponible para realizar una reserva
        </p>
      </div>
    </div>
  );
};

ParkingLegend.propTypes = {
  className: PropTypes.string,
};

export default ParkingLegend;
