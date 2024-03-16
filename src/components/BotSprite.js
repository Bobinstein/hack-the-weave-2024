import React, { useState } from "react";

const BotSprite = ({
  playerId,
  playerX,
  playerY,
  sectionSize,
  isOwned,
  player,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const playerImage = isOwned ? "/knight.svg" : "/orc.svg";

  const playerGridX = ((playerX - 1) % sectionSize) * (100 / sectionSize);
  const playerGridY = ((playerY - 1) % sectionSize) * (100 / sectionSize);

  const positionStyle = {
    position: "absolute",
    width: `${(3 * 100) / sectionSize}%`,
    height: `${(3 * 100) / sectionSize}%`,
    left: `${playerGridX}%`, // Adjusted to use playerGridX
    top: `${playerGridY}%`, // Adjusted to use playerGridY
    pointerEvents: "auto",
  };

  const tooltipStyle = {
    position: "absolute",
    width: "max-content",
    maxWidth: "200px",
    background: "black",
    color: "white",
    border: "1px solid black",
    padding: "5px",
    zIndex: 100,
    left: "0",
    top: "-40px", // Adjust as needed to position the tooltip above the sprite
    display: showTooltip ? "block" : "none",
    whiteSpace: "pre-wrap",
    pointerEvents: "none",
    wordWrap: "break-word",
  };

  const healthBarStyle = {
    position: "absolute",
    top: "-10px", // Position the health bar above the sprite
    left: "0",
    right: "0",
    height: "6px", // Height of the health bar
    background: isOwned ? "green" : "red",
    width: `${(player.health / 100) * 100}%`, // Width of the health bar representing current health
  };

  return (
    <div
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={positionStyle}
    >
      {/* <div style={healthBarStyle} /> */}
      <img
        src={playerImage}
        alt="Player"
        style={{ width: "100%", height: "100%" }}
      />
      <div
        style={tooltipStyle}
      >{`Player: ${playerId}\nHealth: ${player.health}\nEnergy: ${player.energy}\nx: ${playerX}\ny: ${playerY}`}</div>
    </div>
  );
};

export default BotSprite;
