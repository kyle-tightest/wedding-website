import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Heart() {
  const mesh = useRef<THREE.Mesh>(null!);
  const heartShape = new THREE.Shape();

  // Create heart shape
  const x = 0, y = 0;
  heartShape.moveTo(x + 5, y + 5);
  heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
  heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
  heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
  heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
  heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
  heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

  const geometry = new THREE.ShapeGeometry(heartShape);
  const position = [
    THREE.MathUtils.randFloatSpread(100),
    THREE.MathUtils.randFloatSpread(100),
    THREE.MathUtils.randFloatSpread(100)
  ];
  const rotation = [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI];
  const scale = THREE.MathUtils.randFloat(0.1, 0.3);

  useFrame((state) => {
    mesh.current.rotation.x += 0.01;
    mesh.current.rotation.y += 0.01;
    mesh.current.position.y += Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
  });

  return (
    <mesh
      ref={mesh}
      position={position as [number, number, number]}
      rotation={rotation as [number, number, number]}
      scale={[scale, scale, scale]}
    >
      <shapeGeometry args={[heartShape]} />
      <meshPhongMaterial color="red" side={THREE.DoubleSide} transparent opacity={0.6} />
    </mesh>
  );
}

function Hearts() {
  return Array.from({ length: 50 }, (_, i) => <Heart key={i} />);
}

export default function HeartBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 50], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Hearts />
      </Canvas>
    </div>
  );
}