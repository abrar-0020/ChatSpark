import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { register, isLoading, error, clearError, isAuthenticated } = useAuthStore();
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
    setValidationError('');

    // Validation
    if (username.length < 3) {
      setValidationError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    try {
      await register(username, email, password);
      // Navigation will happen automatically via useEffect when isAuthenticated changes
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div className="bg-neutral-950 text-on-surface antialiased min-h-screen flex items-center justify-center p-4 md:p-8 overflow-hidden relative">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none z-0" style={{ background: 'radial-gradient(circle, rgba(255, 107, 53, 0.05) 0%, rgba(9, 19, 36, 0) 70%)' }}></div>

      <main className="w-full max-w-[440px] relative z-10">
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-8 md:p-10 relative overflow-hidden shadow-hard">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

          <div className="text-center mb-8 flex flex-col items-center">
            <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center border border-neutral-700 mb-4 relative group cursor-default">
              <div className="absolute inset-0 bg-primary rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary relative z-10 w-7 h-7">
                <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="font-bold text-3xl text-white mb-2 tracking-tight">Create an Account</h1>
            <p className="text-neutral-400">Join your college community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-300 block" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-neutral-500 shadow-sm"
                autoComplete="email"
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-300 block" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={32}
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-neutral-500 shadow-sm"
                autoComplete="username"
                placeholder="Choose a username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-300 block" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-neutral-500 shadow-sm pr-12"
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-300 block" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder-neutral-500 shadow-sm"
                autoComplete="new-password"
                placeholder="Re-enter your password"
              />
            </div>

            {(error || validationError) && (
              <div className="text-danger text-sm bg-danger/10 p-3 rounded-lg border border-danger/20">
                {validationError || error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-all shadow-glow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-3.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creating account...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-neutral-400 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-light font-semibold transition-colors">
              Log In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
