#!/usr/bin/env node

// adapted from https://github.com/modelcontextprotocol/servers/blob/main/src/sequentialthinking/index.ts

import { McpServer } from 'tmcp';
import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import { StdioTransport } from '@tmcp/transport-stdio';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { sequential_thinking_qa_schema } from './schema.js';
import { handle_sequential_thinking_qa } from './server.js';
import { StepRecommendation, ThoughtData } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(
	readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
);
const { name, version, description } = pkg;

// Create adapter and server
const adapter = new ValibotJsonSchemaAdapter();
const server = new McpServer(
	{
		name,
		version,
		description,
	},
	{
		adapter,
		capabilities: {
			tools: { listChanged: true },
		},
	},
);

class ToolAwareSequentialThinkingServer {
	private thought_history: ThoughtData[] = [];
	private branches: Record<string, ThoughtData[]> = {};

	private validate_thought_data(input: unknown): ThoughtData {
		const data = input as Record<string, unknown>;

		if (!data.thought || typeof data.thought !== 'string') {
			throw new Error('Invalid thought: must be a string');
		}
		if (
			!data.thought_number ||
			typeof data.thought_number !== 'number'
		) {
			throw new Error('Invalid thought_number: must be a number');
		}
		if (
			!data.total_thoughts ||
			typeof data.total_thoughts !== 'number'
		) {
			throw new Error('Invalid total_thoughts: must be a number');
		}
		if (typeof data.next_thought_needed !== 'boolean') {
			throw new Error(
				'Invalid next_thought_needed: must be a boolean',
			);
		}

		const validated: ThoughtData = {
			thought: data.thought,
			thought_number: data.thought_number,
			total_thoughts: data.total_thoughts,
			next_thought_needed: data.next_thought_needed,
			is_revision: data.is_revision as boolean | undefined,
			revises_thought: data.revises_thought as number | undefined,
			branch_from_thought: data.branch_from_thought as
				| number
				| undefined,
			branch_id: data.branch_id as string | undefined,
			needs_more_thoughts: data.needs_more_thoughts as
				| boolean
				| undefined,
			verification_target: data.verification_target as
				| string
				| undefined,
		};

		// Validate recommendation-related fields if present
		if (data.current_step) {
			validated.current_step =
				data.current_step as StepRecommendation;
		}

		if (data.previous_steps) {
			if (!Array.isArray(data.previous_steps)) {
				throw new Error('previous_steps must be an array');
			}
			validated.previous_steps =
				data.previous_steps as StepRecommendation[];
		}

		if (data.remaining_steps) {
			if (!Array.isArray(data.remaining_steps)) {
				throw new Error('remaining_steps must be an array');
			}
			validated.remaining_steps = data.remaining_steps as string[];
		}

		return validated;
	}

	private format_recommendation(step: StepRecommendation): string {
		const tools = step.recommended_tools
			.map((tool) => {
				const alternatives = tool.alternatives?.length
					? ` (alternatives: ${tool.alternatives.join(', ')})`
					: '';
				const inputs = tool.suggested_inputs
					? `\n    Suggested inputs: ${JSON.stringify(tool.suggested_inputs)}`
					: '';
				return `  - ${tool.tool_name} (priority: ${tool.priority})${alternatives}
    Rationale: ${tool.rationale}${inputs}`;
			})
			.join('\n');

		return `Step: ${step.step_description}
Recommended Tools:
${tools}
Expected Outcome: ${step.expected_outcome}${
			step.next_step_conditions
				? `\nConditions for next step:\n  - ${step.next_step_conditions.join('\n  - ')}`
				: ''
		}`;
	}

	private format_thought(thought_data: ThoughtData): string {
		const {
			thought_number,
			total_thoughts,
			thought,
			is_revision,
			revises_thought,
			branch_from_thought,
			branch_id,
			current_step,
		} = thought_data;

		let prefix = '';
		let context = '';

		if (is_revision) {
			prefix = chalk.yellow('🔄 Revision');
			context = ` (revising thought ${revises_thought})`;
		} else if (branch_from_thought) {
			prefix = chalk.green('🌿 Branch');
			context = ` (from thought ${branch_from_thought}, ID: ${branch_id})`;
		} else {
			prefix = chalk.blue('💭 Thought');
			context = '';
		}

		const header = `${prefix} ${thought_number}/${total_thoughts}${context}`;
		let content = thought;

		// Add recommendation information if present
		if (current_step) {
			content = `${thought}\n\nRecommendation:\n${this.format_recommendation(current_step)}`;
		}

		const border = '─'.repeat(
			Math.max(header.length, content.length) + 4,
		);

		return `
┌${border}┐
│ ${header} │
├${border}┤
│ ${content.padEnd(border.length - 2)} │
└${border}┘`;
	}

	public async process_thought(input: unknown): Promise<{
		content: Array<{ type: 'text'; text: string }>;
		isError?: boolean;
	}> {
		try {
			const validated_input = this.validate_thought_data(input);

			if (
				validated_input.thought_number >
				validated_input.total_thoughts
			) {
				validated_input.total_thoughts =
					validated_input.thought_number;
			}

			// Store the current step in thought history
			if (validated_input.current_step) {
				if (!validated_input.previous_steps) {
					validated_input.previous_steps = [];
				}
				validated_input.previous_steps.push(
					validated_input.current_step,
				);
			}

			this.thought_history.push(validated_input);

			if (
				validated_input.branch_from_thought &&
				validated_input.branch_id
			) {
				if (!this.branches[validated_input.branch_id]) {
					this.branches[validated_input.branch_id] = [];
				}
				this.branches[validated_input.branch_id].push(
					validated_input,
				);
			}

			const formatted_thought = this.format_thought(validated_input);
			console.error(formatted_thought);

			return {
				content: [
					{
						type: 'text' as const,
						text: JSON.stringify(
							{
								thought_number: validated_input.thought_number,
								total_thoughts: validated_input.total_thoughts,
								next_thought_needed:
									validated_input.next_thought_needed,
								branches: Object.keys(this.branches),
								thought_history_length: this.thought_history.length,
								current_step: validated_input.current_step,
								previous_steps: validated_input.previous_steps,
								remaining_steps: validated_input.remaining_steps,
							},
							null,
							2,
						),
					},
				],
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text' as const,
						text: JSON.stringify(
							{
								error:
									error instanceof Error
										? error.message
										: String(error),
								status: 'failed',
							},
							null,
							2,
						),
					},
				],
				isError: true,
			};
		}
	}
}

const thinking_server = new ToolAwareSequentialThinkingServer();

// Register the sequential thinking QA tool
server.tool(
	{
		name: 'sequentialthinking_qa',
		description:
			'A tool for QA-focused sequential thinking with tool recommendations for verification tasks',
		schema: sequential_thinking_qa_schema,
	},
	async (input) => {
		// Process the input through our QA workflows
		const result = await handle_sequential_thinking_qa(input);
		return thinking_server.process_thought(result);
	},
);

async function run_server() {
	const transport = new StdioTransport(server);
	transport.listen();
	console.error('Sequential Thinking QA MCP Server running on stdio');
}

run_server().catch((error) => {
	console.error('Fatal error running server:', error);
	process.exit(1);
});
