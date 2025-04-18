class Aircraft {
    constructor() {
        this.mesh = new THREE.Group();
        
        // Materials
        const mainMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080, // Light gray
            metalness: 0.7,
            roughness: 0.3
        });
        
        // Create main fuselage
        const fuselageGeometry = new THREE.CylinderGeometry(0.7, 0.5, 14, 8);
        const fuselage = new THREE.Mesh(fuselageGeometry, mainMaterial);
        fuselage.rotation.z = Math.PI / 2;
        this.mesh.add(fuselage);

        // Add nose cone
        const noseGeometry = new THREE.ConeGeometry(0.5, 3, 8);
        const nose = new THREE.Mesh(noseGeometry, mainMaterial);
        nose.rotation.z = -Math.PI / 2;
        nose.position.x = 8.5;
        this.mesh.add(nose);

        // Create right wing shape (swept back)
        const rightWingShape = new THREE.Shape();
        rightWingShape.moveTo(0, 0);      // Root (near fuselage)
        rightWingShape.lineTo(-8, 0);     // Tip (swept back)
        rightWingShape.lineTo(0, 3);      // Back edge
        rightWingShape.lineTo(0, 0);      // Close the shape

        // Create left wing shape (mirrored)
        const leftWingShape = new THREE.Shape();
        leftWingShape.moveTo(0, 0);       // Root (near fuselage)
        leftWingShape.lineTo(-8, 0);      // Tip (swept back)
        leftWingShape.lineTo(0, -3);      // Back edge (negative to mirror)
        leftWingShape.lineTo(0, 0);       // Close the shape

        // Create wing extrusion settings
        const extrudeSettings = {
            steps: 1,
            depth: 0.5,  // Wing thickness
            bevelEnabled: false
        };

        const rightWingGeometry = new THREE.ExtrudeGeometry(rightWingShape, extrudeSettings);
        const leftWingGeometry = new THREE.ExtrudeGeometry(leftWingShape, extrudeSettings);
        
        // Left wing
        const leftWing = new THREE.Mesh(leftWingGeometry, mainMaterial);
        leftWing.position.set(-4, 0, -1.5);  // Center the wing and position on left side
        leftWing.rotation.x = Math.PI / 2;   // Make it horizontal
        leftWing.rotation.y = Math.PI;       // Flip to point backwards
        this.mesh.add(leftWing);

        // Right wing
        const rightWing = new THREE.Mesh(rightWingGeometry, mainMaterial);
        rightWing.position.set(-4, 0, 1.5);  // Center the wing and position on right side
        rightWing.rotation.x = Math.PI / 2;  // Make it horizontal
        rightWing.rotation.y = Math.PI;      // Flip to point backwards
        this.mesh.add(rightWing);

        // Add vertical stabilizers
        const stabGeometry = new THREE.BoxGeometry(2.5, 2, 0.2);
        
        // Left stabilizer
        const leftStab = new THREE.Mesh(stabGeometry, mainMaterial);
        leftStab.position.set(-6, 1, 1.2);
        leftStab.rotation.y = Math.PI / 6;
        this.mesh.add(leftStab);

        // Right stabilizer
        const rightStab = new THREE.Mesh(stabGeometry, mainMaterial);
        rightStab.position.set(-6, 1, -1.2);
        rightStab.rotation.y = -Math.PI / 6;
        this.mesh.add(rightStab);

        // Add horizontal stabilizers
        const hStabGeometry = new THREE.BoxGeometry(2, 0.2, 4);
        const hStab = new THREE.Mesh(hStabGeometry, mainMaterial);
        hStab.position.set(-6, 0.5, 0);
        this.mesh.add(hStab);

        // Add cockpit
        const canopyGeometry = new THREE.BoxGeometry(3, 0.8, 1.5);
        const canopyMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.7
        });
        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
        canopy.position.set(3, 0.8, 0);
        this.mesh.add(canopy);

        // Add gatling gun
        const gunMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.9,
            roughness: 0.1
        });
        const gunGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8);
        this.gun = new THREE.Mesh(gunGeometry, gunMaterial);
        this.gun.rotation.z = Math.PI / 2;
        this.gun.position.set(7, -0.5, 0);
        this.mesh.add(this.gun);

        // Bullet system
        this.bullets = [];
        this.lastShotTime = 0;
        this.bulletMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });

        // Add engine nozzles
        const nozzleGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1, 8);
        const nozzleMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.9,
            roughness: 0.1
        });

        // Left nozzle
        const leftNozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
        leftNozzle.position.set(-7.5, 0, -0.8);
        leftNozzle.rotation.z = Math.PI / 2;
        this.mesh.add(leftNozzle);

        // Right nozzle
        const rightNozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
        rightNozzle.position.set(-7.5, 0, 0.8);
        rightNozzle.rotation.z = Math.PI / 2;
        this.mesh.add(rightNozzle);

        // Add air intakes
        const intakeGeometry = new THREE.BoxGeometry(3, 0.8, 0.5);
        const intakeMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.8,
            roughness: 0.2
        });

        // Left intake
        const leftIntake = new THREE.Mesh(intakeGeometry, intakeMaterial);
        leftIntake.position.set(2, -0.2, -1.5);
        this.mesh.add(leftIntake);

        // Right intake
        const rightIntake = new THREE.Mesh(intakeGeometry, intakeMaterial);
        rightIntake.position.set(2, -0.2, 1.5);
        this.mesh.add(rightIntake);

        // Set initial position
        this.mesh.position.set(0, 1, 0);
        this.mesh.scale.set(1.5, 1.5, 1.5); // Slightly larger

        // Flight parameters
        this.speed = 0;
        this.maxSpeed = 1500;
        this.throttle = 0;
        this.pitch = 0;
        this.roll = 0;
        this.yaw = 0;
        this.position = this.mesh.position;
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.heading = 0;
        this.altitude = 0;
        
        // Add contrails
        this.contrails = [];
        for (let i = 0; i < 2; i++) {
            const trail = new THREE.Points(
                new THREE.BufferGeometry(),
                new THREE.PointsMaterial({
                    color: 0xffffff,
                    size: 0.1,
                    transparent: true,
                    opacity: 0.5
                })
            );
            this.contrails.push(trail);
            this.mesh.add(trail);
        }
    }

    fireBullet() {
        const now = Date.now();
        if (now - this.lastShotTime < 100) return; // Fire rate limit: 10 shots per second
        
        const bulletGeometry = new THREE.SphereGeometry(0.3, 8, 8);  // Increased from 0.1 to 0.3
        const bullet = new THREE.Mesh(bulletGeometry, this.bulletMaterial);
        
        // Position bullet at gun position
        bullet.position.copy(this.gun.getWorldPosition(new THREE.Vector3()));
        
        // Set bullet direction based on aircraft's forward direction
        const direction = new THREE.Vector3(1, 0, 0);
        direction.applyQuaternion(this.mesh.quaternion);
        
        // Add bullet to scene
        this.bullets.push({
            mesh: bullet,
            velocity: direction.multiplyScalar(10), // Bullet speed
            created: now
        });
        
        this.lastShotTime = now;
        return bullet;
    }

    updateBullets(delta, scene) {
        const now = Date.now();
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            // Update bullet position
            bullet.mesh.position.add(bullet.velocity.clone().multiplyScalar(delta));
            
            // Remove bullets after 2 seconds or if they're too far
            if (now - bullet.created > 2000 || 
                bullet.mesh.position.distanceTo(this.mesh.position) > 1000) {
                scene.remove(bullet.mesh);
                this.bullets.splice(i, 1);
            }
        }
    }

    update(delta) {
        // Update throttle and speed with more arcade-style acceleration
        const targetSpeed = this.throttle * this.maxSpeed;
        this.speed += (targetSpeed - this.speed) * delta * 2;
        
        // Calculate forces with more forgiving physics
        const airDensity = Math.exp(-this.position.y / 10000);
        
        // Enhanced lift calculation based on angle of attack
        const angleOfAttack = Math.abs(this.pitch);
        const liftCoefficient = 1.5 + Math.sin(angleOfAttack) * 2.0;
        const dragCoefficient = 0.001 + Math.pow(angleOfAttack, 2) * 0.05;
        
        // Calculate lift vector based on aircraft's orientation
        const liftDirection = new THREE.Vector3(0, 1, 0);
        liftDirection.applyQuaternion(this.mesh.quaternion);
        const liftForce = liftDirection.multiplyScalar(
            liftCoefficient * this.speed * airDensity * 0.3
        );
        
        // Calculate drag
        const drag = new THREE.Vector3(
            -this.velocity.x * dragCoefficient,
            -this.velocity.y * dragCoefficient,
            -this.velocity.z * dragCoefficient
        );
        
        // Apply thrust in the direction the aircraft is facing
        const thrustVector = new THREE.Vector3(1, 0, 0);
        thrustVector.applyQuaternion(this.mesh.quaternion);
        const thrust = thrustVector.multiplyScalar(this.speed * 0.5); // Increased thrust multiplier
        
        // Apply forces
        this.acceleration.copy(liftForce).add(drag).add(thrust);
        this.velocity.add(this.acceleration.multiplyScalar(delta));
        
        // Update position with more movement
        this.position.add(this.velocity.multiplyScalar(delta * 2)); // Increased movement speed

        // Handle rotation using quaternions
        const pitchQuat = new THREE.Quaternion();
        pitchQuat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -this.pitch * delta * 2);
        
        const yawQuat = new THREE.Quaternion();
        yawQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw * delta * 2);
        
        const rollQuat = new THREE.Quaternion();
        rollQuat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.roll * delta * 2);
        
        // Apply rotations directly
        this.mesh.quaternion.multiply(rollQuat);
        this.mesh.quaternion.multiply(pitchQuat);
        this.mesh.quaternion.multiply(yawQuat);
        
        // Normalize the quaternion to prevent drift
        this.mesh.quaternion.normalize();

        // Update heading based on aircraft's forward direction
        const forward = new THREE.Vector3(1, 0, 0);
        forward.applyQuaternion(this.mesh.quaternion);
        this.heading = (Math.atan2(forward.z, forward.x) * 180 / Math.PI) % 360;
        if (this.heading < 0) this.heading += 360;

        // Apply gravity with less effect at high speeds
        const gravityReduction = Math.min(1, this.speed / 100);
        const gravity = 9.81 * delta * (1 - gravityReduction * 0.8);
        this.velocity.y -= gravity;

        // Ground collision with bounce
        if (this.position.y < 1) {
            this.position.y = 1;
            if (this.velocity.y < 0) {
                this.velocity.y = Math.abs(this.velocity.y * 0.3);
            }
            
            if (Math.abs(this.pitch) > 0.8 || Math.abs(this.roll) > 0.8) {
                this.speed = 0;
                this.velocity.set(0, 0, 0);
                console.log("Crash! Bad landing angle.");
            }
        }

        // Minimum speed for lift (stall speed)
        const stallSpeed = 20;
        if (this.speed < stallSpeed && this.position.y > 1) {
            this.velocity.y -= gravity;
        }

        // Update altitude
        this.altitude = this.position.y * 3.28084;
    }
} 