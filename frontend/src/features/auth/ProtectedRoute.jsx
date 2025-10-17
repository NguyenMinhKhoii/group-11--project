import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { setAuthFromStorage } from './authSlice';
import { isAuthenticated } from '../../utils/tokenHelper';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  
  const { 
    isAuthenticated: isAuthenticatedState, 
    sessionChecked,
    isRefreshing 
  } = useSelector((state) => state.auth);

  useEffect(() => {
    // Kiểm tra auth từ localStorage khi component mount
    if (!sessionChecked) {
      dispatch(setAuthFromStorage());
    }
  }, [dispatch, sessionChecked]);

  // Chờ session check hoàn tất
  if (!sessionChecked || isRefreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-lg">Đang kiểm tra phiên đăng nhập...</span>
      </div>
    );
  }

  // Kiểm tra từ localStorage và Redux state
  const isUserAuthenticated = isAuthenticatedState || isAuthenticated();

  if (!isUserAuthenticated) {
    // Redirect về login với return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
