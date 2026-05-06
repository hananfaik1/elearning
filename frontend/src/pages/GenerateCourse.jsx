import { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export default function GenerateAI() {
    const [form, setForm] = useState({
        topic:'', level:'INTERMEDIATE', durationHours:8, language:'Français'
    });
    const [result, setResult]   = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const [open, setOpen]       = useState(null);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setResult(null);
        try {
            const res = await api.post('/api/ai/generate-course', form);
            const parsed = JSON.parse(res.data.generatedContent);
            setResult(parsed);
        } catch {
            setError("Erreur lors de la génération. Réessayez.");
        } finally { setLoading(false); }
    };

    return (
        <div className="page">
            <Navbar/>
            <div style={s.container}>
                <div style={s.header} className="fadeUp">
                    <div style={s.iconWrap}><Sparkles size={28} color="#8b5cf6"/></div>
                    <h1 style={s.title}>Générateur de cours <span style={{color:'#8b5cf6'}}>IA</span></h1>
                    <p style={s.sub}>Saisissez un sujet, l'IA génère un cours complet en quelques secondes</p>
                </div>

                <form onSubmit={handleGenerate} style={s.form} className="fadeUp">
                    <div style={s.field}>
                        <label style={s.label}>Sujet du cours *</label>
                        <input style={s.input}
                               placeholder="Ex : Spring Boot REST API, Machine Learning, React Hooks..."
                               value={form.topic}
                               onChange={e => setForm({...form, topic: e.target.value})} required/>
                    </div>
                    <div style={s.row}>
                        <div style={s.field}>
                            <label style={s.label}>Niveau</label>
                            <select style={s.input} value={form.level}
                                    onChange={e => setForm({...form, level: e.target.value})}>
                                <option value="BEGINNER">Débutant</option>
                                <option value="INTERMEDIATE">Intermédiaire</option>
                                <option value="ADVANCED">Avancé</option>
                            </select>
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>Durée (heures)</label>
                            <input style={s.input} type="number" min="1" max="40"
                                   value={form.durationHours}
                                   onChange={e => setForm({...form, durationHours: e.target.value})}/>
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>Langue</label>
                            <select style={s.input} value={form.language}
                                    onChange={e => setForm({...form, language: e.target.value})}>
                                <option>Français</option>
                                <option>English</option>
                                <option>Arabe</option>
                            </select>
                        </div>
                    </div>
                    {error && <p style={s.error}>{error}</p>}
                    <button type="submit" style={s.btnGenerate} disabled={loading}>
                        {loading
                            ? <><span className="spin" style={{display:'inline-block'}}>⚡</span> Génération en cours...</>
                            : <><Sparkles size={16}/> Générer le cours</>}
                    </button>
                </form>

                {result && (
                    <div style={s.result} className="fadeUp">
                        <div style={s.resultHeader}>
                            <h2 style={s.resultTitle}>{result.title}</h2>
                            <span style={s.resultBadge}>✅ Généré</span>
                        </div>
                        <p style={s.resultDesc}>{result.description}</p>

                        <div style={s.objectives}>
                            <h3 style={s.subTitle}>🎯 Objectifs</h3>
                            {result.objectives?.map((obj, i) => (
                                <div key={i} style={s.objectiveItem}>
                                    <span style={s.objNum}>{i+1}</span>
                                    <span>{obj}</span>
                                </div>
                            ))}
                        </div>

                        <h3 style={s.subTitle}>📚 Modules ({result.modules?.length})</h3>
                        {result.modules?.map((mod, i) => (
                            <div key={i} style={s.module}>
                                <button style={s.moduleHeader}
                                        onClick={() => setOpen(open === i ? null : i)}>
                                    <span style={s.moduleTitle}>{mod.title}</span>
                                    {open === i ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                </button>
                                {open === i && (
                                    <div style={s.lessons}>
                                        {mod.lessons?.map((lesson, j) => (
                                            <div key={j} style={s.lesson}>
                                                <span style={s.lessonNum}>{j+1}</span>
                                                <div>
                                                    <div style={s.lessonTitle}>{lesson.title}</div>
                                                    <div style={s.lessonDuration}>⏱ {lesson.duration}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {result.quiz?.length > 0 && (
                            <>
                                <h3 style={{...s.subTitle, marginTop:'24px'}}>❓ Quiz ({result.quiz?.length} questions)</h3>
                                {result.quiz?.map((q, i) => (
                                    <div key={i} style={s.quizItem}>
                                        <p style={s.question}><strong>Q{i+1}:</strong> {q.question}</p>
                                        <div style={s.choices}>
                                            {q.choices?.map((c, j) => (
                                                <span key={j} style={{
                                                    ...s.choice,
                                                    ...(c.startsWith(q.answer) ? s.choiceCorrect : {})
                                                }}>{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const s = {
    container: { padding: '32px', maxWidth: '860px', margin: '0 auto' },
    header: { textAlign: 'center', marginBottom: '32px' },
    iconWrap: { display: 'inline-flex', padding: '16px',
        background: 'rgba(139,92,246,.12)', borderRadius: '16px', marginBottom: '16px' },
    title: { fontFamily: 'Syne', fontSize: '30px',
        fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' },
    sub: { fontSize: '15px', color: '#94a3b8' },
    form: { background: '#0d1117', border: '1px solid #1f2937',
        borderRadius: '16px', padding: '28px',
        display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' },
    row: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: 600, color: '#94a3b8' },
    input: { padding: '12px 14px', background: '#111827',
        border: '1px solid #374151', borderRadius: '8px',
        color: '#f1f5f9', fontSize: '14px', outline: 'none' },
    error: { color: '#ef4444', fontSize: '13px', padding: '10px',
        background: 'rgba(239,68,68,.08)', borderRadius: '6px' },
    btnGenerate: { padding: '14px', background: '#8b5cf6', border: 'none',
        color: 'white', borderRadius: '10px', cursor: 'pointer',
        fontSize: '15px', fontWeight: 700, display: 'flex',
        alignItems: 'center', justifyContent: 'center', gap: '8px' },
    result: { background: '#0d1117', border: '1px solid #1f2937',
        borderRadius: '16px', padding: '28px' },
    resultHeader: { display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '12px' },
    resultTitle: { fontFamily: 'Syne', fontSize: '22px',
        fontWeight: 800, color: '#f1f5f9', flex: 1 },
    resultBadge: { padding: '4px 12px', background: 'rgba(16,185,129,.12)',
        color: '#10b981', borderRadius: '20px', fontSize: '12px', fontWeight: 700 },
    resultDesc: { fontSize: '14px', color: '#94a3b8',
        lineHeight: 1.7, marginBottom: '20px' },
    objectives: { marginBottom: '20px' },
    subTitle: { fontFamily: 'Syne', fontSize: '17px',
        fontWeight: 700, color: '#f1f5f9', marginBottom: '12px' },
    objectiveItem: { display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 0', borderBottom: '1px solid #111827', fontSize: '14px' },
    objNum: { width: '22px', height: '22px', background: 'rgba(139,92,246,.15)',
        color: '#8b5cf6', borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 700, flexShrink: 0 },
    module: { border: '1px solid #1f2937', borderRadius: '10px',
        overflow: 'hidden', marginBottom: '10px' },
    moduleHeader: { width: '100%', padding: '14px 16px',
        background: '#111827', border: 'none', color: '#f1f5f9',
        cursor: 'pointer', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center' },
    moduleTitle: { fontFamily: 'Syne', fontSize: '14px',
        fontWeight: 700, textAlign: 'left' },
    lessons: { padding: '8px 16px' },
    lesson: { display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '10px 0', borderBottom: '1px solid #1f2937' },
    lessonNum: { fontSize: '11px', color: '#475569',
        fontWeight: 700, minWidth: '20px' },
    lessonTitle: { fontSize: '13px', color: '#f1f5f9', marginBottom: '2px' },
    lessonDuration: { fontSize: '11px', color: '#475569' },
    quizItem: { background: '#111827', borderRadius: '8px',
        padding: '14px', marginBottom: '8px' },
    question: { fontSize: '14px', color: '#f1f5f9', marginBottom: '10px' },
    choices: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    choice: { padding: '5px 12px', background: '#1f2937', borderRadius: '6px',
        fontSize: '12px', color: '#94a3b8' },
    choiceCorrect: { background: 'rgba(16,185,129,.15)',
        color: '#10b981', fontWeight: 700 },
};