// dependent: RayIntersect.glsl

void KDTreeInitial(const vec3 ray_origin, const vec3 ray_direct);
bool KDTreeTraversal(out uint triangles, out uint lights);
void KDTreeMiss(void);

#define KDTREE__STACK_SIZE 50
////////////////////////////////////////////////////////////////////
bool IntersectRayAABBBoxTest(
    const vec3 box_max,
    const vec3 box_min,
    const vec3 ray_origin,
    const vec3 ray_direct);
struct KDTreeContext {
  uint top;
  vec3 ray_origin;
  vec3 ray_direct;
  uint level[KDTREE__STACK_SIZE];
  uint node[KDTREE__STACK_SIZE];
  vec3 box_max[KDTREE__STACK_SIZE];
  vec3 box_min[KDTREE__STACK_SIZE];
};

KDTreeContext _kdtree_ctx;
uniform isampler2D _kdtree;
uniform uint _kdtree_width;
uniform vec3 _kdtree_box_max;
uniform vec3 _kdtree_box_min;

void _KDTreePush(uint level, uint node, vec3 box_min, vec3 box_max) {
  uint top = _kdtree_ctx.top;
  _kdtree_ctx.level[top] = level;
  _kdtree_ctx.node[top] = node;
  _kdtree_ctx.box_max[top] = box_max;
  _kdtree_ctx.box_min[top] = box_min;
  _kdtree_ctx.top += 1;
}

void _KDTreePop(void) { _kdtree_ctx.top = max(0, _kdtree_ctx.top - 1); }

vec3 _KDTreeVecModify(vec3 v, const float t, const uint i) {
  v[i] = t;
  return v;
}

void KDTreeInitial(const vec3 ray_origin, const vec3 ray_direct) {
  if (IntersectRayAABBBoxTest(_kdtree_box_min, _kdtree_box_max, ray_origin, ray_direct)) {
    _kdtree_ctx.top = 1;
    _kdtree_ctx.ray_origin = ray_origin;
    _kdtree_ctx.ray_direct = ray_direct;
    _kdtree_ctx.level[0] = 0;
    _kdtree_ctx.node[0] = 1;
    _kdtree_ctx.box_max[0] = _kdtree_box_max;
    _kdtree_ctx.box_min[0] = _kdtree_box_min;
  } else
    _kdtree_ctx.top = 0;
}

bool KDTreeTraversal(out uint triangles, out uint lights) {
  // texture format: RBG32I
  // | left   | right     | > 0
  // | lights | triangles | < 0
  while (_kdtree_ctx.top) {
    uint node_id = _kdtree_ctx.node[_kdtree_ctx.top - 1];
    uint node_idx = node_id % _kdtree_width;
    uint node_idy = node_id / _kdtree_width;
    ivec3 node = texelFetch(_kdtree, ivec2(node_idx, node_idy)).xyz;
    if (node.x < 0 || node.y < 0) {
      triangles = -node.y;
      lights = -node.x;
      return true;
    } else {
      uint level = _kdtree_ctx.level[_kdtree_ctx.top - 1];
      uint i = level % 3;
      vec3 box_max = _kdtree_ctx.box_max[_kdtree_ctx.top - 1];
      vec3 box_min = _kdtree_ctx.box_min[_kdtree_ctx.top - 1];
      float box_tmp = intBitsToFloat(node.z);
      vec3 ray_origin = _kdtree_ctx.ray_origin;
      vec3 ray_direct = _kdtree_ctx.ray_direct;
      vec3 tmp_max = _KDTreeVecModify(box_min, box_tmp, i);
      vec3 tmp_min = _KDTreeVecModify(box_max, box_tmp, i);
      bool test_min = IntersectRayAABBBoxTest(box_min, tmp_min, ray_origin, ray_direct);
      bool test_max = IntersectRayAABBBoxTest(tmp_max, box_max, ray_origin, ray_direct);
      _KDTreePop();
      if (_kdtree_ctx.ray_direct[i] > 0.0) {
        if (node.y > 0 && test_max)
          _KDTreePush(level + 1, node.y, tmp_max, box_max);
        if (node.x > 0 && test_min)
          _KDTreePush(level + 1, node.x, box_min, tmp_min);
      } else {
        if (node.x > 0 && test_min)
          _KDTreePush(level + 1, node.x, box_min, tmp_min);
        if (node.y > 0 && test_max)
          _KDTreePush(level + 1, node.y, tmp_max, box_max);
      }
    }
  }
  return false;
}

void KDTreeMiss(void) { _KDTreePop(); }
