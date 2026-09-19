import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import smartMorning from "../assets/images/smart-living/smart-morning.png";
import smartGreenLife from "../assets/images/smart-living/smart-green-life.png";
import smartEvening from "../assets/images/smart-living/smart-evening.png";

gsap.registerPlugin(ScrollTrigger);

const moments = [
  {
    id: "connected-morning",
    label: "صباح متصل",
    title: "يبدأ يومك بسلاسة",
    description: "مسارات آمنة وخدمات قريبة وتنقّل مترابط يجعل بداية اليوم أكثر سهولة.",
    image: smartMorning,
    alt: "ممشى سكني صباحي في مدينة السلطان هيثم",
  },
  {
    id: "green-life",
    label: "مساحة تتنفس",
    title: "الطبيعة جزء من يومك",
    description: "حدائق ومياه وممرات مظللة تمنح السكان مساحة للحركة والراحة والتواصل.",
    image: smartGreenLife,
    alt: "مساحات خضراء ومياه في مدينة السلطان هيثم",
  },
  {
    id: "vibrant-evening",
    label: "مساء نابض",
    title: "الحياة أقرب إليك",
    description: "وجهات اجتماعية وتجارية تنبض بالحياة وتجمع المجتمع في تجربة يومية متكاملة.",
    image: smartEvening,
    alt: "وجهة اجتماعية مسائية في مدينة السلطان هيثم",
  },
];
const journeyPath = "M 1470 790 C 1320 790 1320 685 1150 685 S 950 790 875 660 S 820 595 715 595 S 480 700 450 535 S 400 430 245 430 S 75 315 -30 350";
const verticalPath = "M 20 0 C 20 100 7 130 13 220 S 37 320 20 440 S 20 530 20 600";

