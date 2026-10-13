"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Sliders,
  Compass,
  Fingerprint,
  ArrowRight,
  ArrowUpRight,
  Star,
  Film,
  Zap,
} from "lucide-react";
import { sound } from "../lib/sound";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    id: "dna",
    number: "01",
    title: "Vector Taste DNA",
    icon: Fingerprint,
    tag: "NEURAL MODELING",
    summary:
      "Every film is mapped across 64 multi-dimensional vectors—measuring atmosphere, visual texture, emotional complexity, and thematic depth.",
  },
  {
    id: "mood",
    number: "02",
    title: "Instant Mood Synesthesia",
    icon: Zap,
    tag: "DYNAMIC ROTATION",
    summary:
      "Tired of generic categories? Select your current psychological state. Our recommendation matrix instantly shifts weights to match your exact vibe.",
  },
  {
    id: "curation",
    number: "03",
    title: "Zero Algorithmic Traps",
    icon: Compass,
    tag: "HUMAN-FIRST CURATION",
    summary:
      "No corporate studio sponsorships. No infinite social media doom loops. Only cinema crafted for genuine emotional resonance and authentic discovery.",
  },
];

const PREVIEW_MOODS = [
  { label: "⚡ Adrenaline", match: "Mad Max: Fury Road (99.2%) · Dune: Part Two (98.6%)" },
  { label: "◈ Mind-bending", match: "Inception (99.8%) · Arrival (99.1%) · Primer (96.5%)" },
  { label: "♡ Heartfelt", match: "Past Lives (99.4%) · Before Sunrise (98.9%) · Her (97.3%)" },
  { label: "☀ Comfort", match: "Spirited Away (99.7%) · Amélie (98.4%) · Paddington 2 (98.1%)" },
];

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [atmosphereVal, setAtmosphereVal] = useState(70);
  const [pacingVal, setPacingVal] = useState(45);
  const [selectedMoodIdx, setSelectedMoodIdx] = useState(1);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="how-modal-overlay" onClick={onClose}>
        <motion.div
          className="how-modal-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.92, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
        >
          {/* Header */}
          <div className="how-modal-header">
            <div className="how-modal-eyebrow">
              <Sparkles size={14} className="text-lime" />
              <span>INTERACTIVE TASTE ENGINE PREVIEW</span>
            </div>
            <button
              type="button"
              className="how-modal-close"
              onClick={() => {
                sound.playClick(400);
                onClose();
              }}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stepper Tabs */}
          <div className="how-modal-tabs">
            {STEPS.map((step, idx) => {
              const active = activeStep === idx;
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  type="button"
                  className={`how-tab-btn ${active ? "active" : ""}`}
                  onClick={() => {
                    sound.playClick(500 + idx * 60);
                    setActiveStep(idx);
                  }}
                >
                  <span className="how-tab-num">{step.number}</span>
                  <Icon size={15} />
                  <span>{step.title}</span>
                </button>
              );
            })}
          </div>

          {/* Step Content */}
          <div className="how-modal-body">
            <div className="how-step-info">
              <span className="how-step-tag">{STEPS[activeStep].tag}</span>
              <h3>{STEPS[activeStep].title}</h3>
              <p>{STEPS[activeStep].summary}</p>
            </div>

            {/* Interactive Preview for Buttons (No sign-in or names needed) */}
            <div className="how-interactive-sandbox">
              <div className="sandbox-header">
                <Sliders size={14} />
                <span>INTERACTIVE SIMULATION PREVIEW:</span>
              </div>

              {activeStep === 0 && (
                <div className="sandbox-controls">
                  <div className="sandbox-slider-row">
                    <div className="slider-label">
                      <span>Atmosphere Depth</span>
                      <span className="slider-val">{atmosphereVal}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={atmosphereVal}
                      onChange={(e) => {
                        setAtmosphereVal(Number(e.target.value));
                        sound.playClick(600, 0.015);
                      }}
                      className="sandbox-range"
                    />
                    <div className="slider-hints">
                      <span>Grounded Realism</span>
                      <span>Cosmic / Surreal</span>
                    </div>
                  </div>

                  <div className="sandbox-slider-row">
                    <div className="slider-label">
                      <span>Pacing Index</span>
                      <span className="slider-val">{pacingVal}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={pacingVal}
                      onChange={(e) => {
                        setPacingVal(Number(e.target.value));
                        sound.playClick(620, 0.015);
                      }}
                      className="sandbox-range"
                    />
                    <div className="slider-hints">
                      <span>Contemplative Slow Burn</span>
                      <span>High Octane Kinetic</span>
                    </div>
                  </div>

                  <div className="sandbox-results-badge">
                    <span className="res-tag">SIMULATED MATCHES:</span>
                    <span className="res-films">
                      {atmosphereVal > 60
                        ? "Interstellar (99.4%) · 2001: A Space Odyssey (98.1%)"
                        : "No Country for Old Men (98.8%) · Taxi Driver (97.9%)"}
                    </span>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="sandbox-mood-controls">
                  <div className="sandbox-pills-row">
                    {PREVIEW_MOODS.map((m, i) => (
                      <button
                        key={m.label}
                        type="button"
                        className={`sandbox-mood-btn ${selectedMoodIdx === i ? "active" : ""}`}
                        onClick={() => {
                          setSelectedMoodIdx(i);
                          sound.playClick(650, 0.03);
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <div className="sandbox-results-badge">
                    <span className="res-tag">INSTANT MOOD SYNC:</span>
                    <span className="res-films">{PREVIEW_MOODS[selectedMoodIdx].match}</span>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="sandbox-curation-preview">
                  <div className="sample-card-preview">
                    <div className="sample-poster-box">
                      <Film size={26} className="text-lime" />
                    </div>
                    <div className="sample-card-details">
                      <h4>Spirited Away (千と千尋の神隠し)</h4>
                      <div className="sample-card-meta">
                        <span className="meta-star"><Star size={11} fill="currentColor" /> 8.6</span>
                        <span>Animation · Fantasy</span>
                        <span>2001</span>
                      </div>
                      <p className="sample-card-reason">
                        ✦ 99.7% Match Reason: Matches your affinity for hand-drawn atmospheric surrealism and emotional coming-of-age narratives.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="how-modal-footer">
            <button
              type="button"
              className="how-footer-dismiss"
              onClick={() => {
                sound.playClick(450);
                onClose();
              }}
            >
              Close Preview
            </button>
            <Link
              href="/discover?tab=Taste+lab"
              className="how-footer-cta"
              onClick={() => {
                sound.playChime();
                onClose();
              }}
            >
              <span>Launch Live Taste Lab in App</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
