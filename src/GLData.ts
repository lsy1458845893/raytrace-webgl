

export default class GLData {
  protected location: WebGLUniformLocation;
  protected texture: WebGLTexture;

  constructor(protected ctx: WebGL2RenderingContext, shader: WebGLProgram, name: string) {
    this.location = ctx.getUniformLocation(shader, name);
    this.texture = ctx.createTexture();
  }

  public upload(index: number, channle: number, data: Float32Array | Uint32Array | Int32Array) {
    let width = Math.ceil(Math.sqrt(data.length / channle));
    let set_data = (iformat: number, format: number, type: number) => this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, iformat, width, width, 0, format, type, data);
    this.ctx.activeTexture(this.ctx.TEXTURE0 + index);
    this.ctx.bindTexture(this.ctx.TEXTURE_2D, this.texture);
    if (data instanceof Float32Array) {
      if (channle == 1) set_data(this.ctx.R32F, this.ctx.RED, this.ctx.FLOAT);
      else if (channle == 2) set_data(this.ctx.RG32F, this.ctx.RG, this.ctx.FLOAT);
      else if (channle == 3) set_data(this.ctx.RGB32F, this.ctx.RGB, this.ctx.FLOAT);
      else if (channle == 4) set_data(this.ctx.RGBA32F, this.ctx.RGBA, this.ctx.FLOAT);
      else throw Error("error channle type");
    } else if (data instanceof Uint32Array) {
      if (channle == 1) set_data(this.ctx.R32UI, this.ctx.RED_INTEGER, this.ctx.UNSIGNED_INT);
      else if (channle == 2) set_data(this.ctx.RG32UI, this.ctx.RG_INTEGER, this.ctx.UNSIGNED_INT);
      else if (channle == 3) set_data(this.ctx.RGB32UI, this.ctx.RGB_INTEGER, this.ctx.UNSIGNED_INT);
      else if (channle == 4) set_data(this.ctx.RGBA32UI, this.ctx.RGBA_INTEGER, this.ctx.UNSIGNED_INT);
      else throw Error("error channle type");
    } else if (data instanceof Int32Array) {
      if (channle == 1) set_data(this.ctx.R32I, this.ctx.RED_INTEGER, this.ctx.INT);
      else if (channle == 2) set_data(this.ctx.RG32I, this.ctx.RG_INTEGER, this.ctx.INT);
      else if (channle == 3) set_data(this.ctx.RGB32I, this.ctx.RGB_INTEGER, this.ctx.INT);
      else if (channle == 4) set_data(this.ctx.RGBA32I, this.ctx.RGBA_INTEGER, this.ctx.INT);
      else throw Error("error channle type");
    } else throw Error("cannot find data type");
    this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.NEAREST);
    this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MAG_FILTER, this.ctx.NEAREST);
    this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.CLAMP_TO_EDGE);
    this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.CLAMP_TO_EDGE);
    this.ctx.uniform1i(this.location, index);
  }
}
