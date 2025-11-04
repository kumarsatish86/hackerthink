"use client";

import React, { useState } from 'react';

type Goal = 'job' | 'automate' | 'agency' | 'content' | 'startup';
type Background = 'coder' | 'designer' | 'marketer' | 'student' | 'ops';
type TimeCommitment = '1-2' | '2-4' | '4-6' | '6+';

interface RoadmapDay {
  day: number;
  topic: string;
  tools: string[];
  actions: string[];
  resources?: string[];
}

interface Roadmap {
  title: string;
  description: string;
  focus: string;
  days: RoadmapDay[];
}

const roadmaps: Record<string, Record<string, Record<string, Roadmap>>> = {
  job: {
    coder: {
      '1-2': {
        title: 'AI Engineering Path (30 Days)',
        description: 'Become job-ready for AI engineering roles in 30 days',
        focus: 'Practical AI integration, APIs, and production deployment',
        days: [
          {
            day: 1,
            topic: 'AI Fundamentals',
            tools: ['ChatGPT', 'Claude'],
            actions: ['Learn what AI can and cannot do', 'Test ChatGPT for coding tasks', 'Understand tokens and API costs'],
            resources: ['OpenAI Documentation', 'Anthropic API Docs']
          },
          {
            day: 2,
            topic: 'Prompt Engineering',
            tools: ['ChatGPT', 'Claude'],
            actions: ['Master the prompt formula', 'Practice chain-of-thought prompting', 'Learn few-shot examples'],
          },
          {
            day: 3,
            topic: 'Python AI Libraries',
            tools: ['OpenAI Python SDK', 'LangChain'],
            actions: ['Set up Python environment', 'Install openai package', 'Make your first API call'],
          },
          {
            day: 4,
            topic: 'Building Chatbots',
            tools: ['OpenAI API', 'Streamlit'],
            actions: ['Create a simple chatbot', 'Add memory/context', 'Deploy to Streamlit Cloud'],
          },
          {
            day: 5,
            topic: 'AI Code Assistant Integration',
            tools: ['GitHub Copilot', 'Cursor'],
            actions: ['Set up Copilot', 'Learn keyboard shortcuts', 'Practice pair programming'],
          },
          {
            day: 6,
            topic: 'Vector Databases',
            tools: ['Pinecone', 'Chroma'],
            actions: ['Learn embedding concepts', 'Set up a vector DB', 'Build a simple RAG system'],
          },
          {
            day: 7,
            topic: 'Week 1 Project: Document Q&A',
            tools: ['LangChain', 'OpenAI'],
            actions: ['Build a PDF Q&A system', 'Implement chunking', 'Add source citations'],
          },
          {
            day: 8,
            topic: 'Fine-tuning Basics',
            tools: ['OpenAI Fine-tuning', 'HuggingFace'],
            actions: ['Learn when to fine-tune', 'Prepare training data', 'Understand costs'],
          },
          {
            day: 9,
            topic: 'API Rate Limiting',
            tools: ['OpenAI API', 'Python'],
            actions: ['Implement retry logic', 'Add exponential backoff', 'Handle rate limits gracefully'],
          },
          {
            day: 10,
            topic: 'LangChain Frameworks',
            tools: ['LangChain', 'LangSmith'],
            actions: ['Build chains', 'Add memory', 'Use agents'],
          },
          {
            day: 11,
            topic: 'Streaming Responses',
            tools: ['OpenAI API', 'FastAPI'],
            actions: ['Implement SSE streaming', 'Build real-time chat UI', 'Add typing indicators'],
          },
          {
            day: 12,
            topic: 'Error Handling',
            tools: ['Python', 'OpenAI'],
            actions: ['Handle API errors', 'Add fallback mechanisms', 'Implement logging'],
          },
          {
            day: 13,
            topic: 'Cost Optimization',
            tools: ['OpenAI API', 'Claude API'],
            actions: ['Monitor token usage', 'Implement caching', 'Choose right models'],
          },
          {
            day: 14,
            topic: 'Week 2 Project: AI Agent',
            tools: ['LangChain', 'OpenAI'],
            actions: ['Build autonomous agent', 'Add tool calling', 'Test agent workflows'],
          },
          {
            day: 15,
            topic: 'Production Deployment',
            tools: ['Docker', 'AWS/GCP'],
            actions: ['Containerize your app', 'Set up CI/CD', 'Deploy to cloud'],
          },
          {
            day: 16,
            topic: 'Monitoring & Analytics',
            tools: ['LangSmith', 'OpenTelemetry'],
            actions: ['Add logging', 'Track API calls', 'Monitor costs'],
          },
          {
            day: 17,
            topic: 'Security Best Practices',
            tools: ['OpenAI', 'Python'],
            actions: ['Secure API keys', 'Implement input validation', 'Add rate limiting'],
          },
          {
            day: 18,
            topic: 'Testing AI Applications',
            tools: ['pytest', 'Python'],
            actions: ['Write unit tests', 'Test prompt variations', 'Mock API calls'],
          },
          {
            day: 19,
            topic: 'Advanced RAG',
            tools: ['LangChain', 'Pinecone'],
            actions: ['Implement hybrid search', 'Add reranking', 'Optimize retrieval'],
          },
          {
            day: 20,
            topic: 'Multi-modal AI',
            tools: ['Claude 3', 'GPT-4 Vision'],
            actions: ['Process images', 'Build vision applications', 'Analyze PDFs'],
          },
          {
            day: 21,
            topic: 'Week 3 Project: Full Stack AI App',
            tools: ['Next.js', 'OpenAI'],
            actions: ['Build complete app', 'Add authentication', 'Deploy to production'],
          },
          {
            day: 22,
            topic: 'Agent Orchestration',
            tools: ['LangGraph', 'AutoGPT'],
            actions: ['Build multi-agent systems', 'Implement workflows', 'Handle agent states'],
          },
          {
            day: 23,
            topic: 'Model Selection',
            tools: ['OpenAI', 'Anthropic', 'Google'],
            actions: ['Compare models', 'Test latency', 'Optimize cost/quality'],
          },
          {
            day: 24,
            topic: 'Fine-tuning Workflows',
            tools: ['OpenAI', 'HuggingFace'],
            actions: ['Prepare dataset', 'Run fine-tuning job', 'Evaluate results'],
          },
          {
            day: 25,
            topic: 'API Integration Patterns',
            tools: ['REST', 'GraphQL'],
            actions: ['Design API contracts', 'Version APIs', 'Document endpoints'],
          },
          {
            day: 26,
            topic: 'Performance Optimization',
            tools: ['Python', 'AsyncIO'],
            actions: ['Add async/await', 'Batch requests', 'Cache responses'],
          },
          {
            day: 27,
            topic: 'Ethics & Safety',
            tools: ['AI Models'],
            actions: ['Learn AI safety', 'Add content filters', 'Handle bias'],
          },
          {
            day: 28,
            topic: 'Week 4 Project: Portfolio Piece',
            tools: ['Your Stack'],
            actions: ['Polish your app', 'Write documentation', 'Create demo video'],
          },
          {
            day: 29,
            topic: 'Resume & Portfolio',
            tools: ['GitHub', 'Portfolio Site'],
            actions: ['Update resume', 'Showcase projects', 'Write case studies'],
          },
          {
            day: 30,
            topic: 'Job Search Prep',
            tools: ['LinkedIn', 'Job Boards'],
            actions: ['Research companies', 'Prepare for interviews', 'Practice coding challenges'],
          },
        ],
      },
      '2-4': {
        title: 'Advanced AI Engineering Path (30 Days)',
        description: 'Intensive path to senior AI engineering roles',
        focus: 'Deep technical mastery, systems design, and production excellence',
        days: [
          {
            day: 1,
            topic: 'AI Architecture Patterns',
            tools: ['LangChain', 'LlamaIndex'],
            actions: ['Study system architectures', 'Compare frameworks', 'Design scalable systems'],
          },
          {
            day: 2,
            topic: 'Advanced Prompt Engineering',
            tools: ['OpenAI', 'Claude'],
            actions: ['Master few-shot learning', 'Implement self-consistency', 'Use meta-prompts'],
          },
          {
            day: 3,
            topic: 'Production RAG Systems',
            tools: ['Pinecone', 'Weaviate', 'Qdrant'],
            actions: ['Build production RAG', 'Optimize embeddings', 'Implement hybrid search'],
          },
          {
            day: 4,
            topic: 'Model Evaluation',
            tools: ['LangSmith', 'Weights & Biases'],
            actions: ['Create evaluation datasets', 'Build testing frameworks', 'A/B test models'],
          },
          {
            day: 5,
            topic: 'Cost Optimization Strategies',
            tools: ['OpenAI', 'Anthropic'],
            actions: ['Implement model routing', 'Add caching layers', 'Optimize token usage'],
          },
          {
            day: 6,
            topic: 'Distributed AI Systems',
            tools: ['Ray', 'Celery'],
            actions: ['Set up distributed workers', 'Handle concurrency', 'Scale horizontally'],
          },
          {
            day: 7,
            topic: 'Week 1 Project: Enterprise RAG',
            tools: ['Full Stack'],
            actions: ['Build scalable RAG', 'Add monitoring', 'Deploy to production'],
          },
          {
            day: 8,
            topic: 'Fine-tuning Deep Dive',
            tools: ['OpenAI', 'HuggingFace'],
            actions: ['Prepare large datasets', 'Run fine-tuning', 'Evaluate and iterate'],
          },
          {
            day: 9,
            topic: 'Agent Systems Architecture',
            tools: ['LangGraph', 'AutoGPT'],
            actions: ['Design agent workflows', 'Implement tool calling', 'Handle state management'],
          },
          {
            day: 10,
            topic: 'Multi-modal AI Systems',
            tools: ['GPT-4V', 'Claude 3', 'Gemini'],
            actions: ['Build vision applications', 'Process video', 'Analyze complex media'],
          },
          {
            day: 11,
            topic: 'Advanced API Design',
            tools: ['FastAPI', 'GraphQL'],
            actions: ['Design RESTful APIs', 'Implement GraphQL', 'Add GraphQL subscriptions'],
          },
          {
            day: 12,
            topic: 'Real-time AI Systems',
            tools: ['WebSockets', 'SSE'],
            actions: ['Build streaming APIs', 'Handle concurrent connections', 'Optimize latency'],
          },
          {
            day: 13,
            topic: 'Observability & Monitoring',
            tools: ['LangSmith', 'DataDog'],
            actions: ['Set up comprehensive monitoring', 'Track costs', 'Alert on anomalies'],
          },
          {
            day: 14,
            topic: 'Week 2 Project: Multi-Agent System',
            tools: ['Full Stack'],
            actions: ['Build agent orchestration', 'Handle complex workflows', 'Deploy and monitor'],
          },
          {
            day: 15,
            topic: 'LLM Security',
            tools: ['AI Models'],
            actions: ['Learn prompt injection', 'Implement safeguards', 'Test vulnerabilities'],
          },
          {
            day: 16,
            topic: 'Optimization Techniques',
            tools: ['Python', 'C++'],
            actions: ['Profile code', 'Optimize bottlenecks', 'Use compiled extensions'],
          },
          {
            day: 17,
            topic: 'Advanced Caching',
            tools: ['Redis', 'Memcached'],
            actions: ['Implement semantic caching', 'Cache embeddings', 'Invalidation strategies'],
          },
          {
            day: 18,
            topic: 'Model Serving',
            tools: ['vLLM', 'TensorRT'],
            actions: ['Serve models locally', 'Optimize inference', 'Handle batching'],
          },
          {
            day: 19,
            topic: 'Advanced Testing',
            tools: ['pytest', 'Locust'],
            actions: ['Write comprehensive tests', 'Load test systems', 'Chaos engineering'],
          },
          {
            day: 20,
            topic: 'Week 3 Project: Production Platform',
            tools: ['Full Stack'],
            actions: ['Build AI platform', 'Add multi-tenancy', 'Scale to production'],
          },
          {
            day: 21,
            topic: 'MLOps for LLMs',
            tools: ['MLflow', 'Kubeflow'],
            actions: ['Set up MLOps pipelines', 'Version models', 'Automate deployment'],
          },
          {
            day: 22,
            topic: 'Advanced Embeddings',
            tools: ['OpenAI', 'Cohere'],
            actions: ['Fine-tune embeddings', 'Optimize retrieval', 'Compare models'],
          },
          {
            day: 23,
            topic: 'Custom Models',
            tools: ['Llama', 'Mistral'],
            actions: ['Deploy open models', 'Fine-tune locally', 'Optimize for hardware'],
          },
          {
            day: 24,
            topic: 'Edge AI Deployment',
            tools: ['ONNX', 'TensorFlow Lite'],
            actions: ['Convert models', 'Optimize for edge', 'Deploy to devices'],
          },
          {
            day: 25,
            topic: 'Advanced Observability',
            tools: ['OpenTelemetry', 'Prometheus'],
            actions: ['Add distributed tracing', 'Monitor performance', 'Set up dashboards'],
          },
          {
            day: 26,
            topic: 'Compliance & Governance',
            tools: ['AI Systems'],
            actions: ['Learn GDPR requirements', 'Implement audit logs', 'Add compliance checks'],
          },
          {
            day: 27,
            topic: 'Advanced Security',
            tools: ['Security Tools'],
            actions: ['Penetration testing', 'Security audits', 'Vulnerability scanning'],
          },
          {
            day: 28,
            topic: 'Week 4 Project: Capstone',
            tools: ['Your Choice'],
            actions: ['Build impressive project', 'Write technical blog', 'Open source it'],
          },
          {
            day: 29,
            topic: 'System Design Interviews',
            tools: ['Study Materials'],
            actions: ['Practice system design', 'Study AI system patterns', 'Mock interviews'],
          },
          {
            day: 30,
            topic: 'Career Strategy',
            tools: ['LinkedIn', 'Network'],
            actions: ['Update portfolio', 'Reach out to hiring managers', 'Apply to target companies'],
          },
        ],
      },
      '4-6': {
        title: 'Expert AI Engineering Path (30 Days)',
        description: 'Fast-track to becoming an AI engineering expert',
        focus: 'Deep research, production systems, and thought leadership',
        days: [
          {
            day: 1,
            topic: 'Cutting-Edge Research',
            tools: ['Research Papers'],
            actions: ['Read latest papers', 'Understand new architectures', 'Follow research trends'],
          },
          {
            day: 2,
            topic: 'Custom Model Training',
            tools: ['PyTorch', 'Transformers'],
            actions: ['Train from scratch', 'Implement architectures', 'Optimize training'],
          },
          {
            day: 3,
            topic: 'Production-Grade Systems',
            tools: ['Full Stack'],
            actions: ['Design at scale', 'Handle millions of requests', 'Optimize for cost'],
          },
          {
            day: 4,
            topic: 'Advanced Prompting',
            tools: ['Research', 'Experimentation'],
            actions: ['Develop new techniques', 'Test novel approaches', 'Document findings'],
          },
          {
            day: 5,
            topic: 'Model Optimization',
            tools: ['Quantization', 'Pruning'],
            actions: ['Quantize models', 'Reduce model size', 'Maintain quality'],
          },
          {
            day: 6,
            topic: 'Advanced RAG Research',
            tools: ['Latest Papers'],
            actions: ['Study retrieval techniques', 'Implement novel methods', 'Compare approaches'],
          },
          {
            day: 7,
            topic: 'Week 1 Project: Research Implementation',
            tools: ['Full Stack'],
            actions: ['Implement research paper', 'Build and evaluate', 'Publish results'],
          },
          {
            day: 8,
            topic: 'Multi-Modal Research',
            tools: ['Vision Models'],
            actions: ['Study vision-language models', 'Implement systems', 'Push boundaries'],
          },
          {
            day: 9,
            topic: 'Agent Research',
            tools: ['AutoGPT', 'LangGraph'],
            actions: ['Study agent architectures', 'Build novel agents', 'Test capabilities'],
          },
          {
            day: 10,
            topic: 'Efficiency Research',
            tools: ['Models'],
            actions: ['Study efficient models', 'Compare architectures', 'Optimize trade-offs'],
          },
          {
            day: 11,
            topic: 'Production Excellence',
            tools: ['Infrastructure'],
            actions: ['Build bulletproof systems', 'Handle edge cases', 'Achieve 99.9% uptime'],
          },
          {
            day: 12,
            topic: 'Advanced Monitoring',
            tools: ['Observability Stack'],
            actions: ['Implement full observability', 'Predict issues', 'Auto-remediate'],
          },
          {
            day: 13,
            topic: 'Cost Optimization Mastery',
            tools: ['All Models'],
            actions: ['Optimize every aspect', 'Reduce costs by 90%', 'Maintain quality'],
          },
          {
            day: 14,
            topic: 'Week 2 Project: Production System',
            tools: ['Enterprise Stack'],
            actions: ['Build at scale', 'Handle complexity', 'Deploy confidently'],
          },
          {
            day: 15,
            topic: 'Open Source Contribution',
            tools: ['GitHub'],
            actions: ['Contribute to major projects', 'Fix bugs', 'Add features'],
          },
          {
            day: 16,
            topic: 'Technical Writing',
            tools: ['Blog', 'Documentation'],
            actions: ['Write technical posts', 'Share learnings', 'Build authority'],
          },
          {
            day: 17,
            topic: 'Speaking & Teaching',
            tools: ['Conferences', 'Courses'],
            actions: ['Submit talks', 'Teach workshops', 'Share knowledge'],
          },
          {
            day: 18,
            topic: 'Research Implementation',
            tools: ['Research Papers'],
            actions: ['Reproduce papers', 'Validate findings', 'Extend research'],
          },
          {
            day: 19,
            topic: 'Advanced Security',
            tools: ['Security Research'],
            actions: ['Study vulnerabilities', 'Develop defenses', 'Share findings'],
          },
          {
            day: 20,
            topic: 'Week 3 Project: Innovation',
            tools: ['Full Stack'],
            actions: ['Build novel system', 'Push boundaries', 'Create value'],
          },
          {
            day: 21,
            topic: 'Industry Leadership',
            tools: ['Network', 'Platforms'],
            actions: ['Build reputation', 'Help others', 'Lead initiatives'],
          },
          {
            day: 22,
            topic: 'Advanced Architecture',
            tools: ['System Design'],
            actions: ['Design complex systems', 'Handle scale', 'Optimize architecture'],
          },
          {
            day: 23,
            topic: 'Performance Mastery',
            tools: ['All Tools'],
            actions: ['Optimize everything', 'Achieve perfection', 'Document techniques'],
          },
          {
            day: 24,
            topic: 'Future Tech Research',
            tools: ['Emerging Tech'],
            actions: ['Study future trends', 'Experiment early', 'Stay ahead'],
          },
          {
            day: 25,
            topic: 'Advanced MLOps',
            tools: ['MLOps Stack'],
            actions: ['Master MLOps', 'Automate everything', 'Scale operations'],
          },
          {
            day: 26,
            topic: 'Team Leadership',
            tools: ['Management'],
            actions: ['Mentor others', 'Build teams', 'Drive strategy'],
          },
          {
            day: 27,
            topic: 'Strategic Thinking',
            tools: ['Business'],
            actions: ['Understand business', 'Align tech with goals', 'Create value'],
          },
          {
            day: 28,
            topic: 'Week 4 Project: Masterpiece',
            tools: ['Everything'],
            actions: ['Build impressive project', 'Share widely', 'Create impact'],
          },
          {
            day: 29,
            topic: 'Portfolio Curation',
            tools: ['Portfolio'],
            actions: ['Showcase best work', 'Tell stories', 'Demonstrate value'],
          },
          {
            day: 30,
            topic: 'Career Acceleration',
            tools: ['Network', 'Strategy'],
            actions: ['Target dream roles', 'Negotiate offers', 'Accelerate growth'],
          },
        ],
      },
      '6+': {
        title: 'Elite AI Engineering Path (30 Days)',
        description: 'Intensive path to AI engineering mastery',
        focus: 'Research, production excellence, and industry leadership',
        days: [
          {
            day: 1,
            topic: 'Research Deep Dive',
            tools: ['Papers', 'Repositories'],
            actions: ['Read 10+ papers', 'Understand state-of-the-art', 'Identify opportunities'],
          },
          {
            day: 2,
            topic: 'Implement Research',
            tools: ['Code'],
            actions: ['Reproduce 2 papers', 'Validate results', 'Optimize implementations'],
          },
          {
            day: 3,
            topic: 'Production Systems',
            tools: ['Full Stack'],
            actions: ['Design at enterprise scale', 'Handle complexity', 'Optimize performance'],
          },
          {
            day: 4,
            topic: 'Advanced Techniques',
            tools: ['All Techniques'],
            actions: ['Master advanced methods', 'Combine techniques', 'Create innovations'],
          },
          {
            day: 5,
            topic: 'Open Source Impact',
            tools: ['GitHub'],
            actions: ['Major contributions', 'Lead projects', 'Build community'],
          },
          {
            day: 6,
            topic: 'Thought Leadership',
            tools: ['Content'],
            actions: ['Publish widely', 'Build audience', 'Share insights'],
          },
          {
            day: 7,
            topic: 'Week 1: Foundation',
            tools: ['All'],
            actions: ['Establish expertise', 'Build reputation', 'Create value'],
          },
          {
            day: 8,
            topic: 'Deep Research',
            tools: ['Research'],
            actions: ['Study cutting-edge', 'Identify gaps', 'Plan contributions'],
          },
          {
            day: 9,
            topic: 'Production Mastery',
            tools: ['Infrastructure'],
            actions: ['Build at scale', 'Handle anything', 'Optimize everything'],
          },
          {
            day: 10,
            topic: 'Innovation',
            tools: ['Creativity'],
            actions: ['Create new methods', 'Solve hard problems', 'Push boundaries'],
          },
          {
            day: 11,
            topic: 'Teaching & Mentoring',
            tools: ['Education'],
            actions: ['Teach others', 'Build courses', 'Help community'],
          },
          {
            day: 12,
            topic: 'Industry Impact',
            tools: ['Network'],
            actions: ['Connect with leaders', 'Share knowledge', 'Drive change'],
          },
          {
            day: 13,
            topic: 'Technical Excellence',
            tools: ['All'],
            actions: ['Achieve perfection', 'Set standards', 'Inspire others'],
          },
          {
            day: 14,
            topic: 'Week 2: Growth',
            tools: ['All'],
            actions: ['Accelerate learning', 'Expand impact', 'Build network'],
          },
          {
            day: 15,
            topic: 'Advanced Research',
            tools: ['Research'],
            actions: ['Contribute to field', 'Publish findings', 'Push boundaries'],
          },
          {
            day: 16,
            topic: 'System Design Excellence',
            tools: ['Architecture'],
            actions: ['Design perfect systems', 'Handle scale', 'Optimize architecture'],
          },
          {
            day: 17,
            topic: 'Performance Mastery',
            tools: ['Optimization'],
            actions: ['Optimize everything', 'Achieve perfection', 'Document techniques'],
          },
          {
            day: 18,
            topic: 'Security Excellence',
            tools: ['Security'],
            actions: ['Master security', 'Find vulnerabilities', 'Build defenses'],
          },
          {
            day: 19,
            topic: 'Leadership',
            tools: ['Management'],
            actions: ['Lead teams', 'Drive strategy', 'Create impact'],
          },
          {
            day: 20,
            topic: 'Week 3: Mastery',
            tools: ['All'],
            actions: ['Achieve mastery', 'Build reputation', 'Create value'],
          },
          {
            day: 21,
            topic: 'Research Contribution',
            tools: ['Research'],
            actions: ['Contribute to field', 'Publish papers', 'Share findings'],
          },
          {
            day: 22,
            topic: 'Production Excellence',
            tools: ['Infrastructure'],
            actions: ['Build best systems', 'Handle everything', 'Optimize perfectly'],
          },
          {
            day: 23,
            topic: 'Innovation Leadership',
            tools: ['Innovation'],
            actions: ['Create new methods', 'Solve hard problems', 'Drive change'],
          },
          {
            day: 24,
            topic: 'Community Building',
            tools: ['Community'],
            actions: ['Build communities', 'Organize events', 'Help others'],
          },
          {
            day: 25,
            topic: 'Strategic Impact',
            tools: ['Strategy'],
            actions: ['Drive strategy', 'Align technology', 'Create value'],
          },
          {
            day: 26,
            topic: 'Thought Leadership',
            tools: ['Content'],
            actions: ['Publish widely', 'Build audience', 'Share insights'],
          },
          {
            day: 27,
            topic: 'Technical Excellence',
            tools: ['All'],
            actions: ['Achieve perfection', 'Set standards', 'Inspire others'],
          },
          {
            day: 28,
            topic: 'Week 4: Impact',
            tools: ['All'],
            actions: ['Create impact', 'Build legacy', 'Inspire others'],
          },
          {
            day: 29,
            topic: 'Portfolio Excellence',
            tools: ['Portfolio'],
            actions: ['Showcase best work', 'Tell compelling stories', 'Demonstrate value'],
          },
          {
            day: 30,
            topic: 'Career Domination',
            tools: ['Career'],
            actions: ['Target elite roles', 'Negotiate best offers', 'Accelerate growth'],
          },
        ],
      },
    },
    // Add other background options...
  },
  // Add other goal options (automate, agency, content, startup)...
};

