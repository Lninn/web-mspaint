import { getNormalRect } from '../shared';
import { context as ctx } from '../context';

export class Rect {
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
