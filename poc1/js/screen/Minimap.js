const Minimap = (function () {
  let cx = 0;
  let cy = 0;

  let width = 0;
  let height = 0;

  // position of player
  let p_cx = 0;
  let p_cy = 0;

  function playerPosition(x, y) {
    const qx = x / 1024;
    const qy = y / 1024;
    p_cx = (qx * width) + cx;
    p_cy = (qy * height) + cy;
  }

  let minimap3 = new Image();


  function drawMinimap(ctx) {
    ctx.beginPath();
    ctx.drawImage(minimap3, cx, cy, width, height);
    if (p_cx <= 1024 && p_cx >= cx && p_cy <= height && p_cy >= 0) {
      ctx.beginPath();
      ctx.fillStyle = '#ff0000';
      ctx.rect(p_cx, p_cy, 10, 10);
      ctx.fill();
    }
  }


  function update(du) {
    cx = (g_viewport.getIW() / 4) * 3;
    cy = 0;
    width = g_viewport.getIW() / 4;
    height = g_viewport.getIH() / 4;
  }

  function render(ctx) {
    if (g_master.map.name === 'map3') {
      ctx.globalAlpha = 0.5;
      drawMinimap(ctx);
    }

    // get images
    minimap3 = g_asset.raw.image.minimap3;
  }


  return {
    update,
    render,
    playerPosition,
  };
}());