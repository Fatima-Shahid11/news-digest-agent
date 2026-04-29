"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [topics, setTopics] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    }));
  }, []);

  async function generateDigest() {
    if (!topics.trim()) return setError("Please enter at least one topic!");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics: topics.split(",").map(t => t.trim()) })
      });
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError("Could not connect to server!");
    }
    setLoading(false);
  }

  const formatSummary = (text) => {
    if (!text) return { headline: "", paragraphs: [] };
    const lines = text.replace(/\*\*/g, "").split("\n").filter(l => l.trim());
    return { headline: lines[0], paragraphs: lines.slice(1) };
  };

  const { headline, paragraphs } = formatSummary(data?.summary);

  return (
    <main style={{ background: "#f4ede0", minHeight: "100vh", fontFamily: "Georgia, serif" }}>

      {/* Top rules */}
      <div style={{ maxWidth: "860px", margin: "0 auto", paddingTop: "2.5rem" }}>
        <div style={{ borderTop: "6px solid #2c1810" }} />
        <div style={{ borderTop: "2px solid #2c1810", marginTop: "4px" }} />
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", maxWidth: "860px", margin: "0 auto", padding: "2rem 1rem 1.5rem" }}>
        <p style={{ color: "#7a5c3e", fontSize: "0.75rem", letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 0.75rem" }}>
          ✦ &nbsp; All The News That's Fit To Digest &nbsp; ✦
        </p>
        <h1 style={{ fontSize: "6rem", fontWeight: 900, color: "#2c1810", margin: 0, lineHeight: 1 }}>
          The Daily Digest
        </h1>
        <div style={{ margin: "10px 0px 0px 0px", padding: "0.4rem 0", color: "#7a5c3e", fontSize: "0.78rem", letterSpacing: "2px" }}>
          Vol. I &nbsp;·&nbsp; {today} &nbsp;·&nbsp; Price: Free
        </div>
      </div>

      {/* Bottom rules */}
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ borderTop: "2px solid #2c1810" }} />
        <div style={{ borderTop: "6px solid #2c1810", marginTop: "4px" }} />
      </div>

      {/* Input */}
      <div style={{ maxWidth: "860px", margin: "3rem auto", padding: "0 1rem", textAlign: "center" }}>
        <p style={{ fontStyle: "italic", color: "#7a5c3e", marginBottom: "1.25rem", fontSize: "1rem" }}>
          — Enter your topics of interest —
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <input
            value={topics}
            onChange={e => setTopics(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generateDigest()}
            placeholder="AI, Pakistan tech, startups..."
            style={{
              padding: "0.75rem 1.25rem",
              background: "#fdf6e3",
              fontFamily: "Georgia, serif",
              fontSize: "1rem",
              color: "#2c1810",
              width: "420px",
              outline: "none",
              border: "none",
              boxShadow: "0 1px 4px rgba(44,24,16,0.15)"
            }}
          />
          <button
            onClick={generateDigest}
            disabled={loading}
            style={{
              padding: "0.75rem 2rem",
              background: "#2c1810",
              color: "#f4ede0",
              border: "none",
              fontFamily: "Georgia, serif",
              fontSize: "0.9rem",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 2px 6px rgba(44,24,16,0.25)"
            }}
          >
            {loading ? "Printing..." : "🗞 Print Edition"}
          </button>
        </div>
        {error && (
          <p style={{ color: "#8b1a1a", marginTop: "0.75rem", fontStyle: "italic" }}>{error}</p>
        )}
      </div>

      {/* Results */}
      {data && (
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 1rem 4rem" }}>

          {/* Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "3rem" }}>
            {[
              { value: data.total_articles,    label: "Stories Gathered" },
              { value: data.filtered_articles, label: "Stories Selected" },
              { value: data.rewrites,          label: "Editorial Rewrites" },
              { value: data.grade === "good" ? "✦ Approved" : "⚠ Revision", label: "" },
            ].map((m, i) => (
                <div key={i} style={{ 
                  textAlign: "center", 
                  padding: "1.5rem 1rem", 
                  background: "#fdf6e3", 
                  boxShadow: "0 1px 4px rgba(44,24,16,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center"
                }}>                
                <div style={{ fontSize: i === 3 ? "1.1rem" : "2.5rem", fontWeight: 900, color: "#2c1810" }}>
                  {m.value}
                </div>
                <div style={{ fontSize: "0.75rem", fontStyle: "italic", color: "#7a5c3e", marginTop: "0.4rem" }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          {/* Section label */}
          <p style={{ textAlign: "center", fontSize: "0.75rem", letterSpacing: "4px", textTransform: "uppercase", color: "#7a5c3e", marginBottom: "1rem" }}>
            Today's Edition
          </p>

          {/* Headline */}
          <h2 style={{ fontSize: "3rem", fontWeight: 900, color: "#2c1810", textAlign: "center", lineHeight: 1.2, margin: "0 0 0.75rem" }}>
            {headline}
          </h2>

          {/* Byline */}
          <p style={{ textAlign: "center", fontStyle: "italic", color: "#7a5c3e", marginBottom: "2.5rem", fontSize: "0.9rem" }}>
            A digest curated for: <strong>{topics}</strong>
          </p>

          {/* Two column body */}
          <div style={{ columnCount: 2, columnGap: "3rem" }}>
            {paragraphs.map((para, i) => (
              <p key={i} style={{
                color: "#2c1810",
                fontSize: "1.05rem",
                lineHeight: 1.9,
                textAlign: "justify",
                marginBottom: "1.25rem",
                breakInside: "avoid"
              }}>
                {i === 0 && (
                  <span style={{
                    fontSize: "3.5rem",
                    fontWeight: 900,
                    float: "left",
                    lineHeight: 0.8,
                    marginRight: "0.1rem",
                    marginTop: "0.15rem",
                    color: "#2c1810"
                  }}>
                    {para[0]}
                  </span>
                )}
                {i === 0 ? para.slice(1) : para}
              </p>
            ))}
          </div>

          {/* Footer */}
          <div style={{ borderTop: "1px solid #b89e7e", marginTop: "3rem", paddingTop: "1rem", textAlign: "center" }}>
            <p style={{ fontStyle: "italic", color: "#7a5c3e", fontSize: "0.78rem", letterSpacing: "1px" }}>
              © The Daily Digest &nbsp;·&nbsp; {today}
            </p>
          </div>

        </div>
      )}
    </main>
  );
}