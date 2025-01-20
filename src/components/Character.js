import React from "react";
import "../styles/Character.css";

const Character = ({ name, role, onClick }) => {
  return (
    <div className="character" onClick={onClick}>
      <h3>{name}</h3>
      <p>{role}</p>
    </div>
  );
};

export default Character;