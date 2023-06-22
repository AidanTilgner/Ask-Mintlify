import type { Server, Socket } from "socket.io";

const connection: {
  sockets: Record<string, Socket>;
} = {
  sockets: {},
};

export const initSocketIO = (io: Server) => {
  io.on("connection", (sock) => {
    console.info("a user connected");

    connection.sockets[sock.id] = sock;

    sock.on("disconnect", () => {
      console.info("user disconnected");
      delete connection.sockets[sock.id];
    });
  });

  return io;
};

export const getSocket = (id: string) => {
  return connection.sockets[id];
};
