F = '/app/frontend/src/'

def patch(path, pairs):
    s = open(F + path).read()
    for old, new in pairs:
        if old not in s:
            print('NO MATCH', path, old[:60])
        s = s.replace(old, new, 1)
    open(F + path, 'w').write(s)

patch('components/layout/Navbar.jsx', [
    ("import NotificationBell from '../common/NotificationBell';", "import NotificationBell from '../common/NotificationBell';\nimport { UserButton } from '@clerk/react';"),
    ("  const { user, role, logout, isAuthenticated } = useAuthRole();", "  const { user, role, logout, isAuthenticated, mode } = useAuthRole();"),
    ("""          {isAuthenticated ? (
            <UserMenu""", """          {isAuthenticated && mode === 'clerk' ? (
            <div className="flex items-center gap-3 pl-1" data-testid="navbar-clerk-user">
              <span className="hidden sm:block text-right leading-tight">
                <span className="block text-sm text-ink-800 max-w-[140px] truncate">{user?.name}</span>
                <span className="block text-[10px] uppercase tracking-[0.14em] text-terra-700">{role}</span>
              </span>
              <UserButton />
            </div>
          ) : isAuthenticated ? (
            <UserMenu"""),
])
patch('App.jsx', [
    ("import SignUpPage from './pages/auth/SignUpPage';", "import SignUpPage from './pages/auth/SignUpPage';\nimport AuthContinuePage from './pages/auth/AuthContinuePage';\nimport ClerkSessionBridge from './components/auth/ClerkSessionBridge';\nimport { CLERK_ENABLED } from './utils/clerk';"),
    ("""      <Route path="/sign-up/*" element={<SignUpPage />} />""", """      <Route path="/sign-up/*" element={<SignUpPage />} />
      <Route path="/auth/continue" element={<AuthContinuePage />} />"""),
    ("""          <BrowserRouter>
            <AppRoutes />""", """          <BrowserRouter>
            {CLERK_ENABLED && <ClerkSessionBridge />}
            <AppRoutes />"""),
])
print('done')
