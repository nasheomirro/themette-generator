import type { ColorSet } from './types';
import { colorPairings, colorShades } from './constants';
import { compareContrastsForColor, getVarColorObjValue, toVarColorStr } from './utils';
import type { DeepReadonly } from '$lib/shared/utils';

const themeSnippet = `
@theme {
  $$colors$$

  $$contrasts$$
}
`.trim();

const inlineThemeSnippet = `
@theme inline {
  $$pairs$$

  $$contrast-pairs$$
}
`.trim();

/**
 * converts a set of color sets to it's css counterpart (raw and boilerplated).
 */
export function writeTheme(sets: DeepReadonly<ColorSet[]>) {
	let colors = '';
	let contrasts = '';

	let pairs = '';
	let contrastPairs = '';

	for (const set of sets) {
		const key = set.name;

		// add the light and dark values from contrasts
		contrasts += contrast(key, 'light', toVarColorStr(sets, set.contrasts.light)!);
		contrasts += contrast(key, 'dark', toVarColorStr(sets, set.contrasts.dark)!);

		// write shades for both color and contrasts
		for (let shade of colorShades) {
			const v = set[shade];
			const cv = compareContrastsForColor(
				set[shade],
				getVarColorObjValue(sets, set.contrasts.light)!,
				getVarColorObjValue(sets, set.contrasts.dark)!
			);

			colors += color(key, shade, v);
			contrasts += contrastShade(key, shade, `var(--color-${set.name}-contrast-${cv})`);
		}

		// add normal and contrast pairs.
		for (let [light, dark] of colorPairings) {
			pairs += pair(key, light, dark);
			contrastPairs += contrastPair(key, light, dark);
		}

		// add a new line for each set
		colors += '\n';
		contrasts += '\n';
		pairs += '\n';
		contrastPairs += '\n';
	}

	const raw = colors + contrasts + pairs + contrastPairs;
	return {
		raw,
		parts: {
			colors,
			contrasts,
			pairs,
			contrastPairs
		}
	};
}

/** just like `writeTheme`, but converts it into tailwind code using the boilerplate.  */
export function writeThemeToBoilerPlate(
	sets: DeepReadonly<ColorSet[]>,
	options?: {
		removePairs?: boolean;
	}
) {
	options = {
		removePairs: false,
		...options
	};

	const {
		parts: { colors, contrastPairs, contrasts, pairs }
	} = writeTheme(sets);

	return [
		themeSnippet.replace('$$colors$$', colors.trim()).replace('$$contrasts$$', contrasts.trim()),
		options.removePairs
			? ''
			: inlineThemeSnippet
					.replace('$$pairs$$', pairs.trim())
					.replace('$$contrast-pairs$$', contrastPairs.trim())
	]
		.filter((s) => s)
		.join('\n\n');
}

function color(set: string, shade: string, val: string) {
	return `  --color-${set}-${shade}: ${val};\n`;
}

function contrast(set: string, mode: string, val: string) {
	return `  --color-${set}-contrast-${mode}: ${val};\n`;
}

function contrastShade(set: string, shade: string, val: string) {
	return `  --color-${set}-contrast-${shade}: ${val};\n`;
}

function pair(set: string, light: string, dark: string) {
	return `  --color-${set}-${light}-${dark}: light-dark(var(--color-${set}-${light}), var(--color-${set}-${dark}));\n`;
}

function contrastPair(set: string, light: string, dark: string) {
	return `  --color-${set}-contrast-${light}-${dark}: light-dark(var(--color-${set}-contrast-${light}), var(--color-${set}-contrast-${dark}));\n`;
}
