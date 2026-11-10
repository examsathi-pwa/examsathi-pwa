import {categories,tests} from './data.js';
import {stateExams,centralExams,bankingExams} from './exam-catalog.js';
import {entranceExams} from './entrance-exam-catalog.js';
import {firebaseConfig} from './firebase-config.js';
import {loadQuestionBank, bankFileForExam} from './question-bank.js';
const $=id=>document.getElementById(id);
window.addEventListener('error',e=>{const box=document.getElementById('catalog');if(box&&!document.getElementById('appError')){const p=document.createElement('p');p.id='appError';p.className='exam-empty';p.textContent='App error: '+(e.message||'JavaScript error')+' — page refresh करें।';box.prepend(p)}});
window.addEventListener('unhandledrejection',e=>{const box=document.getElementById('catalog');if(box&&!document.getElementById('appError')){const p=document.createElement('p');p.id='appError';p.className='exam-empty';p.textContent='App error: '+String(e.reason?.message||e.reason||'Request failed');box.prepend(p)}});
let lang=(()=>{try{return localStorage.getItem('es_lang')||'hi'}catch{return 'hi'}})(),cat='All',current=null,index=0,answers=[],seconds=0,timer=null,auth=null,confirmation=null,loggedUser=null,marked=new Set(),testStartedAt=0,loadedBankExam='',loadedBankTests=[],selectedLength=10;
const tr=(hi,en)=>lang==='hi'?hi:en;
const safeRead=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return Array.isArray(v)?v:fallback}catch{return fallback}};
const safeWrite=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}};
function stop(){if(timer){clearInterval(timer);timer=null;}}
function show(section){for(const id of ['catalog','quiz','result','auth'])$(id).hidden=id!==section;}
function categoryForExam(ex,section){
 const n=String(ex||'').toLowerCase();
 if(/ctet/.test(n))return 'CTET';
 if(section==='entrance')return 'Entrance';
 if(section==='banking'||/bank|ibps|sbi|rbi|nabard|lic|sebi|sidbi|niacl|uiic|gic/.test(n))return 'Banking';
 if(/railway|rrb|ntpc|group\s*d|alp|technician|paramedical/.test(n))return 'Railway';
 if(/police|constable|sub.?inspector|\bsi\b|capf|agniveer|army|navy|coast guard|nda|cds|afcat/.test(n))return 'UP Police';
 if(/tgt|pgt|teacher|tet|kvs|nvs|dsssb/.test(n))return 'UP TGT';
 return 'SSC';
}
function getExamTests(){
 const ex=$('examSelect').value,section=$('examSection').value,category=categoryForExam(ex,section);
 // Dedicated exam bank always takes precedence. Never mix another exam's questions into this bank.
 const dedicated=loadedBankExam===ex?loadedBankTests:[];
 // The selected exam's own bank is the only permitted source.
 return dedicated.filter(t=>cat==='All'||t.category===cat).slice(0,20);
}
async function refreshSelectedQuestionBank(){
 const ex=$('examSelect').value;
 if(!ex)return;
 const section=$('examSection').value;
 const category=categoryForExam(ex,section);
 const file=bankFileForExam(ex);
 loadedBankExam='';
 loadedBankTests=[];
 $('catalogNote').textContent=tr('इस परीक्षा का अलग प्रश्न बैंक जाँचा जा रहा है…','Checking this exam’s dedicated question bank…');
 try{
   const bank=await loadQuestionBank(file);
   if($('examSelect').value!==ex)return;
   loadedBankExam=ex;
   loadedBankTests=bank.tests.map((t,i)=>({...t,id:t.id||`${file}-${i+1}`,category,paid:false,minutes:t.minutes||Math.max(1,t.questions.length),sourceKind:t.sourceKind||'practice'}));
   const uniqueCount=uniqueQuestionPool(loadedBankTests).length;
   $('catalogNote').textContent=tr(
     `${ex}: ${uniqueCount} अलग-अलग प्रश्न उपलब्ध हैं। 10/50/100 प्रश्नों के 20 सेट पर्याप्त प्रश्न होने पर सक्रिय होंगे। एक सेट के भीतर प्रश्न नहीं दोहरेंगे; अलग-अलग सेटों में सीमित दोहराव हो सकता है। स्रोत: ${bank.sourceLabel||'प्रश्न बैंक'}।`,
     `${ex}: ${uniqueCount} unique questions available. Twenty 10/50/100-question sets unlock when enough distinct questions exist. No repeats within a set; limited overlap across sets may occur. Source: ${bank.sourceLabel||'question bank'}.`
   );
 }catch(error){
   $('catalogNote').textContent=tr(`${ex} का प्रश्न बैंक लोड नहीं हुआ। कारण: ${error?.message||'नेटवर्क समस्या'}। पेज रीफ्रेश करके पुनः प्रयास करें।`,`Could not load the ${ex} question bank: ${error?.message||'network error'}. Refresh and retry.`);
 }
 render();
}
function uniqueQuestionPool(tests){
 const seen=new Set(),pool=[];
 for(const t of tests)for(const q of t.questions){
   const key=String(q.hi||q.en||'').normalize('NFKC').replace(/\s+/g,' ').trim().toLocaleLowerCase();
   if(!key||seen.has(key))continue;
   seen.add(key);
   pool.push({...q,category:t.category,subject:q.subject||t.subject||defaultSubject(t.category),year:q.year||t.year||null,sourceTest:t.hi});
 }
 return pool;
}
function allQuestions(){return uniqueQuestionPool(getExamTests());}
function buildSscCgl100Sets(tests){
 const pool=uniqueQuestionPool(tests);
 if(pool.length<100)return [];
 const size=100,step=Math.max(1,Math.floor(pool.length/20));
 return Array.from({length:20},(_,i)=>({
   id:'ssc-cgl-100-set-'+(i+1),category:'SSC',paid:false,minutes:100,
   hi:'SSC CGL 100 प्रश्न अभ्यास सेट '+String(i+1).padStart(2,'0'),
   en:'SSC CGL 100-Question Practice Set '+String(i+1).padStart(2,'0'),
   questions:Array.from({length:size},(_,j)=>pool[(i*step+j)%pool.length])
 }));
}
function buildExamPracticeSets(tests,size,examName){
 const subject=$('subjectSelect')?.value||'All',year=$('yearSelect')?.value||'All';
 const pool=uniqueQuestionPool(tests).filter(q=>(subject==='All'||q.subject===subject)&&(year==='All'||String(q.year)===year));
 if(pool.length<size)return [];
 const gcd=(a,b)=>b?gcd(b,a%b):a;
 let stride=Math.max(1,Math.floor(pool.length/3));
 while(pool.length>1&&gcd(stride,pool.length)!==1)stride++;
 const slug=String(examName||'exam').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
 return Array.from({length:20},(_,i)=>({
   id:slug+'-'+size+'-practice-set-'+(i+1),category:tests[0]?.category||'SSC',paid:false,minutes:size,
   hi:String(examName||'परीक्षा')+' '+size+' प्रश्न अभ्यास सेट '+String(i+1).padStart(2,'0'),
   en:String(examName||'Exam')+' '+size+'-Question Practice Set '+String(i+1).padStart(2,'0'),
   questions:Array.from({length:size},(_,j)=>pool[(i*stride+j)%pool.length])
 }));
}
function defaultSubject(category){return ({'UP TGT':'Science','SSC':'General Awareness','Railway':'Mathematics','UP Police':'General Knowledge','CTET':'Child Development & Pedagogy','Banking':'Banking Awareness'})[category]||'General';}
function updateLang(){$('language').textContent=lang==='hi'?'EN':'हिंदी';$('tag').textContent=tr('हर परीक्षा में आपका साथी','Your partner in every exam');$('welcome').textContent=tr('सरकारी परीक्षाओं की तैयारी','Prepare for Government Exams');$('intro').textContent=tr('परीक्षा चुनें, टाइम्ड मॉक टेस्ट दें और अपनी प्रगति देखें।','Choose an exam, take timed mock tests, and track your progress.');$('testTitle').textContent=tr('मॉक टेस्ट और प्रश्न बैंक','Mock Tests & Question Bank');$('historyTitle').textContent=tr('मेरे परिणाम और प्रगति','My Results & Progress');$('filterNote').textContent=tr('नोट: 10/50/100 प्रश्नों के टेस्ट के लिए चुनी गई परीक्षा/विषय में उतने अलग प्रश्न उपलब्ध होने चाहिए। वास्तविक वर्षवार पेपर तभी दिखेंगे जब सत्यापित पेपर डेटा जोड़ा जाएगा।','Note: 10/50/100-question tests require that many unique questions in the selected exam/subject. Verified year-wise papers appear after their data is added.');render();}
const teacherSubjectCatalog={
 'UP TGT':['Hindi','English','Sanskrit','Mathematics','Science','Social Science','Physical Education','Art','Music','Agriculture','Home Science','Commerce','Urdu','Computer'],
 'UP PGT':['Hindi','English','Sanskrit','Mathematics','Physics','Chemistry','Biology','History','Geography','Civics / Political Science','Economics','Sociology','Psychology','Education','Commerce','Agriculture','Home Science','Computer Science','Urdu','Art','Music','Physical Education']
};
function fillFilterOptions(){const qs=allQuestions();const subject=$('subjectSelect'),year=$('yearSelect');const oldS=subject.value,oldY=year.value;subject.replaceChildren(new Option(tr('सभी विषय','All subjects'),'All'));const exam=$('examSelect').value;const isTeacher=/TGT|PGT|teacher/i.test(exam);const available=[...new Set(qs.map(q=>q.subject).filter(Boolean))];const list=isTeacher?(teacherSubjectCatalog[/PGT/i.test(exam)?'UP PGT':'UP TGT']||available):available;[...new Set([...list,...available])].sort().forEach(s=>subject.add(new Option(s,s)));year.replaceChildren(new Option(tr('सभी वर्ष / सामान्य मॉक','All years / General mock'),'All'));[...new Set(qs.map(q=>q.year).filter(Boolean))].sort((a,b)=>Number(b)-Number(a)).forEach(y=>year.add(new Option(y,y)));if([...subject.options].some(o=>o.value===oldS))subject.value=oldS;if([...year.options].some(o=>o.value===oldY))year.value=oldY;}
function filteredQuestions(){return allQuestions().filter(q=>($('subjectSelect').value==='All'||q.subject===$('subjectSelect').value)&&($('yearSelect').value==='All'||String(q.year)===$('yearSelect').value));}
function render(){
 fillFilterOptions();
 const nav=$('categories');nav.replaceChildren();
 for(const c of categories){const btn=document.createElement('button');btn.textContent=c;btn.className=c===cat?'active':'';btn.onclick=()=>{cat=c;render()};nav.append(btn)}
 const bankTests=getExamTests(),qs=filteredQuestions();
 $('availableCount').textContent=tr(`चुने गए फ़िल्टर में ${qs.length} अलग प्रश्न उपलब्ध हैं।`,`${qs.length} unique questions available for selected filters.`);
 const lengths=$('setLengthOptions');lengths.replaceChildren();
 for(const n of [10,50,100]){const btn=document.createElement('button');btn.type='button';btn.className='length-choice'+(selectedLength===n?' active':'');btn.textContent=tr(`${n} प्रश्न`,`${n} Questions`);btn.setAttribute('aria-pressed',String(selectedLength===n));btn.onclick=()=>{selectedLength=n;$('questionCount').value=String(n);render()};lengths.append(btn)}
 $('questionCount').value=String(selectedLength);
 const wrap=$('tests');wrap.replaceChildren();
 if(!bankTests.length){
   const empty=document.createElement('div');empty.className='exam-empty';
   empty.textContent=loadedBankExam===$('examSelect').value
     ?tr('इस परीक्षा का प्रकाशित प्रश्न बैंक खाली है। अभी इस परीक्षा का मॉक टेस्ट उपलब्ध नहीं है।','The published question bank for this exam is empty. No mock test is available yet.')
     :tr('इस परीक्षा का प्रश्न बैंक लोड नहीं हुआ। परीक्षा बदलकर देखें या थोड़ी देर बाद पुनः प्रयास करें।','This exam question bank did not load. Try another exam or retry shortly.');
   wrap.append(empty);
 }
 const query=($('testSearch')?.value||'').trim().toLocaleLowerCase();
 // Keep the SSC CGL 100-question generator stable. For every other
 // dedicated exam bank, generate exactly 20 rotating sets for the selected
 // length, using only that exam's own distinct questions and active filters.
 let displayTests=bankTests;
 const selectedExamText=String($('examSelect').value||'')+' '+String($('examSelect').selectedOptions?.[0]?.textContent||'');
 const examKey=selectedExamText.toLowerCase().replace(/[^a-z0-9]/g,'');
 const isSscCgl=examKey.includes('ssccgl');
 if(isSscCgl&&selectedLength===100){
   displayTests=buildSscCgl100Sets(loadedBankExam===$('examSelect').value?loadedBankTests:bankTests);
 }else if(!isSscCgl){
   displayTests=buildExamPracticeSets(bankTests,selectedLength,selectedExamText.trim());
 }
 const filtered=displayTests.filter(t=>!query||[t.hi,t.en,t.category].some(v=>String(v||'').toLocaleLowerCase().includes(query)));
 for(let i=0;i<20;i++){const t=filtered[i]||null,card=document.createElement('article');card.className='card set-card';const title=document.createElement('h3');title.textContent=tr(`सेट ${String(i+1).padStart(2,'0')}`,`Set ${String(i+1).padStart(2,'0')}`);const info=document.createElement('p');info.className='muted';
 const bank=t?t.questions.map(q=>({...q,category:t.category,subject:q.subject||t.subject||defaultSubject(t.category),year:q.year||t.year||null})).filter(q=>($('subjectSelect').value==='All'||q.subject===$('subjectSelect').value)&&($('yearSelect').value==='All'||String(q.year)===$('yearSelect').value)):[];
 info.textContent=t?tr(`${selectedLength} प्रश्न चुने जाएंगे • ${bank.length} उपलब्ध`,`${selectedLength} questions selected • ${bank.length} available`):tr('इस सेट का प्रश्न बैंक अभी उपलब्ध नहीं है।','Question bank for this set is not available yet.');
 const btn=document.createElement('button');btn.textContent=tr(`${selectedLength} प्रश्नों वाला सेट शुरू करें`,`Start ${selectedLength}-question set`);btn.disabled=!t||bank.length<selectedLength;
 if(t&&btn.disabled)btn.textContent=tr(`${bank.length}/${selectedLength} प्रश्न उपलब्ध`,`Only ${bank.length}/${selectedLength} questions available`);if(!t)btn.textContent=tr('जल्द उपलब्ध होगा','Coming soon');
 btn.onclick=()=>{if(t)startMock(t,selectedLength)};card.append(title,info,btn);wrap.append(card)}
 renderHistory();
}
function startMock(base,desired){const bank=base.questions.map(q=>({...q,category:base.category,subject:q.subject||base.subject||defaultSubject(base.category),year:q.year||base.year||null,sourceTest:base.hi})).filter(q=>($('subjectSelect').value==='All'||q.subject===$('subjectSelect').value)&&($('yearSelect').value==='All'||String(q.year)===$('yearSelect').value));if(!bank.length){alert(tr('इस टेस्ट में चुने गए विषय/वर्ष के प्रश्न उपलब्ध नहीं हैं।','No questions in this test match the selected subject/year.'));return;}if(!desired||desired>bank.length){alert(tr(`इस सेट में ${bank.length} प्रश्न उपलब्ध हैं। कृपया उतने या उससे कम प्रश्न चुनें।`,`This set has only ${bank.length} questions. Choose that number or fewer.`));return;}const shuffled=[...bank].sort(()=>Math.random()-.5).slice(0,desired);const chosenMinutes=Number($('timeMinutes').value);const minutes=chosenMinutes>0?chosenMinutes:desired;const mock={...base,id:`${base.id}-${Date.now()}`,hi:`${base.hi} — ${desired} प्रश्न`,en:`${base.en} — ${desired} questions`,minutes,questions:shuffled};start(mock);}
function start(t){if(!t?.questions?.length)return;stop();current=t;index=0;answers=Array(t.questions.length).fill(null);marked=new Set();seconds=t.minutes*60;testStartedAt=Date.now();show('quiz');$('testMeta').textContent=`${tr(t.hi,t.en)} • ${t.questions.length} ${tr('प्रश्न','questions')}`;drawQuestion();tick();timer=setInterval(()=>{seconds--;tick();if(seconds<=0)finish(true)},1000);$('quiz').scrollIntoView({behavior:'smooth'});}
function tick(){const m=Math.floor(Math.max(0,seconds)/60),s=String(Math.max(0,seconds)%60).padStart(2,'0');$('clock').textContent=`⏱ ${m}:${s}`;}
function drawQuestion(){const q=current.questions[index];$('progress').textContent=`${index+1} / ${current.questions.length}`;$('barfill').style.width=`${(index+1)/current.questions.length*100}%`;$('question').textContent=tr(q.hi,q.en);$('questionMeta').textContent=[q.subject,q.year,q.paper?`Paper: ${q.paper}`:null].filter(Boolean).join(' • ');const opts=$('options');opts.replaceChildren();tr(q.optionsHi,q.optionsEn).forEach((label,i)=>{const b=document.createElement('button');b.className='choice'+(answers[index]===i?' selected':'');b.textContent=`${'ABCD'[i]}. ${label}`;b.onclick=()=>{answers[index]=i;drawQuestion()};opts.append(b)});$('prev').disabled=index===0;$('next').hidden=index===current.questions.length-1;$('submit').hidden=index!==current.questions.length-1;$('mark').textContent=marked.has(index)?tr('★ समीक्षा से हटाएँ','★ Unmark review'):tr('☆ समीक्षा के लिए चिह्नित करें','☆ Mark for review');$('prev').textContent=tr('← पिछला','← Previous');$('next').textContent=tr('अगला →','Next →');$('submit').textContent=tr('टेस्ट जमा करें','Submit Test');$('questionNav').replaceChildren();current.questions.forEach((_,i)=>{const b=document.createElement('button');b.className='qnav'+(i===index?' active':'')+(answers[i]!==null?' answered':'')+(marked.has(i)?' marked':'');b.textContent=String(i+1);b.title=`Question ${i+1}`;b.onclick=()=>{index=i;drawQuestion()};$('questionNav').append(b)});}
$('prev').onclick=()=>{if(index>0){index--;drawQuestion()}};$('next').onclick=()=>{if(index<current.questions.length-1){index++;drawQuestion()}};$('submit').onclick=()=>{if(confirm(tr('क्या आप टेस्ट जमा करना चाहते हैं?','Submit this test?')))finish(false)};$('mark').onclick=()=>{marked.has(index)?marked.delete(index):marked.add(index);drawQuestion()};
function finish(auto=false){if(!current)return;stop();const t=current;const correct=t.questions.reduce((sum,q,i)=>sum+(answers[i]===q.answer?1:0),0);const wrong=t.questions.reduce((sum,q,i)=>sum+(answers[i]!==null&&answers[i]!==q.answer?1:0),0);const skipped=t.questions.length-correct-wrong;const pct=Math.round(correct/t.questions.length*100);const elapsed=Math.round((Date.now()-testStartedAt)/60000);const record={id:t.id,title:tr(t.hi,t.en),score:correct,total:t.questions.length,wrong,skipped,pct,date:new Date().toLocaleString(),timestamp:Date.now(),minutesUsed:elapsed,uid:loggedUser?.uid||'guest'};const history=safeRead('es_history',[]);history.unshift(record);safeWrite('es_history',history.slice(0,50));show('result');const res=$('result');res.replaceChildren();const h=document.createElement('h2');h.textContent=`${tr('आपका स्कोर','Your Score')}: ${correct}/${t.questions.length}`;res.append(h);const stats=document.createElement('div');stats.className='result-stats';[[tr('सही','Correct'),correct,'good'],[tr('गलत','Wrong'),wrong,'bad'],[tr('छोड़े','Skipped'),skipped,'neutral'],[tr('Accuracy','Accuracy'),`${pct}%`,'neutral']].forEach(([label,val,cl])=>{const d=document.createElement('div');d.className='stat '+cl;const strong=document.createElement('strong');strong.textContent=val;const span=document.createElement('span');span.textContent=label;d.append(strong,span);stats.append(d)});res.append(stats);const note=document.createElement('p');note.textContent=auto?tr('समय पूरा होने पर टेस्ट अपने आप जमा हो गया।','The test was auto-submitted when time ran out.'):tr('टेस्ट पूरा हुआ। गलत और छोड़े गए प्रश्नों के समाधान नीचे देखें।','Test completed. Review explanations for wrong and skipped questions below.');res.append(note);const graphTitle=document.createElement('h3');graphTitle.textContent=tr('इस टेस्ट का सारांश','Test summary');res.append(graphTitle);const chart=document.createElement('div');chart.className='mini-bars';[['सही / Correct',correct,'#12805c'],['गलत / Wrong',wrong,'#c33f49'],['छोड़े / Skipped',skipped,'#8794a8']].forEach(([label,val,color])=>{const row=document.createElement('div');row.className='bar-row';const l=document.createElement('span');l.textContent=label;const track=document.createElement('div');track.className='track';const fill=document.createElement('div');fill.className='track-fill';fill.style.width=`${val/t.questions.length*100}%`;fill.style.background=color;track.append(fill);const n=document.createElement('b');n.textContent=val;row.append(l,track,n);chart.append(row)});res.append(chart);const reviewTitle=document.createElement('h3');reviewTitle.textContent=tr('प्रश्नवार उत्तर और समाधान','Question-wise answers & explanations');res.append(reviewTitle);t.questions.forEach((q,i)=>{const box=document.createElement('div');box.className='review';const title=document.createElement('strong');title.textContent=`${i+1}. ${tr(q.hi,q.en)}`;const choice=document.createElement('p');choice.className=answers[i]===q.answer?'correct':'wrong';choice.textContent=`${tr('आपका उत्तर','Your answer')}: ${answers[i]===null?tr('छोड़ा गया','Skipped'):tr(q.optionsHi,q.optionsEn)[answers[i]]}`;const correctLine=document.createElement('p');correctLine.className='correct';correctLine.textContent=`${tr('सही उत्तर','Correct answer')}: ${tr(q.optionsHi,q.optionsEn)[q.answer]}`;const why=document.createElement('p');why.textContent=`${tr('समाधान','Explanation')}: ${tr(q.whyHi,q.whyEn)||tr('विस्तृत समाधान अभी उपलब्ध नहीं है।','Detailed explanation not provided yet.')}`;box.append(title,choice,correctLine,why);if(q.source){const src=document.createElement('p');src.className='muted';src.textContent=`Source: ${q.source}`;box.append(src)}res.append(box)});const back=document.createElement('button');back.textContent=tr('सभी टेस्ट देखें','Back to Tests');back.onclick=()=>{show('catalog');render()};res.append(back);current=null;renderHistory();res.scrollIntoView({behavior:'smooth'});}
function renderHistory(){const div=$('history');div.replaceChildren();const rows=safeRead('es_history',[]);if(!rows.length){div.textContent=tr('अभी कोई परिणाम नहीं है।','No results yet.');return;}const recent=rows.slice(0,10);const chart=document.createElement('div');chart.className='history-chart';const title=document.createElement('h3');title.textContent=tr('पिछले टेस्टों का स्कोर ग्राफ','Score graph for recent tests');div.append(title);recent.slice().reverse().forEach((r,i)=>{const row=document.createElement('div');row.className='bar-row';const label=document.createElement('span');label.textContent=(r.title||'Test').slice(0,24);const track=document.createElement('div');track.className='track';const fill=document.createElement('div');fill.className='track-fill';fill.style.width=`${Math.max(0,Math.min(100,Number(r.pct??(r.score/r.total*100))))}%`;track.append(fill);const n=document.createElement('b');n.textContent=`${Math.round(Number(r.pct??(r.score/r.total*100)))}%`;row.append(label,track,n);chart.append(row)});div.append(chart);for(const r of rows){const p=document.createElement('p');p.textContent=`${r.title}: ${r.score}/${r.total} • ${r.pct??Math.round(r.score/r.total*100)}% • ${r.date}`;div.append(p)}}
$('language').onclick=()=>{lang=lang==='hi'?'en':'hi';try{localStorage.setItem('es_lang',lang)}catch{};updateLang();if(current)drawQuestion()};$('login').onclick=()=>{stop();current=null;show('auth')};$('closeAuth').onclick=()=>show('catalog');$('logout').onclick=async()=>{if(auth)await auth.signOut()};
function authErrorMessage(error){
 const code=error?.code||'';
 const messages={
  'auth/invalid-email':'ईमेल पता सही नहीं है।',
  'auth/missing-password':'पासवर्ड दर्ज करें।',
  'auth/weak-password':'पासवर्ड कम से कम 6 अक्षरों का रखें।',
  'auth/email-already-in-use':'इस ईमेल से अकाउंट पहले से बना है। लॉगिन करें।',
  'auth/invalid-credential':'ईमेल या पासवर्ड गलत है।',
  'auth/user-not-found':'इस ईमेल का अकाउंट नहीं मिला।',
  'auth/wrong-password':'पासवर्ड गलत है।',
  'auth/too-many-requests':'कई बार कोशिश हुई है। थोड़ी देर बाद प्रयास करें।',
  'auth/operation-not-allowed':'Firebase Console में यह Login तरीका Enable करें।',
  'auth/unauthorized-domain':'इस वेबसाइट का domain Firebase Authorized domains में जोड़ें।',
  'auth/invalid-phone-number':'मोबाइल नंबर country code सहित लिखें, जैसे +919876543210।',
  'auth/invalid-verification-code':'OTP गलत है। दोबारा जाँचें।',
  'auth/code-expired':'OTP की समय-सीमा समाप्त हो गई। नया OTP भेजें।',
  'auth/billing-not-enabled':'वास्तविक SMS OTP के लिए Firebase billing सेटअप आवश्यक हो सकता है।'
 };
 return messages[code]||('समस्या: '+(error?.message||code||'कृपया फिर कोशिश करें।'));
}
function setAuthMessage(message,isError=false){const el=$('authMessage');el.textContent=message;el.className=isError?'auth-error':'auth-success';}
function setAuthMode(mode){
 const email=mode==='email';
 $('emailAuthPanel').hidden=!email;
 $('phoneAuthPanel').hidden=email;
 $('emailMode').classList.toggle('active',email);
 $('phoneMode').classList.toggle('active',!email);
 $('emailMode').setAttribute('aria-pressed',String(email));
 $('phoneMode').setAttribute('aria-pressed',String(!email));
 setAuthMessage('');
}
async function initFirebase(){
 if(!firebaseConfig.apiKey||!firebaseConfig.authDomain||!firebaseConfig.projectId||!firebaseConfig.appId){setAuthMessage('Firebase Web Config अधूरी है। firebase-config.js जाँचें।',true);return}
 try{
  const [{initializeApp},{getAuth,RecaptchaVerifier,signInWithPhoneNumber,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail,signOut}]=await Promise.all([
   import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
   import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js')
  ]);
  const app=initializeApp(firebaseConfig);auth=getAuth(app);
  onAuthStateChanged(auth,user=>{
   loggedUser=user;
   $('login').hidden=!!user;$('logout').hidden=!user;
   $('userStatus').textContent=user?('✓ '+(user.email||user.phoneNumber||'Signed in')):'';
   if(user){setAuthMessage('लॉगिन सफल। आपका ExamSathi अकाउंट सक्रिय है।');show('catalog')}
  });
  $('emailMode').onclick=()=>setAuthMode('email');
  $('phoneMode').onclick=()=>setAuthMode('phone');
  $('emailSignIn').onclick=async()=>{
   const email=$('email').value.trim(),password=$('password').value;
   try{if(!email||!password)throw new Error('ईमेल और पासवर्ड दोनों दर्ज करें।');await signInWithEmailAndPassword(auth,email,password);setAuthMessage('लॉगिन सफल।')}
   catch(e){setAuthMessage(e.message?.startsWith('ईमेल')?e.message:authErrorMessage(e),true)}
  };
  $('emailSignUp').onclick=async()=>{
   const email=$('email').value.trim(),password=$('password').value;
   try{if(!email||!password)throw new Error('ईमेल और पासवर्ड दोनों दर्ज करें।');await createUserWithEmailAndPassword(auth,email,password);setAuthMessage('अकाउंट बन गया और लॉगिन सफल हुआ।')}
   catch(e){setAuthMessage(e.message?.startsWith('ईमेल')?e.message:authErrorMessage(e),true)}
  };
  $('resetPassword').onclick=async()=>{
   const email=$('email').value.trim();
   try{if(!email)throw new Error('पहले अपना ईमेल दर्ज करें।');await sendPasswordResetEmail(auth,email);setAuthMessage('Password reset link आपके ईमेल पर भेज दिया गया है।')}
   catch(e){setAuthMessage(e.message?.startsWith('पहले')?e.message:authErrorMessage(e),true)}
  };
  $('sendOtp').onclick=async()=>{
   try{
    const phone=$('phone').value.trim();
    if(!/^\+[1-9]\d{7,14}$/.test(phone))throw new Error('मोबाइल नंबर country code सहित लिखें, जैसे +919876543210।');
    if(window.esVerifier){try{window.esVerifier.clear()}catch{}}
    window.esVerifier=new RecaptchaVerifier(auth,'recaptcha-container',{size:'normal'});
    confirmation=await signInWithPhoneNumber(auth,phone,window.esVerifier);
    setAuthMessage('OTP भेज दिया गया है। SMS में आया 6 अंकों का OTP दर्ज करें।');
   }catch(e){setAuthMessage(e.message?.startsWith('मोबाइल')?e.message:authErrorMessage(e),true);if(window.esVerifier){try{window.esVerifier.clear()}catch{}window.esVerifier=null}}
  };
  $('verifyOtp').onclick=async()=>{
   try{if(!confirmation)throw new Error('पहले OTP भेजें।');const code=$('otp').value.trim();if(!/^\d{6}$/.test(code))throw new Error('6 अंकों का OTP दर्ज करें।');await confirmation.confirm(code);confirmation=null;setAuthMessage('मोबाइल OTP सत्यापित। लॉगिन सफल।')}
   catch(e){setAuthMessage(e.message==='पहले OTP भेजें。'||e.message==='पहले OTP भेजें。'?e.message:authErrorMessage(e),true)}
  };
  $('logout').onclick=async()=>{try{await signOut(auth);confirmation=null;if(window.esVerifier){try{window.esVerifier.clear()}catch{}window.esVerifier=null}setAuthMessage('आप लॉगआउट हो गए हैं।')}catch(e){setAuthMessage(authErrorMessage(e),true)}};
  setAuthMode('email');
 }catch(e){setAuthMessage('Firebase शुरू नहीं हो पाया: '+(e.message||'setup जाँचें'),true)}
}
function initExamCatalog(){const section=$('examSection'),state=$('stateSelect'),exam=$('examSelect');for(const name of Object.keys(stateExams)){state.add(new Option(name,name))}state.value='Uttar Pradesh';function fill(){cat='All';const group=section.value;$('stateLabel').hidden=group!=='state';const arr=group==='state'?(stateExams[state.value]||[]):group==='central'?centralExams:group==='banking'?bankingExams:entranceExams;exam.replaceChildren();for(const name of arr)exam.add(new Option(name,name));if(group==='state'&&state.value==='Uttar Pradesh')exam.value='UP TGT';if(group==='central')exam.value='SSC CGL';if(group==='banking')exam.value='IBPS PO';render()}section.onchange=()=>{ $('subjectSelect').value='All'; $('yearSelect').value='All'; fill();refreshSelectedQuestionBank() };state.onchange=()=>{ $('subjectSelect').value='All'; $('yearSelect').value='All'; fill();refreshSelectedQuestionBank() };exam.onchange=()=>{cat='All';$('subjectSelect').value='All';$('yearSelect').value='All';refreshSelectedQuestionBank();render()};$('subjectSelect').onchange=()=>{if($('yearSelect').value!=='All'&&!allQuestions().some(q=>q.subject===$('subjectSelect').value&&String(q.year)===$('yearSelect').value))$('yearSelect').value='All';render()};$('yearSelect').onchange=render;$('questionCount').onchange=()=>{selectedLength=Number($('questionCount').value)||100;render()};$('timeMinutes').onchange=render;fill();refreshSelectedQuestionBank()}
document.querySelectorAll('[data-exam]').forEach(button=>button.addEventListener('click',()=>{const section=$('examSection');section.value=button.dataset.section;section.dispatchEvent(new Event('change'));const target=button.dataset.exam;const option=[...$('examSelect').options].find(o=>o.value===target)||[...$('examSelect').options].find(o=>o.textContent.toLowerCase().includes(target.toLowerCase().split(' ')[0]));if(option){$('examSelect').value=option.value;$('examSelect').dispatchEvent(new Event('change'));} $('chooseExam').scrollIntoView({behavior:'smooth'});}));
$('testSearch').addEventListener('input',render);$('searchBtn').addEventListener('click',()=>{$('catalog').scrollIntoView({behavior:'smooth'});render()});
initExamCatalog();updateLang();initFirebase();if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
