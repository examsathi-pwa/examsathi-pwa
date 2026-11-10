const cache=new Map();

export function bankFileForExam(examName){
  const slug=String(examName||'').normalize('NFKD').toLowerCase()
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  return `./question-banks/${slug}.json`;
}

function validateQuestionBank(bank){
  if(!bank||typeof bank!=='object'||!bank.examName||!Array.isArray(bank.tests)||!bank.tests.length){
    throw new Error('Invalid question bank: examName and non-empty tests[] are required');
  }
  let count=0;
  const questionIds=new Set();
  for(const [testIndex,test] of bank.tests.entries()){
    if(!Array.isArray(test.questions)||!test.questions.length){
      throw new Error(`Invalid question bank: test ${testIndex+1} has no questions`);
    }
    for(const [questionIndex,q] of test.questions.entries()){
      const at=`test ${testIndex+1}, question ${questionIndex+1}`;
      if(!q||(!String(q.hi||'').trim()&&!String(q.en||'').trim())){
        throw new Error(`Invalid question bank: question text missing in ${at}`);
      }
      for(const key of ['optionsHi','optionsEn']){
        if(q[key]!==undefined&&(!Array.isArray(q[key])||q[key].length!==4||q[key].some(option=>typeof option!=='string'||!option.trim()))){
          throw new Error(`Invalid question bank: ${key} must contain four non-empty options in ${at}`);
        }
      }
      const options=Array.isArray(q.optionsHi)?q.optionsHi:q.optionsEn;
      if(!Array.isArray(options)||options.length!==4){
        throw new Error(`Invalid question bank: four answer options are required in ${at}`);
      }
      if(!Number.isInteger(q.answer)||q.answer<0||q.answer>=options.length){
        throw new Error(`Invalid question bank: answer index is invalid in ${at}`);
      }
      if(!String(q.whyHi||'').trim()&&!String(q.whyEn||'').trim()){
        throw new Error(`Invalid question bank: explanation missing in ${at}`);
      }
      if(!q.subject||!q.topic||!q.provenance?.kind||!q.provenance?.questionId){
        throw new Error(`Invalid question bank: subject, topic and provenance are required in ${at}`);
      }
      const id=q.provenance.questionId;
      if(questionIds.has(id))throw new Error(`Invalid question bank: duplicate question ID "${id}"`);
      questionIds.add(id);
      count++;
    }
  }
  return {...bank,questionCount:count};
}

export async function loadQuestionBank(path){
  if(cache.has(path))return cache.get(path);
  const response=await fetch(path,{cache:'no-cache'});
  if(!response.ok)throw new Error(`Question bank not found: ${path}`);
  const bank=await response.json();
  const result=validateQuestionBank(bank);
  cache.set(path,result);
  return result;
}
