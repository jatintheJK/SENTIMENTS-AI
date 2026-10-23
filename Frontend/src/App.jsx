import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Brain,
  Send,
  Loader2,
  Smile,
  Frown,
  Meh,
  AlertTriangle,
} from "lucide-react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000/analyze";

const SENTIMENT = {
  Positive: { color: "#39ff9c", Icon: Smile },
  Negative: { color: "#ff3d7f", Icon: Frown },
  Neutral: { color: "#5ce1ff", Icon: Meh },
};

export default function App() {
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const reduceMotion = useReducedMotion();

  const handleAnalyze = async () => {
    if (!userInput.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userInput }),
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Could not reach the server. Start the FastAPI app and try again.");
    } finally {
      setLoading(false);
    }
  };

  const meta = result ? SENTIMENT[result.sentiment] : null;
  const markerLeft = result ? ((result.polarity + 1) / 2) * 100 : 50;

  return (
    <div className="app">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="grid" />

      <motion.div
        className="float"
        animate={reduceMotion ? {} : { y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.main
          className="card"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <header className="header">
            <motion.div
              className="badge"
              animate={reduceMotion ? {} : { rotate: [0, 6, -6, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Brain size={30} strokeWidth={1.8} />
            </motion.div>
            <h1 className="title">AI Sentiment Analyzer</h1>
            <p className="subtitle">
              Type a sentence to see its tone and polarity score.
            </p>
          </header>

          <textarea
            className="textarea"
            rows={5}
            aria-label="Text to analyze"
            placeholder="I absolutely love how this turned out..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />

          <motion.button
            className="button"
            onClick={handleAnalyze}
            disabled={loading || !userInput.trim()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="spin" /> Analyzing
              </>
            ) : (
              <>
                <Send size={20} /> Analyze
              </>
            )}
          </motion.button>

          <AnimatePresence>
            {error && (
              <motion.div
                className="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AlertTriangle size={18} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {result && (
              <motion.section
                key={`${result.sentiment}-${result.polarity}`}
                className="result"
                style={{ "--accent": meta.color }}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
              >
                <motion.div
                  className="result-icon"
                  animate={reduceMotion ? {} : { y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <meta.Icon size={44} strokeWidth={1.6} />
                </motion.div>

                <div className="result-label">{result.sentiment}</div>
                <div className="result-score">
                  Polarity {result.polarity.toFixed(3)}
                </div>

                <div className="meter">
                  <div className="meter-track" />
                  <motion.div
                    className="meter-marker"
                    initial={{ left: "50%" }}
                    animate={{ left: `${markerLeft}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.2 }}
                  />
                </div>
                <div className="meter-scale">
                  <span>-1</span>
                  <span>0</span>
                  <span>+1</span>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </motion.main>
      </motion.div>
    </div>
  );
}