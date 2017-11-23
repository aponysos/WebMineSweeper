var sz = 20, maxx = 5, maxy = 5;
var elemBoard, ctx;
var arSquares;
const ST_NONE = 0;
const ST_MINE = -1;
const MINE_RATE = 0.15;
const arMoves = [
  {i: -1, j : -1}, 
  {i: 0, j : -1}, 
  {i: 1, j : -1}, 
  {i: 1, j : 0}, 
  {i: 1, j : 1}, 
  {i: 0, j : 1}, 
  {i: -1, j : 1}, 
  {i: -1, j : 0}
];

window.onload = function () {
  // initialize board element & 2d-context
  elemBoard = document.getElementById("board");
  ctx = elemBoard.getContext("2d");

  // set elemBoard's size
  elemBoard.width = sz * maxx;
  elemBoard.height = sz * maxy;

  // disable context menu
  elemBoard.oncontextmenu = function (e) {
    e.preventDefault();
  };

  // register mouse-up event
  elemBoard.onmouseup = function (e) {
    var canvasXY = getCanvasXY(elemBoard, e.clientX, e.clientY);
    var pos = xy2pos(canvasXY);
    if (e.button == 0)
      leftClicked(pos);
    else if (e.button == 2)
      rightClicked(pos);
  };

  initSquares();

  // draw the whole elemBoard
  drawBoard();
};

function leftClicked(pos) {
  arSquares[pos.i][pos.j].revealed = true;
  drawTip(pos.i, pos.j);
}

function rightClicked(pos) {
  arSquares[pos.i][pos.j].revealed = true;
  drawTip(pos.i, pos.j);
}

function drawBoard() {
  ctx.strokeStyle = "black";
  ctx.beginPath();
  for (var i = 0; i < maxy; ++i) {
    ctx.moveTo(i * sz, 0);
    ctx.lineTo(i * sz, maxy * sz);
  }
  for (var i = 0; i < maxx; ++i) {
    ctx.moveTo(0, i * sz);
    ctx.lineTo(maxx * sz, i * sz);
  }
  ctx.stroke();

  ctx.font = "italic 28px 黑体";
  ctx.fillStyle = "red";
  for (var i = 0; i < maxx; ++i)
    for (var j = 0; j < maxy; ++j)
      drawTip(i, j);
}

function drawTip(i, j) {
  if (arSquares[i][j].revealed) {
    var tip = (arSquares[i][j].state == ST_MINE ? '*' : arSquares[i][j].state);
    var xy = pos2xy({ i, j });
    ctx.fillText(tip, xy.x, xy.y + 20);
  }
}

function getCanvasXY(canvas, x, y) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor((x - rect.left) * (canvas.width / rect.width)),
    y: Math.floor((y - rect.top) * (canvas.height / rect.height))
  };
}

function xy2pos(xy) {
  return {
    i: Math.floor(xy.x / sz),
    j: Math.floor(xy.y / sz)
  };
}

function pos2xy(pos) {
  return {
    x: pos.i * sz,
    y: pos.j * sz
  }
}

function checkBound(pos) {
  return pos.i >= 0 && pos.i < maxx && pos.j >= 0 && pos.j < maxy;
}

function initSquares() {
  arSquares = new Array();
  // pass 1: random mines
  for (var i = 0; i < maxx; ++i) {
    arSquares[i] = new Array();
    for (var j = 0; j < maxy; ++j)
      arSquares[i][j] = createSquare(Math.random() < MINE_RATE ? ST_MINE : ST_NONE, false);
  }
  // pass 2: count ajacent mines
  for (var i = 0; i < maxx; ++i) {
    for (var j = 0; j < maxy; ++j)
      if (arSquares[i][j].state == ST_NONE)
        arSquares[i][j].state = countAjacentMines({ i, j });
  }
}

function createSquare(state, revealed) {
  var sq = new Object();
  sq.state = state;
  sq.revealed = revealed;
  return sq;
}

function countAjacentMines(pos) {
  var count = 0;
  for (var m = 0; m < 8; ++m) {
    var next = {i: pos.i + arMoves[m].i, j: pos.j + arMoves[m].j} 
    if (checkBound(next))
      if (arSquares[next.i][next.j].state == ST_MINE)
        ++count;
  }
  return count;
}
