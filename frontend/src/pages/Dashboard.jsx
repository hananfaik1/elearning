import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { BookOpen, Users, Sparkles, TrendingUp } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate  = useNavigate();
    const [stats, setStats]   = useState({ courses: 0, enrolled: 0 });
    const [recent, setRecent] = useState([]);

    useEffect(() => {
        if (user?.role === 'PROF') {
            api.get('/api/courses/my').then(r => {
                setStats({ courses: r.data.length });
                setRecent(r.data.slice(0, 3));
            });
        } else {
            api.get('/api/enrollments/my').then(r => {
                setStats({ enrolled: r.data.length });
                setRecent(r.data.slice(0, 3));
            });
        }
    }, []);

    const statCards = user?.role === 'PROF'
        ? [
            { icon: <BookOpen size={22}/>, label: 'Mes cours', value: stats.courses,  color: '#f59e0b' },
            { icon: <Sparkles  size={22}/>, label: 'Générer cours', value: '→',       color: '#8b5cf6', action: () => navigate('/generate-ai') },
            { icon: <Users     size={22}/>, label: 'Créer cours',   value: '+',       color: '#10b981', action: () => navigate('/create-course') },
        ]
        : [
            { icon: <BookOpen   size={22}/>, label: 'Mes cours',     value: stats.enrolled, color: '#3b82f6' },
            { icon: <TrendingUp size={22}/>, label: 'Voir catalogue', value: '→',            color: '#10b981', action: () => navigate('/catalogue') },
        ];

    return (
        <div className="page">
            <Navbar/>
            <div style={s.container}>
                <div style={s.header} className="fadeUp">
                    <h1 style={s.welcome}>
                        Bonjour, <span style={s.name}>{user?.email?.split('@')[0]}</span> 👋
                    </h1>
                    <p style={s.sub}>
                        {user?.role === 'PROF'
                            ? 'Gérez vos cours et créez du contenu avec l\'IA'
                            : 'Continuez votre apprentissage'}
                    </p>
                </div>

                <div style={s.statsGrid}>
                    {statCards.map((card, i) => (
                        <div key={i}
                             style={{ ...s.statCard, animationDelay: `${i * 0.1}s`,
                                 cursor: card.action ? 'pointer' : 'default' }}
                             className="fadeUp"
                             onClick={card.action}>
                            <div style={{ ...s.statIcon, background: card.color + '20',
                                color: card.color }}>
                                {card.icon}
                            </div>
                            <div>
                                <div style={s.statValue}>{card.value}</div>
                                <div style={s.statLabel}>{card.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={s.section}>
                    <h2 style={s.sectionTitle}>
                        {user?.role === 'PROF' ? 'Derniers cours créés' : 'Cours en cours'}
                    </h2>
                    {recent.length === 0
                        ? <p style={s.empty}>Aucun contenu pour le moment</p>
                        : (
                            <div style={s.recentGrid}>
                                {recent.map((item, i) => (

                                    <div key={i} style={s.recentCard} className="fadeUp"
                                         style={{ ...s.recentCard, animationDelay: `${i * 0.1}s` }} onClick={() => navigate(`/courses/${item.courseId || item.id}`)}>
                                        <h3 style={s.recentTitle}>
                                            {item.title || item.courseTitle}
                                        </h3>
                                        <div style={s.recentMeta}>
                                            <span style={s.recentCategory}>{item.category}</span>
                                            <span style={{
                                                ...s.statusBadge,
                                                background: item.status === 'PUBLISHED' || item.status === 'IN_PROGRESS'
                                                    ? 'rgba(16,185,129,.12)' : 'rgba(245,158,11,.12)',
                                                color: item.status === 'PUBLISHED' || item.status === 'IN_PROGRESS'
                                                    ? '#10b981' : '#f59e0b',
                                            }}>
                        {item.status}
                      </span>
                                        </div>
                                        {item.progressPercent !== undefined && (
                                            <div style={s.progressWrap}>
                                                <div style={s.progressBar}>
                                                    <div style={{ ...s.progressFill,
                                                        width: `${item.progressPercent}%` }}/>
                                                </div>
                                                <span style={s.progressTxt}>{item.progressPercent}%</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}

const s = {
    container: { padding: '32px', maxWidth: '1100px', margin: '0 auto' },
    header: { marginBottom: '32px' },
    welcome: { fontFamily: 'Syne', fontSize: '32px', fontWeight: 800,
        color: '#f1f5f9', marginBottom: '8px' },
    name: { color: '#f59e0b' },
    sub: { fontSize: '15px', color: '#94a3b8' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px', marginBottom: '40px' },
    statCard: { background: '#0d1117', border: '1px solid #1f2937',
        borderRadius: '14px', padding: '22px',
        display: 'flex', alignItems: 'center', gap: '16px',
        transition: 'all .2s', animation: 'fadeUp .4s ease both' },
    statIcon: { width: '48px', height: '48px', borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center' },
    statValue: { fontFamily: 'Syne', fontSize: '28px',
        fontWeight: 800, color: '#f1f5f9' },
    statLabel: { fontSize: '13px', color: '#94a3b8', marginTop: '2px' },
    section: {},
    sectionTitle: { fontFamily: 'Syne', fontSize: '20px', fontWeight: 700,
        color: '#f1f5f9', marginBottom: '16px' },
    empty: { color: '#475569', fontSize: '14px', padding: '40px',
        textAlign: 'center', border: '1px dashed #1f2937', borderRadius: '12px' },
    recentGrid: { display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
    recentCard: { background: '#0d1117', border: '1px solid #1f2937',
        borderRadius: '12px', padding: '20px',
        animation: 'fadeUp .4s ease both' },
    recentTitle: { fontFamily: 'Syne', fontSize: '15px',
        fontWeight: 700, color: '#f1f5f9', marginBottom: '10px' },
    recentMeta: { display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '10px' },
    recentCategory: { fontSize: '11px', color: '#94a3b8',
        textTransform: 'uppercase', letterSpacing: '1px' },
    statusBadge: { padding: '3px 10px', borderRadius: '20px',
        fontSize: '11px', fontWeight: 700 },
    progressWrap: { display: 'flex', alignItems: 'center', gap: '8px' },
    progressBar: { flex: 1, background: '#1f2937', borderRadius: '4px', height: '4px' },
    progressFill: { background: '#f59e0b', height: '4px',
        borderRadius: '4px', transition: 'width .3s' },
    progressTxt: { fontSize: '12px', color: '#f59e0b', fontWeight: 600 },
};