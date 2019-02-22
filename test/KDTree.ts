

interface Vector {
  x: number;
  y: number;
  z: number;
}

interface Triangle {
  x: number;
  y: number;
  z: number;
}

interface PointSet {
  length(): number;
  get(i: number): Vector;
}

interface TriangleSet {
  length(): number;
  get(i: number): Triangle;
}

class KDTree {
  private u_tree: WebGLUniformLocation;
  private triangles: WebGLUniformLocation;
  private width: WebGLUniformLocation;
  private box_max: WebGLUniformLocation;
  private box_min: WebGLUniformLocation;

  constructor(private ctx: WebGL2RenderingContext, private shader: WebGLProgram) {
    this.u_tree = ctx.getUniformLocation(shader, '_kdtree');
    this.width = ctx.getUniformLocation(shader, '_kdtree_width');
    this.box_max = ctx.getUniformLocation(shader, '_kdtree_box_max');
    this.box_min = ctx.getUniformLocation(shader, '_kdtree_box_min');
  }

  public make(triangles: TriangleSet, points: PointSet, make_triangle_set: (s: number[]) => number) {

    let id_box_lx = new Float32Array(triangles.length());
    let id_box_rx = new Float32Array(triangles.length());
    let id_box_ly = new Float32Array(triangles.length());
    let id_box_ry = new Float32Array(triangles.length());
    let id_box_lz = new Float32Array(triangles.length());
    let id_box_rz = new Float32Array(triangles.length());

    let id_to_sortd_lx = new Uint32Array(triangles.length());
    let id_to_sortd_rx = new Uint32Array(triangles.length());
    let id_to_sortd_ly = new Uint32Array(triangles.length());
    let id_to_sortd_ry = new Uint32Array(triangles.length());
    let id_to_sortd_lz = new Uint32Array(triangles.length());
    let id_to_sortd_rz = new Uint32Array(triangles.length());

    let sortd_lx_to_id = new Uint32Array(triangles.length());
    let sortd_rx_to_id = new Uint32Array(triangles.length());
    let sortd_ly_to_id = new Uint32Array(triangles.length());
    let sortd_ry_to_id = new Uint32Array(triangles.length());
    let sortd_lz_to_id = new Uint32Array(triangles.length());
    let sortd_rz_to_id = new Uint32Array(triangles.length());

    for (let i = 0; i < triangles.length(); i++) {
      let triangle = triangles.get(i);
      let tx = points.get(triangle.x);
      let ty = points.get(triangle.y);
      let tz = points.get(triangle.z);
      id_box_lx[i] = Math.min(tx.x, ty.x, tz.x);
      id_box_rx[i] = Math.max(tx.x, ty.x, tz.x);
      id_box_ly[i] = Math.min(tx.y, ty.y, tz.y);
      id_box_ry[i] = Math.max(tx.y, ty.y, tz.y);
      id_box_lz[i] = Math.min(tx.z, ty.z, tz.z);
      id_box_rz[i] = Math.max(tx.z, ty.z, tz.z);
      sortd_lx_to_id[i] = i;
      sortd_rx_to_id[i] = i;
      sortd_ly_to_id[i] = i;
      sortd_ry_to_id[i] = i;
      sortd_lz_to_id[i] = i;
      sortd_rz_to_id[i] = i;
    }

    sortd_lx_to_id.sort((a, b) => id_box_lx[a] - id_box_lx[b]);
    sortd_rx_to_id.sort((a, b) => id_box_rx[a] - id_box_rx[b]);
    sortd_ly_to_id.sort((a, b) => id_box_ly[a] - id_box_ly[b]);
    sortd_ry_to_id.sort((a, b) => id_box_ry[a] - id_box_ry[b]);
    sortd_lz_to_id.sort((a, b) => id_box_lz[a] - id_box_lz[b]);
    sortd_rz_to_id.sort((a, b) => id_box_rz[a] - id_box_rz[b]);

    for (let i = 0; i < triangles.length(); i++) {
      id_to_sortd_lx[sortd_lx_to_id[i]] = i;
      id_to_sortd_rx[sortd_rx_to_id[i]] = i;
      id_to_sortd_ly[sortd_ly_to_id[i]] = i;
      id_to_sortd_ry[sortd_ry_to_id[i]] = i;
      id_to_sortd_lz[sortd_lz_to_id[i]] = i;
      id_to_sortd_rz[sortd_rz_to_id[i]] = i;
    }

    let sort_l_index: Uint32Array[] = [sortd_lx_to_id, sortd_ly_to_id, sortd_lz_to_id];
    let sort_r_index: Uint32Array[] = [sortd_rx_to_id, sortd_ry_to_id, sortd_rz_to_id];

    let box_l_index: Float32Array[] = [id_box_lx, id_box_ly, id_box_lz];
    let box_r_index: Float32Array[] = [id_box_rx, id_box_ry, id_box_rz];

    function vector_index(v: Vector, i: number): number {
      let nv = [v.x, v.y, v.z];
      return nv[i];
    }

    function vector_modify(v: Vector, f: number, i: number): Vector {
      let nv = [v.x, v.y, v.z];
      nv[i] = f;
      return { x: nv[0], y: nv[1], z: nv[2] };
    }

    class Node {
      public index: number;
      public x: Node | null;
      public y: Node | null;
      public z: number;
      constructor(public i_range: [Vector, Vector], f_range: [Vector, Vector], level: number) {
        this.index = node.push(this) - 1;
        let dim = level % 3;
        let sort_l = sort_l_index[dim];
        let sort_r = sort_r_index[dim];
        let box_l = box_l_index[dim];
        let box_r = box_r_index[dim];
        let i = vector_index(i_range[0], dim);
        let j = vector_index(i_range[1], dim);
        let ti = i, tj = j;
        // safe: r(ti) < l(tj)
        // l +         +  
        //   ------
        //             -----
        // r      +         +  
        // confilt: r(ti) > l(tj)
        // l +     +
        //   -----------
        //         ---------
        // r           +    +
        while (box_r[sort_r[ti]] < box_l[sort_l[tj]]) {
          if (ti - i <= j - tj) ti++;
          else tj--;
        }

        if (ti - i + j - tj > 0.5 * (j - i)) {
          
        }
      }
    }

    let node: (null | Node)[] = [null];
    let last = triangles.length() - 1;
    let i_range: [Vector, Vector] = [{ x: 0, y: 0, z: 0 }, { x: last, y: last, z: last }];
    let f_range: [Vector, Vector] = [
      { x: id_box_lx[sortd_lx_to_id[0]], y: id_box_ly[sortd_ly_to_id[0]], z: id_box_lz[sortd_lz_to_id[0]] },
      { x: id_box_rx[sortd_lx_to_id[last]], y: id_box_ry[sortd_ry_to_id[last]], z: id_box_rz[sortd_rz_to_id[last]] }
    ];
    let root = new Node(i_range, f_range, 0);
  }
}


export { Vector, Triangle, PointSet, TriangleSet, KDTree };