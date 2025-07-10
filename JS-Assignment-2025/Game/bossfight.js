const gameArea=document.getElementById("gameArea");
const player=document.getElementById("player");
document.getElementById("scoreboard").style.display = "none";

let playerX=window.innerWidth/2-40;
let speed=2;
let spawnInterval=1000;
let shield=false;
let count=0;


let bossSpeed=2;
let bossHealth=100;
let reverse=0;
let missile=0;
let weaponDropTime=1500;
let bossY=-200;


const bgm=new Audio("assets/bgm.mp3");
bgm.loop=true;
bgm.volume=0.3;

const bombSound=new Audio("assets/bomb.mp3");
bombSound.volume=0.7;

const gameOver=new Audio("assets/gameover.mp3");
gameOver.volume=1;

const sandevistan1=new Audio("assets/sandevistan1.mp3");
sandevistan1.volume=1;

const sandevistan2=new Audio("assets/sandevistan2.mp3");
sandevistan2.volume=1;

const coinSound=new Audio("assets/coin.mp3");
coinSound.volume=1;

const shieldSound=new Audio("assets/shield.mp3");
shieldSound.volume=0.7;

const shieldGoneSound=new Audio("assets/shieldgone.mp3");
shieldGoneSound.volume=1;

const damageSound=new Audio("assets/damage.mp3");
damageSound.volume=1;

const bgm2=new Audio("assets/bgm2.mp3");
bgm2.volume=0.3;

const bgm3=new Audio("assets/bgm3.mp3");
bgm3.volume=0.3;

const victorySound=new Audio("assets/victory.mp3");
victorySound.volume=1;

const reverseSound=new Audio("assets/reverse.mp3");
reverseSound.volume=0.7;

const missileSound=new Audio("assets/missile.mp3");
missileSound.volume=0.3;


bgm2.addEventListener("ended", ()=>{
  bgm3.play();
})
bgm3.addEventListener("ended", ()=>{
  bgm2.play();
})

document.addEventListener("keydown", ()=>{
  bgm2.play();
}, {once:true });

const keys={
   left:false, right:false 
};

document.addEventListener("keydown", e=>{
  if(e.key==="ArrowLeft") 
   keys.left=true;
  if(e.key==="ArrowRight")
   keys.right=true;
});

document.addEventListener("keyup", e=>{
  if(e.key==="ArrowLeft") 
   keys.left=false;
  if(e.key==="ArrowRight")
   keys.right=false;
});

setTimeout(()=>{
  document.getElementById("bossHealthContainer").style.display = "block";
}, 8000); 

function spawnObject(){
  const div=document.createElement("div");
  div.classList.add("falling");

  let chance = Math.random();
  if(chance<0.04)
    div.classList.add("power2");
  else if(chance<0.1)
    div.classList.add("power");
  else if(chance<0.15)
    div.classList.add("reverse");
  else if(chance<0.2)
    div.classList.add("missile");
  else
    div.classList.add("bomb");

  div.style.left=Math.random()*(window.innerWidth-40)+"px";
  div.style.top="-40px";
  gameArea.appendChild(div);
}

function slowTime() {
  const originalSpeed = speed;
  speed=0.3;            
  bossSpeed=0.5;   
  setTimeout(()=>{
    speed=originalSpeed;
    bossSpeed=2;
  }, 5000);
}

function explodeBomb(){
  bossHealth-=20;
  updateBossHealthBar();
  damageSound.play();
}


const boss = document.getElementById("boss");
const bossCtx = boss.getContext("2d");
const boss_image = new Image();
boss_image.src = "assets/Character_sheet.png";

const bossFrameWidth = 100;
const bossFrameHeight = 100;
const bossRow = 0;
const bossTotalFrames = 4;
let bossFrame = 0;


function animateBoss() {
  bossCtx.clearRect(0, 0, boss.width*3, boss.height*3);
  bossCtx.drawImage(
    boss_image,
    bossFrame * bossFrameWidth, bossRow * bossFrameHeight,
    bossFrameWidth, bossFrameHeight,
    0, 0,
    bossFrameWidth*3, bossFrameHeight*3
  );
  bossFrame = (bossFrame + 1) % bossTotalFrames;
  setTimeout(animateBoss, 200); 
}

let bossX = window.innerWidth/2-32;
let bossDirection = 1;


function moveBoss(){
  bossX+=bossDirection*bossSpeed;
  if (bossX<=bossFrameWidth || bossX> window.innerWidth-bossFrameWidth){
    bossDirection*=-1;
  }
  boss.style.left=bossX + "px";
  requestAnimationFrame(moveBoss);
}


function moveBossInitial(){
  bossY+=0.1;
  boss.style.top=Math.min(-80,bossY)+"px";
  if(boss.style.top==="-80px"){
    moveBoss();
    bossAttack();
    return;
  }
  requestAnimationFrame(moveBossInitial);
}


function bossAttack(){
  const weapon=document.createElement("div");
  weapon.classList.add("falling", "weapon");
  weapon.style.left=(bossX-75)+"px";
  weapon.style.top="80px";
  gameArea.appendChild(weapon);
  if(weaponDropTime>100)
    weaponDropTime-=10;
  setTimeout(bossAttack, weaponDropTime);
}


