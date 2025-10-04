// Simple 'Dodge Blocks' game
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');
const pauseBtn = document.getElementById('pause');

let W = canvas.width = 480;
let H = canvas.height = 640;
let running = true;

window.addEventListener('resize', fitCanvas);
function fitCanvas(){
  const ratio = W / H;
  const avail = Math.min(window.innerWidth * 0.9, 720);
  canvas.style.width = avail + 'px';
  canvas.style.height = (avail / ratio) + 'px';
}
fitCanvas();

// Player
const player = {x: W/2 - 20, y: H - 60, w: 40, h: 16, speed: 6};

// Blocks
let blocks = [];
let spawnTimer = 0;
let spawnRate = 60; // frames
let gravity = 2;
let score = 0;
let frames = 0;

function spawnBlock(){
  const bw = 20 + Math.random()*60;
  const bx = Math.random() * (W - bw);
  blocks.push({x:bx,y:-20,w:bw,h:18,vy:gravity});
}

function update(){
  if(!running) return;
  frames++;
  spawnTimer++;
  if(spawnTimer >= spawnRate){
    spawnTimer = 0;
    spawnBlock();
    // make it harder over time
    if(spawnRate > 12 && frames % 300 === 0) spawnRate -= 4;
    if(frames % 200 === 0) gravity += 0.2;
  }

  // move blocks
  for(let i=blocks.length-1;i>=0;i--){
    const b = blocks[i];
    b.vy += 0.02;
    b.y += b.vy;
    if(b.y > H){
      blocks.splice(i,1);
      score += 1;
      scoreEl.textContent = score;
    }
  }

  // player bounds clamp
  if(keys.left) player.x -= player.speed;
  if(keys.right) player.x += player.speed;
  player.x = Math.max(0, Math.min(W - player.w, player.x));

  // collision
  for(const b of blocks){
    if(rectIntersect(player,b)){
      running = false;
      pauseBtn.textContent = 'Restart';
    }
  }
}

function rectIntersect(a,b){
  return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
}

function draw(){
  // background
  ctx.fillStyle = '#061122';
  ctx.fillRect(0,0,W,H);

  // player
  ctx.fillStyle = '#10b981';
  roundRect(ctx, player.x, player.y, player.w, player.h, 4, true);

  // blocks
  ctx.fillStyle = '#ef4444';
  for(const b of blocks) roundRect(ctx,b.x,b.y,b.w,b.h,3,true);

  if(!running){
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0,H/2 - 50, W, 100);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '20px system-ui,Segoe UI';
    ctx.fillText('Game Over — Score: '+score, W/2, H/2 - 8);
    ctx.font = '14px system-ui,Segoe UI';
    ctx.fillText('Refresh or click Restart to play again', W/2, H/2 + 18);
  }
}

function roundRect(ctx,x,y,w,h,r,fill){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
  if(fill) ctx.fill();
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

// Input
const keys = {left:false,right:false};
window.addEventListener('keydown', e=>{
  if(e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
  if(e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
  if(e.key === ' ') { running = !running; pauseBtn.textContent = running ? 'Pause' : 'Resume'; }
});
window.addEventListener('keyup', e=>{
  if(e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
  if(e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
});

leftBtn.addEventListener('mousedown', ()=> keys.left = true);
leftBtn.addEventListener('mouseup', ()=> keys.left = false);
rightBtn.addEventListener('mousedown', ()=> keys.right = true);
rightBtn.addEventListener('mouseup', ()=> keys.right = false);
pauseBtn.addEventListener('click', ()=>{
  if(!running){
    // restart
    blocks = []; score = 0; frames = 0; gravity = 2; spawnRate = 60; running = true; pauseBtn.textContent = 'Pause'; scoreEl.textContent = score;
    return;
  }
  running = !running;
  pauseBtn.textContent = running ? 'Pause' : 'Resume';
});

// Start
requestAnimationFrame(loop);

// small helper for high DPI
function setCanvasSize(w,h){
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
setCanvasSize(W,H);

// Prevent text selection during button press
['mousedown','touchstart'].forEach(evt => document.addEventListener(evt, e=>{ if(e.target.tagName === 'BUTTON') e.preventDefault(); }));
