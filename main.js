import './style.css';
// import javascriptLogo from './javascript.svg'
// import viteLogo from '/vite.svg'

import {
  sel,
  getNormalRect,
  isPointInsideRotatedRect,
  getParallelLines,
  getCanvasPoint
} from './shared';
import { canvas, context as ctx } from './context';

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
  var mouseInfo = {
    last: null,
    current: null
  };

  const app = {
    isDebug: false,

    mouseInfo,

    // 当前的光标是否在canvas内（包含）
    flag: false,
    firstDraw: true
  };

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
    var current = app.mouseInfo.current;
    var cx = 0 < current?.x && current?.x < canvas.width;
    var cy = 0 < current?.y && current?.y < canvas.height;

    app.flag = cx && cy;

    if (app.firstDraw && app.flag) {
      app.firstDraw = false;
    }
  }

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

  toggle(flag) {
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
      console.log("error ", this.lines, err);
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

function onMouseDown(evt) {
  var { x, y } = getCanvasPoint(canvas, evt);

  app.mouseInfo.last = {
    x,
    y
  };

  var p = { x, y };
  if (uiInstance.key === "line") {
    shape = new Line(p);
  } else if (uiInstance.key === "rect") {
    shape = new Rect(p);
  }
}
function onMouseMove(evt) {
  var p = getCanvasPoint(canvas, evt);

  app.mouseInfo.current = p;

  if (shape) {
    shape.update(p);
  }
}
function onMouseUp(evt) {
  var { x, y } = getCanvasPoint(canvas, evt);
  var p = { x, y };

  if (shape) {
    if (shape.isRightShape()) {
      elements.push(shape);
    }
    shape = null;
  }

  console.log(p);
}
window.addEventListener("mousedown", onMouseDown);
window.addEventListener("mousemove", onMouseMove);
window.addEventListener("mouseup", onMouseUp);
// end main

function drawMouseInfo() {
  const info = {
    x: app.x,
    y: app.y
  };
  var text = JSON.stringify(info);
  ctx.font = "24px serif";

  var textWidth = ctx.measureText(text).width;
  var x = canvas.width - textWidth - 24;
  var y = canvas.height - 24;
  ctx.fillStyle = "white";
  ctx.fillText(text, x, y);
}

var activeElement;
function update() {
  app.update();

  var element = findElement(app.mouseInfo.current);
  activeElement = element;

  for (var e of elements) {
    if (e === activeElement) {
      e.toggle(true);
    } else {
      e.toggle(false);
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
