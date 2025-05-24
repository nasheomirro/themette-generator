import chroma, { type Color, type Scale } from 'chroma-js';

import { colorShades } from './constants';
import type { ColorSet, ColorShade, ShadeSet, VarColorObj, VarColorStr } from './types';
import type { DeepReadonly } from '$lib/shared/utils';

/**
 * creates a random `Color`.
 * @param lightness the range to randomize the color's lightness, default is `[0.45, 0.6]`
 * @param saturation the range to randomize the color's saturation
 */
export function genRandomColor(
	lightness: [number, number] = [0.45, 0.6],
	saturation?: [number, number]
) {
	const l = Math.random() * (lightness[1] - lightness[0]) + lightness[0]; // Random between the given range
	let chromaColor = chroma.random().set('hsl.l', l);

	if (saturation) {
		const s = Math.random() * (saturation[1] - saturation[0]) + saturation[0]; // Random between the given range
		chromaColor = chromaColor.set('hsl.s', s);
	}

	return chromaColor;
}

/**
 * returns the color that has the best contrast for the given color as `"light" | "dark"`
 * @param color the color to contrast
 * @param light the light contrast color
 * @param dark the dark contrast color
 */
export function compareContrastsForColor(
	color: string | Color,
	a: string | Color,
	b: string | Color
) {
	const v = chroma(color);
	const l = chroma(a);
	const d = chroma(b);

	return chroma.contrast(v, l) > chroma.contrast(v, d) ? 'light' : 'dark';
}

/**
 * returns a complete array of color shades generated from the given values of `from`.
 * @param from an array of color values for interpolation
 */
export function genScale(from: [string, string] | [string, string, string]) {
	const colors = chroma.scale(from).mode('oklch');
	return colors;
}

/**
 * returns a complete array of color shades generated from the given seed.
 * Note that the given color is used as the middle shade "500"
 * @param seed the `Color` to generate shades from.
 */
export function genScaleFromColor(seed: Color | string) {
	seed = chroma(seed);
	const lightness = seed.get('hsl.l');
	const lto = lightness < 5 ? 2 : 2.5;
	const dto = lightness > 5 ? 2 : 3;

	const l = seed.brighten(lto).hex();
	const m = seed.hex();
	const d = seed.darken(dto).hex();

	return genScale([l, m, d]);
}

/**
 * returns a `ShadeSet` using the generated colors from the given scale.
 * @param scale the scale used to generate colors
 */
export function createShadeSetFromScale(scale: Scale) {
	const colors = scale.colors(colorShades.length);
	const obj: Partial<ShadeSet> = {};
	for (let i = 0; i < colorShades.length; i++) {
		obj[colorShades[i]] = colors[i];
	}

	return obj as ShadeSet;
}

/**
 * extracts the `set` and `shade` of the given `str`, note that
 * this does not return a `VarColorObj`, but the set's name and shade.
 * @param str the given `VarColorStr`
 */
export function extractVarColorStr(str: VarColorStr) {
	const match = str.match(/^var\(--color-(.+?)-(\d+)\)$/)!;

	return {
		name: match[1],
		shade: match[2] as ColorShade
	};
}

/**
 * from the given `sets`, get the object's `VarColorObj` representation using the set's id
 *  @param sets the context for the given `str`
 *  @param str the thing we want to convert
 *
 */
export function toVarColorObj(sets: ColorSet[], str: VarColorStr): VarColorObj | null {
	const [_, name, shade] = str.match(/^var\(--color-(.+?)-(\d+)\)$/)!;
	const set = sets.find((set) => set.name === name);

	return set
		? {
				setId: name,
				shade: shade as ColorShade
			}
		: null;
}

/**
 * from the given `sets`, get the object's `VarColorStr` representation using the set's name
 * @param sets the context for the given `obj`
 * @param obj the thing we want to convert
 */
export function toVarColorStr(
	sets: DeepReadonly<ColorSet[]>,
	obj: VarColorObj
): VarColorStr | null {
	const set = sets.find((set) => set.id === obj.setId);
	return set ? `var(--color-${set.name}-${obj.shade})` : null;
}

/**
 * from the given `sets`, use `obj` as a map to get the value for the target set.
 * @param sets the context for the given `obj`
 * @param obj the `VarColorObj` to use as a map to the value
 */
export function getVarColorObjValue(
	sets: DeepReadonly<ColorSet[]>,
	obj: VarColorObj
): string | undefined {
	const v = sets.find((set) => set.id === obj.setId)?.[obj.shade];
	return v;
}

export function isColorSet(set: any): set is ColorSet {
	return (
		typeof set.id === 'string' &&
		typeof set.name === 'string' &&
		typeof set.contrasts === 'object' &&
		isVarColorObj(set.contrasts.light) &&
		isVarColorObj(set.contrasts.dark) &&
		colorShades.every((shade) => typeof set[shade] === 'string')
	);
}

export function isVarColorObj(obj: any): obj is VarColorObj {
	return (
		typeof obj === 'object' && typeof obj.setId === 'string' && colorShades.includes(obj.shade)
	);
}

export function isVarColorStr(str: unknown): str is VarColorStr {
	return typeof str === 'string' && /^var\(--color-.+?-\d+\)$/.test(str);
}
