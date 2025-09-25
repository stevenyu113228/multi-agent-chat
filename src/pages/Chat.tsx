import { useState, useEffect, useRef } from 'react';
import { Send, Download, UserPlus, Settings, MessageSquare } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { useAgentStore } from '../stores/agentStore';
import { useOpenAIStore } from '../stores/openaiStore';
import MessageItem from '../components/chat/MessageItem';
import { getOpenAIService } from '../services/openai';
import type { Message } from '../types/chat';
import type { Agent } from '../types/agent';

export default function Chat() {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showAgentManager, setShowAgentManager] = useState(false);
  const [showRoomManager, setShowRoomManager] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { rooms, currentRoomId, addRoom, selectRoom, addMessage, updateMessage, addAgentToRoom, removeAgentFromRoom } = useChatStore();
  const { agents } = useAgentStore();
  const { config } = useOpenAIStore();

  const currentRoom = rooms.find(r => r.id === currentRoomId);
  const activeAgents = agents.filter(a => a.isActive && currentRoom?.agentIds.includes(a.id));

  useEffect(() => {
    scrollToBottom();
  }, [currentRoom?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming || !currentRoom) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    addMessage(currentRoomId!, userMessage);
    setInput('');
    setIsStreaming(true);

    // Get responses from all active agents in the room
    for (const agent of activeAgents) {
      await getAgentResponse(agent, [...currentRoom.messages, userMessage]);
    }

    setIsStreaming(false);
  };

  const getAgentResponse = async (agent: Agent, messages: Message[]) => {
    if (!config.apiKey) {
      console.error('No API key configured');
      return;
    }

    if (!config.endpoint) {
      console.error('No endpoint configured');
      return;
    }

    // Use agent-specific model if configured, otherwise use default
    const finalConfig = {
      ...config,
      endpoint: config.endpoint,
      model: agent.model || config.model,
    };

    console.log('Using config:', finalConfig); // Debug log
    console.log('Endpoint from store:', config.endpoint); // Additional debug
    const service = getOpenAIService(finalConfig);

    // Create a placeholder message for this agent
    const agentMessageId = `${agent.id}-${Date.now()}`;
    const agentMessage: Message = {
      id: agentMessageId,
      role: 'assistant',
      content: '',
      agentId: agent.id,
      timestamp: new Date().toISOString(),
    };

    addMessage(currentRoomId!, agentMessage);

    try {
      if (config.stream) {
        // Stream the response
        let fullContent = '';
        const chatMessages = messages.map(m => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        }));

        for await (const chunk of service.streamMessage(chatMessages, agent)) {
          fullContent += chunk;
          updateMessage(currentRoomId!, agentMessageId, fullContent);
        }
      } else {
        // Non-streaming response
        const chatMessages = messages.map(m => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        }));

        const response = await service.sendMessage(chatMessages, agent);
        updateMessage(currentRoomId!, agentMessageId, response);
      }
    } catch (error) {
      console.error('Error getting agent response:', error);
      updateMessage(currentRoomId!, agentMessageId, `錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`);
    }
  };

  const handleExport = () => {
    if (!currentRoom) return;

    const exportData = {
      roomName: currentRoom.name,
      messages: currentRoom.messages.map(m => {
        const agent = agents.find(a => a.id === m.agentId);
        return {
          ...m,
          agentName: agent?.name || 'User',
        };
      }),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${currentRoom.name}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      const roomId = addRoom(newRoomName.trim());
      selectRoom(roomId);
      setNewRoomName('');
      setShowRoomManager(false);
    }
  };

  const handleToggleAgent = (agentId: string) => {
    if (!currentRoom) return;

    if (currentRoom.agentIds.includes(agentId)) {
      removeAgentFromRoom(currentRoomId!, agentId);
    } else {
      addAgentToRoom(currentRoomId!, agentId);
    }
  };

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare size={64} className="mx-auto text-discord-muted mb-4" />
          <h2 className="text-xl font-semibold text-discord-text mb-2">No Chat Rooms</h2>
          <p className="text-discord-muted mb-4">Create a new chat room to start chatting</p>
          <button
            onClick={() => setShowRoomManager(true)}
            className="px-4 py-2 bg-discord-blue text-white rounded-md hover:bg-discord-blue/80 transition-colors"
          >
            Create Room
          </button>
        </div>

        {/* Room Manager Modal */}
        {showRoomManager && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-discord-dark rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-discord-text mb-4">Create New Room</h3>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter room name"
                className="w-full px-3 py-2 bg-discord-darker text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue mb-4"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateRoom}
                  className="flex-1 px-4 py-2 bg-discord-blue text-white rounded-md hover:bg-discord-blue/80 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowRoomManager(false);
                    setNewRoomName('');
                  }}
                  className="flex-1 px-4 py-2 bg-discord-hover text-discord-text rounded-md hover:bg-discord-dark transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-discord-darker px-6 py-4 border-b border-discord-darkest flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-discord-text">{currentRoom.name}</h2>
          <p className="text-sm text-discord-muted">
            {activeAgents.length} Agents Online
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAgentManager(!showAgentManager)}
            className="p-2 text-discord-text hover:bg-discord-hover rounded-md transition-colors"
            title="Manage Agents"
          >
            <UserPlus size={20} />
          </button>
          <button
            onClick={handleExport}
            className="p-2 text-discord-text hover:bg-discord-hover rounded-md transition-colors"
            title="Export Chat"
          >
            <Download size={20} />
          </button>
          <button
            onClick={() => setShowRoomManager(true)}
            className="p-2 text-discord-text hover:bg-discord-hover rounded-md transition-colors"
            title="Room Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {currentRoom.messages.map((message) => {
          const agent = agents.find(a => a.id === message.agentId);
          return (
            <MessageItem
              key={message.id}
              message={message}
              agent={agent}
              isStreaming={isStreaming && message.content === ''}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-discord-darkest p-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={isStreaming ? 'Agents are responding...' : 'Type a message...'}
            disabled={isStreaming}
            className="flex-1 px-4 py-2 bg-discord-hover text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="px-4 py-2 bg-discord-blue text-white rounded-md hover:bg-discord-blue/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Agent Manager Sidebar */}
      {showAgentManager && (
        <div className="absolute right-0 top-0 h-full w-80 bg-discord-darker border-l border-discord-darkest p-4 z-40">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-discord-text">Manage Agents</h3>
            <button
              onClick={() => setShowAgentManager(false)}
              className="text-discord-muted hover:text-discord-text"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            {agents.filter(a => a.isActive).map((agent) => (
              <label
                key={agent.id}
                className="flex items-center gap-3 p-2 hover:bg-discord-hover rounded-md cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={currentRoom.agentIds.includes(agent.id)}
                  onChange={() => handleToggleAgent(agent.id)}
                  className="rounded"
                />
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: agent.color }}
                >
                  {agent.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-discord-text font-medium">{agent.name}</p>
                  <p className="text-xs text-discord-muted">{agent.personality}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Room Manager Modal */}
      {showRoomManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-discord-dark rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-discord-text mb-4">Room Management</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-discord-text mb-2">
                Create New Room
              </label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter room name"
                className="w-full px-3 py-2 bg-discord-darker text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-discord-text mb-2">
                Switch Room
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      selectRoom(room.id);
                      setShowRoomManager(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      room.id === currentRoomId
                        ? 'bg-discord-blue text-white'
                        : 'bg-discord-hover text-discord-text hover:bg-discord-dark'
                    }`}
                  >
                    {room.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateRoom}
                disabled={!newRoomName.trim()}
                className="flex-1 px-4 py-2 bg-discord-blue text-white rounded-md hover:bg-discord-blue/80 transition-colors disabled:opacity-50"
              >
                Create New Room
              </button>
              <button
                onClick={() => {
                  setShowRoomManager(false);
                  setNewRoomName('');
                }}
                className="flex-1 px-4 py-2 bg-discord-hover text-discord-text rounded-md hover:bg-discord-dark transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}