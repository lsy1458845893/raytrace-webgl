
class Vec4 {
    buffer: Float32Array
    constructor(dat?: number[] | Float32Array) {
        this.buffer = new Float32Array(4);
        if (dat) for (let i in this.buffer) this.buffer[i] = dat[i];
    }

    get x(): number { return this.buffer[0]; }
    set x(n: number) { this.buffer[0] = n; }
    
    get y(): number { return this.buffer[1]; }
    set y(n: number) { this.buffer[1] = n; }
    
    get z(): number { return this.buffer[2]; }
    set z(n: number) { this.buffer[2] = n; }

    get t(): number { return this.buffer[3]; }
    set t(n: number) { this.buffer[3] = n; }
}

class Vec3 {
    buffer: Float32Array
    constructor(dat?: number[] | Float32Array) {
        this.buffer = new Float32Array(3);
        if (dat) for (let i in this.buffer) this.buffer[i] = dat[i];
    }
    

    get x(): number { return this.buffer[0]; }
    set x(n: number) { this.buffer[0] = n; }
    
    get y(): number { return this.buffer[1]; }
    set y(n: number) { this.buffer[1] = n; }
    
    get z(): number { return this.buffer[2]; }
    set z(n: number) { this.buffer[2] = n; }
}

class Vec2 {
    buffer: Float32Array
    constructor(dat?: number[] | Float32Array) {
        this.buffer = new Float32Array(2);
        if (dat) for (let i in this.buffer) this.buffer[i] = dat[i];
    }

    get x(): number { return this.buffer[0]; }
    set x(n: number) { this.buffer[0] = n; }
    
    get y(): number { return this.buffer[1]; }
    set y(n: number) { this.buffer[1] = n; }
}

class Mat4 {
    buffer: Float32Array;

    constructor(dat?: number[] | Float32Array) {
        this.buffer = new Float32Array(16);
        if (dat) for (let i in this.buffer) this.buffer[i] = dat[i];
        else this.buffer[0] = this.buffer[5] = this.buffer[10] = this.buffer[15] = 1;
    }

    static I(): Mat4 {
        return new Mat4();
    }

    dot(a: Mat4 | Vec4): Mat4 | Vec4 {
        return Mat4.dot(this, a);
    }

    inverse(): Mat4 {
        return Mat4.inverse(this);
    }

    perspective(rad: number, aspect: number, near: number, far: number): Mat4 {
        return (this.dot(Mat4.perspective(rad, aspect, near, far)) as Mat4);
    }

    translation(x: number, y: number, z: number): Mat4 {
        return (this.dot(Mat4.translation(x, y, z)) as Mat4);
    }

    scale(x: number, y: number, z: number): Mat4 {
        return (this.dot(Mat4.scale(x, y, z)) as Mat4);
    }

    rotation_x(rad: number): Mat4 {
        return (this.dot(Mat4.rotation_x(rad)) as Mat4);
    }

    rotation_y(rad: number): Mat4 {
        return (this.dot(Mat4.rotation_y(rad)) as Mat4);
    }

    rotation_z(rad: number): Mat4 {
        return (this.dot(Mat4.rotation_z(rad)) as Mat4);
    }

    transpose(): Mat4 {
        let m = new Mat4(this.buffer);
        let buf = m.buffer;
        let t: number;

        t = buf[1]; buf[1] = buf[4]; buf[4] = t;
        t = buf[2]; buf[2] = buf[8]; buf[8] = t;
        t = buf[6]; buf[6] = buf[9]; buf[9] = t;

        t = buf[3]; buf[3] = buf[12]; buf[12] = t;
        t = buf[7]; buf[7] = buf[13]; buf[13] = t;
        t = buf[11]; buf[11] = buf[14]; buf[14] = t;
        return m;
    }

