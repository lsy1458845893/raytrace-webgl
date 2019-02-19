
const cav = document.getElementById('cav') as HTMLCanvasElement;
const ctx = cav.getContext('webgl2') as WebGL2RenderingContext;

import compile_program from '../src/GLProgram';
import vertex_src from './ray.vs.glsl';
import fragment_src from './ray-traversal.fs.glsl';

const shader = compile_program(ctx, vertex_src, fragment_src);

const u_view_port = ctx.getUniformLocation(shader, 'u_view_port');
const u_view_pos = ctx.getUniformLocation(shader, 'u_view_pos');
const u_view_dir = ctx.getUniformLocation(shader, 'u_view_dir');
const u_view_dir_mat = ctx.getUniformLocation(shader, 'u_view_dir_mat');

import {UserPointerLockInput} from '../src/UserInput';
import {Vec3, Vec4, Mat4} from '../src/GLMath';
const input = new UserPointerLockInput(cav, document);

ctx.useProgram(shader);

var pos = new Vec3([0, 0, 5]);
var rot = new Vec3([0, 0, 0]);
var time = 0;

input.onDirectionChange = (dx: number, dy: number) => {
  rot.x += dx;
  rot.y += dy;
};


function draw_loop(t: number) {
  const dt = t - time;
  time = t;

  const width = cav.width, height = cav.height;
  ctx.uniform2f(u_view_port, width / 1000, height / 1000);
  ctx.viewport(0, 0, width, height);

  {
    let v = new Vec4([0, 0, 0, 1]);

    v.x += input.velocity.x;
    v.z += input.velocity.z;

    v = Mat4.rotation_x(rot.x).rotation_y(rot.y).inverse().dot(v) as Vec4;

    pos.x += v.x * v.t * 0.1;
    pos.y += v.y * v.t * 0.1;
    pos.z += v.z * v.t * 0.1;

    ctx.uniform3fv(u_view_pos, pos.buffer);
  }

  {
    let v4 = Mat4.rotation_x(rot.x).rotation_y(rot.y).inverse().dot(
                 new Vec4([0, 0, -1, 1])) as Vec4;
    v4.x *= v4.t;
    v4.y *= v4.t;
    v4.z *= v4.t;
    let s = Math.sqrt(v4.x * v4.x + v4.y * v4.y + v4.z * v4.z);
    let v3 = new Vec3([v4.x / s, v4.y / s, v4.z / s]);

    ctx.uniform3fv(u_view_dir, v3.buffer);

    ctx.uniformMatrix4fv(
        u_view_dir_mat, false,
        Mat4.rotation_x(rot.x).rotation_y(rot.y).inverse().buffer);
  }

  ctx.drawArrays(ctx.TRIANGLES, 0, 6);
  requestAnimationFrame(draw_loop);
}

draw_loop(0.01);
