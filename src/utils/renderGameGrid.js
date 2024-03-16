import React from 'react';
import BotSprite from '../components/BotSprite'; // Adjust the import path as necessary

const GRID_SIZE = 40;
const SECTION_SIZE = 10;

const renderGameGrid = ({ gameState, isPlayerOwned }) => {
    if (!gameState) return <p>Loading game state...</p>;

    const playerPositions = Object.entries(gameState.Players || {}).reduce((acc, [playerId, player]) => {
        const sectionX = Math.floor((player.x - 1) / SECTION_SIZE);
        const sectionY = Math.floor((player.y - 1) / SECTION_SIZE);
        const key = `${sectionX},${sectionY}`;

        if (!acc[key]) {
            acc[key] = [];
        }
        
        acc[key].push({ playerId, ...player });
        return acc;
    }, {});

    return (
        <>
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
                {/* Please excuse the buggy ticks, ao is still early beta and game processes do not always behave the way they are supposed to. (it's not all my fault) */}
            </div>
            {gameState.GameMode === "Playing" ? (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${GRID_SIZE / SECTION_SIZE}, 1fr)`,
                        maxWidth: "600px",
                        margin: "auto",
                        border: "2px solid black",
                        backgroundImage: "url('/sand2.jpg')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    {Array.from({ length: (GRID_SIZE / SECTION_SIZE) * (GRID_SIZE / SECTION_SIZE) }).map((_, sectionIndex) => {
                        const sectionX = sectionIndex % (GRID_SIZE / SECTION_SIZE);
                        const sectionY = Math.floor(sectionIndex / (GRID_SIZE / SECTION_SIZE));

                        return (
                            <div
                                key={sectionIndex}
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    paddingTop: "100%", // Maintain aspect ratio
                                    border: "1px solid black",
                                    boxSizing: 'border-box', // Include the border in the element's total width and height
                                }}
                            >
                                {playerPositions[`${sectionX},${sectionY}`]?.map((player) => (
                                    <BotSprite
                                        key={player.playerId}
                                        playerId={player.playerId}
                                        playerX={player.x}
                                        playerY={player.y}
                                        sectionSize={SECTION_SIZE}
                                        isOwned={isPlayerOwned(player.playerId)}
                                        player={player}
                                    />
                                ))}
                            </div>
                        );
                    })}
                </div>
            ) : gameState.GameMode === "Waiting" ? (
                <p>Waiting for game to start.</p>
            ) : (
                <p>Game mode is currently {gameState.GameMode}.</p>
            )}
        </>
    );
};

export default renderGameGrid;
