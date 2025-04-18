let scene, camera, renderer;
let aircraft;
let controls;
let clock = new THREE.Clock();
let terrain;
let water;
let cityMeshes = [];
let trees = [];
let clouds = [];
let runway;

function init() {
    // Create scene with atmospheric fog
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    scene.fog = new THREE.FogExp2(0x87CEEB, 0.0007);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(-50, 20, 0);  // Closer and lower position

    // Create renderer with better shadows
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(100, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    scene.add(sunLight);

    // Create runway
    createRunway();

    // Create Washington state terrain with mountains
    createTerrain();

    // Add Puget Sound water
    createWater();

    // Add Seattle-like city
    createCity();

    // Add evergreen forest
    createForest();

    // Add clouds
    createClouds();

    // Initialize aircraft
    aircraft = new Aircraft();
    scene.add(aircraft.mesh);

    // Initialize controls
    controls = new Controls(aircraft, scene);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start animation loop
    animate();
}

function createRunway() {
    // Create runway group
    runway = new THREE.Group();

    // Main runway strip
    const runwayGeometry = new THREE.PlaneGeometry(200, 20);
    const runwayMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.8,
        metalness: 0.2,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
    });
    const runwayMesh = new THREE.Mesh(runwayGeometry, runwayMaterial);
    runwayMesh.rotation.x = -Math.PI / 2;
    runwayMesh.position.y = 0.1;  // Slightly above ground
    runwayMesh.receiveShadow = true;
    runway.add(runwayMesh);

    // Runway markings with adjusted height
    const stripeGeometry = new THREE.PlaneGeometry(8, 1);
    const stripeMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.8,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
    });

    // Add center stripes
    for (let i = -90; i <= 90; i += 20) {
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.set(i, 0.2, 0);  // Slightly above runway
        stripe.rotation.x = -Math.PI / 2;
        runway.add(stripe);
    }

    scene.add(runway);
}

function createTerrain() {
    const size = 4000;
    const resolution = 256;
    const geometry = new THREE.PlaneGeometry(size, size, resolution, resolution);
    
    // Create Washington-like terrain with mountains
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];
        
        // Keep the runway area flat
        const distanceFromRunway = Math.sqrt(x * x + z * z);
        if (distanceFromRunway < 150) continue;
        
        // Create Mt. Rainier on the right side
        const distanceFromRainier = Math.sqrt(Math.pow(x - 500, 2) + Math.pow(z - 500, 2));
        const rainierHeight = Math.max(0, 400 * Math.exp(-distanceFromRainier / 300));
        
        // Create Seattle downtown on the left side
        const distanceFromSeattle = Math.sqrt(Math.pow(x + 500, 2) + Math.pow(z - 500, 2));
        const seattleHeight = Math.max(0, 100 * Math.exp(-distanceFromSeattle / 100));
        
        // Combine heights
        vertices[i + 1] = Math.max(rainierHeight, seattleHeight);
    }
    
    geometry.computeVertexNormals();
    
    // Create a mixed terrain material
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x355E3B, // Forest green
        roughness: 0.8,
        metalness: 0.2
    });
    
    terrain = new THREE.Mesh(geometry, groundMaterial);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);
}

function createWater() {
    const waterGeometry = new THREE.PlaneGeometry(4000, 4000);
    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x004d99,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.8
    });
    
    water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -5;
    scene.add(water);
}

function createCity() {
    // Create Seattle-like skyline
    const buildingCount = 100;
    const cityRadius = 300;
    
    for (let i = 0; i < buildingCount; i++) {
        const height = Math.random() * 50 + 10;
        const width = Math.random() * 10 + 5;
        const depth = Math.random() * 10 + 5;
        
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        
        // Place buildings in a cluster
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * cityRadius;
        building.position.set(
            Math.cos(angle) * radius - 500, // City offset from runway
            height / 2,
            Math.sin(angle) * radius
        );
        
        building.castShadow = true;
        building.receiveShadow = true;
        scene.add(building);
        cityMeshes.push(building);
    }
    
    // Add Space Needle-like structure
    const spaceNeedleGeometry = new THREE.CylinderGeometry(2, 5, 100, 8);
    const spaceNeedleMaterial = new THREE.MeshStandardMaterial({
        color: 0xC0C0C0,
        metalness: 0.9,
        roughness: 0.1
    });
    const spaceNeedle = new THREE.Mesh(spaceNeedleGeometry, spaceNeedleMaterial);
    spaceNeedle.position.set(-500, 50, 0);
    spaceNeedle.castShadow = true;
    scene.add(spaceNeedle);
    
    // Add observation deck
    const deckGeometry = new THREE.CylinderGeometry(15, 15, 10, 16);
    const deck = new THREE.Mesh(deckGeometry, spaceNeedleMaterial);
    deck.position.set(-500, 95, 0);
    deck.castShadow = true;
    scene.add(deck);
}

