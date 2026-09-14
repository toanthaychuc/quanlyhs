import React, { useId } from 'react';
import './ThemeToggleIcon.css';

export function ThemeToggleIcon({ size = 15, duration = 400, isDark }) {
  const toggleId = useId();
  const clipMainId = `toggles-classic-main-${toggleId}`;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`classic-theme-toggle ${isDark ? 'is-dark' : ''}`}
      style={{ "--duration": `${duration}ms` }}
    >
      <defs>
        <clipPath id={clipMainId}>
          <path
            d="M0 0h25a1 1 0 0010 10v14H0Z"
            className="clip-path-path"
          />
        </clipPath>
      </defs>
      <g stroke="currentColor" strokeLinecap="round">
        <circle
          cx={12}
          cy={12}
          r={5}
          fill="currentColor"
          clipPath={`url(#${clipMainId})`}
          className="sun-core"
        />
        <path
          d="M12 1.4v2.4"
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeMiterlimit={0}
          paintOrder="stroke markers fill"
          className="sun-ray"
        />
        <path
          d="m20.3 3.7-2.5 2.5"
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeMiterlimit={0}
          paintOrder="stroke markers fill"
          className="sun-ray"
        />
        <path
          d="M22.6 12h-2.4"
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeMiterlimit={0}
          paintOrder="stroke markers fill"
          className="sun-ray"
        />
        <path
          d="M12 22.6v-2.4"
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeMiterlimit={0}
          paintOrder="stroke markers fill"
          className="sun-ray"
        />
        <path
          d="M1.4 12h2.4"
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeMiterlimit={0}
          paintOrder="stroke markers fill"
          className="sun-ray"
        />
        <path
          d="m20.3 20.3-2.5-2.5"
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeMiterlimit={0}
          paintOrder="stroke markers fill"
          className="sun-ray"
        />
        <path
          d="m3.7 20.3 2.5-2.5"
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeMiterlimit={0}
          paintOrder="stroke markers fill"
          className="sun-ray"
        />
        <path
          d="m3.7 3.7 2.5 2.5"
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeMiterlimit={0}
          paintOrder="stroke markers fill"
          className="sun-ray"
        />
      </g>
    </svg>
  );
}
