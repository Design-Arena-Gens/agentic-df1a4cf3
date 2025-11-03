"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const ThreeCaseScene = dynamic(() => import("../components/ThreeCaseScene"), {
  ssr: false
});

export default function Page() {
  const [seed, setSeed] = useState(0);
  return (
    <main className="page">
      <header className="hud top">
        <h1>Case Opener 3D</h1>
        <p className="subtitle">Open futuristic cases and discover rare items</p>
      </header>
      <ThreeCaseScene key={seed} onOpened={() => setSeed((s) => s + 1)} />
      <footer className="hud bottom">
        <p>Built with React Three Fiber & Drei</p>
      </footer>
    </main>
  );
}
