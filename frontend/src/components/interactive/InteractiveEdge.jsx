import React, { useState, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

/**
 * InteractiveEdge:
 * Renders an invisible hit-cylinder around any 3D line segment to provide
 * effortless click/hover direct-manipulation on the 3D Canvas.
 */
export const InteractiveEdge = ({
  edge,
  vertices,
  isInteractive,
  isSelected,
  onClick
}) => {
  const [hovered, setHovered] = useState(false);
  const downPosRef = useRef({ x: 0, y: 0 });
  const [u, v] = edge;
  const p1 = vertices[u];
  const p2 = vertices[v];

  const cylinderData = useMemo(() => {
    if (!p1 || !p2) return null;
    const v1 = new THREE.Vector3(p1.x, p1.y, p1.z);
    const v2 = new THREE.Vector3(p2.x, p2.y, p2.z);
    const length = v1.distanceTo(v2);
    if (length < 1e-4) return null;

    const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(v2, v1).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return { mid, length, quat, v1, v2 };
  }, [p1, p2]);

  if (!cylinderData) return null;
  const { mid, length, quat, v1, v2 } = cylinderData;

  const handlePointerDown = (e) => {
    if (!isInteractive) return;
    e.stopPropagation();
    downPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e) => {
    if (!isInteractive) return;
    e.stopPropagation();
    const dx = e.clientX - downPosRef.current.x;
    const dy = e.clientY - downPosRef.current.y;
    // Only trigger click if mouse didn't drag to rotate camera
    if (Math.hypot(dx, dy) <= 6) {
      if (onClick) onClick(edge);
    }
  };

  const handlePointerOver = (e) => {
    if (!isInteractive) return;
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    if (!isInteractive) return;
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <group>
      {/* Invisible hit cylinder for easy mouse/touch selection */}
      {isInteractive && (
        <mesh
          position={[mid.x, mid.y, mid.z]}
          quaternion={quat}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <cylinderGeometry args={[0.18, 0.18, length, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {/* Luminous glow highlight when hovered or selected */}
      {(hovered || isSelected) && (
        <Line
          points={[[v1.x, v1.y, v1.z], [v2.x, v2.y, v2.z]]}
          color={isSelected ? '#f59e0b' : '#38bdf8'}
          lineWidth={isSelected ? 6 : 4}
          transparent
          opacity={isSelected ? 0.95 : 0.8}
          depthTest={false}
          renderOrder={15}
        />
      )}
    </group>
  );
};
