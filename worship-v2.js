/* Worship V2: isolated enhancement; no changes to original app or database. */
(()=>{
const WKEY='yomi-v2-worship-2026-10';let w;
try{w=JSON.parse(localStorage.getItem(WKEY)||'{}')}catch{w={}}
w={days:{},custom:[],duas:[],surah:'مريم',surahPage:0,surahDone:{},surahTotal:0,goal:5,settings:{intention:'الصلاة على النبي ﷺ',intentionTarget:100,light:false},...w};
w.nextPage=Number.isInteger(w.nextPage)&&w.nextPage>=1&&w.nextPage<=604?w.nextPage:24;w.extraPrayers=Array.isArray(w.extraPrayers)?w.extraPrayers:[];w.prayerActs=Array.isArray(w.prayerActs)?w.prayerActs:[];let selectedPrayer='',selectedDhikr='',category='الخاصة',wview='صلواتي',openSection='ورد بعد الصلاة';
const date=()=>new Date().toLocaleDateString('en-CA'),today=()=>w.days[date()]||(w.days[date()]={prayers:{},nafl:{},counts:{},done:{},quran:0,prayerWird:{},acts:{}}),persist=()=>{try{localStorage.setItem(WKEY,JSON.stringify(w))}catch(e){alert('تعذر حفظ عباداتي، تحققي من مساحة التخزين.')}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const prayers=['الفجر','الظهر','العصر','المغرب','العشاء'];
const adhkar=[
{id:'mor1',cat:'الصباح',text:'أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.',target:1},
{id:'mor2',cat:'الصباح',text:'رضيت بالله ربًا، وبالإسلام دينًا، وبمحمد ﷺ نبيًا.',target:3},
{id:'mor3',cat:'الصباح',text:'سبحان الله وبحمده',target:100},
{id:'eve1',cat:'المساء',text:'أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.',target:1},
{id:'eve2',cat:'المساء',text:'رضيت بالله ربًا، وبالإسلام دينًا، وبمحمد ﷺ نبيًا.',target:3},
{id:'eve3',cat:'المساء',text:'سبحان الله وبحمده',target:100},
{id:'sleep1',cat:'النوم',text:'باسمك اللهم أموت وأحيا.',target:1},
{id:'sleep2',cat:'النوم',text:'سبحان الله',target:33},
{id:'sleep3',cat:'النوم',text:'الحمد لله',target:33},
{id:'sleep4',cat:'النوم',text:'الله أكبر',target:34},
{id:'gen1',cat:'العامة',text:'الصلاة على النبي ﷺ',target:100},
{id:'gen2',cat:'العامة',text:'أستغفر الله',target:100},
{id:'gen3',cat:'العامة',text:'لا إله إلا الله',target:100}
];
const all=()=>adhkar.filter(x=>x.cat!=='العامة').concat(w.custom.map(x=>({...x,cat:x.cat||'الخاصة'})));
const defaultIntentions=['الصلاة على النبي ﷺ','أستغفر الله وأتوب إليه','لا حول ولا قوة إلا بالله','سبحان الله وبحمده','لا إله إلا الله وحده لا شريك له','الحمد لله','سبحان الله العظيم','لا إله إلا أنت سبحانك إني كنت من الظالمين'];
w.intentionList=Array.isArray(w.intentionList)?w.intentionList:defaultIntentions.map((text,i)=>({id:'intent-'+i,text,target:100}));
w.intentionCycle=Array.isArray(w.intentionCycle)?w.intentionCycle:[];
w.intentionDays=w.intentionDays&&typeof w.intentionDays==='object'?w.intentionDays:{};
const intentionToday=()=>{
 const day=date(),list=w.intentionList.filter(x=>x&&x.id&&x.text);
 if(!list.length)return null;
 if(w.intentionDays[day]){const existing=list.find(x=>x.id===w.intentionDays[day]);if(existing)return existing}
 let remaining=list.filter(x=>!w.intentionCycle.includes(x.id));
 if(!remaining.length){w.intentionCycle=[];remaining=list}
 const selected=remaining[Math.floor(Math.random()*remaining.length)];
 w.intentionCycle.push(selected.id);w.intentionDays[day]=selected.id;persist();return selected;
};
const intentionModal=()=>{
 const a=intentionToday();if(!a)return;
 const n=today().counts.intention||0;
 showModal('✨ ذكر النية','<div class="wv-reading">'+esc(a.text)+'</div><p>أنجزتِ '+n+' من '+a.target+'</p><div class="wv-big"><button data-wtap="intention"><span id="wv-big-number">'+n+'</span><small>اضغطي للعد +1</small></button></div><div class="row">'+button('− تراجع','data-wtapminus="intention"')+button('✓ أتممت الذكر','data-wcomplete="intention"')+'</div><form id="w-intention-add"><label>عدد أنجزته بالفعل<input class="field" type="number" name="amount" min="1" step="1" required placeholder="مثلاً 50"></label><button class="btn">إضافة للإنجاز</button></form><p class="notice">العدد يضاف إلى إنجازك السابق، ولا يستبدله.</p>');
};
const idFor=(a)=>a.id, count=(a)=>today().counts[a.id]||0, done=(a)=>count(a)>=a.target||!!today().done[a.id];
const card=(s)=>'<section class="card">'+s+'</section>';
const button=(label,attr,cl='secondary')=>'<button class="btn '+cl+'" '+attr+'>'+label+'</button>';
const countRow=(id,num,label,step=1)=>'<div class="wv-count"><button data-wcount="'+esc(id)+'" data-step="-'+step+'" aria-label="إنقاص">−</button><strong>'+num+'</strong><button data-wcount="'+esc(id)+'" data-step="'+step+'" aria-label="زيادة">+</button><span class="muted">'+esc(label||'')+'</span></div>';
function prayerSheet(n){
selectedPrayer=n;openSection='ورد بعد الصلاة';showPrayer();
}
function showPrayer(){
const n=selectedPrayer,d=today(),checked=!!d.prayers[n];
let sections=['ورد القرآن','ورد بعد الصلاة','السنن والركعات','جودة الصلاة','أعمال الصلاة'];
let inner='<label class="wv-check"><input type="checkbox" data-wprayer="'+esc(n)+'" '+(checked?'checked':'')+'> أديت صلاة '+esc(n)+'</label>';
inner+='<p class="notice">اضغطي على القسم لفتحه، وارجعي لنفس مكانك عند الإغلاق.</p>';
for(const s of sections){
inner+='<details '+(openSection===s?'open':'')+' data-wdetails="'+esc(s)+'"><summary>'+s+'</summary>';
if(s==='ورد بعد الصلاة'){
inner+='<p class="notice">سجّلي الأذكار التي قرأتها بعد الصلاة. لا يُحسب أي ذكر تلقائيًا.</p>';
for(const a of all().filter(x=>x.cat==='الخاصة'&&x.kind!=='act').slice(0,5)){
const id='pw:'+n+':'+a.id;inner+='<div class="wv-line"><span>'+esc(a.text)+'</span>'+countRow(id,d.prayerWird[id]||0,'مرة')+'</div>';
}
if(n==='الفجر'||n==='المغرب')inner+='<div class="wv-line"><b>سورة الطارق — '+n+'</b>'+countRow('tariq:'+n,d.prayerWird['tariq:'+n]||0,'من 7')+'</div>';
}
if(s==='ورد القرآن')inner+='<div class="wv-page"><span>الصفحة التالية</span><strong>'+w.nextPage+'</strong></div><div class="row"><button class="btn" data-wread="1">✓ أتممت الصفحة</button><button class="btn secondary" data-wread="2">أتممت صفحتين</button></div><label>تصحيح الصفحة التالية<input class="field" id="w-next-page" type="number" min="1" max="604" value="'+w.nextPage+'"></label><p class="notice">الورد اليومي: '+d.quran+' / '+w.goal+' صفحات. جميع الصلوات تكمل من الصفحة نفسها.</p>'+(d.quran>=w.goal?'<p class="good">🌷 ما شاء الله، أنجزتِ وردك اليوم!</p>':'');
if(s==='السنن والركعات')inner+='<p class="notice">الركعات بخطوات ركعتين</p>'+countRow('sunnah:'+n,(d.sunnah||{})[n]||0,'ركعة',2);if(s==='جودة الصلاة')inner+='<label>الخشوع (اختياري)<select class="field" data-wquality="'+esc(n)+'"><option value="">بدون تقييم</option>'+['هادئ','متوسط','بحاجة لتركيز'].map(x=>'<option '+((d.quality||{})[n]===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label>';if(s==='أعمال الصلاة')inner+='<p class="muted">أعمال خاصة بهذه الصلاة</p>'+w.prayerActs.filter(x=>x.prayers.includes(n)).map(x=>'<label class="wv-check"><input type="checkbox" data-wact="'+esc(n+':'+x.id)+'" '+(d.acts[n+':'+x.id]?'checked':'')+'>'+esc(x.text)+'</label>').join('')+'<form id="w-prayer-act"><input class="field" name="text" required placeholder="عمل خاص بهذه الصلاة"><button class="btn">إضافة</button></form>';
inner+='</details>';
}
showModal('☾ صلاة '+n,inner);
}
function dhikrSheet(id){
selectedDhikr=id;const a=all().find(x=>x.id===id);if(!a)return;
const c=count(a);
showModal('الذكر','<div class="wv-reading"><p>'+esc(a.text)+'</p></div><p class="muted">العدد المستهدف: '+a.target+'</p><div class="wv-big"><button data-wtap="'+esc(id)+'" aria-label="زيادة العداد"><span id="wv-big-number">'+c+'</span><small>اضغطي هنا للعد</small></button></div><div class="row">'+button('− تراجع','data-wtapminus="'+esc(id)+'"')+button('✓ أتممت الذكر','data-wcomplete="'+esc(id)+'"')+'</div><form id="w-manual-count"><input type="hidden" name="id" value="'+esc(id)+'"><label>إضافة عدد من المسبحة<input class="field" type="number" name="amount" min="1" required placeholder="مثلاً 100"></label><button class="btn secondary">إضافة العدد</button></form><p class="notice">يبقى الذكر مفتوحًا أثناء العد، ولا يتحرك مكان القراءة.</p>');
}
function wlist(){
let a=all().filter(x=>x.cat===category);
const unfinished=a.filter(x=>!done(x)),finished=a.filter(done);
const row=a=>'<div class="wv-dhikr '+(done(a)?'wv-done':'')+'"><div class="row"><b>'+esc(a.text)+'</b><span class="pill">'+count(a)+' / '+a.target+'</span></div>'+button(done(a)?'✓ مكتمل — فتح':'فتح الذكر','data-wopen="'+esc(a.id)+'"')+(a.cat==='الخاصة'?button('تعديل','data-weditdhikr="'+esc(a.id)+'"')+button('حذف','data-wdeletedhikr="'+esc(a.id)+'"'):'')+'</div>';
let basics=all().filter(x=>x.cat==='الخاصة'&&x.kind!=='act');
const allDone=basics.length>0&&basics.every(done);
const intent=intentionToday();
return '<div class="tabline">'+['الخاصة','الصباح','المساء','النوم'].map(x=>'<button data-wcat="'+x+'" class="'+(category===x?'active':'')+'">'+x+'</button>').join('')+'</div>'+card('<h2>الأذكار المتبقية</h2>'+(unfinished.map(row).join('')||'<p class="good">أكملتِ أذكار هذا القسم 🌷</p>'))+card('<h2>الأذكار المكتملة ✓</h2>'+(finished.map(row).join('')||'<p class="muted">ستظهر هنا بعد إكمالها.</p>'))+(allDone&&intent?card('<h2>✨ ذكر النية اليوم</h2><p>'+esc(intent.text)+'</p><p>أنجزتِ '+(today().counts.intention||0)+' / '+intent.target+'</p>'+button('فتح ذكر النية','data-wintention="1"')+'<p class="notice">يتغير الذكر عند منتصف الليل، ولا يتكرر حتى تنتهي القائمة.</p>'):'')+card('<h2>قائمة ذكر النية</h2><p class="muted">الأذكار التي أختار منها تلقائيًا، دون تكرار خلال الدورة.</p>'+w.intentionList.map(x=>'<div class="wv-line"><span>'+esc(x.text)+' — '+x.target+' مرة</span> '+button('تعديل','data-wiedit="'+esc(x.id)+'"')+' '+button('حذف','data-widelete="'+esc(x.id)+'"')+'</div>').join('')+'<form id="w-add-intention"><input class="field" name="text" required placeholder="ذكر جديد لقائمة النية"><input class="field" type="number" name="target" min="1" value="100" required><button class="btn">إضافة للقائمة</button></form>')+card('<h2>إضافة ذكر خاص</h2><form id="w-add-dhikr"><input class="field" name="text" required placeholder="نص الذكر"><input class="field" name="target" type="number" min="1" value="33" aria-label="عدد التكرارات"><button class="btn">إضافة</button></form>');
}
function quran(){
const d=today();
return card('<h2>الورد القرآني الثابت</h2><p class="muted">صفحات قرأتها اليوم — لا تُحتسب تلقائيًا</p>'+countRow('quran',d.quran||0,'من '+w.goal+' صفحات')+'<label>الهدف اليومي<input class="field" type="number" id="w-goal" min="1" value="'+w.goal+'"></label>')+card('<h2>ورد السورة المختارة</h2><label>اسم السورة<input class="field" id="w-surah" value="'+esc(w.surah)+'"></label><p>صفحات قرأتها من السورة</p>'+countRow('surah',w.surahPage||0,'صفحة')+'<label>عدد صفحات السورة في طبعتك (اختياري)<input class="field" type="number" id="w-surah-total" min="0" value="'+(w.surahTotal||0)+'"></label>'+(w.surahTotal&&w.surahPage>=w.surahTotal?'<p class="good">تم الإنجاز ✓</p>':'<p class="notice">يُحفظ التقدم حتى نهاية السورة، ولا يعتمد على تخمين عدد صفحاتها.</p>')+button('إنهاء السورة وتسجيل الإنجاز','data-wsurahdone="1"'))+card('<h2>سورة الكهف</h2><p>'+(new Date().getDay()===5?'تذكير الجمعة: قراءة سورة الكهف':'تظهر كتذكير يوم الجمعة فقط')+'</p><p class="notice">عرض صفحات المصحف الحقيقي يحتاج مصدرًا موثوقًا ومرخصًا؛ لا نعرض نصًا غير متحقق منه.</p>');
}
function prayerView(){
let d=today();
return card('<h2>صلواتي اليوم</h2><p class="notice">اضغطي على الصلاة لتسجيلها وفتح تفاصيلها.</p>'+prayers.map(n=>'<div class="wv-prayer"><button class="btn secondary" data-wpsheet="'+n+'">'+(d.prayers[n]?'✓ ':'☾ ')+n+'</button><span class="muted">'+(d.prayers[n]?'تم التسجيل':'لم تسجّل بعد')+'</span></div>').join('')+'<h3>صلوات إضافية</h3>'+w.extraPrayers.map(x=>'<div class="wv-prayer"><button class="btn secondary" data-wpsheet="'+esc(x)+'">'+esc(x)+'</button><button class="btn secondary small" data-wremoveprayer="'+esc(x)+'">حذف</button></div>').join('')+'<form id="w-add-prayer"><input class="field" name="text" required placeholder="مثلاً: الوتر"><button class="btn">إضافة صلاة</button></form>')+card('<h2>النوافل</h2>'+['الضحى','قيام الليل'].map(n=>'<div class="wv-line"><b>'+n+'</b>'+countRow('nafl:'+n,d.nafl[n]||0,'ركعة — ركعتين ركعتين',2)+'</div>').join(''))+card('<h2>مواقيت الصلاة</h2><p class="notice">المواقيت والعد التنازلي يحتاجان إعداد الموقع ومصدر أوقات موثوقًا؛ لم نفعّلهما بعد حتى لا نعرض وقتًا غير دقيق.</p>');
}
function plan(){
return card('<h2>خطة عباداتي</h2><label class="wv-check"><input type="checkbox" id="w-light" '+(w.settings.light?'checked':'')+'> برنامج خفيف للأيام المزدحمة</label><p class="notice">البرنامج الخفيف يبسّط العرض فقط؛ لا يحذف الأعمال أو يغيّر سجل الإنجازات.</p>')+card('<h2>أعمالي الخاصة</h2>'+w.custom.filter(x=>x.kind==='act').map(x=>'<div class="wv-line">'+esc(x.text)+'</div>').join('')+'<form id="w-add-act"><input class="field" name="text" required placeholder="مثلاً: صدقة، قراءة حديث"><button class="btn">إضافة عمل</button></form>')+card('<h2>أدعيتي</h2>'+w.duas.map(x=>'<p class="wv-line">'+esc(x)+'</p>').join('')+'<form id="w-add-dua"><textarea class="field" name="text" required placeholder="دعاء خاص"></textarea><button class="btn">إضافة دعاء</button></form>');
}
function reports(){
let days=Object.entries(w.days).sort((a,b)=>b[0].localeCompare(a[0]));
const aggregate=(n)=>{let list=days.slice(0,n);return '<div class="stats"><div class="stat"><b>'+list.length+'</b>أيام مسجلة</div><div class="stat"><b>'+list.reduce((s,[,d])=>s+Object.values(d.prayers||{}).filter(Boolean).length,0)+'</b>صلوات مسجلة</div><div class="stat"><b>'+list.reduce((s,[,d])=>s+(d.quran||0),0)+'</b>صفحات قرآن</div></div>'};
const from=(period)=>{let now=new Date(),start=new Date(now.getFullYear(),now.getMonth(),now.getDate());if(period==='week')start.setDate(start.getDate()-(start.getDay()+1)%7);if(period==='month')start=new Date(now.getFullYear(),now.getMonth(),1);if(period==='year')start=new Date(now.getFullYear(),0,1);let totals={};for(let [key,day] of Object.entries(w.days)){if(key<start.toLocaleDateString('en-CA')||key>date())continue;for(let [id,n] of Object.entries(day.counts||{}))totals[id]=(totals[id]||0)+Number(n||0)}return totals};const periods=[['اليوم','day'],['الأسبوع','week'],['الشهر','month'],['السنة','year']];const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);const y=from('year');const breakdown=all().filter(a=>a.cat==='الخاصة'&&a.kind!=='act').map(a=>'<div class="wv-line">'+esc(a.text)+' — '+(y[a.id]||0)+' مرة</div>').join('');return card('<h2>إحصائيات الأذكار التراكمية</h2><div class="wv-periods">'+periods.map(([label,p])=>'<div class="stat"><b>'+sum(from(p))+'</b>'+label+'</div>').join('')+'</div><p class="notice">المجاميع للأعداد المسجلة فعليًا، وليس الأهداف. ذكر النية محسوب مرة واحدة.</p>')+card('<h2>تفاصيل الأذكار الخاصة — هذه السنة</h2>'+(breakdown||'<p class="muted">لا توجد أذكار بعد</p>')+'<div class="wv-line">ذكر النية — '+(y.intention||0)+' مرة</div>')+card('<h2>آخر 7 أيام مسجلة</h2>'+aggregate(7))+card('<h2>آخر 30 يومًا مسجلًا</h2>'+aggregate(30)+'<p class="notice">التقرير يعتمد على الأيام التي سُجّلت فيها بيانات، وليس جميع أيام التقويم. السجل محلي على هذا الجهاز فقط.</p>')+card('<h2>سجل الأيام</h2>'+days.slice(0,30).map(([day,d])=>'<div class="wv-line">'+day+' — '+Object.values(d.prayers||{}).filter(Boolean).length+'/5 صلوات — '+(d.quran||0)+' صفحات</div>').join(''));
}
const original=worship;
worship=function(){
let tabs=['صلواتي','أذكاري','القرآن','خطتي','تقاريري'];
return '<h2 class="section-title">عباداتي ☾</h2><p class="muted">مساحتي الهادئة للذكر والقراءة والمتابعة</p><div class="tabline">'+tabs.map(t=>'<button data-wview="'+t+'" class="'+(wview===t?'active':'')+'">'+t+'</button>').join('')+'</div>'+(wview==='صلواتي'?prayerView():wview==='أذكاري'?wlist():wview==='القرآن'?quran():wview==='خطتي'?plan():reports());
};
const refresh=()=>{let top=window.scrollY;render();window.scrollTo(0,top)};
document.addEventListener('click',e=>{
const b=e.target.closest('[data-wintention],[data-wiedit],[data-widelete],[data-wview],[data-wcat],[data-wpsheet],[data-wopen],[data-wcount],[data-wtap],[data-wtapminus],[data-wcomplete],[data-wsurahdone],[data-wread],[data-wremoveprayer],[data-weditdhikr],[data-wdeletedhikr],[data-wcancel]');
if(!b)return;
e.preventDefault();e.stopImmediatePropagation();
if(b.dataset.wintention){intentionModal();return}
if(b.dataset.wiedit){const a=w.intentionList.find(x=>x.id===b.dataset.wiedit);if(!a)return;showModal('تعديل ذكر النية','<form id="w-edit-intention"><input type="hidden" name="id" value="'+esc(a.id)+'"><label>الذكر<input class="field" name="text" required value="'+esc(a.text)+'"></label><label>العدد المطلوب<input class="field" type="number" name="target" min="1" required value="'+a.target+'"></label><button class="btn">حفظ التعديل</button></form>');return}
if(b.dataset.widelete){if(confirm('حذف الذكر من قائمة النية؟')){w.intentionList=w.intentionList.filter(x=>x.id!==b.dataset.widelete);persist();refresh()}return}
if(b.dataset.wdeletedhikr){const id=b.dataset.wdeletedhikr;if(confirm('حذف هذا الذكر الخاص؟')){w.custom=w.custom.filter(x=>x.id!==id);persist();refresh()}return}
if(b.dataset.weditdhikr){const a=w.custom.find(x=>x.id===b.dataset.weditdhikr);if(!a)return;showModal('تعديل الذكر','<form id="w-edit-dhikr"><input type="hidden" name="id" value="'+esc(a.id)+'"><label>نص الذكر<input class="field" name="text" required value="'+esc(a.text)+'"></label><label>العدد المستهدف<input class="field" name="target" type="number" min="1" required value="'+a.target+'"></label><div class="row"><button class="btn">حفظ</button><button class="btn secondary" type="button" data-wcancel="1">إلغاء</button></div></form>');return}
if(b.dataset.wcancel){closeModal();return}
if(b.dataset.wview){wview=b.dataset.wview;refresh();return}
if(b.dataset.wread){let q=Number(b.dataset.wread);if(w.nextPage+q>605){alert('وصلتِ لنهاية المصحف');return}today().quran=(today().quran||0)+q;w.nextPage=Math.min(604,w.nextPage+q);persist();showPrayer();return}
if(b.dataset.wremoveprayer){if(confirm('حذف الصلاة الإضافية؟')){w.extraPrayers=w.extraPrayers.filter(x=>x!==b.dataset.wremoveprayer);persist();refresh()}return}
if(b.dataset.wcat){category=b.dataset.wcat;refresh();return}
if(b.dataset.wpsheet){prayerSheet(b.dataset.wpsheet);return}
if(b.dataset.wopen){dhikrSheet(b.dataset.wopen);return}
if(b.dataset.wsurahdone){w.surahDone[w.surah]=true;w.surahPage=0;w.surahTotal=0;persist();refresh();return}
const id=b.dataset.wcount||b.dataset.wtap||b.dataset.wtapminus||b.dataset.wcomplete;
if(!id)return;
let d=today(),delta=b.dataset.wtap?1:b.dataset.wtapminus?-1:Number(b.dataset.step||0);
if(id==='quran')d.quran=Math.max(0,(d.quran||0)+delta);
else if(id==='surah')w.surahPage=Math.max(0,(w.surahPage||0)+delta);
else if(id.startsWith('sunnah:')){let n=id.slice(7);d.sunnah=d.sunnah||{};d.sunnah[n]=Math.max(0,(d.sunnah[n]||0)+delta)}
else if(id.startsWith('nafl:')){let n=id.slice(5);d.nafl[n]=Math.max(0,(d.nafl[n]||0)+delta)}
else if(id.startsWith('pw:')||id.startsWith('tariq:'))d.prayerWird[id]=Math.max(0,(d.prayerWird[id]||0)+delta);
else d.counts[id]=Math.max(0,(d.counts[id]||0)+delta);
if(b.dataset.wcomplete){const a=id==='intention'?intentionToday():all().find(x=>x.id===id);if(a)d.counts[id]=Math.max(d.counts[id]||0,a.target)}
persist();
if(b.dataset.wtap||b.dataset.wtapminus||b.dataset.wcomplete){if(id==='intention'){intentionModal();return}const num=document.getElementById('wv-big-number');if(num)num.textContent=d.counts[id]||0;return}
if(selectedPrayer&&!document.getElementById('modal').classList.contains('hidden')&&document.getElementById('modalTitle').textContent.includes('صلاة ')){showPrayer();return}
refresh();
},true);
document.addEventListener('change',e=>{
let t=e.target;
if(t.dataset.wprayer){today().prayers[t.dataset.wprayer]=t.checked;persist();return}
if(t.dataset.wquality){today().quality=today().quality||{};today().quality[t.dataset.wquality]=t.value;persist();return}
if(t.id==='w-next-page'){let n=Number(t.value);if(Number.isInteger(n)&&n>=1&&n<=604){w.nextPage=n;persist();if(!document.getElementById('modal').classList.contains('hidden'))showPrayer();else refresh()}else alert('الصفحة بين 1 و604');return}
if(t.dataset.wact){today().acts[t.dataset.wact]=t.checked;persist();return}
if(t.id==='w-light'){w.settings.light=t.checked;persist();return}
if(t.id==='w-goal')w.goal=Math.max(1,Number(t.value)||5);
else if(t.id==='w-surah'){w.surah=t.value.trim()||'مريم';w.surahPage=0}
else if(t.id==='w-surah-total')w.surahTotal=Math.max(0,Number(t.value)||0);
else if(t.id==='w-intention')w.settings.intention=t.value.trim()||'الصلاة على النبي ﷺ';
else if(t.id==='w-intention-target')w.settings.intentionTarget=Math.max(1,Number(t.value)||100);
else return;
persist();refresh();
},true);
document.addEventListener('submit',e=>{
let f=e.target.closest('#w-add-dhikr,#w-add-act,#w-add-dua,#w-add-prayer,#w-prayer-act,#w-edit-dhikr,#w-manual-count,#w-intention-add,#w-add-intention,#w-edit-intention');if(!f)return;
e.preventDefault();e.stopImmediatePropagation();
let data=new FormData(f);
if(f.id==='w-intention-add'){let n=Number(data.get('amount'));if(!Number.isSafeInteger(n)||n<1)return;today().counts.intention=(today().counts.intention||0)+n;persist();intentionModal();return}
if(f.id==='w-add-intention'){let v=String(data.get('text')||'').trim(),n=Number(data.get('target'));if(!v||!Number.isSafeInteger(n)||n<1)return;w.intentionList.push({id:'intent-'+Date.now(),text:v,target:n});persist();refresh();return}
if(f.id==='w-edit-intention'){let a=w.intentionList.find(x=>x.id===data.get('id')),v=String(data.get('text')||'').trim(),n=Number(data.get('target'));if(!a||!v||!Number.isSafeInteger(n)||n<1)return;a.text=v;a.target=n;persist();closeModal();refresh();return}
if(f.id==='w-manual-count'){let id=String(data.get('id')),n=Number(data.get('amount'));if(!Number.isSafeInteger(n)||n<1)return;today().counts[id]=(today().counts[id]||0)+n;persist();dhikrSheet(id);return}if(f.id==='w-edit-dhikr'){let a=w.custom.find(x=>x.id===data.get('id')),v=String(data.get('text')||'').trim(),n=Number(data.get('target'));if(!a||!v||!Number.isSafeInteger(n)||n<1)return;a.text=v;a.target=n;persist();closeModal();refresh();return}let v=String(data.get('text')||'').trim();if(!v)return;
if(f.id==='w-add-prayer'){if(!prayers.includes(v)&&!w.extraPrayers.includes(v))w.extraPrayers.push(v);persist();refresh();return}
if(f.id==='w-prayer-act'){w.prayerActs.push({id:'pa-'+Date.now(),text:v,prayers:[selectedPrayer]});persist();showPrayer();return}
if(f.id==='w-add-dua')w.duas.push(v);
else w.custom.push({id:'custom-'+Date.now(),text:v,cat:f.id==='w-add-dhikr'?'الخاصة':'الأعمال',kind:f.id==='w-add-act'?'act':'dhikr',target:Math.max(1,Number(data.get('target'))||1)});
persist();refresh();
},true);
const style=document.createElement('style');style.textContent='.wv-prayer,.wv-line,.wv-dhikr{padding:12px 0;border-bottom:1px solid #e9dfd5}.wv-prayer{display:flex;justify-content:space-between;align-items:center}.wv-line{line-height:1.9}.wv-dhikr{padding:14px;background:#faf4ed;border-radius:14px;margin:9px 0}.wv-dhikr .row{align-items:flex-start;margin-bottom:8px}.wv-dhikr b{font-size:14px;line-height:1.8}.wv-done{opacity:.75}.wv-check{display:flex;align-items:center;gap:10px;padding:12px;background:#f5ece3;border-radius:13px;margin:10px 0}.wv-check input{width:21px;height:21px}.wv-count{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin:10px 0}.wv-count button{width:45px;height:45px;border:0;border-radius:13px;background:#e9d9ca;color:#604839;font-size:25px}.wv-count strong{min-width:30px;text-align:center}.wv-reading{font-size:21px;line-height:2.2;text-align:center;padding:14px 6px}.wv-big{text-align:center;margin:18px 0}.wv-big button{height:150px;width:150px;border:0;border-radius:100%;background:#ead7c7;color:#674e40;display:inline-flex;flex-direction:column;justify-content:center;align-items:center;gap:8px}.wv-big span{font-size:45px;font-weight:bold}.wv-big small{font-size:13px}details{border:1px solid #e9ded2;border-radius:14px;padding:12px;margin:10px 0}summary{cursor:pointer;font-weight:bold;padding:5px}';
style.textContent+='.wv-periods{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.wv-page{display:flex;flex-direction:column;align-items:center;gap:6px;background:#f5ebe1;padding:18px;border-radius:16px;margin:12px 0}.wv-page strong{font-size:44px}';document.head.appendChild(style);
render();
})();