# 🗞️ The Daily Digest

An AI-powered news digest agent built with LangGraph, FastAPI, and Next.js

![Next.js](https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-purple?style=flat)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)

## What is this?

The Daily Digest is an AI agent that fetches real-time news based on your topics of interest, filters out irrelevant articles, writes a clean newspaper-style digest, and self-corrects if the quality is not good enough.

## How it works

Built with **LangGraph** — a framework for building stateful AI agents. The agent follows this flow:

```
fetch news → filter relevant → summarize → grade quality → END
                                                  ↓ if bad
                                          rewrite → summarize again
```

Each step is a **node** in the graph. The agent automatically retries up to 2 times if the summary quality is poor.

## 🛠️ Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, JavaScript |
| Backend | Python, FastAPI |
| AI Agent | LangGraph, LangChain |
| LLM | OpenAI GPT-4o-mini |
| News | NewsAPI |

## 🚀 Getting started

1. Clone the repo
2. Add `.env` with `OPENAI_API_KEY` and `NEWS_API_KEY`
3. Run `pip install -r requirements.txt`
4. Run `uvicorn server:app --reload --port 8000`
5. Run `cd frontend && npm install && npm run dev`

## 📁 Project structure

- `agent.py` — LangGraph agent
- `server.py` — FastAPI backend
- `frontend/` — Next.js UI

## 👩‍💻 Author

**Fatima Shahid**
- GitHub: [@Fatima-Shahid11](https://github.com/Fatima-Shahid11)
- LinkedIn: [Fatima Shahid](https://www.linkedin.com/in/fatima-shahid-044430209/)
- Portfolio: [fatima-shahid.site](https://www.fatima-shahid.site/)
