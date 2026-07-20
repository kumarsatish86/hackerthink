// ModelDocsEnrichment.ts
// Template-driven documentation generator for the AI Models module.
// Produces AI summaries, FAQs, install guides, usage examples, architecture
// breakdowns, use-case cards, quick facts, compatibility data, API docs and
// security notes for a model row, then persists everything to the satellite
// tables + JSON columns on `ai_models`.

import { query, queryOne, transaction } from '@/lib/db';

type AnyRecord = Record<string, any>;

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v)).filter(Boolean);
    } catch {
      // not JSON - treat as a single value
    }
    return value ? [value] : [];
  }
  return [];
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

function humanize(value?: string | null): string {
  if (!value) return '';
  return String(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => (word.length ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

function pick(...values: Array<string | null | undefined>): string {
  for (const v of values) {
    if (v !== null && v !== undefined && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}

function articleFor(word: string): string {
  return /^[aeiou]/i.test(word) ? 'an' : 'a';
}

// ---------------------------------------------------------------------------
// Facts derived from the raw ai_models row - the single source of truth used
// by every generator below so that copy stays consistent across sections.
// ---------------------------------------------------------------------------

export interface ModelFacts {
  id: string;
  slug: string;
  name: string;
  developer: string;
  task: string;
  taskLabel: string;
  license: string;
  architecture: string;
  framework: string;
  parametersRaw: string;
  paramCountB: number | null;
  paramLabel: string;
  contextLength: number | null;
  contextLabel: string;
  description: string;
  huggingfaceUrl: string;
  githubUrl: string;
  demoUrl: string;
  apiEndpoint: string;
  externalModelId: string;
  hfPath: string;
  inputTypes: string[];
  outputTypes: string[];
  languages: string[];
  tags: string[];
  quantizedVersions: string[];
  isTextModel: boolean;
  isVisionModel: boolean;
  isAudioModel: boolean;
  isMultimodal: boolean;
  isOpenLicense: boolean;
}

export function buildModelFacts(model: AnyRecord): ModelFacts {
  const name = pick(model.name, model.slug, 'This model');
  const task = pick(model.task, model.model_type, 'general-purpose');
  const taskLabel = humanize(task) || 'General Purpose';
  const license = pick(model.license, 'unspecified');
  const paramCountB = toNumber(model.param_count_b);
  const parametersRaw = pick(model.parameters);
  const paramLabel = parametersRaw
    ? `${parametersRaw} parameters`
    : paramCountB
      ? `${paramCountB}B parameters`
      : 'an undisclosed number of parameters';
  const contextLength = toNumber(model.context_length);
  const contextLabel = contextLength ? `${contextLength.toLocaleString()} tokens` : 'a default';
  const huggingfaceUrl = pick(model.huggingface_url);
  const externalModelId = pick(model.external_model_id, model.slug);
  const hfMatch = huggingfaceUrl.match(/huggingface\.co\/([^/?#]+\/[^/?#]+)/);
  const hfPath = hfMatch ? hfMatch[1] : externalModelId;
  const tags = Array.from(new Set([...asArray(model.tags), ...asArray(model.categories)]));
  const openLicenses = ['mit', 'apache-2.0', 'apache 2.0', 'bsd', 'bsd-3-clause', 'cc-by-4.0', 'openrail', 'llama2', 'llama3'];

  const taskStr = task.toLowerCase();
  const isVisionModel = /image|vision|video|segmentation|detection|depth|diffusion/.test(taskStr);
  const isAudioModel = /audio|speech|voice/.test(taskStr);
  const isMultimodal = /text-to-image|image-to-text|visual-question|any-to-any|multimodal|image-text/.test(taskStr);
  const isTextModel = !isVisionModel && !isAudioModel;

  return {
    id: model.id,
    slug: model.slug,
    name,
    developer: pick(model.developer, 'an independent research team'),
    task,
    taskLabel,
    license,
    architecture: pick(model.architecture, 'a transformer-based architecture'),
    framework: pick(model.framework, model.training_framework, 'PyTorch'),
    parametersRaw,
    paramCountB,
    paramLabel,
    contextLength,
    contextLabel,
    description: pick(model.description, `${name} is ${articleFor(taskLabel)} ${taskLabel.toLowerCase()} model.`),
    huggingfaceUrl,
    githubUrl: pick(model.github_url),
    demoUrl: pick(model.demo_url),
    apiEndpoint: pick(model.api_endpoint),
    externalModelId,
    hfPath,
    inputTypes: asArray(model.input_types),
    outputTypes: asArray(model.output_types),
    languages: asArray(model.languages),
    tags,
    quantizedVersions: asArray(model.quantized_versions),
    isTextModel,
    isVisionModel,
    isAudioModel,
    isMultimodal,
    isOpenLicense: openLicenses.some((l) => license.toLowerCase().includes(l)),
  };
}

// ---------------------------------------------------------------------------
// AI Summary
// ---------------------------------------------------------------------------

export function generateAiSummary(model: AnyRecord) {
  const f = buildModelFacts(model);

  return {
    what: `${f.name} is ${articleFor(f.taskLabel)} ${f.taskLabel.toLowerCase()} model developed by ${f.developer}, built on ${f.architecture} with ${f.paramLabel}. It is released under the ${f.license} license.`,
    who: `${f.name} is best suited for developers, ML engineers, researchers and product teams who need ${f.taskLabel.toLowerCase()} capabilities without training a model from scratch.`,
    when_to_use: `Use ${f.name} when you need reliable ${f.taskLabel.toLowerCase()} on ${f.framework}-based infrastructure, want a permissively documented model card, or want to prototype quickly with ${f.hfPath || 'a hosted checkpoint'}.`,
    when_not_to_use: `Avoid ${f.name} for mission-critical, safety-sensitive deployments without independent evaluation, for tasks far outside ${f.taskLabel.toLowerCase()}, or when the ${f.license} license does not fit your commercial requirements.`,
    advantages: [
      `Purpose-built for ${f.taskLabel.toLowerCase()}`,
      `Runs on standard ${f.framework} tooling`,
      f.contextLength ? `Supports ${f.contextLabel} of context` : 'Straightforward input/output contract',
      f.isOpenLicense ? `Permissive ${f.license} license` : `Clear ${f.license} licensing terms`,
      'Community documentation and benchmarks available on the model card',
    ],
    limitations: [
      'Performance depends heavily on prompt/input quality',
      'May reflect biases present in its training data',
      'Not guaranteed to generalize to domains outside its training distribution',
      f.paramCountB && f.paramCountB > 20 ? 'Requires substantial GPU memory for full-precision inference' : 'Smaller footprint may trade off some accuracy versus larger models',
    ],
    ideal_use_cases: buildIdealUseCases(f),
    difficulty: f.paramCountB && f.paramCountB > 30 ? 'advanced' : f.paramCountB && f.paramCountB > 7 ? 'intermediate' : 'beginner',
  };
}

function buildIdealUseCases(f: ModelFacts): string[] {
  if (f.isVisionModel) {
    return ['Automated image analysis pipelines', 'Content moderation and tagging', 'Visual search and retrieval', 'Creative and generative tooling'];
  }
  if (f.isAudioModel) {
    return ['Voice assistants and transcription', 'Audio content indexing', 'Accessibility tooling (captions/subtitles)', 'Call center analytics'];
  }
  if (f.isMultimodal) {
    return ['Multimodal chat assistants', 'Document and screenshot understanding', 'Cross-modal search', 'Rich media captioning'];
  }
  return ['Chatbots and virtual assistants', 'Content generation and summarization', 'Developer tooling and code assistance', 'Knowledge base question answering'];
}

// ---------------------------------------------------------------------------
// FAQs (30+)
// ---------------------------------------------------------------------------

type FaqTemplate = (f: ModelFacts) => { question: string; answer: string };

const FAQ_TEMPLATES: FaqTemplate[] = [
  (f) => ({
    question: `What is ${f.name}?`,
    answer: `${f.name} is ${articleFor(f.taskLabel)} ${f.taskLabel.toLowerCase()} model developed by ${f.developer}. ${f.description}`,
  }),
  (f) => ({
    question: `Who developed ${f.name}?`,
    answer: `${f.name} was developed by ${f.developer}.${f.huggingfaceUrl ? ` You can find the official model card at ${f.huggingfaceUrl}.` : ''}`,
  }),
  (f) => ({
    question: `What license does ${f.name} use?`,
    answer: `${f.name} is released under the ${f.license} license. ${f.isOpenLicense ? 'This is a permissive license that generally allows commercial use, but always review the exact license terms for your use case.' : 'Review the license terms carefully before using this model commercially, as restrictions may apply.'}`,
  }),
  (f) => ({
    question: `Can I use ${f.name} for commercial projects?`,
    answer: f.isOpenLicense
      ? `Yes, ${f.name} is distributed under the ${f.license} license, which typically permits commercial use. Confirm the exact terms on the model card before shipping to production.`
      : `It depends on the ${f.license} license terms. Some licenses restrict commercial use or require attribution — check the official model card before deploying ${f.name} commercially.`,
  }),
  (f) => ({
    question: `How many parameters does ${f.name} have?`,
    answer: `${f.name} has ${f.paramLabel}. ${f.paramCountB ? `At roughly ${f.paramCountB}B parameters, expect proportional GPU/CPU memory requirements during inference.` : 'The exact parameter count is not published, but you can estimate memory needs from the model weights file size.'}`,
  }),
  (f) => ({
    question: `What architecture does ${f.name} use?`,
    answer: `${f.name} is built on ${f.architecture}. This determines how it processes inputs internally and what optimizations (e.g. flash-attention, KV-caching) are applicable.`,
  }),
  (f) => ({
    question: `What is the maximum context length for ${f.name}?`,
    answer: `${f.name} supports ${f.contextLabel} of context. Inputs longer than this will be truncated or rejected depending on the inference framework you use.`,
  }),
  (f) => ({
    question: `How do I install ${f.name}?`,
    answer: `You can install the required dependencies with pip (\`pip install transformers torch\`) and load ${f.name} with the Hugging Face \`transformers\` library, or pull a ready-to-run container image. See the Installation tab for pip, conda, and Docker instructions.`,
  }),
  (f) => ({
    question: `How do I run inference with ${f.name}?`,
    answer: `Load the model and tokenizer with \`transformers\`, then call \`.generate()\` (for text) or the appropriate pipeline for your task (${f.taskLabel.toLowerCase()}). See the Usage Examples tab for copy-paste snippets.`,
  }),
  (f) => ({
    question: `Does ${f.name} support GPU acceleration?`,
    answer: `Yes. ${f.name} runs on CUDA-enabled GPUs via ${f.framework}, and can also run on Apple Silicon (MPS) or CPU with reduced throughput. Quantized variants further reduce memory needs.`,
  }),
  (f) => ({
    question: `Can ${f.name} run on CPU only?`,
    answer: `Yes, ${f.name} can run on CPU, though inference latency will be significantly higher than on GPU${f.paramCountB && f.paramCountB > 7 ? ', especially given its parameter count' : ''}. Quantized (INT8/INT4) builds are recommended for CPU deployments.`,
  }),
  (f) => ({
    question: `What quantized versions of ${f.name} are available?`,
    answer: f.quantizedVersions.length
      ? `${f.name} has community or official quantized builds in ${f.quantizedVersions.join(', ')} formats, which reduce memory footprint at a small accuracy cost.`
      : `No officially listed quantized builds were found for ${f.name}, but community GGUF/AWQ/GPTQ conversions are common for popular open models — check the Hugging Face Hub for third-party quantizations.`,
  }),
  (f) => ({
    question: `How much GPU memory (VRAM) does ${f.name} require?`,
    answer: f.paramCountB
      ? `As a rough estimate, ${f.name} needs approximately ${(f.paramCountB * 2).toFixed(1)}GB of VRAM in FP16, or about ${(f.paramCountB * 0.75).toFixed(1)}GB when quantized to INT4/8. Actual usage varies with batch size and sequence length.`
      : `VRAM requirements depend on the exact checkpoint size; check the model card's file sizes or run a quick load test to profile memory usage on your hardware.`,
  }),
  (f) => ({
    question: `Is ${f.name} suitable for fine-tuning?`,
    answer: `Yes, ${f.name} can be fine-tuned using standard techniques such as full fine-tuning, LoRA, or QLoRA via libraries like \`peft\` and \`trl\`. Fine-tuning is recommended when you need domain-specific behavior beyond prompting.`,
  }),
  (f) => ({
    question: `How does ${f.name} compare to similar models?`,
    answer: `${f.name} targets ${f.taskLabel.toLowerCase()} workloads. Check the Benchmarks and Comparison tabs on this page for head-to-head scores against similarly sized peers.`,
  }),
  (f) => ({
    question: `What programming languages/frameworks can I use with ${f.name}?`,
    answer: `${f.name} is most commonly used with Python via Hugging Face \`transformers\`, but it can also be served through ONNX Runtime, TensorRT, vLLM, Text Generation Inference (TGI), or wrapped in a REST API using FastAPI for use from any language.`,
  }),
  (f) => ({
    question: `Can I access ${f.name} through an API?`,
    answer: f.apiEndpoint
      ? `Yes, a hosted API endpoint is available. See the API Reference tab for authentication and request/response formats.`
      : `There is no first-party hosted API listed for ${f.name}, but you can self-host it behind a REST API (see the FastAPI install guide) or use community inference providers.`,
  }),
  (f) => ({
    question: `Does ${f.name} support streaming responses?`,
    answer: `Streaming is supported through frameworks like \`transformers\`' \`TextIteratorStreamer\`, vLLM, or TGI, all of which can emit tokens incrementally rather than waiting for the full response.`,
  }),
  (f) => ({
    question: `What input and output types does ${f.name} accept?`,
    answer: `${f.name} accepts ${f.inputTypes.length ? f.inputTypes.join(', ') : 'text'} as input and produces ${f.outputTypes.length ? f.outputTypes.join(', ') : 'text'} as output, consistent with its ${f.taskLabel.toLowerCase()} task.`,
  }),
  (f) => ({
    question: `What languages does ${f.name} support?`,
    answer: f.languages.length
      ? `${f.name} officially supports: ${f.languages.join(', ')}. Performance on other languages is not guaranteed.`
      : `Language coverage is not explicitly documented for ${f.name} — English is typically best supported by default; test other languages before relying on them in production.`,
  }),
  (f) => ({
    question: `How do I deploy ${f.name} in production?`,
    answer: `For production, containerize ${f.name} with Docker, serve it behind vLLM or TorchServe for throughput, add autoscaling, and monitor latency/error rates. See the Docker and vLLM install guides for starting points.`,
  }),
  (f) => ({
    question: `What are the known limitations of ${f.name}?`,
    answer: `Like most ${f.taskLabel.toLowerCase()} models, ${f.name} can produce inaccurate or biased outputs, may struggle with out-of-distribution inputs, and its behavior should be validated for your specific domain before production use.`,
  }),
  (f) => ({
    question: `Is ${f.name} safe to use with sensitive data?`,
    answer: `Treat ${f.name} like any third-party ML component: avoid sending regulated or personally identifiable data to hosted/third-party endpoints, prefer self-hosting for sensitive workloads, and review the Security & Compliance tab.`,
  }),
  (f) => ({
    question: `How often is ${f.name} updated?`,
    answer: `Check the Changelog tab for release history. Update cadence varies by maintainer — subscribe to the model repository (${f.huggingfaceUrl || f.githubUrl || 'the official source'}) for update notifications.`,
  }),
  (f) => ({
    question: `Where can I find the source code or model weights for ${f.name}?`,
    answer: `${f.huggingfaceUrl ? `Model weights: ${f.huggingfaceUrl}. ` : ''}${f.githubUrl ? `Source code: ${f.githubUrl}.` : 'Check the model card links on this page for the canonical source.'}`,
  }),
  (f) => ({
    question: `Can I export ${f.name} to ONNX?`,
    answer: `Yes, most ${f.framework}-based models including ${f.name} can be exported to ONNX using \`optimum\`'s \`onnx export\` command, enabling deployment via ONNX Runtime on CPU, GPU, or edge devices.`,
  }),
  (f) => ({
    question: `Does ${f.name} work with LangChain or LlamaIndex?`,
    answer: `Yes, ${f.name} can be wrapped as a custom LLM/embedding provider in LangChain or LlamaIndex, either through a local \`transformers\` pipeline or a self-hosted inference server (vLLM/TGI) exposed via an OpenAI-compatible endpoint.`,
  }),
  (f) => ({
    question: `What hardware is recommended for ${f.name}?`,
    answer: f.paramCountB && f.paramCountB > 30
      ? `For ${f.name}, a multi-GPU setup (e.g. 2-4x 24GB+ GPUs) or a single high-memory accelerator is recommended for full-precision inference; quantization can reduce this to a single consumer GPU.`
      : `${f.name} can typically run on a single consumer or datacenter GPU with 8-24GB VRAM depending on precision; CPU inference is possible for smaller batch sizes.`,
  }),
  (f) => ({
    question: `How do I reduce latency when serving ${f.name}?`,
    answer: `Use a dedicated inference server (vLLM or TGI) for continuous batching and paged attention, enable quantization, reduce max output tokens, and colocate the model close to your application to cut network latency.`,
  }),
  (f) => ({
    question: `Can I run ${f.name} offline / air-gapped?`,
    answer: `Yes, once the model weights are downloaded locally, ${f.name} can run fully offline with no external network calls — a common requirement for regulated or air-gapped environments.`,
  }),
  (f) => ({
    question: `What datasets was ${f.name} trained on?`,
    answer: `Training data details are listed in the Training Data tab where available. If undocumented, treat unknown-provenance training data as a factor in your risk assessment.`,
  }),
  (f) => ({
    question: `How is ${f.name} benchmarked?`,
    answer: `See the Benchmarks tab for scores across standard evaluation suites for its task category. Always validate performance on a held-out sample of your own data before trusting published benchmarks.`,
  }),
  (f) => ({
    question: `Are there smaller or larger variants of ${f.name}?`,
    answer: `Check the Variants tab for related checkpoints at different parameter counts or quantization levels, which can trade off accuracy for speed and memory.`,
  }),
  (f) => ({
    question: `How do I report an issue with ${f.name}?`,
    answer: `Use the Report button on this page to flag incorrect metadata, broken links, or policy concerns, or open an issue on ${f.githubUrl || f.huggingfaceUrl || 'the official repository'} for technical bugs.`,
  }),
  (f) => ({
    question: `Can I fine-tune ${f.name} with limited GPU resources?`,
    answer: `Yes — parameter-efficient methods such as LoRA/QLoRA let you fine-tune ${f.name} on a single consumer GPU by only training a small number of adapter weights instead of the full model.`,
  }),
  (f) => ({
    question: `Does HackerThink host a live playground for ${f.name}?`,
    answer: `If a playground API is configured for ${f.name}, you can try it directly from the Playground tab on this page without writing any code.`,
  }),
];

export function generateFaqs(model: AnyRecord) {
  const f = buildModelFacts(model);
  return FAQ_TEMPLATES.map((tpl, index) => {
    const { question, answer } = tpl(f);
    return { question, answer, sort_order: index };
  });
}

// ---------------------------------------------------------------------------
// Install guides
// ---------------------------------------------------------------------------

export function generateInstallGuides(model: AnyRecord) {
  const f = buildModelFacts(model);
  const modelRef = f.hfPath || f.slug;

  const guides: Array<{
    target: string;
    title: string;
    command: string;
    code: string;
    description: string;
    version_label?: string;
  }> = [
    {
      target: 'pip',
      title: 'Install via pip',
      command: 'pip install torch transformers accelerate',
      code: `pip install torch transformers accelerate\n\npython - <<'PY'\nfrom transformers import AutoModel, AutoTokenizer\n\nmodel_id = "${modelRef}"\ntokenizer = AutoTokenizer.from_pretrained(model_id)\nmodel = AutoModel.from_pretrained(model_id)\nprint(model.config)\nPY`,
      description: `Install the core Python dependencies and load ${f.name} with Hugging Face Transformers.`,
      version_label: 'transformers>=4.40',
    },
    {
      target: 'conda',
      title: 'Install via Conda',
      command: 'conda create -n modelenv python=3.10 -y',
      code: `conda create -n modelenv python=3.10 -y\nconda activate modelenv\npip install torch transformers accelerate\n\npython -c "from transformers import AutoTokenizer; print(AutoTokenizer.from_pretrained('${modelRef}'))"`,
      description: `Create an isolated Conda environment for running ${f.name} without polluting your system Python.`,
      version_label: 'python=3.10',
    },
    {
      target: 'docker',
      title: 'Run with Docker',
      command: `docker run --gpus all -p 8000:8000 huggingface/transformers-pytorch-gpu:latest`,
      code: `FROM huggingface/transformers-pytorch-gpu:latest\n\nWORKDIR /app\nRUN pip install accelerate fastapi uvicorn\nCOPY app.py .\n\nENV MODEL_ID="${modelRef}"\nEXPOSE 8000\nCMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]`,
      description: `Containerize ${f.name} for reproducible, GPU-accelerated deployments.`,
      version_label: 'latest',
    },
    {
      target: 'onnx',
      title: 'Export to ONNX',
      command: `optimum-cli export onnx --model ${modelRef} onnx_model/`,
      code: `pip install optimum[onnxruntime]\noptimum-cli export onnx --model ${modelRef} onnx_model/\n\npython - <<'PY'\nfrom optimum.onnxruntime import ORTModelForFeatureExtraction\nfrom transformers import AutoTokenizer\n\nmodel = ORTModelForFeatureExtraction.from_pretrained("onnx_model")\ntokenizer = AutoTokenizer.from_pretrained("onnx_model")\nPY`,
      description: `Export ${f.name} to ONNX for portable, framework-agnostic inference (CPU, GPU, or edge).`,
      version_label: 'optimum>=1.19',
    },
    {
      target: 'tensorrt',
      title: 'Optimize with TensorRT',
      command: 'trtexec --onnx=model.onnx --saveEngine=model.engine --fp16',
      code: `# 1. Export to ONNX first (see the ONNX guide)\n# 2. Convert to a TensorRT engine\ntrtexec --onnx=onnx_model/model.onnx \\\n  --saveEngine=${f.slug}.engine \\\n  --fp16 --workspace=4096`,
      description: `Compile ${f.name} into a TensorRT engine for maximum throughput on NVIDIA GPUs.`,
      version_label: 'TensorRT>=8.6',
    },
    {
      target: 'openvino',
      title: 'Convert for OpenVINO',
      command: `optimum-cli export openvino --model ${modelRef} ov_model/`,
      code: `pip install optimum[openvino]\noptimum-cli export openvino --model ${modelRef} ov_model/\n\npython - <<'PY'\nfrom optimum.intel import OVModelForFeatureExtraction\nmodel = OVModelForFeatureExtraction.from_pretrained("ov_model")\nPY`,
      description: `Convert ${f.name} to OpenVINO IR format for optimized inference on Intel CPUs/GPUs/VPUs.`,
      version_label: 'optimum-intel>=1.16',
    },
    {
      target: 'transformers',
      title: 'Load with Hugging Face Transformers',
      command: `AutoModel.from_pretrained("${modelRef}")`,
      code: `from transformers import AutoTokenizer, AutoModel\n\ntokenizer = AutoTokenizer.from_pretrained("${modelRef}")\nmodel = AutoModel.from_pretrained("${modelRef}", device_map="auto")`,
      description: `The canonical way to load ${f.name} directly from the Hugging Face Hub.`,
      version_label: 'transformers>=4.40',
    },
    {
      target: 'cli',
      title: 'Download via Hugging Face CLI',
      command: `huggingface-cli download ${modelRef}`,
      code: `pip install -U "huggingface_hub[cli]"\nhuggingface-cli login\nhuggingface-cli download ${modelRef} --local-dir ./${f.slug}`,
      description: `Download the raw ${f.name} weights and config files to disk without loading them into Python.`,
      version_label: 'huggingface_hub>=0.22',
    },
    {
      target: 'fastapi',
      title: 'Serve behind FastAPI',
      command: 'uvicorn app:app --host 0.0.0.0 --port 8000',
      code: `from fastapi import FastAPI\nfrom pydantic import BaseModel\nfrom transformers import pipeline\n\napp = FastAPI()\npipe = pipeline("${f.task || 'text-generation'}", model="${modelRef}")\n\nclass Request(BaseModel):\n    input: str\n\n@app.post("/predict")\ndef predict(req: Request):\n    return {"output": pipe(req.input)}`,
      description: `Wrap ${f.name} in a lightweight REST API so it can be called from any language.`,
      version_label: 'fastapi>=0.110',
    },
    {
      target: 'torchserve',
      title: 'Deploy with TorchServe',
      command: 'torchserve --start --model-store model_store --models model=model.mar',
      code: `torch-model-archiver \\\n  --model-name ${f.slug} \\\n  --version 1.0 \\\n  --serialized-file pytorch_model.bin \\\n  --handler transformers_handler.py \\\n  --export-path model_store\n\ntorchserve --start --model-store model_store --models model=${f.slug}.mar`,
      description: `Package and serve ${f.name} with TorchServe for scalable production PyTorch inference.`,
      version_label: 'torchserve>=0.11',
    },
    {
      target: 'vllm',
      title: 'Serve with vLLM',
      command: `vllm serve ${modelRef}`,
      code: `pip install vllm\nvllm serve ${modelRef} --host 0.0.0.0 --port 8000\n\n# OpenAI-compatible request\ncurl http://localhost:8000/v1/completions \\\n  -H "Content-Type: application/json" \\\n  -d '{"model": "${modelRef}", "prompt": "Hello", "max_tokens": 64}'`,
      description: `Run ${f.name} with vLLM for high-throughput, continuous-batched, OpenAI-compatible serving.`,
      version_label: 'vllm>=0.4',
    },
    {
      target: 'tgi',
      title: 'Serve with Text Generation Inference (TGI)',
      command: `docker run --gpus all -p 8080:80 ghcr.io/huggingface/text-generation-inference:latest --model-id ${modelRef}`,
      code: `docker run --gpus all -p 8080:80 \\\n  -v $PWD/data:/data \\\n  ghcr.io/huggingface/text-generation-inference:latest \\\n  --model-id ${modelRef}\n\ncurl http://localhost:8080/generate \\\n  -H "Content-Type: application/json" \\\n  -d '{"inputs": "Hello", "parameters": {"max_new_tokens": 64}}'`,
      description: `Deploy ${f.name} with Hugging Face's TGI server for streaming, batching and production-grade throughput.`,
      version_label: 'TGI>=2.0',
    },
  ];

  return guides.map((g, index) => ({ ...g, sort_order: index }));
}

// ---------------------------------------------------------------------------
// Usage examples
// ---------------------------------------------------------------------------

export function generateUsageExamples(model: AnyRecord) {
  const f = buildModelFacts(model);
  const modelRef = f.hfPath || f.slug;

  const examples: Array<{ title: string; language: string; runtime?: string; code: string; description: string }> = [
    {
      title: 'Quickstart with Transformers pipeline',
      language: 'python',
      runtime: 'transformers',
      code: `from transformers import pipeline\n\npipe = pipeline("${f.task || 'text-generation'}", model="${modelRef}")\nresult = pipe("Hello, how are you?")\nprint(result)`,
      description: `The fastest way to try ${f.name} — a single high-level pipeline call.`,
    },
    {
      title: 'Manual model + tokenizer loading',
      language: 'python',
      runtime: 'transformers',
      code: `from transformers import AutoTokenizer, AutoModelForCausalLM\nimport torch\n\ntokenizer = AutoTokenizer.from_pretrained("${modelRef}")\nmodel = AutoModelForCausalLM.from_pretrained("${modelRef}", torch_dtype=torch.float16, device_map="auto")\n\ninputs = tokenizer("Hello, how are you?", return_tensors="pt").to(model.device)\noutputs = model.generate(**inputs, max_new_tokens=128)\nprint(tokenizer.decode(outputs[0], skip_special_tokens=True))`,
      description: `Full control over generation parameters, device placement, and precision.`,
    },
    {
      title: 'Streaming generation',
      language: 'python',
      runtime: 'transformers',
      code: `from transformers import AutoTokenizer, AutoModelForCausalLM, TextIteratorStreamer\nfrom threading import Thread\n\ntokenizer = AutoTokenizer.from_pretrained("${modelRef}")\nmodel = AutoModelForCausalLM.from_pretrained("${modelRef}", device_map="auto")\nstreamer = TextIteratorStreamer(tokenizer, skip_prompt=True)\n\ninputs = tokenizer("Write a haiku about the ocean.", return_tensors="pt").to(model.device)\nThread(target=model.generate, kwargs=dict(**inputs, streamer=streamer, max_new_tokens=64)).start()\n\nfor token in streamer:\n    print(token, end="", flush=True)`,
      description: `Stream tokens as they are generated for a responsive, chat-like UX.`,
    },
    {
      title: 'Batch inference',
      language: 'python',
      runtime: 'transformers',
      code: `from transformers import pipeline\n\npipe = pipeline("${f.task || 'text-generation'}", model="${modelRef}", batch_size=8)\ninputs = ["Prompt 1", "Prompt 2", "Prompt 3"]\nresults = pipe(inputs)\nfor r in results:\n    print(r)`,
      description: `Process multiple inputs in a single batched call for higher throughput.`,
    },
    {
      title: 'REST API call (self-hosted or vLLM/TGI)',
      language: 'bash',
      runtime: 'curl',
      code: `curl -X POST http://localhost:8000/v1/completions \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "model": "${modelRef}",\n    "prompt": "Hello, how are you?",\n    "max_tokens": 128,\n    "temperature": 0.7\n  }'`,
      description: `Call an OpenAI-compatible endpoint serving ${f.name} (e.g. vLLM or TGI) from any language.`,
    },
    {
      title: 'JavaScript / Node.js client',
      language: 'javascript',
      runtime: 'fetch',
      code: `const response = await fetch("http://localhost:8000/v1/completions", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({\n    model: "${modelRef}",\n    prompt: "Hello, how are you?",\n    max_tokens: 128,\n  }),\n});\n\nconst data = await response.json();\nconsole.log(data);`,
      description: `Consume a hosted ${f.name} endpoint from a Node.js or browser environment.`,
    },
    {
      title: 'LangChain integration',
      language: 'python',
      runtime: 'langchain',
      code: `from langchain_huggingface import HuggingFacePipeline\nfrom transformers import pipeline\n\nhf_pipeline = pipeline("${f.task || 'text-generation'}", model="${modelRef}", max_new_tokens=128)\nllm = HuggingFacePipeline(pipeline=hf_pipeline)\n\nprint(llm.invoke("Summarize the benefits of renewable energy."))`,
      description: `Plug ${f.name} into a LangChain pipeline for retrieval-augmented generation or agents.`,
    },
    {
      title: 'ONNX Runtime inference',
      language: 'python',
      runtime: 'onnxruntime',
      code: `from optimum.onnxruntime import ORTModelForCausalLM\nfrom transformers import AutoTokenizer\n\ntokenizer = AutoTokenizer.from_pretrained("onnx_model")\nmodel = ORTModelForCausalLM.from_pretrained("onnx_model")\n\ninputs = tokenizer("Hello, how are you?", return_tensors="pt")\noutputs = model.generate(**inputs, max_new_tokens=64)\nprint(tokenizer.decode(outputs[0], skip_special_tokens=True))`,
      description: `Run the ONNX-exported version of ${f.name} for portable, framework-agnostic inference.`,
    },
  ];

  return examples.map((e, index) => ({ ...e, sort_order: index }));
}

// ---------------------------------------------------------------------------
// Architecture nodes
// ---------------------------------------------------------------------------

export function generateArchitectureNodes(model: AnyRecord) {
  const f = buildModelFacts(model);

  const coreStage = f.isVisionModel
    ? { key: 'vision_backbone', title: 'Vision Backbone', explanation: `Convolutional or transformer-based backbone (${f.architecture}) that extracts visual features from the input.` }
    : f.isAudioModel
      ? { key: 'acoustic_encoder', title: 'Acoustic Encoder', explanation: `Encodes raw audio (or spectrograms) into latent representations using ${f.architecture}.` }
      : { key: 'transformer_stack', title: 'Transformer Stack', explanation: `A stack of ${f.architecture} blocks with self-attention and feed-forward layers processes the embedded sequence.` };

  const nodes = [
    {
      node_key: 'input_layer',
      title: 'Input Processing',
      explanation: `Raw ${f.inputTypes.join('/') || 'text'} input is validated, normalized and prepared for tokenization or feature extraction.`,
    },
    {
      node_key: 'tokenizer',
      title: 'Tokenization / Preprocessing',
      explanation: f.isVisionModel || f.isAudioModel
        ? 'Input is preprocessed (resized, normalized, or resampled) into a fixed-size tensor representation.'
        : 'Text is split into subword tokens using the model\'s tokenizer (e.g. BPE or SentencePiece) and mapped to input IDs.',
    },
    {
      node_key: 'embedding',
      title: 'Embedding Layer',
      explanation: 'Token/patch IDs are mapped to dense vector embeddings, optionally combined with positional encodings.',
    },
    {
      node_key: coreStage.key,
      title: coreStage.title,
      explanation: coreStage.explanation,
    },
    {
      node_key: 'attention_mechanism',
      title: 'Attention Mechanism',
      explanation: 'Self-attention (and cross-attention where applicable) lets the model weigh relationships between different positions in the input.',
    },
    {
      node_key: 'output_head',
      title: 'Output Head',
      explanation: `A task-specific head projects hidden states into the final ${f.outputTypes.join('/') || 'output'} representation for ${f.taskLabel.toLowerCase()}.`,
    },
    {
      node_key: 'decoding',
      title: 'Decoding / Post-processing',
      explanation: f.isTextModel
        ? 'Output logits are converted to tokens via a decoding strategy (greedy, beam search, or sampling with temperature/top-p) and detokenized back to text.'
        : 'Raw model outputs are post-processed (e.g. thresholding, upsampling, or vocoding) into the final deliverable format.',
    },
  ];

  return nodes.map((n, index) => ({ ...n, sort_order: index, metadata: {} }));
}

// ---------------------------------------------------------------------------
// Use case cards
// ---------------------------------------------------------------------------

export function generateUseCaseCards(model: AnyRecord) {
  const f = buildModelFacts(model);

  const base = f.isVisionModel
    ? [
        ['Retail & E-commerce', 'Automated product tagging, visual search, and quality inspection.'],
        ['Media & Entertainment', 'Content moderation, thumbnail generation, and scene detection.'],
        ['Healthcare', 'Assisted image triage and annotation for research workflows (not diagnostic use).'],
        ['Security & Surveillance', 'Object detection and anomaly flagging in camera feeds.'],
        ['Manufacturing', 'Defect detection and visual quality control on production lines.'],
        ['Autonomous Systems', 'Perception components for robotics and autonomous vehicles.'],
      ]
    : f.isAudioModel
      ? [
          ['Customer Support', 'Call transcription, sentiment analysis, and QA automation.'],
          ['Accessibility', 'Live captioning and transcription for hearing-impaired users.'],
          ['Media Production', 'Automatic subtitling and podcast/video transcription.'],
          ['Voice Assistants', 'Wake-word detection and speech understanding pipelines.'],
          ['Telecom', 'Call center analytics and compliance monitoring.'],
          ['Education', 'Lecture transcription and language-learning feedback tools.'],
        ]
      : [
          ['Customer Support', `Automating first-line support with ${f.name}-powered chat and ticket triage.`],
          ['Content Creation', 'Drafting articles, marketing copy, and social media content at scale.'],
          ['Software Development', 'Code completion, documentation generation, and code review assistance.'],
          ['Education', 'Personalized tutoring, quiz generation, and study material summarization.'],
          ['Enterprise Search', 'Semantic search and question answering over internal knowledge bases.'],
          ['Research', 'Literature summarization and hypothesis brainstorming.'],
          ['Legal & Compliance', 'Document summarization and clause extraction (with human review).'],
          ['Marketing', 'Campaign copy generation and A/B testing variant creation.'],
        ];

  return base.map(([industry, description], index) => ({
    industry,
    title: `${industry} with ${f.name}`,
    description,
    sort_order: index,
  }));
}

// ---------------------------------------------------------------------------
// Quick facts
// ---------------------------------------------------------------------------

export function generateQuickFacts(model: AnyRecord) {
  const f = buildModelFacts(model);

  return {
    task: f.taskLabel,
    architecture: f.architecture,
    model_size: f.paramLabel,
    input_type: f.inputTypes.join(', ') || (f.isVisionModel ? 'Image' : f.isAudioModel ? 'Audio' : 'Text'),
    output_type: f.outputTypes.join(', ') || (f.isVisionModel ? 'Labels/Image' : f.isAudioModel ? 'Text/Audio' : 'Text'),
    framework: f.framework,
    license: f.license,
    inference_speed: f.paramCountB && f.paramCountB > 30 ? 'Slow (large model)' : f.paramCountB && f.paramCountB > 7 ? 'Moderate' : 'Fast',
    accuracy: 'See Benchmarks tab',
    memory_usage: f.paramCountB ? `~${(f.paramCountB * 2).toFixed(1)}GB (FP16)` : 'Varies by checkpoint',
    gpu_requirement: f.paramCountB && f.paramCountB > 30 ? 'Multi-GPU recommended' : 'Single GPU (8GB+ VRAM)',
    cpu_requirement: 'Supported, with reduced throughput',
    quantized_versions: f.quantizedVersions.length ? f.quantizedVersions.join(', ') : 'Community builds may be available',
    training_dataset: 'See Training Data tab',
    commercial_use: f.isOpenLicense ? 'Allowed (verify license terms)' : 'Restricted - review license',
    offline_support: 'Yes (after downloading weights)',
  };
}

// ---------------------------------------------------------------------------
// Compatibility matrix
// ---------------------------------------------------------------------------

export function generateCompatibilityMatrix(model: AnyRecord) {
  const f = buildModelFacts(model);
  const frameworkLower = f.framework.toLowerCase();
  const tagStr = f.tags.join(' ').toLowerCase();

  return {
    pytorch: frameworkLower.includes('pytorch') || !frameworkLower || true,
    tensorflow: frameworkLower.includes('tensorflow') || tagStr.includes('tensorflow'),
    jax: frameworkLower.includes('jax') || tagStr.includes('jax') || tagStr.includes('flax'),
    onnx: true,
    transformers: true,
    vllm: f.isTextModel,
    text_generation_inference: f.isTextModel,
    langchain: f.isTextModel,
    llama_cpp: f.isTextModel && (f.quantizedVersions.includes('GGUF') || tagStr.includes('gguf') || true),
    cuda_gpu: true,
    apple_silicon: 'partial',
    cpu_only: true,
    docker: true,
    kubernetes: true,
    windows: 'partial',
    linux: true,
    macos: 'partial',
  };
}

// ---------------------------------------------------------------------------
// Overview guidance
// ---------------------------------------------------------------------------

export function generateOverviewGuidance(model: AnyRecord) {
  const f = buildModelFacts(model);

  return {
    requirements: [
      `Python 3.9+ with ${f.framework}`,
      'A CUDA-capable GPU is recommended (CPU inference is slower but supported)',
      f.paramCountB ? `~${(f.paramCountB * 2).toFixed(1)}GB VRAM for FP16 inference` : 'Sufficient RAM/VRAM for the model checkpoint',
    ],
    dependencies: ['transformers', 'torch', 'accelerate', 'tokenizers'],
    strengths: [
      `Strong fit for ${f.taskLabel.toLowerCase()} tasks`,
      'Well-supported by the Hugging Face ecosystem',
      'Compatible with common inference optimizers (ONNX, TensorRT, vLLM)',
    ],
    weaknesses: [
      'May require prompt/fine-tuning to hit peak accuracy in narrow domains',
      'Larger checkpoints demand meaningful GPU memory',
    ],
    common_mistakes: [
      'Not truncating inputs to the supported context length',
      'Running FP32 inference when FP16/quantized precision would suffice',
      'Skipping evaluation on your own data before production rollout',
    ],
    best_practices: [
      'Pin dependency versions (transformers, torch) for reproducibility',
      'Cache model weights locally to avoid repeated downloads',
      'Add input validation and output moderation around the model in production',
      'Monitor latency, memory, and error rates once deployed',
    ],
    expected_performance: `Throughput and latency scale with ${f.paramLabel} and available hardware; see the Benchmarks tab for task-specific scores.`,
    commercial_usage: f.isOpenLicense
      ? `Generally permitted under the ${f.license} license — confirm exact terms before shipping.`
      : `Review the ${f.license} license carefully; commercial use may require additional permissions.`,
    ethical_considerations: 'Evaluate for bias, factual accuracy, and misuse potential relevant to your application before deployment.',
    known_limitations: [
      'Outputs may be inaccurate or biased and should not be treated as ground truth',
      'Not evaluated for safety-critical or regulated use cases without additional review',
    ],
    features: [
      `${f.taskLabel} out of the box`,
      'Hugging Face Hub compatible',
      f.contextLength ? `${f.contextLabel} context window` : 'Standard context window',
    ],
  };
}

// ---------------------------------------------------------------------------
// Default API docs
// ---------------------------------------------------------------------------

export function generateDefaultApiDocs(model: AnyRecord) {
  const f = buildModelFacts(model);

  const docs: Array<{ doc_type: string; title: string; content: string; code: string; language: string; metadata?: AnyRecord }> = [
    {
      doc_type: 'overview',
      title: 'API Overview',
      content: `HackerThink exposes a lightweight proxy at /api/models/${f.slug}/playground that forwards requests to this model's configured playground endpoint, so you can experiment before self-hosting.`,
      code: '',
      language: 'text',
    },
    {
      doc_type: 'rest_api',
      title: 'Playground REST endpoint',
      content: `POST to the HackerThink playground proxy to run ${f.name} without any setup. The request body is forwarded as-is to the configured backend.`,
      code: `POST /api/models/${f.slug}/playground\nContent-Type: application/json\n\n{\n  "input": "Hello, how are you?"\n}`,
      language: 'http',
    },
    {
      doc_type: 'curl',
      title: 'cURL example',
      content: 'Call the playground proxy from the command line.',
      code: `curl -X POST https://hackerthink.com/api/models/${f.slug}/playground \\\n  -H "Content-Type: application/json" \\\n  -d '{"input": "Hello, how are you?"}'`,
      language: 'bash',
    },
    {
      doc_type: 'javascript',
      title: 'JavaScript example',
      content: 'Call the playground proxy from a browser or Node.js app.',
      code: `const res = await fetch("/api/models/${f.slug}/playground", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ input: "Hello, how are you?" }),\n});\nconst { output, latency_ms } = await res.json();\nconsole.log(output, latency_ms);`,
      language: 'javascript',
    },
    {
      doc_type: 'python',
      title: 'Python example',
      content: 'Call the playground proxy using the requests library.',
      code: `import requests\n\nresp = requests.post(\n    "https://hackerthink.com/api/models/${f.slug}/playground",\n    json={"input": "Hello, how are you?"},\n)\nprint(resp.json())`,
      language: 'python',
    },
    {
      doc_type: 'authentication',
      title: 'Authentication',
      content: 'The playground proxy itself is public. If the underlying model API requires an API key, configure it in the admin panel\'s playground settings rather than exposing it client-side.',
      code: '',
      language: 'text',
    },
    {
      doc_type: 'rate_limits',
      title: 'Rate limits & timeouts',
      content: 'Playground requests are capped at a 30 second timeout. For sustained or high-volume traffic, self-host the model behind vLLM/TGI instead of relying on the playground proxy.',
      code: '',
      language: 'text',
    },
    {
      doc_type: 'errors',
      title: 'Error handling',
      content: 'The proxy returns HTTP 400 if no playground API is configured, 502/504 for upstream failures or timeouts, and forwards the upstream status code otherwise.',
      code: `{\n  "error": "Playground request timed out after 30s",\n  "latency_ms": 30001\n}`,
      language: 'json',
    },
  ];

  return docs.map((d, index) => ({ ...d, sort_order: index, metadata: d.metadata || {} }));
}

// ---------------------------------------------------------------------------
// Security notes
// ---------------------------------------------------------------------------

export function generateSecurityNotes(model: AnyRecord) {
  const f = buildModelFacts(model);

  const notes: Array<{ note_type: string; title: string; body: string; severity: string }> = [
    {
      note_type: 'data_privacy',
      title: 'Data privacy',
      body: `Avoid sending personally identifiable or regulated data to third-party hosted endpoints for ${f.name}. Prefer self-hosting when handling sensitive information.`,
      severity: 'medium',
    },
    {
      note_type: 'bias_fairness',
      title: 'Bias & fairness',
      body: `Like most models trained on large-scale data, ${f.name} may reflect societal or dataset biases. Evaluate outputs for fairness before use in decisions affecting people.`,
      severity: 'medium',
    },
    {
      note_type: 'content_safety',
      title: 'Content safety',
      body: f.isTextModel
        ? `${f.name} can generate incorrect, misleading, or inappropriate content. Add moderation and human review layers for user-facing deployments.`
        : `Outputs from ${f.name} should be validated before being used in automated decision-making pipelines.`,
      severity: 'medium',
    },
    {
      note_type: 'license_compliance',
      title: 'License compliance',
      body: `Confirm your usage complies with the ${f.license} license, especially around commercial use, redistribution, and attribution requirements.`,
      severity: f.isOpenLicense ? 'low' : 'high',
    },
    {
      note_type: 'misuse_prevention',
      title: 'Misuse prevention',
      body: `Implement usage policies, rate limiting, and abuse monitoring around ${f.name} to reduce the risk of malicious or unintended use.`,
      severity: 'medium',
    },
    {
      note_type: 'model_security',
      title: 'Supply-chain security',
      body: `Download ${f.name} weights only from trusted sources (verify checksums where available) and be cautious of \`custom_code\` execution when loading community checkpoints.`,
      severity: 'medium',
    },
  ];

  return notes;
}

// ---------------------------------------------------------------------------
// Tutorial seeds (optional, only inserted if the model has none yet)
// ---------------------------------------------------------------------------

export function generateTutorialSeeds(model: AnyRecord) {
  const f = buildModelFacts(model);

  const tutorials: Array<{ title: string; difficulty: string; url: string; description: string; is_video: boolean }> = [
    {
      title: `Getting started with ${f.name}`,
      difficulty: 'beginner',
      url: f.huggingfaceUrl || `https://huggingface.co/models?search=${encodeURIComponent(f.slug)}`,
      description: `Official model card and quickstart for ${f.name}.`,
      is_video: false,
    },
    {
      title: `Fine-tuning ${f.name} with LoRA`,
      difficulty: 'intermediate',
      url: 'https://huggingface.co/docs/peft/index',
      description: 'General guide to parameter-efficient fine-tuning applicable to most Hugging Face models.',
      is_video: false,
    },
    {
      title: `Serving ${f.name} at scale with vLLM`,
      difficulty: 'advanced',
      url: 'https://docs.vllm.ai/',
      description: 'Production deployment patterns for high-throughput inference serving.',
      is_video: false,
    },
  ];

  return tutorials.map((t, index) => ({ ...t, sort_order: index }));
}

// ---------------------------------------------------------------------------
// Playground config
// ---------------------------------------------------------------------------

export function generatePlaygroundConfig(model: AnyRecord) {
  const f = buildModelFacts(model);
  const existing = typeof model.playground_config === 'string'
    ? (() => { try { return JSON.parse(model.playground_config); } catch { return {}; } })()
    : (model.playground_config || {});

  return {
    demo_url: existing.demo_url ?? f.demoUrl ?? null,
    embed_url: existing.embed_url ?? null,
    api_url: existing.api_url ?? f.apiEndpoint ?? null,
    api_key: existing.api_key ?? undefined,
    modality: existing.modality ?? (f.isVisionModel ? 'image' : f.isAudioModel ? 'audio' : 'text'),
    space_id: existing.space_id ?? null,
  };
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

export interface ModelDocsBundle {
  aiSummary: ReturnType<typeof generateAiSummary>;
  faqs: ReturnType<typeof generateFaqs>;
  installGuides: ReturnType<typeof generateInstallGuides>;
  usageExamples: ReturnType<typeof generateUsageExamples>;
  architectureNodes: ReturnType<typeof generateArchitectureNodes>;
  useCaseCards: ReturnType<typeof generateUseCaseCards>;
  quickFacts: ReturnType<typeof generateQuickFacts>;
  compatibilityMatrix: ReturnType<typeof generateCompatibilityMatrix>;
  overviewGuidance: ReturnType<typeof generateOverviewGuidance>;
  apiDocs: ReturnType<typeof generateDefaultApiDocs>;
  securityNotes: ReturnType<typeof generateSecurityNotes>;
  tutorials?: ReturnType<typeof generateTutorialSeeds>;
  playgroundConfig: ReturnType<typeof generatePlaygroundConfig>;
}

export function buildModelDocsBundle(model: AnyRecord): ModelDocsBundle {
  return {
    aiSummary: generateAiSummary(model),
    faqs: generateFaqs(model),
    installGuides: generateInstallGuides(model),
    usageExamples: generateUsageExamples(model),
    architectureNodes: generateArchitectureNodes(model),
    useCaseCards: generateUseCaseCards(model),
    quickFacts: generateQuickFacts(model),
    compatibilityMatrix: generateCompatibilityMatrix(model),
    overviewGuidance: generateOverviewGuidance(model),
    apiDocs: generateDefaultApiDocs(model),
    securityNotes: generateSecurityNotes(model),
    tutorials: generateTutorialSeeds(model),
    playgroundConfig: generatePlaygroundConfig(model),
  };
}

/**
 * Persist a generated docs bundle for a model: satellite tables are fully
 * replaced (delete + re-insert) inside a single transaction, and the
 * relevant JSON columns on `ai_models` are updated. `model_tutorials` is
 * only seeded if the model has no tutorials yet, since those are more often
 * curated by hand.
 */
export async function persistModelDocs(modelId: string, docs: ModelDocsBundle) {
  const counts: Record<string, number> = {};

  await transaction(async (client: AnyRecord) => {
    await client.query('DELETE FROM model_faqs WHERE model_id = $1', [modelId]);
    for (let index = 0; index < docs.faqs.length; index++) {
      const faq = docs.faqs[index];
      await client.query(
        `INSERT INTO model_faqs (model_id, question, answer, sort_order) VALUES ($1, $2, $3, $4)`,
        [modelId, faq.question, faq.answer, faq.sort_order ?? index]
      );
    }
    counts.faqs = docs.faqs.length;

    await client.query('DELETE FROM model_install_guides WHERE model_id = $1', [modelId]);
    for (const guide of docs.installGuides) {
      await client.query(
        `INSERT INTO model_install_guides (model_id, target, title, command, code, description, version_label, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [modelId, guide.target, guide.title, guide.command, guide.code, guide.description, guide.version_label || null, guide.sort_order]
      );
    }
    counts.install_guides = docs.installGuides.length;

    await client.query('DELETE FROM model_usage_examples WHERE model_id = $1', [modelId]);
    for (const example of docs.usageExamples) {
      await client.query(
        `INSERT INTO model_usage_examples (model_id, title, language, runtime, code, description, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [modelId, example.title, example.language, example.runtime || null, example.code, example.description, example.sort_order]
      );
    }
    counts.usage_examples = docs.usageExamples.length;

    await client.query('DELETE FROM model_architecture_nodes WHERE model_id = $1', [modelId]);
    for (const node of docs.architectureNodes) {
      await client.query(
        `INSERT INTO model_architecture_nodes (model_id, node_key, title, explanation, sort_order, metadata)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
        [modelId, node.node_key, node.title, node.explanation, node.sort_order, JSON.stringify(node.metadata || {})]
      );
    }
    counts.architecture_nodes = docs.architectureNodes.length;

    await client.query('DELETE FROM model_use_case_cards WHERE model_id = $1', [modelId]);
    for (const card of docs.useCaseCards) {
      await client.query(
        `INSERT INTO model_use_case_cards (model_id, industry, title, description, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [modelId, card.industry, card.title, card.description, card.sort_order]
      );
    }
    counts.use_case_cards = docs.useCaseCards.length;

    await client.query('DELETE FROM model_api_docs WHERE model_id = $1', [modelId]);
    for (const doc of docs.apiDocs) {
      await client.query(
        `INSERT INTO model_api_docs (model_id, doc_type, title, content, code, language, metadata, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)`,
        [modelId, doc.doc_type, doc.title, doc.content, doc.code, doc.language, JSON.stringify(doc.metadata || {}), doc.sort_order]
      );
    }
    counts.api_docs = docs.apiDocs.length;

    await client.query('DELETE FROM model_security_notes WHERE model_id = $1', [modelId]);
    for (const note of docs.securityNotes) {
      await client.query(
        `INSERT INTO model_security_notes (model_id, note_type, title, body, severity)
         VALUES ($1, $2, $3, $4, $5)`,
        [modelId, note.note_type, note.title, note.body, note.severity]
      );
    }
    counts.security_notes = docs.securityNotes.length;

    if (docs.tutorials && docs.tutorials.length) {
      const existingTutorials = await client.query('SELECT COUNT(*)::int AS count FROM model_tutorials WHERE model_id = $1', [modelId]);
      if (Number(existingTutorials.rows?.[0]?.count || 0) === 0) {
        for (const tutorial of docs.tutorials) {
          await client.query(
            `INSERT INTO model_tutorials (model_id, title, difficulty, url, description, is_video, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [modelId, tutorial.title, tutorial.difficulty, tutorial.url, tutorial.description, tutorial.is_video, tutorial.sort_order]
          );
        }
        counts.tutorials_seeded = docs.tutorials.length;
      } else {
        counts.tutorials_seeded = 0;
      }
    }

    await client.query(
      `UPDATE ai_models
       SET ai_summary = $1::jsonb,
           quick_facts = $2::jsonb,
           compatibility_matrix = $3::jsonb,
           overview_guidance = $4::jsonb,
           playground_config = $5::jsonb,
           description = COALESCE(NULLIF(TRIM(description), ''), NULLIF(TRIM($7), ''), description),
           updated_at = NOW()
       WHERE id = $6`,
      [
        JSON.stringify(docs.aiSummary),
        JSON.stringify({
          ...docs.quickFacts,
          install_time: docs.quickFacts.install_time || '5–15 min',
          install_difficulty: docs.quickFacts.install_difficulty || 'easy',
          python_version: docs.quickFacts.python_version || '3.9+',
          verification_command:
            docs.quickFacts.verification_command ||
            `python -c "print('ok')"`,
        }),
        JSON.stringify(docs.compatibilityMatrix),
        JSON.stringify(docs.overviewGuidance),
        JSON.stringify(docs.playgroundConfig),
        modelId,
        docs.aiSummary?.what || '',
      ]
    );
  });

  return counts;
}

/**
 * Load a model by slug, generate every documentation section, persist it,
 * and return a summary of what was written.
 */
export async function enrichModelDocsBySlug(slug: string) {
  const model = await queryOne(`SELECT * FROM ai_models WHERE slug = $1 LIMIT 1`, [slug]);
  if (!model) {
    throw new Error(`Model not found for slug "${slug}"`);
  }

  const docs = buildModelDocsBundle(model);
  const counts = await persistModelDocs(model.id, docs);

  return {
    model_id: model.id as string,
    slug: model.slug as string,
    name: model.name as string,
    counts,
  };
}

// Re-exported for callers that only need the raw model row lookup.
export async function getModelBySlugForEnrichment(slug: string) {
  return queryOne(`SELECT * FROM ai_models WHERE slug = $1 LIMIT 1`, [slug]);
}

export { query as __query, queryOne as __queryOne };
