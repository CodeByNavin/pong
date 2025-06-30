import { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";
import wsMessages from "@/configs/ws_messages";


export default function handler(req: NextApiRequest, res: NextApiResponse) {
    //console.log(`[${new Date().toISOString()}] Incoming ${req.method} request to /api/ws`);

    // @ts-ignore
    if (!res.socket?.server.io) {
        console.log(`[${new Date().toISOString()}] Initializing Socket.io...`);
        // @ts-ignore
        const io = new Server(res.socket?.server);

        io.on("connection", (socket) => {
            console.log(`[${new Date().toISOString()}] New client connected: ${socket.id}`);
            socket.emit("message", { system: "Welcome to the WebSocket server!" });

            socket.on("disconnect", (reason) => {
                if (res.socket && (res.socket as any).server && (res.socket as any).server.io) {
                    (res.socket as any).server.io = null;
                }
                console.log(`[${new Date().toISOString()}] Client disconnected: ${socket.id} (reason: ${reason})`);

            });

            socket.on("message", (rawMessage) => {
                let parsedMessage;
                // Check if the message is a string before attempting to parse it
                if (typeof rawMessage === "string") {
                    try {
                        parsedMessage = JSON.parse(rawMessage);
                    } catch (error) {
                        console.error(
                            `[${new Date().toISOString()}] Error parsing message from ${socket.id}:`,
                            error,
                        );

                        return;
                    }
                } else {
                    parsedMessage = rawMessage;
                }

                const messageKey = parsedMessage?.system || parsedMessage;

                console.log(
                    `[${new Date().toISOString()}] Message from ${socket.id}: ${JSON.stringify(
                        messageKey,
                    )}`,
                );

                // Ensure messageKey is a string for object property lookup
                if (typeof messageKey !== "string" || !wsMessages.hasOwnProperty(messageKey)) {
                    console.warn(
                        `[${new Date().toISOString()}] Unknown or invalid message key: ${JSON.stringify(
                            messageKey,
                        )} from ${socket.id}`,
                    );
                    return;
                }
                const system = wsMessages[messageKey];
                system.exec(socket, io, parsedMessage.data);
            });
        });

        io.on("error", (err) => {
            console.error(`[${new Date().toISOString()}] Socket.io server error:`, err);
        });

        // @ts-ignore
        res.socket.server.io = io;
        console.log(`[${new Date().toISOString()}] Socket.io initialized successfully.`);
    } else {
        console.log(`[${new Date().toISOString()}] Socket.io is already initialized.`);
    }

    res.end();
};