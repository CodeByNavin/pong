import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

export default function MainGame({
    id,
    socketRef,
}: {
    id: string;
    socketRef: React.RefObject<Socket | null>;
}) {

    const [gameData, setGameData] = useState<any>(null);

    socketRef.current?.on("Game_Update", (data) => {
        setGameData(data);
    });

    useEffect(() => {
        // Check if the page is loaded
        if (window.document.readyState !== 'complete') return;
        const width = window.innerWidth;
        const height = window.innerHeight;

        socketRef.current?.emit("Game_Screen", { width, height, id });
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'w' || e.key === 's') && socketRef.current) {
                socketRef.current.emit("Game_KeyEvent", { data: { key: e.key, type: "down", id } });
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if ((e.key === 'w' || e.key === 's') && socketRef.current) {
                socketRef.current.emit("Game_KeyEvent", { data: { key: e.key, type: "up", id } });
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    return (
        <>
        </>
    )
}