    static dot(ma: Mat4, mb: Mat4 | Vec4): Mat4 | Vec4 {
        if (mb instanceof Mat4) {
            let md = new Mat4();
            let a = ma.buffer;
            let b = mb.buffer;
            let d = md.buffer;
            d[0] = b[0 * 4 + 0] * a[0 * 4 + 0] + b[0 * 4 + 1] * a[1 * 4 + 0] + b[0 * 4 + 2] * a[2 * 4 + 0] + b[0 * 4 + 3] * a[3 * 4 + 0];
            d[1] = b[0 * 4 + 0] * a[0 * 4 + 1] + b[0 * 4 + 1] * a[1 * 4 + 1] + b[0 * 4 + 2] * a[2 * 4 + 1] + b[0 * 4 + 3] * a[3 * 4 + 1];
            d[2] = b[0 * 4 + 0] * a[0 * 4 + 2] + b[0 * 4 + 1] * a[1 * 4 + 2] + b[0 * 4 + 2] * a[2 * 4 + 2] + b[0 * 4 + 3] * a[3 * 4 + 2];
            d[3] = b[0 * 4 + 0] * a[0 * 4 + 3] + b[0 * 4 + 1] * a[1 * 4 + 3] + b[0 * 4 + 2] * a[2 * 4 + 3] + b[0 * 4 + 3] * a[3 * 4 + 3];
            d[4] = b[1 * 4 + 0] * a[0 * 4 + 0] + b[1 * 4 + 1] * a[1 * 4 + 0] + b[1 * 4 + 2] * a[2 * 4 + 0] + b[1 * 4 + 3] * a[3 * 4 + 0];
            d[5] = b[1 * 4 + 0] * a[0 * 4 + 1] + b[1 * 4 + 1] * a[1 * 4 + 1] + b[1 * 4 + 2] * a[2 * 4 + 1] + b[1 * 4 + 3] * a[3 * 4 + 1];
            d[6] = b[1 * 4 + 0] * a[0 * 4 + 2] + b[1 * 4 + 1] * a[1 * 4 + 2] + b[1 * 4 + 2] * a[2 * 4 + 2] + b[1 * 4 + 3] * a[3 * 4 + 2];
            d[7] = b[1 * 4 + 0] * a[0 * 4 + 3] + b[1 * 4 + 1] * a[1 * 4 + 3] + b[1 * 4 + 2] * a[2 * 4 + 3] + b[1 * 4 + 3] * a[3 * 4 + 3];
            d[8] = b[2 * 4 + 0] * a[0 * 4 + 0] + b[2 * 4 + 1] * a[1 * 4 + 0] + b[2 * 4 + 2] * a[2 * 4 + 0] + b[2 * 4 + 3] * a[3 * 4 + 0];
            d[9] = b[2 * 4 + 0] * a[0 * 4 + 1] + b[2 * 4 + 1] * a[1 * 4 + 1] + b[2 * 4 + 2] * a[2 * 4 + 1] + b[2 * 4 + 3] * a[3 * 4 + 1];
            d[10] = b[2 * 4 + 0] * a[0 * 4 + 2] + b[2 * 4 + 1] * a[1 * 4 + 2] + b[2 * 4 + 2] * a[2 * 4 + 2] + b[2 * 4 + 3] * a[3 * 4 + 2];
            d[11] = b[2 * 4 + 0] * a[0 * 4 + 3] + b[2 * 4 + 1] * a[1 * 4 + 3] + b[2 * 4 + 2] * a[2 * 4 + 3] + b[2 * 4 + 3] * a[3 * 4 + 3];
            d[12] = b[3 * 4 + 0] * a[0 * 4 + 0] + b[3 * 4 + 1] * a[1 * 4 + 0] + b[3 * 4 + 2] * a[2 * 4 + 0] + b[3 * 4 + 3] * a[3 * 4 + 0];
            d[13] = b[3 * 4 + 0] * a[0 * 4 + 1] + b[3 * 4 + 1] * a[1 * 4 + 1] + b[3 * 4 + 2] * a[2 * 4 + 1] + b[3 * 4 + 3] * a[3 * 4 + 1];
            d[14] = b[3 * 4 + 0] * a[0 * 4 + 2] + b[3 * 4 + 1] * a[1 * 4 + 2] + b[3 * 4 + 2] * a[2 * 4 + 2] + b[3 * 4 + 3] * a[3 * 4 + 2];
            d[15] = b[3 * 4 + 0] * a[0 * 4 + 3] + b[3 * 4 + 1] * a[1 * 4 + 3] + b[3 * 4 + 2] * a[2 * 4 + 3] + b[3 * 4 + 3] * a[3 * 4 + 3];
            return md;
        } else {
            let a = ma.buffer;
            let b = mb.buffer;
            let vd = new Vec4();
            let d = vd.buffer;
            d[0] = b[0] * a[0 * 4 + 0] + b[1] * a[1 * 4 + 0] + b[2] * a[2 * 4 + 0] + b[3] * a[3 * 4 + 0];
            d[1] = b[0] * a[0 * 4 + 1] + b[1] * a[1 * 4 + 1] + b[2] * a[2 * 4 + 1] + b[3] * a[3 * 4 + 1];
            d[2] = b[0] * a[0 * 4 + 2] + b[1] * a[1 * 4 + 2] + b[2] * a[2 * 4 + 2] + b[3] * a[3 * 4 + 2];
            d[3] = b[0] * a[0 * 4 + 3] + b[1] * a[1 * 4 + 3] + b[2] * a[2 * 4 + 3] + b[3] * a[3 * 4 + 3];
            return vd;
        }
    }

