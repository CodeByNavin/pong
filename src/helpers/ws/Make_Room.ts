import crypto from 'crypto';
import { Socket } from "socket.io";
import { addOrUpdateRoom, readData } from '@/helpers/db/db'

export default async function makeRoom(socket: Socket) {
    const id = crypto.randomBytes(4).toString('hex');

    const roomName = `room-${id}`;

    // Emit an event to confirm the room creation
    await addOrUpdateRoom(roomName, {
        createdAt: new Date().toISOString(),
        players: [
            {
                id: socket.id,
                name: `Player-1`,
            }
        ],
        paddles: [
            {
                id: socket.id,
                position: { x: 0, y: 0 },
                size: { width: 10, height: 100 },
            }
        ],
        createdBy: socket.id,
    }).then(() => console.log(`Room data written to database: ${roomName}`))

    console.log(`Room created: ${roomName} for socket ID: ${socket.id}`);

    const rooms = await readData("rooms");
    const data = rooms[roomName] || {};

    socket.emit('roomCreated', {
        name: roomName,
        data: data
    });


    return;
}