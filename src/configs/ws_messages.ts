import JoinRoom from "@/helpers/ws/Join _Room";
import makeRoom from "@/helpers/ws/Make_Room";
import StartGame from "@/helpers/ws/Start_Game";

type Data = {
    exec: (...args: any[]) => void;
    [key: string]: string | ((...args: any[]) => void) | Promise<void>;
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
    }
};

export default wsMessages;
export type WsMessageType = keyof typeof wsMessages;