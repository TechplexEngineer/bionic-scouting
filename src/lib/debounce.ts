/**
 * Func is only executed after timeout ms elapse between calls to debounce
 * @src https://www.freecodecamp.org/news/javascript-debounce-example/
 * @param func
 * @param timeout
 */
export function debounce(func, timeout = 300) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, timeout);
	};
}
