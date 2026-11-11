import { AnimatePresence, motion } from "framer-motion";
import { Flashlight, FlashlightOff } from "lucide-react";
import { PointerEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../utils/cn";
import { Container, SectionHeading } from "./ui";

// Graffitis laissés par des internés du fort (fonds partagé par le Mémorial national).
// La souris (ou le doigt) devient une lampe torche ; « Tout éclairer » rend l'image entière visible.
const GRAFFITIS = [
  { key: "hoovers", src: "/images/histoire/graffiti-hoovers.jpg" },
  { key: "glaser", src: "/images/histoire/graffiti-glaser.jpg" },
  { key: "crepy", src: "/images/histoire/graffiti-crepy.jpg" },
  { key: "dalaine", src: "/images/histoire/graffiti-dalaine.jpg" },
];

const RADIUS = 210;

const GraffitiTorch = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  // La lampe démarre sur la zone écrite du mur
  const [pos, setPos] = useState({ x: 34, y: 30 });
  const [moved, setMoved] = useState(false);
  const [lit, setLit] = useState(false);
  const graffiti = GRAFFITIS[index];

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
    setMoved(true);
  };

  const mask = `radial-gradient(circle ${RADIUS}px at ${pos.x}% ${pos.y}%, transparent 0%, transparent 35%, black 100%)`;

  return (
    <section aria-labelledby="torch-title" className="relative overflow-hidden bg-black py-24 text-on-night sm:py-32">
      <Container>
        <SectionHeading id="torch-title" eyebrow={t("torch.eyebrow")} title={t("torch.title")} lead={t("torch.lead")} light />

        <div className="mt-12">
          <div
            ref={ref}
            onPointerMove={move}
            onPointerDown={move}
            className={cn(
              "relative aspect-[4/3] touch-none overflow-hidden rounded-3xl border border-white/10 bg-black select-none sm:aspect-[16/9]",
              !lit && "cursor-none"
            )}
            role="img"
            aria-label={t(`torch.items.${graffiti.key}`)}
          >
            <AnimatePresence>
              <motion.img
                key={graffiti.src}
                src={graffiti.src}
                alt=""
                draggable={false}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 h-full w-full object-cover sepia-[.35]"
              />
            </AnimatePresence>

            {/* Obscurité, percée par la lampe */}
            <div
              className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-700"
              style={{ opacity: lit ? 0 : 0.96, maskImage: mask, WebkitMaskImage: mask }}
              aria-hidden="true"
            />
            {/* Halo chaud de la lampe */}
            {!lit && (
              <div
                className="pointer-events-none absolute h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-soft-light"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  background: "radial-gradient(circle, rgb(255 214 150 / 0.55), transparent 65%)",
                }}
                aria-hidden="true"
              />
            )}

            <AnimatePresence>
              {!moved && !lit && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute inset-x-0 bottom-8 text-center text-sm tracking-wide text-on-night-soft"
                >
                  {t("torch.hint")}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3" role="group" aria-label={t("torch.choose")}>
              {GRAFFITIS.map((item, i) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-pressed={i === index}
                  aria-label={t(`torch.items.${item.key}`)}
                  className={cn(
                    "h-16 w-24 overflow-hidden rounded-xl border-2 transition hover:-translate-y-0.5",
                    i === index ? "border-white" : "border-white/10 opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={item.src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setLit(!lit)}
              aria-pressed={lit}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              {lit ? <FlashlightOff className="h-4 w-4" aria-hidden="true" /> : <Flashlight className="h-4 w-4" aria-hidden="true" />}
              {lit ? t("torch.off") : t("torch.on")}
            </button>
          </div>

          <p className="mt-6 text-sm text-on-night-soft">
            {t(`torch.items.${graffiti.key}`)} — {t("torch.credit")}
          </p>
        </div>
      </Container>
    </section>
  );
};

export default GraffitiTorch;
