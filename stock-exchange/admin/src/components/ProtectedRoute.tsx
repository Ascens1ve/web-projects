import React, { useEffect } from 'react';
import { useSelector, useDispatch } from '../store/store';
import { Navigate, useLocation } from 'react-router-dom';
import { checkUserAuth } from '../store/userSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onlyAuth?: boolean;
  onlyUnAuth?: boolean;
}

export const ProtectedRoute = ({
  children,
  onlyAuth,
  onlyUnAuth,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const isAuthChecked = useSelector((state) => state.user.isAuthChecked);

  useEffect(() => {
    dispatch(checkUserAuth());
  }, []);

  if (!isAuthChecked) {
    return <div>Загрузка...</div>;
  }

  if (onlyUnAuth && user) {
    const from = location.state?.from || { pathname: '/' };
    return <Navigate replace to={from} />;
  }

  if (onlyAuth && !user) {
    return <Navigate replace to='/login' />;
  }

  return children;
};
