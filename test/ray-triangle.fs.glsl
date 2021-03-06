#version 300 es
precision highp float;

uniform vec3 u_view_pos;
in vec3 v_ray_dir;

out vec4 color;

bool RayIntersectTriangleTest(const vec3 triangle[3], const vec3 ray_origin,
                              const vec3 ray_direct, out float hit_distance,
                              out vec3 hit_point) {
  vec3 edge1 = triangle[1] - triangle[0];
  vec3 edge2 = triangle[2] - triangle[0];
  vec3 pvec = cross(ray_direct, edge2);
  float det = dot(edge1, pvec);
  if (abs(det) < 0.000001)
    return true;
  vec3 tvec = ray_origin - triangle[0];
  float u = dot(tvec, pvec) / det;
  if (u < 0.0 || u > 1.0)
    return false;
  vec3 qvec = cross(tvec, edge1);
  float v = dot(ray_direct, qvec) / det;
  if (v < 0.0 || u + v > 1.0)
    return false;
  float t = dot(edge2, qvec) / det;
  hit_distance = t;
  hit_point = ray_origin + t * ray_direct;
  return true;
}

void main() {
  float hit_distance;
  vec3 hit_point;
  vec3[3] triangle = vec3[3](vec3(1, 0, 0), vec3(-1, 0, 0), vec3(0, 1, 0));
  if (RayIntersectTriangleTest(triangle, u_view_pos, v_ray_dir, hit_distance, hit_point))
    color = vec4(0.5, 0.5, 0.5, 1.0);
  else
    color = vec4(0.0, 0.0, 0.0, 1.0);
}