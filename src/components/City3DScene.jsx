import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { MathUtils, Object3D, PCFShadowMap, Vector3 } from "three";
import { cityCameraPath, cityPalette as colors } from "../data/city3DStoryData";

const smooth = (value) => MathUtils.smoothstep(value, 0, 1);
const roads = [-42, -14, 14, 42];
const avenues = [-30, -10, 10, 30];
const item = (x, y, z, sx, sy, sz, rotation = [0, 0, 0]) => ({ position: [x, y, z], scale: [sx, sy, sz], rotation });

function makeCity(compact) {
  const villas = [], roofs = [], windows = [], walls = [], apartments = [];
  const trunks = [], leaves = [], trees = [], lights = [], lamps = [];
  const step = compact ? 10 : 7;
  for (let x = -54; x <= -21; x += step) {
    if (Math.abs(x + 42) < 4) continue;
    for (let z = -42; z <= 42; z += step) {
      if ([-30, -10, 10, 30].some(road => Math.abs(z - road) < 4)) continue;
      const h = 3 + ((x + z + 100) % 3) * 0.45;
      villas.push(item(x, h / 2 + 0.3, z, 4.2, h, 4));
      roofs.push(item(x, h + 0.5, z, 4.5, 0.35, 4.3));
      roofs.push(item(x - 0.85, h + 1, z - 0.7, 2.2, 0.9, 2));
      walls.push(item(x, 0.75, z + 2.8, 5.4, 1.1, 0.18));
      walls.push(item(x - 2.6, 0.75, z, 0.18, 1.1, 5.6));
      for (const side of [-1, 1]) {
        windows.push(item(x + side, h * 0.65, z + 2.02, 0.65, 1.05, 0.05));
        windows.push(item(x + 2.12, h * 0.65, z + side, 0.05, 1.05, 0.65));
      }
    }
  }
  for (const x of [23, 34, 50]) {
    for (const z of [17, 25, 39]) {
      if (x < 40 && z < 30) continue;
      const floors = 3 + ((x + z) % 3);
      const height = floors * 2.1;
      apartments.push(item(x, height / 2 + 0.3, z, 6, height, 5.4));
      roofs.push(item(x, height + 0.5, z, 6.3, 0.35, 5.7));
      for (let floor = 0; floor < floors; floor++) {
        for (const dx of [-2, 0, 2]) windows.push(item(x + dx, 1.65 + floor * 2.1, z + 2.72, 0.9, 1.1, 0.05));
      }
    }
  }
  function palm(x, z, i) {
    const height = 4.2 + (i % 3) * 0.35;
    trunks.push(item(x, height / 2, z, 0.24, height, 0.24));
    for (let k = 0; k < 5; k++) {
      const angle = k * Math.PI * 0.4;
      leaves.push(item(x + Math.sin(angle) * 0.85, height, z + Math.cos(angle) * 0.85,
        0.45, 0.19, 1.75, [0.2, angle, 0]));
    }
  }
  for (let z = -43, i = 0; z <= 43; z += compact ? 12 : 7, i++) {
    for (const x of [-17.5, 17.5]) palm(x, z, i);
    for (const x of [-8, 8]) {
      trunks.push(item(x, 1.4, z, 0.3, 2.8, 0.3));
      trees.push(item(x, 3.4, z, 1.6, 2.1, 1.7));
    }
  }
  for (let x = -54, i = 0; x <= 54; x += compact ? 16 : 9, i++) {
    palm(x, -46, i);
    for (const z of [-33, 33]) {
      lamps.push(item(x, 2.05, z, 0.12, 4.1, 0.12));
      lights.push(item(x, 4.15, z, 0.48, 0.16, 0.48));
    }
  }
  return { villas, roofs, windows, walls, apartments, trunks, leaves, trees, lights, lamps };
}

