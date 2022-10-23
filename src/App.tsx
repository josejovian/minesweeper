import React, {
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Tile } from "./types/Tile";
import {
	BOARD_DEFAULT_GOL,
	BOARD_DEFAULT_HEIGHT,
	BOARD_DEFAULT_WIDTH,
	BOARD_MAXIMUM_HEIGHT,
	BOARD_MAXIMUM_WIDTH,
	BOARD_MINIMUM_HEIGHT,
	BOARD_MINIMUM_WIDTH,
	BOMB,
	DIRECTIONS,
	FACE,
	FLAG,
	TILE_NUMBER_COLOR,
	TOP_MESSAGE,
} from "./const";
import clsx from "clsx";
import Button from "./components/Button";
import { MessageType } from "./types/Message";
import { FaceType } from "./types/Face";

function App() {
	const [loading, setLoading] = useState(false);
	const [board, setBoard] = useState<Tile[][]>([[]]);
	const [size, setSize] = useState<[number, number]>([
		BOARD_DEFAULT_HEIGHT,
		BOARD_DEFAULT_WIDTH,
	]);
	const [win, setWin] = useState(false);
	const [lose, setLose] = useState(false);
	const [moved, setMoved] = useState(false);
	const [bombCount, setBombCount] = useState(99);
	const [spawnInAlive, setSpawnInAlive] = useState(true);
	const [bombCoordinates, setBombCoordinates] = useState<[number, number][]>(
		[]
	);
	const [sizeString, setSizeString] = useState(`${size[1]}x${size[0]}`);
	const [face, setFace] = useState<FaceType>("idle");
	const [message, setMessage] = useState<MessageType>("initial");
	const [freeze, setFreeze] = useState(false);
	const [flags, setFlags] = useState(99);
	const [visited, setVisited] = useState(0);

	useEffect(() => {
		if (lose) {
			setFace("lose");
			setMessage("lose");
		}
	}, [lose]);

	useEffect(() => {
		if (win) {
			setFace("win");
			setMessage("win");
		}
	}, [win]);

	const safeLocation = useCallback(
		([y, x]: [number, number], customSize: [number, number] = [-1, -1]) => {
			const height = customSize[0] === -1 ? size[0] : customSize[0];
			const width = customSize[1] === -1 ? size[1] : customSize[1];

			return y >= 0 && height > y && x >= 0 && width > x;
		},
		[size]
	);

	const flagTile = useCallback(
		(e: any, [y, x]: [number, number]) => {
			e.preventDefault();

			if (flags <= 0) return false;

			if (!board[y][x].visited || board[y][x].sus) {
				const temp = [...board];
				temp[y][x].sus
					? setFlags((prev) => prev + 1)
					: setFlags((prev) => prev - 1);

				temp[y][x].sus = !temp[y][x].sus;
				setBoard(temp);
			}

			return false;
		},
		[flags, board]
	);

	const calculateValue = useCallback(
		(y: number, x: number, tiles: Tile[][]) => {
			let value = 0;
			DIRECTIONS.forEach((d) => {
				const [dy, dx] = d;
				if (
					safeLocation([y + dy, x + dx]) &&
					tiles[y + dy][x + dx].type === BOMB
				) {
					value++;
				}
			});

			return value;
		},
		[safeLocation]
	);

	const preDecorateBoard = useCallback(
		(tiles: Tile[][]) => {
			let counter = BOARD_DEFAULT_GOL;

			while (counter > 0) {
				const y = Math.floor(Math.random() * tiles.length);
				const x = Math.floor(Math.random() * tiles[0].length);

				if (safeLocation([y, x]) && !tiles[y][x].currentAlive) {
					tiles[y][x].currentAlive = true;
					counter--;
				}
			}

			let iteration = 10;
			while (iteration--) {
				tiles.forEach((row, y) => {
					row.forEach((col, x) => {
						let alive = 0,
							dead = 0;

						DIRECTIONS.forEach((d) => {
							const [dy, dx] = d;
							if (
								safeLocation(
									[y + dy, x + dx],
									[tiles.length, row.length]
								)
							) {
								if (
									tiles[y + dy][x + dx] &&
									tiles[y + dy][x + dx].currentAlive
								)
									alive++;
								else dead++;
							}
						});

						if (col.currentAlive && (alive < 3 || alive > 4)) {
							col.nextAlive = false;
						} else if (
							!col.currentAlive &&
							alive >= 3 &&
							4 >= alive
						) {
							col.nextAlive = true;
						}
					});
				});

				let currentAlive = 0,
					currentDead = 0;
				tiles.forEach((row) => {
					row.forEach((col) => {
						col.currentAlive = col.nextAlive;
						col.currentAlive ? currentAlive++ : currentDead++;
					});
				});

				if (!iteration) {
					if (currentAlive < currentDead) {
						setSpawnInAlive(false);
					} else {
						setSpawnInAlive(true);
					}
					const objective = Math.floor(
						(tiles.length * tiles[0].length) / 5
					);
					setBombCount(objective);
					setFlags(objective);
				}
			}

			return tiles;
		},
		[safeLocation]
	);

	const parseSizeValuesFromSting = useCallback(
		(str: string): [number, number] | null => {
			const values = str.split("x");
			if (values.length === 2) {
				const [h, w] = values;

				const numH = Number(h);
				const numW = Number(w);

				if (!isNaN(numH) && !isNaN(numW)) {
					return [numH, numW];
				}
			}
			return null;
		},
		[]
	);

	const updateBoardSize = useCallback(() => {
		const parse = parseSizeValuesFromSting(sizeString);

		if (!parse) return false;

		setSize(parse);

		return parse;
	}, [sizeString, parseSizeValuesFromSting]);

	const initializeGame = useCallback(() => {
		setFreeze(true);
		setTimeout(() => {
			setFreeze(false);
		}, 1000);
		setLoading(true);
		setLose(false);
		setMoved(false);
		setVisited(0);
		setFace("idle");
		setWin(false);
		setMessage("initial");

		const cols: Tile[][] = [];
		const currentSize = updateBoardSize();

		if (!currentSize) {
			setMessage("error");
			return;
		}

		const [height, width] = currentSize;

		if (
			height < BOARD_MINIMUM_HEIGHT ||
			height > BOARD_MAXIMUM_HEIGHT ||
			width < BOARD_MINIMUM_WIDTH ||
			width > BOARD_MAXIMUM_WIDTH
		) {
			setMessage("exceed");
			return;
		}

		for (let j = 0; j < height; j++) {
			const row: Tile[] = [];
			for (let i = 0; i < width; i++) {
				row.push({
					type: null,
					visited: false,
					currentAlive: false,
					sus: false,
				});
			}
			cols.push(row);
		}

		const preDecorated = preDecorateBoard(cols);

		setBoard(
			cols.map((row, y) =>
				row.map((col, x) => {
					return {
						...col,
						currentAlive: preDecorated[y][x].currentAlive,
					};
				})
			)
		);

		setLoading(false);
	}, [preDecorateBoard, updateBoardSize]);

	const decorateBoard = useCallback(
		(tiles: Tile[][], [_y, _x]: [number, number]) => {
			if (moved) return tiles;

			let counter = bombCount;

			let bombs: [number, number][] = [];

			tiles.forEach((rows, y) =>
				rows.forEach((col, x) => {
					const coinFlip = Math.random();
					if (
						counter > 0 &&
						!col.type &&
						(Math.abs(y - _y) > 1 || Math.abs(x - _x) > 1)
					) {
						if (
							spawnInAlive === tiles[y][x].currentAlive &&
							coinFlip > 0.6
						) {
							tiles[y][x].type = BOMB;
							bombs.push([y, x]);
							counter--;
						}
					}
				})
			);

			let patience = 10;
			while (counter > 0 && patience > 0) {
				const y = Math.floor(Math.random() * size[0]);
				const x = Math.floor(Math.random() * size[1]);

				if (
					!tiles[y][x].type &&
					safeLocation([y, x]) &&
					(Math.abs(y - _y) > 1 || Math.abs(x - _x) > 1)
				) {
					tiles[y][x].type = BOMB;
					counter--;
					patience++;
				} else {
					patience--;
				}
			}

			while (counter < 0 && bombs.length > 0) {
				const idx = Math.floor(Math.random() * bombs.length);
				const [y, x] = bombs[idx];

				bombs =
					bombs.filter(([__y, __x]) => __y !== y && __x !== x) ?? [];

				const value = calculateValue(y, x, tiles);
				tiles[y][x].type = value > 0 ? value : null;
				counter--;

				DIRECTIONS.forEach((d) => {
					const [dy, dx] = d;
					const newY = y + dy,
						newX = x + dx;

					if (
						safeLocation([newY, newX]) &&
						tiles[newY][newX].type !== BOMB
					) {
						const value = calculateValue(newY, newX, tiles);
						tiles[newY][newX].type = value > 0 ? value : null;
					}
				});
			}

			tiles.forEach((rows, j) =>
				rows.forEach((col, i) => {
					if (!col.type) {
						const value = calculateValue(j, i, tiles);
						if (value > 0) col.type = value;
					}
				})
			);

			setBombCoordinates(bombs);

			return tiles;
		},
		[size, moved, bombCount, spawnInAlive, safeLocation, calculateValue]
	);

	const unvisitedLocation = useCallback(
		([y, x]: [number, number], tiles: Tile[][]) => {
			return safeLocation([y, x]) && !tiles[y][x].visited;
		},
		[safeLocation]
	);

	const visitTile = useCallback(
		([y, x]: [number, number]) => {
			if (lose) return;

			setFace("idle");

			const temp = board;
			let stack: [number, number][] = [];
			stack.push([y, x]);

			let _moved = moved;

			let _visited = visited;

			while (stack.length > 0) {
				const head = stack.shift();
				if (!head) break;

				const [_y, _x] = head;
				if (unvisitedLocation([_y, _x], temp)) {
					let flood = !board[_y][_x].type;

					if (temp[_y][_x].sus) {
						continue;
					}

					temp[_y][_x].visited = true;

					if (temp[_y][_x].type === BOMB) {
						setLose(true);
						break;
					} else if (_visited + 1 + bombCount >= size[0] * size[1]) {
						setWin(true);
					}
					_visited++;

					if (!_moved) {
						const decorated = decorateBoard(temp, [_y, _x]);
						decorated.forEach((row, __y) => {
							row.forEach((col, __x) => {
								temp[__y][__x].type = col.type;
							});
						});
						_moved = true;
						setBoard(temp);
						setMoved(true);
					} else {
						setBoard((prev) => {
							const test = [...prev];
							test[_y][_x].visited = true;
							return test;
						});
					}

					if (flood)
						DIRECTIONS.forEach((d) => {
							const [dy, dx] = d;
							const newY = _y + dy,
								newX = _x + dx;
							if (
								unvisitedLocation([newY, newX], temp) &&
								(!temp[newY][newX].type || flood) &&
								!temp[newY][newX].sus
							) {
								stack.push([newY, newX]);
							}
						});
				}
				setVisited(_visited);
			}
		},
		[
			lose,
			board,
			moved,
			unvisitedLocation,
			visited,
			bombCount,
			size,
			decorateBoard,
		]
	);

	const getTileContents = useCallback(
		(tile: Tile) => {
			if (tile.sus) return FLAG;

			if ((tile.visited || lose) && tile.type) {
				if (typeof tile.type === "number") {
					const colorIndex = Math.min(
						tile.type - 1,
						TILE_NUMBER_COLOR.length - 1
					);
					return (
						<span
							className={clsx(
								TILE_NUMBER_COLOR[colorIndex],
								"font-bold"
							)}
						>
							{tile.type}
						</span>
					);
				}

				return BOMB;
			}

			return <></>;
		},
		[lose]
	);

	const renderBoard = useMemo(
		() => (
			<table className="">
				<tbody>
					{board.map((row, y) => (
						<tr key={`row-${y}`}>
							{row.map((col, x) => (
								<td
									id={`col-${y}-${x}`}
									key={`col-${y}-${x}`}
									onClick={() => visitTile([y, x])}
									onMouseDown={() => {
										if (!lose) setFace("suspense");
									}}
									onMouseUp={() => {
										if (!lose) setFace("idle");
									}}
									onContextMenu={(e) => flagTile(e, [y, x])}
									className={clsx(
										"border w-8 h-8 text-center",
										col.visited && "bg-green-100",
										"active:bg-gray-200 hover:bg-gray-200",
										"select-none transition-colors",
										col.visited &&
											col.type === BOMB &&
											"bg-red-100"
									)}
								>
									{getTileContents(col)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		),
		[board, lose, flagTile, visitTile, getTileContents]
	);

	const renderMenu = useMemo(
		() => (
			<Fragment>
				<div className="flex items-center gap-4 h-12">
					<b>Board Size (h &times; w)</b>
					<input
						id="size-input"
						defaultValue={`${size[1]}x${size[0]}`}
						onBlur={(e) => {
							setSizeString(e.target.value);
						}}
					/>
					<Button onClick={() => initializeGame()} disabled={freeze}>
						New Game
					</Button>
				</div>
			</Fragment>
		),
		[size, freeze, initializeGame]
	);

	useEffect(() => {
		if (board.length === 1) {
			initializeGame();
		}
	}, [board, initializeGame]);

	return (
		<div className="flex flex-col justify-center items-center gap-8 h-screen">
			<p className="text-8xl">
				{FACE[face]} {flags}
			</p>
			<p>{TOP_MESSAGE[message]}</p>
			{renderMenu}
			{renderBoard}
		</div>
	);
}

export default App;
