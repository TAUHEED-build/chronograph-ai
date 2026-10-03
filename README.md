# 🛡️ ChronoGraph AI — Temporal Graph Memory Engine

> Autonomous Agent State Management & Context Drift Mitigation Engine built with Graph-Temporal Architecture.

![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-18-cyan)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.0-purple)
![Gemini API](https://img.shields.io/badge/Gemini-3.8-orange)

## ⚡ The Problem

Modern LLM agents suffer from **Context Drift** and **State Decay** during long-horizon tasks. Standard Vector Databases store flat embeddings without temporal relationships, leading to high failure rates and goal divergence.

## 🚀 The Solution

**ChronoGraph AI** parses unstructured agent execution logs into a **Temporal Knowledge Graph**. It maps dynamic entity relationships over discrete time windows ($T_1 \to T_n$), allowing real-time context validity tracking and automated drift detection.

### ✨ Key Features

- **🕸️ Graph-Temporal Extraction:** Converts messy text logs into dynamic Nodes, Edges, and Time Windows using Structured Gemini API calls.
- **📊 Real-time Drift Metrics:** Instant computation of Context Drift Score ($0.0 \to 1.0$) and Memory Decay percentages.
- **⏳ Interactive Time-Travel:** Step through agent memory timelines ($T_1$ to $T_{10}$) to observe memory evolution and stale context decay.
- **⚡ Zero-Config Fallback:** Integrated local parser engine for instant offline testing.

---

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, Lucide Icons
- **Engine:** Google Gemini API (Structured Output Mode)
- **Deployment:** Vercel

---

## 💻 Quick Start (Local Setup)

```bash
# Clone the repository
git clone [https://github.com/YOUR_GITHUB_USERNAME/chronograph-ai.git](https://github.com/YOUR_GITHUB_USERNAME/chronograph-ai.git)

# Navigate to project
cd chronograph-ai

# Install dependencies
npm install

# Start development server
npm run dev
