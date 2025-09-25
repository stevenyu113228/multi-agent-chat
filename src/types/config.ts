export interface OpenAIConfig {
  apiKey: string;
  apiEndpoint?: string;
  endpoint: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  stream: boolean;
}

export interface UIConfig {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
}

export interface Config {
  openai: OpenAIConfig;
  ui: UIConfig;
}

export const DEFAULT_CONFIG: Config = {
  openai: {
    apiKey: '',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    endpoint: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2000,
    stream: true
  },
  ui: {
    theme: 'dark',
    fontSize: 'medium'
  }
};

export const AVAILABLE_MODELS = [
  { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', maxTokens: 128000 },
  { id: 'gpt-4', name: 'GPT-4', maxTokens: 8192 },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 16384 },
  { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K', maxTokens: 16384 }
];