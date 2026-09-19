import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpLeft } from "lucide-react";
import commercialFrontage from "../assets/images/featured-projects/commercial-frontage.png";
import alSaroojOasis from "../assets/images/featured-projects/al-sarooj-oasis.png";
import alWafa from "../assets/images/featured-projects/al-wafa.png";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    id: "commercial-frontage",
    title: "الواجهة التجارية",
    eyebrow: "وجهة للحياة والأعمال",
    description: "شارع حضري نابض يجمع المطاعم والمقاهي والتسوق والمساحات المفتوحة في تجربة متكاملة.",
    image: commercialFrontage,
    alt: "الواجهة التجارية في مدينة السلطان هيثم",
    position: "50% 50%",
  },
  {
    id: "al-sarooj-oasis",
    title: "واحة الصاروج",
    eyebrow: "هدوء يتوسط المدينة",
    description: "مجتمع سكني تحيط به الحدائق والمياه، صُمم ليمنح السكان الخصوصية والهدوء وجودة الحياة.",
    image: alSaroojOasis,
    alt: "واحة الصاروج في مدينة السلطان هيثم",
    position: "50% 50%",
  },
  {
    id: "al-wafa",
    title: "حي الوفاء",
    eyebrow: "حياة تبدأ من المكان",
    description: "حي سكني إنساني تتكامل فيه العمارة والممرات الخضراء والمياه ضمن بيئة يومية نابضة بالحياة.",
    image: alWafa,
    alt: "حي الوفاء في مدينة السلطان هيثم",
    position: "50% 50%",
  },
];

