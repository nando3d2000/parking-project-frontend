const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getSpotsByParkingLot,
  createSpot,
  updateSpot,
  deleteSpot
} = require('../controllers/spotController');

// Obtener spots por parking lot (solo administradores)
router.get('/', authenticateToken, requireAdmin, getSpotsByParkingLot);

// Crear un nuevo spot (solo administradores)
router.post('/', authenticateToken, requireAdmin, createSpot);

// Actualizar un spot (solo administradores)
router.put('/:id', authenticateToken, requireAdmin, updateSpot);

// Eliminar un spot (solo administradores)
router.delete('/:id', authenticateToken, requireAdmin, deleteSpot);

module.exports = router;