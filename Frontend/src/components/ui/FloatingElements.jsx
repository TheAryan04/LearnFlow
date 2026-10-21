import React from 'react';

const ORBS = [
  { color: 'from-primary/20 to-primary/40', x: '-10%', y: '-20%', w: 'w-96 h-96', delay: '0s', dur: '8s' },
  { color: 'from-accent/20 to-accent/40', x: '90%', y: '10%', w: 'w-80 h-80', delay: '2s', dur: '10s' },
  { color: 'from-primary/10 to-transparent', x: '40%', y: '80%', w: 'w-64 h-64', delay: '4s', dur: '7s' },
  { color: 'from-accent/10 to-transparent', x: '-5%', y: '60%', w: 'w-48 h-48', delay: '1s', dur: '9s' },
];

export default function FloatingElements({ className = '' }) {
  return (
    <div
      className={`fixed inset-0 -z-10 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-[120px] ${orb.w} ${orb.color} opacity-70 animate-float`}
          style={{
            left: orb.x,
            top: orb.y,
            animationDelay: orb.delay,
            animationDuration: orb.dur,
          }}
        />
      ))}
    </div>
  );
}
