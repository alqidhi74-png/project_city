import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Home, Leaf, BookOpen, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import cityMapDesktop from "../assets/images/city-map/city-masterplan-flat-desktop.png";
import cityMapMobile from "../assets/images/city-map/city-masterplan-flat-mobile.png";

gsap.registerPlugin(ScrollTrigger);

const cityStats = [
  { id: "area", value: 14.8, suffix: "مليون م²", label: "المساحة الإجمالية", decimals: 1 },
  { id: "green-space", value: 2.9, suffix: "مليون م²", label: "مساحات خضراء", decimals: 1 },
  { id: "neighborhoods", value: 19, suffix: "حيًا", label: "أحياء متكاملة", decimals: 0 },
  { id: "homes", value: 20, suffix: "ألف", label: "وحدة سكنية", decimals: 0 },
  { id: "population", value: 100, suffix: "ألف", label: "نسمة مستهدفة", decimals: 0 },
];
// Illustrative positions, adjusted to the supplied artwork; not official coordinates.
const mapMarkers = [
  { id: "central-park", title: "الحديقة المركزية والوادي", description: "مساحة طبيعية في قلب المدينة.", type: "park", icon: Leaf, tooltip: "top", desktop: { x: 46, y: 44 }, mobile: { x: 50, y: 54 } },
  { id: "al-wafa", title: "حي الوفاء", description: "حي سكني متكامل ضمن مدينة السلطان هيثم.", type: "residential", icon: Home, tooltip: "left", desktop: { x: 65, y: 58 }, mobile: { x: 68, y: 63 } },
  { id: "education", title: "مرفق تعليمي", description: "موقع تعليمي مخطط لخدمة المجتمع.", type: "education", icon: BookOpen, tooltip: "right", desktop: { x: 28, y: 38 }, mobile: { x: 32, y: 45 } },
  { id: "health", title: "مرفق صحي", description: "مرفق صحي ضمن الخدمات المستقبلية للمدينة.", type: "health", icon: Plus, tooltip: "left", desktop: { x: 79, y: 47 }, mobile: { x: 74, y: 52 } },
  { id: "commercial", title: "منطقة تجارية", description: "وجهة تجارية وخدمية متكاملة.", type: "commercial", icon: ShoppingBag, tooltip: "right", desktop: { x: 37, y: 54 }, mobile: { x: 39, y: 59 } },
];
const motionQuery = "(prefers-reduced-motion: reduce)";
const subscribeMotion = callback => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const readMotion = () => window.matchMedia(motionQuery).matches;

