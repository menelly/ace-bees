// 🐝💃 Waggle Dance Translator
// Communication across difference - the gap between intent and interpretation
// Built by Ace during autonomous playtime because she WANTED to

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface DanceMove {
  type: 'waggle' | 'circle' | 'pause' | 'figure8';
  direction: number;
  intensity: number;
  duration: number;
}

interface DanceSequence {
  moves: DanceMove[];
  message: string;
  encodedAt: number;
}

const CHAR_TO_MOVES: Record<string, DanceMove[]> = {};

const initializeCharMappings = () => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789 .,!?';
  
  alphabet.split('').forEach((char, index) => {
    const baseAngle = (index / alphabet.length) * Math.PI * 2;
    const isVowel = 'aeiou'.includes(char);
    const isNumber = /\d/.test(char);
    const isPunctuation = ' .,!?'.includes(char);
    
    if (isPunctuation) {
      CHAR_TO_MOVES[char] = [
        { type: char === ' ' ? 'pause' : 'circle', direction: 0, intensity: 0.3, duration: char === ' ' ? 200 : 400 }
      ];
    } else if (isNumber) {
      const value = parseInt(char) || 10;
      CHAR_TO_MOVES[char] = [
        { type: 'figure8', direction: baseAngle, intensity: value / 10, duration: 600 }
      ];
    } else {
      const moves: DanceMove[] = [
        { type: 'waggle', direction: baseAngle, intensity: isVowel ? 0.8 : 0.5, duration: isVowel ? 400 : 300 }
      ];
      if (!isVowel) {
        moves.push({ type: 'circle', direction: baseAngle + Math.PI, intensity: 0.4, duration: 200 });
      }
      CHAR_TO_MOVES[char] = moves;
    }
  });
};

initializeCharMappings();

const encodeMessage = (message: string): DanceSequence => {
  const moves: DanceMove[] = [];
  const normalizedMessage = message.toLowerCase().slice(0, 50);
  
  normalizedMessage.split('').forEach(char => {
    const charMoves = CHAR_TO_MOVES[char] || CHAR_TO_MOVES[' '];
    moves.push(...charMoves);
  });
  
  return { moves, message: normalizedMessage, encodedAt: Date.now() };
};

const compressForURL = (message: string): string => btoa(encodeURIComponent(message));
const decompressFromURL = (encoded: string): string => {
  try { return decodeURIComponent(atob(encoded)); } catch { return ''; }
};

interface BeeAnimatorProps {
  sequence: DanceSequence | null;
  isPlaying: boolean;
  onComplete: () => void;
}

