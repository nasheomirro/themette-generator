import { nanoid } from 'nanoid';
import type { DeepReadonly } from '$lib/shared/utils';
import type { ColorSet, Theme } from '$lib/theme/types';
import {
	createShadeSetFromScale,
	genRandomColor,
	genScaleFromColor,
	getMostDesaturatedSet
} from '$lib/theme/utils';

import { DBUtils, themetteDB } from './storage';
import { getNextNameSuffix } from './utils';

const themes = await themetteDB.getAll('themes');

/** an object that holds the ids of the color sets or themes used by the UI */
type Ids = {
	/** The currently selected set's id. */
	selectedSetId: string | null;
	/** The current selected theme's id */
	selectedThemeId: string | null;
	/** the id of the set that would be used for overriding the `--color-th-fg-*` colors */
	foregroundId: string | null;
	/** the id of the set that would be used for overriding the `--color-th-bg-*` colors */
	backgroundId: string | null;
};

class AppState {
	#themes = $state<Theme[]>(themes);
	#ids = $state<Ids>({
		selectedThemeId: null,
		selectedSetId: null,
		foregroundId: null,
		backgroundId: null
	});

	get #theme() {
		return this.#themes.find((theme) => theme.id === this.#ids.selectedThemeId);
	}

	get themes(): DeepReadonly<Theme[]> {
		return this.#themes;
	}

	get sets(): DeepReadonly<ColorSet[]> {
		return this.#theme ? this.#theme.sets : [];
	}

	get ids(): DeepReadonly<Ids> {
		return this.#ids;
	}

	/** Use this when updating the `selectedThemeId` value instead of directly updating it through `updateId`. */
	setSelectedThemeId(id: string) {
		const theme = this.themes.find((theme) => theme.id === id);

		if (theme) {
			this.#ids.selectedThemeId = id;
			this.#ids.selectedSetId = theme.sets[0]?.id || null;
			this.#ids.foregroundId = theme.sets[0]?.id || null;
			this.#ids.backgroundId = getMostDesaturatedSet(theme.sets)?.id || null;
		}
	}

	/** finds the index of the given id, returns -1 if not found */
	getIndexFromId(id: string) {
		return this.sets.findIndex((set) => set.id === id);
	}

	/**
	 * Updates the specified id to the given value. Does nothing if the given id does not exist.
	 * @param key the set id you want to update
	 * @param value the id of the set
	 */
	updateId(key: Exclude<keyof Ids, 'selectedThemeId'>, value: string | null) {
		if (value === null) this.#ids[key] = value;
		else if (
			this.sets.find((set) => set.id === value) ||
			this.themes.find((theme) => theme.id === value)
		) {
			this.#ids[key] = value;
		}
	}

	addTheme(theme: Theme) {
		this.#themes.push(theme);
		DBUtils.addTheme(theme);
	}

	deleteTheme(id: string) {
		this.#themes.filter((theme) => theme.id !== id);
		DBUtils.deleteTheme(id);
	}

	/** given a callback, checks if a theme is selected and would then run the callback and gives the theme to be mutated. */
	#updateSelectedTheme<T>(cb: (theme: Theme) => T): T | undefined {
		if (this.#theme) {
			const r = cb(this.#theme);
			this.#theme.updatedAt = new Date();

			// instead of using an effect somewhere, take the chance to update the db
			DBUtils.putTheme($state.snapshot(this.#theme));
			return r;
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
		this.#updateSelectedTheme((theme) => {
			const index = theme.sets.findIndex((set) => set.id === id);
			const set: ColorSet | undefined = theme.sets[index];
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
						theme.sets.filter((set) => set.id !== id).map((set) => set.name),
						name
					);
				}

				const { contrasts, ..._updates } = updates;

				theme.sets[index] = { ...set, ..._updates };
				theme.sets[index].contrasts = { ...set.contrasts, ...contrasts };
			}
		});
	}

	createEmptyColorSet() {
		return this.#updateSelectedTheme((theme) => {
			const id = nanoid();
			const name = getNextNameSuffix(
				theme.sets.map((set) => set.name),
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

			theme.sets.push(colorSet);
			return colorSet;
		});
	}

	deleteColorSet(id: string) {
		this.#updateSelectedTheme((theme) => {
			const index = this.getIndexFromId(id);
			if (index === -1) return;

			// filter out the color set
			theme.sets = theme.sets.filter((set) => set.id !== id);

			// for selected ids, try moving the selection one index down/up or set to null if empty
			if (this.#ids.selectedSetId === id) {
				let i = index < theme.sets.length ? index : index - 1; // note the set already got shifted
				let id = theme.sets[i] ? theme.sets[i].id : null;
				this.updateId('selectedSetId', id);
			}
			// same for the foreground id
			if (this.#ids.foregroundId === id) {
				let i = index < theme.sets.length ? index : index - 1; // note the set already got shifted
				let id = theme.sets[i] ? theme.sets[i].id : null;
				this.updateId('foregroundId', id);
			}
			// for the background id, we should just set it to null
			if (this.#ids.backgroundId === id) {
				this.updateId('backgroundId', null);
			}

			// handle contrasts that refer to the deleted id and change it to itself
			theme.sets.forEach((set) => {
				if (set.contrasts.light.setId === id) {
					set.contrasts.light.setId = set.id;
					set.contrasts.light.shade = '50';
				}
				if (set.contrasts.dark.setId === id) {
					set.contrasts.dark.setId = set.id;
					set.contrasts.dark.shade = '950';
				}
			});
		});
	}

	/**
	 * moves value in `from` to `target`.
	 * @param from the index of the color set to switch
	 * @param target the index where the color set will go
	 */
	reorderColorSet(from: number, target: number) {
		this.#updateSelectedTheme((theme) => {
			// Validate index and target
			if (from < 0 || from >= theme.sets.length || target < 0 || target >= theme.sets.length) {
				throw new Error('Index or target out of bounds');
			}

			const [item] = theme.sets.toSpliced(from, 1); // Remove the item from its current position
			theme.sets.splice(target, 0, item); // Insert it at the target position
		});
	}
}

export const app = new AppState();
