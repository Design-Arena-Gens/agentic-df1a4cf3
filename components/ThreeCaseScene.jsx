"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, ContactShadows, Float, Stars, Sparkles, Text, Html } from "@react-three/drei";
import { useMemo, useRef, useState, useCallback } from "react";
import * as THREE from "three";

const ITEMS = [
  { name: "Nebula Dagger", rarity: "legendary", color: "#ff6b6b", glow: 2.2 },
  { name: "Aurora Rifle", rarity: "epic", color: "#7bf1a8", glow: 1.6 },
  { name: "Quasar Pistol", rarity: "epic", color: "#6ea8fe", glow: 1.6 },
  { name: "Ion Blade", rarity: "rare", color: "#ffd166", glow: 1.2 },
  { name: "Plasma SMG", rarity: "rare", color: "#b388ff", glow: 1.2 },
  { name: "Carbon Knife", rarity: "uncommon", color: "#64dfdf", glow: 0.9 },
  { name: "Scout", rarity: "common", color: "#adb5bd", glow: 0.6 },
  { name: "Ranger", rarity: "common", color: "#ced4da", glow: 0.6 }
];

const WEIGHTS = {
  legendary: 0.5,
  epic: 3,
  rare: 12,
  uncommon: 24,
  common: 60
};

function weightedRandom(items) {
  const pool = [];
  for (const item of items) {
    const count = Math.round(WEIGHTS[item.rarity] * 10);
    for (let i = 0; i < count; i++) pool.push(item);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function CaseBox({ state, onOpenStart, onOpenEnd, accent = "#8be9fd" }) {
  const lidRef = useRef();
  const baseRef = useRef();
  const [t, setT] = useState(0);

  useFrame((_, delta) => {
    // Idle breathing pulse
    const base = baseRef.current;
    if (base) {
      base.rotation.y += delta * 0.25;
    }
    // Lid open animation
    if (state === "opening") {
      const next = Math.min(1, t + delta * 1.1);
      setT(next);
      if (lidRef.current) lidRef.current.rotation.x = -Math.sin(next * Math.PI * 0.5) * 1.2;
      if (next === 1) onOpenEnd?.();
    } else if (state === "idle") {
      setT(0);
      if (lidRef.current) lidRef.current.rotation.x = 0;
    }
  });

  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1f1f24", metalness: 0.9, roughness: 0.25 }), []);
  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 1.25, metalness: 0.4, roughness: 0.3 }), [accent]);

  return (
    <group ref={baseRef}>
      {/* Base */}
      <mesh castShadow receiveShadow position={[0, 0.2, 0]} material={metal}>
        <boxGeometry args={[2.8, 0.4, 1.8]} />
      </mesh>
      {/* Sides */}
      <mesh castShadow receiveShadow position={[0, 0.8, -0.7]} material={metal}>
        <boxGeometry args={[2.6, 0.8, 0.4]} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.8, 0.7]} material={metal}>
        <boxGeometry args={[2.6, 0.8, 0.4]} />
      </mesh>
      <mesh castShadow receiveShadow position={[-1.2, 0.8, 0]} material={metal}>
        <boxGeometry args={[0.4, 0.8, 1.4]} />
      </mesh>
      <mesh castShadow receiveShadow position={[1.2, 0.8, 0]} material={metal}>
        <boxGeometry args={[0.4, 0.8, 1.4]} />
      </mesh>
      {/* Accents */}
      <mesh position={[0, 0.6, 0]} material={accentMat}>
        <boxGeometry args={[2.2, 0.1, 1.2]} />
      </mesh>

      {/* Lid */}
      <group position={[0, 1.2, -0.9]}>
        <group ref={lidRef} position={[0, 0, 0.9]}>
          <mesh castShadow receiveShadow position={[0, 0.15, -0.1]} material={metal}>
            <boxGeometry args={[2.6, 0.3, 2]} />
          </mesh>
          <mesh position={[0, 0.1, -0.1]} material={accentMat}>
            <boxGeometry args={[2.2, 0.06, 1.6]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Reward({ item, visible }) {
  const group = useRef();
  const glow = useRef();
  const [phase, setPhase] = useState(0);

  useFrame((state, delta) => {
    if (!visible) return;
    const t = Math.min(1, phase + delta * 0.8);
    setPhase(t);
    const y = THREE.MathUtils.lerp(0.2, 1.4, Math.pow(t, 0.8));
    if (group.current) {
      group.current.position.y = y;
      group.current.rotation.y += delta * 0.8;
    }
    if (glow.current) {
      glow.current.scale.setScalar(THREE.MathUtils.lerp(0.2, 1.4, t));
      glow.current.material.opacity = THREE.MathUtils.lerp(0.0, 0.35 + item.glow * 0.07, t);
    }
  });

  const coreColor = new THREE.Color(item.color);

  return (
    <group ref={group} position={[0, 0.2, 0]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.35, 1]} />
          <meshStandardMaterial color={coreColor} metalness={0.2} roughness={0.1} emissive={coreColor} emissiveIntensity={0.3 + item.glow * 0.2} />
        </mesh>
      </Float>
      <mesh ref={glow} position={[0, 0, 0]}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial color={coreColor} transparent opacity={0.0} blending={THREE.AdditiveBlending} />
      </mesh>
      <Sparkles count={60 + Math.floor(item.glow * 25)} scale={[2, 2, 2]} opacity={0.7} speed={0.6} color={coreColor} size={2.5} />
      <Text position={[0, -0.9, 0]} fontSize={0.22} color="#ffffff" outlineWidth={0.008} outlineColor="#000000" anchorX="center" anchorY="middle">
        {item.name}
      </Text>
    </group>
  );
}

