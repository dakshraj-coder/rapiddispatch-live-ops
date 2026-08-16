# RapidDispatch Live Ops

A real-time collaborative helpdesk application built for RapidDispatch Freight & Logistics.

The application prevents multiple support agents from editing the same support ticket simultaneously by using Socket.io for real-time ticket locking and synchronization.

## Live Demo

- Frontend: https://rapiddispatch-live-ops-sigma.vercel.app/
- Backend: https://rapiddispatch-live-ops-server.onrender.com

## GitHub

- Frontend: https://github.com/dakshraj-coder/rapiddispatch-live-ops
- Backend: https://github.com/dakshraj-coder/rapiddispatch-live-ops-server

## Features

- Real-time support ticket dashboard
- Socket.io bidirectional communication
- Real-time ticket locking
- Lock state synchronization across connected agents
- Lock rejection when a ticket is already being edited
- Unlock when an agent closes a ticket
- Automatic lock release when an agent disconnects
- Connection status indicator
- Reconnection support
- Production deployment using Vercel and Render

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Socket.io Client

### Backend

- Node.js
- Express
- Socket.io
- CORS
- In-memory JavaScript Map for ticket locks

### Deployment

- Frontend: Vercel
- Backend: Render

## How It Works

When an agent opens a ticket for editing, the frontend emits a `lock_ticket` event to the Socket.io server.

The server maintains ticket locks in an in-memory `Map`.

If the ticket is available:

1. The server creates the lock.
2. The lock is associated with the agent's Socket.io connection.
3. The server broadcasts the lock to all connected clients.
4. Other agents immediately see the ticket as locked.

If another agent attempts to lock the same ticket, the server rejects the request and identifies the agent currently holding the lock.

When the editing agent closes the ticket, an `unlock_ticket` event is emitted and the server broadcasts the release.

## Ghost Disconnect Handling

If an agent disconnects without explicitly unlocking a ticket, the server's `disconnect` handler searches the in-memory lock map for tickets owned by that socket.

Those tickets are automatically released and the unlock state is broadcast to all connected agents.

This prevents tickets from remaining permanently locked after unexpected connection loss.

## Local Development

### Frontend

```bash
cd rapiddispatch-live-ops
npm install
npm run dev