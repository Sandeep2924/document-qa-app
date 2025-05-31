import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
import openai
from langchain.document_loaders import TextLoader, PyPDFLoader, Docx2txtLoader

# Load environment variables from .env
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise Exception("OPENAI_API_KEY not found. Please set it in .env file")

openai.api_key = OPENAI_API_KEY

app = FastAPI()

# Allow frontend to connect (adjust origins accordingly)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for documents content (for demo purpose)
documents_text = ""

# Request model for question
class QuestionRequest(BaseModel):
    text: str

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global documents_text

    filename = file.filename.lower()
    contents = await file.read()

    # Load document content based on type
    try:
        if filename.endswith(".txt"):
            loader = TextLoader(file.file)
            docs = loader.load()
        elif filename.endswith(".pdf"):
            # Save file temporarily for PyPDFLoader
            temp_path = f"temp_{filename}"
            with open(temp_path, "wb") as f:
                f.write(contents)
            loader = PyPDFLoader(temp_path)
            docs = loader.load()
            os.remove(temp_path)
        elif filename.endswith(".docx"):
            # Save file temporarily for Docx2txtLoader
            temp_path = f"temp_{filename}"
            with open(temp_path, "wb") as f:
                f.write(contents)
            loader = Docx2txtLoader(temp_path)
            docs = loader.load()
            os.remove(temp_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {e}")

    # Extract plain text from docs
    documents_text = "\n".join([doc.page_content for doc in docs])

    return {"message": f"Uploaded and processed {filename}"}

@app.post("/ask")
async def ask_question(question: QuestionRequest):
    global documents_text
    if not documents_text:
        raise HTTPException(status_code=400, detail="No document uploaded yet")

    prompt = f"Answer the question based on the following document:\n\n{documents_text}\n\nQuestion: {question.text}\nAnswer:"

    try:
        response = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt,
            temperature=0,
            max_tokens=500,
        )
        answer = response.choices[0].text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI API error: {e}")

    return {"answer": answer}

@app.get("/")
def read_root():
    return {"message": "Document Q&A API is running"}
