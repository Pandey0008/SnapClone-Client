import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { setCredentials } from '../../redux/slices/authSlice';
import Button from '../../components/common/Button';
import ErrorBanner from '../../components/common/ErrorBanner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store credentials in Redux
        dispatch(setCredentials({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: null
        }));
        navigate('/camera');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-snap-dark flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-24 h-24 bg-snap-yellow rounded-3xl flex items-center justify-center text-6xl mb-4 shadow-xl">
            👻
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white">SnapClone</h1>
        </div>

        <div className="bg-snap-darkMid/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">
          <h2 className="text-2xl font-semibold text-center mb-8 text-white">
            Log in to SnapClone
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-snap-dark border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-snap-white50 focus:outline-none focus:border-snap-yellow text-lg"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-snap-dark border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-snap-white50 focus:outline-none focus:border-snap-yellow text-lg"
              required
            />

            <Button
              label={loading ? "Logging in..." : "Log In"}
              onPress={() => {}}
              variant="primary"
              loading={loading}
            />
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-snap-white50 text-sm uppercase tracking-widest">OR</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Google Button */}
          <button
            onClick={() => alert("Google Login - Coming Soon")}
            className="w-full bg-white text-black py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 transition"
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="w-5 h-5" 
            />
            Continue with Google
          </button>

          <p className="text-center mt-8 text-snap-white50">
            Don't have an account?{' '}
            <span
              onClick={() => navigate('/register')}
              className="text-snap-yellow font-semibold cursor-pointer hover:underline"
            >
              Sign up
            </span>
          </p>
        </div>

        <p className="text-center text-xs text-snap-white50 mt-8 px-6">
          By logging in, you agree to our Terms and Privacy Policy
        </p>
      </div>

      {error && <ErrorBanner message={error} />}
    </div>
  );
};

export default Login;