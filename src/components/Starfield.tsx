import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Stars({ count = 5000 }) {
  const mesh = useRef<THREE.Points>(null!);

  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2000;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2000;

      // Give stars slightly different colors (e.g., shades of white, pale blue, pale yellow)
      color.setHSL(0.6, 0.9, Math.random() * 0.3 + 0.7); // Mostly bluish-white
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;

      // Give stars different sizes
      siz[i] = Math.random() * 2.5 + 1;
    }
    return [pos, col, siz];
  }, [count]);

  useFrame((state, delta) => {
    if (mesh.current) {
      const positions = mesh.current.geometry.attributes.position.array as Float32Array;

      // Star movement logic
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 2] += delta * 20; // Move along z-axis

        // Reset star if it goes past the camera
        if (positions[i * 3 + 2] > 1000) {
          positions[i * 3 + 2] = -1000;
        }
      }
      mesh.current.geometry.attributes.position.needsUpdate = true;

      // Mouse parallax effect
      // The mouse coordinates are in a normalized range from -1 to 1.
      const targetRotationX = state.mouse.y * 0.1; // Rotate around X-axis based on mouse Y
      const targetRotationY = -state.mouse.x * 0.1; // Rotate around Y-axis based on mouse X (negated for natural feel)

      // Smoothly interpolate the rotation towards the target
      mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, targetRotationX, 0.02);
      mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, targetRotationY, 0.02);
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial vertexColors sizeAttenuation transparent opacity={0.9} />
    </points>
  );
}

export default function Starfield() {
  return (
    <div className="absolute inset-0 z-0 bg-black">
      <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
        <Stars />
      </Canvas>
    </div>
  );
}