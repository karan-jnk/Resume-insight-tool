import pdfplumber
from sarvamai import SarvamAI
from dotenv import load_dotenv
import os
from collections import Counter

# Init client
load_dotenv()
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
client = SarvamAI(api_subscription_key=SARVAM_API_KEY)

# Extract text from PDF
def extract_text_from_pdf(file) -> str:
    text = ""
    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text.strip()

# Fallback: Top 5 most frequent words
def get_top_words(text: str):
    words = [w.lower() for w in text.split() if w.isalpha()]
    counter = Counter(words)
    # return list of words instead of raw string
    return [word for word, _ in counter.most_common(5)]

# Placeholder for AI summarization
import json
import re

def generate_summary(text: str):
    try:
        prompt = f"""
        You are an ATS-style resume evaluator. Analyze the following resume text and return a structured JSON response.

        📊 Resume Evaluation Rubric (0–100 per category)
        1. Relevance – Alignment with target role.
        2. Keyword Optimization – Use of industry-specific keywords and ATS phrasing.
        3. Formatting & Presentation – Layout, readability, and ATS-friendliness.
        4. Achievements & Qualifications – Measurable impact, certifications, degrees.
        5. Brevity & Clarity – Conciseness and clarity.

        🏆 Final Weighted Score
        - Relevance + Achievements count double.
        - Provide overall score (0–100).

        ✅ Additional Insights
        - Concise summary of candidate (2–3 sentences).
        - Key technical skills (bullet list).
        - Work experience highlights (bullet list).
        - Key projects (bullet list).
        - Academic achievements (bullet list).

        🛠 Recommendations
        - 3–5 actionable suggestions to improve resume.

        🔎 Final Verdict
        - Classify as Strong, Average, or Weak.

        Resume Text:
        {text}

        Return JSON strictly in this format:
        {{
          "scores": {{
            "relevance": <int>,
            "keyword_optimization": <int>,
            "formatting_presentation": <int>,
            "achievements_qualifications": <int>,
            "brevity_clarity": <int>,
            "final_score": <int>
          }},
          "summary": "<2–3 sentence candidate summary>",
          "technical_skills": ["skill1", "skill2", ...],
          "work_experience": ["highlight1", "highlight2", ...],
          "key_projects": ["project1", "project2", ...],
          "academic_achievements": ["achievement1", "achievement2", ...],
          "recommendations": ["tip1", "tip2", "tip3"],
          "verdict": "Strong | Average | Weak"
        }}
        """

        response = client.chat.completions(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1200,
            temperature=0.3
        )
        raw_output = response.choices[0].message.content.strip()

        # Extract JSON from response (in case AI adds extra text)
        match = re.search(r"\{.*\}", raw_output, re.DOTALL)
        if not match:
            raise ValueError("No JSON found in AI response")
        
        json_str = match.group(0)
        parsed = json.loads(json_str)  # Convert to Python dict

        return parsed

    except Exception as e:
        print("Sarvam AI Error:", str(e))
        return None
