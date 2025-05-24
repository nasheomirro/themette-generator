import type { ColorShade } from './types';

/** an array that holds all valid color shades */
export const colorShades = [
	'50',
	'100',
	'200',
	'300',
	'400',
	'500',
	'600',
	'700',
	'800',
	'900',
	'950'
] as const satisfies ColorShade[];
