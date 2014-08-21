var Fighter = (function(my) {
var POINTS_PER_HIT = 10;
var POINTS_FOR_BOSS = 100;
var POINTS_FOR_NPC = 25;
var TO_RADIANS = Math.PI/180; 
// Sprite - Basic drawing unit
function Sprite() {}
Sprite.prototype.type = 'Sprite'; // player, projectile, and npc
Sprite.prototype.active = true;
Sprite.prototype.display = true;
Sprite.prototype.x = 0;
Sprite.prototype.y = 0;
Sprite.prototype.dy = 0;
Sprite.prototype.dx = 0;
Sprite.prototype.angle = 0;
Sprite.prototype.weight = 0; // heavier items sink
Sprite.prototype.sub_hit_area = 5;
Sprite.prototype.process = function () {}
Sprite.prototype.draw = function () {
  if (this.display && this.active) {
    if (this.angle != 0) {
      my.context.save();
      my.context.translate(this.x + this.width / 2, this.y + this.height / 2);
      my.context.rotate(this.angle * TO_RADIANS);
      my.context.drawImage(spriteImgs, this.img_x, this.img_y, this.width, this.height, -(this.width/2), -(this.height/2), 
      this.width, this.height);  
      my.context.restore();
    } else {
      my.context.drawImage(spriteImgs, this.img_x, this.img_y, this.width, this.height, this.x, this.y, this.width,
        this.height);  
    }
  }
};
Sprite.prototype.intersect = function (obj) {
  return !(obj.x > this.x + this.width - this.sub_hit_area ||
    obj.x + obj.width < this.x + this.sub_hit_area ||
    obj.y > this.y + this.height - this.sub_hit_area ||
    obj.y + obj.height < this.y + this.sub_hit_area)
};
Sprite.prototype.intersectionPoint = function (obj) {
  if (!this.intersect(obj))
    return null;
  for (var x = obj.x; x < obj.x + obj.width; ++x)
    for (var y = obj.y; y < obj.y + obj.height; ++y)
      if (x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height)
        return {
          x: x,
          y: y
        };
  return null;
};
/*************************************************** Spaceships *******************************************************/
// Spaceship
my.Spaceship = function(){
  this.type = 'player';
  this.img_x = 151;
  this.img_y = 191;
  this.width = 28;
  this.height = 32;
  this.img_x_c = 151;
  this.img_y_c = 191;
  this.width_c = 28;
  this.height_c = 32;
  this.img_x_r = 108;
  this.img_y_r = 191;
  this.width_r = 23;
  this.height_r = 31;
  this.img_x_l = 193;
  this.img_y_l = 192;
  this.width_l = 23;
  this.height_l = 31;
  this.x = my.canvas.width / 2 - this.width;
  this.y = my.canvas.height - this.height;
  this.hp = 2;
  this.shooting = false;
  var prev_shot_tick = 0;

  this.process = function () {
    if (!this.active) return;
    // Check boundaries before moving
    if (this.dx) {
      if (this.x <= 0 && this.dx < 0 || (this.x + this.width >= my.canvas.width && this.dx > 0))
        this.dx = 0;
      else
        this.x += this.dx;
    }
    if (this.dx == 0) {
      this.img_x = this.img_x_c;
      this.img_y = this.img_y_c;
      this.width = this.width_c;
      this.height = this.height_c;
    } else if (this.dx > 0) {
      this.img_x = this.img_x_l;
      this.img_y = this.img_y_l;
      this.width = this.width_l;
      this.height = this.height_l;
    } else {
      this.img_x = this.img_x_r;
      this.img_y = this.img_y_r;
      this.width = this.width_r;
      this.height = this.height_r;
    }
    if (this.dy)
      if (this.y <= 0 && this.dy < 0)
        this.dy = 0;
      else if (this.y + this.height >= my.canvas.height && this.dy > 0)
      this.dy = 0;
    else
      this.y += this.dy;
    // Shoot
    if (this.shooting && my.shot_tick > prev_shot_tick) {
      my.addSprite(new Laser(this.x + this.width / 2, this.y, 0, -4, false));
      prev_shot_tick = my.shot_tick;
    }
    // Collision
    for (var i = 0; i < my.sprites.length; ++i) {
      var obj = my.sprites[i];
      if (obj.active)
      {
        if (obj.type == 'npc') {
          var iPt = this.intersectionPoint(obj);
          if (iPt) {
            this.active = false;
            this.hp = 0;
            my.addSprite(new Explosion1(iPt.x, iPt.y));
          }
        } else if (obj.type == 'projectile' && obj.enemy)
        {
          var iPt = this.intersectionPoint(obj);
          if (iPt) {
            my.score = Math.max(my.score - POINTS_PER_HIT, 0);
            this.hp -= obj.damage;
            obj.active = false;
            my.addSprite(new Explosion3(iPt.x, iPt.y));
            if (this.hp <= 0)
            {
              this.active = false;
              my.addSprite(new Explosion1(iPt.x, iPt.y));
            }
          }
        }
      }
    }
  }
}
my.Spaceship.prototype = new Sprite();
my.Spaceship.prototype.constructor = Sprite;

/****************************************************** NPCs **********************************************************/
function NPC() {}
NPC.prototype = new Sprite();
NPC.prototype.constructor = Sprite;
NPC.prototype.prev_shot_tick = 0;
NPC.prototype.collision = function()
{
  if (!this.active) return;
  for (var i = 0; i < my.sprites.length; ++i) {
    var obj = my.sprites[i];
    if (obj.type == 'projectile' && !obj.enemy && obj.active) {
      var iPt = this.intersectionPoint(obj);
      if (iPt) {
        my.score += POINTS_PER_HIT;
        obj.active = false;
        this.hp -= obj.damage;
        if (this.hp > 0)
          my.addSprite(new Explosion2(iPt.x, iPt.y));
        else {
          this.active = false;
          var explosion1 = new Explosion1(this.x + this.width / 2, this.y + this.height / 2);
          explosion1.growFactor = 10;
          explosion1.ticksTillDeath = 100;   
          explosion1.ticksLeft = 100;
          my.addSprite(explosion1);
        }
      }
    }
  }
};
NPC.prototype.move = function(){
  if (!this.active) return;
  if (this.dx)
    if (this.x + 100 <= 0)
      this.dx = 2;
    else if (this.x + this.width >= my.canvas.width + 100)
    this.dx = -2;
  this.x += this.dx;
};
NPC.prototype.shoot = function() {
  if (!this.active) return;
  if (my.shot_tick - 2 > this.prev_shot_tick) {
    my.addSprite(new SmallLaser(this.x + this.width / 2, this.y, 0, 4, true));
    this.prev_shot_tick = my.shot_tick;
  }
};
NPC.prototype.process = function () {
  this.move();
  this.shoot();
  this.collision();
};
my.Phalanx = function(nx, ny) {
  this.type = 'npc';
  this.img_x = 526;
  this.img_y = 511;
  this.width = 54;
  this.height = 36;
  this.dy = 0;
  this.dx = 2;
  this.x = nx;
  this.y = ny;
  this.hp = 5;
}
my.Phalanx.prototype = new NPC();
my.Phalanx.prototype.constructor = NPC;

my.Cavalier = function(nx, ny) {
  this.type = 'npc';
  this.img_x = 168;
  this.img_y = 293;
  this.width = 41;
  this.height = 42;
  this.dy = 0;
  this.dx = 2;
  this.x = nx;
  this.y = ny;
  this.hp = 10;
}
my.Cavalier.prototype = new NPC();
my.Cavalier.prototype.constructor = NPC;
my.Cavalier.prototype.shoot = function()
{
  if (my.shot_tick - 1 > this.prev_shot_tick) {
    my.addSprite(new Laser(this.x + this.width / 2, this.y, 0, 4, true));
    this.prev_shot_tick = my.shot_tick;
  }
};

// (enemy) Boss #1
my.Hydra = function() {
  this.type = 'npc';
  this.img_x = 535;
  this.img_y = 375;
  this.width = 160;
  this.height = 95;
  this.dy = 0;
  this.dx = 2;
  this.x = 0;
  this.y = 0;
  this.hp = 50;
}
my.Hydra.prototype = new NPC();
my.Hydra.prototype.constructor = NPC;
my.Hydra.prototype.shoot = function() {
  if (my.shot_tick - 2 > this.prev_shot_tick) {
    var misslPtL = {x: this.x + this.width / 2 - 50, y: this.y + this.height - 20};
    var misslPtR = {x: this.x + this.width / 2 + 50, y: this.y + this.height - 20};
    var laserPtL = {x: this.x + this.width / 2 - 10, y: this.y + this.height - 20};
    var laserPtR = {x: this.x + this.width / 2 + 10, y: this.y + this.height - 20};
    if (my.shot_tick % 5 == 0) {
      my.addSprite(new Missle(misslPtL.x, misslPtL.y, 0, 6, true));
      my.addSprite(new Missle(misslPtR.x, misslPtR.y, 0, 6, true));
    } else if (my.shot_tick % 2 == 0)
      my.addSprite(new Missle(misslPtR.x, misslPtR.y, 0, 4, true));
    else
      my.addSprite(new Missle(misslPtL.x, misslPtL.y, 0, 4, true));
    my.addSprite(new Laser(laserPtL.x, laserPtL.y, 0, 7, true));
    my.addSprite(new Laser(laserPtR.x, laserPtR.y, 0, 7, true));
    this.prev_shot_tick = my.shot_tick;
  }
};
/*************************************************** Projectiles ******************************************************/
// Typically x centered
function Projectile(){}
Projectile.prototype = new Sprite();
Projectile.prototype.constructor = Sprite;
Projectile.prototype.type = 'projectile';
Projectile.prototype.enemy = false;
Projectile.prototype.damage = 1;
Projectile.prototype.process = function () {
  if (!this.active) return;
  if (this.dy)
    this.y += this.dy;
  if (this.dx)
    this.x += this.dx;
  if (this.dy > 0)
    this.angle = 180;
  if (this.y < 0 || this.y > my.canvas.height)
    this.active = false;
  if (this.x < 0 || this.x > my.canvas.width)
    this.active = false;
}
// Laser
function SmallLaser(nX, nY, nDx, nDy, nEnemy) {
  this.img_x = 121;
  this.img_y = 133;
  this.width = 3;
  this.height = 11;
  this.dy = nDy;
  this.dx = nDx;
  this.x = nX - this.width / 2;
  this.y = nY;
  this.damage = 0.5;
  this.enemy = nEnemy;
}
SmallLaser.prototype = new Projectile();
SmallLaser.prototype.constructor = Projectile;
// Laser
function Laser(nX, nY, nDx, nDy, nEnemy) {
  this.img_x = 20;
  this.img_y = 130;
  this.width = 14;
  this.height = 20;
  this.dy = nDy;
  this.dx = nDx;
  this.x = nX - this.width / 2;
  this.y = nY;
  this.enemy = nEnemy;
}
Laser.prototype = new Projectile();
Laser.prototype.constructor = Projectile;
// Missle
function Missle(nX, nY, nDx, nDy, nEnemy) {
  this.img_x = 383;
  this.img_y = 266;
  this.width = 9;
  this.height = 35;
  this.dy = nDy;
  this.dx = nDx;
  this.x = nX - this.width / 2;
  this.y = nY;
  this.damage = 3;
  this.enemy = nEnemy;
}
Missle.prototype = new Projectile();
Missle.prototype.constructor = Projectile;
/*************************************************** Explosions *******************************************************/
// Typically x and y centered
function Explosion() {}
Explosion.prototype = new Sprite();
Explosion.prototype.constructor = Sprite;
Explosion.prototype.weight = -1;
Explosion.prototype.growFactor = 1;
Explosion.prototype.ticksTillDeath = 30;
Explosion.prototype.ticksLeft = 30;
Explosion.prototype.factor = 0;
Explosion.prototype.process = function () {
  if (!this.active) return;
  if (--this.ticksLeft > 0)
    this.factor = 1 + this.growFactor * (this.ticksTillDeath - this.ticksLeft) / this.ticksTillDeath;
  else
    this.active = false;
};
Explosion.prototype.draw = function () {
  if (this.active) {
    my.context.save();
    my.context.globalAlpha = (this.ticksLeft) / this.ticksTillDeath;
    my.context.drawImage(spriteImgs, this.img_x, this.img_y, this.width, this.height, this.x - (this.factor * this.width) /
      2, this.y - (this.factor * this.height) / 2, this.width * this.factor, this.height * this.factor);
    my.context.restore();
  }
};
// x and y centered
function Explosion1(nX, nY) {
  this.img_x = 270;
  this.img_y = 335;
  this.width = 25;
  this.height = 25;
  this.x = nX;
  this.y = nY;
  this.ticksTillDeath = 50;
  this.ticksLeft = 50;
  this.growFactor = 3;
}
Explosion1.prototype = new Explosion();
Explosion1.prototype.constructor = Explosion;
// x and y centered
function Explosion2(nX, nY) {
  this.img_x = 233;
  this.img_y = 377;
  this.width = 13;
  this.height = 11;
  this.x = nX;
  this.y = nY;
}
Explosion2.prototype = new Explosion();
Explosion2.prototype.constructor = Explosion;
// x and y centered
function Explosion3(nX, nY) {
  this.img_x = 250;
  this.img_y = 376;
  this.width = 14;
  this.height = 12;
  this.x = nX;
  this.y = nY;
  this.growFactor = 4;
}
Explosion3.prototype = new Explosion();
Explosion3.prototype.constructor = Explosion;
return my;
}(Fighter));