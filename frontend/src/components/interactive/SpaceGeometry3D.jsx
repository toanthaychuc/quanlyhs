import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line, MapControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import './SpaceGeometry3D.css';

const SHAPE_CATEGORIES = [
  {
    id: 'quad',
    name: 'Chóp tứ giác S.ABCD',
    icon: '🔷',
    items: [
      { id: 'quad_parallelogram', name: 'Đáy là hình bình hành' },
      { id: 'quad_rectangle', name: 'Đáy là hình chữ nhật' },
      { id: 'quad_square', name: 'Đáy là hình vuông' },
      { id: 'quad_rhombus', name: 'Đáy là hình thoi' },
      { id: 'quad_arbitrary', name: 'Đáy là tứ giác bất kì' },
      { id: 'quad_trapezoid', name: 'Đáy là hình thang thường' },
      { id: 'quad_trapezoid_ab_2cd', name: 'Đáy là hình thang có AB=2CD' },
    ]
  },
  {
    id: 'tri',
    name: 'Chóp tam giác S.ABC',
    icon: '🔺',
    items: [
      { id: 'tri_general', name: 'Đáy là tam giác thường' },
      { id: 'tri_right_a', name: 'Đáy là tam giác vuông tại A' },
      { id: 'tri_right_b', name: 'Đáy là tam giác vuông tại B' },
      { id: 'tri_right_c', name: 'Đáy là tam giác vuông tại C' },
      { id: 'tri_equilateral', name: 'Đáy là tam giác đều' },
      { id: 'tri_isosceles_a', name: 'Đáy là tam giác cân tại A' },
      { id: 'tri_isosceles_b', name: 'Đáy là tam giác cân tại B' },
      { id: 'tri_isosceles_c', name: 'Đáy là tam giác cân tại C' },
    ]
  },
  {
    id: 'tetra',
    name: 'Tứ diện ABCD',
    icon: '🔶',
    items: [
      { id: 'tetra_general', name: 'Đáy BCD là tam giác thường' },
      { id: 'tetra_right_b', name: 'Đáy BCD là tam giác vuông tại B' },
      { id: 'tetra_right_c', name: 'Đáy BCD là tam giác vuông tại C' },
      { id: 'tetra_right_d', name: 'Đáy BCD là tam giác vuông tại D' },
      { id: 'tetra_equilateral', name: 'Đáy BCD là tam giác đều' },
      { id: 'tetra_isosceles_b', name: 'Đáy BCD là tam giác cân tại B' },
      { id: 'tetra_isosceles_c', name: 'Đáy BCD là tam giác cân tại C' },
      { id: 'tetra_isosceles_d', name: 'Đáy BCD là tam giác cân tại D' },
    ]
  }
];

const QUAD_FACES = [['S','A','B'], ['S','B','C'], ['S','C','D'], ['S','D','A'], ['A','B','C','D']];
const QUAD_EDGES = [['S','A'], ['S','B'], ['S','C'], ['S','D'], ['A','B'], ['B','C'], ['C','D'], ['D','A']];
const QUAD_LABELS = ['S', 'A', 'B', 'C', 'D'];

