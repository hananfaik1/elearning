import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
    const [form, setForm]   = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate  = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await api.post('/api/auth/login', form);
            login(res.data);
            navigate('/dashboard');
        } catch {
            setError('Email ou mot de passe incorrect');
        } finally { setLoading(false); }
    };

    return (
        <div style={s.page}>
            <div style={s.card} className="fadeUp">
                <div style={s.logoWrap}>
                    <div style={s.logo}>⚡</div>
                    <h1 style={s.brand}>LearnForge</h1>
                </div>
                <h2 style={s.title}>Connexion</h2>
                <p style={s.sub}>Heureux de vous revoir 👋</p>

                {error && <div style={s.error}>{error}</div>}

                <form onSubmit={handleSubmit} style={s.form}>
                    <div style={s.field}>
                        <label style={s.label}>Email</label>
                        <input style={s.input} type="email" placeholder="vous@exemple.com"
                               value={form.email}
                               onChange={e => setForm({...form, email: e.target.value})} required/>
                    </div>
                    <div style={s.field}>
                        <label style={s.label}>Mot de passe</label>
                        <input style={s.input} type="password" placeholder="••••••••"
                               value={form.password}
                               onChange={e => setForm({...form, password: e.target.value})} required/>
                    </div>
                    <button style={s.btn} type="submit" disabled={loading}>
                        {loading ? <span className="spin" style={{display:'inline-block'}}>⏳</span>
                            : 'Se connecter →'}
                    </button>
                </form>

                <p style={s.footer}>
                    Pas de compte ?{' '}
                    <Link to="/register" style={s.link}>S'inscrire</Link>
                </p>
            </div>
        </div>
    );
}

const s = {
    page: { minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '20px' },
    card: { background: '#0d1117', border: '1px solid #1f2937',
        borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px' },
    logoWrap: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' },
    logo: { width: '36px', height: '36px', background: '#f59e0b',
        borderRadius: '9px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '18px' },
    brand: { fontFamily: 'Syne', fontSize: '20px', fontWeight: 800, color: '#f1f5f9' },
    title: { fontFamily: 'Syne', fontSize: '26px', fontWeight: 800,
        color: '#f1f5f9', marginBottom: '6px' },
    sub: { fontSize: '14px', color: '#94a3b8', marginBottom: '28px' },
    error: { background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
        color: '#ef4444', padding: '12px', borderRadius: '8px',
        fontSize: '13px', marginBottom: '16px' },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: 600, color: '#94a3b8' },
    input: { padding: '12px 14px', background: '#111827',
        border: '1px solid #374151', borderRadius: '8px',
        color: '#f1f5f9', fontSize: '14px', outline: 'none' },
    btn: { padding: '13px', background: '#f59e0b', color: '#000',
        border: 'none', borderRadius: '9px', fontSize: '15px',
        fontWeight: 700, cursor: 'pointer', marginTop: '4px' },
    footer: { textAlign: 'center', marginTop: '20px',
        fontSize: '13px', color: '#94a3b8' },
    link: { color: '#f59e0b', fontWeight: 600, textDecoration: 'none' },
};