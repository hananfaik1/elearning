import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Clock, BarChart2, Upload, Play, CheckCircle } from 'lucide-react';

export default function CourseDetail() {
    const { id }     = useParams();
    const { user }   = useAuth();
    const navigate   = useNavigate();
    const [course, setCourse]       = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [file, setFile]           = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState('');
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        api.get(`/api/courses/${id}`)
            .then(r => setCourse(r.data))
            .finally(() => setLoading(false));

        if (user?.role === 'STUDENT') {
            api.get('/api/enrollments/my').then(r => {
                const found = r.data.find(e => e.courseId === parseInt(id));
                setEnrollment(found);
            });
        }
    }, [id]);

    const handleEnroll = async () => {
        try {
            const res = await api.post(`/api/enrollments/${id}/start`);
            setEnrollment(res.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur inscription');
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true); setUploadMsg('');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('courseId', id);
        try {
            await api.post('/api/upload/file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadMsg('✅ Fichier uploadé avec succès !');
            setFile(null);
        } catch {
            setUploadMsg('❌ Erreur lors de l\'upload');
        } finally { setUploading(false); }
    };

    const handlePublish = async () => {
        await api.post(`/api/courses/${id}/publish`);
        setCourse(prev => ({ ...prev, status: 'PUBLISHED' }));
    };

    if (loading) return (
        <div className="page">
            <Navbar/>
            <p style={{ textAlign:'center', padding:'80px', color:'#94a3b8' }}>
                Chargement...
            </p>
        </div>
    );

    if (!course) return (
        <div className="page">
            <Navbar/>
            <p style={{ textAlign:'center', padding:'80px', color:'#ef4444' }}>
                Cours introuvable
            </p>
        </div>
    );

    const levelColors = {
        BEGINNER:     { bg:'rgba(16,185,129,.12)', color:'#10b981' },
        INTERMEDIATE: { bg:'rgba(245,158,11,.12)', color:'#f59e0b' },
        ADVANCED:     { bg:'rgba(239,68,68,.12)',  color:'#ef4444' },
    };
    const lc = levelColors[course.level] || levelColors.BEGINNER;

    return (
        <div className="page">
            <Navbar/>
            <div style={s.container}>

                {/* HERO */}
                <div style={s.hero} className="fadeUp">
                    <div style={s.heroLeft}>
                        <div style={s.heroBadges}>
                            <span style={s.category}>{course.category}</span>
                            <span style={{...s.level, background:lc.bg, color:lc.color}}>
                {course.level}
              </span>
                            <span style={{
                                ...s.statusBadge,
                                background: course.status === 'PUBLISHED'
                                    ? 'rgba(16,185,129,.12)' : 'rgba(245,158,11,.12)',
                                color: course.status === 'PUBLISHED' ? '#10b981' : '#f59e0b',
                            }}>
                {course.status}
              </span>
                        </div>
                        <h1 style={s.title}>{course.title}</h1>
                        <p style={s.desc}>{course.description}</p>
                        <div style={s.meta}>
              <span style={s.metaItem}>
                <Clock size={15}/> {course.durationHours}h de contenu
              </span>
                            <span style={s.metaItem}>
                <BarChart2 size={15}/> {course.level}
              </span>
                            <span style={s.metaItem}>
                👨‍🏫 {course.profName}
              </span>
                        </div>
                    </div>

                    <div style={s.heroRight}>
                        {/* Actions ÉTUDIANT */}
                        {user?.role === 'STUDENT' && (
                            !enrollment
                                ? (
                                    <button style={s.btnEnroll} onClick={handleEnroll}>
                                        <Play size={16}/> S'inscrire à ce cours
                                    </button>
                                ) : (
                                    <div style={s.enrolledBox}>
                                        <CheckCircle size={20} color="#10b981"/>
                                        <div>
                                            <div style={s.enrolledTitle}>Inscrit ✅</div>
                                            <div style={s.enrolledStatus}>{enrollment.status}</div>
                                        </div>
                                        <div style={s.progressWrap}>
                                            <div style={s.progressBar}>
                                                <div style={{
                                                    ...s.progressFill,
                                                    width:`${enrollment.progressPercent}%`
                                                }}/>
                                            </div>
                                            <span style={s.progressTxt}>
                        {enrollment.progressPercent}%
                      </span>
                                        </div>
                                    </div>
                                )
                        )}

                        {/* Actions PROF */}
                        {user?.role === 'PROF' && (
                            <div style={s.profActions}>
                                {course.status === 'DRAFT' && (
                                    <button style={s.btnPublish} onClick={handlePublish}>
                                        🚀 Publier le cours
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* UPLOAD — PROF SEULEMENT */}
                {user?.role === 'PROF' && (
                    <div style={s.uploadSection} className="fadeUp">
                        <h2 style={s.sectionTitle}>
                            <Upload size={18}/> Ajouter des ressources
                        </h2>
                        <p style={s.uploadHint}>
                            Uploadez des vidéos (MP4) ou des documents (PDF) pour ce cours
                        </p>
                        <div style={s.uploadBox}>
                            <input
                                type="file"
                                id="fileInput"
                                accept="video/*,.pdf,.doc,.docx"
                                style={{ display:'none' }}
                                onChange={e => setFile(e.target.files[0])}
                            />
                            <label htmlFor="fileInput" style={s.uploadLabel}>
                                {file
                                    ? `📎 ${file.name}`
                                    : '📁 Cliquez pour choisir un fichier'}
                            </label>
                            {file && (
                                <button
                                    style={s.btnUpload}
                                    onClick={handleUpload}
                                    disabled={uploading}
                                >
                                    {uploading ? '⏳ Upload...' : '⬆️ Uploader'}
                                </button>
                            )}
                        </div>
                        {uploadMsg && (
                            <p style={{
                                ...s.uploadMsg,
                                color: uploadMsg.includes('✅') ? '#10b981' : '#ef4444',
                            }}>
                                {uploadMsg}
                            </p>
                        )}
                    </div>
                )}

                {/* RETOUR */}
                <button style={s.btnBack} onClick={() => navigate(-1)}>
                    ← Retour
                </button>
            </div>
        </div>
    );
}

const s = {
    container: { padding:'32px', maxWidth:'1000px', margin:'0 auto' },
    hero: { display:'flex', gap:'32px', marginBottom:'36px',
        background:'#0d1117', border:'1px solid #1f2937',
        borderRadius:'16px', padding:'32px' },
    heroLeft: { flex:1 },
    heroRight: { minWidth:'260px' },
    heroBadges: { display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'14px' },
    category: { fontSize:'11px', color:'#94a3b8', fontWeight:600,
        textTransform:'uppercase', letterSpacing:'1px' },
    level: { padding:'3px 10px', borderRadius:'20px',
        fontSize:'11px', fontWeight:700 },
    statusBadge: { padding:'3px 10px', borderRadius:'20px',
        fontSize:'11px', fontWeight:700 },
    title: { fontFamily:'Syne', fontSize:'26px', fontWeight:800,
        color:'#f1f5f9', marginBottom:'10px', lineHeight:1.3 },
    desc: { fontSize:'14px', color:'#94a3b8', lineHeight:1.7, marginBottom:'16px' },
    meta: { display:'flex', gap:'20px', flexWrap:'wrap' },
    metaItem: { display:'flex', alignItems:'center', gap:'6px',
        fontSize:'13px', color:'#475569' },
    btnEnroll: { width:'100%', padding:'14px', background:'#f59e0b',
        border:'none', color:'#000', borderRadius:'10px',
        cursor:'pointer', fontSize:'15px', fontWeight:700,
        display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' },
    enrolledBox: { background:'#111827', border:'1px solid #10b981',
        borderRadius:'12px', padding:'16px',
        display:'flex', flexDirection:'column', gap:'10px' },
    enrolledTitle: { fontFamily:'Syne', fontSize:'15px',
        fontWeight:700, color:'#10b981' },
    enrolledStatus: { fontSize:'12px', color:'#94a3b8' },
    progressWrap: { display:'flex', alignItems:'center', gap:'8px' },
    progressBar: { flex:1, background:'#1f2937', borderRadius:'4px', height:'6px' },
    progressFill: { background:'#10b981', height:'6px',
        borderRadius:'4px', transition:'width .3s' },
    progressTxt: { fontSize:'13px', color:'#10b981', fontWeight:700 },
    profActions: { display:'flex', flexDirection:'column', gap:'10px' },
    btnPublish: { padding:'13px 20px', background:'rgba(16,185,129,.12)',
        border:'1px solid rgba(16,185,129,.3)', color:'#10b981',
        borderRadius:'9px', cursor:'pointer', fontSize:'14px', fontWeight:700 },
    uploadSection: { background:'#0d1117', border:'1px solid #1f2937',
        borderRadius:'14px', padding:'24px', marginBottom:'24px' },
    sectionTitle: { fontFamily:'Syne', fontSize:'18px', fontWeight:700,
        color:'#f1f5f9', marginBottom:'8px',
        display:'flex', alignItems:'center', gap:'8px' },
    uploadHint: { fontSize:'13px', color:'#94a3b8', marginBottom:'16px' },
    uploadBox: { display:'flex', gap:'12px', alignItems:'center' },
    uploadLabel: { flex:1, padding:'14px', background:'#111827',
        border:'2px dashed #374151', borderRadius:'10px',
        color:'#94a3b8', cursor:'pointer', fontSize:'14px',
        textAlign:'center', display:'block' },
    btnUpload: { padding:'13px 20px', background:'#3b82f6',
        border:'none', color:'white', borderRadius:'9px',
        cursor:'pointer', fontSize:'14px', fontWeight:700, whiteSpace:'nowrap' },
    uploadMsg: { marginTop:'10px', fontSize:'13px', fontWeight:600 },
    btnBack: { padding:'10px 20px', background:'transparent',
        border:'1px solid #374151', color:'#94a3b8',
        borderRadius:'8px', cursor:'pointer', fontSize:'13px' },
};