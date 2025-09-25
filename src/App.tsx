import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import ChatPage from './pages/ChatPage';
import SetupPage from './pages/SetupPage';
import AgentsPage from './pages/AgentsPage';
import SettingsPage from './pages/SettingsPage';
import { useOpenAIStore } from './stores/openaiStore';
import { useAgentStore } from './stores/agentStore';

function App() {
  const config = useOpenAIStore((state) => state.config);
  const initializeAgents = useAgentStore((state) => state.initializeDefaultAgents);

  useEffect(() => {
    initializeAgents();
  }, [initializeAgents]);

  // Check if OpenAI is configured
  const isConfigured = !!(config.apiKey && config.endpoint);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isConfigured ? <ChatPage /> : <Navigate to="/setup" />}
        />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;