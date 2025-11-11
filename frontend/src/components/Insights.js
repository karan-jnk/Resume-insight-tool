import React, { useMemo, useState, useEffect } from "react";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion } from "framer-motion";

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

// fallback markdown strip
const stripMarkdown = (text) =>
  text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/[*_`~]/g, "")
    .trim();

// Fallback: extract verdict from old text
const extractVerdictFromText = (md) => {
  const m = md.match(/final\s*verdict\s*:?\s*(.+)/i);
  return m ? stripMarkdown(m[1]).trim() : null;
};

function Insights({ insights }) {
  // determine if insights is JSON or plain string
  const data =
    typeof insights.insights === "object"
      ? insights.insights
      : { summary: insights.insights };

  const verdict = useMemo(() => {
    if (typeof insights.insights === "string") {
      return extractVerdictFromText(insights.insights);
    }
    return data.verdict || null;
  }, [insights, data]);

  // verdict pill color
  const verdictStyle = useMemo(() => {
    if (!verdict) return "bg-gray-100 text-gray-700";
    const v = verdict.toLowerCase();
    if (v.includes("strong")) return "bg-green-100 text-green-800";
    if (v.includes("average")) return "bg-yellow-100 text-yellow-800";
    if (v.includes("weak")) return "bg-red-100 text-red-800";
    return "bg-blue-100 text-blue-800";
  }, [verdict]);

  const scoreColors = {
    relevance: "#2563eb", // blue
    keyword_optimization: "#7c3aed", // purple
    formatting_presentation: "#f59e0b", // amber
    achievements_qualifications: "#10b981", // green
    brevity_clarity: "#ef4444", // red
    final_score: "#0ea5e9", // cyan
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-6 p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-gray-800"
        >
          Insights for {insights.filename}
        </motion.h2>

        {insights.doc_id && (
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={`${API_BASE_URL}/download-report/${insights.doc_id}`}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow hover:from-blue-600 hover:to-blue-800"
          >
            Download PDF
          </motion.a>
        )}
      </div>

      {/* Verdict */}
      {verdict && (
        <motion.div
          className="mt-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${verdictStyle} shadow`}
          >
            Verdict: {verdict}
          </span>
        </motion.div>
      )}

      {/* Scores with circular progress bars */}
      {data.scores && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-blue-700 mb-4">
            📊 Evaluation Scores
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Object.entries(data.scores).map(([k, v], i) => (
              <HoverableScoreCard
                key={k}
                label={k}
                value={v}
                delay={0.5 + i * 0.1}
                highlight={k === "final_score"}
                color={scoreColors[k]}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Summary */}
      {data.summary && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-lg font-semibold text-blue-700 mb-2">✅ Summary</h3>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </motion.div>
      )}

      {/* Technical Skills */}
      {data.technical_skills && data.technical_skills.length > 0 && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-lg font-semibold text-blue-700 mb-2">🛠 Skills</h3>
          <div className="flex flex-wrap gap-2">
            {data.technical_skills.map((skill, i) => (
              <motion.span
                key={i}
                whileHover={{ scale: 1.1 }}
                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium shadow-sm"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Work Experience */}
      {data.work_experience && data.work_experience.length > 0 && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            💼 Work Experience
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {data.work_experience.map((exp, i) => (
              <motion.li
                key={i}
                whileHover={{ x: 5 }}
                className="transition-all"
              >
                {exp}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Key Projects */}
      {data.key_projects && data.key_projects.length > 0 && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            🚀 Key Projects
          </h3>
          <ul className="list-decimal list-inside text-gray-700 space-y-1">
            {data.key_projects.map((proj, i) => (
              <motion.li key={i} whileHover={{ x: 5 }}>
                {proj}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Academic Achievements */}
      {data.academic_achievements && data.academic_achievements.length > 0 && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            🎓 Academic Achievements
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {data.academic_achievements.map((ach, i) => (
              <motion.li key={i} whileHover={{ x: 5 }}>
                {ach}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            📝 Recommendations
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {data.recommendations.map((rec, i) => (
              <motion.li key={i} whileHover={{ x: 5 }}>
                {rec}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}

/* Sub-component for hoverable circular progress */
function HoverableScoreCard({ label, value, delay, highlight, color }) {
  const [displayValue, setDisplayValue] = useState(value); // always show score
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    let frame;
    if (hovered) {
      let start = 0;
      const duration = 800; // ms
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
      setDisplayValue(value); // reset instantly
    }
    return () => cancelAnimationFrame(frame);
  }, [hovered, value]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`p-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ${
        highlight
          ? "bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-500"
          : "bg-gray-50"
      } flex flex-col items-center`}
    >
      <div className="w-24 h-24 mb-3">
        <CircularProgressbar
          value={displayValue}
          text={`${displayValue}`}
          strokeWidth={10}
          styles={buildStyles({
            textSize: "16px",
            pathColor: highlight ? "#0ea5e9" : color,
            textColor: "#1f2937",
            trailColor: "#e5e7eb",
          })}
        />
      </div>
      <p className="mt-2 text-sm font-semibold text-gray-700 text-center">
        {label.replace("_", " ").toUpperCase()}
      </p>
    </motion.div>
  );
}

export default Insights;
