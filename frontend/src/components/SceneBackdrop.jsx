import { useEffect, useRef } from 'react';

// Monochrome, animated 3D backdrop shared by every route and both themes.
export default function SceneBackdrop({ isLanding = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !ctx) return undefined;

    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let themeObserver;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const move = (event) => {
      targetX = (event.clientX / Math.max(width, 1) - 0.5) * 20;
      targetY = (event.clientY / Math.max(height, 1) - 0.5) * 16;
    };

    const draw = (now = 0) => {
      const t = reducedMotion ? 0 : now * 0.00022;
      const dark = document.documentElement.dataset.t === 'dark';
      pointerX += (targetX - pointerX) * 0.035;
      pointerY += (targetY - pointerY) * 0.035;
      ctx.fillStyle = dark ? '#080808' : '#f5f0e6';
      ctx.fillRect(0, 0, width, height);

      const grid = Math.max(29, Math.min(42, width / 35));
      const fade = ctx.createRadialGradient(width * 0.66, height * 0.44, 0, width * 0.66, height * 0.44, Math.max(width, height) * 0.72);
      fade.addColorStop(0, dark ? '#191919' : '#e8dfcf');
      fade.addColorStop(1, dark ? '#080808' : '#f5f0e6');
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, width, height);

      for (let y = grid * 0.45; y < height; y += grid) {
        for (let x = grid * 0.45; x < width; x += grid) {
          const dx = x - width * 0.67;
          const dy = y - height * 0.45;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const alpha = Math.max(0.025, 0.105 - dist / Math.max(width, height) * 0.075);
          ctx.beginPath();
          ctx.fillStyle = dark ? `rgba(255,255,255,${alpha})` : `rgba(29,70,58,${alpha * 0.72})`;
          ctx.arc(x, y, 1.05, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Perspective floor lines keep the 3D motion present as you browse.
      const horizon = height * 0.53 + pointerY * 0.3;
      const vanishingX = width * 0.72 + pointerX * 0.4;
      ctx.lineWidth = 0.7;
      for (let i = -10; i <= 10; i += 1) {
        ctx.beginPath();
        ctx.moveTo(vanishingX + i, horizon);
        ctx.lineTo(vanishingX + i * width * 0.12, height);
        ctx.strokeStyle = dark ? 'rgba(255,255,255,.065)' : 'rgba(29,70,58,.055)';
        ctx.stroke();
      }
      for (let i = 0; i < 13; i += 1) {
        const phase = ((i / 12 + t * 0.09) % 1);
        const depth = phase * phase;
        const y = horizon + (height - horizon) * depth;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.strokeStyle = dark ? `rgba(255,255,255,${0.025 + depth * 0.055})` : `rgba(29,70,58,${0.02 + depth * 0.05})`;
        ctx.stroke();
      }

      const compact = width < 720;
      const radius = Math.min(compact ? width * 0.15 : width * 0.115, height * 0.19, compact ? 92 : 154);
      const cx = width * (compact ? 0.5 : 0.76) + pointerX;
      const cy = height * (compact ? 0.68 : 0.47) + pointerY + Math.sin(t * 2) * 6;
      const orbOpacity = isLanding ? Math.max(0.28, 1 - window.scrollY / Math.max(1, height * 2.1)) : 0.09;
      ctx.save();
      ctx.globalAlpha = orbOpacity;

      const halo = ctx.createRadialGradient(cx, cy, radius * 0.55, cx, cy, radius * 2.5);
      halo.addColorStop(0, dark ? 'rgba(255,255,255,.16)' : 'rgba(183,109,67,.16)');
      halo.addColorStop(0.45, dark ? 'rgba(255,255,255,.06)' : 'rgba(29,70,58,.055)');
      halo.addColorStop(1, dark ? 'rgba(8,8,8,0)' : 'rgba(245,240,230,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(cx - radius * 2.5, cy - radius * 2.5, radius * 5, radius * 5);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.sin(t) * 0.06);

      // Fine elliptical orbit gives the object an unmistakable 3D silhouette.
      ctx.save();
      ctx.rotate(-0.32 + Math.sin(t * 0.8) * 0.08);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.65, radius * 0.52, 0, 0, Math.PI * 2);
      ctx.strokeStyle = dark ? 'rgba(255,255,255,.34)' : 'rgba(29,70,58,.22)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();

      const ball = ctx.createRadialGradient(-radius * 0.34, -radius * 0.45, radius * 0.04, radius * 0.08, radius * 0.02, radius * 1.14);
      ball.addColorStop(0, '#ffffff');
      ball.addColorStop(0.2, dark ? '#d8d8d8' : '#f0ddc4');
      ball.addColorStop(0.5, dark ? '#777777' : '#a7b3a0');
      ball.addColorStop(0.76, dark ? '#333333' : '#607d6d');
      ball.addColorStop(0.93, dark ? '#151515' : '#315747');
      ball.addColorStop(1, dark ? '#050505' : '#1d3029');
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = ball;
      ctx.shadowColor = dark ? '#ffffff' : '#000000';
      ctx.shadowBlur = radius * 0.3;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius - 1, 0, Math.PI * 2);
      ctx.clip();
      for (let j = -2; j <= 2; j++) {
        ctx.beginPath();
        ctx.ellipse(Math.sin(t + j) * radius * 0.25, 0, radius * (0.26 + Math.abs(j) * 0.13), radius * 0.94, t * 0.28 + j * 0.22, 0, Math.PI * 2);
        ctx.strokeStyle = dark ? `rgba(255,255,255,${0.08 + (2 - Math.abs(j)) * 0.025})` : `rgba(255,255,255,${0.11 + (2 - Math.abs(j)) * 0.035})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
      const shine = ctx.createRadialGradient(-radius * 0.4, -radius * 0.48, 0, -radius * 0.4, -radius * 0.48, radius * 0.72);
      shine.addColorStop(0, 'rgba(255,255,255,.72)');
      shine.addColorStop(0.22, 'rgba(255,255,255,.18)');
      shine.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = shine;
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
      ctx.restore();

      // Small floating petal, echoing the reference mark.
      const petalX = -radius * 0.56 + Math.cos(t * 0.7) * 4;
      const petalY = -radius * 0.95 + Math.sin(t * 0.9) * 5;
      ctx.save();
      ctx.translate(petalX, petalY);
      ctx.rotate(-0.62 + Math.sin(t) * 0.08);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-radius * 0.5, -radius * 0.55, radius * 0.24, -radius * 0.7, radius * 0.46, -radius * 0.26);
      ctx.bezierCurveTo(radius * 0.55, radius * 0.2, radius * 0.2, radius * 0.34, 0, 0);
      const petal = ctx.createLinearGradient(-radius * 0.3, -radius * 0.55, radius * 0.35, radius * 0.12);
      petal.addColorStop(0, '#ffffff');
      petal.addColorStop(0.52, dark ? '#888888' : '#d59667');
      petal.addColorStop(1, dark ? '#252525' : '#426556');
      ctx.fillStyle = petal;
      ctx.shadowColor = dark ? '#ffffff' : '#000000';
      ctx.shadowBlur = radius * 0.1;
      ctx.fill();
      ctx.restore();
      ctx.restore();
      ctx.restore();

      // The old canvas planet is retained only for compatibility; the active scene is CSS 3D.
    };

    const onScroll = () => { if (reducedMotion && document.documentElement.dataset.t === 'dark') draw(performance.now()); };
    themeObserver = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = 0;
      draw(performance.now());
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-t'] });

    resize();
    draw();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', onScroll);
    };
  }, [isLanding]);

  return <>
    <canvas className="scene-backdrop" ref={ref} aria-hidden="true" />
    <div className="light-kinetic-scene" aria-hidden="true">
      <div className="lks-haze" />
      <div className="lks-cube lks-cube-main">
        <i className="lks-face lks-front" /><i className="lks-face lks-back" />
        <i className="lks-face lks-left" /><i className="lks-face lks-right" />
        <i className="lks-face lks-top" /><i className="lks-face lks-bottom" />
      </div>
      <div className="lks-cube lks-cube-small">
        <i className="lks-face lks-front" /><i className="lks-face lks-back" />
        <i className="lks-face lks-left" /><i className="lks-face lks-right" />
        <i className="lks-face lks-top" /><i className="lks-face lks-bottom" />
      </div>
      <div className="lks-hoop lks-hoop-one" /><div className="lks-hoop lks-hoop-two" />
      <div className="lks-plinth"><i /></div>
      <div className="lks-floor" />
    </div>
    <div className="dark-kinetic-scene" aria-hidden="true">
      <div className="dks-glow" />
      <div className="lks-cube lks-cube-main">
        <i className="lks-face lks-front" /><i className="lks-face lks-back" />
        <i className="lks-face lks-left" /><i className="lks-face lks-right" />
        <i className="lks-face lks-top" /><i className="lks-face lks-bottom" />
      </div>
      <div className="lks-cube lks-cube-small">
        <i className="lks-face lks-front" /><i className="lks-face lks-back" />
        <i className="lks-face lks-left" /><i className="lks-face lks-right" />
        <i className="lks-face lks-top" /><i className="lks-face lks-bottom" />
      </div>
      <div className="lks-hoop lks-hoop-one" /><div className="lks-hoop lks-hoop-two" />
      <div className="dks-podium"><i /></div>
      <div className="dks-sweep dks-sweep-one" /><div className="dks-sweep dks-sweep-two" />
    </div>
  </>;
}
