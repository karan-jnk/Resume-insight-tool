import React, { useState, useEffect } from "react";
import Upload from "./components/Upload";
import Insights from "./components/Insights";
import History from "./components/History";

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

function App() {
  const [insights, setInsights] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("home"); // default to home
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("desc");

  const fetchHistory = async (query = "", sortOrder = "desc") => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (sortOrder) params.set("sort", sortOrder);
    const res = await fetch(
      `${API_BASE_URL}/insights?${params.toString()}`
    );
    const data = await res.json();
    setHistory(data);
  };

  useEffect(() => {
    fetchHistory(q, sort);
  }, [q, sort]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          📄 AI Resume Insight Tool
        </h1>

        {/* Upload always visible */}
        <Upload setInsights={setInsights} setHistory={setHistory} setActiveTab={setActiveTab} />

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-300">
          <nav className="flex space-x-6">
            <button
              onClick={() => setActiveTab("home")}
              className={`pb-2 ${
                activeTab === "home"
                  ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`pb-2 ${
                activeTab === "insights"
                  ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Latest Insights
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-2 ${
                activeTab === "history"
                  ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              History
            </button>
          </nav>
        </div>

        {/* Toolbar for History tab */}
        {activeTab === "history" && (
          <div className="mt-4 flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search filename or content…"
              className="flex-1 px-3 py-2 border rounded-lg bg-white"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-white"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>
        )}

        {/* Tab content */}
        <div className="mt-6">
          {/* Home Page */}
          {activeTab === "home" && (
            <div className="bg-white p-8 rounded-2xl shadow-md space-y-6">
              <h2 className="text-2xl font-semibold text-blue-700">
                Welcome to AI Resume Insight Tool 🚀
              </h2>
              <p className="text-gray-700 leading-relaxed">
                This tool helps you analyze and optimize your resume with
                AI-powered evaluation. Upload your CV and get insights on
                structure, clarity, achievements, and keyword optimization.
              </p>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  How it works:
                </h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-1">
                  <li>Upload your resume using the upload section above.</li>
                  <li>
                    Get instant insights on formatting, keywords, and
                    achievements.
                  </li>
                  <li>
                    Review your final score and personalized recommendations.
                  </li>
                  <li>
                    Track your previous uploads anytime in the <b>History</b>{" "}
                    tab.
                  </li>
                </ol>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-700 font-medium">
                  💡 Tip: Keep updating your resume with the suggestions to
                  steadily improve your final score!
                </p>
              </div>
            </div>
          )}

          {activeTab === "insights" && (
          insights ? (
            <Insights insights={insights} />
          ) : (
            <div className="text-center space-y-8">
              {/* Hero Section */}
              <div className="max-w-2xl mx-auto">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  📄 AI Resume Insight Tool
                </h2>
                <p className="text-gray-600 text-lg">
                  Get instant feedback on your resume with AI-powered analysis.  
                  Improve formatting, keyword optimization, and highlight your achievements — all in one place.
                </p>
              </div>

              {/* Steps Section */}
              <div className="grid md:grid-cols-3 gap-6 mt-10">
                <div className="p-6 bg-white shadow rounded-2xl hover:shadow-lg transition">
                  <div className="text-3xl mb-3">⬆️</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Step 1: Upload</h3>
                  <p className="text-gray-600 text-sm">
                    Upload your resume in PDF/DOCX format to begin the analysis.
                  </p>
                </div>
                <div className="p-6 bg-white shadow rounded-2xl hover:shadow-lg transition">
                  <div className="text-3xl mb-3">🤖</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Step 2: Analyze</h3>
                  <p className="text-gray-600 text-sm">
                    Our AI evaluates relevance, keywords, formatting, and achievements.
                  </p>
                </div>
                <div className="p-6 bg-white shadow rounded-2xl hover:shadow-lg transition">
                  <div className="text-3xl mb-3">📈</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Step 3: Improve</h3>
                  <p className="text-gray-600 text-sm">
                    View detailed insights, track versions, and boost your final score.
                  </p>
                </div>
              </div>

              {/* Call to Action */}
              <div className="mt-10">
                <p className="text-gray-700 text-lg font-medium mb-4">
                  Ready to optimize your resume? 🚀
                </p>
                <p className="text-gray-500">
                  Upload your resume above and get instant insights.
                </p>
              </div>
            </div>
          )
        )}

          {/* History Page */}
          {activeTab === "history" && <History history={history} />}
        </div>
      </div>
    </div>
  );
}

export default App;
