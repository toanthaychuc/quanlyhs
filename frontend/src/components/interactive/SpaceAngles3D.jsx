import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  Play,
  Pause,
  BookOpen,
  Compass,
  Eye,
  EyeOff
} from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './SpaceAngles3D.css';

// LaTeX math formula renderer using KaTeX
const MathLatex = ({ math, display = false }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, { throwOnError: false, displayMode: display });
    } catch {
      return math;
    }
  }, [math, display]);

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

// ==========================================
// 1. REUSABLE 3D SCENE HELPERS
// ==========================================

// Right-angle marker in 3D
const RightAngleMarker = ({ vertex, p1, p2, size = 0.35, color = '#ef4444' }) => {
  if (!vertex || !p1 || !p2) return null;
  const d1 = new THREE.Vector3().subVectors(p1, vertex);
  const d2 = new THREE.Vector3().subVectors(p2, vertex);
  if (d1.lengthSq() < 0.0001 || d2.lengthSq() < 0.0001) return null;
  d1.normalize();
  d2.normalize();
  const pt1 = new THREE.Vector3().copy(vertex).addScaledVector(d1, size);
  const pt2 = new THREE.Vector3().copy(pt1).addScaledVector(d2, size);
  const pt3 = new THREE.Vector3().copy(vertex).addScaledVector(d2, size);

  return (
    <group>
      <Line points={[pt1, pt2, pt3]} color={color} lineWidth={2.2} />
    </group>
  );
};

