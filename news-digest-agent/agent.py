from typing import TypedDict

class State(TypedDict):
    topics: list[str]       # user's interests e.g. ["AI", "startups"]
    articles: list[dict]    # raw articles fetched from NewsAPI
    filtered: list[dict]    # articles after filtering by interest
    summary: str            # final written digest
    grade: str              # "good" or "bad"
    rewrites: int           # how many times we rewrote the summary


import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Fetch all articles

def fetch_node(state: State) -> State:
    articles = []
    
    for topic in state["topics"]:
        url = "https://newsapi.org/v2/everything"
        params = {
            "q": topic,
            "apiKey": os.getenv("NEWS_API_KEY"),
            "pageSize": 5,
            "language": "en",
            "sortBy": "publishedAt"
        }
        response = requests.get(url, params=params)
        data = response.json()
        articles.extend(data.get("articles", []))
    
    return {**state, "articles": articles}


# Filter articles relevant to user's topics

from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

def filter_node(state: State) -> State:
    if not state["articles"]:
        return {**state, "filtered": []}

    # Build one prompt with ALL articles
    articles_text = ""
    for i, article in enumerate(state["articles"]):
        title = article.get("title", "")
        description = article.get("description", "")
        articles_text += f"{i}. {title} — {description}\n"

    prompt = f"""
    User is interested in: {state["topics"]}
    
    Here are {len(state["articles"])} articles. Reply with ONLY the numbers 
    of relevant articles as comma separated list e.g: 0,2,4
    If none are relevant reply with: none
    
    Articles:
    {articles_text}
    """

    result = llm.invoke(prompt)
    response = result.content.strip().lower()

    if response == "none":
        filtered = []
    else:
        try:
            indices = [int(x.strip()) for x in response.split(",")]
            filtered = [state["articles"][i] for i in indices if i < len(state["articles"])]
        except:
            filtered = []

    return {**state, "filtered": filtered}


# Summarise filtered articles

def summarize_node(state: State) -> State:
    articles = state["filtered"]
    
    if not articles:
        return {**state, "summary": "No relevant articles found for your topics."}
    
    articles_text = ""
    for i, article in enumerate(articles):
        title = article.get("title", "")
        description = article.get("description", "")
        articles_text += f"{i+1}. {title}\n{description}\n\n"
    
    prompt = f"""
    Write a clean, engaging news digest for someone interested in: {state["topics"]}
    
    Based on these articles:
    {articles_text}
    
    Format it as:
    - A short intro line
    - One paragraph per article
    - A closing line
    """
    
    result = llm.invoke(prompt)
    
    return {**state, "summary": result.content}


# Grade the summary

def grade_node(state: State) -> State:
    prompt = f"""
    You are grading a news digest summary.
    
    Topics the user cares about: {state["topics"]}
    
    Summary written:
    {state["summary"]}
    
    Is this summary well written, relevant and informative?
    Reply with ONE word only: good or bad
    """
    
    result = llm.invoke(prompt)
    
    grade = "good" if "good" in result.content.lower() else "bad"
    
    return {**state, "grade": grade}


# Rewrite summary if not good enough

def rewrite_node(state: State) -> State:
    prompt = f"""
    This news digest summary was not good enough. Rewrite it to be 
    more engaging, clear and relevant to these topics: {state["topics"]}
    
    Previous bad summary:
    {state["summary"]}
    
    Write a better version:
    """
    
    result = llm.invoke(prompt)
    
    return {**state, "summary": result.content, "rewrites": state["rewrites"] + 1}


# Conditional edge

from typing import Literal

def route_grade(state: State) -> Literal["rewrite", "__end__"]:
    if state["grade"] == "good":
        return "__end__"
    
    if state["rewrites"] >= 2:
        return "__end__"
    
    return "rewrite"


# Create a StateGraph now

from langgraph.graph import StateGraph, END

def build_graph():
    graph = StateGraph(State)

    # Add all nodes
    graph.add_node("fetch",     fetch_node)
    graph.add_node("filter",    filter_node)
    graph.add_node("summarize", summarize_node)
    graph.add_node("grade",     grade_node)
    graph.add_node("rewrite",   rewrite_node)

    # Set starting node
    graph.set_entry_point("fetch")

    # Connect nodes with edges
    graph.add_edge("fetch",     "filter")
    graph.add_edge("filter",    "summarize")
    graph.add_edge("summarize", "grade")
    graph.add_edge("rewrite",   "summarize")

    # Conditional edge after grade
    graph.add_conditional_edges("grade", route_grade, {
        "rewrite": "rewrite",
        "__end__": END
    })

    return graph.compile()


if __name__ == "__main__":
    agent = build_graph()
    
    result = agent.invoke({
        "topics":   ["artificial intelligence", "Pakistan tech"],
        "articles": [],
        "filtered": [],
        "summary":  "",
        "grade":    "",
        "rewrites": 0
    })
    
    print("\n===== ARTICLES FOUND =====\n")
    print(f"Total fetched:   {len(result['articles'])}")
    print(f"After filtering: {len(result['filtered'])}")
    print("\n===== YOUR NEWS DIGEST =====\n")
    print(result["summary"])
    print("\n===== GRADE =====\n")
    print(result["grade"])
    print("\n===== REWRITES =====\n")
    print(result["rewrites"])