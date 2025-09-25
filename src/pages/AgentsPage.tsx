import { useState } from 'react';
import Layout from '../components/common/Layout';
import { useAgentStore } from '../stores/agentStore';
import { DEFAULT_AGENTS } from '../types/agent';
import { Plus, Edit2, Trash2, Power, Save, X } from 'lucide-react';

export default function AgentsPage() {
  const { agents, createAgent, updateAgent, deleteAgent, toggleAgentActive } = useAgentStore();
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [showNewAgent, setShowNewAgent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    personality: '',
    systemPrompt: '',
    avatar: '',
    color: '#5865F2',
    responseOrder: 0,
    isActive: true,
  });

  const handleSaveAgent = () => {
    if (editingAgent) {
      updateAgent(editingAgent, formData);
      setEditingAgent(null);
    } else {
      createAgent(formData);
      setShowNewAgent(false);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      personality: '',
      systemPrompt: '',
      avatar: '',
      color: '#5865F2',
      responseOrder: 0,
      isActive: true,
    });
  };

  const startEdit = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      setFormData({
        name: agent.name,
        personality: agent.personality,
        systemPrompt: agent.systemPrompt,
        avatar: agent.avatar || '',
        color: agent.color,
        responseOrder: agent.responseOrder || 0,
        isActive: agent.isActive,
      });
      setEditingAgent(agentId);
      setShowNewAgent(false);
    }
  };

  const colors = ['#5865F2', '#57F287', '#FEE75C', '#EB459E', '#ED4245', '#3BA55C'];

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-discord-dark p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">AI Agents</h1>
              <p className="text-discord-gray">
                Manage your AI agents and their personalities
              </p>
            </div>

            <button
              onClick={() => {
                setShowNewAgent(true);
                setEditingAgent(null);
                resetForm();
              }}
              className="
                px-4 py-2 bg-discord-blue text-white rounded-md font-medium
                hover:bg-opacity-90 flex items-center
              "
            >
              <Plus size={20} className="mr-2" />
              New Agent
            </button>
          </div>

          {/* Agent Form */}
          {(showNewAgent || editingAgent) && (
            <div className="bg-discord-darker rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                {editingAgent ? 'Edit Agent' : 'Create New Agent'}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-discord-gray text-sm mb-1 block">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-discord-input text-discord-text px-4 py-2 rounded-md"
                    placeholder="Agent name"
                  />
                </div>

                <div>
                  <label className="text-discord-gray text-sm mb-1 block">Avatar (Emoji)</label>
                  <input
                    type="text"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full bg-discord-input text-discord-text px-4 py-2 rounded-md"
                    placeholder="🤖"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-discord-gray text-sm mb-1 block">Personality</label>
                  <textarea
                    value={formData.personality}
                    onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                    className="w-full bg-discord-input text-discord-text px-4 py-2 rounded-md h-20 resize-none"
                    placeholder="Describe the agent's personality..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-discord-gray text-sm mb-1 block">System Prompt</label>
                  <textarea
                    value={formData.systemPrompt}
                    onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                    className="w-full bg-discord-input text-discord-text px-4 py-2 rounded-md h-32 resize-none"
                    placeholder="You are a helpful assistant..."
                  />
                </div>

                <div>
                  <label className="text-discord-gray text-sm mb-1 block">Color</label>
                  <div className="flex gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`
                          w-8 h-8 rounded-full border-2
                          ${formData.color === color ? 'border-white' : 'border-transparent'}
                        `}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-discord-gray text-sm mb-1 block">Response Order</label>
                  <input
                    type="number"
                    value={formData.responseOrder}
                    onChange={(e) => setFormData({ ...formData, responseOrder: parseInt(e.target.value) })}
                    className="w-full bg-discord-input text-discord-text px-4 py-2 rounded-md"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-discord-text">Active</span>
                </label>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowNewAgent(false);
                      setEditingAgent(null);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-discord-hover text-white rounded-md font-medium hover:bg-opacity-90 flex items-center"
                  >
                    <X size={20} className="mr-2" />
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveAgent}
                    disabled={!formData.name || !formData.systemPrompt}
                    className="
                      px-4 py-2 bg-discord-blue text-white rounded-md font-medium
                      hover:bg-opacity-90 disabled:bg-discord-muted disabled:cursor-not-allowed
                      flex items-center
                    "
                  >
                    <Save size={20} className="mr-2" />
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Templates */}
          {!showNewAgent && !editingAgent && agents.length === 0 && (
            <div className="bg-discord-darker rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Start Templates</h2>
              <div className="grid grid-cols-2 gap-4">
                {DEFAULT_AGENTS.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setFormData({
                        name: template.name,
                        personality: template.personality,
                        systemPrompt: template.systemPrompt,
                        avatar: template.avatar || '',
                        color: colors[index % colors.length],
                        responseOrder: index,
                        isActive: true,
                      });
                      setShowNewAgent(true);
                    }}
                    className="
                      bg-discord-hover p-4 rounded-lg text-left
                      hover:bg-discord-input transition-colors
                    "
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">{template.avatar}</span>
                      <span className="text-white font-medium">{template.name}</span>
                    </div>
                    <p className="text-discord-gray text-sm">{template.personality}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Agent List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-discord-darker rounded-lg p-6 relative group"
              >
                <div className="flex items-start mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.avatar || agent.name[0]}
                  </div>

                  <div className="ml-4 flex-1">
                    <h3 className="text-white font-semibold text-lg">{agent.name}</h3>
                    <p className="text-discord-gray text-sm">{agent.personality}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAgentActive(agent.id)}
                      className={`
                        p-2 rounded-md transition-colors
                        ${agent.isActive
                          ? 'text-green-400 hover:bg-discord-hover'
                          : 'text-discord-muted hover:bg-discord-hover'
                        }
                      `}
                      title={agent.isActive ? 'Active' : 'Inactive'}
                    >
                      <Power size={18} />
                    </button>

                    <button
                      onClick={() => startEdit(agent.id)}
                      className="p-2 text-discord-gray hover:text-white hover:bg-discord-hover rounded-md"
                    >
                      <Edit2 size={18} />
                    </button>

                    <button
                      onClick={() => deleteAgent(agent.id)}
                      className="p-2 text-discord-gray hover:text-red-400 hover:bg-discord-hover rounded-md"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="bg-discord-input rounded p-3">
                  <p className="text-discord-muted text-xs mb-1">System Prompt:</p>
                  <p className="text-discord-text text-sm line-clamp-2">{agent.systemPrompt}</p>
                </div>

                {agent.responseOrder !== undefined && (
                  <div className="mt-3 text-discord-muted text-xs">
                    Response Order: {agent.responseOrder}
                  </div>
                )}
              </div>
            ))}
          </div>

          {agents.length === 0 && !showNewAgent && !editingAgent && (
            <div className="text-center py-12">
              <p className="text-discord-muted mb-4">No agents created yet.</p>
              <p className="text-discord-gray text-sm">
                Click "New Agent" or use a template above to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}