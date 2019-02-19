#version 300 es
precision highp float;
const vec2 vertex_positions[] = vec2[](vec2(-1, -1), vec2(-1, 1), vec2(1, 1),
                                       vec2(1, 1), vec2(1, -1), vec2(-1, -1));

uniform vec2 u_view_port;
uniform vec3 u_view_pos;
uniform vec3 u_view_dir;
uniform mat4 u_view_dir_mat;

out vec3 v_ray_dir;

void main() {
  vec2 vtx_pos = vertex_positions[gl_VertexID];
  vec4 ray_dir = vec4(u_view_dir, 1) +
                 u_view_dir_mat * vec4(vtx_pos.xy * u_view_port, 0, 1);
  v_ray_dir = ray_dir.w * ray_dir.xyz;
  gl_Position = vec4(vtx_pos, 0.0, 1.0);
}