const TRI_FACES = [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']];
const TRI_EDGES = [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A']];
const TRI_LABELS = ['S', 'A', 'B', 'C'];

const TETRA_FACES = [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']];
const TETRA_EDGES = [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B']];
const TETRA_LABELS = ['A', 'B', 'C', 'D'];

const SHAPES = {
  // 1. Chóp tứ giác S.ABCD
  quad_parallelogram: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình bình hành',
    name: 'Chóp S.ABCD (đáy hình bình hành)',
    vertices: {
      S: new THREE.Vector3(-0.6, 2.5, -0.6),
      A: new THREE.Vector3(-1.5, -1, -1),
      B: new THREE.Vector3(2.5, -1, -1),
      C: new THREE.Vector3(1.5, -1, 1.5),
      D: new THREE.Vector3(-2.5, -1, 1.5),
    },
    faces: QUAD_FACES,
    edges: QUAD_EDGES,
    labels: QUAD_LABELS
  },
  quad_rectangle: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình chữ nhật',
    name: 'Chóp S.ABCD (đáy hình chữ nhật)',
    vertices: {
      S: new THREE.Vector3(-0.6, 2.5, -0.6),
      A: new THREE.Vector3(-1.8, -1, -1),
      B: new THREE.Vector3(1.8, -1, -1),
      C: new THREE.Vector3(1.8, -1, 1.5),
      D: new THREE.Vector3(-1.8, -1, 1.5),
    },
    faces: QUAD_FACES,
    edges: QUAD_EDGES,
    labels: QUAD_LABELS
  },
  quad_square: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình vuông',
    name: 'Chóp S.ABCD (đáy hình vuông)',
    vertices: {
      S: new THREE.Vector3(-0.5, 2.6, -0.5),
      A: new THREE.Vector3(-1.5, -1, -1.5),
      B: new THREE.Vector3(1.5, -1, -1.5),
      C: new THREE.Vector3(1.5, -1, 1.5),
      D: new THREE.Vector3(-1.5, -1, 1.5),
    },
    faces: QUAD_FACES,
    edges: QUAD_EDGES,
    labels: QUAD_LABELS
  },
  quad_rhombus: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình thoi',
    name: 'Chóp S.ABCD (đáy hình thoi)',
    vertices: {
      S: new THREE.Vector3(-0.6, 2.5, -0.6),
      A: new THREE.Vector3(-1.2, -1, -1),
      B: new THREE.Vector3(2.0, -1, -1),
      C: new THREE.Vector3(-0.12, -1, 1.4),
      D: new THREE.Vector3(-3.32, -1, 1.4),
    },
    faces: QUAD_FACES,
    edges: QUAD_EDGES,
    labels: QUAD_LABELS
  },
  quad_arbitrary: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là tứ giác bất kì',
    name: 'Chóp S.ABCD (đáy tứ giác bất kì)',
    vertices: {
      S: new THREE.Vector3(-0.4, 2.8, -0.4),
      A: new THREE.Vector3(-2.0, -1, -1.2),
      B: new THREE.Vector3(2.6, -1, -0.8),
      C: new THREE.Vector3(1.8, -1, 1.6),
      D: new THREE.Vector3(-2.2, -1, 1.2),
    },
    faces: QUAD_FACES,
    edges: QUAD_EDGES,
    labels: QUAD_LABELS
  },
  quad_trapezoid: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình thang thường',
    name: 'Chóp S.ABCD (đáy hình thang thường)',
    vertices: {
      S: new THREE.Vector3(-0.5, 2.6, -0.6),
      A: new THREE.Vector3(-1.5, -1, -1),
      B: new THREE.Vector3(2.5, -1, -1),
      C: new THREE.Vector3(1.0, -1, 1.5),
      D: new THREE.Vector3(-1.6, -1, 1.5),
    },
    faces: QUAD_FACES,
    edges: QUAD_EDGES,
    labels: QUAD_LABELS
  },
  quad_trapezoid_ab_2cd: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình thang có AB=2CD',
    name: 'Chóp S.ABCD (đáy hình thang AB=2CD)',
    vertices: {
      S: new THREE.Vector3(-0.6, 2.6, -0.6),
      A: new THREE.Vector3(-2.0, -1, -1),
      B: new THREE.Vector3(2.0, -1, -1),
      C: new THREE.Vector3(0.5, -1, 1.5),
      D: new THREE.Vector3(-1.5, -1, 1.5),
    },
    faces: QUAD_FACES,
    edges: QUAD_EDGES,
    labels: QUAD_LABELS
  },

  // 2. Chóp tam giác S.ABC
  tri_general: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác thường',
    name: 'Chóp S.ABC (đáy tam giác thường)',
    vertices: {
      S: new THREE.Vector3(-0.5, 2.6, -0.4),
      A: new THREE.Vector3(-1.6, -1, -1),
      B: new THREE.Vector3(2.2, -1, -0.8),
      C: new THREE.Vector3(0.2, -1, 1.5),
    },
    faces: TRI_FACES,
    edges: TRI_EDGES,
    labels: TRI_LABELS
  },
  tri_right_a: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác vuông tại A',
    name: 'Chóp S.ABC (đáy vuông tại A)',
    vertices: {
      S: new THREE.Vector3(-0.5, 2.6, -0.3),
      A: new THREE.Vector3(-1.2, -1, -1),
      B: new THREE.Vector3(2.0, -1, -1),
      C: new THREE.Vector3(-1.2, -1, 1.6),
    },
    faces: TRI_FACES,
    edges: TRI_EDGES,
    labels: TRI_LABELS
  },
  tri_right_b: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác vuông tại B',
    name: 'Chóp S.ABC (đáy vuông tại B)',
    vertices: {
      S: new THREE.Vector3(-0.6, 2.6, -0.4),
      A: new THREE.Vector3(-2.0, -1, -1),
      B: new THREE.Vector3(1.5, -1, -1),
      C: new THREE.Vector3(1.5, -1, 1.6),
    },
    faces: TRI_FACES,
    edges: TRI_EDGES,
    labels: TRI_LABELS
  },
  tri_right_c: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác vuông tại C',
    name: 'Chóp S.ABC (đáy vuông tại C)',
    vertices: {
      S: new THREE.Vector3(-0.5, 2.6, -0.4),
      A: new THREE.Vector3(-1.8, -1, -0.5),
      B: new THREE.Vector3(2.0, -1, -0.3),
      C: new THREE.Vector3(0, -1, 1.5),
    },
    faces: TRI_FACES,
    edges: TRI_EDGES,
    labels: TRI_LABELS
  },
  tri_equilateral: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác đều',
    name: 'Chóp S.ABC (đáy tam giác đều)',
    vertices: {
      S: new THREE.Vector3(-0.5, 2.6, -0.3),
      A: new THREE.Vector3(-1.8, -1, -1),
      B: new THREE.Vector3(1.8, -1, -1),
      C: new THREE.Vector3(0, -1, 2.12),
    },
    faces: TRI_FACES,
    edges: TRI_EDGES,
    labels: TRI_LABELS
  },
  tri_isosceles_a: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác cân tại A',
    name: 'Chóp S.ABC (đáy cân tại A)',
    vertices: {
      S: new THREE.Vector3(-0.6, 2.6, -0.4),
      A: new THREE.Vector3(-1.5, -1, -1),
      B: new THREE.Vector3(2.0, -1, -1),
      C: new THREE.Vector3(0.95, -1, 1.5),
    },
    faces: TRI_FACES,
    edges: TRI_EDGES,
    labels: TRI_LABELS
  },
  tri_isosceles_b: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác cân tại B',
    name: 'Chóp S.ABC (đáy cân tại B)',
    vertices: {
      S: new THREE.Vector3(-0.6, 2.6, -0.4),
      A: new THREE.Vector3(-1.5, -1, -1),
      B: new THREE.Vector3(2.0, -1, -1),
      C: new THREE.Vector3(-0.45, -1, 1.5),
    },
    faces: TRI_FACES,
    edges: TRI_EDGES,
    labels: TRI_LABELS
  },
  tri_isosceles_c: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác cân tại C',
    name: 'Chóp S.ABC (đáy cân tại C)',
    vertices: {
      S: new THREE.Vector3(-0.5, 2.6, -0.4),
      A: new THREE.Vector3(-1.8, -1, -1),
      B: new THREE.Vector3(1.8, -1, -1),
      C: new THREE.Vector3(0, -1, 1.6),
    },
    faces: TRI_FACES,
    edges: TRI_EDGES,
    labels: TRI_LABELS
  },

  // 3. Tứ diện ABCD (đáy BCD)
  tetra_general: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy BCD là tam giác thường',
    name: 'Tứ diện ABCD (đáy BCD thường)',
    vertices: {
      A: new THREE.Vector3(-0.5, 2.6, -0.4),
      B: new THREE.Vector3(-1.6, -1, -1),
      C: new THREE.Vector3(2.2, -1, -0.8),
      D: new THREE.Vector3(0.2, -1, 1.5),
    },
    faces: TETRA_FACES,
    edges: TETRA_EDGES,
    labels: TETRA_LABELS
  },
  tetra_right_b: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy BCD là tam giác vuông tại B',
    name: 'Tứ diện ABCD (đáy BCD vuông tại B)',
    vertices: {
      A: new THREE.Vector3(-0.5, 2.6, -0.3),
      B: new THREE.Vector3(-1.2, -1, -1),
      C: new THREE.Vector3(2.0, -1, -1),
      D: new THREE.Vector3(-1.2, -1, 1.6),
    },
    faces: TETRA_FACES,
    edges: TETRA_EDGES,
    labels: TETRA_LABELS
  },
  tetra_right_c: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy BCD là tam giác vuông tại C',
    name: 'Tứ diện ABCD (đáy BCD vuông tại C)',
    vertices: {
      A: new THREE.Vector3(-0.5, 2.6, -0.3),
      B: new THREE.Vector3(-2.0, -1, -1),
      C: new THREE.Vector3(1.5, -1, -1),
      D: new THREE.Vector3(1.5, -1, 1.6),
    },
    faces: TETRA_FACES,
    edges: TETRA_EDGES,
    labels: TETRA_LABELS
  },
  tetra_right_d: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy BCD là tam giác vuông tại D',
    name: 'Tứ diện ABCD (đáy BCD vuông tại D)',
    vertices: {
      A: new THREE.Vector3(-0.5, 2.6, -0.4),
      B: new THREE.Vector3(-1.8, -1, -0.5),
      C: new THREE.Vector3(2.0, -1, -0.3),
      D: new THREE.Vector3(0, -1, 1.5),
    },
    faces: TETRA_FACES,
    edges: TETRA_EDGES,
    labels: TETRA_LABELS
  },
  tetra_equilateral: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy BCD là tam giác đều',
    name: 'Tứ diện ABCD (đáy BCD đều)',
    vertices: {
      A: new THREE.Vector3(-0.5, 2.6, -0.3),
      B: new THREE.Vector3(-1.8, -1, -1),
      C: new THREE.Vector3(1.8, -1, -1),
      D: new THREE.Vector3(0, -1, 2.12),
    },
    faces: TETRA_FACES,
    edges: TETRA_EDGES,
    labels: TETRA_LABELS
  },
  tetra_isosceles_b: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy BCD là tam giác cân tại B',
    name: 'Tứ diện ABCD (đáy BCD cân tại B)',
    vertices: {
      A: new THREE.Vector3(-0.6, 2.6, -0.4),
      B: new THREE.Vector3(-1.5, -1, -1),
      C: new THREE.Vector3(2.0, -1, -1),
      D: new THREE.Vector3(0.95, -1, 1.5),
    },
    faces: TETRA_FACES,
    edges: TETRA_EDGES,
    labels: TETRA_LABELS
  },
  tetra_isosceles_c: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy BCD là tam giác cân tại C',
    name: 'Tứ diện ABCD (đáy BCD cân tại C)',
    vertices: {
      A: new THREE.Vector3(-0.6, 2.6, -0.4),
      B: new THREE.Vector3(-1.5, -1, -1),
      C: new THREE.Vector3(2.0, -1, -1),
      D: new THREE.Vector3(-0.45, -1, 1.5),
    },
    faces: TETRA_FACES,
    edges: TETRA_EDGES,
    labels: TETRA_LABELS
  },
  tetra_isosceles_d: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy BCD là tam giác cân tại D',
    name: 'Tứ diện ABCD (đáy BCD cân tại D)',
    vertices: {
      A: new THREE.Vector3(-0.5, 2.6, -0.4),
      B: new THREE.Vector3(-1.8, -1, -1),
      C: new THREE.Vector3(1.8, -1, -1),
      D: new THREE.Vector3(0, -1, 1.6),
    },
    faces: TETRA_FACES,
    edges: TETRA_EDGES,
    labels: TETRA_LABELS
  }
};

// Legacy aliases so old state / bookmarks do not break
SHAPES.parallelogramPyramid = SHAPES.quad_parallelogram;
SHAPES.quadrilateralPyramid = SHAPES.quad_arbitrary;
SHAPES.trapezoidPyramid = SHAPES.quad_trapezoid;
SHAPES.rectanglePyramid = SHAPES.quad_rectangle;
SHAPES.tetrahedron = SHAPES.tetra_general;
SHAPES.triangularPyramid = SHAPES.tri_general;

