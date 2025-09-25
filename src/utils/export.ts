import type { ChatRoom } from '../types/chat';
import type { Agent } from '../types/agent';

export function exportChatToMarkdown(room: ChatRoom, agents: Agent[]): string {
  const agentMap = new Map(agents.map(a => [a.id, a]));

  let markdown = `# Chat Room: ${room.name}\n\n`;
  markdown += `Created: ${new Date(room.createdAt).toLocaleString()}\n`;
  markdown += `Last Updated: ${new Date(room.updatedAt).toLocaleString()}\n\n`;
  markdown += `---\n\n`;

  room.messages.forEach((message) => {
    const timestamp = new Date(message.timestamp).toLocaleTimeString();

    if (message.role === 'user') {
      markdown += `### 👤 User [${timestamp}]\n\n`;
    } else if (message.agentId) {
      const agent = agentMap.get(message.agentId);
      const emoji = agent?.avatar || '🤖';
      const name = agent?.name || 'Assistant';
      markdown += `### ${emoji} ${name} [${timestamp}]\n\n`;
    } else {
      markdown += `### 🤖 Assistant [${timestamp}]\n\n`;
    }

    markdown += `${message.content}\n\n`;
    markdown += `---\n\n`;
  });

  return markdown;
}

export function exportChatToJSON(room: ChatRoom, agents: Agent[]): string {
  const agentMap = new Map(agents.map(a => [a.id, a]));

  const exportData = {
    room: {
      id: room.id,
      name: room.name,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    },
    agents: room.activeAgents.map(id => {
      const agent = agentMap.get(id);
      return agent ? {
        id: agent.id,
        name: agent.name,
        avatar: agent.avatar,
        personality: agent.personality,
      } : null;
    }).filter(Boolean),
    messages: room.messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      agentName: msg.agentId ? agentMap.get(msg.agentId)?.name : undefined,
      timestamp: msg.timestamp,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}