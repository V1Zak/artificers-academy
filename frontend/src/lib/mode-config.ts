import type { LearningMode } from './api'

interface ModeConfig {
  // Navigation labels
  nav: {
    dashboard: string
    battlefield: string
    codex: string
    inspector: string
  }
  // Page headings
  headings: {
    dashboardTitle: string
    dashboardSubtitle: string
    battlefieldTitle: string
    battlefieldSubtitle: string
    codexTitle: string
    codexSubtitle: string
    inspectorTitle: string
    inspectorSubtitle: string
  }
  // Terminology
  terms: {
    level: string
    phase: string
    lesson: string
    tutorial: string
  }
  // Welcome messages
  welcome: string
  // Status labels
  status: {
    completed: string
    available: string
    locked: string
  }
  // Inspector messages
  inspector: {
    submitButton: string
    submitting: string
    success: string
    failure: (count: number) => string
    emptyState: string
    resultsHeading: string
  }
  // Codex section headings
  codex: {
    dictionaryHeading: string
    quickStartHeading: string
    conceptsHeading: string
  }
  // Codex dictionary
  dictionary: Array<{
    technical: string
    metaphor: string
    description: string
    icon: string
  }>
  // Quick start code comments
  quickStart: {
    step1Title: string
    step2Title: string
    step3Title: string
    step1Comment: string
    step2Comment: string
    step3Comment: string
  }
  // Reference cards
  referenceCards: Array<{
    title: string
    decorator: string
    description: string
  }>
  // Validation alert strings (used by CounterspellAlert / ResolveAlert)
  validation: {
    errorCountHeader: (count: number) => string
    errorTitles: Record<string, string>
    defaultErrorTitle: string
    successHeader: string
    toolsLabel: string
    resourcesLabel: string
    promptsLabel: string
  }
  // Progress bar completion text
  progress: {
    completionText: string
  }
  // Editor labels
  editor: {
    title: string
    placeholder: string
  }
  // Mana icons for levels (overrides for non-MTG modes)
  levelIcons: Record<string, string>
  // App branding
  appTitle: string
  // Dashboard progress section heading
  dashboardProgressHeading: string
  // Progress bar style per mode
  progressBar: {
    style: 'flat' | 'subtle' | 'glow'
  }
  // Level card colors per mode (maps mana colors to Tailwind classes)
  levelColors: Record<string, { gradient: string }>
  // Auth page headings
  auth: {
    loginHeading: string
    loginSubtext: string
    signupHeading: string
    signupSubtext: string
  }
  // Phase card labels
  phaseLabels: {
    validationRequired: string
  }
  // Codex instructional text
  codexInstruction: string
  // Landing page preview labels
  landingPreview: string
}

