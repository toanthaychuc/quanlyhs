import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line, MapControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useRole } from '../../context/RoleContext';
import { getSetting, saveSetting } from '../../services/settingService';
import './SpaceGeometry3D.css';

const SHAPE_CATEGORIES = [
  {
    id: 'quad',
    name: 'Khối chóp tứ giác S.ABCD',
    icon: '🔷',
    subgroups: [
      {
        id: 'quad_sa',
        name: 'Cạnh bên SA vuông góc với đáy',
        items: [
          { id: 'quad_sa_parallelogram', name: 'Đáy là hình bình hành' },
          { id: 'quad_sa_square', name: 'Đáy là hình vuông' },
          { id: 'quad_sa_rectangle', name: 'Đáy là hình chữ nhật' },
          { id: 'quad_sa_rhombus', name: 'Đáy là hình thoi' },
          { id: 'quad_sa_arbitrary', name: 'Đáy là tứ giác bất kì' },
          { id: 'quad_sa_trapezoid', name: 'Đáy là hình thang' },
          { id: 'quad_sa_trapezoid_2', name: 'Đáy là hình thang có AB = 2CD' }
        ]
      },
      {
        id: 'quad_sab',
        name: 'Mặt bên (SAB) vuông góc với đáy',
        items: [
          { id: 'quad_sab_parallelogram', name: 'Đáy là hình bình hành' },
          { id: 'quad_sab_square', name: 'Đáy là hình vuông' },
          { id: 'quad_sab_rectangle', name: 'Đáy là hình chữ nhật' },
          { id: 'quad_sab_rhombus', name: 'Đáy là hình thoi' },
          { id: 'quad_sab_arbitrary', name: 'Đáy là tứ giác bất kì' },
          { id: 'quad_sab_trapezoid', name: 'Đáy là hình thang' },
          { id: 'quad_sab_trapezoid_2', name: 'Đáy là hình thang có AB = 2CD' }
        ]
      }
    ],
    items: [
      { id: 'quad_regular', name: 'Khối chóp tứ giác đều' }
    ]
  },
  {
    id: 'tri',
    name: 'Khối chóp tam giác S.ABC',
    icon: '🔺',
    subgroups: [
      {
        id: 'tri_sa',
        name: 'Cạnh bên SA vuông góc với đáy',
        items: [
          { id: 'tri_sa_general', name: 'Đáy là tam giác thường' },
          { id: 'tri_sa_equilateral', name: 'Đáy là tam giác đều' },
          { id: 'tri_sa_right_a', name: 'Đáy là tam giác vuông tại A' },
          { id: 'tri_sa_right_b', name: 'Đáy là tam giác vuông tại B' },
          { id: 'tri_sa_right_c', name: 'Đáy là tam giác vuông tại C' },
          { id: 'tri_sa_isos_a', name: 'Đáy là tam giác cân tại A' },
          { id: 'tri_sa_isos_b', name: 'Đáy là tam giác cân tại B' },
          { id: 'tri_sa_isos_c', name: 'Đáy là tam giác cân tại C' }
        ]
      },
      {
        id: 'tri_sab',
        name: 'Mặt bên (SAB) vuông góc với đáy',
        items: [
          { id: 'tri_sab_general', name: 'Đáy là tam giác thường' },
          { id: 'tri_sab_equilateral', name: 'Đáy là tam giác đều' },
          { id: 'tri_sab_right_a', name: 'Đáy là tam giác vuông tại A' },
          { id: 'tri_sab_right_b', name: 'Đáy là tam giác vuông tại B' },
          { id: 'tri_sab_right_c', name: 'Đáy là tam giác vuông tại C' },
          { id: 'tri_sab_isos_a', name: 'Đáy là tam giác cân tại A' },
          { id: 'tri_sab_isos_b', name: 'Đáy là tam giác cân tại B' },
          { id: 'tri_sab_isos_c', name: 'Đáy là tam giác cân tại C' }
        ]
      }
    ],
    items: [
      { id: 'tri_regular', name: 'Khối chóp tam giác đều' }
    ]
  },
  {
    id: 'tetra',
    name: 'Khối tứ diện ABCD',
    icon: '🔶',
    subgroups: [
      {
        id: 'tetra_ab',
        name: 'Cạnh bên AB vuông góc với đáy',
        items: [
          { id: 'tetra_ab_general', name: 'Đáy là tam giác thường' },
          { id: 'tetra_ab_equilateral', name: 'Đáy là tam giác đều' },
          { id: 'tetra_ab_right_b', name: 'Đáy là tam giác vuông tại B' },
          { id: 'tetra_ab_right_c', name: 'Đáy là tam giác vuông tại C' },
          { id: 'tetra_ab_right_d', name: 'Đáy là tam giác vuông tại D' },
          { id: 'tetra_ab_isos_b', name: 'Đáy là tam giác cân tại B' },
          { id: 'tetra_ab_isos_c', name: 'Đáy là tam giác cân tại C' },
          { id: 'tetra_ab_isos_d', name: 'Đáy là tam giác cân tại D' }
        ]
      },
      {
        id: 'tetra_abc',
        name: 'Mặt bên (ABC) vuông góc với đáy',
        items: [
          { id: 'tetra_abc_general', name: 'Đáy là tam giác thường' },
          { id: 'tetra_abc_equilateral', name: 'Đáy là tam giác đều' },
          { id: 'tetra_abc_right_b', name: 'Đáy là tam giác vuông tại B' },
          { id: 'tetra_abc_right_c', name: 'Đáy là tam giác vuông tại C' },
          { id: 'tetra_abc_right_d', name: 'Đáy là tam giác vuông tại D' },
          { id: 'tetra_abc_isos_b', name: 'Đáy là tam giác cân tại B' },
          { id: 'tetra_abc_isos_c', name: 'Đáy là tam giác cân tại C' },
          { id: 'tetra_abc_isos_d', name: 'Đáy là tam giác cân tại D' }
        ]
      }
    ],
    items: [
      { id: 'tetra_regular', name: 'Tứ diện đều' },
      { id: 'tetra_right', name: 'Tứ diện vuông (O.ABC)' }
    ]
  },
  {
    id: 'prism_right',
    name: 'Khối lăng trụ đứng',
    icon: '🏛️',
    subgroups: [
      {
        id: 'prism_right_quad',
        name: 'Tùy chọn đáy là tứ giác',
        items: [
          { id: 'prism_r_square', name: 'Đáy là hình vuông' },
          { id: 'prism_r_rect', name: 'Đáy là hình chữ nhật' },
          { id: 'prism_r_para', name: 'Đáy là hình bình hành' },
          { id: 'prism_r_rhom', name: 'Đáy là hình thoi' },
          { id: 'prism_r_trap', name: 'Đáy là hình thang' }
        ]
      },
      {
        id: 'prism_right_tri',
        name: 'Tùy chọn đáy là tam giác',
        items: [
          { id: 'prism_r_t_right_a', name: 'Đáy là tam giác vuông tại A' },
          { id: 'prism_r_t_right_b', name: 'Đáy là tam giác vuông tại B' },
          { id: 'prism_r_t_right_c', name: 'Đáy là tam giác vuông tại C' },
          { id: 'prism_r_t_isos_a', name: 'Đáy là tam giác cân tại A' },
          { id: 'prism_r_t_isos_b', name: 'Đáy là tam giác cân tại B' },
          { id: 'prism_r_t_isos_c', name: 'Đáy là tam giác cân tại C' }
        ]
      }
    ]
  },
  {
    id: 'prism_oblique',
    name: 'Khối lăng trụ xiên',
    icon: '📐',
    subgroups: [
      {
        id: 'prism_oblique_quad',
        name: 'Tùy chọn đáy là tứ giác',
        items: [
          { id: 'prism_o_square', name: 'Đáy là hình vuông' },
          { id: 'prism_o_rect', name: 'Đáy là hình chữ nhật' },
          { id: 'prism_o_para', name: 'Đáy là hình bình hành' },
          { id: 'prism_o_rhom', name: 'Đáy là hình thoi' },
          { id: 'prism_o_trap', name: 'Đáy là hình thang' }
        ]
      },
      {
        id: 'prism_oblique_tri',
        name: 'Tùy chọn đáy là tam giác',
        items: [
          { id: 'prism_o_t_right_a', name: 'Đáy là tam giác vuông tại A' },
          { id: 'prism_o_t_right_b', name: 'Đáy là tam giác vuông tại B' },
          { id: 'prism_o_t_right_c', name: 'Đáy là tam giác vuông tại C' },
          { id: 'prism_o_t_isos_a', name: 'Đáy là tam giác cân tại A' },
          { id: 'prism_o_t_isos_b', name: 'Đáy là tam giác cân tại B' },
          { id: 'prism_o_t_isos_c', name: 'Đáy là tam giác cân tại C' }
        ]
      }
    ]
  }
];

