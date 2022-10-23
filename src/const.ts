const VALUE = 12;
export const BOARD_DEFAULT_WIDTH = VALUE;
export const BOARD_DEFAULT_HEIGHT = VALUE;
export const BOARD_DEFAULT_BOMBS = (1/4) * (VALUE / 2) * (VALUE / 2);
export const BOARD_DEFAULT_GOL = VALUE*VALUE/2;
export const BOARD_MINIMUM_WIDTH = 10;
export const BOARD_MAXIMUM_WIDTH = 32;
export const BOARD_MINIMUM_HEIGHT = 10;
export const BOARD_MAXIMUM_HEIGHT = 18;

export const BOMB = "💣";
export const FLAG = "🚩";

export const NUMBER = '0️⃣1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣';
export const FACE = {
	"idle": "🙂",
	"suspense": "😳",
	"lose": "😂",
	"win": "🥳",
}

export const DIRECTIONS = [
	[-1, -1],
	[-1, 0],
	[-1, 1],
	[0, -1],
	[0, 1],
	[1, -1],
	[1, 0],
	[1, 1],
];

export const IMMEDIATE_DIRECTIONS = [
	[-1, 0],
	[0, -1],
	[0, 1],
	[1, 0],
];

export const TOP_MESSAGE = {
	"initial": "Left click a tile to expose the tile; right click a tile to flag it.",
	"lose": "You lose!",
	"win": "You win!",
	"error": "Invalid board size!",
	"exceed": `Board height must be within ${BOARD_MINIMUM_HEIGHT}-${BOARD_MAXIMUM_HEIGHT}; width must be within ${BOARD_MINIMUM_WIDTH}-${BOARD_MAXIMUM_WIDTH}.`
}

export const TILE_NUMBER_COLOR = ["text-blue-500", "text-green-500", "text-red-500", "text-blue-800", "text-green-800", "text-red-800"]