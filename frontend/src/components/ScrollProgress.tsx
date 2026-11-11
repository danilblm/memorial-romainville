import { motion, useScroll, useSpring } from "framer-motion";

// Fine barre de lecture en haut de l'écran
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent"
      aria-hidden="true"
    />
  );
};

export default ScrollProgress;
