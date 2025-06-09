import type { DeepReadonly } from '$lib/shared/utils';
import { readTheme } from '$lib/theme/reader';
import type { ColorSet } from '$lib/theme/types';
import {
	createShadeSetFromScale,
	genRandomColor,
	genScaleFromColor,
	getMostDesaturatedSet
} from '$lib/theme/utils';

import defaultTheme from '$themes/default.css?raw';
import { nanoid } from 'nanoid';
import { getNextNameSuffix } from './utils';

/** an object that holds the ids of the color sets used by the UI */
type UISet = {
	/** The currently selected set's id. */
	selectedId: string | null;
	/** the id of the set that would be used for overriding the `--color-th-fg-*` colors */
	foregroundId: string | null;
	/** the id of the set that would be used for overriding the `--color-th-bg-*` colors */
	backgroundId: string | null;
};

class AppState {
	#sets = $state<ColorSet[]>(readTheme(defaultTheme));
	#ids = $state<UISet>({
		selectedId: this.#sets[this.#sets.findIndex((set) => set.name === 'primary')].id,
		foregroundId: this.#sets[this.#sets.findIndex((set) => set.name === 'primary')].id,
		backgroundId: this.#sets[this.#sets.findIndex((set) => set.name === 'surface')].id
	});

	get sets(): DeepReadonly<ColorSet[]> {
		return this.#sets;
	}

	get ids(): DeepReadonly<UISet> {
		return this.#ids;
	}

	setNewTheme(sets: ColorSet[]) {
		this.#sets = sets;

		this.#ids.selectedId = this.#sets[0]?.id || null;
		this.#ids.foregroundId = this.#sets[0]?.id || null;
		this.#ids.backgroundId = getMostDesaturatedSet(sets)?.id || null;
	}

	/** finds the index of the given id, returns -1 if not found */
	getIndexFromId(id: string) {
		return this.#sets.findIndex((set) => set.id === id);
	}

	/**
	 * Updates the specified set id to the given value. Does nothing if the given id does not exist.
	 * @param key the set id you want to update
	 * @param value the id of the set
	 */
	updateUISetId(key: keyof UISet, value: string | null) {
		if (value === null) this.#ids[key] = value;
		else if (this.#sets.find((set) => set.id === value)) {
			this.#ids[key] = value;
		}
	}

	/**
	 * updates the specified object with the given partial updates, you cannot update the id or the name through this method.
	 * @param id the id of the set
	 * @param updates the new values for the set, **careful, this gets mutated**
	 */
	updateColorSet(
		id: string,
		updates: Partial<
			Omit<ColorSet, 'id' | 'contrasts'> & { contrasts: Partial<ColorSet['contrasts']> }
		>
	) {
		const index = this.#sets.findIndex((set) => set.id === id);
		const set: ColorSet | undefined = this.#sets[index];
		if (set) {
			// handle updating the set's name
			if (Object.hasOwn(updates, 'name')) {
				let name = updates.name || set.name;
				name = name
					.trim()
					.toLowerCase()
					.replaceAll(/[^a-z0-9\s\-]/g, '')
					.trim() // edge case for when an invalid character leaves space at the ends
					.replaceAll(/\s+/g, '-');

				updates.name = getNextNameSuffix(
					this.#sets.filter((set) => set.id !== id).map((set) => set.name),
					name
				);
			}

			const { contrasts, ..._updates } = updates;

			this.#sets[index] = { ...set, ..._updates };
			this.#sets[index].contrasts = { ...set.contrasts, ...contrasts };
		}
	}

	createEmptyColorSet() {
		const id = nanoid();
		const name = getNextNameSuffix(
			this.#sets.map((set) => set.name),
			'untitled'
		);
		const seed = genRandomColor();
		const shades = createShadeSetFromScale(genScaleFromColor(seed));
		const contrasts: ColorSet['contrasts'] = {
			light: {
				setId: id,
				shade: '50'
			},
			dark: {
				setId: id,
				shade: '950'
			}
		};

		const colorSet: ColorSet = {
			name,
			id,
			...shades,
			contrasts
		};

		this.#sets.push(colorSet);
		return colorSet;
	}

	deleteColorSet(id: string) {
		const index = this.getIndexFromId(id);
		if (index === -1) return;

		// filter out the color set
		this.#sets = this.#sets.filter((set) => set.id !== id);

		// for selected ids, try moving the selection one index down/up or set to null if empty
		if (this.#ids.selectedId === id) {
			let i = index < this.#sets.length ? index : index - 1; // note the set already got shifted
			let id = this.#sets[i] ? this.#sets[i].id : null;
			this.updateUISetId('selectedId', id);
		}
		// same for the foreground id
		if (this.#ids.foregroundId === id) {
			let i = index < this.#sets.length ? index : index - 1; // note the set already got shifted
			let id = this.#sets[i] ? this.#sets[i].id : null;
			this.updateUISetId('foregroundId', id);
		}
		// for the background id, we should just set it to null
		if (this.#ids.backgroundId === id) {
			this.updateUISetId('backgroundId', null);
		}

		// handle contrasts that refer to the deleted id and change it to itself
		this.#sets.forEach((set) => {
			if (set.contrasts.light.setId === id) {
				set.contrasts.light.setId = set.id;
				set.contrasts.light.shade = '50';
			}
			if (set.contrasts.dark.setId === id) {
				set.contrasts.dark.setId = set.id;
				set.contrasts.dark.shade = '950';
			}
		});
	}

	/**
	 * moves value in `from` to `target`.
	 * @param from the index of the color set to switch
	 * @param target the index where the color set will go
	 */
	reorderColorSet(from: number, target: number) {
		// Validate index and target
		if (from < 0 || from >= this.#sets.length || target < 0 || target >= this.#sets.length) {
			throw new Error('Index or target out of bounds');
		}

		const [item] = this.#sets.splice(from, 1); // Remove the item from its current position
		this.#sets.splice(target, 0, item); // Insert it at the target position
	}
}

export const app = new AppState();
