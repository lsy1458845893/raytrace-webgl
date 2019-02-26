import GLData from "../src/GLData";

class Vector {

  public x: number;
  public y: number;
  public z: number;

  public static create(x: number, y: number, z: number) {
    return Object.assign(new Vector(), { x, y, z });
  }

  public changeByAxis(f: number, axis: 0 | 1 | 2): Vector {
    let v = [this.x, this.y, this.z];
    v[axis] = f;
    return Vector.create(v[0], v[1], v[2]);
  }
}

class Point extends Vector {

  constructor(public buffer: Float32Array, public index: number) {
    super();
  }

  public get x(): number { return this.buffer[this.index * 3 + 0]; }

  public get y(): number { return this.buffer[this.index * 3 + 1]; }

  public get z(): number { return this.buffer[this.index * 3 + 2]; }

  public getVector(): Vector { return Vector.create(this.x, this.y, this.z); }
}

interface DataVF {
  vertex: [number, number, number][];
  face: [number, number, number][];
}

interface AABBBox {
  min: Vector;
  max: Vector;
}

class PointTex {

  public buffer: Float32Array;

  public width: number;

  constructor(data: DataVF, public uploader: GLData) {
    this.width = Math.ceil(Math.sqrt(data.vertex.length + 1));
    this.buffer = new Float32Array(3 * this.width * this.width);
    for (let i = 1; i < data.vertex.length; i++) {
      this.buffer[3 * i + 0] = data.vertex[i - 1][0];
      this.buffer[3 * i + 1] = data.vertex[i - 1][1];
      this.buffer[3 * i + 2] = data.vertex[i - 1][2];
    }
  }

  public getPoint(index: number): Point { return new Point(this.buffer, index); }

  public upload(index: number) { this.uploader.upload(index, 3, this.buffer); }
}

class Triangle {

  constructor(public buffer: Uint32Array, public index: number, public points: PointTex) { }

  public get x(): Point { return this.points.getPoint(this.buffer[this.index * 3 + 0]); }

  public get y(): Point { return this.points.getPoint(this.buffer[this.index * 3 + 1]); }

  public get z(): Point { return this.points.getPoint(this.buffer[this.index * 3 + 2]); }

  public getAABBBox(): AABBBox {
    let { x, y, z } = this;
    let box = {
      max: Vector.create(Math.max(x.x, y.x, z.x), Math.max(x.y, y.y, z.y), Math.max(x.z, y.z, z.z)),
      min: Vector.create(Math.min(x.x, y.x, z.x), Math.min(x.y, y.y, z.y), Math.min(x.z, y.z, z.z)),
    };
    return box;
  }

}

class TriangleTex {

  public buffer: Uint32Array;

  public width: number;

  constructor(data: DataVF, public points: PointTex, public uploader: GLData) {
    this.width = Math.ceil(Math.sqrt(data.face.length + 1));
    this.buffer = new Uint32Array(3 * this.width * this.width);
    for (let i = 1; i < data.face.length + 1; i++) {
      this.buffer[3 * i + 0] = data.face[i - 1][0];
      this.buffer[3 * i + 1] = data.face[i - 1][1];
      this.buffer[3 * i + 2] = data.face[i - 1][2];
    }
  }

  public getTriangle(index: number): Triangle { return new Triangle(this.buffer, index, this.points); }

  public upload(index: number) { this.uploader.upload(index, 3, this.buffer); }
}

class TriangleSet {

  public array: number[] = [0];

  constructor(public uploader: GLData) { }

  public push(set: number[]): number {
    let ret = this.array.length;
    this.array.push(...set, 0);
    return ret;
  }

  public upload(index: number) {
    let width = Math.ceil(Math.sqrt(this.array.length));
    let buffer = new Uint32Array(width * width);
    for (let i = 0; i < this.array.length; i++)
      buffer[i] = this.array[i];
    this.uploader.upload(index, 1, buffer);
  }
}


export { DataVF, Vector, Point, PointTex, Triangle, TriangleTex, TriangleSet, AABBBox };
