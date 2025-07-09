import React, { useState, useEffect, useRef } from "react";
import "../styles/NumberGame.css";

export function NumberGame() {
  const [points, setPoints] = useState(5);
  const [elapsed, setElapsed] = useState(0);
  const [count, setCount] = useState(1);
  const [circles, setCircles] = useState([]);
  const [isReset, setIsReset] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isPlay, setIsPlay] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [wrongClickId, setWrongClickId] = useState(null);
  const [disappearing, setDisappearing] = useState({});
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const timerRef = useRef(null);
  const countdownIntervals = useRef({});

  const generateCircles = () => {
    const arr = Array.from({ length: points }, (_, i) => ({
      id: i + 1,
      top: Math.random() * 90,
      left: Math.random() * 90,
    }));
    setCircles(arr);
    setDisappearing({});
    setIsDone(false);
    countdownIntervals.current = {};
  };

  const restart = () => {
    if (points <= 0) return;

    clearInterval(timerRef.current);
    Object.values(countdownIntervals.current).forEach(clearInterval);
    countdownIntervals.current = {};
    setDisappearing({});
    setCircles([]);

    setIsPlay(true);
    setCount(1);
    setIsReset(true);
    setIsDone(false);
    setIsGameOver(false);
    setWrongClickId(null);
    setElapsed(0);
    setIsAutoPlay(false);

    generateCircles();

    const start = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(((Date.now() - start) / 1000).toFixed(1));
    }, 100);
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      Object.values(countdownIntervals.current).forEach(clearInterval);
    };
  }, []);

  useEffect(() => {
    if (circles.length === 0 && isReset) {
      clearInterval(timerRef.current);
      setIsDone(true);
    }
  }, [circles, isReset]);

  useEffect(() => {
    if (isGameOver) {
      Object.values(countdownIntervals.current).forEach(clearInterval);
      countdownIntervals.current = {};
    }
  }, [isGameOver]);

  const handleClick = (id) => {
    if (disappearing[id] !== undefined || isGameOver) return;

    if (id !== count) {
      setIsGameOver(true);
      setWrongClickId(id);
      clearInterval(timerRef.current);
      Object.values(countdownIntervals.current).forEach(clearInterval);
      countdownIntervals.current = {};
      return;
    }

    let timeLeft = 3.0;
    setDisappearing((prev) => ({ ...prev, [id]: timeLeft.toFixed(1) }));

    const interval = setInterval(() => {
      timeLeft -= 0.1;

      if (timeLeft <= 0) {
        clearInterval(interval);
        delete countdownIntervals.current[id];

        if (!isGameOver) {
          setCircles((prev) => prev.filter((c) => c.id !== id));
          setDisappearing((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });
        }
      } else {
        setDisappearing((prev) => ({ ...prev, [id]: timeLeft.toFixed(1) }));
      }
    }, 100);

    countdownIntervals.current[id] = interval;
    setCount((prev) => prev + 1);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay((prev) => !prev);
  };

  useEffect(() => {
    if (!isAutoPlay || isGameOver || isDone || !isPlay) return;

    const autoInterval = setInterval(() => {
      const nextCircle = circles.find((c) => c.id === count);
      if (nextCircle) {
        handleClick(nextCircle.id);
      }

      if (count > points || isGameOver || isDone) {
        clearInterval(autoInterval);
      }
    }, 700);

    return () => clearInterval(autoInterval);
  }, [isAutoPlay, count, circles, isGameOver, isDone, isPlay]);

  return (
    <div className="game-container">
      <h3
        className={
          isGameOver ? "game-over-title" : isDone ? "done-title" : "title"
        }
      >
        {isGameOver ? "GAME OVER" : isDone ? "ALL CLEARED" : "LET'S PLAY"}
      </h3>

      <div className="info-bar">
        <div className="info-item">
          <label>Points:</label>
          <input
            min="1"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
          />
        </div>
        <div className="info-item">
          <label>Time:</label>
          <span>{elapsed}s</span>
        </div>
      </div>

      <button className="btn-restart" onClick={restart}>
        {isReset ? "Restart" : "Play"}
      </button>

      {isPlay && !isGameOver && !isDone && (
        <button
          className="btn-restart"
          style={{ marginLeft: "10px" }}
          onClick={toggleAutoPlay}
        >
          Auto Play {isAutoPlay ? "OFF" : "ON"}
        </button>
      )}

      <div className="play-area">
        {circles.map((c) => (
          <div
            key={c.id}
            className={`circle ${disappearing[c.id] ? "disappearing" : ""} ${
              wrongClickId === c.id ? "wrong-click" : ""
            }`}
            style={{
              top: `${c.top}%`,
              left: `${c.left}%`,
              zIndex: 1000 - c.id,
              opacity: disappearing[c.id]
                ? Math.max(0.1, disappearing[c.id] / 3)
                : 1, // 👈 Tính độ mờ dựa vào thời gian còn lại
            }}
            onClick={() => handleClick(c.id)}
          >
            <div>{c.id}</div>

            {disappearing[c.id] && (
              <div className="countdown">{disappearing[c.id]}s</div>
            )}

            {wrongClickId === c.id && <div className="countdown">3.0s</div>}
          </div>
        ))}
      </div>

      {count <= points && isPlay && !isGameOver && (
        <p style={{ margin: "0px" }}>Next: {count}</p>
      )}
    </div>
  );
}

export default NumberGame;