    static inverse(ma: Mat4): Mat4 {
        let a = ma.buffer;
        function mat2_negative(a: number[]): number[] {
            let mat = new Array(4);
            for (let i = 0; i < 4; i++)
                mat[i] = -a[i];
            return mat;
        };
        function mat2_inverse(a: number[]): number[] {
            let mat = new Array(4);
            let div = a[0] * a[3] - a[1] * a[2];
            mat[0] = a[3] / div;
            mat[1] = -a[1] / div;
            mat[2] = -a[2] / div;
            mat[3] = a[0] / div;
            return mat;
        };
        function mat2_add_mat2(a: number[], b: number[]): number[] {
            let mat = new Array(4);
            for (let i = 0; i < 4; i++)
                mat[i] = a[i] + b[i];
            return mat;
        };
        function mat2_sub_mat2(a: number[], b: number[]): number[] {
            let mat = new Array(4);
            for (let i = 0; i < 4; i++)
                mat[i] = a[i] - b[i];
            return mat;
        };
        function mat2_mul_mat2(a: number[], b: number[]): number[] {
            let mat = new Array(4);
            mat[0] = a[0] * b[0] + a[1] * b[2];
            mat[1] = a[0] * b[1] + a[1] * b[3];
            mat[2] = a[2] * b[0] + a[3] * b[2];
            mat[3] = a[2] * b[1] + a[3] * b[3];
            return mat;
        };
        let A = [a[0], a[1], a[4], a[5]];
        let B = [a[2], a[3], a[6], a[7]];
        let C = [a[8], a[9], a[12], a[13]];
        let D = [a[10], a[11], a[14], a[15]];
        let A_ = mat2_inverse(A);
        let CA = mat2_mul_mat2(C, A_);
        let AB = mat2_mul_mat2(A_, B);
        let CAB = mat2_mul_mat2(CA, B);
        let DCAB = mat2_inverse(mat2_sub_mat2(D, CAB));
        let _A = mat2_add_mat2(A_, mat2_mul_mat2(AB, mat2_mul_mat2(DCAB, CA)));
        let _B = mat2_negative(mat2_mul_mat2(AB, DCAB));
        let _C = mat2_negative(mat2_mul_mat2(DCAB, CA));
        let _D = DCAB;

        return new Mat4([
            _A[0], _A[1], _B[0], _B[1],
            _A[2], _A[3], _B[2], _B[3],
            _C[0], _C[1], _D[0], _D[1],
            _C[2], _C[3], _D[2], _D[3]
        ]);
    }

    static perspective(rad: number, aspect: number, near: number, far: number): Mat4 {
        let f = Math.tan(Math.PI * 0.5 - 0.5 * rad);
        let inv = 1.0 / (near - far);

        return new Mat4([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * inv, -1,
            0, 0, near * far * inv * 2, 0
        ]);
    }

    static translation(x: number, y: number, z: number): Mat4 {
        return new Mat4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ]);
    }

    static scale(x: number, y: number, z: number): Mat4 {
        var dst = new Mat4();
        dst.buffer[0] = x;
        dst.buffer[5] = y;
        dst.buffer[10] = z;
        return dst;
    }

    static rotation_x(rad: number): Mat4 {
        let c = Math.cos(rad);
        let s = Math.sin(rad);

        return new Mat4([
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        ]);
    }

    static rotation_y(rad: number): Mat4 {
        let c = Math.cos(rad);
        let s = Math.sin(rad);

        return new Mat4([
            c, 0, s, 0,
            0, 1, 0, 0,
            -s, 0, c, 0,
            0, 0, 0, 1
        ]);
    }

    static rotation_z(rad: number): Mat4 {
        let c = Math.cos(rad);
        let s = Math.sin(rad);

        return new Mat4([
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }
}

export { Vec2, Vec3, Vec4, Mat4 };
