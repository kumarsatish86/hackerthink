/** HuggingFace-aligned filter taxonomy for model discovery */

export const HF_TASK_GROUPS: Array<{
  id: string;
  label: string;
  tasks: Array<{ id: string; label: string; icon: string }>;
}> = [
  {
    id: 'multimodal',
    label: 'Multimodal',
    tasks: [
      { id: 'any-to-any', label: 'Any-to-Any', icon: '🔀' },
      { id: 'audio-text-to-text', label: 'Audio-Text-to-Text', icon: '🎧' },
      { id: 'image-text-to-text', label: 'Image-Text-to-Text', icon: '🖼️' },
      { id: 'visual-question-answering', label: 'Visual Question Answering', icon: '👁️' },
      { id: 'document-question-answering', label: 'Document Question Answering', icon: '📑' },
      { id: 'video-text-to-text', label: 'Video-Text-to-Text', icon: '🎬' },
      { id: 'visual-document-retrieval', label: 'Visual Document Retrieval', icon: '📚' },
    ],
  },
  {
    id: 'computer-vision',
    label: 'Computer Vision',
    tasks: [
      { id: 'depth-estimation', label: 'Depth Estimation', icon: '📐' },
      { id: 'image-classification', label: 'Image Classification', icon: '🏷️' },
      { id: 'object-detection', label: 'Object Detection', icon: '📦' },
      { id: 'image-segmentation', label: 'Image Segmentation', icon: '✂️' },
      { id: 'text-to-image', label: 'Text-to-Image', icon: '🎨' },
      { id: 'image-to-text', label: 'Image-to-Text', icon: '📝' },
      { id: 'image-to-image', label: 'Image-to-Image', icon: '🔁' },
      { id: 'image-to-video', label: 'Image-to-Video', icon: '🎞️' },
      { id: 'unconditional-image-generation', label: 'Unconditional Image Generation', icon: '✨' },
      { id: 'video-classification', label: 'Video Classification', icon: '📹' },
      { id: 'text-to-video', label: 'Text-to-Video', icon: '🎥' },
      { id: 'zero-shot-image-classification', label: 'Zero-Shot Image Classification', icon: '🎯' },
      { id: 'mask-generation', label: 'Mask Generation', icon: '🎭' },
      { id: 'zero-shot-object-detection', label: 'Zero-Shot Object Detection', icon: '🔍' },
      { id: 'text-to-3d', label: 'Text-to-3D', icon: '🧊' },
      { id: 'image-to-3d', label: 'Image-to-3D', icon: '🗿' },
      { id: 'image-feature-extraction', label: 'Image Feature Extraction', icon: '🧬' },
      { id: 'keypoint-detection', label: 'Keypoint Detection', icon: '📍' },
    ],
  },
  {
    id: 'nlp',
    label: 'Natural Language Processing',
    tasks: [
      { id: 'text-classification', label: 'Text Classification', icon: '🏷️' },
      { id: 'token-classification', label: 'Token Classification', icon: '🔤' },
      { id: 'table-question-answering', label: 'Table Question Answering', icon: '📊' },
      { id: 'question-answering', label: 'Question Answering', icon: '❓' },
      { id: 'zero-shot-classification', label: 'Zero-Shot Classification', icon: '🎯' },
      { id: 'translation', label: 'Translation', icon: '🌐' },
      { id: 'summarization', label: 'Summarization', icon: '📄' },
      { id: 'feature-extraction', label: 'Feature Extraction', icon: '🔗' },
      { id: 'text-generation', label: 'Text Generation', icon: '💬' },
      { id: 'text2text-generation', label: 'Text2Text Generation', icon: '↪️' },
      { id: 'fill-mask', label: 'Fill-Mask', icon: '🧩' },
      { id: 'sentence-similarity', label: 'Sentence Similarity', icon: '📐' },
    ],
  },
  {
    id: 'audio',
    label: 'Audio',
    tasks: [
      { id: 'text-to-speech', label: 'Text-to-Speech', icon: '🔊' },
      { id: 'text-to-audio', label: 'Text-to-Audio', icon: '🎵' },
      { id: 'automatic-speech-recognition', label: 'Automatic Speech Recognition', icon: '🎤' },
      { id: 'audio-to-audio', label: 'Audio-to-Audio', icon: '🔁' },
      { id: 'audio-classification', label: 'Audio Classification', icon: '🎧' },
      { id: 'voice-activity-detection', label: 'Voice Activity Detection', icon: '📢' },
    ],
  },
  {
    id: 'tabular',
    label: 'Tabular',
    tasks: [
      { id: 'tabular-classification', label: 'Tabular Classification', icon: '📋' },
      { id: 'tabular-regression', label: 'Tabular Regression', icon: '📈' },
      { id: 'time-series-forecasting', label: 'Time Series Forecasting', icon: '⏱️' },
    ],
  },
  {
    id: 'reinforcement-learning',
    label: 'Reinforcement Learning',
    tasks: [
      { id: 'reinforcement-learning', label: 'Reinforcement Learning', icon: '🕹️' },
      { id: 'robotics', label: 'Robotics', icon: '🤖' },
    ],
  },
];

export const HF_LIBRARIES = [
  'pytorch',
  'tensorflow',
  'jax',
  'transformers',
  'diffusers',
  'sentence-transformers',
  'timm',
  'gguf',
  'mlx',
  'safetensors',
  'peft',
  'onnx',
  'keras',
  'flax',
  'stable-baselines3',
  'adapters',
];

export const HF_MODEL_TREE = [
  { id: 'base_model', label: 'Base' },
  { id: 'adapter', label: 'Adapters' },
  { id: 'finetune', label: 'Finetunes' },
  { id: 'quantized', label: 'Quantizations' },
  { id: 'merge', label: 'Merges' },
];

