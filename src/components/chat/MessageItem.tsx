import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message } from '../../types/chat';
import type { Agent } from '../../types/agent';
import { User } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  agent?: Agent;
  isStreaming?: boolean;
}

export default function MessageItem({ message, agent, isStreaming }: MessageItemProps) {
  const timestamp = useMemo(() => {
    const date = new Date(message.timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }, [message.timestamp]);

  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          {isUser ? (
            <div className="w-10 h-10 bg-discord-blue rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
          ) : agent ? (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: agent.color }}
            >
              {agent.avatar || agent.name[0]}
            </div>
          ) : (
            <div className="w-10 h-10 bg-discord-hover rounded-full" />
          )}
        </div>

        {/* Message Content */}
        <div className="flex flex-col">
          {/* Name and Timestamp */}
          <div className={`flex items-baseline mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-sm font-medium text-discord-text mr-2">
              {isUser ? 'You' : agent?.name || 'Assistant'}
            </span>
            <span className="text-xs text-discord-muted">{timestamp}</span>
          </div>

          {/* Message Bubble */}
          <div
            className={`
              px-4 py-2 rounded-lg
              ${isUser
                ? 'bg-discord-blue text-white'
                : 'bg-discord-hover text-discord-text'
              }
            `}
          >
            {message.content ? (
              <div className="message-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const inline = !className?.startsWith('language-');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={oneDark as any}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : isStreaming ? (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-discord-gray rounded-full animate-typing" />
                <div className="w-2 h-2 bg-discord-gray rounded-full animate-typing" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-discord-gray rounded-full animate-typing" style={{ animationDelay: '0.4s' }} />
              </div>
            ) : (
              <span className="text-discord-muted italic">Thinking...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}