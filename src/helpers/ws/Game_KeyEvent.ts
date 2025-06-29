import { Server, Socket } from "socket.io";
import { addOrUpdateRoom, readData } from "../db/db";

export default async function Game_KeyEvent(socket: Socket, io: Server, data: any) {
    const { key, id } = data;

    if (!key || !id) {
        console.error("Invalid key event data:", data);
        return socket.emit('InvalidKeyEvent', 'Key event data is missing key or id.');
    }
    console.log(`Key event received: ${key} for player ID: ${id}`);

    const rooms = await readData("rooms");
    const roomData = rooms[id] || {};

    if (!roomData) {
        console.error(`Room with ID ${id} does not exist.`);
        return socket.emit('InvalidRoom', `Room with ID ${id} does not exist.`);
    }

    await addOrUpdateRoom(id, {
        ...roomData,
        paddles: roomData.paddles.map((paddle: any) => {
            if (paddle.id === socket.id) {
                return {
                    ...paddle,
                    position: {
                        ...paddle.position,
                        y: key === 's' ? paddle.position.y - 10 : key === 'w' ? paddle.position.y + 10 : paddle.position.y
                    }
                };
            }
            return paddle;
        })
    });

    const room = await readData("rooms");
    const updatedRoomData = room[id] || {};

    io.to(id).emit("Game_Update", updatedRoomData)
    
}