import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import ScannerPage from '../features/scanner/pages/ScannerPage';

// Define las rutas públicas y privadas
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/scanner',
    element: <ScannerPage />,
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  }
]);

export default router;
