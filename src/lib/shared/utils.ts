export function getNameWithoutExtension(filename: string) {
	const lastDotIndex = filename.lastIndexOf('.');
	return lastDotIndex === -1 ? filename : filename.slice(0, lastDotIndex);
}

/** checks if the given mouse event is inside the rect */
export function isCursorInside(event: MouseEvent, rect: DOMRect): boolean {
	return (
		event.clientX >= rect.left &&
		event.clientX <= rect.right &&
		event.clientY >= rect.top &&
		event.clientY <= rect.bottom
	);
}

// https://stackoverflow.com/a/43001581/15603098
/** recursively removes `readonly` on an object */
export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

// https://stackoverflow.com/a/49670389
/** recursively casts `Readonly` on an object. */
export type DeepReadonly<T> = T extends readonly []
	? DeepReadonlyObject<T>
	: T extends readonly [unknown, ...unknown[]]
		? DeepReadonlyObject<T>
		: T extends (infer R)[]
			? DeepReadonlyArray<R>
			: T extends Function
				? T
				: T extends object
					? DeepReadonlyObject<T>
					: T;

type DeepReadonlyObject<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };
interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}