export default function FeaturedProjects() {
  const rootRef = useRef(null);
  const engineRef = useRef(null);
  const toastTimer = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const scenes = [...root.querySelectorAll(".featured-projects__scene")];
    const images = scenes.map(scene => scene.querySelector("img"));
    const copies = [...root.querySelectorAll(".featured-projects__copy")];
    const editorials = [...root.querySelectorAll(".featured-projects__editorial")];
    const bars = [...root.querySelectorAll(".featured-projects__progress")];
    const beam = root.querySelector(".featured-projects__beam");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 767px)");
    const context = gsap.context(() => {}, root);
    let active = 0;
    let isTransitioning = false;
    let visible = false;
    let focused = false;
    let alive = true;
    let ready = false;
    let transition;
    let dwell;
    let dolly;
    let entrance;
    let queued = null;
    const canMove = () => visible && !document.hidden && !motion.matches;
    const canAutoplay = () => canMove() && !focused;
    // Register runtime animations in the same context so StrictMode/unmount reverts all styles.
    const animate = callback => context.add(callback);
    const textLayers = index => [copies[index], editorials[index]];

    function syncPlayback() {
      transition?.paused(!canMove());
      dolly?.paused(!canMove());
      dwell?.paused(!canAutoplay());
      entrance?.paused(!canMove());
    }

    function startDwell() {
      if (!alive) return;
      dwell?.kill();
      dolly?.kill();
      animate(() => {
        gsap.set(bars, { scaleX: 0 });
        if (motion.matches) {
          gsap.set(images, { scale: 1, xPercent: 0 });
          gsap.set(bars[active], { scaleX: 1 });
          return;
        }
        dolly = gsap.fromTo(images[active],
          { scale: compact.matches ? 1.015 : 1.04, xPercent: 0 },
          { scale: 1, xPercent: compact.matches ? 0 : -0.4, duration: 5.1, ease: "none", paused: true });
        dwell = gsap.to(bars[active], {
          scaleX: 1, duration: 4, ease: "none", paused: true,
          onComplete: () => activate((active + 1) % projects.length),
        });
      });
      syncPlayback();
    }

    function settle(index) {
      if (!alive) return;
      animate(() => {
        scenes.forEach((scene, i) => gsap.set(scene, {
          autoAlpha: i === index ? 1 : 0, zIndex: i === index ? 1 : 0,
          clipPath: "inset(0% 0% 0% 0%)",
        }));
        copies.forEach((copy, i) => gsap.set(copy, { autoAlpha: i === index ? 1 : 0, y: 0 }));
        editorials.forEach((el, i) => gsap.set(el, { autoAlpha: i === index ? 1 : 0, y: 0 }));
        gsap.set(beam, { autoAlpha: 0 });
      });
      active = index;
      setActiveIndex(index);
      isTransitioning = false;
      startDwell();
    }

    function activate(index) {
      if (!alive || !ready) return;
      if (isTransitioning) {
        queued = index;
        return;
      }
      if (index === active) {
        queued = null;
        startDwell();
        return;
      }
      queued = null;
      dwell?.kill();
      dolly?.kill();
      if (motion.matches) {
        settle(index);
        return;
      }
      isTransitioning = true;
      const previous = active;
      const fromRight = (index > previous || (previous === 2 && index === 0));
      const mobile = compact.matches;
      animate(() => {
        gsap.set(scenes[index], {
          autoAlpha: mobile ? 0 : 1, zIndex: 2,
          clipPath: mobile ? "inset(0% 0% 8% 0%)" :
            fromRight ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)",
        });
        gsap.set(images[index], { scale: mobile ? 1.015 : 1.04, xPercent: 0 });
        gsap.set(beam, { x: fromRight ? root.clientWidth : 0, autoAlpha: 0 });
        transition = gsap.timeline({
          paused: true,
          onComplete: () => {
            if (!alive) return;
            gsap.set(scenes[previous], { autoAlpha: 0, zIndex: 0 });
            gsap.set(scenes[index], { zIndex: 1 });
            gsap.set(beam, { autoAlpha: 0 });
            active = index;
            isTransitioning = false;
            const next = queued;
            queued = null;
            if (next != null && next !== active) activate(next);
            else startDwell();
          },
        });
        transition
          .to(textLayers(previous), { autoAlpha: 0, y: -14, duration: 0.2 }, 0)
          .to(scenes[index], {
            clipPath: "inset(0% 0% 0% 0%)", autoAlpha: 1,
            duration: 1.1, ease: "power3.inOut",
          }, 0.12)
          .call(() => { if (alive) setActiveIndex(index); }, [], 0.45)
          .fromTo(textLayers(index), { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" }, 0.58);
        if (!mobile) {
          transition.to(beam, { autoAlpha: 0.65, duration: 0.12 }, 0.16)
            .to(beam, { x: fromRight ? 0 : root.clientWidth, duration: 1.1, ease: "power3.inOut" }, 0.12)
            .to(beam, { autoAlpha: 0, duration: 0.15 }, 1.06);
        }
      });
      syncPlayback();
    }

    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      syncPlayback();
    }, { threshold: 0 });
    observer.observe(root);
    const onVisibility = () => syncPlayback();
    const onFocus = () => { focused = true; syncPlayback(); };
    const onBlur = event => {
      if (!root.contains(event.relatedTarget)) { focused = false; syncPlayback(); }
    };
    const onMotion = () => {
      transition?.kill();
      entrance?.kill();
      animate(() => gsap.set(root.querySelector(".featured-projects__label"), { autoAlpha: 1, y: 0 }));
      settle(motion.matches ? 0 : active);
    };
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onMotion);
    root.addEventListener("focusin", onFocus);
    root.addEventListener("focusout", onBlur);
    engineRef.current = { activate };

    // Decode each source once before allowing a wipe; no blank incoming frames.
    Promise.all(images.map(image => image.decode().catch(() => {}))).then(() => {
      if (!alive) return;
      ready = true;
      startDwell();
    });
    animate(() => {
      if (!motion.matches) {
        entrance = gsap.fromTo(root.querySelector(".featured-projects__label"),
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out",
            scrollTrigger: { trigger: root, start: "top 85%", once: true } });
      }
    });

    return () => {
      alive = false;
      ready = false;
      queued = null;
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", onMotion);
      root.removeEventListener("focusin", onFocus);
      root.removeEventListener("focusout", onBlur);
      transition?.kill();
      dwell?.kill();
      dolly?.kill();
      entrance?.kill();
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === root) st.kill();
      });
      context.revert();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function showToast() {
    clearTimeout(toastTimer.current);
    setToast(true);
    toastTimer.current = setTimeout(() => setToast(false), 4000);
  }

  return (
    <section ref={rootRef} className="featured-projects" dir="rtl" aria-label="مشاريع مختارة">
      <div className="featured-projects__scenes">
        {projects.map((project, index) => (
          <div className="featured-projects__scene" key={project.id} aria-hidden={index !== activeIndex}>
            <img src={project.image} alt={project.alt} width="1536" height="1024"
              decoding="async" style={{ objectPosition: project.position }} />
          </div>
        ))}
      </div>
      <div className="featured-projects__shade" aria-hidden="true" />
      <div className="featured-projects__beam" aria-hidden="true" />
      {projects.map((project, index) => (
        <div className="featured-projects__editorial" key={project.id} aria-hidden="true"
          data-initial={index === 0}>{project.title}</div>
      ))}
      <div className="featured-projects__content">
        <p className="featured-projects__label">مشاريع مختارة</p>
        <div className="featured-projects__copies">
          {projects.map((project, index) => (
            <article key={project.id} className="featured-projects__copy" data-initial={index === 0}
              aria-hidden={index !== activeIndex} inert={index !== activeIndex}>
              <p className="featured-projects__eyebrow">{project.eyebrow}</p>
              <h2>{project.title}</h2>
              <p className="featured-projects__description">{project.description}</p>
              <button type="button" className="featured-projects__discover" onClick={showToast}
                aria-label={`اكتشف مشروع ${project.title}`}>
                اكتشف المشروع <ArrowUpLeft size={20} aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      </div>
      <nav className="featured-projects__timeline" aria-label="اختيار المشروع">
        {projects.map((project, index) => (
          <button key={project.id} type="button" aria-pressed={index === activeIndex}
            aria-label={`عرض مشروع ${project.title}`}
            onClick={() => engineRef.current?.activate(index)}
            onKeyDown={event => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              engineRef.current?.activate(index);
            }}>
            <span>{project.title}</span>
            <span className="featured-projects__track" aria-hidden="true">
              <span className="featured-projects__progress" />
            </span>
          </button>
        ))}
      </nav>
      <div className="featured-projects__toast-region" role="status" aria-live="polite" aria-atomic="true">
        {toast && <p className="featured-projects__toast">ستتوفر تفاصيل هذا المشروع قريبًا</p>}
      </div>
    </section>
  );
}
