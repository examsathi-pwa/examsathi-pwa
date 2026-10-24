const cache=new Map();
export function bankFileForExam(examName){
  const slug=String(examName||'').normalize('NFKD').toLowerCase()
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  return `./question-banks/${slug}.json`;
}
export async function loadQuestionBank(path){
  if(cache.has(path))return cache.get(path);
  const response=await fetch(path,{cache:'no-cache'});
  if(!response.ok)throw new Error(`Question bank not found: ${path}`);
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
  const result={...bank,questionCount:count};
  cache.set(path,result);
  return result;
}
