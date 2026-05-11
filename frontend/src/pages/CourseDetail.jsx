import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Clock, BarChart2, Upload, Play,
    CheckCircle, FileText, Video, X } from 'lucide-react';

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
    const [blobUrl, setBlobUrl]       = useState(null);   // URL blob pour le PDF
    const [pdfLoading, setPdfLoading] = useState(false);

    // Quand on ouvre un fichier PDF → charge en blob via axios (auth + CORS)
    // Toutes les setState sont dans des callbacks async → pas de cascade de renders
    useEffect(() => {
        // Pas de PDF actif → on nettoie dans le cleanup uniquement
        if (!activeFile || activeFile.fileType !== 'PDF') return;

        let cancelled = false;   // évite les setState sur composant démonté
        let objectUrl = null;

        Promise.resolve()
            .then(() => {
                if (cancelled) return null;
                setPdfLoading(true);
                return api.get(`/api/files/download/${activeFile.fileName}`, { responseType: 'blob' });
            })
            .then(res => {
                if (!res || cancelled) return;
                const blob = new Blob([res.data], { type: 'application/pdf' });
                objectUrl = URL.createObjectURL(blob);
                setBlobUrl(objectUrl);
            })
            .catch(() => {
                if (!cancelled) setBlobUrl(null);
            })
            .finally(() => {
                if (!cancelled) setPdfLoading(false);
            });

        return () => {
            cancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            setBlobUrl(null);
            setPdfLoading(false);
        };
    }, [activeFile]);

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

    // Fermer le modal avec Escape
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setActiveFile(null); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Bloquer le scroll quand modal ouvert
    useEffect(() => {
        document.body.style.overflow = activeFile ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [activeFile]);

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
            loadFiles();
        } catch (err) {
            setUploadMsg('❌ ' + (err.response?.data?.error || 'Erreur upload') + (err.response?.data?.message || ''));
        } finally { setUploading(false); }
    };

    const handlePublish = async () => {
        await api.post(`/api/courses/${id}/publish`);
        setCourse(prev => ({ ...prev, status: 'PUBLISHED' }));
    };

    const canViewFiles = user?.role === 'PROF' || enrollment;

    if (loading) return (
        <div className="page"><Navbar/>
            <p style={{ textAlign:'center', padding:'80px', color:'#94a3b8' }}>
                Chargement...
            </p>
        </div>
    );

    if (!course) return (
        <div className="page"><Navbar/>
            <p style={{ textAlign:'center', padding:'80px', color:'#ef4444' }}>
                Cours introuvable
            </p>
        </div>
    );

    const lc = {
        BEGINNER:     { bg:'rgba(16,185,129,.12)', color:'#10b981' },
        INTERMEDIATE: { bg:'rgba(245,158,11,.12)',  color:'#f59e0b' },
        ADVANCED:     { bg:'rgba(239,68,68,.12)',   color:'#ef4444' },
    }[course.level] || { bg:'rgba(16,185,129,.12)', color:'#10b981' };

    // Pour les vidéos → URL directe ; pour les PDFs → URL blob (chargée via axios)
    const videoUrl    = activeFile?.fileType === 'VIDEO'
        ? `${BASE_URL}/api/files/download/${activeFile.fileName}`
        : null;
    const downloadUrl = activeFile
        ? `${BASE_URL}/api/files/download/${activeFile.fileName}`
        : null;

    return (
        <div className="page">
            <Navbar/>
            <div style={s.container}>

                {/* ── HERO ── */}
                <div style={s.hero} className="fadeUp">
                    <div style={s.heroLeft}>
                        <div style={s.badges}>
                            <span style={s.category}>{course.category}</span>
                            <span style={{ ...s.level, background: lc.bg, color: lc.color }}>
                                {course.level}
                            </span>
                            <span style={{
                                ...s.badge,
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
                                            width: `${enrollment.progressPercent}%`,
                                        }}/>
                                    </div>
                                    <span style={s.progressTxt}>{enrollment.progressPercent}%</span>
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
                                    <div
                                        key={f.id}
                                        style={s.fileCard}
                                        onClick={() => setActiveFile(f)}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = '#374151';
                                            e.currentTarget.style.background  = '#1a2332';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = '#1f2937';
                                            e.currentTarget.style.background  = '#111827';
                                        }}
                                    >
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
                        <p style={s.uploadHint}>Vidéos (MP4, MOV) ou documents (PDF)</p>
                        <div style={s.uploadBox}>
                            <input
                                type="file"
                                id="fileInput"
                                accept="video/*,.pdf,.doc,.docx"
                                style={{ display:'none' }}
                                onChange={e => setFile(e.target.files[0])}
                            />
                            <label htmlFor="fileInput" style={s.uploadLabel}>
                                {file ? `📎 ${file.name}` : '📁 Choisir un fichier'}
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

                <button style={s.btnBack} onClick={() => navigate(-1)}>
                    ← Retour
                </button>
            </div>

            {/* ══════════════════════════════════════════
                MODAL VIEWER  —  PDF & VIDEO
            ══════════════════════════════════════════ */}
            {activeFile && (
                <div style={s.modalOverlay} onClick={() => setActiveFile(null)}>
                    <div
                        style={s.modalContent}
                        onClick={e => e.stopPropagation()} // empêche la fermeture au clic intérieur
                    >
                        {/* Header */}
                        <div style={s.modalHeader}>
                            <div style={s.modalTitleRow}>
                                <span style={{
                                    ...s.modalTypeBadge,
                                    background: activeFile.fileType === 'VIDEO'
                                        ? 'rgba(59,130,246,.15)' : 'rgba(239,68,68,.15)',
                                    color: activeFile.fileType === 'VIDEO' ? '#3b82f6' : '#ef4444',
                                }}>
                                    {activeFile.fileType === 'VIDEO' ? <Video size={13}/> : <FileText size={13}/>}
                                    {activeFile.fileType}
                                </span>
                                <h3 style={s.modalTitle}>{activeFile.originalName}</h3>
                            </div>
                            <button
                                style={s.modalCloseBtn}
                                onClick={() => setActiveFile(null)}
                                title="Fermer (Echap)"
                            >
                                <X size={18}/>
                            </button>
                        </div>

                        {/* Viewer */}
                        <div style={s.modalBody}>
                            {activeFile.fileType === 'VIDEO' ? (
                                /* ── VIDÉO ── URL directe, le streaming backend suffit */
                                <video
                                    key={videoUrl}
                                    controls
                                    autoPlay
                                    style={s.videoPlayer}
                                >
                                    <source src={videoUrl} type="video/mp4"/>
                                    <source src={videoUrl} type="video/webm"/>
                                    Votre navigateur ne supporte pas la lecture vidéo.
                                </video>
                            ) : (
                                /* ── PDF ── chargé en blob via axios puis affiché via object URL
                                   → contourne Content-Disposition:attachment et les problèmes CORS */
                                pdfLoading ? (
                                    <div style={s.pdfLoader}>
                                        <div style={s.spinner}/>
                                        <span style={{ color:'#94a3b8', fontSize:'14px' }}>
                                            Chargement du PDF…
                                        </span>
                                    </div>
                                ) : blobUrl ? (
                                    <iframe
                                        key={blobUrl}
                                        src={blobUrl}
                                        style={s.pdfViewer}
                                        title={activeFile.originalName}
                                    />
                                ) : (
                                    /* Fallback si blob échoue */
                                    <div style={s.pdfFallback}>
                                        <FileText size={48} color="#ef4444"/>
                                        <p style={{ color:'#94a3b8', margin:'12px 0 4px' }}>
                                            Impossible d'afficher le PDF directement.
                                        </p>
                                        <a
                                            href={downloadUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={s.downloadBtn}
                                        >
                                            ⬇️ Ouvrir / Télécharger le PDF
                                        </a>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Footer */}
                        <div style={s.modalFooter}>
                            <a
                                href={downloadUrl}
                                download={activeFile.originalName}
                                style={s.downloadBtn}
                                target="_blank"
                                rel="noreferrer"
                            >
                                ⬇️ Télécharger
                            </a>
                            <button style={s.closeFooterBtn} onClick={() => setActiveFile(null)}>
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Styles ─────────────────────────────────────────────── */
const s = {
    container: { padding:'32px', maxWidth:'1000px', margin:'0 auto' },

    /* Hero */
    hero: { display:'flex', gap:'28px', background:'#0d1117',
        border:'1px solid #1f2937', borderRadius:'16px',
        padding:'28px', marginBottom:'24px' },
    heroLeft: { flex:1 },
    heroRight: { minWidth:'240px' },
    badges: { display:'flex', gap:'8px', marginBottom:'12px', flexWrap:'wrap' },
    category: { fontSize:'11px', color:'#94a3b8', fontWeight:600,
        textTransform:'uppercase', letterSpacing:'1px' },
    level: { padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:700 },
    badge: { padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:700 },
    title: { fontFamily:'Syne', fontSize:'24px', fontWeight:800,
        color:'#f1f5f9', marginBottom:'10px', lineHeight:1.3 },
    desc: { fontSize:'14px', color:'#94a3b8', lineHeight:1.7, marginBottom:'14px' },
    meta: { display:'flex', gap:'16px', flexWrap:'wrap' },
    metaItem: { display:'flex', alignItems:'center', gap:'5px',
        fontSize:'13px', color:'#475569' },
    btnEnroll: { width:'100%', padding:'13px', background:'#f59e0b',
        border:'none', color:'#000', borderRadius:'10px',
        cursor:'pointer', fontSize:'14px', fontWeight:700,
        display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' },
    enrolledBox: { background:'#111827', border:'1px solid #10b981',
        borderRadius:'12px', padding:'16px',
        display:'flex', flexDirection:'column', gap:'8px' },
    enrolledInfo: {},
    enrolledTitle: { fontFamily:'Syne', fontSize:'14px', fontWeight:700, color:'#10b981' },
    enrolledSub: { fontSize:'12px', color:'#94a3b8' },
    progressWrap: { display:'flex', alignItems:'center', gap:'8px' },
    progressBar: { flex:1, background:'#1f2937', borderRadius:'4px', height:'5px' },
    progressFill: { background:'#10b981', height:'5px',
        borderRadius:'4px', transition:'width .3s' },
    progressTxt: { fontSize:'12px', color:'#10b981', fontWeight:700 },
    btnPublish: { width:'100%', padding:'12px', background:'rgba(16,185,129,.12)',
        border:'1px solid rgba(16,185,129,.3)', color:'#10b981',
        borderRadius:'9px', cursor:'pointer', fontSize:'14px', fontWeight:700 },

    /* Resources */
    resourcesSection: { background:'#0d1117', border:'1px solid #1f2937',
        borderRadius:'14px', padding:'22px', marginBottom:'20px' },
    sectionTitle: { fontFamily:'Syne', fontSize:'18px', fontWeight:700,
        color:'#f1f5f9', marginBottom:'16px',
        display:'flex', alignItems:'center', gap:'10px' },
    fileCount: { fontFamily:'DM Sans', fontSize:'12px', color:'#94a3b8',
        background:'#111827', padding:'2px 10px',
        borderRadius:'20px', fontWeight:400 },
    noFiles: { fontSize:'14px', color:'#475569', textAlign:'center',
        padding:'30px', border:'1px dashed #1f2937', borderRadius:'10px' },
    fileGrid: { display:'flex', flexDirection:'column', gap:'10px' },
    fileCard: { display:'flex', alignItems:'center', gap:'14px',
        padding:'14px', background:'#111827', border:'1px solid #1f2937',
        borderRadius:'10px', cursor:'pointer', transition:'all .2s' },
    fileIcon: { width:'44px', height:'44px', borderRadius:'10px',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
    fileInfo: { flex:1 },
    fileName: { fontSize:'14px', fontWeight:600, color:'#f1f5f9', marginBottom:'3px' },
    fileMeta: { fontSize:'12px', color:'#94a3b8' },
    playIcon: { color:'#475569', fontSize:'14px' },

    /* Lock */
    lockBox: { background:'rgba(245,158,11,.06)',
        border:'1px solid rgba(245,158,11,.2)',
        borderRadius:'10px', padding:'16px',
        color:'#f59e0b', fontSize:'14px', fontWeight:600,
        textAlign:'center', marginBottom:'20px' },

    /* Upload */
    uploadSection: { background:'#0d1117', border:'1px solid #1f2937',
        borderRadius:'14px', padding:'22px', marginBottom:'20px' },
    uploadHint: { fontSize:'13px', color:'#94a3b8', marginBottom:'14px' },
    uploadBox: { display:'flex', gap:'12px', alignItems:'center' },
    uploadLabel: { flex:1, padding:'13px', background:'#111827',
        border:'2px dashed #374151', borderRadius:'10px',
        color:'#94a3b8', cursor:'pointer', fontSize:'13px',
        textAlign:'center', display:'block' },
    btnUpload: { padding:'12px 20px', background:'#3b82f6',
        border:'none', color:'white', borderRadius:'9px',
        cursor:'pointer', fontSize:'13px', fontWeight:700, whiteSpace:'nowrap' },
    uploadMsg: { marginTop:'10px', fontSize:'13px', fontWeight:600 },
    btnBack: { padding:'10px 20px', background:'transparent',
        border:'1px solid #374151', color:'#94a3b8',
        borderRadius:'8px', cursor:'pointer', fontSize:'13px' },

    /* ── Modal viewer ── */
    modalOverlay: {
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn .18s ease',
    },
    modalContent: {
        background: '#0d1117',
        border: '1px solid #1f2937',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,.7)',
    },
    modalHeader: {
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #1f2937',
        flexShrink: 0,
    },
    modalTitleRow: {
        display: 'flex', alignItems: 'center', gap: '10px',
        overflow: 'hidden',
    },
    modalTypeBadge: {
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '11px', fontWeight: 700, flexShrink: 0,
    },
    modalTitle: {
        fontFamily: 'Syne', fontSize: '15px', fontWeight: 700,
        color: '#f1f5f9', margin: 0,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    },
    modalCloseBtn: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '34px', height: '34px',
        background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)',
        color: '#ef4444', borderRadius: '8px',
        cursor: 'pointer', flexShrink: 0,
        transition: 'background .15s',
    },
    modalBody: {
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        minHeight: 0,  /* important pour que flex fonctionne dans Firefox */
    },

    /* Lecteur vidéo */
    videoPlayer: {
        width: '100%',
        maxHeight: '65vh',
        background: '#000',
        display: 'block',
    },

    /* Visionneuse PDF */
    pdfViewer: {
        flex: 1,
        width: '100%',
        height: '65vh',
        border: 'none',
        display: 'block',
        background: '#fff',
    },

    modalFooter: {
        display: 'flex', justifyContent: 'flex-end', gap: '10px',
        padding: '14px 20px',
        borderTop: '1px solid #1f2937',
        flexShrink: 0,
    },
    downloadBtn: {
        padding: '9px 18px',
        background: 'rgba(59,130,246,.12)',
        border: '1px solid rgba(59,130,246,.3)',
        color: '#3b82f6',
        borderRadius: '8px',
        fontSize: '13px', fontWeight: 600,
        cursor: 'pointer', textDecoration: 'none',
        display: 'inline-flex', alignItems: 'center', gap: '6px',
    },
    closeFooterBtn: {
        padding: '9px 18px',
        background: 'transparent',
        border: '1px solid #374151',
        color: '#94a3b8',
        borderRadius: '8px',
        fontSize: '13px', fontWeight: 600,
        cursor: 'pointer',
    },

    /* PDF chargement */
    pdfLoader: {
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '14px', padding: '40px',
        background: '#0d1117',
    },
    spinner: {
        width: '36px', height: '36px',
        border: '3px solid #1f2937',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    pdfFallback: {
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '8px', padding: '40px',
        background: '#0d1117',
        textAlign: 'center',
    },
};

/* Inject keyframes once */
if (typeof document !== 'undefined' && !document.getElementById('cd-keyframes')) {
    const _s = document.createElement('style');
    _s.id = 'cd-keyframes';
    _s.textContent = `
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
    `;
    document.head.appendChild(_s);
}
