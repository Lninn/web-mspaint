import './style.css'
// import javascriptLogo from './javascript.svg'
// import viteLogo from '/vite.svg'


var sel = (e) => document.querySelector(e);

var canvas = sel("#app");
var ctx = canvas.getContext("2d");

canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;


// https://zhuanlan.zhihu.com/p/605878598
function isPointInsideRotatedRect(pt, p1, p2) {
    // 计算矩形的中心点
    const centerX = (p1.x + p2.x) / 2;
    const centerY = (p1.y + p2.y) / 2;

    // 计算矩形的宽度和高度
    const width = Math.abs(p2.x - p1.x);
    const height = Math.abs(p2.y - p1.y);

    // 计算旋转角度
    let angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);

    // 平移点到矩形中心
    const translatedX = pt.x - centerX;
    const translatedY = pt.y - centerY;

    // 逆向旋转点
    const cosAngle = Math.cos(-angle * Math.PI / 180);
    const sinAngle = Math.sin(-angle * Math.PI / 180);
    const rotatedX = translatedX * cosAngle - translatedY * sinAngle;
    const rotatedY = translatedX * sinAngle + translatedY * cosAngle;

    // 检查点是否在矩形内
    return Math.abs(rotatedX) <= width / 2 && Math.abs(rotatedY) <= height / 2;
}

// get the area of rect by three points a b c
function getTriangleArea(a, b, c) {
  var { x: x1, y: y1 } = a;
  var { x: x2, y: y2 } = b;
  var { x: x3, y: y3 } = c;
  //b.x * a.y - a.x * b.y + (c.x * b.y - b.x * c.y) + (a.x * c.y - c.x * a.y)
  var val = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2);
  return Math.abs(val) / 2;
}

function getNormalRect(a1, a2) {
  var x = Math.min(a1.x, a2.x);
  var y = Math.min(a1.y, a2.y);
  var w = Math.abs(a1.x - a2.x);
  var h = Math.abs(a1.y - a2.y);

  return { x, y, w, h };
}

function getCanvasPoint(evt) {
  var offsetLeft = canvas.offsetLeft;
  var offsetTop = canvas.offsetTop;

  var x = evt.pageX - offsetLeft;
  var y = evt.pageY - offsetTop;

  return { x, y };
}

function getParallelLines(m, n) {
  // 计算方向向量v
  const v = { x: n.x - m.x, y: n.y - m.y };

  // 计算单位法线向量
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  const normal = { x: -v.y / len, y: v.x / len };

  // 偏移距离
  const d = 45;

  // 计算l2和l3的端点
  const m2 = { x: m.x + d * normal.x, y: m.y + d * normal.y };
  const n2 = { x: n.x + d * normal.x, y: n.y + d * normal.y };
  const m3 = { x: m.x - d * normal.x, y: m.y - d * normal.y };
  const n3 = { x: n.x - d * normal.x, y: n.y - d * normal.y };

  return [
    { start: m2, end: n2 },
    { start: m3, end: n3 }
  ];
}

class UI {
  key = "pointer";
  elements = [];
  constructor() {
    var tool = sel("#tool");
    this.elements = Array.from(tool.children);

    this.bindEvt();
    this.activeSwitch(this.key);
  }

  bindEvt() {
    this.elements.map((element) => {
      element.addEventListener("click", () => {
        var key = element.dataset.key;

        this.key = key;
        this.activeSwitch(key);
      });
    });
  }

  activeSwitch(currentKey) {
    var clsName = "active";
    this.elements.map((element) => {
      var key = element.dataset.key;
      if (key === currentKey) {
        element.classList.add(clsName);
      } else {
        element.classList.remove(clsName);
      }
    });
  }
}

function createApp() {
  const app = {
    isDebug: false,

    x: 0,
    y: 0,

    // 当前的光标是否在canvas内（包含）
    flag: false,
    firstDraw: true
  };

  function updateState(x, y) {
    app.x = x;
    app.y = y;
  }

  // 在首次运行时画一个简单的画面，以提示用户应用准备就绪
  // 用户鼠标移动到canvas中后清除
  function draw() {
    if (app.flag && app.isDebug) {
      // Save the current state
      ctx.save();

      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "blue";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.restore();
    }

    if (app.firstDraw) {
      drawStartText();
    }
  }
  function drawStartText() {
    var text = "应用准备就绪";
    var textWidth = ctx.measureText(text).width;

    var x = canvas.width / 2 - textWidth / 2;
    var y = canvas.height / 2;

    ctx.font = "14px serif";
    ctx.fillText(text, x, y);
  }

  function update() {
    var cx = 0 < app.x && app.x < canvas.width;
    var cy = 0 < app.y && app.y < canvas.height;

    app.flag = cx && cy;

    if (app.firstDraw && app.flag) {
      app.firstDraw = false;
    }
  }

  app.updateState = updateState;
  app.update = update;
  app.draw = draw;

  return app;
}

class Line {
  start;
  end;

