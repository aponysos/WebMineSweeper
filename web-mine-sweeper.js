var maxx, maxy;
var sz = 20, tipsPadding = 4;
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

///////////////////////////////////////////////////////////////////////////////
// window loader
///////////////////////////////////////////////////////////////////////////////
window.onload = function () {
  // initialize input & button elements
  inMaxx = document.getElementById("inMaxx");
  inMaxy = document.getElementById("inMaxy");
  btnReset = document.getElementById("btnReset");

  // register button event
  btnReset.onclick = function (e) {
    resetBoard();
  }

  // initialize board element & 2d-context
  elemBoard = document.getElementById("board");
  ctx = elemBoard.getContext("2d");

  // disable context menu
  elemBoard.oncontextmenu = function (e) {
    e.preventDefault();
  };

  // register mouse events
  elemBoard.onmousedown = function (e) {
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

  // first-time reset board
  resetBoard();
};

///////////////////////////////////////////////////////////////////////////////
// events handlers
///////////////////////////////////////////////////////////////////////////////
function leftClicked(pos) {
  console.log("leftClicked: " + pos.i + ", " + pos.j);

  var stack = [pos], redraw = [pos];
  while (stack.length > 0) {
    var curPos = stack.pop();
    var curSq = arSquares[curPos.i][curPos.j];
    if (!curSq.revealed) {
      // reveal current square
      curSq.revealed = true;
      curSq.flag = false;
      if (!redraw.includes(curPos))
        redraw.push(curPos);
      // push ajacent squares
      if (curSq.state == ST_NONE)
        for (var m in arMoves) {
          var nextPos = { i: curPos.i + arMoves[m].i, j: curPos.j + arMoves[m].j };
          if (checkBound(nextPos))
            stack.push(nextPos);
        }
    }
  }

  // redraw squares
  drawSquares(redraw);

  checkBombOrDone();
}

function rightClicked(pos) {
  console.log("rightClicked: " + pos.i + ", " + pos.j);

  var sq = arSquares[pos.i][pos.j];
  if (!sq.revealed)
    sq.flag = !sq.flag;

  drawSquare(pos);

  checkBombOrDone();
}

function lrClicked(pos) {
  console.log("lrClicked: " + pos.i + ", " + pos.j);

  var sq = arSquares[pos.i][pos.j];
  if (sq.revealed && sq.state > 0) {
    if (countAjacentFlagsAndMines(pos) == sq.state) {
      for (var m in arMoves) {
        var nextPos = { i: pos.i + arMoves[m].i, j: pos.j + arMoves[m].j };
        if (checkBound(nextPos)) {
          var nextSq = arSquares[nextPos.i][nextPos.j];
          if (!nextSq.flag) {
            nextSq.revealed = true;
            nextSq.flag = false;
            drawSquare(nextPos);
          }
        }
      }
    }
  }

  checkBombOrDone();
}

///////////////////////////////////////////////////////////////////////////////
// UI functions
///////////////////////////////////////////////////////////////////////////////
function resetBoard() {
  // read maxx & maxy from inputs
  maxx = inMaxx.value;
  maxy = inMaxy.value;

  console.log("resetBoard: maxx = " + maxx + ", maxy = " + maxy);

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
  ctx.font = "bold 18px 微软雅黑";
  ctx.fillStyle = getTipStyle(tip);
  ctx.fillText(tip, xy.x + tipsPadding, xy.y + sz - tipsPadding);
}

function getTipStyle(tip) {
  const tipStyles = [
    "#EEEEEE", 
    "#00C0C0", "#C000C0", "#C0C000", "#008080", 
    "#800080", "#808000", "#404000", "#004040"
    ];
  switch (tip) {
    case 'F':
      return "red";
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
      return tipStyles[tip];
    default:
      return "black";
  }
}

///////////////////////////////////////////////////////////////////////////////
// Utility functions
///////////////////////////////////////////////////////////////////////////////
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

///////////////////////////////////////////////////////////////////////////////
// Logic functions
///////////////////////////////////////////////////////////////////////////////
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

function revealSquare(pos) {

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

function checkBombOrDone() {
  if (isBombed())
    alert("Bombed!");
  else if (isDone())
    alert("Done!");
}

function isBombed() {
  for (var i = 0; i < maxx; ++i)
    for (var j = 0; j < maxy; ++j)
      if (arSquares[i][j].revealed && arSquares[i][j].state == ST_MINE)
        return true;
  return false;
}

function isDone() {
  for (var i = 0; i < maxx; ++i)
    for (var j = 0; j < maxy; ++j)
      if (!arSquares[i][j].revealed && 
        (!arSquares[i][j].flag || arSquares[i][j].state != ST_MINE)
        )
        return false;
  return true;
}
