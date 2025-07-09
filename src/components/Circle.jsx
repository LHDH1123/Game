import React from "react";
import "./Circle.css";

export default function Circle({ id, top, left, onClick }) {
  return (
    <div
      className="circle"
      style={{ top: `${top}%`, left: `${left}%` }}
      onClick={() => onClick(id)}
    >
      {id}
    </div>
  );
}
