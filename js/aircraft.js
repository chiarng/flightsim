class Aircraft {
    constructor() {
        // Create main fuselage
        const fuselageGeometry = new THREE.CylinderGeometry(0.3, 0.3, 6, 8);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            metalness: 0.8,
            roughness: 0.2
        });
        this.mesh = new THREE.Mesh(fuselageGeometry, material);
        this.mesh.rotation.x = Math.PI / 2; // Rotate to align with flight direction
        
        // Add cockpit
        const cockpitGeometry = new THREE.BoxGeometry(0.8, 0.4, 0.8);
        const cockpitMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            metalness: 0.9,
            roughness: 0.1
        });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.set(0, 0.2, 2);
        this.mesh.add(cockpit);

        // Add wings
        const wingGeometry = new THREE.BoxGeometry(8, 0.1, 2);
        const wingMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            metalness: 0.8,
            roughness: 0.2
        });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.y = -0.1;
        this.mesh.add(wings);

        // Add tail fins
        const tailGeometry = new THREE.BoxGeometry(0.5, 1.5, 0.1);
        const tailMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            metalness: 0.8,
            roughness: 0.2
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.set(0, 0.5, -2.5);
        this.mesh.add(tail);

        // Add vertical stabilizers
        const stabilizerGeometry = new THREE.BoxGeometry(0.1, 1.2, 1);
        const stabilizerMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            metalness: 0.8,
            roughness: 0.2
        });
        const leftStabilizer = new THREE.Mesh(stabilizerGeometry, stabilizerMaterial);
        leftStabilizer.position.set(-1.5, 0.5, -2);
        leftStabilizer.rotation.z = Math.PI / 4;
        this.mesh.add(leftStabilizer);

        const rightStabilizer = new THREE.Mesh(stabilizerGeometry, stabilizerMaterial);
        rightStabilizer.position.set(1.5, 0.5, -2);
        rightStabilizer.rotation.z = -Math.PI / 4;
        this.mesh.add(rightStabilizer);

        // Flight parameters
        this.speed = 0;
        this.maxSpeed = 2000; // Increased max speed
        this.throttle = 0;
        this.pitch = 0;
        this.roll = 0;
        this.yaw = 0;
        this.position = this.mesh.position;
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.heading = 0;
        this.altitude = 0;
    }

    update(delta) {
        // Update throttle and speed with more realistic acceleration
        const targetSpeed = this.throttle * this.maxSpeed;
        this.speed += (targetSpeed - this.speed) * 0.1 * delta;
        
        // Calculate forces with more realistic physics
        const airDensity = Math.exp(-this.position.y / 10000); // Decreases with altitude
        const liftCoefficient = Math.sin(this.pitch) * 0.5;
        const dragCoefficient = 0.01 + Math.abs(this.pitch) * 0.1;
        
        // Calculate lift and drag forces
        const lift = new THREE.Vector3(
            0,
            liftCoefficient * this.speed * this.speed * airDensity * 0.0001,
            0
        );
        
        const drag = new THREE.Vector3(
            -this.velocity.x * dragCoefficient * airDensity,
            -this.velocity.y * dragCoefficient * airDensity,
            -this.velocity.z * dragCoefficient * airDensity
        );
        
        // Apply thrust
        const thrust = new THREE.Vector3(0, 0, this.speed * 0.01);
        thrust.applyQuaternion(this.mesh.quaternion);
        
        // Apply forces
        this.acceleration.copy(lift).add(drag).add(thrust);
        this.velocity.add(this.acceleration.multiplyScalar(delta));
        this.position.add(this.velocity.multiplyScalar(delta));

        // Update rotation with more realistic control response
        const controlResponse = this.speed / this.maxSpeed;
        this.mesh.rotation.x = this.pitch;
        this.mesh.rotation.z = this.roll;
        this.mesh.rotation.y = this.yaw;

        // Update heading
        this.heading = (this.mesh.rotation.y * 180 / Math.PI) % 360;
        if (this.heading < 0) this.heading += 360;

        // Apply gravity with altitude-dependent effect
        const gravity = 9.81 * delta * (1 - airDensity);
        this.velocity.y -= gravity;

        // Ground collision
        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y = 0;
            this.speed *= 0.95; // Friction when on ground
        }

        // Update altitude
        this.altitude = this.position.y * 3.28084; // Convert to feet
    }
} 