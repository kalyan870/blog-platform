import { SignUp } from '@clerk/react';

export default function Register() {
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4 py-10"><SignUp routing="hash" signInUrl="/login" /></div>;
}
