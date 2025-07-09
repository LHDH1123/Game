import React, { useState, useEffect, useRef } from "react";
import "../styles/NumberGame.css";

export function NumberGame() {
  const [points, setPoints] = useState(5);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [count, setCount] = useState(1);
  const [circles, setCircles] = useState([]);
  const [isReset, setIsReset] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isPlay, setIsPlay] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [wrongClickId, setWrongClickId] = useState(null);
  const [disappearing, setDisappearing] = useState({});

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

    // 🧹 Dọn sạch interval và trạng thái
    clearInterval(timerRef.current);
    Object.values(countdownIntervals.current).forEach(clearInterval);
    countdownIntervals.current = {};
    setDisappearing({});
    setCircles([]);

    // 🔄 Reset trạng thái game
    setIsPlay(true);
    setCount(1);
    setIsReset(true);
    setIsDone(false);
    setIsGameOver(false);
    setWrongClickId(null);
    setElapsed(0);

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
      // Không xoá disappearing -> giữ countdown lúc dừng
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
      // ❗ Nếu game over, dừng mọi xử lý countdown
      if (isGameOver) return;

      timeLeft -= 0.1;
      if (timeLeft <= 0) {
        clearInterval(interval);
        setCircles((prev) => prev.filter((c) => c.id !== id));
        setDisappearing((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
        delete countdownIntervals.current[id];
      } else {
        setDisappearing((prev) => ({ ...prev, [id]: timeLeft.toFixed(1) }));
      }
    }, 100);

    countdownIntervals.current[id] = interval;
    setCount((prev) => prev + 1);
  };

  return (
    <div className="game-container">
      <h3
        className={
          isGameOver ? "game-over-title" : isDone ? "done-title" : "title"
        }
      >
        {isGameOver ? "GAME OVER" : isDone ? "ALL CLEARED" : "LET'S PLAY"}
      </h3>

      <p>
        Points:{" "}
        <input
          min="1"
          type="number"
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
        />
      </p>
      <p>Time: {elapsed}s</p>

      <button className="btn-restart" onClick={restart}>
        {isReset ? "Restart" : "Play"}
      </button>

      {isPlay && !isGameOver && (
        <button className="btn-restart" style={{ marginLeft: "10px" }}>
          Auto Play On
        </button>
      )}

      <div className="play-area">
        {circles.map((c) => (
          <div
            key={c.id}
            className={`circle ${
              disappearing[c.id] && !isGameOver ? "disappearing" : ""
            } ${wrongClickId === c.id ? "wrong-click" : ""}`}
            style={{
              top: `${c.top}%`,
              left: `${c.left}%`,
              zIndex: 1000 - c.id,
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
