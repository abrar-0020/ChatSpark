import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/channels/@me', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(email, password);
      // Navigation will happen automatically via useEffect when isAuthenticated changes
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex items-center justify-center p-4 md:p-8 overflow-hidden relative">
      {/* Ambient Background Glow Effect directly injected */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(255, 101, 0, 0.05) 0%, rgba(9, 19, 36, 0) 70%)' }}></div>
      
      <main className="w-full max-w-[440px] relative z-10">
        <div className="bg-surface-container rounded-xl border border-surface-variant p-8 md:p-10 relative overflow-hidden">
          {/* Subtle Top Accent Glow on Card */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-50"></div>
          
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="w-12 h-12 bg-surface-container-high rounded-xl flex items-center justify-center border border-surface-variant mb-4 relative group cursor-default">
              <div className="absolute inset-0 bg-primary-container rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              {/* Using lucide-react eye as placeholder for logo since we can't reliably load material symbols without touching index.html, using SVG from old login instead */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary-container relative z-10 w-7 h-7">
                <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="font-bold text-3xl text-primary-container mb-2 tracking-tight">ChatSpark</h1>
            <p className="text-on-surface-variant opacity-80">Ignite your workspace collaboration.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface block" htmlFor="email">Email Address</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-background border border-surface-variant text-on-surface rounded-lg px-4 py-3 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all duration-200 placeholder-on-surface-variant/30 shadow-sm"
                  autoComplete="email"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-on-surface block" htmlFor="password">Password</label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-background border border-surface-variant text-on-surface rounded-lg px-4 py-3 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all duration-200 placeholder-on-surface-variant/30 shadow-sm"
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-70 hover:opacity-100 transition-opacity"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-danger text-sm bg-danger/10 p-3 rounded-lg border border-danger/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-container hover:brightness-110 text-white font-semibold text-sm py-3.5 px-4 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(255,101,0,0.15)] hover:shadow-[0_0_25px_rgba(255,101,0,0.3)] active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Logging in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-on-surface-variant">
            <p>
              Don't have an account? <Link to="/register" className="text-primary-container font-semibold hover:underline transition-all">Sign up</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
