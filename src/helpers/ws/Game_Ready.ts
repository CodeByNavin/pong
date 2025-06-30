import { Server, Socket } from "socket.io";
import { addOrUpdateRoom, readData } from "../db/db";

export default async function Game_Ready(socket: Socket, io: Server, data: any) {
    try {
        // Add random delay between 1-2 seconds
        const delay = Math.random() * 1000 + 1000; // 1000-2000ms
        console.log(`Adding delay of ${delay}ms for socket: ${socket.id}`);
        await new Promise(resolve => setTimeout(resolve, delay));

        console.log(`Game_Ready called for socket: ${socket.id} in room: ${data.id}`);
        
        // Read fresh data from database
        const rooms = await readData("rooms");
        const room = rooms[data.id];

        if (!room) {
            console.error(`Room with ID ${data.id} not found.`);
            return socket.emit('error', { message: `Room ${data.id} not found` });
        }

        console.log("Current room data:", room);
        console.log("Current players array:", room.players);

        // Check if player is already ready
        const playerIndex = room.players.findIndex((player: { id: string }) => player.id === socket.id);
        
        if (playerIndex === -1) {
            console.error(`Player ${socket.id} not found in room ${data.id}`);
            return socket.emit('error', { message: 'Player not found in room' });
        }

        if (room.players[playerIndex].ready === true) {
            console.log(`Player ${socket.id} is already ready in room ${data.id}`);
            return;
        }

        // Update the player's ready status
        const updatedPlayers = [...room.players];
        updatedPlayers[playerIndex] = {
            ...updatedPlayers[playerIndex],
            ready: true
        };

        console.log(`Setting player ${socket.id} (index ${playerIndex}) to ready`);
        console.log("Updated players array:", updatedPlayers);

        // Save the updated room
        const updatedRoom = {
            ...room,
            players: updatedPlayers
        };

        await addOrUpdateRoom(data.id, updatedRoom);
        console.log("Room updated successfully");

        // Verify the save worked by reading fresh data
        const verifyRooms = await readData("rooms");
        const verifiedRoom = verifyRooms[data.id];
        
        console.log("Verified room data after save:", verifiedRoom);
        console.log("Verified players:", verifiedRoom.players);

        // Check if all players are ready
        const allPlayersReady = verifiedRoom.players.every((player: { ready: boolean }) => player.ready === true);
        
        console.log("All players ready?", allPlayersReady);

        if (allPlayersReady && verifiedRoom.players.length === 2) {
            console.log(`All players are ready in room ${data.id}. Starting game...`);
            io.to(data.id).emit("GameStarted", { 
                data: { 
                    code: data.id,
                    room: verifiedRoom
                } 
            });
        } else {
            // Notify all players in the room about the updated ready status
            io.to(data.id).emit("PlayerReady", {
                playerId: socket.id,
                players: verifiedRoom.players
            });
        }

    } catch (error) {
        console.error("Error in Game_Ready:", error);
        socket.emit('error', { message: 'Failed to update ready status' });
    }
}