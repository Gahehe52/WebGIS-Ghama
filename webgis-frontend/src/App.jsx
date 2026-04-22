import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MapView from './components/MapView';
import Login from './components/Login';
import './App.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AppContent() {
  const { logout, user } = useAuth();
  return (
    <div className="app">
      {user && (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 2rem', backgroundColor: '#7b8cb6', color: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 1000 }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>WebGIS Transportasi Bandar Lampung</h1>
          <button onClick={logout} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout
          </button>
        </header>
      )}
      <main style={{ flex: 1, position: 'relative' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MapView />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;