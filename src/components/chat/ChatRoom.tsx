import { useState, useEffect, useRef } from 'react';
import { Hash, Send, Square, UserPlus, UserMinus, Info, RefreshCw, Shuffle, Download } from 'lucide-react';
import MessageList from './MessageList';
import { useChat } from '../../hooks/useChat';
import { useChatStore } from '../../stores/chatStore';
import { useAgentStore } from '../../stores/agentStore';
import { exportChatToMarkdown, downloadFile } from '../../utils/export';
import type { ChatRoom as ChatRoomType } from '../../types/chat';

interface ChatRoomProps {
  room: ChatRoomType;
}

export default function ChatRoom({ room }: ChatRoomProps) {
  const [messageInput, setMessageInput] = useState('');
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const [tempRounds, setTempRounds] = useState(room.discussionRounds ?? 3);
  const [tempRandomOrder, setTempRandomOrder] = useState(room.randomOrder ?? false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { sendMessage, isLoading, streamingAgentId, stopStreaming } = useChat(room.id);
  const { addAgentToRoom, removeAgentFromRoom, setRoomDiscussionRounds, setRoomRandomOrder } = useChatStore();
  const { agents } = useAgentStore();

  const activeAgents = agents.filter(agent =>
    room.activeAgents.includes(agent.id) && agent.isActive
  );


  useEffect(() => {
    inputRef.current?.focus();
  }, [room.id]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isLoading) return;

    const message = messageInput;
    setMessageInput('');

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = '44px';
    }

    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    // Shift+Enter will naturally add a line break
  };

  // Auto-resize textarea based on content
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'; // Max height of 120px
  };

  const toggleAgent = (agentId: string, isActive: boolean) => {
    if (isActive) {
      removeAgentFromRoom(room.id, agentId);
    } else {
      addAgentToRoom(room.id, agentId);
    }
  };

  const handleRoundsChange = (rounds: number) => {
    setTempRounds(rounds);
    setRoomDiscussionRounds(room.id, rounds);
  };

  const handleRandomOrderToggle = () => {
    const newValue = !tempRandomOrder;
    setTempRandomOrder(newValue);
    setRoomRandomOrder(room.id, newValue);
  };

  // Update temp states when room changes
  useEffect(() => {
    setTempRounds(room.discussionRounds ?? 3);
    setTempRandomOrder(room.randomOrder ?? false);
  }, [room.discussionRounds, room.randomOrder]);

  const handleExport = () => {
    const markdown = exportChatToMarkdown(room, agents);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${room.name.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.md`;
    downloadFile(markdown, filename, 'text/markdown');
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="h-12 bg-discord-dark border-b border-discord-darkest flex items-center justify-between px-4">
        <div className="flex items-center">
          <Hash size={20} className="text-discord-muted mr-2" />
          <span className="font-semibold text-white">{room.name}</span>
          <span className="text-discord-muted text-sm ml-3">
            {activeAgents.length} active agent{activeAgents.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={room.messages.length === 0}
            className={`
              px-3 py-1 rounded text-sm transition-colors flex items-center gap-1
              ${room.messages.length > 0
                ? 'bg-discord-hover text-discord-text hover:bg-discord-blue'
                : 'bg-discord-hover text-discord-muted cursor-not-allowed opacity-50'
              }
            `}
            title="Export conversation as Markdown"
          >
            <Download size={16} />
            Export
          </button>

          <button
            onClick={() => setShowAgentSelector(!showAgentSelector)}
            className="px-3 py-1 bg-discord-hover text-discord-text rounded hover:bg-discord-blue transition-colors text-sm"
          >
            Manage Agents
          </button>
        </div>
      </div>

      {/* Agent Selector */}
      {showAgentSelector && (
        <div className="bg-discord-darker border-b border-discord-darkest p-4">
          <div className="mb-4">
            <h3 className="text-discord-text font-medium mb-3">Room Settings</h3>

            <div className="space-y-3">
              {/* Discussion Rounds Setting */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <RefreshCw size={16} className="text-discord-muted cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-discord-darkest text-discord-text text-xs rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Agents will discuss for multiple rounds,<br />
                      taking turns to respond to each other
                    </div>
                  </div>
                  <span className="text-discord-muted text-sm">Discussion Rounds:</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleRoundsChange(Math.max(1, tempRounds - 1))}
                    className="px-2 py-1 bg-discord-hover text-discord-text hover:bg-discord-blue rounded text-sm transition-colors"
                    disabled={tempRounds <= 1}
                  >
                    -
                  </button>
                  <span className="px-3 py-1 bg-discord-input text-discord-text rounded min-w-[40px] text-center text-sm">
                    {tempRounds}
                  </span>
                  <button
                    onClick={() => handleRoundsChange(Math.min(10, tempRounds + 1))}
                    className="px-2 py-1 bg-discord-hover text-discord-text hover:bg-discord-blue rounded text-sm transition-colors"
                    disabled={tempRounds >= 10}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Random Order Setting */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <Shuffle size={16} className="text-discord-muted cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-discord-darkest text-discord-text text-xs rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Randomize agent speaking order each round.<br />
                      Ensures no agent speaks twice in a row<br />
                      between rounds.
                    </div>
                  </div>
                  <span className="text-discord-muted text-sm">Random Order:</span>
                </div>
                <button
                  onClick={handleRandomOrderToggle}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${tempRandomOrder ? 'bg-discord-blue' : 'bg-discord-input'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${tempRandomOrder ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>

          <h4 className="text-discord-text text-sm font-medium mb-2">Active Agents</h4>
          <div className="grid grid-cols-2 gap-2">
            {agents.filter(a => a.isActive).map((agent) => {
              const isInRoom = room.activeAgents.includes(agent.id);
              return (
                <button
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id, isInRoom)}
                  className={`
                    flex items-center p-2 rounded transition-colors
                    ${isInRoom
                      ? 'bg-discord-blue bg-opacity-20 text-discord-text hover:bg-opacity-30'
                      : 'bg-discord-hover text-discord-muted hover:text-discord-text'
                    }
                  `}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs mr-2"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.avatar || agent.name[0]}
                  </div>
                  <span className="flex-1 text-left text-sm">{agent.name}</span>
                  {isInRoom ? (
                    <UserMinus size={16} className="text-red-400" />
                  ) : (
                    <UserPlus size={16} className="text-green-400" />
                  )}
                </button>
              );
            })}
          </div>
          {agents.filter(a => a.isActive).length === 0 && (
            <p className="text-discord-muted text-sm text-center py-4">
              No active agents available. Configure agents in the Agents page.
            </p>
          )}
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={room.messages}
        agents={activeAgents}
        streamingAgentId={streamingAgentId}
      />

      {/* Message Input */}
      <div className="p-4 bg-discord-dark border-t border-discord-darkest">
        <div className="bg-discord-input rounded-lg flex items-start px-4 relative">
          <textarea
            ref={inputRef}
            value={messageInput}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={
              activeAgents.length > 0
                ? `Message #${room.name}`
                : 'Add agents to this room to start chatting'
            }
            className="flex-1 bg-transparent text-discord-text placeholder-discord-muted outline-none py-3 resize-none min-h-[44px] max-h-[120px] overflow-y-auto"
            style={{ height: '44px' }}
            disabled={isLoading || activeAgents.length === 0}
            rows={1}
          />

          <div className="flex items-center gap-1 self-center py-3">
            {/* Keyboard shortcut hint */}
            <div className="relative">
              <button
                type="button"
                onMouseEnter={() => setShowKeyboardHint(true)}
                onMouseLeave={() => setShowKeyboardHint(false)}
                className="p-1 text-discord-muted hover:text-discord-gray transition-colors"
                title="Keyboard shortcuts"
              >
                <Info size={16} />
              </button>

              {showKeyboardHint && (
                <div className="absolute bottom-full right-0 mb-2 p-2 bg-discord-darkest text-discord-text text-xs rounded-md shadow-lg whitespace-nowrap z-10">
                  <div className="font-semibold mb-1">Keyboard Shortcuts</div>
                  <div className="space-y-1">
                    <div><kbd className="px-1 py-0.5 bg-discord-dark rounded text-xs">Enter</kbd> Send message</div>
                    <div><kbd className="px-1 py-0.5 bg-discord-dark rounded text-xs">Shift</kbd> + <kbd className="px-1 py-0.5 bg-discord-dark rounded text-xs">Enter</kbd> New line</div>
                  </div>
                </div>
              )}
            </div>

            {isLoading ? (
              <button
                onClick={stopStreaming}
                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                title="Stop generating"
              >
                <Square size={20} />
              </button>
            ) : (
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || activeAgents.length === 0}
                className="
                  p-2 text-discord-gray hover:text-discord-text transition-colors
                  disabled:text-discord-muted disabled:cursor-not-allowed
                "
                title="Send message (Enter)"
              >
                <Send size={20} />
              </button>
            )}
          </div>
        </div>

        {activeAgents.length === 0 && (
          <p className="text-discord-muted text-xs mt-2 text-center">
            Click "Manage Agents" above to add AI agents to this room
          </p>
        )}
      </div>
    </div>
  );
}