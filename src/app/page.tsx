import Image from "next/image";
import initWebSocketClient from "./helpers/ws/client";

export default function Home() {

  initWebSocketClient()

  return (
    <main className="pt-10 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4 text-accent">Pong Online</h1>
      <p className="text-lg mb-8 ">Play Pong Online with friends in real-time or on one device.</p>
      <Image
        src="/pong-game.png"
        alt="Pong Game Screenshot"
        width={600}
        height={400}
        className="rounded-lg shadow-lg"
      />
      <div className="mt-8 gap-3 flex flex-col sm:flex-row">
        <a
          href="/create"
          className="px-6 py-3 bg-secondary text-white rounded hover:bg-secondary transition-colors"
        >
          Create Room
        </a>
        <a
          href="/join"
          className="px-6 py-3 bg-secondary text-white rounded hover:bg-secondary transition-colors"
        >
          Join Room
        </a>
      </div>
    </main>
  );
}
