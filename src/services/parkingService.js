import authService from './authService';

// Configuración base de la API
const API_BASE_URL = import.meta.env.BACK_END_API || 'http://localhost:8081/api/v1';

class ParkingService {
  /**
   * Obtiene todos los parking spots
   * @returns {Promise<Array>} Lista de parking spots
   */
  async getAllParkingSpots() {
    try {
      const response = await authService.authenticatedRequest('/spots');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.data.parkingSpots || [];
        } else {
          throw new Error(data.message || 'Error fetching parking spots');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error fetching parking spots');
      }
    } catch (error) {
      console.error('Error fetching parking spots:', error);
      throw error;
    }
  }

  /**
   * Obtiene un parking spot específico por ID
   * @param {number} id - ID del parking spot
   * @returns {Promise<Object>} Parking spot encontrado
   */
  async getParkingSpotById(id) {
    try {
      const response = await authService.authenticatedRequest(`/spots/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.data;
        } else {
          throw new Error(data.message || `Error fetching parking spot with id ${id}`);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error fetching parking spot with id ${id}`);
      }
    } catch (error) {
      console.error(`Error fetching parking spot with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene parking spots de un parqueadero específico
   * @param {number} parkingLotId - ID del parking lot
   * @returns {Promise<Array>} Lista de parking spots del parqueadero
   */
  async getParkingSpotsByLot(parkingLotId) {
    try {
      const response = await authService.authenticatedRequest(`/parking-lots/${parkingLotId}/spots`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.data.parkingSpots || [];
        } else {
          throw new Error(data.message || `Error fetching parking spots for lot ${parkingLotId}`);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error fetching parking spots for lot ${parkingLotId}`);
      }
    } catch (error) {
      console.error(`Error fetching parking spots for lot ${parkingLotId}:`, error);
      throw error;
    }
  }

  /**
   * Crea un nuevo parking spot (solo admins)
   * @param {Object} parkingSpotData - Datos del parking spot
   * @returns {Promise<Object>} Parking spot creado
   */
  async createParkingSpot(parkingSpotData) {
    try {
      const response = await authService.authenticatedRequest('/spots', {
        method: 'POST',
        body: JSON.stringify(parkingSpotData),
      });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Error creating parking spot');
      }
    } catch (error) {
      console.error('Error creating parking spot:', error);
      throw error;
    }
  }

  /**
   * Actualiza un parking spot existente (solo admins)
   * @param {number} id - ID del parking spot
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Parking spot actualizado
   */
  async updateParkingSpot(id, updateData) {
    try {
      const response = await authService.authenticatedRequest(`/spots/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || `Error updating parking spot with id ${id}`);
      }
    } catch (error) {
      console.error(`Error updating parking spot with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza solo el estado de un parking spot
   * @param {number} id - ID del parking spot
   * @param {string} status - Nuevo estado (available, occupied, reserved, maintenance)
   * @returns {Promise<Object>} Parking spot actualizado
   */
  async updateParkingSpotStatus(id, status) {
    try {
      const response = await authService.authenticatedRequest(`/spots/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.data;
        } else {
          throw new Error(data.message || `Error updating parking spot status with id ${id}`);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error updating parking spot status with id ${id}`);
      }
    } catch (error) {
      console.error(`Error updating parking spot status with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reserva un parking spot
   * @param {number} id - ID del parking spot
   * @returns {Promise<Object>} Parking spot reservado
   */
  async reserveParkingSpot(id) {
    try {
      const response = await authService.authenticatedRequest(`/spots/${id}/reserve`, {
        method: 'POST',
      });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || `Error reserving parking spot with id ${id}`);
      }
    } catch (error) {
      console.error(`Error reserving parking spot with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cancela una reserva
   * @param {number} id - ID del parking spot
   * @returns {Promise<Object>} Parking spot actualizado
   */
  async cancelReservation(id) {
    try {
      const response = await authService.authenticatedRequest(`/spots/${id}/reservation`, {
        method: 'DELETE',
      });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || `Error canceling reservation for spot ${id}`);
      }
    } catch (error) {
      console.error(`Error canceling reservation for spot ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un parking spot (solo admins)
   * @param {number} id - ID del parking spot
   * @returns {Promise<void>}
   */
  async deleteParkingSpot(id) {
    try {
      const response = await authService.authenticatedRequest(`/spots/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.success) {
        throw new Error(response.message || `Error deleting parking spot with id ${id}`);
      }
    } catch (error) {
      console.error(`Error deleting parking spot with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Filtra parking spots por estado
   * @param {string} status - Estado a filtrar (available, occupied, reserved, maintenance)
   * @returns {Promise<Array>} Lista filtrada de parking spots
   */
  async getParkingSpotsByStatus(status) {
    try {
      const response = await fetch(`${API_BASE_URL}?status=${status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching parking spots with status ${status}:`, error);
      throw error;
    }
  }

  /**
   * Filtra parking spots por piso
   * @param {string} floor - Piso a filtrar
   * @returns {Promise<Array>} Lista filtrada de parking spots
   */
  async getParkingSpotsByFloor(floor) {
    try {
      const response = await fetch(`${API_BASE_URL}?floor=${floor}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching parking spots for floor ${floor}:`, error);
      throw error;
    }
  }
}

// Crear una instancia del servicio para exportar
const parkingService = new ParkingService();

export default parkingService;