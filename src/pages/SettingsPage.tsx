import Layout from '../components/common/Layout';
import { useConfigStore } from '../stores/configStore';
import { useChatStore } from '../stores/chatStore';
import { useAgentStore } from '../stores/agentStore';
import { Trash2, Download, Upload, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const { config, updateUIConfig, resetConfig } = useConfigStore();
  const { clearAllData: clearChatData } = useChatStore();
  const { clearAllAgents } = useAgentStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExportData = () => {
    const exportData = {
      version: '1.0.0',
      timestamp: Date.now(),
      config: localStorage.getItem('config-storage'),
      agents: localStorage.getItem('agent-storage'),
      chats: localStorage.getItem('chat-storage'),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multi-agent-chat-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);

        if (importData.config) {
          localStorage.setItem('config-storage', importData.config);
        }
        if (importData.agents) {
          localStorage.setItem('agent-storage', importData.agents);
        }
        if (importData.chats) {
          localStorage.setItem('chat-storage', importData.chats);
        }

        window.location.reload();
      } catch (error) {
        console.error('Failed to import data:', error);
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    clearChatData();
    clearAllAgents();
    resetConfig();
    localStorage.clear();
    setShowClearConfirm(false);
    window.location.reload();
  };

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-discord-dark p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-discord-gray mb-8">
            Manage your application preferences and data
          </p>

          <div className="space-y-6">
            {/* UI Settings */}
            <div className="bg-discord-darker rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">User Interface</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-discord-gray text-sm mb-2 block">Theme</label>
                  <select
                    value={config.ui.theme}
                    onChange={(e) => updateUIConfig({ theme: e.target.value as 'light' | 'dark' })}
                    className="w-full bg-discord-input text-discord-text px-4 py-2 rounded-md"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light (Coming Soon)</option>
                  </select>
                </div>

                <div>
                  <label className="text-discord-gray text-sm mb-2 block">Font Size</label>
                  <select
                    value={config.ui.fontSize}
                    onChange={(e) => updateUIConfig({ fontSize: e.target.value as 'small' | 'medium' | 'large' })}
                    className="w-full bg-discord-input text-discord-text px-4 py-2 rounded-md"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-discord-darker rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Data Management</h2>

              <div className="space-y-4">
                {/* Export Data */}
                <div>
                  <h3 className="text-discord-text font-medium mb-2">Export Data</h3>
                  <p className="text-discord-muted text-sm mb-3">
                    Download all your chats, agents, and settings as a JSON file.
                  </p>
                  <button
                    onClick={handleExportData}
                    className="
                      px-4 py-2 bg-discord-blue text-white rounded-md font-medium
                      hover:bg-opacity-90 flex items-center
                    "
                  >
                    <Download size={20} className="mr-2" />
                    Export All Data
                  </button>
                </div>

                {/* Import Data */}
                <div>
                  <h3 className="text-discord-text font-medium mb-2">Import Data</h3>
                  <p className="text-discord-muted text-sm mb-3">
                    Restore your data from a previously exported JSON file.
                  </p>
                  <label className="
                    px-4 py-2 bg-discord-hover text-white rounded-md font-medium
                    hover:bg-opacity-90 inline-flex items-center cursor-pointer
                  ">
                    <Upload size={20} className="mr-2" />
                    Import Data
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Clear Data */}
                <div className="border-t border-discord-hover pt-4">
                  <h3 className="text-red-400 font-medium mb-2">Danger Zone</h3>
                  <p className="text-discord-muted text-sm mb-3">
                    Clear all data including chats, agents, and settings. This action cannot be undone.
                  </p>

                  {!showClearConfirm ? (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="
                        px-4 py-2 bg-red-600 text-white rounded-md font-medium
                        hover:bg-red-700 flex items-center
                      "
                    >
                      <Trash2 size={20} className="mr-2" />
                      Clear All Data
                    </button>
                  ) : (
                    <div className="bg-red-900 bg-opacity-20 border border-red-600 rounded-lg p-4">
                      <div className="flex items-start mb-3">
                        <AlertCircle className="text-red-400 mr-2 mt-0.5" size={20} />
                        <div>
                          <p className="text-red-400 font-medium">Are you absolutely sure?</p>
                          <p className="text-discord-gray text-sm mt-1">
                            This will permanently delete all your chats, agents, and settings.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleClearAllData}
                          className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700"
                        >
                          Yes, Clear Everything
                        </button>
                        <button
                          onClick={() => setShowClearConfirm(false)}
                          className="px-4 py-2 bg-discord-hover text-white rounded-md font-medium hover:bg-opacity-90"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-discord-darker rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">About</h2>

              <div className="space-y-2 text-discord-gray">
                <p>Multi-Agent Chat v1.0.0</p>
                <p className="text-sm">
                  A pure frontend application for chatting with multiple AI agents simultaneously.
                </p>
                <p className="text-sm">
                  All data is stored locally in your browser. No data is sent to any server except OpenAI.
                </p>
                <div className="pt-4">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-discord-blue hover:underline"
                  >
                    View on GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}