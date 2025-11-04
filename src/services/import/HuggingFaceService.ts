interface HuggingFaceModel {
  id: string;
  modelId: string;
  author: string;
  downloads: number;
  likes: number;
  tags: string[];
  pipeline_tag: string;
  library_name?: string;
  task?: string;
}

interface ImportResult {
  name: string;
  slug: string;
  developer: string;
  description: string;
  model_type: string;
  github_url: string;
  huggingface_url: string;
  download_count: number;
  categories: string[];
  tags: string[];
  metadata: any;
  files?: { filename: string; size?: number }[];
  benchmarks?: any;
  license_text?: string | null;
  // Extracted technical details
  parameters?: string;
  architecture?: string;
  context_length?: number;
  license?: string;
  full_description?: string;
  // Additional HF data
  safetensors?: {
    model_size?: string;
    tensor_type?: string;
    files?: any[];
  };
  model_tree?: {
    finetunes?: number;
    merges?: number;
    quantizations?: number;
  };
  spaces_using?: Array<{ name: string; url: string }>;
  links?: {
    homepage?: string;
    api?: string;
    github?: string;
    modelscope?: string;
    contact?: string;
  };
  coding_benchmarks?: any;
  intelligence_benchmarks?: any;
  // New technical fields
  tokenizer?: string;
  vocabulary_size?: number;
  training_framework?: string;
  quantized_versions?: string[];
  training_data_sources?: any[];
  detailed_metadata?: any;
}