  theme = { strokeStyle: "red" };

  lines = [];

  constructor(point) {
    this.start = point;
    this.end = point;
  }

  toggle(flag)  {
    this.theme.strokeStyle = flag ? "blue" : "red";
  }

  pointInThisShape(p) {
    // https://stackoverflow.com/questions/17136084/checking-if-a-point-is-inside-a-rotated-rectangle

    var [l2, l3] = this.lines;

    //  △APD, △DPC, △CPB, △PBA.
    //     var APD = getTriangleArea(a, p, d);
    //     var DPC = getTriangleArea(d, p, c);
    //     var CPB = getTriangleArea(c, p, b);
    //     var PBA = getTriangleArea(p, b, a);

    //     var someOfAllShape = APD + DPC + CPB + PBA;

    //     var rectInfo = getNormalRect(a, d);

    return isPointInsideRotatedRect(p, l2.start, l3.end);
  }

  update(end) {
    this.end = end;

    var lines = getParallelLines(this.start, end);
    this.lines = lines;
  }

  // 主要是判断当前数据是否构成一个合适的矩形
  isRightShape() {
    var onX = this.start.x !== this.end.x;
    var onY = this.start.y !== this.end.y;

    return onX && onY;
  }

  draw() {
    ctx.save();
    ctx.beginPath(); // Start a new path
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.end.x, this.end.y);
    ctx.strokeStyle = this.theme.strokeStyle;
    ctx.stroke();
    ctx.restore();

    var [l2, l3] = this.lines;
    var points = [];
    try {
      if (this.lines.length) {
        points = [l2.start, l3.start, l3.end, l2.end];
      }
    } catch (err) {
      console.log("error ", this.lines);
    }

    var [firstPoint, ...restPoints] = points;
    if (firstPoint) {
      ctx.save();
      ctx.strokeStyle = "red";
      ctx.setLineDash([5, 15]);
      ctx.beginPath();
      ctx.moveTo(firstPoint.x, firstPoint.y);

      restPoints.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();

      ctx.stroke();
      ctx.restore();
    }
  }
}

class Rect {
  x = 0;
  y = 0;
  w = 0;
  h = 0;

  start;
  end;
  constructor(point) {
    var { x, y } = point;

    this.x = x;
    this.y = y;

    this.start = point;
    this.end = point;
  }

  pointInThisShape() {
    return false;
  }

  isRightShape() {
    return true;
  }

  update(end) {
    var rectInfo = getNormalRect(this.start, end);

    Object.assign(this, rectInfo);
    this.end = end;
  }

  draw() {
    ctx.beginPath(); // Start a new path
    ctx.strokeStyle = "green";
    ctx.strokeRect(this.x, this.y, this.w, this.h);
  }
}

var uiInstance = new UI();
const app = createApp();

var shape;
var elements = [];

window.elements = elements;

/*

1 从两个点 m、n可以绘制一条直线 l1
2 绘制两条平行于 l1 的两条平行线 l2、l3 分别位于 l1 两侧
3

假定存在一条直线 l1
Ⅰ找到 l1 的法线向量
Ⅱ根据法线向量来计算偏离原始线段的位置

*/

// line
function findElement(p) {
  for (var element of elements) {
    if (element.pointInThisShape(p)) {
      return element;
    }
  }
}

// main
var mouseInfo = {
  last: null,
  current: null
};

window.addEventListener("mousedown", (evt) => {
  var { x, y } = getCanvasPoint(evt);

  mouseInfo.last = {
    x,
    y
  };

  var p = { x, y };
  if (uiInstance.key === "line") {
    shape = new Line(p);
  } else if (uiInstance.key === "rect") {
    shape = new Rect(p);
  }
});

window.addEventListener("mousemove", (evt) => {
  var { x, y } = getCanvasPoint(evt);

  app.updateState(x, y);

  mouseInfo.current = {
    x,
    y
  };

  if (shape) {
    shape.update({ x, y });
  }
});

window.addEventListener("mouseup", (evt) => {
  var { x, y } = getCanvasPoint(evt);

  if (shape) {
    if (shape.isRightShape()) {
      elements.push(shape);
    }
    shape = null;
  }
});
// end main

function drawMouseInfo() {
  const info = {
    x: app.x,
    y: app.y
  };
  var text = JSON.stringify(info);
  ctx.font = "12px serif";

  var textWidth = ctx.measureText(text).width;
  var x = canvas.width - textWidth - 24;
  var y = canvas.height - 24;
  ctx.fillText(text, x, y);
}

var activeElement;
function update() {
  app.update();

  var element = findElement(mouseInfo.current);
  activeElement = element;
  
  for (var e of elements) {
    if (e === activeElement) {
      e.toggle(true)
    } else {
       e.toggle(false)
    }
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function draw() {
  app.draw();
  drawMouseInfo();

  if (shape) {
    shape.draw();
  }

  for (var e of elements) {
    e.draw();
  }
}

function loop() {
  clearCanvas();
  update();
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
