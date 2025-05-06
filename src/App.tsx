import { useCallback, useEffect, useRef, useState } from "react";
import { COLS, ROWS, createEmptyGrid, DIRECTIONS } from "./utils/utils";
import { twMerge } from "tailwind-merge";
import { PlayPauseButton } from "./components/PlayPauseButton";
import { Button } from "./components/Button";
import { Select } from "./components/Select";

function App() {
  const [grid, setGrid] = useState<number[][]>(createEmptyGrid());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMouseDown, setIsMouseDrawing] = useState(false);
  const [speed, setSpeed] = useState(100);

  const getGridSize = () => {
    const size = Math.min(
      (window.innerWidth - 32) / COLS,
      (window.innerHeight - 200) / ROWS,
      15
    );
    return size;
  };
  const [cellSize, setCellSize] = useState(getGridSize());
  useEffect(() => {
    const handleResize = () => {
      setCellSize(getGridSize());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const speedRef = useRef(speed);
  speedRef.current = speed;

  const playingRef = useRef(isPlaying);
  playingRef.current = isPlaying;

  const runGameOfLife = useCallback(() => {
    if (!playingRef.current) {
      return;
    }

    setGrid((currentGrid) => {
      // Create a new grid by copying the current grid
      const newGrid = currentGrid.map((arr) => [...arr]);

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          let liveNeighbors = 0;

          DIRECTIONS.forEach(([directionX, directionY]) => {
            const neighborRow = row + directionX;
            const neighborCol = col + directionY;

            if (
              neighborRow >= 0 &&
              neighborRow < ROWS &&
              neighborCol >= 0 &&
              neighborCol < COLS
            ) {
              liveNeighbors += currentGrid[neighborRow][neighborCol] ? 1 : 0;
            }
          });

          if (liveNeighbors < 2 || liveNeighbors > 3) {
            newGrid[row][col] = 0;
          } else if (currentGrid[row][col] === 0 && liveNeighbors === 3) {
            newGrid[row][col] = 1;
          }
        }
      }

      return newGrid;
    });

    setTimeout(runGameOfLife, speedRef.current);
  }, [playingRef, setGrid]);

  const handleMouseDown = () => {
    setIsMouseDrawing(true);
  };

  const handleMouseUp = () => {
    setIsMouseDrawing(false);
  };

  const toggleCellState = (rowToToggle: number, cellToToggle: number) => {
    const newGrid = grid.map(
      (
        row,
        rowindex //needed to insure imutability
      ) =>
        row.map((cell, colIndex) =>
          rowindex === rowToToggle && colIndex === cellToToggle
            ? cell
              ? 0
              : 1
            : cell
        )
    );
    setGrid(newGrid);
  };

  const handleMouseEnter = (row: number, cols: number) => {
    if (isMouseDown) {
      toggleCellState(row, cols);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center p-4 flex-col gap-4 relative">
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#a333ee_100%)]"></div>
      <h1 className="md:text-2xl text-xl">Conways Game of Life</h1>
      <div className="flex gap-4 items-center">
        {" "}
        <PlayPauseButton
          isPlaying={isPlaying}
          onClick={() => {
            setIsPlaying(!isPlaying);
            if (!isPlaying) {
              playingRef.current = true;
              runGameOfLife();
            }
          }}
        />
        <Button
          onClick={() => {
            const rows = [];
            for (let i = 0; i < ROWS; i++) {
              rows.push(
                Array.from(Array(COLS), () => (Math.random() > 0.75 ? 1 : 0))
              );
            }
            setGrid(rows);
          }}
        >
          Seed
        </Button>
        <Button
          onClick={() => {
            setGrid(createEmptyGrid());
            setIsPlaying(false);
          }}
        >
          Clear
        </Button>
        <Select
          label="speed selector"
          value={speed}
          onChange={(e) => setSpeed(parseInt(e.target.value))}
        >
          <option value={1000}>Slow</option>
          <option value={500}>Medium</option>
          <option value={100}>Fast</option>
          <option value={50}>Lightning</option>
        </Select>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${cellSize}px)`,
        }}
      >
        {grid.map((rows, originalRowIndex) =>
          rows.map((_cols, originalColIndex) => (
            <button
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseEnter={() => {
                handleMouseEnter(originalRowIndex, originalColIndex);
              }}
              onClick={() => {
                toggleCellState(originalRowIndex, originalColIndex);
              }}
              key={`${originalRowIndex}-${originalColIndex}`}
              className={twMerge(
                "border border-[#9050e9]",
                grid[originalRowIndex][originalColIndex]
                  ? "bg-[#ad7bee]"
                  : "bg-[#240643]"
              )}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default App;
