import PropTypes from "prop-types";
import ParkingSpot from "./ParkingSpot";

const ParkingSpots = ({ parkingSpots, onSpotClick }) => {
  if (!parkingSpots || parkingSpots.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No hay espacios de estacionamiento disponibles
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {parkingSpots.map((spot) => (
          <ParkingSpot key={spot.id} cell={spot} onClick={onSpotClick} />
        ))}
      </div>
    </div>
  );
};

ParkingSpots.propTypes = {
  parkingSpots: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      code: PropTypes.string.isRequired,
      floor: PropTypes.string.isRequired,
      status: PropTypes.oneOf(["available", "occupied", "reserved", "maintenance"]).isRequired,
      createdAt: PropTypes.string,
      updatedAt: PropTypes.string,
    })
  ).isRequired,
  onSpotClick: PropTypes.func,
};

export default ParkingSpots;
