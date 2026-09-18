import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  PanelsTopLeft, Building2, Map, Box, View, ChartNoAxesCombined,
  ArrowLeft, X,
} from "lucide-react";
import gsap from "gsap";
import smartLiving from "../assets/images/smart-living.png";
import district from "../assets/images/featured-district.png";
import digitalCity from "../assets/images/digital-city.png";
import cityStory from "../assets/images/city-story.png";

const services = [
  { key: "digital", title: "الخدمات الإلكترونية", Icon: PanelsTopLeft, image: smartLiving,
    description: "وصول موحد إلى خدمات المدينة ومعاملاتها الرقمية بسهولة وأمان." },
  { key: "property", title: "العقارات", Icon: Building2, image: district,
    description: "استكشف المشاريع والوحدات والفرص العقارية في مختلف أحياء المدينة." },
  { key: "map", title: "الخريطة الذكية", Icon: Map,
    description: "اعثر على الأحياء والمرافق والمشروعات من خلال تجربة مكانية تفاعلية." },
  { key: "model", title: "المدينة ثلاثية الأبعاد", Icon: Box, image: digitalCity,
    description: "شاهد المدينة ومراحل تطورها ضمن نموذج رقمي غامر." },
  { key: "tour", title: "جولة 360°", Icon: View, image: cityStory,
    description: "تجول افتراضيًا داخل أبرز مناطق المدينة ومشروعاتها." },
  { key: "insights", title: "مؤشرات المدينة", Icon: ChartNoAxesCombined,
    description: "تعرف على البيانات التي تعكس تطور المدينة وجودة الحياة فيها." },
];

const HOLD_DURATION = 2.2;
const TRANSITION_DURATION = 0.75;
const TRANSITION_EASE = "power3.inOut";
const CARD_COUNT = services.length;

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const readMotion = () => window.matchMedia(motionQuery).matches;

function ServiceVisual({ service }) {
  if (service.image) {
    return <img src={service.image} alt="" draggable="false" />;
  }
  if (service.key === "map") {
    return <svg viewBox="0 0 420 210" className="service-map" aria-hidden="true">
      <path className="map-land" d="M0 10H420V210H0Z" />
      <path className="map-garden" d="M0 100Q95 25 180 98T420 54V105Q320 177 185 129T0 150Z" />
      <g className="map-blocks"><path d="M24 20h64v46H24zM113 15h48v54h-48zM190 20h82v48h-82zM300 12h80v38h-80zM32 168h70v30H32zM230 161h50v38h-50zM311 143h80v56h-80z" /></g>
      <g className="map-roads"><path d="M0 82L420 147M97 0L148 210M290 0L206 210M0 158L420 40" /></g>
      <g className="map-pins"><circle cx="145" cy="106" r="9" /><circle cx="299" cy="76" r="7" /><circle cx="255" cy="166" r="6" /></g>
    </svg>;
  }
  return <svg viewBox="0 0 420 210" className="service-chart" aria-hidden="true">
    <g className="chart-grid"><path d="M30 40H390M30 90H390M30 140H390M30 185H390" /></g>
    <g className="chart-bars"><path d="M48 185V146h32v39zM107 185V113h32v72zM166 185V125h32v60zM225 185V76h32v109zM284 185V87h32v98zM343 185V35h32v150z" /></g>
    <path className="chart-line" d="M48 126L122 88L184 103L243 48L301 60L367 18" />
  </svg>;
}

