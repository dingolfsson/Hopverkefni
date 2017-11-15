'use strict';

/* global audioManager g_url Entity NOMINAL_UPDATE_INTERVAL spatialManager
 g_world entityManager g_asset :true */

// A generic contructor which accepts an arbitrary descriptor object
function Bullet(descr) {
  // Common inherited setup logic from Entity
  this.setup(descr);

  // TODO: bind in JSON.
  // audioManager.play(g_url.bulletFire);
  audioManager.play(g_url.audio.gunsound1);
}

Bullet.prototype = new Entity();

// Initial, inheritable, default values
Bullet.prototype.rotation = 0;
Bullet.prototype.cx = 200;
Bullet.prototype.cy = 200;
Bullet.prototype.velX = 1;
Bullet.prototype.velY = 1;
Bullet.prototype.damage = 25;
Bullet.prototype.through = 0;

// Convert times from milliseconds to "nominal" time units.

// TODO: bind in JSON
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

  if (!g_world.inBounds(this.cx, this.cy)) return entityManager.KILL_ME_NOW;

  // TODO: this is just a total mess.

  // Conflicting spatial ID.  0 is ok.
  const spatialID = spatialManager.register(this);

  if (spatialID) {
    if (spatialID < spatialManager.MIN_ENTITY) {
      if (spatialID === spatialManager.WALL_ID) {
        audioManager.play(g_url.audio.explosion1);
        spatialManager.unregister(this);
        entityManager.generateExplosion({
          cx: this.cx,
          cy: this.cy,
        });
        return entityManager.KILL_ME_NOW;
      }
    } else {
      const entity = spatialManager.getEntity(spatialID);

      // Check whether the entity has the method [takeBulletHit].
      const canTakeHit = entity.takeBulletHit;
      if (canTakeHit) {
        // If so cause entity to "take hit."
        canTakeHit.call(entity);
      }

      audioManager.play(g_url.audio.explosion1);

      entityManager.generateBlood({
        cx: this.cx,
        cy: this.cy,
      });
      if (this.through === 0) {
        return entityManager.KILL_ME_NOW;
      }
      this.through -= 1;
    }
    spatialManager.register(this, true);
  }


  return entityManager.OK;
};

// TODO: bind in JSON.
Bullet.prototype.getRadius = function () {
  return 4;
};

Bullet.prototype.takeBulletHit = function () {
  spatialManager.unregister(this);
  this.kill();

  // TODO: bind in JSON.
  audioManager.play(g_url.audio.bulletZapped);
};

Bullet.prototype.render = function (ctx, cfg) {
  if (cfg && cfg.occlusion) return;

  // TODO: bind in JSON, or just throw away.
  const fadeThresh = Bullet.prototype.lifeSpan / 3;

  if (this.lifeSpan < fadeThresh) {
    ctx.globalAlpha = this.lifeSpan / fadeThresh;
  }

  // TODO: bind in JSON.
  g_asset.sprite.bullet.drawCentredAt(ctx, this.cx, this.cy, this.rotation, cfg);

  ctx.globalAlpha = 1;
};
