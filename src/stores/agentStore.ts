import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Agent } from '../types/agent';
import { DEFAULT_AGENTS } from '../types/agent';
import { v4 as uuidv4 } from 'uuid';

interface AgentStore {
  agents: Agent[];

  // Agent management
  addAgent: (agent: Omit<Agent, 'id'>) => string;
  createAgent: (agent: Omit<Agent, 'id'>) => string;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  deleteAgent: (agentId: string) => void;
  toggleAgentActive: (agentId: string) => void;

  // Utilities
  getAgent: (agentId: string) => Agent | undefined;
  getActiveAgents: () => Agent[];
  initializeDefaultAgents: () => void;
  clearAllAgents: () => void;
}

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      agents: [],

      addAgent: (agent) => {
        const agentId = uuidv4();
        const newAgent: Agent = {
          ...agent,
          id: agentId,
        };

        set((state) => ({
          agents: [...state.agents, newAgent],
        }));

        return agentId;
      },

      createAgent: (agent) => {
        const agentId = uuidv4();
        const newAgent: Agent = {
          ...agent,
          id: agentId,
        };

        set((state) => ({
          agents: [...state.agents, newAgent],
        }));

        return agentId;
      },

      updateAgent: (agentId: string, updates: Partial<Agent>) => {
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === agentId ? { ...agent, ...updates } : agent
          ),
        }));
      },

      deleteAgent: (agentId: string) => {
        set((state) => ({
          agents: state.agents.filter((agent) => agent.id !== agentId),
        }));
      },

      toggleAgentActive: (agentId: string) => {
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === agentId
              ? { ...agent, isActive: !agent.isActive }
              : agent
          ),
        }));
      },

      getAgent: (agentId: string) => {
        return get().agents.find((agent) => agent.id === agentId);
      },

      getActiveAgents: () => {
        return get().agents.filter((agent) => agent.isActive);
      },

      initializeDefaultAgents: () => {
        const state = get();
        if (state.agents.length === 0) {
          const colors = ['#5865F2', '#57F287', '#FEE75C', '#EB459E', '#FF6B6B', '#4DABF7', '#845EF7'];
          const defaultAgents = DEFAULT_AGENTS.map((template, index) => ({
            id: uuidv4(),
            name: template.name,
            avatar: template.avatar,
            personality: template.personality,
            systemPrompt: template.systemPrompt,
            color: colors[index % colors.length],
            responseOrder: index,
            isActive: true,
          }));

          set({ agents: defaultAgents });
        }
      },

      clearAllAgents: () => {
        set({ agents: [] });
      },
    }),
    {
      name: 'agent-storage',
    }
  )
);