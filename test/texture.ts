
const cav = document.getElementById('cav') as HTMLCanvasElement;
const ctx = cav.getContext('webgl2') as WebGL2RenderingContext;

import compile_program from '../src/GLProgram';
import vertex_src from './ray.vs.glsl';
import fragment_src from './texture.fs.glsl';

const shader = compile_program(ctx, vertex_src, fragment_src);


const u_view_port = ctx.getUniformLocation(shader, 'u_view_port');
const u_view_pos = ctx.getUniformLocation(shader, 'u_view_pos');
const u_view_dir = ctx.getUniformLocation(shader, 'u_view_dir');
const u_view_dir_mat = ctx.getUniformLocation(shader, 'u_view_dir_mat');
import { PointerLockedUserView } from '../src/UserView';
const view = new PointerLockedUserView(cav, document);

class vec3 {
  constructor(public x: number, public y: number, public z: number) { }

  modify(f: number, i: number): vec3 {
    let v = [this.x, this.y, this.z];
    v[i] = f;
    return new vec3(v[0], v[1], v[2]);
  }

  index(i: number): number { return [this.x, this.y, this.z][i]; }
}

class PointTex {
  private _points: WebGLUniformLocation;
  private _points_width: WebGLUniformLocation;
  private texture: WebGLTexture;
  public buffer: vec3[];
  constructor(private ctx: WebGL2RenderingContext, shader: WebGLProgram) {
    this._points = ctx.getUniformLocation(shader, "_points");
    this._points_width = ctx.getUniformLocation(shader, "_points_width");
    this.buffer = [new vec3(0, 0, 0)];
    this.texture = ctx.createTexture();
  }

  public push(pos: vec3): number { return this.buffer.push(pos) - 1; }

  public upload(index: number = 0) {
    let width = Math.ceil(Math.sqrt(this.buffer.length));
    this.ctx.uniform1ui(this._points_width, width);
    let buffer = new Float32Array((this.buffer.length) * 3);
    for (let i = 0; i < this.buffer.length; i++) {
      buffer[3 * i + 0] = this.buffer[i].x;
      buffer[3 * i + 1] = this.buffer[i].y;
      buffer[3 * i + 2] = this.buffer[i].z;
    }
    this.ctx.activeTexture(this.ctx.TEXTURE0 + index);
    this.ctx.bindTexture(this.ctx.TEXTURE_2D, this.texture);
    this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, ctx.RGB32F, width, width, 0, ctx.RGB, ctx.FLOAT, buffer);
    this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.NEAREST);
    this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MAG_FILTER, this.ctx.NEAREST);
    this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.CLAMP_TO_EDGE);
    this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.CLAMP_TO_EDGE);
    this.ctx.uniform1i(this._points, index);
  }
}

ctx.useProgram(shader);
let points = new PointTex(ctx, shader);
points.push(new vec3(-1, 0, 0));
points.push(new vec3(1, 0, 0));
points.push(new vec3(0, 1, 1));
points.upload(0);


view.onRefersh = dt => {
  const width = cav.width, height = cav.height;
  ctx.uniform2f(u_view_port, width / 1000, height / 1000);
  ctx.viewport(0, 0, width, height);

  ctx.uniform3fv(u_view_pos, view.position.buffer);
  ctx.uniform3fv(u_view_dir, view.direction.buffer);

  ctx.uniformMatrix4fv(u_view_dir_mat, false, view.direction_inverse.buffer);

  ctx.drawArrays(ctx.TRIANGLES, 0, 6);
  return true;
};

view.start();