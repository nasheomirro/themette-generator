import { colorShades } from './constants';
import type { ColorSet, VarColorCall } from './types';

export function isColorSet(set: any): set is ColorSet {
	return (
		typeof set.id === 'string' &&
		typeof set.name === 'string' &&
		typeof set.contrasts === 'object' &&
		isVarColorCall(set.contrasts.light) &&
		isVarColorCall(set.contrasts.dark) &&
		colorShades.every((shade) => typeof set[shade] === 'string')
	);
}

const regex =
	/^var\(--color-.+?(?<!(?:-contrast))-\d+(?<!(?:50-950|100-900|200-800|300-700|400-600|500-500|600-400|700-300|800-200|900-100|950-50))\)$/;
export function isVarColorCall(str: unknown): str is VarColorCall {
	return typeof str === 'string' && regex.test(str);
}
