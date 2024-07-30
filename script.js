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
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700, // Gold color
      metalness: 0.4, // Fully metallic
      roughness: 0.1, // Smooth surface
  });

  // Apply the gold material to the loaded object
  object.traverse((child) => {
      if (child.isMesh) {
          child.material = goldMaterial;
      }
  });
  coin = object;
  scene.add(coin);
  
  coin.position.set(1000, -1000, 0); // Start from bottom right
  coin.rotation.set(0, 0, 0);

  coin.scale.set(0.8, 0.8, 0.8); 

  const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffd700, size: 0.2 });
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
    const targetPosition = { x: 12, y: -12 }; // Target position for both coin and stars

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
    gsap.to(coin.rotation, {y: Math.PI * 1.25, duration: 20, ease: "none", repeat: -1 });
  });

  camera.position.z = 35;

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  animate();

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
});