import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export default function AIGenerations() {
    const [generations, setGenerations] = useState([]);
    const [loading, setLoading]         = useState(true);
    const [open, setOpen]               = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/ai/my-generations')
            .then(r => setGenerations(r.data))
            .finally(() => setLoading(false));
    }, []);

    const parseContent = (raw) => {
        try {
            const cleaned = raw
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            return JSON.parse(cleaned);
        } catch { return null; }
    };

    return (
        <div className="page">
            <Navbar/>
            <div style={s.container}>
                <div style={s.header} className="fadeUp">
                    <h1 style={s.title}>
                        Cours générés par <span style={{color:'#8b5cf6'}}>l'IA</span>
                    </h1>
                    <p style={s.sub}>{generations.length} cours générés</p>
                    <button style={s.btnNew} onClick={() => navigate('/generate-ai')}>
                        <Sparkles size={15}/> Générer un nouveau cours
                    </button>
                </div>

                {loading
                    ? <p style={s.loading}>Chargement...</p>
                    : generations.length === 0
                        ? (
                            <div style={s.empty}>
                                <Sparkles size={40} color="#374151"/>
                                <p>Aucun cours généré pour le moment</p>
                                <button style={s.btnEmpty}
                                        onClick={() => navigate('/generate-ai')}>
                                    Générer mon premier cours IA →
                                </button>
                            </div>
                        )
                        : (
                            <div style={s.list}>
                                {generations.map((gen, i) => {
                                    const parsed = parseContent(gen.generatedContent);
                                    return (
                                        <div key={gen.id} style={s.card} className="fadeUp"
                                             style={{...s.card, animationDelay:`${i*.08}s`}}>
                                            <div style={s.cardHeader}
                                                 onClick={() => setOpen(open === i ? null : i)}>
                                                <div style={s.cardLeft}>
                                                    <div style={s.aiIcon}>🤖</div>
                                                    <div>
                                                        <h3 style={s.cardTitle}>
                                                            {parsed?.title || gen.topic}
                                                        </h3>
                                                        <p style={s.cardMeta}>
                                                            Sujet : {gen.topic} •
                                                            Niveau : {gen.level} •
                                                            {new Date(gen.createdAt).toLocaleDateString('fr-FR')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div style={s.cardRight}>
                                                    <span style={s.doneBadge}>✅ Généré</span>
                                                    {open === i
                                                        ? <ChevronUp size={18} color="#94a3b8"/>
                                                        : <ChevronDown size={18} color="#94a3b8"/>}
                                                </div>
                                            </div>

                                            {open === i && parsed && (
                                                <div style={s.detail}>
                                                    <p style={s.detailDesc}>{parsed.description}</p>

                                                    <div style={s.modulesGrid}>
                                                        {parsed.modules?.map((mod, j) => (
                                                            <div key={j} style={s.moduleCard}>
                                                                <div style={s.moduleTitle}>{mod.title}</div>
                                                                <div style={s.lessonCount}>
                                                                    {mod.lessons?.length} leçons
                                                                </div>
                                                                {mod.lessons?.map((l, k) => (
                                                                    <div key={k} style={s.lessonItem}>
                                                                        <span style={s.lessonDot}>•</span>
                                                                        <span style={s.lessonName}>{l.title}</span>
                                                                        <span style={s.lessonDur}>{l.duration}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {parsed.quiz?.length > 0 && (
                                                        <div style={s.quizSection}>
                                                            <h4 style={s.quizTitle}>
                                                                ❓ {parsed.quiz.length} questions de quiz
                                                            </h4>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )
                }
            </div>
        </div>
    );
}

const s = {
    container: { padding:'32px', maxWidth:'900px', margin:'0 auto' },
    header: { display:'flex', alignItems:'flex-start',
        flexDirection:'column', gap:'8px', marginBottom:'28px' },
    title: { fontFamily:'Syne', fontSize:'28px',
        fontWeight:800, color:'#f1f5f9' },
    sub: { fontSize:'14px', color:'#94a3b8' },
    btnNew: { display:'flex', alignItems:'center', gap:'7px',
        padding:'10px 18px', background:'rgba(139,92,246,.12)',
        border:'1px solid rgba(139,92,246,.3)', color:'#8b5cf6',
        borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:600 },
    loading: { textAlign:'center', padding:'60px', color:'#94a3b8' },
    empty: { textAlign:'center', padding:'60px',
        border:'1px dashed #1f2937', borderRadius:'14px',
        color:'#475569', display:'flex', flexDirection:'column',
        alignItems:'center', gap:'16px' },
    btnEmpty: { padding:'11px 22px', background:'#8b5cf6',
        border:'none', color:'white', borderRadius:'8px',
        cursor:'pointer', fontSize:'13px', fontWeight:600 },
    list: { display:'flex', flexDirection:'column', gap:'14px' },
    card: { background:'#0d1117', border:'1px solid #1f2937',
        borderRadius:'14px', overflow:'hidden',
        animation:'fadeUp .4s ease both' },
    cardHeader: { padding:'20px', display:'flex',
        justifyContent:'space-between', alignItems:'center', cursor:'pointer' },
    cardLeft: { display:'flex', gap:'14px', alignItems:'flex-start' },
    aiIcon: { width:'42px', height:'42px', background:'rgba(139,92,246,.12)',
        borderRadius:'10px', display:'flex',
        alignItems:'center', justifyContent:'center', fontSize:'20px' },
    cardTitle: { fontFamily:'Syne', fontSize:'16px',
        fontWeight:700, color:'#f1f5f9', marginBottom:'4px' },
    cardMeta: { fontSize:'12px', color:'#94a3b8' },
    cardRight: { display:'flex', alignItems:'center', gap:'12px' },
    doneBadge: { padding:'3px 10px', background:'rgba(16,185,129,.12)',
        color:'#10b981', borderRadius:'20px',
        fontSize:'11px', fontWeight:700 },
    detail: { borderTop:'1px solid #1f2937', padding:'20px' },
    detailDesc: { fontSize:'14px', color:'#94a3b8',
        lineHeight:1.7, marginBottom:'16px' },
    modulesGrid: { display:'grid',
        gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:'12px' },
    moduleCard: { background:'#111827', borderRadius:'10px', padding:'14px' },
    moduleTitle: { fontFamily:'Syne', fontSize:'13px',
        fontWeight:700, color:'#f1f5f9', marginBottom:'6px' },
    lessonCount: { fontSize:'11px', color:'#8b5cf6',
        marginBottom:'8px', fontWeight:600 },
    lessonItem: { display:'flex', alignItems:'center',
        gap:'6px', padding:'4px 0' },
    lessonDot: { color:'#374151', fontSize:'14px' },
    lessonName: { flex:1, fontSize:'12px', color:'#94a3b8' },
    lessonDur: { fontSize:'11px', color:'#475569' },
    quizSection: { marginTop:'14px', padding:'12px',
        background:'rgba(139,92,246,.06)',
        border:'1px solid rgba(139,92,246,.2)', borderRadius:'8px' },
    quizTitle: { fontSize:'13px', color:'#8b5cf6', fontWeight:600 },
};