//
// declera
bool IntersectRayAABBBoxTest(
    const vec3 box_max,
    const vec3 box_min,
    const vec3 ray_origin,
    const vec3 ray_direct);

bool IntersectRayTriangleTest(
    const vec3 triangle[3],
    const vec3 ray_origin,
    const vec3 ray_direct,
    out float hit_distance,
    out vec3 hit_point);
// implement
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
  if (t < 0.0)
    return false;
  hit_distance = t;
  hit_point = ray_origin + t * ray_direct;
  return true;
}
