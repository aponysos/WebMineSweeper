window.addEventListener("load", drawBoard, true);

function drawBoard() {
  var element = document.getElementById("map");
  var ctx = element.getContext("2d");

  ctx.strokeStyle = "black";
  ctx.beginPath();
  var sz = 40, maxx = 5, maxy = 5;
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
