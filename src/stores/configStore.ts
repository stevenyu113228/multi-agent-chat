import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Config } from '../types/config';
import { DEFAULT_CONFIG } from '../types/config';

interface ConfigStore {
  config: Config;

  // Config management
  updateOpenAIConfig: (updates: Partial<Config['openai']>) => void;
  updateUIConfig: (updates: Partial<Config['ui']>) => void;
  resetConfig: () => void;

  // Utilities
  isConfigured: () => boolean;
  testConnection: () => Promise<boolean>;
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,

      updateOpenAIConfig: (updates) => {
        set((state) => ({
          config: {
            ...state.config,
            openai: {
              ...state.config.openai,
              ...updates,
            },
          },
        }));
      },

      updateUIConfig: (updates) => {
        set((state) => ({
          config: {
            ...state.config,
            ui: {
              ...state.config.ui,
              ...updates,
            },
          },
        }));
      },

      resetConfig: () => {
        set({ config: DEFAULT_CONFIG });
      },

      isConfigured: () => {
        const { openai } = get().config;
        return !!(openai.apiKey && openai.apiEndpoint);
      },

      testConnection: async () => {
        const { openai } = get().config;

        if (!openai.apiKey) {
          return false;
        }

        try {
          const response = await fetch(openai.apiEndpoint || openai.endpoint || 'https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openai.apiKey}`,
            },
            body: JSON.stringify({
              model: openai.model,
              messages: [{ role: 'user', content: 'test' }],
              max_tokens: 1,
            }),
          });

          return response.ok;
        } catch (error) {
          console.error('Connection test failed:', error);
          return false;
        }
      },
    }),
    {
      name: 'config-storage',
    }
  )
);