import type { DeepReadonly } from '$lib/shared/utils';
import { readTheme } from '$lib/theme/reader';
import type { ColorSet } from '$lib/theme/types';

import defaultTheme from '$themes/default.css?raw';

class AppState {
	#sets = $state<ColorSet[]>(readTheme(defaultTheme));

	get sets(): DeepReadonly<ColorSet[]> {
		return this.#sets;
	}
}

export const app = new AppState();
