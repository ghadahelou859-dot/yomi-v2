import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm';
const client=createClient('https://jschdziflqsclsrusomh.supabase.co','sb_publishable_XZyVr1OVwyS_BAiuQMGF7w_VV4sRTg6');
const MAIN='yomi-v2-prototype-v1',WORSHIP='yomi-v2-worship-2026-10',TABLE='yomi_v2_state';
const ui=document.getElementById('yomiCloud'),status=document.getElementById('yomiCloudStatus');
let user=null,base=null,busy=false,dirty=false,interval=null;
const snapshot=()=>({main:JSON.parse(localStorage.getItem(MAIN)||'{}'),worship:JSON.parse(localStorage.getItem(WORSHIP)||'{}')});
const json=x=>JSON.stringify(x);
const isEmpty=data=>{const m=data?.main||{},w=data?.worship||{};return Object.entries(m).every(([k,v])=>['tasks','events','projects','transactions','notes','goals','learning','moods','dua','taskTrash'].includes(k)?!Array.isArray(v)||v.length===0:typeof v==='object'&&v!==null?Object.keys(v).length===0:true)&&Object.entries(w).every(([k,v])=>!v||(typeof v==='object'&&Object.keys(v).length===0))};
const report=t=>{if(status)status.textContent=t};
function apply(data){if(!data||typeof data!=='object')return;localStorage.setItem(MAIN,json(data.main||{}));localStorage.setItem(WORSHIP,json(data.worship||{}));location.reload()}
function showAccount(){const box=document.getElementById('yomiCloudAuth');if(!box)return;box.hidden=!!user;document.getElementById('yomiCloudLogout').hidden=!user;document.getElementById('yomiCloudEmail').textContent=user?.email||''}
async function remote(){const {data,error}=await client.from(TABLE).select('payload,updated_at').eq('user_id',user.id).maybeSingle();if(error)throw error;return data}
async function upload(payload){const {error}=await client.from(TABLE).upsert({user_id:user.id,payload,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(error)throw error;base=json(payload);dirty=false;report('✓ تمت المزامنة مع الحساب')}
async function sync(){if(!user||busy||!navigator.onLine)return;busy=true;try{const row=await remote(),local=snapshot(),ls=json(local),rs=row?json(row.payload):null;
 if(!row){await upload(local);return}
 if(base===null){const saved=localStorage.getItem('yomi-v2-sync-base-'+user.id);base=saved||null}
 if(base===null){if(ls===rs){base=rs;report('✓ البيانات متطابقة')}
 else if(isEmpty(local)&&!isEmpty(row.payload)){base=rs;localStorage.setItem('yomi-v2-sync-base-'+user.id,base);apply(row.payload);return}
 else if(isEmpty(row.payload)&&!isEmpty(local)){await upload(local)}
 else{report('⚠ بيانات مختلفة محفوظة على الجهاز والحساب. لم يتم استبدال أي نسخة. يلزم دمج آمن.');return}}

 else if(rs===base&&ls!==base){await upload(local)}
 else if(ls===base&&rs!==base){base=rs;localStorage.setItem('yomi-v2-sync-base-'+user.id,base);apply(row.payload);return}
 else if(ls!==rs&&ls!==base&&rs!==base){report('تعارض بين الجهاز والحساب — لم نكتب فوق أي بيانات');return}
 else{base=rs;report('✓ تمت المزامنة مع الحساب')}
 localStorage.setItem('yomi-v2-sync-base-'+user.id,base);
 }catch(e){report('تعذرت المزامنة: '+(e.message||'تحققي من الإنترنت'))}finally{busy=false}}
window.addEventListener('yomi-v2-local-change',()=>{dirty=true;report(user?'تغييرات بانتظار المزامنة':'محفوظ محليًا — سجّلي الدخول للمزامنة');if(user)setTimeout(sync,1200)});
window.addEventListener('online',sync);
document.getElementById('yomiCloudLogin').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,btn=f.querySelector('button');btn.disabled=true;report('جاري تسجيل الدخول...');try{const {error}=await client.auth.signInWithPassword({email:f.elements.email.value.trim(),password:f.elements.password.value});if(error)throw error;f.elements.password.value=''}catch(err){report('تعذر الدخول: '+err.message)}finally{btn.disabled=false}});
document.getElementById('yomiCloudLogout').addEventListener('click',async()=>{await client.auth.signOut();user=null;base=null;showAccount();report('تم تسجيل الخروج. البيانات المحلية باقية.')});
document.getElementById('yomiCloudSync').addEventListener('click',sync);
client.auth.onAuthStateChange((_event,session)=>{const id=session?.user?.id;if(id!==user?.id){user=session?.user||null;base=null;showAccount();if(user){report('متصل: '+user.email);setTimeout(sync,200)}else report('سجّلي الدخول للمزامنة بين الأجهزة')}});
client.auth.getSession().then(({data})=>{if(data.session){user=data.session.user;showAccount();sync()}else showAccount()}).catch(()=>report('تعذر قراءة الجلسة'));
interval=setInterval(sync,15000);
