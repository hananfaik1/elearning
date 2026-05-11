import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Clock, BarChart2, Upload, Play,
    CheckCircle, FileText, Video } from 'lucide-react';

const BASE_URL = 'http://localhost:9090';

export default function CourseDetail() {
    const { id }   = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse]         = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [files, setFiles]           = useState([]);
    const [file, setFile]             = useState(null);
    const [uploading, setUploading]   = useState(false);
    const [uploadMsg, setUploadMsg]   = useState('');
    const [loading, setLoading]       = useState(true);
    const [activeFile, setActiveFile] = useState(null);

    const loadFiles = () =>
        api.get(`/api/files/course/${id}`).then(r => setFiles(r.data));

    useEffect(() => {
        api.get(`/api/courses/${id}`)
            .then(r => setCourse(r.data))
            .finally(() => setLoading(false));

        loadFiles();

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
            await api.post('/api/files/upload', formData);
            setUploadMsg('✅ Fichier uploadé avec succès !');
            setFile(null);
            document.getElementById('fileInput').value = '';
            loadFiles(); // Recharge la liste
        } catch (err) {
            setUploadMsg('❌ ' + (err.response?.data?.error || 'Erreur upload')+ err.response?.data?.message);
            console.log(err.response.data);
        } finally { setUploading(false); }
    };

    const handlePublish = async () => {
        await api.post(`/api/courses/${id}/publish`);
        setCourse(prev => ({ ...prev, status: 'PUBLISHED' }));
    };

    // Peut voir les fichiers ?
    const canViewFiles = user?.role === 'PROF' || enrollment;

    if (loading) return (
        <div className="page"><Navbar/>
            <p style={{textAlign:'center',padding:'80px',color:'#94a3b8'}}>
                Chargement...
            </p>
        </div>
    );

    if (!course) return (
        <div className="page"><Navbar/>
            <p style={{textAlign:'center',padding:'80px',color:'#ef4444'}}>
                Cours introuvable
            </p>
        </div>
    );

    const lc = {
        BEGINNER:     { bg:'rgba(16,185,129,.12)', color:'#10b981' },
        INTERMEDIATE: { bg:'rgba(245,158,11,.12)', color:'#f59e0b' },
        ADVANCED:     { bg:'rgba(239,68,68,.12)',  color:'#ef4444' },
    }[course.level] || { bg:'rgba(16,185,129,.12)', color:'#10b981' };

    return (
        <div className="page">
            <Navbar/>
            <div style={s.container}>

                {/* ── HERO ── */}
                <div style={s.hero} className="fadeUp">
                    <div style={s.heroLeft}>
                        <div style={s.badges}>
                            <span style={s.category}>{course.category}</span>
                            <span style={{...s.level, ...lc}}>{course.level}</span>
                            <span style={{
                                ...s.badge,
                                background: course.status==='PUBLISHED'
                                    ?'rgba(16,185,129,.12)':'rgba(245,158,11,.12)',
                                color: course.status==='PUBLISHED'?'#10b981':'#f59e0b',
                            }}>{course.status}</span>
                        </div>
                        <h1 style={s.title}>{course.title}</h1>
                        <p style={s.desc}>{course.description}</p>
                        <div style={s.meta}>
                            <span style={s.metaItem}><Clock size={14}/> {course.durationHours}h</span>
                            <span style={s.metaItem}><BarChart2 size={14}/> {course.level}</span>
                            <span style={s.metaItem}>👨‍🏫 {course.profName}</span>
                        </div>
                    </div>

                    <div style={s.heroRight}>
                        {user?.role === 'STUDENT' && !enrollment && (
                            <button style={s.btnEnroll} onClick={handleEnroll}>
                                <Play size={16}/> S'inscrire à ce cours
                            </button>
                        )}
                        {user?.role === 'STUDENT' && enrollment && (
                            <div style={s.enrolledBox}>
                                <CheckCircle size={20} color="#10b981"/>
                                <div style={s.enrolledInfo}>
                                    <div style={s.enrolledTitle}>Inscrit ✅</div>
                                    <div style={s.enrolledSub}>{enrollment.status}</div>
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
                        )}
                        {user?.role === 'PROF' && course.status === 'DRAFT' && (
                            <button style={s.btnPublish} onClick={handlePublish}>
                                🚀 Publier le cours
                            </button>
                        )}
                    </div>
                </div>

                {/* ── PLAYER / VISIONNEUSE ── */}
                {activeFile && (
                    <div style={s.playerSection} className="fadeUp">
                        <div style={s.playerHeader}>
                            <h2 style={s.playerTitle}>
                                {activeFile.fileType === 'VIDEO' ? '🎬' : '📄'}{' '}
                                {activeFile.originalName}
                            </h2>
                            <button style={s.closeBtn}
                                    onClick={() => setActiveFile(null)}>✕ Fermer</button>
                        </div>

                        {activeFile.fileType === 'VIDEO' ? (
                            <video
                                controls
                                style={s.videoPlayer}
                                src={`${BASE_URL}/api/files/download/${activeFile.fileName}`}
                            >
                                Votre navigateur ne supporte pas la vidéo.
                            </video>
                        ) : (
                            <iframe
                                src={`${BASE_URL}/api/files/download/${activeFile.fileName}`}
                                style={s.pdfViewer}
                                title={activeFile.originalName}
                            />
                        )}
                    </div>
                )}

                {/* ── RESSOURCES ── */}
                {canViewFiles && (
                    <div style={s.resourcesSection} className="fadeUp">
                        <h2 style={s.sectionTitle}>
                            📂 Ressources du cours
                            <span style={s.fileCount}>{files.length} fichier(s)</span>
                        </h2>

                        {files.length === 0 ? (
                            <p style={s.noFiles}>
                                {user?.role === 'PROF'
                                    ? 'Aucune ressource. Uploadez des vidéos ou PDF ci-dessous.'
                                    : 'Aucune ressource disponible pour ce cours.'}
                            </p>
                        ) : (
                            <div style={s.fileGrid}>
                                {files.map(f => (
                                    <div key={f.id} style={s.fileCard}
                                         onClick={() => setActiveFile(f)}>
                                        <div style={{
                                            ...s.fileIcon,
                                            background: f.fileType === 'VIDEO'
                                                ? 'rgba(59,130,246,.12)'
                                                : 'rgba(239,68,68,.12)',
                                            color: f.fileType === 'VIDEO' ? '#3b82f6' : '#ef4444',
                                        }}>
                                            {f.fileType === 'VIDEO'
                                                ? <Video size={22}/>
                                                : <FileText size={22}/>}
                                        </div>
                                        <div style={s.fileInfo}>
                                            <div style={s.fileName}>{f.originalName}</div>
                                            <div style={s.fileMeta}>
                                                {f.fileType} •{' '}
                                                {f.fileSize
                                                    ? (f.fileSize / 1024 / 1024).toFixed(1) + ' Mo'
                                                    : '—'}
                                            </div>
                                        </div>
                                        <div style={s.playIcon}>▶</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Etudiant non inscrit */}
                {user?.role === 'STUDENT' && !enrollment && files.length > 0 && (
                    <div style={s.lockBox}>
                        🔒 Inscrivez-vous pour accéder aux {files.length} ressource(s)
                    </div>
                )}

                {/* ── UPLOAD (PROF) ── */}
                {user?.role === 'PROF' && (
                    <div style={s.uploadSection} className="fadeUp">
                        <h2 style={s.sectionTitle}>
                            <Upload size={17}/> Ajouter des ressources
                        </h2>
                        <p style={s.uploadHint}>
                            Vidéos (MP4, MOV) ou documents (PDF)
                        </p>
                        <div style={s.uploadBox}>
                            <input type="file" id="fileInput"
                                   accept="video/*,.pdf,.doc,.docx"
                                   style={{display:'none'}}
                                   onChange={e => setFile(e.target.files[0])}/>
                            <label htmlFor="fileInput" style={s.uploadLabel}>
                                {file ? `📎 ${file.name}` : '📁 Choisir un fichier'}
                            </label>
                            {file && (
                                <button style={s.btnUpload}
                                        onClick={handleUpload}
                                        disabled={uploading}>
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

                <button style={s.btnBack} onClick={() => navigate(-1)}>
                    ← Retour
                </button>
            </div>
        </div>
    );
}

const s = {
    container:{ padding:'32px', maxWidth:'1000px', margin:'0 auto' },
    hero:{ display:'flex', gap:'28px', background:'#0d1117',
        border:'1px solid #1f2937', borderRadius:'16px',
        padding:'28px', marginBottom:'24px' },
    heroLeft:{ flex:1 },
    heroRight:{ minWidth:'240px' },
    badges:{ display:'flex', gap:'8px', marginBottom:'12px', flexWrap:'wrap' },
    category:{ fontSize:'11px', color:'#94a3b8', fontWeight:600,
        textTransform:'uppercase', letterSpacing:'1px' },
    level:{ padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:700 },
    badge:{ padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:700 },
    title:{ fontFamily:'Syne', fontSize:'24px', fontWeight:800,
        color:'#f1f5f9', marginBottom:'10px', lineHeight:1.3 },
    desc:{ fontSize:'14px', color:'#94a3b8', lineHeight:1.7, marginBottom:'14px' },
    meta:{ display:'flex', gap:'16px', flexWrap:'wrap' },
    metaItem:{ display:'flex', alignItems:'center', gap:'5px',
        fontSize:'13px', color:'#475569' },
    btnEnroll:{ width:'100%', padding:'13px', background:'#f59e0b',
        border:'none', color:'#000', borderRadius:'10px',
        cursor:'pointer', fontSize:'14px', fontWeight:700,
        display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' },
    enrolledBox:{ background:'#111827', border:'1px solid #10b981',
        borderRadius:'12px', padding:'16px',
        display:'flex', flexDirection:'column', gap:'8px' },
    enrolledInfo:{},
    enrolledTitle:{ fontFamily:'Syne', fontSize:'14px',
        fontWeight:700, color:'#10b981' },
    enrolledSub:{ fontSize:'12px', color:'#94a3b8' },
    progressWrap:{ display:'flex', alignItems:'center', gap:'8px' },
    progressBar:{ flex:1, background:'#1f2937', borderRadius:'4px', height:'5px' },
    progressFill:{ background:'#10b981', height:'5px',
        borderRadius:'4px', transition:'width .3s' },
    progressTxt:{ fontSize:'12px', color:'#10b981', fontWeight:700 },
    btnPublish:{ width:'100%', padding:'12px', background:'rgba(16,185,129,.12)',
        border:'1px solid rgba(16,185,129,.3)', color:'#10b981',
        borderRadius:'9px', cursor:'pointer', fontSize:'14px', fontWeight:700 },

    // Player
    playerSection:{ background:'#0d1117', border:'1px solid #374151',
        borderRadius:'14px', padding:'20px', marginBottom:'24px' },
    playerHeader:{ display:'flex', justifyContent:'space-between',
        alignItems:'center', marginBottom:'14px' },
    playerTitle:{ fontFamily:'Syne', fontSize:'16px',
        fontWeight:700, color:'#f1f5f9' },
    closeBtn:{ padding:'7px 14px', background:'rgba(239,68,68,.1)',
        border:'1px solid rgba(239,68,68,.3)', color:'#ef4444',
        borderRadius:'7px', cursor:'pointer', fontSize:'13px' },
    videoPlayer:{ width:'100%', borderRadius:'10px',
        maxHeight:'500px', background:'#000' },
    pdfViewer:{ width:'100%', height:'600px', border:'none',
        borderRadius:'10px' },

    // Resources
    resourcesSection:{ background:'#0d1117', border:'1px solid #1f2937',
        borderRadius:'14px', padding:'22px', marginBottom:'20px' },
    sectionTitle:{ fontFamily:'Syne', fontSize:'18px', fontWeight:700,
        color:'#f1f5f9', marginBottom:'16px',
        display:'flex', alignItems:'center', gap:'10px' },
    fileCount:{ fontFamily:'DM Sans', fontSize:'12px', color:'#94a3b8',
        background:'#111827', padding:'2px 10px',
        borderRadius:'20px', fontWeight:400 },
    noFiles:{ fontSize:'14px', color:'#475569', textAlign:'center',
        padding:'30px', border:'1px dashed #1f2937', borderRadius:'10px' },
    fileGrid:{ display:'flex', flexDirection:'column', gap:'10px' },
    fileCard:{ display:'flex', alignItems:'center', gap:'14px',
        padding:'14px', background:'#111827', border:'1px solid #1f2937',
        borderRadius:'10px', cursor:'pointer', transition:'all .2s' },
    fileIcon:{ width:'44px', height:'44px', borderRadius:'10px',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
    fileInfo:{ flex:1 },
    fileName:{ fontSize:'14px', fontWeight:600, color:'#f1f5f9', marginBottom:'3px' },
    fileMeta:{ fontSize:'12px', color:'#94a3b8' },
    playIcon:{ color:'#475569', fontSize:'14px' },

    // Locked
    lockBox:{ background:'rgba(245,158,11,.06)',
        border:'1px solid rgba(245,158,11,.2)',
        borderRadius:'10px', padding:'16px',
        color:'#f59e0b', fontSize:'14px', fontWeight:600,
        textAlign:'center', marginBottom:'20px' },

    // Upload
    uploadSection:{ background:'#0d1117', border:'1px solid #1f2937',
        borderRadius:'14px', padding:'22px', marginBottom:'20px' },
    uploadHint:{ fontSize:'13px', color:'#94a3b8', marginBottom:'14px' },
    uploadBox:{ display:'flex', gap:'12px', alignItems:'center' },
    uploadLabel:{ flex:1, padding:'13px', background:'#111827',
        border:'2px dashed #374151', borderRadius:'10px',
        color:'#94a3b8', cursor:'pointer', fontSize:'13px',
        textAlign:'center', display:'block' },
    btnUpload:{ padding:'12px 20px', background:'#3b82f6',
        border:'none', color:'white', borderRadius:'9px',
        cursor:'pointer', fontSize:'13px', fontWeight:700, whiteSpace:'nowrap' },
    uploadMsg:{ marginTop:'10px', fontSize:'13px', fontWeight:600 },
    btnBack:{ padding:'10px 20px', background:'transparent',
        border:'1px solid #374151', color:'#94a3b8',
        borderRadius:'8px', cursor:'pointer', fontSize:'13px' },
};