import React, { useState, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import './CrossSection3D.css';

const SHAPES = {
  tetrahedron: {
    name: 'Tứ diện ABCD',
    vertices: [
      new THREE.Vector3(0, 1.5, 0), // A
      new THREE.Vector3(-1, -0.5, -1), // B
      new THREE.Vector3(1.5, -0.5, -0.5), // C
      new THREE.Vector3(0, -0.5, 1.5), // D
    ],
    faces: [[0,1,2], [0,2,3], [0,3,1], [1,3,2]],
    edges: [[0,1], [0,2], [0,3], [1,2], [2,3], [3,1]],
    pointEdges: [0, 1, 2], // M on AB, N on AC, P on AD
    vertexLabels: ['A', 'B', 'C', 'D']
  },
  rectPyramid: {
    name: 'Chóp S.ABCD (đáy chữ nhật)',
    vertices: [
      new THREE.Vector3(0, 1.5, 0), // S
      new THREE.Vector3(-1.2, -0.5, -1), // A
      new THREE.Vector3(1.2, -0.5, -1), // B
      new THREE.Vector3(1.2, -0.5, 1), // C
      new THREE.Vector3(-1.2, -0.5, 1), // D
    ],
    faces: [[0,1,2], [0,2,3], [0,3,4], [0,4,1], [1,4,3,2]],
    edges: [[0,1], [0,2], [0,3], [0,4], [1,2], [2,3], [3,4], [4,1]],
    pointEdges: [0, 1, 3], // M on SA, N on SB, P on SD
    vertexLabels: ['S', 'A', 'B', 'C', 'D']
  }
};

const ClippingSetup = () => {
  const { gl } = useThree();
  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);
  return null;
};

const EdgeCylinder = ({ start, end, radius, color, planes }) => {
  const geoArgs = useMemo(() => {
    const vstart = new THREE.Vector3(start.x, start.y, start.z);
    const vend = new THREE.Vector3(end.x, end.y, end.z);
    const distance = vstart.distanceTo(vend);
    const position = vend.clone().add(vstart).divideScalar(2);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vend.clone().sub(vstart).normalize());
    return { distance, position, quaternion };
  }, [start, end]);

  return (
    <mesh position={geoArgs.position} quaternion={geoArgs.quaternion}>
      <cylinderGeometry args={[radius, radius, geoArgs.distance, 8]} />
      <meshBasicMaterial color={color} clippingPlanes={planes} />
    </mesh>
  );
};

