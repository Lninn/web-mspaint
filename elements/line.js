import { isPointInsideRotatedRect, getParallelLines } from '../shared';
import { context as ctx } from '../context';

export class Line {
  start;
  end;

  theme = { strokeStyle: "red" };

  lines = [];
  vectors = [];

  app;

  constructor(app, point) {
    this.app = app;

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

    var [l2, l3] = lines;
    this.vectors = [l2.start, l2.end, l3.end, l3.start];
  }

  // 主要是判断当前数据是否构成一个合适的矩形
  isRightShape() {
    var onX = this.start.x !== this.end.x;
    var onY = this.start.y !== this.end.y;

    return onX && onY;
  }

  draw() {
    this.drawLine();
    this.drawParallelLines();

    var current = this.app.mouseInfo.current;
    ctx.save();
    for (const target of this.vectors) {
      ctx.beginPath(); // Start a new path
      ctx.moveTo(current?.x, current?.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = 'gray';
      ctx.stroke();
    }
    ctx.restore();
  }

  drawLine() {
    ctx.save();
    ctx.beginPath(); // Start a new path
    ctx.moveTo(this.start.x, this.start.y);
    ctx.lineTo(this.end.x, this.end.y);
    ctx.strokeStyle = this.theme.strokeStyle;
    ctx.stroke();
    ctx.restore();
  }

  drawParallelLines() {
    var [firstPoint, ...restPoints] = this.vectors;
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