const SHAPES = {
  quad_sa_parallelogram: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình bình hành',
    name: 'S.ABCD (Đáy là hình bình hành)',
    vertices: {
      "S": new THREE.Vector3(-1.5, 2.5, -1),
      "A": new THREE.Vector3(-1.5, -1, -1),
      "B": new THREE.Vector3(2.5, -1, -1),
      "D": new THREE.Vector3(-2.5, -1, 1.5),
      "C": new THREE.Vector3(1.5, -1, 1.5),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','D'], ['S','D','A'], ['A','B','C','D']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['S','D'], ['A','B'], ['B','C'], ['C','D'], ['D','A']],
    rightAngles: [['S', 'A', 'B'], ['S', 'A', 'D']],
    labels: ['S', 'A', 'B', 'C', 'D']
  },
  quad_sa_square: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình vuông',
    name: 'S.ABCD (Đáy là hình vuông)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(2, 0, 0),
      "D": new THREE.Vector3(0, 0, 2),
      "C": new THREE.Vector3(2, 0, 2),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','D'], ['S','D','A'], ['A','B','C','D']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['S','D'], ['A','B'], ['B','C'], ['C','D'], ['D','A']],
    rightAngles: [['S', 'A', 'B'], ['S', 'A', 'D']],
    labels: ['S', 'A', 'B', 'C', 'D']
  },
  quad_sa_rectangle: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình chữ nhật',
    name: 'S.ABCD (Đáy là hình chữ nhật)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(3, 0, 0),
      "D": new THREE.Vector3(0, 0, 2),
      "C": new THREE.Vector3(3, 0, 2),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','D'], ['S','D','A'], ['A','B','C','D']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['S','D'], ['A','B'], ['B','C'], ['C','D'], ['D','A']],
    rightAngles: [['S', 'A', 'B'], ['S', 'A', 'D']],
    labels: ['S', 'A', 'B', 'C', 'D']
  },
  quad_sa_rhombus: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình thoi',
    name: 'S.ABCD (Đáy là hình thoi)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(2, 0, 0),
      "D": new THREE.Vector3(1, 0, 1.732),
      "C": new THREE.Vector3(3, 0, 1.732),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','D'], ['S','D','A'], ['A','B','C','D']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['S','D'], ['A','B'], ['B','C'], ['C','D'], ['D','A']],
    rightAngles: [['S', 'A', 'B'], ['S', 'A', 'D']],
    labels: ['S', 'A', 'B', 'C', 'D']
  },
  quad_sa_arbitrary: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là tứ giác bất kì',
    name: 'S.ABCD (Đáy là tứ giác bất kì)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(3, 0, 0),
      "D": new THREE.Vector3(1, 0, 3),
      "C": new THREE.Vector3(4, 0, 1),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','D'], ['S','D','A'], ['A','B','C','D']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['S','D'], ['A','B'], ['B','C'], ['C','D'], ['D','A']],
    rightAngles: [['S', 'A', 'B'], ['S', 'A', 'D']],
    labels: ['S', 'A', 'B', 'C', 'D']
  },
  quad_sa_trapezoid: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình thang',
    name: 'S.ABCD (Đáy là hình thang)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(4, 0, 0),
      "D": new THREE.Vector3(1, 0, 2),
      "C": new THREE.Vector3(2.5, 0, 2),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','D'], ['S','D','A'], ['A','B','C','D']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['S','D'], ['A','B'], ['B','C'], ['C','D'], ['D','A']],
    rightAngles: [['S', 'A', 'B'], ['S', 'A', 'D']],
    labels: ['S', 'A', 'B', 'C', 'D']
  },
  quad_sa_trapezoid_2: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình thang có AB = 2CD',
    name: 'S.ABCD (Đáy là hình thang có AB = 2CD)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(4, 0, 0),
      "D": new THREE.Vector3(1, 0, 2),
      "C": new THREE.Vector3(3, 0, 2),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','D'], ['S','D','A'], ['A','B','C','D']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['S','D'], ['A','B'], ['B','C'], ['C','D'], ['D','A']],
    rightAngles: [['S', 'A', 'B'], ['S', 'A', 'D']],
    labels: ['S', 'A', 'B', 'C', 'D']
  },
  quad_sab_parallelogram: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình bình hành',
    name: 'S.ABCD (Đáy là hình bình hành)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(-1.5, 0, 0),
      "B": new THREE.Vector3(1.5, 0, 0),
      "H": new THREE.Vector3(0.0, 0.0, 0.0),
      "D": new THREE.Vector3(-0.5, 0, 2),
      "C": new THREE.Vector3(2.5, 0, 2),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','D'], ['S','D','A'], ['A','B','C','D']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['S','D'], ['A','B'], ['B','C'], ['C','D'], ['D','A'], ['S', 'H']],
    rightAngles: [['S', 'H', 'A'], ['S', 'H', 'B']],
    labels: ['S', 'A', 'B', 'C', 'D', 'H']
  },
  quad_sab_square: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình vuông',
    name: 'S.ABCD (Đáy là hình vuông)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(-1.5, 0, 0),
      "B": new THREE.Vector3(1.5, 0, 0),
      "H": new THREE.Vector3(0.0, 0.0, 0.0),
      "D": new THREE.Vector3(-1.5, 0, 3),
      "C": new THREE.Vector3(1.5, 0, 3),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','D'], ['S','D','A'], ['A','B','C','D']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['S','D'], ['A','B'], ['B','C'], ['C','D'], ['D','A'], ['S', 'H']],
    rightAngles: [['S', 'H', 'A'], ['S', 'H', 'B']],
    labels: ['S', 'A', 'B', 'C', 'D', 'H']
  },
  quad_sab_rectangle: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình chữ nhật',
    name: 'S.ABCD (Đáy là hình chữ nhật)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(-1.5, 0, 0),
      "B": new THREE.Vector3(1.5, 0, 0),
      "H": new THREE.Vector3(0.0, 0.0, 0.0),
      "D": new THREE.Vector3(-1.5, 0, 2),
      "C": new THREE.Vector3(1.5, 0, 2),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','D'], ['S','D','A'], ['A','B','C','D']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['S','D'], ['A','B'], ['B','C'], ['C','D'], ['D','A'], ['S', 'H']],
    rightAngles: [['S', 'H', 'A'], ['S', 'H', 'B']],
    labels: ['S', 'A', 'B', 'C', 'D', 'H']
  },
  quad_sab_rhombus: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình thoi',
    name: 'S.ABCD (Đáy là hình thoi)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(-1.5, 0, 0),
      "B": new THREE.Vector3(1.5, 0, 0),
      "H": new THREE.Vector3(0.0, 0.0, 0.0),
      "D": new THREE.Vector3(-0.5, 0, 2.8),
      "C": new THREE.Vector3(2.5, 0, 2.8),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','D'], ['S','D','A'], ['A','B','C','D']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['S','D'], ['A','B'], ['B','C'], ['C','D'], ['D','A'], ['S', 'H']],
    rightAngles: [['S', 'H', 'A'], ['S', 'H', 'B']],
    labels: ['S', 'A', 'B', 'C', 'D', 'H']
  },
  quad_sab_arbitrary: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là tứ giác bất kì',
    name: 'S.ABCD (Đáy là tứ giác bất kì)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(-1.5, 0, 0),
      "B": new THREE.Vector3(2, 0, 0),
      "H": new THREE.Vector3(0.25, 0.0, 0.0),
      "D": new THREE.Vector3(-1, 0, 2),
      "C": new THREE.Vector3(3, 0, 1.5),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','D'], ['S','D','A'], ['A','B','C','D']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['S','D'], ['A','B'], ['B','C'], ['C','D'], ['D','A'], ['S', 'H']],
    rightAngles: [['S', 'H', 'A'], ['S', 'H', 'B']],
    labels: ['S', 'A', 'B', 'C', 'D', 'H']
  },
  quad_sab_trapezoid: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình thang',
    name: 'S.ABCD (Đáy là hình thang)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(-1.5, 0, 0),
      "B": new THREE.Vector3(2.5, 0, 0),
      "H": new THREE.Vector3(0.5, 0.0, 0.0),
      "D": new THREE.Vector3(-0.5, 0, 2),
      "C": new THREE.Vector3(1.5, 0, 2),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','D'], ['S','D','A'], ['A','B','C','D']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['S','D'], ['A','B'], ['B','C'], ['C','D'], ['D','A'], ['S', 'H']],
    rightAngles: [['S', 'H', 'A'], ['S', 'H', 'B']],
    labels: ['S', 'A', 'B', 'C', 'D', 'H']
  },
  quad_sab_trapezoid_2: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Đáy là hình thang có AB = 2CD',
    name: 'S.ABCD (Đáy là hình thang có AB = 2CD)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(-2, 0, 0),
      "B": new THREE.Vector3(2, 0, 0),
      "H": new THREE.Vector3(0.0, 0.0, 0.0),
      "D": new THREE.Vector3(-1, 0, 2),
      "C": new THREE.Vector3(1, 0, 2),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','D'], ['S','D','A'], ['A','B','C','D']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['S','D'], ['A','B'], ['B','C'], ['C','D'], ['D','A'], ['S', 'H']],
    rightAngles: [['S', 'H', 'A'], ['S', 'H', 'B']],
    labels: ['S', 'A', 'B', 'C', 'D', 'H']
  },
  quad_regular: {
    categoryName: 'Chóp tứ giác S.ABCD',
    subName: 'Khối chóp tứ giác đều',
    name: 'Khối chóp tứ giác đều',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(-1.5, 0, -1.5),
      "B": new THREE.Vector3(1.5, 0, -1.5),
      "C": new THREE.Vector3(1.5, 0, 1.5),
      "O": new THREE.Vector3(0.0, 0.0, 0.0),
      "D": new THREE.Vector3(-1.5, 0, 1.5),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','D'], ['S','D','A'], ['A','B','C','D']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['S','D'], ['A','B'], ['B','C'], ['C','D'], ['D','A'], ['A', 'C'], ['B', 'D'], ['S', 'O']],
    rightAngles: [['S', 'O', 'A'], ['S', 'O', 'B']],
    labels: ['S', 'A', 'B', 'C', 'D', 'O']
  },
  tri_sa_general: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác thường',
    name: 'S.ABC (Đáy là tam giác thường)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(3, 0, 0),
      "C": new THREE.Vector3(1, 0, 2),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A']],
    rightAngles: [['S', 'A', 'B'], ['S', 'A', 'C']],
    labels: ['S', 'A', 'B', 'C']
  },
  tri_sa_equilateral: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác đều',
    name: 'S.ABC (Đáy là tam giác đều)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(3, 0, 0),
      "C": new THREE.Vector3(1.5, 0, 2.598),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A']],
    rightAngles: [['S', 'A', 'B'], ['S', 'A', 'C']],
    labels: ['S', 'A', 'B', 'C']
  },
  tri_sa_right_a: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác vuông tại A',
    name: 'S.ABC (Đáy là tam giác vuông tại A)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(3, 0, 0),
      "C": new THREE.Vector3(0, 0, 2),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A']],
    rightAngles: [['S', 'A', 'B'], ['S', 'A', 'C']],
    labels: ['S', 'A', 'B', 'C']
  },
  tri_sa_right_b: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác vuông tại B',
    name: 'S.ABC (Đáy là tam giác vuông tại B)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(3, 0, 0),
      "C": new THREE.Vector3(3, 0, 2),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A']],
    rightAngles: [['S', 'A', 'B'], ['S', 'A', 'C']],
    labels: ['S', 'A', 'B', 'C']
  },
  tri_sa_right_c: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác vuông tại C',
    name: 'S.ABC (Đáy là tam giác vuông tại C)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(3, 0, 0),
      "C": new THREE.Vector3(1.5, 0, 1.5),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A']],
    rightAngles: [['S', 'A', 'B'], ['S', 'A', 'C']],
    labels: ['S', 'A', 'B', 'C']
  },
  tri_sa_isos_a: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác cân tại A',
    name: 'S.ABC (Đáy là tam giác cân tại A)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(2, 0, 2),
      "C": new THREE.Vector3(-2, 0, 2),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A']],
    rightAngles: [['S', 'A', 'B'], ['S', 'A', 'C']],
    labels: ['S', 'A', 'B', 'C']
  },
  tri_sa_isos_b: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác cân tại B',
    name: 'S.ABC (Đáy là tam giác cân tại B)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(3, 0, 0),
      "C": new THREE.Vector3(3, 0, 3),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A']],
    rightAngles: [['S', 'A', 'B'], ['S', 'A', 'C']],
    labels: ['S', 'A', 'B', 'C']
  },
  tri_sa_isos_c: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác cân tại C',
    name: 'S.ABC (Đáy là tam giác cân tại C)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(4, 0, 0),
      "C": new THREE.Vector3(2, 0, 3),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A']],
    rightAngles: [['S', 'A', 'B'], ['S', 'A', 'C']],
    labels: ['S', 'A', 'B', 'C']
  },
  tri_sab_general: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác thường',
    name: 'S.ABC (Đáy là tam giác thường)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(-1.5, 0, 0),
      "B": new THREE.Vector3(1.5, 0, 0),
      "H": new THREE.Vector3(0.0, 0.0, 0.0),
      "C": new THREE.Vector3(0.5, 0, 2),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A'], ['S', 'H']],
    rightAngles: [['S', 'H', 'A'], ['S', 'H', 'B']],
    labels: ['S', 'A', 'B', 'C', 'H']
  },
  tri_sab_equilateral: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác đều',
    name: 'S.ABC (Đáy là tam giác đều)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(-1.5, 0, 0),
      "B": new THREE.Vector3(1.5, 0, 0),
      "H": new THREE.Vector3(0.0, 0.0, 0.0),
      "C": new THREE.Vector3(0, 0, 2.598),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A'], ['S', 'H']],
    rightAngles: [['S', 'H', 'A'], ['S', 'H', 'B']],
    labels: ['S', 'A', 'B', 'C', 'H']
  },
  tri_sab_right_a: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác vuông tại A',
    name: 'S.ABC (Đáy là tam giác vuông tại A)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(-1.5, 0, 0),
      "B": new THREE.Vector3(1.5, 0, 0),
      "H": new THREE.Vector3(0.0, 0.0, 0.0),
      "C": new THREE.Vector3(-1.5, 0, 2),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A'], ['S', 'H']],
    rightAngles: [['S', 'H', 'A'], ['S', 'H', 'B']],
    labels: ['S', 'A', 'B', 'C', 'H']
  },
  tri_sab_right_b: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác vuông tại B',
    name: 'S.ABC (Đáy là tam giác vuông tại B)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(-1.5, 0, 0),
      "B": new THREE.Vector3(1.5, 0, 0),
      "H": new THREE.Vector3(0.0, 0.0, 0.0),
      "C": new THREE.Vector3(1.5, 0, 2),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A'], ['S', 'H']],
    rightAngles: [['S', 'H', 'A'], ['S', 'H', 'B']],
    labels: ['S', 'A', 'B', 'C', 'H']
  },
  tri_sab_right_c: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác vuông tại C',
    name: 'S.ABC (Đáy là tam giác vuông tại C)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(-1.5, 0, 0),
      "B": new THREE.Vector3(1.5, 0, 0),
      "H": new THREE.Vector3(0.0, 0.0, 0.0),
      "C": new THREE.Vector3(0, 0, 1.5),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A'], ['S', 'H']],
    rightAngles: [['S', 'H', 'A'], ['S', 'H', 'B']],
    labels: ['S', 'A', 'B', 'C', 'H']
  },
  tri_sab_isos_a: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác cân tại A',
    name: 'S.ABC (Đáy là tam giác cân tại A)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(-1.5, 0, 0),
      "B": new THREE.Vector3(1.5, 0, 0),
      "H": new THREE.Vector3(0.0, 0.0, 0.0),
      "C": new THREE.Vector3(0, 0, 2.598),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A'], ['S', 'H']],
    rightAngles: [['S', 'H', 'A'], ['S', 'H', 'B']],
    labels: ['S', 'A', 'B', 'C', 'H']
  },
  tri_sab_isos_b: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác cân tại B',
    name: 'S.ABC (Đáy là tam giác cân tại B)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(-1.5, 0, 0),
      "B": new THREE.Vector3(1.5, 0, 0),
      "H": new THREE.Vector3(0.0, 0.0, 0.0),
      "C": new THREE.Vector3(0, 0, 2.598),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A'], ['S', 'H']],
    rightAngles: [['S', 'H', 'A'], ['S', 'H', 'B']],
    labels: ['S', 'A', 'B', 'C', 'H']
  },
  tri_sab_isos_c: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Đáy là tam giác cân tại C',
    name: 'S.ABC (Đáy là tam giác cân tại C)',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(-1.5, 0, 0),
      "B": new THREE.Vector3(1.5, 0, 0),
      "H": new THREE.Vector3(0.0, 0.0, 0.0),
      "C": new THREE.Vector3(0, 0, 2),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A'], ['S', 'H']],
    rightAngles: [['S', 'H', 'A'], ['S', 'H', 'B']],
    labels: ['S', 'A', 'B', 'C', 'H']
  },
  tri_regular: {
    categoryName: 'Chóp tam giác S.ABC',
    subName: 'Khối chóp tam giác đều',
    name: 'Khối chóp tam giác đều',
    vertices: {
      "S": new THREE.Vector3(0, 3, 0),
      "A": new THREE.Vector3(0, 0, 1.732),
      "B": new THREE.Vector3(-1.5, 0, -0.866),
      "C": new THREE.Vector3(1.5, 0, -0.866),
      "M": new THREE.Vector3(0.0, 0.0, -0.87),
      "G": new THREE.Vector3(0.0, 0.0, 0.0),
    },
    faces: [['S','A','B'], ['S','B','C'], ['S','C','A'], ['A','B','C']],
    edges: [['S','A'], ['S','B'], ['S','C'], ['A','B'], ['B','C'], ['C','A'], ['A', 'M'], ['S', 'G']],
    rightAngles: [['S', 'G', 'A']],
    labels: ['S', 'A', 'B', 'C', 'M', 'G']
  },
  tetra_ab_general: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy là tam giác thường',
    name: 'ABCD (Đáy là tam giác thường)',
    vertices: {
      "A": new THREE.Vector3(0, 3, 0),
      "B": new THREE.Vector3(0, 0, 0),
      "C": new THREE.Vector3(3, 0, 0),
      "D": new THREE.Vector3(1, 0, 2),
    },
    faces: [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']],
    edges: [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B']],
    labels: ['A', 'B', 'C', 'D']
  },
  tetra_ab_equilateral: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy là tam giác đều',
    name: 'ABCD (Đáy là tam giác đều)',
    vertices: {
      "A": new THREE.Vector3(0, 3, 0),
      "B": new THREE.Vector3(0, 0, 0),
      "C": new THREE.Vector3(3, 0, 0),
      "D": new THREE.Vector3(1.5, 0, 2.598),
    },
    faces: [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']],
    edges: [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B']],
    labels: ['A', 'B', 'C', 'D']
  },
  tetra_ab_right_b: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy là tam giác vuông tại B',
    name: 'ABCD (Đáy là tam giác vuông tại B)',
    vertices: {
      "A": new THREE.Vector3(0, 3, 0),
      "B": new THREE.Vector3(0, 0, 0),
      "C": new THREE.Vector3(3, 0, 0),
      "D": new THREE.Vector3(0, 0, 2),
    },
    faces: [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']],
    edges: [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B']],
    labels: ['A', 'B', 'C', 'D']
  },
  tetra_ab_right_c: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy là tam giác vuông tại C',
    name: 'ABCD (Đáy là tam giác vuông tại C)',
    vertices: {
      "A": new THREE.Vector3(0, 3, 0),
      "B": new THREE.Vector3(0, 0, 0),
      "C": new THREE.Vector3(3, 0, 0),
      "D": new THREE.Vector3(3, 0, 2),
    },
    faces: [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']],
    edges: [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B']],
    labels: ['A', 'B', 'C', 'D']
  },
  tetra_ab_right_d: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy là tam giác vuông tại D',
    name: 'ABCD (Đáy là tam giác vuông tại D)',
    vertices: {
      "A": new THREE.Vector3(0, 3, 0),
      "B": new THREE.Vector3(0, 0, 0),
      "C": new THREE.Vector3(3, 0, 0),
      "D": new THREE.Vector3(1.5, 0, 1.5),
    },
    faces: [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']],
    edges: [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B']],
    labels: ['A', 'B', 'C', 'D']
  },
  tetra_ab_isos_b: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy là tam giác cân tại B',
    name: 'ABCD (Đáy là tam giác cân tại B)',
    vertices: {
      "A": new THREE.Vector3(0, 3, 0),
      "B": new THREE.Vector3(0, 0, 0),
      "C": new THREE.Vector3(2, 0, 2),
      "D": new THREE.Vector3(-2, 0, 2),
    },
    faces: [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']],
    edges: [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B']],
    labels: ['A', 'B', 'C', 'D']
  },
  tetra_ab_isos_c: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy là tam giác cân tại C',
    name: 'ABCD (Đáy là tam giác cân tại C)',
    vertices: {
      "A": new THREE.Vector3(0, 3, 0),
      "B": new THREE.Vector3(0, 0, 0),
      "C": new THREE.Vector3(3, 0, 0),
      "D": new THREE.Vector3(3, 0, 3),
    },
    faces: [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']],
    edges: [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B']],
    labels: ['A', 'B', 'C', 'D']
  },
  tetra_ab_isos_d: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy là tam giác cân tại D',
    name: 'ABCD (Đáy là tam giác cân tại D)',
    vertices: {
      "A": new THREE.Vector3(0, 3, 0),
      "B": new THREE.Vector3(0, 0, 0),
      "C": new THREE.Vector3(4, 0, 0),
      "D": new THREE.Vector3(2, 0, 3),
    },
    faces: [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']],
    edges: [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B']],
    labels: ['A', 'B', 'C', 'D']
  },
  tetra_abc_general: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy là tam giác thường',
    name: 'ABCD (Đáy là tam giác thường)',
    vertices: {
      "A": new THREE.Vector3(0, 3, 0),
      "B": new THREE.Vector3(-1.5, 0, 0),
      "C": new THREE.Vector3(1.5, 0, 0),
      "D": new THREE.Vector3(0.5, 0, 2),
    },
    faces: [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']],
    edges: [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B']],
    labels: ['A', 'B', 'C', 'D']
  },
  tetra_abc_equilateral: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy là tam giác đều',
    name: 'ABCD (Đáy là tam giác đều)',
    vertices: {
      "A": new THREE.Vector3(0, 3, 0),
      "B": new THREE.Vector3(-1.5, 0, 0),
      "C": new THREE.Vector3(1.5, 0, 0),
      "D": new THREE.Vector3(0, 0, 2.598),
    },
    faces: [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']],
    edges: [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B']],
    labels: ['A', 'B', 'C', 'D']
  },
  tetra_abc_right_b: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy là tam giác vuông tại B',
    name: 'ABCD (Đáy là tam giác vuông tại B)',
    vertices: {
      "A": new THREE.Vector3(0, 3, 0),
      "B": new THREE.Vector3(-1.5, 0, 0),
      "C": new THREE.Vector3(1.5, 0, 0),
      "D": new THREE.Vector3(-1.5, 0, 2),
    },
    faces: [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']],
    edges: [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B']],
    labels: ['A', 'B', 'C', 'D']
  },
  tetra_abc_right_c: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy là tam giác vuông tại C',
    name: 'ABCD (Đáy là tam giác vuông tại C)',
    vertices: {
      "A": new THREE.Vector3(0, 3, 0),
      "B": new THREE.Vector3(-1.5, 0, 0),
      "C": new THREE.Vector3(1.5, 0, 0),
      "D": new THREE.Vector3(1.5, 0, 2),
    },
    faces: [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']],
    edges: [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B']],
    labels: ['A', 'B', 'C', 'D']
  },
  tetra_abc_right_d: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy là tam giác vuông tại D',
    name: 'ABCD (Đáy là tam giác vuông tại D)',
    vertices: {
      "A": new THREE.Vector3(0, 3, 0),
      "B": new THREE.Vector3(-1.5, 0, 0),
      "C": new THREE.Vector3(1.5, 0, 0),
      "D": new THREE.Vector3(0, 0, 1.5),
    },
    faces: [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']],
    edges: [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B']],
    labels: ['A', 'B', 'C', 'D']
  },
  tetra_abc_isos_b: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy là tam giác cân tại B',
    name: 'ABCD (Đáy là tam giác cân tại B)',
    vertices: {
      "A": new THREE.Vector3(0, 3, 0),
      "B": new THREE.Vector3(-1.5, 0, 0),
      "C": new THREE.Vector3(1.5, 0, 0),
      "D": new THREE.Vector3(0, 0, 2.598),
    },
    faces: [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']],
    edges: [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B']],
    labels: ['A', 'B', 'C', 'D']
  },
  tetra_abc_isos_c: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy là tam giác cân tại C',
    name: 'ABCD (Đáy là tam giác cân tại C)',
    vertices: {
      "A": new THREE.Vector3(0, 3, 0),
      "B": new THREE.Vector3(-1.5, 0, 0),
      "C": new THREE.Vector3(1.5, 0, 0),
      "D": new THREE.Vector3(0, 0, 2.598),
    },
    faces: [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']],
    edges: [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B']],
    labels: ['A', 'B', 'C', 'D']
  },
  tetra_abc_isos_d: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Đáy là tam giác cân tại D',
    name: 'ABCD (Đáy là tam giác cân tại D)',
    vertices: {
      "A": new THREE.Vector3(0, 3, 0),
      "B": new THREE.Vector3(-1.5, 0, 0),
      "C": new THREE.Vector3(1.5, 0, 0),
      "D": new THREE.Vector3(0, 0, 2),
    },
    faces: [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']],
    edges: [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B']],
    labels: ['A', 'B', 'C', 'D']
  },
  tetra_regular: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Tứ diện đều',
    name: 'Tứ diện đều',
    vertices: {
      "A": new THREE.Vector3(0, 2.45, 0),
      "B": new THREE.Vector3(0, 0, 1.732),
      "C": new THREE.Vector3(-1.5, 0, -0.866),
      "D": new THREE.Vector3(1.5, 0, -0.866),
      "M": new THREE.Vector3(0, 0, -0.866),
      "G": new THREE.Vector3(0, 0, 0),
    },
    faces: [['A','B','C'], ['A','C','D'], ['A','D','B'], ['B','C','D']],
    edges: [['A','B'], ['A','C'], ['A','D'], ['B','C'], ['C','D'], ['D','B'], ['B', 'M'], ['A', 'G']],
    rightAngles: [['A', 'G', 'B']],
    labels: ['A', 'B', 'C', 'D', 'M', 'G']
  },
  tetra_right: {
    categoryName: 'Tứ diện ABCD',
    subName: 'Tứ diện vuông (O.ABC)',
    name: 'Tứ diện vuông (O.ABC)',
    vertices: {
      "O": new THREE.Vector3(0, 0, 0),
      "A": new THREE.Vector3(0, 3, 0),
      "B": new THREE.Vector3(3, 0, 0),
      "C": new THREE.Vector3(0, 0, 3),
    },
    faces: [['O','A','B'], ['O','B','C'], ['O','C','A'], ['A','B','C']],
    edges: [['O','A'], ['O','B'], ['O','C'], ['A','B'], ['B','C'], ['C','A']],
    labels: ['O', 'A', 'B', 'C']
  },
  prism_r_square: {
    categoryName: 'Lăng trụ đứng',
    subName: 'Đáy là hình vuông',
    name: 'Lăng trụ đứng (Đáy là hình vuông)',
    vertices: {
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(2, 0, 0),
      "D": new THREE.Vector3(0, 0, 2),
      "C": new THREE.Vector3(2, 0, 2),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(2, 3, 0),
      "D'": new THREE.Vector3(0, 3, 2),
      "C'": new THREE.Vector3(2, 3, 2),
    },
    faces: [['A', 'B', 'C', 'D'], ['A\'', 'B\'', 'C\'', 'D\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'D', 'D\'', 'C\''], ['D', 'A', 'A\'', 'D\'']],
    edges: [['A','B'], ['B','C'], ['C','D'], ['D','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','D\''], ['D\'','A\''], ['A','A\''], ['B','B\''], ['C','C\''], ['D','D\'']],
    labels: ['A', 'B', 'C', 'D', 'A\'', 'B\'', 'C\'', 'D\'']
  },
  prism_r_rect: {
    categoryName: 'Lăng trụ đứng',
    subName: 'Đáy là hình chữ nhật',
    name: 'Lăng trụ đứng (Đáy là hình chữ nhật)',
    vertices: {
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(3, 0, 0),
      "D": new THREE.Vector3(0, 0, 2),
      "C": new THREE.Vector3(3, 0, 2),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(3, 3, 0),
      "D'": new THREE.Vector3(0, 3, 2),
      "C'": new THREE.Vector3(3, 3, 2),
    },
    faces: [['A', 'B', 'C', 'D'], ['A\'', 'B\'', 'C\'', 'D\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'D', 'D\'', 'C\''], ['D', 'A', 'A\'', 'D\'']],
    edges: [['A','B'], ['B','C'], ['C','D'], ['D','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','D\''], ['D\'','A\''], ['A','A\''], ['B','B\''], ['C','C\''], ['D','D\'']],
    labels: ['A', 'B', 'C', 'D', 'A\'', 'B\'', 'C\'', 'D\'']
  },
  prism_r_para: {
    categoryName: 'Lăng trụ đứng',
    subName: 'Đáy là hình bình hành',
    name: 'Lăng trụ đứng (Đáy là hình bình hành)',
    vertices: {
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(3, 0, 0),
      "D": new THREE.Vector3(1, 0, 2),
      "C": new THREE.Vector3(4, 0, 2),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(3, 3, 0),
      "D'": new THREE.Vector3(1, 3, 2),
      "C'": new THREE.Vector3(4, 3, 2),
    },
    faces: [['A', 'B', 'C', 'D'], ['A\'', 'B\'', 'C\'', 'D\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'D', 'D\'', 'C\''], ['D', 'A', 'A\'', 'D\'']],
    edges: [['A','B'], ['B','C'], ['C','D'], ['D','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','D\''], ['D\'','A\''], ['A','A\''], ['B','B\''], ['C','C\''], ['D','D\'']],
    labels: ['A', 'B', 'C', 'D', 'A\'', 'B\'', 'C\'', 'D\'']
  },
  prism_r_rhom: {
    categoryName: 'Lăng trụ đứng',
    subName: 'Đáy là hình thoi',
    name: 'Lăng trụ đứng (Đáy là hình thoi)',
    vertices: {
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(2, 0, 0),
      "D": new THREE.Vector3(1, 0, 1.732),
      "C": new THREE.Vector3(3, 0, 1.732),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(2, 3, 0),
      "D'": new THREE.Vector3(1, 3, 1.732),
      "C'": new THREE.Vector3(3, 3, 1.732),
    },
    faces: [['A', 'B', 'C', 'D'], ['A\'', 'B\'', 'C\'', 'D\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'D', 'D\'', 'C\''], ['D', 'A', 'A\'', 'D\'']],
    edges: [['A','B'], ['B','C'], ['C','D'], ['D','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','D\''], ['D\'','A\''], ['A','A\''], ['B','B\''], ['C','C\''], ['D','D\'']],
    labels: ['A', 'B', 'C', 'D', 'A\'', 'B\'', 'C\'', 'D\'']
  },
  prism_r_trap: {
    categoryName: 'Lăng trụ đứng',
    subName: 'Đáy là hình thang',
    name: 'Lăng trụ đứng (Đáy là hình thang)',
    vertices: {
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(4, 0, 0),
      "D": new THREE.Vector3(1, 0, 2),
      "C": new THREE.Vector3(3, 0, 2),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(4, 3, 0),
      "D'": new THREE.Vector3(1, 3, 2),
      "C'": new THREE.Vector3(3, 3, 2),
    },
    faces: [['A', 'B', 'C', 'D'], ['A\'', 'B\'', 'C\'', 'D\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'D', 'D\'', 'C\''], ['D', 'A', 'A\'', 'D\'']],
    edges: [['A','B'], ['B','C'], ['C','D'], ['D','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','D\''], ['D\'','A\''], ['A','A\''], ['B','B\''], ['C','C\''], ['D','D\'']],
    labels: ['A', 'B', 'C', 'D', 'A\'', 'B\'', 'C\'', 'D\'']
  },
  prism_r_t_right_a: {
    categoryName: 'Lăng trụ đứng',
    subName: 'Đáy là tam giác vuông tại A',
    name: 'Lăng trụ đứng (Đáy là tam giác vuông tại A)',
    vertices: {
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(3, 0, 0),
      "C": new THREE.Vector3(0, 0, 2),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(3, 3, 0),
      "C'": new THREE.Vector3(0, 3, 2),
    },
    faces: [['A', 'B', 'C'], ['A\'', 'B\'', 'C\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'A', 'A\'', 'C\'']],
    edges: [['A','B'], ['B','C'], ['C','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','A\''], ['A','A\''], ['B','B\''], ['C','C\'']],
    labels: ['A', 'B', 'C', 'A\'', 'B\'', 'C\'']
  },
  prism_r_t_right_b: {
    categoryName: 'Lăng trụ đứng',
    subName: 'Đáy là tam giác vuông tại B',
    name: 'Lăng trụ đứng (Đáy là tam giác vuông tại B)',
    vertices: {
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(3, 0, 0),
      "C": new THREE.Vector3(3, 0, 2),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(3, 3, 0),
      "C'": new THREE.Vector3(3, 3, 2),
    },
    faces: [['A', 'B', 'C'], ['A\'', 'B\'', 'C\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'A', 'A\'', 'C\'']],
    edges: [['A','B'], ['B','C'], ['C','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','A\''], ['A','A\''], ['B','B\''], ['C','C\'']],
    labels: ['A', 'B', 'C', 'A\'', 'B\'', 'C\'']
  },
  prism_r_t_right_c: {
    categoryName: 'Lăng trụ đứng',
    subName: 'Đáy là tam giác vuông tại C',
    name: 'Lăng trụ đứng (Đáy là tam giác vuông tại C)',
    vertices: {
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(3, 0, 0),
      "C": new THREE.Vector3(1.5, 0, 1.5),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(3, 3, 0),
      "C'": new THREE.Vector3(1.5, 3, 1.5),
    },
    faces: [['A', 'B', 'C'], ['A\'', 'B\'', 'C\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'A', 'A\'', 'C\'']],
    edges: [['A','B'], ['B','C'], ['C','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','A\''], ['A','A\''], ['B','B\''], ['C','C\'']],
    labels: ['A', 'B', 'C', 'A\'', 'B\'', 'C\'']
  },
  prism_r_t_isos_a: {
    categoryName: 'Lăng trụ đứng',
    subName: 'Đáy là tam giác cân tại A',
    name: 'Lăng trụ đứng (Đáy là tam giác cân tại A)',
    vertices: {
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(2, 0, 2),
      "C": new THREE.Vector3(-2, 0, 2),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(2, 3, 2),
      "C'": new THREE.Vector3(-2, 3, 2),
    },
    faces: [['A', 'B', 'C'], ['A\'', 'B\'', 'C\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'A', 'A\'', 'C\'']],
    edges: [['A','B'], ['B','C'], ['C','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','A\''], ['A','A\''], ['B','B\''], ['C','C\'']],
    labels: ['A', 'B', 'C', 'A\'', 'B\'', 'C\'']
  },
  prism_r_t_isos_b: {
    categoryName: 'Lăng trụ đứng',
    subName: 'Đáy là tam giác cân tại B',
    name: 'Lăng trụ đứng (Đáy là tam giác cân tại B)',
    vertices: {
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(3, 0, 0),
      "C": new THREE.Vector3(3, 0, 3),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(3, 3, 0),
      "C'": new THREE.Vector3(3, 3, 3),
    },
    faces: [['A', 'B', 'C'], ['A\'', 'B\'', 'C\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'A', 'A\'', 'C\'']],
    edges: [['A','B'], ['B','C'], ['C','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','A\''], ['A','A\''], ['B','B\''], ['C','C\'']],
    labels: ['A', 'B', 'C', 'A\'', 'B\'', 'C\'']
  },
  prism_r_t_isos_c: {
    categoryName: 'Lăng trụ đứng',
    subName: 'Đáy là tam giác cân tại C',
    name: 'Lăng trụ đứng (Đáy là tam giác cân tại C)',
    vertices: {
      "A": new THREE.Vector3(0, 0, 0),
      "B": new THREE.Vector3(4, 0, 0),
      "C": new THREE.Vector3(2, 0, 3),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(4, 3, 0),
      "C'": new THREE.Vector3(2, 3, 3),
    },
    faces: [['A', 'B', 'C'], ['A\'', 'B\'', 'C\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'A', 'A\'', 'C\'']],
    edges: [['A','B'], ['B','C'], ['C','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','A\''], ['A','A\''], ['B','B\''], ['C','C\'']],
    labels: ['A', 'B', 'C', 'A\'', 'B\'', 'C\'']
  },
  prism_o_square: {
    categoryName: 'Lăng trụ xiên',
    subName: 'Đáy là hình vuông',
    name: 'Lăng trụ xiên (Đáy là hình vuông)',
    vertices: {
      "A": new THREE.Vector3(-1, 0, -1),
      "B": new THREE.Vector3(1, 0, -1),
      "D": new THREE.Vector3(-1, 0, 1),
      "C": new THREE.Vector3(1, 0, 1),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(2, 3, 0),
      "D'": new THREE.Vector3(0, 3, 2),
      "C'": new THREE.Vector3(2, 3, 2),
    },
    faces: [['A', 'B', 'C', 'D'], ['A\'', 'B\'', 'C\'', 'D\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'D', 'D\'', 'C\''], ['D', 'A', 'A\'', 'D\'']],
    edges: [['A','B'], ['B','C'], ['C','D'], ['D','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','D\''], ['D\'','A\''], ['A','A\''], ['B','B\''], ['C','C\''], ['D','D\'']],
    labels: ['A', 'B', 'C', 'D', 'A\'', 'B\'', 'C\'', 'D\'']
  },
  prism_o_rect: {
    categoryName: 'Lăng trụ xiên',
    subName: 'Đáy là hình chữ nhật',
    name: 'Lăng trụ xiên (Đáy là hình chữ nhật)',
    vertices: {
      "A": new THREE.Vector3(-1, 0, -1),
      "B": new THREE.Vector3(2, 0, -1),
      "D": new THREE.Vector3(-1, 0, 1),
      "C": new THREE.Vector3(2, 0, 1),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(3, 3, 0),
      "D'": new THREE.Vector3(0, 3, 2),
      "C'": new THREE.Vector3(3, 3, 2),
    },
    faces: [['A', 'B', 'C', 'D'], ['A\'', 'B\'', 'C\'', 'D\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'D', 'D\'', 'C\''], ['D', 'A', 'A\'', 'D\'']],
    edges: [['A','B'], ['B','C'], ['C','D'], ['D','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','D\''], ['D\'','A\''], ['A','A\''], ['B','B\''], ['C','C\''], ['D','D\'']],
    labels: ['A', 'B', 'C', 'D', 'A\'', 'B\'', 'C\'', 'D\'']
  },
  prism_o_para: {
    categoryName: 'Lăng trụ xiên',
    subName: 'Đáy là hình bình hành',
    name: 'Lăng trụ xiên (Đáy là hình bình hành)',
    vertices: {
      "A": new THREE.Vector3(-1, 0, -1),
      "B": new THREE.Vector3(2, 0, -1),
      "D": new THREE.Vector3(0, 0, 1),
      "C": new THREE.Vector3(3, 0, 1),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(3, 3, 0),
      "D'": new THREE.Vector3(1, 3, 2),
      "C'": new THREE.Vector3(4, 3, 2),
    },
    faces: [['A', 'B', 'C', 'D'], ['A\'', 'B\'', 'C\'', 'D\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'D', 'D\'', 'C\''], ['D', 'A', 'A\'', 'D\'']],
    edges: [['A','B'], ['B','C'], ['C','D'], ['D','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','D\''], ['D\'','A\''], ['A','A\''], ['B','B\''], ['C','C\''], ['D','D\'']],
    labels: ['A', 'B', 'C', 'D', 'A\'', 'B\'', 'C\'', 'D\'']
  },
  prism_o_rhom: {
    categoryName: 'Lăng trụ xiên',
    subName: 'Đáy là hình thoi',
    name: 'Lăng trụ xiên (Đáy là hình thoi)',
    vertices: {
      "A": new THREE.Vector3(-1, 0, -1),
      "B": new THREE.Vector3(1, 0, -1),
      "D": new THREE.Vector3(0, 0, 0.732),
      "C": new THREE.Vector3(2, 0, 0.732),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(2, 3, 0),
      "D'": new THREE.Vector3(1, 3, 1.732),
      "C'": new THREE.Vector3(3, 3, 1.732),
    },
    faces: [['A', 'B', 'C', 'D'], ['A\'', 'B\'', 'C\'', 'D\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'D', 'D\'', 'C\''], ['D', 'A', 'A\'', 'D\'']],
    edges: [['A','B'], ['B','C'], ['C','D'], ['D','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','D\''], ['D\'','A\''], ['A','A\''], ['B','B\''], ['C','C\''], ['D','D\'']],
    labels: ['A', 'B', 'C', 'D', 'A\'', 'B\'', 'C\'', 'D\'']
  },
  prism_o_trap: {
    categoryName: 'Lăng trụ xiên',
    subName: 'Đáy là hình thang',
    name: 'Lăng trụ xiên (Đáy là hình thang)',
    vertices: {
      "A": new THREE.Vector3(-1, 0, -1),
      "B": new THREE.Vector3(3, 0, -1),
      "D": new THREE.Vector3(0, 0, 1),
      "C": new THREE.Vector3(2, 0, 1),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(4, 3, 0),
      "D'": new THREE.Vector3(1, 3, 2),
      "C'": new THREE.Vector3(3, 3, 2),
    },
    faces: [['A', 'B', 'C', 'D'], ['A\'', 'B\'', 'C\'', 'D\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'D', 'D\'', 'C\''], ['D', 'A', 'A\'', 'D\'']],
    edges: [['A','B'], ['B','C'], ['C','D'], ['D','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','D\''], ['D\'','A\''], ['A','A\''], ['B','B\''], ['C','C\''], ['D','D\'']],
    labels: ['A', 'B', 'C', 'D', 'A\'', 'B\'', 'C\'', 'D\'']
  },
  prism_o_t_right_a: {
    categoryName: 'Lăng trụ xiên',
    subName: 'Đáy là tam giác vuông tại A',
    name: 'Lăng trụ xiên (Đáy là tam giác vuông tại A)',
    vertices: {
      "A": new THREE.Vector3(-1, 0, -1),
      "B": new THREE.Vector3(2, 0, -1),
      "C": new THREE.Vector3(-1, 0, 1),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(3, 3, 0),
      "C'": new THREE.Vector3(0, 3, 2),
    },
    faces: [['A', 'B', 'C'], ['A\'', 'B\'', 'C\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'A', 'A\'', 'C\'']],
    edges: [['A','B'], ['B','C'], ['C','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','A\''], ['A','A\''], ['B','B\''], ['C','C\'']],
    labels: ['A', 'B', 'C', 'A\'', 'B\'', 'C\'']
  },
  prism_o_t_right_b: {
    categoryName: 'Lăng trụ xiên',
    subName: 'Đáy là tam giác vuông tại B',
    name: 'Lăng trụ xiên (Đáy là tam giác vuông tại B)',
    vertices: {
      "A": new THREE.Vector3(-1, 0, -1),
      "B": new THREE.Vector3(2, 0, -1),
      "C": new THREE.Vector3(2, 0, 1),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(3, 3, 0),
      "C'": new THREE.Vector3(3, 3, 2),
    },
    faces: [['A', 'B', 'C'], ['A\'', 'B\'', 'C\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'A', 'A\'', 'C\'']],
    edges: [['A','B'], ['B','C'], ['C','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','A\''], ['A','A\''], ['B','B\''], ['C','C\'']],
    labels: ['A', 'B', 'C', 'A\'', 'B\'', 'C\'']
  },
  prism_o_t_right_c: {
    categoryName: 'Lăng trụ xiên',
    subName: 'Đáy là tam giác vuông tại C',
    name: 'Lăng trụ xiên (Đáy là tam giác vuông tại C)',
    vertices: {
      "A": new THREE.Vector3(-1, 0, -1),
      "B": new THREE.Vector3(2, 0, -1),
      "C": new THREE.Vector3(0.5, 0, 0.5),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(3, 3, 0),
      "C'": new THREE.Vector3(1.5, 3, 1.5),
    },
    faces: [['A', 'B', 'C'], ['A\'', 'B\'', 'C\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'A', 'A\'', 'C\'']],
    edges: [['A','B'], ['B','C'], ['C','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','A\''], ['A','A\''], ['B','B\''], ['C','C\'']],
    labels: ['A', 'B', 'C', 'A\'', 'B\'', 'C\'']
  },
  prism_o_t_isos_a: {
    categoryName: 'Lăng trụ xiên',
    subName: 'Đáy là tam giác cân tại A',
    name: 'Lăng trụ xiên (Đáy là tam giác cân tại A)',
    vertices: {
      "A": new THREE.Vector3(-1, 0, -1),
      "B": new THREE.Vector3(1, 0, 1),
      "C": new THREE.Vector3(-3, 0, 1),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(2, 3, 2),
      "C'": new THREE.Vector3(-2, 3, 2),
    },
    faces: [['A', 'B', 'C'], ['A\'', 'B\'', 'C\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'A', 'A\'', 'C\'']],
    edges: [['A','B'], ['B','C'], ['C','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','A\''], ['A','A\''], ['B','B\''], ['C','C\'']],
    labels: ['A', 'B', 'C', 'A\'', 'B\'', 'C\'']
  },
  prism_o_t_isos_b: {
    categoryName: 'Lăng trụ xiên',
    subName: 'Đáy là tam giác cân tại B',
    name: 'Lăng trụ xiên (Đáy là tam giác cân tại B)',
    vertices: {
      "A": new THREE.Vector3(-1, 0, -1),
      "B": new THREE.Vector3(2, 0, -1),
      "C": new THREE.Vector3(2, 0, 2),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(3, 3, 0),
      "C'": new THREE.Vector3(3, 3, 3),
    },
    faces: [['A', 'B', 'C'], ['A\'', 'B\'', 'C\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'A', 'A\'', 'C\'']],
    edges: [['A','B'], ['B','C'], ['C','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','A\''], ['A','A\''], ['B','B\''], ['C','C\'']],
    labels: ['A', 'B', 'C', 'A\'', 'B\'', 'C\'']
  },
  prism_o_t_isos_c: {
    categoryName: 'Lăng trụ xiên',
    subName: 'Đáy là tam giác cân tại C',
    name: 'Lăng trụ xiên (Đáy là tam giác cân tại C)',
    vertices: {
      "A": new THREE.Vector3(-1, 0, -1),
      "B": new THREE.Vector3(3, 0, -1),
      "C": new THREE.Vector3(1, 0, 2),
      "A'": new THREE.Vector3(0, 3, 0),
      "B'": new THREE.Vector3(4, 3, 0),
      "C'": new THREE.Vector3(2, 3, 3),
    },
    faces: [['A', 'B', 'C'], ['A\'', 'B\'', 'C\''], ['A', 'B', 'B\'', 'A\''], ['B', 'C', 'C\'', 'B\''], ['C', 'A', 'A\'', 'C\'']],
    edges: [['A','B'], ['B','C'], ['C','A'], ['A\'','B\''], ['B\'','C\''], ['C\'','A\''], ['A','A\''], ['B','B\''], ['C','C\'']],
    labels: ['A', 'B', 'C', 'A\'', 'B\'', 'C\'']
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
  const [activeCatId, setActiveCatId] = useState(null);
  const [activeSubgroupId, setActiveSubgroupId] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const updatePosition = useCallback(() => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setActiveCatId(null);
      setActiveSubgroupId(null);
      return;
    }
    updatePosition();
    const handleClickOutside = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target) &&
          menuRef.current && !menuRef.current.contains(e.target)) {
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

  const currentShape = SHAPES[value] || SHAPES.quad_parallelogram || Object.values(SHAPES)[0];
  const activeCat = SHAPE_CATEGORIES.find(c => c.id === activeCatId);
  const activeSubgroup = activeCat?.subgroups?.find(s => s.id === activeSubgroupId);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
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
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            zIndex: 99999,
            display: 'flex',
            gap: '6px',
            alignItems: 'flex-start',
            fontFamily: 'inherit'
          }}
        >
          {/* Level 1: Categories */}
          <div className="custom-scrollbar" style={{ 
            width: Math.max(320, pos.width), 
            background: '#ffffff', 
            borderRadius: '10px', 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)', 
            padding: '8px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '4px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {SHAPE_CATEGORIES.map(category => {
              const isActive = activeCatId === category.id;
              return (
                <div
                  key={category.id}
                  onMouseEnter={() => { setActiveCatId(category.id); setActiveSubgroupId(null); }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isActive ? '#f8fafc' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '14px',
                    color: isActive ? '#0f172a' : '#334155',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: isActive ? '#2563eb' : '#94a3b8' }}>▶</span>
                </div>
              );
            })}
          </div>

          {/* Level 2: Subgroups or Items */}
          {activeCat && (
            <div className="custom-scrollbar" style={{ 
              width: 300, 
              background: '#ffffff', 
              borderRadius: '10px', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)', 
              padding: '8px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '4px',
              maxHeight: '400px',
              overflowY: 'auto',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              {activeCat.subgroups && activeCat.subgroups.map(sg => {
                const isActive = activeSubgroupId === sg.id;
                return (
                  <div
                    key={sg.id}
                    onMouseEnter={() => setActiveSubgroupId(sg.id)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isActive ? '#f8fafc' : 'transparent',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '13.5px',
                      color: isActive ? '#0f172a' : '#334155',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span>{sg.name}</span>
                    <span style={{ fontSize: '12px', color: isActive ? '#2563eb' : '#94a3b8' }}>▶</span>
                  </div>
                );
              })}

              {activeCat.items && activeCat.items.length > 0 && activeCat.subgroups && <div style={{height: '1px', background: '#e2e8f0', margin: '4px 0'}} />}
              
              {activeCat.items && activeCat.items.map(item => (
                <div
                  key={item.id}
                  onClick={() => { onChange(item.id); setIsOpen(false); }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = value === item.id ? '#dbeafe' : '#f8fafc'; setActiveSubgroupId(null); }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = value === item.id ? '#dbeafe' : 'transparent'; }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13.5px',
                    background: value === item.id ? '#dbeafe' : 'transparent',
                    color: value === item.id ? '#1d4ed8' : '#334155',
                    fontWeight: value === item.id ? 600 : 500,
                    transition: 'all 0.15s'
                  }}
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}

          {/* Level 3: Items within Subgroup */}
          {activeSubgroup && (
            <div className="custom-scrollbar" style={{ 
              width: 300, 
              background: '#ffffff', 
              borderRadius: '10px', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)', 
              padding: '8px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '4px',
              maxHeight: '400px',
              overflowY: 'auto',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              {activeSubgroup.items.map(item => (
                <div
                  key={item.id}
                  onClick={() => { onChange(item.id); setIsOpen(false); }}
                  onMouseEnter={(e) => e.currentTarget.style.background = value === item.id ? '#dbeafe' : '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = value === item.id ? '#dbeafe' : 'transparent'}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13.5px',
                    background: value === item.id ? '#dbeafe' : 'transparent',
                    color: value === item.id ? '#1d4ed8' : '#334155',
                    fontWeight: value === item.id ? 600 : 500,
                    transition: 'all 0.15s'
                  }}
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}

        </div>,
        document.body
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
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


const RightAngleSymbol = ({ p1, p2, p3 }) => {
  if (!p1 || !p2 || !p3) return null;
  const size = 0.3;
  // dir1 is from p2 to p1
  const dir1 = new THREE.Vector3().subVectors(p1, p2).normalize();
  // dir2 is from p2 to p3
  const dir2 = new THREE.Vector3().subVectors(p3, p2).normalize();
  
  const pt1 = new THREE.Vector3().copy(p2).addScaledVector(dir1, size);
  const pt2 = new THREE.Vector3().copy(pt1).addScaledVector(dir2, size);
  const pt3 = new THREE.Vector3().copy(p2).addScaledVector(dir2, size);

  return (
    <group>
      <Line points={[pt1, pt2, pt3]} color="#ef4444" lineWidth={1.5} dashed={false} />
    </group>
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

const CustomConnectionLine = ({ p1, p2, shape, useDashed, isExternalLine }) => {
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
    
    if (!useDashed || isExternalLine) {
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

const DraggableVertex = ({
  label,
  displayLabel,
  hideDot,
  pos,
  isCustom,
  isEditing,
  onDragStart,
  onDrag,
  onDragEnd,
  mounted
}) => {
  const [hovered, setHovered] = useState(false);
  const isDraggingRef = useRef(false);
  const dragPlaneRef = useRef(new THREE.Plane());
  const intersectPointRef = useRef(new THREE.Vector3());

  const handlePointerDown = (e) => {
    if (!isEditing || isCustom) return;
    e.stopPropagation();
    isDraggingRef.current = true;
    const camDir = e.camera.getWorldDirection(new THREE.Vector3()).negate();
    dragPlaneRef.current.setFromNormalAndCoplanarPoint(camDir, pos);
    onDragStart(label);
    if (e.target && e.target.setPointerCapture) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !isEditing) return;
    e.stopPropagation();
    if (e.ray.intersectPlane(dragPlaneRef.current, intersectPointRef.current)) {
      onDrag(label, intersectPointRef.current.clone());
    }
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    e.stopPropagation();
    isDraggingRef.current = false;
    onDragEnd(label);
    if (e.target && e.target.releasePointerCapture) {
      try {
        e.target.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const radius = isEditing && !isCustom ? 0.12 : (isCustom ? 0.05 : 0.06);
  const color = isEditing && !isCustom 
    ? (hovered ? '#f59e0b' : '#2563eb') 
    : (isCustom ? '#10b981' : '#334155');

  return (
    <group position={[pos.x, pos.y, pos.z]}>
      {!hideDot && <mesh
        onPointerOver={(e) => {
          if (isEditing && !isCustom) {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'grab';
          }
        }}
        onPointerOut={(e) => {
          if (isEditing && !isCustom) {
            e.stopPropagation();
            setHovered(false);
            if (!isDraggingRef.current) document.body.style.cursor = 'auto';
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial 
          color={color} 
          emissive={isEditing && !isCustom && hovered ? '#f59e0b' : '#000000'}
          emissiveIntensity={isEditing && !isCustom && hovered ? 0.5 : 0}
        />
      </mesh>}
      {isEditing && !isCustom && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.15, 0.19, 32]} />
          <meshBasicMaterial color={hovered ? '#f59e0b' : '#3b82f6'} side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
      {mounted && (
        <Html center distanceFactor={12} style={{ pointerEvents: 'none', zIndex: 100 }}>
          <div style={{ 
            color: isCustom ? '#059669' : (isEditing ? '#1d4ed8' : '#0f172a'), 
            fontWeight: 'bold', 
            fontSize: isEditing ? '20px' : (isCustom ? '16px' : '18px'), 
            fontFamily: 'serif',
            transform: 'translate(14px, 0px)',
            textShadow: '1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff',
            userSelect: 'none'
          }}>
            {displayLabel ?? label}
          </div>
        </Html>
      )}
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
          <h3 style={{ margin: 0, fontWeight: 'bold', color: '#1e293b', fontSize: '18px' }}>Mß║╖t phß║│ng ({planeLabels.join(', ')})</h3>
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
              <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>G├│c xoay:</label>
              <input 
                type="range" 
                min="-180" 
                max="180" 
                value={rotationZ} 
                onChange={(e) => setRotationZ(Number(e.target.value))} 
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', color: '#64748b', minWidth: '40px', textAlign: 'right' }}>{rotationZ}┬░</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

const PerpendicularGeometry3D = () => {
  const [mounted, setMounted] = useState(false);
  const controlsRef = useRef(null);

  const [selectedShape, setSelectedShape] = useState('quad_sa_parallelogram');
  const [mode, setMode] = useState('planes'); // 'planes' | 'line_plane'
  const [useDashed, setUseDashed] = useState(true);
  const [view2DPlane, setView2DPlane] = useState(null);

  // States for point editing
  const [isEditingPoints, setIsEditingPoints] = useState(false);
  const [customVerticesMap, setCustomVerticesMap] = useState({});
  const [selectedEditPoint, setSelectedEditPoint] = useState('S');
  const [isDraggingVertex, setIsDraggingVertex] = useState(false);

  const resetView = () => {
    const controls = controlsRef.current;
    if (controls) {
      controls.object.position.set(0, 4.5, 10.5);
      controls.target.set(0, 0.5, 0);
      controls.update();
    }
    setCustomVerticesMap({});
  };
  
  // Unified selection blocks
  const [selections, setSelections] = useState([[], [], [], []]);
  
  // Custom points
  const [customRightAngles, setCustomRightAngles] = useState([]);
  const [customPoints, setCustomPoints] = useState([]);
  const [showCrossSection, setShowCrossSection] = useState(false);
  const [newPointLabel, setNewPointLabel] = useState('');
  const [newPointEdge, setNewPointEdge] = useState('');
  const [ratioNum, setRatioNum] = useState(1);
  const [ratioDen, setRatioDen] = useState(2);
  
  // Connections
  const [connections, setConnections] = useState([]);
  const [connectP1, setConnectP1] = useState('');
  const [connectP2, setConnectP2] = useState('');
  // Parallel
  const [parallelPoint, setParallelPoint] = useState('');
  const [parallelLine, setParallelLine] = useState('');
  const [parallelLabel, setParallelLabel] = useState('');


  // Intersections
  const [interLine1, setInterLine1] = useState('');
  const [interLine2, setInterLine2] = useState('');
  const [newInterLabel, setNewInterLabel] = useState('');
  const [suggestedInterLabel, setSuggestedInterLabel] = useState('O');

  const shape = SHAPES[selectedShape] || SHAPES.quad_parallelogram;

  const [swapVertices, setSwapVertices] = useState(false);

  // Auto clear selections when shape changes
  React.useEffect(() => {
    setSelections([[], [], [], []]);
    setCustomPoints([]);
    setConnections([]);
    setSwapVertices(false);
    setCustomVerticesMap({});
    
    if (shape && shape.labels.length > 0) {
      setSelectedEditPoint(shape.labels[0]);
    }
    setNewPointEdge('');
  }, [selectedShape, shape]);

  const { isTeacher } = useRole();
  const [teacherDefaultShapes, setTeacherDefaultShapes] = useState({});
  const [isSavingDefault, setIsSavingDefault] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Load saved default shapes (system-wide from Supabase / localStorage)
  useEffect(() => {
    let active = true;
    getSetting('space_geometry_defaults', {}, true)
      .then(saved => {
        if (active && saved && typeof saved === 'object') {
          setTeacherDefaultShapes(saved);
        }
      })
      .catch(err => {
        console.error('Failed to load space geometry default shapes:', err);
      });
    return () => { active = false; };
  }, []);

  const currentShapeDefaults = useMemo(() => {
    const raw = teacherDefaultShapes[selectedShape];
    if (!raw) return null;
    const map = {};
    for (const [k, v] of Object.entries(raw)) {
      if (v && typeof v.x === 'number' && typeof v.y === 'number' && typeof v.z === 'number') {
        map[k] = new THREE.Vector3(v.x, v.y, v.z);
      }
    }
    return Object.keys(map).length > 0 ? map : null;
  }, [teacherDefaultShapes, selectedShape]);

  const hasTeacherDefault = Boolean(teacherDefaultShapes[selectedShape]);

  const baseVertices = useMemo(() => {
    if (!shape) return {};
    const verts = {};
    for (const [k, v] of Object.entries(shape.vertices)) {
      if (customVerticesMap[k]) {
        verts[k] = customVerticesMap[k].clone();
      } else if (currentShapeDefaults && currentShapeDefaults[k]) {
        verts[k] = currentShapeDefaults[k].clone();
      } else {
        verts[k] = v.clone();
      }
    }
    return verts;
  }, [shape, customVerticesMap, currentShapeDefaults]);

  const swappedBaseVertices = useMemo(() => {
    const verts = {};
    for (const [k, v] of Object.entries(baseVertices)) {
      verts[k] = v.clone();
    }
    
    if (swapVertices) {
      const isTetra = selectedShape.startsWith('tetra') || selectedShape === 'tetrahedron';
      const isTri = selectedShape.startsWith('tri') || selectedShape === 'triangularPyramid';
      const isQuad = selectedShape.startsWith('quad') || (selectedShape.includes('Pyramid') && !isTri);
      const isPrismQuad = selectedShape.includes('prism_') && (selectedShape.includes('square') || selectedShape.includes('rectangle') || selectedShape.includes('parallelogram') || selectedShape.includes('rhombus') || selectedShape.includes('trapezoid'));
      const isPrismTri = selectedShape.includes('prism_') && selectedShape.includes('tri_');

      if (isQuad || isPrismQuad) {
        const temp = verts['B'];
        verts['B'] = verts['D'];
        verts['D'] = temp;
        if (isPrismQuad && verts["B'"] && verts["D'"]) {
          const tempP = verts["B'"];
          verts["B'"] = verts["D'"];
          verts["D'"] = tempP;
        }

        if (selectedShape.startsWith('quad_sab') && verts['H'] && verts['S']) {
          const newH = new THREE.Vector3().addVectors(verts['A'], verts['B']).multiplyScalar(0.5);
          const offsetS = new THREE.Vector3().subVectors(verts['S'], verts['H']);
          verts['H'] = newH;
          verts['S'] = new THREE.Vector3().addVectors(newH, offsetS);
        }
      } else if (isTetra) {
        const temp = verts['C'];
        verts['C'] = verts['D'];
        verts['D'] = temp;
      } else if (isTri || isPrismTri) {
        const temp = verts['B'];
        verts['B'] = verts['C'];
        verts['C'] = temp;
        if (isPrismTri && verts["B'"] && verts["C'"]) {
          const tempP = verts["B'"];
          verts["B'"] = verts["C'"];
          verts["C'"] = tempP;
        }

        if (selectedShape.startsWith('tri_sab') && verts['H'] && verts['S']) {
          const newH = new THREE.Vector3().addVectors(verts['A'], verts['B']).multiplyScalar(0.5);
          const offsetS = new THREE.Vector3().subVectors(verts['S'], verts['H']);
          verts['H'] = newH;
          verts['S'] = new THREE.Vector3().addVectors(newH, offsetS);
        }
      }
    }
    return verts;
  }, [baseVertices, swapVertices, selectedShape]);

  const updatePointCoord = (label, x, y, z) => {
    let actualKey = label;
    const isTetra = selectedShape.startsWith('tetra') || selectedShape === 'tetrahedron';
    const isTri = selectedShape.startsWith('tri') || selectedShape === 'triangularPyramid';
    const isQuad = selectedShape.startsWith('quad') || (selectedShape.includes('Pyramid') && !isTri);
    const isPrismQuad = selectedShape.includes('prism_') && (selectedShape.includes('square') || selectedShape.includes('rectangle') || selectedShape.includes('parallelogram') || selectedShape.includes('rhombus') || selectedShape.includes('trapezoid'));
    const isPrismTri = selectedShape.includes('prism_') && selectedShape.includes('tri_');

    if (swapVertices) {
      if (isQuad || isPrismQuad) {
        if (label === 'B') actualKey = 'D';
        else if (label === 'D') actualKey = 'B';
        else if (label === "B'") actualKey = "D'";
        else if (label === "D'") actualKey = "B'";
      } else if (isTetra) {
        if (label === 'C') actualKey = 'D';
        else if (label === 'D') actualKey = 'C';
      } else if (isTri || isPrismTri) {
        if (label === 'B') actualKey = 'C';
        else if (label === 'C') actualKey = 'B';
        else if (label === "B'") actualKey = "C'";
        else if (label === "C'") actualKey = "B'";
      }
    }

    setCustomVerticesMap(prev => {
      const next = {
        ...prev,
        [actualKey]: new THREE.Vector3(x, y, z)
      };

      const isPrism = isPrismQuad || isPrismTri;
      if (isPrism) {
        const getPt = (k) => next[k] || (currentShapeDefaults && currentShapeDefaults[k]) || shape.vertices[k];
        
        let shift;
        if (actualKey.endsWith("'")) {
          const baseKey = actualKey.replace("'", "");
          shift = new THREE.Vector3().subVectors(next[actualKey], getPt(baseKey));
        } else {
          const oldShift = new THREE.Vector3().subVectors(
            prev["A'"] || (currentShapeDefaults && currentShapeDefaults["A'"]) || shape.vertices["A'"],
            prev["A"] || (currentShapeDefaults && currentShapeDefaults["A"]) || shape.vertices["A"]
          );
          shift = oldShift;
        }

        const bases = isPrismQuad ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C'];
        bases.forEach(b => {
          const topKey = b + "'";
          if (topKey !== actualKey) {
            next[topKey] = new THREE.Vector3().addVectors(getPt(b), shift);
          }
        });
      }

      return next;
    });
  };

  const handleVertexDrag = (label, newPos) => {
    updatePointCoord(label, newPos.x, newPos.y, newPos.z);
  };

  const updateMathCoord = (label, mathX, mathY, mathZ) => {
    updatePointCoord(label, mathX, mathZ - 1, mathY);
  };

  // Reset selected point to default
  const handleResetCurrentPoint = () => {
    let actualKey = selectedEditPoint;
    const isTetra = selectedShape.startsWith('tetra') || selectedShape === 'tetrahedron';
    const isTri = selectedShape.startsWith('tri') || selectedShape === 'triangularPyramid';
    const isQuad = selectedShape.startsWith('quad') || (selectedShape.includes('Pyramid') && !isTri);
    const isPrismQuad = selectedShape.includes('prism_') && (selectedShape.includes('square') || selectedShape.includes('rectangle') || selectedShape.includes('parallelogram') || selectedShape.includes('rhombus') || selectedShape.includes('trapezoid'));
    const isPrismTri = selectedShape.includes('prism_') && selectedShape.includes('tri_');

    if (swapVertices) {
      if (isQuad || isPrismQuad) {
        if (selectedEditPoint === 'B') actualKey = 'D';
        else if (selectedEditPoint === 'D') actualKey = 'B';
        else if (selectedEditPoint === "B'") actualKey = "D'";
        else if (selectedEditPoint === "D'") actualKey = "B'";
      } else if (isTetra) {
        if (selectedEditPoint === 'C') actualKey = 'D';
        else if (selectedEditPoint === 'D') actualKey = 'C';
      } else if (isTri || isPrismTri) {
        if (selectedEditPoint === 'B') actualKey = 'C';
        else if (selectedEditPoint === 'C') actualKey = 'B';
        else if (selectedEditPoint === "B'") actualKey = "C'";
        else if (selectedEditPoint === "C'") actualKey = "B'";
      }
    }
    
    setCustomVerticesMap(prev => {
      const next = { ...prev };
      delete next[actualKey];
      
      const isPrism = isPrismQuad || isPrismTri;
      if (isPrism) {
        if (actualKey.endsWith("'")) {
          // If a top vertex is reset, reset ALL top vertices
          const bases = isPrismQuad ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C'];
          bases.forEach(b => delete next[b + "'"]);
        } else {
          // If a base vertex is reset, maintain current shift
          const getPt = (k) => next[k] || (currentShapeDefaults && currentShapeDefaults[k]) || shape.vertices[k];
          const bases = isPrismQuad ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C'];
          const refBase = bases.find(b => b !== actualKey);
          
          if (refBase) {
            const shift = new THREE.Vector3().subVectors(getPt(refBase + "'"), getPt(refBase));
            bases.forEach(b => {
              const topKey = b + "'";
              next[topKey] = new THREE.Vector3().addVectors(getPt(b), shift);
            });
          }
        }
      }

      return next;
    });
  };

  // Teacher: Save current shape's vertices as default for all students
  const handleSaveAsDefault = async () => {
    if (isSavingDefault) return;
    try {
      setIsSavingDefault(true);
      const shapeDefaults = {};
      for (const [k, v] of Object.entries(baseVertices)) {
        shapeDefaults[k] = {
          x: Number(v.x.toFixed(3)),
          y: Number(v.y.toFixed(3)),
          z: Number(v.z.toFixed(3))
        };
      }
      const updatedDefaults = {
        ...teacherDefaultShapes,
        [selectedShape]: shapeDefaults
      };
      setTeacherDefaultShapes(updatedDefaults);
      setCustomVerticesMap({});
      await saveSetting('space_geometry_defaults', updatedDefaults);
      setIsSavedSuccess(true);
      setTimeout(() => {
        setIsSavedSuccess(false);
      }, 2500);
    } catch (err) {
      console.error('Error saving default shape:', err);
      alert('Có lỗi khi lưu hình mặc định: ' + (err.message || 'Thử lại sau'));
    } finally {
      setIsSavingDefault(false);
    }
  };

  // Teacher: Reset current shape to system factory default
  const handleResetToSystemDefault = async () => {
    if (!window.confirm('Khôi phục hình này về tọa độ mặc định ban đầu của hệ thống?')) return;
    try {
      const updatedDefaults = { ...teacherDefaultShapes };
      delete updatedDefaults[selectedShape];
      setTeacherDefaultShapes(updatedDefaults);
      setCustomVerticesMap({});
      await saveSetting('space_geometry_defaults', updatedDefaults);
    } catch (err) {
      console.error('Error resetting to system default:', err);
    }
  };

  const activeVertices = useMemo(() => {
    const verts = { ...swappedBaseVertices };
    customPoints.forEach(cp => {
      if (cp.type === 'intersection') {
        const pt = getLinesIntersection(verts, cp.line1, cp.line2);
        if (pt) verts[cp.label] = pt;
      } else if (cp.type === 'parallel' || cp.type === 'parallel_neg') {
        const P = verts[cp.edge[0]];
        const A = verts[cp.edge[1]];
        const B = verts[cp.edge[2]];
        if (P && A && B) {
          const v = new THREE.Vector3().subVectors(B, A).multiplyScalar(0.95);
          if (cp.type === 'parallel_neg') {
            verts[cp.label] = new THREE.Vector3().copy(P).sub(v);
          } else {
            verts[cp.label] = new THREE.Vector3().copy(P).add(v);
          }
        }
      } else if (cp.type === 'perpendicular') {
        if (cp.line1 && cp.targetLine) {
          const A = verts[cp.line1[0]]; // Điểm kẻ từ (vd A trong AH)
          const B = verts[cp.targetLine[0]]; // Điểm đầu của đoạn thẳng vuông góc
          const C = verts[cp.targetLine[1]]; // Điểm cuối của đoạn thẳng vuông góc
          if (A && B && C) {
            const BC = new THREE.Vector3().subVectors(C, B);
            const BA = new THREE.Vector3().subVectors(A, B);
            const t = BA.dot(BC) / BC.lengthSq();
            verts[cp.label] = new THREE.Vector3().copy(B).add(BC.multiplyScalar(t));
          }
        } else if (cp.pos) {
          verts[cp.label] = cp.pos;
        }
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

  const pointLabels = useMemo(() => {
    const lineLabels = new Set(customPoints.filter(p => p.type?.startsWith('parallel')).map(p => p.label));
    return activeLabels.filter(v => !lineLabels.has(v));
  }, [activeLabels, customPoints]);

  const parallelLines = useMemo(
    () => customPoints.filter(p => p.type === 'parallel').map(p => ({ label: p.label, pts: [p.edge[0], p.label] })),
    [customPoints]
  );

  const lineName = (pts) => parallelLines.find(l => pts.includes(l.label))?.label ?? pts.join('');

  const isParallelConn = (c) => c.some(p => p.startsWith('_neg_') || parallelLines.some(l => l.label === p));

  const parseLineInput = (raw) => {
    const s = raw.trim();
    const pl = parallelLines.find(l => l.label === s);
    if (pl) return pl.pts;
    return s.toUpperCase().split('');
  };

  const toggleLineSelection = (index, pts) => {
    setSelections(prev => {
      const newSels = [...prev];
      const same = newSels[index].length === 2 && pts.every(p => newSels[index].includes(p));
      newSels[index] = same ? [] : [...pts];
      return newSels;
    });
  };

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
    const activeSels = selections.filter(s => s.length >= 2);
    if (activeSels.length === 0) return "Hãy chọn điểm để tạo đường thẳng (2 điểm) hoặc mặt phẳng (3-4 điểm)";
    if (activeSels.length === 1 && activeSels[0].length >= 3) return "Thiết diện của mặt phẳng và khối chóp đang được hiển thị";
    
    if (relations.length > 0) {
      const rel = relations[0]; // Show first relation
      if (rel.type === 'line_line_intersect') return "Hai đường thẳng cắt nhau tại 1 điểm (màu cam)";
      if (rel.type === 'line_line_parallel') return "Hai đường thẳng song song";
      if (rel.type === 'line_line_skew') return "Hai đường thẳng chéo nhau";
      if (rel.type === 'line_line_identical') return "Hai đường thẳng trùng nhau";
      if (rel.type === 'line_plane_intersect') return "Đường thẳng cắt mặt phẳng tại 1 điểm (màu cam)";
      if (rel.type === 'line_plane_parallel') return "Đường thẳng song song hoặc nằm trong mặt phẳng";
      if (rel.type === 'plane_plane_intersect') return "Giao tuyến của 2 mặt phẳng (đường màu tím)";
      if (rel.type === 'plane_plane_parallel') return "Hai mặt phẳng song song hoặc trùng nhau";
    }
    return "Quan hệ giữa các đối tượng...";
  };


  const checkCoplanar = (pts) => {
    if (pts.length < 4) return true;
    const p0 = activeVertices[pts[0]];
    const p1 = activeVertices[pts[1]];
    const p2 = activeVertices[pts[2]];
    const p3 = activeVertices[pts[3]];
    if (!p0 || !p1 || !p2 || !p3) return true;
    const v1 = new THREE.Vector3().subVectors(p1, p0);
    const v2 = new THREE.Vector3().subVectors(p2, p0);
    const v3 = new THREE.Vector3().subVectors(p3, p0);
    const dot = v1.cross(v2).dot(v3);
    return Math.abs(dot) < 0.01;
  };

  const toggleSelectionVertex = (index, v) => {
    setSelections(prev => {
      const newSels = [...prev];
      let sel = [...newSels[index]];
      if (sel.includes(v)) {
        sel = sel.filter(pt => pt !== v);
      } else {
        if (sel.length >= 4) {
          alert('Một đối tượng chỉ có thể chọn tối đa 4 điểm!');
          return prev;
        }
        sel.push(v);
        if (sel.length === 4) {
          if (!checkCoplanar(sel)) {
            alert('Các điểm không đồng phẳng!');
            return prev;
          }
        }
      }
      newSels[index] = sel;
      return newSels;
    });
  };

  const relations = useMemo(() => {
    const results = [];
    for (let i = 0; i < selections.length; i++) {
      for (let j = i + 1; j < selections.length; j++) {
        const s1 = selections[i];
        const s2 = selections[j];
        if (s1.length < 2 || s2.length < 2) continue;
        
        if (s1.length === 2 && s2.length === 2) {
          const A1 = activeVertices[s1[0]], B1 = activeVertices[s1[1]];
          const A2 = activeVertices[s2[0]], B2 = activeVertices[s2[1]];
          if (A1 && B1 && A2 && B2) {
            const v1 = new THREE.Vector3().subVectors(B1, A1);
            const v2 = new THREE.Vector3().subVectors(B2, A2);
            const cross = new THREE.Vector3().crossVectors(v1, v2);
            if (cross.lengthSq() < 0.001) {
              const v3 = new THREE.Vector3().subVectors(A2, A1);
              const cross2 = new THREE.Vector3().crossVectors(v1, v3);
              if (cross2.lengthSq() < 0.001) {
                results.push({ type: 'line_line_identical', s1, s2 });
              } else {
                results.push({ type: 'line_line_parallel', s1, s2 });
              }
            } else {
              const v3 = new THREE.Vector3().subVectors(A2, A1);
              const dist = Math.abs(v3.dot(cross.clone().normalize()));
              if (dist < 0.01) {
                const n2 = new THREE.Vector3().crossVectors(v2, cross);
                const t1 = new THREE.Vector3().subVectors(A2, A1).dot(n2) / v1.dot(n2);
                const pt = new THREE.Vector3().copy(v1).multiplyScalar(t1).add(A1);
                results.push({ type: 'line_line_intersect', s1, s2, point: pt });
              } else {
                results.push({ type: 'line_line_skew', s1, s2 });
              }
            }
          }
        } else if ((s1.length === 2 && s2.length >= 3) || (s1.length >= 3 && s2.length === 2)) {
          const line = s1.length === 2 ? s1 : s2;
          const plane = s1.length >= 3 ? s1 : s2;
          const pt = getLinePlaneIntersection(activeVertices, line[0], line[1], plane[0], plane[1], plane[2]);
          if (pt) {
            results.push({ type: 'line_plane_intersect', line, plane, point: pt });
          } else {
            results.push({ type: 'line_plane_parallel', line, plane });
          }
        } else if (s1.length >= 3 && s2.length >= 3) {
          const inter = getPlanesIntersection(activeVertices, s1, s2);
          if (inter) {
            results.push({ type: 'plane_plane_intersect', s1, s2, line: inter });
          } else {
            results.push({ type: 'plane_plane_parallel', s1, s2 });
          }
        }
      }
    }
    return results;
  }, [selections, activeVertices]);

  const numPlanes = selections.filter(s => s.length >= 3).length;
  const crossSectionPlane = numPlanes === 1 ? selections.find(s => s.length >= 3) : null;
  const handleAddPoint = () => {
    const label = newPointLabel.trim().toUpperCase();
    if (!label) return;
    if (activeLabels.includes(label)) {
      alert('Tên điểm đã tồn tại!');
      return;
    }
    const edge = newPointEdge.split(',');
    if (!newPointEdge || edge.length !== 2) {
      alert('Vui lòng chọn cạnh!');
      return;
    }
    
    setCustomPoints([...customPoints, {
      label,
      edge: edge,
      ratio: ratioNum / ratioDen
    }]);
    
    setNewPointLabel('');
  };

  const removeCustomPoint = (label) => {
    const neg = `_neg_${label}`;
    setCustomPoints(customPoints.filter(p => p.label !== label && p.label !== neg));
    setSelections(prev => prev.map(sel => (sel.includes(label) ? [] : sel)));
    setConnections(connections.filter(c => c[0] !== label && c[1] !== label && c[0] !== neg && c[1] !== neg));
  };

  

  const [perpLineP1, setPerpLineP1] = useState('');
  const [perpLineP2, setPerpLineP2] = useState('');
  const [perpTargetLine, setPerpTargetLine] = useState('');
  const [perpPoint, setPerpPoint] = useState('');

  const handleAddPerpendicularPoint = () => {
    if (!perpLineP1 || !perpLineP2 || !perpTargetLine || !perpPoint) return;
    const l1_p1 = perpTargetLine[0];
    const l1_p2 = perpTargetLine[1];
    
    // Validate target line points exist
    if (!activeVertices[l1_p1] || !activeVertices[l1_p2]) return;
    // perpLineP1 is the source point (e.g. A in AH), it must exist
    if (!activeVertices[perpLineP1]) return;

    const source = activeVertices[perpLineP1];
    const target1 = activeVertices[l1_p1];
    const target2 = activeVertices[l1_p2];

    const line3 = new THREE.Line3(target1, target2);
    const closest = new THREE.Vector3();
    line3.closestPointToPoint(source, true, closest);

    // Save custom point and the connection
    setCustomPoints(prev => [...prev, { 
      label: perpPoint, 
      pos: closest, 
      type: 'perpendicular', 
      line1: [perpLineP1, perpLineP2],
      targetLine: perpTargetLine,
      desc: `Kẻ ${perpLineP1}${perpLineP2} ⊥ ${perpTargetLine} tại ${perpPoint}` 
    }]);
    setConnections(prev => [...prev, [perpLineP1, perpPoint]]);
    
    // Add right angle symbol: between the new perpendicular line (source -> closest) and the target line (closest -> target2)
    setCustomRightAngles(prev => [...prev, [perpLineP1, perpPoint, l1_p2]]);

    // Add to custom mappings so it resolves globally
    setCustomVerticesMap(prev => ({ ...prev, [perpPoint]: closest }));

    setPerpLineP1('');
    setPerpLineP2('');
    setPerpTargetLine('');
    setPerpPoint('');
  };

  const handleAddParallelPoint = () => {
    if (!parallelPoint || parallelLine.length < 2 || !parallelLabel) return;
    const l1 = parallelLine[0].toUpperCase();
    const l2 = parallelLine[1].toUpperCase();
    const pLabel = parallelLabel.trim();
    
    if (customPoints.some(p => p.label === pLabel) || shape.vertices[pLabel]) {
      alert('Tên điểm đã tồn tại!');
      return;
    }
    
    const P = activeVertices[parallelPoint];
    const A = activeVertices[l1];
    const B = activeVertices[l2];
    
    if (!P || !A || !B) {
      alert('Các điểm nhập vào không hợp lệ!');
      return;
    }
    
    const v = new THREE.Vector3().subVectors(B, A).multiplyScalar(0.95);
    const Q = new THREE.Vector3().copy(P).add(v);
    
    setCustomPoints([...customPoints, {
      label: pLabel,
      type: 'parallel',
      edge: [parallelPoint, l1, l2], // metadata
      x: Q.x, y: Q.y, z: Q.z
    }, {
      label: `_neg_${pLabel}`,
      type: 'parallel_neg',
      edge: [parallelPoint, l1, l2],
    }]);
    
    setConnections([...connections, [parallelPoint, pLabel], [parallelPoint, `_neg_${pLabel}`]]);
    setParallelLabel('');
    setParallelLine('');
  };
const handleAddIntersection = () => {
    const finalLabel = (newInterLabel.trim() || suggestedInterLabel).toUpperCase();
    if (!finalLabel) return;
    if (activeLabels.includes(finalLabel)) {
      alert('Tên điểm đã tồn tại!');
      return;
    }
    
    const l1 = parseLineInput(interLine1);
    const l2 = parseLineInput(interLine2);
    
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
        <h3 className="space-geom-title">Quan hệ vuông góc</h3>
        
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

          {/* CHECKBOX SỬA ĐIỂM */}
          <div style={{
            marginTop: '8px',
            padding: '8px 10px',
            borderRadius: '8px',
            background: isEditingPoints ? '#eff6ff' : '#f8fafc',
            border: `1.5px solid ${isEditingPoints ? '#60a5fa' : '#e2e8f0'}`,
            transition: 'all 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                cursor: 'pointer', margin: 0, fontWeight: 600, fontSize: '13px',
                color: isEditingPoints ? '#1d4ed8' : '#334155', userSelect: 'none'
              }}>
                <input
                  type="checkbox"
                  checked={isEditingPoints}
                  onChange={(e) => setIsEditingPoints(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }}
                />
                <span>Sửa điểm</span>
              </label>

              {Object.keys(customVerticesMap).length > 0 && (
                <button
                  type="button"
                  onClick={() => setCustomVerticesMap({})}
                  title="Khôi phục tọa độ gốc ban đầu"
                  style={{
                    border: '1px solid #fecaca',
                    background: '#fef2f2',
                    color: '#ef4444',
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#fee2e2';
                    e.currentTarget.style.borderColor = '#fca5a5';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#fef2f2';
                    e.currentTarget.style.borderColor = '#fecaca';
                  }}
                >
                  ⟲
                </button>
              )}
            </div>

            {/* When isEditingPoints is checked, show point coordinate editor */}
            {isEditingPoints && (
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Point selector tabs */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {shape.labels.map(lbl => (
                    <button
                      key={`edit-tab-${lbl}`}
                      type="button"
                      onClick={() => setSelectedEditPoint(lbl)}
                      style={{
                        padding: '4px 10px', fontSize: '12px', fontWeight: 700,
                        borderRadius: '6px', cursor: 'pointer',
                        border: selectedEditPoint === lbl ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                        background: selectedEditPoint === lbl ? '#2563eb' : '#ffffff',
                        color: selectedEditPoint === lbl ? '#ffffff' : '#334155',
                        transition: 'all 0.15s'
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                {/* Coordinate Sliders for selectedEditPoint */}
                {selectedEditPoint && swappedBaseVertices[selectedEditPoint] && (() => {
                  const pt = swappedBaseVertices[selectedEditPoint];
                  // Map to Math Oxyz:
                  // X: Ox (Trái/Phải) = pt.x
                  // Y: Oy (Tiến/Lùi trên đáy Oxy) = pt.z
                  // Z: Oz (Cao độ Lên/Xuống, đáy z=0) = pt.y + 1
                  const mathX = pt.x;
                  const mathY = pt.z;
                  const mathZ = pt.y + 1;
                  return (
                    <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>
                          Tọa độ {selectedEditPoint}:
                        </span>
                        {isTeacher ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            {hasTeacherDefault && (
                              <button
                                type="button"
                                onClick={handleResetToSystemDefault}
                                title="Khôi phục hình này về mặc định ban đầu của hệ thống"
                                style={{ border: 'none', background: 'transparent', color: '#94a3b8', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap' }}
                              >
                                Khôi phục gốc
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleSaveAsDefault}
                              disabled={isSavingDefault}
                              title="Lưu hình này làm mặc định cho tất cả học sinh cùng thấy"
                              style={{
                                border: 'none',
                                background: isSavedSuccess ? '#dcfce7' : 'transparent',
                                color: isSavedSuccess ? '#15803d' : '#2563eb',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                cursor: isSavingDefault ? 'wait' : 'pointer',
                                padding: isSavedSuccess ? '2px 6px' : '0',
                                borderRadius: '4px',
                                textDecoration: isSavedSuccess ? 'none' : 'underline',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                              }}
                            >
                              {isSavedSuccess ? '✓ Đã lưu mặc định' : isSavingDefault ? 'Đang lưu...' : 'Đặt mặc định'}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResetCurrentPoint}
                            style={{ border: 'none', background: 'transparent', color: '#64748b', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap' }}
                          >
                            Đặt lại điểm này
                          </button>
                        )}
                      </div>

                      {/* X axis (Ox: Trái ⇄ Phải trên đáy Oxy) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <span style={{ width: '22px', fontWeight: 700, color: '#ef4444' }} title="Trục Ox: Trái ⇄ Phải (mặt đáy Oxy)">X:</span>
                        <input
                          type="range"
                          min="-5"
                          max="5"
                          step="0.1"
                          value={mathX}
                          onChange={(e) => updateMathCoord(selectedEditPoint, parseFloat(e.target.value), mathY, mathZ)}
                          style={{ flex: 1, cursor: 'pointer' }}
                        />
                        <span style={{ width: '42px', textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                          {mathX.toFixed(1)}
                        </span>
                      </div>

                      {/* Y axis (Oy: Tiến ⇄ Lùi trên đáy Oxy) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <span style={{ width: '22px', fontWeight: 700, color: '#10b981' }} title="Trục Oy: Tiến ⇄ Lùi (mặt đáy Oxy)">Y:</span>
                        <input
                          type="range"
                          min="-5"
                          max="5"
                          step="0.1"
                          value={mathY}
                          onChange={(e) => updateMathCoord(selectedEditPoint, mathX, parseFloat(e.target.value), mathZ)}
                          style={{ flex: 1, cursor: 'pointer' }}
                        />
                        <span style={{ width: '42px', textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                          {mathY.toFixed(1)}
                        </span>
                      </div>

                      {/* Z axis (Oz: Cao độ Lên ⇄ Xuống) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <span style={{ width: '22px', fontWeight: 700, color: '#3b82f6' }} title="Trục Oz: Cao độ Lên ⇄ Xuống (vuông góc đáy Oxy)">Z:</span>
                        <input
                          type="range"
                          min="-2"
                          max="6"
                          step="0.1"
                          value={mathZ}
                          onChange={(e) => updateMathCoord(selectedEditPoint, mathX, mathY, parseFloat(e.target.value))}
                          style={{ flex: 1, cursor: 'pointer' }}
                        />
                        <span style={{ width: '42px', textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                          {mathZ.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        <div className="selection-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {selections.map((sel, idx) => (
            <div className="control-group" key={`sel-${idx}`} style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ margin: 0, fontSize: '13px' }}>Chọn đường hoặc mặt {idx + 1}</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {sel.length >= 3 && numPlanes === 1 && (
                    <label style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', margin: 0 }}>
                      <input type="checkbox" checked={showCrossSection} onChange={e => setShowCrossSection(e.target.checked)} style={{ accentColor: '#16a34a', cursor: 'pointer' }} />
                      Thiết diện
                    </label>
                  )}
                  {sel.length >= 3 && (
                    <button onClick={() => setView2DPlane(sel)} style={{ fontSize: '11px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                      Xem 2D
                    </button>
                  )}
                </div>
              </div>
              <div className="vertex-selector">
                {pointLabels.map(v => {
                  let activeClass = '';
                  if (sel.includes(v)) {
                    activeClass = sel.length === 2 ? 'active line' : 'active plane1';
                  }
                  return (
                    <button 
                      key={`p-${idx}-${v}`}
                      className={`vertex-btn ${activeClass}`}
                      onClick={() => toggleSelectionVertex(idx, v)}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="functional-cards" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* 1. Thêm điểm trên cạnh */}
          <div className="feature-card" style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <label style={{ color: '#4f46e5', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>+ Thêm điểm trên cạnh</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <input 
                type="text" 
                className="geom-select"
                style={{ width: '40px', padding: '0.4rem', textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                value={newPointLabel}
                onChange={e => setNewPointLabel(e.target.value.toUpperCase())}
                maxLength={2}
                placeholder="M"
              />
              <span style={{ fontWeight: 'bold', color: '#64748b' }}>∈</span>
              <select 
                className="geom-select" 
                style={{ width: '110px', padding: '0.4rem 1.2rem 0.4rem 0.6rem', textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                value={newPointEdge}
                onChange={e => setNewPointEdge(e.target.value)}
              >
                <option value="">Cạnh</option>
                {shape.edges.map((edge, i) => (
                  <option key={`opt-edge-${i}`} value={edge.join(',')}>{edge.join('')}</option>
                ))}
              </select>
              <button 
                className="mode-btn" 
                style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '8px', padding: '0.4rem 1rem', marginLeft: 'auto' }}
                onClick={handleAddPoint}
              >
                Thêm
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>
              <span>Tỉ lệ: {newPointEdge ? newPointEdge.split(',')[0] : ''}{newPointLabel || 'M'} =</span>
              <input 
                type="number" 
                min="0" 
                className="geom-select"
                value={ratioNum}
                onChange={e => setRatioNum(parseInt(e.target.value) || 0)}
                style={{ width: '45px', padding: '0.3rem', textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <span>/</span>
              <input 
                type="number" 
                min="1" 
                className="geom-select"
                value={ratioDen}
                onChange={e => setRatioDen(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: '45px', padding: '0.3rem', textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <span>{newPointEdge ? newPointEdge.split(',').join('') : ''}</span>
            </div>
            {customPoints.some(p => !p.type) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '12px' }}>
                {customPoints.filter(p => !p.type).map(p => (
                  <span key={p.label} style={{ fontSize: '12px', background: 'var(--background-color)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {`${p.label} ∈ ${p.edge.join('')}`}
                    <button onClick={() => removeCustomPoint(p.label)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0 2px', fontWeight: 'bold' }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Kẻ vuông góc */}
          <div className="feature-card" style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '16px' }}>
            <label style={{ color: '#4f46e5', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>+ Kẻ vuông góc</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="AH"
                maxLength={2}
                className="geom-select"
                style={{ width: '50px', padding: '0.4rem', textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0', textTransform: 'uppercase' }}
                value={perpLineP1 + perpLineP2}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setPerpLineP1(val[0] || '');
                  setPerpLineP2(val[1] || '');
                }}
              />
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#64748b' }}>⊥</span>
              <input
                type="text"
                placeholder="BC"
                maxLength={2}
                className="geom-select"
                style={{ width: '50px', padding: '0.4rem', textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0', textTransform: 'uppercase' }}
                value={perpTargetLine}
                onChange={(e) => setPerpTargetLine(e.target.value.toUpperCase())}
              />
              <span style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>tại</span>
              <input
                type="text"
                placeholder="H"
                maxLength={1}
                className="geom-select"
                style={{ width: '40px', padding: '0.4rem', textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0', textTransform: 'uppercase' }}
                value={perpPoint}
                onChange={(e) => setPerpPoint(e.target.value.toUpperCase())}
              />
              <button
                className="mode-btn"
                style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '8px', padding: '0.4rem 1rem', marginLeft: 'auto' }}
                onClick={handleAddPerpendicularPoint}
                disabled={!perpLineP1 || !perpLineP2 || !perpTargetLine || !perpPoint}
              >
                Kẻ
              </button>
            </div>
          </div>

          {/* 2. Kẻ song song */}
          <div className="feature-card" style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <label style={{ color: '#4f46e5', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>+ Kẻ song song</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select 
                className="geom-select" 
                style={{ width: '70px', padding: '0.4rem', textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                value={parallelPoint}
                onChange={e => setParallelPoint(e.target.value)}
              >
                <option value="">Qua</option>
                {pointLabels.map(v => <option key={`pp1-${v}`} value={v}>{v}</option>)}
              </select>
              <span style={{ fontWeight: 'bold', color: '#64748b' }}>//</span>
              <input 
                type="text" 
                className="geom-select"
                style={{ width: '50px', padding: '0.4rem', textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                value={parallelLine}
                onChange={e => setParallelLine(e.target.value)}
                maxLength={2}
                placeholder="AB"
              />
              <input 
                type="text" 
                className="geom-select"
                style={{ width: '50px', padding: '0.4rem', textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                value={parallelLabel}
                onChange={e => setParallelLabel(e.target.value)}
                maxLength={2}
                placeholder="Tên"
              />
              <button 
                className="mode-btn" 
                style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '8px', padding: '0.4rem 1rem', marginLeft: 'auto' }}
                onClick={handleAddParallelPoint}
              >
                Kẻ
              </button>
            </div>
          </div>

          {/* 3. Kẻ nối điểm */}
          <div className="feature-card" style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <label style={{ color: '#4f46e5', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>+ Nối điểm</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select 
                className="geom-select" 
                style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                value={connectP1}
                onChange={e => setConnectP1(e.target.value)}
              >
                <option value="">Điểm 1</option>
                {pointLabels.map(v => <option key={`cp1-${v}`} value={v}>{v}</option>)}
              </select>
              <select 
                className="geom-select" 
                style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                value={connectP2}
                onChange={e => setConnectP2(e.target.value)}
              >
                <option value="">Điểm 2</option>
                {pointLabels.map(v => <option key={`cp2-${v}`} value={v}>{v}</option>)}
              </select>
              <button 
                className="mode-btn" 
                style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '8px', padding: '0.4rem 1rem', marginLeft: 'auto' }}
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
            
            {(connections.length > 0 || parallelLines.length > 0) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '12px' }}>
                {parallelLines.map(l => (
                  <span key={`pconn-${l.label}`} style={{ fontSize: '12px', background: 'var(--background-color)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {l.label}
                    <button onClick={() => removeCustomPoint(l.label)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0 2px', fontWeight: 'bold' }}>×</button>
                  </span>
                ))}
                {connections.map((c, i) => (isParallelConn(c) ? null : (
                  <span key={`conn-${i}`} style={{ fontSize: '12px', background: 'var(--background-color)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {c[0]}{c[1]}
                    <button onClick={() => setConnections(connections.filter((_, idx) => idx !== i))} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0 2px', fontWeight: 'bold' }}>×</button>
                  </span>
                )))}
              </div>
            )}
          </div>

          {/* 4. Giao điểm 2 đường */}
          <div className="feature-card" style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <label style={{ color: '#4f46e5', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>+ Giao điểm 2 đường</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input 
                type="text" 
                className="geom-select"
                style={{ width: '45px', padding: '0.4rem', textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                value={interLine1}
                onChange={e => setInterLine1(e.target.value)}
                maxLength={2}
                placeholder="AC"
              />
              <span style={{ fontWeight: 'bold', color: '#64748b' }}>∩</span>
              <input 
                type="text" 
                className="geom-select"
                style={{ width: '45px', padding: '0.4rem', textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                value={interLine2}
                onChange={e => setInterLine2(e.target.value)}
                maxLength={2}
                placeholder="BD"
              />
              <span style={{ fontWeight: 'bold', color: '#64748b' }}>= {'{'}</span>
              <input 
                type="text" 
                className="geom-select"
                style={{ width: '40px', padding: '0.4rem', textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                value={newInterLabel}
                onChange={e => setNewInterLabel(e.target.value)}
                maxLength={2}
                placeholder={suggestedInterLabel || "O"}
              />
              <span style={{ fontWeight: 'bold', color: '#64748b' }}>{'}'}</span>
              <button 
                className="mode-btn" 
                style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: '8px', padding: '0.4rem 0.8rem', marginLeft: 'auto' }}
                onClick={handleAddIntersection}
              >
                Tạo
              </button>
            </div>
            
            {customPoints.some(p => p.type === 'intersection') && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '12px' }}>
                {customPoints.filter(p => p.type === 'intersection').map(p => (
                  <span key={p.label} style={{ fontSize: '12px', background: 'var(--background-color)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {p.type === 'intersection' ? `${p.label} (${lineName(p.line1)} ∩ ${lineName(p.line2)})` : p.type === 'parallel' ? `${p.label} (// ${p.edge[1]}${p.edge[2]})` : `${p.label} ∈ ${p.edge.join('')}`}
                    <button onClick={() => removeCustomPoint(p.label)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '0 2px', fontWeight: 'bold' }}>×</button>
                  </span>
                ))}
              </div>
            )}
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
            camera={{ position: [0, 4.5, 10.5], fov: 45 }}
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
            
            <OrbitControls 
              ref={controlsRef} 
              makeDefault 
              enableDamping={true} 
              minDistance={2} 
              maxDistance={15} 
              target={[0, 0.5, 0]} 
              enabled={!isDraggingVertex}
            />
            
            {/* Draw shape edges */}
            {shape.edges.map((edge, i) => (
              <ShapeEdge 
                key={`edge-${i}`}
                edge={edge}
                shape={{...shape, vertices: swappedBaseVertices}}
                useDashed={useDashed}
              />
            ))}
            
            {/* Draw Right Angles */}
            {shape.rightAngles && shape.rightAngles.map((angle, i) => (
              <RightAngleSymbol 
                key={`ra-${i}`}
                p1={swappedBaseVertices[angle[0]]}
                p2={swappedBaseVertices[angle[1]]}
                p3={swappedBaseVertices[angle[2]]}
              />
            ))}
            

            {customRightAngles && customRightAngles.map((angle, i) => (
              <RightAngleSymbol 
                key={`cra-${i}`}
                p1={activeVertices[angle[0]]}
                p2={activeVertices[angle[1]]}
                p3={activeVertices[angle[2]]}
              />
            ))}

            {/* Draw active vertices with labels */}
            {activeLabels.map(v => {
              const isCustom = !shape.labels.includes(v);
              const pos = activeVertices[v];
              if (!pos || v.startsWith('_neg_')) return null;
              return (
                <DraggableVertex
                  key={`vertex-node-${v}`}
                  label={v}
                  hideDot={customPoints.some(p => p.label === v && p.type === 'parallel')}
                  displayLabel={(() => {
                    const pc = customPoints.find(p => p.label === v && p.type === 'parallel');
                    return pc && v.startsWith(pc.edge[0]) && v.length > pc.edge[0].length ? v.slice(pc.edge[0].length) : v;
                  })()}
                  pos={pos}
                  isCustom={isCustom}
                  isEditing={isEditingPoints}
                  onDragStart={() => setIsDraggingVertex(true)}
                  onDrag={(newPos) => updatePointCoord(v, newPos.x, newPos.y, newPos.z)}
                  onDragEnd={() => setIsDraggingVertex(false)}
                  mounted={mounted}
                />
              );
            })}
            
            {/* Draw selections */}
            {selections.map((sel, idx) => {
              if (sel.length === 2) {
                const p1 = activeVertices[sel[0]], p2 = activeVertices[sel[1]];
                if (p1 && p2) {
                  return (
                    <group key={`sel-line-${idx}`}>
                      <Line points={[p1, p2]} color="#3b82f6" lineWidth={3} depthTest={false} renderOrder={10} />
                      <Line points={[p1, p2]} color="#3b82f6" lineWidth={3} dashed dashSize={0.2} gapSize={0.2} />
                    </group>
                  );
                }
              } else if (sel.length >= 3) {
                const pts = sel.map(v => activeVertices[v]).filter(Boolean);
                if (pts.length >= 3) {
                  return <PlaneMesh key={`sel-plane-${idx}`} vertices={activeVertices} selected={sel} color="rgba(59, 130, 246, 0.2)" />;
                }
              }
              return null;
            })}

            {/* Draw Relations */}
            {relations.map((rel, idx) => {
              if (rel.type === 'line_line_intersect') {
                return (
                  <group key={`rel-${idx}`}>
                    <Line points={[activeVertices[rel.s1[0]], rel.point]} color="#3b82f6" lineWidth={2} dashed />
                    <Line points={[activeVertices[rel.s1[1]], rel.point]} color="#3b82f6" lineWidth={2} dashed />
                    <Line points={[activeVertices[rel.s2[0]], rel.point]} color="#3b82f6" lineWidth={2} dashed />
                    <Line points={[activeVertices[rel.s2[1]], rel.point]} color="#3b82f6" lineWidth={2} dashed />
                    <IntersectionPoint point={rel.point} />
                  </group>
                );
              } else if (rel.type === 'line_plane_intersect') {
                return <IntersectionPoint key={`rel-${idx}`} point={rel.point} />;
              } else if (rel.type === 'plane_plane_intersect') {
                const p1 = new THREE.Vector3().copy(rel.line.point).add(rel.line.dir.clone().multiplyScalar(-10));
                const p2 = new THREE.Vector3().copy(rel.line.point).add(rel.line.dir.clone().multiplyScalar(10));
                return <Line key={`rel-${idx}`} points={[p1, p2]} color="#a855f7" lineWidth={4} depthTest={false} renderOrder={11} />;
              }
              return null;
            })}

            {/* Custom connections */}
            {connections.map((c, i) => {
              const p1 = activeVertices[c[0]];
              const p2 = activeVertices[c[1]];
              if (!p1 || !p2) return null;
              
              const isExternalLine = 
                (c[0].startsWith('_neg_') || customPoints.some(p => p.label === c[0] && p.type?.startsWith('parallel'))) ||
                (c[1].startsWith('_neg_') || customPoints.some(p => p.label === c[1] && p.type?.startsWith('parallel')));
                
              return (
                <CustomConnectionLine 
                  isExternalLine={isExternalLine}
                  key={`conn-render-${i}-${c[0]}-${c[1]}`}
                  p1={p1}
                  p2={p2}
                  shape={{ ...shape, vertices: swappedBaseVertices }}
                  useDashed={useDashed}
                />
              );
            })}
            
            {/* Cross Section Mesh */}
            {crossSectionPlane && showCrossSection && (
              <CrossSectionMesh vertices={activeVertices} shapeEdges={shape.edges} selectedPts={crossSectionPlane} />
            )}
            </Canvas>
        </div>
      </div>
    </div>
  );
};

export default PerpendicularGeometry3D;
