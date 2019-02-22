
const cav = document.getElementById('cav') as HTMLCanvasElement;
const ctx = cav.getContext('webgl2') as WebGL2RenderingContext;

import compile_program from '../src/GLProgram';
import vertex_src from './ray.vs.glsl';
import fragment_src from './mesh-data.fs.glsl';

const shader = compile_program(ctx, vertex_src, fragment_src);

const u_view_port = ctx.getUniformLocation(shader, 'u_view_port');
const u_view_pos = ctx.getUniformLocation(shader, 'u_view_pos');
const u_view_dir = ctx.getUniformLocation(shader, 'u_view_dir');
const u_view_dir_mat = ctx.getUniformLocation(shader, 'u_view_dir_mat');
import { PointerLockedUserView } from '../src/UserView';
const view = new PointerLockedUserView(cav, document);
import GLData from "../src/GLData";

ctx.useProgram(shader);

import _cube from "../data/cube.json";
{
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
  let cube: DataVF = _cube;
  let points = new PointTex(cube, new GLData(ctx, shader, "_points"));
  let triangles = new TriangleTex(cube, points, new GLData(ctx, shader, "_triangles"));
  let triangleSetTex = new TriangleSet(new GLData(ctx, shader, "_triangle_set"));
  let triangleSet: number[] = [];
  for (let i = 0; i < cube.face.length; i++)
    triangleSet.push(i + 1);
  triangleSetTex.push(triangleSet);
  points.upload(0);
  console.log("points.upload(0);", points.width);
  triangles.upload(1);
  console.log("triangles.upload(1);", triangles.width);
  triangleSetTex.upload(2);
  console.log("triangleSetTex.upload(2);");
}

let update = true;

view.onChange = () => update = true;

view.onRefersh = dt => {
  if (update) {
    const width = cav.width, height = cav.height;
    ctx.uniform2f(u_view_port, width / 1000, height / 1000);
    ctx.viewport(0, 0, width, height);

    ctx.uniform3fv(u_view_pos, view.position.buffer);
    ctx.uniform3fv(u_view_dir, view.direction.buffer);

    ctx.uniformMatrix4fv(u_view_dir_mat, false, view.direction_inverse.buffer);

    ctx.drawArrays(ctx.TRIANGLES, 0, 6);
    update = false;
  }
  return true;
};

view.start();
