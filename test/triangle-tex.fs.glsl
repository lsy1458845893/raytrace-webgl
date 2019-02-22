#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp usampler2D;

uniform vec3 u_view_pos;
in vec3 v_ray_dir;

out vec4 color;

bool IntersectRayTriangleTest(const vec3 triangle[3], const vec3 ray_origin, const vec3 ray_direct, out float hit_distance, out vec3 hit_point) {
  vec3 edge1 = triangle[1] - triangle[0];
  vec3 edge2 = triangle[2] - triangle[0];
  vec3 pvec = cross(ray_direct, edge2);
  float det = dot(edge1, pvec);
  if (det == 0.0)
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

//////////////////////
uniform sampler2D _points;
vec3 PointGet(const uint uid) {
  int id = int(uid);
  int width = int(textureSize(_points, 0).x);
  int idx = id % width;
  int idy = id / width;
  return texelFetch(_points, ivec2(idx, idy), 0).xyz;
}
//////////////////////
uniform usampler2D _triangles;
uvec3 TriangleGet(const uint uid) {
  int id = int(uid);
  int width = int(textureSize(_triangles, 0).x);
  int idx = id % width;
  int idy = id / width;
  return texelFetch(_triangles, ivec2(idx, idy), 0).xyz;
}
//////////////////////
void main() {
  float t;
  vec3 p;

  uvec3 points = TriangleGet(uint(1));

  vec3 triangle[3] = vec3[](
      PointGet(points.x), PointGet(points.y), PointGet(points.z));

  if (IntersectRayTriangleTest(triangle, u_view_pos, v_ray_dir, t, p)) {
    if (t < 0.0)
      color = vec4(1.0, 0.0, 0.0, 1.0);
    else
      color = vec4(0.0, 1.0, 0.0, 1.0);
  } else
    color = vec4(0.0, 0.0, 0.0, 1.0);
  // color = vec4(PointGet(uint(2)), 1.0);
}