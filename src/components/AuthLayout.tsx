import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 md:p-6">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Branding */}
        <div className="w-full md:w-[40%] bg-white p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-bold text-2xl">i</span>
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">
              business
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
            Welcome to <br />
            <span className="text-primary">i business</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Secure access to all your business tools and apps in one professional workspace.
          </p>
          
          <div className="mt-12 hidden md:block">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-slate-600 text-sm font-medium">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Trusted by 10k+ businesses
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-[60%] p-8 md:p-16 flex flex-col justify-center bg-slate-50/30">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
            <p className="text-slate-500 mb-8">{subtitle}</p>
            
            {children}
            
            <div className="mt-12 pt-8 border-t border-slate-200/60">
              <p className="text-slate-400 text-sm">
                Not your computer? Use incognito mode to sign in privately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
