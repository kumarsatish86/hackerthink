import type { ModelCore } from '@/types/models';

export type PaaItem = { id: string; question: string; answer: string };

/** People Also Ask generator when FAQs are empty. */
export function generatePeopleAlsoAsk(model: ModelCore): PaaItem[] {
  const name = model.name;
  const task = model.task || model.model_type || 'general AI';
  const license = model.license || 'the published license';
  const params = model.parameters || (model.param_count_b != null ? `${model.param_count_b}B` : 'its published size');

  return [
    {
      id: 'paa-what',
      question: `What is ${name}?`,
      answer: `${name} is an AI model oriented toward ${task}. Review the Overview and Architecture sections for capabilities and internals.`,
    },
    {
      id: 'paa-install',
      question: `How do I install ${name}?`,
      answer: `Use the Installation section for pip/transformers snippets. Typical entry uses the model id from Hugging Face when available.`,
    },
    {
      id: 'paa-license',
      question: `Can I use ${name} commercially?`,
      answer: `Check ${license}. Commercial use depends on license terms, usage limits, and your compliance review.`,
    },
    {
      id: 'paa-size',
      question: `How large is ${name}?`,
      answer: `${name} is listed at ${params}. Memory/VRAM estimates appear in Quick Stats when parameter metadata is known.`,
    },
    {
      id: 'paa-vs',
      question: `What are alternatives to ${name}?`,
      answer: `See Comparison and Decision Assistant for peer models (smaller, faster, multilingual, or higher accuracy options).`,
    },
    {
      id: 'paa-deploy',
      question: `How do I deploy ${name}?`,
      answer: `Use the Deployment Generator for cloud and container sketches (Docker, FastAPI, major clouds). Validate with your infra standards.`,
    },
  ];
}
