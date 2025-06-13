import { io } from "socket.io-client";

export default function initWebSocketClient() {
    let socket;

    // Set up the WebSocket connection
    fetch("/api/ws");
    socket = io();

    socket.on("connect", () => {
        console.log("Connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
        console.log("Disconnected:", reason);
    });

    socket.on("message", (msg) => {
        console.log("Message received:", msg);
    });

    return {
        socket: socket,
    };
}