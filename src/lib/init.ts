
import { writable } from 'svelte/store';
export const initCount = writable(0);

export const init = ():void => {
    console.log("Init");
}