import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserAuthProvider } from './context/UserAuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import UserLogin from './pages/UserLogin';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <UserAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* User-facing auth */}
            <Route path="/user-login" element={<UserLogin />} />
            {/* Admin login — hidden from navbar, access directly by URL */}
            <Route path="/login" element={<Login />} />
            {/* Protected admin dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </UserAuthProvider>
    </AuthProvider>
  );
}

export default App;

