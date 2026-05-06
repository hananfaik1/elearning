import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Play, Pause } from 'lucide-react';

export default function MesCours() {
    const { user }   = useAuth();
    useNavigate();
    const [items, setItems]     = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        const url = user?.role === 'PROF' ? '/api/courses/my' : '/api/enrollments/my';
        api.get(url).then(r => setItems(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handlePause = async (id) => {
        await api.put(`/api/enrollments/${id}/pause`,
            { positionSec: 0, progressPercent: 25 });
        load();
    };

    const handleResume = async (id) => {
        const res = await api.put(`/api/enrollments/${id}/resume`);
        console.log(res.data);
        load();
    };

    const handlePublish = async (id) => {
        await api.post(`/api/courses/${id}/publish`);
        load();
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer ce cours ?')) return;
        await api.delete(`/api/courses/${id}`);
        load();
    };

    return (
        <div className="page">
            <Navbar/>
            <div style={s.container}>
                <h1 style={s.title} className="fadeUp">
                    {user?.role === 'PROF' ? 'Mes cours créés' : 'Mes cours inscrits'}
                </h1>

                {loading
                    ? <p style={s.loading}>Chargement...</p>
                    : items.length === 0
                        ? <p style={s.empty}>Aucun cours pour le moment</p>
                        : (
                            <div style={s.list}>
                                {items.map((item, i) => (
                                    <div key={item.id} style={s.card} className="fadeUp"
                                         style={{...s.card, animationDelay:`${i*.08}s`}}>

                                        <div style={s.cardLeft}>
                                            <span style={s.category}>{item.category}</span>
                                            <h3 style={s.cardTitle}>
                                                {item.title || item.courseTitle}
                                            </h3>
                                            <p style={s.cardDesc}>{item.description?.slice(0,80)}...</p>
                                        </div>

                                        <div style={s.cardRight}>
                      <span style={{
                          ...s.badge,
                          background: item.status === 'PUBLISHED' || item.status === 'IN_PROGRESS'
                              ? 'rgba(16,185,129,.12)' : 'rgba(245,158,11,.12)',
                          color: item.status === 'PUBLISHED' || item.status === 'IN_PROGRESS'
                              ? '#10b981' : '#f59e0b',
                      }}>
                        {item.status}
                      </span>

                                            {item.progressPercent !== undefined && (
                                                <div style={s.progressWrap}>
                                                    <div style={s.progressBar}>
                                                        <div style={{...s.progressFill,
                                                            width:`${item.progressPercent}%`}}/>
                                                    </div>
                                                    <span style={s.progressTxt}>{item.progressPercent}%</span>
                                                </div>
                                            )}

                                            <div style={s.actions}>
                                                {user?.role === 'STUDENT' && (
                                                    <>
                                                        {item.status === 'IN_PROGRESS' && (
                                                            <button style={s.btnSecondary}
                                                                    onClick={() => handlePause(item.id)}>
                                                                <Pause size={14}/> Pause
                                                            </button>
                                                        )}
                                                        {item.status === 'PAUSED' && (
                                                            <button style={s.btnPrimary}
                                                                    onClick={() => handleResume(item.id)}>
                                                                <Play size={14}/> Reprendre
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                                {user?.role === 'PROF' && (
                                                    <>
                                                        {item.status === 'DRAFT' && (
                                                            <button style={s.btnPrimary}
                                                                    onClick={() => handlePublish(item.id)}>
                                                                Publier
                                                            </button>
                                                        )}
                                                        <button style={s.btnDanger}
                                                                onClick={() => handleDelete(item.id)}>
                                                            Supprimer
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                }
            </div>
        </div>
    );
}

const s = {
    container: { padding: '32px', maxWidth: '1000px', margin: '0 auto' },
    title: { fontFamily: 'Syne', fontSize: '28px', fontWeight: 800,
        color: '#f1f5f9', marginBottom: '24px' },
    loading: { color: '#94a3b8', textAlign: 'center', padding: '60px' },
    empty: { color: '#475569', textAlign: 'center', padding: '60px',
        border: '1px dashed #1f2937', borderRadius: '12px' },
    list: { display: 'flex', flexDirection: 'column', gap: '16px' },
    card: { background: '#0d1117', border: '1px solid #1f2937',
        borderRadius: '14px', padding: '22px',
        display: 'flex', justifyContent: 'space-between',
        gap: '20px', animation: 'fadeUp .4s ease both' },
    cardLeft: { flex: 1 },
    category: { fontSize: '11px', color: '#94a3b8',
        textTransform: 'uppercase', letterSpacing: '1px' },
    cardTitle: { fontFamily: 'Syne', fontSize: '17px',
        fontWeight: 700, color: '#f1f5f9', margin: '6px 0' },
    cardDesc: { fontSize: '13px', color: '#94a3b8' },
    cardRight: { display: 'flex', flexDirection: 'column',
        gap: '12px', alignItems: 'flex-end', minWidth: '160px' },
    badge: { padding: '4px 12px', borderRadius: '20px',
        fontSize: '11px', fontWeight: 700 },
    progressWrap: { display: 'flex', alignItems: 'center',
        gap: '8px', width: '100%' },
    progressBar: { flex: 1, background: '#1f2937',
        borderRadius: '4px', height: '4px' },
    progressFill: { background: '#f59e0b', height: '4px',
        borderRadius: '4px', transition: 'width .3s' },
    progressTxt: { fontSize: '12px', color: '#f59e0b', fontWeight: 600 },
    actions: { display: 'flex', gap: '8px' },
    btnPrimary: { padding: '8px 14px', background: 'rgba(245,158,11,.12)',
        border: '1px solid rgba(245,158,11,.3)', color: '#f59e0b',
        borderRadius: '7px', cursor: 'pointer', fontSize: '12px',
        fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' },
    btnSecondary: { padding: '8px 14px', background: 'rgba(148,163,184,.08)',
        border: '1px solid #374151', color: '#94a3b8',
        borderRadius: '7px', cursor: 'pointer', fontSize: '12px',
        display: 'flex', alignItems: 'center', gap: '5px' },
    btnDanger: { padding: '8px 14px', background: 'rgba(239,68,68,.08)',
        border: '1px solid rgba(239,68,68,.25)', color: '#ef4444',
        borderRadius: '7px', cursor: 'pointer', fontSize: '12px' },
};