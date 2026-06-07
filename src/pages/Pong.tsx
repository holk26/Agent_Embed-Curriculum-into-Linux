import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const GRID_W = 50;
const GRID_H = 20;
const PADDLE_H = 4;
const WIN_SCORE = 5;

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export default function Pong() {
  const navigate = useNavigate();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [playerY, setPlayerY] = useState(Math.floor(GRID_H / 2 - PADDLE_H / 2));
  const [aiY, setAiY] = useState(Math.floor(GRID_H / 2 - PADDLE_H / 2));
  const [ball, setBall] = useState<Ball>({ x: Math.floor(GRID_W / 2), y: Math.floor(GRID_H / 2), dx: 1, dy: 1 });
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [paused, setPaused] = useState(false);
  const playerYRef = useRef(playerY);
  playerYRef.current = playerY;

  const resetBall = useCallback((towardPlayer: boolean) => {
    setBall({
      x: Math.floor(GRID_W / 2),
      y: Math.floor(GRID_H / 2),
      dx: towardPlayer ? -1 : 1,
      dy: Math.random() > 0.5 ? 1 : -1,
    });
  }, []);

  const resetGame = useCallback(() => {
    setPlayerY(Math.floor(GRID_H / 2 - PADDLE_H / 2));
    setAiY(Math.floor(GRID_H / 2 - PADDLE_H / 2));
    resetBall(true);
    setPlayerScore(0);
    setAiScore(0);
    setGameOver(false);
    setWinner(null);
    setPaused(false);
  }, [resetBall]);

  useEffect(() => {
    if (gameOver || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setBall((prev) => {
        let { x, y, dx, dy } = prev;
        x += dx;
        y += dy;

        // Wall bounce (top/bottom)
        if (y <= 0 || y >= GRID_H - 1) {
          dy = -dy;
          y = Math.max(0, Math.min(GRID_H - 1, y));
        }

        // Player paddle collision
        if (x === 2 && y >= playerYRef.current && y < playerYRef.current + PADDLE_H) {
          dx = -dx;
          x = 3;
          // Add slight angle variation based on hit position
          const hitPos = y - playerYRef.current;
          if (hitPos < PADDLE_H / 2) dy = Math.min(-1, dy - 1);
          else dy = Math.max(1, dy + 1);
        }

        // AI paddle collision
        setAiY((currentAiY) => {
          if (x === GRID_W - 3 && y >= currentAiY && y < currentAiY + PADDLE_H) {
            dx = -dx;
            x = GRID_W - 4;
          }
          return currentAiY;
        });

        // Scoring
        if (x < 0) {
          setAiScore((s) => {
            const newS = s + 1;
            if (newS >= WIN_SCORE) {
              setGameOver(true);
              setWinner('ai');
            }
            return newS;
          });
          resetBall(true);
          return { x: Math.floor(GRID_W / 2), y: Math.floor(GRID_H / 2), dx: -1, dy: Math.random() > 0.5 ? 1 : -1 };
        }

        if (x >= GRID_W) {
          setPlayerScore((s) => {
            const newS = s + 1;
            if (newS >= WIN_SCORE) {
              setGameOver(true);
              setWinner('player');
            }
            return newS;
          });
          resetBall(false);
          return { x: Math.floor(GRID_W / 2), y: Math.floor(GRID_H / 2), dx: 1, dy: Math.random() > 0.5 ? 1 : -1 };
        }

        return { x, y, dx, dy };
      });

      // Simple AI: follow ball with delay and error
      setAiY((prev) => {
        const target = ball.y - PADDLE_H / 2;
        const diff = target - prev;
        if (Math.abs(diff) > 1) {
          const move = diff > 0 ? 1 : -1;
          const next = prev + move;
          return Math.max(0, Math.min(GRID_H - PADDLE_H, next));
        }
        return prev;
      });
    }, 80);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameOver, paused, ball.y, resetBall]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          setPlayerY((y) => Math.max(0, y - 2));
          e.preventDefault();
          break;
        case 's':
        case 'arrowdown':
          setPlayerY((y) => Math.min(GRID_H - PADDLE_H, y + 2));
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
  }, [gameOver, navigate, resetGame]);

  const renderGrid = () => {
    const rows: string[] = [];
    for (let y = 0; y < GRID_H; y++) {
      let row = '';
      for (let x = 0; x < GRID_W; x++) {
        const isPlayerPaddle = x === 2 && y >= playerY && y < playerY + PADDLE_H;
        const isAiPaddle = x === GRID_W - 3 && y >= aiY && y < aiY + PADDLE_H;
        const isBall = Math.round(ball.x) === x && Math.round(ball.y) === y;
        if (isPlayerPaddle || isAiPaddle) row += '█';
        else if (isBall) row += '●';
        else if (x === Math.floor(GRID_W / 2)) row += '│';
        else row += ' ';
      }
      rows.push(row);
    }
    return rows;
  };

  const gridLines = renderGrid();

  return (
    <div className="min-h-[calc(100dvh-68px)] flex flex-col items-center justify-center bg-terminal-black font-mono p-4">
      <div className="w-full max-w-[900px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-terminal-green font-bold text-[14px] md:text-[16px]">PONG.EXE</span>
          <span className="text-terminal-gray text-[12px] md:text-[14px]">
            Player: <span className="text-terminal-white">{playerScore}</span> | AI: <span className="text-terminal-red">{aiScore}</span>
          </span>
        </div>

        <div className="border-2 border-terminal-green-dim bg-terminal-black-alt p-2 md:p-3 overflow-x-auto">
          <pre className="font-mono text-[8px] md:text-[12px] leading-[1.2] text-terminal-green whitespace-pre">
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
          <span>W/S or ↑/↓ to move</span>
          <span>P: Pause | R: Restart | Q: Quit</span>
        </div>

        {paused && !gameOver && (
          <div className="mt-4 text-center">
            <span className="text-terminal-amber font-bold text-[14px]">PAUSED</span>
          </div>
        )}

        {gameOver && (
          <div className="mt-4 text-center">
            <div className={`font-bold text-[16px] mb-1 ${winner === 'player' ? 'text-terminal-green' : 'text-terminal-red'}`}>
              {winner === 'player' ? 'YOU WIN!' : 'AI WINS!'}
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
