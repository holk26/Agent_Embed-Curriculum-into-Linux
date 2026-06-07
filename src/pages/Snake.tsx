import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_W = 30;
const GRID_H = 20;
const INITIAL_SPEED = 150;

interface Point {
  x: number;
  y: number;
}

function randomFood(snake: Point[]): Point {
  let pos: Point;
  do {
    pos = { x: Math.floor(Math.random() * GRID_W), y: Math.floor(Math.random() * GRID_H) };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

export default function Snake() {
  const navigate = useNavigate();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [snake, setSnake] = useState<Point[]>([
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 },
  ]);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [, setNextDirection] = useState<Direction>('RIGHT');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('snake-highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  const speed = Math.max(60, INITIAL_SPEED - Math.floor(score / 5) * 15);

  const resetGame = useCallback(() => {
    const start = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 },
    ];
    setSnake(start);
    setFood(randomFood(start));
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setScore(0);
    setGameOver(false);
    setPaused(false);
  }, []);

  useEffect(() => {
    if (gameOver || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setNextDirection((nd) => {
        setDirection(nd);
        setSnake((prevSnake) => {
          const head = prevSnake[0];
          let newHead: Point;
          switch (nd) {
            case 'UP':
              newHead = { x: head.x, y: head.y - 1 };
              break;
            case 'DOWN':
              newHead = { x: head.x, y: head.y + 1 };
              break;
            case 'LEFT':
              newHead = { x: head.x - 1, y: head.y };
              break;
            case 'RIGHT':
              newHead = { x: head.x + 1, y: head.y };
              break;
          }

          if (
            newHead.x < 0 ||
            newHead.x >= GRID_W ||
            newHead.y < 0 ||
            newHead.y >= GRID_H ||
            prevSnake.some((s) => s.x === newHead.x && s.y === newHead.y)
          ) {
            setGameOver(true);
            setHighScore((hs) => {
              const newHs = Math.max(hs, score);
              try {
                localStorage.setItem('snake-highscore', String(newHs));
              } catch {
                /* ignore */
              }
              return newHs;
            });
            return prevSnake;
          }

          const ate = newHead.x === food.x && newHead.y === food.y;
          const newSnake = [newHead, ...prevSnake];
          if (!ate) {
            newSnake.pop();
          } else {
            setScore((s) => s + 1);
            setFood(randomFood(newSnake));
          }
          return newSnake;
        });
        return nd;
      });
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameOver, paused, speed, food, score]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          if (direction !== 'DOWN') setNextDirection('UP');
          e.preventDefault();
          break;
        case 'arrowdown':
        case 's':
          if (direction !== 'UP') setNextDirection('DOWN');
          e.preventDefault();
          break;
        case 'arrowleft':
        case 'a':
          if (direction !== 'RIGHT') setNextDirection('LEFT');
          e.preventDefault();
          break;
        case 'arrowright':
        case 'd':
          if (direction !== 'LEFT') setNextDirection('RIGHT');
          e.preventDefault();
          break;
        case 'p':
          if (!gameOver) setPaused((p) => !p);
          break;
        case 'r':
          resetGame();
          break;
        case 'q':
          navigate('/terminal');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameOver, navigate, resetGame]);

  const renderGrid = () => {
    const rows: string[] = [];
    for (let y = 0; y < GRID_H; y++) {
      let row = '';
      for (let x = 0; x < GRID_W; x++) {
        const isSnake = snake.some((s) => s.x === x && s.y === y);
        const isFood = food.x === x && food.y === y;
        if (isSnake) row += '█';
        else if (isFood) row += '●';
        else row += ' ';
      }
      rows.push(row);
    }
    return rows;
  };

  const gridLines = renderGrid();

  return (
    <div className="min-h-[calc(100dvh-68px)] flex flex-col items-center justify-center bg-terminal-black font-mono p-4">
      <div className="w-full max-w-[800px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-terminal-green font-bold text-[14px] md:text-[16px]">SNAKE.EXE</span>
          <span className="text-terminal-gray text-[12px] md:text-[14px]">
            Score: <span className="text-terminal-white">{score}</span> | High: <span className="text-terminal-amber">{highScore}</span>
          </span>
        </div>

        <div className="border-2 border-terminal-green-dim bg-terminal-black-alt p-2 md:p-3 overflow-x-auto">
          <pre className="font-mono text-[10px] md:text-[14px] leading-[1.2] text-terminal-green whitespace-pre">
            {'┌' + '─'.repeat(GRID_W) + '┐\n'}
            {gridLines.map((line, i) => (
              <span key={i}>
                {'│' + line + '│\n'}
              </span>
            ))}
            {'└' + '─'.repeat(GRID_W) + '┘'}
          </pre>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] md:text-[13px] text-terminal-gray">
          <span>WASD / Arrows to move</span>
          <span>P: Pause | R: Restart | Q: Quit</span>
        </div>

        {paused && !gameOver && (
          <div className="mt-4 text-center">
            <span className="text-terminal-amber font-bold text-[14px]">PAUSED</span>
          </div>
        )}

        {gameOver && (
          <div className="mt-4 text-center">
            <div className="text-terminal-red font-bold text-[16px] mb-1">GAME OVER</div>
            <div className="text-terminal-gray text-[13px]">
              Final Score: <span className="text-terminal-white">{score}</span>
            </div>
            <div className="text-terminal-gray text-[12px] mt-1">
              Press <span className="text-terminal-green">R</span> to restart or <span className="text-terminal-green">Q</span> to quit
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
