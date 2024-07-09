
export var sel = (e) => document.querySelector(e);

// https://zhuanlan.zhihu.com/p/605878598
export function isPointInsideRotatedRect(pt, p1, p2) {
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
export function getTriangleArea(a, b, c) {
  var { x: x1, y: y1 } = a;
  var { x: x2, y: y2 } = b;
  var { x: x3, y: y3 } = c;
  //b.x * a.y - a.x * b.y + (c.x * b.y - b.x * c.y) + (a.x * c.y - c.x * a.y)
  var val = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2);
  return Math.abs(val) / 2;
}

export function getNormalRect(a1, a2) {
  var x = Math.min(a1.x, a2.x);
  var y = Math.min(a1.y, a2.y);
  var w = Math.abs(a1.x - a2.x);
  var h = Math.abs(a1.y - a2.y);

  return { x, y, w, h };
}

export function getCanvasPoint(canvas, evt) {
  var offsetLeft = canvas.offsetLeft;
  var offsetTop = canvas.offsetTop;

  var x = evt.pageX - offsetLeft;
  var y = evt.pageY - offsetTop;

  return { x, y };
}

export function getParallelLines(m, n) {
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
