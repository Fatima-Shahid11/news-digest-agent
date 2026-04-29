from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
sys.path.append(".")
from agent import build_graph

app = FastAPI(title="News Digest Agent")

app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

agent = build_graph()

class DigestRequest(BaseModel):
    topics: list[str]

@app.post("/digest")
def generate_digest(req: DigestRequest):
    result = agent.invoke({
        "topics":   req.topics,
        "articles": [],
        "filtered": [],
        "summary":  "",
        "grade":    "",
        "rewrites": 0
    })
    return {
        "summary":  result["summary"],
        "grade":    result["grade"],
        "rewrites": result["rewrites"],
        "total_articles":    len(result["articles"]),
        "filtered_articles": len(result["filtered"])
    }

@app.get("/health")
def health():
    return {"status": "ok"}