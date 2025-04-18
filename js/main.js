let scene, camera, renderer;
let aircraft;
let controls;
let clock = new THREE.Clock();
let terrain;
let clouds = [];

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.001);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 5, 10);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create Washington state terrain
    createTerrain();

    // Add clouds
    createClouds();

    // Initialize aircraft
    aircraft = new Aircraft();
    scene.add(aircraft.mesh);

    // Initialize controls
    controls = new Controls(aircraft);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start animation loop
    animate();
}

function createTerrain() {
    const size = 1000;
    const resolution = 100;
    const geometry = new THREE.PlaneGeometry(size, size, resolution, resolution);
    
    // Create Washington-like terrain with mountains and valleys
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        
        // Create Cascade Mountains
        const cascadeHeight = Math.exp(-(x * x + z * z) / (size * size * 0.1)) * 100;
        
        // Add Olympic Mountains
        const olympicHeight = Math.exp(-((x - size/4) * (x - size/4) + (z + size/4) * (z + size/4)) / (size * size * 0.05)) * 150;
        
        // Add Columbia River valley
        const riverValley = Math.exp(-(z * z) / (size * size * 0.02)) * -50;
        
        // Combine terrain features
        vertices[i + 1] = cascadeHeight + olympicHeight + riverValley;
    }
    
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshStandardMaterial({
        color: 0x3a5f0b,
        roughness: 0.8,
        metalness: 0.2,
        flatShading: true
    });
    
    terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);
}

function createClouds() {
    const cloudGeometry = new THREE.SphereGeometry(20, 8, 8);
    const cloudMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    });

    for (let i = 0; i < 20; i++) {
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(
            Math.random() * 1000 - 500,
            Math.random() * 200 + 100,
            Math.random() * 1000 - 500
        );
        cloud.scale.set(
            Math.random() * 2 + 1,
            Math.random() * 0.5 + 0.5,
            Math.random() * 2 + 1
        );
        clouds.push(cloud);
        scene.add(cloud);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    
    // Update aircraft physics
    aircraft.update(delta);
    
    // Update camera position to follow aircraft
    const cameraOffset = new THREE.Vector3(0, 5, 10);
    cameraOffset.applyQuaternion(aircraft.mesh.quaternion);
    camera.position.copy(aircraft.mesh.position).add(cameraOffset);
    camera.lookAt(aircraft.mesh.position);

    // Update clouds
    clouds.forEach(cloud => {
        cloud.position.x += delta * 5;
        if (cloud.position.x > 500) cloud.position.x = -500;
    });

    // Update HUD
    document.getElementById('speed').textContent = `Speed: ${Math.round(aircraft.speed)} knots`;
    document.getElementById('altitude').textContent = `Altitude: ${Math.round(aircraft.position.y * 3.28084)} ft`;
    document.getElementById('heading').textContent = `Heading: ${Math.round(aircraft.heading)}°`;

    renderer.render(scene, camera);
}

// Start the application
init(); 