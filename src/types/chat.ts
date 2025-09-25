export interface ChatRoom {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  messages: Message[];
  activeAgents: string[];
  agentIds: string[];
  discussionRounds: number;  // Number of rounds for agent discussions
  randomOrder: boolean;      // Randomize agent order each round
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  roomId?: string;
  content: string;
  role: 'user' | 'assistant';
  agentId?: string;
  timestamp: number | string;
  isStreaming?: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}