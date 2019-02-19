#version 300 es
precision highp float;

uniform vec3 u_view_pos;
in vec3 v_ray_dir;

out vec4 color;

bool RayIntersectAABBBoxTest(const vec3 box_max, const vec3 box_min,
                             const vec3 ray_origin, const vec3 ray_direct) {
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
  const vec3 box_max = vec3(1., 1., 1.);
  const vec3 box_min = vec3(-1., -1., -1.);

  color = (RayIntersectAABBBoxTest(box_max, box_min, u_view_pos, v_ray_dir))
              ? vec4(0.5, 0.5, 0.5, 1.0)
              : vec4(0.0, 0.0, 0.0, 1.0);
}
