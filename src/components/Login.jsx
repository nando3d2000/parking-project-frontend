import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await login(formData.email, formData.password);
      
      if (response.success) {
        window.location.href = '/dashboard';
      } else {
        setError(response.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async (email, password) => {
    setFormData({ email, password });
    setIsLoading(true);
    setError('');

    try {
      const response = await login(email, password);
      
      if (response.success) {
        window.location.href = '/dashboard';
      } else {
        setError(response.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logo SVG de IUSH
  const IUSHLogo = () => (
    <div className="mx-auto w-32 h-32 mb-8">
      <svg viewBox="0 0 120 120" className="w-full h-full">
        {/* Círculo exterior */}
        <circle 
          cx="60" 
          cy="60" 
          r="58" 
          fill="url(#logoGradient)" 
          stroke="#1e40af" 
          strokeWidth="2"
        />
        
        {/* Libro abierto */}
        <path 
          d="M30 40 L60 35 L90 40 L90 75 L60 70 L30 75 Z" 
          fill="white" 
          stroke="#1e40af" 
          strokeWidth="1.5"
        />
        
        {/* Páginas del libro */}
        <line x1="60" y1="35" x2="60" y2="70" stroke="#1e40af" strokeWidth="1"/>
        <line x1="35" y1="45" x2="55" y2="43" stroke="#3b82f6" strokeWidth="0.8"/>
        <line x1="35" y1="50" x2="55" y2="48" stroke="#3b82f6" strokeWidth="0.8"/>
        <line x1="35" y1="55" x2="55" y2="53" stroke="#3b82f6" strokeWidth="0.8"/>
        <line x1="65" y1="43" x2="85" y2="45" stroke="#3b82f6" strokeWidth="0.8"/>
        <line x1="65" y1="48" x2="85" y2="50" stroke="#3b82f6" strokeWidth="0.8"/>
        <line x1="65" y1="53" x2="85" y2="55" stroke="#3b82f6" strokeWidth="0.8"/>
        
        {/* Texto IUSH */}
        <text x="60" y="90" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial">IUSH</text>
        <text x="60" y="105" textAnchor="middle" fill="#e0e7ff" fontSize="8" fontFamily="Arial">Universidad</text>
        
        {/* Gradiente */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6"/>
            <stop offset="50%" stopColor="#1e40af"/>
            <stop offset="100%" stopColor="#1e3a8a"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Información de la universidad */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        {/* Formas decorativas de fondo */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <IUSHLogo />
          
          <h1 className="text-4xl font-bold text-center mb-6">
            Sistema de Gestión de Parqueaderos
          </h1>
          
          <p className="text-xl text-blue-100 text-center mb-8 leading-relaxed">
            Institución Universitaria Salazar y Herrera
          </p>
          
          <div className="grid grid-cols-1 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl mb-2">🚗</div>
              <h3 className="font-semibold mb-1">Control Total</h3>
              <p className="text-sm text-blue-100">Gestiona todos los espacios de parqueo</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold mb-1">Fácil de Usar</h3>
              <p className="text-sm text-blue-100">Interface intuitiva y moderna</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl mb-2">🔐</div>
              <h3 className="font-semibold mb-1">Seguro</h3>
              <p className="text-sm text-blue-100">Autenticación y roles protegidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario de login */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo móvil */}
          <div className="lg:hidden text-center">
            <div className="mx-auto w-20 h-20 mb-4">
              <IUSHLogo />
            </div>
          </div>
          
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Bienvenido de vuelta!
            </h2>
            <p className="text-gray-600">
              Inicia sesión en tu cuenta
            </p>
          </div>

          {/* Botón para mostrar cuentas de prueba */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowTestAccounts(!showTestAccounts)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showTestAccounts ? '🔼' : '🔽'} Cuentas de Prueba
            </button>
          </div>

          {/* Cuentas de prueba colapsables */}
          {showTestAccounts && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
              <p className="text-sm font-semibold text-blue-800 mb-3 text-center">🧪 Cuentas Demo</p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleTestLogin('admin@parking.com', 'admin123')}
                  disabled={isLoading}
                  className="w-full text-left bg-gradient-to-r from-red-100 to-red-50 text-red-800 px-4 py-3 rounded-lg hover:from-red-200 hover:to-red-100 transition-all duration-200 border border-red-200 disabled:opacity-50"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">👑</span>
                    <div>
                      <div className="font-semibold text-sm">Administrador</div>
                      <div className="text-xs opacity-75">admin@parking.com</div>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleTestLogin('maria.rodriguez@email.com', 'maria123')}
                  disabled={isLoading}
                  className="w-full text-left bg-gradient-to-r from-green-100 to-green-50 text-green-800 px-4 py-3 rounded-lg hover:from-green-200 hover:to-green-100 transition-all duration-200 border border-green-200 disabled:opacity-50"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">👤</span>
                    <div>
                      <div className="font-semibold text-sm">Usuario</div>
                      <div className="text-xs opacity-75">maria.rodriguez@email.com</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Formulario */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg relative flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="tu-email@iush.edu.co"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>Iniciar Sesión</span>
                    <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                )}
              </button>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => window.location.href = '/register'}
                    className="font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    Regístrate aquí
                  </button>
                </p>
              </div>
            </form>
          </div>
          
          {/* Footer */}
          <div className="text-center text-xs text-gray-500 mt-8">
            <p>© 2024 IUSH - Sistema de Gestión de Parqueaderos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;