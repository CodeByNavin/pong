import { Server as IOServer } from "socket.io";
import { Socket } from "net";
import { NextApiResponse } from "next";
import { Server as HTTPServer } from "http";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: HTTPServer & {
      io?: IOServer;
    };
  }
};