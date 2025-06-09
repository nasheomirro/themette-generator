import { defaultTheme } from '$lib/theme/themes';
import type { Theme } from '$lib/theme/types';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

interface ThemetteDB extends DBSchema {
	themes: {
		key: string;
		value: Theme;
	};
}

function createThemetteDB() {
	return openDB<ThemetteDB>('themette-db', 1, {
		upgrade(db, oldVersion, newVersion, tr) {
			db.createObjectStore('themes', {
				keyPath: 'id'
			});
			tr.objectStore('themes').add(defaultTheme);
		}
	});
}

export const themetteDB = await createThemetteDB();

export class DBUtils {
	static #PUT_THEME_DEBOUNCE_TIME = 1000;
	static #putThemeTimeouts: { [K: string]: number } = {};

	static addTheme(theme: Theme) {
		return themetteDB.add('themes', theme);
	}

	static deleteTheme(id: string) {
		return themetteDB.delete('themes', id);
	}

	static putTheme(theme: Theme, instant = false) {
		clearTimeout(this.#putThemeTimeouts[theme.id]);
		if (instant) {
			themetteDB.put('themes', theme);
			delete this.#putThemeTimeouts[theme.id];
		} else {
			this.#putThemeTimeouts[theme.id] = setTimeout(() => {
				themetteDB.put('themes', theme);
				delete this.#putThemeTimeouts[theme.id];
			}, this.#PUT_THEME_DEBOUNCE_TIME);
		}
	}
}
