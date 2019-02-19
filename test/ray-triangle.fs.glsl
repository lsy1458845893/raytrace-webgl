#version 300 es
precision highp float;

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

void main() {
  color = vec4(0.5, 0.5, 0.5, 1.0);
}