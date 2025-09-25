# Multi-Agent Chat

A pure frontend multi-AI agent group chat application that lets you interact with multiple AI personalities simultaneously, creating a Discord-like group chat experience.

## ✨ Features

- 🤖 **Multi-AI Agent System** - Configure multiple AI agents with different personalities that respond to your messages in sequence
- 💬 **Discord-Style Interface** - Familiar dark theme UI providing an excellent chat experience
- 🔄 **Real-time Streaming Responses** - Support for OpenAI streaming API with live response display
- 📝 **Full Markdown Support** - Complete Markdown formatting with syntax highlighting for code blocks
- 🏠 **Multi-Room Management** - Create multiple chat rooms, each with different agent combinations
- 💾 **Local Data Storage** - All data stored in browser localStorage for privacy
- 📤 **Export Functionality** - Export conversations to Markdown or JSON format
- 🎲 **Smart Discussion Modes** - Configure multiple discussion rounds with optional random speaking order
- 🌐 **Multi-line Input** - Support for Shift+Enter to add line breaks in messages
- 🐳 **Docker Support** - Complete Docker development and deployment environment

## 🚀 Quick Start

### Using Docker (Recommended)

#### Development Environment

```bash
# Start development environment
npm run docker:dev:build

# Or using docker-compose
docker-compose -f docker-compose.dev.yml up --build
```

Visit http://localhost:5173

#### Production Environment

```bash
# Build and start production environment
npm run docker:build
npm run docker:prod

# Or using docker-compose
docker-compose up -d
```

Visit http://localhost

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📖 Usage Guide

### 1. Configure OpenAI API
- Navigate to Setup page
- Enter your API Key
- Enter API Endpoint (see CORS handling section below)
- Enter model name (default: gpt-4o)
- Test connection

### 2. Configure AI Agents
- Go to Agents page
- Create new AI agents or use default templates
- Configure each agent's personality, system prompt, avatar, and color
- Enable agents you want to use

### 3. Start Chatting
- Return to Chat page
- Create or select a chat room
- Click "Manage Agents" to add agents to the room
- Configure discussion settings:
  - **Discussion Rounds**: Number of rounds agents will discuss (1-10)
  - **Random Order**: Randomize agent speaking order each round
- Start conversing with multiple AI agents!

## 🎮 Advanced Features

### Discussion Settings
- **Multiple Rounds**: Agents can engage in multi-round discussions
- **Random Order**: Each round can have a randomized speaking order
- **Smart Constraints**: Prevents the same agent from speaking twice in a row between rounds

### Keyboard Shortcuts
- `Enter` - Send message
- `Shift + Enter` - New line in message
- `Esc` - Cancel editing

### Export Options
- Export entire conversation as Markdown
- Includes timestamps, agent names, and formatted messages
- Automatic file naming with room name and date

## 🛠 Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS + Headless UI
- **Build Tool**: Vite
- **Markdown**: react-markdown + remark-gfm
- **Syntax Highlighting**: react-syntax-highlighter

## 📁 Project Structure

```
multi-agent-chat/
├── src/
│   ├── components/     # UI components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── stores/         # Zustand stores
│   ├── types/          # TypeScript definitions
│   └── utils/          # Utility functions
├── docker/             # Docker configuration files
└── docker-compose.yml  # Docker Compose settings
```

## ⚙️ Configuration

### OpenAI API Settings
- **API Key**: Your OpenAI API key
- **Endpoint**: API endpoint (default: OpenAI official)
- **Model**: Choose your model (default: gpt-4o)
- **Temperature**: Control response creativity (0-2)
- **Max Tokens**: Maximum response length (up to 400,000)

### Agent Configuration
Each agent can be configured with:
- **Name**: Display name
- **Avatar**: Emoji avatar
- **Personality**: Brief personality description
- **System Prompt**: Detailed behavior instructions
- **Color**: Identification color
- **Response Order**: Speaking order in group

## 🔒 Data Security

- All data stored in browser's localStorage
- API keys only used for direct OpenAI API connections
- No data sent to third-party servers
- Support for data export and import

## 🐳 Docker Commands

```bash
# Development
docker-compose -f docker-compose.dev.yml up    # Start
docker-compose -f docker-compose.dev.yml down  # Stop

# Production
docker-compose up -d    # Start in background
docker-compose down     # Stop
docker-compose logs -f  # View logs
```

## 🌐 API Connection

This is a pure frontend application that connects directly to the API from the browser.

### Supported API Endpoints
- **OpenAI**: `https://api.openai.com/v1`
- **Azure OpenAI**: `https://{your-resource}.openai.azure.com/openai/deployments/{deployment-id}`
- **Any OpenAI-compatible API**

### CORS Considerations

Since this is a pure frontend application, the API server needs to:
1. Configure proper CORS headers
2. Allow requests from your domain
3. Allow the `Authorization` header

If you encounter CORS issues, contact your API provider or use a CORS-enabled API endpoint.

## 📝 Default AI Agents

The application comes with 7 pre-configured AI agents:

1. **Technical Expert** - Deep technical knowledge and problem-solving
2. **Creative Writer** - Artistic and narrative-focused perspectives
3. **Data Analyst** - Evidence-driven analysis and metrics
4. **Project Manager** - Organization and strategic planning
5. **Red Team Expert** - Offensive security and vulnerability assessment
6. **Blue Team Expert** - Defensive security and incident response
7. **CISO** - Executive-level security strategy and risk management

## ⚠️ Important Notes

1. Ensure you have a valid API key
2. Monitor API usage costs, especially with GPT-4 models
3. Browser localStorage has capacity limits (typically 5-10MB)
4. Regularly export important conversations for backup
5. Production environments need proper reverse proxy for CORS handling

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Development mode
npm run dev
npm run dev:unsafe  # Expose to network

# Build project
npm run build

# Preview build
npm run preview

# Code quality
npm run lint        # Run ESLint
npm run format      # Format with Prettier

# Docker environments
npm run docker:dev        # Start dev environment
npm run docker:dev:build  # Build and start dev
npm run docker:build      # Build production
npm run docker:prod       # Start production
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Bug Reports

If you find a bug, please create an issue on GitHub with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

## 🙏 Acknowledgments

- OpenAI for the GPT API
- Discord for UI/UX inspiration
- All contributors and users of this project

---

**Note**: This project is not affiliated with OpenAI or Discord. It's an independent project created for educational and practical purposes.