// Simplified roadmaps for demo - in production, would have full branching logic
const generateRoadmap = (
  goal: Goal,
  background: Background,
  time: TimeCommitment
): Roadmap => {
  const goalRoadmaps = roadmaps[goal];
  if (!goalRoadmaps) {
    // Return default roadmap
    return {
      title: 'AI Learning Roadmap (30 Days)',
      description: 'Your personalized AI learning path',
      focus: 'Core AI skills and practical applications',
      days: [],
    };
  }

  const backgroundRoadmaps = goalRoadmaps[background];
  if (!backgroundRoadmaps) {
    return {
      title: 'AI Learning Roadmap (30 Days)',
      description: 'Your personalized AI learning path',
      focus: 'Core AI skills and practical applications',
      days: [],
    };
  }

  const timeRoadmap = backgroundRoadmaps[time];
  if (!timeRoadmap) {
    return {
      title: 'AI Learning Roadmap (30 Days)',
      description: 'Your personalized AI learning path',
      focus: 'Core AI skills and practical applications',
      days: [],
    };
  }

  return timeRoadmap;
};

export function AIRoadmapBuilder() {
  const [step, setStep] = useState<'goal' | 'background' | 'time' | 'roadmap'>('goal');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [background, setBackground] = useState<Background | null>(null);
  const [time, setTime] = useState<TimeCommitment | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);

  const handleGoalSelect = (selectedGoal: Goal) => {
    setGoal(selectedGoal);
    setStep('background');
  };

  const handleBackgroundSelect = (selectedBackground: Background) => {
    setBackground(selectedBackground);
    setStep('time');
  };

  const handleTimeSelect = (selectedTime: TimeCommitment) => {
    setTime(selectedTime);
    if (goal && background) {
      const generated = generateRoadmap(goal, background, selectedTime);
      setRoadmap(generated);
      setStep('roadmap');
    }
  };

  const reset = () => {
    setStep('goal');
    setGoal(null);
    setBackground(null);
    setTime(null);
    setRoadmap(null);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#4338CA" strokeWidth="2" fill="none"/>
          <path d="M2 17L12 22L22 17" stroke="#4338CA" strokeWidth="2" fill="none"/>
          <path d="M2 12L12 17L22 12" stroke="#4338CA" strokeWidth="2" fill="none"/>
        </svg>
        AI Roadmap Builder
      </h2>

      <p className="text-gray-600 mb-6">
        Answer 3 simple questions to get your personalized 30-day AI learning roadmap. 
        Find out which AI skills you should learn based on your goals, background, and available time.
      </p>

      {/* Step 1: Goal Selection */}
      {step === 'goal' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">Step 1 of 3: What's your goal?</h3>
              <span className="text-sm text-gray-500">Question 1/3</span>
            </div>
            <p className="text-gray-600">What do you want to achieve with AI?</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { value: 'job', label: 'Get a Job', icon: '💼', desc: 'Land an AI-related position' },
              { value: 'automate', label: 'Automate Work', icon: '⚙️', desc: 'Save time with AI automation' },
              { value: 'agency', label: 'Start Agency', icon: '🚀', desc: 'Build an AI services business' },
              { value: 'content', label: 'Create Content', icon: '📝', desc: 'Enhance content creation' },
              { value: 'startup', label: 'Build Startup', icon: '🏢', desc: 'Launch an AI-powered product' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleGoalSelect(option.value as Goal)}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{option.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Background Selection */}
      {step === 'background' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">Step 2 of 3: What's your background?</h3>
              <span className="text-sm text-gray-500">Question 2/3</span>
            </div>
            <p className="text-gray-600">What field do you currently work in?</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { value: 'coder', label: 'Coder/Developer', icon: '💻', desc: 'Software development background' },
              { value: 'designer', label: 'Designer', icon: '🎨', desc: 'Design and creative work' },
              { value: 'marketer', label: 'Marketer', icon: '📢', desc: 'Marketing and advertising' },
              { value: 'student', label: 'Student', icon: '📚', desc: 'Currently studying' },
              { value: 'ops', label: 'Ops/Infra', icon: '🔧', desc: 'Operations and infrastructure' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleBackgroundSelect(option.value as Background)}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{option.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('goal')}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Step 3: Time Commitment */}
      {step === 'time' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">Step 3 of 3: How much time per day?</h3>
              <span className="text-sm text-gray-500">Question 3/3</span>
            </div>
            <p className="text-gray-600">How many hours can you dedicate daily?</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { value: '1-2', label: '1-2 hours', icon: '🌱', desc: 'Beginner friendly pace' },
              { value: '2-4', label: '2-4 hours', icon: '🚀', desc: 'Moderate intensity' },
              { value: '4-6', label: '4-6 hours', icon: '⚡', desc: 'Fast-paced learning' },
              { value: '6+', label: '6+ hours', icon: '🔥', desc: 'Intensive bootcamp style' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleTimeSelect(option.value as TimeCommitment)}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{option.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep('background')}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Step 4: Roadmap Display */}
      {step === 'roadmap' && roadmap && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{roadmap.title}</h3>
            <p className="text-gray-600 mb-2">{roadmap.description}</p>
            <p className="text-sm text-blue-600 font-medium">Focus: {roadmap.focus}</p>
          </div>

          {/* Lead Magnet CTA */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 mb-6 text-white">
            <h4 className="text-xl font-bold mb-2">🚀 Get the Full 90-Day Roadmap PDF</h4>
            <p className="mb-4 text-blue-100">
              Want a deeper dive? Get our comprehensive 90-day roadmap with additional resources, 
              advanced projects, and exclusive tips sent directly to your email.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get PDF →
              </button>
            </div>
            <p className="text-xs text-blue-100 mt-2">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>

          {/* Roadmap Days */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {roadmap.days.map((day) => (
              <div key={day.day} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Day {day.day}
                  </span>
                  <h4 className="font-bold text-gray-900">{day.topic}</h4>
                </div>
                
                {day.tools.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-gray-700">Tools: </span>
                    <span className="text-sm text-gray-600">{day.tools.join(', ')}</span>
                  </div>
                )}
                
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {day.actions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
                
                {day.resources && day.resources.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm font-semibold text-gray-700">Resources: </span>
                    <span className="text-sm text-blue-600">{day.resources.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <button
              onClick={reset}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AIRoadmapBuilderInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Why Use the AI Roadmap Builder?</h2>
        <p className="text-gray-700 text-lg">
          With AI transforming every industry, knowing which skills to learn can be overwhelming. 
          Our AI Roadmap Builder creates a personalized learning path based on your specific goals, 
          background, and available time. Stop feeling lost—start building the AI skills that matter 
          for your career.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">How It Works</h2>
        <ol className="list-decimal pl-6 text-gray-700 space-y-2 text-lg">
          <li><strong>Answer 3 Simple Questions</strong> - Tell us your goal, background, and time commitment</li>
          <li><strong>Get Your Personalized Roadmap</strong> - Receive a 30-day learning plan tailored to you</li>
          <li><strong>Follow Daily Actions</strong> - Each day has specific topics, tools, and actionable steps</li>
          <li><strong>Upgrade to 90-Day PDF</strong> - Get the full roadmap with extra resources via email</li>
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">What You'll Learn</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🎯 Practical Skills</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Prompt engineering</li>
              <li>• AI tool integration</li>
              <li>• API usage and optimization</li>
              <li>• Real-world project building</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🛠️ Tools & Platforms</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• ChatGPT, Claude, Gemini</li>
              <li>• LangChain and frameworks</li>
              <li>• API integration techniques</li>
              <li>• Production deployment</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">💼 Career Skills</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Portfolio projects</li>
              <li>• Resume optimization</li>
              <li>• Interview preparation</li>
              <li>• Industry best practices</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🚀 Advanced Topics</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• RAG systems</li>
              <li>• Fine-tuning models</li>
              <li>• Agent development</li>
              <li>• Production systems</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Why This Matters</h2>
        <p className="text-gray-700 text-lg mb-3">
          AI is transforming every industry. The professionals who learn AI skills now will have a 
          significant advantage. Whether you want to:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Land a high-paying AI engineering job</li>
          <li>Automate repetitive work tasks</li>
          <li>Start an AI services agency</li>
          <li>Enhance your content creation</li>
          <li>Build an AI-powered startup</li>
        </ul>
        <p className="text-gray-700 text-lg mt-4">
          Our roadmap builder gives you a clear, actionable path to achieve your goals. No more 
          feeling overwhelmed—just follow the daily steps and build real skills.
        </p>
      </section>
    </>
  );
}

export default AIRoadmapBuilder;

