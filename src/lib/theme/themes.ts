import { nanoid } from 'nanoid';
import type { Theme } from './types';
import { readTheme } from './reader';

import defaultThemeStr from '$themes/default.css?raw';

export const defaultTheme: Theme = {
	id: nanoid(),
	name: 'default',
	createdAt: new Date(),
	updatedAt: new Date(),
	sets: readTheme(defaultThemeStr)
};
