import { BOMB, FLAG } from "../const";

export type TileType = number | typeof BOMB | typeof FLAG | null;

export interface Tile {
	type: TileType,
	visited: boolean,
	sus?: boolean,
	currentAlive?: boolean,
	nextAlive?: boolean,
}