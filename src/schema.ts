import * as v from 'valibot';

// Define the schema for recommended tools
export const recommended_tool_schema = v.object({
	tool_name: v.string(),
	confidence: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
	rationale: v.string(),
	priority: v.pipe(v.number(), v.integer()),
	alternatives: v.optional(v.array(v.string())),
	suggested_inputs: v.optional(v.record(v.string(), v.unknown())),
});

// Define the schema for current step
export const step_recommendation_schema = v.object({
	step_description: v.string(),
	expected_outcome: v.string(),
	recommended_tools: v.array(recommended_tool_schema),
	next_step_conditions: v.array(v.string()),
});

// Define the main schema for the sequentialthinking_qa tool input
export const sequential_thinking_qa_schema = v.object({
	thought: v.pipe(
		v.string(),
		v.description('Your current thinking step in the QA process'),
	),
	next_thought_needed: v.pipe(
		v.boolean(),
		v.description('Whether another thought step is needed'),
	),
	thought_number: v.pipe(
		v.number(),
		v.integer(),
		v.description('Current thought number'),
	),
	total_thoughts: v.pipe(
		v.number(),
		v.integer(),
		v.description('Estimated total thoughts needed'),
	),
	verification_target: v.optional(
		v.pipe(
			v.string(),
			v.description("What's being verified (code, config, etc.)"),
		),
	),
	current_step: v.optional(
		v.pipe(
			step_recommendation_schema,
			v.description('Current step recommendation'),
		),
	),
	previous_steps: v.optional(
		v.pipe(
			v.array(step_recommendation_schema),
			v.description('Steps already recommended'),
		),
	),
	remaining_steps: v.optional(
		v.pipe(
			v.array(v.string()),
			v.description('High-level descriptions of upcoming steps'),
		),
	),
	available_client_tools: v.optional(
		v.pipe(
			v.array(v.string()),
			v.description(
				'Optional: List of tool names available to the calling LLM',
			),
		),
	),
});
