import { useState, useEffect } from 'react';
import { Save, TestTube, AlertCircle, CheckCircle } from 'lucide-react';
import { useOpenAIStore } from '../stores/openaiStore';
import { testConnection } from '../services/openai';

export default function Setup() {
  const { config, updateConfig } = useOpenAIStore();
  const [formData, setFormData] = useState(config);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'temperature' || field === 'maxTokens' || field === 'topP'
        ? parseFloat(e.target.value)
        : e.target.value
    }));
  };

  const handleSave = () => {
    updateConfig(formData);
    setTestResult(null);
    setSaveSuccess(true);
    console.log('Saving config:', formData);

    // Hide success message after 3 seconds
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setErrorMessage('');

    try {
      const isValid = await testConnection(formData);
      setTestResult(isValid ? 'success' : 'error');
      if (!isValid) {
        setErrorMessage('連線失敗，請檢查 API Key 和設定');
      }
    } catch (error) {
      setTestResult('error');
      setErrorMessage(error instanceof Error ? error.message : '未知錯誤');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-discord-text mb-8">OpenAI API Settings</h1>

        <div className="bg-discord-hover rounded-lg p-6 space-y-6">
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-discord-text mb-2">
              API Key *
            </label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={handleInputChange('apiKey')}
              className="w-full px-4 py-2 bg-discord-dark text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue"
              placeholder="sk-..."
            />
            <p className="mt-1 text-xs text-discord-muted">
              Your OpenAI API key, data is only stored locally in your browser
            </p>
          </div>

          {/* API Endpoint */}
          <div>
            <label className="block text-sm font-medium text-discord-text mb-2">
              API Endpoint
            </label>
            <input
              type="text"
              value={formData.endpoint}
              onChange={handleInputChange('endpoint')}
              className="w-full px-4 py-2 bg-discord-dark text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue"
              placeholder="https://api.openai.com/v1"
            />
            <p className="mt-1 text-xs text-discord-muted">
              Enter the complete API URL directly
              <br />Examples:
              <br />• https://api.openai.com/v1
              <br />• Any other OpenAI-compatible API endpoint
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-discord-text mb-2">
              Model
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={handleInputChange('model')}
              className="w-full px-4 py-2 bg-discord-dark text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue"
              placeholder="e.g., gpt-4, gpt-3.5-turbo, claude-3-opus..."
            />
            <p className="mt-1 text-xs text-discord-muted">
              Enter any supported model name (OpenAI, Anthropic, or compatible APIs)
            </p>
          </div>

          {/* Advanced Settings */}
          <div className="border-t border-discord-dark pt-6">
            <h3 className="text-lg font-semibold text-discord-text mb-4">Advanced Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-discord-text mb-2">
                  Temperature
                </label>
                <input
                  type="number"
                  value={formData.temperature}
                  onChange={handleInputChange('temperature')}
                  min="0"
                  max="2"
                  step="0.1"
                  className="w-full px-4 py-2 bg-discord-dark text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue"
                />
                <p className="mt-1 text-xs text-discord-muted">
                  Controls response creativity (0-2)
                </p>
              </div>

              {/* Max Tokens */}
              <div>
                <label className="block text-sm font-medium text-discord-text mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={formData.maxTokens}
                  onChange={handleInputChange('maxTokens')}
                  min="1"
                  max="400000"
                  className="w-full px-4 py-2 bg-discord-dark text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue"
                />
                <p className="mt-1 text-xs text-discord-muted">
                  Maximum response length (1-400000)
                </p>
              </div>

              {/* Top P */}
              <div>
                <label className="block text-sm font-medium text-discord-text mb-2">
                  Top P
                </label>
                <input
                  type="number"
                  value={formData.topP}
                  onChange={handleInputChange('topP')}
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full px-4 py-2 bg-discord-dark text-discord-text rounded-md focus:outline-none focus:ring-2 focus:ring-discord-blue"
                />
                <p className="mt-1 text-xs text-discord-muted">
                  Nucleus sampling control (0-1)
                </p>
              </div>

              {/* Stream */}
              <div>
                <label className="block text-sm font-medium text-discord-text mb-2">
                  Stream Response
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.stream}
                    onChange={(e) => setFormData(prev => ({ ...prev, stream: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-discord-text">Enable real-time streaming response</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Success Message */}
          {saveSuccess && (
            <div className="p-4 rounded-md flex items-center gap-2 bg-green-900/20 text-green-400">
              <CheckCircle size={20} />
              <span>Settings saved successfully!</span>
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <div className={`p-4 rounded-md flex items-center gap-2 ${
              testResult === 'success'
                ? 'bg-green-900/20 text-green-400'
                : 'bg-red-900/20 text-red-400'
            }`}>
              {testResult === 'success' ? (
                <>
                  <CheckCircle size={20} />
                  <span>Connection test successful! API settings are correct.</span>
                </>
              ) : (
                <>
                  <AlertCircle size={20} />
                  <span>{errorMessage || 'Connection test failed'}</span>
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-discord-dark mt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-discord-blue text-white font-semibold rounded-md hover:bg-discord-blue/80 transition-colors shadow-lg"
            >
              <Save size={20} />
              Save Settings
            </button>
            <button
              onClick={handleTest}
              disabled={testing || !formData.apiKey}
              className="flex items-center gap-2 px-4 py-2 bg-discord-hover text-discord-text rounded-md hover:bg-discord-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TestTube size={18} />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}