// One draw call per repeated geometry/material; R3F disposes owned resources.
function Instances({ items, color, shape = "box", castShadow = false, emissive }) {
  const mesh = useRef(null);
  useLayoutEffect(() => {
    const object = new Object3D();
    items.forEach((entry, index) => {
      object.position.fromArray(entry.position);
      object.scale.fromArray(entry.scale);
      object.rotation.set(...entry.rotation);
      object.updateMatrix();
      mesh.current.setMatrixAt(index, object.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [items]);
  return <instancedMesh ref={mesh} args={[null, null, items.length]} castShadow={castShadow} receiveShadow>
    {shape === "box" ? <boxGeometry /> : shape === "trunk" ? <cylinderGeometry args={[1, 1.2, 1, 6]} /> : <sphereGeometry args={[1, 8, 6]} />}
    <meshStandardMaterial color={color} roughness={0.88} emissive={emissive || "#000000"} emissiveIntensity={0.3} />
  </instancedMesh>;
}

function Block({ position, size, color = colors.ivory, shadow = false }) {
  return <mesh position={position} receiveShadow castShadow={shadow}>
    <boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.9} />
  </mesh>;
}

function Infrastructure() {
  const markings = useMemo(() => {
    const data = [];
    for (const x of roads) for (let z = -45; z < 46; z += 4) data.push(item(x, 0.24, z, 0.12, 0.02, 1.4));
    for (const z of avenues) for (let x = -57; x < 58; x += 4) {
      if (Math.abs(x) > 13) data.push(item(x, 0.25, z, 1.4, 0.02, 0.12));
    }
    return data;
  }, []);
  return <>
    <Block position={[0, -0.5, 0]} size={[126, 1, 106]} color={colors.ground} />
    {roads.map(x => <group key={x}>
      <Block position={[x, 0.06, 0]} size={[6.4, 0.12, 98]} color={colors.sidewalk} />
      <Block position={[x, 0.14, 0]} size={[4.6, 0.12, 98]} color={colors.road} />
    </group>)}
    {avenues.map(z => [-1, 1].map(side => <group key={`${z}-${side}`}>
      <Block position={[side * 36, 0.07, z]} size={[47, 0.12, 6.4]} color={colors.sidewalk} />
      <Block position={[side * 36, 0.15, z]} size={[47, 0.12, 4.6]} color={colors.road} />
    </group>))}
    <Instances items={markings} color={colors.stone} />
    {[-14, 14].flatMap(x => [-30, 30].map(z => <group key={`${x}-${z}`} position={[x, 0.22, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[4.1, 32]} /><meshStandardMaterial color={colors.sidewalk} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><ringGeometry args={[2, 3.7, 32]} /><meshStandardMaterial color={colors.road} /></mesh>
      <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[1.8, 1.8, 0.2, 24]} /><meshStandardMaterial color={colors.lawn} /></mesh>
    </group>))}
  </>;
}

function Facilities({ shadows }) {
  return <>
    {/* School: two teaching wings and a sheltered courtyard. */}
    <Block position={[28, 2.5, -24]} size={[15, 5, 5]} shadow={shadows} />
    <Block position={[22, 2.5, -19]} size={[3, 5, 7]} color={colors.stone} shadow={shadows} />
    <Block position={[34, 2.5, -19]} size={[3, 5, 7]} color={colors.stone} shadow={shadows} />
    <Block position={[28, 0.24, -18]} size={[8, 0.2, 7]} color={colors.sidewalk} />
    <Block position={[28, 2.8, -21.45]} size={[11, 1.3, 0.12]} color={colors.glass} />
    {/* Health centre and its shaded entrance. */}
    <Block position={[49, 3, -3]} size={[13, 6, 9]} shadow={shadows} />
    <Block position={[49, 2.1, 2.5]} size={[10, 0.4, 3]} color={colors.roof} />
    <Block position={[49, 3.4, 1.52]} size={[8, 1.6, 0.1]} color={colors.glass} />
    {/* Mosque: low prayer hall, restrained dome and a slender minaret. */}
    <Block position={[29, 2.6, -2]} size={[11, 5.2, 10]} shadow={shadows} />
    <mesh position={[29, 5.2, -2]} castShadow={shadows}>
      <sphereGeometry args={[3.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={colors.stone} roughness={0.85} />
    </mesh>
    <mesh position={[36, 6.3, -5]} castShadow={shadows}>
      <cylinderGeometry args={[0.7, 0.95, 12.6, 8]} /><meshStandardMaterial color={colors.ivory} />
    </mesh>
    <mesh position={[36, 12.8, -5]}><coneGeometry args={[1, 1.7, 8]} /><meshStandardMaterial color={colors.stone} /></mesh>
    {/* Walkable commercial frontage, arcades and a public plaza. */}
    {[21, 28, 35].map(x => <group key={x}>
      <Block position={[x, 3, 18]} size={[6.2, 6, 7]} shadow={shadows} />
      <Block position={[x, 1.8, 21.55]} size={[4.8, 2.4, 0.1]} color={colors.glass} />
      <Block position={[x, 3.25, 22]} size={[6.5, 0.3, 2.5]} color={colors.roof} />
    </group>)}
    <Block position={[28, 0.1, 25]} size={[22, 0.2, 5]} color={colors.sidewalk} />
  </>;
}

function City({ motion, compact, onReady, onFailure }) {
  const { camera, invalidate, size, gl } = useThree();
  const city = useMemo(() => makeCity(compact), [compact]);
  const residential = useRef(null), canopy = useRef(null), route = useRef(null);
  const network = useRef(null), neighbourhood = useRef(null), markers = useRef(null);
  const vectors = useRef({ cameraPosition: new Vector3(), cameraTarget: new Vector3(), waypoint: new Vector3() });
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    onReady(invalidate);
    const canvas = gl.domElement;
    const lost = (event) => { event.preventDefault(); onFailure(); };
    canvas.addEventListener("webglcontextlost", lost);
    return () => { canvas.removeEventListener("webglcontextlost", lost); onReady(null); };
  }, [gl, invalidate, onReady, onFailure]);

  useLayoutEffect(() => {
    const mobile = size.width < 700;
    camera.setViewOffset(size.width, size.height, mobile ? 0 : size.width * 0.16, mobile ? size.height * 0.16 : 0, size.width, size.height);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);

  useFrame((_, delta) => {
    const { cameraPosition, cameraTarget, waypoint } = vectors.current;
    const state = motion.current;
    const progress = state.progress;
    let index = cityCameraPath.findIndex(point => point.at >= progress);
    if (index < 1) index = 1;
    const from = cityCameraPath[index - 1], to = cityCameraPath[index];
    const t = smooth((progress - from.at) / (to.at - from.at));
    cameraPosition.fromArray(from.position).lerp(waypoint.fromArray(to.position), t);
    cameraTarget.fromArray(from.target).lerp(waypoint.fromArray(to.target), t);
    if (compact) {
      // Keep the complete subject in portrait views and shorten the close-ups.
      cameraPosition.sub(cameraTarget).multiplyScalar(size.width < 700 ? 1.32 : 1.12).add(cameraTarget);
    } else {
      const wide = 1 + 0.12 * (1 - smooth(progress / 1.3) + smooth((progress - 4) / 0.6));
      cameraPosition.sub(cameraTarget).multiplyScalar(wide).add(cameraTarget);
    }
    const fast = Math.abs(state.velocity) > 1200 || compact;
    const px = fast ? 0 : state.pointerX, py = fast ? 0 : state.pointerY;
    const blend = 1 - Math.exp(-Math.min(delta, 0.06) * 7);
    pointer.current.x = MathUtils.lerp(pointer.current.x, px, blend);
    pointer.current.y = MathUtils.lerp(pointer.current.y, py, blend);
    cameraPosition.x += pointer.current.x * 1.1;
    cameraPosition.y += pointer.current.y * 0.65;
    camera.position.copy(cameraPosition);
    camera.lookAt(cameraTarget);
    residential.current.scale.y = 0.8 + smooth((progress - 0.85) / 0.55) * 0.2;
    canopy.current.rotation.z = Math.sin(progress * 7) * 0.0025;
    route.current.scale.z = 0.02 + smooth((progress - 1.95) / 0.75) * 0.98;
    const border = smooth((progress - 0.8) / 0.25) * (1 - smooth((progress - 1.8) / 0.3));
    neighbourhood.current.visible = border > 0;
    neighbourhood.current.children.forEach(line => { line.material.opacity = border * 0.65; });
    markers.current.scale.setScalar(smooth((progress - 2.9) / 0.3) * (1 - smooth((progress - 4.1) / 0.3)));
    markers.current.visible = progress > 2.9 && progress < 4.4;
    const networkOpacity = 1 - smooth((progress - 0.65) / 0.3) + smooth((progress - 4) / 0.5);
    network.current.visible = networkOpacity > 0;
    network.current.children.forEach(line => { line.material.opacity = networkOpacity * 0.45; });
    if (state.active && !document.hidden && (Math.abs(pointer.current.x - px) > 0.002 || Math.abs(pointer.current.y - py) > 0.002)) invalidate();
  });

  return <>
    <color attach="background" args={[colors.background]} />
    <fog attach="fog" args={[colors.background, 130, 255]} />
    <hemisphereLight args={["#fff0cf", "#2b4537", 2.4]} />
    <directionalLight position={[-35, 65, 40]} intensity={3} color="#ffe4b4" castShadow={!compact}
      shadow-mapSize={[1024, 1024]} shadow-camera-left={-72} shadow-camera-right={72}
      shadow-camera-top={60} shadow-camera-bottom={-60} shadow-camera-far={180} shadow-bias={-0.001} />
    <Infrastructure />
    <group ref={residential}>
      <Instances items={city.villas} color={colors.ivory} castShadow={!compact} />
      <Instances items={city.apartments} color={colors.stone} castShadow={!compact} />
      <Instances items={city.roofs} color={colors.roof} />
      <Instances items={city.windows} color={colors.glass} />
      <Instances items={city.walls} color={colors.sidewalk} />
    </group>
    <Block position={[0, 0.12, 0]} size={[22, 0.24, 94]} color={colors.lawn} />
    <Block position={[0, 0.27, 0]} size={[2.4, 0.12, 94]} color={colors.sidewalk} />
    <Block position={[4.7, 0.29, -2]} size={[4.6, 0.12, 22]} color={colors.water} />
    <group ref={route} position={[-4.2, 0.34, 0]}>
      <Block position={[0, 0, 0]} size={[0.5, 0.08, 88]} color="#a3ae74" />
    </group>
    <Instances items={city.trunks} shape="trunk" color={colors.trunk} />
    <group ref={canopy}>
      <Instances items={city.leaves} shape="sphere" color={colors.leaf} />
      <Instances items={city.trees} shape="sphere" color={colors.leaf} castShadow={!compact} />
    </group>
    <Instances items={city.lamps} color={colors.road} />
    <Instances items={city.lights} color={colors.gold} emissive={colors.gold} />
    <Facilities shadows={!compact} />
    <group ref={network}>
      {[-14, 14, -42, 42].map(x => <Line key={x} points={[[x, 0.32, -47], [x, 0.32, 47]]} color={colors.gold} lineWidth={0.8} transparent opacity={0.45} />)}
      {[-30, 30].map(z => <Line key={z} points={[[-58, 0.33, z], [58, 0.33, z]]} color={colors.gold} lineWidth={0.8} transparent opacity={0.4} />)}
    </group>
    <group ref={neighbourhood}>
      <Line points={[[-57, 0.4, -44], [-18, 0.4, -44], [-18, 0.4, 44], [-57, 0.4, 44], [-57, 0.4, -44]]} color={colors.gold} lineWidth={1.1} transparent opacity={0.65} />
    </group>
    <group ref={markers}>
      {[[28, 9, -24], [49, 10, -3], [28, 10, 18]].map(position => <mesh position={position} key={position.join()}>
        <sphereGeometry args={[0.7, 12, 8]} /><meshBasicMaterial color={colors.gold} />
      </mesh>)}
      <Line points={[[28, 9, -24], [49, 10, -3], [28, 10, 18]]} color={colors.gold} lineWidth={0.8} transparent opacity={0.5} />
    </group>
  </>;
}

export default function City3DScene({ motion, compact, onReady, onFailure }) {
  return <Canvas aria-hidden="true" frameloop="demand" dpr={compact ? 1 : [1, 1.5]}
    camera={{ position: cityCameraPath[0].position, fov: 43, near: 0.5, far: 320 }}
    shadows={compact ? false : { type: PCFShadowMap }} gl={{ antialias: !compact, powerPreference: "high-performance", alpha: false }}
    fallback={null}>
    <City motion={motion} compact={compact} onReady={onReady} onFailure={onFailure} />
  </Canvas>;
}
