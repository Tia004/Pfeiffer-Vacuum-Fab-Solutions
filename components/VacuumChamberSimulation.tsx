"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { sound } from "@/utils/audio";

interface Molecule {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface VacuumChamberSimulationProps {
  chamberVolume: number;
  gasType: "N2" | "Ar" | "He" | "H2";
  targetExponent: number;
}

export default function VacuumChamberSimulation({
  chamberVolume,
  gasType,
  targetExponent,
}: VacuumChamberSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPumping, setIsPumping] = useState(false);
  const [pressureExp, setPressureExp] = useState(3.0); // 10^3 hPa (Atmospheric)
  const [evacuatedCount, setEvacuatedCount] = useState(0);
  const [activeMoleculesCount, setActiveMoleculesCount] = useState(140);
  const animFrameRef = useRef<number | null>(null);
  const moleculesRef = useRef<Molecule[]>([]);
  const pumpSpeedRef = useRef(0);

  // Gas velocity & physics parameters
  const gasProps: Record<
    "N2" | "Ar" | "He" | "H2",
    { speed: number; radius: number; color: string; label: string; mass: string }
  > = {
    N2: { speed: 2.2, radius: 3.5, color: "#e2e8f0", label: "Azoto (N₂)", mass: "28 u" },
    Ar: { speed: 1.8, radius: 4.2, color: "#818cf8", label: "Argon (Ar)", mass: "40 u" },
    He: { speed: 4.6, radius: 2.2, color: "#f59e0b", label: "Elio (He)", mass: "4 u" },
    H2: { speed: 5.8, radius: 1.8, color: "#ec4899", label: "Idrogeno (H₂)", mass: "2 u" },
  };

