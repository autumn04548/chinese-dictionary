const response=await fetch(new URL('./data/dictionary.json',import.meta.url));
if(!response.ok)throw Error('字典載入失敗，請重新整理或檢查網路。');
export const records=await response.json();
const index=new Map(records.map(e=>[e.title,e]));
export function characterEntry(character,context='') {
  const raw=index.get(character);
  if(!raw||[...character].length!==1)return null;
  const readings=[...new Set((raw.heteronyms||[]).map(h=>h.bopomofo).filter(Boolean))];
  const word=index.get(context),position=[...context].indexOf(character);
  const base=r=>r.replace(/[˙ˊˇˋˉ]/g,'');
  const selected=[...new Set(position<0?[]:(word?.heteronyms||[]).map(h=>h.bopomofo?.trim().split(/\s+/)[position]).filter(r=>r&&readings.some(x=>base(x)===base(r))))];
  return {character,bopomofo:(selected.length===1?selected:readings).join('／'),radical:raw.radical?.trim()||'未提供',strokes:raw.stroke_count??'未提供',words:context&&word?[context]:[],readings,source:'教育部《重編國語辭典修訂本》',readingNote:selected.length===1?'依參考詞選讀音':readings.length>1?'多音字：請依詞義確認讀音':'字典讀音'};
}
export function resultForTargets(targets,text,context='',mode='local'){
  const candidates=[...new Set(targets)].map(c=>characterEntry(c,context)).filter(Boolean);
  if(candidates.length===1)return {status:'ok',mode,transcript:text,entry:candidates[0]};
  if(candidates.length>1)return {status:'choose',mode,candidates,message:'請選擇要查的字；多音字顯示字典讀音供確認。'};
  return {status:'not_found',mode,message:'字典未收錄這個字，或字形包含特殊編碼；未產生猜測資料。'};
}
export function lookup(input){
  if(typeof input!=='string'||!input.trim()||input.length>200)return {status:'invalid',message:'請輸入 1～200 個字。'};
  const text=input.trim();
  if([...text].length===1)return resultForTargets([text],text);
  if(/不是|不要|而是|改查/.test(text))return {status:'clarify',mode:'local',message:'本機模式無法可靠判斷否定與修正，請直接輸入要查的字或詞。'};
  const match=text.match(/^([\p{Script=Han}]{1,20})的([\p{Script=Han}])(?:怎麼寫|怎樣寫|如何寫|字怎麼寫|字)?[？?。！!]?$/u);
  if(match){
    const [,context,heard]=match;
    const chars=[...new Set([...context])];
    if(chars.includes(heard))return resultForTargets([heard],text,context);
    const normalize=r=>r.replace(/[˙ˊˇˋˉ\s]/g,'');
    const heardSounds=(index.get(heard)?.heteronyms||[]).map(h=>h.bopomofo).filter(Boolean).map(normalize);
    const matching=chars.filter(c=>(index.get(c)?.heteronyms||[]).some(h=>h.bopomofo&&heardSounds.includes(normalize(h.bopomofo))));
    const targets=matching.length?matching:chars;
    const result=resultForTargets(targets,text,context);
    if(result.status==='ok')result.message=`依「${context}」中的字，將「${heard}」修正為「${result.entry.character}」。`;
    if(result.status==='choose')result.message=matching.length?'詞語中有多個同音字，請選擇要查的字。':`「${heard}」不在「${context}」中，請從詞語選字。`;
    return result;
  }
  const direct=text.match(/^(?:請問|請查|查)?([\p{Script=Han}])(?:怎麼寫|怎樣寫|如何寫)[？?。！!]?$/u);
  if(direct)return resultForTargets([direct[1]],text);
  if(index.has(text))return resultForTargets([...text],text,text);
  const multiple=text.match(/^([\p{Script=Han}])(?:與|和|、)([\p{Script=Han}])怎麼寫[？?]?$/u);
  if(multiple)return resultForTargets([multiple[1],multiple[2]],text);
  return {status:'clarify',mode:'local',message:'本機模式請輸入單字、詞語，或「認識的識怎麼寫」。請縮短問句或直接輸入要查的字。'};
}