export default function SmartLivingJourney() {
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const mm = gsap.matchMedia();
    let alive = true;
    const ctx = gsap.context(() => {
      mm.add({
        desktop: "(min-width: 1200px) and (min-height: 700px)",
        compact: "(max-width: 1199px), (max-height: 699px)",
        reduced: "(prefers-reduced-motion: reduce)",
      }, ({ conditions }) => {
        if (conditions.reduced) return;
        const figures = gsap.utils.toArray(".smart-living__window", root);
        const copies = gsap.utils.toArray(".smart-living__copy", root);
        const images = figures.map(figure => figure.querySelector("img"));
        if (!conditions.desktop) {
          root.querySelectorAll(".smart-living__moment").forEach((moment, index) => {
            const path = moment.querySelector(".smart-living__vertical-progress");
            const length = path.getTotalLength();
            gsap.timeline({
              defaults: { ease: "power3.out", duration: 0.85 },
              scrollTrigger: { trigger: moment, start: "top 88%", toggleActions: "play none none reverse" },
            })
              .fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1.1 }, 0)
              .fromTo(figures[index], { opacity: 0, scale: 0.88, y: 50, clipPath: "inset(40% 4% 40% 4%)" },
                { opacity: 1, scale: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }, 0)
              .fromTo(copies[index].children, { opacity: 0, y: 22 }, { opacity: 1, y: 0, stagger: 0.08 }, 0.25);
          });
          return;
        }

        root.dataset.layout = "desktop";
        const path = root.querySelector(".journeyPathProgress");
        const dot = root.querySelector(".journeyLightDot");
        const length = path.getTotalLength();
        const proxy = { progress: 0 };
        const placeDot = () => {
          const point = path.getPointAtLength(proxy.progress * length);
          dot.setAttribute("transform", `translate(${point.x} ${point.y})`);
        };
        const glows = gsap.utils.toArray(".smart-living__glow", root);
        const shades = gsap.utils.toArray(".smart-living__window-shade", root);
        const rims = gsap.utils.toArray(".smart-living__rim", root);
        const nodes = gsap.utils.toArray(".smart-living__node", root);
        [0.24, 0.55, 0.83].forEach((fraction, index) => {
          const point = path.getPointAtLength(length * fraction);
          gsap.set(nodes[index], { attr: { cx: point.x, cy: point.y } });
        });
        placeDot();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        gsap.set(dot, { opacity: 0 });
        gsap.set(figures, { scale: 0.72, y: 42, opacity: 0.24, clipPath: "ellipse(42% 38% at 50% 50%)" });
        gsap.set(images, { scale: 1.13 });
        gsap.set(copies, { opacity: 0, y: 26, clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(glows, { opacity: 0 });
        gsap.set(rims, { opacity: 0 });
        gsap.set(".smart-living__closing", { opacity: 0, y: 30, clipPath: "inset(100% 0% 0% 0%)" });

        // One reversible timeline; its 100 units correspond to the journey percentages.
        const timeline = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            id: "smart-living-journey", trigger: root, start: "top top",
            end: () => `+=${window.innerHeight * 2.5}`, pin: true, scrub: 0.85,
            // Measure after upstream pins have contributed their spacing.
            refreshPriority: -1, invalidateOnRefresh: true, anticipatePin: 1,
          },
        });
        timeline
          .fromTo(".smart-living__eyebrow", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 5 }, 0)
          .fromTo(".smart-living__title-line", { yPercent: 110, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 7, stagger: 2, ease: "power3.out" }, 1)
          .fromTo(".smart-living__introduction", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 5 }, 6)
          .fromTo(".smart-living__route", { opacity: 0 }, { opacity: 1, duration: 10 }, 2)
          .to(".smart-living__header", { scale: 0.55, opacity: 0.45, y: -12, duration: 15 }, 12)
          .to(".smart-living__introduction", { opacity: 0, duration: 8 }, 12)
          .to(dot, { opacity: 1, duration: 3 }, 12)
          .to(path, { strokeDashoffset: length * 0.76, duration: 15, ease: "none" }, 12)
          .to(proxy, { progress: 0.24, duration: 15, ease: "none", onUpdate: placeDot }, 12)
          .to(path, { strokeDashoffset: length * 0.45, duration: 12, ease: "none" }, 43)
          .to(proxy, { progress: 0.55, duration: 12, ease: "none", onUpdate: placeDot }, 43)
          .to(path, { strokeDashoffset: length * 0.17, duration: 11, ease: "none" }, 70)
          .to(proxy, { progress: 0.83, duration: 11, ease: "none", onUpdate: placeDot }, 70)
          .to(path, { strokeDashoffset: 0, duration: 3, ease: "none" }, 93)
          .to(proxy, { progress: 1, duration: 3, ease: "none", onUpdate: placeDot }, 93)
          .to(".smart-living__topography", { xPercent: -3, yPercent: 2, duration: 81, ease: "none" }, 12)
          .to(".smart-living__night", { opacity: 0.7, duration: 15 }, 70);

        const entrances = [24, 53, 79];
        const exits = [43, 70, 93];
        entrances.forEach((start, index) => {
          timeline
            .to(figures[index], { scale: index === 1 ? 1.08 : 1.05, y: 0, opacity: 1,
              clipPath: "ellipse(75% 75% at 50% 50%)", duration: 7, ease: "power3.out" }, start)
            .to(figures[index], { scale: 1, duration: 5 }, start + 7)
            .to(shades[index], { opacity: 0, duration: 7 }, start)
            .to(rims[index], { opacity: 0.75, duration: 6 }, start)
            .to(images[index], { scale: 1.03, xPercent: index === 0 ? -1.5 : 0,
              yPercent: index === 1 ? -1.5 : index === 2 ? 1 : 0, duration: exits[index] - start }, start)
            .to(copies[index], { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 5 }, start + 4)
            .to(glows[index], { opacity: 0.32, scale: 1.12, duration: 9 }, start - 3)
            .to(nodes[index], { opacity: 1, duration: 4 }, start);
          timeline.to(copies[index], { opacity: 0, y: -14, duration: index === 2 ? 1 : 4 }, exits[index]);
          if (index < 2) {
            timeline
              .to(figures[index], { scale: 0.78, y: 18, opacity: 0.42, duration: 9 }, exits[index])
              .to(shades[index], { opacity: 0.4, duration: 9 }, exits[index])
              .to(rims[index], { opacity: 0, duration: 6 }, exits[index])
              .to(glows[index], { opacity: 0, duration: 12 }, exits[index]);
          }
        });
        timeline
          .to(figures, { scale: 0.88, y: 0, opacity: 0.68, duration: 3 }, 93)
          .to(".smart-living__closing", { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 2 }, 94)
          .to(dot, { opacity: 0, duration: 2 }, 96)
          .to({}, { duration: 4 }, 96);

        return () => {
          delete root.dataset.layout;
          dot.removeAttribute("transform");
        };
      });
    }, rootRef);

    // Fixed image geometry avoids layout shifts; refresh once after assets settle.
    Promise.all([
      ...Array.from(root.querySelectorAll("img"), img => img.decode().catch(() => {})),
      document.fonts.ready,
    ]).then(() => { if (alive) ScrollTrigger.refresh(); });
    return () => {
      alive = false;
      mm.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section className="smart-living" ref={rootRef} dir="rtl" aria-labelledby="smart-living-title">
      <div className="smart-living__night" aria-hidden="true" />
      <svg className="smart-living__topography" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => (
          <path key={index} d={`M ${-160 + index * 48} 950 C ${180 + index * 48} 550 ${-180 + index * 48} 200 ${300 + index * 48} 80 S ${950 + index * 48} 160 ${1230 + index * 48} -100`} />
        ))}
      </svg>
      <div className="smart-living__glow smart-living__glow--morning" aria-hidden="true" />
      <div className="smart-living__glow smart-living__glow--green" aria-hidden="true" />
      <div className="smart-living__glow smart-living__glow--evening" aria-hidden="true" />
      <header className="smart-living__header">
        <p className="smart-living__eyebrow">الحياة الذكية</p>
        <h2 id="smart-living-title">
          <span className="smart-living__mask"><span className="smart-living__title-line">مدينة</span></span>
          <span className="smart-living__mask"><span className="smart-living__title-line">تتحرك معك</span></span>
        </h2>
        <p className="smart-living__introduction">يوم متكامل صُممت تفاصيله لتجعل الحياة أكثر اتصالًا وراحة واستدامة.</p>
      </header>
      <svg className="smart-living__route" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        <path className="journeyPathBase" d={journeyPath} />
        <path className="journeyPathProgress" d={journeyPath} />
        {moments.map(moment => <circle key={moment.id} className="smart-living__node" r="5" />)}
        <g className="journeyLightDot"><circle r="12" opacity="0.12" /><circle r="4" /></g>
      </svg>
      <div className="smart-living__moments">
        {moments.map(moment => (
          <article className={`smart-living__moment smart-living__moment--${moment.id}`} key={moment.id}>
            <svg className="smart-living__vertical-route" viewBox="0 0 40 600" preserveAspectRatio="none" aria-hidden="true">
              <path className="journeyPathBase" d={verticalPath} />
              <path className="smart-living__vertical-progress" d={verticalPath} />
              <circle cx="17" cy="260" r="4" />
            </svg>
            <figure className="smart-living__window">
              <img src={moment.image} alt={moment.alt} width="1672" height="941" decoding="async" />
              <span className="smart-living__window-shade" aria-hidden="true" />
              <span className="smart-living__rim" aria-hidden="true" />
            </figure>
            <div className="smart-living__copy">
              <p className="smart-living__label">{moment.label}</p>
              <h3>{moment.title}</h3>
              <p className="smart-living__description">{moment.description}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="smart-living__closing">
        <p className="smart-living__closing-title">كل التفاصيل،<br />صُممت لتسهّل الحياة.</p>
        <p className="smart-living__description">مدينة تستجيب لاحتياجات الإنسان من بداية يومه حتى نهايته.</p>
      </div>
    </section>
  );
}