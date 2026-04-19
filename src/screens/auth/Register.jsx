import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { API_BASE_URL } from '../../config/api';
import { setCredentials } from '../../redux/slices/authSlice';
import Button from '../../components/common/Button';
import ErrorBanner from '../../components/common/ErrorBanner';

const Register = () => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: formData.displayName,
          email: formData.email,
          password: formData.password,
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
        setError(data.error || 'Registration failed');
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
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-snap-yellow rounded-2xl flex items-center justify-center text-4xl">
              👻
            </div>
            <h1 className="text-5xl font-bold tracking-tighter">SnapClone</h1>
          </div>
        </div>

        <div className="bg-snap-darkMid rounded-3xl p-8">
          <h2 className="text-2xl font-semibold text-center mb-8">Create Account</h2>

          <form onSubmit={handleRegister} className="space-y-5">
            <input
              type="text"
              name="displayName"
              placeholder="Display Name"
              value={formData.displayName}
              onChange={handleChange}
              className="w-full bg-snap-dark border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-snap-yellow"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-snap-dark border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-snap-yellow"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-snap-dark border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-snap-yellow"
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-snap-dark border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-snap-yellow"
              required
            />

            <Button
              label={loading ? "Creating Account..." : "Create Account"}
              onPress={() => {}}
              variant="primary"
              loading={loading}
            />
          </form>

          <p className="text-center mt-8 text-snap-white50">
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-snap-yellow font-semibold cursor-pointer hover:underline"
            >
              Log in
            </span>
          </p>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}
    </div>
  );
};

export default Register;