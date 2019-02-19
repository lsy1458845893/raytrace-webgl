
export class UserPointerLockInput {
  public onDirectionChange: (dx: number, dy: number) => void;
  public onClick: () => void;
  public velocity: {z: number, x: number} = {z: 0, x: 0};

  private lock: boolean = false;
  private keys: {w: boolean,
                 a: boolean,
                 s: boolean,
                 d: boolean} = {w: false, a: false, s: false, d: false};

  constructor(private cav: HTMLCanvasElement, private doc: Document) {
    (doc as any).onpointerlockchange = () => this.pointerChange();
    cav.onclick = () => this.tryLockPointer();
    doc.onkeydown = e => this.lock && this.keyDown(e.key);
    doc.onkeyup = e => this.lock && this.keyUp(e.key);
    doc.onmousemove = e =>
        this.lock && this.MouseMove(e.movementX, e.movementY);
  }

  private tryLockPointer() {
    // if (!(this.doc as any).fullscreenElement) (this.cav as
    // any).webkitRequestFullScreen();
    if (!(this.doc as any).pointerLockElement)
      (this.cav as any).requestPointerLock();
  }

  private pointerChange() {
    this.lock = (document as any).pointerLockElement ? true : false;
    this.lock && this.onClick && this.onClick();
  }

  private keyDown(key: string) {
    if (key in this.keys) this.keys[key] = true;
    this.resetVelocity();
  }

  private keyUp(key: string) {
    if (key in this.keys) this.keys[key] = false;
    this.resetVelocity();
  }

  private MouseMove(x: number, y: number) {
    if (this.onDirectionChange) this.onDirectionChange(y / 500, -x / 500);
  }

  private resetVelocity() {
    const keys = this.keys;
    let z = 0, x = 0;
    z -= keys.w ? 1 : 0;
    z += keys.s ? 1 : 0;
    x -= keys.a ? 1 : 0;
    x += keys.d ? 1 : 0;
    const m = Math.sqrt(x * x + z * z);
    if (m)
      this.velocity = {z: z / m, x: x / m};
    else
      this.velocity = {z: 0, x: 0};
  }
}


export class UserUnlockPointerInput {
  public position: {x: number, y: number} = {x: 0, y: 0};
  public press: boolean = false;
  public over: boolean = false;

  constructor(private cav: HTMLCanvasElement) {
    cav.onmouseenter = e => {
      this.over = true;
      this.updatePointerPosition(e);
    };
    cav.onmouseleave = e => {
      this.over = false;
      this.updatePointerPosition(e);
    };
    cav.onmousedown = e => {
      this.press = true;
      this.updatePointerPosition(e);
    };
    cav.onmouseup = e => {
      this.press = false;
      this.updatePointerPosition(e);
    };
    cav.onmousemove = e => this.updatePointerPosition(e);
  }

  private updatePointerPosition(e: MouseEvent) {
    this.position.x = e.offsetX;
    this.position.y = e.offsetY;
  }
}
