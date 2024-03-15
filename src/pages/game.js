// src/pages/game.js
import React, { useState, useEffect, useContext } from "react";
import GlobalContext from "../utils/globalProcess";
import { checkActiveAddress } from "../utils/arconnect";
import { results, message, createDataItemSigner } from "@permaweb/aoconnect";
import { fetchProcessTransactionsQuery } from "../utils/graphqlQueries";
import NavBar from "@/components/NavBar";
import triggerGameState from "@/utils/triggerGameState";

const GamePage = () => {
  const { globalState, setGlobalState } = useContext(GlobalContext);
  const [gameState, setGameState] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const fetchProcesses = async () => {
    const activeAddress = await checkActiveAddress();
    if (activeAddress) {
      const query = fetchProcessTransactionsQuery(activeAddress);
      const response = await fetch("https://arweave.net/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const { data } = await response.json();
      const processes = data.transactions.edges.map((edge) => edge.node);

      console.log("Processes fetched:", processes);
      setGlobalState((prevState) => ({
        ...prevState,
        processes: processes,
      }));
    }
  };

  const fetchGameState = async () => {
    await triggerGameState();
    const gameResults = await results({
      process: "gG-uz2w6qCNYWQGwocOh225ccJMj6fkyGDSKDS2K_nk",
      sort: "DESC",
      limit: 25,
    });

    if (gameResults) {
      console.log("Game results fetched:", gameResults);
    }
    const gameStateMessages = gameResults.edges.flatMap(
      (edge) => edge.node.Messages
    );

    const gameStateMessage = gameStateMessages.find((message) =>
      message.Tags.some(
        (tag) => tag.name === "Action" && tag.value === "GameState"
      )
    );

    if (gameStateMessage) {
      const stateData = JSON.parse(gameStateMessage.Data);
      console.log("Game state fetched:", stateData);
      if (!gameState || stateData.TimeRemaining > gameState.TimeRemaining) {
        setGameState(stateData);
        setTimeRemaining(stateData.TimeRemaining / 1000);
      }
    }

    const newAnnouncements = gameStateMessages
      .filter((message) =>
        message.Tags.some(
          (tag) => tag.name === "Action" && tag.value === "Announcement"
        )
      )
      .map((message) => message.Data)
      .filter(
        (announcement) =>
          !announcements.includes(announcement) &&
          !announcement.includes("The game will end in") &&
          !announcement.includes("The game will begin in")
      );

    // Combine and de-duplicate announcements, then reverse the order
    const combinedAnnouncements = Array.from(
      new Set([...announcements, ...newAnnouncements])
    );
    const uniqueAnnouncements = combinedAnnouncements.slice(-10).reverse();

    setAnnouncements(uniqueAnnouncements);
    console.log("Announcements updated:", uniqueAnnouncements);
  };

  useEffect(() => {
    fetchProcesses();
    fetchGameState();
    const interval = setInterval(fetchGameState, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const isPlayerOwned = (playerId) =>
    globalState.processes?.some((process) => process.id === playerId);

  const renderGameGrid = () => {
    if (!gameState) return <><p>Loading game state...</p><p>If this is taking an unusually long amount of time, try refreshing the page.</p></>;

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

  const renderAnnouncements = () => (
    <div>
      <h2>Announcements</h2>
      {announcements.length > 0 ? (
        <ul>
          {announcements.map((announcement, index) => (
            <li
              key={index}
              style={{
                color: /hit/i.test(announcement)
                  ? "red"
                  : /attack/i.test(announcement)
                  ? "green"
                  : "white",
              }}
            >
              {announcement}
            </li>
          ))}
        </ul>
      ) : (
        <p>No announcements</p>
      )}
    </div>
  );

  return (
    <div>
      <NavBar />
      <h1>Game State</h1>
      {timeRemaining && <p>Time Remaining: {timeRemaining}</p>}
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "start" }}
      >
        <div style={{ flex: 3, marginRight: "5%" }}>{renderGameGrid()}</div>
        <div style={{ flex: 1 }}>{renderAnnouncements()}</div>
      </div>
    </div>
  );
};

export default GamePage;
