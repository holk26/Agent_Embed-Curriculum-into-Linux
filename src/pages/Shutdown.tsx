import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Shutdown() {
  const navigate = useNavigate();
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(0);
    }, 2000);

    const navTimer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div
      className="min-h-[calc(100dvh-68px)] flex items-center justify-center bg-terminal-black font-mono transition-opacity"
      style={{ opacity, transitionDuration: '2000ms' }}
    >
      <div className="text-center">
        <div className="text-terminal-green text-[14px] md:text-[16px] mb-2">System halted.</div>
        <div className="text-terminal-gray text-[12px]">It is now safe to turn off your computer.</div>
      </div>
    </div>
  );
}
