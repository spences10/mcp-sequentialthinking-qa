# MCP Sequential Thinking QA Tool - Architecture Plan

## 1. Core Concept

A specialized adaptation of the sequential thinking server that guides
LLMs through structured QA processes, breaking down verification tasks
into logical steps. It supports dynamic and reflective problem-solving
through features like step-by-step progression, revision of previous
thoughts, and branching into alternative lines of reasoning. The tool
recommends appropriate tools for each step.

## 2. Key Components

### 2.1 QA-Focused Sequential Thinking Engine

- Maintains the core sequential thinking approach (steps, total
  thoughts)
- **Incorporates revision and branching logic** to support non-linear
  problem-solving
- Specializes in breaking down QA/verification tasks
- Tracks progress through verification workflows, including branches
  and revisions

### 2.2 QA Tool Recommendation System

- Suggests appropriate verification tools for each step
- Provides confidence scores for tool recommendations
- Explains rationale for suggested tools
- Offers alternative tools when appropriate
- **Recommendations are based on the current step, verification
  target, and potentially the nature of the thought (sequential,
  revision, branch)**
- **Tool recommendations are filtered or prioritized based on the list
  of tools available to the calling LLM.**

### 2.3 QA Step Templates

- Pre-defined verification workflows for common scenarios (e.g.,
  version, syntax, compatibility, test)
- Customizable templates for different types of projects
- **Workflows can define conditions that lead to revisions or
  branches**
- Special focus on version compatibility checks

## 3. Tool Interface

```typescript
interface SequentialThinkingQAParams {
	// The current thinking step in the QA process
	thought: string;

	// Whether another thought step is needed
	next_thought_needed: boolean;

	// Current thought number
	thought_number: number;

	// Estimated total thoughts needed
	total_thoughts: number;

	// Optional: Whether this revises previous thinking
	is_revision?: boolean;

	// Optional: Which thought is being reconsidered (used with is_revision)
	revises_thought?: number;

	// Optional: Branching point thought number (used with branch_id)
	branch_from_thought?: number;

	// Optional: Branch identifier (used with branch_from_thought)
	branch_id?: string;

	// Optional: If more thoughts are needed (can override total_thoughts)
	needs_more_thoughts?: boolean;

	// Optional: What's being verified (code, config, etc.)
	verification_target?: string;

	// Optional: List of tool names available to the calling LLM
	available_client_tools?: string[];

	// Optional: Current step details
	current_step?: {
		step_description: string;
		expected_outcome: string;
		recommended_tools: Array<{
			tool_name: string;
			confidence: number;
			rationale: string;
			priority: number;
			alternatives?: string[]; // Added alternatives based on analysis
			suggested_inputs?: Record<string, unknown>; // Added suggested_inputs
		}>;
		next_step_conditions: string[];
	};

	// Optional: Previous verification steps (using StepRecommendation interface)
	previous_steps?: Array<StepRecommendation>; // Updated type

	// Optional: Remaining verification steps
	remaining_steps?: Array<string>;
}

// Added interface for StepRecommendation based on types.ts
interface StepRecommendation {
	step_description: string;
	expected_outcome: string;
	recommended_tools: Array<{
		tool_name: string;
		confidence: number;
		rationale: string;
		priority: number;
		alternatives?: string[];
		suggested_inputs?: Record<string, unknown>;
	}>;
	next_step_conditions: string[];
}
```

## 4. QA Workflow Examples

### 4.1 Package Version Verification Workflow

For the Tailwind CSS v3 vs v4 example:

