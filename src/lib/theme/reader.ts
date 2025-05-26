import { nanoid } from 'nanoid';

import { colorShades } from '$lib/theme/constants';
import type { ColorSet, ColorShade } from '$lib/theme/types';
import { extractVarColorStr, isColorSet, isVarColorStr } from '$lib/theme/utils';

/**
 * matches colors, capturing `set`, `shade`, and `value`, the regex is designed to ignore contrast and pairing variables
 * that would be generated alongside the actual color variables.
 */
const checkColor =
	/--color-(.+?)(?<!-contrast)-(\d+)(?<!(?:50-950|100-900|200-800|300-700|400-600|600-400|700-300|800-200|900-100|950-50)):\s*([^;]+?);/g;

/** matches the contrasts, capturing `set`, `mode`, and `value` */
const checkContrast = /--color-((?:(?!--color-).)+?)-contrast-(light|dark):\s*([^;]+?);/g;

export function readTheme(css: string) {
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
			const id = nanoid();
			// create a color set with the defaults and no shades
			const colorSet: Partial<ColorSet> = {
				id,
				name: set,
				contrasts: {
					light: { setId: id, shade: '50' },
					dark: { setId: id, shade: '950' }
				}
			};

			// fill the shades in with the colors
			colors.forEach((color) => {
				if (color.set === set) {
					colorSet[color.shade] = color.value;
				}
			});

			return colorSet;
		})
		.filter((colorSet) => {
			// make sure that the created color set is valid (has all the shades filled in)
			return isColorSet(colorSet);
		});

	// now that we have all valid color sets, we can override the default contrast values.
	sets.forEach((colorSet, _, colorSets) => {
		contrasts.forEach((contrast) => {
			// we see first if the contrast is a valid var color string
			if (contrast.set === colorSet.name && isVarColorStr(contrast.value)) {
				const { name, shade } = extractVarColorStr(contrast.value);
				const contrastingSet = colorSets.find((colorSet) => colorSet.name === name);
				// afterwards we only override the default contrast if we found a matching color set
				if (contrastingSet) {
					colorSet.contrasts[contrast.mode] = { setId: contrastingSet.id, shade };
				}
			}
		});
	});

	return sets;
}
