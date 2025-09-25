import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OpenAIConfig } from '../types/config';

interface OpenAIStore {
  config: OpenAIConfig;
  updateConfig: (config: Partial<OpenAIConfig>) => void;
}

const defaultConfig: OpenAIConfig = {
  apiKey: '',
  endpoint: 'https://api.openai.com/v1',
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1,
  stream: true,
};

// Ensure the config has all required fields
const migrateConfig = (config: any): OpenAIConfig => {
  return {
    apiKey: config.apiKey || '',
    endpoint: config.endpoint || 'https://api.openai.com/v1',
    apiEndpoint: config.apiEndpoint,
    model: config.model || 'gpt-4o',
    temperature: config.temperature ?? 0.7,
    maxTokens: config.maxTokens || 4096,
    topP: config.topP ?? 1,
    stream: config.stream ?? true,
  };
};

export const useOpenAIStore = create<OpenAIStore>()(
  persist(
    (set) => ({
      config: defaultConfig,
      updateConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig },
        })),
    }),
    {
      name: 'openai-config',
      version: 1,
      migrate: (persistedState: any) => {
        // Migrate from old versions or fix missing fields
        if (persistedState && persistedState.config) {
          persistedState.config = migrateConfig(persistedState.config);
        }
        return persistedState;
      },
    }
  )
);