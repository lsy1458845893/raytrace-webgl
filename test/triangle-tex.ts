
const cav = document.getElementById('cav') as HTMLCanvasElement;
const ctx = cav.getContext('webgl2') as WebGL2RenderingContext;

import compile_program from '../src/GLProgram';
import vertex_src from './ray.vs.glsl';
import fragment_src from './triangle-tex.fs.glsl';

const shader = compile_program(ctx, vertex_src, fragment_src);


const u_view_port = ctx.getUniformLocation(shader, 'u_view_port');
const u_view_pos = ctx.getUniformLocation(shader, 'u_view_pos');
const u_view_dir = ctx.getUniformLocation(shader, 'u_view_dir');
const u_view_dir_mat = ctx.getUniformLocation(shader, 'u_view_dir_mat');
import { PointerLockedUserView } from '../src/UserView';
const view = new PointerLockedUserView(cav, document);

ctx.useProgram(shader);

import GLData from "../src/GLData";

let points = new GLData(ctx, shader, "_points");
points.upload(0, 3, new Float32Array([
  0, 0, 0,
  -1, 0, 0,
  1, 0, 0,
  0, 1, 0
]));

let triangles = new GLData(ctx, shader, "_triangles");
triangles.upload(1, 3, new Uint32Array([
  0, 0, 0,
  1, 2, 3,
  1, 2, 3,
  1, 2, 3,
]));

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
