
const cav = document.getElementById('cav') as HTMLCanvasElement;
const ctx = cav.getContext('webgl2') as WebGL2RenderingContext;

import compile_program from '../src/GLProgram';
import vertex_src from './ray.vs.glsl';
import fragment_src from './mesh-data.fs.glsl';

const shader = compile_program(ctx, vertex_src, fragment_src);

const u_view_port = ctx.getUniformLocation(shader, 'u_view_port');
const u_view_pos = ctx.getUniformLocation(shader, 'u_view_pos');
const u_view_dir = ctx.getUniformLocation(shader, 'u_view_dir');
const u_view_dir_mat = ctx.getUniformLocation(shader, 'u_view_dir_mat');
import { PointerLockedUserView } from '../src/UserView';
const view = new PointerLockedUserView(cav, document);
import GLData from "../src/GLData";

ctx.useProgram(shader);
import { PointTexture, NormalTexture, TriangleTexture, TriangleSetTexture, Vector } from "../src/DataTexture";

import cube from "../data/cube.vnf.json";
import icosphere from "../data/icosphere-1.vnf.json";
import { Mat4, Vec4 } from '../src/GLMath';
{

  interface MeshData {
    vertex: [number, number, number][];
    normal: [number, number, number][];
    face: { v: [number, number, number], n: [number, number, number] }[];
  };

  function merge_mesh(meshs: { data: MeshData, world: Mat4 }[]): MeshData {
    let data: MeshData = { vertex: [], normal: [], face: [] };
    let vector_offset = (v: [number, number, number], offset: number): [number, number, number] =>
      [v[0] + offset, v[1] + offset, v[2] + offset];
    let vector_to_vec4 = (v: [number, number, number]): Vec4 => new Vec4([v[0], v[1], v[2], 1]);
    let vec4_to_vector = (v: Vec4): [number, number, number] => [v.x * v.t, v.y * v.t, v.z * v.t];
    for (let i = 0; i < meshs.length; i++) {
      let mesh = meshs[i].data;
      let world = meshs[i].world;
      let world_IT = world.inverse().transpose();
      let offset_vertex = Number(data.vertex.length);
      let offset_normal = Number(data.normal.length);
      for (let j = 0; j < mesh.face.length; j++) {
        let { v, n } = mesh.face[j];
        data.face.push({
          v: vector_offset(v, offset_vertex),
          n: vector_offset(n, offset_normal),
        });
      }
      for (let j = 0; j < mesh.vertex.length; j++) {
        let v = vector_to_vec4(mesh.vertex[j]);
        data.vertex.push(vec4_to_vector(world.dot(v) as Vec4));
      }
      for (let j = 0; j < mesh.normal.length; j++) {
        let v = vector_to_vec4(mesh.normal[j]);
        data.normal.push(vec4_to_vector(world_IT.dot(v) as Vec4));
      }
    }
    return data;
  }

  let uploaders = {
    vertexs: new GLData(ctx, shader, ""),
    normals: new GLData(ctx, shader, ""),
    triangle_vertex: new GLData(ctx, shader, ""),
    triangle_normal: new GLData(ctx, shader, ""),
    triangle_sets: new GLData(ctx, shader, ""),
    kdtree: new GLData(ctx, shader, ""),
  }

  let mesh = merge_mesh([
    { data: cube, world: Mat4.translation(2, 0, -2) },
    { data: cube, world: Mat4.translation(-2, 0, 2) },
    { data: cube, world: Mat4.translation(2, 0, 2) },
    { data: cube, world: Mat4.translation(-2, 0, -2) },
  ]);

  let get_buffer = function <T>(structor: new (length: number) => T, channle: number, length: number): T {
    let width = Math.ceil(Math.sqrt(length + 1));
    return new structor(width * width * channle);
  };

  let vertex_buf = get_buffer(Float32Array, 3, mesh.vertex.length);
  let normal_buf = get_buffer(Uint32Array, 3, mesh.normal.length);
  let face_vertex_buf = get_buffer(Uint32Array, 3, mesh.face.length);
  let face_normal_buf = get_buffer(Uint32Array, 3, mesh.face.length);

  for (let i = 0; i < mesh.vertex.length; i++) {
    vertex_buf[3 * (i + 1) + 0] = mesh.vertex[i][0];
    vertex_buf[3 * (i + 1) + 1] = mesh.vertex[i][1];
    vertex_buf[3 * (i + 1) + 2] = mesh.vertex[i][2];
  }

  for (let i = 0; i < mesh.normal.length; i++) {
    normal_buf[3 * (i + 1) + 0] = mesh.normal[i][0];
    normal_buf[3 * (i + 1) + 1] = mesh.normal[i][1];
    normal_buf[3 * (i + 1) + 2] = mesh.normal[i][2];
  }

  for (let i = 0; i < mesh.face.length; i++) {
    face_vertex_buf[3 * (i + 1) + 0] = mesh.face[i].v[0];
    face_vertex_buf[3 * (i + 1) + 1] = mesh.face[i].v[1];
    face_vertex_buf[3 * (i + 1) + 2] = mesh.face[i].v[2];
    face_normal_buf[3 * (i + 1) + 0] = mesh.face[i].n[0];
    face_normal_buf[3 * (i + 1) + 1] = mesh.face[i].n[1];
    face_normal_buf[3 * (i + 1) + 2] = mesh.face[i].n[2];
  }

  function create_kdtree(mesh: MeshData): { kdnode: Vector[], triangle_set: number[] } {
    let data: { kdnode: Vector[], triangle_set: number[] } = {
      kdnode: [{ x: 0, y: 0, z: 0 }],
      triangle_set: [0],
    };

    let vector_change = (v: Vector, f: number, i: number): Vector => {
      console.log(`vector_change(${i}, ${f})`)
      let n = [v.x, v.y, v.z]; n[i % 3] = f;
      return { x: n[0], y: n[1], z: n[2] };
    }

    let id_box_lx = new Float32Array(mesh.face.length + 1);
    let id_box_rx = new Float32Array(mesh.face.length + 1);
    let id_box_ly = new Float32Array(mesh.face.length + 1);
    let id_box_ry = new Float32Array(mesh.face.length + 1);
    let id_box_lz = new Float32Array(mesh.face.length + 1);
    let id_box_rz = new Float32Array(mesh.face.length + 1);

    let id_to_sortd_lx = new Uint32Array(mesh.face.length + 1);
    let id_to_sortd_rx = new Uint32Array(mesh.face.length + 1);
    let id_to_sortd_ly = new Uint32Array(mesh.face.length + 1);
    let id_to_sortd_ry = new Uint32Array(mesh.face.length + 1);
    let id_to_sortd_lz = new Uint32Array(mesh.face.length + 1);
    let id_to_sortd_rz = new Uint32Array(mesh.face.length + 1);

    let sortd_lx_to_id = new Uint32Array(mesh.face.length + 1);
    let sortd_rx_to_id = new Uint32Array(mesh.face.length + 1);
    let sortd_ly_to_id = new Uint32Array(mesh.face.length + 1);
    let sortd_ry_to_id = new Uint32Array(mesh.face.length + 1);
    let sortd_lz_to_id = new Uint32Array(mesh.face.length + 1);
    let sortd_rz_to_id = new Uint32Array(mesh.face.length + 1);

    for (let i = 1; i < mesh.face.length + 1; i++) {
      let face = mesh.face[i - 1];
      let tx = mesh.vertex[face.v[0] - 1];
      let ty = mesh.vertex[face.v[1] - 1];
      let tz = mesh.vertex[face.v[2] - 1];
      id_box_lx[i] = Math.min(tx[0], ty[0], tz[0]);
      id_box_rx[i] = Math.max(tx[0], ty[0], tz[0]);
      id_box_ly[i] = Math.min(tx[1], ty[1], tz[1]);
      id_box_ry[i] = Math.max(tx[1], ty[1], tz[1]);
      id_box_lz[i] = Math.min(tx[2], ty[2], tz[2]);
      id_box_rz[i] = Math.max(tx[2], ty[2], tz[2]);
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

    for (let i = 1; i < mesh.face.length + 1; i++) {
      id_to_sortd_lx[sortd_lx_to_id[i]] = i;
      id_to_sortd_rx[sortd_rx_to_id[i]] = i;
      id_to_sortd_ly[sortd_ly_to_id[i]] = i;
      id_to_sortd_ry[sortd_ry_to_id[i]] = i;
      id_to_sortd_lz[sortd_lz_to_id[i]] = i;
      id_to_sortd_rz[sortd_rz_to_id[i]] = i;
    }

    interface Node {
      L: Node | null,
      R: Node | null,
      min: Vector,
      max: Vector,
    }

    function make_node(depth: number, min: Vector, max: Vector, try_time: number = 0): Node | null {
      let vector_index = (v: Vector, i: number): number => [v.x, v.y, v.z][i];
      console.log(depth, min, max, try_time);
      console.log((max.x - min.x + 1) * (max.y - min.y + 1) * (max.z - min.z + 1));
      if (try_time >= 2) return null;
      if (depth < 8 && (max.x - min.x + 1) * (max.y - min.y + 1) * (max.z - min.z + 1) > 4) {
        let sort_l = [sortd_lx_to_id, sortd_ly_to_id, sortd_lz_to_id][depth % 3];
        let sort_r = [sortd_rx_to_id, sortd_ry_to_id, sortd_rz_to_id][depth % 3];
        let box_l = [id_box_lx, id_box_ly, id_box_lz][depth % 3];
        let box_r = [id_box_rx, id_box_ry, id_box_rz][depth % 3];
        let i = vector_index(min, depth % 3);
        let j = vector_index(max, depth % 3);
        let ti = i, tj = j;
        while (box_r[sort_r[ti]] < box_l[sort_l[tj]]) {
          if (ti - i <= j - tj) ti++;
          else tj--;
        }
        if (ti - i + j - tj > 0.3 * (j - i)) {
          return {
            L: make_node(depth + 1, min, vector_change(max, tj, depth)),
            R: make_node(depth + 1, vector_change(min, ti, depth), max),
            min, max,
          }
        } else {
          let n = make_node(depth + 1, min, max, try_time + 1);
          if (n == null) return { L: null, R: null, max, min };
          else if (n.L == n.R) return { L: n.L, R: n.R, min, max }
          else return n;
        }
      } else
        return { L: null, R: null, min, max };
    }
    make_node(0, { x: 1, y: 1, z: 1 }, { x: mesh.face.length - 1, y: mesh.face.length - 1, z: mesh.face.length - 1 });
    return data;
  }
  create_kdtree(mesh);
}

let update = true;

view.onChange = () => update = true;

view.onRefersh = dt => {
  if (update) {
    const width = cav.width, height = cav.height;
    ctx.uniform2f(u_view_port, width / 1000, height / 1000);
    ctx.viewport(0, 0, width, height);

    ctx.uniform3fv(u_view_pos, view.position.buffer);
    ctx.uniform3fv(u_view_dir, view.direction.buffer);

    ctx.uniformMatrix4fv(u_view_dir_mat, false, view.direction_inverse.buffer);

    ctx.drawArrays(ctx.TRIANGLES, 0, 6);
    update = false;
  }
  return true;
};

view.start();
