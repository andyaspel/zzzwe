class Color {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    toRgba() {
        return `rgba(${this.r * 255}, ${this.g * 255}, ${this.b * 255}, ${this.a})`;
    }

    withAlpha(a) {
        return new Color(this.r, this.g, this.b, a);
    }

    grayScale(t = 1.0) {
        let x = (this.r + this.g + this.b) / 3;
        return new Color(
            lerp(this.r, x, t),
            lerp(this.g, x, t),
            lerp(this.b, x, t),
            this.a);
    }

    static hex(hexcolor) {
        let matches =
            hexcolor.match(/#([0-9a-z]{2})([0-9a-z]{2})([0-9a-z]{2})/i);
        if (matches) {
            let [, r, g, b] = matches;
            return new Color(parseInt(r, 16) / 255.0,
                             parseInt(g, 16) / 255.0,
                             parseInt(b, 16) / 255.0,
                             1.0);
        } else {
            throw new Error(`Could not parse ${hexcolor} as color`);
        }
    }
}
