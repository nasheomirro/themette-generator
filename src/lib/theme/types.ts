export type ColorShade =
	| '50'
	| '100'
	| '200'
	| '300'
	| '400'
	| '500'
	| '600'
	| '700'
	| '800'
	| '900'
	| '950';

export type ShadeSet = {
	[K in ColorShade]: string;
};

export type VarColorStr = `var(--color-${string}-${ColorShade})`;
export type VarColorObj = { setId: string; shade: ColorShade };

export type ColorSet = ShadeSet & {
	id: string;
	name: string;
	contrasts: {
		light: VarColorObj;
		dark: VarColorObj;
	};
};

export type Theme = {
	id: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
	sets: ColorSet[];
};
