import { writable } from 'svelte/store';
let hostname = window.location.hostname;
if (hostname === "") {
    hostname = "localhost";
}

export const ws = writable(new WebSocket(`ws://${hostname}:3232`));
