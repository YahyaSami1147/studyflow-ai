export const VERTEX_SHADER = `
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export const FRAGMENT_SHADER = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform vec2 u_mouse;

  // UV setup: map each pixel to a normalized coordinate system, then center it so the motion is stable across screen sizes.
  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

    // Aspect correction: the canvas is centered with the shortest dimension as the reference so the aurora does not stretch.
    vec2 mouse = (u_mouse - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    mouse.x *= u_resolution.x / u_resolution.y;
    vec2 flowPosition = uv + mouse * 0.38;

    // Animated flow: layered sine waves create soft aurora ribbons that drift slowly with time.
    float t = u_time * 0.42;
    float bandA = sin((flowPosition.x * 3.8 + t) + flowPosition.y * 5.0);
    float bandB = cos((flowPosition.y * 4.4 - t * 1.2) - flowPosition.x * 3.0);
    float flow = (bandA + bandB) * 0.5;
    float ribbons = smoothstep(-0.5, 1.0, flow + 0.65);

    // Color blending: blend deep navy with cyan, blue, and a pale violet ribbon for a premium StudyFlow palette.
    vec3 base = vec3(0.02, 0.05, 0.12);
    vec3 cyan = vec3(0.16, 0.82, 0.94);
    vec3 blue = vec3(0.14, 0.45, 1.0);
    vec3 violet = vec3(0.46, 0.42, 0.98);

    float horizon = uv.y + 0.4;
    float glow = ribbons * (0.9 + 0.4 * sin(uv.x * 9.0 + t));
    vec3 color = mix(base, cyan, smoothstep(-0.7, 0.8, horizon + glow * 0.6));
    color = mix(color, blue, smoothstep(-0.2, 1.0, glow + bandA * 0.25));
    color = mix(color, violet, smoothstep(0.25, 1.1, bandB * 0.5 + glow * 0.8));

    // Grain: add a soft noise value to break up the gradient without making the background noisy or hard to read.
    float grain = fract(sin(dot(gl_FragCoord.xy + u_time * 6.0, vec2(12.9898, 78.233))) * 43758.5453);
    color += (grain - 0.5) * 0.06;

    // Final output: darken the edges so the hero stays readable behind the real content while the glow remains soft.
    float vignette = smoothstep(1.5, 0.35, length(uv));
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;
