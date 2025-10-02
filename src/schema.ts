import * as v from 'valibot';
import { Tool } from './types.js';

const TOOL_DESCRIPTION =
	'Sequential thinking for QA verification with tool recommendations.';

export const ToolRecommendationSchema = v.object({
	tool_name: v.pipe(v.string(), v.description('Tool name')),
	confidence: v.pipe(
		v.number(),
		v.minValue(0),
		v.maxValue(1),
		v.description('Confidence 0-1'),
	),
	rationale: v.pipe(v.string(), v.description('Why recommended')),
	priority: v.pipe(v.number(), v.description('Execution order')),
	suggested_inputs: v.optional(
		v.pipe(
			v.record(v.string(), v.unknown()),
			v.description('Suggested parameters'),
		),
	),
	alternatives: v.optional(
		v.pipe(v.array(v.string()), v.description('Alternative tools')),
	),
});

export const StepRecommendationSchema = v.object({
	step_description: v.pipe(
		v.string(),
		v.description('Step description'),
	),
	recommended_tools: v.pipe(
		v.array(ToolRecommendationSchema),
		v.description('Recommended tools'),
	),
	expected_outcome: v.pipe(
		v.string(),
		v.description('Expected outcome'),
	),
	next_step_conditions: v.optional(
		v.pipe(
			v.array(v.string()),
			v.description('Next step conditions'),
		),
	),
});

export const SequentialThinkingQASchema = v.object({
	available_mcp_tools: v.pipe(
		v.array(v.string()),
		v.description('Available tool names'),
	),
	thought: v.pipe(v.string(), v.description('Current thinking step')),
	next_thought_needed: v.pipe(
		v.boolean(),
		v.description('More thoughts needed'),
	),
	thought_number: v.pipe(
		v.number(),
		v.minValue(1),
		v.description('Current thought number'),
	),
	total_thoughts: v.pipe(
		v.number(),
		v.minValue(1),
		v.description('Total thoughts'),
	),
	verification_target: v.optional(
		v.pipe(v.string(), v.description('What is being verified')),
	),
	is_revision: v.optional(
		v.pipe(v.boolean(), v.description('Is revision')),
	),
	revises_thought: v.optional(
		v.pipe(
			v.number(),
			v.minValue(1),
			v.description('Revises thought number'),
		),
	),
	branch_from_thought: v.optional(
		v.pipe(
			v.number(),
			v.minValue(1),
			v.description('Branch from thought'),
		),
	),
	branch_id: v.optional(
		v.pipe(v.string(), v.description('Branch ID')),
	),
	needs_more_thoughts: v.optional(
		v.pipe(v.boolean(), v.description('Needs more thoughts')),
	),
	current_step: v.optional(
		v.pipe(StepRecommendationSchema, v.description('Current step')),
	),
	previous_steps: v.optional(
		v.pipe(
			v.array(StepRecommendationSchema),
			v.description('Previous steps'),
		),
	),
	remaining_steps: v.optional(
		v.pipe(v.array(v.string()), v.description('Remaining steps')),
	),
});

export const SEQUENTIAL_THINKING_QA_TOOL: Tool = {
	name: 'sequentialthinking_qa',
	description: TOOL_DESCRIPTION,
	inputSchema: {}, // This will be handled by tmcp with the schema above
};
