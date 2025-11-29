import authService from './authService';

const API_BASE_URL = import.meta.env.BACK_END_API || 'http://localhost:8081/api/v1';

class ParkingService {
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
      throw error;
    }
  }

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
      throw error;
    }
  }

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
      throw error;
    }
  }

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
      throw error;
    }
  }

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
      throw error;
    }
  }

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
      throw error;
    }
  }

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
      throw error;
    }
  }

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
      throw error;
    }
  }

  async deleteParkingSpot(id) {
    try {
      const response = await authService.authenticatedRequest(`/spots/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.success) {
        throw new Error(response.message || `Error deleting parking spot with id ${id}`);
      }
    } catch (error) {
      throw error;
    }
  }

  async getParkingSpotsByStatus(status) {
    try {
      const response = await fetch(`${API_BASE_URL}?status=${status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async getParkingSpotsByFloor(floor) {
    try {
      const response = await fetch(`${API_BASE_URL}?floor=${floor}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}

const parkingService = new ParkingService();

export default parkingService;