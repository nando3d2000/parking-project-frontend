const API_BASE_URL = 'http://localhost:8081/api/v1';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

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
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

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

      if (data.success) {
        this.token = data.data.token;
        this.user = data.data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

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
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  isAdmin() {
    return this.user && this.user.role === 'admin';
  }

  getToken() {
    return this.token;
  }

  getCurrentUser() {
    return this.user;
  }

  async authenticatedRequest(url, options = {}) {
    this.token = localStorage.getItem('token');
    
    if (!this.token) {
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
    
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, config);

      if (response.status === 401 || response.status === 403) {
        this.logout();
        window.location.href = '/login';
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async refreshTokenIfNeeded() {
    if (!this.token) return false;

    try {
      const response = await this.getProfile();
      return response.success;
    } catch (error) {
      this.logout();
      return false;
    }
  }
}

const authService = new AuthService();
export default authService;