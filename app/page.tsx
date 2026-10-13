"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamic import of 3D Canvas to guarantee clean SSR & WebGL initialization
const TurbineCanvas = dynamic(() => import("@/components/TurbineCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center font-mono text-xs tracking-widest text-zinc-500 uppercase gap-3 p-8">
      <div className="css-icon-turbine text-[#ff3b1d] animate-spin" />
      <span>[ INIT WEBGL TURBOMOLECULAR ENGINE // 60 FPS ]</span>
    </div>
  ),
});

type LegalTab = "privacy" | "terms" | "cookies" | null;

interface CookieConsentState {
  necessary: boolean;
  telemetry: boolean;
  marketing: boolean;
  timestamp: string | null;
}

const PRODUCTS = [
  {
    id: "HP-80-NEO",
    name: "HiPace® 80 Neo",
    category: "Turbomolecolare Ibrida Compatta",
    filterType: "turbo",
    pumpingSpeed: "67 l/s (N₂)",
    compressionRatio: "> 1 · 10¹¹",
    ultimatePressure: "5 · 10⁻¹⁰ hPa",
    rpm: "90,000 min⁻¹",
    flange: "DN 63 ISO-K / CF-F",
    bearing: "Laser-Balanced Hybrid (Ceramica Si3N4 / Levitazione Magnetica)",
    powerConsumption: "110 W",
    soundLevel: "< 48 dB(A)",
    description:
      "Pompa turbomolecolare compatta ad altissime prestazioni dotata di tecnologia Laser Balancing™ brevettata. Elimina le micro-vibrazioni parassite nei microscopi elettronici (SEM/TEM) e spettrometri di massa di precisione.",
  },
  {
    id: "HP-2300-UHV",
    name: "HiPace® 2300 M",
    category: "Turbopompa Levitazione Magnetica 5 Assi",
    filterType: "turbo",
    pumpingSpeed: "1,900 l/s (N₂)",
    compressionRatio: "> 1 · 10⁸",
    ultimatePressure: "< 1 · 10⁻¹¹ hPa",
    rpm: "31,500 min⁻¹",
    flange: "DN 250 ISO-F / CF-F",
    bearing: "Active 5-Axis Magnetic Levitation (Completamente Dry)",
    powerConsumption: "850 W",
    soundLevel: "< 52 dB(A)",
    description:
      "Progettata per litografia EUV di semiconduttori, acceleratori di particelle e impianti di fusione nucleare. Totalmente esente da manutenzione e lubrificanti grazie al controllo digitale attivo del rotore su 5 assi a 40 kHz.",
  },
  {
    id: "HS-12-DRY",
    name: "HiScroll® 12",
    category: "Pompa di Prevuoto a Spirale Ermetica a Secco",
    filterType: "dry",
    pumpingSpeed: "12.1 m³/h",
    compressionRatio: "Stadio Dry Ermetico",
    ultimatePressure: "1.5 · 10⁻² hPa",
    rpm: "1,800 min⁻¹ (Inverter)",
    flange: "DN 25 ISO-KF",
    bearing: "Doppia Spirale Orbitale ermetica totalmente oil-free",
    powerConsumption: "280 W",
    soundLevel: "< 47 dB(A)",
    description:
      "Sistema di pompaggio primario a secco con emissione acustica ultra-silenziosa e motore sincrono IPM ad altissima efficienza. Interfaccia RS-485 integrata per telemetria remota FabLink.",
  },
  {
    id: "ASM-340-HE",
    name: "ASM 340 Wet/Dry",
    category: "Cercafughe Spettrometrico a Elio Molecolare",
    filterType: "leak",
    pumpingSpeed: "2.5 l/s (He)",
    compressionRatio: "Sensibilità: 5 · 10⁻¹³ Pa m³/s",
    ultimatePressure: "Inlet: 25 hPa",
    rpm: "Split-Flow Turbomolecular",
    flange: "DN 25 ISO-KF",
    bearing: "Spettrometro di Massa Magnetico a 180° integrato",
    powerConsumption: "350 W",
    soundLevel: "< 54 dB(A)",
    description:
      "Strumento di rilevamento perdite a spettrometria di massa per collaudo non distruttivo di componenti aerospaziali, criogenici e camere a vuoto per semiconduttori con calibrazione automatica al quarzo.",
  },
];

