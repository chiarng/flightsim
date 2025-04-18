class Controls {
    constructor(aircraft, scene) {
        this.aircraft = aircraft;
        this.scene = scene;
        this.keys = {
            w: false,
            s: false,
            a: false,
            d: false,
            q: false,
            e: false,
            up: false,
            down: false,
            space: false,
            z: false  // Add z key for zeroing controls
        };

        // Add event listeners
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(event) {
        switch(event.key.toLowerCase()) {
            case 'w':
                this.keys.w = true;
                break;
            case 's':
                this.keys.s = true;
                break;
            case 'a':
                this.keys.a = true;
                break;
            case 'd':
                this.keys.d = true;
                break;
            case 'q':
                this.keys.q = true;
                break;
            case 'e':
                this.keys.e = true;
                break;
            case 'arrowup':
                this.keys.up = true;
                break;
            case 'arrowdown':
                this.keys.down = true;
                break;
            case ' ':
                this.keys.space = true;
                break;
            case 'z':
                this.keys.z = true;
                break;
        }
        this.updateAircraft();
    }

    onKeyUp(event) {
        switch(event.key.toLowerCase()) {
            case 'w':
                this.keys.w = false;
                break;
            case 's':
                this.keys.s = false;
                break;
            case 'a':
                this.keys.a = false;
                break;
            case 'd':
                this.keys.d = false;
                break;
            case 'q':
                this.keys.q = false;
                break;
            case 'e':
                this.keys.e = false;
                break;
            case 'arrowup':
                this.keys.up = false;
                break;
            case 'arrowdown':
                this.keys.down = false;
                break;
            case ' ':
                this.keys.space = false;
                break;
            case 'z':
                this.keys.z = false;
                break;
        }
        this.updateAircraft();
    }

    updateAircraft() {
        // Update throttle with faster response
        if (this.keys.up) {
            this.aircraft.throttle = Math.min(1, this.aircraft.throttle + 0.05);
        }
        if (this.keys.down) {
            this.aircraft.throttle = Math.max(0, this.aircraft.throttle - 0.05);
        }
        // Auto-throttle to maintain speed when in the air
        if (this.aircraft.altitude > 50 && !this.keys.up && !this.keys.down) {
            this.aircraft.throttle = Math.max(0.3, this.aircraft.throttle);
        }

        // Keyboard controls with W=up, S=down
        if (this.keys.w) {
            this.aircraft.pitch += 0.1;
            this.aircraft.pitch = Math.min(Math.PI/3, this.aircraft.pitch);
        }
        if (this.keys.s) {
            this.aircraft.pitch -= 0.1;
            this.aircraft.pitch = Math.max(-Math.PI/3, this.aircraft.pitch);
        }
        if (this.keys.d) {
            this.aircraft.roll += 0.1;
            this.aircraft.roll = Math.min(Math.PI/2, this.aircraft.roll);
        }
        if (this.keys.a) {
            this.aircraft.roll -= 0.1;
            this.aircraft.roll = Math.max(-Math.PI/2, this.aircraft.roll);
        }

        // Yaw control with auto-coordination (helps with turning)
        if (this.keys.q) {
            this.aircraft.yaw += 0.1;
            this.aircraft.yaw = Math.min(Math.PI/4, this.aircraft.yaw);
        }
        if (this.keys.e) {
            this.aircraft.yaw -= 0.1;
            this.aircraft.yaw = Math.max(-Math.PI/4, this.aircraft.yaw);
        }

        // Smoothly return to zero when Z is pressed
        if (this.keys.z) {
            const returnRate = 0.1; // Rate at which controls return to zero
            this.aircraft.pitch *= (1 - returnRate);
            this.aircraft.roll *= (1 - returnRate);
            this.aircraft.yaw *= (1 - returnRate);
        }

        // Handle gatling gun firing
        if (this.keys.space && this.scene) {
            const bullet = this.aircraft.fireBullet();
            if (bullet) {
                this.scene.add(bullet);
            }
        }

        // Update bullets if they exist
        if (this.scene) {
            this.aircraft.updateBullets(1/60, this.scene);
        }
    }
} 