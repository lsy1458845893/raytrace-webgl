
const cav = document.getElementById('cav') as HTMLCanvasElement;
const ctx = cav.getContext('webgl2') as WebGL2RenderingContext;

import compile_program from '../src/GLProgram';

const shader = compile_program(
    ctx, `#version 300 es
precision highp float;
const vec2 vertex_positions[] = vec2[](
  vec2(-1, -1), vec2(-1,  1), vec2( 1,  1),
  vec2( 1,  1), vec2( 1, -1), vec2(-1, -1)
);  

uniform vec2 u_view_port;
uniform vec3 u_view_pos;
uniform vec3 u_view_dir;
uniform mat4 u_view_dir_mat;

out vec3 v_ray_dir;

void main() {
  vec2 vtx_pos = vertex_positions[gl_VertexID];
  vec4 ray_dir = vec4(u_view_dir, 1) + u_view_dir_mat * vec4(vtx_pos.xy * u_view_port, 0, 1);
  v_ray_dir =  ray_dir.w * ray_dir.xyz;
  gl_Position = vec4(vtx_pos, 0.0, 1.0);
}
`,
    `#version 300 es
precision highp float;

struct point{
  vec3 position;
  vec3 normal;
};

uniform vec3 u_view_pos;
in vec3 v_ray_dir;

out vec4 color;

bool intersection_test_ray_triangle(
  const vec3 points[3],
  const vec3 ray_origin,
  const vec3 ray_direct,
  out   vec3 position
) {
  return false;
}

bool intersection_test_ray_box(
  const vec3 box_max,
  const vec3 box_min,
  const vec3 ray_origin,
  const vec3 ray_direct
) {
  float t1 = (box_max.x - ray_origin.x) / ray_direct.x;
  float t2 = (box_min.x - ray_origin.x) / ray_direct.x;
  float t3 = (box_max.y - ray_origin.y) / ray_direct.y;
  float t4 = (box_min.y - ray_origin.y) / ray_direct.y;
  float t5 = (box_max.z - ray_origin.z) / ray_direct.z;
  float t6 = (box_min.z - ray_origin.z) / ray_direct.z;

  float tmin = max(max(min(t1, t2), min(t3, t4)), min(t5, t6));
  float tmax = min(min(max(t1, t2), max(t3, t4)), max(t5, t6));

  return (tmax < 0.0 || tmin > tmax) ? false : true;
}

void main() {
  const vec3 box_max = vec3( 1.,  1.,  1.);
  const vec3 box_min = vec3(-1., -1., -1.);

  color = (intersection_test_ray_box(box_max, box_min, u_view_pos, v_ray_dir)) ?
    vec4(0.5, 0.5, 0.5, 1.0) : vec4(0.0, 0.0, 0.0, 1.0);
}`);

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
