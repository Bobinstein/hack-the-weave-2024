// src/utils/renderGameGrid.js
import React from 'react';

const renderGameGrid = ({ gameState, isPlayerOwned }) => {
    console.log(gameState)
  if (!gameState) return (
    <>
      <p>Loading game state...</p>
    </>
  );

  switch (gameState.GameMode) {
    case "Playing":
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(40, 1fr)",
            maxWidth: "600px",
            margin: "auto",
            backgroundColor: "grey",
          }}
        >
          {Array.from({ length: 40 * 40 }).map((_, index) => {
            const x = (index % 40) + 1;
            const y = Math.floor(index / 40) + 1;
            const playerEntry =
              gameState.Players &&
              Object.entries(gameState.Players).find(
                ([_, p]) => p.x === x && p.y === y
              );
            const playerId = playerEntry ? playerEntry[0] : null;
            const player = playerEntry ? playerEntry[1] : null;

            return (
              <div
                key={index}
                style={{
                  width: "100%",
                  paddingTop: "100%",
                  position: "relative",
                  border: "1px solid black",
                  backgroundColor: isPlayerOwned(playerId)
                    ? "green"
                    : "transparent",
                }}
              >
                {player && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                    title={`Player: ${playerId}\nHealth: ${player.health}\nEnergy: ${player.energy}`}
                  >
                    X
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );

    case "Waiting":
      return <p>Waiting for game to start.</p>;

    default:
      return <p>Game mode is currently {gameState.GameMode}.</p>;
  }
};

export default renderGameGrid;
