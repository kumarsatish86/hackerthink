import type { ModelCore } from '@/types/models';
import { toStringArray } from './arrayUtils';

export type CapabilityGroupId =
  | 'frameworks'
  | 'languages'
  | 'tasks'
  | 'input'
  | 'output'
  | 'datasets'
  | 'optimizations'
  | 'platforms'
  | 'hardware'
  | 'deployment';

export type CapabilityGroup = {
  id: CapabilityGroupId;
  label: string;
  items: string[];
};

const OPT_PAT = /quant|onnx|tensorrt|openvino|int8|fp16|gguf|awq|gptq|flash.?attn/i;
const PLATFORM_PAT = /linux|windows|macos|android|ios|web|docker|kubernetes/i;
const HARDWARE_PAT = /cuda|gpu|cpu|tpu|npu|apple.?silicon|rocm|metal/i;
const DEPLOY_PAT = /fastapi|flask|vllm|tgi|torchserve|sagemaker|vertex|azure|aws|gcp/i;

export function groupModelCapabilities(model: ModelCore): CapabilityGroup[] {
  const tags = toStringArray(model.tags);
  const caps = toStringArray(model.capabilities);
  const all = [...tags, ...caps];

  const frameworks = [
    model.framework,
    ...all.filter((t) => /pytorch|tensorflow|jax|onnx|transformers|langchain|llama\.cpp/i.test(t)),
  ].filter(Boolean) as string[];

  const languages = toStringArray(model.languages);
  const tasks = [model.task, model.model_type, ...toStringArray(model.use_cases)].filter(Boolean) as string[];
  const input = toStringArray(model.input_types);
  const output = toStringArray(model.output_types);
  const datasets = [
    model.quick_facts?.training_dataset,
    ...all.filter((t) => /dataset|c4|common.?crawl|wikipedia|books/i.test(t)),
  ].filter(Boolean) as string[];

  const optimizations = all.filter((t) => OPT_PAT.test(t));
  const platforms = all.filter((t) => PLATFORM_PAT.test(t));
  const hardware = [
    model.quick_facts?.gpu_requirement,
    model.quick_facts?.cpu_requirement,
    ...all.filter((t) => HARDWARE_PAT.test(t)),
  ].filter(Boolean) as string[];
  const deployment = all.filter((t) => DEPLOY_PAT.test(t));

  const uniq = (arr: string[]) => [...new Set(arr.map((s) => s.trim()).filter(Boolean))];

  return [
    { id: 'frameworks', label: 'Frameworks', items: uniq(frameworks) },
    { id: 'languages', label: 'Languages', items: uniq(languages) },
    { id: 'tasks', label: 'Tasks', items: uniq(tasks) },
    { id: 'input', label: 'Input', items: uniq(input) },
    { id: 'output', label: 'Output', items: uniq(output) },
    { id: 'datasets', label: 'Datasets', items: uniq(datasets) },
    { id: 'optimizations', label: 'Optimizations', items: uniq(optimizations) },
    { id: 'platforms', label: 'Supported Platforms', items: uniq(platforms) },
    { id: 'hardware', label: 'Hardware', items: uniq(hardware) },
    { id: 'deployment', label: 'Deployment', items: uniq(deployment) },
  ].filter((g) => g.items.length > 0);
}
