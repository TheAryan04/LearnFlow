import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from '../redux/slices/authSlice';
import { ROLES } from '../utils/constants';
import { setAuthToken, setClerkTokenGetter } from '../utils/api';
import { disconnectSocket } from '../utils/socket';

// Clerk sign-out is handled by <UserButton />; this ends demo sessions.
export function useAuthRole() {
  const dispatch = useDispatch();
  const { user, role, isAuthenticated, token, mode } = useSelector((state) => state.auth);

  const handleLogout = () => {
    setAuthToken(null);
    setClerkTokenGetter(null);
    disconnectSocket();
    dispatch(logoutAction());
  };

  return {
    user,
    role,
    token,
    mode,
    isAuthenticated,
    isStudent: role === ROLES.STUDENT,
    isInstructor: role === ROLES.INSTRUCTOR,
    isAdmin: role === ROLES.ADMIN,
    logout: handleLogout,
  };
}
