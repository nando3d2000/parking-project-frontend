# Configuración del Frontend - Sistema de Estacionamiento

## Estructura del Proyecto

### Modelo de Datos (Backend)
El proyecto está configurado para trabajar con un modelo de ParkingSpot que tiene la siguiente estructura de Sequelize:

```javascript
{
  id: INTEGER (Primary Key, Auto-increment),
  code: STRING (Código del espacio, ej: "A1"),
  status: STRING (Estado: "available", "occupied", "reserved", "maintenance"),
  floor: STRING (Piso: "1", "2", "B1", etc.),
  createdAt: TIMESTAMP (Automático),
  updatedAt: TIMESTAMP (Automático)
}
```

### Servicios y Hooks

#### parkingService.js
Maneja todas las llamadas HTTP al backend:
- `getAllParkingSpots()` - Obtiene todos los espacios
- `getParkingSpotById(id)` - Obtiene un espacio específico
- `createParkingSpot(data)` - Crea un nuevo espacio
- `updateParkingSpot(id, data)` - Actualiza un espacio
- `updateParkingSpotStatus(id, status)` - Actualiza solo el estado
- `deleteParkingSpot(id)` - Elimina un espacio
- `getParkingSpotsByStatus(status)` - Filtra por estado
- `getParkingSpotsByFloor(floor)` - Filtra por piso

#### useParkingSpots.js
Hook personalizado que proporciona:
- `parkingSpots` - Array de espacios
- `loading` - Estado de carga
- `error` - Mensajes de error
- `stats` - Estadísticas calculadas
- `floors` - Lista de pisos únicos
- `updateSpotStatus(id, status)` - Función para actualizar estado
- `createSpot(data)` - Función para crear espacio
- `deleteSpot(id)` - Función para eliminar espacio
- `refresh()` - Función para recargar datos

### Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:
```
VITE_API_URL=http://localhost:3000/api
```

### Endpoints Esperados del Backend

El frontend espera que tu backend tenga los siguientes endpoints:

```
GET    /api/parking-spots           - Obtener todos los espacios
GET    /api/parking-spots/:id       - Obtener espacio por ID
POST   /api/parking-spots           - Crear nuevo espacio
PUT    /api/parking-spots/:id       - Actualizar espacio
DELETE /api/parking-spots/:id       - Eliminar espacio
GET    /api/parking-spots?status=X  - Filtrar por estado
GET    /api/parking-spots?floor=X   - Filtrar por piso
```

### Estados Válidos
- `"available"` - Disponible (verde)
- `"occupied"` - Ocupado (morado)
- `"reserved"` - Reservado (azul)
- `"maintenance"` - Mantenimiento (gris)

### Funcionalidades Implementadas

1. **Visualización en Tiempo Real**: Los datos se cargan desde el backend
2. **Actualización de Estados**: Click en un espacio para cambiar su estado
3. **Filtros**: Por estado y piso
4. **Vistas**: Grid y mapa
5. **Estadísticas**: Contadores automáticos por estado
6. **Manejo de Errores**: Estados de carga y error
7. **Responsive Design**: Se adapta a diferentes pantallas

### Próximos Pasos

1. Configura la variable de entorno `VITE_API_URL`
2. Asegúrate de que tu backend tenga los endpoints mencionados
3. El frontend ya está listo para conectarse automáticamente