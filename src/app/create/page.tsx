"use client";
import { useEffect, useRef, useState } from "react";
import initWebSocketClient from "../helpers/ws/client";
import { Socket } from 'socket.io-client';
import { useRouter } from "next/navigation";


export default function CreatePage() {
    const router = useRouter();
    const socketRef = useRef<Socket | null>(null);
    const [code, setCode] = useState<string>("");
    const [roomData, setRoomData] = useState<any>(null);

    useEffect(() => {
        const { socket } = initWebSocketClient();
        socketRef.current = socket;

        socket.emit("message", { system: "Make_Room" });
        socket.on("roomCreated", (msg) => {
            console.log("Message received from server:", msg);

            setCode(msg.name);
            setRoomData(msg.data);
        });

        socket.on("PlayerJoined", (data) => {
            console.log("Player joined:", data);
            setRoomData(data.data);
        });

        socket.on("GameStarted", (msg) => {
            console.log("Game started:", msg);
            const roomCode = msg.data?.code || code;
            router.push(`/game?id=${roomCode}`);
        })

        return () => {
            socketRef.current?.disconnect();
        }
    }, []);

    const handleStartGame = () => {
        if (socketRef.current) {
            setTimeout(() => {
                console.log("Socket connected:", socketRef.current?.connected);
                console.log("Emitting Start_Game with code:", code);
                socketRef.current?.emit("message", { system: "Start_Game", data: { code } });
            }, 100);
        } else {
            console.log("Socket not initialized");
        }
    }

    return (
        <main className="flex flex-col items-center justify-center h-screen bg-primary text-secondary">
            <h1 className="text-4xl font-bold mb-4 text-accent">Create Room</h1>
            <p className="text-lg mb-8">Set up a new room to play Pong with friends.</p>
            <div className="bg-secondary text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Room Code</h2>
                {code ? (
                    <>
                        <p
                            className="text-xl cursor-pointer"
                            onClick={() => {
                                navigator.clipboard.writeText(code);
                                alert("Room code copied to clipboard!");
                            }}
                        >
                            {code}
                        </p>
                        <p className="mt-4 text-lg">Share this code with your friends to join the room.</p>
                    </>
                ) : (
                    <p className="text-lg">Creating room...</p>
                )}
                {roomData && (
                    <div className="mt-4">
                        <h3 className="text-xl font-semibold">Room Data:</h3>
                        <div className="text-sm">
                            {roomData.players.length > 0 && roomData.players.map((player: any, index: number) => (
                                <div key={index} className="mb-2 text-white pt-3">
                                    <p><strong>Player {index + 1}:</strong> {player.name} (ID: {player.id})</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {roomData && roomData.players.length === 2 && (
                <div className="mt-8 gap-3 flex flex-col sm:flex-row">
                    <button
                        onClick={handleStartGame}
                        className="px-6 py-3 bg-secondary text-white rounded transition-colors hover:bg-secondary cursor-pointer"
                    >
                        Start Game
                    </button>
                </div>
            )}
            <div className="mt-8 gap-3 flex flex-col sm:flex-row">
                <a
                    href="/"
                    className="px-6 py-3 bg-secondary text-white rounded hover:bg-secondary transition-colors"
                >
                    Back to Home
                </a>
            </div>
        </main>
    )
}