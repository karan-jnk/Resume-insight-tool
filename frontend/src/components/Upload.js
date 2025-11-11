
import React, { useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

function Upload({ setInsights, setHistory, setActiveTab }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    setLoading(true);
    setProgressMsg("Parsing your resume...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate progress message change
      setTimeout(() => setProgressMsg("Analyzing content and extracting insights..."), 1200);

      const res = await fetch(`${API_BASE_URL}/upload-resume`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setInsights(data);
      setActiveTab && setActiveTab("insights");

      setProgressMsg("Fetching upload history...");
      const historyRes = await fetch(`${API_BASE_URL}/insights`);
      setHistory(await historyRes.json());
      setProgressMsg("");
    } catch (err) {
      setProgressMsg("");
      console.error("Upload failed", err);
      alert("Something went wrong while uploading.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center mt-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <h2 className="text-xl font-bold text-blue-700 mb-4 w-full text-left">Upload Your Resume</h2>
        <div className="w-full flex flex-col items-center gap-4">
          <label htmlFor="resume-upload" className="w-full cursor-pointer">
            <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition ${file ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`} style={{width: '100%'}}>
              <span className="text-3xl mb-2">📄</span>
              <span className="text-gray-700 font-medium break-words w-full text-center">{file ? file.name : "Choose PDF or DOCX file"}</span>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={e => setFile(e.target.files[0])}
                disabled={loading}
              />
            </div>
          </label>
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className={`w-full px-4 py-2 rounded-lg text-white font-semibold transition ${
              loading || !file
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <span>
                <svg className="inline mr-2 animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="4" opacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="4" strokeLinecap="round"/></svg>
                {progressMsg || "Uploading..."}
              </span>
            ) : (
              "Upload"
            )}
          </button>
        </div>
        {loading && (
          <div className="mt-6 w-full text-center">
            <span className="text-blue-600 font-medium animate-pulse">{progressMsg || "Uploading..."}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default Upload;
