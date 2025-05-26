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

/** checks if the given mouse event is inside the rect */
export function isCursorInside(event: MouseEvent, rect: DOMRect): boolean {
	return (
		event.clientX >= rect.left &&
		event.clientX <= rect.right &&
		event.clientY >= rect.top &&
		event.clientY <= rect.bottom
	);
}
