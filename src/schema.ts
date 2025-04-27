import { z } from 'zod';

// Define the schema for recommended tools
const recommended_tool_schema = z.object({
	tool_name: z.string(),
	confidence: z.number().min(0).max(1),
	rationale: z.string(),
	priority: z.number().int().positive(),
	alternatives: z.array(z.string()).optional(),
	suggested_inputs: z.record(z.unknown()).optional(),
});

// Define the schema for current step
const step_recommendation_schema = z.object({
	step_description: z.string(),
	expected_outcome: z.string(),
	recommended_tools: z.array(recommended_tool_schema),
	next_step_conditions: z.array(z.string()),
});

// Define the main schema for the sequentialthinking_qa tool
export const SEQUENTIAL_THINKING_TOOL = {
	name: 'sequentialthinking_qa',
	description:
		'A tool for QA-focused sequential thinking with tool recommendations for verification tasks',
	inputSchema: {
		type: 'object' as const,
		properties: {
			thought: {
				type: 'string' as const,
				description: 'Your current thinking step in the QA process',
			},
			next_thought_needed: {
				type: 'boolean' as const,
				description: 'Whether another thought step is needed',
			},
			thought_number: {
				type: 'integer' as const,
				description: 'Current thought number',
			},
			total_thoughts: {
				type: 'integer' as const,
				description: 'Estimated total thoughts needed',
			},
			verification_target: {
				type: 'string' as const,
				description: "What's being verified (code, config, etc.)",
			},
			current_step: {
				type: 'object' as const,
				description: 'Current step recommendation',
				properties: {
					step_description: {
						type: 'string' as const,
						description: 'What needs to be done',
					},
					recommended_tools: {
						type: 'array' as const,
						description:
							'Array of tool recommendations with confidence scores',
						items: {
							type: 'object' as const,
							properties: {
								tool_name: {
									type: 'string' as const,
									description: 'Name of the recommended tool',
								},
								confidence: {
									type: 'number' as const,
									description: 'Confidence score (0-1)',
								},
								rationale: {
									type: 'string' as const,
									description: 'Why this tool is recommended',
								},
								priority: {
									type: 'integer' as const,
									description:
										'Priority level (lower is higher priority)',
								},
								alternatives: {
									type: 'array' as const,
									description: 'Alternative tools that could be used',
									items: {
										type: 'string' as const,
									},
								},
								suggested_inputs: {
									type: 'object' as const,
									description: 'Suggested inputs for the tool',
								},
							},
							required: [
								'tool_name',
								'confidence',
								'rationale',
								'priority',
							],
						},
					},
					expected_outcome: {
						type: 'string' as const,
						description: 'What to expect from this step',
					},
					next_step_conditions: {
						type: 'array' as const,
						description: 'Conditions for next step',
						items: {
							type: 'string' as const,
						},
					},
				},
				required: [
					'step_description',
					'recommended_tools',
					'expected_outcome',
				],
			},
			previous_steps: {
				type: 'array' as const,
				description: 'Steps already recommended',
				items: {
					type: 'object' as const,
				},
			},
			remaining_steps: {
				type: 'array' as const,
				description: 'High-level descriptions of upcoming steps',
				items: {
					type: 'string' as const,
				},
			},
		},
		required: [
			'thought',
			'next_thought_needed',
			'thought_number',
			'total_thoughts',
		],
	},
};
