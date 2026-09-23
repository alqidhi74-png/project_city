import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import residential from "../assets/images/featured-district.png";
import greenery from "../assets/images/smart-living.png";
import facilities from "../assets/images/01_smart_urban_plaza.jpg";

gsap.registerPlugin(ScrollTrigger);

const scenes = [
  { label: "الأحياء السكنية", title: "أحياء تنبض بالحياة",
    description: "مجتمعات سكنية متكاملة صُممت لتقريب الإنسان من احتياجاته اليومية وتعزيز التواصل بين السكان.",
    image: residential, alt: "منظور جوي لأحياء سكنية تتخللها الحدائق والممرات في المدينة" },
  { label: "المساحات الخضراء", title: "الطبيعة في قلب المدينة",
    description: "حدائق ومسارات ومساحات مفتوحة تمنح السكان بيئة صحية وهادئة للحياة والحركة.",
    image: greenery, alt: "مساحات خضراء وممرات للمشي بجوار المياه والمباني السكنية" },
  { label: "المرافق والخدمات", title: "كل ما تحتاجه أقرب",
    description: "مرافق تعليمية وصحية وتجارية موزعة بعناية لتقديم تجربة حضرية سهلة ومتكاملة.",
    image: facilities, alt: "ساحة حضرية مظللة للمشاة تحيط بها مرافق وخدمات المدينة" },
];
const masks = ["polygon(0.00% 8.00%,5.26% 5.06%,10.07% 3.19%,14.50% 2.25%,18.59% 2.15%,22.41% 2.77%,26.00% 4.00%,29.43% 5.73%,32.74% 7.85%,36.00% 10.25%,39.26% 12.81%,42.57% 15.44%,46.00% 18.00%,51.09% 20.13%,56.31% 21.64%,61.58% 22.69%,66.81% 23.44%,71.94% 24.08%,76.88% 24.75%,81.54% 25.63%,85.85% 26.89%,89.73% 28.69%,93.11% 31.19%,95.89% 34.58%,98.00% 39.00%,99.46% 43.84%,100.35% 48.81%,100.67% 53.81%,100.44% 58.78%,99.68% 63.62%,98.38% 68.25%,96.55% 72.59%,94.22% 76.56%,91.39% 80.06%,88.07% 83.03%,84.27% 85.37%,80.00% 87.00%,75.08% 87.90%,70.30% 89.06%,65.63% 90.38%,61.04% 91.78%,56.50% 93.18%,52.00% 94.50%,47.50% 95.65%,42.96% 96.56%,38.38% 97.13%,33.70% 97.28%,28.92% 96.93%,24.00% 96.00%,21.08% 96.08%,18.33% 96.29%,15.75% 96.59%,13.33% 96.96%,11.08% 97.36%,9.00% 97.75%,7.08% 98.10%,5.33% 98.37%,3.75% 98.53%,2.33% 98.55%,1.08% 98.38%,0.00% 98.00%,0.00% 90.77%,0.00% 83.14%,0.00% 75.22%,0.00% 67.11%,0.00% 58.92%,0.00% 50.75%,0.00% 42.70%,0.00% 34.89%,0.00% 27.41%,0.00% 20.36%,0.00% 13.86%)","polygon(0.00% 8.00%,5.26% 5.97%,10.07% 4.84%,14.50% 4.46%,18.59% 4.72%,22.41% 5.53%,26.00% 6.79%,29.43% 8.42%,32.74% 10.33%,36.00% 12.41%,39.26% 14.56%,42.57% 16.69%,46.00% 18.70%,51.09% 19.94%,56.31% 20.56%,61.58% 20.83%,66.81% 21.01%,71.94% 21.33%,76.88% 21.97%,81.54% 23.06%,85.85% 24.71%,89.73% 27.00%,93.11% 30.02%,95.89% 33.86%,98.00% 38.65%,99.46% 43.75%,100.35% 48.87%,100.67% 53.93%,100.44% 58.86%,99.68% 63.56%,98.38% 67.96%,96.55% 71.99%,94.22% 75.56%,91.39% 78.62%,88.07% 81.12%,84.27% 83.03%,80.00% 84.34%,75.08% 85.10%,70.30% 86.38%,65.63% 88.05%,61.04% 89.99%,56.50% 92.07%,52.00% 94.15%,47.50% 96.09%,42.96% 97.75%,38.38% 98.99%,33.70% 99.67%,28.92% 99.65%,24.00% 98.79%,21.08% 98.79%,18.33% 98.84%,15.75% 98.93%,13.33% 99.04%,11.08% 99.16%,9.00% 99.25%,7.08% 99.30%,5.33% 99.29%,3.75% 99.18%,2.33% 98.96%,1.08% 98.57%,0.00% 98.00%,0.00% 90.77%,0.00% 83.14%,0.00% 75.22%,0.00% 67.11%,0.00% 58.92%,0.00% 50.75%,0.00% 42.70%,0.00% 34.89%,0.00% 27.41%,0.00% 20.36%,0.00% 13.86%)","polygon(0.00% 8.00%,5.26% 4.32%,10.07% 1.82%,14.50% 0.43%,18.59% 0.03%,22.41% 0.50%,26.00% 1.70%,29.43% 3.52%,32.74% 5.82%,36.00% 8.48%,39.26% 11.38%,42.57% 14.40%,46.00% 17.43%,51.09% 20.29%,56.31% 22.53%,61.58% 24.22%,66.81% 25.45%,71.94% 26.33%,76.88% 27.03%,81.54% 27.74%,85.85% 28.67%,89.73% 30.07%,93.11% 32.16%,95.89% 35.16%,98.00% 39.29%,99.46% 43.92%,100.35% 48.76%,100.67% 53.72%,100.44% 58.71%,99.68% 63.66%,98.38% 68.48%,96.55% 73.08%,94.22% 77.37%,91.39% 81.25%,88.07% 84.59%,84.27% 87.29%,80.00% 89.19%,75.08% 90.20%,70.30% 91.26%,65.63% 92.29%,61.04% 93.25%,56.50% 94.09%,52.00% 94.79%,47.50% 95.29%,42.96% 95.57%,38.38% 95.59%,33.70% 95.31%,28.92% 94.70%,24.00% 93.70%,21.08% 93.85%,18.33% 94.19%,15.75% 94.67%,13.33% 95.25%,11.08% 95.88%,9.00% 96.52%,7.08% 97.11%,5.33% 97.61%,3.75% 97.99%,2.33% 98.21%,1.08% 98.22%,0.00% 98.00%,0.00% 90.77%,0.00% 83.14%,0.00% 75.22%,0.00% 67.11%,0.00% 58.92%,0.00% 50.75%,0.00% 42.70%,0.00% 34.89%,0.00% 27.41%,0.00% 20.36%,0.00% 13.86%)"];

