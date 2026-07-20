import type { ModelCore } from '@/types/models';
import { toStringArray } from './arrayUtils';

/**
 * Deterministic 100–150 word summary when description / ai_summary is empty.
 */
export function generateModelSummary(model: ModelCore): string {
  const name = model.name || 'This model';
  const developer = model.developer || 'its publisher';
  const task = model.task || model.model_type || 'general AI';
  const architecture = model.architecture || model.framework || 'a modern neural architecture';
  const params = model.parameters || (model.param_count_b != null ? `${model.param_count_b}B parameters` : null);
  const license = model.license || 'its published license';
  const useCases = toStringArray(model.use_cases).slice(0, 3);
  const strengths = [
    ...(model.ai_summary?.advantages || []),
    ...(model.overview_guidance?.strengths || []),
  ].slice(0, 2);
  const languages = toStringArray(model.languages).slice(0, 3);

  const purpose =
    model.ai_summary?.what ||
    `${name} is an AI model focused on ${task}, published by ${developer}.`;

  const archLine = params
    ? `It uses ${architecture} with approximately ${params}.`
    : `It is built around ${architecture}.`;

  const useLine =
    useCases.length > 0
      ? `Best-fit use cases include ${useCases.join(', ')}.`
      : `It is commonly applied to ${task} workflows in production and research.`;

  const userLine =
    model.ai_summary?.who ||
    `Target users include ML engineers, applied researchers, and product teams shipping ${task} features.`;

  const strengthLine =
    strengths.length > 0
      ? `Key strengths: ${strengths.join('; ')}.`
      : `Strengths typically include strong ${task} quality relative to similarly sized open models.`;

  const langLine =
    languages.length > 0 ? ` Language coverage includes ${languages.join(', ')}.` : '';

  const licenseLine = `Released under ${license}, which should be reviewed before commercial deployment.`;

  const parts = [purpose, archLine, useLine, userLine, strengthLine + langLine, licenseLine];
  let text = parts.join(' ').replace(/\s+/g, ' ').trim();

  // Soft length band ~100–150 words
  const words = text.split(/\s+/);
  if (words.length < 100) {
    text += ` Teams evaluating ${name} should consider hardware requirements, latency targets, and whether a smaller or larger peer better matches their accuracy and cost constraints. Documentation, install guides, and benchmarks on this page help decide readiness for production.`;
  }
  const trimmed = text.split(/\s+/).slice(0, 150).join(' ');
  return trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
}

export function resolveModelDescription(model: ModelCore): string {
  const fromSummary = model.ai_summary?.what?.trim();
  if (fromSummary && fromSummary.length > 40) return fromSummary;
  const desc = (model.full_description || model.description || '').trim();
  if (desc && !/^no description available$/i.test(desc)) return desc;
  return generateModelSummary(model);
}