export default function FloatingServices() {
  const rootRef = useRef(null);
  const engineRef = useRef(null);
  const activeRef = useRef(0);
  const toastTimer = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [toast, setToast] = useState(null);
  const reducedMotion = useSyncExternalStore(subscribeMotion, readMotion, () => true);

  useEffect(() => {
    const root = rootRef.current;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add({ all: "all", compact: "(max-width: 900px)" }, (motion) => {
        const compact = motion.conditions.compact;
        const cards = [...root.querySelectorAll(".service-card")];
        const details = [...root.querySelectorAll(".service-detail")];
        const deck = root.querySelector(".services-deck");
        let inView = false;
        let transitioning = false;
        let transition;
        let delay;
        let disposed = false;
        const ring = { turn: activeRef.current };
        const adjacent = Math.PI / 3;

        function applyTurn(turn) {
          const width = deck.clientWidth;
          const cardW = cards[0]?.offsetWidth || Math.min(680, width * 0.7);
          const xSide = compact
            ? Math.min(cardW * 0.24, width * 0.3)
            : Math.min(cardW * 0.52, width * 0.36);
          const ySide = compact ? cardW * 0.015 : cardW * 0.06;
          const zFront = compact ? 70 : 100;
          const zSide = compact ? -120 : -180;
          const rotSide = compact ? 16 : 24;
          const scaleSide = compact ? 0.88 : 0.84;

          cards.forEach((card, index) => {
            const content = card.querySelector(".service-card-content");
            if (reducedMotion) {
              const current = ((Math.round(activeRef.current) % CARD_COUNT) + CARD_COUNT) % CARD_COUNT;
              const on = index === current;
              gsap.set(card, {
                x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0,
                scale: 1, autoAlpha: on ? 1 : 0, zIndex: on ? 20 : 0, force3D: false,
              });
              gsap.set(content, { autoAlpha: on ? 1 : 0 });
              return;
            }

            const offset = (() => {
              let wrapped = ((index - turn) % CARD_COUNT + CARD_COUNT) % CARD_COUNT;
              if (wrapped > CARD_COUNT / 2) wrapped -= CARD_COUNT;
              return wrapped;
            })();
            const angle = offset * adjacent;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const depth = (1 - cos) / (1 - Math.cos(adjacent));
            const spread = sin / Math.sin(adjacent);
            const scale = depth <= 1
              ? 1 - (1 - scaleSide) * depth
              : Math.max(0.72, scaleSide - (depth - 1) * 0.06);
            const autoAlpha = depth <= 1
              ? 1 - 0.1 * depth
              : Math.max(0.42, 0.78 - (depth - 1) * 0.16);

            gsap.set(card, {
              x: spread * xSide,
              y: -Math.min(depth, 1.15) * ySide,
              z: zFront + (zSide - zFront) * Math.min(depth, 1.35),
              rotationX: Math.min(depth, 1.2) * 2,
              rotationY: -spread * rotSide,
              rotationZ: spread * 2,
              scale,
              autoAlpha,
              zIndex: Math.abs(offset) < 0.5 ? 20 : Math.round(6 + cos * 8),
              force3D: true,
            });
            gsap.set(content, {
              autoAlpha: gsap.utils.clamp(0, 1, 1 - Math.abs(offset) / 0.42),
            });
          });
        }

        function schedule() {
          delay?.kill();
          if (disposed || reducedMotion || !inView || document.hidden || transitioning) return;
          delay = gsap.delayedCall(HOLD_DURATION, () => motion.go(activeRef.current + 1));
        }
        function syncPlayback() {
          if (!inView || document.hidden) transition?.pause();
          else transition?.resume();
          schedule();
        }

        gsap.set(cards, { xPercent: -50, yPercent: -50, transformOrigin: "50% 50%" });
        if (reducedMotion) setActiveIndex(activeRef.current);
        applyTurn(ring.turn);
        gsap.set(details, { autoAlpha: 0 });
        gsap.set(details[activeRef.current], { autoAlpha: 1 });

        motion.add("go", () => {
          if (reducedMotion || disposed) return;
          delay?.kill();
          if (transitioning) return;
          const previous = activeRef.current;
          const next = (previous + 1) % CARD_COUNT;
          activeRef.current = next;
          transitioning = true;
          let painted = previous;
          transition = gsap.to(ring, {
            turn: ring.turn + 1,
            duration: TRANSITION_DURATION,
            ease: TRANSITION_EASE,
            overwrite: "auto",
            onUpdate: () => {
              applyTurn(ring.turn);
              const visual = ((Math.round(ring.turn) % CARD_COUNT) + CARD_COUNT) % CARD_COUNT;
              if (visual !== painted) {
                painted = visual;
                setActiveIndex(visual);
              }
            },
            onComplete() {
              setActiveIndex(next);
              transitioning = false;
              applyTurn(ring.turn);
              schedule();
            },
          });
          gsap.to(details[previous], { autoAlpha: 0, duration: 0.28, overwrite: "auto" });
          gsap.fromTo(details[next], { autoAlpha: 0 }, {
            autoAlpha: 1, duration: 0.4, delay: 0.22, overwrite: "auto",
          });
        });

        motion.add("hoverCard", (index, entering) => {
          if (reducedMotion || compact || index !== activeRef.current) return;
          gsap.to(cards[index].querySelector(".service-card-face"), {
            y: entering ? -6 : 0, z: entering ? 12 : 0,
            duration: 0.45, overwrite: "auto", ease: "power3.out", force3D: true,
          });
        });
        engineRef.current = {
          hoverCard: motion.hoverCard,
        };
        const observer = new IntersectionObserver(([entry]) => {
          inView = entry.isIntersecting && entry.intersectionRatio >= 0.15;
          syncPlayback();
        }, { threshold: [0, 0.15] });
        observer.observe(root);
        document.addEventListener("visibilitychange", syncPlayback);
        let resizeFrame;
        const resizeObserver = new ResizeObserver(() => {
          cancelAnimationFrame(resizeFrame);
          resizeFrame = requestAnimationFrame(() => {
            if (!transitioning) applyTurn(ring.turn);
          });
        });
        resizeObserver.observe(deck);
        return () => {
          disposed = true;
          engineRef.current = null;
          delay?.kill();
          transition?.kill();
          observer.disconnect();
          resizeObserver.disconnect();
          cancelAnimationFrame(resizeFrame);
          document.removeEventListener("visibilitychange", syncPlayback);
        };
      });
    }, root);
    return () => {
      media.revert();
      context.revert();
    };
  }, [reducedMotion]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function showToast(title) {
    clearTimeout(toastTimer.current);
    setToast({ title });
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  }

  return (
    <div id="explore">
      <section id="services" ref={rootRef} className="floating-services" aria-labelledby="services-heading"
        data-active-service={services[activeIndex].key}>
        <div className="services-copy">
          <p className="services-kicker">عالم من الإمكانات</p>
          <h2 id="services-heading">المدينة بين يديك</h2>
          <p className="services-introduction">استكشف خدمات مدينة السلطان هيثم من خلال تجربة رقمية موحدة وسلسة.</p>
          <div className="service-details">
            {services.map(({ key, title, description, Icon }, index) => (
              <div className="service-detail" key={key} aria-hidden={index !== activeIndex}>
                <Icon size={25} strokeWidth={1.4} aria-hidden="true" />
                <h3 className="service-detail-title"><span>{title}</span></h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="services-visual" aria-label="بطاقات خدمات المدينة">
          <div className="services-deck">
            {services.map((service, index) => {
              const Icon = service.Icon;
              const isActive = index === activeIndex;
              return <article className="service-card" key={service.key} data-service={service.key} data-active={isActive}
                onPointerEnter={() => engineRef.current?.hoverCard(index, true)}
                onPointerLeave={() => engineRef.current?.hoverCard(index, false)}>
                <div className="service-card-face">
                  <div className="service-card-visual"><ServiceVisual service={service} /></div>
                  <div className="service-card-content">
                    <Icon className="service-card-icon" size={25} strokeWidth={1.3} aria-hidden="true" />
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <button type="button" className="service-explore" tabIndex={isActive ? 0 : -1}
                      onClick={() => showToast(service.title)} aria-label={"استكشف: " + service.title}>
                      استكشف <ArrowLeft size={17} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>;
            })}
          </div>
        </div>
      </section>
      <div className="service-toast-region" role="status" aria-live="polite" aria-atomic="true">
        {toast && <div className="service-toast">
          <div><strong>{toast.title}</strong><p>ستتوفر هذه الخدمة قريبًا</p></div>
          <button type="button" aria-label="إغلاق الرسالة" onClick={() => setToast(null)}><X size={20} /></button>
        </div>}
      </div>
    </div>
  );
}
