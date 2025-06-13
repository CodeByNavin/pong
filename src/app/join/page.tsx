"use client";
import { useEffect, useRef, useState } from "react";
import initWebSocketClient from "../helpers/ws/client";
import { Socket } from 'socket.io-client';
import { useRouter } from "next/navigation";

export default function JoinPage() {
    const router = useRouter();
    const socketRef = useRef<Socket | null>(null);
    const [InputCode, setInputCode] = useState<string>("");
    const [roomData, setRoomData] = useState<any>(null);

    const handleJoinRoom = (roomCode: string) => {
        const { socket } = initWebSocketClient();
        socketRef.current = socket;

        socket.emit("message", { message: "Join_Room", data: roomCode });
        console.log("Joining room with code:", roomCode);

        socket.on("JoinedRoom", (msg) => {
            console.log("Message received from server:", msg);
            setRoomData(msg.data);
        });

        socketRef.current.on("GameStarted", (msg) => {
            console.log("Game started:", msg);
            router.push(`/game/${InputCode}`);
        })

        socket.on("InvalidRoom", (msg) => {
            console.log("Invalid Room:", msg);
        });

        return () => {
            socketRef.current?.disconnect();
        }
    };


    return (
        <main className="flex flex-col items-center justify-center h-screen bg-primary text-secondary">
            <h1 className="text-4xl font-bold mb-4 text-accent">Join Room</h1>
            <p className="text-lg mb-8">Join a room to play Pong with friends.</p>
            <div className="bg-secondary text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Join Room</h2>
                <input
                    type="text"
                    placeholder="Enter Room Code"
                    className="p-2 mb-4 w-full rounded border-gray-300 border-2"
                    value={InputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                />
                <button
                    onClick={() => handleJoinRoom(InputCode)}
                    className="self-center px-6 py-3 bg-gray-300 text-primary rounded hover:bg-gray-400 cursor-pointer transition-colors"
                >
                    Join Room
                </button>

                {roomData && (
                    <div className="mt-4">
                        <h3 className="text-xl font-semibold">Room Data:</h3>
                        <div className="text-sm text-gray-700">
                            {roomData.players.length > 0 && roomData.players.map((player: any, index: number) => (
                                <div key={index} className="mb-2 text-white pt-3">
                                    <p><strong>Player {index + 1}:</strong> {player.name} (ID: {player.id})</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {roomData && roomData.players.length > 2 && (
                <div className="mt-8 gap-3 flex flex-col sm:flex-row">
                    <a
                        href="/game"
                        className="px-6 py-3 bg-secondary text-white rounded hover:bg-secondary transition-colors"
                    >
                        Start Game
                    </a>
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