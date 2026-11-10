import {stateExams,centralExams,bankingExams} from './exam-catalog.js';
import {entranceExams} from './entrance-exam-catalog.js';

const $=id=>document.getElementById(id);
const section=$('examSection'),state=$('stateSelect'),exam=$('examSelect'),stateLabel=$('stateLabel');
if(section&&state&&exam&&stateLabel){
  for(const name of Object.keys(stateExams)) state.add(new Option(name,name));
  state.value=stateExams['Uttar Pradesh']?'Uttar Pradesh':Object.keys(stateExams)[0];
  const fillExams=()=>{
    const group=section.value;
    stateLabel.hidden=group!=='state';
    const list=group==='state'?(stateExams[state.value]||[]):group==='central'?centralExams:group==='banking'?bankingExams:entranceExams;
    const previous=exam.value;
    exam.replaceChildren(...list.map(name=>new Option(name,name)));
    if(list.includes(previous)) exam.value=previous;
    else if(group==='state'&&list.includes('UP TGT')) exam.value='UP TGT';
    else if(group==='central'&&list.includes('SSC CGL')) exam.value='SSC CGL';
    else if(group==='banking'&&list.includes('IBPS PO')) exam.value='IBPS PO';
    else if(list.length) exam.value=list[0];
  };
  section.addEventListener('change',fillExams);
  state.addEventListener('change',fillExams);
  fillExams();
}
const lengthBox=$('setLengthOptions'),count=$('questionCount');
if(lengthBox&&count){
  if(!lengthBox.children.length){
    for(const n of [10,50,100]){
      const b=document.createElement('button');
      b.type='button';b.className='length-choice'+(n===100?' active':'');
      b.textContent=n+' प्रश्न';b.setAttribute('aria-pressed',String(n===100));
      b.addEventListener('click',()=>{
        count.value=String(n);
        lengthBox.querySelectorAll('button').forEach(x=>{
          const active=x===b;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active));
        });
        count.dispatchEvent(new Event('change',{bubbles:true}));
      });
      lengthBox.append(b);
    }
  }
}