function launchMissile(){
  missileSound.play();
  const playerCoords=player.getBoundingClientRect();
  const missile=document.createElement("div");
  missile.classList.add("flying", "missile");
  missile.style.left = (playerCoords.left+30)+"px";
  missile.style.top = (playerCoords.top-80)+"px";
  gameArea.appendChild(missile);
}


function updateBossHealthBar(){
  boss.classList.add("flicker");
  missileSound.pause();
  setTimeout(()=>{
  boss.classList.remove("flicker");
}, 600);
  if(bossHealth<=0) {
    bgm.pause();
    bgm2.pause();
    bgm3.pause();
    victorySound.play();
    alert("You Won");
    location.reload();
  }
  const healthPercent=Math.max(0, bossHealth)+"%";
  document.getElementById("bossHealthBar").style.width=healthPercent;
}


function updateObjects2(){
  const objects=document.querySelectorAll(".flying");
  objects.forEach(obj=>{
    let top=parseFloat(obj.style.top);

    obj.style.top=(top-speed)+"px";

    const objCoords=obj.getBoundingClientRect();
    const bossCoords=boss.getBoundingClientRect();

    let adjustTop=45, adjustBottom=45, adjustLeft=45, adjustRight=45;

    if (objCoords.left+adjustLeft<bossCoords.right-adjustRight && objCoords.right-adjustRight>bossCoords.left+adjustLeft && objCoords.top+adjustTop<bossCoords.bottom-adjustBottom && objCoords.bottom-adjustBottom>bossCoords.top+adjustTop){
      if(obj.classList.contains("bomb")){
        bossHealth-=20;
        damageSound.play();
        updateBossHealthBar();
      }else if(obj.classList.contains("missile")){
        bossHealth-=10;
        damageSound.play();
        updateBossHealthBar();
      }
      obj.remove();
    }
    if (top>window.innerHeight){
      obj.remove();
    }
  })
}


function updateObjects(){
  const objects=document.querySelectorAll(".falling");
  objects.forEach(obj=>{
    let top=parseFloat(obj.style.top);
    obj.style.top=(top+speed)+"px";

    const objCoords=obj.getBoundingClientRect();
    const playerCoords=player.getBoundingClientRect();

    let adjustTop=5, adjustBottom=5, adjustLeft=5, adjustRight=5;

    if(obj.classList.contains("reverse")){
      adjustTop=0;
      adjustBottom=0;
      adjustLeft=0;
      adjustRight=0;
    }else if(obj.classList.contains("weapon")){
      adjustTop=9;
      adjustLeft=8;
    }else if(obj.classList.contains("bomb")){
      adjustTop=1;
      adjustBottom=8;
      adjustRight=10;
    }

    if(objCoords.left + adjustLeft < playerCoords.right - adjustRight && objCoords.right - adjustRight > playerCoords.left + adjustLeft && objCoords.top + adjustTop < playerCoords.bottom - adjustBottom && objCoords.bottom - adjustBottom > playerCoords.top + adjustTop){
     if(obj.classList.contains("power")){
        if(!shield)
          player.classList.add("shielded");
        shield=true;
        count++;
        shieldSound.play();
      }else if(obj.classList.contains("power2")){
        slowTime();
        sandevistan1.play();
        sandevistan2.play();
      }else if(obj.classList.contains("weapon")){
        bgm.pause();
        bgm2.pause();
        bgm3.pause();
        gameOver.play();
        alert("You Lost");
        location.reload();
      }else if(obj.classList.contains("reverse")){
        reverse++;
        reverseSound.play();
      }else if(obj.classList.contains("missile")){
        missile++;
        coinSound.play();
        obj.remove();
      }else if(obj.classList.contains("bomb")){
        if(reverse>0){
          obj.classList.add("flying");
          reverse--;
          obj.classList.remove("falling");
        }else if(shield){
          shield=false;
          shieldGoneSound.play();
          player.classList.remove("shielded");
          if(count>=3){
            explodeBomb();
            bombSound.play();
          }
          count=0;
        }
        else{
          if(!obj.classList.contains("flying")){
            bgm.pause();
            bgm2.pause();
            bgm3.pause();
            gameOver.play();
            alert("You Lost");
            location.reload();
          }
          
        }
      }
      if(!obj.classList.contains("flying")){
        obj.remove();
      }
    }
    if (top>window.innerHeight) {
      obj.remove();
    }
  });
}


document.addEventListener("keydown", e=>{
  if (e.code==="Space" && missile>0){
    launchMissile();
    missile--;
  }
});


function gameLoop(){
  if(keys.left)
   playerX-=5;
  if(keys.right) 
   playerX+=5;
  playerX=Math.max(0, Math.min(window.innerWidth-100, playerX));
  player.style.left=playerX+"px";

  updateObjects();
  updateObjects2();
  requestAnimationFrame(gameLoop);
}

function spawnLoop(){
  spawnObject();

  if(spawnInterval>100)
   spawnInterval-=5;
  if(speed<10)speed+=0.03;

  setTimeout(spawnLoop, spawnInterval);
}

bgm2.play();
gameLoop();
spawnLoop();
animateBoss();
moveBossInitial();






