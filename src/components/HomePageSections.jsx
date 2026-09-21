import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import City3DScrollytelling from "./City3DScrollytelling";
import FloatingServices from "./FloatingServices";
import CityDiscovery from "./CityDiscovery";
import CityNumbersMap from "./CityNumbersMap";
import FeaturedProjects from "./FeaturedProjects";
import SmartLivingJourney from "./SmartLivingJourney";

gsap.registerPlugin(ScrollTrigger);

export default function HomePageSections() {
  const rootRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        // Animate only surfaces not already owned by the sections' timelines.
        const entrances = [
          [".floating-services", ".services-kicker, .services-copy > h2, .services-introduction", ".services-visual"],
          [".city-discovery", ".discovery-header > *", null],
        ];
        entrances.forEach(([selector, copy, visual]) => {
          const section = root.querySelector(selector);
          if (!section) return;
          const timeline = gsap.timeline({
            defaults: { ease: "power3.out", duration: 1 },
            scrollTrigger: { trigger: section, start: "top 88%", toggleActions: "play none none reverse" },
          });
          if (copy) timeline.from(section.querySelectorAll(copy), { y: 30, opacity: 0, stagger: 0.12 }, 0);
          if (visual) timeline.from(section.querySelector(visual), { y: 40, opacity: 0, duration: 1.25 }, 0.1);
        });
        gsap.fromTo(".city-numbers__footer", { y: 22 }, { y: 0, ease: "none",
          scrollTrigger: { trigger: ".city-numbers", start: "top 75%", end: "center center", scrub: 0.7 } });
      });
      media.add("(prefers-reduced-motion: no-preference) and ((max-width: 1199px) or (max-height: 699px))", () => {
        gsap.from(".smart-living__header", { y: 28, opacity: 0, duration: 1,
          scrollTrigger: { trigger: ".smart-living", start: "top 88%", toggleActions: "play none none reverse" } });
      });
    }, root);
    return () => { media.revert(); context.revert(); };
  }, []);

  return <div ref={rootRef} className="homepage-sections">
    <City3DScrollytelling />
    <FloatingServices />
    <CityDiscovery />
    <CityNumbersMap />
    <FeaturedProjects />
    <SmartLivingJourney />
  </div>;
}
