const API_BASE_URL = 'http://localhost:8081/api/v1';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  // Registrar usuario
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        this.token = data.data.token;
        this.user = data.data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
      }

      return data;
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  // Iniciar sesión
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data); // Debug

      if (data.success) {
        this.token = data.data.token;
        this.user = data.data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        console.log('Token guardado:', this.token); // Debug
      }

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  // Cerrar sesión
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Obtener perfil del usuario
  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        this.user = data.data;
        localStorage.setItem('user', JSON.stringify(this.user));
      }

      return data;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Verificar si el usuario es administrador
  isAdmin() {
    return this.user && this.user.role === 'admin';
  }

  // Obtener token
  getToken() {
    return this.token;
  }

  // Obtener usuario actual
  getCurrentUser() {
    return this.user;
  }

  // Realizar petición autenticada
  async authenticatedRequest(url, options = {}) {
    // Siempre obtener el token más reciente del localStorage
    this.token = localStorage.getItem('token');
    
    console.log('Token disponible:', !!this.token); // Debug
    console.log('URL completa:', `${API_BASE_URL}${url}`); // Debug
    
    if (!this.token) {
      console.error('No hay token disponible');
      this.logout();
      window.location.href = '/login';
      return;
    }
    
    const config = {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    console.log('Request config headers:', config.headers); // Debug
    
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, config);
      console.log('Response status:', response.status); // Debug

      // Si el token es inválido, cerrar sesión
      if (response.status === 401 || response.status === 403) {
        console.log('Token inválido, cerrando sesión');
        this.logout();
        window.location.href = '/login';
      }

      return response;
    } catch (error) {
      console.error('Error en petición autenticada:', error);
      throw error;
    }
  }

  // Refrescar token si es necesario
  async refreshTokenIfNeeded() {
    if (!this.token) return false;

    try {
      // Verificar si el token sigue siendo válido
      const response = await this.getProfile();
      return response.success;
    } catch (error) {
      console.error('Error verificando token:', error);
      this.logout();
      return false;
    }
  }
}

// Exportar instancia singleton
const authService = new AuthService();
export default authService;