import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Globe2,
  Menu,
  UserRound,
  X,
} from "lucide-react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

import HomePageSections from "./HomePageSections";

import heroCity from "../assets/images/hero-city.png";
import sultanImage from "../assets/images/Sultan.png";
import cityLogo from "../assets/images/logo.png";
import "../style/HomePage.css";

gsap.registerPlugin(ScrollTrigger);

function HomePage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const pageRef = useRef(null);
  const heroRef = useRef(null);
  const heroImageRef = useRef(null);
  const heroContentRef = useRef(null);
  const searchRef = useRef(null);
  const introRef = useRef(null);

  useEffect(() => {
    const heroImage = heroImageRef.current;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const heroMotion = gsap.matchMedia();
    const reducedMotion = motionPreference.matches;
    let active = true;
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: !reducedMotion,
      wheelMultiplier: 0.9,
      autoRaf: false,
      anchors: true,
    });

    // One clock for Lenis and every scroll-driven scene on the home page.
    const update = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);
    const updatePreference = () => { lenis.options.smoothWheel = !motionPreference.matches; };
    motionPreference.addEventListener("change", updatePreference);

    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(".intro-visual", { opacity: 1, scale: 1 });
        const fade = gsap.timeline({ paused: true }).to(introRef.current, {
          autoAlpha: 0,
          duration: 0.2,
        }, 1);
        document.fonts.load('700 1em "Noto Kufi Arabic"').then(() => document.fonts.ready).then(() => {
          if (active) fade.play();
        });
        return;
      }

      const timeline = gsap.timeline({
        paused: true,
        defaults: {
          ease: "power3.out",
        },
      });

      timeline
        .fromTo(
          ".intro-visual",
          {
            scale: 0.9,
            opacity: 0,
            filter: "blur(18px)",
          },
          {
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.2,
          }
        )
        .to(
          ".intro-visual img",
          {
            y: -12,
            x: 6,
            scale: 1.06,
            duration: 2.2,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          },
          "-=0.8"
        )
        .to(introRef.current, {
          yPercent: -100,
          duration: 1.15,
          ease: "power4.inOut",
          delay: 1,
          onComplete: () => gsap.set(introRef.current, { visibility: "hidden" }),
        })
        .from(
          ".navbar",
          {
            y: -40,
            opacity: 0,
            duration: 0.9,
          },
          "-=0.45"
        )
        .from(
          ".hero-eyebrow",
          {
            y: 25,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.6"
        )
        .from(
          ".hero-title-line span",
          {
            yPercent: 110,
            opacity: 0,
            stagger: 0.12,
            duration: 1,
          },
          "-=0.45"
        )
        .from(
          ".hero-description, .hero-actions",
          {
            y: 35,
            opacity: 0,
            stagger: 0.15,
            duration: 0.8,
          },
          "-=0.55"
        )
        .from(
          searchRef.current,
          {
            y: 60,
            opacity: 0,
            duration: 0.9,
          },
          "-=0.5"
        );

      // Start the reading time only after the Arabic font is ready.
      document.fonts.load('700 1em "Noto Kufi Arabic"').then(() => document.fonts.ready).then(() => {
        if (active) timeline.play();
      });

    }, pageRef);

    heroMotion.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(heroImage, {
        scale: 1.15,
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      gsap.to(heroContentRef.current, {
        yPercent: 35,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "75% top",
          scrub: true,
        },
      });
    }, pageRef);

    const handlePointerMove = (event) => {
      if (motionPreference.matches || window.innerWidth < 900 || window.scrollY > window.innerHeight) return;

      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;

      gsap.to(heroImageRef.current, {
        x: x * 18,
        y: y * 12,
        duration: 1.4,
        ease: "power3.out",
      });
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      active = false;
      heroMotion.revert();
      context.revert();
      lenis.destroy();
      gsap.ticker.remove(update);
      gsap.ticker.lagSmoothing(500, 33);
      gsap.killTweensOf(heroImage);
      motionPreference.removeEventListener("change", updatePreference);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <main ref={pageRef} className="homepage" dir="rtl">
      <div ref={introRef} className="intro-screen">
        <div className="intro-visual">
          <img src={sultanImage} alt="السلطان" className="intro-portrait" />
          <div className="intro-glow" aria-hidden="true" />
        </div>
      </div>

      <section ref={heroRef} className="hero">
        <div className="hero-media">
          <img
            ref={heroImageRef}
            src={heroCity}
            alt="تصور عمراني لمدينة السلطان هيثم"
          />
        </div>

        <div className="hero-shade" />
        <div className="hero-noise" />

        <header className="navbar">
          <a href="#home" className="brand" aria-label="الصفحة الرئيسية">
            <img src={cityLogo} alt="شعار المدينة" className="brand-logo" />
          </a>

          <nav className={`nav-links ${menuOpen ? "is-open" : ""}`}>
            <button
              className="mobile-close"
              onClick={() => setMenuOpen(false)}
              aria-label="إغلاق القائمة"
            >
              <X size={24} />
            </button>

            <a href="#home">الرئيسية</a>
            <a href="#explore">استكشف المدينة</a>
            <a href="#projects">المشاريع والعقارات</a>
            <a href="#services">الخدمات الإلكترونية</a>
            <a href="#smart-living">الحياة الذكية</a>
            <a href="#news">الأخبار والفعاليات</a>
          </nav>

          <div className="nav-actions">
            <button className="language-button">
              <Globe2 size={18} />
              <span>EN</span>
            </button>

            <button className="login-button" onClick={() => navigate("/login")}>
              <UserRound size={18} />
              <span>تسجيل الدخول</span>
            </button>

            <button
              className="menu-button"
              onClick={() => setMenuOpen(true)}
              aria-label="فتح القائمة"
            >
              <Menu size={25} />
            </button>
          </div>

        </header>

        <div ref={heroContentRef} className="hero-content" id="home">
          <h1 className="hero-title hero-title-white">
            <span className="hero-title-line">
              <span>مدينة تُبنى للإنسان</span>
            </span>

            <span className="hero-title-line hero-title-accent hero-title-white">
              <span>وتُصمم للمستقبل</span>
            </span>
          </h1>

          <p className="hero-description">
            مجتمع حضري ذكي ومستدام يجمع بين جودة الحياة، الطبيعة
            والتقنيات الحديثة في قلب سلطنة عُمان.
          </p>

          <div className="hero-actions">
            <a href="#explore" className="primary-button">
              <span>استكشف المدينة</span>
              <ArrowLeft size={19} />
            </a>

            <a href="#projects" className="secondary-button">
              اكتشف المشاريع
            </a>
          </div>
        </div>

        <a href="#explore" className="scroll-indicator">
          <span>اكتشف</span>
          <div className="scroll-line">
            <i />
          </div>
        </a>
      </section>

      <HomePageSections />
    </main>
  );
}

export default HomePage;
