import React, { useEffect, useRef, useState } from 'react';

interface Bird {
  x: number;
  y: number;
  velocity: number;
  rotation: number;
}

interface Heart {
  x: number;
  y: number;
  collected: boolean;
  scale: number;
}

export default function LoveBirdsGame() {
  const [nameError, setNameError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const birdRef = useRef<Bird>({ x: 50, y: 150, velocity: 0, rotation: 0 });
  const heartsRef = useRef<Heart[]>([]);
  const animationFrameRef = useRef<number>();
  const lastHeartSpawnRef = useRef(0);
  const gameLogicRef = useRef<() => void>(); // Ref to hold the latest game logic function
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [birdImage, setBirdImage] = useState<HTMLImageElement | null>(null);
  const [heartImage, setHeartImage] = useState<HTMLImageElement | null>(null);
  // Audio refs
  const gameStartSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null);

  // Logical game dimensions - all game logic will be based on these
  const LOGICAL_CANVAS_WIDTH = 600;
  const LOGICAL_CANVAS_HEIGHT = 400;

  const GRAVITY = 0.1;
  const FLAP_STRENGTH = -3;
  const BIRD_SIZE = LOGICAL_CANVAS_HEIGHT * 0.05; // e.g., 20 for 400 height
  const HEART_SIZE = LOGICAL_CANVAS_HEIGHT * 0.0375; // e.g., 15 for 400 height
  const GAME_SPEED = 3;

  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('loveBirdsHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }

    // Load background image
    const img = new Image();
    img.onload = () => {
      setBackgroundImage(img);
    };
    img.onerror = () => {
      console.error("Failed to load background image. Using fallback gradient.");
    };
    // IMPORTANT: Place your desired background image at this path in your `public` folder
    // For example: public/img/game-background.png
    img.src = '/img/game-background.png';

    // Load bird image
    const bImg = new Image();
    bImg.onload = () => setBirdImage(bImg);
    bImg.onerror = () => console.error("Failed to load bird image. Ensure bird.png is in public/img/");
    bImg.src = '/img/bird.png'; // Ensure you have public/img/bird.png

    // Load heart image
    const hImg = new Image();
    hImg.onload = () => setHeartImage(hImg);
    hImg.onerror = () => console.error("Failed to load heart image. Ensure heart-collectible.png is in public/img/");
    hImg.src = '/img/heart-collectible.png'; // Ensure you have public/img/heart-collectible.png

    // Preload images for smoother experience (optional, but good practice)
    // This can be expanded if you have many assets.
    // For now, the individual onload handlers serve a similar purpose.

    // Load sounds
    // Ensure you have these files in public/audio/
    gameStartSoundRef.current = new Audio('/audio/game-start.mp3');
    gameOverSoundRef.current = new Audio('/audio/game-over.mp3');
    // Optional: Handle potential errors during audio loading if needed
    // gameStartSoundRef.current.onerror = () => console.error("Failed to load game start sound.");
    // gameOverSoundRef.current.onerror = () => console.error("Failed to load game over sound.");


  }, []);

  const resetGame = () => {
    const canvas = canvasRef.current;
    // Bird starts in the middle-left of the logical canvas
    birdRef.current = { x: LOGICAL_CANVAS_WIDTH * 0.1, y: LOGICAL_CANVAS_HEIGHT / 2, velocity: 0, rotation: 0 };
    heartsRef.current = [];
    setScore(0);
    lastHeartSpawnRef.current = Date.now(); // Reset heart spawn timer
    setGameStarted(true);
    // Play game start sound
    if (gameStartSoundRef.current) {
      gameStartSoundRef.current.play().catch(error => console.warn("Error playing game start sound:", error));
    }
    // The useEffect hook watching gameStarted will now kick off the gameLoop.
  };

  const spawnHeart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    heartsRef.current.push({
      x: LOGICAL_CANVAS_WIDTH, // Spawn at the right edge of the logical canvas
      y: Math.random() * (LOGICAL_CANVAS_HEIGHT - HEART_SIZE * 2 - 60) + HEART_SIZE + 30, // Random Y within bounds
      collected: false,
      scale: 1
    });
  };

  const handleClick = () => {
    if (!gameStarted) {
      if (playerName.trim()) {
        setNameError("");
        resetGame();
      } else {
        setNameError("Please enter your name to start the game.");
      }
    } else {
      birdRef.current.velocity = FLAP_STRENGTH;
      birdRef.current.rotation = -20;
      if (birdRef.current.rotation < -20) birdRef.current.rotation = -20;
    }
  };

  const drawBird = (ctx: CanvasRenderingContext2D) => {
    const { x, y, rotation } = birdRef.current;
    if (birdImage) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      // Draw the image centered at (0,0) after translation and rotation
      // Adjust BIRD_SIZE to match your image's desired display size
      ctx.drawImage(birdImage, -BIRD_SIZE, -BIRD_SIZE, BIRD_SIZE * 2, BIRD_SIZE * 2);
      ctx.restore();
    } else {
      // Fallback drawing using original canvas drawing if image hasn't loaded
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);

      // Bird body
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, BIRD_SIZE);
      gradient.addColorStop(0, '#FF69B4');
      gradient.addColorStop(1, '#FF1493');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_SIZE, 0, Math.PI * 2);
      ctx.fill();

      // Wing
      ctx.fillStyle = '#FF1493';
      ctx.beginPath();
      ctx.ellipse(
        -BIRD_SIZE/2,
        0,
        BIRD_SIZE/2,
        BIRD_SIZE/3,
        Math.PI/4,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Eye
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(BIRD_SIZE/2, -BIRD_SIZE/4, BIRD_SIZE/6, 0, Math.PI * 2);
      ctx.fill();

      // Eye shine (optional, can be removed if too detailed for fallback)
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(BIRD_SIZE/2 + 2, -BIRD_SIZE/4 - 2, BIRD_SIZE/12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
    if (heartImage) {
      ctx.save();
      // Add glow effect
      ctx.shadowColor = 'rgba(255, 105, 180, 0.7)'; // A semi-transparent hot pink for the glow
      ctx.shadowBlur = 15; // Adjust for desired glow size

      ctx.translate(x, y + Math.sin(Date.now() / 500) * 3); // Floating animation
      ctx.scale(scale, scale);
      // Draw the image centered.
      ctx.drawImage(heartImage, -HEART_SIZE, -HEART_SIZE, HEART_SIZE * 2, HEART_SIZE * 2);
      ctx.restore();
    } else {
      // Fallback drawing using original canvas drawing if image hasn't loaded
      ctx.save();
      ctx.translate(x, y + Math.sin(Date.now() / 500) * 3); // Apply floating animation
      ctx.scale(scale, scale);
      
      // Create gradient
      const gradient = ctx.createLinearGradient(-HEART_SIZE/2, -HEART_SIZE/2, HEART_SIZE/2, HEART_SIZE/2);
      gradient.addColorStop(0, '#FF69B4');
      gradient.addColorStop(1, '#FF1493');
      
      ctx.fillStyle = gradient;
      
      // Draw heart shape
      ctx.beginPath();
      ctx.moveTo(0, HEART_SIZE/4);
      ctx.bezierCurveTo(0, 0, -HEART_SIZE/2, 0, -HEART_SIZE/2, HEART_SIZE/4);
      ctx.bezierCurveTo(-HEART_SIZE/2, HEART_SIZE/2, 0, HEART_SIZE, 0, HEART_SIZE);
      ctx.bezierCurveTo(0, HEART_SIZE, HEART_SIZE/2, HEART_SIZE/2, HEART_SIZE/2, HEART_SIZE/4);
      ctx.bezierCurveTo(HEART_SIZE/2, 0, 0, 0, 0, HEART_SIZE/4);
      
      // Add glow effect (optional for fallback)
      ctx.shadowColor = '#FF1493';
      ctx.shadowBlur = 15;
      ctx.fill();
      
      ctx.restore();
    }
  };

  // This useEffect updates gameLogicRef.current on every render.
  // The function assigned to gameLogicRef.current will thus always have
  // the latest state (score, highScore, gameStarted) in its closure.
  useEffect(() => {
    gameLogicRef.current = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!canvas || !ctx) {
        // If canvas is gone, stop the loop if it's running
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }
        return;
      }
      ctx.imageSmoothingEnabled = false; // For crisp pixel rendering

      // Draw background image or fallback gradient
      if (backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, LOGICAL_CANVAS_WIDTH, LOGICAL_CANVAS_HEIGHT);
      } else {
        // Fallback gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, LOGICAL_CANVAS_HEIGHT);
        gradient.addColorStop(0, '#FFF0F5'); // LavenderBlush (soft pink)
        gradient.addColorStop(1, '#E6E6FA'); // Lavender (soft purple/blue)
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, LOGICAL_CANVAS_WIDTH, LOGICAL_CANVAS_HEIGHT);
      }

      // Draw decorative background pattern
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < LOGICAL_CANVAS_WIDTH; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, LOGICAL_CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let i = 0; i < LOGICAL_CANVAS_HEIGHT; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(LOGICAL_CANVAS_WIDTH, i);
        ctx.stroke();
      }

      // Update bird
      birdRef.current.velocity += GRAVITY;
      birdRef.current.y += birdRef.current.velocity;
      birdRef.current.rotation += 2;
      if (birdRef.current.rotation > 90) birdRef.current.rotation = 90;
      // Flap can set it to -20, so this check is okay.

      // Check boundaries
      if (birdRef.current.y > LOGICAL_CANVAS_HEIGHT - BIRD_SIZE || birdRef.current.y < BIRD_SIZE) {
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('loveBirdsHighScore', score.toString());
        }
        // Play game over sound
        if (gameOverSoundRef.current) {
          gameOverSoundRef.current.play().catch(error => console.warn("Error playing game over sound:", error));
        }
        setGameStarted(false); // This will trigger the main useEffect to stop the loop
        setShowNamePrompt(true); // Show name prompt after game over
        return;
      }

      // Spawn hearts
      const now = Date.now();
      if (now - lastHeartSpawnRef.current > 1500) {
        spawnHeart();
        lastHeartSpawnRef.current = now;
      }

      // Update and draw hearts
      heartsRef.current = heartsRef.current.filter(heart => {
        if (heart.collected) return false;
        
        heart.x -= GAME_SPEED; // GAME_SPEED could be adjusted by score for difficulty
        const dx = heart.x - birdRef.current.x;
        const dy = heart.y - birdRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < BIRD_SIZE + HEART_SIZE/2) {
          setScore(prevScore => prevScore + 1);
          heart.collected = true;
          return false;
        }
        if (heart.x + HEART_SIZE < 0) return false;
        
        heart.scale = 1 + Math.sin(now / 200) * 0.1; // Faster pulse for heart
        drawHeart(ctx, heart.x, heart.y, heart.scale);
        return true;
      });
      // Draw bird
      drawBird(ctx);

      // Draw score with premium styling
      ctx.fillStyle = '#000000'; // Changed to black
      ctx.font = '16px "Press Start 2P"'; // Adjusted to multiple of 8 for crispness
      ctx.textAlign = 'left';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillText(`Score: ${score}`, 20, 40);
      ctx.fillText(`High Score: ${highScore}`, 20, 70);
      ctx.shadowColor = 'transparent';

      // If the game is still considered active (gameStarted is true in this closure),
      // schedule the next frame using the stable gameTick function.
      if (gameStarted) { 
        animationFrameRef.current = requestAnimationFrame(gameTick);
      }
    };
  }); // No dependency array, so gameLogicRef.current is updated on every render.

  // Handle score submission (moved to top-level)
  useEffect(() => {
    if (showNamePrompt && !scoreSubmitted && playerName && score > 0) {
      fetch('/api/love-birds-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, score }),
      })
        .then(() => setScoreSubmitted(true))
        .catch(() => setScoreSubmitted(true));
    }
  }, [showNamePrompt, playerName, score, scoreSubmitted]);

  // Stable function to be called by requestAnimationFrame.
  // This function will, in turn, call the latest game logic via gameLogicRef.
  const gameTick = () => {
    if (gameLogicRef.current) {
      gameLogicRef.current();
    }
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Set canvas size with better resolution
    // The actual display size will be controlled by CSS (style.width, style.maxWidth)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = LOGICAL_CANVAS_WIDTH * dpr;
    canvas.height = LOGICAL_CANVAS_HEIGHT * dpr;

    canvas.style.width = '100%'; // Make canvas fill its container's width
    canvas.style.maxWidth = `${LOGICAL_CANVAS_WIDTH}px`; // But not larger than its logical width
    // canvas.style.height = 'auto'; // Browser maintains aspect ratio based on width/height attributes

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr); // Scale context for drawing at high DPI on the larger backing store
    }
    // This effect runs once for canvas setup.
    // The initial drawing of the start screen will be handled by the next useEffect.
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.imageSmoothingEnabled = false; // For crisp pixel rendering on start screen

    const drawStartScreen = () => {
        // Draw background image or fallback gradient
        if (backgroundImage) {
          ctx.drawImage(backgroundImage, 0, 0, LOGICAL_CANVAS_WIDTH, LOGICAL_CANVAS_HEIGHT);
        } else {
          // Fallback gradient for start screen
          const gradient = ctx.createLinearGradient(0, 0, 0, LOGICAL_CANVAS_HEIGHT);
          gradient.addColorStop(0, '#FFF0F5'); // LavenderBlush
          gradient.addColorStop(1, '#E6E6FA'); // Lavender
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, LOGICAL_CANVAS_WIDTH, LOGICAL_CANVAS_HEIGHT);
        }

        // Decorative grid lines (optional)
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.1)'; // Match game background pattern
        ctx.lineWidth = 1;
        for (let i = 0; i < LOGICAL_CANVAS_WIDTH; i += 30) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, LOGICAL_CANVAS_HEIGHT); ctx.stroke(); }
        for (let i = 0; i < LOGICAL_CANVAS_HEIGHT; i += 30) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(LOGICAL_CANVAS_WIDTH, i); ctx.stroke(); }

        ctx.fillStyle = '#000000'; // Changed to black
        ctx.font = '26px "Press Start 2P"'; // Adjusted to multiple of 8
        ctx.textAlign = 'center';

        // Add vibration to "Click to Start" text
        const time = Date.now();
        const vibrateX = Math.sin(time / 80) * 1.5; // Adjust 80 for speed, 1.5 for amplitude
        const vibrateY = Math.cos(time / 85) * 1.5; // Slightly different frequency for Y for more organic feel
        ctx.fillText('Click to Start', (LOGICAL_CANVAS_WIDTH / 2) + vibrateX, (LOGICAL_CANVAS_HEIGHT / 2) + vibrateY);

        ctx.font = '16px "Press Start 2P"'; // Adjusted to multiple of 8
        ctx.fillText(`High Score: ${highScore}`, LOGICAL_CANVAS_WIDTH / 2, LOGICAL_CANVAS_HEIGHT / 2 + 30);
    };

    if (gameStarted) {
      animationFrameRef.current = requestAnimationFrame(gameTick);
    } else {
      // If a game loop was running, cancel it.
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      // Start an animation loop for the start screen
      const startScreenTick = () => {
        if (!gameStarted && canvasRef.current) { // Check gameStarted again in case it changed
          drawStartScreen();
          animationFrameRef.current = requestAnimationFrame(startScreenTick);
        } else if (animationFrameRef.current) {
          // If game started or canvas disappeared, stop this loop
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }
      };
      startScreenTick(); // Initial call to start the loop
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [gameStarted, highScore, backgroundImage, birdImage, heartImage]); // Add new images as dependencies


  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onTouchStart={handleClick}
        className="bg-white rounded-lg shadow-lg cursor-pointer premium-border premium-shadow"
        style={{ touchAction: 'none' }}
      />
      <p className="mt-6 text-gray-600 text-center font-serif">
        Click or tap to make the love bird fly and collect hearts!<br />
        Don't hit the top or bottom edges!
      </p>
      {/* Show name input on start screen (not during game or game over) */}
      {!gameStarted && !showNamePrompt && (
        <div className="mt-6 flex flex-col items-center">
          <input
            type="text"
            className={`border rounded px-4 py-2 mb-2 w-64 text-center ${nameError ? 'border-red-500' : ''}`}
            placeholder="Enter your name to start"
            value={playerName}
            onChange={e => {
              setPlayerName(e.target.value);
              if (e.target.value.trim()) setNameError("");
            }}
            maxLength={64}
          />
          {nameError && <span className="text-red-600 text-sm mb-2">{nameError}</span>}
          <span className="text-sm text-gray-500 mb-2">Your name will be saved with your score.</span>
          <button
            className={`bg-pink-500 text-white px-6 py-2 rounded font-bold hover:bg-pink-600`}
            onClick={handleClick}
          >
            Start Game
          </button>
        </div>
      )}
      {/* Game Over Prompt (no name input) */}
      {showNamePrompt && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={e => {
            // Only dismiss if clicking the overlay, not the modal itself
            if (e.target === e.currentTarget) {
              setShowNamePrompt(false);
              setScoreSubmitted(false);
              // Do NOT start a new game, just close modal
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-8 text-center"
            onClick={e => e.stopPropagation()} // Prevent modal clicks from dismissing
          >
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="mb-2">Your score: <span className="font-mono text-xl">{score}</span></p>
            {scoreSubmitted ? (
              <span className="text-green-600 font-semibold">Score saved!</span>
            ) : (
              <span className="text-gray-600">Saving score...</span>
            )}
            <br />
            <button
              className="mt-4 underline text-blue-600 hover:text-blue-800 mr-4"
              onClick={() => {
                setShowNamePrompt(false);
                setScoreSubmitted(false);
                resetGame();
              }}
            >Play Again</button>
            <button
              className="mt-4 underline text-red-600 hover:text-red-800"
              onClick={() => {
                setShowNamePrompt(false);
                setScoreSubmitted(false);
                // Optionally reset game, or just close modal
              }}
            >Exit</button>
          </div>
        </div>
      )}
    </div>
  );
}