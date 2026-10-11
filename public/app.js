
const $=s=>document.querySelector(s);
const STEPS=[
["ASSESS","We understand your goals, current status, lifestyle and event date.",["Goal & lifestyle discovery","Body & posture assessment","Timeline mapped to your date"]],
["BUILD","Personalised training, nutrition, posture and lifestyle plan.",["Custom workout programme","Diet plan with meal partners","Posture & mobility routine"]],
["TRANSFORM","Consistent progress with expert guidance and tracking.",["Weekly check-ins","Progress tracking","Plan adjustments as you evolve"]],
["REFINE","Fine-tune your physique, posture, grooming and style.",["Grooming & skin guidance","Outfit consultation & tailoring","Presentation coaching"]],
["EVENT READY","Look, feel and present your best on your special day.",["Final styling & grooming","Confidence & mindset prep","Walk in ready"]]];
let cur=0;
function step(i){cur=i;[...$('#tabs').children].forEach((b,j)=>b.classList.toggle('on',j==i));
$('#pt').textContent=STEPS[i][0];$('#pd').textContent=STEPS[i][1];
$('#pl').innerHTML=STEPS[i][2].map(x=>'<li>'+x+'</li>').join('');$('#pb').style.width=((i+1)/5*100)+'%'}
STEPS.forEach((s,i)=>{const b=document.createElement('button');b.innerHTML='<i>'+(i+1)+'</i><b>'+s[0]+'</b>';b.onclick=()=>step(i);$('#tabs').appendChild(b)});
step(0);setInterval(()=>{if(!document.hidden&&!$('#tabs').matches(':hover'))step((cur+1)%5)},5000);

function pills(id,list,sel){const el=$(id);list.forEach((t,i)=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{[...el.children].forEach(c=>c.classList.remove('on'));b.classList.add('on');sel(t)};el.appendChild(b);if(i==0)b.click()})}
let ev,go;
pills('#o-ev',['Wedding','Engagement','Birthday','Photoshoot','Corporate','Celebration'],t=>ev=t);
pills('#o-go',['Lean & fit','Build muscle','Posture & confidence','Total makeover'],t=>go=t);
const d0=new Date();d0.setDate(d0.getDate()+90);$('#dt').value=d0.toISOString().slice(0,10);$('#dt').min=new Date().toISOString().slice(0,10);
function days(){return Math.round((new Date($('#dt').value)-new Date(new Date().toDateString()))/864e5)}
function pkg(n){return n<=75?'Event 60':n<=135?'Event 90':'Signature 180'}
function rec(){const n=days(),r=$('#rec');if(isNaN(n)||n<1){r.style.display='none';return}
r.style.display='block';r.innerHTML='<b>'+n+' days to go</b> → best fit: <b style="color:var(--gold)">'+pkg(n)+'</b>'+(n<30?' (short runway — we\'ll focus on high-impact wins)':'')}
$('#dt').oninput=rec;rec();
document.querySelectorAll('.plan').forEach(p=>p.querySelector('a').addEventListener('click',()=>{window.chosen=p.dataset.p}));

const out=$('#out');
async function api(path,body){
  const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(j.error||'Something went wrong. Please try again.');
  return j;
}
// reveal text word-by-word for a "live typing" feel
function typeOut(el,text,done){
  const words=text.split(/(\s+)/);let i=0;el.textContent='';
  (function tick(){el.textContent+=words.slice(i,i+3).join('');i+=3;
    if(el.id==='out'){}else $('#msgs').scrollTop=1e6;
    if(i<words.length)setTimeout(tick,18);else done&&done()})();
}

$('#gen').onclick=async()=>{
  const n=days();
  if(isNaN(n)||n<1){out.className='out empty';out.textContent='Please pick a future event date.';return}
  const btn=$('#gen');btn.disabled=true;btn.textContent='Crafting your plan…';
  out.className='out empty';out.textContent='Our AI coach is building your roadmap…';
  try{
    const r=await api('/api/plan',{event:ev,goal:go,days:n,notes:$('#nt').value});
    out.className='out cursor';
    typeOut(out,r.text,()=>out.classList.remove('cursor'));
  }catch(e){out.className='out empty';out.textContent=e.message+' You can also book a free consultation and we\'ll build your plan together.'}
  btn.disabled=false;btn.textContent='Generate my plan ✦';
};

const hist=[];
function add(c,t){const d=document.createElement('div');d.className='m '+c;d.textContent=t;$('#msgs').appendChild(d);$('#msgs').scrollTop=1e6;return d}
async function send(q){
  if(!q)return;$('#qs').style.display='none';add('u',q);hist.push({role:'user',content:q});
  const b=add('a','…');
  try{
    const r=await api('/api/chat',{messages:hist.slice(-10)});
    hist.push({role:'assistant',content:r.text});typeOut(b,r.text);
  }catch(e){hist.pop();b.textContent=e.message+' You can WhatsApp us on +91 96111 42974.'}
}
$('#cs').onclick=()=>{const v=$('#ci').value.trim();$('#ci').value='';send(v)};
$('#ci').onkeydown=e=>{if(e.key==='Enter')$('#cs').click()};
['Which package is right for me?','Wedding in 60 days?','What do partners offer?'].forEach(q=>{const b=document.createElement('button');b.textContent=q;b.onclick=()=>send(q);$('#qs').appendChild(b)});
$('#fab').onclick=()=>$('#chat').classList.toggle('open');
add('a','Hi! I\'m the QRONO concierge ✦ Ask me about packages, timelines or how the program works.');

const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.1});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));
