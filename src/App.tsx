//App.tsx
import React from 'react';

import { AuthProvider } from './hooks/useAuth';
import AppRoutes from './routes/AppRoutes';

// App principal con Provider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;