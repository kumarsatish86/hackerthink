interface EnrichmentData {
  name: string;
  description: string;
  model_type?: string;
  parameters?: string;
  capabilities?: string[];
}

interface EnrichmentResult {
  ideal_hardware?: string;
  risk_score?: number;
  comparison_notes?: string;
  use_cases?: string[];
  suggested_tags?: string[];
  tutorial_links?: Array<{ title: string; url: string }>;
  community_links?: Array<{ platform: string; url: string }>;
}

export class AIEnrichmentService {
  /**
   * Generate ideal hardware requirements based on model parameters
   */
  generateIdealHardware(parameters: string, modelType: string): string {
    const paramMatch = parameters.match(/(\d+(?:\.\d+)?)\s*([km]?b|parameters)/i);
    const paramNum = paramMatch ? parseFloat(paramMatch[1]) : 0;
    const unit = paramMatch?.[2]?.toLowerCase() || '';

    let scale = 1;
    if (unit === 'b') scale = 1;
    else if (unit === 'kb') scale = 1000;
    else if (unit === 'mb') scale = 1000000;

    const totalParams = paramNum * scale;

    if (totalParams > 1000000000) {
      return 'High-end GPU (A100, H100) or TPU with 80GB+ VRAM, Multiple GPUs recommended';
    } else if (totalParams > 100000000) {
      return 'High-end GPU (A100, RTX 4090) with 40GB+ VRAM';
    } else if (totalParams > 10000000) {
      return 'Modern GPU (RTX 3080/4080) with 16GB+ VRAM';
    } else if (totalParams > 1000000) {
      return 'Mid-range GPU (RTX 3060/4060) with 8GB+ VRAM';
    } else {
      return 'Standard GPU (GTX 1660 or better) with 6GB+ VRAM, CPU fallback possible';
    }
  }

  /**
   * Calculate risk score based on various factors
   */
  calculateRiskScore(item: EnrichmentData): number {
    let riskScore = 50; // Base score

    // Model type risk
    if (item.model_type === 'LLM' && parseInt(item.parameters || '0') > 70) {
      riskScore += 20; // Large language models carry more risk
    }

    // Complexity risk
    if (item.capabilities && item.capabilities.length > 5) {
      riskScore += 10; // Highly complex models
    }

    // Parameter-based risk
    const paramMatch = item.parameters?.match(/(\d+)/);
    const params = paramMatch ? parseInt(paramMatch[1]) : 0;
    if (params > 100) {
      riskScore += 15; // Very large models
    }

    // Cap to 0-100
    return Math.max(0, Math.min(100, riskScore));
  }

  /**
   * Generate use cases from description
   */
  generateUseCases(description: string): string[] {
    const useCases: string[] = [];
    
    const keywords = {
      'text generation': ['generates text', 'text generation', 'writes'],
      'translation': ['translate', 'translation', 'language'],
      'sentiment analysis': ['sentiment', 'emotion', 'feeling'],
      'image classification': ['classify images', 'image recognition'],
      'object detection': ['detect objects', 'object detection'],
      'question answering': ['answer questions', 'qa', 'q&a'],
      'summarization': ['summarize', 'summary'],
      'code generation': ['generate code', 'programming'],
      'chatbot': ['chat', 'conversation', 'dialogue'],
      'recommendation': ['recommend', 'recommendation']
    };

    const desc = description.toLowerCase();
    Object.entries(keywords).forEach(([useCase, terms]) => {
      if (terms.some(term => desc.includes(term))) {
        useCases.push(useCase);
      }
    });

    return useCases.length > 0 ? useCases : ['General purpose'];
  }

  /**
   * Generate comparison notes by finding similar models
   */
  generateComparisonNotes(name: string, modelType: string): string {
    const templates: { [key: string]: string } = {
      'GPT': 'Competes with OpenAI GPT models, offers alternative API access',
      'BERT': 'Similar to Google BERT, bidirectional understanding, good for classification',
      'ResNet': 'CNN architecture like VGG, efficient for image tasks',
      'T5': 'Text-to-text transfer transformer, versatile for NLP tasks',
      'Stable Diffusion': 'Diffusion model for image generation, open-source alternative'
    };

    for (const [key, note] of Object.entries(templates)) {
      if (name.includes(key)) {
        return note;
      }
    }

    return `A ${modelType} model that may be compared with similar architectures in its category`;
  }

  /**
   * Generate tutorial links based on model type
   */
  generateTutorialLinks(name: string, modelType: string): Array<{ title: string; url: string }> {
    const links: Array<{ title: string; url: string }> = [];
    
    // Generate HuggingFace links
    links.push({
      title: 'HuggingFace Model Card',
      url: `https://huggingface.co/docs/transformers/model_doc/${name.toLowerCase()}`
    });

    // Add common tutorial sources
    if (modelType === 'LLM' || modelType === 'NLP') {
      links.push({
        title: 'HuggingFace NLP Course',
        url: 'https://huggingface.co/learn/nlp-course'
      });
    }

    return links;
  }

  /**
   * Generate community links
   */
  generateCommunityLinks(name: string): Array<{ platform: string; url: string }> {
    return [
      {
        platform: 'HuggingFace Discussion',
        url: `https://huggingface.co/${name}/discussions`
      },
      {
        platform: 'GitHub Issues',
        url: `https://github.com/search?q=${encodeURIComponent(name)}`
      }
    ];
  }

  /**
   * Main enrichment method
   */
  async enrich(item: EnrichmentData): Promise<EnrichmentResult> {
    const result: EnrichmentResult = {};

    // Generate ideal hardware
    if (item.parameters) {
      result.ideal_hardware = this.generateIdealHardware(item.parameters, item.model_type || 'general');
    }

    // Calculate risk score
    result.risk_score = this.calculateRiskScore(item);

    // Generate use cases
    result.use_cases = this.generateUseCases(item.description);

    // Generate comparison notes
    result.comparison_notes = this.generateComparisonNotes(item.name, item.model_type || 'general');

    // Generate tutorial links
    result.tutorial_links = this.generateTutorialLinks(item.name, item.model_type || 'general');

    // Generate community links
    result.community_links = this.generateCommunityLinks(item.name);

    // Generate tags
    result.suggested_tags = this.generateTags(item);

    return result;
  }

  /**
   * Generate tags from metadata
   */
  private generateTags(item: EnrichmentData): string[] {
    const tags = [];
    if (item.model_type) tags.push(item.model_type);
    if (item.capabilities) tags.push(...item.capabilities);
    return tags.filter((t, i, arr) => arr.indexOf(t) === i).slice(0, 10);
  }
}

