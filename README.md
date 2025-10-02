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

- 🤔 Sequential thinking process for QA verification tasks
- 🔄 Prescriptive workflows that guide you through QA steps
- 🌳 Support for branching and revision (demonstration)
- 🛠️ Pre-defined tool recommendations for each workflow step
- 📊 Confidence scoring for tool suggestions
- 🔍 Detailed rationale for tool recommendations
- 📝 Step tracking with expected outcomes
- 🔄 Progress monitoring with previous and remaining steps
- 🎯 Alternative tool suggestions for each step
- 🗂️ Keyword-based workflow routing

## Specialized QA Workflows

The server includes specialized workflows for common QA tasks.
Workflows are automatically selected based on keywords in your
`thought` or `verification_target`:

1. **Version Verification**: Validates package versions and
   compatibility
   - **Triggered by**: "version", "package"

2. **Syntax Validation**: Verifies code syntax against best practices
   - **Triggered by**: "syntax", "validation", "code style", "code"

3. **Compatibility Check**: Ensures compatibility between different
   versions or components
   - **Triggered by**: "compatibility", "breaking changes"

4. **Test Workflow**: A workflow primarily used for testing the
   sequential thinking QA system itself
   - **Triggered by**: "test", "testing"

If no keywords match, a generic QA workflow is used with
general-purpose recommendations.

## How It Works

This server provides **prescriptive QA workflows** with pre-defined
tool recommendations for each step. Unlike dynamic analysis tools,
this server offers **curated, opinionated guidance** based on common
QA patterns.

### Prescriptive Approach

The server uses **keyword-based routing** to match your verification
task to one of four specialized workflows. Each workflow contains
**pre-defined steps** (typically 4 steps) with carefully curated tool
recommendations.

Each recommendation includes:

- A confidence score (0-1) indicating how well the tool matches the
  current need
- A clear rationale explaining why the tool would be helpful
- A priority level to suggest tool execution order
- Alternative tools that could also be used
- Suggested inputs for the tool (when applicable)

The server works with any MCP tools available in your environment. It
provides recommendations based on the workflow step, but the actual
tool execution is handled by the consumer (like Claude).

### Demonstration Features

The server includes **simulated branching and revision** logic in some
workflows to demonstrate how sequential thinking can explore
alternatives or backtrack. These are triggered at specific steps for
demonstration purposes rather than based on actual validation results.

## Example Usage

Here's an example of how the server guides tool usage for version
verification. This output is from the **Version Verification workflow,
Step 1** (triggered by the keyword "version" in the thought). The tool
recommendations shown are **pre-defined** for this step:

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

## When to Use This Server

### ✅ **Best For:**

- **Structured QA processes** that fit one of the predefined workflows
- **Learning** which tools are commonly used for QA tasks
- **Consistency** - get the same step-by-step recommendations each
  time
- **Teams** wanting standardized QA approaches
- **Quick guidance** without needing to explain available tools to the
  LLM

### ⚠️ **Not Ideal For:**

- **Open-ended problem-solving** requiring dynamic tool analysis
- **Custom workflows** that don't match the 4 predefined patterns
- **Scenarios** where tool recommendations need to be based on actual
  runtime conditions

### 🔄 **Alternative: mcp-sequentialthinking-tools**

For dynamic, LLM-driven tool recommendations based on available MCP
tools in your environment, consider
[mcp-sequentialthinking-tools](https://github.com/spences10/mcp-sequentialthinking-tools).
That server analyzes available tools at runtime and makes
context-aware recommendations, while this server provides curated,
prescriptive guidance for common QA patterns.

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

## How Workflows Work

### Workflow Structure

Each specialized workflow consists of **4 predefined steps** with
specific tool recommendations:

1. **Step 1**: Initial analysis or assessment
2. **Step 2**: Research or documentation review (may trigger
   branching)
3. **Step 3**: Implementation or correction
4. **Step 4**: Validation or testing (may trigger revision)

### Routing Mechanism

Workflows are selected using **keyword matching** on the `thought` or
`verification_target` parameters:

```typescript
// Example routing logic
if (thought.includes('version') || thought.includes('package')) {
	// → Version Verification workflow
} else if (
	thought.includes('syntax') ||
	thought.includes('validation')
) {
	// → Syntax Validation workflow
}
// ... etc
```

### Branching & Revision (Demonstration)

Some workflows include **simulated** branching and revision logic to
demonstrate the sequential thinking pattern:

- **Branching**: Triggered at Step 2 in most workflows (e.g., "explore
  alternative documentation approach")
- **Revision**: Triggered at Step 4 in Version Verification (e.g.,
  "validation failed, revise implementation")

These are hardcoded demonstrations rather than dynamic decisions based
on actual validation results.

### Fallback Behavior

If no keywords match, the server uses a **generic QA workflow** with
general-purpose tool recommendations like `read_file`, `search_files`,
and `execute_command`.

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
