import type { ChatMessage } from '../types/chat';
import type { Agent } from '../types/agent';
import type { OpenAIConfig } from '../types/config';

function getApiUrl(endpoint: string): string {
  // Log the incoming endpoint for debugging
  console.log('getApiUrl - Input endpoint:', endpoint);

  // Check if endpoint already includes /chat/completions
  const needsCompletionsPath = !endpoint.includes('/chat/completions');
  const completionsPath = needsCompletionsPath ? '/chat/completions' : '';

  // Always use direct connection - pure frontend
  const finalUrl = `${endpoint}${completionsPath}`;
  console.log('getApiUrl - Final URL:', finalUrl);

  return finalUrl;
}

export async function testConnection(config: OpenAIConfig): Promise<boolean> {
  try {
    const apiUrl = getApiUrl(config.endpoint);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    await response.json();
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

export interface OpenAIStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export class OpenAIService {
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    console.log('OpenAIService constructor - Initializing with config:', config);
    this.config = config;
  }

  updateConfig(config: OpenAIConfig) {
    console.log('OpenAIService.updateConfig - Old config:', this.config);
    console.log('OpenAIService.updateConfig - New config:', config);
    this.config = { ...config }; // Make a copy to ensure it's updated
  }

  /**
   * Send a non-streaming chat completion request
   */
  async sendMessage(
    messages: ChatMessage[],
    agent?: Agent
  ): Promise<string> {
    const systemMessage = agent ? {
      role: 'system' as const,
      content: agent.systemPrompt
    } : null;

    const requestMessages = systemMessage
      ? [systemMessage, ...messages]
      : messages;

    const apiUrl = getApiUrl(this.config.endpoint);
    console.log('OpenAI Service - Non-stream request to:', apiUrl);
    console.log('OpenAI Service - Using endpoint:', this.config.endpoint);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: requestMessages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Send a streaming chat completion request
   */
  async *streamMessage(
    messages: ChatMessage[],
    agent?: Agent,
    onChunk?: (chunk: string) => void
  ): AsyncGenerator<string, void, unknown> {
    const systemMessage = agent ? {
      role: 'system' as const,
      content: agent.systemPrompt
    } : null;

    const requestMessages = systemMessage
      ? [systemMessage, ...messages]
      : messages;

    const apiUrl = getApiUrl(this.config.endpoint);
    console.log('OpenAI Service - Stream request to:', apiUrl);
    console.log('OpenAI Service - Using endpoint:', this.config.endpoint);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: requestMessages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed: OpenAIStreamResponse = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;

            if (content) {
              if (onChunk) {
                onChunk(content);
              }
              yield content;
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  }

  /**
   * Test the connection to OpenAI API
   */
  async testConnection(): Promise<boolean> {
    try {
      const apiUrl = getApiUrl(this.config.endpoint);
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Don't use singleton - create new instance each time to ensure correct config
export function getOpenAIService(config: OpenAIConfig): OpenAIService {
  console.log('getOpenAIService - Creating service with config:', config);
  console.log('getOpenAIService - Endpoint:', config.endpoint);

  // Always create a new instance to ensure we use the latest config
  return new OpenAIService(config);
}

// Export a function to reset the service (useful for testing or config changes)
export function resetOpenAIService(): void {
  // No longer needed since we don't use singleton
}