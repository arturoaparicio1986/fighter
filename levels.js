var Fighter = (function(my) {
function Level() {}
Level.prototype.level;
Level.prototype.setup = function() {};
Level.prototype.process = function() {
  var active = 0;
  for (var i = 0; i < my.sprites.length; ++i)
    if (my.sprites[i].type == 'npc' && my.sprites[i].active)
      ++active;
  if (!my.player.active)
    my.setDefeat();
  if (!active)
    my.setVictory();
};
// Remove all enemy projectile left over
Level.prototype.end = function() {
  for (var i = 0; i < my.sprites.length; ++i)
    if (my.sprites[i].active && my.sprites[i].type == 'projectile' && my.sprites[i].enemy)
      my.sprites[i].active = false;
};
my.initLevels = function()
{
  my.player = new my.Spaceship();
  my.levels[my.levels.length] = Level1();
  my.levels[my.levels.length] = Level2();
  my.levels[my.levels.length] = Level3();
  my.levels[my.levels.length] = Level4();
  my.levels[my.levels.length] = Level5();
  my.levels[my.levels.length] = Level6();
  my.levels[my.levels.length] = Level7();
  my.levels[my.levels.length] = Level8();
}

function Level1()
{
  var lvl = new Level();
  lvl.level = 1;
  lvl.setup = function()
  {
    my.background = new my.Background(my.bgImg1);
    my.sprites = new Array();
    // my.sprites
    my.addSprite(my.player);
    for (var i = 0; i < 2; ++i)
      for (var j = 0; j < 2; ++j)
      my.addSprite(new my.Phalanx(i * 150, j * 150));
  };
  return lvl;
}

function Level2()
{
  var lvl = new Level();
  lvl.level = 2;
  lvl.setup = function()
  {
    my.background = new my.Background(my.bgImg1);
    my.sprites = new Array();
    // my.sprites
    my.addSprite(my.player);
    for (var i = 0; i < 3; ++i)
      for (var j = 0; j < 2; ++j)
      my.addSprite(new my.Phalanx(i * 150, j * 150));
  };
  return lvl;
}

function Level3()
{
  var lvl = new Level();
  lvl.level = 3;
  lvl.setup = function()
  {
    my.background = new my.Background(my.bgImg1);
    my.sprites = new Array();
    // my.sprites
    my.addSprite(my.player);
    for (var i = 0; i < 3; ++i)
      for (var j = 0; j < 3; ++j)
      my.addSprite(new my.Phalanx(i * 150, j * 150));
  };
  return lvl;
}

function Level4() // Boss
{
  var lvl = new Level();
  lvl.level = 4;
  lvl.setup = function()
  {
    my.background = new my.Background(my.bgImg1);
    my.sprites = new Array();
    // my.sprites
    my.addSprite(my.player);
    my.addSprite(new my.Hydra());
  };
  return lvl;
}

function Level5()
{
  var lvl = new Level();
  lvl.level = 5;
  lvl.setup = function()
  {
    my.background = new my.Background(my.bgImg2);
    my.sprites = new Array();
    // my.sprites
    my.addSprite(my.player);
    for (var i = 0; i < 4; ++i)
      for (var j = 0; j < 4; ++j)
      my.addSprite(new my.Phalanx(i * 75, j * 75));
  };
  return lvl;
}

function Level6()
{
  var lvl = new Level();
  lvl.level = 6;
  lvl.setup = function()
  {
    my.background = new my.Background(my.bgImg2);
    my.sprites = new Array();
    // my.sprites
    my.addSprite(my.player);
    for (var i = 0; i < 5; ++i)
      for (var j = 0; j < 5 - i; ++j)
      my.addSprite(new my.Phalanx(i * 75 + (j * 75 / 2), j * 75));
  };
  return lvl;
}

function Level7()
{
  var lvl = new Level();
  lvl.level = 7;
  lvl.setup = function()
  {
    my.background = new my.Background(my.bgImg2);
    my.sprites = new Array();
    // my.sprites
    my.addSprite(my.player);
    for (var i = 0; i < 3; ++i)
      for (var j = 0; j < 2; ++j)
      my.addSprite(new my.Cavalier(i * 150, j * 150));
  };
  return lvl;
}

function Level8()
{
  var lvl = new Level();
  lvl.level = 8;
  lvl.setup = function()
  {
    my.background = new my.Background(my.bgImg2);
    my.sprites = new Array();
    // my.sprites
    my.addSprite(my.player);
    for (var i = 0; i < 3; ++i)
      for (var j = 0; j < 2; ++j)
      my.addSprite(new my.Cavalier(i * 200, j * 200));
    for (var i = 0; i < 3; ++i)
      for (var j = 0; j < 2; ++j)
      my.addSprite(new my.Phalanx(i * 200 + 50, j * 200 + 50));
  };
  return lvl;
}
return my;
}(Fighter));