export default function CityDiscovery() {
  const rootRef = useRef(null);
  const [activeScene, setActiveScene] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    const precedingSection = root.previousElementSibling;
    let alive = true;
    let refreshFrame;
    const refresh = () => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => { if (alive) ScrollTrigger.refresh(); });
    };
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add({
        all: "all",
        desktop: "(min-width: 900px) and (min-height: 700px)",
        reduce: "(prefers-reduced-motion: reduce)",
      }, ({ conditions }) => {
        const select = gsap.utils.selector(root);
        if (conditions.reduce) {
          gsap.set(select(".discovery-mobile-scene"), { clearProps: "opacity,transform,visibility" });
          return;
        }
        if (!conditions.desktop) {
          select(".discovery-mobile-scene").forEach((scene) => {
            gsap.fromTo(scene, { opacity: 0, y: 18 }, {
              opacity: 1, y: 0, duration: 0.65, ease: "power2.out",
              scrollTrigger: { trigger: scene, start: "top 92%", once: true },
            });
          });
          return;
        }

        const layers = select(".discovery-image-layer");
        const captions = select(".discovery-caption");
        const options = select(".discovery-option");
        const visual = select(".discovery-visual");
        const scanLine = select(".discovery-scan-line");
        gsap.set(layers, { clipPath: masks[0] });
        gsap.set(select(".discovery-frame"), { clipPath: masks[0] });
        gsap.set(visual, { transformPerspective: 1200, transformOrigin: "50% 50%" });
        gsap.set(layers.slice(1), { autoAlpha: 0 });
        gsap.set(layers[0], { autoAlpha: 1 });
        gsap.set(captions, { autoAlpha: 0, y: 0 });
        gsap.set(captions[0], { autoAlpha: 1 });
        gsap.set(options, { color: "rgba(242, 235, 221, 0.56)" });
        gsap.set(options[0], { color: "#D6B35F" });
        const timeline = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            id: "city-discovery", trigger: root, pin: true, start: "top top",
            end: () => "+=" + innerHeight * 2.7, scrub: 0.55,
            anticipatePin: 1, invalidateOnRefresh: true,
          },
          onUpdate() { setActiveScene(previous => {
            const next = Math.min(2, Math.floor(this.time()));
            return previous === next ? previous : next;
          }); },
        });
        timeline
          .to(select(".discovery-depth-back"), { y: -42, x: 34, rotation: -8, scale: 0.9, duration: 3, ease: "none" }, 0)
          .to(select(".discovery-depth-front"), { y: -26, x: 18, rotation: -4, scale: 0.96, duration: 3, ease: "none" }, 0)
          .to(select(".discovery-topography"), { y: -34, duration: 3, ease: "none" }, 0)
          .to(visual, { rotationY: -14, rotationX: 8, scale: 1.08, duration: 3, ease: "none" }, 0)
          .to(scanLine, { yPercent: 900, duration: 3, ease: "none" }, 0);
        for (let index = 1; index < scenes.length; index += 1) {
          const at = index;
          // Sequential fades remain reversible and share one transition window.
          timeline
            .to([layers[index - 1], captions[index - 1]], { autoAlpha: 0, duration: 0.18 }, at - 0.18)
            .to(captions[index - 1], { y: -14, duration: 0.18 }, at - 0.18)
            .fromTo(layers[index], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.24 }, at)
            .fromTo(layers[index].querySelector("img"), { scale: 1.06 }, { scale: 1, duration: 0.24 }, at)
            .to([select(".discovery-frame")[0], ...layers], { clipPath: masks[index], duration: 0.42 }, at - 0.18)
            .fromTo(captions[index], { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.24 }, at)
            .to(select(".discovery-progress-mark"), { y: () => options[index].offsetTop - options[0].offsetTop, duration: 0.24 }, at)
            .to(options[index - 1], { color: "rgba(242, 235, 221, 0.56)", duration: 0.24 }, at)
            .to(options[index], { color: "#D6B35F", duration: 0.24 }, at);
        }
      });
    }, root);

    const images = [...root.querySelectorAll("img")];
    images.forEach(image => image.addEventListener("load", refresh));
    const observer = new ResizeObserver(refresh);
    if (precedingSection) observer.observe(precedingSection);
    document.fonts.load('700 1em "Noto Kufi Arabic"').then(() => document.fonts.ready).then(() => { if (alive) refresh(); });
    refresh();
    return () => {
      alive = false;
      cancelAnimationFrame(refreshFrame);
      observer.disconnect();
      images.forEach(image => image.removeEventListener("load", refresh));
      media.revert();
      context.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className="city-discovery" aria-label="اكتشف مدينة السلطان هيثم" data-active-scene={activeScene}>
      <svg className="discovery-topography" viewBox="0 0 1200 800" preserveAspectRatio="none" aria-hidden="true">
        {Array.from({ length: 14 }, (_, index) => (
          <path key={index} d={`M-80 ${45 + index * 14} Q180 ${-90 + index * 19} 410 ${95 + index * 12} T820 ${40 + index * 17} T1300 ${160 + index * 13} M-80 ${630 + index * 12} Q220 ${470 + index * 18} 510 ${650 + index * 8} T1000 ${570 + index * 14} T1300 ${720 + index * 9}`} />
        ))}
      </svg>
      <header className="discovery-header">
        <p className="discovery-kicker">اكتشف المدينة</p>
        <h2>مدينة تُصمَّم<br />للإنسان</h2>
        <p className="discovery-introduction">مساحات نابضة بالحياة تجمع الطبيعة، المجتمع، والخدمات في تجربة حضرية متكاملة.</p>
      </header>

      <div className="discovery-visual" style={{ "--discovery-mask": masks[0] }}>
        <span className="discovery-scan-line" aria-hidden="true" />
        <div className="discovery-depth discovery-depth-back" aria-hidden="true"><img src={residential} alt="" /></div>
        <div className="discovery-depth discovery-depth-front" aria-hidden="true"><img src={residential} alt="" /></div>
        <div className="discovery-frame">
          {scenes.map((scene, index) => (
            <div key={scene.label} className="discovery-image-layer" aria-hidden={index !== activeScene}>
              <img src={scene.image} alt={scene.alt} />
            </div>
          ))}
        </div>
      </div>

      <div className="discovery-editorial">
        <div className="discovery-options">
          <div className="discovery-progress" aria-hidden="true"><span className="discovery-progress-mark" /></div>
          <ul aria-label="مشاهد المدينة">
            {scenes.map((scene, index) => <li key={scene.label} className="discovery-option"
              aria-current={index === activeScene ? "true" : undefined}>{scene.label}</li>)}
          </ul>
        </div>
        <div className="discovery-captions">
          {scenes.map((scene, index) => <div key={scene.label} className="discovery-caption" aria-hidden={index !== activeScene}>
            <h3>{scene.title}</h3><p>{scene.description}</p>
          </div>)}
        </div>
      </div>

      <div className="discovery-mobile">
        {scenes.map(scene => <article className="discovery-mobile-scene" key={scene.label}>
          <img src={scene.image} alt={scene.alt} />
          <p className="discovery-kicker">{scene.label}</p>
          <h3>{scene.title}</h3>
          <p>{scene.description}</p>
        </article>)}
      </div>
    </section>
  );
}

