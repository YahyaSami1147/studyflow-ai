"use client";

import { useEffect, useRef, useState } from "react";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "@/components/hero/shader-source";

// Reduced motion uses a static StudyFlow gradient, while animated mode caps DPR and pauses rendering when the document is hidden.
type MouseState = {
  x: number;
  y: number;
};

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function ShaderHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<MouseState>({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl", {
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });

    if (!gl) {
      return;
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return;
    }

    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) {
      gl.deleteProgram(program);
      return;
    }

    const quad = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1,
    ]);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const mouseLocation = gl.getUniformLocation(program, "u_mouse");

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.floor(bounds.width * dpr));
      const height = Math.max(1, Math.floor(bounds.height * dpr));

      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      mouseRef.current = {
        x: width * 0.5,
        y: height * 0.5,
      };
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = event.clientX - rect.left;
      mouseRef.current.y = event.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: rect.width * 0.5,
        y: rect.height * 0.5,
      };
    };

    let elapsedTime = 0;
    let lastTimestamp = 0;
    let rafId: number | null = null;
    let running = false;

    const render = (timestamp: number) => {
      if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
      }

      const delta = Math.min(timestamp - lastTimestamp, 32);
      elapsedTime += delta;
      lastTimestamp = timestamp;

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, elapsedTime / 1000);
      gl.uniform2f(mouseLocation, mouseRef.current.x, canvas.height - mouseRef.current.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      rafId = window.requestAnimationFrame(render);
    };

    const stopAnimation = () => {
      running = false;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const startAnimation = () => {
      if (running || document.hidden) return;
      running = true;
      lastTimestamp = 0;
      rafId = window.requestAnimationFrame(render);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation();
        lastTimestamp = 0;
      } else {
        startAnimation();
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    canvas.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    startAnimation();

    return () => {
      stopAnimation();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      gl.deleteBuffer(positionBuffer);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <div
        data-reduced-motion="true"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.24),_transparent_34%),linear-gradient(135deg,_#040d18_0%,_#0c1727_45%,_#101827_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,_rgba(59,130,246,0.18),_transparent_20%),radial-gradient(circle_at_30%_70%,_rgba(168,85,247,0.12),_transparent_25%)]" />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} aria-hidden="true" className="h-full w-full" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(34,211,238,0.15),_transparent_18%),radial-gradient(circle_at_70%_12%,_rgba(96,165,250,0.12),_transparent_22%),linear-gradient(180deg,_rgba(3,8,18,0.20),_rgba(3,8,18,0.7))]" />
    </div>
  );
}
