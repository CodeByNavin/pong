import { Server, Socket } from "socket.io";
import { readData } from '@/helpers/db/db'


export default async function StartGame(socket: Socket, io: Server, data: any) {

    const rooms = await readData("rooms");
    const roomData = rooms[data.code] || {};

    if (!roomData) {
        console.error(`Room with code ${data.code} does not exist.`);
        return socket.emit('InvalidRoom', `Room with code ${data.code} does not exist.`);
    }

    if (roomData.players.length !== 2) {
        console.error(`Room with code ${data.code} is already full.`);
        return socket.emit('InvalidRoom', `Room with code ${data.code} is full or has 1 person.`);
    }

    for (const player of roomData.players) {
        io.to(player.id).socketsJoin(`${data.code}`)
    }

    console.log(`Game started in room: ${data.code} with players:`, roomData.players);
    io.to(data.code).emit('GameStarted', {
        message: `Game started in room: ${data.code}`,
        data: {
            roomData,
            code: data.code
        }
    });

    return;
}