export class HuggingFaceService {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async fetchModel(modelId: string): Promise<ImportResult> {
    try {
      // Fetch model card from HuggingFace
      console.log(`[HF] Starting fetch for model: ${modelId}`);
      const response = await fetch(`https://huggingface.co/api/models/${modelId}`, {
        headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[HF] API error response:`, errorText);
        throw new Error(`Failed to fetch model: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      console.log(`[HF] Successfully fetched API response for: ${modelId}`);

      console.log(`[HF] Fetching model: ${modelId}`);
      console.log(`[HF] API Response keys:`, Object.keys(data));

      // Try to fetch model-index/README/license raw content when available
      let licenseText: string | null = null;
      let files: { filename: string; size?: number }[] = [];
      let benchmarks: any = undefined;
      let readmeMd: string | null = null;
      let configs: Record<string, any> = {};
      let spacesUsing: Array<{ name: string; url: string }> = []; // Declare in outer scope

      try {
        if (Array.isArray(data.siblings)) {
          files = data.siblings.map((s: any) => ({ filename: s.rfilename, size: s.size }));
          console.log(`[HF] Found ${files.length} files in model`);
        }
        if (data.modelIndex || data.model_index) {
          benchmarks = data.modelIndex || data.model_index;
        }

        // Fetch additional data from HF API endpoints
        
        // Try to fetch spaces using this model - try multiple endpoints
        try {
          // Try the spaces endpoint
          const spacesResp = await fetch(`https://huggingface.co/api/models/${modelId}/spaces`, {
            headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
          });
          if (spacesResp.ok) {
            const spacesData = await spacesResp.json();
            if (Array.isArray(spacesData)) {
              spacesUsing = spacesData.slice(0, 50).map((s: any) => ({
                name: s.id || s.name || s.repository || '',
                url: `https://huggingface.co/spaces/${s.id || s.name || s.repository}`
              }));
              console.log(`[HF] Found ${spacesUsing.length} spaces via API`);
            } else if (typeof spacesData === 'object' && spacesData.spaces) {
              // Handle nested response
              spacesUsing = (spacesData.spaces || []).slice(0, 50).map((s: any) => ({
                name: s.id || s.name || '',
                url: `https://huggingface.co/spaces/${s.id || s.name}`
              }));
              console.log(`[HF] Found ${spacesUsing.length} spaces via nested API`);
            }
          }
        } catch (e) {
          console.log(`[HF] Could not fetch spaces via API, will try README parsing:`, e);
        }
        if (data.cardData?.license) {
          licenseText = data.cardData.license;
        }
        
        // Try to extract license from multiple sources
        if (!licenseText && data.card_data?.license) {
          licenseText = data.card_data.license;
        }
        if (!licenseText && data.license) {
          licenseText = data.license;
        }

        // README.md raw
        try {
          const readmeResp = await fetch(`https://huggingface.co/${modelId}/raw/README.md`, {
            headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
          });
          if (readmeResp.ok) {
            const md = await readmeResp.text();
            if (md && md.trim().length > 0) {
              readmeMd = md;
              console.log(`[HF] README.md fetched (${md.length} chars)`);
            }
          }
        } catch (e) {
          console.log(`[HF] Could not fetch README.md:`, e);
        }

        // Try to fetch common config files if they exist
        const tryJson = async (path: string) => {
          try {
            const r = await fetch(`https://huggingface.co/${modelId}/raw/${path}`, {
              headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
            });
            if (r.ok) {
              const jsonData = await r.json();
              console.log(`[HF] Successfully fetched ${path}`);
              return jsonData;
            }
          } catch (e) {
            // Silently fail - file might not exist
          }
          return undefined;
        };
        
        // Try main directory first
        configs['config.json'] = await tryJson('config.json');
        configs['tokenizer_config.json'] = await tryJson('tokenizer_config.json');
        configs['generation_config.json'] = await tryJson('generation_config.json');
        
        // If config.json not found in root, try common subdirectories
        if (!configs['config.json'] && files.length > 0) {
          // Check if config might be in a subdirectory
          const configFile = files.find(f => f.filename.includes('config.json'));
          if (configFile) {
            configs['config.json'] = await tryJson(configFile.filename);
          }
        }
      } catch (e) {
        console.error(`[HF] Error fetching additional files:`, e);
      }

      // Extract technical details from multiple sources
      const config = configs['config.json'] || {};
      const generationConfig = configs['generation_config.json'] || {};
      const tokenizerConfig = configs['tokenizer_config.json'] || {};
      
      // Initialize all variables to avoid undefined errors
      let parameters: string | undefined = undefined;
      let architecture: string | undefined = undefined;
      let contextLength: number | undefined = undefined;
      let license: string | undefined = undefined;
      
      // Initialize additional extraction variables
      let safetensorsInfo: any = {};
      let links: any = {};
      let modelTreeInfo: any = {};
      let codingBenchmarks: any = null;
      let intelligenceBenchmarks: any = null;
      
      // Extract tokenizer and vocabulary info
      let tokenizer: string | undefined = undefined;
      let vocabularySize: number | undefined = undefined;
      let trainingFramework: string | undefined = undefined;
      let quantizedVersions: string[] = [];
      let trainingDataSources: any[] = [];
      
      // Method 1: Extract parameters from config.json
      
      // Try num_parameters from config
      if (config.num_parameters) {
        const numParams = typeof config.num_parameters === 'number' 
          ? config.num_parameters 
          : parseInt(String(config.num_parameters || '0').replace(/,/g, ''));
        if (numParams >= 1e9) {
          parameters = `${(numParams / 1e9).toFixed(1)}B`;
        } else if (numParams >= 1e6) {
          parameters = `${(numParams / 1e6).toFixed(1)}M`;
        } else if (numParams >= 1e3) {
          parameters = `${(numParams / 1e3).toFixed(1)}K`;
        } else if (numParams > 0) {
          parameters = numParams.toString();
        }
      } 
      // Try estimation from config dimensions
      else if (config.vocab_size && config.hidden_size && config.num_hidden_layers) {
        // Rough estimate: vocab_size * hidden_size * num_layers
        const estimate = config.vocab_size * config.hidden_size * config.num_hidden_layers;
        if (estimate >= 1e9) {
          parameters = `~${(estimate / 1e9).toFixed(1)}B`;
        } else if (estimate >= 1e6) {
          parameters = `~${(estimate / 1e6).toFixed(1)}M`;
        }
      }
      // Method 2: Try to extract from model name/ID (e.g., "gpt2-large" -> "774M", "bert-base" -> "110M")
      if (!parameters && modelId) {
        const paramMatch = modelId.match(/\b(\d+(?:\.\d+)?)[bB]\b/);
        if (paramMatch) {
          parameters = paramMatch[1] + 'B';
        } else {
          // Common model size patterns
          const sizePatterns: Record<string, string> = {
            'base': '110M', 'small': '60M', 'tiny': '5M',
            'large': '340M', 'xl': '1.5B', 'xxl': '11B'
          };
          for (const [pattern, size] of Object.entries(sizePatterns)) {
            if (modelId.toLowerCase().includes(pattern)) {
              parameters = size;
              break;
            }
          }
        }
      }
      // Method 3: Try to extract from README.md using regex
      if (!parameters && readmeMd) {
        const paramPatterns = [
          /(\d+(?:\.\d+)?)\s*[bB]illion\s*parameters?/i,
          /(\d+(?:\.\d+)?)\s*[bB]\s*parameters?/i,
          /(\d+(?:\.\d+)?)\s*[mM]illion\s*parameters?/i,
          /parameters?[:\s]+(\d+(?:\.\d+)?)\s*[bB]/i,
          /parameters?[:\s]+(\d+(?:\.\d+)?)\s*[mM]/i
        ];
        for (const pattern of paramPatterns) {
          const match = readmeMd.match(pattern);
          if (match) {
            const num = parseFloat(match[1]);
            if (pattern.source.includes('[bB]')) {
              parameters = `${num}B`;
            } else {
              parameters = `${num}M`;
            }
            break;
          }
        }
      }

      // Extract architecture from multiple sources
      architecture = config.architectures?.[0] || 
                     config.model_type || 
                     data.model_type ||
                     data.pipeline_tag ||
                     undefined;

      // Extract context length from multiple sources
      contextLength = config.max_position_embeddings || 
                     config.max_seq_len ||
                     generationConfig.max_new_tokens ||
                     config.n_positions ||
                     config.max_length ||
                     undefined;

      // Try to extract context length from README
      if (!contextLength && readmeMd) {
        const ctxPatterns = [
          /context\s*length[:\s]+(\d+)/i,
          /max\s*(?:sequence\s*)?length[:\s]+(\d+)/i,
          /(\d+)\s*tokens?\s*context/i
        ];
        for (const pattern of ctxPatterns) {
          const match = readmeMd.match(pattern);
          if (match) {
            contextLength = parseInt(match[1]);
            break;
          }
        }
      }

      // Extract license from multiple sources (prefer config, then API, then README)
      license = config.license || 
               data.license || 
               data.cardData?.license ||
               data.card_data?.license ||
               licenseText ||
               undefined;

      // Try to extract license from README if still not found
      if (!license && readmeMd) {
        const licensePattern = /license[:\s]+([A-Za-z0-9\-_\.]+)/i;
        const match = readmeMd.match(licensePattern);
        if (match) {
          license = match[1];
        }
      }

      // Extract tokenizer information
      if (tokenizerConfig.tokenizer_class) {
        tokenizer = tokenizerConfig.tokenizer_class;
      } else if (config.tokenizer_class) {
        tokenizer = config.tokenizer_class;
      } else if (readmeMd) {
        const tokenizerMatch = readmeMd.match(/tokenizer[:\s]+([A-Za-z0-9\-_]+)/i);
        if (tokenizerMatch) {
          tokenizer = tokenizerMatch[1];
        }
      }

      // Extract vocabulary size
      if (tokenizerConfig.vocab_size) {
        vocabularySize = typeof tokenizerConfig.vocab_size === 'number' 
          ? tokenizerConfig.vocab_size 
          : parseInt(String(tokenizerConfig.vocab_size));
      } else if (config.vocab_size) {
        vocabularySize = typeof config.vocab_size === 'number'
          ? config.vocab_size
          : parseInt(String(config.vocab_size));
      } else if (readmeMd) {
        const vocabMatch = readmeMd.match(/vocab(?:ulary)?\s*size[:\s]+(\d+)/i);
        if (vocabMatch) {
          vocabularySize = parseInt(vocabMatch[1]);
        }
      }

      // Extract training framework
      if (readmeMd) {
        const frameworkPatterns = [
          /training\s+framework[:\s]+([A-Za-z0-9\s]+)/i,
          /trained\s+with[:\s]+([A-Za-z0-9\s]+)/i,
          /framework[:\s]+(PyTorch|JAX|TensorFlow|PaddlePaddle)/i
        ];
        for (const pattern of frameworkPatterns) {
          const match = readmeMd.match(pattern);
          if (match) {
            trainingFramework = match[1].trim();
            break;
          }
        }
      }
      
      // Default to PyTorch if library_name suggests it
      if (!trainingFramework && data.library_name === 'transformers') {
        trainingFramework = 'PyTorch';
      }

      // Extract quantized versions from files and README
      const quantizedPatterns = ['gguf', 'gptq', 'awq', 'int8', 'int4', 'fp8', 'bf16', 'fp16'];
      files.forEach(file => {
        const filename = file.filename.toLowerCase();
        quantizedPatterns.forEach(pattern => {
          if (filename.includes(pattern) && !quantizedVersions.includes(pattern.toUpperCase())) {
            quantizedVersions.push(pattern.toUpperCase());
          }
        });
      });
      
      if (readmeMd) {
        const quantMatch = readmeMd.match(/quantized\s+versions?[:\s]+([^\n]+)/i);
        if (quantMatch) {
          const mentioned = quantMatch[1].toLowerCase();
          quantizedPatterns.forEach(pattern => {
            if (mentioned.includes(pattern) && !quantizedVersions.includes(pattern.toUpperCase())) {
              quantizedVersions.push(pattern.toUpperCase());
            }
          });
        }
      }

      // Extract training data sources from README
      if (readmeMd) {
        // Look for training data sections
        const trainingSectionMatch = readmeMd.match(/##?\s*training\s+data([\s\S]*?)(?=##|$)/i);
        if (trainingSectionMatch) {
          const trainingSection = trainingSectionMatch[1];
          
          // Extract dataset names
          const datasetPatterns = [
            /dataset[:\s]+([^\n,]+)/gi,
            /trained\s+on[:\s]+([^\n,]+)/gi,
            /\*\s*([^\n]+)\s*\(([\d.]+[TBKM]?)\s*tokens?\)/gi
          ];
          
          datasetPatterns.forEach(pattern => {
            const matches = trainingSection.matchAll(pattern);
            for (const match of matches) {
              const datasetName = match[1]?.trim();
              const tokenCount = match[2] || undefined;
              
              if (datasetName && datasetName.length > 2) {
                trainingDataSources.push({
                  name: datasetName,
                  token_count: tokenCount ? tokenCount.replace(/[^\d.]/g, '') : undefined,
                  source: 'readme'
                });
              }
            }
          });
        }
        
        // Also look for common dataset mentions
        const commonDatasets = ['Common Crawl', 'C4', 'The Pile', 'RedPajama', 'Wikipedia', 'Books', 'StackExchange', 'GitHub'];
        commonDatasets.forEach(dataset => {
          if (readmeMd.includes(dataset) && !trainingDataSources.find(d => d.name === dataset)) {
            trainingDataSources.push({ name: dataset, source: 'readme' });
          }
        });
      }

      // Extract safetensors information from files and README
      safetensorsInfo = {};
      const safetensorFiles = files.filter(f => f.filename.includes('.safetensors'));
      
      // Extract model size - try README first, then config, then files
      if (readmeMd) {
        // Look for "Model size 229B params" or similar patterns
        const sizeMatch = readmeMd.match(/model\s*size[:\s]+(\d+(?:\.\d+)?[bB])\s*params?/i);
        if (sizeMatch) {
          safetensorsInfo.model_size = sizeMatch[1];
        } else if (parameters) {
          safetensorsInfo.model_size = parameters;
        }
        
        // Extract tensor type from README (e.g., "Tensor type F32 BF16 F8_E4M3")
        const tensorTypeMatch = readmeMd.match(/tensor\s*type[:\s]+([A-Z0-9_\s]+)/i);
        if (tensorTypeMatch) {
          safetensorsInfo.tensor_type = tensorTypeMatch[1].trim();
        }
      }
      
      // If not found in README, try to get from files/config
      if (!safetensorsInfo.model_size && parameters) {
        safetensorsInfo.model_size = parameters;
      }
      
      // Extract tensor types from file names if not found in README
      if (!safetensorsInfo.tensor_type && safetensorFiles.length > 0) {
        const tensorTypes: string[] = [];
        safetensorFiles.forEach(file => {
          if (file.filename.includes('fp32') || file.filename.includes('f32')) tensorTypes.push('F32');
          if (file.filename.includes('fp16') || file.filename.includes('f16')) tensorTypes.push('FP16');
          if (file.filename.includes('bf16')) tensorTypes.push('BF16');
          if (file.filename.includes('fp8') || file.filename.includes('f8') || file.filename.includes('e4m3')) tensorTypes.push('F8_E4M3');
          if (file.filename.includes('int8')) tensorTypes.push('INT8');
          if (file.filename.includes('int4')) tensorTypes.push('INT4');
        });
        if (tensorTypes.length > 0) {
          safetensorsInfo.tensor_type = [...new Set(tensorTypes)].join(' ');
        }
      }
      
      if (safetensorFiles.length > 0 || safetensorsInfo.model_size || safetensorsInfo.tensor_type) {
        safetensorsInfo.files = safetensorFiles;
      }

      // Extract links from README and API data
      links = {};
      if (data.github) links.github = data.github;
      if (readmeMd) {
        // Extract homepage - multiple patterns
        const homepagePatterns = [
          /(?:homepage|website|home)[:\s]+(https?:\/\/[^\s\)]+)/i,
          /\[homepage\]\((https?:\/\/[^\)]+)\)/i,
          /href=["'](https?:\/\/[^"']+)["'][^>]*>[\s]*[Hh]omepage/i
        ];
        for (const pattern of homepagePatterns) {
          const match = readmeMd.match(pattern);
          if (match) {
            links.homepage = match[1];
            break;
          }
        }
        
        // Extract API/platform
        const apiPatterns = [
          /(?:api|platform|api\s*platform)[:\s]+(https?:\/\/[^\s\)]+)/i,
          /\[api[^\]]*\]\((https?:\/\/[^\)]+)\)/i
        ];
        for (const pattern of apiPatterns) {
          const match = readmeMd.match(pattern);
          if (match) {
            links.api = match[1];
            break;
          }
        }
        
