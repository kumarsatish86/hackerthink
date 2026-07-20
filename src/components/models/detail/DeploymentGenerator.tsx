'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/models/ui/primitives';
import { CodeBlock } from '@/components/models/ui/CodeBlock';
import type { ModelCore } from '@/types/models';

type Target =
  | 'docker'
  | 'compose'
  | 'fastapi'
  | 'flask'
  | 'node'
  | 'express'
  | 'spring'
  | 'k8s'
  | 'helm'
  | 'terraform'
  | 'aws'
  | 'azure'
  | 'gcp'
  | 'cloudrun'
  | 'fly'
  | 'railway'
  | 'render';

const TARGETS: { id: Target; label: string; language: string }[] = [
  { id: 'docker', label: 'Docker', language: 'dockerfile' },
  { id: 'compose', label: 'Docker Compose', language: 'yaml' },
  { id: 'fastapi', label: 'FastAPI', language: 'python' },
  { id: 'flask', label: 'Flask', language: 'python' },
  { id: 'node', label: 'Node', language: 'javascript' },
  { id: 'express', label: 'Express', language: 'javascript' },
  { id: 'spring', label: 'Spring Boot', language: 'java' },
  { id: 'k8s', label: 'Kubernetes', language: 'yaml' },
  { id: 'helm', label: 'Helm', language: 'yaml' },
  { id: 'terraform', label: 'Terraform', language: 'hcl' },
  { id: 'aws', label: 'AWS', language: 'yaml' },
  { id: 'azure', label: 'Azure', language: 'yaml' },
  { id: 'gcp', label: 'GCP', language: 'yaml' },
  { id: 'cloudrun', label: 'Cloud Run', language: 'bash' },
  { id: 'fly', label: 'Fly.io', language: 'toml' },
  { id: 'railway', label: 'Railway', language: 'bash' },
  { id: 'render', label: 'Render', language: 'yaml' },
];

function build(model: ModelCore, target: Target): string {
  const id = model.external_model_id || model.slug;
  const svc = (model.slug || 'model').replace(/[^a-z0-9-]/gi, '-');
  switch (target) {
    case 'docker':
      return `FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir transformers torch fastapi uvicorn
ENV MODEL_ID=${id}
COPY app.py .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]`;
    case 'compose':
      return `services:
  ${svc}:
    build: .
    ports: ["8080:8080"]
    environment:
      MODEL_ID: ${id}
      API_KEY: \${API_KEY}`;
    case 'fastapi':
      return `from fastapi import FastAPI
from pydantic import BaseModel
# from transformers import pipeline
# pipe = pipeline(task="${model.task || 'text-generation'}", model="${id}")

app = FastAPI(title="${model.name}")

class In(BaseModel):
    input: str

@app.post("/infer")
def infer(body: In):
    return {"model": "${id}", "output": body.input}`;
    case 'flask':
      return `from flask import Flask, request, jsonify
app = Flask(__name__)

@app.post("/infer")
def infer():
    data = request.get_json(force=True)
    return jsonify({"model": "${id}", "output": data.get("input")})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)`;
    case 'node':
      return `import http from "node:http";
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ model: "${id}", ok: true }));
});
server.listen(8080);`;
    case 'express':
      return `import express from "express";
const app = express();
app.use(express.json());
app.post("/infer", (req, res) => {
  res.json({ model: "${id}", output: req.body?.input });
});
app.listen(8080);`;
    case 'spring':
      return `@RestController
@RequestMapping("/api")
public class InferController {
  @PostMapping("/infer")
  public Map<String, Object> infer(@RequestBody Map<String, String> body) {
    return Map.of("model", "${id}", "output", body.getOrDefault("input", ""));
  }
}`;
    case 'k8s':
      return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${svc}
spec:
  replicas: 1
  selector:
    matchLabels: { app: ${svc} }
  template:
    metadata:
      labels: { app: ${svc} }
    spec:
      containers:
        - name: model
          image: ghcr.io/hackerthink/model-runner:latest
          env:
            - name: MODEL_ID
              value: "${id}"
          ports:
            - containerPort: 8080`;
    case 'helm':
      return `nameOverride: ${svc}
image:
  repository: ghcr.io/hackerthink/model-runner
  tag: latest
env:
  MODEL_ID: ${id}
service:
  port: 8080`;
    case 'terraform':
      return `resource "google_cloud_run_v2_service" "${svc.replace(/-/g, '_')}" {
  name     = "${svc}"
  location = "us-central1"
  template {
    containers {
      image = "ghcr.io/hackerthink/model-runner:latest"
      env { name = "MODEL_ID" value = "${id}" }
    }
  }
}`;
    case 'aws':
      return `Resources:
  ModelService:
    Type: AWS::ECS::Service
    Properties:
      DesiredCount: 1
      # Wire task definition with MODEL_ID=${id}`;
    case 'azure':
      return `properties:
  template:
    containers:
      - name: ${svc}
        image: ghcr.io/hackerthink/model-runner:latest
        env:
          - name: MODEL_ID
            value: ${id}`;
    case 'gcp':
      return `runtime: python311
env_variables:
  MODEL_ID: ${id}
entrypoint: gunicorn -b :$PORT app:app`;
    case 'cloudrun':
      return `gcloud run deploy ${svc} \\
  --image=ghcr.io/hackerthink/model-runner:latest \\
  --set-env-vars=MODEL_ID=${id} \\
  --allow-unauthenticated \\
  --region=us-central1`;
    case 'fly':
      return `app = "${svc}"
[env]
  MODEL_ID = "${id}"
[[services]]
  internal_port = 8080
  protocol = "tcp"`;
    case 'railway':
      return `railway up
# Set MODEL_ID=${id} in Railway variables`;
    case 'render':
      return `services:
  - type: web
    name: ${svc}
    env: docker
    envVars:
      - key: MODEL_ID
        value: ${id}`;
    default:
      return `# ${target} snippet for ${id}`;
  }
}

export function DeploymentGenerator({ model }: { model: ModelCore }) {
  const [target, setTarget] = useState<Target>('fastapi');
  const active = TARGETS.find((t) => t.id === target) || TARGETS[0];
  const code = useMemo(() => build(model, target), [model, target]);

  return (
    <Card className="p-4">
      <p className="mb-3 text-sm text-[var(--m-text-muted)]">
        One-click deployment scaffolds parameterized for <strong>{model.name}</strong>.
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {TARGETS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTarget(t.id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium border ${
              target === t.id
                ? 'border-[var(--m-brand)] bg-[var(--m-brand-soft)] text-[var(--m-brand)]'
                : 'border-[var(--m-border)] text-[var(--m-text-muted)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <CodeBlock code={code} language={active.language} title={active.label} model={model} />
    </Card>
  );
}
