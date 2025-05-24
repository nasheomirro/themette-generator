import { nanoid } from 'nanoid';

import { colorShades } from '$lib/colors/constants';
import type { ColorSet, ColorShade, VarColorCall } from '$lib/colors/types';
import { isColorSet, isVarColorCall } from '$lib/colors/utils';

/** matches colors, capturing `set`, `shade`, and `value` */
const checkColor =
	/--color-(.+?)(?<!(?:-contrast))-(\d+)(?<!(?:50-950|100-900|200-800|300-700|400-600|600-400|700-300|800-200|900-100|950-50)):\s*([^;]+?);/g;

/** matches the contrasts, capturing `set`, `mode`, and `value` */
const checkContrast = /--color-(.+?)-contrast-(light|dark):\s*([^;]+?);/g;

export function readTheme(css: string) {
	css = css.replaceAll(/\s/g, '');

	// get all matching color variables that are possibly part of a color set
	const colors = Array.from(css.matchAll(checkColor))
		.filter((match) => match.length === 4 && colorShades.includes(match[2] as any))
		.map(([, set, shade, value]) => ({ set, shade: shade as ColorShade, value }));

	// get all matching contrast variables that are possibly part of a color set
	const contrasts = Array.from(css.matchAll(checkContrast))
		.filter((match) => match.length === 4)
		.map(([, set, mode, value]) => ({ set, mode: mode as 'light' | 'dark', value }));

	// get all possible unique sets that appear in `colors` and `contrasts`
	const sets = [...new Set([...colors.map(({ set }) => set), ...contrasts.map(({ set }) => set)])]
		.map((set) => {
			const colorSet = {
				id: nanoid(),
				name: set,
				contrasts: {
					light: `var(--color-${set}-950)`,
					dark: `var(--color-${set}-50)`
				}
			} as any;

			colors.forEach((color) => {
				if (color.set === set) {
					colorSet[color.shade] = color.value;
				}
			});

			contrasts.forEach((contrast) => {
				if (contrast.set === set && isVarColorCall(contrast.value)) {
					colorSet.contrasts[contrast.mode] = contrast.value as VarColorCall;
				}
			});

			return colorSet;
		})
		.filter((colorSet) => isColorSet(colorSet));

	return sets;
}
