// Define the interface for the QA parameters
export interface SequentialThinkingQAParams {
	thought: string;
	thought_number: number;
	total_thoughts: number;
	next_thought_needed: boolean;
	is_revision?: boolean;
	revises_thought?: number;
	branch_from_thought?: number;
	branch_id?: string;
	needs_more_thoughts?: boolean;
	current_step?: StepRecommendation;
	previous_steps?: StepRecommendation[];
	remaining_steps?: string[];
	verification_target?: string;
	available_client_tools?: string[]; // Optional: List of tool names available to the calling LLM
}

// Define the schema for recommended tools
export interface RecommendedTool {
	tool_name: string;
	confidence: number;
	rationale: string;
	priority: number;
	alternatives?: string[];
	suggested_inputs?: Record<string, unknown>;
}

// Define the schema for current step
export interface StepRecommendation {
	step_description: string;
	expected_outcome: string;
	recommended_tools: RecommendedTool[];
	next_step_conditions: string[];
}

// Define the main interface for thought data
export interface ThoughtData {
	thought: string;
	thought_number: number;
	total_thoughts: number;
	next_thought_needed: boolean;
	is_revision?: boolean;
	revises_thought?: number;
	branch_from_thought?: number;
	branch_id?: string;
	needs_more_thoughts?: boolean;
	current_step?: StepRecommendation;
	previous_steps?: StepRecommendation[];
	remaining_steps?: string[];
	verification_target?: string;
}
