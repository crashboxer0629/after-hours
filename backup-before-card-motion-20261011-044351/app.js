function runGame(){
const initialHTML=document.documentElement.outerHTML;

'use strict';
const $=id=>document.getElementById(id);
let MISSIONS=window.AFTER_HOURS_QUESTIONS.mission.map(c=>[c.level-1,c.type,c.text]);
let missionLevel=1, revealed=false;
const missionNames=['가볍게','과감하게','아슬하게','화끈하게'];
document.querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>{missionLevel=+b.dataset.mission;document.querySelectorAll('[data-mission]').forEach(x=>{const chosen=x===b;x.classList.toggle('active',chosen);x.setAttribute('aria-pressed',String(chosen))})});
let names=[],deck=[],cursor=0,turn=0,active=false,roster=[],timerID=null,deadline=0;
try{const s=JSON.parse(localStorage.getItem('after-hours-v1'));if(s){names=Array.isArray(s.names)?s.names.filter(n=>typeof n==='string'&&n.trim()).map(n=>n.slice(0,16)).slice(0,12):[]}}catch{}
function save(){try{localStorage.setItem('after-hours-v1',JSON.stringify({names}))}catch{}}
function renderNames(){$('players').replaceChildren();names.forEach((n,i)=>{const b=document.createElement('button');b.className='chip';b.type='button';b.textContent=n+' ×';b.setAttribute('aria-label',n+' 삭제');b.onclick=()=>{names.splice(i,1);save();renderNames()};$('players').append(b)})}
$('addform').onsubmit=e=>{e.preventDefault();const n=$('name').value.trim();if(!n)return;if(names.length>=12){$('error').textContent='최대 12명까지 함께할 수 있어요.';return}if(names.includes(n)){$('error').textContent='같은 이름 대신 별명을 넣어 주세요.';return}names.push(n);$('name').value='';$('error').textContent='';save();renderNames()};
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function stopTimer(){clearInterval(timerID);timerID=null;$('timer').textContent='천천히 해도 좋아';$('timerbutton').textContent='◷ 30초 타이머'}
function display(){

stopTimer();revealed=false;const c=deck[cursor];
$('type').textContent='MISSION OR PASS';$('heat').textContent='🥃'.repeat(c[0]+1)+' · '+missionNames[c[0]];
$('target').textContent=roster[turn%roster.length]+'의 차례';$('question').textContent='이번 카드는 어떤 미션?';$('symbol').textContent='✦';
$('sub').textContent='기기를 넘겨받고 카드를 뽑아 주세요. 잔 아이콘은 난이도예요.';
$('round').textContent='ROUND '+String(cursor+1).padStart(2,'0');$('remaining').textContent=(deck.length-cursor)+'장 남음';$('cardnumber').textContent=String(cursor+1).padStart(2,'0')+' / '+deck.length;
$('next').textContent='카드 뽑기 ↗';$('pass').disabled=true;$('timerbutton').disabled=true;
}
function reveal(){revealed=true;$('question').textContent=deck[cursor][2];$('sub').textContent='미션을 수행하거나 이유 없이 패스해도 괜찮아요. 음주 벌칙은 없어요.';$('next').textContent=cursor===deck.length-1?'수행 완료 · 마무리 ✓':'수행 완료 · 다음 차례 →';$('pass').disabled=false;$('timerbutton').disabled=false;$('card').classList.remove('flash');void $('card').offsetWidth;$('card').classList.add('flash')}
function finish(){active=false;stopTimer();['pass','next','timerbutton','end'].forEach(id=>$(id).disabled=true);$('type').textContent='THAT WAS A GOOD NIGHT';$('target').textContent='오늘의 이야기는 여기까지';$('question').textContent='비밀은 이 테이블에.\n추억은 오래오래.';$('sub').textContent='물 한 잔 마시고 쉬어 가요. 새 게임으로 다시 시작할 수 있어요.';$('remaining').textContent='게임 종료';$('symbol').textContent='✳';$('start').textContent='새 게임 시작 ↗'}
function advance(){if(!active)return;if(cursor+1>=deck.length){finish();return}cursor++;turn++;display()}
$('start').onclick=()=>{if(names.length<2){$('error').textContent='참가자를 2명 이상 추가해 주세요.';return}if(active&&!confirm('진행 중인 게임을 끝내고 새로 시작할까요?'))return;deck=shuffle(MISSIONS.filter(c=>c[0]<=missionLevel).slice());if(!deck.length){$('error').textContent='이 설정에 해당하는 카드가 없어요. 난이도를 바꾸거나 미션 카드를 추가해 주세요.';finish();return}roster=names.slice();cursor=0;turn=0;active=true;$('error').textContent='';$('start').textContent='설정으로 새 게임 ↗';['pass','next','timerbutton','end'].forEach(id=>$(id).disabled=false);display();if(innerWidth<761)$('card').scrollIntoView({behavior:'smooth',block:'center'})};
$('next').onclick=()=>{if(!active)return;if(!revealed){reveal();return}advance()};$('pass').onclick=()=>{if(!revealed)return;advance()};$('end').onclick=()=>{if(confirm('이번 게임을 마칠까요?'))finish()};
$('timerbutton').onclick=()=>{if(timerID){stopTimer();return}deadline=Date.now()+30000;$('timerbutton').textContent='타이머 취소';$('timer').textContent='30초';timerID=setInterval(()=>{const s=Math.max(0,Math.ceil((deadline-Date.now())/1000));$('timer').textContent=s?s+'초':'시간 끝! 서두르지 않아도 괜찮아';if(!s){clearInterval(timerID);timerID=null;$('timerbutton').textContent='◷ 다시 30초'}},200)};
$('adult').onchange=()=>{$('enter').disabled=!$('adult').checked};$('enter').onclick=()=>{$('gate').close()};$('gate').addEventListener('cancel',e=>e.preventDefault());
const DEFAULT_MISSIONS=MISSIONS.map(c=>c.slice());
function cardJSON(){return {version:1,mission:MISSIONS.map(c=>({level:c[0]+1,type:c[1],text:c[2]}))}}
function validateCards(d){
if(!d||d.version!==1)throw Error('version은 1이어야 해요.');
const result={};for(const key of ['mission']){
if(!Array.isArray(d[key])||d[key].length>5000)throw Error(key+': 카드 배열이 필요하며 최대 5000개예요.');
result[key]=d[key].map((c,i)=>{const where=key+' '+(i+1)+'번: ';
if(!c||!Number.isInteger(c.level)||c.level<1||c.level>4)throw Error(where+'level 범위를 확인해 주세요.');
if(!['미션'].includes(c.type))throw Error(where+'type이 올바르지 않아요.');
if(typeof c.text!=='string'||!c.text.trim()||c.text.length>2000)throw Error(where+'text는 1~2000자의 문장이 필요해요.');
return [c.level-1,c.type,c.text];});}
if(!result.mission.length)throw Error('카드가 최소 1개 필요해요.');return result;
}
function applyCards(d,persist=true){const valid=validateCards(d);if(active)finish();MISSIONS=valid.mission;
$('importstatus').textContent='적용 완료 · 미션 '+MISSIONS.length+'장. 새 게임을 시작하세요.';
if(persist){try{localStorage.setItem('after-hours-cards-v1',JSON.stringify(cardJSON()))}catch{$('importstatus').textContent+=' 자동 저장 불가: 오프라인 파일 저장으로 보관하세요.'}}}
function downloadFile(text,name,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
$('jsonfile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>5*1024*1024)throw Error('파일은 5MB 이하여야 해요.');const d=JSON.parse(await f.text());validateCards(d);if(active&&!confirm('게임을 끝내고 새 카드를 적용할까요?'))return;applyCards(d)}catch(err){$('importstatus').textContent='불러오기 실패: '+err.message+' 기존 카드는 유지돼요.'}finally{e.target.value=''}};
$('exportjson').onclick=()=>downloadFile(JSON.stringify(cardJSON(),null,2),'after-hours-cards.json','application/json;charset=utf-8');
$('resetjson').onclick=()=>{if(!confirm('가져온 카드를 기본 카드로 되돌릴까요?'))return;applyCards({version:1,mission:DEFAULT_MISSIONS.map(c=>({level:c[0]+1,type:c[1],text:c[2]}))})};
$('download').onclick=async()=>{try{
const doc=new DOMParser().parseFromString(initialHTML,'text/html').documentElement;
doc.querySelectorAll('script').forEach(el=>el.remove());
const link=doc.querySelector('link[rel="stylesheet"]');
if(link){const response=await fetch(link.href);if(!response.ok)throw Error('스타일 읽기 실패');const style=document.createElement('style');style.textContent=await response.text();link.replaceWith(style);}
const data=document.createElement('script');data.textContent='window.AFTER_HOURS_QUESTIONS='+JSON.stringify(cardJSON()).replace(/</g,'\\u003c')+';';doc.querySelector('body').append(data);
const code=document.createElement('script');code.textContent='('+runGame.toString()+')();';doc.querySelector('body').append(code);
downloadFile('<!doctype html>\n'+doc.outerHTML,'after-hours-offline.html','text/html;charset=utf-8');
}catch(err){$('importstatus').textContent='단일 HTML 저장은 로컬 서버에서 실행해 주세요. 파일을 직접 연 경우에는 프로젝트 폴더 전체를 복사하거나 카드 JSON 내보내기를 사용하세요.';}};

try{const embedded=document.getElementById('embedded-cards');if(embedded){applyCards(JSON.parse(embedded.textContent),false)}else{const saved=localStorage.getItem('after-hours-cards-v1');if(saved)applyCards(JSON.parse(saved),false)}}catch{$('importstatus').textContent='저장된 카드를 읽지 못해 기본 카드를 사용해요.'}
renderNames();$('gate').showModal();

}
runGame();

