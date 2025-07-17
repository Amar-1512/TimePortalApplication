import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
 
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
 
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
 
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
 
    setLoading(true);
    setError('');
 
    try {
      const user = await login(email, password);
      if (user) {
        navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        margin: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'rgb(251, 251, 237)',
        padding: 20,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          backgroundColor: '#dcdad2',
          padding: '30px 40px',
          borderRadius: 10,
          boxShadow: '5px 5px 10px 0px rgb(33, 32, 32)',
          width: '100%',
          maxWidth: 400,
          textAlign: 'left',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <img
          src="https://adroit-associates.com/wp-content/uploads/2024/04/adroit-png.png"
          alt="adroit logo"
          style={{ width: 175, height: 'auto', marginBottom: 20 }}
        />
        <h1 style={{ color: 'black', fontSize: 28, marginBottom: 25, fontWeight: 'bold', marginTop: 0 }}>
          Time Entry Portal
        </h1>
 
        {error && (
          <div
            style={{
              backgroundColor: '#ffe6e6',
              borderLeft: '4px solid red',
              padding: '10px',
              marginBottom: 15,
              color: 'red',
            }}
          >
            {error}
          </div>
        )}
 
        <form id="login-form" onSubmit={handleSubmit}>
          <div style={{ marginBottom: 15, width: '100%' }}>
            <label htmlFor="email" style={{ color: 'black', display: 'block', marginBottom: 5 }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: 8,
                border: '1px solid #ccc',
                borderRadius: 3,
                boxSizing: 'border-box',
                fontSize: 16,
              }}
            />
          </div>
 
          <div style={{ marginBottom: 15, width: '100%' }}>
            <label htmlFor="password" style={{ color: 'black', display: 'block', marginBottom: 5 }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: 8,
                border: '1px solid #ccc',
                borderRadius: 3,
                boxSizing: 'border-box',
                fontSize: 16,
              }}
            />
          </div>
 
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: 'red',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: 3,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 16,
              width: '100%',
              boxSizing: 'border-box',
              marginTop: 10,
              textAlign: 'center',
              textDecoration: 'none',
              display: 'inline-block',
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};
 
export default Login;
 
 