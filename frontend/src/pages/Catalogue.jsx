import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CourseCard from '../components/CourseCard';
import api from '../api/axios';
import { Search } from 'lucide-react';

export default function Catalogue() {
    const [courses, setCourses] = useState([]);
    const [search, setSearch]   = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    // 🔹 Fetch des cours
    useEffect(() => {
        api.get('/api/courses')
            .then(r => setCourses(r.data))
            .catch(() => setCourses([]))
            .finally(() => setLoading(false));
    }, []);

    // 🔹 Filtrage (SANS useEffect ❌)
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return courses.filter(c =>
            c.title?.toLowerCase().includes(q) ||
            c.category?.toLowerCase().includes(q)
        );
    }, [search, courses]);

    // 🔹 Inscription
    const handleEnroll = async (course) => {
        try {
            await api.post(`/api/enrollments/${course.id}/start`);
            navigate('/mes-cours');
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur inscription');
        }
    };

    return (
        <div className="page">
            <Navbar/>

            <div style={s.container}>
                {/* Header */}
                <div style={s.header} className="fadeUp">
                    <h1 style={s.title}>Catalogue des cours</h1>
                    <p style={s.sub}>{filtered.length} cours disponibles</p>
                </div>

                {/* Search */}
                <div style={s.searchWrap} className="fadeUp">
                    <Search size={18} color="#475569"/>
                    <input
                        style={s.search}
                        placeholder="Rechercher un cours..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* Content */}
                {loading ? (
                    <p style={s.loading}>Chargement...</p>
                ) : filtered.length === 0 ? (
                    <p style={s.empty}>Aucun cours trouvé</p>
                ) : (
                    <div style={s.grid}>
                        {filtered.map((course, i) => (
                            <div
                                key={course.id}
                                className="fadeUp"
                                style={{ animationDelay: `${i * 0.06}s` }}
                            >
                                <CourseCard
                                    course={course}
                                    action={{
                                        label: "S'inscrire →",
                                        call: handleEnroll
                                    }}
                                />

                                <button
                                    style={s.enrollBtn}
                                    onClick={() => handleEnroll(course)}
                                >
                                    S'inscrire à ce cours →
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// 🎨 Styles
const s = {
    container: {
        padding: '32px',
        maxWidth: '1100px',
        margin: '0 auto'
    },
    header: {
        marginBottom: '24px'
    },
    title: {
        fontFamily: 'Syne',
        fontSize: '30px',
        fontWeight: 800,
        color: '#f1f5f9',
        marginBottom: '6px'
    },
    sub: {
        fontSize: '14px',
        color: '#94a3b8'
    },
    searchWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: '#0d1117',
        border: '1px solid #374151',
        borderRadius: '10px',
        padding: '12px 16px',
        marginBottom: '28px'
    },
    search: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        color: '#f1f5f9',
        fontSize: '14px',
        outline: 'none'
    },
    loading: {
        color: '#94a3b8',
        textAlign: 'center',
        padding: '60px'
    },
    empty: {
        color: '#475569',
        textAlign: 'center',
        padding: '60px',
        border: '1px dashed #1f2937',
        borderRadius: '12px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
    },
    enrollBtn: {
        width: '100%',
        marginTop: '8px',
        padding: '10px',
        background: 'rgba(245,158,11,.1)',
        border: '1px solid rgba(245,158,11,.3)',
        color: '#f59e0b',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 600
    }
};