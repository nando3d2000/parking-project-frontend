import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useRealTimeParking } from "../context/RealTimeParkingContext";
import ParkingSpots from "../components/ParkingSpots";
import ParkingStats from "../components/ParkingStats";
import ParkingFilters from "../components/ParkingFilters";
import ParkingLegend from "../components/ParkingLegend";
import ParkingMap from "../components/ParkingMap";
import AdminParkingLots from "../components/AdminParkingLots";
import UserParkingLots from "../components/UserParkingLots";
import WebSocketStatus from "../components/WebSocketStatus";
import Header from "../components/Header";
import logoIUSH from "../assets/Logo-IUSH.svg";
import { useParkingSpots } from "../hooks/useParkingSpots";

function Dashboard() {
  const { user } = useAuth();
  
  const isAdmin = user && user.role === 'admin';
  
  const [selectedParkingLot, setSelectedParkingLot] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  
  const shouldLoadSpots = !isAdmin && selectedParkingLot;
  const { 
    parkingSpots: parkingCells = [], 
    loading = false, 
    error = null, 
    stats = {}, 
    floors = [], 
    updateSpotStatus = () => {} 
  } = useParkingSpots(shouldLoadSpots ? selectedParkingLot.id : null);

  const filteredSpots = useMemo(() => {
    return parkingCells.filter(cell => {
      const matchesStatus = statusFilter === "all" || cell.status === statusFilter;
      const matchesFloor = floorFilter === "all" || cell.floor === floorFilter;
      return matchesStatus && matchesFloor;
    });
  }, [parkingCells, statusFilter, floorFilter]);

  const handleClick = async (cell) => {
    const currentStatus = cell.status;
    let newStatus;
    
    switch (currentStatus) {
      case "available":
        newStatus = "occupied";
        break;
      case "occupied":
        newStatus = "available";
        break;
      case "reserved":
        newStatus = "available";
        break;
      case "maintenance":
        newStatus = "available";
        break;
      default:
        newStatus = "available";
    }

    try {
      await updateSpotStatus(cell.id, newStatus);
      alert(`Celda ${cell.code} cambió de ${currentStatus} a ${newStatus}`);
    } catch (error) {
      alert(`Error al actualizar la celda ${cell.code}: ${error.message}`);
    }
  };

  if (!isAdmin && selectedParkingLot && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
        <Header logoPath={logoIUSH} />
        <div className="w-full max-w-7xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-lg text-gray-600">Cargando espacios de {selectedParkingLot.name}...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin && selectedParkingLot && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
        <Header logoPath={logoIUSH} />
        <div className="w-full max-w-7xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center py-20">
            <div className="text-center bg-white rounded-2xl shadow-lg p-8">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error de Conexión</h2>
              <p className="text-gray-600 mb-4">No se pudieron cargar los espacios de {selectedParkingLot.name}</p>
              <p className="text-sm text-red-500 mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setSelectedParkingLot(null)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Volver a parqueaderos
                </button>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
      <Header logoPath={logoIUSH} />
      <WebSocketStatus parkingLotId={selectedParkingLot?.id} />

      <div className="w-full max-w-7xl mx-auto py-8 px-4">
        {isAdmin ? (
          <AdminParkingLots />
        ) : !selectedParkingLot ? (
          <UserParkingLots onSelectParkingLot={setSelectedParkingLot} />
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedParkingLot.name}</h2>
                  <p className="text-gray-600">📍 {selectedParkingLot.location}</p>
                  {selectedParkingLot.description && (
                    <p className="text-gray-500 mt-1">{selectedParkingLot.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedParkingLot(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  ← Volver a parqueaderos
                </button>
              </div>
            </div>

            <ParkingStats stats={stats} />
            
            <ParkingFilters 
              onFilterChange={setStatusFilter}
              activeFilter={statusFilter}
              floors={floors}
              onFloorChange={setFloorFilter}
              activeFloor={floorFilter}
            />

            <ParkingLegend className="mb-6" />

            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex items-center justify-center gap-4">
              <span className="text-gray-700 font-semibold">Vista:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-[#00386D] to-[#004a8a] text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  🔲 Grid
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    viewMode === "map"
                      ? "bg-gradient-to-r from-[#00386D] to-[#004a8a] text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  🗺️ Plano
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-2xl">
              {viewMode === "grid" ? (
                <ParkingSpots parkingSpots={filteredSpots} onSpotClick={handleClick} />
              ) : (
                <ParkingMap parkingSpots={filteredSpots} onSpotClick={handleClick} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;