import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import { Sparkles, Search, BookOpen, User, BarChart2, Loader2 } from "lucide-react";

const levelColors = {
    BEGINNER:     { bg: "#dcfce7", text: "#166534" },
    INTERMEDIATE: { bg: "#fef9c3", text: "#854d0e" },
    ADVANCED:     { bg: "#fee2e2", text: "#991b1b" },
};

const levelLabels = {
    BEGINNER:     "Débutant",
    INTERMEDIATE: "Intermédiaire",
    ADVANCED:     "Avancé",
};

function CourseRecoCard({ course }) {
    const navigate = useNavigate();
    const color = levelColors[course.level] || levelColors.BEGINNER;
    const score = Math.round((course.score || 0) * 100);

    return (
        <div
            onClick={() => navigate(`/courses/${course.courseId}`)}
            style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                border: "1px solid #f0f0f0",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
            }}
        >
            {/* Score de similarité */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
        <span style={{
            background: color.bg, color: color.text,
            padding: "3px 10px", borderRadius: "20px",
            fontSize: "12px", fontWeight: "600"
        }}>
          {levelLabels[course.level] || course.level}
        </span>
                <span style={{
                    background: "#f0f4ff", color: "#4f46e5",
                    padding: "3px 10px", borderRadius: "20px",
                    fontSize: "12px", fontWeight: "600"
                }}>
          ✦ {score}% match
        </span>
            </div>

            {/* Titre */}
            <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>
                {course.title}
            </h3>

            {/* Catégorie */}
            {course.category && (
                <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#64748b" }}>
                    📂 {course.category}
                </p>
            )}

            {/* Prof */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: "13px" }}>
                <User size={14} />
                <span>{course.profName}</span>
            </div>
        </div>
    );
}

export default function Recommendations() {
    const [activeTab, setActiveTab]         = useState("auto");
    const [autoReco, setAutoReco]           = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [query, setQuery]                 = useState("");
    const [loadingAuto, setLoadingAuto]     = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [error, setError]                 = useState("");

    // Charger les recommandations auto au montage
    useEffect(() => {
        const fetchAutoRecommendations = async () => {
            setLoadingAuto(true);
            setError("");
            try {
                const res = await axiosInstance.get("/api/recommendations/auto");
                setAutoReco(res.data);
            } catch {
                setError("Impossible de charger les recommandations.");
            } finally {
                setLoadingAuto(false);
            }
        };

        fetchAutoRecommendations();
    }, []); // Pas de dépendances, s'exécute uniquement au montage

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoadingSearch(true);
        setError("");
        try {
            const res = await axiosInstance.get("/api/recommendations/search", {
                params: { query }
            });
            setSearchResults(res.data);
        } catch {
            setError("Erreur lors de la recherche.");
        } finally {
            setLoadingSearch(false);
        }
    };

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 20px" }}>

            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <div style={{
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        borderRadius: "12px", padding: "10px", display: "flex"
                    }}>
                        <Sparkles size={24} color="#fff" />
                    </div>
                    <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "800", color: "#1e293b" }}>
                        Recommandations IA
                    </h1>
                </div>
                <p style={{ margin: 0, color: "#64748b", fontSize: "15px" }}>
                    Cours sélectionnés pour vous grâce à l'intelligence artificielle
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
                {[
                    { key: "auto",   label: "Pour vous",   icon: <Sparkles size={16} /> },
                    { key: "search", label: "Rechercher",  icon: <Search size={16} />   },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "10px 20px", borderRadius: "10px", border: "none",
                            cursor: "pointer", fontWeight: "600", fontSize: "14px",
                            transition: "all 0.2s",
                            background: activeTab === tab.key
                                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                                : "#f1f5f9",
                            color: activeTab === tab.key ? "#fff" : "#64748b",
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {error && (
                <div style={{
                    background: "#fee2e2", color: "#991b1b", padding: "12px 16px",
                    borderRadius: "8px", marginBottom: "20px", fontSize: "14px"
                }}>
                    {error}
                </div>
            )}

            {/* Tab : Pour vous */}
            {activeTab === "auto" && (
                <div>
                    {loadingAuto ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
                            <Loader2 size={32} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
                        </div>
                    ) : autoReco.length === 0 ? (
                        <div style={{
                            textAlign: "center", padding: "60px 20px",
                            background: "#f8fafc", borderRadius: "12px", color: "#94a3b8"
                        }}>
                            <BookOpen size={48} style={{ marginBottom: "12px", opacity: 0.4 }} />
                            <p style={{ fontSize: "16px", fontWeight: "600" }}>
                                Inscrivez-vous à des cours pour obtenir des recommandations personnalisées !
                            </p>
                        </div>
                    ) : (
                        <>
                            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
                                <BarChart2 size={14} style={{ verticalAlign: "middle" }} />{" "}
                                {autoReco.length} cours recommandés d'après votre parcours
                            </p>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                                {autoReco.map(course => (
                                    <CourseRecoCard key={course.courseId} course={course} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Tab : Recherche sémantique */}
            {activeTab === "search" && (
                <div>
                    <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Ex: développement web React, machine learning Python..."
                            style={{
                                flex: 1, padding: "12px 16px", borderRadius: "10px",
                                border: "2px solid #e2e8f0", fontSize: "15px", outline: "none",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={e => e.target.style.borderColor = "#6366f1"}
                            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                        />
                        <button
                            type="submit"
                            disabled={loadingSearch}
                            style={{
                                padding: "12px 24px", borderRadius: "10px", border: "none",
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                color: "#fff", fontWeight: "600", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: "8px",
                            }}
                        >
                            {loadingSearch
                                ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                                : <Search size={18} />}
                            Rechercher
                        </button>
                    </form>

                    {searchResults.length === 0 && !loadingSearch ? (
                        <div style={{
                            textAlign: "center", padding: "60px 20px",
                            background: "#f8fafc", borderRadius: "12px", color: "#94a3b8"
                        }}>
                            <Search size={48} style={{ marginBottom: "12px", opacity: 0.4 }} />
                            <p style={{ fontSize: "16px" }}>
                                Tapez une recherche pour découvrir des cours correspondants
                            </p>
                        </div>
                    ) : (
                        <>
                            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
                                {searchResults.length} résultat(s) pour « {query} »
                            </p>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                                {searchResults.map(course => (
                                    <CourseRecoCard key={course.courseId} course={course} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* CSS animation pour le spinner */}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}