'use strict';

/* global audioManager g_url Entity NOMINAL_UPDATE_INTERVAL spatialManager
 g_world entityManager g_asset :true */

// A generic contructor which accepts an arbitrary descriptor object
function Bullet(descr) {
  // Common inherited setup logic from Entity
  this.setup(descr);

  audioManager.play(g_url.bulletFire);
}

Bullet.prototype = new Entity();

// Initial, inheritable, default values
Bullet.prototype.rotation = 0;
Bullet.prototype.cx = 200;
Bullet.prototype.cy = 200;
Bullet.prototype.velX = 1;
Bullet.prototype.velY = 1;

// Convert times from milliseconds to "nominal" time units.
Bullet.prototype.lifeSpan = 3000 / NOMINAL_UPDATE_INTERVAL;

Bullet.prototype.update = function (du) {
  spatialManager.unregister(this);
  this.lifeSpan -= du;
  if (this.lifeSpan < 0) return entityManager.KILL_ME_NOW;


  // ==================
  // COLLISION HANDLING
  // ==================

  const oldCX = this.cx;
  const oldCY = this.cy;

  this.cx += this.velX * du;
  this.cy += this.velY * du;

  if (!g_world.inBounds(this.cx, this.cy)) {
    return entityManager.KILL_ME_NOW;
  }

  const potentialCollision = spatialManager.register(this);

  if (potentialCollision) {
    const hitEntity = this.findHitEntity();

    if (hitEntity) {
      const canTakeHit = hitEntity.takeBulletHit;
      if (canTakeHit) canTakeHit.call(hitEntity);

      entityManager.generateExplosion({
        cx: this.cx,
        cy: this.cy,
      });

      return entityManager.KILL_ME_NOW;
    } else if (potentialCollision < 10) {
      entityManager.generateExplosion({
        cx: this.cx,
        cy: this.cy,
      });
      return entityManager.KILL_ME_NOW;
    }

    spatialManager.register(this);
  }


  return entityManager.OK;
};

Bullet.prototype.getRadius = function () {
  return 4;
};

Bullet.prototype.takeBulletHit = function () {
  this.kill();

  audioManager.play(g_url.bulletZapped);
};

Bullet.prototype.render = function (ctx, cfg) {
  if (cfg && cfg.occlusion) return;

  const fadeThresh = Bullet.prototype.lifeSpan / 3;


  if (this.lifeSpan < fadeThresh) {
    ctx.globalAlpha = this.lifeSpan / fadeThresh;
  }

  g_asset.sprite.bullet.drawCentredAt(ctx, this.cx, this.cy, this.rotation, cfg);

  ctx.globalAlpha = 1;
};
