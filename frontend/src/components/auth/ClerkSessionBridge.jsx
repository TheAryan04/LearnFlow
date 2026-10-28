import { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/react';
import { useDispatch, useSelector } from 'react-redux';
import api, { setClerkTokenGetter } from '../../utils/api';
import { connectSocket, disconnectSocket } from '../../utils/socket';
import { setCredentials, logout } from '../../redux/slices/authSlice';
import { SIGNUP_ROLE_KEY } from '../../utils/clerk';
import { useToast } from '../common/Toast';

// Keeps the Redux session in step with the Clerk session.
export default function ClerkSessionBridge() {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const dispatch = useDispatch();
  const toast = useToast();
  const mode = useSelector((s) => s.auth.mode);
  const syncedFor = useRef(null);
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setClerkTokenGetter(null);
      syncedFor.current = null;
      if (mode === 'clerk') {
        dispatch(logout());
        disconnectSocket();
      }
      return;
    }
    setClerkTokenGetter(() => getToken());
    if (!clerkUser || syncedFor.current === userId) return;
    syncedFor.current = userId;
    const role = sessionStorage.getItem(SIGNUP_ROLE_KEY) || clerkUser.unsafeMetadata?.role;
    api
      .post('/auth/sync', {
        role,
        name: clerkUser.fullName || clerkUser.username,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        avatar: clerkUser.imageUrl,
      })
      .then((res) => {
        sessionStorage.removeItem(SIGNUP_ROLE_KEY);
        localStorage.removeItem('learnflow_token');
        dispatch(setCredentials({ user: res.data.user, mode: 'clerk' }));
        connectSocket();
      })
      .catch((err) => {
        syncedFor.current = null;
        toastRef.current.error(err.message);
      });
  }, [isLoaded, isSignedIn, userId, clerkUser, getToken, dispatch, mode]);

  return null;
}
