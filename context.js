import { sel } from './shared';

export var canvas = sel("#app");
export var context = canvas.getContext("2d");

canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
