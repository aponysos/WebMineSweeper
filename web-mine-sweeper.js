var sz = 20, maxx = 5, maxy = 5;
var board, ctx;

window.onload = function () {
  // initialize board element & 2d-context
  board = document.getElementById("board");
  ctx = board.getContext("2d");

  // set board's size
  board.width = sz * maxx;
  board.height = sz * maxy;

  // disable context menu
  board.oncontextmenu = function (e) {
    e.preventDefault();
  };

  // register mouse-up event
  board.onmouseup = function (e) {
    if (e.button == 0)
      leftClicked(getSquarePos(board, e));
    else if (e.button == 2)
      rightClicked(getSquarePos(board, e));
  };

  // draw the whole board
  drawBoard();
};

function getSquarePos(canvas, e) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor((e.clientX - rect.left * (canvas.width / rect.width)) / sz),
    y: Math.floor((e.clientY - rect.top * (canvas.height / rect.height)) / sz)
  };
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
}

function leftClicked(pos) {
  alert("leftClicked: " + pos.x + " " + pos.y);
}

function rightClicked(pos) {
  alert("rightClicked: " + pos.x + " " + pos.y);
}
