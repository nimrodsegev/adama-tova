"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./DebugScreen.module.css";

export default function DebugScreen() {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    innerWidth: 0,
    innerHeight: 0,
    devicePixelRatio: 1,
    screenWidth: 0,
    screenHeight: 0,
  });

  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: "0px",
    bottom: "0px",
    left: "0px",
    right: "0px",
  });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
      });

      // Get safe area insets
      const computedStyle = getComputedStyle(document.documentElement);
      setSafeAreaInsets({
        top: computedStyle.getPropertyValue("--sat") || getComputedStyle(document.documentElement).getPropertyValue("env(safe-area-inset-top)") || "0px",
        bottom: computedStyle.getPropertyValue("--sab") || "0px",
        left: computedStyle.getPropertyValue("--sal") || "0px",
        right: computedStyle.getPropertyValue("--sar") || "0px",
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div className={styles.container}>
      <Link href="/login" className={styles.backButton}>
        ← חזרה
      </Link>

      <h1 className={styles.title}>Debug Screen Sizes</h1>

      {/* Live dimensions */}
      <div className={styles.liveSection}>
        <h2>Live Dimensions:</h2>
        <p>clientWidth × clientHeight: <strong>{dimensions.width} × {dimensions.height}</strong></p>
        <p>innerWidth × innerHeight: <strong>{dimensions.innerWidth} × {dimensions.innerHeight}</strong></p>
        <p>screen.width × screen.height: <strong>{dimensions.screenWidth} × {dimensions.screenHeight}</strong></p>
        <p>devicePixelRatio: <strong>{dimensions.devicePixelRatio}</strong></p>
        <p>Physical pixels: <strong>{Math.round(dimensions.width * dimensions.devicePixelRatio)} × {Math.round(dimensions.height * dimensions.devicePixelRatio)}</strong></p>
      </div>

      {/* Safe area insets */}
      <div className={styles.liveSection}>
        <h2>Safe Area Insets:</h2>
        <p>Top: <strong className={styles.safeTop}></strong></p>
        <p>Bottom: <strong className={styles.safeBottom}></strong></p>
        <p>Left: <strong className={styles.safeLeft}></strong></p>
        <p>Right: <strong className={styles.safeRight}></strong></p>
      </div>

      {/* Width queries */}
      <div className={styles.section}>
        <h2>Width Queries (only matching shows green):</h2>

        {/* Very specific width ranges */}
        <div className={styles.queryRow}>
          <span className={styles.w320}>w = 320px (iPhone SE 1st)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.w360}>w = 360px</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.w375}>w = 375px (iPhone 6/7/8/SE2/X/12mini)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.w390}>w = 390px (iPhone 12/13/14)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.w393}>w = 393px (iPhone 14 Pro/15/15 Pro)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.w414}>w = 414px (iPhone 6+/7+/8+/XR/11)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.w428}>w = 428px (iPhone 12 Pro Max/13 Pro Max)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.w430}>w = 430px (iPhone 14 Plus/Pro Max/15 Plus/Pro Max)</span>
        </div>
      </div>

      {/* Height queries */}
      <div className={styles.section}>
        <h2>Height Queries:</h2>

        <div className={styles.queryRow}>
          <span className={styles.h568}>h = 568px (iPhone SE 1st)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.h667}>h = 667px (iPhone 6/7/8/SE2/SE3)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.h736}>h = 736px (iPhone 6+/7+/8+)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.h812}>h = 812px (iPhone X/XS/11 Pro/12 mini)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.h844}>h = 844px (iPhone 12/13/14)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.h852}>h = 852px (iPhone 14 Pro/15/15 Pro)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.h896}>h = 896px (iPhone XR/XS Max/11/11 Pro Max)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.h926}>h = 926px (iPhone 12 Pro Max/13 Pro Max/14 Plus)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.h932}>h = 932px (iPhone 14 Pro Max/15 Plus/15 Pro Max)</span>
        </div>
      </div>

      {/* Combined device queries */}
      <div className={styles.section}>
        <h2>Device Detection (width + height):</h2>

        <div className={styles.queryRow}>
          <span className={styles.iPhoneSE1}>iPhone SE 1st (320×568)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.iPhone678}>iPhone 6/7/8/SE2/SE3 (375×667)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.iPhone678Plus}>iPhone 6+/7+/8+ (414×736)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.iPhoneX}>iPhone X/XS/11 Pro (375×812)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.iPhone12mini}>iPhone 12 mini (375×812)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.iPhoneXR}>iPhone XR/11 (414×896)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.iPhone12}>iPhone 12/13/14 (390×844)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.iPhone14Pro}>iPhone 14 Pro/15/15 Pro (393×852)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.iPhone12ProMax}>iPhone 12/13 Pro Max (428×926)</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.iPhone14ProMax}>iPhone 14/15 Pro Max/Plus (430×932)</span>
        </div>
      </div>

      {/* Range queries */}
      <div className={styles.section}>
        <h2>Width Ranges:</h2>

        <div className={styles.queryRow}>
          <span className={styles.wLt350}>width &lt; 350px</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.w350to380}>350px ≤ width &lt; 380px</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.w380to400}>380px ≤ width &lt; 400px</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.w400to420}>400px ≤ width &lt; 420px</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.w420to440}>420px ≤ width &lt; 440px</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.wGt440}>width ≥ 440px</span>
        </div>
      </div>

      {/* Height ranges */}
      <div className={styles.section}>
        <h2>Height Ranges:</h2>

        <div className={styles.queryRow}>
          <span className={styles.hLt600}>height &lt; 600px</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.h600to700}>600px ≤ height &lt; 700px</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.h700to800}>700px ≤ height &lt; 800px</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.h800to850}>800px ≤ height &lt; 850px</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.h850to900}>850px ≤ height &lt; 900px</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.h900to950}>900px ≤ height &lt; 950px</span>
        </div>
        <div className={styles.queryRow}>
          <span className={styles.hGt950}>height ≥ 950px</span>
        </div>
      </div>

      {/* dvh vs vh test */}
      <div className={styles.section}>
        <h2>100vh vs 100dvh Test:</h2>
        <div className={styles.vhTest}>
          <div className={styles.vhBox}>100vh</div>
          <div className={styles.dvhBox}>100dvh</div>
        </div>
        <p className={styles.note}>If these are different heights, dvh accounts for browser UI</p>
      </div>
    </div>
  );
}
