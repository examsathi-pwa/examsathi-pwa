const cache=new Map();
const centralStarterExams=new Set(['UPSC Civil Services','UPSC CAPF','SSC GD','SSC CPO','RRB ALP','RRB JE','CTET','UGC NET','NDA','CDS','AFCAT','Indian Army Agniveer','Indian Navy','Indian Coast Guard','SSC JE','SSC Stenographer','SSC Selection Post','UPSC Engineering Services','UPSC Combined Medical Services','UPSC Indian Forest Service','RRB Technician','RRB Paramedical','KVS Recruitment','NVS Recruitment','CSIR UGC NET','EPFO Recruitment','ESIC Recruitment']);
export function bankFileForExam(examName){
  if(centralStarterExams.has(examName))return './question-banks/central-exam-starters.json';
  const slug=String(examName||'').normalize('NFKD').toLowerCase()
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  return `./question-banks/${slug}.json`;
}
async function fetchBank(path){
  const localUrl=`${path}${path.includes('?')?'&':'?'}v=20261110`;
  let localError;
  try{
    const response=await fetch(localUrl,{cache:'no-store'});
    if(!response.ok)throw new Error(`Local question bank returned HTTP ${response.status}`);
    return {response,source:'same-origin'};
  }catch(error){localError=error}
  const relative=path.replace(/^\.\//,'');
  if(!relative.startsWith('question-banks/')||relative.includes('..'))throw localError;
  const fallbackUrl=`https://raw.githubusercontent.com/examsathi-pwa/examsathi-pwa/main/${relative}?v=20261110`;
  const fallback=await fetch(fallbackUrl,{cache:'no-store'});
  if(!fallback.ok)throw new Error(`Question bank unavailable locally and on GitHub (HTTP ${fallback.status})`);
  return {response:fallback,source:'github-raw'};
}
export async function loadQuestionBank(path){
  if(cache.has(path))return cache.get(path);
  const {response,source}=await fetchBank(path);
  const bank=await response.json();
  if(!bank||!Array.isArray(bank.tests))throw new Error('Invalid question bank format');
  let count=0;
  for(const test of bank.tests){
    if(!Array.isArray(test.questions)||!test.questions.length)throw new Error('Empty test in question bank');
    for(const q of test.questions){
      if(!q.hi&&!q.en)throw new Error('Question text missing');
      if(!Array.isArray(q.optionsHi)&&!Array.isArray(q.optionsEn))throw new Error('Question options missing');
      const options=Array.isArray(q.optionsHi)?q.optionsHi:q.optionsEn;
      if(!Number.isInteger(q.answer)||q.answer<0||q.answer>=options.length)throw new Error('Invalid answer index');
      if(!q.provenance||!q.provenance.kind)throw new Error('Question provenance missing');
      count++;
    }
  }
  const result={...bank,questionCount:count,loadedFrom:source};
  cache.set(path,result);
  return result;
}
