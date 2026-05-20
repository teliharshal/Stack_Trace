import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaChartLine,
  FaCheckCircle,
  FaFacebookF,
  FaInstagram,
  FaLightbulb,
  FaLinkedinIn,
  FaMoon,
  FaPlay,
  FaRocket,
  FaSun,
  FaTwitter,
  FaUsers
} from "react-icons/fa";
import { motion, useReducedMotion } from "framer-motion";
import HeroImg from "../assets/HeroImg.png";
import stackTraceDark from "../assets/StackTrace.png";
import stackTraceLight from "../assets/StackTrackLight.png";
import CTABanner from "../assets/CTABanner.png";

const features = [
  {
    icon: <FaLightbulb />,
    title: "Skill Management",
    desc: "Organize and track all your skills in one place."
  },
  {
    icon: <FaChartLine />,
    title: "Analytics Dashboard",
    desc: "Visual insights to measure performance growth."
  },
  {
    icon: <FaUsers />,
    title: "Team Monitoring",
    desc: "Track employee progress and productivity."
  },
  {
    icon: <FaCheckCircle />,
    title: "Consistency Tracking",
    desc: "Maintain daily learning streaks and discipline."
  }
];

const steps = [
  {
    title: "Add Skills",
    desc: "Create and manage your skill set.",
    badge: "1"
  },
  {
    title: "Track Progress",
    desc: "Update and monitor your growth regularly.",
    badge: "2"
  },
  {
    title: "Analyze Performance",
    desc: "Use analytics to improve continuously.",
    badge: "3"
  },
  {
    title: "Track Consistency",
    desc: "Build strong habits and learning streaks.",
    badge: "4"
  }
];

const socials = [
  { icon: <FaTwitter size={15} />, href: "https://twitter.com" },
  { icon: <FaFacebookF size={15} />, href: "https://facebook.com" },
  { icon: <FaLinkedinIn size={15} />, href: "https://linkedin.com" },
  { icon: <FaInstagram size={15} />, href: "https://instagram.com" }
];

