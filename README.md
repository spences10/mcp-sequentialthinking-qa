# mcp-sequentialthinking-qa

An adaptation of the
[MCP Sequential Thinking Server](https://github.com/modelcontextprotocol/servers/blob/main/src/sequentialthinking/index.ts)
designed to guide tool usage in QA and verification processes. This
server helps break down verification tasks into manageable steps and
provides LLM-driven recommendations for which MCP tools would be most
effective at each stage.

A Model Context Protocol (MCP) server that combines sequential
thinking with intelligent tool suggestions for QA tasks. For each step
in the verification process, it provides confidence-scored
recommendations for which tools to use, along with rationale for why
each tool would be appropriate.

## Features

- 🤔 Dynamic and reflective QA problem-solving through sequential
  thoughts
- 🔄 Flexible verification process that adapts and evolves
- 🌳 Support for branching and revision of thoughts
- 🛠️ LLM-driven intelligent tool recommendations for QA tasks
- 📊 Confidence scoring for tool suggestions
- 🔍 Detailed rationale for tool recommendations
- 📝 Step tracking with expected outcomes
- 🔄 Progress monitoring with previous and remaining steps
- 🎯 Alternative tool suggestions for each step
- 🧠 Memory management with configurable history limits
- 🗑️ Manual history cleanup capabilities

## How It Works

This server facilitates sequential thinking with MCP tool coordination
for QA and verification tasks. The LLM analyzes available tools and
their descriptions to make intelligent recommendations for
verification processes, which are then tracked and organized by this
server.

The workflow:

1. LLM provides available MCP tools to the sequential thinking QA
   server
2. LLM analyzes each verification step and recommends appropriate
   tools
3. Server tracks recommendations, maintains context, and manages
   memory
4. LLM executes recommended tools and continues the verification
   process

Each recommendation includes:

- A confidence score (0-1) indicating how well the tool matches the
  verification need
- A clear rationale explaining why the tool would be helpful for this
  QA step
- A priority level to suggest tool execution order
- Suggested input parameters for the tool
- Alternative tools that could also be used

The server works with any MCP tools available in your environment and
automatically manages memory to prevent unbounded growth.

## Example Usage

Here's an example of how the server guides tool usage for QA
verification:

```json
{
	"available_mcp_tools": [
		"mcp-filesystem",
		"mcp-playwright",
		"mcp-omnisearch"
	],
	"thought": "Need to verify package version compatibility before implementing configuration",
	"verification_target": "package version compatibility",
	"current_step": {
		"step_description": "Check installed package version in package.json",
		"expected_outcome": "Confirmed package version and dependencies",
		"recommended_tools": [
			{
				"tool_name": "read_file",
				"confidence": 0.95,
				"rationale": "Examine package.json to determine installed version and dependencies",
				"priority": 1,
				"suggested_inputs": {
					"path": "package.json"
				}
			},
			{
				"tool_name": "execute_command",
				"confidence": 0.75,
				"rationale": "Run npm list to verify actually installed versions",
				"priority": 2,
				"alternatives": ["pnpm list", "yarn list"]
			}
		],
		"next_step_conditions": [
			"Version identified",
			"Dependencies verified",
			"Check for breaking changes between versions"
		]
	},
	"thought_number": 1,
	"total_thoughts": 4,
	"next_thought_needed": true
}
```

The server tracks your progress and supports:

- Creating branches to explore different verification approaches
- Revising previous thoughts with new information
- Maintaining context across multiple verification steps
- Suggesting next steps based on current findings
- Adapting to the specific tools available in your environment

## Configuration

This server requires configuration through your MCP client. Here are
examples for different environments:

### Cline Configuration

Add this to your Cline MCP settings:

```json
{
	"mcpServers": {
		"mcp-sequentialthinking-qa": {
			"command": "npx",
			"args": ["-y", "mcp-sequentialthinking-qa"],
			"env": {
				"MAX_HISTORY_SIZE": "1000"
			}
		}
	}
}
```

### Claude Desktop with WSL Configuration

For WSL environments, add this to your Claude Desktop configuration:

```json
{
	"mcpServers": {
		"mcp-sequentialthinking-qa": {
			"command": "wsl.exe",
			"args": [
				"bash",
				"-c",
				"MAX_HISTORY_SIZE=1000 source ~/.nvm/nvm.sh && /home/username/.nvm/versions/node/v20.12.1/bin/npx mcp-sequentialthinking-qa"
			]
		}
	}
}
```

## API

The server implements a single MCP tool with configurable parameters:

### sequentialthinking_qa

A tool for QA-focused sequential thinking with intelligent tool
recommendations for verification tasks.

Parameters:

- `available_mcp_tools` (array, required): Array of MCP tool names
  available for use (e.g., ["mcp-omnisearch", "mcp-playwright",
  "mcp-filesystem"])
- `thought` (string, required): Your current thinking step in the QA
  process
- `next_thought_needed` (boolean, required): Whether another thought
  step is needed
- `thought_number` (integer, required): Current thought number
- `total_thoughts` (integer, required): Estimated total thoughts
  needed
- `verification_target` (string, optional): What's being verified
  (code, config, package version, etc.)
- `is_revision` (boolean, optional): Whether this revises previous
  thinking
- `revises_thought` (integer, optional): Which thought is being
  reconsidered
- `branch_from_thought` (integer, optional): Branching point thought
  number
- `branch_id` (string, optional): Branch identifier
- `needs_more_thoughts` (boolean, optional): If more thoughts are
  needed
- `current_step` (object, optional): Current step recommendation with:
  - `step_description`: What needs to be done
  - `recommended_tools`: Array of tool recommendations with confidence
    scores
  - `expected_outcome`: What to expect from this step
  - `next_step_conditions`: Conditions for next step
- `previous_steps` (array, optional): Steps already recommended
- `remaining_steps` (array, optional): High-level descriptions of
  upcoming steps

## Memory Management

The server includes built-in memory management to prevent unbounded
growth:

- **History Limit**: Configurable maximum number of thoughts to retain
  (default: 1000)
- **Automatic Trimming**: History automatically trims when limit is
  exceeded
- **Manual Cleanup**: Server provides methods to clear history when
  needed

### Configuring History Size

You can configure the history size by setting the `MAX_HISTORY_SIZE`
environment variable:

```json
{
	"mcpServers": {
		"mcp-sequentialthinking-qa": {
			"command": "npx",
			"args": ["-y", "mcp-sequentialthinking-qa"],
			"env": {
				"MAX_HISTORY_SIZE": "500"
			}
		}
	}
}
```

Or for local development:

```bash
MAX_HISTORY_SIZE=2000 npx mcp-sequentialthinking-qa
```

## Development

### Setup

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Build the project:

```bash
pnpm build
```

4. Run in development mode:

```bash
pnpm dev
```

### Publishing

The project uses changesets for version management. To publish:

1. Create a changeset:

```bash
pnpm changeset
```

2. Version the package:

```bash
pnpm changeset version
```

3. Publish to npm:

```bash
pnpm release
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built on the
  [Model Context Protocol](https://github.com/modelcontextprotocol)
- Adapted from the
  [MCP Sequential Thinking Server](https://github.com/modelcontextprotocol/servers/blob/main/src/sequentialthinking/index.ts)
- Inspired by
  [mcp-sequentialthinking-tools](https://github.com/spences10/mcp-sequentialthinking-tools)
