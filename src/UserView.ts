
import {Mat4, Vec2, Vec3, Vec4} from './GLMath';
import {UserPointerLockInput} from './UserInput';

export class PointerLockedUserView {
  public onRefersh: (dt: number) => boolean;

  public position: Vec3 = new Vec3([0, 0, 5]);
  public rotation: Vec2 = new Vec2([0, 0]);
  public direction: Vec3 = new Vec3([0, 0, 1]);
  public direction_inverse: Mat4;

  private input: UserPointerLockInput;
  private time: number = 0;
  constructor(cav: HTMLCanvasElement, doc: Document) {
    this.input = new UserPointerLockInput(cav, doc);

    this.input.onDirectionChange = (dx: number, dy: number) => {
      this.rotation.x += dx;
      this.rotation.y += dy;
    };
  }

  public start(t: number = 0) {
    {
      this.direction_inverse = Mat4.rotation_x(this.rotation.x)
                                   .rotation_y(this.rotation.y)
                                   .inverse();
      let v4 = this.direction_inverse.dot(new Vec4([0, 0, -1, 1])) as Vec4;
      v4.x *= v4.t;
      v4.y *= v4.t;
      v4.z *= v4.t;
      let s = Math.sqrt(v4.x * v4.x + v4.y * v4.y + v4.z * v4.z);
      let v3 = new Vec3([v4.x / s, v4.y / s, v4.z / s]);
      this.direction = v3;
    }
    {
      let v = new Vec4([0, 0, 0, 1]);

      v.x += this.input.velocity.x;
      v.z += this.input.velocity.z;

      v = this.direction_inverse.dot(v) as Vec4;

      this.position.x += v.x * v.t * 0.1;
      this.position.y += v.y * v.t * 0.1;
      this.position.z += v.z * v.t * 0.1;
    }
    let ret = false;
    this.onRefersh && (ret = this.onRefersh(t - this.time));
    this.time = t;
    ret && requestAnimationFrame(t => this.start(t));
  }
}