import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";

const Header = ({ logoPath }) => {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };

  return (
    <header className="bg-gradient-to-r from-[#00386D] to-[#003d75] shadow-xl border-b-4 border-[#780D80]">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center gap-6">
            <img 
              src={logoPath} 
              alt="Logo IUSH" 
              className="h-16 md:h-20 w-auto bg-white p-2 rounded-lg shadow-md"
            />
            <div className="text-white">
              <h1 className="text-2xl md:text-3xl font-bold">
                Sistema de Parqueadero
              </h1>
              <p className="text-sm md:text-base text-blue-100 mt-1">
                Institución Universitaria Salazar y Herrera
              </p>
            </div>
          </div>

          {/* Información del usuario */}
          <div className="flex items-center gap-4">
            {/* Indicador de tiempo real */}
            <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-semibold">En línea</span>
            </div>

            {/* Información del usuario */}
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right text-white">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-blue-100">
                    {isAdmin() ? '👑 Administrador' : '👤 Usuario'}
                  </p>
                </div>
                
                {/* Avatar */}
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Menú de usuario */}
                <div className="relative">
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-red-200 transition-colors p-2 rounded-lg hover:bg-white/10"
                    title="Cerrar sesión"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  logoPath: PropTypes.string.isRequired,
};

export default Header;