// 3D Angle Arc with Translucent Fan Sector & Real-time Degree Label
const AngleArc3D = ({
  center,
  p1,
  p2,
  radius = 0.85,
  color = '#f59e0b',
  label = '',
  showSector = true,
  customAngle
}) => {
  const { arcPoints, sectorGeo, midPos, angleDeg } = useMemo(() => {
    if (!center || !p1 || !p2) {
      return { arcPoints: [], sectorGeo: null, midPos: null, angleDeg: 0 };
    }

    const v1 = new THREE.Vector3().subVectors(p1, center);
    const v2 = new THREE.Vector3().subVectors(p2, center);
    if (v1.lengthSq() < 0.0001 || v2.lengthSq() < 0.0001) {
      return { arcPoints: [], sectorGeo: null, midPos: null, angleDeg: 0 };
    }
    v1.normalize();
    v2.normalize();

    let angleRad = v1.angleTo(v2);
    if (isNaN(angleRad) || angleRad < 0.01) {
      return { arcPoints: [], sectorGeo: null, midPos: null, angleDeg: 0 };
    }

    let normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
    if (normal.lengthSq() < 0.001) {
      // Pick arbitrary orthogonal vector
      normal = Math.abs(v1.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
      normal.crossVectors(v1, normal).normalize();
    }

    const inPlaneOrtho = new THREE.Vector3().crossVectors(normal, v1).normalize();

    const segments = 32;
    const pts = [];
    const vertices = [center.x, center.y, center.z];

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * angleRad;
      const pt = new THREE.Vector3()
        .copy(center)
        .addScaledVector(v1, Math.cos(t) * radius)
        .addScaledVector(inPlaneOrtho, Math.sin(t) * radius);
      pts.push(pt);
      vertices.push(pt.x, pt.y, pt.z);
    }

    // Build triangle fan for sector
    const indices = [];
    for (let i = 1; i <= segments; i++) {
      indices.push(0, i, i + 1);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const midT = angleRad / 2;
    const midPoint = new THREE.Vector3()
      .copy(center)
      .addScaledVector(v1, Math.cos(midT) * (radius + 0.35))
      .addScaledVector(inPlaneOrtho, Math.sin(midT) * (radius + 0.35));

    const deg = (angleRad * 180) / Math.PI;

    return {
      arcPoints: pts,
      sectorGeo: geo,
      midPos: midPoint,
      angleDeg: deg
    };
  }, [center, p1, p2, radius]);

  if (!arcPoints || arcPoints.length < 2) return null;

  return (
    <group>
      {/* Curved Arc Line */}
      <Line points={arcPoints} color={color} lineWidth={2.8} />

      {/* Shaded Translucent Fan Area */}
      {showSector && sectorGeo && (
        <mesh geometry={sectorGeo}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Degree Badge Label */}
      {midPos && (
        <Html position={[midPos.x, midPos.y, midPos.z]} center zIndexRange={[100, 0]}>
          <div className="angle-label-3d">
            {label ? `${label}: ` : ''}
            {(customAngle !== undefined ? customAngle : angleDeg).toFixed(1)}°
          </div>
        </Html>
      )}
    </group>
  );
};

// 3D Labeled Vertex Sphere
const VertexNode = ({ pos, label, color = '#2563eb', radius = 0.07 }) => {
  if (!pos) return null;
  return (
    <group position={[pos.x, pos.y, pos.z]}>
      <mesh>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      {label && (
        <Html position={[0, 0, 0]} center zIndexRange={[100, 0]}>
          <div className="point-label-3d">{label}</div>
        </Html>
      )}
    </group>
  );
};

// Translucent Plane Plate
const PlaneSurface = ({ corners, color = '#3b82f6', opacity = 0.18, border = true }) => {
  const geo = useMemo(() => {
    if (!corners || corners.length < 3) return null;
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    corners.forEach(c => vertices.push(c.x, c.y, c.z));

    let indices = [];
    if (corners.length === 4) {
      indices = [0, 1, 2, 0, 2, 3];
    } else if (corners.length === 3) {
      indices = [0, 1, 2];
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }, [corners]);

  const borderPts = useMemo(() => {
    if (!corners || corners.length < 3) return [];
    return [...corners, corners[0]];
  }, [corners]);

  if (!geo) return null;

  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {border && borderPts.length > 0 && (
        <Line points={borderPts} color={color} lineWidth={1.5} transparent opacity={0.6} />
      )}
    </group>
  );
};

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

const SpaceAngles3D = () => {
  // Active Topic: 'lines' | 'line_plane' | 'planes' | 'dihedral'
  const [activeTopic, setActiveTopic] = useState('lines');
  // Sub-mode: 'concept' (Dynamic 3D model) | 'problem' (Polyhedron textbook example)
  const [subMode, setSubMode] = useState('concept');

  // Camera & view controls
  const controlsRef = useRef(null);
  const [showPlane, setShowPlane] = useState(true);
  const [showArc, setShowArc] = useState(true);

  // --- TOPIC 1: TWO LINES (Tịnh tiến hai đường thẳng) ---
  const [twoLinesAngleDeg, setTwoLinesAngleDeg] = useState(60); // Góc giữa 2 đường thẳng: 0..180 deg
  const [translateT, setTranslateT] = useState(0); // 0 (original skew) -> 1 (translated to common point O)
  const [isTranslating, setIsTranslating] = useState(false);
  const isLineTranslated = Math.round(translateT * 100) >= 100;

  // --- TOPIC 2: LINE & PLANE (Đường thẳng và mặt phẳng) ---
  const [lineAngleDeg, setLineAngleDeg] = useState(40); // Góc nghiêng d: 0..180 deg
  const [projectionProgress, setProjectionProgress] = useState(0); // Mặc định 0%
  const [isProjecting, setIsProjecting] = useState(false);
  const [pointMPosRatio, setPointMPosRatio] = useState(0.8); // Vị trí điểm M trên tia d
  const isLinePlaneProjected = Math.round(projectionProgress * 100) >= 100;

  // --- TOPIC 3: TWO PLANES (Góc giữa hai mặt phẳng) ---
  const [planesAngleDeg, setPlanesAngleDeg] = useState(55); // Góc giữa 2 mặt: 0..180 deg
  const [showPerpSlice, setShowPerpSlice] = useState(true);

  // --- TOPIC 4: DIHEDRAL ANGLE (Góc nhị diện) ---
  const [dihedralAngleDeg, setDihedralAngleDeg] = useState(60); // 0..180 deg
  const [isDihedralPlaying, setIsDihedralPlaying] = useState(false);

  const handleSelectTopic = (topic) => {
    setActiveTopic(topic);
    if (topic === 'lines') {
      setTranslateT(0);
      setIsTranslating(false);
    }
    if (topic === 'line_plane') {
      setProjectionProgress(0);
      setIsProjecting(false);
    }
  };

  const handleSelectSubMode = (mode) => {
    setSubMode(mode);
  };

  // Handle translation animation loop
  useEffect(() => {
    let animId;
    if (isTranslating) {
      animId = setInterval(() => {
        setTranslateT(prev => {
          if (prev >= 1) {
            setIsTranslating(false);
            return 1;
          }
          return Math.min(1, prev + 0.04);
        });
      }, 30);
    }
    return () => clearInterval(animId);
  }, [isTranslating]);

  // Handle projection drop animation loop
  useEffect(() => {
    let animId;
    if (isProjecting) {
      animId = setInterval(() => {
        setProjectionProgress(prev => {
          if (prev >= 1) {
            setIsProjecting(false);
            return 1;
          }
          return Math.min(1, prev + 0.04);
        });
      }, 30);
    }
    return () => clearInterval(animId);
  }, [isProjecting]);

  // Handle dihedral auto-open animation
  useEffect(() => {
    let animId;
    let stepDir = 1;
    if (isDihedralPlaying) {
      animId = setInterval(() => {
        setDihedralAngleDeg(prev => {
          if (prev >= 150) stepDir = -1;
          if (prev <= 30) stepDir = 1;
          return prev + stepDir * 1.5;
        });
      }, 30);
    }
    return () => clearInterval(animId);
  }, [isDihedralPlaying]);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(5.5, 4.5, 6.5);
      controlsRef.current.target.set(0, 0.5, 0);
      controlsRef.current.update();
    }
  };

  // ==========================================
  // TOPIC 1 DATA: TWO LINES (ĐƯỜNG - ĐƯỜNG)
  // ==========================================
  // Concept: Line a fixed in space, line b skew, translating towards O on line a
  const lineConceptData = useMemo(() => {
    // Line a passes through O(0, 0, 0) along direction uA
    const O = new THREE.Vector3(0, 0, 0);
    const uA = new THREE.Vector3(1, 0, 0.5).normalize();
    const ptA1 = new THREE.Vector3().copy(O).addScaledVector(uA, -3.2);
    const ptA2 = new THREE.Vector3().copy(O).addScaledVector(uA, 3.2);

    // Line b direction uB (rotated by twoLinesAngleDeg relative to uA around Y axis)
    const rad = (twoLinesAngleDeg * Math.PI) / 180;
    const uB = new THREE.Vector3().copy(uA).applyAxisAngle(new THREE.Vector3(0, 1, 0), rad).normalize();

    // Original position of line b (skew, shifted up and back in 3D space)
    const origCenterB = new THREE.Vector3(-0.5, 2.2, 1.8);
    const ptB1_orig = new THREE.Vector3().copy(origCenterB).addScaledVector(uB, -2.8);
    const ptB2_orig = new THREE.Vector3().copy(origCenterB).addScaledVector(uB, 2.8);

    // Target position of line b passing through common point O
    const ptB1_target = new THREE.Vector3().copy(O).addScaledVector(uB, -2.8);
    const ptB2_target = new THREE.Vector3().copy(O).addScaledVector(uB, 2.8);

    // Interpolate according to translateT
    const curPtB1 = new THREE.Vector3().lerpVectors(ptB1_orig, ptB1_target, translateT);
    const curPtB2 = new THREE.Vector3().lerpVectors(ptB2_orig, ptB2_target, translateT);
    const curCenterB = new THREE.Vector3().lerpVectors(origCenterB, O, translateT);

    // Shift vector track lines
    const trackP1 = [ptB1_orig, ptB1_target];
    const trackP2 = [ptB2_orig, ptB2_target];
    const trackCenter = [origCenterB, O];

    // Mathematical acute angle between two lines in space: in [0, 90]
    const actualAngleDeg = Math.min(twoLinesAngleDeg, 180 - twoLinesAngleDeg);

    // For angle arc: if angle > 90 deg, use -uA (ptA1) so arc is drawn in the acute angle wedge
    const ptArcA = twoLinesAngleDeg <= 90 ? ptA2 : ptA1;

    return {
      O,
      ptA1,
      ptA2,
      uA,
      uB,
      ptB1_orig,
      ptB2_orig,
      curPtB1,
      curPtB2,
      curCenterB,
      ptB1_target,
      ptB2_target,
      trackP1,
      trackP2,
      trackCenter,
      ptArcA,
      tiltDeg: twoLinesAngleDeg,
      angleDeg: actualAngleDeg
    };
  }, [twoLinesAngleDeg, translateT]);

  // Problem 1: Pyramid S.ABCD, SA perp (ABCD), square base. Find angle between SC and AB
  const lineProblemData = useMemo(() => {
    // S.ABCD vertices
    const A = new THREE.Vector3(-1.4, -0.8, -1.4);
    const B = new THREE.Vector3(1.4, -0.8, -1.4);
    const C = new THREE.Vector3(1.4, -0.8, 1.4);
    const D = new THREE.Vector3(-1.4, -0.8, 1.4);
    const S = new THREE.Vector3(-1.4, 2.4, -1.4); // SA perp (ABCD)

    // Parallel translation of AB to CD: t in [0, 1]
    const curTransB1 = new THREE.Vector3().lerpVectors(A, D, translateT);
    const curTransB2 = new THREE.Vector3().lerpVectors(B, C, translateT);

    // Polyhedron edges
    const edges = [
      [A, B], [B, C], [C, D], [D, A], // Base
      [S, A], [S, B], [S, C], [S, D]  // Lateral
    ];

    return {
      A, B, C, D, S,
      edges,
      curTransB1,
      curTransB2,
      angleDeg: 54.7 // arctan(sqrt(2)) = 54.74 deg
    };
  }, [translateT]);

  // ==========================================
  // TOPIC 2 DATA: LINE & PLANE (ĐƯỜNG - MẶT)
  // ==========================================
  const linePlaneConceptData = useMemo(() => {
    const O = new THREE.Vector3(0, 0, 0); // Intersection point
    const angleRad = (lineAngleDeg * Math.PI) / 180; // 0..180 deg tilt
    const azimuthRad = (25 * Math.PI) / 180; // Azimuth for nice 3D perspective

    // Direction of line d with exact elevation angleRad above Oxy plane
    const dir = new THREE.Vector3(
      Math.cos(angleRad) * Math.cos(azimuthRad),
      Math.sin(angleRad),
      Math.cos(angleRad) * Math.sin(azimuthRad)
    ).normalize();

    const dStart = new THREE.Vector3().copy(O).addScaledVector(dir, -1.8);
    const dEnd = new THREE.Vector3().copy(O).addScaledVector(dir, 4.0);

    // Selected point M on line d
    const M_dist = 1.2 + pointMPosRatio * 2.2;
    const M = new THREE.Vector3().copy(O).addScaledVector(dir, M_dist);

    // Projection H on plane y = 0
    const H = new THREE.Vector3(M.x, 0, M.z);

    // Animated drop point
    const dropPt = new THREE.Vector3().lerpVectors(M, H, projectionProgress);

    // Plane plate corners
    const planeCorners = [
      new THREE.Vector3(-3.5, 0, -3.0),
      new THREE.Vector3(4.2, 0, -3.0),
      new THREE.Vector3(4.2, 0, 3.0),
      new THREE.Vector3(-3.5, 0, 3.0)
    ];

    // Mathematical angle between line d and plane (P): always in [0, 90]
    const actualAngleDeg = Math.min(lineAngleDeg, 180 - lineAngleDeg);

    // Perpendicular case: d perp (P) when lineAngleDeg === 90
    const isPerpendicular = lineAngleDeg === 90;

    // Projection line d' on plane (passes through O and H, or along azimuth if perpendicular)
    const distOH = H.distanceTo(O);
    let dPrimeDir;
    if (distOH > 0.001) {
      dPrimeDir = new THREE.Vector3(H.x, 0, H.z).normalize();
    } else {
      dPrimeDir = new THREE.Vector3(Math.cos(azimuthRad), 0, Math.sin(azimuthRad)).normalize();
    }
    const dPrimeEnd = new THREE.Vector3().copy(O).addScaledVector(dPrimeDir, 4.0);

    return {
      O,
      M,
      H,
      dropPt,
      dStart,
      dEnd,
      dPrimeEnd,
      planeCorners,
      isPerpendicular,
      distOH,
      tiltDeg: lineAngleDeg,
      angleDeg: actualAngleDeg
    };
  }, [lineAngleDeg, pointMPosRatio, projectionProgress]);

  // Problem 2: S.ABCD square base, SA perp base, find angle between SC and (ABCD)
  const linePlaneProblemData = useMemo(() => {
    const A = new THREE.Vector3(-1.4, -0.6, -1.4);
    const B = new THREE.Vector3(1.4, -0.6, -1.4);
    const C = new THREE.Vector3(1.4, -0.6, 1.4);
    const D = new THREE.Vector3(-1.4, -0.6, 1.4);
    const S = new THREE.Vector3(-1.4, 2.6, -1.4); // SA perp (ABCD)

    // Base plane corners
    const baseCorners = [A, B, C, D];

    // Edges
    const edges = [
      [A, B], [B, C], [C, D], [D, A],
      [S, A], [S, B], [S, C], [S, D],
      [A, C], [B, D] // Diagonals
    ];

    return {
      A, B, C, D, S,
      baseCorners,
      edges,
      angleDeg: 42.5 // tan = 3.2 / (2.8*sqrt(2)) -> ~42.5 deg
    };
  }, []);

  // ==========================================
  // TOPIC 3 DATA: TWO PLANES (HAI MẶT PHẲNG)
  // ==========================================
  const planesConceptData = useMemo(() => {
    // Intersection line along Z axis: x=0, y=0
    const edgeStart = new THREE.Vector3(0, 0, -2.8);
    const edgeEnd = new THREE.Vector3(0, 0, 2.8);

    // Point I on intersection line
    const I = new THREE.Vector3(0, 0, 0);

    // Plane (P): Horizontal plate along Oxy (y = 0)
    const pCorners = [
      new THREE.Vector3(-3.2, 0, -2.8),
      new THREE.Vector3(3.2, 0, -2.8),
      new THREE.Vector3(3.2, 0, 2.8),
      new THREE.Vector3(-3.2, 0, 2.8)
    ];

    // Plane (Q): Tilted around line c at angle planesAngleDeg (0..180 deg)
    const qAngle = (planesAngleDeg * Math.PI) / 180;
    const qCorners = [
      new THREE.Vector3(-1.0 * Math.cos(qAngle), -1.0 * Math.sin(qAngle), -2.8),
      new THREE.Vector3(3.2 * Math.cos(qAngle), 3.2 * Math.sin(qAngle), -2.8),
      new THREE.Vector3(3.2 * Math.cos(qAngle), 3.2 * Math.sin(qAngle), 2.8),
      new THREE.Vector3(-1.0 * Math.cos(qAngle), -1.0 * Math.sin(qAngle), 2.8)
    ];

    // Line b in (Q) perpendicular to c at I
    const ptB = new THREE.Vector3(2.4 * Math.cos(qAngle), 2.4 * Math.sin(qAngle), 0);

    // Line a in (P) perpendicular to c at I (along X axis)
    // If planesAngleDeg <= 90 deg, acute angle is with +X
    // If planesAngleDeg > 90 deg, acute angle is with -X
    const ptA_pos = new THREE.Vector3(2.4, 0, 0);
    const ptA_neg = new THREE.Vector3(-2.4, 0, 0);
    const ptA_acute = planesAngleDeg <= 90 ? ptA_pos : ptA_neg;

    // Transverse slice plane (R) perp to c at I (x, y plane at z=0)
    const sliceCorners = [
      new THREE.Vector3(-3.0, -0.6, 0),
      new THREE.Vector3(3.0, -0.6, 0),
      new THREE.Vector3(3.0, 3.4, 0),
      new THREE.Vector3(-3.0, 3.4, 0)
    ];

    // Mathematical acute angle between two planes: in [0, 90]
    const actualAngleDeg = Math.min(planesAngleDeg, 180 - planesAngleDeg);

    return {
      edgeStart,
      edgeEnd,
      I,
      pCorners,
      qCorners,
      ptA: ptA_acute,
      ptA_pos,
      ptA_neg,
      ptB,
      sliceCorners,
      tiltDeg: planesAngleDeg,
      angleDeg: actualAngleDeg
    };
  }, [planesAngleDeg]);

  // Problem 3: S.ABCD square base, angle between (SCD) and (ABCD)
  const planesProblemData = useMemo(() => {
    const A = new THREE.Vector3(-1.4, -0.6, -1.4);
    const B = new THREE.Vector3(1.4, -0.6, -1.4);
    const C = new THREE.Vector3(1.4, -0.6, 1.4);
    const D = new THREE.Vector3(-1.4, -0.6, 1.4);
    const S = new THREE.Vector3(-1.4, 2.2, -1.4); // SA perp (ABCD), SA = AD = 2.8

    const edges = [
      [A, B], [B, C], [C, D], [D, A],
      [S, A], [S, B], [S, C], [S, D]
    ];

    return {
      A, B, C, D, S,
      edges,
      angleDeg: 45.0 // SA = AD -> triangle SAD right isosceles at A -> 45 deg
    };
  }, []);

  // ==========================================
  // TOPIC 4 DATA: DIHEDRAL ANGLE (GÓC NHỊ DIỆN)
  // ==========================================
  const dihedralConceptData = useMemo(() => {
    // Common edge along Z axis
    const edgeStart = new THREE.Vector3(0, 0, -2.6);
    const edgeEnd = new THREE.Vector3(0, 0, 2.6);
    const I = new THREE.Vector3(0, 0, 0);

    // Base half-plane (alpha): in plane y = 0, along -X
    const alphaCorners = [
      new THREE.Vector3(-3.2, 0, -2.6),
      new THREE.Vector3(0, 0, -2.6),
      new THREE.Vector3(0, 0, 2.6),
      new THREE.Vector3(-3.2, 0, 2.6)
    ];
    const ptIx = new THREE.Vector3(-2.4, 0, 0);

    // Rotating half-plane (beta) at angle dihedralAngleDeg
    const rad = (dihedralAngleDeg * Math.PI) / 180;
    // Rotate vector (-1, 0, 0) by rad around Z axis clockwise/counter-clockwise
    // When rad = 0: coincides with alpha (-X)
    // When rad = 90 deg: points up +Y
    // When rad = 180 deg: points +X
    const dirBeta = new THREE.Vector3(-Math.cos(rad), Math.sin(rad), 0);

    const betaCorners = [
      new THREE.Vector3(0, 0, -2.6),
      new THREE.Vector3(dirBeta.x * 3.2, dirBeta.y * 3.2, -2.6),
      new THREE.Vector3(dirBeta.x * 3.2, dirBeta.y * 3.2, 2.6),
      new THREE.Vector3(0, 0, 2.6)
    ];
    const ptIy = new THREE.Vector3(dirBeta.x * 2.4, dirBeta.y * 2.4, 0);

    // Plane angle between the two half-planes
    const planeAngleDeg = Math.min(dihedralAngleDeg, 180 - dihedralAngleDeg);

    return {
      edgeStart,
      edgeEnd,
      I,
      alphaCorners,
      betaCorners,
      ptIx,
      ptIy,
      dihedralDeg: dihedralAngleDeg,
      planeAngleDeg
    };
  }, [dihedralAngleDeg]);

  return (
    <div className="space-angles-container">
      {/* ======================================================== */}
      {/* SIDEBAR: CONTROLS, EXPLANATION, SLIDERS & QUIZ           */}
      {/* ======================================================== */}
      <div className="space-angles-sidebar">
        {/* 1. TOPIC SELECTOR TABS */}
        <div className="topic-tabs">
          <button
            className={`topic-tab-btn ${activeTopic === 'lines' ? 'active' : ''}`}
            onClick={() => handleSelectTopic('lines')}
          >
            <span>Đường & Đường</span>
          </button>
          <button
            className={`topic-tab-btn ${activeTopic === 'line_plane' ? 'active' : ''}`}
            onClick={() => handleSelectTopic('line_plane')}
          >
            <span>Đường & Mặt</span>
          </button>
          <button
            className={`topic-tab-btn ${activeTopic === 'planes' ? 'active' : ''}`}
            onClick={() => handleSelectTopic('planes')}
          >
            <span>Hai Mặt Phẳng</span>
          </button>
          <button
            className={`topic-tab-btn ${activeTopic === 'dihedral' ? 'active' : ''}`}
            onClick={() => handleSelectTopic('dihedral')}
          >
            <span>Góc Nhị Diện</span>
          </button>
        </div>

        {/* 2. SUB-MODE: CONCEPT STUDIO vs POLYHEDRON PROBLEMS */}
        <div className="submode-selector">
          <button
            className={`submode-btn ${subMode === 'concept' ? 'active' : ''}`}
            onClick={() => handleSelectSubMode('concept')}
          >
            <span>Mô hình Động (Studio)</span>
          </button>
          <button
            className={`submode-btn ${subMode === 'problem' ? 'active' : ''}`}
            onClick={() => handleSelectSubMode('problem')}
          >
            <span>Bài toán Chóp & Lập phương</span>
          </button>
        </div>

        {/* 3. DYNAMIC CONTROLS PER TOPIC */}
        <div className="feature-card">
          <div className="card-title">
            <span>⚙️ Thao tác Trực quan Tương tác</span>
          </div>

          {/* TOPIC 1: TWO LINES CONTROLS */}
          {activeTopic === 'lines' && (
            <div className="step-wizard">
              {subMode === 'concept' ? (
                <>
                  <div className="step-content-box">
                    <span className="step-badge">Phương pháp tịnh tiến</span>
                    <p style={{ margin: 0 }}>
                      Kéo thanh trượt để <strong>tịnh tiến đường thẳng b</strong> song song trượt về điểm chung <strong>O</strong> trên đường thẳng a.
                    </p>
                  </div>
                  <div className="slider-control">
                    <div className="slider-label-row">
                      <span>Góc giữa hai đường thẳng:</span>
                      <span className="slider-value">
                        {twoLinesAngleDeg}°{twoLinesAngleDeg > 90 ? ` (Góc: ${180 - twoLinesAngleDeg}°)` : ''}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      step="1"
                      value={twoLinesAngleDeg}
                      onChange={e => setTwoLinesAngleDeg(parseInt(e.target.value, 10))}
                      className="styled-range"
                    />
                  </div>
                  <div className="slider-control">
                    <div className="slider-label-row">
                      <span>Tiến trình tịnh tiến (b → b'):</span>
                      <span className="slider-value">{Math.round(translateT * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={translateT}
                      onChange={e => setTranslateT(parseFloat(e.target.value))}
                      className="styled-range"
                    />
                  </div>
                  <div className="step-nav-buttons">
                    <button
                      className="step-btn primary"
                      onClick={() => setIsTranslating(!isTranslating)}
                    >
                      {isTranslating ? <Pause size={15} /> : <Play size={15} />}
                      <span>{isTranslating ? 'Tạm dừng' : 'Tự động tịnh tiến'}</span>
                    </button>
                    <button
                      className="step-btn"
                      onClick={() => { setTranslateT(0); setIsTranslating(false); }}
                    >
                      <RotateCcw size={15} />
                      <span>Ban đầu</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="step-content-box">
                    <span className="step-badge">Bài toán hình chóp S.ABCD</span>
                    <p style={{ margin: 0 }}>
                      Cho hình chóp <strong>S.ABCD</strong> đáy vuông, SA ⊥ đáy. Xác định góc giữa <strong>SC</strong> và <strong>AB</strong>.
                    </p>
                    <p style={{ margin: '6px 0 0 0', color: '#0369a1', fontWeight: 600 }}>
                      ➜ Vì AB // CD nên ta tịnh tiến AB sang CD. Góc trở thành góc SCD.
                    </p>
                  </div>
                  <div className="slider-control">
                    <div className="slider-label-row">
                      <span>Tịnh tiến AB → CD:</span>
                      <span className="slider-value">{Math.round(translateT * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={translateT}
                      onChange={e => setTranslateT(parseFloat(e.target.value))}
                      className="styled-range"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* TOPIC 2: LINE & PLANE CONTROLS */}
          {activeTopic === 'line_plane' && (
            <div className="step-wizard">
              {subMode === 'concept' ? (
                <>
                  <div className="step-content-box">
                    <span className="step-badge">Hạ hình chiếu vuông góc</span>
                    <p style={{ margin: 0 }}>
                      Góc giữa đường thẳng d và mặt phẳng (P) là góc giữa d và <strong>hình chiếu vuông góc d'</strong> của nó trên (P).
                    </p>
                  </div>
                  <div className="slider-control">
                    <div className="slider-label-row">
                      <span>Độ nghiêng đường thẳng d:</span>
                      <span className="slider-value">
                        {lineAngleDeg}°{lineAngleDeg > 90 ? ` (Góc: ${180 - lineAngleDeg}°)` : ''}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      step="1"
                      value={lineAngleDeg}
                      onChange={e => setLineAngleDeg(parseInt(e.target.value, 10))}
                      className="styled-range"
                    />
                  </div>
                  <div className="slider-control">
                    <div className="slider-label-row">
                      <span>Vị trí điểm M trên đường thẳng:</span>
                      <span className="slider-value">{Math.round(pointMPosRatio * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={pointMPosRatio}
                      onChange={e => setPointMPosRatio(parseFloat(e.target.value))}
                      className="styled-range"
                    />
                  </div>
                  <div className="slider-control">
                    <div className="slider-label-row">
                      <span>Hạ tia chiếu vuông góc MH ⊥ (P):</span>
                      <span className="slider-value">{Math.round(projectionProgress * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={projectionProgress}
                      onChange={e => setProjectionProgress(parseFloat(e.target.value))}
                      className="styled-range"
                    />
                  </div>
                  <div className="step-nav-buttons">
                    <button
                      className="step-btn primary"
                      onClick={() => setIsProjecting(!isProjecting)}
                    >
                      {isProjecting ? <Pause size={15} /> : <Play size={15} />}
                      <span>{isProjecting ? 'Tạm dừng' : 'Tự động hạ chiếu'}</span>
                    </button>
                    <button
                      className="step-btn"
                      onClick={() => { setProjectionProgress(0); setIsProjecting(false); }}
                    >
                      <RotateCcw size={15} />
                      <span>Về 0%</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="step-content-box">
                  <span className="step-badge">Bài toán hình chóp S.ABCD</span>
                  <p style={{ margin: 0 }}>
                    Xác định góc giữa cạnh bên <strong>SC</strong> và mặt phẳng đáy <strong>(ABCD)</strong>.
                  </p>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', fontSize: '0.82rem' }}>
                    <li>SC cắt đáy tại <strong>C</strong> (đỉnh của góc).</li>
                    <li>SA ⊥ (ABCD) nên <strong>A là hình chiếu của S</strong> lên đáy.</li>
                    <li>➜ <strong>AC</strong> là hình chiếu của SC lên (ABCD).</li>
                    <li>➜ Góc cần tìm là góc <strong>SCA</strong>.</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TOPIC 3: TWO PLANES CONTROLS */}
          {activeTopic === 'planes' && (
            <div className="step-wizard">
              {subMode === 'concept' ? (
                <>
                  <div className="step-content-box">
                    <span className="step-badge">Kẻ cùng vuông góc giao tuyến</span>
                    <p style={{ margin: 0 }}>
                      1. Giao tuyến là đường <strong>c</strong>.<br />
                      2. Lấy I ∈ c: trong (P) kẻ a ⊥ c, trong (Q) kẻ b ⊥ c.<br />
                      3. Góc giữa (P) và (Q) chính là <strong>góc (a, b)</strong>.
                    </p>
                  </div>
                  <div className="slider-control">
                    <div className="slider-label-row">
                      <span>Góc giữa hai mặt phẳng:</span>
                      <span className="slider-value">
                        {planesAngleDeg}°{planesAngleDeg > 90 ? ` (Góc: ${180 - planesAngleDeg}°)` : ''}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      step="1"
                      value={planesAngleDeg}
                      onChange={e => setPlanesAngleDeg(parseInt(e.target.value, 10))}
                      className="styled-range"
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Mặt phẳng cắt vuông góc:</span>
                    <button
                      className="step-btn"
                      style={{ padding: '4px 10px' }}
                      onClick={() => setShowPerpSlice(!showPerpSlice)}
                    >
                      {showPerpSlice ? <Eye size={14} /> : <EyeOff size={14} />}
                      <span>{showPerpSlice ? 'Đang hiện' : 'Đang ẩn'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="step-content-box">
                  <span className="step-badge">Góc giữa mặt bên (SCD) và đáy (ABCD)</span>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', fontSize: '0.82rem' }}>
                    <li>Giao tuyến là <strong>CD</strong>.</li>
                    <li>Trong (ABCD) có <strong>AD ⊥ CD</strong> tại D.</li>
                    <li>Trong (SCD) có <strong>SD ⊥ CD</strong> tại D (định lý 3 đường vuông góc).</li>
                    <li>➜ Góc giữa hai mặt phẳng là góc <strong>SDA</strong> (= 45°).</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TOPIC 4: DIHEDRAL ANGLE CONTROLS */}
          {activeTopic === 'dihedral' && (
            <div className="step-wizard">
              <div className="step-content-box">
                <span className="step-badge">Độ mở góc nhị diện [P, c, Q]</span>
                <p style={{ margin: 0 }}>
                  Kéo thanh trượt để xoay cánh mặt phẳng quanh bản lề cạnh <strong>c</strong> từ 0° đến 180°.
                </p>
              </div>

              <div className="slider-control">
                <div className="slider-label-row">
                  <span>Góc phẳng nhị diện (xIy):</span>
                  <span className="slider-value">{dihedralAngleDeg}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="1"
                  value={dihedralAngleDeg}
                  onChange={e => setDihedralAngleDeg(parseInt(e.target.value))}
                  className="styled-range"
                />
              </div>

              {/* Angle comparison badge */}
              <div style={{
                background: dihedralAngleDeg > 90 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                border: `1px solid ${dihedralAngleDeg > 90 ? '#fca5a5' : '#6ee7b7'}`,
                borderRadius: '8px',
                padding: '8px 10px',
                fontSize: '0.82rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Góc phẳng nhị diện:</span>
                  <strong style={{ color: dihedralAngleDeg > 90 ? '#dc2626' : '#059669' }}>{dihedralAngleDeg}°</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Góc giữa 2 mặt phẳng:</span>
                  <strong style={{ color: '#2563eb' }}>{Math.min(dihedralAngleDeg, 180 - dihedralAngleDeg)}°</strong>
                </div>
                {dihedralAngleDeg > 90 && (
                  <div style={{ fontSize: '0.76rem', color: '#b91c1c', marginTop: '6px', lineHeight: 1.4 }}>
                    ⚠️ <em>Chú ý: Góc nhị diện là góc tù (&gt; 90°), nhưng góc giữa 2 mặt phẳng luôn là góc bù (≤ 90°)!</em>
                  </div>
                )}
              </div>

              <div className="step-nav-buttons">
                <button
                  className="step-btn primary"
                  onClick={() => setIsDihedralPlaying(!isDihedralPlaying)}
                >
                  {isDihedralPlaying ? <Pause size={15} /> : <Play size={15} />}
                  <span>{isDihedralPlaying ? 'Dừng mở' : 'Tự động mở cánh'}</span>
                </button>
                <button
                  className="step-btn"
                  onClick={() => setDihedralAngleDeg(60)}
                >
                  <RotateCcw size={15} />
                  <span>Về 60°</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. THEORY SUMMARY BOX */}
        <div className="theory-box">
          <div className="theory-title">
            <BookOpen size={16} />
            <span>Quy tắc Vàng Lớp 11</span>
          </div>
          {activeTopic === 'lines' && (
            <div>
              <strong>Góc giữa 2 đường thẳng a, b:</strong>
              <div style={{ marginTop: '4px' }}>• Lấy điểm O tùy ý, kẻ a' // a và b' // b.</div>
              <div>• (a, b) = (a', b') ∈ [0°, 90°].</div>
              <div style={{ marginTop: '6px', overflowX: 'auto', padding: '2px 0' }}>
                • <MathLatex math="\cos(a, b) = \left|\cos(\vec{u}_a, \vec{u}_b)\right| = \frac{\left|\vec{u}_a \cdot \vec{u}_b\right|}{\left|\vec{u}_a\right| \cdot \left|\vec{u}_b\right|}" />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #64748b)', marginTop: '2px', paddingLeft: '10px' }}>
                (với <MathLatex math="\vec{u}_a, \vec{u}_b" /> là các vectơ chỉ phương của a, b)
              </div>
              {twoLinesAngleDeg > 90 && (
                <div style={{ marginTop: '6px', color: '#f59e0b', fontSize: '12px' }}>
                  * Hướng vectơ {twoLinesAngleDeg}° &gt; 90°: Theo định nghĩa, góc giữa hai đường thẳng luôn là góc nhọn (hoặc vuông) <MathLatex math="[0^\circ, 90^\circ]" />, nên <MathLatex math={`(a, b) = 180^\\circ - ${twoLinesAngleDeg}^\\circ = ${180 - twoLinesAngleDeg}^\\circ`} />.
                </div>
              )}
            </div>
          )}
          {activeTopic === 'line_plane' && (
            <div>
              <strong>Góc giữa đường thẳng d và mặt phẳng (P):</strong>
              <div style={{ marginTop: '4px' }}>• Tìm O = d ∩ (P).</div>
              <div>• Lấy M ∈ d (M ≠ O), hạ MH ⊥ (P) tại H.</div>
              <div>• OH là hình chiếu vuông góc của d lên (P).</div>
              <div style={{ marginTop: '6px', overflowX: 'auto', padding: '2px 0' }}>
                • (d, (P)) = <MathLatex math="\widehat{MOH}" />, với <MathLatex math="\sin \widehat{MOH} = \frac{MH}{MO}" />.
              </div>
              {lineAngleDeg > 90 && (
                <div style={{ marginTop: '6px', color: '#f59e0b', fontSize: '12px' }}>
                  * Độ nghiêng {lineAngleDeg}° &gt; 90°: Theo định nghĩa, góc giữa đường thẳng và mặt phẳng luôn là góc nhọn (hoặc vuông) <MathLatex math="[0^\circ, 90^\circ]" />, nên <MathLatex math={`(d, (P)) = 180^\\circ - ${lineAngleDeg}^\\circ = ${180 - lineAngleDeg}^\\circ`} />.
                </div>
              )}
            </div>
          )}
          {activeTopic === 'planes' && (
            <div>
              <strong>Góc giữa 2 mặt phẳng (P) và (Q):</strong>
              <div style={{ marginTop: '4px' }}>• Tìm giao tuyến c = (P) ∩ (Q).</div>
              <div>• Lấy I ∈ c, kẻ a ⊂ (P), a ⊥ c và b ⊂ (Q), b ⊥ c.</div>
              <div style={{ marginTop: '6px' }}>
                • <MathLatex math="((P), (Q)) = (a, b) \in [0^\circ, 90^\circ]" />.
              </div>
              {planesAngleDeg > 90 && (
                <div style={{ marginTop: '6px', color: '#f59e0b', fontSize: '12px' }}>
                  * Độ mở hai mặt {planesAngleDeg}° &gt; 90°: Theo định nghĩa, góc giữa hai mặt phẳng luôn là góc nhọn (hoặc vuông) <MathLatex math="[0^\circ, 90^\circ]" />, nên <MathLatex math={`((P), (Q)) = 180^\\circ - ${planesAngleDeg}^\\circ = ${180 - planesAngleDeg}^\\circ`} />.
                </div>
              )}
            </div>
          )}
          {activeTopic === 'dihedral' && (
            <div>
              <strong>Góc nhị diện [P, c, Q]:</strong>
              <div style={{ marginTop: '4px' }}>• Cạnh nhị diện là giao tuyến c.</div>
              <div>• Góc phẳng nhị diện xIy: Ix ⊥ c trong (P), Iy ⊥ c trong (Q).</div>
              <div style={{ marginTop: '6px' }}>
                • Số đo góc nhị diện <MathLatex math="\theta = \widehat{xIy} \in [0^\circ, 180^\circ]" />.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN 3D INTERACTIVE CANVAS                               */}
      {/* ======================================================== */}
      <div className="space-angles-main">
        {/* Floating Top-Left Angle Badge */}
        <div className="canvas-angle-badge">
          {activeTopic === 'lines' && (
            <span>Góc (a, b) = {lineConceptData.angleDeg.toFixed(1)}°</span>
          )}
          {activeTopic === 'line_plane' && (
            <span>
              {subMode === 'problem'
                ? `Góc (SC, (ABCD)) = ${linePlaneProblemData.angleDeg.toFixed(1)}°`
                : isLinePlaneProjected
                  ? `Góc (d, (P)) = ${linePlaneConceptData.angleDeg.toFixed(1)}°`
                  : 'Hạ hình chiếu MH để xác định góc'}
            </span>
          )}
          {activeTopic === 'planes' && (
            <span>Góc ((P), (Q)) = {planesConceptData.angleDeg.toFixed(1)}°</span>
          )}
          {activeTopic === 'dihedral' && (
            <span>Nhị diện = {dihedralConceptData.dihedralDeg}° | 2 Mặt = {dihedralConceptData.planeAngleDeg}°</span>
          )}
        </div>

        {/* Floating Top-Right View Toolbar */}
        <div className="canvas-toolbar">
          <button
            className="toolbar-btn"
            title="Đặt lại camera"
            onClick={resetCamera}
          >
            <RotateCcw size={16} />
          </button>
          <button
            className="toolbar-btn"
            title={showPlane ? 'Ẩn mặt phẳng' : 'Hiện mặt phẳng'}
            onClick={() => setShowPlane(!showPlane)}
          >
            {showPlane ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            className="toolbar-btn"
            title={showArc ? 'Ẩn cung góc' : 'Hiện cung góc'}
            onClick={() => setShowArc(!showArc)}
          >
            <Compass size={16} />
          </button>
        </div>

        {/* Floating Bottom-Left Color Legend */}
        <div className="canvas-overlay-legend">
          {activeTopic === 'lines' && (
            <>
              <div className="legend-item">
                <span className="legend-color-line" style={{ background: '#2563eb' }} />
                <span>Đường thẳng a (cố định)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color-line" style={{ background: '#10b981' }} />
                <span>Đường thẳng b (tịnh tiến b → b')</span>
              </div>
              <div className="legend-item">
                <span className="legend-color-line" style={{ background: '#f59e0b' }} />
                <span>Cung góc giữa 2 đường</span>
              </div>
            </>
          )}
          {activeTopic === 'line_plane' && (
            <>
              <div className="legend-item">
                <span className="legend-color-line" style={{ background: '#2563eb' }} />
                <span>Đường thẳng d</span>
              </div>
              <div className="legend-item">
                <span className="legend-color-line" style={{ background: '#10b981' }} />
                <span>Hình chiếu d' trên mặt phẳng</span>
              </div>
              <div className="legend-item">
                <span className="legend-color-line" style={{ background: '#ef4444' }} />
                <span>Đường chiếu vuông góc MH ⊥ (P)</span>
              </div>
            </>
          )}
          {activeTopic === 'planes' && (
            <>
              <div className="legend-item">
                <span className="legend-color-line" style={{ background: '#dc2626' }} />
                <span>Giao tuyến c = (P) ∩ (Q)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color-line" style={{ background: '#2563eb' }} />
                <span>Tia a ⊂ (P), a ⊥ c tại I</span>
              </div>
              <div className="legend-item">
                <span className="legend-color-line" style={{ background: '#10b981' }} />
                <span>Tia b ⊂ (Q), b ⊥ c tại I</span>
              </div>
            </>
          )}
          {activeTopic === 'dihedral' && (
            <>
              <div className="legend-item">
                <span className="legend-color-line" style={{ background: '#dc2626' }} />
                <span>Cạnh nhị diện c</span>
              </div>
              <div className="legend-item">
                <span className="legend-color-line" style={{ background: '#2563eb' }} />
                <span>Tia Ix ⊥ c trong nửa mp (α)</span>
              </div>
              <div className="legend-item">
                <span className="legend-color-line" style={{ background: '#10b981' }} />
                <span>Tia Iy ⊥ c trong nửa mp (β)</span>
              </div>
            </>
          )}
        </div>

        {/* 3D SCENE RENDER CANVAS */}
        <Canvas
          camera={{ position: [5.5, 4.5, 6.5], fov: 45 }}
          style={{ width: '100%', height: '100%' }}
        >
          <color attach="background" args={['#f8fafc']} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 15, 10]} intensity={0.9} />
          <directionalLight position={[-10, -5, -10]} intensity={0.3} />

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.05}
            minDistance={2}
            maxDistance={20}
            target={[0, 0.5, 0]}
          />

          {/* Subtle Base Grid */}
          <gridHelper args={[12, 12, '#cbd5e1', '#e2e8f0']} position={[0, -0.8, 0]} />

          {/* ======================================================== */}
          {/* TOPIC 1 SCENE: TWO LINES                                  */}
          {/* ======================================================== */}
          {activeTopic === 'lines' && subMode === 'concept' && (
            <group>
              {/* Line a */}
              <Line
                points={[lineConceptData.ptA1, lineConceptData.ptA2]}
                color="#2563eb"
                lineWidth={3.5}
              />
              <VertexNode pos={lineConceptData.ptA2} label="a" color="#2563eb" />
              <VertexNode pos={lineConceptData.O} label="O" color="#1e293b" />

              {/* Original Line b (faint dashed if translating) */}
              <Line
                points={[lineConceptData.ptB1_orig, lineConceptData.ptB2_orig]}
                color="#64748b"
                lineWidth={2}
                dashed
                dashSize={0.2}
                gapSize={0.15}
              />
              <VertexNode pos={lineConceptData.ptB2_orig} label="b" color="#64748b" radius={0.05} />

              {/* Translation guide tracks */}
              {translateT > 0 && translateT < 1 && (
                <>
                  <Line points={lineConceptData.trackP1} color="#94a3b8" lineWidth={1.5} dashed dashSize={0.15} gapSize={0.1} />
                  <Line points={lineConceptData.trackP2} color="#94a3b8" lineWidth={1.5} dashed dashSize={0.15} gapSize={0.1} />
                  <Line points={lineConceptData.trackCenter} color="#10b981" lineWidth={1.8} dashed dashSize={0.15} gapSize={0.1} />
                </>
              )}

              {/* Moving Line b / b' */}
              <Line
                points={[lineConceptData.curPtB1, lineConceptData.curPtB2]}
                color="#10b981"
                lineWidth={3.5}
              />
              <VertexNode
                pos={lineConceptData.curPtB2}
                label={isLineTranslated ? "b'" : "b"}
                color="#10b981"
              />

              {/* Angle Arc when translated close to O */}
              {showArc && isLineTranslated && lineConceptData.angleDeg > 0.1 && (
                <AngleArc3D
                  center={lineConceptData.O}
                  p1={lineConceptData.ptArcA}
                  p2={lineConceptData.curPtB2}
                  radius={1.3}
                  color="#f59e0b"
                  label="α"
                  customAngle={lineConceptData.angleDeg}
                />
              )}

              {/* Right angle symbol when perpendicular (90 deg) */}
              {isLineTranslated && lineConceptData.angleDeg === 90 && (
                <RightAngleMarker
                  vertex={lineConceptData.O}
                  p1={lineConceptData.ptArcA}
                  p2={lineConceptData.curPtB2}
                  size={0.35}
                />
              )}
            </group>
          )}

          {activeTopic === 'lines' && subMode === 'problem' && (
            <group>
              {/* Pyramid S.ABCD wireframe */}
              {lineProblemData.edges.map((e, idx) => (
                <Line key={`pe-${idx}`} points={[e[0], e[1]]} color="#94a3b8" lineWidth={1.8} />
              ))}

              {/* Pyramid vertices */}
              <VertexNode pos={lineProblemData.A} label="A" />
              <VertexNode pos={lineProblemData.B} label="B" />
              <VertexNode pos={lineProblemData.C} label="C" />
              <VertexNode pos={lineProblemData.D} label="D" />
              <VertexNode pos={lineProblemData.S} label="S" color="#dc2626" />

              {/* Target line SC */}
              <Line points={[lineProblemData.S, lineProblemData.C]} color="#2563eb" lineWidth={4} />

              {/* Original AB */}
              <Line points={[lineProblemData.A, lineProblemData.B]} color="#64748b" lineWidth={2.5} dashed={translateT > 0.1} />

              {/* Moving translated segment from AB towards CD */}
              <Line points={[lineProblemData.curTransB1, lineProblemData.curTransB2]} color="#10b981" lineWidth={4} />

              {/* Right angle at D in triangle SCD */}
              {translateT > 0.8 && (
                <RightAngleMarker vertex={lineProblemData.D} p1={lineProblemData.S} p2={lineProblemData.C} size={0.35} />
              )}

              {/* Angle Arc SCD */}
              {showArc && translateT > 0.8 && (
                <AngleArc3D
                  center={lineProblemData.C}
                  p1={lineProblemData.S}
                  p2={lineProblemData.D}
                  radius={1.0}
                  color="#f59e0b"
                  label="SCD"
                />
              )}
            </group>
          )}

          {/* ======================================================== */}
          {/* TOPIC 2 SCENE: LINE & PLANE                              */}
          {/* ======================================================== */}
          {activeTopic === 'line_plane' && subMode === 'concept' && (
            <group>
              {/* Plane plate */}
              {showPlane && (
                <PlaneSurface corners={linePlaneConceptData.planeCorners} color="#3b82f6" opacity={0.16} />
              )}

              {/* Line d */}
              <Line points={[linePlaneConceptData.dStart, linePlaneConceptData.dEnd]} color="#2563eb" lineWidth={3.5} />
              <VertexNode pos={linePlaneConceptData.dEnd} label="d" color="#2563eb" />
              <VertexNode pos={linePlaneConceptData.O} label="O" color="#1e293b" />

              {/* Point M on line d */}
              <VertexNode pos={linePlaneConceptData.M} label="M" color="#f59e0b" radius={0.09} />

              {/* Dropping projection line MH */}
              {projectionProgress > 0 && !linePlaneConceptData.isPerpendicular && linePlaneConceptData.angleDeg > 0.1 && (
                <>
                  <Line
                    points={[linePlaneConceptData.M, linePlaneConceptData.dropPt]}
                    color="#ef4444"
                    lineWidth={2.5}
                    dashed
                    dashSize={0.15}
                    gapSize={0.1}
                  />
                  <VertexNode pos={linePlaneConceptData.dropPt} label={isLinePlaneProjected ? "H" : ""} color="#ef4444" />
                </>
              )}

              {/* When perpendicular (lineAngleDeg === 90): drop line is along d to O */}
              {projectionProgress > 0 && linePlaneConceptData.isPerpendicular && (
                <>
                  <Line
                    points={[linePlaneConceptData.M, linePlaneConceptData.dropPt]}
                    color="#ef4444"
                    lineWidth={2.8}
                    dashed
                    dashSize={0.15}
                    gapSize={0.1}
                  />
                  <VertexNode pos={linePlaneConceptData.dropPt} label={isLinePlaneProjected ? "H ≡ O" : ""} color="#ef4444" />
                </>
              )}

              {/* Projection Line d' = OH - chỉ xuất hiện khi hạ xuống đúng 100% */}
              {isLinePlaneProjected && !linePlaneConceptData.isPerpendicular && linePlaneConceptData.angleDeg > 0.1 && (
                <>
                  <Line
                    points={[linePlaneConceptData.O, linePlaneConceptData.dPrimeEnd]}
                    color="#10b981"
                    lineWidth={3.2}
                  />
                  <VertexNode pos={linePlaneConceptData.dPrimeEnd} label="d'" color="#10b981" />
                  <RightAngleMarker
                    vertex={linePlaneConceptData.H}
                    p1={linePlaneConceptData.M}
                    p2={linePlaneConceptData.O}
                    size={Math.min(0.3, Math.max(0.12, linePlaneConceptData.distOH * 0.35))}
                  />
                </>
              )}

              {/* When perpendicular: right angle marker at O */}
              {isLinePlaneProjected && linePlaneConceptData.isPerpendicular && (
                <RightAngleMarker
                  vertex={linePlaneConceptData.O}
                  p1={linePlaneConceptData.M}
                  p2={linePlaneConceptData.dPrimeEnd}
                  size={0.35}
                />
              )}

              {/* Angle Arc MOH - chỉ xuất hiện khi hạ xuống đúng 100% */}
              {showArc && isLinePlaneProjected && linePlaneConceptData.angleDeg > 0.1 && (
                <AngleArc3D
                  center={linePlaneConceptData.O}
                  p1={linePlaneConceptData.M}
                  p2={linePlaneConceptData.isPerpendicular ? linePlaneConceptData.dPrimeEnd : linePlaneConceptData.H}
                  radius={1.4}
                  color="#f59e0b"
                  label="φ"
                  customAngle={linePlaneConceptData.angleDeg}
                />
              )}
            </group>
          )}

          {activeTopic === 'line_plane' && subMode === 'problem' && (
            <group>
              {/* Pyramid edges */}
              {linePlaneProblemData.edges.map((e, idx) => (
                <Line
                  key={`pe-${idx}`}
                  points={[e[0], e[1]]}
                  color={idx >= 8 ? '#cbd5e1' : '#94a3b8'}
                  lineWidth={1.6}
                  dashed={idx >= 8}
                />
              ))}

              {/* Base plane plate */}
              {showPlane && (
                <PlaneSurface corners={linePlaneProblemData.baseCorners} color="#3b82f6" opacity={0.18} />
              )}

              <VertexNode pos={linePlaneProblemData.A} label="A" color="#ef4444" />
              <VertexNode pos={linePlaneProblemData.B} label="B" />
              <VertexNode pos={linePlaneProblemData.C} label="C" color="#1e293b" />
              <VertexNode pos={linePlaneProblemData.D} label="D" />
              <VertexNode pos={linePlaneProblemData.S} label="S" color="#2563eb" />

              {/* Line SC */}
              <Line points={[linePlaneProblemData.S, linePlaneProblemData.C]} color="#2563eb" lineWidth={4} />

              {/* Projection SA perp base */}
              <Line points={[linePlaneProblemData.S, linePlaneProblemData.A]} color="#ef4444" lineWidth={2.5} dashed dashSize={0.2} gapSize={0.15} />

              {/* Projected line AC */}
              <Line points={[linePlaneProblemData.A, linePlaneProblemData.C]} color="#10b981" lineWidth={3.5} />

              {/* Right angle at A */}
              <RightAngleMarker vertex={linePlaneProblemData.A} p1={linePlaneProblemData.S} p2={linePlaneProblemData.C} size={0.35} />

              {/* Angle Arc SCA */}
              {showArc && (
                <AngleArc3D
                  center={linePlaneProblemData.C}
                  p1={linePlaneProblemData.S}
                  p2={linePlaneProblemData.A}
                  radius={1.1}
                  color="#f59e0b"
                  label="SCA"
                />
              )}
            </group>
          )}

          {/* ======================================================== */}
          {/* TOPIC 3 SCENE: TWO PLANES                                */}
          {/* ======================================================== */}
          {activeTopic === 'planes' && subMode === 'concept' && (
            <group>
              {/* Common intersection line c */}
              <Line points={[planesConceptData.edgeStart, planesConceptData.edgeEnd]} color="#dc2626" lineWidth={4.5} />
              <VertexNode pos={planesConceptData.edgeEnd} label="c" color="#dc2626" />
              <VertexNode pos={planesConceptData.I} label="I" color="#1e293b" />

              {/* Plane (P) */}
              {showPlane && (
                <PlaneSurface corners={planesConceptData.pCorners} color="#3b82f6" opacity={0.2} />
              )}
              {/* Plane (Q) */}
              {showPlane && (
                <PlaneSurface corners={planesConceptData.qCorners} color="#10b981" opacity={0.2} />
              )}

              {/* Transverse slice plane (R) perp to c at I */}
              {showPlane && showPerpSlice && (
                <PlaneSurface corners={planesConceptData.sliceCorners} color="#f59e0b" opacity={0.12} />
              )}

              {/* Line a in (P) perp to c */}
              <Line points={[planesConceptData.ptA_neg, planesConceptData.ptA_pos]} color="#2563eb" lineWidth={3.5} />
              <VertexNode pos={planesConceptData.ptA} label="a" color="#2563eb" />
              <RightAngleMarker
                vertex={planesConceptData.I}
                p1={planesConceptData.ptA}
                p2={planesConceptData.edgeEnd}
                size={0.35}
                color="#2563eb"
              />

              {/* Line b in (Q) perp to c */}
              <Line points={[planesConceptData.I, planesConceptData.ptB]} color="#10b981" lineWidth={3.5} />
              <VertexNode pos={planesConceptData.ptB} label="b" color="#10b981" />
              <RightAngleMarker
                vertex={planesConceptData.I}
                p1={planesConceptData.ptB}
                p2={planesConceptData.edgeEnd}
                size={0.35}
                color="#10b981"
              />

              {/* Right angle marker between a and b when perpendicular (90 deg) */}
              {planesConceptData.angleDeg === 90 && (
                <RightAngleMarker
                  vertex={planesConceptData.I}
                  p1={planesConceptData.ptA}
                  p2={planesConceptData.ptB}
                  size={0.35}
                  color="#f59e0b"
                />
              )}

              {/* Angle Arc between a and b */}
              {showArc && planesConceptData.angleDeg > 0.1 && (
                <AngleArc3D
                  center={planesConceptData.I}
                  p1={planesConceptData.ptA}
                  p2={planesConceptData.ptB}
                  radius={1.2}
                  color="#f59e0b"
                  label="φ"
                  customAngle={planesConceptData.angleDeg}
                />
              )}
            </group>
          )}

          {activeTopic === 'planes' && subMode === 'problem' && (
            <group>
              {/* Polyhedron edges */}
              {planesProblemData.edges.map((e, idx) => (
                <Line key={`pe-${idx}`} points={[e[0], e[1]]} color="#94a3b8" lineWidth={1.8} />
              ))}

              <VertexNode pos={planesProblemData.A} label="A" />
              <VertexNode pos={planesProblemData.B} label="B" />
              <VertexNode pos={planesProblemData.C} label="C" />
              <VertexNode pos={planesProblemData.D} label="D" color="#dc2626" />
              <VertexNode pos={planesProblemData.S} label="S" color="#2563eb" />

              {/* Highlight intersection CD */}
              <Line points={[planesProblemData.C, planesProblemData.D]} color="#dc2626" lineWidth={4} />

              {/* Line AD in base perp CD */}
              <Line points={[planesProblemData.A, planesProblemData.D]} color="#2563eb" lineWidth={3.5} />
              <RightAngleMarker vertex={planesProblemData.D} p1={planesProblemData.A} p2={planesProblemData.C} size={0.35} color="#2563eb" />

              {/* Line SD in face (SCD) perp CD */}
              <Line points={[planesProblemData.S, planesProblemData.D]} color="#10b981" lineWidth={3.5} />
              <RightAngleMarker vertex={planesProblemData.D} p1={planesProblemData.S} p2={planesProblemData.C} size={0.35} color="#10b981" />

              {/* Angle Arc SDA */}
              {showArc && (
                <AngleArc3D
                  center={planesProblemData.D}
                  p1={planesProblemData.S}
                  p2={planesProblemData.A}
                  radius={1.0}
                  color="#f59e0b"
                  label="SDA = 45°"
                />
              )}
            </group>
          )}

          {/* ======================================================== */}
          {/* TOPIC 4 SCENE: DIHEDRAL ANGLE                            */}
          {/* ======================================================== */}
          {activeTopic === 'dihedral' && (
            <group>
              {/* Common edge c */}
              <Line points={[dihedralConceptData.edgeStart, dihedralConceptData.edgeEnd]} color="#dc2626" lineWidth={4.5} />
              <VertexNode pos={dihedralConceptData.edgeEnd} label="c" color="#dc2626" />
              <VertexNode pos={dihedralConceptData.I} label="I" color="#1e293b" />

              {/* Base half-plane (alpha) */}
              {showPlane && (
                <PlaneSurface corners={dihedralConceptData.alphaCorners} color="#3b82f6" opacity={0.22} />
              )}
              {/* Rotating half-plane (beta) */}
              {showPlane && (
                <PlaneSurface corners={dihedralConceptData.betaCorners} color="#10b981" opacity={0.22} />
              )}

              {/* Ray Ix perp c in alpha */}
              <Line points={[dihedralConceptData.I, dihedralConceptData.ptIx]} color="#2563eb" lineWidth={3.5} />
              <VertexNode pos={dihedralConceptData.ptIx} label="x" color="#2563eb" />
              <RightAngleMarker
                vertex={dihedralConceptData.I}
                p1={dihedralConceptData.ptIx}
                p2={dihedralConceptData.edgeEnd}
                size={0.35}
                color="#2563eb"
              />

              {/* Ray Iy perp c in beta */}
              <Line points={[dihedralConceptData.I, dihedralConceptData.ptIy]} color="#10b981" lineWidth={3.5} />
              <VertexNode pos={dihedralConceptData.ptIy} label="y" color="#10b981" />
              <RightAngleMarker
                vertex={dihedralConceptData.I}
                p1={dihedralConceptData.ptIy}
                p2={dihedralConceptData.edgeEnd}
                size={0.35}
                color="#10b981"
              />

              {/* Angle Arc between Ix and Iy */}
              {showArc && (
                <AngleArc3D
                  center={dihedralConceptData.I}
                  p1={dihedralConceptData.ptIx}
                  p2={dihedralConceptData.ptIy}
                  radius={1.3}
                  color={dihedralAngleDeg > 90 ? '#ef4444' : '#f59e0b'}
                  label="xIy"
                />
              )}
            </group>
          )}
        </Canvas>
      </div>
    </div>
  );
};

export default SpaceAngles3D;
