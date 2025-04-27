import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';

const Navigation: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-primary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 text-xl font-bold">
              Education Order
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600"
                >
                  Home
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      to="/subjects"
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600"
                    >
                      Subjects
                    </Link>
                    {user?.user_type === 'student' ? (
                      <>
                        <Link
                          to="/educators"
                          className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600"
                        >
                          Find Educators
                        </Link>
                        <Link
                          to="/sessions"
                          className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600"
                        >
                          My Sessions
                        </Link>
                      </>
                    ) : user?.user_type === 'educator' ? (
                      <>
                        <Link
                          to="/sessions"
                          className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600"
                        >
                          My Teaching Sessions
                        </Link>
                        <Link
                          to="/payments"
                          className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600"
                        >
                          Earnings
                        </Link>
                      </>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isAuthenticated ? (
                <div className="flex items-center">
                  <Link
                    to="/profile"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="ml-4 px-3 py-2 rounded-md text-sm font-medium bg-primary-600 hover:bg-primary-500"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-2 rounded-md text-sm font-medium bg-primary-600 hover:bg-primary-500"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;