#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp usampler2D;

uniform vec3 u_view_pos;
in vec3 v_ray_dir;

out vec4 color;

bool IntersectRayAABBBoxTest(const vec3 box_max, const vec3 box_min, const vec3 ray_origin, const vec3 ray_direct) {
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

// information
// hit_point = (1 - x - y) * v0 + x * v1 + y * v2
// hit_point = ray_origin + z * ray_direct
bool IntersectRayTriangleTest(
    const vec3 triangle[3],
    const vec3 ray_origin,
    const vec3 ray_direct,
    out vec3 information) {
  vec3 edge1 = triangle[1] - triangle[0];
  vec3 edge2 = triangle[2] - triangle[0];
  vec3 pvec = cross(ray_direct, edge2);
  float det = dot(edge1, pvec);
  if (det <= 0.0)
    return false;
  vec3 tvec = ray_origin - triangle[0];
  float u = dot(tvec, pvec) / det;
  if (u < 0.0 || u > 1.0)
    return false;
  vec3 qvec = cross(tvec, edge1);
  float v = dot(ray_direct, qvec) / det;
  if (v < 0.0 || u + v > 1.0)
    return false;
  float t = dot(edge2, qvec) / det;
  if (t < 0.0)
    return false;
  information = vec3(u, v, t);
  return true;
}

// //////////////////////
// uniform sampler2D _points;
// vec3 PointGet(const uint uid) {
//   int id = int(uid);
//   int width = int(textureSize(_points, 0).x);
//   int idx = id % width;
//   int idy = id / width;
//   return texelFetch(_points, ivec2(idx, idy), 0).xyz;
// }
// //////////////////////
// uniform usampler2D _triangles;
// uvec3 TriangleGet(const uint uid) {
//   int id = int(uid);
//   int width = int(textureSize(_triangles, 0).x);
//   int idx = id % width;
//   int idy = id / width;
//   return texelFetch(_triangles, ivec2(idx, idy), 0).xyz;
// }
// vec3[3] TrianglePointGet(const uint uid) {
//   uvec3 pidx = TriangleGet(uid);
//   vec3 points[3] = vec3[3](
//       PointGet(pidx.x),
//       PointGet(pidx.y),
//       PointGet(pidx.z));
//   return points;
// }
// //////////////////////
// uniform usampler2D _triangle_set;

// uint TriangleSetGet(const uint uid) {
//   int id = int(uid);
//   int width = int(textureSize(_triangle_set, 0).x);
//   int idx = id % width;
//   int idy = id / width;
//   return texelFetch(_triangle_set, ivec2(idx, idy), 0).x;
// }

// bool TriangleSetTest(uint uid, const vec3 ray_origin, const vec3 ray_direct) {
//   vec3 p;
//   float t;
//   for (uint i = uint(0); (i = TriangleSetGet(uid)) != uint(0); uid++) {
//     if (IntersectRayTriangleTest(TrianglePointGet(i), ray_origin, ray_direct, true, t, p))
//       return true;
//   }
//   return false;
// }
// //////////////////////




void main() {
  if (TriangleSetTest(uint(1), u_view_pos, v_ray_dir))
    color = vec4(1.0, 0.0, 0.0, 1.0);
  else
    color = vec4(0.0, 0.0, 0.0, 1.0);
}