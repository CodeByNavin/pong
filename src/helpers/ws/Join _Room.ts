
import { addOrUpdateRoom, readData } from '@/helpers/db/db'
import { Server, Socket } from 'socket.io';

export default async function JoinRoom(socket: Socket, io: Server, id: string,) {

    const rooms = await readData("rooms");
    const data = rooms[id] || {};

    if (!data) {
        console.error(`Room with ID ${id} does not exist.`);
        return socket.emit('InvalidRoom', `Room with ID ${id} does not exist.`);
    };

    await addOrUpdateRoom(id, {
        ...data,
        players: [
            ...(Array.isArray(data.players) ? data.players : []),
            {
                id: socket.id,
                name: `Player-${data.players ? data.players.length + 1 : 1}`,
            }
        ],
        paddles: [
            ...(Array.isArray(data.paddles) ? data.paddles : []),
            {
                id: socket.id,
                position: { x: 0, y: 0 },
                size: { width: 10, height: 100 },
            }
        ]
    });

    console.log(`Player ${socket.id} joined room: ${id}`);
    const finalData = await readData("rooms");
    const roomData = finalData[id] || {};

    socket.emit('JoinedRoom', {
        name: id,
        data: roomData
    });

    io.to(data.createdBy).emit("PlayerJoined", {
        name: id,
        data: roomData
    });
    return;
}