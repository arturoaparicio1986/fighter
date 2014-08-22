var Fighter = (function() {

var my = {};
// Constants
var ANIMATION_INTERVAL_MS = 10;
var BACKGROUND_INTERVAL_MS = 50;
var MIN_SHOOT_INTERVAL_MS = 150;
var TRANSITION_TIME_MS = 3000 / ANIMATION_INTERVAL_MS;
var IMAGES_TO_LOAD = 3;
var UP_KEY = 38;
var DOWN_KEY = 40;
var LEFT_KEY = 37;
var RIGHT_KEY = 39;
var SPACE_KEY = 32;
var P_KEY = 80;
var R_KEY = 82;

// Drawing
my.canvas;
my.context;

// Background
my.bgImg1;
my.bgImg2;
my.background;

// Sprites
my.spriteImgs;
my.player;
my.sprites;

// Ticks
my.bg_tick = 0;
my.shot_tick = 0;
my.transition = 0;

// Levels
my.levels;
my.level;
my.score;

// Game State
my.gameState = { 
  START_SCREEN: 0,
  ACTIVE: 1,
  PAUSED: 2,
  VICTORY: 3,
  DEFEAT: 4,
  LEVEL_TRANSITION: 5
};
my.state;

// Setup
window.onload = function () {
  my.canvas = document.getElementById("mainCanvas");
  my.context = my.canvas.getContext("2d");
  // Listeners
  window.onkeydown = processDown;
  window.onkeyup = processUp;
  // Start tickers
  setInterval('++Fighter.bg_tick', BACKGROUND_INTERVAL_MS);
  setInterval('++Fighter.shot_tick', MIN_SHOOT_INTERVAL_MS);
  // Start game
  Fighter.loadImagesAndStartGame();
};

my.loadImagesAndStartGame = function() {
  var imagesLoaded = 0;
  var loaded = function () {
    if (++imagesLoaded == IMAGES_TO_LOAD)
    {
      setInterval('Fighter.processAndDraw()', ANIMATION_INTERVAL_MS);
      // Setup levels
      my.restart();
    }
  };
  my.bgImg1 = new Image();
  my.bgImg2= new Image();
  spriteImgs = new Image();
  my.bgImg1.onload = function () {
    loaded();
  }
  my.bgImg1.src = 'images/bg0.png';
  my.bgImg2.onload = function () {
    loaded();
  }
  my.bgImg2.src = 'images/bg1.png';
  spriteImgs.src = 'images/sprites.png';
  spriteImgs.onload = function () {
    loaded();
  }
}

// Listeners - Process player input
function processDown(e) {
  // Don't let the screen move around
  if([SPACE_KEY, LEFT_KEY, UP_KEY, RIGHT_KEY, DOWN_KEY].indexOf(e.keyCode) > -1)
      e.preventDefault();
  if (my.state == my.gameState.START_SCREEN)
    if (e.keyCode == SPACE_KEY)
      my.state = my.gameState.ACTIVE;
  if (my.state == my.gameState.PAUSED)
    if (e.keyCode == R_KEY)
      my.state = my.gameState.ACTIVE;
  if (my.state == my.gameState.ACTIVE || my.state == my.gameState.VICTORY || my.state == my.gameState.LEVEL_TRANSITION)
  {
    if (e.keyCode == P_KEY)
      setPause();
    else if (e.keyCode == SPACE_KEY)
      my.player.shooting = true;
    else if (e.keyCode >= LEFT_KEY && e.keyCode <= DOWN_KEY) {
      if (e.keyCode == LEFT_KEY)
        my.player.dx = -3;
      else if (e.keyCode == UP_KEY)
        my.player.dy = -3;
      else if (e.keyCode == RIGHT_KEY)
        my.player.dx = 3;
      else if (e.keyCode == DOWN_KEY)
      my.player.dy = 3;
    }
  }
}

function processUp(e) {
  if (my.state == my.gameState.ACTIVE || my.state == my.gameState.VICTORY  || my.state == my.gameState.LEVEL_TRANSITION)
  {
    if (e.keyCode == SPACE_KEY)
      my.player.shooting = false;
    if (e.keyCode == LEFT_KEY && my.player.dx < 0)
      my.player.dx = 0;
    if (e.keyCode == UP_KEY && my.player.dy < 0)
      my.player.dy = 0;
    if (e.keyCode == RIGHT_KEY && my.player.dx > 0)
      my.player.dx = 0;
    if (e.keyCode == DOWN_KEY && my.player.dy > 0)
      my.player.dy = 0;
  }
}

my.processAndDraw = function() {
  // This updating should be done elsewhere but this works for now.
  if (document.getElementById('statusText').innerHTML  != ('Score: ' + my.score))
    document.getElementById('statusText').innerHTML  = ('Score: ' + my.score)
  if (document.getElementById('scoreText').innerHTML  != my.player.hp)
    document.getElementById('scoreText').innerHTML  = my.player.hp;
  if (document.getElementById('levelText').innerHTML  != my.level.level)
    document.getElementById('levelText').innerHTML  = my.level.level;
  // END
  if (my.state == my.gameState.PAUSED) {
    return;
  }
  my.context.clearRect(0, 0, my.canvas.width, my.canvas.height);
  // Draw Background
  my.background.draw();
  if (my.state == my.gameState.START_SCREEN)
  {
    printHeader("Fighter");
    printSubText("Press space to start");
  } else {
    // Process
    for (var i = 0; i < my.sprites.length; ++i)
      my.sprites[i].process();
    // Let the game continue in the foreground despite victory/defeat
    if (my.state == my.gameState.DEFEAT)
    {
      printHeader("Defeat!");
      printSubText("Score: " + my.score);
    } else if (my.state == my.gameState.VICTORY)
    {
      printHeader("Victory");
      printSubText("Score: " + my.score);
    }
    // Draw my.sprites
    for (var i = 0; i < my.sprites.length; ++i)
      my.sprites[i].draw();
    if (my.state == my.gameState.ACTIVE) // Process the my.level
      my.level.process();
    if (my.state == my.gameState.LEVEL_TRANSITION) {
      if (--my.transition > 0) {
        my.context.save();
        my.context.globalAlpha = my.transition / TRANSITION_TIME_MS;
        printHeader("Level " + (my.level.level + 1));
        printSubText("Ready Player One");
        my.context.restore();
      } else {
        my.state = my.gameState.ACTIVE;
        my.level = my.levels.shift();
        my.level.setup();
        my.player.hp++;
      }
    }
  }
}

my.Background = function(bgImg)
{
  var bg = bgImg;
  this.draw = function () {
    var bgYOffset = my.bg_tick % bg.height;
    var bgYROffset = bgYOffset * my.canvas.height / bg.height;
    my.context.drawImage(bg, 0, 0, bg.width, bg.height - bgYOffset, 0, bgYROffset, my.canvas.width,
      my.canvas.height - bgYROffset);
    my.context.drawImage(bg, 0, bg.height - bgYOffset, bg.width, bgYOffset, 0, 0, my.canvas.width,
      bgYROffset + 1);
  };
}

function printHeader(text) {
  my.context.save();
  my.context.font = "bold 100px Arial";
  my.context.lineWidth = "1";
  my.context.fillStyle = "yellow";
  var txtDim = my.context.measureText(text);
  my.context.shadowColor= 'red';
  my.context.shadowBlur = 15;
  my.context.fillText(text, my.canvas.width / 2 - txtDim.width / 2, my.canvas.height / 2);
  my.context.restore(); 
}

function printSubText(text) {
  my.context.save();
  my.context.font = "bold 50px Arial";
  my.context.lineWidth = "1";
  my.context.fillStyle = "yellow";
  var txtDim = my.context.measureText(text);
  my.context.shadowColor= 'red';
  my.context.shadowBlur = 15;
  my.context.fillText(text, my.canvas.width / 2 - txtDim.width / 2, my.canvas.height - my.canvas.height / 4);
  my.context.restore(); 
}

// Attempts to pause the game, returns true if successful else false.
function setPause() {
  if (my.state == my.gameState.ACTIVE)
  {
    printHeader("Paused");
    printSubText("Press 'r' to resume");
    my.state = my.gameState.PAUSED;
    return true;
  }
  return false;
}

my.setVictory = function() {
  // More my.levels to go
  if (my.levels.length) {
    my.transition = TRANSITION_TIME_MS;
    my.state = my.gameState.LEVEL_TRANSITION;
    my.level.end();
  } else {
    my.state = my.gameState.VICTORY;
  }
}

my.setDefeat = function() {
  my.state = my.gameState.DEFEAT;
}

// Helper functions
my.addSprite = function(obj) {
  var i = 0;
  for (; i < my.sprites.length && my.sprites[i].active; ++i);
  my.sprites[i] = obj;
  // Sort according to weight
  my.sprites.sort(function (a, b) {
    return (a.weight > b.weight) ? -1 : (a.weight < b.weight) ? 1 : 0;
  });
}

// User functions
my.restart = function() {
  my.score = 0;
  my.levels = new Array();
  my.initLevels();
  my.level = my.levels.shift();
  my.level.setup();
  my.state = my.gameState.START_SCREEN;
}

my.volumeOff = function() {
  document.getElementById('music').pause();
  document.getElementById('volOn').style.display = 'inline';
  document.getElementById('volOff').style.display = 'none';
}

my.volumeOn = function() {
  document.getElementById('music').play();
  document.getElementById('volOff').style.display = 'inline';
  document.getElementById('volOn').style.display = 'none';
}

my.pause = function() {
  if (setPause())
  {
    document.getElementById('resume').style.display = 'inline';
    document.getElementById('pause').style.display = 'none';
  }
}

my.resume = function() {
  my.state = my.gameState.ACTIVE;
  document.getElementById('resume').style.display = 'none';
  document.getElementById('pause').style.display = 'inline';
}

my.upLevel = function() {
  if (my.state == my.gameState.START_SCREEN)
    if(my.levels.length) {
      my.level.end()
      my.level = my.levels.shift();
      my.level.setup();
    } else {
      restart();
    }
}

my.downLevel = function() {
  if (my.state == my.gameState.START_SCREEN)
  {
    var nLevel = my.level.level - 1;
    if(my.level.level == 1)
      nLevel = my.levels.length + 1;
    my.levels = new Array();
    my.initLevels();
    my.level = my.levels.shift();
    for (var i = 1; i < nLevel; ++i)
    {
      my.level.end()
      my.level = my.levels.shift();
      my.level.setup();
    }
  }
}
  return my;
}());