import { io } from 'socket.io-client';
import { reactive } from 'vue';

const URL = 'http://localhost:3001/events';
export const socket = io(URL);

const state = reactive<{ connected: boolean; fooEvents: number[]; barEvents: number[] }>({
  connected: false,
  fooEvents: [],
  barEvents: [],
});

socket.on('connect', () => {
  state.connected = true;
});

socket.on('disconnect', () => {
  state.connected = false;
});

socket.on('foo', () => {
  state.fooEvents.push(1);
});

socket.on('bar', () => {
  state.barEvents.push(2);
});
