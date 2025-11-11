import uuid
import os
from io import BytesIO
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
from sqlalchemy import asc, desc, or_, String
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

import docx2txt  # ✅ for DOCX parsing

from .database import Base, engine, SessionLocal
from .models import Document
from .utils import extract_text_from_pdf, get_top_words, generate_summary

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency for DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Upload Resume (PDF + DOCX supported)
@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        filename = file.filename
        ext = os.path.splitext(filename)[-1].lower()

        # Save temp file
        contents = await file.read()
        temp_path = f"temp{ext}"
        with open(temp_path, "wb") as f:
            f.write(contents)

        text = ""
        if ext == ".pdf":
            with open(temp_path, "rb") as f:
                text = extract_text_from_pdf(f)
        elif ext == ".docx":
            text = docx2txt.process(temp_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF or DOCX.")

        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the file.")

        # Generate summary/insights
        summary = generate_summary(text)
        if not summary:  # fallback
            summary = {
                "fallback": "No structured summary generated",
                "top_keywords": get_top_words(text)
            }   

        # Store in DB
        doc_id = str(uuid.uuid4())
        new_doc = Document(id=doc_id, filename=filename, insights=summary)
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)

        return {
            "doc_id": doc_id,
            "filename": filename,
            "insights": summary,
            "time": new_doc.upload_time,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


# Fetch Insights
@app.get("/insights")
async def get_insights(
    doc_id: str = None,
    q: str = None,
    sort: str = "desc",
    db: Session = Depends(get_db)
):
    query = db.query(Document)

    if doc_id:
        doc = query.filter(Document.id == doc_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        return {
            "doc_id": doc.id,
            "filename": doc.filename,
            "insights": doc.insights,
            "time": doc.upload_time,
        }

    # ✅ Searching filename or JSON text
    if q:
        query = query.filter(
            or_(
                Document.filename.ilike(f"%{q}%"),
                Document.insights.cast(String).ilike(f"%{q}%")
            )
        )

    # ✅ Sorting
    if sort == "asc":
        query = query.order_by(asc(Document.upload_time))
    else:
        query = query.order_by(desc(Document.upload_time))

    docs = query.all()
    return [
        {
            "doc_id": d.id,
            "filename": d.filename,
            "insights": d.insights,
            "time": d.upload_time,
        }
        for d in docs
    ]


# Download Report
@app.get("/download-report/{doc_id}")
async def download_report(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    insights = doc.insights

    buffer = BytesIO()
    pdf = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []

    # Styles
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="CustomTitle", fontSize=20, leading=24,
                              alignment=1, textColor="#1f2937", spaceAfter=20))
    styles.add(ParagraphStyle(name="CustomHeading", fontSize=14, leading=18,
                              textColor="#2563eb", spaceBefore=12, spaceAfter=8))
    styles.add(ParagraphStyle(name="CustomNormal", fontSize=11, leading=14, spaceAfter=6))
    styles.add(ParagraphStyle(name="CustomBullet", fontSize=11, leading=14,
                              leftIndent=20, bulletIndent=10, spaceAfter=4))

    # Title
    elements.append(Paragraph("📄 Resume Insights Report", styles["CustomTitle"]))
    elements.append(Paragraph(f"<b>Document ID:</b> {doc.id}", styles["CustomNormal"]))
    elements.append(Paragraph(f"<b>Filename:</b> {doc.filename}", styles["CustomNormal"]))
    elements.append(Paragraph(f"<b>Uploaded At:</b> {doc.upload_time.strftime('%Y-%m-%d %H:%M:%S')}", styles["CustomNormal"]))
    elements.append(Spacer(1, 20))

    # Scores
    if "scores" in insights:
        elements.append(Paragraph("📊 Evaluation Scores", styles["CustomHeading"]))
        for k, v in insights["scores"].items():
            elements.append(Paragraph(f"{k.replace('_',' ').title()}: {v}", styles["CustomNormal"]))

    # Summary
    if "summary" in insights:
        elements.append(Paragraph("✅ Candidate Summary", styles["CustomHeading"]))
        elements.append(Paragraph(insights["summary"], styles["CustomNormal"]))

    # Skills
    if "technical_skills" in insights:
        elements.append(Paragraph("🛠 Key Technical Skills", styles["CustomHeading"]))
        for skill in insights["technical_skills"]:
            elements.append(Paragraph(skill, styles["CustomBullet"], bulletText="•"))

    # Work Experience
    if "work_experience" in insights:
        elements.append(Paragraph("💼 Work Experience Highlights", styles["CustomHeading"]))
        for w in insights["work_experience"]:
            elements.append(Paragraph(w, styles["CustomBullet"], bulletText="•"))

    # Academic
    if "academic_achievements" in insights:
        elements.append(Paragraph("🎓 Academic Achievements", styles["CustomHeading"]))
        for a in insights["academic_achievements"]:
            elements.append(Paragraph(a, styles["CustomBullet"], bulletText="•"))

    # Recommendations
    if "recommendations" in insights:
        elements.append(Paragraph("📝 Recommendations", styles["CustomHeading"]))
        for r in insights["recommendations"]:
            elements.append(Paragraph(r, styles["CustomBullet"], bulletText="•"))

    # Verdict
    if "verdict" in insights:
        elements.append(Paragraph("🔎 Final Verdict", styles["CustomHeading"]))
        elements.append(Paragraph(insights["verdict"], styles["CustomNormal"]))

    pdf.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=resume_report_{doc.filename}.pdf"},
    )
