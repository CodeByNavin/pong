"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import initWebSocketClient from "../helpers/ws/client";
import GameError from "./components/error";
import MainGame from "./components/MainGame";

export default function GamePage() {

    const socketRef = useRef<Socket | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const { socket } = initWebSocketClient();
        socketRef.current = socket;

        return () => {
            socketRef.current?.disconnect();
        }
    }, []);


    // Get the game id from the URL
    const params = useSearchParams();
    const [gameId, setGameId] = useState<string | null>(null);
    useEffect(() => {
        const id = params?.get("id");
        if (id) {
            setGameId(id);
        } else {
            console.error("No game ID found in URL");
        }
    }, [params]);

    // Send ready signal to server and check game code
    useEffect(() => {
        if (gameId && socketRef.current) {
            console.log("Emitting Ready with gameId:", gameId);
            socketRef.current.emit("Game_Ready", { data: { code: gameId } });

            socketRef.current.on("GameStarted", (msg) => {
                console.log("Game started:", msg);
                setLoading(false);
            });

            socketRef.current.on("InvalidGame", (msg) => {
                console.error("Invalid Game:", msg);
                setError(msg);
                setLoading(false);
            });
        }
    }, [gameId])

    return (
        <main className="flex flex-col items-center justify-center h-screen bg-primary text-secondary">
            {loading ? (
                <p className="text-lg">Loading game...</p>
            ) : error ? (
                <GameError error={error} />
            ) : (
                <MainGame id={gameId!} socketRef={socketRef} />
            )}
        </main>
    )
}