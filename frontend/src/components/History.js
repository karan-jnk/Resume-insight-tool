import React, { useState, useRef, useEffect } from "react";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

function History({ history }) {
  const [expanded, setExpanded] = useState(null);
  const expandedRef = useRef(null);

  const scoreColors = {
    relevance: "#2563eb",
    keyword_optimization: "#7c3aed",
    formatting_presentation: "#f59e0b",
    achievements_qualifications: "#10b981",
    brevity_clarity: "#ef4444",
    final_score: "#0ea5e9",
  };

  // verdict pill color
  const getVerdictStyle = (verdict) => {
    if (!verdict) return "bg-gray-100 text-gray-700";
    const v = verdict.toLowerCase();
    if (v.includes("strong")) return "bg-green-100 text-green-800";
    if (v.includes("average")) return "bg-yellow-100 text-yellow-800";
    if (v.includes("weak")) return "bg-red-100 text-red-800";
    return "bg-blue-100 text-blue-800";
  };

  // Smooth scroll into view when a card expands
  useEffect(() => {
    if (expandedRef.current) {
      expandedRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [expanded]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        📜 Upload History
      </h2>
      <ul className="space-y-4">
        {history.map((doc, idx) => {
          const isOpen = expanded === idx;
          return (
            <li
              key={doc.doc_id}
              ref={isOpen ? expandedRef : null}
              className="bg-white rounded-xl border shadow-md overflow-hidden transition hover:shadow-lg"
            >
              {/* Clickable header */}
              <div
                onClick={() => setExpanded(isOpen ? null : idx)}
                className="cursor-pointer p-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="font-medium flex items-center gap-2">
                  📄 {doc.filename}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">
                    {new Date(doc.time).toLocaleString()}
                  </div>

                  {/* Rotating chevron */}
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </motion.div>
                </div>
              </div>

              {/* Animated expandable section */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="border-t overflow-hidden bg-gray-50"
                  >
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="p-5 space-y-6"
                    >
                      {/* Download button */}
                      <div className="flex justify-end">
                        <a
                          className="px-3 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm"
                          href={`${API_BASE_URL}/download-report/${doc.doc_id}`}
                        >
                          Download PDF
                        </a>
                      </div>

                      {/* Verdict pill */}
                      {doc.insights.verdict && (
                        <div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getVerdictStyle(
                              doc.insights.verdict
                            )} shadow`}
                          >
                            Verdict: {doc.insights.verdict}
                          </span>
                        </div>
                      )}

                      {/* Scores */}
                      {doc.insights.scores && (
                        <div>
                          <h3 className="text-lg font-semibold text-blue-700 mb-3">
                            📊 Evaluation Scores
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(doc.insights.scores).map(([k, v]) => (
                              <HoverableScoreCard
                                key={k}
                                label={k}
                                value={v}
                                highlight={k === "final_score"}
                                color={scoreColors[k]}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Summary */}
                      {doc.insights.summary && (
                        <div>
                          <h3 className="text-lg font-semibold text-blue-700 mb-2">
                            ✅ Summary
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            {doc.insights.summary}
                          </p>
                        </div>
                      )}

                      {/* Skills */}
                      {doc.insights.technical_skills?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-blue-700 mb-2">
                            🛠 Skills
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {doc.insights.technical_skills.map((skill, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium shadow-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Work Experience */}
                      {doc.insights.work_experience?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-blue-700 mb-2">
                            💼 Work Experience
                          </h3>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {doc.insights.work_experience.map((exp, i) => (
                              <li key={i}>{exp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Key Projects */}
                      {doc.insights.key_projects?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-blue-700 mb-2">
                            🚀 Key Projects
                          </h3>
                          <ul className="list-decimal list-inside text-gray-700 space-y-1">
                            {doc.insights.key_projects.map((proj, i) => (
                              <li key={i}>{proj}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Academic Achievements */}
                      {doc.insights.academic_achievements?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-blue-700 mb-2">
                            🎓 Academic Achievements
                          </h3>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {doc.insights.academic_achievements.map((ach, i) => (
                              <li key={i}>{ach}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {doc.insights.recommendations?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-blue-700 mb-2">
                            📝 Recommendations
                          </h3>
                          <ul className="list-disc list-inside text-gray-700 space-y-1">
                            {doc.insights.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* Reusable hoverable score card */
function HoverableScoreCard({ label, value, highlight, color }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    let frame;
    if (hovered) {
      const duration = 800;
      const startTime = performance.now();

      const animate = (time) => {
        const progress = Math.min((time - startTime) / duration, 1);
        setDisplayValue(Math.floor(progress * value));
        if (progress < 1) {
          frame = requestAnimationFrame(animate);
        }
      };
      frame = requestAnimationFrame(animate);
    } else {
      setDisplayValue(value);
    }
    return () => cancelAnimationFrame(frame);
  }, [hovered, value]);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`p-4 rounded-xl shadow flex flex-col items-center transition-all ${
        highlight
          ? "bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-500"
          : "bg-white"
      }`}
    >
      <div className="w-20 h-20 mb-2">
        <CircularProgressbar
          value={displayValue}
          text={`${displayValue}`}
          strokeWidth={10}
          styles={buildStyles({
            textSize: "14px",
            pathColor: highlight ? "#0ea5e9" : color,
            textColor: "#1f2937",
            trailColor: "#e5e7eb",
          })}
        />
      </div>
      <p className="mt-1 text-sm font-semibold text-gray-700 text-center">
        {label.replace("_", " ").toUpperCase()}
      </p>
    </motion.div>
  );
}

export default History;
