

bool check_intersection(inout vec3 origin, inout vec3 direct,
                        out uint triangle_id) {}

bool check_traversal(inout traversal_context ctx) {}

bool check_reflect(inout vec3 origin, inout vec3 direct, out uint triangle_id) {
  traversal_context ctx;
  while (true) {
    if (check_traversal(ctx)) {
      if (check_intersection(origin, direct, triangle_id))
        return true;
    } else
      return false;
  }
}

void main() {
  vec3 origin, direct;
  uint triangle_id;
  for (uint i = 0; i < 5; i++) {
    if (!check_reflect(origin, direct, triangle_id))
      break;
  }
}