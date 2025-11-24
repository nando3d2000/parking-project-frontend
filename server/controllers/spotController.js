const { ParkingSpot, ParkingLot } = require('../models');

// Obtener spots por parking lot
const getSpotsByParkingLot = async (req, res) => {
  try {
    const { parkingLotId } = req.query;

    if (!parkingLotId) {
      return res.status(400).json({
        success: false,
        message: 'parkingLotId es requerido'
      });
    }

    // Verificar que el parking lot existe
    const parkingLot = await ParkingLot.findByPk(parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot no encontrado'
      });
    }

    const spots = await ParkingSpot.findAll({
      where: { parkingLotId },
      order: [['code', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        parkingSpots: spots
      }
    });
  } catch (error) {
    console.error('Error obteniendo spots:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear un nuevo spot
const createSpot = async (req, res) => {
  try {
    const { code, floor, zone, spotType, parkingLotId } = req.body;

    // Validaciones
    if (!code || !floor || !spotType || !parkingLotId) {
      return res.status(400).json({
        success: false,
        message: 'Código, piso, tipo de spot y parking lot son requeridos'
      });
    }

    // Validar tipos permitidos (solo Automóvil y Motocicleta como solicitó el usuario)
    if (!['regular', 'motorcycle'].includes(spotType)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de spot debe ser "regular" (Automóvil) o "motorcycle" (Motocicleta)'
      });
    }

    // Verificar que el parking lot existe
    const parkingLot = await ParkingLot.findByPk(parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot no encontrado'
      });
    }

    // Verificar que el código no esté duplicado en el mismo parking lot
    const existingSpot = await ParkingSpot.findOne({
      where: {
        code,
        parkingLotId
      }
    });

    if (existingSpot) {
      return res.status(400).json({
        success: false,
        message: `Ya existe un espacio con el código "${code}" en este parqueadero`
      });
    }

    // Crear el spot
    const spot = await ParkingSpot.create({
      code,
      floor,
      zone: zone || null,
      spotType,
      parkingLotId,
      status: 'available' // Por defecto disponible
    });

    res.status(201).json({
      success: true,
      data: spot,
      message: 'Espacio de estacionamiento creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando spot:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar un spot
const updateSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, floor, zone, spotType, status } = req.body;

    const spot = await ParkingSpot.findByPk(id);
    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Espacio de estacionamiento no encontrado'
      });
    }

    // Validar tipo de spot si se proporciona
    if (spotType && !['regular', 'motorcycle'].includes(spotType)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de spot debe ser "regular" (Automóvil) o "motorcycle" (Motocicleta)'
      });
    }

    // Validar estado si se proporciona
    const validStatuses = ['available', 'occupied', 'reserved', 'maintenance', 'disabled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Estado debe ser uno de: ${validStatuses.join(', ')}`
      });
    }

    // Si se actualiza el código, verificar que no esté duplicado
    if (code && code !== spot.code) {
      const existingSpot = await ParkingSpot.findOne({
        where: {
          code,
          parkingLotId: spot.parkingLotId,
          id: { [require('sequelize').Op.ne]: id }
        }
      });

      if (existingSpot) {
        return res.status(400).json({
          success: false,
          message: `Ya existe un espacio con el código "${code}" en este parqueadero`
        });
      }
    }

    // Actualizar el spot
    await spot.update({
      code: code || spot.code,
      floor: floor || spot.floor,
      zone: zone !== undefined ? zone : spot.zone,
      spotType: spotType || spot.spotType,
      status: status || spot.status
    });

    res.json({
      success: true,
      data: spot,
      message: 'Espacio de estacionamiento actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando spot:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar un spot
const deleteSpot = async (req, res) => {
  try {
    const { id } = req.params;

    const spot = await ParkingSpot.findByPk(id);
    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Espacio de estacionamiento no encontrado'
      });
    }

    // Verificar que el spot no esté ocupado
    if (spot.status === 'occupied') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un espacio que está ocupado'
      });
    }

    await spot.destroy();

    res.json({
      success: true,
      message: 'Espacio de estacionamiento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando spot:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getSpotsByParkingLot,
  createSpot,
  updateSpot,
  deleteSpot
};