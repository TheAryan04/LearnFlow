import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function TiltCard({
  children,
  className = '',
  intensity = 18,
  perspective = 1000,
  scale = 1.06,
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const hover = useMotionValue(isHovered ? 1 : 0);

  const rotateX = useTransform(mouseY, [-1, 1], [intensity, -intensity]);
  const rotateY = useTransform(mouseX, [-1, 1], [-intensity, intensity]);
  const scaleVal = useTransform(hover, [0, 1], [1, scale]);

  const bind = useCallback(
    () => ({
      onMouseEnter: () => {
        setIsHovered(true);
        hover.set(1);
      },
      onMouseMove: (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        mouseX.set(x * 2 - 1);
        mouseY.set(y * 2 - 1);
      },
      onMouseLeave: () => {
        setIsHovered(false);
        hover.set(0);
        mouseX.set(0);
        mouseY.set(0);
      },
    }),
    [hover, mouseX, mouseY],
  );

  const cardStyle = {
    transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scaleVal},${scaleVal},1)`,
  };

  const handlers = bind();

  return (
    <motion.div
      ref={ref}
      style={cardStyle}
      initial={false}
      animate={{ scale: isHovered ? scale : 1 }}
      transition={isHovered ? { type: 'spring', stiffness: 300, damping: 30 } : { type: 'tween', duration: 0.4 }}
      className={`preserve-3d ${className}`}
      {...handlers}
      {...props}
    >
      {children}
    </motion.div>
  );
}
