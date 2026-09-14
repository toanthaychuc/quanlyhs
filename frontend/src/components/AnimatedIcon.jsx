import React, { useState } from 'react';
import { MorphIcon } from 'morphicons/react';

/**
 * AnimatedIcon wraps MorphIcon to animate between two states on hover.
 * 
 * @param {Object} defaultIcon - The Lucide icon data (from 'lucide', NOT 'lucide-react')
 * @param {Object} hoverIcon - The Lucide icon data to morph into on hover
 * @param {number} size - Size of the icon
 * @param {string} color - Color of the icon
 * @param {string} strokeWidth - Stroke width
 * @param {boolean} isHoveredExternal - Optionally control hover state from parent
 */
export default function AnimatedIcon({
  defaultIcon,
  hoverIcon,
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  isHoveredExternal,
  className = '',
  style = {}
}) {
  const [isHoveredInternal, setIsHoveredInternal] = useState(false);
  
  // Use external hover state if provided, otherwise use internal
  const isHovered = isHoveredExternal !== undefined ? isHoveredExternal : isHoveredInternal;
  
  // Only morph if a hover icon is provided
  const currentIcon = isHovered && hoverIcon ? hoverIcon : defaultIcon;

  return (
    <div
      onMouseEnter={() => setIsHoveredInternal(true)}
      onMouseLeave={() => setIsHoveredInternal(false)}
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      <MorphIcon
        icon={currentIcon}
        size={size}
        color={color}
        strokeWidth={strokeWidth}
      />
    </div>
  );
}