function createForest() {
    const forestCount = 2000;
    const forestRadius = 2000;
    
    // Create evergreen tree geometry
    const treeGeometry = new THREE.ConeGeometry(5, 20, 8);
    const treeMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a472a, // Dark green
        roughness: 0.8
    });
    
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 6);
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x4d2600, // Brown
        roughness: 0.9
    });
    
    for (let i = 0; i < forestCount; i++) {
        const tree = new THREE.Group();
        
        // Create tree top
        const treeTop = new THREE.Mesh(treeGeometry, treeMaterial);
        treeTop.position.y = 12;
        treeTop.castShadow = true;
        tree.add(treeTop);
        
        // Create trunk
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Position tree
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * forestRadius;
        tree.position.set(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );
        
        // Don't place trees on runway or water
        if (tree.position.distanceTo(new THREE.Vector3(0, 0, 0)) > 150) {
            const heightScale = Math.random() * 0.5 + 0.7;
            tree.scale.set(heightScale, heightScale, heightScale);
            scene.add(tree);
            trees.push(tree);
        }
    }
}

function createClouds() {
    const cloudCount = 50;
    const cloudGeometry = new THREE.SphereGeometry(20, 8, 8);
    const cloudMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8
    });

    for (let i = 0; i < cloudCount; i++) {
        const cloudGroup = new THREE.Group();
        
        // Create multiple spheres for each cloud
        const sphereCount = Math.floor(Math.random() * 5) + 3;
        for (let j = 0; j < sphereCount; j++) {
            const sphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
            sphere.position.set(
                Math.random() * 40 - 20,
                Math.random() * 10,
                Math.random() * 40 - 20
            );
            sphere.scale.set(
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.3 + 0.3,
                Math.random() * 0.5 + 0.5
            );
            cloudGroup.add(sphere);
        }
        
        cloudGroup.position.set(
            Math.random() * 2000 - 1000,
            Math.random() * 200 + 200,
            Math.random() * 2000 - 1000
        );
        
        scene.add(cloudGroup);
        clouds.push(cloudGroup);
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

    // Update bullets
    if (aircraft.bullets) {
        aircraft.updateBullets(delta, scene);
    }
    
    // F-22 Lightning III style camera
    const idealOffset = new THREE.Vector3(-30, 15, 0);  // Closer view
    const idealLookat = new THREE.Vector3(10, 0, 0);
    
    // Smooth camera follow
    const currentPosition = new THREE.Vector3();
    currentPosition.copy(aircraft.mesh.position).add(idealOffset);
    camera.position.lerp(currentPosition, 0.1);
    
    const targetPosition = new THREE.Vector3();
    targetPosition.copy(aircraft.mesh.position).add(idealLookat);
    camera.lookAt(targetPosition);

    // Rotate camera based on roll (banking effect)
    camera.up.set(0, 1, 0);
    camera.up.applyAxisAngle(new THREE.Vector3(1, 0, 0), aircraft.roll * 0.5);

    // Animate clouds
    clouds.forEach(cloud => {
        cloud.position.x += delta * 5;
        if (cloud.position.x > 1000) cloud.position.x = -1000;
    });

    // Animate water with a simple wave effect
    if (water) {
        water.position.y = -5 + Math.sin(Date.now() * 0.001) * 0.5;
    }

    // Update HUD
    document.getElementById('speed').textContent = `Speed: ${Math.round(aircraft.speed)} knots`;
    document.getElementById('altitude').textContent = `Altitude: ${Math.round(aircraft.altitude)} ft`;
    document.getElementById('heading').textContent = `Heading: ${Math.round(aircraft.heading)}°`;

    // Update control position indicators
    const pitchElement = document.getElementById('pitch');
    const rollElement = document.getElementById('roll');
    const yawElement = document.getElementById('yaw');

    const pitchDegrees = Math.round(aircraft.pitch * 180 / Math.PI);
    const rollDegrees = Math.round(aircraft.roll * 180 / Math.PI);
    const yawDegrees = Math.round(aircraft.yaw * 180 / Math.PI);

    pitchElement.textContent = `Pitch: ${pitchDegrees}°`;
    rollElement.textContent = `Roll: ${rollDegrees}°`;
    yawElement.textContent = `Yaw: ${yawDegrees}°`;

    // Update classes based on control positions
    pitchElement.className = Math.abs(pitchDegrees) < 1 ? 'zero' : 'non-zero';
    rollElement.className = Math.abs(rollDegrees) < 1 ? 'zero' : 'non-zero';
    yawElement.className = Math.abs(yawDegrees) < 1 ? 'zero' : 'non-zero';

    renderer.render(scene, camera);
}

// Start the application
init(); 