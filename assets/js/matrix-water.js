// Matrix-water background: a grid of glyphs whose brightness follows a 2D
// water-wave simulation. Drops fall on their own; the pointer and clicks
// make ripples.
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var CELL = 10;          // px per glyph cell
  var FPS = 30;
  var DAMPING = 0.985;    // lower = ripples die faster
  var GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789<>/\\{}=+*";
  var BASE_ALPHA = 0.10;  // resting brightness of the "still water"
  var RADIUS = 22;        // spotlight radius around the cursor, in cells

  // Cursor position (grid coords) and a 0..1 "focus" that fades the whole
  // effect in when the pointer is over the page and out when it leaves.
  var mx = -999, my = -999, focus = 0, focusTarget = 0;

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;";
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext("2d");

  // Colour ramp: dim green -> theme green -> pale crest highlight.
  var LEVELS = 24;
  var ramp = [];
  for (var i = 0; i < LEVELS; i++) {
    var t = i / (LEVELS - 1);
    var r = Math.round(14 + 190 * Math.pow(t, 2.2));
    var g = Math.round(210 + 45 * Math.pow(t, 2.2));
    var b = Math.round(0 + 190 * Math.pow(t, 2.2));
    var a = BASE_ALPHA + (1 - BASE_ALPHA) * t;
    ramp.push("rgba(" + r + "," + g + "," + b + "," + a.toFixed(3) + ")");
  }

  var cols, rows, cur, prev, glyph, dpr;

  function rndGlyph() {
    return GLYPHS.charAt((Math.random() * GLYPHS.length) | 0);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth, h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(w / CELL) + 2;
    rows = Math.ceil(h / CELL) + 2;
    cur = new Float32Array(cols * rows);
    prev = new Float32Array(cols * rows);
    glyph = new Array(cols * rows);
    for (var i = 0; i < glyph.length; i++) glyph[i] = rndGlyph();
    ctx.font = CELL - 2 + "px monospace";
    ctx.textBaseline = "top";
  }

  function drop(cx, cy, strength) {
    var r = 3;
    for (var y = -r; y <= r; y++) {
      for (var x = -r; x <= r; x++) {
        var gx = cx + x, gy = cy + y;
        if (gx < 1 || gy < 1 || gx >= cols - 1 || gy >= rows - 1) continue;
        var f = 1 - Math.sqrt(x * x + y * y) / (r + 0.5);
        if (f > 0) cur[gy * cols + gx] += strength * f;
      }
    }
  }

  function step() {
    // Classic two-buffer height-field: new = avg(neighbours)*2 - old.
    for (var y = 1; y < rows - 1; y++) {
      for (var x = 1; x < cols - 1; x++) {
        var i = y * cols + x;
        var n = (cur[i - 1] + cur[i + 1] + cur[i - cols] + cur[i + cols]) * 0.5 - prev[i];
        prev[i] = n * DAMPING;
      }
    }
    var tmp = cur; cur = prev; prev = tmp;
  }

  function draw(time) {
    var w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);
    if (focus < 0.01) return;
    var last = -1;
    var swell = time * 0.0004;
    var reach = RADIUS * 2;
    var y0 = Math.max(1, (my - reach) | 0), y1 = Math.min(rows - 1, (my + reach) | 0);
    var x0 = Math.max(1, (mx - reach) | 0), x1 = Math.min(cols - 1, (mx + reach) | 0);
    for (var y = y0; y < y1; y++) {
      for (var x = x0; x < x1; x++) {
        var dx = x - mx, dy = y - my;
        // Gaussian falloff: bright at the cursor, invisible a few radii out.
        var mask = Math.exp(-(dx * dx + dy * dy) / (RADIUS * RADIUS)) * focus;
        if (mask < 0.02) continue;
        ctx.globalAlpha = mask;
        var i = y * cols + x;
        // Slope of the surface lights the crests; slow sine adds ambient sheen.
        var slope = Math.abs(cur[i + 1] - cur[i - 1]) + Math.abs(cur[i + cols] - cur[i - cols]);
        var sheen = 0.5 + 0.5 * Math.sin(x * 0.12 + y * 0.07 + swell * 3 + Math.sin(y * 0.05 + swell));
        var v = Math.abs(cur[i]) * 0.9 + slope * 0.6 + sheen * 0.12;
        var lvl = (Math.min(v, 1) * (LEVELS - 1)) | 0;
        // Re-roll glyphs on active water so the surface "boils" with code.
        if (lvl > 3 && Math.random() < 0.25) glyph[i] = rndGlyph();
        else if (Math.random() < 0.002) glyph[i] = rndGlyph();
        if (lvl !== last) { ctx.fillStyle = ramp[lvl]; last = lvl; }
        ctx.fillText(glyph[i], (x - 1) * CELL, (y - 1) * CELL);
      }
    }
    ctx.globalAlpha = 1;
  }

  var lastMove = 0;
  window.addEventListener("pointermove", function (e) {
    var now = performance.now();
    if (now - lastMove < 16) return;
    lastMove = now;
    mx = (e.clientX / CELL | 0) + 1;
    my = (e.clientY / CELL | 0) + 1;
    focusTarget = 1;
    drop(mx, my, 0.5);
  }, { passive: true });
  window.addEventListener("pointerdown", function (e) {
    drop((e.clientX / CELL | 0) + 1, (e.clientY / CELL | 0) + 1, 3);
  }, { passive: true });
  document.documentElement.addEventListener("mouseleave", function () {
    focusTarget = 0;
  });
  window.addEventListener("resize", resize);

  resize();

  var interval = 1000 / FPS, then = 0, nextRain = 0;
  function frame(time) {
    requestAnimationFrame(frame);
    if (document.hidden || time - then < interval) return;
    then = time;
    focus += (focusTarget - focus) * 0.12;
    // Ambient drops fall only around the cursor, so the water stays local.
    if (focusTarget && time > nextRain) {
      var a = Math.random() * Math.PI * 2, d = Math.random() * RADIUS * 0.8;
      drop((mx + Math.cos(a) * d) | 0, (my + Math.sin(a) * d) | 0, 1 + Math.random() * 1.5);
      nextRain = time + 200 + Math.random() * 500;
    }
    step();
    draw(time);
  }
  requestAnimationFrame(frame);
})();
