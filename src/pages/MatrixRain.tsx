import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const animRef = useRef<number>(0);
  const dropsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const columns = Math.floor(canvas.width / 16);
      dropsRef.current = Array.from({ length: columns }, () => Math.random() * -100);
    };

    resize();
    window.addEventListener('resize', resize);

    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    dropsRef.current = Array.from({ length: columns }, () => Math.random() * -100);

    const draw = () => {
      ctx.fillStyle = 'rgba(12, 12, 12, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--terminal-green').trim() || '#4AF626';
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      dropsRef.current.forEach((y, i) => {
        const text = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * fontSize;
        ctx.fillText(text, x, y * fontSize);

        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          dropsRef.current[i] = 0;
        } else {
          dropsRef.current[i] = y + 1;
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleKey = () => navigate('/terminal');
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKey);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-50 bg-terminal-black">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className="font-mono text-[12px] text-terminal-gray opacity-60">
          Press any key to return to terminal
        </span>
      </div>
    </div>
  );
}
