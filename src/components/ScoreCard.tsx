'use client';

import { useEffect, useRef } from 'react';

interface ScoreCardProps {
  score: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animationDuration?: number;
}

export default function ScoreCard({
  score,
  className = '',
  showLabel = true,
  size = 'md',
  animationDuration = 1500,
}: ScoreCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreValue = Math.round(score * 100);
  
  const getRatingText = (score: number) => {
    if (score >= 0.8) return 'Real Developer 🏆';
    if (score >= 0.6) return 'Solid Contributor 👍';
    if (score >= 0.4) return 'Average Coder 👨‍💻';
    if (score >= 0.2) return 'Potential Farmer 🌱';
    return 'Commit Farmer 🚜';
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return '#4ade80'; // Green
    if (score >= 0.6) return '#22d3ee'; // Cyan
    if (score >= 0.4) return '#facc15'; // Yellow
    if (score >= 0.2) return '#fb923c'; // Orange
    return '#f87171'; // Red
  };
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-24 w-24 text-xl';
      case 'lg': return 'h-48 w-48 text-4xl';
      case 'md':
      default: return 'h-40 w-40 text-3xl';
    }
  };
  
  const getInnerSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-18 w-18';
      case 'lg': return 'h-40 w-40';
      case 'md':
      default: return 'h-32 w-32';
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const size = canvas.offsetWidth;
    canvas.width = size * 2; // For retina displays
    canvas.height = size * 2;
    ctx.scale(2, 2);

    // Animation variables
    const startTime = performance.now();
    const endAngle = (score * Math.PI * 2);
    
    // Clear previous animation frame
    let animationFrame: number;
    
    // Animation function
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Clear canvas
      ctx.clearRect(0, 0, size, size);
      
      // Draw background circle
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(229, 231, 235, 0.5)';
      ctx.lineWidth = 10;
      ctx.stroke();
      
      // Draw progress arc
      if (progress > 0) {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 5, -Math.PI / 2, -Math.PI / 2 + (endAngle * progress));
        ctx.strokeStyle = getScoreColor(score);
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      
      // Continue animation until complete
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Ensure the final frame is drawn at 100% progress
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 5, -Math.PI / 2, -Math.PI / 2 + endAngle);
        ctx.strokeStyle = getScoreColor(score);
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    };
    
    // Start animation
    animationFrame = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [score, animationDuration]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`relative ${getSizeClass()} flex items-center justify-center rounded-full`}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"></canvas>
        <div className={`${getInnerSizeClass()} rounded-full bg-white dark:bg-gray-800 flex items-center justify-center flex-col shadow-inner z-10`}>
          <span className="font-bold">{scoreValue}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">/ 100</span>
        </div>
      </div>
      
      {showLabel && (
        <h3 className="mt-4 text-xl font-bold text-center animate-fade-in" style={{ color: getScoreColor(score) }}>
          {getRatingText(score)}
        </h3>
      )}
    </div>
  );
}