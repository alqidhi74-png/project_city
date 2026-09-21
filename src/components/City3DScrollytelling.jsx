import { Component, lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { city3DStory } from "../data/city3DStoryData";
import fallbackCity from "../assets/images/01_aerial_illuminated_masterplan.jpg";

gsap.registerPlugin(ScrollTrigger);
const City3DScene = lazy(() => import("./City3DScene"));
const motionQuery = "(prefers-reduced-motion: reduce)";
const compactQuery = "(max-width: 1023px)";
function subscribeMedia(callback) {
  const queries = [window.matchMedia(motionQuery), window.matchMedia(compactQuery)];
  queries.forEach(query => query.addEventListener("change", callback));
  return () => queries.forEach(query => query.removeEventListener("change", callback));
}
const getMotion = () => window.matchMedia(motionQuery).matches;
const getCompact = () => window.matchMedia(compactQuery).matches;

function supportsScene() {
  if (navigator.connection?.saveData || (navigator.deviceMemory && navigator.deviceMemory <= 2)
    || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)) return false;
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!context) return false;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch { return false; }
}

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function City3DScrollytelling() {
  const rootRef = useRef(null);
  const motion = useRef({ progress: 0, velocity: 0, pointerX: 0, pointerY: 0, active: false });
  const invalidateRef = useRef(null);
  const refreshFrame = useRef(null);
  const reduced = useSyncExternalStore(subscribeMedia, getMotion, () => true);
  const compact = useSyncExternalStore(subscribeMedia, getCompact, () => true);
  const [sceneEnabled, setSceneEnabled] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const failScene = useCallback(() => setSceneFailed(true), []);
  const ready = useCallback((invalidate) => {
    invalidateRef.current = invalidate;
    cancelAnimationFrame(refreshFrame.current);
    if (invalidate) refreshFrame.current = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      invalidate();
    });
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const state = motion.current;
    let checked = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !checked && !reduced) {
        checked = true;
        setSceneEnabled(supportsScene());
      }
      state.active = entry.isIntersecting;
      if (entry.isIntersecting) invalidateRef.current?.();
    }, { rootMargin: "250px 0px" });
    observer.observe(root);
    const visibility = () => { if (!document.hidden && motion.current.active) invalidateRef.current?.(); };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      cancelAnimationFrame(refreshFrame.current);
      invalidateRef.current = null;
      state.active = false;
    };
  }, [reduced]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const chapters = [...root.querySelectorAll(".city-story__chapter")];
    const steps = [...root.querySelectorAll(".city-story__step")];
    let previous = -1;
    let frame;
    const syncChapter = (index) => {
      if (previous === index) return;
      previous = index;
      root.dataset.chapter = city3DStory[index].id;
      chapters.forEach((chapter, i) => {
        chapter.setAttribute("aria-hidden", String(!reduced && i !== index));
        chapter.inert = !reduced && i !== index;
      });
      steps.forEach((step, i) => {
        if (i === index) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });
    };
    const context = gsap.context(() => {
      if (reduced) { syncChapter(0); return; }
      gsap.set(chapters, { autoAlpha: 0, y: 28 });
      gsap.set(chapters[0], { autoAlpha: 1, y: 0 });
      syncChapter(0);
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          id: "city-3d-story", trigger: root, start: "top top", end: "bottom bottom",
          scrub: 0.65,
          onUpdate: (self) => { motion.current.velocity = self.getVelocity(); },
          onScrubComplete: () => { motion.current.velocity = 0; },
          // Refresh restores timeline values with callbacks suppressed. Resync
          // semantic state explicitly after responsive layout/pin changes.
          onRefresh: (self) => {
            syncChapter(Math.min(4, Math.floor(self.animation?.time() || 0)));
            if (motion.current.active) invalidateRef.current?.();
          },
        },
        onUpdate() {
          syncChapter(Math.min(4, Math.floor(this.time())));
          if (motion.current.active && !document.hidden) invalidateRef.current?.();
        },
      });
      timeline.fromTo(motion.current, { progress: 0 }, { progress: 5, duration: 5 }, 0)
        .fromTo(".city-story__light", { xPercent: -6, yPercent: 5 }, { xPercent: 6, yPercent: -5, duration: 5 }, 0)
        .fromTo(".city-story__mist", { yPercent: 8 }, { yPercent: -8, duration: 5 }, 0)
        .fromTo(".city-story__fallback", { scale: 1.04, yPercent: 1 }, { scale: 1.11, yPercent: -1, duration: 5 }, 0)
        .fromTo(".city-story__progress-fill", { scaleY: 0 }, { scaleY: 1, duration: 5 }, 0);
      chapters.forEach((chapter, index) => {
        if (index > 0) timeline.fromTo(chapter, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.18, ease: "power2.out" }, index);
        if (index < 4) timeline.to(chapter, { autoAlpha: 0, y: -16, duration: 0.14 }, index + 0.86);
      });
    }, root);
    frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(frame);
      context.revert();
      chapters.forEach(chapter => { chapter.removeAttribute("aria-hidden"); chapter.inert = false; });
      steps.forEach(step => step.removeAttribute("aria-current"));
      delete root.dataset.chapter;
    };
  }, [reduced]);

  const handlePointer = (event) => {
    if (reduced || compact || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    motion.current.pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
    motion.current.pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
    if (motion.current.active) invalidateRef.current?.();
  };
  const resetPointer = () => {
    motion.current.pointerX = 0;
    motion.current.pointerY = 0;
    invalidateRef.current?.();
  };

  return <section id="city-journey" ref={rootRef} className="city-story" data-reduced={reduced}
    aria-label="رحلة في مدينة السلطان هيثم" dir="rtl">
    <div className="city-story__stage" onPointerMove={handlePointer} onPointerLeave={resetPointer}>
      <div className="city-story__visual" aria-hidden="true">
        <img className="city-story__fallback" src={fallbackCity} alt="" loading="lazy" decoding="async" width="1536" height="1024" />
        {sceneEnabled && !sceneFailed && !reduced && <div className="city-story__canvas">
          <SceneBoundary><Suspense fallback={null}>
            <City3DScene motion={motion} compact={compact} onReady={ready} onFailure={failScene} />
          </Suspense></SceneBoundary>
        </div>}
        <div className="city-story__shade" />
        <div className="city-story__light" />
        <div className="city-story__mist" />
      </div>
      <header className="city-story__heading">
        <span className="city-story__rule" aria-hidden="true" />
        <p>مدينة السلطان هيثم <span>رحلة نحو الغد</span></p>
      </header>
      <div className="city-story__chapters">
        {city3DStory.map((chapter, index) => <article className="city-story__chapter" key={chapter.id}>
          <span className="city-story__number" aria-hidden="true">{chapter.number}</span>
          <p className="city-story__eyebrow">{chapter.label}</p>
          <h2>{chapter.title}</h2>
          <p className="city-story__description">{chapter.description}</p>
          {index === 4 && <Link to="/interactive-map" className="city-story__cta">
            <span>استكشف الخريطة التفاعلية</span><ArrowLeft size={19} aria-hidden="true" />
          </Link>}
        </article>)}
      </div>
      <div className="city-story__progress">
        <span className="city-story__progress-track" aria-hidden="true"><span className="city-story__progress-fill" /></span>
        <ol className="city-story__steps" aria-label="مراحل الرحلة">
        {city3DStory.map(chapter => <li key={chapter.id} className="city-story__step">
          <span className="city-story__dot" aria-hidden="true" /><span className="city-story__step-label">{chapter.label}</span>
        </li>)}
        </ol>
      </div>
      <div className="city-story__footer"><span>تصوّر عمراني للمدينة</span><span className="city-story__scroll">مرّر لتكتشف <ArrowDown size={15} aria-hidden="true" /></span></div>
    </div>
  </section>;
}
