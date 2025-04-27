import { process_compatibility_check } from './qa-workflows/compatibility-check.js';
import { process_syntax_validation } from './qa-workflows/syntax-validation.js';
import { process_test_workflow } from './qa-workflows/test-workflow.js';
import { process_version_verification } from './qa-workflows/version-verification.js';
import { SequentialThinkingQAParams } from './types.js';

/**
 * Main handler for the sequentialthinking_qa tool
 * This function processes the incoming request and routes it to the appropriate workflow
 */
export async function handle_sequential_thinking_qa(
	params: SequentialThinkingQAParams,
): Promise<SequentialThinkingQAParams> {
	// Determine which workflow to use based on the verification target or thought content
	const thought = params.thought.toLowerCase();
	const target = params.verification_target?.toLowerCase() || '';

	// Route to the appropriate workflow
	if (
		thought.includes('version') ||
		thought.includes('package') ||
		target.includes('version') ||
		target.includes('package')
	) {
		return process_version_verification(params);
	} else if (
		thought.includes('syntax') ||
		thought.includes('validation') ||
		thought.includes('code style') ||
		target.includes('syntax') ||
		target.includes('code')
	) {
		return process_syntax_validation(params);
	} else if (
		thought.includes('compatibility') ||
		thought.includes('breaking changes') ||
		target.includes('compatibility')
	) {
		return process_compatibility_check(params);
	} else if (
		thought.includes('test') ||
		thought.includes('testing') ||
		target.includes('test')
	) {
		return process_test_workflow(params);
	}

	// Default workflow if no specific one is detected
	return process_generic_qa_workflow(params);
}

/**
 * Generic QA workflow for when no specific workflow is detected
 */
function process_generic_qa_workflow(
	params: SequentialThinkingQAParams,
): SequentialThinkingQAParams {
	// If this is the first thought, provide a generic first step
	if (params.thought_number === 1) {
		return {
			...params,
			current_step: {
				step_description:
					'Analyze the verification task and determine appropriate approach',
				expected_outcome:
					'Clear understanding of what needs to be verified',
				recommended_tools: [
					{
						tool_name: 'read_file',
						confidence: 0.8,
						rationale:
							'Examine relevant files to understand the context',
						priority: 1,
					},
					{
						tool_name: 'search_files',
						confidence: 0.7,
						rationale:
							'Find relevant code patterns or configurations',
						priority: 2,
					},
				],
				next_step_conditions: [
					'Context understood',
					'Verification approach determined',
				],
			},
			next_thought_needed: true,
		};
	}

	// For subsequent thoughts, provide generic next steps
	return {
		...params,
		current_step: {
			step_description: `Continue verification process (step ${params.thought_number} of ${params.total_thoughts})`,
			expected_outcome: 'Progress toward verification goal',
			recommended_tools: [
				{
					tool_name: 'execute_command',
					confidence: 0.7,
					rationale: 'Run tests or validation commands',
					priority: 1,
				},
				{
					tool_name: 'tavily_search',
					confidence: 0.6,
					rationale:
						'Search for relevant documentation or best practices',
					priority: 2,
				},
			],
			next_step_conditions: [
				'Verification progressed',
				'Results analyzed',
			],
		},
		next_thought_needed:
			params.thought_number < params.total_thoughts,
	};
}
