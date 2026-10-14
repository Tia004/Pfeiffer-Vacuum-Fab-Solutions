"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export type RenderShadingMode = "solid" | "wireframe" | "thermal";

interface RotorStageProps {
  stageIndex: number;
  yOffset: number;
  radius: number;
  bladeCount: number;
  direction: number;
  speedMultiplier: number;
  exploded: number;
  bladeAngleDeg: number;
  shadingMode: RenderShadingMode;
  isSelected: boolean;
  onSelect: (index: number) => void;
}

function RotorStage({
  stageIndex,
  yOffset,
  radius,
  bladeCount,
  direction,
  speedMultiplier,
  exploded,
  bladeAngleDeg,
  shadingMode,
  isSelected,
  onSelect,
}: RotorStageProps) {
  const groupRef = useRef<THREE.Group>(null);

  const blades = useMemo(() => {
    const arr = [];
    for (let i = 0; i < bladeCount; i++) {
      const angle = (i / bladeCount) * Math.PI * 2;
      arr.push({
        angle,
        x: Math.cos(angle) * (radius * 0.78),
        z: Math.sin(angle) * (radius * 0.78),
      });
    }
    return arr;
  }, [bladeCount, radius]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * direction * speedMultiplier * 1.8;
      // Axial separation during exploded view
      const targetY = yOffset * (1 + exploded * 1.25);
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetY,
        0.08
      );
    }
  });

  // Dynamic thermal color simulation from Stage 1 (cool inlet 22°C) to Stage 7 (warm 46°C)
  const thermalColors = [
    "#38bdf8", // Cool cyan (Inlet UHV)
    "#34d399", // Emerald
    "#a3e635", // Lime
    "#facc15", // Yellow
    "#fb923c", // Amber
    "#f87171", // Coral
    "#ff3b1d", // Hot Vermilion (Discharge)
  ];

  const bladeColor = isSelected
    ? "#ff3b1d"
    : shadingMode === "thermal"
    ? thermalColors[stageIndex]
    : "#f4f4f7";

  const hubColor = isSelected
    ? "#ff5722"
    : shadingMode === "thermal"
    ? thermalColors[stageIndex]
    : "#d4d4d8";

  return (
    <group
      ref={groupRef}
      position={[0, yOffset, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(stageIndex);
      }}
    >
      {/* Central Hub Collar */}
      <mesh>
        <cylinderGeometry args={[radius * 0.52, radius * 0.55, 0.14, 48, 1, false]} />
        <meshStandardMaterial
          color={hubColor}
          metalness={shadingMode === "wireframe" ? 0.2 : 0.94}
          roughness={0.16}
          wireframe={shadingMode === "wireframe"}
          emissive={isSelected ? "#ff3b1d" : "#000000"}
          emissiveIntensity={isSelected ? 0.4 : 0}
        />
      </mesh>

      {/* Laser Balancing Indexing Ring */}
      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[radius * 0.53, 0.012, 16, 48]} />
        <meshStandardMaterial
          color={isSelected ? "#ffffff" : "#a1a1aa"}
          metalness={0.98}
          roughness={0.1}
        />
      </mesh>

      {/* High-Precision Angled Turbomolecular Rotor Blades */}
      {blades.map((b, idx) => (
        <group
          key={idx}
          position={[b.x, 0, b.z]}
          rotation={[
            0,
            -b.angle + Math.PI / 2,
            direction * (bladeAngleDeg * (Math.PI / 180)),
          ]}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.022, 0.11, radius * 0.48]} />
            <meshStandardMaterial
              color={bladeColor}
              metalness={shadingMode === "wireframe" ? 0.2 : 0.96}
              roughness={0.12}
              wireframe={shadingMode === "wireframe"}
              emissive={isSelected ? "#ff3b1d" : "#000000"}
              emissiveIntensity={isSelected ? 0.7 : 0}
            />
          </mesh>
        </group>
      ))}

      {/* Selection Glow Halo */}
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[radius * 1.05, 0.018, 16, 64]} />
          <meshBasicMaterial color="#ff3b1d" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function TurbomolecularAssembly({
  scrollProgress,
  rpmMode,
  explodedView,
  shadingMode,
  selectedStage,
  onSelectStage,
}: {
  scrollProgress: number;
  rpmMode: "nominal" | "overdrive" | "standby";
  explodedView: boolean;
  shadingMode: RenderShadingMode;
  selectedStage: number | null;
  onSelectStage: (idx: number) => void;
}) {
  const assemblyRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const telemetryRing2Ref = useRef<THREE.Mesh>(null);
  const innerCageRef = useRef<THREE.Mesh>(null);

  const speedMultiplier =
    rpmMode === "overdrive" ? 3.4 : rpmMode === "standby" ? 0.28 : 1.15;
  const explodedFactor = explodedView ? 1 : 0;

  useFrame((state) => {
    if (!assemblyRef.current) return;
    const { x, y } = state.pointer;

    // Gentle natural drift when not overridden by orbit controls
    assemblyRef.current.rotation.x = THREE.MathUtils.lerp(
      assemblyRef.current.rotation.x,
      0.34 + y * 0.18 + scrollProgress * 0.65,
      0.04
    );
    assemblyRef.current.rotation.y = THREE.MathUtils.lerp(
      assemblyRef.current.rotation.y,
      x * 0.35 + scrollProgress * Math.PI * 1.1,
      0.04
    );

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z -= 0.003 * speedMultiplier;
    }
    if (telemetryRing2Ref.current) {
      telemetryRing2Ref.current.rotation.x += 0.004 * speedMultiplier;
    }
    if (innerCageRef.current) {
      innerCageRef.current.rotation.y -= 0.004 * speedMultiplier;
    }
  });

  const stages = [
    { yOffset: 1.05, radius: 1.62, bladeCount: 36, direction: 1, bladeAngleDeg: 42 },
    { yOffset: 0.75, radius: 1.55, bladeCount: 34, direction: -1, bladeAngleDeg: 38 },
    { yOffset: 0.45, radius: 1.48, bladeCount: 32, direction: 1, bladeAngleDeg: 34 },
    { yOffset: 0.15, radius: 1.41, bladeCount: 30, direction: -1, bladeAngleDeg: 30 },
    { yOffset: -0.15, radius: 1.34, bladeCount: 28, direction: 1, bladeAngleDeg: 26 },
    { yOffset: -0.45, radius: 1.27, bladeCount: 26, direction: -1, bladeAngleDeg: 22 },
    { yOffset: -0.75, radius: 1.2, bladeCount: 24, direction: 1, bladeAngleDeg: 18 },
  ];

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={assemblyRef} scale={1.05}>
        {/* Central Drive Shaft with Active 5-Axis Magnetic Levitation Core */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 3.4, 48]} />
          <meshStandardMaterial
            color="#141417"
            metalness={0.92}
            roughness={0.22}
            wireframe={shadingMode === "wireframe"}
          />
        </mesh>

        {/* Silicon Nitride (Si3N4) Ceramic Hybrid Bearing Rings */}
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.44, 0.44, 0.16, 48]} />
          <meshStandardMaterial
            color="#222226"
            metalness={0.85}
            roughness={0.35}
          />
        </mesh>
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[0.44, 0.44, 0.16, 48]} />
          <meshStandardMaterial
            color="#222226"
            metalness={0.85}
            roughness={0.35}
          />
        </mesh>

        {/* Top Laser-Etched Vermilion Accent Ring */}
        <mesh position={[0, 1.55 + (explodedView ? 0.65 : 0), 0]}>
          <torusGeometry args={[1.72, 0.024, 16, 100]} />
          <meshStandardMaterial
            color="#ff3b1d"
            emissive="#ff3b1d"
            emissiveIntensity={0.85}
          />
        </mesh>

        {/* Exploded View Datum Centerline */}
        {explodedView && (
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.007, 0.007, 4.4, 8]} />
            <meshBasicMaterial color="#ff3b1d" transparent opacity={0.65} />
          </mesh>
        )}

        {/* 7 Progressive Turbomolecular Rotor Stages */}
        {stages.map((st, i) => (
          <RotorStage
            key={i}
            stageIndex={i}
            yOffset={st.yOffset}
            radius={st.radius}
            bladeCount={st.bladeCount}
            direction={st.direction}
            speedMultiplier={speedMultiplier}
            exploded={explodedFactor}
            bladeAngleDeg={st.bladeAngleDeg}
            shadingMode={shadingMode}
            isSelected={selectedStage === i}
            onSelect={onSelectStage}
          />
        ))}

        {/* Holweck Molecular Drag Helical Compression Stage */}
        <group
          position={[0, -1.1 - (explodedView ? 0.35 : 0), 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectStage(7);
          }}
        >
          <mesh>
            <cylinderGeometry args={[1.12, 1.12, 0.5, 48, 1, true]} />
            <meshStandardMaterial
              color={selectedStage === 7 ? "#ff3b1d" : "#3f3f46"}
              metalness={0.9}
              roughness={0.25}
              wireframe={shadingMode === "wireframe"}
              side={THREE.DoubleSide}
              emissive={selectedStage === 7 ? "#ff3b1d" : "#000000"}
              emissiveIntensity={selectedStage === 7 ? 0.5 : 0}
            />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[1.125, 0.015, 12, 48]} />
            <meshStandardMaterial color="#71717a" metalness={0.8} />
          </mesh>
        </group>

        {/* Technical Vacuum Containment Wireframe Cage */}
        <mesh ref={innerCageRef} position={[0, 0.1, 0]}>
          <cylinderGeometry args={[1.88, 1.52, 2.9, 28, 8, true]} />
          <meshStandardMaterial
            color="#52525b"
            wireframe
            transparent
            opacity={shadingMode === "wireframe" ? 0.6 : 0.32}
          />
        </mesh>

        {/* Outer Gimbal Telemetry Calibration Rings */}
        <mesh ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.22, 0.012, 16, 120]} />
          <meshStandardMaterial
            color="#a1a1aa"
            metalness={0.98}
            roughness={0.12}
          />
        </mesh>

        <mesh ref={telemetryRing2Ref} rotation={[0, 0, Math.PI / 3]}>
          <torusGeometry args={[2.34, 0.008, 16, 120]} />
          <meshStandardMaterial
            color="#71717a"
            metalness={0.9}
            roughness={0.2}
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Base DN 250 ConFlat (CF) Ultra-High Vacuum Flange */}
        <mesh position={[0, -1.6 - (explodedView ? 0.6 : 0), 0]}>
          <cylinderGeometry args={[1.82, 1.82, 0.22, 64]} />
          <meshStandardMaterial
            color="#27272a"
            metalness={0.96}
            roughness={0.18}
            wireframe={shadingMode === "wireframe"}
          />
        </mesh>

        {/* Flange Bolt Holes Indicator */}
        <mesh position={[0, -1.5 - (explodedView ? 0.6 : 0), 0]}>
          <torusGeometry args={[1.72, 0.018, 12, 24]} />
          <meshStandardMaterial
            color="#52525b"
            metalness={0.95}
            roughness={0.3}
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function TurbineCanvas({
  scrollProgress,
  rpmMode,
  explodedView,
  shadingMode = "solid",
  selectedStage = null,
  onSelectStage = () => {},
}: {
  scrollProgress: number;
  rpmMode: "nominal" | "overdrive" | "standby";
  explodedView: boolean;
  shadingMode?: RenderShadingMode;
  selectedStage?: number | null;
  onSelectStage?: (idx: number) => void;
}) {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 0.35, 5.4], fov: 37 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[6, 9, 5]} intensity={2.6} color="#ffffff" />
        <directionalLight position={[-6, -4, -4]} intensity={1.4} color="#ff3b1d" />
        <pointLight position={[0, 3.5, 2.5]} intensity={1.6} color="#f4f4f5" />
        <pointLight position={[0, -2.5, -2]} intensity={0.9} color="#71717a" />
        <hemisphereLight args={["#ffffff", "#09090b", 0.65]} />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3.8}
          maxDistance={7.5}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 3.4}
          rotateSpeed={0.65}
        />

        <TurbomolecularAssembly
          scrollProgress={scrollProgress}
          rpmMode={rpmMode}
          explodedView={explodedView}
          shadingMode={shadingMode}
          selectedStage={selectedStage}
          onSelectStage={onSelectStage}
        />
      </Canvas>
    </div>
  );
}
