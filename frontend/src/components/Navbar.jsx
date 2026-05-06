import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen, LayoutDashboard, PlusCircle, Sparkles, Library } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => { logout(); navigate('/login'); };

    const navLinks = user?.role === 'PROF'
        ? [
            { to: '/dashboard',     icon: <LayoutDashboard size={16}/>, label: 'Dashboard' },
            { to: '/mes-cours',     icon: <BookOpen size={16}/>,        label: 'Mes Cours' },
            { to: '/create-course', icon: <PlusCircle size={16}/>,      label: 'Créer' },
            { to: '/generate-ai',   icon: <Sparkles size={16}/>,        label: 'IA' },
        ]
        : [
            { to: '/dashboard',  icon: <LayoutDashboard size={16}/>, label: 'Dashboard' },
            { to: '/catalogue',  icon: <Library size={16}/>,         label: 'Catalogue' },
            { to: '/mes-cours',  icon: <BookOpen size={16}/>,        label: 'Mes Cours' },
        ];

    return (
        <nav style={s.nav}>
            <Link to="/dashboard" style={s.logo}>
                <div style={s.logoMark}>⚡</div>
                <span style={s.logoText}>LearnForge</span>
            </Link>

            <div style={s.links}>
                {navLinks.map(link => (
                    <Link
                        key={link.to}
                        to={link.to}
                        style={{
                            ...s.link,
                            ...(location.pathname === link.to ? s.linkActive : {})
                        }}
                    >
                        {link.icon}
                        {link.label}
                    </Link>
                ))}
            </div>

            <div style={s.right}>
                <div style={s.userInfo}>
                    <span style={s.email}>{user?.email}</span>
                    <span style={{
                        ...s.roleBadge,
                        background: user?.role === 'PROF'
                            ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)',
                        color: user?.role === 'PROF' ? '#f59e0b' : '#3b82f6',
                    }}>
            {user?.role}
          </span>
                </div>
                <button style={s.logoutBtn} onClick={handleLogout}>
                    <LogOut size={16}/>
                </button>
            </div>
        </nav>
    );
}

const s = {
    nav: {
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,8,16,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1f2937',
        padding: '0 32px', height: '60px',
        display: 'flex', alignItems: 'center', gap: '32px',
    },
    logo: {
        display: 'flex', alignItems: 'center', gap: '10px',
        textDecoration: 'none', flexShrink: 0,
    },
    logoMark: {
        width: '32px', height: '32px', background: '#f59e0b',
        borderRadius: '8px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '16px',
    },
    logoText: {
        fontFamily: 'Syne', fontWeight: 800, fontSize: '18px', color: '#f1f5f9',
    },
    links: { display: 'flex', gap: '4px', flex: 1 },
    link: {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 14px', borderRadius: '8px',
        textDecoration: 'none', fontSize: '13px', fontWeight: 500,
        color: '#94a3b8', transition: 'all .2s',
    },
    linkActive: {
        background: 'rgba(245,158,11,0.1)',
        color: '#f59e0b',
    },
    right: { display: 'flex', alignItems: 'center', gap: '12px' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
    email: { fontSize: '13px', color: '#94a3b8' },
    roleBadge: {
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '11px', fontWeight: 700,
    },
    logoutBtn: {
        background: 'transparent', border: '1px solid #1f2937',
        color: '#94a3b8', padding: '8px', borderRadius: '8px',
        cursor: 'pointer', display: 'flex', alignItems: 'center',
    },
};