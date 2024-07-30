document.addEventListener("DOMContentLoaded", () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 2 / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  const container = document.getElementById('model-container');
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(0, -18, 10);
  scene.add(light);

  const loader = new THREE.OBJLoader();
  let coin;

  loader.load('./coin1.obj', (object) => {
    const vertices = [];

    object.traverse((child) => {
      if (child.isMesh) {
        const positions = child.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          vertices.push(positions[i], positions[i + 1], positions[i + 2]);
        }
      }
    });

    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const pointMaterial = new THREE.PointsMaterial({ color: 0xffd700, size: Math.random() * 0.1 + 0.0005 });

    coin = new THREE.Points(pointGeometry, pointMaterial);
    scene.add(coin);

    coin.position.set(1000, -1000, 0); // Start from bottom right
    coin.rotation.set(0, 0, 0);

    coin.scale.set(0.8, 0.8, 0.8);

    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffd700) },
        time: { value: 0 },
      },
      vertexShader: `
        uniform float time;
        varying vec3 vColor;
        void main() {
          vColor = vec3(1.0, 0.843, 0); // Gold color
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float twinkle = sin(time + position.x * 10.0) * 0.5 + 0.5;
          gl_PointSize = (0.2 + twinkle * 0.1) * (300.0 / -mvPosition.z); // Adjust point size based on distance and twinkle
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          gl_FragColor = vec4(vColor, 1.0);
        }
      `,
      transparent: true,
    });

    const starCount = 3000; // Adjust the number of stars as needed

    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 100;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Animation to center
    const targetPosition = { x: 12, y: -12 };

    gsap.to(coin.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      duration: 3.5,
      ease: "power2.out",
    });

    gsap.to(stars.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      duration: 3.5,
      ease: "power2.out",
      onComplete: () => {
        // Start rotating the stars after they reach the center
        gsap.to(stars.rotation, { y: Math.PI * 1.25, duration: 20, ease: "none", repeat: -1 });
      }
    });

    // Continuous slow rotation of the coin
    gsap.to(coin.rotation, { y: Math.PI * 1.25, duration: 20, ease: "none", repeat: -1 });

    // Handle star rotation on click
    let rotateDirection = 1;
    container.addEventListener('click', () => {
      rotateDirection *= -1; // Toggle rotation direction
      gsap.to(stars.rotation, { y: `+=${Math.PI * 1.25 * rotateDirection}`, duration: 20, ease: "none", repeat: -1 });
      gsap.to(coin.rotation, { y: `+=${Math.PI * 1.25 * rotateDirection}`, duration: 20, ease: "none", repeat: -1 });
    });
  });

  camera.position.z = 35;

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    // Update shader time uniform for twinkle effect
    starMaterial.uniforms.time.value += 0.05;
  };

  animate();

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
});
