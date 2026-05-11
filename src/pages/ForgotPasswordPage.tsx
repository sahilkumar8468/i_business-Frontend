import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { ArrowLeft, Mail } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  return (
    <AuthLayout 
      title="Reset password" 
      subtitle="Enter your email to receive reset instructions"
    >
      <form className="space-y-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
            <Mail size={20} />
          </div>
          <input
            type="email"
            placeholder="Email address"
            className="input-field pl-11"
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full">
          Send Reset Link
        </button>

        <div className="text-center mt-6">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
