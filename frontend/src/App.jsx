import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home             from './pages/Home'
import Login            from './pages/Login'
import AdminDashboard   from './pages/admin/AdminDashboard'
import AdminUsers       from './pages/admin/AdminUsers'
import OfficerDashboard from './pages/officer/OfficerDashboard'
import OfficerCamera    from './pages/officer/OfficerCamera'
import CitizenDashboard from './pages/citizen/CitizenDashboard'
import CitizenReport    from './pages/citizen/CitizenReport'
import MissingPersons   from './pages/MissingPersons'
import AddPerson        from './pages/AddPerson'
import Alerts           from './pages/Alerts'
import LostItems        from './pages/LostItems'
import AdminSidebar     from './components/AdminSidebar'
import OfficerSidebar   from './components/OfficerSidebar'
import CitizenSidebar   from './components/CitizenSidebar'
import Profile from './pages/Profile'
import MapView from './pages/MapView'
import TrackCase from './pages/citizen/TrackCase'
import PhotoSearch from './pages/PhotoSearch'

function ProtectedLayout({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  const Sidebar =
    user.role === 'admin'   ? AdminSidebar :
    user.role === 'officer' ? OfficerSidebar :
                              CitizenSidebar

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  )
}

function RoleGuard({ allowed, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!allowed.includes(user.role)) {
    // Redirect to their own dashboard
    const home =
      user.role === 'admin'   ? '/dashboard' :
      user.role === 'officer' ? '/officer'   : '/citizen'
    return <Navigate to={home} replace />
  }
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/"      element={<Home />}  />
          <Route path="/login" element={<Login />} />

          {/* Admin routes */}
          <Route path="/dashboard" element={
            <ProtectedLayout>
              <RoleGuard allowed={['admin']}>
                <AdminDashboard />
              </RoleGuard>
            </ProtectedLayout>
          } />
          <Route path="/admin/users" element={
            <ProtectedLayout>
              <RoleGuard allowed={['admin']}>
                <AdminUsers />
              </RoleGuard>
            </ProtectedLayout>
          } />

          {/* Officer routes */}
          <Route path="/officer" element={
            <ProtectedLayout>
              <RoleGuard allowed={['admin','officer']}>
                <OfficerDashboard />
              </RoleGuard>
            </ProtectedLayout>
          } />
          <Route path="/officer/camera" element={
            <ProtectedLayout>
              <RoleGuard allowed={['admin','officer']}>
                <OfficerCamera />
              </RoleGuard>
            </ProtectedLayout>
          } />

          {/* Shared routes */}
          <Route path="/persons" element={
            <ProtectedLayout>
              <RoleGuard allowed={['admin','officer']}>
                <MissingPersons />
              </RoleGuard>
            </ProtectedLayout>
          } />
          <Route path="/persons/add" element={
            <ProtectedLayout>
              <RoleGuard allowed={['admin','officer']}>
                <AddPerson />
              </RoleGuard>
            </ProtectedLayout>
          } />
          <Route path="/alerts" element={
            <ProtectedLayout>
              <RoleGuard allowed={['admin','officer']}>
                <Alerts />
              </RoleGuard>
            </ProtectedLayout>
          } />
          <Route path="/items" element={
            <ProtectedLayout>
              <RoleGuard allowed={['admin','officer','citizen']}>
                <LostItems />
              </RoleGuard>
            </ProtectedLayout>
          } />
          <Route path="/profile" element={
            <ProtectedLayout>
              <Profile />
            </ProtectedLayout>
          } />

          <Route path="/map" element={
            <ProtectedLayout>
              <RoleGuard allowed={['admin', 'officer']}>
                <MapView />
              </RoleGuard>
            </ProtectedLayout>
          } />

          {/* Citizen routes */}
          <Route path="/citizen" element={
            <ProtectedLayout>
              <RoleGuard allowed={['citizen']}>
                <CitizenDashboard />
              </RoleGuard>
            </ProtectedLayout>
          } />
          <Route path="/citizen/report" element={
            <ProtectedLayout>
              <RoleGuard allowed={['citizen']}>
                <CitizenReport />
              </RoleGuard>
            </ProtectedLayout>
          } />

          <Route path="/citizen/track" element={
            <ProtectedLayout>
              <RoleGuard allowed={['citizen']}>
                <TrackCase />
              </RoleGuard>
            </ProtectedLayout>
          } />

          <Route path="/search" element={
            <ProtectedLayout>
              <RoleGuard allowed={['admin', 'officer']}>
                <PhotoSearch />
              </RoleGuard>
            </ProtectedLayout>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App