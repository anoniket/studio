'use client';

import React, { useEffect, useState } from 'react';

const NUM_CONFETTI = 150;
const COLORS = [
  [85, 71, 106],
  [174, 61, 99],
  [219, 56, 83],
  [244, 92, 68],
  [248, 182, 70],
];
const PI_2 = 2 * Math.PI;

type ConfettiParticle = {
  x: number;
  y: number;
  r: number;
  d: number;
  color: number[];
  tilt: number;
  tiltAngle: number;
  tiltAngleInc: number;
};

export const Confetti: React.FC = () => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

  const startConfetti = () => {
    const newParticles: ConfettiParticle[] = [];
    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = 0; i < NUM_CONFETTI; i++) {
      newParticles.push({
        x: Math.random() * width,
        y: -20,
        r: Math.random() * 6 + 4,
        d: Math.random() * NUM_CONFETTI + 10,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngle: 0,
        tiltAngleInc: Math.random() * 0.07 + 0.05,
      });
    }
    setParticles(newParticles);
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    runAnimation(newParticles);
  };

  const runAnimation = (currentParticles: ConfettiParticle[]) => {
    const draw = (updatedParticles: ConfettiParticle[]) => {
      const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;

      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      updatedParticles.forEach((p) => {
        context.beginPath();
        context.lineWidth = p.r / 1.5;
        context.strokeStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, 1)`;
        context.moveTo(p.x + p.tilt + p.r / 4, p.y);
        context.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
        context.stroke();
      });

      const newParticles = update(updatedParticles);
      const id = requestAnimationFrame(() => draw(newParticles));
      setAnimationFrameId(id);
    };

    const update = (current: ConfettiParticle[]) => {
      const height = window.innerHeight;
      return current.map((p) => {
        const newParticle = { ...p };
        newParticle.tiltAngle += newParticle.tiltAngleInc;
        newParticle.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        newParticle.tilt = Math.sin(p.tiltAngle - p.d / 4) * 15;

        if (newParticle.y > height) {
          // Reset particle
          newParticle.x = Math.random() * window.innerWidth;
          newParticle.y = -20;
          newParticle.tilt = Math.floor(Math.random() * 10) - 10;
        }
        return newParticle;
      });
    };
    
    draw(currentParticles);
  };
  
  useEffect(() => {
    startConfetti();
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      id="confetti-canvas"
      width={typeof window !== 'undefined' ? window.innerWidth : 0}
      height={typeof window !== 'undefined' ? window.innerHeight : 0}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    />
  );
};
