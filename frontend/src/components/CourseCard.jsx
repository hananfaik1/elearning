import { Clock, BookOpen, BarChart2 } from 'lucide-react';

const levelColors = {
    BEGINNER:     { bg: 'rgba(16,185,129,.12)', color: '#10b981' },
    INTERMEDIATE: { bg: 'rgba(245,158,11,.12)', color: '#f59e0b' },
    ADVANCED:     { bg: 'rgba(239,68,68,.12)',  color: '#ef4444' },
};

export default function CourseCard({ course, action }) {
    const lc = levelColors[course.level] || levelColors.BEGINNER;

    return (
        <div style={s.card}>
            <div style={s.top}>
                <span style={s.category}>{course.category}</span>
                <span style={{ ...s.level, background: lc.bg, color: lc.color }}>
          {course.level}
        </span>
            </div>

            <h3 style={s.title}>{course.title}</h3>
            <p style={s.desc}>{course.description?.slice(0, 90)}...</p>

            <div style={s.meta}>
        <span style={s.metaItem}>
          <Clock size={13}/> {course.durationHours}h
        </span>
                <span style={s.metaItem}>
          <BookOpen size={13}/> {course.profName || 'Professeur'}
        </span>
            </div>

            {course.progressPercent !== undefined && (
                <div style={s.progressWrap}>
                    <div style={s.progressBar}>
                        <div style={{
                            ...s.progressFill,
                            width: `${course.progressPercent}%`
                        }}/>
                    </div>
                    <span style={s.progressLabel}>{course.progressPercent}%</span>
                </div>
            )}

            {action && (
                <button style={s.btn} onClick={() => action(course)}>
                    {action.label || 'Voir'}
                </button>
            )}
        </div>
    );
}

const s = {
    card: {
        background: '#111827', border: '1px solid #1f2937', borderRadius: '14px',
        padding: '20px', transition: 'all .25s', cursor: 'default',
        display: 'flex', flexDirection: 'column', gap: '10px',
    },
    top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    category: { fontSize: '11px', color: '#94a3b8', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '1px' },
    level: { padding: '3px 10px', borderRadius: '20px',
        fontSize: '11px', fontWeight: 700 },
    title: { fontFamily: 'Syne', fontSize: '16px',
        fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 },
    desc: { fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 },
    meta: { display: 'flex', gap: '16px' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '5px',
        fontSize: '12px', color: '#475569' },
    progressWrap: { display: 'flex', alignItems: 'center', gap: '10px' },
    progressBar: { flex: 1, background: '#1f2937', borderRadius: '4px', height: '5px' },
    progressFill: { background: '#f59e0b', height: '5px',
        borderRadius: '4px', transition: 'width .3s' },
    progressLabel: { fontSize: '12px', color: '#f59e0b', fontWeight: 600 },
    btn: {
        marginTop: '6px', padding: '10px', background: 'rgba(245,158,11,0.1)',
        border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b',
        borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
        fontWeight: 600, transition: 'all .2s', width: '100%',
    },
};