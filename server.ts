import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Health / Status endpoint
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'online',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    model: 'gemini-3.8-flash',
    engine: 'ChronoGraph Temporal Extraction Engine v2.4',
  });
});

// JSON extraction endpoint using Gemini 3.8 Flash
app.post('/api/extract', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text prompt or log is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(200).json({
        fallback: true,
        reason: 'API key not configured or placeholder detected; use local engine',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemPrompt = `You are ChronoGraph Engine, an expert Temporal Knowledge Graph Extraction System.
Your objective is to analyze messy unstructured text, chat logs, or agent execution histories and extract a structured temporal knowledge graph.

CRITICAL EXTRACTION RULES:
1. Extract Core Entities as Nodes: (e.g., User, System, Action, Feature, API Key, Timestamp, Goal, Deployment, Risk). Assign a category and unique ID (e.g., "node_user_1", "node_goal_saas", "node_action_pivot").
2. Extract Relationships as Edges: Define source, target, and relationship type (e.g., HAS_GOAL, EXECUTED_ACTION, FAILED_AT, PIVOTED_TO, VALID_UNTIL, SUPERSEDED_BY, DEPLOYED_TO).
3. Assign Temporal Metadata: Every edge MUST have a time_window object with 'created_at' and 'valid_until' (or 'forever' if non-decaying). Also specify node timestamps and step (from 1 to 10).
4. Identify Decay & Superseded states: If a goal was abandoned or an API key/deployment expired, mark node status as "superseded" or "decayed" with expiry details.
5. Compute Metrics:
   - context_drift_score: (0.00 to 1.00) based on how much the conversation strays from the primary initial goal.
   - memory_decay_percentage: (0 to 100) estimated percentage of stale/expired context over time.
   - drift_level: "LOW" (0-0.29), "MODERATE" (0.30-0.59), "HIGH" (0.60-0.79), or "CRITICAL" (0.80-1.00).
   - analysis_summary: a concise 2-sentence executive summary of the temporal shifts, goal pivots, and decaying constraints.
6. Provide simulated timeline steps (T1 to T10) indicating what event happened at each step and cumulative drift score.

Respond ONLY with valid JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Extract the temporal knowledge graph from this log:\n\n${text}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metrics: {
              type: Type.OBJECT,
              properties: {
                context_drift_score: { type: Type.NUMBER, description: 'Drift score from 0.00 to 1.00' },
                memory_decay_percentage: { type: Type.NUMBER, description: 'Decay percentage 0 to 100' },
                active_nodes_count: { type: Type.INTEGER },
                decayed_nodes_count: { type: Type.INTEGER },
                drift_level: { type: Type.STRING },
                analysis_summary: { type: Type.STRING },
              },
              required: ['context_drift_score', 'memory_decay_percentage', 'drift_level', 'analysis_summary'],
            },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  category: { type: Type.STRING },
                  step: { type: Type.INTEGER, description: 'Simulated time step from 1 to 10' },
                  timestamp: { type: Type.STRING },
                  validUntil: { type: Type.STRING },
                  status: { type: Type.STRING, description: 'active, decayed, or superseded' },
                  description: { type: Type.STRING },
                  driftImpact: { type: Type.NUMBER },
                },
                required: ['id', 'label', 'category', 'step', 'timestamp', 'validUntil', 'status'],
              },
            },
            edges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  source: { type: Type.STRING },
                  target: { type: Type.STRING },
                  relationship: { type: Type.STRING },
                  time_window: {
                    type: Type.OBJECT,
                    properties: {
                      created_at: { type: Type.STRING },
                      valid_until: { type: Type.STRING },
                    },
                    required: ['created_at', 'valid_until'],
                  },
                  stepCreated: { type: Type.INTEGER },
                  stepExpired: { type: Type.INTEGER },
                },
                required: ['id', 'source', 'target', 'relationship', 'time_window', 'stepCreated'],
              },
            },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER },
                  label: { type: Type.STRING },
                  timestamp: { type: Type.STRING },
                  event: { type: Type.STRING },
                  driftScore: { type: Type.NUMBER },
                },
                required: ['step', 'label', 'timestamp', 'event', 'driftScore'],
              },
            },
          },
          required: ['metrics', 'nodes', 'edges', 'timeline'],
        },
      },
    });

    const rawText = response.text?.trim() || '{}';
    const parsed = JSON.parse(rawText);
    return res.json({ fallback: false, data: parsed });
  } catch (error: any) {
    console.error('Gemini extraction error:', error?.message || error);
    // Graceful response directing client to fallback
    return res.status(200).json({
      fallback: true,
      error: error?.message || 'Extraction API encountered an issue',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`ChronoGraph Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
