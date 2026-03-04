import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CAR_IMG = "/car.png";

export default function App() {
  const wrapperRef = useRef(null);
  const carRef = useRef(null);
  const trailRef = useRef(null);
  const boxRefs = useRef([]);
  const lettersRef = useRef([]);

  const text = "WELCOME ITZFIZZ";

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);
    gsap.defaults({ overwrite: "auto" });

    const ctx = gsap.context(() => {

      // INTRO ANIMATION
      const intro = gsap.timeline();

      intro.from(lettersRef.current, {
        y: 60,
        opacity: 0,
        rotateX: -90,
        stagger: 0.05,
        duration: 1.2,
        ease: "power4.out",
      });

      intro.from(
        boxRefs.current,
        {
          opacity: 0,
          y: 40,
          stagger: 0.15,
          duration: 1,
          ease: "back.out(1.5)",
        },
        "-=0.8"
      );

      // SCROLL ANIMATION
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "+=4000",
          scrub: 1.5,
          pin: true,
          invalidateOnRefresh: true,

          onUpdate: (self) => {
            const velocity = self.getVelocity();
            const progress = self.progress;

            const carX = -200 + progress * (window.innerWidth + 400);

            gsap.set(carRef.current, { x: carX });

            gsap.set(trailRef.current, {
              width: Math.max(0, carX + 200),
            });

            gsap.to(carRef.current, {
              rotation: gsap.utils.clamp(-6, 6, velocity * 0.0015),
              duration: 0.2,
              ease: "power2.out",
            });

            gsap.to(trailRef.current, {
              scaleX: 1 + Math.abs(velocity) * 0.0004,
              transformOrigin: "left center",
              duration: 0.2,
            });

            // HEADLIGHT BEAM LOGIC
            const carRect = carRef.current.getBoundingClientRect();
            const carCenter = carRect.left + carRect.width * 0.7;

            lettersRef.current.forEach((letter) => {
              if (!letter) return;

              const rect = letter.getBoundingClientRect();
              const letterCenter = rect.left + rect.width / 2;

              const distance = letterCenter - carCenter;

              if (distance > -120 && distance < 220) {
                const norm = 1 - Math.abs(distance) / 220;
                const intensity = Math.max(0, norm);

                const scale = 1 + intensity * 0.12;
                const glow = 25 * intensity;

                gsap.to(letter, {
                  color: `rgba(${255 - intensity * 100},255,${
                    255 - intensity * 130
                  },${0.2 + intensity})`,
                  scale: scale,
                  y: -4 * intensity,
                  textShadow: `
                    0 0 ${glow}px rgba(69,219,125,${intensity}),
                    0 0 ${glow * 1.5}px rgba(124,255,178,${
                    intensity * 0.6
                  })
                  `,
                  duration: 0.15,
                  ease: "power2.out",
                });
              } else {
                gsap.to(letter, {
                  color: "rgba(255,255,255,0.08)",
                  scale: 1,
                  y: 0,
                  textShadow: "none",
                  duration: 0.4,
                });
              }
            });
          },
        },
      });

      // KPI CARD ANIMATION
      boxRefs.current.forEach((box, i) => {
        const start = 1 + i * 2;
        const yOffset = i % 2 === 0 ? -30 : 30;

        tl.fromTo(
          box,
          { opacity: 0, y: yOffset },
          { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" },
          start
        ).to(
          box,
          { opacity: 0, y: yOffset, duration: 1.2, ease: "power2.in" },
          start + 2
        );
      });

    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={wrapperRef}
      className="w-screen h-screen overflow-hidden relative flex items-center justify-center font-sans bg-white"
    >
      <div className="relative w-full h-[180px] bg-[#111111] flex items-center shadow-[0_0_50px_rgba(0,0,0,0.8)] border-y border-white/5">
        
        <div
          ref={trailRef}
          className="absolute left-0 top-0 h-full w-0 bg-gradient-to-r from-[#45DB7D] via-[#7CFFB2] to-[#45DB7D] blur-[12px] opacity-80 z-10"
        />

        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none select-none">
          <div className="flex whitespace-nowrap">
            {text.split("").map((ch, i) => (
              <span
                key={i}
                ref={(el) => (lettersRef.current[i] = el)}
                className="text-[clamp(50px,8vw,120px)] font-black text-white/10 tracking-wider uppercase italic inline-block"
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </div>
        </div>

        <div
          ref={carRef}
          className="absolute top-1/2 -translate-y-1/2 h-[160px] z-30"
        >
          <img
            src={CAR_IMG}
            alt="McLaren"
            className="h-full w-auto drop-shadow-[20px_15px_15px_rgba(0,0,0,0.6)]"
          />
        </div>

        <KPICard ref={(el) => (boxRefs.current[0] = el)} pos="-top-[200px] left-[12%]" color="bg-[#C8F135]" val="58%" desc="Increase in pick up point use" />
        <KPICard ref={(el) => (boxRefs.current[1] = el)} pos="-bottom-[200px] left-[32%]" color="bg-[#6AC9FF]" val="23%" desc="Decrease in phone calls" />
        <KPICard ref={(el) => (boxRefs.current[2] = el)} pos="-top-[200px] left-[58%]" color="bg-[#2a2a2a] text-white border border-white/10" val="27%" desc="User retention growth" />
        <KPICard ref={(el) => (boxRefs.current[3] = el)} pos="-bottom-[200px] left-[75%]" color="bg-[#FA7328]" val="40%" desc="Efficiency boost" />

      </div>
    </main>
  );
}

const KPICard = React.forwardRef(({ pos, color, val, desc }, ref) => (
  <div
    ref={ref}
    className={`absolute ${pos} ${color} w-[260px] rounded-2xl p-6 shadow-2xl opacity-0 z-40`}
  >
    <h2 className="text-5xl font-black italic tracking-tighter">{val}</h2>
    <p className="text-sm font-bold mt-2 leading-tight uppercase opacity-80 tracking-wide">
      {desc}
    </p>
  </div>
));