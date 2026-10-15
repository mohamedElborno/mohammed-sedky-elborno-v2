"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogoLoader } from "@/components/LogoLoader";

const SEEN_KEY = "splash-seen";
/** Never keep the screen up longer than this, even if the page is slow. */
const MAX_WAIT_MS = 2500;

// Read once, before the flag is written, so the answer does not flip while the
// splash is on screen. The server always assumes a first visit.
let seenBefore: boolean | null = null;
const readSeenBefore = () => {
  if (seenBefore === null) {
    try {
      seenBefore = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seenBefore = false;
    }
  }
  return seenBefore;
};
const subscribeToNothing = () => () => {};

// Shown once per browser session: the logo is revealed, then the screen fades
// out as soon as both the reveal and the page load have finished.
export function SplashScreen() {
  const seen = useSyncExternalStore(
    subscribeToNothing,
    readSeenBefore,
    () => false,
  );
  const [finished, setFinished] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Storage can be blocked; the splash then simply shows every visit.
    }

    const markLoaded = () => setLoaded(true);
    if (document.readyState === "complete") {
      markLoaded();
    } else {
      window.addEventListener("load", markLoaded, { once: true });
    }
    const timeout = window.setTimeout(() => setFinished(true), MAX_WAIT_MS);

    return () => {
      window.removeEventListener("load", markLoaded);
      window.clearTimeout(timeout);
    };
  }, []);

  const onRevealed = useCallback(() => setRevealed(true), []);

  useEffect(() => {
    if (!revealed || !loaded) return;
    const hold = window.setTimeout(() => setFinished(true), 350);
    return () => window.clearTimeout(hold);
  }, [revealed, loaded]);

  return (
    <AnimatePresence>
      {!seen && !finished && (
        <motion.div
          key="splash"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="splash-failsafe fixed inset-0 z-[100] flex items-center justify-center bg-background"
        >
          <LogoLoader className="w-56 sm:w-72" duration={1.6} onDone={onRevealed} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