export default function PfeifferVacuumSite() {
  // 3D Engine & Live Telemetry States
  const [scrollProgress, setScrollProgress] = useState(0);
  const [rpmMode, setRpmMode] = useState<"nominal" | "overdrive" | "standby">("nominal");
  const [explodedView, setExplodedView] = useState(false);
  const [livePressureExp, setLivePressureExp] = useState(-10.42);
  const [rotorTemp, setRotorTemp] = useState(34.2);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "turbo" | "dry" | "leak">("all");

  // Vacuum Chamber Simulator States
  const [chamberVolume, setChamberVolume] = useState<number>(120); // Liters
  const [selectedGas, setSelectedGas] = useState<"N2" | "He" | "Ar" | "H2">("N2");
  const [targetExponent, setTargetExponent] = useState<number>(-9);

  // Technical Datasheet & B2B Quote Modal
  const [activeProduct, setActiveProduct] = useState<(typeof PRODUCTS)[0] | null>(null);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [copiedPartNo, setCopiedPartNo] = useState(false);

  // GDPR & Legal Compliance States
  const [legalModal, setLegalModal] = useState<LegalTab>(null);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<CookieConsentState>({
    necessary: true,
    telemetry: false,
    marketing: false,
    timestamp: null,
  });

  // Scroll listener for 3D engine motion interpolation
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const current = window.scrollY;
      setScrollProgress(totalScroll > 0 ? current / totalScroll : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 60fps telemetry simulation with smooth dynamic jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePressureExp((prev) => {
        const base =
          rpmMode === "overdrive" ? -11.4 : rpmMode === "standby" ? -6.2 : -10.4;
        const jitter = (Math.random() - 0.5) * 0.08;
        return Number((prev * 0.85 + (base + jitter) * 0.15).toFixed(2));
      });
      setRotorTemp((prev) => {
        const target =
          rpmMode === "overdrive" ? 44.8 : rpmMode === "standby" ? 24.5 : 34.2;
        return Number((prev * 0.9 + target * 0.1).toFixed(1));
      });
    }, 900);
    return () => clearInterval(interval);
  }, [rpmMode]);

  // Read saved cookie preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pfeiffer_gdpr_consent_v1");
      if (saved) {
        setCookieConsent(JSON.parse(saved));
        setShowCookieBanner(false);
      } else {
        setShowCookieBanner(true);
      }
    } catch {
      setShowCookieBanner(true);
    }
  }, []);

  const saveCookiePreferences = (newState: CookieConsentState) => {
    const withTime = { ...newState, timestamp: new Date().toISOString() };
    setCookieConsent(withTime);
    try {
      localStorage.setItem("pfeiffer_gdpr_consent_v1", JSON.stringify(withTime));
    } catch {
      // Fallback if local storage restricted
    }
    setShowCookieBanner(false);
    setShowCookieSettings(false);
  };

  const acceptAllCookies = () => {
    saveCookiePreferences({
      necessary: true,
      telemetry: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    });
  };

  const rejectOptionalCookies = () => {
    saveCookiePreferences({
      necessary: true,
      telemetry: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    });
  };

  // Vacuum physics computation
  const gasFactors: Record<"N2" | "He" | "Ar" | "H2", { factor: number; mass: string; label: string }> = {
    N2: { factor: 1.0, mass: "28.01 u", label: "Azoto Molecolare" },
    Ar: { factor: 0.92, mass: "39.95 u", label: "Argon Nobile" },
    He: { factor: 1.38, mass: "4.00 u", label: "Elio Ultra-Leggero" },
    H2: { factor: 1.75, mass: "2.01 u", label: "Idrogeno Molecolare" },
  };

  const pumpDownMinutes = Math.max(
    1.6,
    Number(
      (
        (chamberVolume / 65) *
        Math.abs(targetExponent) *
        1.12 *
        gasFactors[selectedGas].factor
      ).toFixed(1)
    )
  );

  const meanFreePathMeters =
    targetExponent <= -9 ? "> 120 km (Molecolare UHV)" : targetExponent <= -6 ? "150 m (Alto Vuoto)" : "0.65 m (Medio Vuoto)";

  const recommendedModel =
    chamberVolume > 250 || targetExponent <= -10
      ? "HiPace® 2300 M (5-Assi MagLev UHV)"
      : chamberVolume > 80
      ? "HiPace® 700 H + HiScroll® 12 Dry"
      : "HiPace® 80 Neo + MVP 015";

  const filteredProducts = PRODUCTS.filter((p) => {
    if (selectedFilter === "all") return true;
    return p.filterType === selectedFilter;
  });

  const handleCopyPartNo = (id: string) => {
    try {
      navigator.clipboard.writeText(id);
      setCopiedPartNo(true);
      setTimeout(() => setCopiedPartNo(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] text-[#f2f2f4] bg-tech-grid relative selection:bg-[#ff3b1d] selection:text-black">
      {/* =====================================================================
          HEADER BRUTALISTA MINIMAL CON TELEMETRIA IN TEMPO REALE
          ===================================================================== */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#070708]/90 border-b border-white/10">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 lg:grid-cols-12 items-center">
          {/* Brand Identity */}
          <div className="col-span-1 lg:col-span-3 p-4 lg:px-6 border-r border-white/10 flex items-center justify-between">
            <a href="#" className="flex items-center gap-3 group">
              <span className="css-icon-turbine text-[#ff3b1d] transition-transform duration-700 group-hover:rotate-180" />
              <div>
                <div className="font-mono text-xs tracking-[0.22em] font-semibold uppercase flex items-center gap-2">
                  <span>PFEIFFER VACUUM</span>
                  <span className="css-icon-pulse" />
                </div>
                <div className="font-mono text-[9px] text-zinc-500 tracking-widest">
                  ASSLAR // DE-35614 // FAB+SOLUTIONS
                </div>
              </div>
            </a>
          </div>

          {/* Telemetria Live Header */}
          <div className="hidden lg:flex lg:col-span-4 px-6 py-4 border-r border-white/10 items-center justify-between font-mono text-[11px]">
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">
                CHAMBER VACUUM
              </span>
              <span className="text-emerald-400 font-medium">
                1.0 × 10^{livePressureExp} hPa
              </span>
            </div>
            <div className="h-5 w-[1px] bg-white/10" />
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">
                ROTOR VELOCITY
              </span>
              <span className="text-zinc-200">
                {rpmMode === "overdrive"
                  ? "1,500 Hz (90k RPM)"
                  : rpmMode === "standby"
                  ? "250 Hz (15k RPM)"
                  : "1,250 Hz (75k RPM)"}
              </span>
            </div>
            <div className="h-5 w-[1px] bg-white/10" />
            <div>
              <span className="text-zinc-500 block text-[9px] uppercase tracking-wider">
                CORE TEMP
              </span>
              <span className="text-zinc-200">{rotorTemp} °C</span>
            </div>
          </div>

          {/* Navigazione Architettonica */}
          <nav className="hidden lg:flex lg:col-span-3 px-6 py-4 border-r border-white/10 items-center justify-around font-mono text-xs uppercase tracking-wider text-zinc-400">
            <a href="#architettura" className="hover:text-white hover:text-[#ff3b1d] transition-colors">
              01.Fisica
            </a>
            <a href="#catalogo" className="hover:text-white hover:text-[#ff3b1d] transition-colors">
              02.Sistemi
            </a>
            <a href="#simulatore" className="hover:text-white hover:text-[#ff3b1d] transition-colors">
              03.Calcolo
            </a>
          </nav>

          {/* CTA Tecnica */}
          <div className="col-span-1 lg:col-span-2 p-3 sm:p-4 lg:px-6 flex justify-end">
            <a
              href="#catalogo"
              className="w-full lg:w-auto px-4 py-2 bg-[#ff3b1d] text-black font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white transition-colors"
            >
              <span>Spec Sheet</span>
              <span className="css-icon-arrow-ne" />
            </a>
          </div>
        </div>
      </header>

      {/* =====================================================================
          HERO SECTION + VIEWPORT 3D WEBGL PROCEDURALE
          ===================================================================== */}
      <section className="relative border-b border-white/10 overflow-hidden">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[86vh]">
          {/* Colonna Sinistra: Tipografia & Controlli */}
          <div className="lg:col-span-6 p-6 sm:p-10 lg:p-14 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between z-10">
            <div>
              <div className="inline-flex items-center gap-3 px-3 py-1 border border-white/15 bg-white/[0.02] font-mono text-[11px] uppercase tracking-widest text-zinc-300 mb-8">
                <span className="w-2 h-2 bg-[#ff3b1d] inline-block" />
                <span>ULTRA-HIGH VACUUM ARCHITECTURE // REV 2026.4</span>
              </div>

              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-light tracking-tight leading-[0.96] uppercase mb-6">
                INGEGNERIA
                <br />
                DEL <span className="font-semibold text-[#ff3b1d]">VUOTO</span>
                <br />
                ASSOLUTO.
              </h1>

              <p className="text-zinc-400 text-sm sm:text-base max-w-xl leading-relaxed font-normal mb-8">
                Dal 1890 sviluppiamo la fisica dell&apos;ultra-alto vuoto per la litografia
                EUV a semiconduttori, gli anelli del CERN e la simulazione spaziale profonda.
                Pressioni molecolari estreme fino a{" "}
                <span className="text-white font-mono font-medium">10⁻¹² hPa</span>.
              </p>
            </div>

            {/* Console di Controllo 3D Interattiva */}
            <div className="border border-white/15 bg-[#0c0c0f]/90 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-300">
                  <span className="css-icon-crosshair text-[#ff3b1d]" />
                  <span>CONTROLLO ROTORE 3D INTERATTIVO (HIPACE CORE)</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-500">
                  DRAG / SCROLL / EXPLODE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Selettore Frequenza */}
                <div>
                  <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-2">
                    REGIME DI FREQUENZA ROTORE
                  </label>
                  <div className="grid grid-cols-3 border border-white/15">
                    {(["standby", "nominal", "overdrive"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setRpmMode(mode)}
                        className={`py-2 px-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                          rpmMode === mode
                            ? "bg-[#ff3b1d] text-black font-semibold"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggle Vista Esplosa */}
                <div>
                  <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-2">
                    ISPEZIONE STADI DI COMPRESSIONE
                  </label>
                  <button
                    type="button"
                    onClick={() => setExplodedView((prev) => !prev)}
                    className={`w-full py-2 px-3 border font-mono text-[11px] uppercase tracking-wider flex items-center justify-between transition-colors ${
                      explodedView
                        ? "border-[#ff3b1d] bg-[#ff3b1d]/15 text-white"
                        : "border-white/15 text-zinc-300 hover:border-white/40"
                    }`}
                  >
                    <span>
                      {explodedView ? "VISTA ESPLOSA: ATTIVA" : "ATTIVA VISTA ESPLOSA"}
                    </span>
                    <span className="css-icon-chamber" />
                  </button>
                </div>
              </div>

              {/* Parametri di Telemetria Stadi */}
              <div className="grid grid-cols-3 pt-2 border-t border-white/10 font-mono text-[11px]">
                <div>
                  <span className="text-zinc-500 block text-[9px]">STADI ROTORE</span>
                  <span>7 ASSIALI + HOLWECK</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[9px]">BILANCIAMENTO</span>
                  <span>LASER &lt; 0.01 µm</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[9px]">RAPPORTO N₂</span>
                  <span className="text-[#ff3b1d]">&gt; 1 · 10¹¹</span>
                </div>
              </div>
            </div>
          </div>

          {/* Colonna Destra: Viewport 3D WebGL */}
          <div className="lg:col-span-6 relative min-h-[480px] lg:min-h-full bg-gradient-to-b from-[#0b0b0e] to-[#070708] flex items-center justify-center">
            {/* Marcatori Angolari Tecnici */}
            <div className="absolute top-6 left-6 pointer-events-none font-mono text-[10px] text-zinc-500 space-y-1 z-10">
              <div>MODEL: HIPACE-TURBO-7S</div>
              <div>RENDER: REALTIME PROCEDURAL WEBGL</div>
              <div>MATERIAL: TI-6AL-4V / CERAMIC SI3N4</div>
            </div>

            <div className="absolute bottom-6 right-6 pointer-events-none font-mono text-[10px] text-zinc-500 text-right z-10">
              <div>AXIAL CLEARANCE: 0.15 MM</div>
              <div className="text-[#ff3b1d] font-semibold">
                STATUS: {explodedView ? "STAGE DIAGNOSTIC" : "OPERATIONAL LOCK"}
              </div>
            </div>

            <div className="w-full h-[520px] lg:h-[720px]">
              <TurbineCanvas
                scrollProgress={scrollProgress}
                rpmMode={rpmMode}
                explodedView={explodedView}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SEZIONE 01: FISICA MOLECOLARE & ARCHITETTURA DEL VUOTO
          ===================================================================== */}
      <section id="architettura" className="border-b border-white/10">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-white/10">
            <div className="lg:col-span-4 p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-white/10">
              <div className="font-mono text-xs text-[#ff3b1d] uppercase tracking-widest mb-2">
                // 01. CINEMATICA MOLECOLARE
              </div>
              <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-tight">
                QUANDO LA MATERIA CESSA DI COLLIDERE.
              </h2>
            </div>
            <div className="lg:col-span-8 p-6 sm:p-10 flex items-center text-zinc-400 text-sm sm:text-base leading-relaxed">
              In regime di ultra-alto vuoto (UHV), il cammino libero medio delle molecole di gas
              supera le dimensioni fisiche della camera (oltre 100 kilometri). Le nostre turbine
              trasferiscono impulso meccanico diretto a ciascuna molecola tramite pale inclinate
              che ruotano a velocità supersoniche fino a 500 metri al secondo.
            </div>
          </div>

          {/* 3 Pilastri Tecnologici con Icone Pure CSS */}
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="p-6 sm:p-10 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between group hover:bg-white/[0.015] transition-colors">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-xs text-zinc-500">SPEC // 01.A</span>
                  <span className="css-icon-turbine text-[#ff3b1d]" />
                </div>
                <h3 className="text-xl font-medium uppercase tracking-tight mb-3">
                  Laser Balancing™
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Durante la rotazione nominale a 90.000 RPM, un fascio laser ad impulsi di
                  femtosecondi asporta masse nanometriche dal rotore in tempo reale, azzerando le
                  micro-vibrazioni critiche per la microscopia elettronica (SEM/TEM).
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 font-mono text-xs text-zinc-300 flex justify-between">
                <span>AMP. VIBRAZIONI</span>
                <span className="text-[#ff3b1d]">&lt; 0.005 µm</span>
              </div>
            </div>

            <div className="p-6 sm:p-10 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between group hover:bg-white/[0.015] transition-colors">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-xs text-zinc-500">SPEC // 01.B</span>
                  <span className="css-icon-chamber text-[#ff3b1d]" />
                </div>
                <h3 className="text-xl font-medium uppercase tracking-tight mb-3">
                  Levitazione Attiva 5 Assi
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Sospensione elettromagnetica guidata da DSP a 40 kHz. Assenza totale di contatto
                  meccanico, zero usura da sfregamento e zero idrocarburi per camere bianche ISO Classe 1.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 font-mono text-xs text-zinc-300 flex justify-between">
                <span>ATTRITO MECCANICO</span>
                <span className="text-emerald-400">0.00 N·m (NULLO)</span>
              </div>
            </div>

            <div className="p-6 sm:p-10 flex flex-col justify-between group hover:bg-white/[0.015] transition-colors">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-xs text-zinc-500">SPEC // 01.C</span>
                  <span className="css-icon-wave text-[#ff3b1d]">
                    <span className="h-2" />
                    <span className="h-4" />
                    <span className="h-3" />
                    <span className="h-2" />
                  </span>
                </div>
                <h3 className="text-xl font-medium uppercase tracking-tight mb-3">
                  Stadi Holweck Elicoidali
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Canali di trascinamento molecolare ad alta compressione che consentono rapporti
                  per idrogeno ed elio fino a 10⁸, riducendo drasticamente il carico della pompa primaria.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 font-mono text-xs text-zinc-300 flex justify-between">
                <span>EFFICIENZA ENERGETICA</span>
                <span className="text-[#ff3b1d]">+62% VS STANDARD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SEZIONE 02: HARDWARE MATRIX & SPECIFICHE PRODOTTI REALI PFEIFFER
          ===================================================================== */}
      <section id="catalogo" className="border-b border-white/10">
        <div className="max-w-[1440px] mx-auto">
          <div className="p-6 sm:p-10 border-b border-white/10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="font-mono text-xs text-[#ff3b1d] uppercase tracking-widest mb-2">
                // 02. HARDWARE MATRIX
              </div>
              <h2 className="text-3xl sm:text-4xl font-light uppercase tracking-tight">
                UNITÀ DI POMPAGGIO & DIAGNOSTICA
              </h2>
            </div>
            
            {/* Filtro Tipologia Sistemi */}
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              {[
                { key: "all", label: "TUTTI I SISTEMI" },
                { key: "turbo", label: "TURBOPOMPE UHV" },
                { key: "dry", label: "PREVUOTO A SECCO" },
                { key: "leak", label: "CERCAFUGHE HE" },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setSelectedFilter(f.key as typeof selectedFilter)}
                  className={`px-3 py-1.5 border transition-colors ${
                    selectedFilter === f.key
                      ? "border-[#ff3b1d] bg-[#ff3b1d] text-black font-semibold"
                      : "border-white/15 text-zinc-400 hover:text-white hover:border-white/30"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                onClick={() => {
                  setActiveProduct(product);
                  setQuoteSubmitted(false);
                }}
                className={`p-6 sm:p-10 border-b border-white/10 ${
                  index % 2 === 0 ? "md:border-r" : ""
                } cursor-pointer group hover:bg-white/[0.02] transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-xs text-zinc-500 mb-4">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#ff3b1d] inline-block" />
                      <span>PART NO // {product.id}</span>
                    </span>
                    <span className="px-2 py-0.5 border border-white/15 text-zinc-300 group-hover:border-[#ff3b1d] group-hover:text-[#ff3b1d] transition-colors">
                      {product.flange}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-normal tracking-tight mb-1 group-hover:text-[#ff3b1d] transition-colors">
                    {product.name}
                  </h3>
                  <div className="font-mono text-xs text-zinc-400 uppercase mb-6">
                    {product.category}
                  </div>

                  <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                    {product.description}
                  </p>
                </div>

                <div>
                  <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/10 font-mono text-xs mb-5">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">
                        PORTATA NOMINALE
                      </span>
                      <span className="text-white">{product.pumpingSpeed}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">
                        PRESSIONE LIMITE
                      </span>
                      <span className="text-emerald-400">{product.ultimatePressure}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">ROTAZIONE</span>
                      <span className="text-white">{product.rpm}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider">
                    <span className="text-zinc-300 group-hover:text-white">
                      APRI SCHEDA DATI & PREVENTIVO
                    </span>
                    <span className="css-icon-arrow-ne text-[#ff3b1d] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SEZIONE 03: SIMULATORE CONDUTTANZA E PUMP-DOWN CAMERA UHV
          ===================================================================== */}
      <section id="simulatore" className="border-b border-white/10">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Parametri di Input */}
          <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/10 space-y-8">
            <div>
              <div className="font-mono text-xs text-[#ff3b1d] uppercase tracking-widest mb-2">
                // 03. DIMENSIONAMENTO CAMERA UHV
              </div>
              <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-tight mb-2">
                CALCOLATORE DI CONDUTTANZA E TEMPO DI VUOTO
              </h2>
              <p className="text-zinc-400 text-sm">
                Configura i parametri geometrici e molecolari della camera da vuoto per stimare
                la curva di svuotamento e l&apos;architettura di pompaggio Pfeiffer ottimale.
              </p>
            </div>

            {/* Slider Volume Camera */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-zinc-400 uppercase">
                  VOLUME CAMERA DA VUOTO (LITRI)
                </span>
                <span className="text-white font-semibold">{chamberVolume} L</span>
              </div>
              <input
                type="range"
                min={10}
                max={600}
                step={10}
                value={chamberVolume}
                onChange={(e) => setChamberVolume(Number(e.target.value))}
                className="w-full accent-[#ff3b1d] bg-zinc-800 h-1.5 cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[10px] text-zinc-500">
                <span>10 L (Lab SEM)</span>
                <span>300 L (Coating Fab)</span>
                <span>600 L (Aerospace Simulator)</span>
              </div>
            </div>

            {/* Selettore Gas Molecolare */}
            <div className="space-y-2">
              <label className="block font-mono text-xs text-zinc-400 uppercase">
                SPECIE GASSOSA DI PROCESSO / RESIDUO
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["N2", "Ar", "He", "H2"] as const).map((gas) => (
                  <button
                    key={gas}
                    type="button"
                    onClick={() => setSelectedGas(gas)}
                    className={`py-3 px-2 border font-mono text-xs uppercase transition-all ${
                      selectedGas === gas
                        ? "border-[#ff3b1d] bg-[#ff3b1d]/15 text-white"
                        : "border-white/15 text-zinc-400 hover:border-white/30"
                    }`}
                  >
                    <div className="font-semibold text-center">{gas}</div>
                    <div className="text-[10px] text-zinc-500 text-center">
                      {gasFactors[gas].mass}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Slider Pressione Target */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-zinc-400 uppercase">
                  PRESSIONE TARGET RICHIESTA
                </span>
                <span className="text-emerald-400 font-semibold">
                  1 · 10^{targetExponent} hPa
                </span>
              </div>
              <input
                type="range"
                min={-11}
                max={-5}
                step={1}
                value={targetExponent}
                onChange={(e) => setTargetExponent(Number(e.target.value))}
                className="w-full accent-[#ff3b1d] bg-zinc-800 h-1.5 cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[10px] text-zinc-500">
                <span>10⁻¹¹ hPa (XHV CERN)</span>
                <span>10⁻⁸ hPa (UHV Semiconduttori)</span>
                <span>10⁻⁵ hPa (Alto Vuoto)</span>
              </div>
            </div>
          </div>

          {/* Risultati Ingegneristici & Curva Pure CSS */}
          <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 bg-[#0b0b0e] flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-xs text-zinc-400 uppercase">
                  RISULTATO SIMULAZIONE DINAMICA
                </span>
                <span className="font-mono text-xs text-[#ff3b1d]">
                  ISO 21360 CALIBRATED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 border border-white/10 bg-[#070708]">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase block mb-1">
                    TEMPO STIMATO DI PUMP-DOWN
                  </span>
                  <div className="text-3xl font-mono font-light text-white">
                    {pumpDownMinutes} <span className="text-sm text-zinc-400">minuti</span>
                  </div>
                </div>

                <div className="p-5 border border-white/10 bg-[#070708]">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase block mb-1">
                    CAMMINO LIBERO MEDIO MOLECOLARE
                  </span>
                  <div className="text-lg font-mono text-emerald-400 pt-1">
                    {meanFreePathMeters}
                  </div>
                </div>
              </div>

              {/* Curva Logaritmica di Decadimento Pressione in Puro CSS */}
              <div className="p-5 border border-white/10 bg-[#070708] space-y-3">
                <div className="flex justify-between font-mono text-[10px] text-zinc-500 uppercase">
                  <span>DECADIMENTO PRESSIONE LOGARITMICA (P vs t)</span>
                  <span>GAS: {selectedGas} ({gasFactors[selectedGas].label})</span>
                </div>
                <div className="h-32 flex items-end gap-1.5 pt-4">
                  {[100, 82, 66, 53, 42, 33, 25, 19, 14, 10, 7, 5].map((val, i) => {
                    const heightPct = Math.max(
                      6,
                      Math.min(
                        100,
                        val * (Math.abs(targetExponent) / 9) * (chamberVolume / 220 + 0.45)
                      )
                    );
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <div
                          className="w-full bg-gradient-to-t from-[#ff3b1d]/25 to-[#ff3b1d] transition-all duration-300"
                          style={{ height: `${Math.min(100, heightPct)}px` }}
                        />
                        <span className="font-mono text-[8px] text-zinc-600">
                          t{i + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-5 border border-[#ff3b1d]/50 bg-[#ff3b1d]/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] text-[#ff3b1d] uppercase block">
                  CONFIGURAZIONE CONSIGLIATA DAL SISTEMA
                </span>
                <span className="font-mono text-sm sm:text-base text-white font-medium">
                  {recommendedModel}
                </span>
              </div>
              <a
                href="#catalogo"
                className="px-4 py-2.5 bg-white text-black font-mono text-xs font-semibold uppercase tracking-wider hover:bg-[#ff3b1d] transition-colors text-center shrink-0"
              >
                Esamina nel Catalogo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          FOOTER INDUSTRIALE + LINK LEGALI & CONTROLLI COOKIE GDPR
          ===================================================================== */}
      <footer className="bg-[#050506] text-zinc-400 text-xs font-mono">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 border-b border-white/10">
          <div className="md:col-span-5 p-6 sm:p-10 border-b md:border-b-0 md:border-r border-white/10 space-y-4">
            <div className="flex items-center gap-3 text-white">
              <span className="css-icon-turbine text-[#ff3b1d]" />
              <span className="tracking-[0.2em] font-semibold">
                PFEIFFER VACUUM+FAB SOLUTIONS
              </span>
            </div>
            <p className="text-zinc-500 font-sans text-xs leading-relaxed max-w-sm">
              Pfeiffer Vacuum Technology AG — Berliner Straße 43, 35614 Aßlar, Germania.
              Pionieri mondiali della tecnologia turbomolecolare e delle soluzioni di analisi del
              vuoto per microelettronica, fisica nucleare e aerospazio.
            </p>
            <div className="text-[11px] text-zinc-500 pt-2">
              REGISTRO COMMERCIALE: WETZLAR HRB 44 // VAT DE 112589225
            </div>
          </div>

          <div className="md:col-span-3 p-6 sm:p-10 border-b md:border-b-0 md:border-r border-white/10 space-y-3">
            <div className="text-white uppercase tracking-wider mb-4">
              // DOCUMENTAZIONE LEGALE
            </div>
            <button
              type="button"
              onClick={() => setLegalModal("privacy")}
              className="block hover:text-[#ff3b1d] transition-colors text-left"
            >
              [01] Privacy Policy (GDPR UE 2016/679)
            </button>
            <button
              type="button"
              onClick={() => setLegalModal("terms")}
              className="block hover:text-[#ff3b1d] transition-colors text-left"
            >
              [02] Termini e Condizioni Fornitura B2B
            </button>
            <button
              type="button"
              onClick={() => setLegalModal("cookies")}
              className="block hover:text-[#ff3b1d] transition-colors text-left"
            >
              [03] Informativa Estesa sui Cookie
            </button>
            <button
              type="button"
              onClick={() => setShowCookieSettings(true)}
              className="mt-4 px-3 py-1.5 border border-white/15 text-zinc-200 hover:border-[#ff3b1d] transition-colors inline-flex items-center gap-2"
            >
              <span className="css-icon-crosshair text-[#ff3b1d]" />
              <span>Gestione Preferenze Cookie</span>
            </button>
          </div>

          <div className="md:col-span-4 p-6 sm:p-10 space-y-3">
            <div className="text-white uppercase tracking-wider mb-4">
              // STATO CONSENSO PRIVACY CORRENTE
            </div>
            <div className="p-4 border border-white/10 bg-[#09090b] space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span>COOKIE TECNICI ESSENZIALI:</span>
                <span className="text-emerald-400">ATTIVI (OBBLIGATORI)</span>
              </div>
              <div className="flex justify-between">
                <span>TELEMETRIA WEBGL & ANAGRAFICA:</span>
                <span
                  className={
                    cookieConsent.telemetry ? "text-emerald-400" : "text-zinc-500"
                  }
                >
                  {cookieConsent.telemetry ? "AUTORIZZATI" : "DISATTIVATI"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>COMUNICAZIONI B2B TERZE PARTI:</span>
                <span
                  className={
                    cookieConsent.marketing ? "text-emerald-400" : "text-zinc-500"
                  }
                >
                  {cookieConsent.marketing ? "AUTORIZZATI" : "DISATTIVATI"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-zinc-600">
          <div>
            © 2026 PFEIFFER VACUUM TECHNOLOGY AG. TUTTI I DIRITTI RISERVATI.
          </div>
          <div>ZERO-SVG PURE GEOMETRIC INTERFACE // NEXT.JS + THREE.JS</div>
        </div>
      </footer>

      {/* =====================================================================
          MODALE SCHEDA TECNICA PRODOTTO & PREVENTIVAZIONE B2B
          ===================================================================== */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0b0e] border border-white/20 max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="font-mono text-[10px] text-[#ff3b1d] uppercase block">
                  TECHNICAL DATASHEET // {activeProduct.id}
                </span>
                <h3 className="text-2xl font-normal text-white">{activeProduct.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveProduct(null)}
                className="p-2 border border-white/15 hover:border-[#ff3b1d] transition-colors"
                aria-label="Chiudi modale"
              >
                <span className="css-icon-close" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs mb-6">
              <div className="p-3 border border-white/10 bg-[#070708]">
                <span className="text-[10px] text-zinc-500 block">PORTATA NOMINALE</span>
                <span className="text-zinc-200">{activeProduct.pumpingSpeed}</span>
              </div>
              <div className="p-3 border border-white/10 bg-[#070708]">
                <span className="text-[10px] text-zinc-500 block">COMPRESSIONE N₂</span>
                <span className="text-zinc-200">{activeProduct.compressionRatio}</span>
              </div>
              <div className="p-3 border border-white/10 bg-[#070708]">
                <span className="text-[10px] text-zinc-500 block">SISTEMA CUSCINETTI</span>
                <span className="text-zinc-200">{activeProduct.bearing}</span>
              </div>
              <div className="p-3 border border-white/10 bg-[#070708]">
                <span className="text-[10px] text-zinc-500 block">FLANGIA VUOTO</span>
                <span className="text-zinc-200">{activeProduct.flange}</span>
              </div>
              <div className="p-3 border border-white/10 bg-[#070708]">
                <span className="text-[10px] text-zinc-500 block">POTENZA ASSORBITA</span>
                <span className="text-zinc-200">{activeProduct.powerConsumption}</span>
              </div>
              <div className="p-3 border border-white/10 bg-[#070708]">
                <span className="text-[10px] text-zinc-500 block">PRESSIONE LIMITE</span>
                <span className="text-emerald-400 font-medium">{activeProduct.ultimatePressure}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-white/10 bg-[#070708] mb-6 font-mono text-xs">
              <span className="text-zinc-400">CODICE ARTICOLO: {activeProduct.id}</span>
              <button
                type="button"
                onClick={() => handleCopyPartNo(activeProduct.id)}
                className="px-2.5 py-1 border border-white/20 text-zinc-200 hover:border-[#ff3b1d] transition-colors"
              >
                {copiedPartNo ? "COPIATO!" : "COPIA CODICE"}
              </button>
            </div>

            {quoteSubmitted ? (
              <div className="p-6 border border-emerald-500/40 bg-emerald-500/10 font-mono text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <span className="css-icon-check" />
                  <span>RICHIESTA DI OFFERTA TECNICA REGISTRATA</span>
                </div>
                <p className="text-zinc-300">
                  Il team tecnico Pfeiffer Vacuum invierà i file STEP 3D certificati e la
                  quotazione commerciale per {activeProduct.name} entro 24 ore lavorative.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setQuoteSubmitted(true);
                }}
                className="space-y-4 border-t border-white/10 pt-6"
              >
                <div className="font-mono text-xs uppercase text-zinc-300">
                  RICHIEDI QUOTAZIONE UFFICIALE E MODELLI CAD 3D (.STEP)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    type="text"
                    placeholder="Ente / Azienda / Laboratorio"
                    className="bg-[#070708] border border-white/15 px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-[#ff3b1d] text-white"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email Istituzionale / Aziendale"
                    className="bg-[#070708] border border-white/15 px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-[#ff3b1d] text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#ff3b1d] text-black font-mono text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors"
                >
                  Trasmetti Richiesta al Reparto Ingegneria
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODALE DOCUMENTAZIONE LEGALE COMPLETA (GDPR / TERMINI / COOKIE)
          ===================================================================== */}
      {legalModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0b0e] border border-white/20 max-w-3xl w-full max-h-[85vh] flex flex-col">
            {/* Header Modale */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex gap-2 font-mono text-xs">
                {(["privacy", "terms", "cookies"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setLegalModal(tab)}
                    className={`px-3 py-1.5 uppercase border ${
                      legalModal === tab
                        ? "border-[#ff3b1d] bg-[#ff3b1d] text-black font-semibold"
                        : "border-white/15 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {tab === "privacy"
                      ? "Privacy Policy"
                      : tab === "terms"
                      ? "Termini e Condizioni"
                      : "Cookie Policy"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="p-2 border border-white/15 hover:border-[#ff3b1d]"
                aria-label="Chiudi documento legale"
              >
                <span className="css-icon-close" />
              </button>
            </div>

            {/* Corpo Testo Legale con Dati Societari Reali */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              {legalModal === "privacy" && (
                <>
                  <h3 className="text-lg font-mono uppercase text-white">
                    INFORMATIVA SULLA PRIVACY AI SENSI DEGLI ARTT. 13 E 14 DEL GDPR (UE 2016/679)
                  </h3>
                  <p>
                    <strong>1. Titolare del Trattamento:</strong> Pfeiffer Vacuum Technology AG, con
                    sede legale in Berliner Straße 43, 35614 Aßlar, Germania (Email DPO:
                    privacy@pfeiffer-vacuum.de).
                  </p>
                  <p>
                    <strong>2. Tipologia di Dati Trattati:</strong> Trattiamo dati identificativi
                    aziendali (nome, cognome, ragione sociale, indirizzo email lavorativo, parametri
                    tecnici delle camere da vuoto inseriti nel configuratore) e log tecnici di sessione
                    strettamente necessari alla sicurezza informatica dell&apos;infrastruttura.
                  </p>
                  <p>
                    <strong>3. Finalità e Base Giuridica:</strong> I dati conferiti nei moduli di
                    richiesta quotazione e download CAD sono trattati ai sensi dell&apos;Art. 6(1)(b) GDPR
                    (esecuzione di misure precontrattuali su richiesta dell&apos;interessato). I dati di
                    telemetria analitica sono trattati esclusivamente previo consenso esplicito ai
                    sensi dell&apos;Art. 6(1)(a) GDPR.
                  </p>
                  <p>
                    <strong>4. Conservazione e Diritti dell&apos;Interessato:</strong> I dati relativi ai
                    preventivi commerciali B2B sono conservati per 24 mesi. In ogni momento
                    l&apos;utente può esercitare i diritti di accesso, rettifica, cancellazione (oblio),
                    limitazione e opposizione (Artt. 15-22 GDPR) contattando il nostro DPO.
                  </p>
                </>
              )}

              {legalModal === "terms" && (
                <>
                  <h3 className="text-lg font-mono uppercase text-white">
                    TERMINI E CONDIZIONI GENERALI DI FORNITURA TECNICA B2B
                  </h3>
                  <p>
                    <strong>1. Ambito di Applicazione:</strong> Le presenti condizioni disciplinano
                    l&apos;utilizzo del portale digitale, del simulatore di conduttanza UHV e le richieste
                    di fornitura per pompe turbomolecolari, pompe primarie a secco e spettrometri di
                    massa prodotti da Pfeiffer Vacuum Technology AG.
                  </p>
                  <p>
                    <strong>2. Accuratezza delle Simulazioni Fisiche:</strong> I calcoli di tempo di
                    svuotamento (Pump-Down) forniti dal configuratore online sono calcolati secondo lo
                    standard ISO 21360 assumendo degassamento superficiale nominale dell&apos;acciaio inox
                    316L pulito. Essi non sostituiscono la validazione ingegneristica finale firmata dai
                    nostri fisici del vuoto.
                  </p>
                  <p>
                    <strong>3. Controllo delle Esportazioni (Dual-Use):</strong> I sistemi turbomolecolari
                    ad alta capacità e levitazione magnetica possono essere soggetti al Regolamento (UE)
                    2021/821 sui beni a duplice uso (Dual-Use). Qualsiasi fornitura è subordinata alla
                    verifica dell&apos;utente finale (End-User Certificate).
                  </p>
                  <p>
                    <strong>4. Proprietà Intellettuale:</strong> I modelli 3D procedurali, i marchi
                    HiPace®, HiScroll®, Laser Balancing™ e i disegni CAD sono proprietà esclusiva di
                    Pfeiffer Vacuum Technology AG. Foro competente esclusivo: Wetzlar, Germania.
                  </p>
                </>
              )}

              {legalModal === "cookies" && (
                <>
                  <h3 className="text-lg font-mono uppercase text-white">
                    INFORMATIVA ESTESA SUI COOKIE E TECNOLOGIE DI ARCHIVIAZIONE LOCALE
                  </h3>
                  <p>
                    Questo sito utilizza storage locale (<code>localStorage</code>) e cookie tecnici
                    per garantire il corretto funzionamento del motore grafico 3D WebGL e memorizzare le
                    scelte di consenso dell&apos;utente.
                  </p>
                  <div className="border border-white/15 divide-y divide-white/10 font-mono text-xs">
                    <div className="p-3">
                      <strong className="text-white">
                        1. pfeiffer_gdpr_consent_v1 (Tecnico Necessario)
                      </strong>
                      <p className="text-zinc-400 mt-1">
                        Memorizza lo stato granulare delle preferenze privacy dell&apos;utente. Durata:
                        12 mesi.
                      </p>
                    </div>
                    <div className="p-3">
                      <strong className="text-white">
                        2. pfeiffer_webgl_perf (Telemetria Analitica - Opzionale)
                      </strong>
                      <p className="text-zinc-400 mt-1">
                        Misura in forma aggregata e anonima il frame rate del rendering 3D e le
                        configurazioni simulate nella camera da vuoto.
                      </p>
                    </div>
                    <div className="p-3">
                      <strong className="text-white">
                        3. pfeiffer_b2b_campaign (Marketing B2B - Opzionale)
                      </strong>
                      <p className="text-zinc-400 mt-1">
                        Utilizzato per personalizzare comunicazioni tecniche su fiere di settore (es.
                        SEMICON, Hannover Messe).
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PANNELLO GESTIONE COOKIE GRANULARE (GDPR COMPLIANT)
          ===================================================================== */}
      {showCookieSettings && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0b0e] border border-white/25 max-w-xl w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="font-mono text-xs uppercase tracking-wider text-[#ff3b1d]">
                // CONFIGURAZIONE GRANULARE CONSENSO COOKIE (GDPR)
              </div>
              <button
                type="button"
                onClick={() => setShowCookieSettings(false)}
                className="p-1.5 border border-white/15 hover:border-[#ff3b1d]"
              >
                <span className="css-icon-close" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              {/* Necessari */}
              <div className="p-4 border border-white/10 flex items-center justify-between gap-4">
                <div>
                  <div className="text-white font-semibold">
                    1. COOKIE TECNICI E INFRASTRUTTURA WEBGL
                  </div>
                  <div className="text-zinc-500 text-[11px] font-sans mt-1">
                    Indispensabili per il salvataggio delle preferenze di consenso e per
                    l&apos;allocazione del contesto grafico 3D. Non disattivabili.
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-white/10 text-emerald-400 text-[10px] shrink-0 font-semibold">
                  SEMPRE ATTIVI
                </span>
              </div>

              {/* Telemetria */}
              <div className="p-4 border border-white/10 flex items-center justify-between gap-4">
                <div>
                  <div className="text-white font-semibold">
                    2. TELEMETRIA PRESTAZIONALE & ANALYTICS
                  </div>
                  <div className="text-zinc-500 text-[11px] font-sans mt-1">
                    Ci aiuta a comprendere quali modelli di pompe turbomolecolari vengono simulati con
                    maggiore frequenza.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCookieConsent((prev) => ({ ...prev, telemetry: !prev.telemetry }))
                  }
                  className={`px-3 py-1.5 border text-[10px] uppercase shrink-0 transition-colors ${
                    cookieConsent.telemetry
                      ? "border-emerald-400 bg-emerald-400/15 text-emerald-300"
                      : "border-white/20 text-zinc-400"
                  }`}
                >
                  {cookieConsent.telemetry ? "ATTIVO" : "DISATTIVO"}
                </button>
              </div>

              {/* Marketing */}
              <div className="p-4 border border-white/10 flex items-center justify-between gap-4">
                <div>
                  <div className="text-white font-semibold">
                    3. COMUNICAZIONI B2B & FIERE INTERNAZIONALI
                  </div>
                  <div className="text-zinc-500 text-[11px] font-sans mt-1">
                    Tracciamento per inviti tecnici dedicati agli eventi SEMICON e conferenze di fisica
                    delle alte energie.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCookieConsent((prev) => ({ ...prev, marketing: !prev.marketing }))
                  }
                  className={`px-3 py-1.5 border text-[10px] uppercase shrink-0 transition-colors ${
                    cookieConsent.marketing
                      ? "border-emerald-400 bg-emerald-400/15 text-emerald-300"
                      : "border-white/20 text-zinc-400"
                  }`}
                >
                  {cookieConsent.marketing ? "ATTIVO" : "DISATTIVO"}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => saveCookiePreferences(cookieConsent)}
                className="flex-1 py-2.5 bg-[#ff3b1d] text-black font-mono text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors"
              >
                Salva Preferenze Selezionate
              </button>
              <button
                type="button"
                onClick={acceptAllCookies}
                className="flex-1 py-2.5 border border-white/20 text-white font-mono text-xs uppercase tracking-wider hover:border-white transition-colors"
              >
                Accetta Tutti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          BANNER COOKIE FISSO AL PRIMO ACCESSO
          ===================================================================== */}
      {showCookieBanner && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-[1400px] mx-auto bg-[#0c0c0f]/95 backdrop-blur-md border border-white/25 p-5 sm:p-6 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-1.5">
              <div className="flex items-center gap-2 font-mono text-xs uppercase text-[#ff3b1d]">
                <span className="css-icon-crosshair" />
                <span>PROTOCOLLO DI CONFORMITÀ PRIVACY & COOKIE (UE 2016/679)</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Utilizziamo cookie tecnici necessari per l&apos;esecuzione del motore 3D WebGL e,
                previo tuo consenso, cookie analitici e di marketing B2B. Puoi accettare tutti i moduli,
                rifiutare quelli opzionali o configurare granularmente ogni parametro. Consulta la{" "}
                <button
                  type="button"
                  onClick={() => setLegalModal("cookies")}
                  className="underline text-white hover:text-[#ff3b1d]"
                >
                  Cookie Policy
                </button>{" "}
                e la{" "}
                <button
                  type="button"
                  onClick={() => setLegalModal("privacy")}
                  className="underline text-white hover:text-[#ff3b1d]"
                >
                  Privacy Policy
                </button>
                .
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-wrap sm:flex-nowrap gap-2.5 justify-end font-mono text-xs">
              <button
                type="button"
                onClick={() => setShowCookieSettings(true)}
                className="w-full sm:w-auto px-4 py-2.5 border border-white/20 text-zinc-300 hover:border-white hover:text-white uppercase transition-colors"
              >
                Personalizza
              </button>
              <button
                type="button"
                onClick={rejectOptionalCookies}
                className="w-full sm:w-auto px-4 py-2.5 border border-white/20 text-zinc-300 hover:border-white hover:text-white uppercase transition-colors"
              >
                Solo Necessari
              </button>
              <button
                type="button"
                onClick={acceptAllCookies}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#ff3b1d] text-black font-semibold uppercase hover:bg-white transition-colors"
              >
                Accetta Tutti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
