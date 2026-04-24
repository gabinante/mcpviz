export interface ToolVariant {
  name: string;
  descriptions: {
    label: string;
    text: string;
    tokenCount: number;
  }[];
}

export interface DescriptionScenario {
  id: string;
  name: string;
  userQuery: string;
  tools: {
    name: string;
    description: string;
    isCorrectChoice: boolean;
    selectionProbability: number; // 0-1, simulated probability model picks this tool
  }[];
}

export const DESCRIPTION_SCENARIOS: DescriptionScenario[] = [
  {
    id: 'ambiguous-search',
    name: 'The "Search" Problem',
    userQuery: 'Search for the authentication bug in our codebase',
    tools: [
      {
        name: 'search_files',
        description: 'Search for files matching a pattern.',
        isCorrectChoice: false,
        selectionProbability: 0.25,
      },
      {
        name: 'search_content',
        description: 'Search for text content within files.',
        isCorrectChoice: true,
        selectionProbability: 0.35,
      },
      {
        name: 'web_search',
        description: 'Search the web for information.',
        isCorrectChoice: false,
        selectionProbability: 0.40,
      },
    ],
  },
  {
    id: 'improved-search',
    name: 'Better Descriptions',
    userQuery: 'Search for the authentication bug in our codebase',
    tools: [
      {
        name: 'search_files',
        description: 'Find files by name/path pattern in the local project directory. Use when you need to locate a file by its filename, extension, or directory path. Returns file paths only, not file contents.',
        isCorrectChoice: false,
        selectionProbability: 0.05,
      },
      {
        name: 'search_content',
        description: 'Search inside files for matching text/code. Use when you need to find specific code, function names, error messages, or text strings within the project source code. Returns matching lines with file paths and line numbers.',
        isCorrectChoice: true,
        selectionProbability: 0.90,
      },
      {
        name: 'web_search',
        description: 'Search the public internet. Use when you need external documentation, Stack Overflow answers, or information not available in the local project. NEVER use for searching local code or files.',
        isCorrectChoice: false,
        selectionProbability: 0.05,
      },
    ],
  },
  {
    id: 'ambiguous-read',
    name: 'The "Read" Problem',
    userQuery: 'Read the database schema',
    tools: [
      {
        name: 'read_file',
        description: 'Read the contents of a file.',
        isCorrectChoice: false,
        selectionProbability: 0.45,
      },
      {
        name: 'list_tables',
        description: 'List database tables and their schemas.',
        isCorrectChoice: true,
        selectionProbability: 0.30,
      },
      {
        name: 'execute_sql',
        description: 'Execute a SQL query against the database.',
        isCorrectChoice: false,
        selectionProbability: 0.25,
      },
    ],
  },
  {
    id: 'improved-read',
    name: 'Better Descriptions',
    userQuery: 'Read the database schema',
    tools: [
      {
        name: 'read_file',
        description: 'Read a local file from disk by its file path. For reading source code, configuration files, documentation, etc. Cannot access databases or remote resources.',
        isCorrectChoice: false,
        selectionProbability: 0.10,
      },
      {
        name: 'list_tables',
        description: 'Inspect the live database structure: list all tables with their column names, types, constraints, and row counts. Use this FIRST when exploring a database you are unfamiliar with.',
        isCorrectChoice: true,
        selectionProbability: 0.82,
      },
      {
        name: 'execute_sql',
        description: 'Run a raw SQL query for data retrieval or modification. Prefer list_tables for schema exploration. Use execute_sql when you need specific data or need to run INSERT/UPDATE/DELETE operations.',
        isCorrectChoice: false,
        selectionProbability: 0.08,
      },
    ],
  },
];

export const DESCRIPTION_TIPS = [
  {
    title: 'Be Specific About Scope',
    bad: 'Search for files.',
    good: 'Find files by name/path pattern in the local project directory.',
    improvement: 'Clarifies what "search" means and where it operates',
  },
  {
    title: 'Include When-to-Use Guidance',
    bad: 'Execute a SQL query.',
    good: 'Run a raw SQL query. Prefer list_tables for schema exploration.',
    improvement: 'Helps model choose between similar tools',
  },
  {
    title: 'State What It Does NOT Do',
    bad: 'Read file contents.',
    good: 'Read a local file from disk. Cannot access databases or remote resources.',
    improvement: 'Negative constraints prevent wrong tool selection',
  },
  {
    title: 'Add Examples in Description',
    bad: 'Search the web.',
    good: 'Search the public internet for documentation, Stack Overflow, etc. NEVER use for local code.',
    improvement: 'Concrete examples and anti-examples clarify intent',
  },
];
