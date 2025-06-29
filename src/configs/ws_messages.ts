import Game_KeyEvent from "@/helpers/ws/Game_KeyEvent";
import Game_Screen from "@/helpers/ws/Game_Screen";
import JoinRoom from "@/helpers/ws/Join _Room";
import makeRoom from "@/helpers/ws/Make_Room";
import StartGame from "@/helpers/ws/Start_Game";
import { Socket, Server } from "socket.io";

type Data = {
    [key: string]: string | ((...args: any[]) => void) | Promise<void>;
    exec: (socket: Socket, io: Server, data: any) => void;
};

const wsMessages: Record<string, Data> = {
    "Make_Room": {
        exec: makeRoom
    },
    "Join_Room": {
        exec: JoinRoom
    },
    "Start_Game": {
        exec: StartGame
    },
    "Game_KeyEvent": {
        exec: Game_KeyEvent
    },
    "Game_Screen": {
        exec: Game_Screen
    }
};

export default wsMessages;
export type WsMessageType = keyof typeof wsMessages;