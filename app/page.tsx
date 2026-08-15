"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

type Ticket = {
  id: number;
  title: string;
  customer: string;
  status: string;
};

type TicketLock = {
  ticketId: number;
  agentName: string;
};

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [lockedTickets, setLockedTickets] = useState<
    Record<number, TicketLock>
  >({});
  const [agentName, setAgentName] = useState("Agent A");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const handleConnect = () => {
      console.log("Connected:", socket.id);
      setConnected(true);
    };

    const handleDashboardJoined = (data: { message: string }) => {
      setMessage(data.message);
    };

    const handleTicketsList = (ticketList: Ticket[]) => {
      setTickets(ticketList);
    };

    const handleTicketLocked = ({
      ticketId,
      agentName,
    }: TicketLock) => {
      setLockedTickets((current) => ({
        ...current,
        [ticketId]: {
          ticketId,
          agentName,
        },
      }));
    };

    const handleTicketUnlocked = ({
      ticketId,
    }: {
      ticketId: number;
    }) => {
      setLockedTickets((current) => {
        const updated = { ...current };
        delete updated[ticketId];
        return updated;
      });
    };

    const handleLockRejected = ({
      ticketId,
      lockedBy,
    }: {
      ticketId: number;
      lockedBy: string;
    }) => {
      alert(`Ticket #${ticketId} is already locked by ${lockedBy}`);
    };

    const handleDisconnect = () => {
      console.log("Disconnected");
      setConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("dashboard_joined", handleDashboardJoined);
    socket.on("tickets_list", handleTicketsList);
    socket.on("ticket_locked", handleTicketLocked);
    socket.on("ticket_unlocked", handleTicketUnlocked);
    socket.on("lock_rejected", handleLockRejected);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("dashboard_joined", handleDashboardJoined);
      socket.off("tickets_list", handleTicketsList);
      socket.off("ticket_locked", handleTicketLocked);
      socket.off("ticket_unlocked", handleTicketUnlocked);
      socket.off("lock_rejected", handleLockRejected);
      socket.off("disconnect", handleDisconnect);

      socket.disconnect();
    };
  }, []);

  const joinDashboard = () => {
    const trimmedName = agentName.trim();

    if (!trimmedName) {
      alert("Please enter an agent name.");
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_dashboard", trimmedName);
    setJoined(true);
  };

  const lockTicket = (ticketId: number) => {
    socket.emit("lock_ticket", {
      ticketId,
      agentName: agentName.trim(),
    });
  };

  const unlockTicket = (ticketId: number) => {
    socket.emit("unlock_ticket", {
      ticketId,
    });
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      {!connected && joined && (
        <div className="mb-6 rounded-md bg-red-600 px-4 py-3 text-center font-semibold text-white">
          Connection Lost: Reconnecting...
        </div>
      )}

      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">
          RapidDispatch Live Ops
        </h1>

        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <label className="block text-sm font-semibold text-gray-700">
            Agent Name
          </label>

          <input
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            disabled={joined}
            className="mt-2 w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 disabled:bg-gray-100"
            placeholder="Enter agent name"
          />

          {!joined && (
            <button
              onClick={joinDashboard}
              className="mt-4 rounded-md bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Join Dashboard
            </button>
          )}
        </div>

        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <p className="text-lg font-semibold text-gray-900">
            Connection Status
          </p>

          <p
            className={`mt-2 font-semibold ${
              connected ? "text-green-600" : "text-red-600"
            }`}
          >
            {connected ? "🟢 Connected" : "🔴 Disconnected"}
          </p>

          {message && (
            <p className="mt-3 text-gray-700">
              {message}
            </p>
          )}
        </div>

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Active Support Tickets
          </h2>

          <div className="mt-4 space-y-4">
            {tickets.map((ticket) => {
              const lock = lockedTickets[ticket.id];
              const isMine = lock?.agentName === agentName.trim();

              return (
                <div
                  key={ticket.id}
                  className={`rounded-lg p-5 shadow ${
                    lock ? "bg-gray-300" : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Ticket #{ticket.id}
                      </p>

                      <h3 className="mt-1 text-xl font-bold text-gray-900">
                        {ticket.title}
                      </h3>

                      <p className="mt-1 text-gray-600">
                        Customer: {ticket.customer}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                      {ticket.status}
                    </span>
                  </div>

                  <div className="mt-4">
                    {!lock ? (
                      <button
                        onClick={() => lockTicket(ticket.id)}
                        disabled={!joined}
                        className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        Edit Ticket
                      </button>
                    ) : isMine ? (
                      <button
                        onClick={() => unlockTicket(ticket.id)}
                        className="rounded-md bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
                      >
                        Close Ticket
                      </button>
                    ) : (
                      <button
                        disabled
                        className="cursor-not-allowed rounded-md bg-gray-400 px-4 py-2 font-semibold text-white"
                      >
                        🔒 Locked by {lock.agentName}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}