        // Extract ModelScope
        const modelscopePatterns = [
          /modelscope[:\s]+(https?:\/\/[^\s\)]+)/i,
          /\[modelscope[^\]]*\]\((https?:\/\/[^\)]+)\)/i
        ];
        for (const pattern of modelscopePatterns) {
          const match = readmeMd.match(pattern);
          if (match) {
            links.modelscope = match[1];
            break;
          }
        }
        
        // Extract contact - multiple patterns
        const contactPatterns = [
          /(?:contact|email|wechat|weibo)[:\s]+([^\s\n\)]+)/i,
          /contact[:\s]+(https?:\/\/[^\s\)]+)/i
        ];
        for (const pattern of contactPatterns) {
          const match = readmeMd.match(pattern);
          if (match) {
            links.contact = match[1];
            break;
          }
        }
      }

      // Extract model tree info from README (finetunes, merges, quantizations)
      modelTreeInfo = {};
      if (readmeMd) {
        // Look for model tree section in README - multiple patterns
        // Pattern 1: "Finetunes: 6 models"
        const finetunesMatch = readmeMd.match(/finetunes?[:\s]+(\d+)\s*(?:models?|finetunes?)?/i);
        if (finetunesMatch) {
          modelTreeInfo.finetunes = parseInt(finetunesMatch[1]);
        }
        
        // Pattern 2: "Merges: 1 model"  
        const mergesMatch = readmeMd.match(/merges?[:\s]+(\d+)\s*(?:models?|merges?)?/i);
        if (mergesMatch) {
          modelTreeInfo.merges = parseInt(mergesMatch[1]);
        }
        
        // Pattern 3: "Quantizations: 24 models"
        const quantMatch = readmeMd.match(/quantizations?[:\s]+(\d+)\s*(?:models?|quantizations?)?/i);
        if (quantMatch) {
          modelTreeInfo.quantizations = parseInt(quantMatch[1]);
        }
      }
      
      // Extract spaces from README if not found via API
      if (spacesUsing.length === 0 && readmeMd) {
        // Look for spaces mentioned in README
        const spacesMatch = readmeMd.match(/spaces?\s*(?:using|with)[:\s]+(\d+)/i);
        // Or try to find links to spaces
        const spaceLinks = readmeMd.match(/https?:\/\/huggingface\.co\/spaces\/([^\s\)]+)/g);
        if (spaceLinks) {
          spacesUsing = spaceLinks.slice(0, 50).map((link: string) => {
            const match = link.match(/spaces\/([^\s\)]+)/);
            const name = match ? match[1] : '';
            return {
              name: name,
              url: link
            };
          });
          console.log(`[HF] Found ${spacesUsing.length} spaces from README links`);
        }
      }

      // Parse benchmarks from README - more comprehensive extraction
      codingBenchmarks = null;
      intelligenceBenchmarks = null;
      
      if (readmeMd) {
        // Try to extract Coding & Agentic Benchmarks section
        // Look for section heading followed by content until next major heading
        const codingSectionMatch = readmeMd.match(/##?\s*coding\s*&?\s*agentic\s*benchmarks([\s\S]*?)(?=##|$)/i);
        if (codingSectionMatch) {
          const codingSection = codingSectionMatch[1];
          codingBenchmarks = {};
          
          // Try multiple patterns to extract benchmark data
          // Pattern 1: Table rows with benchmark names and scores
          const tableRows = codingSection.match(/\|\s*([A-Za-z0-9\-_\s]+)\s*\|\s*([\d\.]+)/g);
          if (tableRows) {
            tableRows.forEach(row => {
              const match = row.match(/\|\s*([A-Za-z0-9\-_\s]+)\s*\|\s*([\d\.]+)/);
              if (match) {
                const benchmarkName = match[1].trim().replace(/\s+/g, '_');
                const score = parseFloat(match[2]);
                codingBenchmarks[benchmarkName] = score;
              }
            });
          }
          
          // Pattern 2: Lines with benchmark: score format
          const lines = codingSection.split('\n');
          lines.forEach(line => {
            // Match patterns like "SWE-bench: 69.4" or "SWE-bench Verified: 69.4"
            const match = line.match(/([A-Za-z0-9\-_\s]+(?:bench|test|score|metric))[:\s]+([\d\.]+)/i);
            if (match) {
              const benchmarkName = match[1].trim().replace(/\s+/g, '_');
              const score = parseFloat(match[2]);
              if (!codingBenchmarks[benchmarkName]) {
                codingBenchmarks[benchmarkName] = score;
              }
            }
          });
          
          // If we extracted any benchmarks, log it
          if (Object.keys(codingBenchmarks).length > 0) {
            console.log(`[HF] Extracted ${Object.keys(codingBenchmarks).length} coding benchmarks`);
          }
        }
        
        // Try to extract Intelligence Benchmarks section
        const intelligenceSectionMatch = readmeMd.match(/##?\s*intelligence\s*benchmarks([\s\S]*?)(?=##|$)/i);
        if (intelligenceSectionMatch) {
          const intelligenceSection = intelligenceSectionMatch[1];
          intelligenceBenchmarks = {};
          
          // Same extraction patterns as coding benchmarks
          const tableRows = intelligenceSection.match(/\|\s*([A-Za-z0-9\-_\s]+)\s*\|\s*([\d\.]+)/g);
          if (tableRows) {
            tableRows.forEach(row => {
              const match = row.match(/\|\s*([A-Za-z0-9\-_\s]+)\s*\|\s*([\d\.]+)/);
              if (match) {
                const benchmarkName = match[1].trim().replace(/\s+/g, '_');
                const score = parseFloat(match[2]);
                intelligenceBenchmarks[benchmarkName] = score;
              }
            });
          }
          
          const lines = intelligenceSection.split('\n');
          lines.forEach(line => {
            const match = line.match(/([A-Za-z0-9\-_\s]+(?:bench|test|score|metric|gaia|mmlu))[:\s]+([\d\.]+)/i);
            if (match) {
              const benchmarkName = match[1].trim().replace(/\s+/g, '_');
              const score = parseFloat(match[2]);
              if (!intelligenceBenchmarks[benchmarkName]) {
                intelligenceBenchmarks[benchmarkName] = score;
              }
            }
          });
          
          if (Object.keys(intelligenceBenchmarks).length > 0) {
            console.log(`[HF] Extracted ${Object.keys(intelligenceBenchmarks).length} intelligence benchmarks`);
          }
        }
      }

      // Map HuggingFace data to our schema
      try {
        // Ensure we have a valid model ID
        const modelIdValue = data.modelId || data.id || modelId;
        if (!modelIdValue) {
          throw new Error('No valid model ID found in API response');
        }

      const result: ImportResult = {
          name: modelIdValue,
          slug: modelIdValue.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          developer: data.author || data.model_creator || 'Unknown',
          description: this.extractDescription(data) || '',
          model_type: data.pipeline_tag || data.task || 'general',
        github_url: data.github || null,
          huggingface_url: `https://huggingface.co/${modelIdValue}`,
          download_count: data.downloads || data.download_count || 0,
          categories: Array.isArray(data.tags) ? data.tags : [],
          tags: Array.isArray(data.tags) ? data.tags : [],
        metadata: {
            modelId: data.modelId || modelIdValue,
            downloads: data.downloads || 0,
            likes: data.likes || 0,
            task: data.pipeline_tag || data.task,
          library_name: data.library_name,
          paper: data.model_index,
            license: license || undefined,
            readme: readmeMd || undefined,
            configs: configs || {},
            // Add extracted technical details
            extracted: {
              parameters: parameters || undefined,
              architecture: architecture || undefined,
              context_length: contextLength || undefined,
              version: config.model_type || modelIdValue?.split('/')?.[1] || undefined
            },
            // Add additional HF data
            safetensors: Object.keys(safetensorsInfo || {}).length > 0 ? safetensorsInfo : undefined,
            model_tree: Object.keys(modelTreeInfo || {}).length > 0 ? modelTreeInfo : undefined,
            spaces_using: Array.isArray(spacesUsing) && spacesUsing.length > 0 ? spacesUsing : undefined,
            links: Object.keys(links || {}).length > 0 ? links : undefined,
            coding_benchmarks: codingBenchmarks && Object.keys(codingBenchmarks).length > 0 ? codingBenchmarks : undefined,
            intelligence_benchmarks: intelligenceBenchmarks && Object.keys(intelligenceBenchmarks).length > 0 ? intelligenceBenchmarks : undefined
        },
        files,
        benchmarks,
          license_text: licenseText,
          // Add extracted fields for direct access
          parameters,
          architecture,
          context_length: contextLength ? Number(contextLength) : undefined,
          license,
          full_description: readmeMd || undefined,
          // Add new fields
          safetensors: safetensorsInfo || {},
          model_tree: modelTreeInfo || {},
          spaces_using: spacesUsing || [],
          links: links || {},
          coding_benchmarks: codingBenchmarks || null,
          intelligence_benchmarks: intelligenceBenchmarks || null
        };

        // Add new technical fields to result
        result.tokenizer = tokenizer;
        result.vocabulary_size = vocabularySize;
        result.training_framework = trainingFramework;
        result.quantized_versions = quantizedVersions.length > 0 ? quantizedVersions : undefined;
        result.training_data_sources = trainingDataSources.length > 0 ? trainingDataSources : undefined;

        // Store in detailed_metadata
        result.detailed_metadata = {
          ...(result.detailed_metadata || {}),
          tokenizer: tokenizer || undefined,
          vocabulary_size: vocabularySize || undefined,
          training_framework: trainingFramework || undefined,
          quantized_versions: quantizedVersions.length > 0 ? quantizedVersions : undefined,
          training_data_sources: trainingDataSources.length > 0 ? trainingDataSources : undefined,
          config_files: {
            has_config_json: !!configs['config.json'],
            has_generation_config: !!configs['generation_config.json'],
            has_tokenizer_config: !!configs['tokenizer_config.json']
          }
        };

        console.log('HuggingFace Service - Extracted model data:', {
          modelId,
          extractedFields: {
            parameters: parameters || 'NOT FOUND',
            architecture: architecture || 'NOT FOUND',
            context_length: result.context_length || 'NOT FOUND',
            license: result.license || 'NOT FOUND',
            full_description: result.full_description ? `${result.full_description.length} chars` : 'NOT FOUND'
          },
          sources: {
            hasConfigJson: !!configs['config.json'],
            hasGenerationConfig: !!configs['generation_config.json'],
            hasReadme: !!readmeMd,
            configKeys: Object.keys(configs).filter(k => configs[k]),
            apiDataKeys: Object.keys(data)
          },
          extractionMethods: {
            parameters: parameters ? (config.num_parameters ? 'config.json' : 
                                     modelId.match(/\b(\d+(?:\.\d+)?)[bB]\b/) ? 'model_id' :
                                     'readme') : 'none',
            architecture: architecture ? (config.architectures ? 'config.json' : 'api') : 'none',
            contextLength: contextLength ? (config.max_position_embeddings ? 'config.json' : 
                                            readmeMd ? 'readme' : 'api') : 'none',
            license: license ? (config.license ? 'config.json' : 
                               data.license ? 'api' : 'readme') : 'none'
          }
        });

      return result;
      } catch (resultError) {
        console.error(`[HF] Error creating result object:`, resultError);
        throw new Error(`Failed to create result object: ${(resultError as Error).message}`);
      }
    } catch (error) {
      console.error('Error fetching from HuggingFace:', error);
      throw error;
    }
  }

  async fetchDataset(datasetId: string): Promise<any> {
    try {
      const response = await fetch(`https://huggingface.co/api/datasets/${datasetId}`, {
        headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dataset: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        name: data.id || datasetId,
        slug: datasetId.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        provider: 'HuggingFace',
        description: data.description || '',
        dataset_type: data.task_categories?.[0] || 'general',
        download_url: `https://huggingface.co/datasets/${datasetId}`,
        huggingface_url: `https://huggingface.co/datasets/${datasetId}`,
        download_count: data.downloads || 0,
        categories: data.tags || [],
        tags: data.tags || [],
        metadata: data
      };
    } catch (error) {
      console.error('Error fetching dataset from HuggingFace:', error);
      throw error;
    }
  }

  private extractDescription(data: any): string {
    if (data.modelCardData?.model_description) {
      return data.modelCardData.model_description || '';
    }
    if (data.siblings && Array.isArray(data.siblings)) {
      const readmeSibling = data.siblings.find((s: any) => s.rfilename === 'README.md');
      if (readmeSibling?.content) {
        return readmeSibling.content;
      }
    }
    // Try to get description from other fields
    if (data.description) {
      return data.description;
    }
    if (data.summary) {
      return data.summary;
    }
    return 'No description available';
  }

  async searchTrendingModels(limit: number = 20): Promise<any[]> {
    try {
      const response = await fetch(`https://huggingface.co/api/models?sort=downloads&direction=-1&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trending models');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching trending models:', error);
      throw error;
    }
  }

  async searchTrendingDatasets(limit: number = 20): Promise<any[]> {
    try {
      const response = await fetch(`https://huggingface.co/api/datasets?sort=downloads&direction=-1&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trending datasets');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching trending datasets:', error);
      throw error;
    }
  }
}