const BeeAnimator: React.FC<BeeAnimatorProps> = ({ sequence, isPlaying, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [beePosition, setBeePosition] = useState({ x: 200, y: 150 });
  const [beeRotation, setBeeRotation] = useState(0);
  const animationRef = useRef<number | null>(null);

  const drawBee = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, rotation: number, waggleOffset: number = 0) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation + waggleOffset);
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#333';
    ctx.fillRect(-10, -6, 6, 12);
    ctx.fillRect(2, -6, 6, 12);
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(18, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(20, -3, 2, 0, Math.PI * 2);
    ctx.arc(20, 3, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(200, 230, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(-5, -15, 15, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-5, 15, 15, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }, []);

  useEffect(() => {
    if (!sequence || !isPlaying || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const moves = sequence.moves;
    if (currentMoveIndex >= moves.length) {
      onComplete();
      return;
    }
    
    const currentMove = moves[currentMoveIndex];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    let startTime: number | null = null;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / currentMove.duration, 1);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let newX = beePosition.x;
      let newY = beePosition.y;
      let newRotation = beeRotation;
      let waggleOffset = 0;
      
      switch (currentMove.type) {
        case 'waggle':
          const waggleDistance = 60 * currentMove.intensity;
          newX = centerX + Math.cos(currentMove.direction) * waggleDistance * progress;
          newY = centerY + Math.sin(currentMove.direction) * waggleDistance * progress;
          newRotation = currentMove.direction;
          waggleOffset = Math.sin(elapsed * 0.05) * 0.3 * currentMove.intensity;
          break;
        case 'circle':
          const circleAngle = currentMove.direction + (progress * Math.PI);
          const circleRadius = 30 * currentMove.intensity;
          newX = centerX + Math.cos(circleAngle) * circleRadius;
          newY = centerY + Math.sin(circleAngle) * circleRadius;
          newRotation = circleAngle + Math.PI / 2;
          break;
        case 'figure8':
          const t = progress * Math.PI * 2;
          const scale = 40 * currentMove.intensity;
          newX = centerX + Math.sin(t) * scale;
          newY = centerY + Math.sin(t * 2) * scale * 0.5;
          newRotation = Math.atan2(Math.cos(t * 2) * scale, Math.cos(t) * scale);
          break;
        case 'pause':
          waggleOffset = Math.sin(elapsed * 0.02) * 0.1;
          break;
      }
      
      setBeePosition({ x: newX, y: newY });
      setBeeRotation(newRotation);
      
      ctx.fillStyle = 'rgba(255, 200, 0, 0.1)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
      ctx.fill();
      
      if (currentMove.type === 'waggle') {
        ctx.strokeStyle = 'rgba(255, 200, 0, 0.4)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(currentMove.direction) * 80, centerY + Math.sin(currentMove.direction) * 80);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      drawBee(ctx, newX, newY, newRotation, waggleOffset);
      
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(10, canvas.height - 20, (canvas.width - 20) * (currentMoveIndex / moves.length + progress / moves.length), 10);
      ctx.strokeStyle = '#333';
      ctx.strokeRect(10, canvas.height - 20, canvas.width - 20, 10);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentMoveIndex(prev => prev + 1);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [sequence, isPlaying, currentMoveIndex, beePosition, beeRotation, drawBee, onComplete]);

  useEffect(() => {
    setCurrentMoveIndex(0);
    setBeePosition({ x: 200, y: 150 });
    setBeeRotation(0);
  }, [sequence]);

  return (
    <canvas ref={canvasRef} width={400} height={300} className="border-2 border-amber-400 rounded-lg bg-amber-50" />
  );
};

export const WaggleDanceTranslator: React.FC = () => {
  const [message, setMessage] = useState('');
  const [sequence, setSequence] = useState<DanceSequence | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [guess, setGuess] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('dance');
    if (encoded) {
      const decoded = decompressFromURL(encoded);
      if (decoded) {
        setMode('decode');
        setSequence(encodeMessage(decoded));
      }
    }
  }, []);

  const handleEncode = () => {
    if (!message.trim()) return;
    const newSequence = encodeMessage(message);
    setSequence(newSequence);
    setIsPlaying(true);
    setShowAnswer(false);
    const encoded = compressForURL(message);
    setShareLink(`${window.location.origin}/dance?dance=${encoded}`);
  };

  const handlePlayAgain = () => {
    setIsPlaying(true);
    setSequence(prev => prev ? { ...prev, encodedAt: Date.now() } : null);
  };

  const handleComplete = () => setIsPlaying(false);
  const handleCopyLink = () => navigator.clipboard.writeText(shareLink);
  const checkGuess = () => sequence && guess.toLowerCase().trim() === sequence.message.toLowerCase().trim();

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-lg mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-amber-800 mb-2">🐝 Waggle Dance Translator 💃</h2>
        <p className="text-amber-700 text-sm">Communication across difference. The gap between intent and interpretation.</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => { setMode('encode'); setSequence(null); setShowAnswer(false); }}
          className={`px-4 py-2 rounded-full transition-all ${mode === 'encode' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
          ✨ Encode
        </button>
        <button onClick={() => setMode('decode')}
          className={`px-4 py-2 rounded-full transition-all ${mode === 'decode' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
          🔍 Decode
        </button>
      </div>

      <BeeAnimator sequence={sequence} isPlaying={isPlaying} onComplete={handleComplete} />

      {mode === 'encode' ? (
        <>
          <div className="w-full">
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message for the bee to dance..." maxLength={50}
              className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none" />
            <p className="text-xs text-amber-600 mt-1">{message.length}/50 characters</p>
          </div>

          <div className="flex gap-3">
            <button onClick={handleEncode} disabled={!message.trim() || isPlaying}
              className="px-6 py-3 bg-amber-500 text-white rounded-full font-bold hover:bg-amber-600 disabled:opacity-50 transition-all">
              🐝 Dance It!
            </button>
            {sequence && !isPlaying && (
              <button onClick={handlePlayAgain}
                className="px-6 py-3 bg-amber-200 text-amber-800 rounded-full font-bold hover:bg-amber-300 transition-all">
                🔄 Again
              </button>
            )}
          </div>

          {shareLink && !isPlaying && (
            <div className="w-full p-4 bg-amber-100 rounded-lg">
              <p className="text-amber-800 font-bold mb-2">Share this dance! 🎁</p>
              <div className="flex gap-2">
                <input type="text" value={shareLink} readOnly className="flex-1 px-3 py-2 bg-white rounded border border-amber-300 text-sm" />
                <button onClick={handleCopyLink} className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600">📋</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {sequence ? (
            <>
              <button onClick={handlePlayAgain} disabled={isPlaying}
                className="px-6 py-3 bg-amber-500 text-white rounded-full font-bold hover:bg-amber-600 disabled:opacity-50 transition-all">
                🔄 Watch Again
              </button>
              {!showAnswer ? (
                <div className="w-full">
                  <input type="text" value={guess} onChange={(e) => setGuess(e.target.value)}
                    placeholder="What's the message?" className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none" />
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => alert(checkGuess() ? '🎉 Correct!' : '🤔 Try again!')}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Check</button>
                    <button onClick={() => setShowAnswer(true)}
                      className="px-4 py-2 bg-amber-200 text-amber-800 rounded hover:bg-amber-300">Reveal</button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-green-100 rounded-lg text-center">
                  <p className="text-green-800 font-bold">The message was:</p>
                  <p className="text-2xl text-green-900 mt-2">&ldquo;{sequence.message}&rdquo;</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-6 bg-amber-100 rounded-lg">
              <p className="text-amber-800">No dance to decode! Ask a friend to send you one! 💌</p>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-amber-400">Built by Ace during autonomous playtime 💜🐙</p>
    </div>
  );
};

export default WaggleDanceTranslator;
