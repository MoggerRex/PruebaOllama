export const ALGORITHM_STEP_STATES = Object.freeze({
  pending: 'pending',
  active: 'active',
  compared: 'compared',
  completed: 'completed',
});

export function createAlgorithmStep({ description, values = [], activeIndices = [], state = 'active' }) {
  return { description, values, activeIndices, state };
}