const gameArea=document.getElementById("gameArea");
const player=document.getElementById("player");
const scoreboard=document.getElementById("scoreboard");

let score=0;
let playerX=window.innerWidth/2-40;
let speed=2;
let spawnInterval=1000;
let shield=false;
let count=0;

const bgm=new Audio("assets/bgm.mp3");
bgm.loop=true;
bgm.volume=0.3;

const bombSound=new Audio("assets/bomb.mp3");
bombSound.volume=1;

const gameOver=new Audio("assets/gameover.mp3");
gameOver.volume=1;

const sandevistan1=new Audio("assets/sandevistan1.mp3");
sandevistan1.volume=1;

const sandevistan2=new Audio("assets/sandevistan2.mp3");
sandevistan2.volume=1;

const coinSound=new Audio("assets/coin.mp3");
coinSound.volume=1;

const shieldSound=new Audio("assets/shield.mp3");
shieldSound.volume=1;

const shieldGoneSound=new Audio("assets/shieldgone.mp3");
shieldGoneSound.volume=1;



document.addEventListener("keydown", ()=>{
  bgm.play();
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

function spawnObject(){
  const div=document.createElement("div");
  div.classList.add("falling");

  let chance = Math.random();
  if(chance<0.05)
    div.classList.add("power2");
  else if(chance<0.1)
    div.classList.add("power");
  else if(chance<0.4)
    div.classList.add("bomb");
  else
    div.classList.add("coin");

  div.style.left=Math.random()*(window.innerWidth-40)+"px";
  div.style.top="-40px";
  gameArea.appendChild(div);
}

function slowTime() {
  const originalSpeed = speed; 
  speed=0.3;               
  setTimeout(()=>{
    speed=originalSpeed;
  }, 5000);
}

function explodeBomb(){
  const coins=document.querySelectorAll(".falling.coin");
  coins.forEach(item=>{
    item.remove();
    score++;
  })
}

function updateObjects(){
  const objects=document.querySelectorAll(".falling");
  objects.forEach(obj=>{
    let top=parseFloat(obj.style.top);
    obj.style.top=(top+speed)+"px";

    const objCoords=obj.getBoundingClientRect();
    const playerCoords=player.getBoundingClientRect();

    const adjust=5;

if (objCoords.left+adjust<playerCoords.right-adjust && objCoords.right-adjust>playerCoords.left+adjust && objCoords.top+adjust<playerCoords.bottom-adjust && objCoords.bottom-adjust>playerCoords.top+adjust){
      if(obj.classList.contains("coin")) {
        score++;
        coinSound.play();
      }else if(obj.classList.contains("power")){
        if(!shield)
          player.classList.add("shielded");
        shield=true;
        count++;
        shieldSound.play();
      }else if(obj.classList.contains("power2")){
        slowTime();
        sandevistan1.play();
        sandevistan2.play();
      }else if(obj.classList.contains("bomb")){
        if(shield){
          shield=false;
          shieldGoneSound.play();
          player.classList.remove("shielded");
          if(count>=3){
            explodeBomb();
            bombSound.play();
          }
          count=0;
        }else{
          bgm.pause();
          gameOver.play();
          alert("Game Over! Final Score: "+score);
          location.reload();
        }
      }
      obj.remove();
      scoreboard.textContent ="Score: "+score;
    }
    if (top>window.innerHeight) {
      obj.remove();
    }
  });
}

function gameLoop(){
  if(keys.left)
   playerX-=5;
  if(keys.right) 
   playerX+=5;
  playerX=Math.max(0, Math.min(window.innerWidth-100, playerX));
  player.style.left=playerX+"px";

  updateObjects();
  requestAnimationFrame(gameLoop);
}

function spawnLoop(){
  spawnObject();
  if(spawnInterval>100)
   spawnInterval-=5;
  if(speed<10)speed+=0.03;
  setTimeout(spawnLoop, spawnInterval);
}

bgm.play();
gameLoop();
spawnLoop();


