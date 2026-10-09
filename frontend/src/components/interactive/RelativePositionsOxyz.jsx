import React, { useState, useRef, useEffect } from 'react';
import { Rotate3d, MousePointer2, ZoomIn, ZoomOut, Link as LinkIcon } from 'lucide-react';
import MathView from '../MathView';
import './RelativePositionsOxyz.css';

const RELATIVE_POSITIONS = {
  line_line: {
    title: 'Đường thẳng & Đường thẳng',
    states: [
      { id: 'cut', name: 'Cắt nhau', desc: 'Có 1 điểm chung.', condition: '$\\vec{u_1}$, $\\vec{u_2}$ không cùng phương và $[\\vec{u_1}, \\vec{u_2}] \\cdot \\vec{M_1M_2} = 0$' },
      { id: 'parallel', name: 'Song song', desc: 'Không có điểm chung.', condition: '$\\vec{u_1} = k\\vec{u_2}$ và $M_1 \\notin d_2$' },
      { id: 'skew', name: 'Chéo nhau', desc: 'Không đồng phẳng.', condition: '$[\\vec{u_1}, \\vec{u_2}] \\cdot \\vec{M_1M_2} \\neq 0$' },
      { id: 'coincident', name: 'Trùng nhau', desc: 'Có vô số điểm chung.', condition: '$\\vec{u_1} = k\\vec{u_2}$ và $M_1 \\in d_2$' },
    ]
  },
  line_plane: {
    title: 'Đường thẳng & Mặt phẳng',
    states: [
      { id: 'cut', name: 'Cắt nhau', desc: 'Có 1 điểm chung.', condition: '$\\vec{u}_d \\cdot \\vec{n}_P \\neq 0$' },
      { id: 'parallel', name: 'Song song', desc: 'Không có điểm chung.', condition: '$\\vec{u}_d \\cdot \\vec{n}_P = 0$ và $M \\notin (P)$' },
      { id: 'inside', name: 'Nằm trong', desc: 'Mọi điểm của d thuộc (P).', condition: '$\\vec{u}_d \\cdot \\vec{n}_P = 0$ và $M \\in (P)$' },
    ]
  },
  plane_plane: {
    title: 'Mặt phẳng & Mặt phẳng',
    states: [
      { id: 'cut', name: 'Cắt nhau', desc: 'Giao tuyến là đường thẳng.', condition: '$\\vec{n_1}$ không cùng phương $\\vec{n_2}$' },
      { id: 'parallel', name: 'Song song', desc: 'Không có điểm chung.', condition: '$\\vec{n_1} = k\\vec{n_2}$ và $D_1 \\neq kD_2$' },
      { id: 'coincident', name: 'Trùng nhau', desc: 'Hai mặt phẳng trùng.', condition: '$\\vec{n_1} = k\\vec{n_2}$ và $D_1 = kD_2$' },
    ]
  },
  line_sphere: {
    title: 'Đường thẳng & Mặt cầu',
    states: [
      { id: 'disjoint', name: 'Không giao', desc: 'Khoảng cách tâm I đến d lớn hơn R.', condition: '$d(I, d) > R$' },
      { id: 'tangent', name: 'Tiếp xúc', desc: 'Có 1 điểm chung.', condition: '$d(I, d) = R$' },
      { id: 'intersect', name: 'Cắt nhau', desc: 'Cắt tại 2 điểm.', condition: '$d(I, d) < R$' },
    ]
  },
  plane_sphere: {
    title: 'Mặt phẳng & Mặt cầu',
    states: [
      { id: 'disjoint', name: 'Không giao', desc: 'Khoảng cách tâm I đến (P) lớn hơn R.', condition: '$d(I, (P)) > R$' },
      { id: 'tangent', name: 'Tiếp xúc', desc: 'Có 1 điểm chung.', condition: '$d(I, (P)) = R$' },
      { id: 'intersect', name: 'Cắt nhau', desc: 'Giao tuyến là đường tròn.', condition: '$d(I, (P)) < R$' },
    ]
  },
  sphere_sphere: {
    title: 'Mặt cầu & Mặt cầu',
    states: [
      { id: 'disjoint', name: 'Ngoài nhau', desc: 'Không có điểm chung.', condition: '$I_1I_2 > R_1 + R_2$' },
      { id: 'ext_tangent', name: 'Tiếp xúc ngoài', desc: '1 điểm chung.', condition: '$I_1I_2 = R_1 + R_2$' },
      { id: 'intersect', name: 'Cắt nhau', desc: 'Giao tuyến đường tròn.', condition: '$|R_1 - R_2| < I_1I_2 < R_1 + R_2$' },
      { id: 'int_tangent', name: 'Tiếp xúc trong', desc: '1 điểm chung.', condition: '$I_1I_2 = |R_1 - R_2|$' },
      { id: 'inside', name: 'Chứa nhau', desc: 'Bao hàm nhau.', condition: '$I_1I_2 < |R_1 - R_2|$' },
    ]
  }
};