function Particles() {
  const ref = useRef();
  const count = 800;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6 * Math.random();
      const a = Math.random() * Math.PI * 2;
      const h = (Math.random() - 0.5) * 2.5;
      arr[i * 3 + 0] = Math.cos(a) * r;
      arr[i * 3 + 1] = h;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#88ccff" size={0.02} sizeAttenuation transparent opacity={0.5} />
    </points>
  );
}

export default function ThreeCaseScene({ onOpened }) {
  const [state, setState] = useState("idle"); // idle | opening | revealed
  const [item, setItem] = useState(() => weightedRandom(ITEMS));
  const [accent, setAccent] = useState("#6ee7ff");

  const startOpen = useCallback(() => {
    if (state !== "idle") return;
    setState("opening");
    setTimeout(() => setAccent(item.color), 250);
  }, [state, item]);

  const finishOpen = useCallback(() => {
    setState("revealed");
    setTimeout(() => onOpened?.(), 5200);
  }, [onOpened]);

  const reroll = useCallback(() => {
    setItem(weightedRandom(ITEMS));
    setAccent("#6ee7ff");
    setState("idle");
  }, []);

  return (
    <div className="stage">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [3.5, 2.2, 3.5], fov: 48 }}>
        <color attach="background" args={["#0b0e14"]} />
        <fog attach="fog" args={["#0b0e14", 10, 30]} />

        <ambientLight intensity={0.2} />
        <directionalLight position={[4, 6, 4]} intensity={2.2} castShadow shadow-mapSize={2048} />
        <pointLight position={[-3, 3, -2]} intensity={1.3} color={accent} />
        <pointLight position={[2, 2, -3]} intensity={0.8} color="#88aaff" />

        <Environment preset="night" />
        <Stars radius={60} depth={30} count={2500} factor={4} fade speed={0.3} />
        <Particles />

        <group position={[0, 0, 0]}>
          <CaseBox state={state} onOpenStart={() => {}} onOpenEnd={finishOpen} accent={accent} />
          <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0]} receiveShadow>
            <circleGeometry args={[6, 64]} />
            <meshStandardMaterial color="#0f131b" metalness={0.2} roughness={0.8} />
          </mesh>
          <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={10} blur={2.6} far={6} />
        </group>

        {state !== "idle" && <Reward item={item} visible={state === "revealed"} />}

        <OrbitControls enablePan={false} minDistance={3} maxDistance={7} minPolarAngle={0.8} maxPolarAngle={1.35} />
      </Canvas>

      <div className="ui">
        {state === "idle" && (
          <button className="cta" onClick={startOpen}>
            Open Case
          </button>
        )}
        {state === "revealed" && (
          <div className="result">
            <div className={`badge ${item.rarity}`}>{item.rarity}</div>
            <div className="name" style={{ color: item.color }}>{item.name}</div>
            <div className="row">
              <button className="secondary" onClick={reroll}>Open Another</button>
              <button className="ghost" onClick={reroll}>Back</button>
            </div>
          </div>
        )}
        <div className="help">
          Tip: drag to orbit, scroll to zoom
        </div>
      </div>
    </div>
  );
}
