import {initializeApp,applicationDefault} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {mkdirSync,writeFileSync} from 'node:fs';
initializeApp({credential:applicationDefault()});const db=getFirestore();mkdirSync('exports',{recursive:true});
const attempts=(await db.collection('attempts').get()).docs.map(d=>({id:d.id,...d.data()}));
const csv=(file,rows,keys)=>{const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';writeFileSync('exports/'+file,[keys.map(quote).join(','),...rows.map(r=>keys.map(k=>quote(r[k])).join(','))].join('\n'),'utf8');};
const answers=attempts.flatMap(a=>(a.answers||[]).map((x,i)=>({attemptId:a.id,mode:a.mode,nickname:a.nickname,questionId:x.questionId,selectedAnswerId:x.selectedAnswerId,correct:x.correct,responseMs:x.responseMs,position:i+1})));
csv('attempts.csv',attempts.map(a=>({...a,completedAt:a.completedAt?.toDate?.()?.toISOString?.(),answers:JSON.stringify(a.answers||[])})),['id','uid','mode','nickname','score','correct','total','completedAt','roomId']);
csv('answers.csv',answers,['attemptId','mode','nickname','questionId','selectedAnswerId','correct','responseMs','position']);
const stats=new Map(),wrong=new Map();for(const a of answers){const s=stats.get(a.questionId)||{questionId:a.questionId,total:0,correct:0,wrong:0};s.total++;s[a.correct?'correct':'wrong']++;stats.set(a.questionId,s);if(!a.correct){const k=a.questionId+'|'+a.selectedAnswerId;const w=wrong.get(k)||{questionId:a.questionId,selectedAnswerId:a.selectedAnswerId,count:0};w.count++;wrong.set(k,w);}}
csv('question_stats.csv',[...stats.values()].map(s=>({...s,accuracy:s.total?s.correct/s.total:0})),['questionId','total','correct','wrong','accuracy']);csv('wrong_options.csv',[...wrong.values()],['questionId','selectedAnswerId','count']);
console.log(`Exported ${attempts.length} attempts and ${answers.length} answers to exports/`);
