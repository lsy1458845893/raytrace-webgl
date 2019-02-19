bool intersection(inout vec3 origin, inout vec3 direct, out uint triangle_id) {
}

bool traversal(inout traversal_context ctx) {
}

bool reflect(inout vec3 origin, inout vec3 direct, out uint triangle_id) {
  traversal_context ctx;
  while(true) {
    if (traversal(ctx)) {
      if (intersection(origin, direct, triangle_id))
        return true;
    } else
      return false;
  }
}  

void main() {
  vec3 origin, direct;
  uint triangle_id;
  for(uint i = 0;i < 5; i++) {
    if (!reflect(origin, direct, triangle_id)) break;
  }
}