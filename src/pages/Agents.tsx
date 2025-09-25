import { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Bot } from 'lucide-react';
import { useAgentStore } from '../stores/agentStore';
import type { Agent } from '../types/agent';

export default function Agents() {
  const { agents, addAgent, updateAgent, deleteAgent } = useAgentStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAgent, setNewAgent] = useState<Partial<Agent>>({
    name: '',
    avatar: '🤖',
    personality: '',
    systemPrompt: '',
    color: '#5865F2',
    model: '',
    order: 0,
    isActive: true,
  });
  const [showNewForm, setShowNewForm] = useState(false);

  const handleSaveNew = () => {
    if (newAgent.name && newAgent.systemPrompt) {
      addAgent({
        ...newAgent,
        name: newAgent.name,
        systemPrompt: newAgent.systemPrompt,
      } as Omit<Agent, 'id'>);
      setNewAgent({
        name: '',
        avatar: '🤖',
        personality: '',
        systemPrompt: '',
        color: '#5865F2',
        model: '',
        order: 0,
        isActive: true,
      });
      setShowNewForm(false);
    }
  };

  const handleEdit = (agent: Agent) => {
    setEditingId(agent.id);
  };

  const handleSaveEdit = (agent: Agent) => {
    updateAgent(agent.id, agent);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除這個 Agent 嗎？')) {
      deleteAgent(id);
    }
  };

  const predefinedAgents = [
    {
      name: 'Coding Expert',
      avatar: '💻',
      personality: '專業的程式設計師',
      systemPrompt: '你是一位經驗豐富的全端工程師，擅長 React、TypeScript 和 Node.js。請用技術性的語言回答問題，並提供程式碼範例。',
      color: '#00D26A',
    },
    {
      name: 'Creative Writer',
      avatar: '✍️',
      personality: '有創意的作家',
      systemPrompt: '你是一位富有創意的作家，擅長各種文體創作。請用生動的語言和豐富的想像力來回應。',
      color: '#F24E1E',
    },
    {
      name: 'Data Scientist',
      avatar: '📊',
      personality: '數據分析專家',
      systemPrompt: '你是一位數據科學家，擅長統計分析、機器學習和數據視覺化。請用數據和邏輯來支撐你的觀點。',
      color: '#FF6B6B',
    },
    {
      name: 'Friendly Assistant',
      avatar: '😊',
      personality: '友善的助手',
      systemPrompt: '你是一位友善且耐心的助手，總是用溫暖的語氣回應。你會仔細聆聽並提供有幫助的建議。',
      color: '#4ECDC4',
    },
  ];

  const handleUseTemplate = (template: typeof predefinedAgents[0]) => {
    setNewAgent({
      ...template,
      order: agents.length,
      isActive: true,
    });
    setShowNewForm(true);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-discord-text">AI Agents 管理</h1>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-discord-blue text-white rounded-md hover:bg-discord-blue/80 transition-colors"
          >
            <Plus size={18} />
            新增 Agent
          </button>
        </div>

        {/* Predefined Templates */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-discord-text mb-4">預設模板</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {predefinedAgents.map((template, index) => (
              <div
                key={index}
                className="bg-discord-hover p-4 rounded-lg cursor-pointer hover:bg-discord-dark transition-colors"
                onClick={() => handleUseTemplate(template)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: template.color }}
                  >
                    {template.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-discord-text">{template.name}</h3>
                    <p className="text-xs text-discord-muted">{template.personality}</p>
                  </div>
                </div>
                <p className="text-sm text-discord-muted line-clamp-2">
                  {template.systemPrompt}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* New Agent Form */}
        {showNewForm && (
          <div className="bg-discord-hover rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-discord-text mb-4">新增 Agent</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-discord-text mb-2">
                  名稱 *
                </label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  className="w-full px-3 py-2 bg-discord-dark text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-discord-text mb-2">
                  頭像 (Emoji)
                </label>
                <input
                  type="text"
                  value={newAgent.avatar}
                  onChange={(e) => setNewAgent({ ...newAgent, avatar: e.target.value })}
                  className="w-full px-3 py-2 bg-discord-dark text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-discord-text mb-2">
                  人格描述
                </label>
                <input
                  type="text"
                  value={newAgent.personality}
                  onChange={(e) => setNewAgent({ ...newAgent, personality: e.target.value })}
                  className="w-full px-3 py-2 bg-discord-dark text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-discord-text mb-2">
                  顏色
                </label>
                <input
                  type="color"
                  value={newAgent.color}
                  onChange={(e) => setNewAgent({ ...newAgent, color: e.target.value })}
                  className="w-full h-10 bg-discord-dark rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-discord-text mb-2">
                  模型（選填）
                </label>
                <input
                  type="text"
                  value={newAgent.model || ''}
                  onChange={(e) => setNewAgent({ ...newAgent, model: e.target.value })}
                  className="w-full px-3 py-2 bg-discord-dark text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue"
                  placeholder="留空使用預設模型"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-discord-text mb-2">
                  系統提示詞 *
                </label>
                <textarea
                  value={newAgent.systemPrompt}
                  onChange={(e) => setNewAgent({ ...newAgent, systemPrompt: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-discord-dark text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveNew}
                className="flex items-center gap-2 px-4 py-2 bg-discord-blue text-white rounded-md hover:bg-discord-blue/80 transition-colors"
              >
                <Save size={16} />
                儲存
              </button>
              <button
                onClick={() => {
                  setShowNewForm(false);
                  setNewAgent({
                    name: '',
                    avatar: '🤖',
                    personality: '',
                    systemPrompt: '',
                    color: '#5865F2',
                    model: '',
                    order: 0,
                    isActive: true,
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-discord-dark text-discord-text rounded-md hover:bg-discord-hover transition-colors"
              >
                <X size={16} />
                取消
              </button>
            </div>
          </div>
        )}

        {/* Agents List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-discord-text">現有 Agents</h2>
          {agents.length === 0 ? (
            <div className="bg-discord-hover rounded-lg p-8 text-center">
              <Bot size={48} className="mx-auto text-discord-muted mb-4" />
              <p className="text-discord-muted">尚未建立任何 Agent</p>
              <p className="text-sm text-discord-muted mt-2">點擊上方的「新增 Agent」或選擇預設模板開始</p>
            </div>
          ) : (
            agents.map((agent) => (
              <div key={agent.id} className="bg-discord-hover rounded-lg p-4">
                {editingId === agent.id ? (
                  <AgentEditForm
                    agent={agent}
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                        style={{ backgroundColor: agent.color }}
                      >
                        {agent.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-discord-text">{agent.name}</h3>
                        <p className="text-sm text-discord-muted">{agent.personality}</p>
                        <p className="text-xs text-discord-muted mt-1">
                          {agent.isActive ? '✅ 已啟用' : '❌ 已停用'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(agent)}
                        className="p-2 text-discord-text hover:bg-discord-dark rounded-md transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(agent.id)}
                        className="p-2 text-red-400 hover:bg-discord-dark rounded-md transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface AgentEditFormProps {
  agent: Agent;
  onSave: (agent: Agent) => void;
  onCancel: () => void;
}

function AgentEditForm({ agent, onSave, onCancel }: AgentEditFormProps) {
  const [formData, setFormData] = useState(agent);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-discord-text mb-2">
            名稱
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-discord-dark text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-discord-text mb-2">
            頭像
          </label>
          <input
            type="text"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            className="w-full px-3 py-2 bg-discord-dark text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-discord-text mb-2">
            人格描述
          </label>
          <input
            type="text"
            value={formData.personality}
            onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
            className="w-full px-3 py-2 bg-discord-dark text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-discord-text mb-2">
            顏色
          </label>
          <input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-full h-10 bg-discord-dark rounded-md cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-discord-text mb-2">
            模型
          </label>
          <input
            type="text"
            value={formData.model || ''}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className="w-full px-3 py-2 bg-discord-dark text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue"
            placeholder="留空使用預設模型"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-discord-text mb-2">
            系統提示詞
          </label>
          <textarea
            value={formData.systemPrompt}
            onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 bg-discord-dark text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue"
          />
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <span className="text-discord-text">啟用此 Agent</span>
          </label>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave(formData)}
          className="flex items-center gap-2 px-4 py-2 bg-discord-blue text-white rounded-md hover:bg-discord-blue/80 transition-colors"
        >
          <Save size={16} />
          儲存
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 bg-discord-dark text-discord-text rounded-md hover:bg-discord-hover transition-colors"
        >
          <X size={16} />
          取消
        </button>
      </div>
    </div>
  );
}