import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ClerkProvider } from '@clerk/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) {
  root.render(<main className="min-h-screen grid place-items-center bg-gray-50 p-6"><p className="max-w-lg rounded-xl bg-white p-8 text-gray-700 shadow">Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> for the client and configure the server Clerk secret and Neon URL before signing in.</p></main>);
} else {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={publishableKey}>
        <BrowserRouter>
          <AuthProvider><App /><Toaster position="top-right" /></AuthProvider>
        </BrowserRouter>
      </ClerkProvider>
    </React.StrictMode>,
  );
}
