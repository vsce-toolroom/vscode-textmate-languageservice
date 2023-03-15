class Pet {
    public locale: string;
    public name: string;
    public order: string;
    public age: number;
    public tameable: boolean;
    public constructor(name: string, age: number, order: string, tameable: boolean) {
        this.locale = (navigator || {}).language;
        this.name = name;
        this.order = order;
        this.age = age;
        this.tameable = tameable;
    }
    public copy(): Required<Record<keyof Pet, string | number | boolean>> {
		return JSON.parse(JSON.stringify(this));
	}
    public noise(hours: number): void {
        console.log("Grunt");
    }
    public move(meters: number): void {
        console.log(`${this.name} moved ${meters.toString()}m.`);
    }
    public sleep(hours: number): void {
        console.log(`${this.name} slept for ${hours.toString()}.`);
    }
};
