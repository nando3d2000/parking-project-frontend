import PropTypes from "prop-types";
import { FaFilter, FaCheck, FaCar, FaClock, FaTools } from "react-icons/fa";

const ParkingFilters = ({ onFilterChange, activeFilter, floors, onFloorChange, activeFloor }) => {
  const filters = [
    { id: "all", label: "Todos", icon: <FaFilter />, color: "blue" },
    { id: "available", label: "Disponibles", icon: <FaCheck />, color: "green" },
    { id: "occupied", label: "Ocupados", icon: <FaCar />, color: "purple" },
    { id: "reserved", label: "Reservados", icon: <FaClock />, color: "darkblue" },
    { id: "maintenance", label: "Mantenimiento", icon: <FaTools />, color: "gray" },
  ];

  const getButtonStyles = (filterId, color) => {
    const isActive = activeFilter === filterId;
    const colorMap = {
      blue: {
        active: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105",
        inactive: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
      },
      green: {
        active: "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105",
        inactive: "bg-green-50 text-green-700 hover:bg-green-100 border-green-200",
      },
      purple: {
        active: "bg-gradient-to-r from-[#780D80] to-[#8a1091] text-white shadow-lg scale-105",
        inactive: "bg-purple-50 text-[#780D80] hover:bg-purple-100 border-purple-200",
      },
      darkblue: {
        active: "bg-gradient-to-r from-[#00386D] to-[#004a8a] text-white shadow-lg scale-105",
        inactive: "bg-blue-50 text-[#00386D] hover:bg-blue-100 border-blue-200",
      },
      gray: {
        active: "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg scale-105",
        inactive: "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200",
      },
    };

    return isActive ? colorMap[color].active : colorMap[color].inactive;
  };

  const getFloorButtonStyles = (floor) => {
    const isActive = activeFloor === floor;
    return isActive
      ? "bg-gradient-to-r from-[#00386D] to-[#004a8a] text-white shadow-lg scale-105"
      : "bg-white text-[#00386D] hover:bg-blue-50 border-[#00386D]/20";
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-6 mb-6">
      {/* Filtros por estado */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#00386D] mb-4 flex items-center gap-2">
          <FaFilter className="text-[#780D80]" />
          Filtrar por Estado
        </h3>
        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
                border-2 transition-all duration-300 transform
                ${getButtonStyles(filter.id, filter.color)}
              `}
            >
              {filter.icon}
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Navegación por pisos */}
      {floors && floors.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-[#00386D] mb-4 flex items-center gap-2">
            🏢 Seleccionar Piso
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onFloorChange("all")}
              className={`
                px-5 py-2.5 rounded-xl font-semibold text-sm
                border-2 transition-all duration-300 transform
                ${getFloorButtonStyles("all")}
              `}
            >
              Todos los Pisos
            </button>
            {floors.map((floor) => (
              <button
                key={floor}
                onClick={() => onFloorChange(floor)}
                className={`
                  px-5 py-2.5 rounded-xl font-semibold text-sm
                  border-2 transition-all duration-300 transform
                  ${getFloorButtonStyles(floor)}
                `}
              >
                Piso {floor}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

ParkingFilters.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  activeFilter: PropTypes.string.isRequired,
  floors: PropTypes.array,
  onFloorChange: PropTypes.func,
  activeFloor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ParkingFilters;
