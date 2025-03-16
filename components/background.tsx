"use client"

import { useEffect, useRef } from "react"

export default function Background() {
  const dotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Force black background everywhere
    document.documentElement.style.backgroundColor = '#000000';
    document.body.style.backgroundColor = '#000000';
    document.documentElement.style.background = '#000000';
    document.body.style.background = '#000000';
    
    // Create dots...
    const dots = Array.from({ length: 50 }).map((_, i) => ({
      left: `${(i * 2) % 100}%`,
      top: `${(i * 3) % 100}%`,
      opacity: 0.3 + (i % 5) * 0.1,
      animationDuration: `${2 + (i % 3)}s`
    }));

    if (dotsRef.current) {
      dotsRef.current.innerHTML = dots.map(dot => `
        <div
          style="
            position: absolute;
            width: 2px;
            height: 2px;
            background: #ff6b00;
            border-radius: 50%;
            box-shadow: 0 0 4px #ff6b00;
            left: ${dot.left};
            top: ${dot.top};
            opacity: ${dot.opacity};
            animation: twinkle ${dot.animationDuration} infinite;
          "
        ></div>
      `).join('');
    }
  }, []);

  return (
    <>
      {/* Black overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -2,
          backgroundColor: '#000000',
        }}
      />
      {/* Dots container */}
      <div 
        ref={dotsRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          backgroundColor: '#000000',
        }}
      />
    </>
  );
}

