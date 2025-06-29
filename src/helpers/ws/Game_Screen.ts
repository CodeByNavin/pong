import { Socket, Server } from 'socket.io';
import { addOrUpdateRoom, readData } from '../db/db';

export default async function Game_Screen(socket: Socket, io: Server, data: { width: number; height: number; id: string }) {
    // Fetch the current room data
    const rooms = await readData("rooms");
    const room = rooms[data.id];

    if (!room) {
        console.error(`Room with ID ${data.id} not found.`);
        return;
    }

    // Update the room with the new screen dimensions
    addOrUpdateRoom(data.id, {
        ...room,
        paddles: {
            ...room.paddles,
            [socket.id]: {
                ...room.paddles[socket.id],
                screen: {
                    width: data.width,
                    height: data.height
                }
            }
        }
    });
    console.log(`Updated screen dimensions for room ${data.id} by player ${socket.id}:`, data);
}