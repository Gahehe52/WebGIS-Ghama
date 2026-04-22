import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(nama, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Terjadi kesalahan pada server');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f9' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: '#7b8cb6', marginBottom: '1.5rem', fontSize: '1.8rem' }}>
          {isLogin ? 'Login WebGIS' : 'Register WebGIS'}
        </h2>
        {error && <div style={{ color: '#e74c3c', marginBottom: '1rem', textAlign: 'center', padding: '0.5rem', background: '#fadbd8', borderRadius: '4px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {!isLogin && (
            <input type="text" placeholder="Nama Lengkap" value={nama} onChange={(e) => setNama(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' }} />
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' }} />
          <button type="submit" style={{ padding: '0.8rem', backgroundColor: '#7b8cb6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>
            {isLogin ? 'Masuk' : 'Daftar'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', cursor: 'pointer', color: '#7b8cb6', textDecoration: 'underline' }} onClick={() => { setIsLogin(!isLogin); setError(''); }}>
          {isLogin ? 'Belum punya akun? Daftar di sini' : 'Sudah punya akun? Login di sini'}
        </p>
      </div>
    </div>
  );
}