export const HF_APPS = [
  'llama.cpp',
  'lmstudio',
  'ollama',
  'vllm',
  'jan',
  'mlx-lm',
  'text-generation-inference',
  'diffusionbee',
  'invokeai',
  'comfyui',
  'autobots',
  'openvino',
];

export const HF_PROVIDERS = [
  'groq',
  'together',
  'fireworks-ai',
  'novita',
  'cerebras',
  'nscale',
  'fal',
  'replicate',
  'sambanova',
  'hyperbolic',
  'nebius',
  'deepinfra',
];

export const HF_MISC = [
  'endpoints_compatible',
  'eval-results',
  'custom_code',
  '4-bit',
  '8-bit',
  'carbon_emissions',
  'region:us',
  'doi',
];

export const HF_LANGUAGE_CODES = [
  'en', 'zh', 'multilingual', 'es', 'fr', 'de', 'ja', 'ko', 'ru', 'ar', 'hi', 'pt', 'it', 'nl', 'tr', 'vi', 'th', 'id', 'pl', 'sv',
];

export type HfFilterFacets = {
  tasks: string[];
  libraries: string[];
  languages: string[];
  licenses: string[];
  model_tree: string[];
  apps: string[];
  providers: string[];
  misc: string[];
};

const ALL_TASK_IDS = new Set(HF_TASK_GROUPS.flatMap((g) => g.tasks.map((t) => t.id)));

function normalizeTag(tag: string): string {
  return String(tag || '').trim().toLowerCase();
}

/** Classify HuggingFace tags into filter facets used by the models sidebar */
export function classifyHuggingFaceTags(
  tags: string[] = [],
  extras: { pipeline_tag?: string; library_name?: string; license?: string } = {}
): HfFilterFacets {
  const facets: HfFilterFacets = {
    tasks: [],
    libraries: [],
    languages: [],
    licenses: [],
    model_tree: [],
    apps: [],
    providers: [],
    misc: [],
  };

  const pushUnique = (list: string[], value: string) => {
    const v = normalizeTag(value);
    if (v && !list.includes(v)) list.push(v);
  };

  if (extras.pipeline_tag) pushUnique(facets.tasks, extras.pipeline_tag);
  if (extras.library_name) pushUnique(facets.libraries, extras.library_name);
  if (extras.license) pushUnique(facets.licenses, extras.license);

  for (const raw of tags) {
    const tag = normalizeTag(raw);
    if (!tag) continue;

    if (tag.startsWith('license:')) {
      pushUnique(facets.licenses, tag.replace(/^license:/, ''));
      continue;
    }
    if (tag.startsWith('language:') || tag.startsWith('lang:')) {
      pushUnique(facets.languages, tag.split(':')[1]);
      continue;
    }
    if (HF_LANGUAGE_CODES.includes(tag) || /^[a-z]{2}$/.test(tag) || tag === 'multilingual') {
      pushUnique(facets.languages, tag);
      continue;
    }
    if (ALL_TASK_IDS.has(tag) || tag.includes('generation') || tag.includes('classification')) {
      pushUnique(facets.tasks, tag);
    }
    if (HF_LIBRARIES.includes(tag)) {
      pushUnique(facets.libraries, tag);
    }
    if (tag.includes('base_model') || tag === 'base') {
      pushUnique(facets.model_tree, 'base_model');
    }
    if (tag.includes('adapter') || tag === 'lora' || tag === 'peft') {
      pushUnique(facets.model_tree, 'adapter');
    }
    if (tag.includes('finetune') || tag.includes('fine-tune')) {
      pushUnique(facets.model_tree, 'finetune');
    }
    if (tag.includes('quant') || tag.includes('gguf') || tag.includes('4bit') || tag.includes('8bit') || tag.includes('gptq') || tag.includes('awq')) {
      pushUnique(facets.model_tree, 'quantized');
    }
    if (tag.includes('merge')) {
      pushUnique(facets.model_tree, 'merge');
    }
    if (HF_APPS.some((a) => tag.includes(a) || a.includes(tag))) {
      const app = HF_APPS.find((a) => tag.includes(a) || a.includes(tag));
      if (app) pushUnique(facets.apps, app);
    }
    if (HF_PROVIDERS.some((p) => tag.includes(p))) {
      const provider = HF_PROVIDERS.find((p) => tag.includes(p));
      if (provider) pushUnique(facets.providers, provider);
    }
    if (
      HF_MISC.some((m) => tag.includes(m.replace('_', '-')) || tag.includes(m)) ||
      tag.includes('4-bit') ||
      tag.includes('8-bit') ||
      tag.includes('custom_code') ||
      tag.includes('eval')
    ) {
      if (tag.includes('4-bit') || tag.includes('4bit')) pushUnique(facets.misc, '4-bit');
      else if (tag.includes('8-bit') || tag.includes('8bit')) pushUnique(facets.misc, '8-bit');
      else if (tag.includes('custom_code')) pushUnique(facets.misc, 'custom_code');
      else if (tag.includes('eval')) pushUnique(facets.misc, 'eval-results');
      else if (tag.includes('endpoint')) pushUnique(facets.misc, 'endpoints_compatible');
      else if (tag.includes('carbon')) pushUnique(facets.misc, 'carbon_emissions');
    }
  }

  return facets;
}

export function flattenFacets(facets: HfFilterFacets): string[] {
  return Array.from(
    new Set([
      ...facets.tasks,
      ...facets.libraries,
      ...facets.languages,
      ...facets.licenses,
      ...facets.model_tree,
      ...facets.apps,
      ...facets.providers,
      ...facets.misc,
    ])
  );
}
