/**
 * Mentara Labs | Learning Profile Check
 * Complete-the-Drawing Canvas Component
 * 
 * Safety & Ethics:
 * - Stored for human teacher review only.
 * - Never auto-scored by algorithm.
 * - Touch & stylus responsive.
 */

export const DrawingCanvas = {
  canvas: null,
  ctx: null,
  isDrawing: false,
  color: '#26333A',
  lineWidth: 4,
  history: [],

  init(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.setupResolution();
    this.renderStarterLines();
    this.attachEvents();
  },

  setupResolution() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  },

  renderStarterLines() {
    const width = this.canvas.getBoundingClientRect().width;
    const height = this.canvas.getBoundingClientRect().height;

    this.ctx.clearRect(0, 0, width, height);

    // Warm soft paper background
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, width, height);

    // Friendly starter prompt lines (two gentle organic curves)
    this.ctx.strokeStyle = '#8FA998';
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.arc(width * 0.35, height * 0.45, 36, 0.2 * Math.PI, 1.2 * Math.PI);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(width * 0.6, height * 0.6);
    this.ctx.quadraticCurveTo(width * 0.75, height * 0.3, width * 0.8, height * 0.55);
    this.ctx.stroke();

    this.saveState();
  },

  saveState() {
    if (this.history.length > 20) this.history.shift();
    this.history.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
  },

  undo() {
    if (this.history.length > 1) {
      this.history.pop();
      const lastState = this.history[this.history.length - 1];
      this.ctx.putImageData(lastState, 0, 0);
    }
  },

  clear() {
    this.renderStarterLines();
  },

  attachEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startDraw = (e) => {
      e.preventDefault();
      this.isDrawing = true;
      const pos = getPos(e);
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
    };

    const stopDraw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      this.isDrawing = false;
      this.ctx.closePath();
      this.saveState();
    };

    // Pointer / Touch / Mouse
    this.canvas.addEventListener('mousedown', startDraw);
    this.canvas.addEventListener('mousemove', draw);
    this.canvas.addEventListener('mouseup', stopDraw);
    this.canvas.addEventListener('mouseleave', stopDraw);

    this.canvas.addEventListener('touchstart', startDraw, { passive: false });
    this.canvas.addEventListener('touchmove', draw, { passive: false });
    this.canvas.addEventListener('touchend', stopDraw);
  },

  setColor(color) {
    this.color = color;
  },

  getDataUrl() {
    return this.canvas.toDataURL('image/png');
  }
};
