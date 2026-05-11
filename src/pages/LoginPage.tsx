import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { ArrowRight, User, Lock, Loader2 } from 'lucide-react';
import { authService } from '../services/api';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // For testing RBAC, we'll use the Admin Login
      // In a real app, you'd switch between Firebase and Custom Admin login
      await authService.adminLogin({ username, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Sign in" 
      subtitle="using your i business account"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
            <User size={20} />
          </div>
          <input
            type="text"
            placeholder="Username or Email"
            className="input-field pl-11"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
            <Lock size={20} />
          </div>
          <input
            type="password"
            placeholder="Password"
            className="input-field pl-11"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              Continue
              <ArrowRight size={18} />
            </>
          )}
        </button>


        <div className="flex items-center justify-between mt-6">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
          </label>
          <Link 
            to="/forgot-password" 
            className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
