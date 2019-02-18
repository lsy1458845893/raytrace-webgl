
export default function (ctx: WebGL2RenderingContext, vs: string, fs: string) {
  function compile_shader(src: string, type: number): WebGLShader {
    const shader = ctx.createShader(type);
    ctx.shaderSource(shader, src);
    ctx.compileShader(shader);
    if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
      var info = (ctx.getShaderInfoLog(shader) as string);
      ctx.deleteShader(shader);
      console.log(src);
      throw new Error(info);
    }
    return shader as WebGLShader;
  }
  var program = ctx.createProgram();
  let v: WebGLShader = compile_shader(vs, ctx.VERTEX_SHADER);
  let f: WebGLShader = compile_shader(fs, ctx.FRAGMENT_SHADER);
  ctx.attachShader(program, v);
  ctx.attachShader(program, f);
  ctx.linkProgram(program);
  if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
    var info = ctx.getProgramInfoLog(program) as string;
    ctx.deleteShader(v);
    ctx.deleteShader(f);
    ctx.deleteProgram(program);
    throw new Error(info);
  }
  ctx.deleteShader(v);
  ctx.deleteShader(f);
  return program;
}


