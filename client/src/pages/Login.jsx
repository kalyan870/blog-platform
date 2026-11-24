import { SignIn } from '@clerk/react';

export default function Login() {
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4 py-20"><SignIn routing="hash" signUpUrl="/register" /></div>;
}
