const { VR_ASSET_BASE_URL } = require('../../utils/config.js');

const VIEW_WIDTH = 750;
const VIEW_HEIGHT = 690;
const DEFAULT_YAW = 180;
const DEFAULT_PITCH = 0;
const MAX_PITCH = 18;
const CAMERA_FOV = 78;
const MIN_CAMERA_FOV = 48;
const MAX_CAMERA_FOV = 92;
const DEG_TO_RAD = Math.PI / 180;
const IMAGE_LOAD_TIMEOUT = 15000;

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
varying vec2 v_screen;

void main() {
  v_screen = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 v_screen;
uniform sampler2D u_panorama;
uniform float u_yaw;
uniform float u_pitch;
uniform float u_fov;
uniform float u_viewRatio;

const float PI = 3.14159265358979323846264;

void main() {
  float tanHalfFov = tan(u_fov * 0.5);
  vec2 screen = v_screen * 2.0 - 1.0;
  vec3 direction = normalize(vec3(
    screen.x * tanHalfFov,
    screen.y * u_viewRatio * tanHalfFov,
    1.0
  ));

  float cp = cos(u_pitch);
  float sp = sin(u_pitch);
  direction = vec3(
    direction.x,
    direction.y * cp - direction.z * sp,
    direction.y * sp + direction.z * cp
  );

  float cy = cos(u_yaw);
  float sy = sin(u_yaw);
  direction = vec3(
    direction.x * cy + direction.z * sy,
    direction.y,
    -direction.x * sy + direction.z * cy
  );

  float longitude = atan(direction.x, direction.z);
  float latitude = asin(clamp(direction.y, -1.0, 1.0));
  vec2 panoUv = vec2(
    fract(longitude / (2.0 * PI) + 1.0),
    clamp(0.5 + latitude / PI, 0.001, 0.999)
  );

  gl_FragColor = texture2D(u_panorama, panoUv);
}
`;

const SCENES = [
  {
    id: 'field',
    name: 'GAP 药田',
    icon: 'sprout',
    image: `${VR_ASSET_BASE_URL}/field-panorama.png`
  },
  {
    id: 'workshop',
    name: '净选加工',
    icon: 'factory',
    image: `${VR_ASSET_BASE_URL}/workshop-panorama.png`
  },
  {
    id: 'lab',
    name: '检测仓储',
    icon: 'shield',
    image: `${VR_ASSET_BASE_URL}/lab-panorama.png`
  }
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeAngle(value) {
  return ((value % 360) + 360) % 360;
}

Page({
  data: {
    scene: SCENES[0],
    scenes: SCENES,
    photoOk: true,
    canvasLoading: true
  },

  onLoad() {
    this.viewYaw = DEFAULT_YAW;
    this.viewPitch = DEFAULT_PITCH;
    this.viewFov = CAMERA_FOV;
  },

  onReady() {
    this.initCanvas();
  },

  onUnload() {
    this.clearImageLoadTimer();
    this.disposeWebGL();
    this.canvas = null;
    this.gl = null;
    this.panoramaImage = null;
    this.loadingImage = null;
  },

  initCanvas() {
    wx.createSelectorQuery()
      .in(this)
      .select('#vrCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const info = res && res[0];
        if (!info || !info.node) {
          this.setData({ photoOk: false, canvasLoading: false });
          return;
        }

        const systemInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
        const dpr = systemInfo.pixelRatio || 1;
        const canvas = info.node;
        const gl = canvas.getContext('webgl', { antialias: true, alpha: false })
          || canvas.getContext('experimental-webgl', { antialias: true, alpha: false });

        this.canvas = canvas;
        this.canvasCssWidth = info.width || 375;
        this.canvasCssHeight = info.height || Math.round(this.canvasCssWidth * VIEW_HEIGHT / VIEW_WIDTH);

        canvas.width = Math.round(this.canvasCssWidth * dpr);
        canvas.height = Math.round(this.canvasCssHeight * dpr);

        if (!gl || !this.setupWebGL(gl)) {
          this.setData({ photoOk: false, canvasLoading: false });
          return;
        }

        this.loadSceneImage(this.data.scene);
      });
  },

  setupWebGL(gl) {
    const program = this.createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    if (!program) return false;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        1, 1
      ]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([30, 23, 17, 255])
    );

    this.gl = gl;
    this.program = program;
    this.positionBuffer = positionBuffer;
    this.texture = texture;
    this.uniforms = {
      panorama: gl.getUniformLocation(program, 'u_panorama'),
      yaw: gl.getUniformLocation(program, 'u_yaw'),
      pitch: gl.getUniformLocation(program, 'u_pitch'),
      fov: gl.getUniformLocation(program, 'u_fov'),
      viewRatio: gl.getUniformLocation(program, 'u_viewRatio')
    };

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.clearColor(0.118, 0.09, 0.067, 1);
    return true;
  },

  createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('VR shader compile failed:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  },

  createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('VR shader link failed:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    return program;
  },

  uploadTexture(image) {
    const gl = this.gl;
    if (!gl || !this.texture) return false;

    try {
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.textureReady = true;
      return true;
    } catch (err) {
      console.warn('VR texture upload failed:', err);
      this.textureReady = false;
      return false;
    }
  },

  disposeWebGL() {
    const gl = this.gl;
    if (!gl) return;

    if (this.texture) gl.deleteTexture(this.texture);
    if (this.positionBuffer) gl.deleteBuffer(this.positionBuffer);
    if (this.program) gl.deleteProgram(this.program);

    this.texture = null;
    this.positionBuffer = null;
    this.program = null;
    this.textureReady = false;
  },

  clearImageLoadTimer() {
    if (this.imageLoadTimer) {
      clearTimeout(this.imageLoadTimer);
      this.imageLoadTimer = null;
    }
  },

  failSceneImage(token, reason) {
    if (this.imageToken !== token) return;
    this.imageToken = '';
    this.clearImageLoadTimer();
    this.panoramaImage = null;
    this.loadingImage = null;
    this.textureReady = false;
    if (reason) console.warn('VR panorama load failed:', reason);
    this.setData({ photoOk: false, canvasLoading: false });
  },

  loadCanvasImage(src, token) {
    const image = this.canvas.createImage();
    this.loadingImage = image;

    image.onload = () => {
      if (this.imageToken !== token) return;
      this.clearImageLoadTimer();
      if (!this.uploadTexture(image)) {
        this.failSceneImage(token, 'texture upload failed');
        return;
      }

      this.panoramaImage = image;
      this.loadingImage = null;
      this.panoramaWidth = image.width;
      this.panoramaHeight = image.height;
      this.imageToken = '';
      this.setData({ photoOk: true, canvasLoading: false });
      this.renderView();
    };

    image.onerror = (err) => {
      this.failSceneImage(token, err && err.errMsg ? err.errMsg : 'canvas image error');
    };

    image.src = src;
  },

  loadSceneImage(scene) {
    if (!this.canvas || !this.gl || !scene || !scene.image) return;

    const token = `${scene.id}-${Date.now()}`;
    this.imageToken = token;
    this.textureReady = false;
    this.clearImageLoadTimer();
    this.setData({ photoOk: true, canvasLoading: true });

    this.imageLoadTimer = setTimeout(() => {
      this.failSceneImage(token, 'timeout');
    }, IMAGE_LOAD_TIMEOUT);

    if (/^https?:\/\//i.test(scene.image) && wx.downloadFile) {
      wx.downloadFile({
        url: scene.image,
        timeout: IMAGE_LOAD_TIMEOUT,
        success: (res) => {
          if (this.imageToken !== token) return;
          if (res.statusCode >= 200 && res.statusCode < 300 && res.tempFilePath) {
            this.loadCanvasImage(res.tempFilePath, token);
            return;
          }
          this.failSceneImage(token, `HTTP ${res.statusCode || 'unknown'}`);
        },
        fail: (err) => {
          this.failSceneImage(token, err && err.errMsg ? err.errMsg : 'download failed');
        }
      });
      return;
    }

    this.loadCanvasImage(scene.image, token);
  },

  switchScene(e) {
    const id = e.currentTarget.dataset.id;
    const scene = SCENES.find(item => item.id === id) || SCENES[0];

    this.viewYaw = DEFAULT_YAW;
    this.viewPitch = DEFAULT_PITCH;
    this.viewFov = CAMERA_FOV;
    this.setData({ scene });
    this.loadSceneImage(scene);
  },

  onTouchStart(e) {
    const touches = e.touches || [];
    const touch = touches[0];
    if (!touch) return;

    if (touches.length > 1) {
      this.touchMode = 'pinch';
      this.startDistance = this.getTouchDistance(touches[0], touches[1]);
      this.startFov = typeof this.viewFov === 'number' ? this.viewFov : CAMERA_FOV;
      return;
    }

    this.touchMode = 'drag';
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.startYaw = typeof this.viewYaw === 'number' ? this.viewYaw : DEFAULT_YAW;
    this.startPitch = typeof this.viewPitch === 'number' ? this.viewPitch : DEFAULT_PITCH;
  },

  onTouchMove(e) {
    const touches = e.touches || [];
    const touch = touches[0];
    if (!touch) return;

    if (touches.length > 1 && this.touchMode === 'pinch' && this.startDistance) {
      const distance = this.getTouchDistance(touches[0], touches[1]);
      const scale = distance / this.startDistance;
      this.viewFov = clamp(this.startFov / Math.max(0.4, scale), MIN_CAMERA_FOV, MAX_CAMERA_FOV);
      this.scheduleRender();
      return;
    }

    if (this.touchMode !== 'drag') return;

    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;

    this.viewYaw = normalizeAngle(this.startYaw - deltaX * 0.32);
    this.viewPitch = clamp(this.startPitch + deltaY * 0.10, -MAX_PITCH, MAX_PITCH);
    this.scheduleRender();
  },

  onTouchEnd() {
    this.touchMode = '';
    this.startDistance = 0;
  },

  getTouchDistance(a, b) {
    if (!a || !b) return 0;
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  },

  scheduleRender() {
    if (!this.textureReady || this.renderPending) return;

    this.renderPending = true;
    const render = () => {
      this.renderPending = false;
      this.renderView();
    };

    if (this.canvas && this.canvas.requestAnimationFrame) {
      this.canvas.requestAnimationFrame(render);
    } else {
      setTimeout(render, 16);
    }
  },

  renderView() {
    if (!this.gl || !this.program || !this.textureReady) return;

    const gl = this.gl;
    const canvas = this.canvas;
    const width = canvas && canvas.width ? canvas.width : 1;
    const height = canvas && canvas.height ? canvas.height : 1;
    const cssWidth = this.canvasCssWidth || 375;
    const cssHeight = this.canvasCssHeight || Math.round(cssWidth * VIEW_HEIGHT / VIEW_WIDTH);

    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.uniforms.panorama, 0);
    gl.uniform1f(this.uniforms.yaw, normalizeAngle(this.viewYaw) * DEG_TO_RAD);
    gl.uniform1f(this.uniforms.pitch, clamp(this.viewPitch, -MAX_PITCH, MAX_PITCH) * DEG_TO_RAD);
    gl.uniform1f(this.uniforms.fov, clamp(this.viewFov || CAMERA_FOV, MIN_CAMERA_FOV, MAX_CAMERA_FOV) * DEG_TO_RAD);
    gl.uniform1f(this.uniforms.viewRatio, cssHeight / cssWidth);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
});