const ShapeHierarchySelect = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, openLeft: false });

  const currentShape = SHAPES[value] || SHAPES.quad_parallelogram;

  const updatePosition = useCallback(() => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const openLeft = rect.left + 540 > window.innerWidth;
      setPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        openLeft
      });
    }
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
      const curCat = SHAPE_CATEGORIES.find(c => c.items.some(i => i.id === value));
      setActiveCategory(curCat ? curCat.id : SHAPE_CATEGORIES[0].id);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => updatePosition();
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen, updatePosition]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        className="shape-select-btn"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.55rem 0.75rem',
          background: 'var(--surface-color, #ffffff)',
          border: `1.5px solid ${isOpen ? 'var(--primary-color, #2563eb)' : 'var(--border-color, #cbd5e1)'}`,
          borderRadius: '8px',
          cursor: 'pointer',
          textAlign: 'left',
          boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
          transition: 'all 0.2s',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
            {currentShape?.categoryName || 'Mô hình'}
          </span>
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {currentShape?.subName || currentShape?.name}
          </span>
        </div>
        <span style={{ fontSize: '13px', color: '#64748b', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </button>

      {isOpen && createPortal(
        <div
          ref={menuRef}
          className="shape-hierarchy-dropdown"
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: Math.max(260, pos.width),
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
            zIndex: 99999,
            padding: '6px',
            fontFamily: 'inherit'
          }}
        >
          {SHAPE_CATEGORIES.map(category => {
            const isCatActive = activeCategory === category.id;
            const hasSelectedChild = category.items.some(i => i.id === value);
            return (
              <div
                key={category.id}
                className="shape-cat-row"
                onMouseEnter={() => setActiveCategory(category.id)}
                onClick={() => setActiveCategory(category.id)}
                style={{
                  position: 'relative',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isCatActive ? '#eff6ff' : 'transparent',
                  color: isCatActive ? '#1d4ed8' : '#334155',
                  fontWeight: hasSelectedChild ? 600 : 500,
                  fontSize: '13.5px',
                  transition: 'background 0.15s, color 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </div>
                <span style={{ fontSize: '12px', opacity: 0.6 }}>
                  {pos.openLeft ? '◀' : '▶'}
                </span>

                {/* Submenu on hover */}
                {isCatActive && (
                  <div
                    className="shape-submenu-flyout"
                    style={{
                      position: 'absolute',
                      top: 0,
                      ...(pos.openLeft
                        ? { right: '100%', paddingRight: '6px' }
                        : { left: '100%', paddingLeft: '6px' }),
                      zIndex: 100000,
                      cursor: 'default'
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div
                      style={{
                        background: '#ffffff',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 12px 28px -4px rgba(0,0,0,0.18), 0 8px 12px -6px rgba(0,0,0,0.12)',
                        padding: '6px',
                        minWidth: '240px',
                        maxHeight: '340px',
                        overflowY: 'auto'
                      }}
                    >
                      <div style={{ padding: '4px 10px 6px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                        Tùy chọn đáy
                      </div>
                      {category.items.map(subItem => {
                        const isSelected = value === subItem.id;
                        return (
                          <div
                            key={subItem.id}
                            className="shape-sub-item-row"
                            onClick={() => {
                              onChange(subItem.id);
                              setIsOpen(false);
                            }}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: isSelected ? '#dbeafe' : 'transparent',
                              color: isSelected ? '#1e40af' : '#334155',
                              fontWeight: isSelected ? 600 : 400,
                              fontSize: '13px',
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => {
                              if (!isSelected) {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.color = '#2563eb';
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isSelected) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#334155';
                              }
                            }}
                          >
                            <span>{subItem.name}</span>
                            {isSelected && (
                              <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '13px' }}>✓</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
};


const getPlaneNormal = (vertices, p1, p2, p3) => {
  const v1 = new THREE.Vector3().subVectors(vertices[p2], vertices[p1]);
  const v2 = new THREE.Vector3().subVectors(vertices[p3], vertices[p1]);
  return new THREE.Vector3().crossVectors(v1, v2).normalize();
};

const getLinePlaneIntersection = (vertices, l1, l2, p1, p2, p3) => {
  if ([p1, p2, p3].includes(l1)) return vertices[l1];
  if ([p1, p2, p3].includes(l2)) return vertices[l2];
  
  const n = getPlaneNormal(vertices, p1, p2, p3);
  const vL1 = vertices[l1];
  const vL2 = vertices[l2];
  const d = new THREE.Vector3().subVectors(vL2, vL1);
  const dot = n.dot(d);
  
  if (Math.abs(dot) < 1e-6) return null; // parallel or inside
  
  const w = new THREE.Vector3().subVectors(vertices[p1], vL1);
  const t = n.dot(w) / dot;
  
  return new THREE.Vector3().copy(vL1).add(d.multiplyScalar(t));
};

const getLinesIntersection = (verts, l1, l2) => {
  const p1 = verts[l1[0]], p2 = verts[l1[1]];
  const p3 = verts[l2[0]], p4 = verts[l2[1]];
  
  if (!p1 || !p2 || !p3 || !p4) return null;
  
  const d1 = new THREE.Vector3().subVectors(p2, p1);
  const d2 = new THREE.Vector3().subVectors(p4, p3);
  const w0 = new THREE.Vector3().subVectors(p1, p3);

  const a = d1.dot(d1);
  const b = d1.dot(d2);
  const c = d2.dot(d2);
  const d = d1.dot(w0);
  const e = d2.dot(w0);
  
  const denom = a * c - b * b;
  if (Math.abs(denom) < 1e-6) return null;

  const sc = (b * e - c * d) / denom;
  const tc = (a * e - b * d) / denom;

  const pt1 = new THREE.Vector3().copy(p1).add(d1.multiplyScalar(sc));
  const pt2 = new THREE.Vector3().copy(p3).add(d2.multiplyScalar(tc));
  
  if (pt1.distanceTo(pt2) > 0.05) return null;
  return pt1;
};

const getPointOnPlanesIntersection = (n1, d1, n2, d2) => {
  const dir = new THREE.Vector3().crossVectors(n1, n2);
  if (dir.lengthSq() < 1e-6) return null;
  
  const ax = Math.abs(dir.x);
  const ay = Math.abs(dir.y);
  const az = Math.abs(dir.z);
  
  let pt = new THREE.Vector3();
  
  if (ax >= ay && ax >= az) {
    const det = n1.y * n2.z - n1.z * n2.y;
    pt.x = 0;
    pt.y = (d1 * n2.z - d2 * n1.z) / det;
    pt.z = (n1.y * d2 - n2.y * d1) / det;
  } else if (ay >= ax && ay >= az) {
    const det = n1.x * n2.z - n1.z * n2.x;
    pt.y = 0;
    pt.x = (d1 * n2.z - d2 * n1.z) / det;
    pt.z = (n1.x * d2 - n2.x * d1) / det;
  } else {
    const det = n1.x * n2.y - n1.y * n2.x;
    pt.z = 0;
    pt.x = (d1 * n2.y - d2 * n1.y) / det;
    pt.y = (n1.x * d2 - n2.x * d1) / det;
  }
  return pt;
};

const getPlanesIntersection = (vertices, plane1, plane2) => {
  const n1 = getPlaneNormal(vertices, plane1[0], plane1[1], plane1[2]);
  const n2 = getPlaneNormal(vertices, plane2[0], plane2[1], plane2[2]);
  const dir = new THREE.Vector3().crossVectors(n1, n2);
  
  if (dir.lengthSq() < 1e-6) return null; // Parallel or identical planes
  dir.normalize();
  
  const shared = plane1.find(v => plane2.includes(v));
  let pt;
  if (shared) {
    pt = vertices[shared];
  } else {
    const d1 = n1.dot(vertices[plane1[0]]);
    const d2 = n2.dot(vertices[plane2[0]]);
    pt = getPointOnPlanesIntersection(n1, d1, n2, d2);
    if (!pt) pt = new THREE.Vector3(0,0,0);
  }
  
  return { point: pt, dir };
};

const PlaneMesh = ({ vertices, selected, color }) => {
  const geom = useMemo(() => {
    if (selected.length < 3) return null;
    const pts = selected.map(v => vertices[v]).filter(Boolean);
    if (pts.length < 3) return null;

    const n = new THREE.Vector3()
      .crossVectors(new THREE.Vector3().subVectors(pts[1], pts[0]), new THREE.Vector3().subVectors(pts[2], pts[0]))
      .normalize();
    const center = new THREE.Vector3();
    pts.forEach(p => center.add(p));
    center.divideScalar(pts.length);
    const u = new THREE.Vector3().subVectors(pts[0], center).normalize();
    const w = new THREE.Vector3().crossVectors(n, u).normalize();
    const ordered = [...pts].sort((a, b) => {
      const da = new THREE.Vector3().subVectors(a, center);
      const db = new THREE.Vector3().subVectors(b, center);
      return Math.atan2(da.dot(w), da.dot(u)) - Math.atan2(db.dot(w), db.dot(u));
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(ordered);
    const indices = [];
    for (let i = 1; i < ordered.length - 1; i++) indices.push(0, i, i + 1);
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }, [vertices, selected]);

  if (!geom) return null;

  return (
    <mesh geometry={geom}>
      <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
};

const IntersectionLine = ({ point, dir }) => {
  if (!point || !dir) return null;
  
  const pts = useMemo(() => {
    return [
      new THREE.Vector3().copy(point).add(dir.clone().multiplyScalar(10)),
      new THREE.Vector3().copy(point).add(dir.clone().multiplyScalar(-10))
    ];
  }, [point, dir]);
  
  return <Line points={pts} color="#8b5cf6" lineWidth={4} />;
};

const SelectedLine = ({ vertices, v1, v2 }) => {
  const p1 = vertices[v1];
  const p2 = vertices[v2];
  
  const extendedPts = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
    return [
      new THREE.Vector3().copy(p1).add(dir.clone().multiplyScalar(10)),
      new THREE.Vector3().copy(p1).add(dir.clone().multiplyScalar(-10))
    ];
  }, [p1, p2]);

  return (
    <group>
      <Line points={[p1, p2]} color="#ef4444" lineWidth={4} />
      <Line points={extendedPts} color="#ef4444" lineWidth={1} dashed dashSize={0.2} gapSize={0.2} />
    </group>
  );
};

const IntersectionPoint = ({ point }) => {
  if (!point) return null;
  return (
    <mesh position={point}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color="#f59e0b" />
    </mesh>
  );
};

const ShapeEdge = ({ edge, shape, useDashed }) => {
  const solidRef = useRef();
  const dashedRef = useRef();
  
  const p1 = shape.vertices[edge[0]];
  const p2 = shape.vertices[edge[1]];
  
  const edgeFaces = useMemo(() => {
    return shape.faces.filter(f => f.includes(edge[0]) && f.includes(edge[1]));
  }, [shape, edge]);
  
  const shapeCenter = useMemo(() => {
    const vals = Object.values(shape.vertices);
    const sum = vals.reduce((acc, v) => acc.add(v.clone()), new THREE.Vector3());
    return sum.divideScalar(vals.length);
  }, [shape]);
  
  const faceData = useMemo(() => {
    return edgeFaces.map(f => {
      const pts = f.map(v => shape.vertices[v]);
      const v1 = new THREE.Vector3().subVectors(pts[1], pts[0]);
      const v2 = new THREE.Vector3().subVectors(pts[2], pts[0]);
      let n = new THREE.Vector3().crossVectors(v1, v2).normalize();
      
      const faceCenter = new THREE.Vector3().add(pts[0]).add(pts[1]).add(pts[2]).divideScalar(3);
      const toFace = new THREE.Vector3().subVectors(faceCenter, shapeCenter);
      
      if (n.dot(toFace) < 0) {
        n.negate();
      }
      return { n, center: faceCenter };
    });
  }, [edgeFaces, shape, shapeCenter]);
  
  useEffect(() => {
    if (dashedRef.current) dashedRef.current.computeLineDistances();
  }, [p1, p2]);

  useFrame(({ camera }) => {
    if (!solidRef.current || !dashedRef.current) return;
    
    if (!useDashed) {
      solidRef.current.visible = true;
      dashedRef.current.visible = false;
      return;
    }
    
    let isVisible = false;
    for (const fd of faceData) {
      const camDir = new THREE.Vector3().subVectors(camera.position, fd.center);
      if (fd.n.dot(camDir) > -0.01) { 
        isVisible = true;
        break;
      }
    }
    
    if (isVisible) {
      solidRef.current.visible = true;
      dashedRef.current.visible = false;
    } else {
      solidRef.current.visible = false;
      dashedRef.current.visible = true;
    }
  });

  return (
    <group>
      <Line 
        ref={solidRef}
        points={[[p1.x, p1.y, p1.z], [p2.x, p2.y, p2.z]]}
        color="#475569"
        lineWidth={2}
      />
      <Line 
        ref={dashedRef}
        points={[[p1.x, p1.y, p1.z], [p2.x, p2.y, p2.z]]}
        color="#64748b"
        lineWidth={2}
        dashed={true}
        dashSize={0.2}
        gapSize={0.2}
      />
    </group>
  );
};

const isSegmentOnFace = (p1, p2, faceVerts, shapeCenter) => {
  if (!p1 || !p2 || !faceVerts || faceVerts.length < 3) return null;
  
  const v0 = faceVerts[0];
  const v1 = faceVerts[1];
  const v2 = faceVerts[2];
  const edge1 = new THREE.Vector3().subVectors(v1, v0);
  const edge2 = new THREE.Vector3().subVectors(v2, v0);
  let n = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
  
  const faceCenter = new THREE.Vector3();
  faceVerts.forEach(v => faceCenter.add(v));
  faceCenter.divideScalar(faceVerts.length);
  
  const toFace = new THREE.Vector3().subVectors(faceCenter, shapeCenter);
  if (n.dot(toFace) < 0) {
    n.negate();
  }
  
  const d1 = Math.abs(new THREE.Vector3().subVectors(p1, v0).dot(n));
  const d2 = Math.abs(new THREE.Vector3().subVectors(p2, v0).dot(n));
  if (d1 > 0.06 || d2 > 0.06) return null;
  
  const u = edge1.clone().normalize();
  const v = new THREE.Vector3().crossVectors(n, u).normalize();
  
  const poly2D = faceVerts.map(pt => ({
    x: new THREE.Vector3().subVectors(pt, v0).dot(u),
    y: new THREE.Vector3().subVectors(pt, v0).dot(v)
  }));
  
  const checkPointInPoly = (pt3d) => {
    const px = new THREE.Vector3().subVectors(pt3d, v0).dot(u);
    const py = new THREE.Vector3().subVectors(pt3d, v0).dot(v);
    
    let posCount = 0;
    let negCount = 0;
    const eps = 0.04;
    for (let i = 0; i < poly2D.length; i++) {
      const pA = poly2D[i];
      const pB = poly2D[(i + 1) % poly2D.length];
      const cross = (pB.x - pA.x) * (py - pA.y) - (pB.y - pA.y) * (px - pA.x);
      if (cross > eps) posCount++;
      else if (cross < -eps) negCount++;
    }
    return posCount === 0 || negCount === 0;
  };
  
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  if (checkPointInPoly(p1) && checkPointInPoly(p2) && checkPointInPoly(mid)) {
    return { n, center: mid };
  }
  return null;
};

const CustomConnectionLine = ({ p1, p2, shape, useDashed }) => {
  const solidRef = useRef();
  const dashedRef = useRef();
  
  const shapeCenter = useMemo(() => {
    const vals = Object.values(shape.vertices);
    const sum = vals.reduce((acc, v) => acc.add(v.clone()), new THREE.Vector3());
    return sum.divideScalar(vals.length);
  }, [shape]);
  
  const facesData = useMemo(() => {
    if (!p1 || !p2 || !shape || !shape.faces) return [];
    const matched = [];
    shape.faces.forEach(face => {
      const faceVerts = face.map(v => shape.vertices[v]).filter(Boolean);
      const res = isSegmentOnFace(p1, p2, faceVerts, shapeCenter);
      if (res) matched.push(res);
    });
    return matched;
  }, [p1, p2, shape, shapeCenter]);

  useEffect(() => {
    if (dashedRef.current) dashedRef.current.computeLineDistances();
  }, [p1, p2]);

  useFrame(({ camera }) => {
    if (!solidRef.current || !dashedRef.current) return;
    
    if (!useDashed) {
      solidRef.current.visible = true;
      dashedRef.current.visible = false;
      return;
    }
    
    if (facesData.length === 0) {
      solidRef.current.visible = false;
      dashedRef.current.visible = true;
      return;
    }
    
    let isVisible = false;
    for (const fd of facesData) {
      const camDir = new THREE.Vector3().subVectors(camera.position, fd.center);
      if (fd.n.dot(camDir) > -0.01) {
        isVisible = true;
        break;
      }
    }
    
    if (isVisible) {
      solidRef.current.visible = true;
      dashedRef.current.visible = false;
    } else {
      solidRef.current.visible = false;
      dashedRef.current.visible = true;
    }
  });

  return (
    <group>
      <Line 
        ref={solidRef}
        points={[[p1.x, p1.y, p1.z], [p2.x, p2.y, p2.z]]}
        color="#0ea5e9"
        lineWidth={3}
      />
      <Line 
        ref={dashedRef}
        points={[[p1.x, p1.y, p1.z], [p2.x, p2.y, p2.z]]}
        color="#0ea5e9"
        lineWidth={3}
        dashed={true}
        dashSize={0.2}
        gapSize={0.1}
      />
    </group>
  );
};

const CrossSectionMesh = ({ vertices, shapeEdges, selectedPts }) => {
  const geomData = useMemo(() => {
    if (selectedPts.length < 3) return null;
    const p1 = vertices[selectedPts[0]];
    const p2 = vertices[selectedPts[1]];
    const p3 = vertices[selectedPts[2]];
    if (!p1 || !p2 || !p3) return null;

    const n = new THREE.Vector3().subVectors(p2, p1).cross(new THREE.Vector3().subVectors(p3, p1)).normalize();
    if (n.lengthSq() < 1e-6) return null;

    const sectionPts = [];
    
    shapeEdges.forEach(edge => {
      const v1 = vertices[edge[0]];
      const v2 = vertices[edge[1]];
      if (!v1 || !v2) return;
      
      const d1 = new THREE.Vector3().subVectors(v1, p1).dot(n);
      const d2 = new THREE.Vector3().subVectors(v2, p1).dot(n);
      
      if (Math.abs(d1) < 1e-5) {
        sectionPts.push(v1);
      } else if (Math.abs(d2) < 1e-5) {
        sectionPts.push(v2);
      } else if (d1 * d2 < 0) {
        const t = Math.abs(d1) / (Math.abs(d1) + Math.abs(d2));
        const pt = new THREE.Vector3().copy(v1).lerp(v2, t);
        sectionPts.push(pt);
      }
    });
    
    if (sectionPts.length < 3) return null;
    
    const uniquePts = [];
    sectionPts.forEach(pt => {
      if (!uniquePts.some(upt => upt.distanceToSquared(pt) < 1e-5)) {
        uniquePts.push(pt);
      }
    });
    
    if (uniquePts.length < 3) return null;
    
    const center = new THREE.Vector3();
    uniquePts.forEach(pt => center.add(pt));
    center.divideScalar(uniquePts.length);
    
    const u = new THREE.Vector3().subVectors(uniquePts[0], center).normalize();
    const v = new THREE.Vector3().crossVectors(n, u).normalize();
    
    uniquePts.sort((a, b) => {
      const da = new THREE.Vector3().subVectors(a, center);
      const db = new THREE.Vector3().subVectors(b, center);
      const angleA = Math.atan2(da.dot(v), da.dot(u));
      const angleB = Math.atan2(db.dot(v), db.dot(u));
      return angleA - angleB;
    });
    
    const geometry = new THREE.BufferGeometry().setFromPoints(uniquePts);
    const indices = [];
    for (let i = 1; i < uniquePts.length - 1; i++) {
      indices.push(0, i, i + 1);
    }
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return { geometry, uniquePts };
  }, [vertices, shapeEdges, selectedPts]);

  if (!geomData) return null;
  
  const linePts = [...geomData.uniquePts, geomData.uniquePts[0]];
  
  return (
    <group>
      <mesh geometry={geomData.geometry}>
        <meshBasicMaterial color="#db2777" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Line points={linePts} color="#be185d" lineWidth={3} />
    </group>
  );
};

const SvgDraggableLabel = ({ label, x, y, svgRef }) => {
  const [offset, setOffset] = useState({ x: 0, y: -22 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });
  const MAX_DIST = 40;

  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.stopPropagation();
    const k = svgRef.current?.getScreenCTM()?.a || 1;
    let nx = offsetStart.current.x + (e.clientX - dragStart.current.x) / k;
    let ny = offsetStart.current.y + (e.clientY - dragStart.current.y) / k;
    const dist = Math.hypot(nx, ny);
    if (dist > MAX_DIST) {
      nx = (nx / dist) * MAX_DIST;
      ny = (ny / dist) * MAX_DIST;
    }
    setOffset({ x: nx, y: ny });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  return (
    <text
      x={x + offset.x}
      y={y + offset.y}
      textAnchor="middle"
      dominantBaseline="central"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        fill: '#0f172a',
        fontWeight: 'bold',
        fontSize: '20px',
        paintOrder: 'stroke',
        stroke: 'white',
        strokeWidth: 4,
        userSelect: 'none',
        touchAction: 'none'
      }}
    >
      {label || '?'}
    </text>
  );
};

const Plane2DViewer = ({ 
  planeLabels, 
  vertices, 
  connections = [], 
  shapeEdges = [], 
  customPoints = [], 
  onClose 
}) => {
  const [rotationZ, setRotationZ] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const panStart = useRef(null);

  const points2D = useMemo(() => {
    let p1 = vertices[planeLabels[0]];
    let p2 = vertices[planeLabels[1]];
    let p3 = vertices[planeLabels[2]];
    
    if (!p1 || !p2 || !p3) return [];

    let xAxis = new THREE.Vector3().subVectors(p2, p1);
    if (xAxis.lengthSq() < 1e-6) return [];
    xAxis.normalize();

    let v13 = new THREE.Vector3().subVectors(p3, p1);
    let normal = new THREE.Vector3().crossVectors(xAxis, v13);
    
    if (normal.lengthSq() < 1e-6 && planeLabels.length > 3) {
      for (let i = 3; i < planeLabels.length; i++) {
        const altP = vertices[planeLabels[i]];
        if (altP) {
          v13 = new THREE.Vector3().subVectors(altP, p1);
          normal = new THREE.Vector3().crossVectors(xAxis, v13);
          if (normal.lengthSq() > 1e-6) {
            p3 = altP;
            break;
          }
        }
      }
    }
    if (normal.lengthSq() < 1e-6) return [];
    normal.normalize();

    const yAxis = new THREE.Vector3().crossVectors(normal, xAxis).normalize();
    const plane = new THREE.Plane().setFromCoplanarPoints(p1, p2, p3);

    const pts = [];
    for (const [label, pt] of Object.entries(vertices)) {
      if (Math.abs(plane.distanceToPoint(pt)) < 0.05) {
        const v = new THREE.Vector3().subVectors(pt, p1);
        const x = v.dot(xAxis);
        const y = v.dot(yAxis);
        pts.push({ label, x, y });
      }
    }
    return pts;
  }, [planeLabels, vertices]);

  const { centeredPoints, maxRadius } = useMemo(() => {
    if (points2D.length < 3) return { centeredPoints: [], maxRadius: 1 };
    
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    points2D.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    
    const centeredPoints = points2D.map(p => ({
      label: p.label,
      x: p.x - cx,
      y: p.y - cy
    }));

    const maxRadius = Math.max(...centeredPoints.map(p => Math.hypot(p.x, p.y)), 0.0001);
    return { centeredPoints, maxRadius };
  }, [points2D]);

  const toScreen = useCallback((x, y) => {
    const base = 220 / maxRadius;
    const a = (rotationZ * Math.PI) / 180;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    return {
      sx: rx * base * zoom + pan.x,
      sy: -ry * base * zoom + pan.y
    };
  }, [maxRadius, rotationZ, zoom, pan]);

  const screenPosMap = useMemo(() => {
    const map = {};
    centeredPoints.forEach(p => {
      map[p.label] = toScreen(p.x, p.y);
    });
    return map;
  }, [centeredPoints, toScreen]);

  // The shaded polygon of the main plane (planeLabels)
  const facePolygonPts = useMemo(() => {
    const facePoints = centeredPoints.filter(p => planeLabels.includes(p.label));
    if (facePoints.length < 3) return [];
    
    const fcx = facePoints.reduce((acc, p) => acc + p.x, 0) / facePoints.length;
    const fcy = facePoints.reduce((acc, p) => acc + p.y, 0) / facePoints.length;
    
    const sorted = [...facePoints].sort((a, b) => 
      Math.atan2(a.y - fcy, a.x - fcx) - Math.atan2(b.y - fcy, b.x - fcx)
    );
    
    return sorted.map(p => screenPosMap[p.label]).filter(Boolean);
  }, [centeredPoints, planeLabels, screenPosMap]);

  // Collect all lines lying in this plane
  const planeLines = useMemo(() => {
    const lineMap = new Map();

    const addLine = (u, v, style) => {
      if (!u || !v || u === v) return;
      if (!screenPosMap[u] || !screenPosMap[v]) return;
      const key = [u, v].sort().join('-');
      if (!lineMap.has(key) || style === 'connection') {
        lineMap.set(key, {
          u,
          v,
          p1: screenPosMap[u],
          p2: screenPosMap[v],
          style
        });
      }
    };

    // 1. Plane polygon boundary edges
    const facePoints = centeredPoints.filter(p => planeLabels.includes(p.label));
    if (facePoints.length >= 3) {
      const fcx = facePoints.reduce((acc, p) => acc + p.x, 0) / facePoints.length;
      const fcy = facePoints.reduce((acc, p) => acc + p.y, 0) / facePoints.length;
      const sorted = [...facePoints].sort((a, b) => 
        Math.atan2(a.y - fcy, a.x - fcx) - Math.atan2(b.y - fcy, b.x - fcx)
      );
      for (let i = 0; i < sorted.length; i++) {
        addLine(sorted[i].label, sorted[(i + 1) % sorted.length].label, 'planeEdge');
      }
    }

    // 2. Base shape edges in this plane
    (shapeEdges || []).forEach(([u, v]) => {
      addLine(u, v, 'shapeEdge');
    });

    // 3. User custom connections drawn in 3D in this plane (e.g. MN, BI, AN)
    (connections || []).forEach(([u, v]) => {
      addLine(u, v, 'connection');
    });

    // 4. Lines used for intersections in this plane
    (customPoints || []).forEach(cp => {
      if (cp.type === 'intersection') {
        if (cp.line1 && cp.line1.length === 2) {
          addLine(cp.line1[0], cp.line1[1], 'connection');
        }
        if (cp.line2 && cp.line2.length === 2) {
          addLine(cp.line2[0], cp.line2[1], 'connection');
        }
      }
    });

    return Array.from(lineMap.values());
  }, [screenPosMap, centeredPoints, planeLabels, shapeEdges, connections, customPoints]);

  if (points2D.length < 3) return null;

  const modalContent = (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      pointerEvents: 'auto'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '896px',
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <h3 style={{ margin: 0, fontWeight: 'bold', color: '#1e293b', fontSize: '18px' }}>Mặt phẳng ({planeLabels.join(', ')})</h3>
          <button 
            onClick={onClose} 
            style={{
              padding: '8px',
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{
          flex: 1,
          position: 'relative',
          background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)'
        }}>
          <svg
            ref={svgRef}
            viewBox="-400 -300 800 600"
            style={{ width: '100%', height: '100%', touchAction: 'none', cursor: 'move' }}
            onWheel={(e) => setZoom(z => Math.min(5, Math.max(0.3, z * (e.deltaY < 0 ? 1.1 : 0.9))))}
            onPointerDown={(e) => { panStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }; e.currentTarget.setPointerCapture(e.pointerId); }}
            onPointerMove={(e) => {
              if (!panStart.current) return;
              const k = svgRef.current?.getScreenCTM()?.a || 1;
              setPan({ x: panStart.current.px + (e.clientX - panStart.current.x) / k, y: panStart.current.py + (e.clientY - panStart.current.y) / k });
            }}
            onPointerUp={() => { panStart.current = null; }}
            onPointerCancel={() => { panStart.current = null; }}
          >
            {/* Shaded plane polygon */}
            {facePolygonPts.length >= 3 && (
              <polygon
                points={facePolygonPts.map(p => `${p.sx},${p.sy}`).join(' ')}
                fill="#bfdbfe"
                fillOpacity="0.45"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            )}

            {/* All internal and boundary lines on this plane */}
            {planeLines.map((line, idx) => (
              <line
                key={`line-${line.u}-${line.v}-${idx}`}
                x1={line.p1.sx}
                y1={line.p1.sy}
                x2={line.p2.sx}
                y2={line.p2.sy}
                stroke={line.style === 'connection' ? '#0284c7' : line.style === 'shapeEdge' ? '#475569' : '#3b82f6'}
                strokeWidth={line.style === 'connection' ? 2.5 : 2}
                strokeDasharray={line.style === 'connection' ? '6 4' : undefined}
                strokeLinecap="round"
              />
            ))}

            {/* Points on this plane */}
            {centeredPoints.map(p => {
              const sp = screenPosMap[p.label];
              if (!sp) return null;
              return (
                <circle
                  key={`dot-${p.label}`}
                  cx={sp.sx}
                  cy={sp.sy}
                  r="6"
                  fill="#1e293b"
                />
              );
            })}

            {/* Draggable labels */}
            {centeredPoints.map(p => {
              const sp = screenPosMap[p.label];
              if (!sp) return null;
              return (
                <SvgDraggableLabel
                  key={`lbl-${p.label}`}
                  label={p.label}
                  x={sp.sx}
                  y={sp.sy}
                  svgRef={svgRef}
                />
              );
            })}
          </svg>
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            pointerEvents: 'none'
          }}>
            <div style={{
              pointerEvents: 'auto',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '12px 24px',
              borderRadius: '16px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>Góc xoay:</label>
              <input 
                type="range" 
                min="-180" 
                max="180" 
                value={rotationZ} 
                onChange={(e) => setRotationZ(Number(e.target.value))} 
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', color: '#64748b', minWidth: '40px', textAlign: 'right' }}>{rotationZ}°</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const SpaceGeometry3D = () => {
  const [mounted, setMounted] = useState(false);
  const controlsRef = useRef(null);

  const resetView = () => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.object.position.set(7, 6, 9);
    controls.target.set(0, 0.5, 0);
    controls.update();
  };

  const [selectedShape, setSelectedShape] = useState('quad_parallelogram');
  const [mode, setMode] = useState('planes'); // 'planes' | 'line_plane'
  const [useDashed, setUseDashed] = useState(true);
  const [view2DPlane, setView2DPlane] = useState(null);
  
  // States for 'planes' mode
  const [plane1, setPlane1] = useState([]);
  const [plane2, setPlane2] = useState([]);
  
  // States for 'line_plane' mode
  const [linePts, setLinePts] = useState([]);
  const [targetPlane, setTargetPlane] = useState([]);
  
  // States for 'cross_section' mode
  const [crossSectionPts, setCrossSectionPts] = useState([]);
  
  // Custom points
  const [customPoints, setCustomPoints] = useState([]);
  const [newPointLabel, setNewPointLabel] = useState('M');
  const [newPointEdge, setNewPointEdge] = useState('S,A');
  const [ratioNum, setRatioNum] = useState(1);
  const [ratioDen, setRatioDen] = useState(2);
  
  // Connections
  const [connections, setConnections] = useState([]);
  const [connectP1, setConnectP1] = useState('');
  const [connectP2, setConnectP2] = useState('');

  // Intersections
  const [interLine1, setInterLine1] = useState('');
  const [interLine2, setInterLine2] = useState('');
  const [newInterLabel, setNewInterLabel] = useState('');
  const [suggestedInterLabel, setSuggestedInterLabel] = useState('O');

  const shape = SHAPES[selectedShape] || SHAPES.quad_parallelogram;

  const [swapVertices, setSwapVertices] = useState(false);

  // Auto clear selections when shape changes
  React.useEffect(() => {
    setPlane1([]);
    setPlane2([]);
    setLinePts([]);
    setTargetPlane([]);
    setCrossSectionPts([]);
    setCustomPoints([]);
    setConnections([]);
    setSwapVertices(false);
    
    // Set default edge for new point based on shape
    if (shape && shape.edges.length > 0) {
      setNewPointEdge(shape.edges[0].join(','));
    }
  }, [selectedShape, shape]);

  const swappedBaseVertices = useMemo(() => {
    if (!shape) return {};
    const verts = {};
    for (const [k, v] of Object.entries(shape.vertices)) {
      verts[k] = v.clone();
    }
    
    if (swapVertices) {
      const isTetra = selectedShape.startsWith('tetra') || selectedShape === 'tetrahedron';
      const isTri = selectedShape.startsWith('tri') || selectedShape === 'triangularPyramid';
      const isQuad = selectedShape.startsWith('quad') || (selectedShape.includes('Pyramid') && !isTri);

      if (isQuad) {
        const temp = verts['B'];
        verts['B'] = verts['D'];
        verts['D'] = temp;
      } else if (isTetra) {
        const temp = verts['C'];
        verts['C'] = verts['D'];
        verts['D'] = temp;
      } else if (isTri) {
        const temp = verts['B'];
        verts['B'] = verts['C'];
        verts['C'] = temp;
      }
    }
    return verts;
  }, [shape, swapVertices, selectedShape]);

  const activeVertices = useMemo(() => {
    const verts = { ...swappedBaseVertices };
    customPoints.forEach(cp => {
      if (cp.type === 'intersection') {
        const pt = getLinesIntersection(verts, cp.line1, cp.line2);
        if (pt) verts[cp.label] = pt;
      } else {
        const p1 = verts[cp.edge[0]];
        const p2 = verts[cp.edge[1]];
        if (p1 && p2) {
          verts[cp.label] = new THREE.Vector3().copy(p1).lerp(p2, cp.ratio);
        }
      }
    });
    return verts;
  }, [swappedBaseVertices, customPoints]);
  
  const activeLabels = useMemo(() => {
    return [...shape.labels, ...customPoints.map(p => p.label)];
  }, [shape, customPoints]);

  const toggleVertex = (list, setList, max, v) => {
    if (list.includes(v)) {
      setList(list.filter(x => x !== v));
    } else {
      if (list.length < max) {
        setList([...list, v]);
      } else {
        setList([...list.slice(0, max - 1), v]);
      }
    }
  };

  const isCoplanarWith = (list, v) => {
    const [a, b, c] = list.slice(0, 3).map(k => activeVertices[k]);
    const p = activeVertices[v];
    if (!a || !b || !c || !p) return false;
    const normal = new THREE.Vector3().crossVectors(
      new THREE.Vector3().subVectors(b, a),
      new THREE.Vector3().subVectors(c, a)
    );
    if (normal.length() < 1e-6) return false;
    return Math.abs(normal.normalize().dot(new THREE.Vector3().subVectors(p, a))) < 0.05;
  };

  const togglePlaneVertex = (list, setList, v) => {
    if (list.includes(v)) {
      setList(list.filter(x => x !== v));
    } else if (list.length < 3 || isCoplanarWith(list, v)) {
      setList([...list, v]);
    } else {
      setList([...list.slice(0, 2), v]);
    }
  };


  const getHint = () => {
    if (mode === 'planes') {
      if (plane1.length < 3) return "Hãy chọn 3 đỉnh để tạo Mặt phẳng 1";
      if (plane2.length < 3) return "Hãy chọn 3 đỉnh để tạo Mặt phẳng 2";
      const inter = getPlanesIntersection(activeVertices, plane1, plane2);
      if (!inter) return "Hai mặt phẳng song song hoặc trùng nhau";
      return "Giao tuyến của 2 mặt phẳng được hiển thị bằng đường màu tím";
    } else {
      if (linePts.length < 2) return "Hãy chọn 2 đỉnh để tạo Đường thẳng";
      if (targetPlane.length < 3) return "Hãy chọn 3 đỉnh để tạo Mặt phẳng";
      const inter = getLinePlaneIntersection(activeVertices, linePts[0], linePts[1], targetPlane[0], targetPlane[1], targetPlane[2]);
      if (!inter) return "Đường thẳng song song hoặc nằm trong mặt phẳng";
      return "Giao điểm được đánh dấu bằng điểm màu cam";
    }
  };

  const handleAddPoint = () => {
    if (!newPointLabel.trim()) return;
    if (activeLabels.includes(newPointLabel.trim())) {
      alert('Tên điểm đã tồn tại!');
      return;
    }
    const edge = newPointEdge.split(',');
    if (edge.length !== 2) return;
    
    setCustomPoints([...customPoints, {
      label: newPointLabel.trim(),
      edge: edge,
      ratio: ratioNum / ratioDen
    }]);
    
    // Auto suggest next label
    const nextChar = String.fromCharCode(newPointLabel.trim().charCodeAt(0) + 1);
    setNewPointLabel(nextChar);
  };

  const removeCustomPoint = (label) => {
    setCustomPoints(customPoints.filter(p => p.label !== label));
    setPlane1(plane1.filter(v => v !== label));
    setPlane2(plane2.filter(v => v !== label));
    setLinePts(linePts.filter(v => v !== label));
    setTargetPlane(targetPlane.filter(v => v !== label));
    setConnections(connections.filter(c => c[0] !== label && c[1] !== label));
  };

  const handleAddIntersection = () => {
    const finalLabel = (newInterLabel.trim() || suggestedInterLabel).toUpperCase();
    if (!finalLabel) return;
    if (activeLabels.includes(finalLabel)) {
      alert('Tên điểm đã tồn tại!');
      return;
    }
    
    const l1 = interLine1.trim().toUpperCase().split('');
    const l2 = interLine2.trim().toUpperCase().split('');
    
    if (l1.length !== 2 || l2.length !== 2) {
      alert('Vui lòng nhập đúng 2 đỉnh cho mỗi đường, ví dụ: SA');
      return;
    }
    
    if (!activeLabels.includes(l1[0]) || !activeLabels.includes(l1[1]) || 
        !activeLabels.includes(l2[0]) || !activeLabels.includes(l2[1])) {
      alert('Một số điểm không tồn tại!');
      return;
    }
    
    const pt = getLinesIntersection(activeVertices, l1, l2);
    if (!pt) {
      alert('Hai đường thẳng này không cắt nhau hoặc song song!');
      return;
    }
    
    setCustomPoints([...customPoints, { 
      label: finalLabel, 
      type: 'intersection', 
      line1: l1, 
      line2: l2 
    }]);
    
    const nextChar = String.fromCharCode(finalLabel.charCodeAt(0) + 1);
    setSuggestedInterLabel(nextChar);
    setNewInterLabel('');
    setInterLine1('');
    setInterLine2('');
  };

  return (
    <div className="space-geom-container">
      <div className="space-geom-sidebar">
        <h3 className="space-geom-title">Quan hệ song song</h3>
        
        <div className="control-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ margin: 0, fontWeight: 600, color: '#334155' }}>Chọn mô hình</label>
            <button
              type="button"
              onClick={() => setSwapVertices(!swapVertices)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '3px 9px', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer',
                borderRadius: '999px', transition: 'all 0.2s',
                border: `1px solid ${swapVertices ? '#2563eb' : '#cbd5e1'}`,
                background: swapVertices ? '#dbeafe' : 'white',
                color: swapVertices ? '#1d4ed8' : '#475569'
              }}
            >
              Đổi {(selectedShape.startsWith('tetra') || selectedShape === 'tetrahedron') ? 'C ⇄ D' : (selectedShape.startsWith('tri') || selectedShape === 'triangularPyramid') ? 'B ⇄ C' : 'B ⇄ D'}
            </button>
          </div>
          <ShapeHierarchySelect 
            value={selectedShape}
            onChange={setSelectedShape}
          />
        </div>

        <div className="control-group">
          <label>Chế độ</label>
          <select 
            className="geom-select"
            value={mode}
            onChange={e => setMode(e.target.value)}
          >
            <option value="planes">Giao tuyến của 2 mặt phẳng</option>
            <option value="line_plane">Giao điểm của đường và mặt</option>
            <option value="cross_section">Thiết diện</option>
          </select>
        </div>

        <div className="selection-panel">
          {mode === 'planes' ? (
            <>
              <div className="control-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0 }}>Mặt phẳng 1</label>
                  {plane1.length >= 3 && (
                    <button onClick={() => setView2DPlane(plane1)} style={{ fontSize: '11px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                      Xem 2D
                    </button>
                  )}
                </div>
                <div className="vertex-selector">
                  {activeLabels.map(v => (
                    <button 
                      key={`p1-${v}`}
                      className={`vertex-btn ${plane1.includes(v) ? 'active plane1' : ''}`}
                      onClick={() => togglePlaneVertex(plane1, setPlane1, v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="control-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0 }}>Mặt phẳng 2</label>
                  {plane2.length >= 3 && (
                    <button onClick={() => setView2DPlane(plane2)} style={{ fontSize: '11px', color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                      Xem 2D
                    </button>
                  )}
                </div>
                <div className="vertex-selector">
                  {activeLabels.map(v => (
                    <button 
                      key={`p2-${v}`}
                      className={`vertex-btn ${plane2.includes(v) ? 'active plane2' : ''}`}
                      onClick={() => togglePlaneVertex(plane2, setPlane2, v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : mode === 'line_plane' ? (
            <>
              <div className="control-group">
                <label>Đường thẳng</label>
                <div className="vertex-selector">
                  {activeLabels.map(v => (
                    <button 
                      key={`l-${v}`}
                      className={`vertex-btn ${linePts.includes(v) ? 'active line' : ''}`}
                      onClick={() => toggleVertex(linePts, setLinePts, 2, v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="control-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ margin: 0 }}>Mặt phẳng</label>
                  {targetPlane.length >= 3 && (
                    <button onClick={() => setView2DPlane(targetPlane)} style={{ fontSize: '11px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                      Xem 2D
                    </button>
                  )}
                </div>
                <div className="vertex-selector">
                  {activeLabels.map(v => (
                    <button 
                      key={`tp-${v}`}
                      className={`vertex-btn ${targetPlane.includes(v) ? 'active plane1' : ''}`}
                      onClick={() => togglePlaneVertex(targetPlane, setTargetPlane, v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="control-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ margin: 0 }}>Thiết diện đi qua</label>
                {crossSectionPts.length >= 3 && (
                  <button onClick={() => setView2DPlane(crossSectionPts)} style={{ fontSize: '11px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Xem 2D
                  </button>
                )}
              </div>
              <div className="vertex-selector">
                {activeLabels.map(v => (
                  <button 
                    key={`cs-${v}`}
                    className={`vertex-btn ${crossSectionPts.includes(v) ? 'active plane1' : ''}`}
                    onClick={() => togglePlaneVertex(crossSectionPts, setCrossSectionPts, v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="selection-panel">
          <div className="control-group">
            <label style={{ color: 'var(--primary-color)' }}>+ Thêm điểm trên cạnh</label>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
              <select 
                className="geom-select" 
                style={{ width: '70px', padding: '0.4rem', textAlign: 'center' }}
                value={newPointEdge}
                onChange={e => setNewPointEdge(e.target.value)}
              >
                {shape.edges.map((edge, i) => (
                  <option key={`opt-edge-${i}`} value={edge.join(',')}>{edge.join('')}</option>
                ))}
              </select>
              <input 
                type="text" 
                className="geom-select"
                style={{ width: '50px', padding: '0.4rem', textAlign: 'center' }}
                value={newPointLabel}
                onChange={e => setNewPointLabel(e.target.value)}
                maxLength={2}
                placeholder="Tên"
              />
              <button 
                className="mode-btn" 
                style={{ backgroundColor: 'var(--surface-color)', padding: '0.4rem', flex: 1, textAlign: 'center' }}
                onClick={handleAddPoint}
              >
                Thêm
              </button>
            </div>
            
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Tỉ lệ: {newPointEdge ? newPointEdge.split(',')[0] : ''}{newPointLabel} =</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input 
                type="number" 
                min="0" 
                className="geom-select"
                value={ratioNum}
                onChange={e => setRatioNum(parseInt(e.target.value) || 0)}
                style={{ width: '45px', padding: '0.4rem', textAlign: 'center' }}
              />
              <span style={{ fontSize: '16px' }}>/</span>
              <input 
                type="number" 
                min="1" 
                className="geom-select"
                value={ratioDen}
                onChange={e => setRatioDen(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: '45px', padding: '0.4rem', textAlign: 'center' }}
              />
            </div>
            <span style={{ fontWeight: 'bold' }}>{newPointEdge ? newPointEdge.split(',').join('') : ''}</span>
          </div>
            

            
            {customPoints.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {customPoints.map(p => (
                  <span key={p.label} style={{ fontSize: '12px', background: 'var(--background-color)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {p.type === 'intersection' ? `${p.label} (${p.line1.join('')} ∩ ${p.line2.join('')})` : `${p.label} trên ${p.edge.join('')}`}
                    <button onClick={() => removeCustomPoint(p.label)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0 2px', fontWeight: 'bold' }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="control-group">
            <label style={{ color: 'var(--primary-color)' }}>+ Kẻ nối điểm</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                className="geom-select" 
                style={{ flex: 1, padding: '0.5rem' }}
                value={connectP1}
                onChange={e => setConnectP1(e.target.value)}
              >
                <option value="">Điểm 1</option>
                {activeLabels.map(v => <option key={`cp1-${v}`} value={v}>{v}</option>)}
              </select>
              <select 
                className="geom-select" 
                style={{ flex: 1, padding: '0.5rem' }}
                value={connectP2}
                onChange={e => setConnectP2(e.target.value)}
              >
                <option value="">Điểm 2</option>
                {activeLabels.map(v => <option key={`cp2-${v}`} value={v}>{v}</option>)}
              </select>
              <button 
                className="mode-btn" 
                style={{ backgroundColor: 'var(--surface-color)', padding: '0.5rem', flexShrink: 0 }}
                onClick={() => {
                  if (connectP1 && connectP2 && connectP1 !== connectP2) {
                    const exists = connections.some(c => (c[0]===connectP1 && c[1]===connectP2) || (c[0]===connectP2 && c[1]===connectP1));
                    if (!exists) {
                      setConnections([...connections, [connectP1, connectP2]]);
                      setConnectP1('');
                      setConnectP2('');
                    }
                  }
                }}
              >
                Nối
              </button>
            </div>
            
            {connections.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {connections.map((c, i) => (
                  <span key={`conn-${i}`} style={{ fontSize: '12px', background: 'var(--background-color)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {c[0]}{c[1]}
                    <button onClick={() => setConnections(connections.filter((_, idx) => idx !== i))} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0 2px', fontWeight: 'bold' }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="control-group">
            <label style={{ color: 'var(--primary-color)' }}>+ Giao điểm 2 đường</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input 
                type="text" 
                className="geom-select"
                style={{ width: '50px', padding: '0.4rem', textAlign: 'center' }}
                value={interLine1}
                onChange={e => setInterLine1(e.target.value)}
                maxLength={2}
                placeholder="AC"
              />
              <input 
                type="text" 
                className="geom-select"
                style={{ width: '50px', padding: '0.4rem', textAlign: 'center' }}
                value={interLine2}
                onChange={e => setInterLine2(e.target.value)}
                maxLength={2}
                placeholder="BD"
              />
              <input 
                type="text" 
                className="geom-select"
                style={{ width: '50px', padding: '0.4rem', textAlign: 'center' }}
                value={newInterLabel}
                onChange={e => setNewInterLabel(e.target.value)}
                maxLength={2}
                placeholder={suggestedInterLabel}
              />
              <button 
                className="mode-btn" 
                style={{ backgroundColor: 'var(--surface-color)', padding: '0.4rem', flex: 1, textAlign: 'center' }}
                onClick={handleAddIntersection}
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-geom-main">
        <div className="hint-overlay">
          {getHint()}
        </div>
        
        <div className="canvas-container" style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={resetView}
            title="Quay về góc nhìn ban đầu"
            style={{
              position: 'absolute', top: '12px', right: '12px', zIndex: 20,
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              color: '#334155', background: 'rgba(255,255,255,0.95)',
              border: '1px solid #e2e8f0', borderRadius: '999px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            ⟲ Về vị trí ban đầu
          </button>
          {view2DPlane && (
            <Plane2DViewer 
              planeLabels={view2DPlane} 
              vertices={activeVertices} 
              connections={connections}
              shapeEdges={shape.edges}
              customPoints={customPoints}
              onClose={() => setView2DPlane(null)} 
            />
          )}
          <Canvas 
            camera={{ position: [7, 6, 9], fov: 45 }}
            onCreated={({ camera }) => {
              camera.lookAt(0, 0.5, 0);
              // Wait a tiny bit for the first frame to render before showing HTML
              setTimeout(() => setMounted(true), 100);
            }}
          >
            <color attach="background" args={['#f8fafc']} />
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />
            
            <OrbitControls ref={controlsRef} makeDefault enableDamping={true} minDistance={2} maxDistance={15} target={[0, 0.5, 0]} />
            
            {/* Draw shape edges */}
            {shape.edges.map((edge, i) => (
              <ShapeEdge 
                key={`edge-${i}`}
                edge={edge}
                shape={{...shape, vertices: swappedBaseVertices}}
                useDashed={useDashed}
              />
            ))}
            
            {/* Draw active vertices with labels */}
            {activeLabels.map(v => {
              const isCustom = !shape.labels.includes(v);
              const pos = activeVertices[v];
              return (
                <group key={`label-${v}`} position={[pos.x, pos.y, pos.z]}>
                  <mesh>
                    <sphereGeometry args={[isCustom ? 0.05 : 0.06, 16, 16]} />
                    <meshBasicMaterial color={isCustom ? "#10b981" : "#334155"} />
                  </mesh>
                  {mounted && (
                    <Html center distanceFactor={12} style={{ pointerEvents: 'none', zIndex: 100 }}>
                      <div style={{ 
                        color: isCustom ? '#059669' : '#0f172a', 
                        fontWeight: 'bold', 
                        fontSize: isCustom ? '16px' : '18px', 
                        fontFamily: 'serif',
                        transform: 'translate(14px, 0px)',
                        textShadow: '1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff' 
                      }}>
                        {v}
                      </div>
                    </Html>
                  )}
                </group>
              );
            })}
            
            {/* Draw custom connections with adaptive solid / dashed visibility */}
            {connections.map((c, i) => {
              const p1 = activeVertices[c[0]];
              const p2 = activeVertices[c[1]];
              if (!p1 || !p2) return null;
              return (
                <CustomConnectionLine 
                  key={`conn-render-${i}-${c[0]}-${c[1]}`}
                  p1={p1}
                  p2={p2}
                  shape={{ ...shape, vertices: swappedBaseVertices }}
                  useDashed={useDashed}
                />
              );
            })}
            
            {/* Render Intersection modes */}
            {mode === 'planes' && (
              <>
                <PlaneMesh vertices={activeVertices} selected={plane1} color="#3b82f6" />
                <PlaneMesh vertices={activeVertices} selected={plane2} color="#10b981" />
                {plane1.length >= 3 && plane2.length >= 3 && (
                  <IntersectionLine 
                    {...getPlanesIntersection(activeVertices, plane1, plane2)} 
                  />
                )}
              </>
            )}
            
            {mode === 'line_plane' && (
              <>
                <PlaneMesh vertices={activeVertices} selected={targetPlane} color="#3b82f6" />
                {linePts.length === 2 && (
                  <SelectedLine vertices={activeVertices} v1={linePts[0]} v2={linePts[1]} />
                )}
                {targetPlane.length >= 3 && linePts.length === 2 && (
                  <IntersectionPoint 
                    point={getLinePlaneIntersection(activeVertices, linePts[0], linePts[1], targetPlane[0], targetPlane[1], targetPlane[2])} 
                  />
                )}
              </>
            )}
            
            {mode === 'cross_section' && crossSectionPts.length >= 3 && (
              <CrossSectionMesh vertices={activeVertices} shapeEdges={shape.edges} selectedPts={crossSectionPts} />
            )}
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default SpaceGeometry3D;
