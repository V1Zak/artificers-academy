import type { LearningMode } from './api'

interface ModeConfig {
  // Navigation labels
  nav: {
    dashboard: string
    battlefield: string
    codex: string
    inspector: string
    promptingTips: string
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
    promptingTipsTitle: string
    promptingTipsSubtitle: string
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
  // Prompting tips section
  promptingTips: {
    categories: Array<{
      title: string
      icon: string
      tips: Array<{
        title: string
        description: string
        why: string
        example?: { good: string; bad: string }
      }>
    }>
  }
}

export const MODE_CONFIG: Record<LearningMode, ModeConfig> = {
  simple: {
    nav: {
      dashboard: 'Home',
      battlefield: 'Lessons',
      codex: 'Reference',
      inspector: 'Code Checker',
      promptingTips: 'Prompting Tips',
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
      promptingTipsTitle: 'Prompting Tips',
      promptingTipsSubtitle: 'Simple tips to get better results from Claude',
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
    promptingTips: {
      categories: [
        {
          title: 'The Basics',
          icon: '📝',
          tips: [
            {
              title: 'Be Clear & Direct',
              description: 'Tell Claude exactly what you want. Say "change this function to use async/await" instead of "can you maybe suggest some changes?"',
              why: 'Claude takes your instructions literally. Vague requests get vague answers. Direct instructions get precise results.',
              example: {
                good: 'Rewrite this function to handle errors with try/catch and return null on failure.',
                bad: 'Can you suggest some improvements to this function?',
              },
            },
            {
              title: 'Explain Why',
              description: 'Tell Claude the reason behind your rules. Instead of just "no ellipses", say "no ellipses because this text will be read aloud by text-to-speech."',
              why: 'When Claude understands the motivation, it can apply the rule correctly to edge cases you didn\'t think of.',
            },
            {
              title: 'Use Numbered Steps',
              description: 'Break complex instructions into numbered steps: "1. Read the file. 2. Find all TODO comments. 3. Create a summary."',
              why: 'Numbered steps reduce ambiguity and ensure nothing gets skipped. Claude follows them in order.',
            },
          ],
        },
        {
          title: 'Formatting Your Prompts',
          icon: '🏗️',
          tips: [
            {
              title: 'Use XML Tags',
              description: 'Wrap different parts of your prompt in tags like <instructions>, <data>, and <example> to keep things organized.',
              why: 'Claude was specially trained to understand XML tags. They help it tell the difference between your instructions and the data you\'re working with.',
              example: {
                good: '<instructions>Summarize this article in 3 bullet points.</instructions>\n<article>...</article>',
                bad: 'Summarize this article in 3 bullet points. The article is: ...',
              },
            },
            {
              title: 'Show Examples',
              description: 'Give Claude 3-5 examples of the output format you want. This is the easiest way to get exactly the format you need.',
              why: 'Examples are worth more than descriptions. Claude pattern-matches from examples more reliably than from written rules.',
            },
            {
              title: 'Put Questions Last',
              description: 'When giving Claude a long document to analyze, put the document first and your questions at the end.',
              why: 'Claude pays the most attention to what comes last. Putting your question at the end after the context can improve accuracy by up to 30%.',
            },
          ],
        },
        {
          title: 'Getting Accurate Answers',
          icon: '🎯',
          tips: [
            {
              title: 'Ask for Step-by-Step Thinking',
              description: 'Add "think step-by-step" to get Claude to show its reasoning before giving a final answer.',
              why: 'When Claude writes out its thinking, it catches its own mistakes. If the thinking isn\'t written out, it doesn\'t happen.',
            },
            {
              title: 'Use Extended Thinking',
              description: 'For hard math, logic, or coding problems, use Claude\'s built-in thinking mode. Give general goals rather than rigid step-by-step instructions.',
              why: 'Extended thinking gives Claude extra space to reason through complex problems before responding. Overly prescriptive instructions can actually limit its reasoning.',
            },
            {
              title: 'Let Claude Say "I Don\'t Know"',
              description: 'Tell Claude it\'s okay to say "I\'m not sure" instead of guessing. Ask it to quote directly from sources when possible.',
              why: 'By default, Claude tries to be helpful and may guess. Giving it permission to be uncertain dramatically reduces made-up answers.',
            },
          ],
        },
        {
          title: 'Power Techniques',
          icon: '🚀',
          tips: [
            {
              title: 'Give Claude a Role',
              description: 'Start with something like "You are an experienced Python developer who specializes in FastAPI." This sets the tone for the whole conversation.',
              why: 'A specific role helps Claude draw on the right knowledge and give responses at the right level of detail.',
            },
            {
              title: 'Chain Your Prompts',
              description: 'Instead of one massive prompt, break big tasks into smaller steps. Use the output of one step as input to the next.',
              why: 'Each smaller task gets Claude\'s full attention. You can check results at each step instead of debugging a huge output.',
            },
            {
              title: 'Write Good Tool Descriptions',
              description: 'When building MCP tools, write detailed descriptions (3-4 sentences) explaining what the tool does, when to use it, and any important details about parameters.',
              why: 'Tool descriptions are the single most important factor in whether Claude uses your tools correctly. Short or vague descriptions lead to misuse.',
            },
          ],
        },
      ],
    },
  },

  detailed: {
    nav: {
      dashboard: 'Dashboard',
      battlefield: 'Curriculum',
      codex: 'Technical Docs',
      inspector: 'MCP Validator',
      promptingTips: 'Prompt Engineering',
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
      promptingTipsTitle: 'Prompt Engineering',
      promptingTipsSubtitle: 'Best practices for effective Claude interactions, sourced from Anthropic documentation',
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
    promptingTips: {
      categories: [
        {
          title: 'Foundations',
          icon: '🔬',
          tips: [
            {
              title: 'Be Clear & Direct',
              description: 'Claude 4 models interpret instructions literally. Use imperative statements ("refactor this function") rather than hedged requests ("could you perhaps look at improving this?").',
              why: 'Ambiguous prompts force the model to infer intent, introducing variance. Direct instructions map to deterministic behavior, reducing output entropy.',
              example: {
                good: 'Refactor `processData()` to use async iterators. Preserve the existing error handling. Return `AsyncGenerator<DataChunk>`.',
                bad: 'Can you take a look at processData and maybe suggest some improvements to make it more modern?',
              },
            },
            {
              title: 'Provide Context & Motivation',
              description: 'Explain the reasoning behind constraints. Instead of "no abbreviations", specify "no abbreviations because this text feeds into a TTS pipeline that reads abbreviations literally."',
              why: 'Motivated instructions enable generalization. The model applies the underlying principle to edge cases not explicitly covered, rather than pattern-matching on surface rules.',
            },
            {
              title: 'Use Sequential Steps',
              description: 'Structure multi-step tasks as numbered instructions. Each step should have a clear input, operation, and expected output state.',
              why: 'Sequential enumeration creates an implicit execution plan. The model processes steps serially, reducing the probability of skipping operations or reordering dependencies.',
            },
          ],
        },
        {
          title: 'Structure & Format',
          icon: '🏗️',
          tips: [
            {
              title: 'XML Tags for Prompt Structure',
              description: 'Use XML tags (<instructions>, <context>, <data>, <example>) to delineate prompt sections. Claude\'s training includes extensive XML-structured data.',
              why: 'XML tags create unambiguous boundaries between meta-instructions and content. This eliminates prompt injection vectors where data could be misinterpreted as instructions.',
              example: {
                good: '<system>You are a code reviewer.</system>\n<context>Python 3.12, FastAPI application</context>\n<code>...</code>\n<instructions>Review for security vulnerabilities. Output as JSON.</instructions>',
                bad: 'You are a code reviewer. Here is some Python 3.12 FastAPI code: ... Review it for security vulnerabilities and output as JSON.',
              },
            },
            {
              title: 'Few-Shot Examples',
              description: 'Provide 3-5 diverse input/output examples wrapped in <example> tags. Cover edge cases and boundary conditions, not just the happy path.',
              why: 'Few-shot examples define the output distribution more precisely than natural language descriptions. The model extrapolates the transformation pattern from examples, achieving higher format compliance.',
            },
            {
              title: 'Long Context: Document-Query Ordering',
              description: 'In retrieval-augmented prompts, place source documents at the beginning and the query/instructions at the end. This applies to any prompt with substantial reference material.',
              why: 'Recency bias in attention mechanisms means content near the end of the context window receives higher attention weights. Placing the query last yields up to 30% accuracy improvement on document QA tasks.',
            },
          ],
        },
        {
          title: 'Reasoning & Accuracy',
          icon: '🧠',
          tips: [
            {
              title: 'Chain of Thought Prompting',
              description: 'Request explicit reasoning with "think step-by-step" or structured <thinking> tags before the final answer. For classification tasks, require justification before the label.',
              why: 'Chain-of-thought creates intermediate computation tokens that serve as working memory. Critical insight: reasoning that isn\'t output to tokens doesn\'t influence the model\'s computation.',
            },
            {
              title: 'Extended Thinking Mode',
              description: 'For complex STEM, multi-step reasoning, or code architecture tasks, enable Claude\'s built-in extended thinking. Provide high-level objectives rather than prescriptive step-by-step procedures.',
              why: 'Extended thinking allocates dedicated computation before response generation. Overly prescriptive instructions constrain the model\'s reasoning search space, potentially excluding optimal solution paths.',
            },
            {
              title: 'Hallucination Mitigation',
              description: 'Instruct Claude to: (1) say "I don\'t know" when uncertain, (2) provide direct quotes from source material, (3) verify its own claims against provided context before responding.',
              why: 'Without explicit uncertainty permission, the model optimizes for helpfulness over accuracy. Verification instructions create a self-consistency check that catches confabulated details.',
            },
          ],
        },
        {
          title: 'Advanced Techniques',
          icon: '⚡',
          tips: [
            {
              title: 'Role Prompting via System Messages',
              description: 'Define domain expertise in system prompts: "You are a senior platform engineer specializing in Kubernetes orchestration with 10 years of production experience." Include specific technical constraints.',
              why: 'Role prompts activate domain-specific knowledge clusters in the model\'s weights. System-level role definitions persist across the conversation, maintaining consistent expertise without repetition.',
            },
            {
              title: 'Prompt Chaining Pipelines',
              description: 'Decompose complex tasks into sequential subtask prompts. Each subtask receives focused context and produces validated intermediate output. Independent subtasks can execute in parallel.',
              why: 'Chaining trades single-prompt complexity for pipeline reliability. Each step operates within a narrower problem space, reducing compound error rates. Intermediate outputs serve as checkpoints for quality validation.',
            },
            {
              title: 'Tool Description Engineering',
              description: 'Write tool descriptions with 3-4 sentences covering: (1) what the tool does, (2) when to use it vs. alternatives, (3) parameter constraints and formats, (4) known limitations or caveats.',
              why: 'Tool descriptions are the primary signal for tool selection and parameter construction. Empirically, description quality is the single highest-leverage factor in tool use accuracy, outweighing parameter schemas.',
            },
          ],
        },
      ],
    },
  },

  mtg: {
    nav: {
      dashboard: 'Dashboard',
      battlefield: 'The Battlefield',
      codex: 'The Codex',
      inspector: 'The Inspector',
      promptingTips: 'Arcane Inscriptions',
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
      promptingTipsTitle: 'Arcane Inscriptions',
      promptingTipsSubtitle: 'Master the art of commanding your Planeswalker with precision and power',
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
    promptingTips: {
      categories: [
        {
          title: 'Foundations of Inscription',
          icon: '🔮',
          tips: [
            {
              title: 'Inscribe with Clarity',
              description: 'A Planeswalker reads your incantation exactly as written. Command "transmute this Sorcery to async" rather than whispering "might you consider alterations to this spell?"',
              why: 'The Planeswalker interprets your Oracle Text literally. Vague incantations scatter the mana, producing unfocused results. Precise wording channels power directly.',
              example: {
                good: 'Transmute `processData()` into an async incantation. Preserve the existing ward (error handling). Return `AsyncGenerator<DataChunk>`.',
                bad: 'Could you maybe look at processData and suggest some improvements?',
              },
            },
            {
              title: 'Reveal the Purpose',
              description: 'Tell the Planeswalker why a rule exists. Not just "no ellipses" but "no ellipses, for this text shall be spoken aloud by a Voice Golem that reads each glyph literally."',
              why: 'When the Planeswalker understands the intent behind your ward, it can extend the protection to edge cases your inscription didn\'t foresee. Motivation unlocks generalization.',
            },
            {
              title: 'Number Your Incantations',
              description: 'Break complex rituals into numbered steps: "1. Scry the file. 2. Locate all TODO runes. 3. Forge a summary scroll."',
              why: 'Numbered steps create a ritual sequence. The Planeswalker resolves each step in order, preventing skipped phases or tangled dependencies in your spell chain.',
            },
          ],
        },
        {
          title: 'Structuring Your Scrolls',
          icon: '📜',
          tips: [
            {
              title: 'Bind with XML Wards',
              description: 'Enclose different parts of your scroll in binding tags like <instructions>, <data>, and <example>. These wards separate your commands from the materials they act upon.',
              why: 'The Planeswalker was trained to recognize XML bindings as arcane boundaries. They prevent your data from being mistaken for instructions — a dangerous form of spell corruption.',
              example: {
                good: '<instructions>Distill this tome into 3 key insights.</instructions>\n<tome>...</tome>',
                bad: 'Distill this tome into 3 key insights. The tome is: ...',
              },
            },
            {
              title: 'Provide Specimen Scrolls',
              description: 'Show the Planeswalker 3-5 examples of the output pattern you desire. This is the most potent technique for achieving exact format compliance.',
              why: 'Specimen scrolls define the transformation pattern more precisely than any written description. The Planeswalker extrapolates the enchantment from your examples with high fidelity.',
            },
            {
              title: 'Query at the Bottom of the Stack',
              description: 'When presenting long tomes for analysis, place the source material first and your question at the bottom — last on the stack, first to resolve.',
              why: 'Like spells on the Stack, the last item resolves first and receives the most attention. Placing your query at the bottom can improve accuracy by up to 30%.',
            },
          ],
        },
        {
          title: 'Sharpening the Mind\'s Eye',
          icon: '👁️',
          tips: [
            {
              title: 'Invoke Chain of Thought',
              description: 'Command the Planeswalker to "think step-by-step" or use <thinking> wards to force visible reasoning before the final verdict.',
              why: 'Chain of Thought creates visible mana threads — intermediate reasoning tokens that serve as working memory. Critical law: reasoning that isn\'t manifest in tokens doesn\'t influence the spell.',
            },
            {
              title: 'Unleash Extended Contemplation',
              description: 'For complex puzzles, STEM riddles, or architecture decisions, invoke the Planeswalker\'s deep thinking mode. Provide broad objectives, not rigid step-by-step rituals.',
              why: 'Extended Contemplation grants the Planeswalker dedicated reasoning space before responding. Overly prescriptive rituals constrain its search through the solution space, potentially warding off the optimal path.',
            },
            {
              title: 'Ward Against Fabrication',
              description: 'Grant the Planeswalker permission to declare "The answer is beyond my sight." Ask it to quote directly from source scrolls and verify claims against provided lore.',
              why: 'Without explicit permission to express uncertainty, the Planeswalker optimizes for helpfulness and may conjure plausible fictions. Verification wards create a self-consistency check.',
            },
          ],
        },
        {
          title: 'Grandmaster Techniques',
          icon: '⚡',
          tips: [
            {
              title: 'Bestow a Title',
              description: 'Begin your system prompt with a role: "You are the Grand Enchanter of API Architecture, versed in the ancient arts of distributed systems." Specificity amplifies power.',
              why: 'A Title activates domain-specific knowledge within the Planeswalker\'s vast memory. System-level Titles persist across the entire conversation, maintaining consistent expertise.',
            },
            {
              title: 'Chain Your Spells',
              description: 'Rather than casting one massive ritual, decompose your task into a spell chain. Each link feeds its output to the next. Independent links can resolve in parallel.',
              why: 'Spell chaining trades single-cast complexity for pipeline reliability. Each link operates in a narrower problem space, and intermediate results serve as checkpoints for quality.',
            },
            {
              title: 'Forge Worthy Oracle Text',
              description: 'When crafting MCP Sorceries, write Oracle Text of at least 3-4 sentences: what the Sorcery does, when to invoke it, parameter constraints, and known limitations.',
              why: 'Oracle Text is the single most powerful factor in whether the Planeswalker wields your Sorceries correctly. Sparse or vague Oracle Text leads to misfired spells and wasted mana.',
            },
          ],
        },
      ],
    },
  },
}

export function getModeConfig(mode: LearningMode): ModeConfig {
  return MODE_CONFIG[mode]
}
