export interface MCPTool {
  name: string;
  description: string;
  tokenCount: number;
  category: 'filesystem' | 'search' | 'database' | 'api' | 'compute' | 'misc';
  parameters: { name: string; type: string; description: string }[];
}

export const SAMPLE_TOOLS: MCPTool[] = [
  {
    name: 'read_file',
    description: 'Read the contents of a file at the given path. Returns the file content as a string. Supports text files, JSON, YAML, and other text-based formats.',
    tokenCount: 85,
    category: 'filesystem',
    parameters: [
      { name: 'path', type: 'string', description: 'Absolute path to the file' },
      { name: 'encoding', type: 'string', description: 'File encoding (default: utf-8)' },
    ],
  },
  {
    name: 'write_file',
    description: 'Write content to a file at the specified path. Creates the file if it does not exist, overwrites if it does. Use with caution on existing files.',
    tokenCount: 92,
    category: 'filesystem',
    parameters: [
      { name: 'path', type: 'string', description: 'Absolute path to write to' },
      { name: 'content', type: 'string', description: 'Content to write' },
    ],
  },
  {
    name: 'list_directory',
    description: 'List all files and directories in the specified directory path. Returns names, types, sizes, and modification timestamps for each entry.',
    tokenCount: 78,
    category: 'filesystem',
    parameters: [
      { name: 'path', type: 'string', description: 'Directory path to list' },
      { name: 'recursive', type: 'boolean', description: 'Whether to recurse into subdirectories' },
    ],
  },
  {
    name: 'search_files',
    description: 'Search for files matching a pattern in the given directory. Supports glob patterns and regex. Returns matching file paths with context.',
    tokenCount: 95,
    category: 'search',
    parameters: [
      { name: 'directory', type: 'string', description: 'Root directory to search' },
      { name: 'pattern', type: 'string', description: 'Search pattern (glob or regex)' },
      { name: 'max_results', type: 'number', description: 'Maximum number of results' },
    ],
  },
  {
    name: 'search_content',
    description: 'Search for text content within files. Performs full-text search across files in the directory. Returns matching lines with surrounding context.',
    tokenCount: 102,
    category: 'search',
    parameters: [
      { name: 'query', type: 'string', description: 'Text to search for' },
      { name: 'directory', type: 'string', description: 'Directory to search in' },
      { name: 'file_pattern', type: 'string', description: 'File pattern filter' },
    ],
  },
  {
    name: 'web_search',
    description: 'Search the web using a search engine. Returns a list of results with titles, URLs, and snippets. Use for finding documentation, articles, and references.',
    tokenCount: 88,
    category: 'search',
    parameters: [
      { name: 'query', type: 'string', description: 'Search query' },
      { name: 'num_results', type: 'number', description: 'Number of results to return' },
    ],
  },
  {
    name: 'execute_sql',
    description: 'Execute a SQL query against the connected database. Returns results as rows and columns. Supports SELECT, INSERT, UPDATE, DELETE. Use transactions for multi-statement operations.',
    tokenCount: 120,
    category: 'database',
    parameters: [
      { name: 'query', type: 'string', description: 'SQL query to execute' },
      { name: 'database', type: 'string', description: 'Database name' },
      { name: 'timeout', type: 'number', description: 'Query timeout in seconds' },
    ],
  },
  {
    name: 'list_tables',
    description: 'List all tables in the specified database with their schemas, column counts, and row estimates. Useful for database exploration and understanding data structure.',
    tokenCount: 95,
    category: 'database',
    parameters: [
      { name: 'database', type: 'string', description: 'Database name' },
      { name: 'schema', type: 'string', description: 'Schema filter' },
    ],
  },
  {
    name: 'http_request',
    description: 'Make an HTTP request to the specified URL. Supports GET, POST, PUT, DELETE, PATCH methods. Returns status code, headers, and response body. Handles JSON and form-encoded bodies.',
    tokenCount: 130,
    category: 'api',
    parameters: [
      { name: 'url', type: 'string', description: 'Request URL' },
      { name: 'method', type: 'string', description: 'HTTP method' },
      { name: 'headers', type: 'object', description: 'Request headers' },
      { name: 'body', type: 'string', description: 'Request body' },
    ],
  },
  {
    name: 'create_github_issue',
    description: 'Create a new issue in a GitHub repository. Requires owner and repo name. Supports labels, assignees, milestones, and markdown-formatted body content.',
    tokenCount: 110,
    category: 'api',
    parameters: [
      { name: 'owner', type: 'string', description: 'Repository owner' },
      { name: 'repo', type: 'string', description: 'Repository name' },
      { name: 'title', type: 'string', description: 'Issue title' },
      { name: 'body', type: 'string', description: 'Issue body (markdown)' },
      { name: 'labels', type: 'array', description: 'Labels to apply' },
    ],
  },
  {
    name: 'run_command',
    description: 'Execute a shell command in the specified working directory. Returns stdout, stderr, and exit code. Commands run in a sandboxed environment with resource limits.',
    tokenCount: 98,
    category: 'compute',
    parameters: [
      { name: 'command', type: 'string', description: 'Shell command to execute' },
      { name: 'cwd', type: 'string', description: 'Working directory' },
      { name: 'timeout', type: 'number', description: 'Timeout in milliseconds' },
    ],
  },
  {
    name: 'run_python',
    description: 'Execute a Python script or expression. Returns the output, any errors, and printed values. Has access to common data science libraries (numpy, pandas, matplotlib).',
    tokenCount: 105,
    category: 'compute',
    parameters: [
      { name: 'code', type: 'string', description: 'Python code to execute' },
      { name: 'packages', type: 'array', description: 'Required pip packages' },
    ],
  },
  {
    name: 'get_weather',
    description: 'Get current weather data for a location. Returns temperature, humidity, wind speed, conditions, and forecast. Supports city names, zip codes, and coordinates.',
    tokenCount: 82,
    category: 'misc',
    parameters: [
      { name: 'location', type: 'string', description: 'Location name or coordinates' },
    ],
  },
  {
    name: 'send_email',
    description: 'Send an email message through the configured SMTP provider. Supports HTML body, attachments, CC, BCC. Validates email addresses before sending.',
    tokenCount: 90,
    category: 'misc',
    parameters: [
      { name: 'to', type: 'string', description: 'Recipient email' },
      { name: 'subject', type: 'string', description: 'Email subject' },
      { name: 'body', type: 'string', description: 'Email body (HTML supported)' },
    ],
  },
  {
    name: 'manage_calendar',
    description: 'Create, update, or delete calendar events. Supports recurring events, attendees, reminders, and timezone handling. Returns event details and conflicts.',
    tokenCount: 95,
    category: 'misc',
    parameters: [
      { name: 'action', type: 'string', description: 'create, update, or delete' },
      { name: 'title', type: 'string', description: 'Event title' },
      { name: 'start', type: 'string', description: 'Start datetime (ISO 8601)' },
      { name: 'end', type: 'string', description: 'End datetime (ISO 8601)' },
    ],
  },
  {
    name: 'translate_text',
    description: 'Translate text between languages using a translation API. Supports auto-detection of source language. Returns translated text and detected source language.',
    tokenCount: 75,
    category: 'misc',
    parameters: [
      { name: 'text', type: 'string', description: 'Text to translate' },
      { name: 'target_language', type: 'string', description: 'Target language code' },
      { name: 'source_language', type: 'string', description: 'Source language code (optional)' },
    ],
  },
  {
    name: 'vector_search',
    description: 'Perform a semantic similarity search against a vector database. Encodes the query text into an embedding and retrieves the k nearest neighbors. Supports metadata filtering and distance threshold.',
    tokenCount: 135,
    category: 'database',
    parameters: [
      { name: 'query', type: 'string', description: 'Search query text' },
      { name: 'collection', type: 'string', description: 'Vector collection name' },
      { name: 'k', type: 'number', description: 'Number of results' },
      { name: 'threshold', type: 'number', description: 'Minimum similarity threshold' },
    ],
  },
  {
    name: 'screenshot',
    description: 'Capture a screenshot of a web page or application window. Returns the image as base64-encoded PNG. Supports full page, viewport, or element-specific capture.',
    tokenCount: 88,
    category: 'misc',
    parameters: [
      { name: 'url', type: 'string', description: 'URL or window identifier' },
      { name: 'selector', type: 'string', description: 'CSS selector for element capture' },
      { name: 'full_page', type: 'boolean', description: 'Capture full page' },
    ],
  },
  {
    name: 'git_operations',
    description: 'Execute git operations on a repository. Supports status, diff, log, commit, branch, merge, and other common git commands. Returns command output and structured data.',
    tokenCount: 112,
    category: 'compute',
    parameters: [
      { name: 'operation', type: 'string', description: 'Git operation to perform' },
      { name: 'repo_path', type: 'string', description: 'Path to git repository' },
      { name: 'args', type: 'object', description: 'Operation-specific arguments' },
    ],
  },
  {
    name: 'kubernetes_kubectl',
    description: 'Execute kubectl commands against the configured Kubernetes cluster. Returns structured output for gets, describes, and logs. Supports namespace selection and context switching.',
    tokenCount: 140,
    category: 'compute',
    parameters: [
      { name: 'command', type: 'string', description: 'kubectl subcommand' },
      { name: 'resource', type: 'string', description: 'Resource type and name' },
      { name: 'namespace', type: 'string', description: 'Kubernetes namespace' },
      { name: 'output', type: 'string', description: 'Output format (json, yaml, wide)' },
    ],
  },
];

export const CATEGORY_COLORS: Record<MCPTool['category'], string> = {
  filesystem: '#4a9eff',
  search: '#00e5a0',
  database: '#a855f7',
  api: '#e5a000',
  compute: '#e55050',
  misc: '#8a9b91',
};

export const CATEGORY_LABELS: Record<MCPTool['category'], string> = {
  filesystem: 'Filesystem',
  search: 'Search',
  database: 'Database',
  api: 'API',
  compute: 'Compute',
  misc: 'Misc',
};