  const initMolecules = useCallback(
    (count = 140) => {
      const g = gasProps[gasType];
      const newMols: Molecule[] = [];
      const w = 480;
      const h = 260;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const vel = (g.speed * (0.7 + Math.random() * 0.6));
        newMols.push({
          x: 20 + Math.random() * (w - 40),
          y: 20 + Math.random() * (h - 70), // Within chamber body
          vx: Math.cos(angle) * vel,
          vy: Math.sin(angle) * vel,
          radius: g.radius,
          color: g.color,
        });
      }
      moleculesRef.current = newMols;
      setActiveMoleculesCount(newMols.length);
    },
    [gasType]
  );

  // Initialize or reset simulation on gasType change
  useEffect(() => {
    initMolecules(140);
    setPressureExp(3.0);
    setEvacuatedCount(0);
    setIsPumping(false);
  }, [gasType, initMolecules]);

  // Main 60fps physics simulation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const w = canvas.width;
      const h = canvas.height;

      // Clear with dark high-tech background
      ctx.fillStyle = "#070709";
      ctx.fillRect(0, 0, w, h);

      // Draw Chamber Walls (Hairline Technical Blueprint)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
      ctx.lineWidth = 1.5;

      // Main Chamber Body (Top Dome & Cylinder)
      ctx.beginPath();
      ctx.moveTo(16, h - 55);
      ctx.lineTo(16, 24);
      ctx.arcTo(16, 12, 28, 12, 14);
      ctx.lineTo(w - 28, 12);
      ctx.arcTo(w - 16, 12, w - 16, 24, 14);
      ctx.lineTo(w - 16, h - 55);
      ctx.stroke();

      // Lower Funnel & Turbopump Flange Intake
      const intakeLeft = w / 2 - 46;
      const intakeRight = w / 2 + 46;

      ctx.beginPath();
      ctx.moveTo(16, h - 55);
      ctx.lineTo(intakeLeft, h - 45);
      ctx.lineTo(intakeLeft, h - 6);
      ctx.moveTo(w - 16, h - 55);
      ctx.lineTo(intakeRight, h - 45);
      ctx.lineTo(intakeRight, h - 6);
      ctx.stroke();

      // Flange Bolt Marks
      ctx.fillStyle = "#ff3b1d";
      ctx.fillRect(intakeLeft - 8, h - 14, 8, 8);
      ctx.fillRect(intakeRight, h - 14, 8, 8);

      // Turbopump Rotating Impeller Blades Representation
      const pumpCenter = w / 2;
      const pumpY = h - 26;
      ctx.save();
      ctx.translate(pumpCenter, pumpY);
      pumpSpeedRef.current += isPumping ? 0.35 : 0.02;
      ctx.rotate(pumpSpeedRef.current);
      for (let b = 0; b < 6; b++) {
        ctx.rotate((Math.PI * 2) / 6);
        ctx.fillStyle = isPumping ? "#ff3b1d" : "rgba(255, 255, 255, 0.35)";
        ctx.fillRect(-1.5, -20, 3, 20);
      }
      ctx.restore();

      // Intake Suction Vector Guides (When pumping)
      if (isPumping) {
        ctx.strokeStyle = "rgba(255, 59, 29, 0.25)";
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(intakeLeft + 8, h - 42);
        ctx.lineTo(w / 2, h - 20);
        ctx.moveTo(intakeRight - 8, h - 42);
        ctx.lineTo(w / 2, h - 20);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Update & Render Molecules
      const mols = moleculesRef.current;
      const chamberBottom = h - 55;

      for (let i = mols.length - 1; i >= 0; i--) {
        const m = mols[i];

        // Apply suction velocity towards the turbopump intake if pumping
        if (isPumping) {
          const dx = w / 2 - m.x;
          const dy = (h - 25) - m.y;
          const dist = Math.hypot(dx, dy);
          if (m.y > chamberBottom - 60 && Math.abs(dx) < 80) {
            m.vx += (dx / dist) * 0.8;
            m.vy += (dy / dist) * 1.2;
          }
        }

        m.x += m.vx * (dt * 60);
        m.y += m.vy * (dt * 60);

        // Wall collisions
        if (m.x - m.radius < 18) {
          m.x = 18 + m.radius;
          m.vx *= -1;
        } else if (m.x + m.radius > w - 18) {
          m.x = w - 18 - m.radius;
          m.vx *= -1;
        }

        if (m.y - m.radius < 14) {
          m.y = 14 + m.radius;
          m.vy *= -1;
        }

        // Bottom boundary & Turbopump capture zone
        if (m.y + m.radius > chamberBottom) {
          if (m.x > intakeLeft && m.x < intakeRight) {
            // Molecule entered the turbomolecular intake throat!
            if (isPumping && m.y > h - 25) {
              mols.splice(i, 1);
              setEvacuatedCount((c) => c + 1);
              continue;
            }
          } else {
            m.y = chamberBottom - m.radius;
            m.vy *= -1;
          }
        }

        // Render molecule with crisp glow
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fillStyle = m.color;
        ctx.fill();
      }

      setActiveMoleculesCount(mols.length);

      // Decrement Pressure Exponentially when Pumping
      if (isPumping) {
        setPressureExp((prev) => {
          if (prev <= targetExponent) {
            return targetExponent;
          }
          const step = (0.016 * (600 / chamberVolume));
          const next = Number((prev - step).toFixed(2));
          return next < targetExponent ? targetExponent : next;
        });
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPumping, chamberVolume, targetExponent]);

  const togglePumping = () => {
    sound.playToggle();
    if (!isPumping) {
      sound.playTurbineRamp(950, 1.4);
    }
    setIsPumping((prev) => !prev);
  };

  const ventChamber = () => {
    sound.playClick(600);
    setIsPumping(false);
    initMolecules(140);
    setPressureExp(3.0);
    setEvacuatedCount(0);
  };

  // Vacuum regime classification
  const regime =
    pressureExp <= -9
      ? { label: "ULTRA-ALTO VUOTO (UHV)", desc: "Regime Molecolare Libero puro: Kn > 10. Nessuna collisione gas-gas." }
      : pressureExp <= -3
      ? { label: "ALTO VUOTO (HV)", desc: "Transizione Molecolare: il cammino libero medio supera 1 metro." }
      : pressureExp <= 0
      ? { label: "MEDIO VUOTO (MV)", desc: "Regime di Knudsen: flusso viscoso in transizione verso molecolare." }
      : { label: "PRESSIONE ATMOSFERICA / BASSO VUOTO", desc: "Regime Viscoso Continuo: Kn < 0.01. Molecole dominate da collisioni intermolecolari." };

  return (
    <div className="border border-white/15 bg-[#0a0a0d] p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="font-mono text-xs text-[#ff3b1d] uppercase tracking-wider flex items-center gap-2">
            <span className="css-icon-crosshair text-[#ff3b1d]" />
            <span>SIMULATORE DINAMICO CAMERA & TURBOPOMPA (ISO 21360)</span>
          </div>
          <div className="font-mono text-[11px] text-zinc-500 mt-0.5">
            SPECIE: {gasProps[gasType].label} // MASSA: {gasProps[gasType].mass}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={togglePumping}
            className={`px-4 py-2 uppercase font-semibold tracking-wider transition-colors border ${
              isPumping
                ? "bg-[#ff3b1d] border-[#ff3b1d] text-black"
                : "bg-white text-black hover:bg-[#ff3b1d] border-white"
            }`}
          >
            {isPumping ? "PAUSA EVACUAZIONE" : "AVVIA PUMP-DOWN"}
          </button>
          <button
            type="button"
            onClick={ventChamber}
            className="px-3 py-2 border border-white/20 text-zinc-400 hover:text-white hover:border-white/40 uppercase transition-colors"
          >
            VENT
          </button>
        </div>
      </div>

      {/* Interactive 2D Canvas & Gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Canvas Cross-Section */}
        <div className="lg:col-span-7 relative bg-[#060608] border border-white/10 rounded-sm overflow-hidden flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={480}
            height={260}
            className="w-full max-w-[480px] h-auto block"
          />
          <div className="absolute top-3 left-3 font-mono text-[9px] text-zinc-500 uppercase tracking-widest pointer-events-none">
            VACUUM CHAMBER SCHEMATIC // 2D BROWNIAN STREAM
          </div>
          <div className="absolute bottom-2 left-3 font-mono text-[9px] text-zinc-500 uppercase pointer-events-none">
            INLET FLANGE DN 250
          </div>
          <div className="absolute bottom-2 right-3 font-mono text-[9px] text-[#ff3b1d] uppercase pointer-events-none">
            HIPACE ROTOR INLET
          </div>
        </div>

        {/* Industrial Telemetry Gauges */}
        <div className="lg:col-span-5 space-y-4 font-mono">
          <div className="p-4 border border-white/10 bg-[#070708] space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase block tracking-wider">
              PRESSIONE ATTUALE CAMERA
            </span>
            <div className="text-2xl sm:text-3xl font-light text-emerald-400">
              1.0 × 10^{pressureExp.toFixed(2)}{" "}
              <span className="text-xs text-zinc-400">hPa</span>
            </div>
            <div className="text-[10px] text-zinc-500">
              PRESSIONE TARGET: 1 · 10^{targetExponent} hPa
            </div>
          </div>

          <div className="p-4 border border-white/10 bg-[#070708] space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase block tracking-wider">
              REGIME FISICO DEL VUOTO
            </span>
            <div className="text-xs font-semibold text-white uppercase">
              {regime.label}
            </div>
            <p className="text-[11px] text-zinc-400 font-sans leading-snug">
              {regime.desc}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 border border-white/10 bg-[#070708]">
              <span className="text-[9px] text-zinc-500 uppercase block">
                MOLECOLE RESIDUE
              </span>
              <span className="text-white text-base font-medium">
                {activeMoleculesCount}
              </span>
            </div>
            <div className="p-3 border border-white/10 bg-[#070708]">
              <span className="text-[9px] text-zinc-500 uppercase block">
                MOLECOLE EVACUATE
              </span>
              <span className="text-[#ff3b1d] text-base font-medium">
                {evacuatedCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
