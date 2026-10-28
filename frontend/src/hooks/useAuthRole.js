import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction } from '../redux/slices/authSlice';
import { ROLES } from '../utils/constants';
import { setAuthToken } from '../utils/api';
import { setSocketToken } from '../utils/socket';

export function useAuthRole() {
  const dispatch = useDispatch();
  const { user, role, isAuthenticated, token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    setAuthToken(null);
    setSocketToken(null);
    dispatch(logoutAction());
  };

  return {
    user,
    role,
    token,
    isAuthenticated,
    isStudent: role === ROLES.STUDENT,
    isInstructor: role === ROLES.INSTRUCTOR,
    isAdmin: role === ROLES.ADMIN,
    logout: handleLogout,
  };
}
