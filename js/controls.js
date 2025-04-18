class Controls {
    constructor(aircraft) {
        this.aircraft = aircraft;
        this.keys = {
            w: false,
            s: false,
            a: false,
            d: false,
            q: false,
            e: false,
            up: false,
            down: false,
            space: false
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
        }
        this.updateAircraft();
    }

    updateAircraft() {
        // Update throttle
        if (this.keys.up) {
            this.aircraft.throttle = Math.min(1, this.aircraft.throttle + 0.01);
        }
        if (this.keys.down) {
            this.aircraft.throttle = Math.max(0, this.aircraft.throttle - 0.01);
        }

        // Update pitch
        if (this.keys.w) {
            this.aircraft.pitch = Math.min(Math.PI / 4, this.aircraft.pitch + 0.01);
        }
        if (this.keys.s) {
            this.aircraft.pitch = Math.max(-Math.PI / 4, this.aircraft.pitch - 0.01);
        }

        // Update roll
        if (this.keys.a) {
            this.aircraft.roll = Math.min(Math.PI / 4, this.aircraft.roll + 0.01);
        }
        if (this.keys.d) {
            this.aircraft.roll = Math.max(-Math.PI / 4, this.aircraft.roll - 0.01);
        }

        // Update yaw
        if (this.keys.q) {
            this.aircraft.yaw = Math.min(Math.PI / 4, this.aircraft.yaw + 0.01);
        }
        if (this.keys.e) {
            this.aircraft.yaw = Math.max(-Math.PI / 4, this.aircraft.yaw - 0.01);
        }

        // Handle missile firing
        if (this.keys.space) {
            // Add missile firing logic here
            console.log('Missile fired!');
        }
    }
} 