const RelativePositionsOxyz = () => {
  const [selectedObj1, setSelectedObj1] = useState('line');
  const [selectedObj2, setSelectedObj2] = useState('sphere');
  const [activeStateId, setActiveStateId] = useState('disjoint');
  const [distance, setDistance] = useState(120);

  const activeCategory = [selectedObj1, selectedObj2].sort().join('_');
  
  // 3D Rotation State
  const [rotation, setRotation] = useState({ x: 20, y: -30 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, rx: 0, ry: 0 });

  const categoryData = RELATIVE_POSITIONS[activeCategory];
  const currentStateData = categoryData.states.find(s => s.id === activeStateId) || categoryData.states[0];

  const handleSelectObj = (row, obj) => {
    let newObj1 = selectedObj1;
    let newObj2 = selectedObj2;
    if (row === 1) newObj1 = obj;
    else newObj2 = obj;
    
    setSelectedObj1(newObj1);
    setSelectedObj2(newObj2);
    
    const newCat = [newObj1, newObj2].sort().join('_');
    
    if (newCat !== activeCategory) {
      if (newCat === 'line_sphere' || newCat === 'plane_sphere') {
        setDistance(120);
        setActiveStateId('disjoint');
      } else if (newCat === 'sphere_sphere') {
        setDistance(160);
        setActiveStateId('disjoint');
      } else {
        setActiveStateId(RELATIVE_POSITIONS[newCat].states[0].id);
        setDistance(100);
      }
      setRotation({ x: 20, y: -30 });
      setZoom(1);
    }
  };

  // State button click handler
  const handleStateClick = (stateId) => {
    setActiveStateId(stateId);
    // Set representative distance based on state
    if (activeCategory === 'line_sphere' || activeCategory === 'plane_sphere') {
      if (stateId === 'disjoint') setDistance(120);
      if (stateId === 'tangent') setDistance(80);
      if (stateId === 'intersect') setDistance(40);
    } else if (activeCategory === 'sphere_sphere') {
      if (stateId === 'disjoint') setDistance(160);
      if (stateId === 'ext_tangent') setDistance(130); // 80 + 50
      if (stateId === 'intersect') setDistance(90); // between 30 and 130
      if (stateId === 'int_tangent') setDistance(30); // 80 - 50
      if (stateId === 'inside') setDistance(10); // < 30
    }
  };

  // Handle slider drag
  const handleDistanceChange = (e) => {
    const val = Number(e.target.value);
    setDistance(val);
    
    // Auto-update state based on distance
    if (activeCategory === 'line_sphere' || activeCategory === 'plane_sphere') {
      if (val > 80) setActiveStateId('disjoint');
      else if (val === 80) setActiveStateId('tangent');
      else setActiveStateId('intersect');
    } else if (activeCategory === 'sphere_sphere') {
      if (val > 130) setActiveStateId('disjoint');
      else if (val === 130) setActiveStateId('ext_tangent');
      else if (val > 30 && val < 130) setActiveStateId('intersect');
      else if (val === 30) setActiveStateId('int_tangent');
      else setActiveStateId('inside');
    }
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    dragStart.current = { x: clientX, y: clientY, rx: rotation.x, ry: rotation.y };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    setRotation({
      x: dragStart.current.rx - dy * 0.5,
      y: dragStart.current.ry + dx * 0.5
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    let newZoom = zoom * (1 - Math.sign(e.deltaY) * zoomFactor);
    newZoom = Math.max(0.5, Math.min(3, newZoom));
    setZoom(newZoom);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging]);

  // Mini 3D Engine
  const project = (x, y, z) => {
    const rx = rotation.x * Math.PI / 180;
    const ry = rotation.y * Math.PI / 180;
    
    // Rotate around Y
    const x1 = x * Math.cos(ry) - z * Math.sin(ry);
    const z1 = x * Math.sin(ry) + z * Math.cos(ry);
    
    // Rotate around X
    const y1 = y * Math.cos(rx) - z1 * Math.sin(rx);
    const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
    
    return { x: x1, y: y1, z: z2 };
  };

  // Generate scene elements based on active category and state
  const buildScene = () => {
    let elements = [];
    const key = ['line_sphere', 'plane_sphere', 'sphere_sphere'].includes(activeCategory) 
      ? activeCategory 
      : `${activeCategory}_${activeStateId}`;

    const addPlane = (cy, color, edgeColor, size = 150) => {
      elements.push({
        type: 'plane',
        points: [
          {x: -size, y: cy, z: -size}, {x: size, y: cy, z: -size},
          {x: size, y: cy, z: size}, {x: -size, y: cy, z: size}
        ],
        color, edgeColor
      });
    };

    const addLine = (p1, p2, color, dashed = false) => {
      elements.push({ type: 'line', p1, p2, color, dashed, width: 4 });
    };

    const addPoint = (p, label, color = '#111827') => {
      elements.push({ type: 'point', p, label, color });
    };

    const addSphere = (center, r, colorGrad) => {
      elements.push({ type: 'sphere', center, r, color: colorGrad });
    };

    switch (key) {
      /* ====== LINE & LINE ====== */
      case 'line_line_cut':
        addLine({x: -150, y: 0, z: -150}, {x: 150, y: 0, z: 150}, '#ef4444');
        addLine({x: -150, y: 0, z: 150}, {x: 150, y: 0, z: -150}, '#3b82f6');
        addPoint({x: 0, y: 0, z: 0}, 'M');
        break;
      case 'line_line_parallel':
        addLine({x: -150, y: -40, z: 0}, {x: 150, y: -40, z: 0}, '#ef4444');
        addLine({x: -150, y: 40, z: 0}, {x: 150, y: 40, z: 0}, '#3b82f6');
        break;
      case 'line_line_skew':
        addPlane(40, '#e0e7ff', '#4f46e5', 120);
        addLine({x: -100, y: 40, z: -80}, {x: 100, y: 40, z: 80}, '#3b82f6'); // in plane
        addLine({x: -50, y: -100, z: 0}, {x: -50, y: 40, z: 0}, '#ef4444'); // top part
        addLine({x: -50, y: 40, z: 0}, {x: -50, y: 150, z: 0}, '#ef4444', true); // bottom part (dashed)
        break;
      case 'line_line_coincident':
        addLine({x: -150, y: 0, z: 0}, {x: 150, y: 0, z: 0}, '#3b82f6'); // thicker blue
        elements[0].width = 8; elements[0].opacity = 0.5;
        addLine({x: -150, y: 0, z: 0}, {x: 150, y: 0, z: 0}, '#ef4444'); // red on top
        break;

      /* ====== LINE & PLANE ====== */
      case 'line_plane_cut':
        addPlane(0, '#e0e7ff', '#4f46e5');
        addLine({x: 50, y: -150, z: -50}, {x: 0, y: 0, z: 0}, '#ef4444');
        addLine({x: 0, y: 0, z: 0}, {x: -50, y: 150, z: 50}, '#ef4444', true); // back/bottom part dashed
        addPoint({x: 0, y: 0, z: 0}, 'M');
        break;
      case 'line_plane_parallel':
        addPlane(50, '#e0e7ff', '#4f46e5');
        addLine({x: -150, y: -50, z: 0}, {x: 150, y: -50, z: 0}, '#ef4444');
        break;
      case 'line_plane_inside':
        addPlane(0, '#e0e7ff', '#4f46e5');
        addLine({x: -120, y: 0, z: -80}, {x: 120, y: 0, z: 80}, '#ef4444');
        break;

      /* ====== PLANE & PLANE ====== */
      case 'plane_plane_cut':
        // Plane 1 (Horizontal)
        addPlane(0, '#e0e7ff', '#4f46e5', 120);
        // Plane 2 (Vertical rotated)
        elements.push({
          type: 'plane',
          points: [{x: 0, y: -120, z: -120}, {x: 0, y: -120, z: 120}, {x: 0, y: 120, z: 120}, {x: 0, y: 120, z: -120}],
          color: '#fce7f3', edgeColor: '#db2777'
        });
        addLine({x: 0, y: 0, z: -120}, {x: 0, y: 0, z: 120}, '#111827'); // intersection
        break;
      case 'plane_plane_parallel':
        addPlane(-60, '#e0e7ff', '#4f46e5');
        addPlane(60, '#fce7f3', '#db2777');
        break;
      case 'plane_plane_coincident':
        addPlane(0, '#e0e7ff', '#4f46e5');
        // Overlay dashed plane
        elements.push({
          type: 'plane',
          points: [{x: -145, y: -5, z: -145}, {x: 155, y: -5, z: -145}, {x: 155, y: -5, z: 155}, {x: -145, y: -5, z: 155}],
          color: 'transparent', edgeColor: '#db2777', dashed: true
        });
        break;

      /* ====== LINE & SPHERE ====== */
      case 'line_sphere':
        addSphere({x: 0, y: 0, z: 0}, 80, 'url(#sphereGrad)');
        addPoint({x: 0, y: 0, z: 0}, 'I', '#fff');
        
        if (distance > 80) { // disjoint
          addLine({x: -150, y: -distance, z: 0}, {x: 150, y: -distance, z: 0}, '#ef4444');
        } else if (distance === 80) { // tangent
          addLine({x: -150, y: -distance, z: 0}, {x: 150, y: -distance, z: 0}, '#ef4444');
          addPoint({x: 0, y: -distance, z: 0}, 'M', '#111827');
          addLine({x: 0, y: 0, z: 0}, {x: 0, y: -distance, z: 0}, '#fff', true);
          elements[elements.length - 1].width = 2;
        } else { // intersect
          const halfCord = Math.sqrt(80*80 - distance*distance);
          addLine({x: -150, y: -distance, z: 0}, {x: -halfCord, y: -distance, z: 0}, '#ef4444');
          addLine({x: halfCord, y: -distance, z: 0}, {x: 150, y: -distance, z: 0}, '#ef4444');
          addLine({x: -halfCord, y: -distance, z: 0}, {x: halfCord, y: -distance, z: 0}, '#ef4444', true);
          addPoint({x: -halfCord, y: -distance, z: 0}, 'A');
          addPoint({x: halfCord, y: -distance, z: 0}, 'B');
        }
        break;

      /* ====== PLANE & SPHERE ====== */
      case 'plane_sphere':
        if (distance > 80) { // disjoint
          addSphere({x: 0, y: 0, z: 0}, 80, 'url(#sphereGrad)');
          addPlane(-distance, '#e0e7ff', '#4f46e5');
          addPoint({x: 0, y: 0, z: 0}, 'I', '#fff');
        } else if (distance === 80) { // tangent
          addSphere({x: 0, y: 0, z: 0}, 80, 'url(#sphereGrad)');
          addPlane(-distance, '#e0e7ff', '#4f46e5');
          addPoint({x: 0, y: 0, z: 0}, 'I', '#fff');
          addPoint({x: 0, y: -distance, z: 0}, 'H');
          addLine({x: 0, y: 0, z: 0}, {x: 0, y: -distance, z: 0}, '#fff', true);
          elements[elements.length - 1].width = 2;
        } else { // intersect
          addPlane(-distance, '#e0e7ff', '#4f46e5');
          addSphere({x: 0, y: 0, z: 0}, 80, 'url(#sphereGrad)');
          const r = Math.sqrt(80*80 - distance*distance);
          elements.push({
            type: 'circle3d',
            center: {x: 0, y: -distance, z: 0},
            r: r,
            color: '#a5b4fc', edgeColor: '#4f46e5'
          });
          addPoint({x: 0, y: 0, z: 0}, 'I', '#fff');
          addPoint({x: 0, y: -distance, z: 0}, 'H');
          addLine({x: 0, y: 0, z: 0}, {x: 0, y: -distance, z: 0}, '#fff', true);
          elements[elements.length - 1].width = 2;
        }
        break;

      /* ====== SPHERE & SPHERE ====== */
      case 'sphere_sphere':
        const r1 = 80;
        const r2 = 50;
        // Center of sphere 1 is fixed at x = -distance/2
        // Center of sphere 2 is fixed at x = distance/2
        const cx1 = -distance / 2;
        const cx2 = distance / 2;
        
        addSphere({x: cx1, y: 0, z: 0}, r1, 'url(#sphereGrad)');
        addPoint({x: cx1, y: 0, z: 0}, 'I₁', '#fff');
        
        addSphere({x: cx2, y: 0, z: 0}, r2, 'url(#sphereGrad2)');
        addPoint({x: cx2, y: 0, z: 0}, 'I₂', '#fff');
        
        if (distance === r1 + r2) { // ext tangent
          addPoint({x: cx1 + r1, y: 0, z: 0}, 'M');
        } else if (distance < r1 + r2 && distance > r1 - r2) { // intersect
          // distance to intersection plane from I1
          const d1 = (distance*distance - r2*r2 + r1*r1) / (2 * distance);
          const intersectR = Math.sqrt(r1*r1 - d1*d1);
          elements.push({
            type: 'circle3d_yz',
            center: {x: cx1 + d1, y: 0, z: 0},
            r: intersectR,
            color: 'transparent', edgeColor: '#111827'
          });
        } else if (distance === r1 - r2) { // int tangent
          addPoint({x: cx1 + r1, y: 0, z: 0}, 'M');
        }
        break;
      default:
        break;
    }

    // Prepare elements with projected coordinates and calculate average Z for Z-sorting
    const projectedElements = elements.map((el, i) => {
      let avgZ = 0;
      let rendered = null;

      if (el.type === 'plane') {
        const proj = el.points.map(p => project(p.x, p.y, p.z));
        avgZ = proj.reduce((sum, p) => sum + p.z, 0) / 4;
        const pts = proj.map(p => `${p.x + 400},${p.y + 250}`).join(' ');
        rendered = (
          <polygon 
            key={i} points={pts} fill={el.color} 
            stroke={el.edgeColor} strokeWidth="2" opacity="0.8"
            strokeDasharray={el.dashed ? '5,5' : 'none'}
          />
        );
      } 
      else if (el.type === 'line') {
        const pr1 = project(el.p1.x, el.p1.y, el.p1.z);
        const pr2 = project(el.p2.x, el.p2.y, el.p2.z);
        avgZ = (pr1.z + pr2.z) / 2;
        rendered = (
          <line 
            key={i} x1={400 + pr1.x} y1={250 + pr1.y} 
            x2={400 + pr2.x} y2={250 + pr2.y} 
            stroke={el.color} strokeWidth={el.width} 
            strokeDasharray={el.dashed ? '5,5' : 'none'} 
            opacity={el.opacity || 1}
          />
        );
      }
      else if (el.type === 'point') {
        const proj = project(el.p.x, el.p.y, el.p.z);
        avgZ = proj.z + 10; // points slightly in front
        rendered = (
          <g key={i}>
            <circle cx={400 + proj.x} cy={250 + proj.y} r="4" fill={el.color} />
            {el.label && <text x={400 + proj.x + 8} y={250 + proj.y - 8} fontSize="14" fill={el.color} fontWeight="bold">{el.label}</text>}
          </g>
        );
      }
      else if (el.type === 'sphere') {
        const proj = project(el.center.x, el.center.y, el.center.z);
        avgZ = proj.z;
        rendered = <circle key={i} cx={400 + proj.x} cy={250 + proj.y} r={el.r} fill={el.color} opacity={0.9} />;
      }
      else if (el.type === 'circle3d') {
        // Approximate a 3D circle on XZ plane (y is constant)
        const pts = [];
        for (let a = 0; a <= 360; a += 10) {
          const rad = a * Math.PI / 180;
          const p = project(el.center.x + Math.cos(rad)*el.r, el.center.y, el.center.z + Math.sin(rad)*el.r);
          pts.push(p);
        }
        avgZ = pts.reduce((sum, p) => sum + p.z, 0) / pts.length;
        const d = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x + 400} ${p.y + 250}`).join(' ');
        rendered = (
          <path key={i} d={d + ' Z'} fill={el.color} stroke={el.edgeColor} strokeWidth="2" opacity="0.9" />
        );
      }
      else if (el.type === 'circle3d_yz') {
        // Approximate a 3D circle on YZ plane (x is constant)
        const pts = [];
        for (let a = 0; a <= 360; a += 10) {
          const rad = a * Math.PI / 180;
          const p = project(el.center.x, el.center.y + Math.cos(rad)*el.r, el.center.z + Math.sin(rad)*el.r);
          pts.push(p);
        }
        avgZ = pts.reduce((sum, p) => sum + p.z, 0) / pts.length;
        const d = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x + 400} ${p.y + 250}`).join(' ');
        rendered = (
          <path key={i} d={d + ' Z'} fill={el.color} stroke={el.edgeColor} strokeWidth="2" opacity="0.9" />
        );
      }

      return { avgZ, rendered };
    });

    // SVG draws elements in order of DOM presence, so smaller Z (further back) should be drawn first.
    // In our projection, smaller Z means further away? Let's check:
    // If Z axis goes into the screen? 
    // Usually +Z is towards viewer in CSS. Our project():
    // For x=0, y=0, z=100 -> rx=0, ry=0 -> x1=0, y1=0, z2=100.
    // So positive Z is towards viewer.
    // We want to draw smallest Z first (furthest away).
    projectedElements.sort((a, b) => a.avgZ - b.avgZ);

    return projectedElements.map(p => p.rendered);
  };

  return (
    <div className="oxyz-container">
      <div className="oxyz-object-selector">
        <div className="object-row">
          <span className="row-label">Đối tượng 1:</span>
          <button className={`obj-btn ${selectedObj1 === 'line' ? 'active' : ''}`} onClick={() => handleSelectObj(1, 'line')}>Đường thẳng</button>
          <button className={`obj-btn ${selectedObj1 === 'plane' ? 'active' : ''}`} onClick={() => handleSelectObj(1, 'plane')}>Mặt phẳng</button>
          <button className={`obj-btn ${selectedObj1 === 'sphere' ? 'active' : ''}`} onClick={() => handleSelectObj(1, 'sphere')}>Mặt cầu</button>
        </div>
        
        <div className="object-connector">
          <div className="connector-line"></div>
          <div className="connector-link-icon"><LinkIcon size={20} /></div>
        </div>

        <div className="object-row">
          <span className="row-label">Đối tượng 2:</span>
          <button className={`obj-btn ${selectedObj2 === 'line' ? 'active' : ''}`} onClick={() => handleSelectObj(2, 'line')}>Đường thẳng</button>
          <button className={`obj-btn ${selectedObj2 === 'plane' ? 'active' : ''}`} onClick={() => handleSelectObj(2, 'plane')}>Mặt phẳng</button>
          <button className={`obj-btn ${selectedObj2 === 'sphere' ? 'active' : ''}`} onClick={() => handleSelectObj(2, 'sphere')}>Mặt cầu</button>
        </div>
      </div>

      <div className="oxyz-content">
        <div 
          className="oxyz-visualizer"
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          onWheel={handleWheel}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="interaction-hint">
            <Rotate3d size={16} /> Cuộn chuột để Thu/Phóng - Nhấn giữ để Xoay
          </div>
          
          <div className="zoom-controls">
            <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} title="Phóng to"><ZoomIn size={18}/></button>
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} title="Thu nhỏ"><ZoomOut size={18}/></button>
            <button onClick={() => setZoom(1)} title="Mặc định"><MousePointer2 size={18} /></button>
          </div>

          <svg width="100%" height="100%" viewBox="0 0 800 500" style={{ pointerEvents: 'none' }}>
            <defs>
              <radialGradient id="sphereGrad" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#312e81" stopOpacity="0.95"/>
              </radialGradient>
              <radialGradient id="sphereGrad2" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#f472b6" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#831843" stopOpacity="0.95"/>
              </radialGradient>
            </defs>
            <g transform={`translate(400, 250) scale(${zoom}) translate(-400, -250)`}>
              {buildScene()}
            </g>
          </svg>
        </div>

        <div className="oxyz-sidebar">
          {['line_sphere', 'plane_sphere', 'sphere_sphere'].includes(activeCategory) && (
            <div className="oxyz-slider-container">
              <h3>Chỉnh khoảng cách</h3>
              <input 
                type="range" 
                min={activeCategory === 'sphere_sphere' ? 0 : 0} 
                max={activeCategory === 'sphere_sphere' ? 200 : 150} 
                value={distance} 
                onChange={handleDistanceChange}
                className="distance-slider"
              />
              <div className="slider-value">d = {distance}</div>
            </div>
          )}

          <div className="oxyz-states">
            <h3>Trạng thái</h3>
            <div className="state-buttons">
              {categoryData.states.map(state => (
                <button
                  key={state.id}
                  className={`state-btn ${activeStateId === state.id ? 'active' : ''}`}
                  onClick={() => handleStateClick(state.id)}
                >
                  {state.name}
                </button>
              ))}
            </div>
          </div>

          <div className="oxyz-info-card">
            <h4>{currentStateData.name}</h4>
            <p className="desc">{currentStateData.desc}</p>
            <div className="condition">
              <strong>Điều kiện đại số:</strong>
              <div className="math-expr">
                <MathView text={currentStateData.condition} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelativePositionsOxyz;
