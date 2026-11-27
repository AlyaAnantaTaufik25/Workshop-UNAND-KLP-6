/* Konstanta & komponen bantu bersama (dipindah dari TandaTanganMitra.jsx) */
import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

/* ------------------------------------------------------------------ */
/* Canvas Tanda Tangan — mendukung Pen & Eraser, expose via ref        */
/* ------------------------------------------------------------------ */
export const SignatureCanvas = forwardRef(({ tool, lineWidth, color }, ref) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const start = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : (color || '#000000');
    ctx.lineWidth = tool === 'eraser' ? (lineWidth || 3) * 6 : (lineWidth || 3);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const end = (e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    isDrawing.current = false;
  };

  useImperativeHandle(ref, () => ({
    getDataURL: () => canvasRef.current?.toDataURL('image/png'),
    clear: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    isEmpty: () => {
      const canvas = canvasRef.current;
      if (!canvas) return true;
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      return !data.some((v) => v !== 0);
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '220px',
        border: '1.5px solid #d1d5db',
        borderRadius: '6px',
        background: '#ffffff',
        touchAction: 'none',
        cursor: tool === 'eraser' ? 'cell' : 'crosshair',
        display: 'block',
      }}
      onMouseDown={start}
      onMouseMove={draw}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchStart={start}
      onTouchMove={draw}
      onTouchEnd={end}
    />
  );
});

// oxlint-disable-next-line react/only-export-components -- sengaja diekspor bersama komponen (API bersama modul ini)
export const statusConfig = {
  'menunggu-ttd': {
    label: 'Menunggu TTD',
    className: 'mitra-badge mitra-badge-menunggu',
  },
  'menunggu-rektor': {
    label: 'Menunggu Rektor',
    className: 'mitra-badge mitra-badge-diproses',
  },
  'diterbitkan': {
    label: 'Diterbitkan',
    className: 'mitra-badge mitra-badge-sudah-ttd',
  },
  'sudah-ditandatangani': {
    label: 'Sudah Ditandatangani',
    className: 'mitra-badge mitra-badge-sudah-ttd',
  },
  'selesai': {
    label: 'Selesai',
    className: 'mitra-badge mitra-badge-selesai-proses',
  },
};
