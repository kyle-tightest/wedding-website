import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function Heart() {
  const mesh = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();

  // Memoize the shape to avoid recreating it on every render
  const heartShape = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = -10; // Center the heart shape
    shape.moveTo(x + 5, y + 5);
    shape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    shape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    shape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
    shape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
    shape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
    shape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);
    return shape;
  }, []);

  // Memoize initial random properties
  const { position, rotation, scale, speed, rotationSpeed } = useMemo(() => {
    return {
      position: [
        THREE.MathUtils.randFloatSpread(viewport.width * 1.5),
        THREE.MathUtils.randFloatSpread(viewport.height * 2), // Start them off-screen too
        THREE.MathUtils.randFloatSpread(50) - 25,
      ] as [number, number, number],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
      scale: THREE.MathUtils.randFloat(0.1, 0.4),
      speed: THREE.MathUtils.randFloat(0.1, 0.5),
      rotationSpeed: {
        x: THREE.MathUtils.randFloat(-0.01, 0.01),
        y: THREE.MathUtils.randFloat(-0.01, 0.01),
      }
    };
  }, [viewport]);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    
    // Animate rotation
    mesh.current.rotation.x += rotationSpeed.x;
    mesh.current.rotation.y += rotationSpeed.y;

    // Animate position (float upwards)
    mesh.current.position.y += speed * delta * 10; // Use delta for frame-rate independence

    // Animate horizontal sway
    mesh.current.position.x += Math.sin(state.clock.elapsedTime + position[0]) * 0.01;

    // Reset heart when it goes off-screen
    if (mesh.current.position.y > viewport.height / 2 + 10) {
      mesh.current.position.y = -viewport.height / 2 - 10;
      mesh.current.position.x = THREE.MathUtils.randFloatSpread(viewport.width * 1.5);
    }
  });

  return (
    <mesh
      ref={mesh}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
    >
      <shapeGeometry args={[heartShape]} />
      <meshPhongMaterial 
        color="#ff4d6d" // A nice pinkish-red
        emissive="#ff4d6d"
        emissiveIntensity={0.3}
        side={THREE.DoubleSide} 
        transparent 
        opacity={0.7} 
        shininess={80}
      />
    </mesh>
  );
}

function Hearts({ count = 100 }) {
  return <>{Array.from({ length: count }, (_, i) => <Heart key={i} />)}</>;
}

export default function HeartBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 50], fov: 75 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#ff8fab" />
        <pointLight position={[-10, -10, 10]} intensity={0.5} color="#ff8fab" />
        <Hearts />
      </Canvas>
    </div>
  );
}