import { io } from "socket.io-client";

export const socket = io("http://localhost:4000", {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});