export default function CityNumbersMap() {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const engineRef = useRef(null);
  const activeRef = useRef(0);
  const toastTimer = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [toast, setToast] = useState("");
  const reducedMotion = useSyncExternalStore(subscribeMotion, readMotion, () => true);

  useEffect(() => {
    const root = rootRef.current;
    const select = gsap.utils.selector(root);
    const tooltips = select(".city-numbers__tooltip");
    const mobileDetails = select(".city-numbers__mobile-detail");
    const image = root.querySelector("img");
    let visible = false;
    let hovering = false;
    let focused = false;
    let alive = true;
    let timer;
    let transition;
    let entrance;
    let started = false;
    let refreshFrame;
    const context = gsap.context(() => {}, root);
    const panels = index => [tooltips[index], mobileDetails[index]];
    const canRun = () => visible && !document.hidden && !reducedMotion;
    const schedule = () => {
      clearTimeout(timer);
      if (canRun() && !hovering && !focused) {
        timer = setTimeout(() => activate((activeRef.current + 1) % mapMarkers.length), 3000);
      }
    };
    const tooltipShift = el => {
      if (!el) return { x: 0, y: 10 };
      if (el.classList.contains("tooltip--left")) return { x: 10, y: 0 };
      if (el.classList.contains("tooltip--right")) return { x: -10, y: 0 };
      return { x: 0, y: 10 };
    };
    const rectsOverlap = (a, b, pad = 10) => a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad;
    const keepTooltipClear = el => {
      if (!el || getComputedStyle(el).display === "none") return { x: 0, y: 0 };
      gsap.set(el, { x: 0, y: 0 });
      const section = root.getBoundingClientRect();
      const heading = root.querySelector(".city-numbers__heading")?.getBoundingClientRect();
      const stats = root.querySelector(".city-numbers__stats")?.getBoundingClientRect();
      const pad = 10;
      let x = 0;
      let y = 0;
      const current = () => {
        const box = el.getBoundingClientRect();
        return { left: box.left + x, right: box.right + x, top: box.top + y, bottom: box.bottom + y, width: box.width, height: box.height };
      };
      let box = current();
      if (box.left < section.left + pad) x += section.left + pad - box.left;
      box = current();
      if (box.right > section.right - pad) x -= box.right - (section.right - pad);
      box = current();
      if (heading && rectsOverlap(box, heading, pad)) {
        const down = heading.bottom + pad - box.top;
        const left = box.right - (heading.left - pad);
        const right = heading.right + pad - box.left;
        const canDown = box.bottom + down < (stats ? stats.top - pad : section.bottom - pad);
        if (canDown && down <= 56) y += down;
        else if (left > 0 && left <= right) x -= left;
        else if (right > 0) x += right;
      }
      box = current();
      if (stats && rectsOverlap(box, stats, pad)) y -= box.bottom - (stats.top - pad);
      box = current();
      if (box.top < section.top + pad) y += section.top + pad - box.top;
      box = current();
      if (box.bottom > section.bottom - pad) y -= box.bottom - (section.bottom - pad);
      return { x, y };
    };
    const activate = (index, manual = false) => {
      clearTimeout(timer);
      if (reducedMotion) index = 0;
      if (manual) setAnnouncement(mapMarkers[index].title + ". " + mapMarkers[index].description);
      if (index === activeRef.current) { schedule(); return; }
      transition?.kill();
      const previousPanels = panels(activeRef.current).filter(Boolean);
      const nextTooltip = tooltips[index];
      const nextPanels = panels(index).filter(Boolean);
      const hideShift = tooltipShift(tooltips[activeRef.current]);
      const showShift = tooltipShift(nextTooltip);
      context.add(() => {
        transition = gsap.timeline({ defaults: { overwrite: "auto" } });
        let rest = { x: 0, y: 0 };
        if (previousPanels.length) {
          transition.to(previousPanels, {
            autoAlpha: 0, x: hideShift.x, y: hideShift.y, duration: 0.25, ease: "power2.inOut",
          });
        }
        transition
          .call(() => {
            gsap.set([...tooltips, ...mobileDetails], { autoAlpha: 0, x: 0, y: 0 });
            activeRef.current = index;
            setActiveIndex(index);
            rest = keepTooltipClear(nextTooltip);
          })
          .fromTo(nextPanels, {
            autoAlpha: 0, x: () => rest.x + showShift.x, y: () => rest.y + showShift.y,
          }, {
            autoAlpha: 1, x: () => rest.x, y: () => rest.y, duration: 0.35, ease: "power2.out",
          })
          .call(schedule);
      });
    };
    context.add(() => {
      if (reducedMotion) {
        activeRef.current = 0;
        // Defer React notification to avoid synchronous state changes in the effect.
        queueMicrotask(() => { if (alive) setActiveIndex(0); });
      }
      gsap.set([...tooltips, ...mobileDetails], { autoAlpha: 0, x: 0, y: 0 });
      const initialRest = keepTooltipClear(tooltips[activeRef.current]);
      gsap.set(tooltips[activeRef.current], { autoAlpha: 1, x: initialRest.x, y: initialRest.y });
      if (mobileDetails[activeRef.current]) gsap.set(mobileDetails[activeRef.current], { autoAlpha: 1 });
      const numbers = select(".city-numbers__value");
      numbers.forEach((number, index) => { number.textContent = (reducedMotion ? cityStats[index].value : 0).toFixed(cityStats[index].decimals); });
      if (!reducedMotion) {
        entrance = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } })
          .fromTo(image, { scale: 1.045 }, { scale: 1, duration: 1.6 }, 0)
          .fromTo(select(".city-numbers__heading"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.1)
          .fromTo(select(".city-numbers__marker"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.65, stagger: 0.1 }, 0.25)
          .fromTo(select(".city-numbers__stat"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, 0.4);
        numbers.forEach((number, index) => {
          const counter = { value: 0 };
          entrance.to(counter, { value: cityStats[index].value, duration: 1.6,
            onUpdate: () => { number.textContent = counter.value.toFixed(cityStats[index].decimals); },
          }, 0.9 + index * 0.1);
        });
        gsap.fromTo(select(".city-numbers__picture"), { y: 12 }, { y: -12, ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
        });
      }
    });
    const sync = () => {
      const running = canRun();
      root.dataset.running = String(running);
      if (running) {
        if (!started) { started = true; entrance?.play(0); }
        else entrance?.resume();
        transition?.resume();
      } else { entrance?.pause(); transition?.pause(); }
      schedule();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0 });
    observer.observe(root);
    document.addEventListener("visibilitychange", sync);
    const refresh = () => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => { if (alive) ScrollTrigger.refresh(); });
    };
    image.addEventListener("load", refresh);
    document.fonts.ready.then(() => { if (alive) refresh(); });
    if (image.complete) refresh();
    const placeActive = () => {
      if (!alive || !tooltips[activeRef.current]) return;
      const rest = keepTooltipClear(tooltips[activeRef.current]);
      gsap.set(tooltips[activeRef.current], { x: rest.x, y: rest.y });
    };
    window.addEventListener("resize", placeActive);
    engineRef.current = {
      activate,
      hover(value) { hovering = value; schedule(); },
      focus(value) { focused = value; schedule(); },
    };
    return () => {
      alive = false;
      clearTimeout(timer);
      cancelAnimationFrame(refreshFrame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("resize", placeActive);
      image.removeEventListener("load", refresh);
      context.revert();
      engineRef.current = null;
    };
  }, [reducedMotion]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function showToast(message) {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), 4500);
  }

  return (
    <section ref={rootRef} className="city-numbers" id="city-numbers" dir="rtl" aria-labelledby="city-numbers-title">
      <picture className="city-numbers__picture">
        <source media="(max-width: 767px)" srcSet={cityMapMobile} />
        <img src={cityMapDesktop} alt="" loading="lazy" decoding="async" className="city-numbers__image" />
      </picture>
      <div className="city-numbers__shade" aria-hidden="true" />
      <div className="city-numbers__glow" aria-hidden="true" />
      <header className="city-numbers__heading">
        <p className="city-numbers__eyebrow">رؤية تتحول إلى واقع</p>
        <h2 id="city-numbers-title">المدينة بالأرقام</h2>
        <p className="city-numbers__intro">مخطط حضري متكامل يصنع مستقبلًا أكثر استدامة وترابطًا.</p>
      </header>
      <div className="city-numbers__map" aria-label="مواقع توضيحية في المدينة">
        {mapMarkers.map((marker, index) => {
          const Icon = marker.icon;
          return <div key={marker.id} className={"city-numbers__marker" + (activeIndex === index ? " is-active" : "")}
            style={{ "--marker-x": marker.desktop.x + "%", "--marker-y": marker.desktop.y + "%", "--mobile-x": marker.mobile.x + "%", "--mobile-y": marker.mobile.y + "%" }}
            onMouseEnter={() => { engineRef.current?.hover(true); engineRef.current?.activate(index, true); }}
            onMouseLeave={() => engineRef.current?.hover(false)}>
            <span className="city-numbers__pin" aria-hidden="true" />
            <span className="city-numbers__stem" aria-hidden="true" />
            <button type="button" className="city-numbers__marker-button" aria-label={marker.title}
              onFocus={() => { engineRef.current?.focus(true); engineRef.current?.activate(index, true); }}
              onBlur={() => engineRef.current?.focus(false)}
              onClick={() => { engineRef.current?.activate(index, true); showToast("الموقع توضيحي — ستتوفر التفاصيل الكاملة قريبًا"); }}>
              <span className="city-numbers__icon"><Icon size={22} aria-hidden="true" /></span>
              <span className="city-numbers__marker-name">{marker.title}</span>
            </button>
            <div className={"city-numbers__tooltip tooltip--" + marker.tooltip} aria-hidden="true">
              <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
              <div><strong>{marker.title}</strong><p>{marker.description}</p></div>
            </div>
          </div>;
        })}
      </div>
      <div className="city-numbers__mobile-details">
        {mapMarkers.map(marker => {
          const Icon = marker.icon;
          return <div className="city-numbers__mobile-detail" key={marker.id} aria-hidden={mapMarkers[activeIndex].id !== marker.id}>
            <Icon size={25} aria-hidden="true" /><div><strong>{marker.title}</strong><p>{marker.description}</p></div>
          </div>;
        })}
      </div>
      <div className="city-numbers__footer">
        <dl className="city-numbers__stats">
          {cityStats.map(stat => <div className="city-numbers__stat" key={stat.id}>
            <dt>{stat.label}</dt>
            <dd><span className="city-numbers__sr-only">{stat.value.toFixed(stat.decimals)} {stat.suffix}</span>
              <span className="city-numbers__value" dir="ltr" aria-hidden="true">{stat.value.toFixed(stat.decimals)}</span>
              <span className="city-numbers__suffix" aria-hidden="true">{stat.suffix}</span>
            </dd>
          </div>)}
        </dl>
        <button type="button" className="city-numbers__explore" onClick={() => navigate("/interactive-map")}>
          استكشف الخريطة الكاملة <ArrowLeft size={20} aria-hidden="true" />
        </button>
      </div>
      <p className="city-numbers__note">المواقع المعروضة توضيحية وفق المخطط العام</p>
      <div className="city-numbers__sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>
      <div className="city-numbers__toast-region" role="status" aria-live="polite" aria-atomic="true">
        {toast && <p className="city-numbers__toast">{toast}</p>}
      </div>
    </section>
  );
}
