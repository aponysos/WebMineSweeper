var sz = 20, maxx = 5, maxy = 5;
var inMaxx, inMaxy, btnReset;
var elemBoard, ctx;
var arSquares = [];
const ST_NONE = 0;
const ST_MINE = -1;
const MINE_RATE = 0.15;
const arMoves = [
  { i: -1, j: -1 },
  { i: 0, j: -1 },
  { i: 1, j: -1 },
  { i: 1, j: 0 },
  { i: 1, j: 1 },
  { i: 0, j: 1 },
  { i: -1, j: 1 },
  { i: -1, j: 0 }
];
const bgStyle = "#FFFFFF";

window.onload = function () {
  // initialize input & button elements
  inMaxx = document.getElementById("inMaxx");
  inMaxy = document.getElementById("inMaxy");
  btnReset = document.getElementById("btnReset");

  // register button event
  btnReset.onclick = function (e) {
    //console.log("btnReset onclick: e.button = " + e.button + " e.buttons = " + e.buttons);
    resetBoard();
  }

  // initialize board element & 2d-context
  elemBoard = document.getElementById("board");
  ctx = elemBoard.getContext("2d");

  // disable context menu
  elemBoard.oncontextmenu = function (e) {
    e.preventDefault();
  };

  // register mouse event
  elemBoard.onmousedown = function (e) {
    //console.log("onmousedown: e.button = " + e.button + " e.buttons = " + e.buttons);
    var canvasXY = getCanvasXY(elemBoard, e.clientX, e.clientY);
    var pos = xy2pos(canvasXY);
    if (e.button == 2) // right button
      rightClicked(pos);
  }

  elemBoard.onmouseup = function (e) {
    //console.log("onmouseup: e.button = " + e.button + " e.buttons = " + e.buttons);
    var canvasXY = getCanvasXY(elemBoard, e.clientX, e.clientY);
    var pos = xy2pos(canvasXY);
    if (e.buttons == 1 || e.buttons == 2) // left & right buttons
      lrClicked(pos);
  }

  elemBoard.onclick = function (e) {
    //console.log("onclick: e.button = " + e.button + " e.buttons = " + e.buttons);
    var canvasXY = getCanvasXY(elemBoard, e.clientX, e.clientY);
    var pos = xy2pos(canvasXY);
    if (e.button == 0) // left button
      leftClicked(pos);
  };

  resetBoard();
};

function leftClicked(pos) {
  var stack = [pos], todraw = [pos];
  while (stack.length > 0) {
    var curPos = stack.pop();
    var curSq = arSquares[curPos.i][curPos.j];
    if (!curSq.revealed) {
      // reveal current square
      curSq.revealed = true;
      if (!todraw.includes(curPos))
        todraw.push(curPos);
      // push ajacent squares
      if (curSq.state == ST_NONE)
        for (var m in arMoves) {
          var nextPos = { i: curPos.i + arMoves[m].i, j: curPos.j + arMoves[m].j };
          if (checkBound(nextPos))
            stack.push(nextPos);
        }
    }
  }

  drawSquares(todraw);
  // boom?
}

function rightClicked(pos) {
  var sq = arSquares[pos.i][pos.j];
  if (!sq.revealed)
    sq.flag = !sq.flag;

  drawSquare(pos);
}

function lrClicked(pos) {
  var sq = arSquares[pos.i][pos.j];
  if (sq.revealed && sq.state > 0) {
    if (countAjacentFlagsAndMines(pos) == sq.state) {
      for (var m in arMoves) {
        var nextPos = { i: pos.i + arMoves[m].i, j: pos.j + arMoves[m].j };
        if (checkBound(nextPos)) {
          var nextSq = arSquares[nextPos.i][nextPos.j];
          if (!nextSq.flag) {
            nextSq.revealed = true;
            drawSquare(nextPos);
          }
        }
      }
    }
  }
}

function resetBoard() {
  // read maxx & maxy from inputs
  maxx = inMaxx.value;
  maxy = inMaxy.value;

  // set board's size
  elemBoard.width = sz * maxx;
  elemBoard.height = sz * maxy;

  // init squares
  initSquares();

  // draw the board & all squares
  drawBoard();
  for (var i = 0; i < maxx; ++i)
    for (var j = 0; j < maxy; ++j)
      drawSquare({ i, j });
}

function drawBoard() {
  ctx.strokeStyle = "black";
  ctx.beginPath();
  // vertical
  for (var i = 0; i < maxx; ++i) {
    ctx.moveTo(i * sz, 0);
    ctx.lineTo(i * sz, maxy * sz);
  }
  // horizontal
  for (var i = 0; i < maxy; ++i) {
    ctx.moveTo(0, i * sz);
    ctx.lineTo(maxx * sz, i * sz);
  }
  ctx.stroke();
}

function drawSquares(arPos) {
  for (var pos in arPos)
    drawSquare(arPos[pos]);
}

function drawSquare(pos) {
  var sq = arSquares[pos.i][pos.j];
  var tip = '';
  if (sq.revealed)
    tip = (sq.state == ST_MINE ? '*' : sq.state);
  else if (sq.flag)
    tip = 'F';

  drawTip(pos, tip);
}

function drawTip(pos, tip) {
  var sq = arSquares[pos.i][pos.j];
  var xy = pos2xy(pos);

  ctx.fillStyle = bgStyle;
  ctx.fillRect(xy.x, xy.y, sz - 1, sz - 1);
  ctx.font = "bold 28px 黑体";
  ctx.fillStyle = "black";
  ctx.fillText(tip, xy.x, xy.y + 20);
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
  // pass 1: random mines
  for (var i = 0; i < maxx; ++i) {
    arSquares[i] = [];
    for (var j = 0; j < maxy; ++j)
      arSquares[i][j] = createSquare(Math.random() < MINE_RATE ? ST_MINE : ST_NONE);
  }

  // pass 2: count ajacent mines
  for (var i = 0; i < maxx; ++i) {
    for (var j = 0; j < maxy; ++j)
      if (arSquares[i][j].state == ST_NONE)
        arSquares[i][j].state = countAjacentMines({ i, j });
  }
}

function createSquare(state) {
  var sq = new Object();
  sq.state = state;
  sq.revealed = false;
  sq.flag = false;
  return sq;
}

function countAjacentMines(pos) {
  return countAjacent(pos, function (next) {
    var sq = arSquares[next.i][next.j];
    return sq.state == ST_MINE;
  });
}

function countAjacentFlagsAndMines(pos) {
  return countAjacent(pos, function (next) {
    var sq = arSquares[next.i][next.j];
    return (sq.revealed && sq.state == ST_MINE) || (!sq.revealed && sq.flag);
  });
}

function countAjacent(pos, pred) {
  var count = 0;
  for (var m in arMoves) {
    var next = { i: pos.i + arMoves[m].i, j: pos.j + arMoves[m].j };
    if (checkBound(next))
      if (pred(next))
        ++count;
  }
  return count;
}