export const MODE_CONFIG: Record<LearningMode, ModeConfig> = {
  simple: {
    nav: {
      dashboard: 'Home',
      battlefield: 'Lessons',
      codex: 'Reference',
      inspector: 'Code Checker',
    },
    headings: {
      dashboardTitle: 'Welcome back',
      dashboardSubtitle: 'Continue learning at your own pace',
      battlefieldTitle: 'Your Lessons',
      battlefieldSubtitle: 'Pick a module and start learning',
      codexTitle: 'Quick Reference',
      codexSubtitle: 'A handy guide to key terms and concepts',
      inspectorTitle: 'Code Checker',
      inspectorSubtitle: 'Paste your code here to check if it looks right.',
    },
    terms: {
      level: 'Module',
      phase: 'Step',
      lesson: 'Reading',
      tutorial: 'Hands-on',
    },
    welcome: 'Welcome back',
    status: {
      completed: 'Done',
      available: 'Ready',
      locked: 'Locked',
    },
    inspector: {
      submitButton: 'Check My Code',
      submitting: 'Checking...',
      success: 'Your code looks good!',
      failure: (count: number) => `Found ${count} issue${count === 1 ? '' : 's'}`,
      emptyState: 'Paste your code and click "Check My Code" to get feedback',
      resultsHeading: 'Feedback',
    },
    codex: {
      dictionaryHeading: 'Key Terms',
      quickStartHeading: 'Quick Start Guide',
      conceptsHeading: 'Core Concepts',
    },
    dictionary: [
      { technical: 'AI Assistant (e.g., Claude)', metaphor: 'AI Assistant', description: 'The AI that uses your tools', icon: '🤖' },
      { technical: 'MCP Server', metaphor: 'Tool Server', description: 'A program that provides tools to an AI', icon: '🔧' },
      { technical: 'MCP Client', metaphor: 'App Interface', description: 'The app you chat with (like Claude Desktop)', icon: '💬' },
      { technical: 'Tool', metaphor: 'Function', description: 'A task your server can perform', icon: '⚙️' },
      { technical: 'Resource', metaphor: 'Data Source', description: 'Information your server can share', icon: '📁' },
      { technical: 'Prompt', metaphor: 'Template', description: 'Pre-written instructions for the AI', icon: '📝' },
      { technical: 'uv', metaphor: 'Package Manager', description: 'Installs the libraries your code needs', icon: '📦' },
      { technical: 'Error', metaphor: 'Error', description: 'Something went wrong in your code', icon: '❌' },
    ],
    quickStart: {
      step1Title: '1. Install the tools',
      step2Title: '2. Write your first function',
      step3Title: '3. Test your code',
      step1Comment: '# Install uv (a Python package manager)',
      step2Comment: '# server.py - Your first tool server',
      step3Comment: '# Test your server with the Inspector',
    },
    referenceCards: [
      { title: 'Functions', decorator: '@mcp.tool()', description: 'Tasks the AI can ask your server to perform' },
      { title: 'Data Sources', decorator: '@mcp.resource(uri)', description: 'Information accessible via a web-style address' },
      { title: 'Templates', decorator: '@mcp.prompt()', description: 'Pre-written instructions for the AI' },
    ],
    validation: {
      errorCountHeader: (count: number) => `${count} Issue${count === 1 ? '' : 's'} Found`,
      errorTitles: {
        syntax_error: 'Syntax Problem',
        missing_import: 'Missing Package',
        missing_instance: 'Missing Setup',
        empty_deck: 'Empty File',
        missing_docstring: 'Missing Description',
        short_docstring: 'Description Too Short',
        invalid_resource_uri: 'Bad Address',
        missing_resource_uri: 'Missing Address',
      },
      defaultErrorTitle: 'Problem Found',
      successHeader: 'Your Code Looks Good!',
      toolsLabel: 'Functions Found',
      resourcesLabel: 'Data Sources Found',
      promptsLabel: 'Templates Found',
    },
    progress: {
      completionText: 'All done!',
    },
    editor: {
      title: 'Your Code',
      placeholder: '# Write your code here...',
    },
    levelIcons: {
      blue: '📘',
      black: '📂',
      green: '🌐',
      gold: '🚀',
    },
    appTitle: 'MCP Learn',
    dashboardProgressHeading: 'Your Progress',
    progressBar: { style: 'flat' },
    levelColors: {
      blue: { gradient: 'from-blue-500/10 to-blue-500/5 border-blue-500/20' },
      black: { gradient: 'from-gray-500/10 to-gray-500/5 border-gray-500/20' },
      green: { gradient: 'from-green-500/10 to-green-500/5 border-green-500/20' },
      gold: { gradient: 'from-amber-500/10 to-amber-500/5 border-amber-500/20' },
      red: { gradient: 'from-red-500/10 to-red-500/5 border-red-500/20' },
      white: { gradient: 'from-gray-300/10 to-gray-300/5 border-gray-300/20' },
    },
    auth: {
      loginHeading: 'Welcome Back',
      loginSubtext: 'Sign in to continue learning',
      signupHeading: 'Create Account',
      signupSubtext: 'Start learning MCP development',
    },
    phaseLabels: {
      validationRequired: 'Code Check Required',
    },
    codexInstruction: 'Hover or tap a card to see its definition',
    landingPreview: 'Module 1: Getting Started',
  },

  detailed: {
    nav: {
      dashboard: 'Dashboard',
      battlefield: 'Curriculum',
      codex: 'Technical Docs',
      inspector: 'MCP Validator',
    },
    headings: {
      dashboardTitle: 'Dashboard',
      dashboardSubtitle: 'Track your progress through the MCP curriculum',
      battlefieldTitle: 'Curriculum',
      battlefieldSubtitle: 'Structured modules covering the MCP specification',
      codexTitle: 'Technical Documentation',
      codexSubtitle: 'Reference documentation for MCP concepts and APIs',
      inspectorTitle: 'MCP Validator',
      inspectorSubtitle: 'Static analysis and validation for MCP server implementations.',
    },
    terms: {
      level: 'Module',
      phase: 'Section',
      lesson: 'Concept',
      tutorial: 'Implementation',
    },
    welcome: 'Dashboard',
    status: {
      completed: 'Complete',
      available: 'Unlocked',
      locked: 'Restricted',
    },
    inspector: {
      submitButton: 'Run Validation',
      submitting: 'Validating...',
      success: 'Validation passed - all checks green',
      failure: (count: number) => `${count} validation error${count === 1 ? '' : 's'} detected`,
      emptyState: 'Submit your MCP server code for static analysis and validation',
      resultsHeading: 'Analysis Results',
    },
    codex: {
      dictionaryHeading: 'Terminology Reference',
      quickStartHeading: 'Quick Start Guide',
      conceptsHeading: 'Core Concepts',
    },
    dictionary: [
      { technical: 'LLM (e.g., Claude)', metaphor: 'LLM Client', description: 'The language model consuming tool endpoints', icon: '🧠' },
      { technical: 'MCP Server', metaphor: 'Tool Provider', description: 'JSON-RPC server exposing tools and resources', icon: '🖥️' },
      { technical: 'MCP Client', metaphor: 'Host Application', description: 'Application implementing the MCP client protocol', icon: '📡' },
      { technical: 'Tool', metaphor: 'Tool Function', description: 'Callable endpoint with typed parameters', icon: '🛠️' },
      { technical: 'Resource', metaphor: 'Resource Endpoint', description: 'Read-only data addressable by URI template', icon: '📊' },
      { technical: 'Prompt', metaphor: 'Prompt Template', description: 'Reusable context injection template', icon: '📋' },
      { technical: 'uv', metaphor: 'Dependency Manager', description: 'Fast Python package and project manager', icon: '🔋' },
      { technical: 'Error', metaphor: 'Runtime Error', description: 'Exception in tool execution or protocol violation', icon: '🔴' },
    ],
    quickStart: {
      step1Title: '1. Environment setup',
      step2Title: '2. Implement a tool endpoint',
      step3Title: '3. Debug with Inspector',
      step1Comment: '# Install uv (Python package manager)',
      step2Comment: '# server.py - MCP server implementation',
      step3Comment: '# Launch the MCP Inspector for debugging',
    },
    referenceCards: [
      { title: 'Tool Functions', decorator: '@mcp.tool()', description: 'Callable functions exposed via JSON-RPC' },
      { title: 'Resource Endpoints', decorator: '@mcp.resource(uri)', description: 'Read-only data accessible via URI templates' },
      { title: 'Prompt Templates', decorator: '@mcp.prompt()', description: 'Reusable context injection templates' },
    ],
    validation: {
      errorCountHeader: (count: number) => `${count} Validation Error${count === 1 ? '' : 's'}`,
      errorTitles: {
        syntax_error: 'Syntax Error',
        missing_import: 'Missing Import',
        missing_instance: 'Missing Server Instance',
        empty_deck: 'Empty Source File',
        missing_docstring: 'Missing Docstring',
        short_docstring: 'Insufficient Docstring',
        invalid_resource_uri: 'Invalid URI Pattern',
        missing_resource_uri: 'Missing Resource URI',
      },
      defaultErrorTitle: 'Validation Error',
      successHeader: 'All Checks Passed',
      toolsLabel: 'Tools Detected',
      resourcesLabel: 'Resources Detected',
      promptsLabel: 'Prompts Detected',
    },
    progress: {
      completionText: 'Module complete',
    },
    editor: {
      title: 'Source Code',
      placeholder: '# Enter your MCP server implementation...',
    },
    levelIcons: {
      blue: '💻',
      black: '📁',
      green: '🔗',
      gold: '☁️',
    },
    appTitle: 'MCP Academy',
    dashboardProgressHeading: 'Progress Overview',
    progressBar: { style: 'subtle' },
    levelColors: {
      blue: { gradient: 'from-blue-700/10 to-blue-700/5 border-blue-700/20' },
      black: { gradient: 'from-gray-600/10 to-gray-600/5 border-gray-600/20' },
      green: { gradient: 'from-emerald-700/10 to-emerald-700/5 border-emerald-700/20' },
      gold: { gradient: 'from-yellow-600/10 to-yellow-600/5 border-yellow-600/20' },
      red: { gradient: 'from-red-700/10 to-red-700/5 border-red-700/20' },
      white: { gradient: 'from-gray-400/10 to-gray-400/5 border-gray-400/20' },
    },
    auth: {
      loginHeading: 'Sign In',
      loginSubtext: 'Access your MCP development environment',
      signupHeading: 'Create Account',
      signupSubtext: 'Begin the MCP curriculum',
    },
    phaseLabels: {
      validationRequired: 'Validation Required',
    },
    codexInstruction: 'Hover or tap a card to view its technical definition',
    landingPreview: 'Module 1: Fundamentals',
  },

  mtg: {
    nav: {
      dashboard: 'Dashboard',
      battlefield: 'The Battlefield',
      codex: 'The Codex',
      inspector: 'The Inspector',
    },
    headings: {
      dashboardTitle: 'Welcome, Artificer',
      dashboardSubtitle: 'Continue your journey through the Academy',
      battlefieldTitle: 'The Battlefield',
      battlefieldSubtitle: 'Choose your path and begin your journey to becoming an Artificer',
      codexTitle: 'The Codex',
      codexSubtitle: "The Grand Artificer's compendium of knowledge",
      inspectorTitle: 'The Inspector',
      inspectorSubtitle: 'Submit your Decklist for validation. The Inspector will analyze your spells and identify any issues.',
    },
    terms: {
      level: 'Level',
      phase: 'Phase',
      lesson: 'Lesson',
      tutorial: 'Tutorial',
    },
    welcome: 'Welcome, Artificer',
    status: {
      completed: 'Completed',
      available: 'Available',
      locked: 'Locked',
    },
    inspector: {
      submitButton: 'Submit for Inspection',
      submitting: 'Inspecting...',
      success: 'Spell resolves successfully!',
      failure: (count: number) => `${count} counterspell${count === 1 ? '' : 's'} detected`,
      emptyState: "Submit your code to receive the Inspector's verdict",
      resultsHeading: "Inspector's Verdict",
    },
    codex: {
      dictionaryHeading: "The Grand Artificer's Dictionary",
      quickStartHeading: 'Quick Start Incantation',
      conceptsHeading: 'Core Concepts',
    },
    dictionary: [
      { technical: 'LLM (Claude)', metaphor: 'Planeswalker', description: 'The intelligent entity that invokes your tools', icon: '🧙' },
      { technical: 'MCP Server', metaphor: 'Deck / Library', description: 'Your collection of tools and resources', icon: '📚' },
      { technical: 'MCP Client', metaphor: 'Player', description: 'The interface (Claude Desktop, etc.)', icon: '🎮' },
      { technical: 'Tool', metaphor: 'Sorcery / Instant', description: 'Executable functions', icon: '⚡' },
      { technical: 'Resource', metaphor: 'Permanent', description: 'Read-only data addressable by URI', icon: '🏔️' },
      { technical: 'Prompt', metaphor: 'Tutor', description: 'Pre-configured context templates', icon: '📜' },
      { technical: 'uv', metaphor: 'Mana Source', description: 'The package manager that powers your spells', icon: '💎' },
      { technical: 'Error', metaphor: 'Counterspell', description: 'When a spell fails or is invalid', icon: '🚫' },
    ],
    quickStart: {
      step1Title: '1. Prepare your mana base',
      step2Title: '2. Craft your first Sorcery',
      step3Title: '3. Summon the Inspector',
      step1Comment: '# Install the Mana Source (uv)',
      step2Comment: '# server.py',
      step3Comment: '# Test your Decklist with the Inspector',
    },
    referenceCards: [
      { title: 'Sorceries', decorator: '@mcp.tool()', description: 'Executable functions the Planeswalker can invoke' },
      { title: 'Permanents', decorator: '@mcp.resource(uri)', description: 'Read-only data accessible via URI' },
      { title: 'Tutors', decorator: '@mcp.prompt()', description: 'Pre-configured context templates' },
    ],
    validation: {
      errorCountHeader: (count: number) => `${count} Counterspell${count === 1 ? '' : 's'} Detected`,
      errorTitles: {
        syntax_error: 'Forbidden Runes',
        missing_import: 'Missing Mana Source',
        missing_instance: 'Unbound Library',
        empty_deck: 'Empty Decklist',
        missing_docstring: 'Missing Oracle Text',
        short_docstring: 'Insufficient Oracle Text',
        invalid_resource_uri: 'Invalid Permanent Binding',
        missing_resource_uri: 'Unbound Permanent',
      },
      defaultErrorTitle: 'Spell Fizzled',
      successHeader: 'Spell Resolves Successfully!',
      toolsLabel: 'Sorceries Discovered',
      resourcesLabel: 'Permanents Discovered',
      promptsLabel: 'Tutors Discovered',
    },
    progress: {
      completionText: 'Mana pool full!',
    },
    editor: {
      title: 'Your Decklist',
      placeholder: '# Write your spell here, Artificer...',
    },
    levelIcons: {
      blue: '💧',
      black: '💀',
      green: '🌿',
      gold: '✨',
    },
    appTitle: 'The Academy',
    dashboardProgressHeading: 'Your Journey',
    progressBar: { style: 'glow' },
    levelColors: {
      blue: { gradient: 'from-mana-blue/20 to-mana-blue/5 border-mana-blue/30' },
      black: { gradient: 'from-mana-black/20 to-mana-black/5 border-mana-black/30' },
      green: { gradient: 'from-mana-green/20 to-mana-green/5 border-mana-green/30' },
      gold: { gradient: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30' },
      red: { gradient: 'from-mana-red/20 to-mana-red/5 border-mana-red/30' },
      white: { gradient: 'from-mana-white/20 to-mana-white/5 border-mana-white/30' },
    },
    auth: {
      loginHeading: 'Welcome Back, Artificer',
      loginSubtext: 'Sign in to continue your journey',
      signupHeading: 'Join the Academy',
      signupSubtext: 'Begin your journey to becoming an Artificer',
    },
    phaseLabels: {
      validationRequired: 'Inspection Required',
    },
    codexInstruction: 'Hover or tap a card to reveal its meaning',
    landingPreview: 'Level 1: The Sanctum',
  },
}

export function getModeConfig(mode: LearningMode): ModeConfig {
  return MODE_CONFIG[mode]
}
