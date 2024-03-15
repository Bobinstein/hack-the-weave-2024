// src/utils/useGameState.js
import { useState, useEffect } from "react";
import { fetchGameState } from "./fetchGameState";

export const useGameState = (globalState) => {
    const [gameState, setGameState] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchGameState(setGameState, setAnnouncements, setTimeRemaining, gameState, announcements);
        }, 5000);
        return () => clearInterval(interval);
    }, [gameState, announcements]);

    return { gameState, announcements, timeRemaining };
};
