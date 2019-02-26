import GLData from "./GLData";

interface Vector {
  x: number;
  y: number;
  z: number;
}

interface DataTexture<T> {
  push(v: T): number;
  upload(index: number): void;
}


class PointTexture implements DataTexture<Vector> {
  private array: Vector[] = [{ x: 0, y: 0, z: 0 }];

  constructor(private uploader: GLData) { }

  public push(vertex: Vector): number {
    return this.array.push(vertex) - 1;
  }

  public upload(index: number): void {
    let width = Math.ceil(Math.sqrt(this.array.length));
    let buffer = new Float32Array(width * width);
    for (let i = 1; i < this.array.length; i++) {
      buffer[3 * i + 0] = this.array[i - 1].x;
      buffer[3 * i + 1] = this.array[i - 1].y;
      buffer[3 * i + 2] = this.array[i - 1].z;
    }
    this.uploader.upload(index, 3, buffer);
  }

  public fromArray(array: Vector[], uploader: GLData) {
    return;
  }
}

class NormalTexture implements DataTexture<Vector> {
  private array: Vector[] = [{ x: 0, y: 0, z: 0 }];

  constructor(private uploader: GLData) { }

  public push(vertex: Vector): number {
    return this.array.push(vertex) - 1;
  }

  public upload(index: number): void {
    let width = Math.ceil(Math.sqrt(this.array.length));
    let buffer = new Float32Array(width * width);
    for (let i = 1; i < this.array.length; i++) {
      buffer[3 * i + 0] = this.array[i - 1].x;
      buffer[3 * i + 1] = this.array[i - 1].y;
      buffer[3 * i + 2] = this.array[i - 1].z;
    }
    this.uploader.upload(index, 3, buffer);
  }
}

class TriangleTexture implements DataTexture<Vector> {
  private array: Vector[] = [{ x: 0, y: 0, z: 0 }];

  constructor(private uploader: GLData) { }

  public push(points: Vector): number {
    return this.array.push(points) - 1;
  }

  public upload(index: number): void {
    let width = Math.ceil(Math.sqrt(this.array.length));
    let buffer = new Uint32Array(width * width);
    for (let i = 1; i < this.array.length; i++) {
      buffer[3 * i + 0] = this.array[i - 1].x;
      buffer[3 * i + 1] = this.array[i - 1].y;
      buffer[3 * i + 2] = this.array[i - 1].z;
    }
    this.uploader.upload(index, 3, buffer);
  }
}

class TriangleSetTexture implements DataTexture<number[]> {
  private array: number[] = [0];

  constructor(private uploader: GLData) { }

  public push(triangles: number[]): number {
    let index = this.array.length;
    this.array.push(...triangles, 0);
    return index;
  }

  public upload(index: number): void {
    let width = Math.ceil(Math.sqrt(this.array.length));
    let buffer = new Uint32Array(width * width);
    for (let i = 0; i < this.array.length; i++)
      buffer[i] = this.array[i];
    this.uploader.upload(index, 1, buffer);
  }
}

export {
  Vector,
  DataTexture,
  PointTexture,
  NormalTexture,
  TriangleTexture,
  TriangleSetTexture,
};
