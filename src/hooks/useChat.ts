import { useState, useCallback, useRef } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAgentStore } from '../stores/agentStore';
import { useOpenAIStore } from '../stores/openaiStore';
import { getOpenAIService } from '../services/openai';
import type { ChatMessage } from '../types/chat';

export function useChat(roomId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [streamingAgentId, setStreamingAgentId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { addMessage, updateMessage, getCurrentRoom } = useChatStore();
  const { getAgent } = useAgentStore();
  const { config } = useOpenAIStore();

  const room = getCurrentRoom();

  const sendMessage = useCallback(async (content: string) => {
    if (!room || !content.trim()) return;

    // Add user message
    addMessage(roomId, {
      roomId,
      content: content.trim(),
      role: 'user',
    });

    // Get active agents for this room
    const activeAgentIds = room.activeAgents;
    if (activeAgentIds.length === 0) {
      console.warn('No active agents in this room');
      return;
    }

    setIsLoading(true);

    try {
      const openAI = getOpenAIService(config);

      // Get conversation history
      const messages: ChatMessage[] = room.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add the new user message to the context
      messages.push({
        role: 'user',
        content: content.trim(),
      });

      // Get the number of discussion rounds (default to 3 if not set)
      const discussionRounds = room.discussionRounds ?? 3;
      const useRandomOrder = room.randomOrder ?? false;

      // Helper function to shuffle array with constraints
      const shuffleWithConstraints = (array: string[], lastAgentId: string | null): string[] => {
        const shuffled = [...array];

        // Fisher-Yates shuffle
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // If there's a constraint about the last speaker from previous round
        if (lastAgentId && shuffled[0] === lastAgentId && shuffled.length > 1) {
          // Swap the first agent with a random other agent
          const swapIndex = Math.floor(Math.random() * (shuffled.length - 1)) + 1;
          [shuffled[0], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[0]];
        }

        return shuffled;
      };

      let lastRoundLastAgent: string | null = null;

      // Process multiple rounds of discussion
      for (let round = 0; round < discussionRounds; round++) {
        // Determine agent order for this round
        let roundAgentIds: string[];

        if (useRandomOrder) {
          // Randomize order with constraint
          roundAgentIds = shuffleWithConstraints(activeAgentIds, lastRoundLastAgent);
        } else {
          // Use original order
          roundAgentIds = activeAgentIds;
        }

        // Process each agent's response in this round
        for (let agentIndex = 0; agentIndex < roundAgentIds.length; agentIndex++) {
          const agentId = roundAgentIds[agentIndex];
          const agent = getAgent(agentId);
          if (!agent || !agent.isActive) continue;

          setStreamingAgentId(agentId);

          // Add empty message for streaming
          const messageId = addMessage(roomId, {
            roomId,
            content: '',
            role: 'assistant',
            agentId,
          });

          if (config.stream) {
            // Streaming response
            let fullContent = '';

            try {
              for await (const chunk of openAI.streamMessage(messages, agent)) {
                fullContent += chunk;

                // Update message with accumulated content
                updateMessage(roomId, messageId, fullContent);
              }
            } catch (error) {
              console.error(`Error streaming response from ${agent.name}:`, error);
              updateMessage(roomId, messageId, `Error: Failed to get response from ${agent.name}`);
            }

            // Add agent's response to the conversation context for next agent
            // Convert agent name to API-compatible format (only letters, numbers, underscore, hyphen)
            const apiCompatibleName = agent.name.replace(/[^a-zA-Z0-9_-]/g, '_');
            messages.push({
              role: 'assistant',
              content: fullContent,
              name: apiCompatibleName,
            });
          } else {
            // Non-streaming response
            try {
              const response = await openAI.sendMessage(messages, agent);
              updateMessage(roomId, messageId, response);

              // Add to context for next agent
              // Convert agent name to API-compatible format (only letters, numbers, underscore, hyphen)
              const apiCompatibleName = agent.name.replace(/[^a-zA-Z0-9_-]/g, '_');
              messages.push({
                role: 'assistant',
                content: response,
                name: apiCompatibleName,
              });
            } catch (error) {
              console.error(`Error getting response from ${agent.name}:`, error);
              updateMessage(roomId, messageId, `Error: Failed to get response from ${agent.name}`);
            }
          }

          setStreamingAgentId(null);

          // Add a small delay between agents for better UX
          await new Promise(resolve => setTimeout(resolve, 500));

          // Track the last agent of this round
          if (agentIndex === roundAgentIds.length - 1) {
            lastRoundLastAgent = agentId;
          }
        }

        // Add a slightly longer delay between rounds
        if (round < discussionRounds - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('Error in chat:', error);
    } finally {
      setIsLoading(false);
      setStreamingAgentId(null);
    }
  }, [room, roomId, addMessage, updateMessage, getAgent, config]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setStreamingAgentId(null);
  }, []);

  return {
    sendMessage,
    stopStreaming,
    isLoading,
    streamingAgentId,
  };
}