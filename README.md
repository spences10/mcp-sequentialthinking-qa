# mcp-sequentialthinking-qa

An adaptation of the
[MCP Sequential Thinking Server](https://github.com/modelcontextprotocol/servers/blob/main/src/sequentialthinking/index.ts)
designed to guide tool usage in QA and verification processes. This
server helps break down verification tasks into manageable steps and
provides recommendations for which MCP tools would be most effective
at each stage.

A Model Context Protocol (MCP) server that combines sequential
thinking with intelligent tool suggestions for QA tasks. For each step
in the verification process, it provides confidence-scored
recommendations for which tools to use, along with rationale for why
each tool would be appropriate.

## Features

- 🤔 Dynamic and reflective problem-solving through sequential
  thoughts
- 🔄 Flexible thinking process that adapts and evolves
- 🌳 Support for branching and revision of thoughts
- 🛠️ Intelligent tool recommendations for each QA step
- 📊 Confidence scoring for tool suggestions
- 🔍 Detailed rationale for tool recommendations
- 📝 Step tracking with expected outcomes
- 🔄 Progress monitoring with previous and remaining steps
- 🎯 Alternative tool suggestions for each step

## Specialized QA Workflows

The server includes specialized workflows for common QA tasks:

1. **Version Verification**: Validates package versions and
   compatibility
2. **Syntax Validation**: Verifies code syntax against best practices
3. **Compatibility Check**: Ensures compatibility between different
   versions or components
4. **Test Workflow**: A workflow primarily used for testing the
   sequential thinking QA system itself.

## How It Works

This server analyses each step of your verification process and
recommends appropriate MCP tools to help accomplish the task. Each
recommendation includes:

- A confidence score (0-1) indicating how well the tool matches the
  current need
- A clear rationale explaining why the tool would be helpful
- A priority level to suggest tool execution order
- Alternative tools that could also be used

The server works with any MCP tools available in your environment. It
provides recommendations based on the current step's requirements, but
the actual tool execution is handled by the consumer (like Claude).

The server also supports creating branches to explore different
approaches or revising previous thoughts to correct errors or
incorporate new information, allowing for a flexible and adaptive QA
process.

## Example Usage

Here's an example of how the server guides tool usage for version
verification:

```json
{
	"thought": "Need to verify Tailwind CSS version before implementing configuration",
	"current_step": {
		"step_description": "Check installed Tailwind version in package.json",
		"expected_outcome": "Confirmed Tailwind version",
		"recommended_tools": [
			{
				"tool_name": "read_file",
				"confidence": 0.9,
				"rationale": "Examine package.json to determine installed version",
				"priority": 1
			},
			{
				"tool_name": "execute_command",
				"confidence": 0.7,
				"rationale": "Run npm list to check installed version",
				"priority": 2
			}
		],
		"next_step_conditions": [
			"Version identified",
			"Check for breaking changes between versions"
		]
	},
	"thought_number": 1,
	"total_thoughts": 4,
	"next_thought_needed": true
}
```

The server tracks your progress and supports:

- Creating branches to explore different approaches
- Revising previous thoughts with new information
- Maintaining context across multiple steps
- Suggesting next steps based on current findings

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
			"args": ["-y", "mcp-sequentialthinking-qa"]
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
				"source ~/.nvm/nvm.sh && /home/username/.nvm/versions/node/v20.12.1/bin/npx mcp-sequentialthinking-qa"
			]
		}
	}
}
```

## API

The server implements a single MCP tool with configurable parameters:

### sequentialthinking_qa

A tool for QA-focused sequential thinking with tool recommendations
for verification tasks.

Parameters:

- `thought` (string, required): Your current thinking step in the QA
  process
- `next_thought_needed` (boolean, required): Whether another thought
  step is needed
- `thought_number` (integer, required): Current thought number
- `total_thoughts` (integer, required): Estimated total thoughts
  needed
- `verification_target` (string, optional): What's being verified
  (code, config, etc.)
- `current_step` (object, optional): Current step recommendation with:
  - `step_description`: What needs to be done
  - `recommended_tools`: Array of tool recommendations with confidence
    scores
  - `expected_outcome`: What to expect from this step
  - `next_step_conditions`: Conditions for next step
- `previous_steps` (array, optional): Steps already recommended
- `remaining_steps` (array, optional): High-level descriptions of
  upcoming steps

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
