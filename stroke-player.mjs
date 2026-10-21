const ns='http://www.w3.org/2000/svg';
const el=(name,attrs)=>{const node=document.createElementNS(ns,name);for(const [k,v]of Object.entries(attrs))node.setAttribute(k,v);return node;};
const box=document.getElementById('strokeBoard'),note=document.getElementById('strokeStatus');
const buttons=['playStroke','nextStroke','replayStroke'].map(id=>document.getElementById(id));
let data=null,index=0,generation=0,playing=false,animation=null;
function controls(){buttons.forEach(b=>b.disabled=!data||playing);}
export function resetStrokes(){generation++;animation?.cancel();animation=null;data=null;index=0;playing=false;box.replaceChildren();note.textContent='查字後可播放筆順';controls();}
function paint(){
  const svg=el('svg',{viewBox:'0 0 1024 1024',role:'img','aria-label':`筆順示範，已完成 ${index} 畫`});
  svg.append(el('path',{d:'M0 512H1024M512 0V1024M0 0L1024 1024M0 1024L1024 0',stroke:'#d6dfd7','stroke-dasharray':'12 12',fill:'none'}));
  const group=el('g',{transform:'translate(0,900) scale(1,-1)'});
  data.strokes.forEach((d,i)=>group.append(el('path',{d,fill:i<index?'#205f4c':'#e3e9e1'})));
  svg.append(group);box.replaceChildren(svg);note.textContent=`第 ${index}／${data.strokes.length} 畫`;
  return group;
}
async function step(token){
  if(!data||index>=data.strokes.length)return;
  const group=paint(),i=index,points=data.medians[i];
  const length=points.slice(1).reduce((n,p,j)=>n+Math.hypot(p[0]-points[j][0],p[1]-points[j][1]),0)+180;
  const mask=el('mask',{id:'stroke-reveal',maskUnits:'userSpaceOnUse',x:'-200',y:'-200',width:'1500',height:'1500'});
  const line=el('polyline',{points:points.map(p=>p.join(',')).join(' '),fill:'none',stroke:'white','stroke-width':180,'stroke-linecap':'round','stroke-linejoin':'round','stroke-dasharray':length,'stroke-dashoffset':length});
  mask.append(line);group.append(mask,el('path',{d:data.strokes[i],fill:'#cf7636',mask:'url(#stroke-reveal)'}));
  animation=line.animate([{strokeDashoffset:String(length)},{strokeDashoffset:'0'}],{duration:650,fill:'forwards'});
  try{await animation.finished;}catch{return;}
  if(token!==generation)return;
  index++;paint();
}
export async function loadStrokes(character){
  resetStrokes();const token=generation;note.textContent='載入筆順參考資料…';
  try{let r=await fetch(new URL('./data/strokes/'+character.codePointAt(0).toString(16)+'.json',import.meta.url));
if(r.status===404)r=await fetch('https://raw.githubusercontent.com/chanind/hanzi-writer-data/68d10a4b21150cae5e1ebbd223eed289cf32d90c/data/'+encodeURIComponent(character)+'.json',{signal:AbortSignal.timeout(12000)});
if(!r.ok)throw Error(r.status===404?'此字尚無筆順資料。':'筆順下載失敗，請確認網路。');
const d=await r.json();if(token!==generation)return;if(!r.ok)throw Error(d.message);data=d;paint();controls();await run(true,true);}catch(e){if(token===generation)note.textContent=e.message||'無法載入筆順';}
}
async function run(restart,all){if(!data||playing)return;if(restart||index===data.strokes.length)index=0;playing=true;controls();const token=generation;try{do{await step(token);}while(all&&token===generation&&index<data.strokes.length);}finally{if(token===generation){playing=false;controls();}}}
buttons[0].onclick=()=>run(false,true);buttons[1].onclick=()=>run(false,false);buttons[2].onclick=()=>run(true,true);
resetStrokes();
