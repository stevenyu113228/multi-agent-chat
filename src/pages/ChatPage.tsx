import { useState, useEffect } from 'react';
import Layout from '../components/common/Layout';
import ChatRoom from '../components/chat/ChatRoom';
import { useChatStore } from '../stores/chatStore';
import { useAgentStore } from '../stores/agentStore';
import { Plus, Hash, Trash2, Edit2 } from 'lucide-react';

export default function ChatPage() {
  const { rooms, currentRoomId, createRoom, deleteRoom, renameRoom, setCurrentRoom, getCurrentRoom } = useChatStore();
  const { agents } = useAgentStore();
  const [newRoomName, setNewRoomName] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const currentRoom = getCurrentRoom();

  useEffect(() => {
    if (rooms.length === 0) {
      createRoom('General');
    }
  }, [rooms, createRoom]);

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      createRoom(newRoomName.trim());
      setNewRoomName('');
    }
  };

  const handleRenameRoom = (roomId: string) => {
    if (editingName.trim()) {
      renameRoom(roomId, editingName.trim());
      setEditingRoomId(null);
      setEditingName('');
    }
  };

  return (
    <Layout>
      <div className="flex h-full">
        {/* Room List Sidebar */}
        <div className="w-60 bg-discord-darker flex flex-col">
          <div className="p-4 shadow-md">
            <h2 className="text-discord-gray text-xs font-semibold uppercase tracking-wide">
              Chat Rooms
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`
                  flex items-center px-2 py-1 rounded cursor-pointer group
                  ${currentRoomId === room.id ? 'bg-discord-hover text-white' : 'text-discord-gray hover:bg-discord-hover hover:text-discord-text'}
                `}
                onClick={() => setCurrentRoom(room.id)}
              >
                <Hash size={20} className="mr-2 opacity-60" />

                {editingRoomId === room.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleRenameRoom(room.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameRoom(room.id);
                      if (e.key === 'Escape') {
                        setEditingRoomId(null);
                        setEditingName('');
                      }
                    }}
                    className="flex-1 bg-discord-input text-sm px-1 py-0.5 rounded"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <span className="flex-1 text-sm">{room.name}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRoomId(room.id);
                          setEditingName(room.name);
                        }}
                        className="p-1 hover:text-white"
                      >
                        <Edit2 size={14} />
                      </button>
                      {rooms.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRoom(room.id);
                          }}
                          className="p-1 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* New Room Input */}
            <div className="mt-2 px-2 pb-2">
              <div className="space-y-2">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateRoom();
                  }}
                  placeholder="Enter room name..."
                  className="w-full bg-discord-input text-sm px-2 py-1.5 rounded text-discord-text placeholder-discord-muted"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleCreateRoom}
                    disabled={!newRoomName.trim()}
                    className={`
                      flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors
                      ${newRoomName.trim()
                        ? 'bg-discord-blue hover:bg-discord-blue-hover text-white'
                        : 'bg-discord-hover text-discord-muted cursor-not-allowed'
                      }
                    `}
                    title="Create new room"
                  >
                    <Plus size={16} />
                    <span>Create Room</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        {currentRoom ? (
          <ChatRoom room={currentRoom} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-discord-muted">
              <p className="text-lg mb-2">No room selected</p>
              <p className="text-sm">Select or create a room to start chatting</p>
            </div>
          </div>
        )}

        {/* Active Agents Sidebar */}
        <div className="w-60 bg-discord-darker flex flex-col">
          <div className="p-4 shadow-md">
            <h2 className="text-discord-gray text-xs font-semibold uppercase tracking-wide">
              Active Agents
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {agents.filter(agent => agent.isActive).map((agent) => {
              const isInCurrentRoom = currentRoom?.activeAgents.includes(agent.id);
              return (
                <div
                  key={agent.id}
                  className={`
                    flex items-center px-2 py-2 rounded
                    ${isInCurrentRoom ? 'bg-discord-hover' : ''}
                  `}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.avatar || agent.name[0]}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-discord-text">{agent.name}</div>
                    <div className="text-xs text-discord-muted">
                      {isInCurrentRoom ? 'In this room' : 'Available'}
                    </div>
                  </div>
                </div>
              );
            })}

            {agents.filter(agent => agent.isActive).length === 0 && (
              <div className="text-center text-discord-muted text-sm px-4 py-8">
                No active agents. Configure agents in the Agents page.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}