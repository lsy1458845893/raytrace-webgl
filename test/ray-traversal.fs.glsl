#version 300 es
precision highp float;
precision highp uint;

uniform vec3 u_view_pos;
in vec3 v_ray_dir;

out vec4 color;

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

bool test_point_in_box(const vec3 point, const vec3 box_max, const vec3 box_min) {
  return all(lessThanEqual(box_min, point)) && all(lessThanEqual(point, box_max));
}


void main() {

}