1. **Initial Assessment**:

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
   				"rationale": "Run npm list or similar command to check installed version",
   				"priority": 2,
   				"alternatives": [
   					"execute_command (yarn list)",
   					"execute_command (pnpm list)"
   				]
   			}
   		],
   		"next_step_conditions": [
   			"Version identified",
   			"Check for breaking changes between versions"
   		]
   	},
   	"thought_number": 1,
   	"total_thoughts": 4,
   	"next_thought_needed": true,
   	"verification_target": "Tailwind CSS version"
   }
   ```

2. **Documentation Check**:

   ```json
   {
   	"thought": "Need to check official documentation for the identified Tailwind version",
   	"current_step": {
   		"step_description": "Retrieve current Tailwind configuration approach from docs",
   		"expected_outcome": "Understanding of correct configuration pattern",
   		"recommended_tools": [
   			{
   				"tool_name": "browser_navigate",
   				"confidence": 0.9,
   				"rationale": "Navigate to official Tailwind documentation",
   				"priority": 1,
   				"suggested_inputs": {
   					"url": "https://tailwindcss.com/docs"
   				}
   			},
   			{
   				"tool_name": "browser_action",
   				"confidence": 0.8,
   				"rationale": "Browse documentation site to find relevant sections",
   				"priority": 2
   			},
   			{
   				"tool_name": "use_mcp_tool",
   				"confidence": 0.7,
   				"rationale": "Use a search tool (like Brave or Kagi) to find specific documentation pages",
   				"priority": 3,
   				"alternatives": [
   					"mcp-omnisearch:brave_search",
   					"mcp-omnisearch:kagi_search"
   				],
   				"suggested_inputs": {
   					"server_name": "mcp-omnisearch",
   					"tool_name": "brave_search",
   					"arguments": { "query": "Tailwind CSS v4 configuration" }
   				}
   			}
   		],
   		"next_step_conditions": [
   			"Configuration approach identified",
   			"Breaking changes noted"
   		]
   	},
   	"thought_number": 2,
   	"total_thoughts": 4,
   	"next_thought_needed": true,
   	"verification_target": "Tailwind CSS configuration"
   }
   ```

3. **Implementation Planning**:

   ```json
   {
   	"thought": "Plan implementation based on correct version information",
   	"current_step": {
   		"step_description": "Design configuration approach for Tailwind v4",
   		"expected_outcome": "Version-appropriate implementation plan",
   		"recommended_tools": [
   			{
   				"tool_name": "write_to_file",
   				"confidence": 0.8,
   				"rationale": "Create appropriate configuration file (e.g., tailwind.config.js)",
   				"priority": 1,
   				"suggested_inputs": {
   					"path": "tailwind.config.js",
   					"content": "// Initial Tailwind config"
   				}
   			},
   			{
   				"tool_name": "replace_in_file",
   				"confidence": 0.7,
   				"rationale": "Update existing configuration files if they exist",
   				"priority": 2
   			}
   		],
   		"next_step_conditions": [
   			"Configuration designed",
   			"Ready for validation"
   		]
   	},
   	"thought_number": 3,
   	"total_thoughts": 4,
   	"next_thought_needed": true,
   	"verification_target": "Tailwind CSS configuration implementation"
   }
   ```

4. **Validation**:
   ```json
   {
   	"thought": "Validate the implementation works with installed version",
   	"current_step": {
   		"step_description": "Test configuration with installed Tailwind version",
   		"expected_outcome": "Confirmed working configuration",
   		"recommended_tools": [
   			{
   				"tool_name": "execute_command",
   				"confidence": 0.9,
   				"rationale": "Run build process or development server to verify configuration",
   				"priority": 1,
   				"suggested_inputs": {
   					"command": "npm run build",
   					"requires_approval": false
   				}
   			},
   			{
   				"tool_name": "browser_action",
   				"confidence": 0.7,
   				"rationale": "Visually verify styles are applied correctly in a browser",
   				"priority": 2
   			}
   		],
   		"next_step_conditions": []
   	},
   	"thought_number": 4,
   	"total_thoughts": 4,
   	"next_thought_needed": false,
   	"verification_target": "Tailwind CSS configuration validation"
   }
   ```

**Example of Revision/Branching in a Workflow:**

Imagine after Step 4 (Validation), the build fails due to a syntax
error. The workflow could respond with:

```json
{
	"thought": "Build failed due to syntax error. Revising implementation step.",
	"is_revision": true,
	"revises_thought": 3, // Revising the Implementation Planning step
	"current_step": {
		"step_description": "Revise Tailwind configuration implementation to fix syntax errors.",
		"expected_outcome": "Syntax errors resolved in configuration files.",
		"recommended_tools": [
			{
				"tool_name": "read_file",
				"confidence": 0.9,
				"rationale": "Examine the build output or linter errors to identify the syntax issue.",
				"priority": 1
			},
			{
				"tool_name": "replace_in_file",
				"confidence": 0.9,
				"rationale": "Correct the syntax errors in the configuration file.",
				"priority": 1
			}
		],
		"next_step_conditions": [
			"Syntax errors corrected",
			"Ready to re-validate"
		]
	},
	"thought_number": 5, // This is the 5th thought overall
	"total_thoughts": 5, // Total thoughts might be adjusted
	"next_thought_needed": true,
	"verification_target": "Tailwind CSS configuration syntax"
}
```

Or, if during Step 2 (Documentation Check), multiple valid
configuration approaches are found, the workflow could suggest
branching:

```json
{
	"thought": "Multiple configuration approaches found. Branching to explore alternative method.",
	"branch_from_thought": 2, // Branching from the Documentation Check step
	"branch_id": "alternative-config-1", // Unique ID for this branch
	"current_step": {
		"step_description": "Explore alternative Tailwind configuration approach.",
		"expected_outcome": "Understanding of an alternative configuration method.",
		"recommended_tools": [
			{
				"tool_name": "browser_navigate",
				"confidence": 0.9,
				"rationale": "Navigate to documentation for the alternative approach.",
				"priority": 1
			},
			{
				"tool_name": "read_file",
				"confidence": 0.8,
				"rationale": "Examine example files using the alternative approach.",
				"priority": 2
			}
		],
		"next_step_conditions": [
			"Alternative approach understood",
			"Ready to compare or implement"
		]
	},
	"thought_number": 3, // This is the 3rd thought in this branch
	"total_thoughts": 4, // Total thoughts for this branch
	"next_thought_needed": true,
	"verification_target": "Alternative Tailwind CSS configuration"
}
```

## 5. Implementation Approach

### 5.1 Core Structure

- Maintain the same basic architecture based on the existing
  mcp-sequentialthinking-tools concepts.
- Adapt the tool recommendation logic for QA focus.
- Add QA-specific step templates.
- **Implement logic in `src/server.ts` and workflow files to handle
  and utilize `is_revision`, `revises_thought`, `branch_from_thought`,
  and `branch_id` parameters.**

### 5.2 QA-Specific Enhancements

- Add version detection capabilities.
- Implement documentation checking workflows.
- Create validation step templates.
- Build confidence scoring specific to verification tasks.
- **Ensure workflows can dynamically set revision and branching
  parameters based on step outcomes.**
- **Remove any direct recommendations or dependencies on
  `tavily_search` and update workflow recommendations to use
  alternative search/browser tools.**
- **Update the tool recommendation logic to filter or prioritize
  suggestions based on the `available_client_tools` parameter provided
  by the calling LLM.**

### 5.3 Technical Implementation

```
mcp-sequentialthinking-qa/
├── src/
│   ├── index.ts                 // Main entry point (handles core thought processing, including revisions/branches)
│   ├── server.ts                // MCP server implementation (routes to workflows, potentially handles revision/branch state)
│   ├── qa-workflows/            // QA workflow templates (implement workflow logic, set next step parameters including revision/branch)
│   │   ├── version-verification.ts
│   │   ├── syntax-validation.ts
│   │   └── compatibility-check.ts
│   │   └── test-workflow.ts     // Added test workflow based on existing file
│   ├── tool-recommender/        // Tool recommendation logic (considers step type, revision/branch context, and available client tools)
│   │   ├── index.ts
│   │   ├── confidence-calculator.ts
│   │   └── rationale-generator.ts
│   ├── types.ts                 // TypeScript type definitions (updated to include available_client_tools)
│   └── schema.ts                // Zod schema definitions (updated to include available_client_tools)
├── package.json
└── tsconfig.json
```

## 6. Next Steps

1. Refine the existing QA workflow templates
   (`version-verification.ts`, `syntax-validation.ts`,
   `compatibility-check.ts`, `test-workflow.ts`) to incorporate logic
   for suggesting revisions and branches based on potential outcomes
   (e.g., errors, multiple options).
2. Update the `src/server.ts` or core processing logic to correctly
   manage the state of revisions and branches in the thought history.
3. Ensure the tool recommendation logic considers whether the current
   step is a revision or part of a branch when suggesting tools, and
   **filters/prioritizes based on available client tools.**
4. **Remove any remaining references to `tavily_search` in the
   codebase and update workflow recommendations to use alternative
   search/browser tools.**
5. **Update `src/schema.ts` and `src/types.ts` to include the
   `available_client_tools` parameter in the
   `SequentialThinkingQAParams` interface/schema.**
6. Test the revised workflows with scenarios that require revisions or
   branching.
7. Document usage patterns for LLMs, specifically explaining how to
   interpret and utilize the revision and branching parameters, and
   how to provide the list of available tools.
