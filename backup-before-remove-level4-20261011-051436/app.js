function runGame(){
const initialHTML=document.documentElement.outerHTML;

'use strict';
const $=id=>document.getElementById(id);
let MISSIONS=window.AFTER_HOURS_QUESTIONS.mission.map(c=>[c.level-1,c.type,c.text]);
let missionMin=0, missionMax=1, revealed=false, drawing=false;
const missionNames=['가볍게','과감하게','아슬하게','화끈하게'];
function renderRange(){ $('mission-min').value=String(missionMin);$('mission-max').value=String(missionMax);$('rangehint').textContent=(missionMin===missionMax?(missionMin+1)+'단계':(missionMin+1)+'–'+(missionMax+1)+'단계')+' 카드만 섞어요. 변경한 범위는 새 게임부터 적용돼요.'; }
$('mission-min').onchange=()=>{missionMin=Number($('mission-min').value);if(missionMin>missionMax)missionMax=missionMin;renderRange();save();};
$('mission-max').onchange=()=>{missionMax=Number($('mission-max').value);if(missionMax<missionMin)missionMin=missionMax;renderRange();save();};
let names=[],deck=[],cursor=0,turn=0,active=false,roster=[],timerID=null,deadline=0;
try{const s=JSON.parse(localStorage.getItem('after-hours-v1'));if(s){names=Array.isArray(s.names)?s.names.filter(n=>typeof n==='string'&&n.trim()).map(n=>n.slice(0,16)).slice(0,12):[];if(Number.isInteger(s.missionMin)&&Number.isInteger(s.missionMax)&&s.missionMin>=0&&s.missionMax<=3&&s.missionMin<=s.missionMax){missionMin=s.missionMin;missionMax=s.missionMax;}}}catch{}
function save(){try{localStorage.setItem('after-hours-v1',JSON.stringify({names,missionMin,missionMax}))}catch{}}
function renderNames(){$('players').replaceChildren();names.forEach((n,i)=>{const b=document.createElement('button');b.className='chip';b.type='button';b.textContent=n+' ×';b.setAttribute('aria-label',n+' 삭제');b.onclick=()=>{names.splice(i,1);save();renderNames()};$('players').append(b)})}
$('addform').onsubmit=e=>{e.preventDefault();const n=$('name').value.trim();if(!n)return;if(names.length>=12){$('error').textContent='최대 12명까지 함께할 수 있어요.';return}if(names.includes(n)){$('error').textContent='같은 이름 대신 별명을 넣어 주세요.';return}names.push(n);$('name').value='';$('error').textContent='';save();renderNames()};
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function stopTimer(){clearInterval(timerID);timerID=null;$('timer').textContent='천천히 해도 좋아';$('timerbutton').textContent='◷ 30초 타이머'}
function display(){

stopTimer();revealed=false;$('card').classList.add('face-down');const c=deck[cursor];
$('type').textContent='MISSION OR PASS';$('heat').textContent='🥃'.repeat(c[0]+1)+' · '+missionNames[c[0]];
$('target').textContent=roster[turn%roster.length]+'의 차례';$('question').textContent='이번 카드는 어떤 미션?';$('symbol').textContent='✦';
$('sub').textContent='기기를 넘겨받고 카드를 뽑아 주세요. 잔 아이콘은 난이도예요.';
$('round').textContent='ROUND '+String(cursor+1).padStart(2,'0');$('remaining').textContent=(deck.length-cursor)+'장 남음';$('cardnumber').textContent=String(cursor+1).padStart(2,'0')+' / '+deck.length;
$('next').textContent='카드 뽑기 ↗';$('timerbutton').disabled=true;
}
async function reveal(){
if(drawing||revealed||!active)return;
drawing=true;const card=$('card');card.setAttribute('aria-busy','true');
['next','timerbutton','start','end'].forEach(id=>$(id).disabled=true);
$('next').textContent='카드 뽑는 중…';
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
async function motion(frames,duration){if(reduced||!card.animate)return;const animation=card.animate(frames,{duration,easing:'cubic-bezier(.22,.7,.25,1)',fill:'forwards'});try{await animation.finished;}finally{animation.cancel();}}
try{
await motion([{transform:'translateY(0) rotateZ(0) rotateY(0)',offset:0},{transform:'translateY(-32px) rotateZ(-5deg) rotateY(0)',offset:.5},{transform:'translateY(-24px) rotateZ(-3deg) rotateY(90deg)',offset:1}],420);
revealed=true;card.classList.remove('face-down');
$('question').textContent=deck[cursor][2];$('sub').textContent='';
await motion([{transform:'translateY(-24px) rotateZ(-3deg) rotateY(-90deg)'},{transform:'translateY(-8px) rotateZ(1deg) rotateY(0)',offset:.75},{transform:'translateY(0) rotateZ(0) rotateY(0)'}],430);
}finally{
drawing=false;card.setAttribute('aria-busy','false');
['next','timerbutton','start','end'].forEach(id=>$(id).disabled=false);
$('remaining').textContent=(deck.length-cursor-1)+'장 남음';
$('next').textContent=cursor===deck.length-1?'게임 마무리 →':'카드 뽑기 ↗';
}
}
function finish(){if(drawing)return;$('card').classList.remove('face-down');active=false;stopTimer();['next','timerbutton','end'].forEach(id=>$(id).disabled=true);$('type').textContent='THAT WAS A GOOD NIGHT';$('target').textContent='오늘의 이야기는 여기까지';$('question').textContent='비밀은 이 테이블에.\n추억은 오래오래.';$('sub').textContent='물 한 잔 마시고 쉬어 가요. 새 게임으로 다시 시작할 수 있어요.';$('remaining').textContent='게임 종료';$('symbol').textContent='✳';$('start').textContent='새 게임 시작 ↗'}
function advance(){if(!active||drawing)return;if(cursor+1>=deck.length){finish();return}cursor++;turn++;display();reveal()}
$('start').onclick=()=>{if(drawing)return;if(names.length<2){$('error').textContent='참가자를 2명 이상 추가해 주세요.';return}if(active&&!confirm('진행 중인 게임을 끝내고 새로 시작할까요?'))return;deck=shuffle(MISSIONS.filter(c=>c[0]>=missionMin&&c[0]<=missionMax).slice());if(!deck.length){$('error').textContent='이 설정에 해당하는 카드가 없어요. 난이도를 바꾸거나 미션 카드를 추가해 주세요.';finish();return}roster=names.slice();cursor=0;turn=0;active=true;$('error').textContent='';$('start').textContent='설정으로 새 게임 ↗';['next','timerbutton','end'].forEach(id=>$(id).disabled=false);display();if(innerWidth<761)$('card').scrollIntoView({behavior:'smooth',block:'center'})};
$('next').onclick=()=>{if(!active||drawing)return;if(!revealed){reveal();return}advance()};$('end').onclick=()=>{if(drawing)return;if(confirm('이번 게임을 마칠까요?'))finish()};
$('timerbutton').onclick=()=>{if(timerID){stopTimer();return}deadline=Date.now()+30000;$('timerbutton').textContent='타이머 취소';$('timer').textContent='30초';timerID=setInterval(()=>{const s=Math.max(0,Math.ceil((deadline-Date.now())/1000));$('timer').textContent=s?s+'초':'시간 끝! 서두르지 않아도 괜찮아';if(!s){clearInterval(timerID);timerID=null;$('timerbutton').textContent='◷ 다시 30초'}},200)};
$('adult').onchange=()=>{$('enter').disabled=!$('adult').checked};$('enter').onclick=()=>{$('gate').close()};$('gate').addEventListener('cancel',e=>e.preventDefault());
function cardJSON(){return {version:1,mission:MISSIONS.map(c=>({level:c[0]+1,type:c[1],text:c[2]}))}}
function downloadFile(text,name,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
$('download').onclick=async()=>{try{
const doc=new DOMParser().parseFromString(initialHTML,'text/html').documentElement;
doc.querySelectorAll('script').forEach(el=>el.remove());
const link=doc.querySelector('link[rel="stylesheet"]');
if(link){const response=await fetch(link.href);if(!response.ok)throw Error('스타일 읽기 실패');const style=document.createElement('style');style.textContent=await response.text();link.replaceWith(style);}
const data=document.createElement('script');data.textContent='window.AFTER_HOURS_QUESTIONS='+JSON.stringify(cardJSON()).replace(/</g,'\\u003c')+';';doc.querySelector('body').append(data);
const code=document.createElement('script');code.textContent='('+runGame.toString()+')();';doc.querySelector('body').append(code);
downloadFile('<!doctype html>\n'+doc.outerHTML,'after-hours-offline.html','text/html;charset=utf-8');
}catch(err){alert('단일 HTML 저장은 로컬 서버에서 실행해 주세요. 파일을 직접 연 경우에는 프로젝트 폴더 전체를 복사해서 보관하세요.');}};

renderRange();renderNames();$('gate').showModal();

}
runGame();

