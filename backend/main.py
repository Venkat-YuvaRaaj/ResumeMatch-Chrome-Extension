
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from docx import Document
import pymupdf
import io

app = FastAPI(title="ResumeMatch API")

# Allow our React development frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "ResumeMatch API is running!"}


@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    filename = (resume.filename or "").lower()
    content = await resume.read()

    if not content:
        raise HTTPException(status_code=400, detail="Resume is empty")

    try:
        if filename.endswith(".pdf"):
            with pymupdf.open(stream=content, filetype="pdf") as pdf:
                resume_text = "\n".join(
                    page.get_text() for page in pdf
                )

        elif filename.endswith(".docx"):
            document = Document(io.BytesIO(content))
            resume_text = "\n".join(
                paragraph.text for paragraph in document.paragraphs
            )

        else:
            raise HTTPException(
                status_code=400,
                detail="Only PDF and DOCX files are supported"
            )

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read the uploaded resume"
        )

    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="No readable text found in resume"
        )

    return {
        "filename": resume.filename,
        "resume_text": resume_text,
        "job_description": job_description,
        "message": "Resume text extracted successfully"
    }