const CrossSection3D = () => {
  const [activeShape, setActiveShape] = useState('rectPyramid');
  const [t1, setT1] = useState(0.5);
  const [t2, setT2] = useState(0.5);
  const [t3, setT3] = useState(0.5);
  const [explode, setExplode] = useState(0);
  const [showPlane, setShowPlane] = useState(true);
  
  const shape = SHAPES[activeShape];
  
  const { P1, P2, P3, plane, polygon, isCoplanar } = useMemo(() => {
    const e1 = shape.edges[shape.pointEdges[0]];
    const e2 = shape.edges[shape.pointEdges[1]];
    const e3 = shape.edges[shape.pointEdges[2]];
    
    const v1_0 = shape.vertices[e1[0]], v1_1 = shape.vertices[e1[1]];
    const v2_0 = shape.vertices[e2[0]], v2_1 = shape.vertices[e2[1]];
    const v3_0 = shape.vertices[e3[0]], v3_1 = shape.vertices[e3[1]];
    
    const P1 = new THREE.Vector3().lerpVectors(v1_0, v1_1, t1);
    const P2 = new THREE.Vector3().lerpVectors(v2_0, v2_1, t2);
    const P3 = new THREE.Vector3().lerpVectors(v3_0, v3_1, t3);
    
    const plane = new THREE.Plane().setFromCoplanarPoints(P1, P2, P3);
    
    let isCoplanar = false;
    if (plane.normal.lengthSq() < 0.0001) {
       isCoplanar = true; // Collinear points
    }
    
    const points = [];
    if (!isCoplanar) {
      shape.edges.forEach(edge => {
        const a = shape.vertices[edge[0]];
        const b = shape.vertices[edge[1]];
        const d1 = plane.distanceToPoint(a);
        const d2 = plane.distanceToPoint(b);
        
        if (d1 * d2 <= 0) {
          if (Math.abs(d1) < 0.0001) {
            points.push(a.clone());
          } else if (Math.abs(d2) < 0.0001) {
            points.push(b.clone());
          } else {
            const t = d1 / (d1 - d2);
            points.push(new THREE.Vector3().lerpVectors(a, b, t));
          }
        }
      });
    }
    
    const uniquePoints = [];
    points.forEach(p => {
      if (!uniquePoints.some(up => up.distanceTo(p) < 0.001)) {
        uniquePoints.push(p);
      }
    });
    
    if (uniquePoints.length > 2) {
      const centroid = new THREE.Vector3();
      uniquePoints.forEach(p => centroid.add(p));
      centroid.divideScalar(uniquePoints.length);
      
      const u = new THREE.Vector3().subVectors(uniquePoints[0], centroid).normalize();
      const v = new THREE.Vector3().crossVectors(plane.normal, u).normalize();
      
      uniquePoints.sort((a, b) => {
        const da = new THREE.Vector3().subVectors(a, centroid);
        const db = new THREE.Vector3().subVectors(b, centroid);
        const angleA = Math.atan2(da.dot(v), da.dot(u));
        const angleB = Math.atan2(db.dot(v), db.dot(u));
        return angleA - angleB;
      });
    }
    
    return { P1, P2, P3, plane, polygon: uniquePoints, isCoplanar };
  }, [shape, t1, t2, t3]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = [];
    shape.faces.forEach(face => {
      if (face.length === 3) {
        vertices.push(...shape.vertices[face[0]].toArray());
        vertices.push(...shape.vertices[face[1]].toArray());
        vertices.push(...shape.vertices[face[2]].toArray());
      } else if (face.length === 4) {
        vertices.push(...shape.vertices[face[0]].toArray());
        vertices.push(...shape.vertices[face[1]].toArray());
        vertices.push(...shape.vertices[face[2]].toArray());
        vertices.push(...shape.vertices[face[0]].toArray());
        vertices.push(...shape.vertices[face[2]].toArray());
        vertices.push(...shape.vertices[face[3]].toArray());
      }
    });
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, [shape]);

  const polyGeo = useMemo(() => {
    if (polygon.length < 3) return null;
    const geo = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 1; i < polygon.length - 1; i++) {
      vertices.push(...polygon[0].toArray());
      vertices.push(...polygon[i].toArray());
      vertices.push(...polygon[i+1].toArray());
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, [polygon]);

  const polyOutline = useMemo(() => {
    if (polygon.length < 3) return [];
    return [...polygon, polygon[0]];
  }, [polygon]);

  const EXTRA_LABELS = ['Q', 'E', 'F', 'G', 'H'];
  const extraPoints = useMemo(() => {
    return polygon.filter(p => 
      p.distanceTo(P1) > 0.001 && 
      p.distanceTo(P2) > 0.001 && 
      p.distanceTo(P3) > 0.001
    );
  }, [polygon, P1, P2, P3]);

  const getPolyName = (len) => {
    if (len === 3) return 'Tam giác';
    if (len === 4) return 'Tứ giác';
    if (len === 5) return 'Ngũ giác';
    if (len === 6) return 'Lục giác';
    return 'Đa giác';
  }

  // 1. Ensure normal points UP (towards +y)
  const localPlane = plane.clone();
  if (localPlane.normal.y < 0) {
    localPlane.negate();
  }
  
  // 2. Calculate offsets for exploding
  const offsetTop = localPlane.normal.clone().multiplyScalar(explode);
  const offsetBottom = localPlane.normal.clone().multiplyScalar(-explode);
  
  // 3. World clipping planes
  // The geometry is inside a group with position [0, -0.5, 0]
  const baseWorldOffset = new THREE.Vector3(0, -0.5, 0);
  
  // Top half: keeps points where normal.dot(p) + c > 0
  const clipPlaneTop = localPlane.clone().translate(baseWorldOffset.clone().add(offsetTop));
  
  // Bottom half: keeps points where normal.dot(p) + c < 0 (so we negate the plane)
  const clipPlaneBottom = localPlane.clone().negate().translate(baseWorldOffset.clone().add(offsetBottom));
  
  return (
    <div className="cross-section-wrapper">
      <div className="cross-section-container">
        <div className="cross-section-visualizer">
          <div className="interaction-hint">Cuộn chuột để Thu/Phóng - Kéo thả để Xoay</div>
          <Canvas camera={{ position: [4, 3, 5], fov: 45 }} gl={{ localClippingEnabled: true }}>
            <ClippingSetup />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <OrbitControls />
            
            <group position={[0, -0.5, 0]}>
              {/* Group TOP half */}
              <group position={offsetTop}>
                <mesh geometry={geometry}>
                  <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} side={THREE.DoubleSide} clippingPlanes={[clipPlaneTop]} />
                </mesh>
                
                {polyGeo && <mesh geometry={polyGeo}>
                  <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} transparent opacity={0.6} planes={null} polygonOffset={true} polygonOffsetFactor={-1} />
                </mesh>}
                
                {polyOutline.length > 0 && polyOutline.slice(0, -1).map((p, i) => (
                  <EdgeCylinder key={`out-top-${i}`} start={p} end={polyOutline[i+1]} radius={0.015} color="#b91c1c" planes={null} />
                ))}
                
                {shape.edges.map((e, idx) => (
                  <EdgeCylinder key={`e-top-${idx}`} start={shape.vertices[e[0]]} end={shape.vertices[e[1]]} radius={0.01} color="#1e3a8a" planes={[clipPlaneTop]} />
                ))}

                {shape.vertices.map((v, i) => localPlane.distanceToPoint(v) > -0.0001 && (
                  <mesh key={`v-top-${i}`} position={v}>
                    <sphereGeometry args={[0.04, 16, 16]} />
                    <meshBasicMaterial color="#111827" />
                    <Html distanceFactor={10} zIndexRange={[100, 0]} style={{ pointerEvents: 'none', fontWeight: 'bold', fontSize: '18px', color: '#111827', transform: 'translate3d(10px, -10px, 0)' }}>
                      {shape.vertexLabels[i]}
                    </Html>
                  </mesh>
                ))}

                <mesh position={P1}>
                   <sphereGeometry args={[0.05, 16, 16]} />
                   <meshBasicMaterial color="#ef4444" />
                   <Html distanceFactor={10} zIndexRange={[100, 0]} style={{ pointerEvents: 'none', fontWeight: 'bold', fontSize: '16px', color: '#ef4444', transform: 'translate3d(10px, -10px, 0)' }}>M</Html>
                </mesh>
                <mesh position={P2}>
                   <sphereGeometry args={[0.05, 16, 16]} />
                   <meshBasicMaterial color="#ef4444" />
                   <Html distanceFactor={10} zIndexRange={[100, 0]} style={{ pointerEvents: 'none', fontWeight: 'bold', fontSize: '16px', color: '#ef4444', transform: 'translate3d(10px, -10px, 0)' }}>N</Html>
                </mesh>
                <mesh position={P3}>
                   <sphereGeometry args={[0.05, 16, 16]} />
                   <meshBasicMaterial color="#ef4444" />
                   <Html distanceFactor={10} zIndexRange={[100, 0]} style={{ pointerEvents: 'none', fontWeight: 'bold', fontSize: '16px', color: '#ef4444', transform: 'translate3d(10px, -10px, 0)' }}>P</Html>
                </mesh>

                {extraPoints.map((p, i) => (
                  <mesh key={`extra-${i}`} position={p}>
                     <sphereGeometry args={[0.05, 16, 16]} />
                     <meshBasicMaterial color="#ef4444" />
                     <Html distanceFactor={10} zIndexRange={[100, 0]} style={{ pointerEvents: 'none', fontWeight: 'bold', fontSize: '16px', color: '#ef4444', transform: 'translate3d(10px, -10px, 0)' }}>
                       {EXTRA_LABELS[i]}
                     </Html>
                  </mesh>
                ))}
              </group>

              {/* Group BOTTOM half */}
              <group position={offsetBottom}>
                <mesh geometry={geometry}>
                  <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} side={THREE.DoubleSide} clippingPlanes={[clipPlaneBottom]} />
                </mesh>
                
                {polyGeo && explode > 0.001 && <mesh geometry={polyGeo}>
                  <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} transparent opacity={0.6} planes={null} polygonOffset={true} polygonOffsetFactor={-1} />
                </mesh>}
                
                {polyOutline.length > 0 && polyOutline.slice(0, -1).map((p, i) => (
                  <EdgeCylinder key={`out-bot-${i}`} start={p} end={polyOutline[i+1]} radius={0.015} color="#b91c1c" planes={null} />
                ))}
                
                {shape.edges.map((e, idx) => (
                  <EdgeCylinder key={`e-bot-${idx}`} start={shape.vertices[e[0]]} end={shape.vertices[e[1]]} radius={0.01} color="#1e3a8a" planes={[clipPlaneBottom]} />
                ))}

                {shape.vertices.map((v, i) => localPlane.distanceToPoint(v) <= -0.0001 && (
                  <mesh key={`v-bot-${i}`} position={v}>
                    <sphereGeometry args={[0.04, 16, 16]} />
                    <meshBasicMaterial color="#111827" />
                    <Html distanceFactor={10} zIndexRange={[100, 0]} style={{ pointerEvents: 'none', fontWeight: 'bold', fontSize: '18px', color: '#111827', transform: 'translate3d(10px, -10px, 0)' }}>
                      {shape.vertexLabels[i]}
                    </Html>
                  </mesh>
                ))}
              </group>

              {/* Vertices & Labels have been moved into Top and Bottom groups */}

              {/* Slicing plane visualization */}
              {showPlane && !isCoplanar && (
                <group position={plane.normal.clone().multiplyScalar(-plane.constant)}>
                   <mesh quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), plane.normal)}>
                      <planeGeometry args={[10, 10]} />
                      <meshBasicMaterial color="#10b981" transparent opacity={0.15} side={THREE.DoubleSide} />
                   </mesh>
                </group>
              )}
            </group>
          </Canvas>
        </div>

        <div className="cross-section-sidebar">
          <h3 className="math-title">Thiết diện trong không gian</h3>
          
          <div className="control-group">
            <label>Khối chóp:</label>
            <select className="cs-select" value={activeShape} onChange={e => {setActiveShape(e.target.value); setExplode(0);}}>
              {Object.keys(SHAPES).map(k => (
                <option key={k} value={k}>{SHAPES[k].name}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Vị trí M trên {shape.vertexLabels[shape.edges[shape.pointEdges[0]][0]]}{shape.vertexLabels[shape.edges[shape.pointEdges[0]][1]]}: {t1.toFixed(2)}</label>
            <input type="range" min="0" max="1" step="0.01" value={t1} onChange={e => setT1(Number(e.target.value))} className="cs-slider" />
            
            <label style={{marginTop: '1rem'}}>Vị trí N trên {shape.vertexLabels[shape.edges[shape.pointEdges[1]][0]]}{shape.vertexLabels[shape.edges[shape.pointEdges[1]][1]]}: {t2.toFixed(2)}</label>
            <input type="range" min="0" max="1" step="0.01" value={t2} onChange={e => setT2(Number(e.target.value))} className="cs-slider" />
            
            <label style={{marginTop: '1rem'}}>Vị trí P trên {shape.vertexLabels[shape.edges[shape.pointEdges[2]][0]]}{shape.vertexLabels[shape.edges[shape.pointEdges[2]][1]]}: {t3.toFixed(2)}</label>
            <input type="range" min="0" max="1" step="0.01" value={t3} onChange={e => setT3(Number(e.target.value))} className="cs-slider" />
          </div>

          <div className="control-group">
            <label>Tách khối (Explode):</label>
            <input type="range" min="0" max="2" step="0.05" value={explode} onChange={e => setExplode(Number(e.target.value))} className="cs-slider" />
            
            <div className="checkbox-grid">
              <label><input type="checkbox" checked={showPlane} onChange={e => setShowPlane(e.target.checked)} /> Hiển thị mặt phẳng (α)</label>
            </div>
          </div>

          <div className="math-panel">
            <h4>Thông tin thiết diện</h4>
            <div className="cs-info-box">
              {isCoplanar ? (
                "3 điểm M, N, P thẳng hàng nên không tạo thành mặt phẳng."
              ) : polygon.length < 3 ? (
                "Mặt phẳng không cắt khối chóp."
              ) : (
                <>
                  <div>Thiết diện của mặt phẳng (MNP) và khối chóp là một <strong>{getPolyName(polygon.length)}</strong>.</div>
                  <div style={{marginTop: '0.5rem', fontSize: '0.9rem'}}>
                    Số lượng giao điểm trên các cạnh: {polygon.length}.<br/>
                    (Kéo thanh trượt "Tách khối" để nhìn rõ thiết diện hơn)
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossSection3D;
