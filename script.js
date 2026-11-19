// PROJECT 08.02 — contatore, stelle, galleria e audio ambient originale.
const start = new Date(2026, 1, 8, 0, 0, 0); // 8 febbraio 2026, ora locale
const pad = n => String(n).padStart(2, "0");
function updateCounter() {
  const elapsed = Math.max(0, Date.now() - start.getTime());
  const total = Math.floor(elapsed / 1000);
  document.getElementById("days").textContent = Math.floor(total / 86400).toLocaleString("it-IT");
  document.getElementById("hours").textContent = pad(Math.floor(total % 86400 / 3600));
  document.getElementById("minutes").textContent = pad(Math.floor(total % 3600 / 60));
  document.getElementById("seconds").textContent = pad(total % 60);
}
updateCounter(); setInterval(updateCounter, 1000);

// Animazione stelle leggera.
const canvas = document.getElementById("stars"), ctx = canvas.getContext("2d");
let stars = [], w = 0, h = 0, tick = 0;
function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight;
  canvas.width = w*dpr; canvas.height = h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
  stars = Array.from({length: Math.min(115, Math.floor(w*h/8500))}, () => ({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.2+.25,a:Math.random()*.55+.15,p:Math.random()*6.28}));
}
function draw() {
  ctx.clearRect(0,0,w,h); tick += .012;
  for (const s of stars) { ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,6.28); ctx.fillStyle=`rgba(225,205,245,${s.a*(.65+.35*Math.sin(tick+s.p))})`; ctx.fill(); }
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) requestAnimationFrame(draw);
}
resize(); draw(); addEventListener("resize",resize);

// Ingrandimento dei ricordi.
const viewer = document.getElementById("viewer");
document.querySelectorAll(".photo").forEach(b => b.addEventListener("click", () => { document.getElementById("viewerImage").src=b.dataset.image; viewer.showModal(); }));
document.getElementById("closeViewer").addEventListener("click",()=>viewer.close());
viewer.addEventListener("click",e=>{if(e.target===viewer)viewer.close();});

// Audio ambient sintetizzato localmente: parte solo su richiesta.
let audio=null, nodes=[], master=null, playing=false;
document.getElementById("soundToggle").addEventListener("click",async()=>{
  const button=document.getElementById("soundToggle"), label=document.getElementById("soundLabel");
  if(!playing){
    const Audio=window.AudioContext||window.webkitAudioContext; if(!Audio)return;
    audio=audio||new Audio(); await audio.resume(); master=audio.createGain(); master.gain.value=.0001; master.connect(audio.destination);
    [110,164.81,220].forEach((hz,i)=>{const osc=audio.createOscillator(),g=audio.createGain();osc.type="sine";osc.frequency.value=hz;g.gain.value=[.22,.12,.07][i];osc.connect(g);g.connect(master);osc.start();nodes.push(osc);});
    master.gain.setTargetAtTime(.035,audio.currentTime,1.2);playing=true;button.setAttribute("aria-pressed","true");label.textContent="Suono: acceso";
  }else{
    master.gain.setTargetAtTime(.0001,audio.currentTime,.35);setTimeout(()=>{nodes.forEach(n=>{try{n.stop()}catch{}});nodes=[];},1200);
    playing=false;button.setAttribute("aria-pressed","false");label.textContent="Suono: spento";
  }
});