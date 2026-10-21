import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { BookOpen, Play, Sparkles, GraduationCap, Users, Award, Shield } from 'lucide-react';

const HERO_URLS = [
  'https://images.unsplash.com/photo-1517245386807-edb411fe24e4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
];

const itemCount = HERO_URLS.length;

function CourseCube({ index }) {
  const ref = useRef();
  const x = ((index % 3) - 1) * 3.2;
  const y = Math.floor(index / 3) * 3.2 - 1.6;
  const texture = new THREE.TextureLoader().load(HERO_URLS[index]);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.005;
      ref.current.rotation.z = Math.sin(Date.now() * 0.001 + index) * 0.05;
      ref.current.position.y = Math.sin(Date.now() * 0.001 + index) * 0.4;
    }
  });

  return (
    <mesh
      ref={ref}
      position={[x, y, 0]}
      rotation={[0, 0, ((index % 3) - 1) * 0.2]}
    >
      <boxGeometry args={[2.2, 2.2, 0.12]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent
        opacity={0.95}
        roughness={0.3}
        metalness={0.1}
      />
      <Float speed={1 + index * 0.3} rotationIntensity={0.4} floatIntensity={0.35} />
    </mesh>
  );
}

function ParticleRing() {
  const pointsRef = useRef();
  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.002;
      pointsRef.current.rotation.x += 0.001;
    }
  });

  const geometry = new THREE.BufferGeometry();
  const count = 400;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 40;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  return (
    <points
      ref={pointsRef}
      position={[0, 0, 0]}
    >
      <bufferGeometry attach="geometry" args={[geometry]} />
      <pointsMaterial
        size={0.08}
        transparent
        opacity={0.6}
        color="#0ea5e9"
        sizeAttenuation
      />
    </points>
  );
}

export default function Hero3D() {
  const [hovered, setHovered] = useState(false);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent -z-10" />
      <Canvas
        className="canvas3d"
        shadows
        camera={{ position: [0, 0, 10], fov: 45 }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#0ea5e9" />
        <pointLight position={[-10, -10, 10]} intensity={1.5} color="#14b8a6" />
        <pointLight position={[0, 10, -10]} intensity={1} color="#ffffff" />
        <Stars radius={140} depth={80} count={350} factor={4} saturation={0.3} fadeSpeed={8} speed={1} />
        <Grid
          args={[40, 40]}
          position={[0, -3, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          cellSize={4}
          cellColor="#0ea5e9"
          sectionColor="rgba(14, 165, 233, 0.1)"
          sectionSize={8}
        />
        <OrbitControls
          enablePan={false}
          enableZoom={hovered ? false : true}
          autoRotate={!hovered}
          autoRotateSpeed={1.5}
          makeDefault
        />
        <ParticleRing />
        {[...Array(itemCount)].map((_, i) => (
          <CourseCube key={i} index={i} />
        ))}
      </Canvas>
      <div
        className="absolute inset-0 bg-gradient-to-t from-bgDark/90 dark:from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 group"
      />
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-full max-w-xs flex justify-center pointer-events-none">
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/95 dark:bg-white/10 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-100 tracking-wider uppercase">
            Live 3D course gallery
          </span>
        </div>
      </div>
    </section>
  );
}

export function HeroFallback() {
  return (
    <div className="relative w-full h-[640px] lg:h-[800px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-full blur-[120px] -z-10 animate-pulse-slow" />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-glow animate-float">
          <GraduationCap className="w-10 h-10" />
        </div>
        <div className="flex gap-4">
          {[BookOpen, Play, Sparkles].map((Icon) => (
            <div
              key={Icon.name}
              className="w-14 h-14 rounded-3xl bg-white/80 dark:bg-white/10 backdrop-blur-2xl flex items-center justify-center text-primary shadow-xl animate-float-slow border border-white/40 dark:border-white/10"
            >
              <Icon className="w-6 h-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