const Home = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const reduceMotion = useReducedMotion();
  const MotionDiv = motion.div;
  const MotionP = motion.p;
  const [typedTitle, setTypedTitle] = useState("");
  const fullTitle = "Track Skills";
  const heroTitle = reduceMotion ? fullTitle : typedTitle;
  const typingDone = Boolean(reduceMotion) || typedTitle.length >= fullTitle.length;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    if (reduceMotion) {
      return undefined;
    }

    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      setTypedTitle(fullTitle.slice(0, index));
      if (index >= fullTitle.length) {
        window.clearInterval(intervalId);
      }
    }, 70);

    return () => window.clearInterval(intervalId);
  }, [reduceMotion]);

  return (
    <div className="scroll-smooth bg-[#f6f0e3] text-slate-900 transition-colors duration-300 dark:bg-[#08111b] dark:text-white">
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(0, -16px, 0) scale(1.04); }
        }

        @keyframes heroSweep {
          0% { transform: translateX(-40%); }
          100% { transform: translateX(40%); }
        }

        @keyframes heroDrift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, 10px, 0); }
        }

        @keyframes heroGlow {
          0%, 100% { opacity: 0.32; transform: scale(1); }
          50% { opacity: 0.58; transform: scale(1.04); }
        }

        .hero-grid {
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(circle at center, black 28%, transparent 80%);
        }

        .dark .hero-grid {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
        }
      `}</style>

      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6 lg:px-8">
          <a href="#home" className="flex items-center gap-3">
            <div className="flex flex-col items-center leading-tight">
              <img
                src={darkMode ? stackTraceDark : stackTraceLight}
                alt="StackTrace Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 dark:text-slate-300 md:flex">
            <a href="#features" className="transition hover:text-teal-9000 dark:hover:text-teal-900">
              Features
            </a>
            <a href="#how" className="transition hover:text-teal-900 dark:hover:text-teal-900">
              How It Works
            </a>
            <a href="#contact" className="transition hover:text-teal-900 dark:hover:text-teal-900">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDarkMode((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:scale-105 hover:border-teal-300 hover:text-teal-700 dark:border-white/10 dark:bg-slate-900 dark:text-amber-300"
              aria-label="Toggle theme"
            >
              {darkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>

            <a
              href="/login"
              className="rounded-lg bg-teal-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-teal-800"
            >
              Login
            </a>
          </div>
        </div>
      </header>

      <main id="home">
        <section className="relative isolate overflow-hidden bg-[#f5efdf] transition-colors duration-300 dark:bg-[#08111b]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.82),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.18),_rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.14),_transparent_28%),linear-gradient(180deg,_rgba(8,17,27,0.96),_rgba(8,17,27,0.98))]" />
          <div
            className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.44)_50%,rgba(255,255,255,0)_100%)] opacity-40 mix-blend-soft-light dark:opacity-20"
            style={{ animation: "heroSweep 12s linear infinite" }}
          />
          <div
            className="absolute left-1/2 top-24 h-28 w-[72rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-teal-400/18 to-transparent blur-3xl dark:via-teal-300/10"
            style={{ animation: "heroGlow 10s ease-in-out infinite" }}
          />

          <div
            className="absolute left-6 top-16 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-500/10"
            style={{ animation: "heroFloat 11s ease-in-out infinite" }}
          />
          <div
            className="absolute right-8 top-20 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl dark:bg-cyan-500/10"
            style={{ animation: "heroFloat 13s ease-in-out infinite" }}
          />
          <div
            className="absolute bottom-8 left-1/3 h-64 w-64 rounded-full bg-cyan-300/18 blur-3xl dark:bg-teal-300/10"
            style={{ animation: "heroDrift 15s ease-in-out infinite" }}
          />

          <div className="absolute inset-0 opacity-35 dark:opacity-25">
            <div className="hero-grid absolute inset-0" />
          </div>

          {/* Changed min-h to a smaller value and reduced vertical padding (py-14 -> py-8) */}
<div className="relative mx-auto grid min-h-[500px] max-w-7xl items-center gap-6 px-5 py-8 sm:px-6 lg:grid-cols-[1fr_1.08fr] lg:px-8 lg:py-10">
  
  {/* Reduced top padding here as well (lg:pt-4 -> lg:pt-0) */}
  <div className="max-w-lg lg:pt-0">

    <div className="mt-4 text-4xl font-black leading-[1.02] tracking-tight text-teal-950 sm:text-5xl lg:text-6xl dark:text-white">
      <span
        className={`inline-block pr-1 transition-opacity duration-300 ${
          typingDone
            ? "border-r-0 opacity-100"
            : "border-r-2 border-teal-700/25 opacity-85 dark:border-teal-300/25"
        }`}
      >
        {heroTitle}
      </span>
    </div>

    {/* Measure Growth stays the same but margin-top reduced (mt-2 -> mt-1) */}
    <MotionDiv
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={reduceMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.2 }}
      className="mt-1 text-4xl font-black leading-[1.02] tracking-tight text-teal-800 sm:text-5xl lg:text-6xl dark:text-teal-300"
    >
      Measure Growth.
    </MotionDiv>

    {/* Reduced margin-top (mt-5 -> mt-3) */}
    <MotionP
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={reduceMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.35 }}
      className="mt-3 max-w-md text-sm leading-6 text-slate-700 sm:text-base dark:text-slate-300"
    >
      Designed for HR professionals and teams managing multiple skill sets.
      StackTrace gives you a centralized, secure, and smart solution.
    </MotionP>

    {/* Reduced margin-top (mt-7 -> mt-5) */}
    <MotionDiv
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={reduceMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.5 }}
      className="mt-5 flex flex-wrap gap-4"
    >
      <a
        href="/login"
        className="inline-flex items-center gap-2 rounded-2xl bg-teal-900 px-7 py-3 text-sm font-bold text-white shadow-xl shadow-teal-900/20 transition hover:-translate-y-1 hover:bg-teal-950 dark:bg-teal-600 dark:hover:bg-teal-500"
      >
        <FaRocket /> Get Started
      </a>
      <a
        href="#features"
        className="inline-flex items-center gap-2 rounded-2xl border-2 border-teal-200 bg-white/80 px-7 py-3 text-sm font-bold text-teal-900 transition hover:-translate-y-1 hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
      >
        <FaPlay className="text-sm" /> Learn More
      </a>
    </MotionDiv>
  </div>

  {/* Image Container: Reduced lg:pl-4 to lg:pl-0 to pull it closer to center */}
<div className="relative flex items-center justify-center lg:justify-end lg:pl-0">
  {/* Added max-h-md to constrain height and prevent it from being taller than the text block */}
  <div className="relative w-full max-w-xl lg:max-h-[450px]"> 
    <div
      className="absolute -inset-4 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(45,212,191,0.16),transparent_28%),radial-gradient(circle_at_80%_75%,rgba(251,191,36,0.14),transparent_26%)] blur-2xl dark:bg-[radial-gradient(circle_at_30%_20%,rgba(45,212,191,0.12),transparent_28%),radial-gradient(circle_at_80%_75%,rgba(251,191,36,0.08),transparent_26%)]"
      style={{ animation: "heroGlow 8s ease-in-out infinite" }}
    />
    
    {/* Use h-full and object-contain to ensure the image fits perfectly within the height limit */}
    <img
      src={HeroImg}
      alt="StackTrace dashboard preview"
      className="block h-full max-h-[400px] w-full rounded-[1.5rem] shadow-2xl shadow-black/5 object-contain lg:object-right"
    />
        </div>
      </div>
    </div>
        </section>

        <section id="features" className="bg-[#fbf8f0] py-20 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-black tracking-tight text-teal-900 dark:text-white">
                Powerful Features
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                Everything you need to track and improve skills efficiently.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="bg-white py-20 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight text-teal-900 dark:text-white sm:text-3xl">
                How It Works
              </h2>
            </div>

            <div className="relative mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div className="absolute left-8 right-8 top-8 hidden h-px bg-gradient-to-r from-teal-600 via-teal-700 to-teal-900 xl:block dark:from-teal-500/20 dark:via-teal-400 dark:to-teal-500/20" />
              {steps.map((step) => (
                <StepCard key={step.title} {...step} />
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-24">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${CTABanner})` }}
          />
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/78" />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-200/40 via-transparent to-amber-200/50 dark:from-teal-500/20 dark:via-transparent dark:to-amber-300/10" />

          <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black tracking-tight text-teal-900 dark:text-white sm:text-4xl">
              Start Your Growth Journey Today
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-700 dark:text-slate-300 sm:text-lg">
              Empower your team with insights and take skill development to the next level.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition hover:-translate-y-0.5 hover:bg-teal-900 dark:bg-teal-600 dark:hover:bg-teal-500"
              >
                <FaArrowRight className="text-xs" />
                Start Now
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-teal-700/30 bg-white/70 px-6 py-3 text-sm font-semibold text-teal-900 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="bg-teal-950 text-slate-200 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <img src={darkMode ? stackTraceDark : stackTraceLight} alt="StackTrace" className="mb-4 h-10 w-auto object-contain" />
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              StackTrace helps organizations track employee skills, monitor growth,
              and improve productivity with data-driven insights.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-white">
              Get In Touch
            </h3>
            {/* <span className="mt-2 block h-1 w-10 bg-amber-500" /> */}
            <div className="mt-4 space-y-2 text-sm text-slate-400">
              <p>Pune, Maharashtra, India</p>
              <p>support@StackTrace.com</p>
              <p>+91-9876543210</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-white">
              Follow Us
            </h3>
            {/* <span className="mt-2 block h-1 w-10 bg-gray-100" /> */}
            <div className="mt-4 flex gap-3">
              {socials.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gray-700 text-white transition hover:-translate-y-0.5 hover:bg-gray-600"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-white">
              Quick Links
            </h3>
            {/* <span className="mt-2 block h-1 w-10 bg-amber-500" /> */}
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li><a href="#home" className="transition hover:text-white">Home</a></li>
              <li><a href="#features" className="transition hover:text-white">Features</a></li>
              <li><a href="#how" className="transition hover:text-white">How It Works</a></li>
              <li><a href="#contact" className="transition hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-4 text-center text-sm text-slate-500">
          © 2026 <span className="font-semibold text-gray-400">StackTrace</span>. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="group rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_-22px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-white/5">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-900 text-2xl text-white shadow-lg shadow-teal-900/20 transition group-hover:scale-105 dark:bg-teal-600">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{desc}</p>
  </div>
);

const StepCard = ({ badge, title, desc }) => (
  <div className="relative rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center shadow-[0_10px_30px_-25px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/50">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-teal-700 bg-white text-sm font-black text-teal-800 shadow-sm dark:border-teal-400 dark:bg-slate-950 dark:text-teal-300">
      {badge}
    </div>
    <h3 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{desc}</p>
  </div>
);

export default Home;
