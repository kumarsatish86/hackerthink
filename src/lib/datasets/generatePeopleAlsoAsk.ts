import type { DatasetCore, DatasetFaq } from '@/types/datasets';
import { estimateStorageRam, commercialFriendly } from './estimateHardware';

export function generatePeopleAlsoAsk(dataset: DatasetCore): DatasetFaq[] {
  const hw = estimateStorageRam(dataset);
  const name = dataset.name;
  return [
    {
      id: 'paa-what',
      question: `What is ${name}?`,
      answer: `${name} is an AI dataset${dataset.provider ? ` from ${dataset.provider}` : ''} for ${dataset.dataset_type || dataset.modality || 'ML tasks'}.`,
    },
    {
      id: 'paa-download',
      question: `How do I download ${name}?`,
      answer: `Use the Download Center for official, Hugging Face, Kaggle, or cloud mirrors when available.`,
    },
    {
      id: 'paa-license',
      question: `Can I use ${name} commercially?`,
      answer: commercialFriendly(dataset)
        ? `License (${dataset.license || 'listed'}) appears commercial-friendly — still verify redistribution terms.`
        : `Review ${dataset.license || 'the license'} carefully before commercial use.`,
    },
    {
      id: 'paa-size',
      question: `How much storage does ${name} need?`,
      answer: `Plan for about ${hw.storage} on disk and ${hw.ram} RAM when loading (estimates when official figures are missing).`,
    },
    {
      id: 'paa-models',
      question: `Which models use ${name}?`,
      answer: `See Models Using This Dataset for linked foundation and fine-tuned models on HackerThink.`,
    },
    {
      id: 'paa-alt',
      question: `What are alternatives to ${name}?`,
      answer: `Open Comparison for peer datasets with similar tasks, licenses, and scale.`,
    },
  ];
}
