"use client";
import { useState, useEffect, useRef } from "react";

export default function GameTestPage() {
  // Define paddle and ball dimensions as constants
  const PADDLE_HEIGHT = 106; // h-24 is 6rem, which is 96px
  const PADDLE_WIDTH = 16; // w-4 is 16px
  const PADDLE_OFFSET = 20; // left/right-20px margin from screen edge
  const BALL_SIZE = 20; // w-5, h-5 is 20px

  const [paddle1Position, setPaddle1Position] = useState(
    typeof window !== "undefined" ? window.innerHeight / 2 : 0
  );
  const [paddle2Position, setPaddle2Position] = useState(
    typeof window !== "undefined" ? window.innerHeight / 2 : 0
  );
  const [ballPosition, setBallPosition] = useState({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  });

  const ballDirection = useRef({
    x: Math.random() < 0.5 ? 0.707 : -0.707,
    y: Math.random() < 0.5 ? 0.707 : -0.707,
  });
  const ballSpeed = useRef(8); 

  const [points, setPoints] = useState({ player1: 0, player2: 0 });


  const paddle1PositionRef = useRef(paddle1Position);
  const paddle2PositionRef = useRef(paddle2Position);
  const pointsRef = useRef(points);

  useEffect(() => {
    paddle1PositionRef.current = paddle1Position;
  }, [paddle1Position]);

  useEffect(() => {
    paddle2PositionRef.current = paddle2Position;
  }, [paddle2Position]);

  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  const pressedKeys = useRef(new Set<string>()); 

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default browser actions for common game keys
      if (
        ["KeyW", "KeyS", "ArrowUp", "ArrowDown", "Space"].includes(event.code)
      ) {
        event.preventDefault();
      }
      pressedKeys.current.add(event.code);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys.current.delete(event.code);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []); 

  useEffect(() => {
    if (typeof window === "undefined") return;

    const paddleMoveAmount = 9;
    const gameHeight = window.innerHeight;
    const gameWidth = window.innerWidth;
    const PADDLE_EFFECTIVE_HEIGHT = PADDLE_HEIGHT / 2; 

    let animationFrameId: number;

    const resetBallAndPaddles = (winnerPlayer: 1 | 2) => {
      setPoints((prev) => ({
        player1: prev.player1 + (winnerPlayer === 1 ? 1 : 0),
        player2: prev.player2 + (winnerPlayer === 2 ? 1 : 0),
      }));

      // Reset paddle positions to center
      setPaddle1Position(gameHeight / 2);
      setPaddle2Position(gameHeight / 2);

      // Reset ball position to center
      setBallPosition({ x: gameWidth / 2, y: gameHeight / 2 });

      // Reset ball direction
      ballDirection.current = {
        x: Math.random() < 0.5 ? 0.707 : -0.707, // Random horizontal
        y: Math.random() < 0.5 ? 0.707 : -0.707, // Random vertical
      };

      ballSpeed.current = 8;
    };

    const gameLoop = () => {
      if (pressedKeys.current.has("KeyW")) {
        setPaddle1Position((prev) =>
          Math.max(prev - paddleMoveAmount, PADDLE_EFFECTIVE_HEIGHT)
        );
      }
      if (pressedKeys.current.has("KeyS")) {
        setPaddle1Position((prev) =>
          Math.min(
            prev + paddleMoveAmount,
            gameHeight - PADDLE_EFFECTIVE_HEIGHT
          )
        );
      }
      if (pressedKeys.current.has("ArrowUp")) {
        setPaddle2Position((prev) =>
          Math.max(prev - paddleMoveAmount, PADDLE_EFFECTIVE_HEIGHT)
        );
      }
      if (pressedKeys.current.has("ArrowDown")) {
        setPaddle2Position((prev) =>
          Math.min(
            prev + paddleMoveAmount,
            gameHeight - PADDLE_EFFECTIVE_HEIGHT
          )
        );
      }

      // --- Update Ball Position and Handle Collisions ---
      setBallPosition((prevBallPosition) => {
        let { x: currentBallX, y: currentBallY } = prevBallPosition;

        let nextDirectionX = ballDirection.current.x;
        let nextDirectionY = ballDirection.current.y;

        let nextBallX = currentBallX + ballSpeed.current * nextDirectionX;
        let nextBallY = currentBallY + ballSpeed.current * nextDirectionY;

        if (nextBallY <= 0) {
          nextBallY = 0; // Snap to top edge
          nextDirectionY *= -1; // Reverse Y direction
        } else if (nextBallY >= gameHeight - BALL_SIZE) {
          nextBallY = gameHeight - BALL_SIZE; // Snap to bottom edge
          nextDirectionY *= -1; // Reverse Y direction
        }


        const paddle1Top = paddle1PositionRef.current - PADDLE_HEIGHT / 2;
        const paddle1Bottom = paddle1PositionRef.current + PADDLE_HEIGHT / 2;
        const paddle1Right = PADDLE_OFFSET + PADDLE_WIDTH;

        if (
          nextDirectionX < 0 && // Ball moving left
          nextBallX <= paddle1Right && // Ball's leading edge reaches or passes paddle's right edge
          currentBallX > paddle1Right && // Ball was previously NOT past the paddle (prevents double hit)
          nextBallY + BALL_SIZE > paddle1Top && // Ball's bottom is below paddle's top
          nextBallY < paddle1Bottom // Ball's top is above paddle's bottom
        ) {
          nextDirectionX *= -1; // Reverse X direction
          nextBallX = paddle1Right; // Snap ball to the right edge of the paddle

          // Angle reflection based on hit point on the paddle
          const hitPointRelativeToCenter =
            nextBallY + BALL_SIZE / 2 - paddle1PositionRef.current;
          const normalizedHit = hitPointRelativeToCenter / (PADDLE_HEIGHT / 2);
          nextDirectionY = normalizedHit; // This will be normalized shortly
        }

        // --- Paddle Collision (Right Paddle) ---
        const paddle2Top = paddle2PositionRef.current - PADDLE_HEIGHT / 2;
        const paddle2Bottom = paddle2PositionRef.current + PADDLE_HEIGHT / 2;
        const paddle2Left = gameWidth - PADDLE_OFFSET - PADDLE_WIDTH;

        if (
          nextDirectionX > 0 && // Ball moving right
          nextBallX + BALL_SIZE >= paddle2Left && // Ball's trailing edge reaches or passes paddle's left edge
          currentBallX + BALL_SIZE < paddle2Left && // Ball was previously NOT past the paddle
          nextBallY + BALL_SIZE > paddle2Top && // Ball's bottom is below paddle's top
          nextBallY < paddle2Bottom // Ball's top is above paddle's bottom
        ) {
          nextDirectionX *= -1; // Reverse X direction
          nextBallX = paddle2Left - BALL_SIZE; // Snap ball to the left edge of the paddle

          // Angle reflection based on hit point on the paddle
          const hitPointRelativeToCenter =
            nextBallY + BALL_SIZE / 2 - paddle2PositionRef.current;
          const normalizedHit = hitPointRelativeToCenter / (PADDLE_HEIGHT / 2);
          nextDirectionY = normalizedHit; 
        }

        const magnitude = Math.sqrt(
          nextDirectionX * nextDirectionX + nextDirectionY * nextDirectionY
        );
        if (magnitude !== 0) {
          nextDirectionX /= magnitude;
          nextDirectionY /= magnitude;
        } else {
          // Fallback if direction becomes zero (shouldn't happen)
          nextDirectionX = 1;
          nextDirectionY = 1;
        }

        // Update the ball's direction ref for the next frame
        ballDirection.current = { x: nextDirectionX, y: nextDirectionY };

        // Return the new position for the ball
        return { x: nextBallX, y: nextBallY };
      }); 


      setBallPosition((prevBallPosition) => {
        let scored = false;
        if (prevBallPosition.x <= -BALL_SIZE) {
          // Ball went past left wall (score for player 2)
          resetBallAndPaddles(2);
          scored = true;
        } else if (prevBallPosition.x >= gameWidth) {
          // Ball went past right wall (score for player 1)
          resetBallAndPaddles(1);
          scored = true;
        }
        return prevBallPosition; 
      });

      animationFrameId = requestAnimationFrame(gameLoop); // Keep the loop going
    };

    // Initialize paddle and ball positions at the very start
    setPaddle1Position(gameHeight / 2);
    setPaddle2Position(gameHeight / 2);
    setBallPosition({ x: gameWidth / 2, y: gameHeight / 2 });

    // Start the game loop
    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
    // Dependencies: only things that would *restart* the loop (e.g., changing screen size)
  }, [PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_OFFSET, BALL_SIZE]);

  return (
    <main className="relative flex flex-col items-center justify-between h-screen bg-black text-white overflow-hidden">
      {/* Score Display */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-4xl font-bold">
        {points.player1} - {points.player2}
      </div>

      {/* Paddle 1 */}
      <div
        className="absolute transform -translate-y-1/2 bg-white"
        style={{
          width: `${PADDLE_WIDTH}px`,
          height: `${PADDLE_HEIGHT}px`,
          left: `${PADDLE_OFFSET}px`,
          top: `${paddle1Position}px`,
        }}
      />

      {/* Ball */}
      <div
        className="absolute bg-white rounded-full"
        style={{
          width: `${BALL_SIZE}px`,
          height: `${BALL_SIZE}px`,
          left: `${ballPosition.x}px`,
          top: `${ballPosition.y}px`,
        }}
      />

      {/* Paddle 2 */}
      <div
        className="absolute transform -translate-y-1/2 bg-white"
        style={{
          width: `${PADDLE_WIDTH}px`,
          height: `${PADDLE_HEIGHT}px`,
          right: `${PADDLE_OFFSET}px`,
          top: `${paddle2Position}px`,
        }}
      />
    </main>
  );
}