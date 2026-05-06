import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function CreateCourse() {
    const [form, setForm] = useState({
        title:'', description:'', category:'', level:'BEGINNER', durationHours:''
    });
    const [msg, setMsg]         = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/courses', {
                ...form, durationHours: parseInt(form.durationHours)
            });
            setMsg('✅ Cours créé avec succès !');
            setTimeout(() => navigate('/mes-cours'), 1500);
        } catch {
            setMsg('❌ Erreur lors de la création');
        } finally { setLoading(false); }
    };

    return (
        <div className="page">
            <Navbar/>
            <div style={s.container}>
                <div style={s.header} className="fadeUp">
                    <h1 style={s.title}>Créer un nouveau cours</h1>
                    <p style={s.sub}>Remplissez les informations de votre cours</p>
                </div>

                {msg && <div style={{
                    ...s.msg,
                    background: msg.includes('✅')
                        ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)',
                    borderColor: msg.includes('✅') ? '#10b981' : '#ef4444',
                    color: msg.includes('✅') ? '#10b981' : '#ef4444',
                }}>{msg}</div>}

                <form onSubmit={handleSubmit} style={s.form} className="fadeUp">
                    <div style={s.row}>
                        <div style={s.field}>
                            <label style={s.label}>Titre du cours *</label>
                            <input style={s.input} placeholder="Ex : Spring Boot pour débutants"
                                   value={form.title}
                                   onChange={e => setForm({...form, title: e.target.value})} required/>
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>Catégorie *</label>
                            <input style={s.input} placeholder="Ex : Backend, Frontend, IA..."
                                   value={form.category}
                                   onChange={e => setForm({...form, category: e.target.value})} required/>
                        </div>
                    </div>

                    <div style={s.field}>
                        <label style={s.label}>Description</label>
                        <textarea style={{...s.input, height:'100px', resize:'vertical'}}
                                  placeholder="Décrivez votre cours..."
                                  value={form.description}
                                  onChange={e => setForm({...form, description: e.target.value})}/>
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
                            <input style={s.input} type="number" min="1" placeholder="Ex : 10"
                                   value={form.durationHours}
                                   onChange={e => setForm({...form, durationHours: e.target.value})} required/>
                        </div>
                    </div>

                    <div style={s.btns}>
                        <button type="button" style={s.btnCancel}
                                onClick={() => navigate('/mes-cours')}>
                            Annuler
                        </button>
                        <button type="submit" style={s.btnSubmit} disabled={loading}>
                            {loading ? '⏳ Création...' : '✅ Créer le cours'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const s = {
    container: { padding: '32px', maxWidth: '800px', margin: '0 auto' },
    header: { marginBottom: '28px' },
    title: { fontFamily: 'Syne', fontSize: '28px',
        fontWeight: 800, color: '#f1f5f9', marginBottom: '6px' },
    sub: { fontSize: '14px', color: '#94a3b8' },
    msg: { padding: '14px', borderRadius: '10px', border: '1px solid',
        fontSize: '14px', marginBottom: '20px', fontWeight: 600 },
    form: { background: '#0d1117', border: '1px solid #1f2937',
        borderRadius: '16px', padding: '28px',
        display: 'flex', flexDirection: 'column', gap: '20px' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    field: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: 600, color: '#94a3b8' },
    input: { padding: '12px 14px', background: '#111827',
        border: '1px solid #374151', borderRadius: '8px',
        color: '#f1f5f9', fontSize: '14px', outline: 'none' },
    btns: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' },
    btnCancel: { padding: '12px 24px', background: 'transparent',
        border: '1px solid #374151', color: '#94a3b8',
        borderRadius: '9px', cursor: 'pointer', fontSize: '14px' },
    btnSubmit: { padding: '12px 28px', background: '#f59e0b',
        border: 'none', color: '#000', borderRadius: '9px',
        cursor: 'pointer', fontSize: '14px', fontWeight: 700 },
};