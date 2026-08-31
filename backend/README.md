# C-ASA Backend Service (Django REST Framework)

This directory houses the Django simulation core, OpenFlow state engine, and the private model reasoning endpoints.

## 🚀 Endpoints & API Reference

### Simulation Engine
- `GET  /api/simulation/state/` - Current simulation snapshot (topology, metrics, active route, phase)
- `POST /api/simulation/start-traffic/` - Starts baseline SDN OpenFlow telemetry
- `POST /api/simulation/anomaly/` - Injects targeted congestion/DDoS surge
- `POST /api/simulation/node-failure/` - Simulates hardware failure on primary router R2
- `POST /api/simulation/reroute/` - Executes dynamic flow reroute onto bypass router R4
- `POST /api/simulation/reset/` - Resets network state to normal baseline

### Private Cognitive Model Cluster (`private_model-core-v3`)
- `POST /api/simulation/private-model/generate/` - Raw inference and Prompt-to-Node compiler
- `POST /api/simulation/private-model/analyze/` - Autonomous Cognitive Incident Brief generator
- `POST /api/simulation/private-model/chat/` - Interactive Copilot assistant reasoning
- `GET  /api/simulation/private-model/status/` - Cluster health & active model metadata

## ⚙️ Configuration
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Populate `PRIVATE_MODEL_KEY=...` with your key.
