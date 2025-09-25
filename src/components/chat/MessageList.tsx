import { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import type { Message } from '../../types/chat';
import type { Agent } from '../../types/agent';

interface MessageListProps {
  messages: Message[];
  agents: Agent[];
  streamingAgentId?: string | null;
}

export default function MessageList({ messages, agents, streamingAgentId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-discord-muted">
          <p className="text-lg mb-2">No messages yet</p>
          <p className="text-sm">Start a conversation by typing a message below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const agent = message.agentId
          ? agents.find(a => a.id === message.agentId)
          : undefined;

        return (
          <MessageItem
            key={message.id}
            message={message}
            agent={agent}
            isStreaming={streamingAgentId === message.agentId}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}