import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatRoom, Message } from '../types/chat';
import { v4 as uuidv4 } from 'uuid';

interface ChatStore {
  rooms: ChatRoom[];
  currentRoomId: string | null;

  // Room management
  addRoom: (name: string) => string;
  createRoom: (name: string) => string;
  deleteRoom: (roomId: string) => void;
  renameRoom: (roomId: string, name: string) => void;
  selectRoom: (roomId: string) => void;
  setCurrentRoom: (roomId: string) => void;
  setRoomDiscussionRounds: (roomId: string, rounds: number) => void;
  setRoomRandomOrder: (roomId: string, randomOrder: boolean) => void;

  // Message management
  addMessage: (roomId: string, message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (roomId: string, messageId: string, content: string) => void;
  deleteMessage: (roomId: string, messageId: string) => void;

  // Agent management for rooms
  addAgentToRoom: (roomId: string, agentId: string) => void;
  removeAgentFromRoom: (roomId: string, agentId: string) => void;

  // Utilities
  getCurrentRoom: () => ChatRoom | null;
  clearAllData: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      rooms: [],
      currentRoomId: null,

      addRoom: (name: string) => {
        const roomId = uuidv4();
        const newRoom: ChatRoom = {
          id: roomId,
          name,
          messages: [],
          activeAgents: [],
          agentIds: [],
          discussionRounds: 3,  // Default to 3 rounds
          randomOrder: false,   // Default to sequential order
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          rooms: [...state.rooms, newRoom],
          currentRoomId: roomId,
        }));

        return roomId;
      },

      createRoom: (name: string) => {
        const roomId = uuidv4();
        const newRoom: ChatRoom = {
          id: roomId,
          name,
          messages: [],
          activeAgents: [],
          agentIds: [],
          discussionRounds: 3,  // Default to 3 rounds
          randomOrder: false,   // Default to sequential order
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          rooms: [...state.rooms, newRoom],
          currentRoomId: roomId,
        }));

        return roomId;
      },

      deleteRoom: (roomId: string) => {
        set((state) => ({
          rooms: state.rooms.filter((room) => room.id !== roomId),
          currentRoomId: state.currentRoomId === roomId ? null : state.currentRoomId,
        }));
      },

      renameRoom: (roomId: string, name: string) => {
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === roomId
              ? { ...room, name, updatedAt: Date.now() }
              : room
          ),
        }));
      },

      selectRoom: (roomId: string) => {
        set({ currentRoomId: roomId });
      },

      setCurrentRoom: (roomId: string) => {
        set({ currentRoomId: roomId });
      },

      setRoomDiscussionRounds: (roomId: string, rounds: number) => {
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === roomId
              ? { ...room, discussionRounds: rounds, updatedAt: Date.now() }
              : room
          ),
        }));
      },

      setRoomRandomOrder: (roomId: string, randomOrder: boolean) => {
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === roomId
              ? { ...room, randomOrder, updatedAt: Date.now() }
              : room
          ),
        }));
      },

      addMessage: (roomId: string, message) => {
        const messageId = uuidv4();
        const newMessage: Message = {
          ...message,
          id: messageId,
          timestamp: Date.now(),
        };

        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  messages: [...room.messages, newMessage],
                  updatedAt: Date.now(),
                }
              : room
          ),
        }));

        return messageId;
      },

      updateMessage: (roomId: string, messageId: string, content: string) => {
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  messages: room.messages.map((msg) =>
                    msg.id === messageId ? { ...msg, content } : msg
                  ),
                  updatedAt: Date.now(),
                }
              : room
          ),
        }));
      },

      deleteMessage: (roomId: string, messageId: string) => {
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  messages: room.messages.filter((msg) => msg.id !== messageId),
                  updatedAt: Date.now(),
                }
              : room
          ),
        }));
      },

      addAgentToRoom: (roomId: string, agentId: string) => {
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === roomId && !room.agentIds.includes(agentId)
              ? {
                  ...room,
                  activeAgents: [...room.activeAgents, agentId],
                  agentIds: [...room.agentIds, agentId],
                  updatedAt: Date.now(),
                }
              : room
          ),
        }));
      },

      removeAgentFromRoom: (roomId: string, agentId: string) => {
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  activeAgents: room.activeAgents.filter((id) => id !== agentId),
                  agentIds: room.agentIds.filter((id) => id !== agentId),
                  updatedAt: Date.now(),
                }
              : room
          ),
        }));
      },

      getCurrentRoom: () => {
        const state = get();
        return state.rooms.find((room) => room.id === state.currentRoomId) || null;
      },

      clearAllData: () => {
        set({ rooms: [], currentRoomId: null });
      },
    }),
    {
      name: 'chat-storage',
      version: 1,
      migrate: (persistedState: any) => {
        // Migrate existing rooms to have discussionRounds and randomOrder
        if (persistedState && persistedState.rooms) {
          persistedState.rooms = persistedState.rooms.map((room: any) => ({
            ...room,
            discussionRounds: room.discussionRounds ?? 3, // Default to 3 if not set
            randomOrder: room.randomOrder ?? false,       // Default to false if not set
          }));
        }
        return persistedState;
      },
    }
  )
);