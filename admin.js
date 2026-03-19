// =============== TEG文化衫管理后台 JS ===============
const SK = { proj:'teg_projects', subs:'teg_submissions', emp:'teg_employees', logs:'teg_admin_logs', active:'teg_h5_active_project' };
const g = id => document.getElementById(id);
const ls = (k,v) => v !== undefined ? localStorage.setItem(k,JSON.stringify(v)) : JSON.parse(localStorage.getItem(k)||'[]');
const lsg = k => { try{return JSON.parse(localStorage.getItem(k))}catch(e){return null} };

// ========== 初始化演示数据 ==========
function initDemo(){
  if(!localStorage.getItem(SK.emp)){
    const depts=['TEG-基础架构部','TEG-AI平台部','TEG-数据平台部','TEG-云架构平台部','TEG-安全平台部','TEG-运营技术部'];
    const names=['张三','李四','王五','赵六','陈七','刘八','周九','吴十','郑十一','孙十二','钱十三','冯十四','褚十五','卫十六','蒋十七','沈十八','韩十九','杨二十','朱二一','秦二二','尤二三','许二四','何二五','吕二六','施二七','张二八','孔二九','曹三十'];
    const emps=names.map((n,i)=>({name:n,empId:`T2024${String(i+1).padStart(4,'0')}`,dept:depts[i%depts.length],workplace:['深圳-腾讯滨海大厦','北京-总部大厦','上海-腾讯大厦','深圳-腾讯大厦'][i%4],status:'active'}));
    ls(SK.emp,emps);
  }
  if(!localStorage.getItem(SK.subs)||ls(SK.subs).length===0){
    const emps=ls(SK.emp);
    const stys=[{id:'male-white',n:'男款-白色'},{id:'male-blue',n:'男款-浅蓝色'},{id:'female-white',n:'女款-白色'},{id:'female-pink',n:'女款-樱花粉'}];
    const szs=['S','M','L','XL','XXL'];
    const ads=[{id:'sz-1',n:'深圳-腾讯大厦'},{id:'sz-2',n:'深圳-腾讯滨海大厦'},{id:'bj-1',n:'北京-总部大厦'},{id:'sh-1',n:'上海-腾讯大厦'}];
    const subs=[];
    for(let i=0;i<Math.floor(emps.length*0.6);i++){
      const e=emps[i],si=~~(Math.random()*4),szi=~~(Math.random()*5),ai=~~(Math.random()*4);
      const d=new Date();d.setDate(d.getDate()-~~(Math.random()*7));
      subs.push({style:stys[si].id,styleName:stys[si].n,size:szs[szi],address:ads[ai].id,addressName:ads[ai].n,remark:'',empId:e.empId,name:e.name,dept:e.dept,submitTime:d.toISOString(),source:Math.random()>.3?'h5':'补登'});
    }
    ls(SK.subs,subs);
  }
  if(!localStorage.getItem(SK.proj)){
    ls(SK.proj,[{id:'default',title:'2026TEG夏季文化衫',desc:'TEG夏季文化衫选款选码',start:'2026-03-20T09:00',deadline:'2026-05-30T18:00',season:'2026-summer',status:'active',createdAt:new Date().toISOString()}]);
  }
  if(!localStorage.getItem(SK.logs)) ls(SK.logs,[{time:new Date().toISOString(),user:'管理员',type:'system',content:'系统初始化',result:'成功'}]);
}

// ========== 工具函数 ==========
function fmtTime(t){if(!t)return'-';const d=new Date(t);return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`}
function fmtDate(t){if(!t)return'-';const d=new Date(t);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function countBy(arr,key){const m={};arr.forEach(i=>{const v=i[key]||'未知';m[v]=(m[v]||0)+1});return m}
function addLog(type,content){const logs=ls(SK.logs);logs.push({time:new Date().toISOString(),user:'管理员',type,content,result:'成功'});ls(SK.logs,logs)}
function showMsg(text,type='info'){const el=g('gmsg');el.className=`msg show msg-${type[0]}`;el.textContent=text;setTimeout(()=>el.classList.remove('show'),2500)}
function closeM(id){g(id).classList.remove('show')}

// ========== 页面导航 ==========
const titles={dash:'数据看板',proj:'项目列表',create:'新建项目',subs:'选款数据',miss:'缺漏排查',order:'下单明细',ship:'装箱邮寄',emp:'员工管理',h5cfg:'H5配置',logs:'操作日志'};
let curPage='dash';
function go(p){
  curPage=p;
  g('bc').textContent=titles[p]||p;
  document.querySelectorAll('.menu-item').forEach(m=>m.classList.toggle('active',m.dataset.p===p));
  render();
}
function refreshAll(){render();showMsg('数据已刷新','s')}

// ========== 主渲染 ==========
function render(){
  const c=g('content');
  const fn={dash:rDash,proj:rProj,create:rCreate,subs:rSubs,miss:rMiss,order:rOrder,ship:rShip,emp:rEmp,h5cfg:rH5Cfg,logs:rLogs};
  if(fn[curPage]) fn[curPage](c);
}

// ========== 数据看板 ==========
function rDash(c){
  const subs=ls(SK.subs),emps=ls(SK.emp),projs=ls(SK.proj);
  const tot=subs.length,totE=emps.length,pend=Math.max(0,totE-tot);
  const today=subs.filter(s=>new Date(s.submitTime).toDateString()===new Date().toDateString()).length;
  const pct=totE>0?Math.round(tot/totE*100):0;
  
  // 图表数据
  const styleDist=countBy(subs,'styleName'),sizeDist=countBy(subs,'size'),addrDist=countBy(subs,'addressName');
  const recent=subs.slice().sort((a,b)=>new Date(b.submitTime)-new Date(a.submitTime)).slice(0,8);

  c.innerHTML=`
  <div class="h5-link"><div class="h5-link-tt">📱 H5前端链接（员工访问）</div>
  <div class="h5-link-url"><span>https://121222222.github.io/T-shirt/h5.html</span><button class="h5-link-copy" onclick="navigator.clipboard.writeText('https://121222222.github.io/T-shirt/h5.html');showMsg('链接已复制','s')">复制链接</button></div></div>
  <div class="stat-cards">
    <div class="stat-card"><div class="stat-card-icon" style="background:#e6f7ff">📊</div><div class="stat-card-title">总提交人数</div><div class="stat-card-value">${tot}</div><div class="stat-card-sub">占总员工 ${pct}%</div></div>
    <div class="stat-card"><div class="stat-card-icon" style="background:#fff7e6">⏳</div><div class="stat-card-title">未提交人数</div><div class="stat-card-value">${pend}</div><div class="stat-card-sub down">待提醒</div></div>
    <div class="stat-card"><div class="stat-card-icon" style="background:#f6ffed">👕</div><div class="stat-card-title">今日新增</div><div class="stat-card-value">${today}</div><div class="stat-card-sub">今天</div></div>
    <div class="stat-card"><div class="stat-card-icon" style="background:#f9f0ff">📦</div><div class="stat-card-title">活跃项目</div><div class="stat-card-value">${projs.filter(p=>p.status==='active').length}</div><div class="stat-card-sub">进行中</div></div>
  </div>
  <div class="card" style="margin-bottom:20px"><div class="card-hd"><div class="card-tt">提交进度</div><span style="font-size:13px;color:#999">${tot} / ${totE}</span></div>
  <div class="card-bd"><div class="progress-h"><div class="progress-f" style="width:${pct}%;background:linear-gradient(90deg,#1890ff,#36cfc9)"></div></div></div></div>
  <div class="chart-row">
    <div class="chart-box"><div class="chart-box-title">📊 款式分布</div><div class="bar-chart" id="c-sty"></div></div>
    <div class="chart-box"><div class="chart-box-title">📏 尺码分布</div><div class="bar-chart" id="c-sz"></div></div>
  </div>
  <div class="chart-row">
    <div class="chart-box"><div class="chart-box-title">📍 职场分布</div><div class="pie-chart" id="c-addr"></div></div>
    <div class="chart-box"><div class="chart-box-title">🏢 部门提交率</div><div id="c-dept" style="max-height:250px;overflow-y:auto"></div></div>
  </div>
  <div class="card"><div class="card-hd"><div class="card-tt">最近提交</div><button class="hbtn" onclick="go('subs')">查看全部 →</button></div>
  <div class="card-bd-np"><table class="dtable"><thead><tr><th>员工</th><th>部门</th><th>款式</th><th>尺码</th><th>地址</th><th>时间</th><th>来源</th></tr></thead>
  <tbody>${recent.map(s=>`<tr><td>${s.name}</td><td>${s.dept}</td><td>${s.styleName}</td><td>${s.size}</td><td>${s.addressName}</td><td>${fmtTime(s.submitTime)}</td><td><span class="tag ${s.source==='h5'?'tag-b':'tag-o'}">${s.source}</span></td></tr>`).join('')||'<tr><td colspan="7" style="text-align:center;color:#999;padding:30px">暂无数据</td></tr>'}</tbody></table></div></div>`;

  // 渲染图表
  setTimeout(()=>{
    rBar('c-sty',styleDist,['#1890ff','#36cfc9','#ff85c0','#ffc53d','#b37feb']);
    rBar('c-sz',sizeDist,['#1890ff','#36cfc9','#52c41a','#fa8c16','#ff4d4f','#722ed1']);
    rPie('c-addr',addrDist);
    rDeptProg(emps,subs);
  },50);
}

function rBar(id,data,colors){
  const el=g(id);if(!el)return;
  const entries=Object.entries(data);
  if(!entries.length){el.innerHTML='<div style="text-align:center;color:#999;padding-top:80px">暂无数据</div>';return}
  const max=Math.max(...entries.map(e=>e[1]));
  el.innerHTML=entries.map(([l,v],i)=>`<div class="bar-item"><div class="bar-value">${v}</div><div class="bar-fill" style="height:${max>0?Math.max(v/max*160,8):8}px;background:${colors[i%colors.length]}"></div><div class="bar-label">${l.length>6?l.slice(0,6)+'…':l}</div></div>`).join('');
}

function rPie(id,data){
  const el=g(id);if(!el)return;
  const entries=Object.entries(data),total=entries.reduce((s,e)=>s+e[1],0);
  if(!total){el.innerHTML='<div style="text-align:center;color:#999">暂无数据</div>';return}
  const colors=['#1890ff','#36cfc9','#ff85c0','#ffc53d','#b37feb','#52c41a','#fa8c16','#ff4d4f'];
  let parts=[],cum=0;
  entries.forEach(([,v],i)=>{const p=v/total*100;parts.push(`${colors[i%colors.length]} ${cum}% ${cum+p}%`);cum+=p});
  el.innerHTML=`<div class="pie-visual" style="background:conic-gradient(${parts.join(',')})"></div>
  <div class="pie-legend">${entries.map(([l,v],i)=>`<div class="pie-legend-item"><div class="pie-legend-dot" style="background:${colors[i%colors.length]}"></div><span>${l}: ${v} (${Math.round(v/total*100)}%)</span></div>`).join('')}</div>`;
}

function rDeptProg(emps,subs){
  const el=g('c-dept');if(!el)return;
  const depts={};
  emps.forEach(e=>{depts[e.dept]=depts[e.dept]||{total:0,done:0};depts[e.dept].total++});
  subs.forEach(s=>{if(depts[s.dept])depts[s.dept].done++});
  el.innerHTML=Object.entries(depts).sort((a,b)=>(b[1].done/b[1].total)-(a[1].done/a[1].total)).map(([d,info])=>{
    const pct=info.total>0?Math.round(info.done/info.total*100):0;
    const clr=pct>=80?'#52c41a':pct>=50?'#fa8c16':'#ff4d4f';
    return `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;font-size:13px"><span style="width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#666" title="${d}">${d}</span><div style="flex:1;height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${clr};border-radius:4px"></div></div><span style="width:70px;text-align:right;font-weight:600;color:${clr}">${info.done}/${info.total}</span></div>`;
  }).join('');
}

// ========== 项目列表 ==========
function rProj(c){
  const projs=ls(SK.proj),subs=ls(SK.subs);
  c.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px"><h2 style="font-size:20px;font-weight:700">文化衫项目管理</h2><button class="hbtn hbtn-p" onclick="go('create')">➕ 新建项目</button></div>
  <div class="proj-grid">${projs.map(p=>{
    const isA=p.status==='active';
    return `<div class="proj-card ${isA?'act':''}"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px"><div style="font-size:16px;font-weight:700;color:#1a1a2e">${p.title}</div><span class="tag ${isA?'tag-g':'tag-r'}">${isA?'进行中':'已结束'}</span></div>
    <div style="font-size:13px;color:#888;line-height:1.8">📅 ${fmtDate(p.start)} ~ ${fmtDate(p.deadline)}<br>📋 已提交 ${subs.length} 人<br>📝 ${p.desc||''}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:15px;padding-top:15px;border-top:1px solid #f0f0f0"><span style="font-size:12px;color:#999">创建于 ${fmtDate(p.createdAt)}</span>
    <div style="display:flex;gap:6px"><button class="hbtn" style="font-size:12px" onclick="go('dash')">查看数据</button>${isA?`<button class="hbtn hbtn-p" style="font-size:12px" onclick="setActive('${p.id}')">设为当前</button>`:''}</div></div></div>`;
  }).join('')}${projs.length===0?'<div class="empty"><div class="empty-icon">📁</div><div class="empty-text">暂无项目</div><button class="hbtn hbtn-p" onclick="go(\'create\')">➕ 新建项目</button></div>':''}</div>`;
}
function setActive(pid){const projs=ls(SK.proj),p=projs.find(x=>x.id===pid);if(p){localStorage.setItem(SK.active,JSON.stringify(p));addLog('project','设置活跃项目：'+p.title);showMsg('已设为当前活跃项目','s')}}

// ========== 新建项目 ==========
let cStep=1,tStyles=[{id:'male-white',name:'男款-白色',gender:'male',color:'白色',emoji:'👕',img:''},{id:'male-blue',name:'男款-浅蓝色',gender:'male',color:'浅蓝色',emoji:'👔',img:''},{id:'female-white',name:'女款-白色',gender:'female',color:'白色',emoji:'👚',img:''},{id:'female-pink',name:'女款-樱花粉',gender:'female',color:'樱花粉',emoji:'🌸',img:''}];

function rCreate(c){
  cStep=1;
  c.innerHTML=`<h2 style="font-size:20px;font-weight:700;margin-bottom:24px">新建文化衫项目</h2>
  <div class="steps" id="csteps"><div class="step-i active" data-s="1"><div class="step-n">1</div><span class="step-t">基本信息</span></div><div class="step-l"></div><div class="step-i" data-s="2"><div class="step-n">2</div><span class="step-t">款式配置</span></div><div class="step-l"></div><div class="step-i" data-s="3"><div class="step-n">3</div><span class="step-t">尺码与地址</span></div></div>
  <div class="card" id="cs1"><div class="card-bd">
    <div class="frow"><label class="flbl">项目名称 <span class="req">*</span></label><input class="fctl" id="pt" placeholder="如：2026TEG夏季文化衫" value="2026TEG夏季文化衫"></div>
    <div class="frow"><label class="flbl">项目描述</label><input class="fctl" id="pd" placeholder="项目描述" value="TEG夏季文化衫选款选码"></div>
    <div class="frow" style="display:grid;grid-template-columns:1fr 1fr;gap:16px"><div><label class="flbl">开始时间 <span class="req">*</span></label><input class="fctl" type="datetime-local" id="ps" value="2026-03-20T09:00"></div><div><label class="flbl">截止时间 <span class="req">*</span></label><input class="fctl" type="datetime-local" id="pdl" value="2026-05-30T18:00"></div></div>
    <div class="frow"><label class="flbl">年份/季节</label><select class="fctl" id="psn"><option value="2026-summer" selected>2026年 夏季</option><option value="2026-winter">2026年 冬季</option><option value="2025-summer">2025年 夏季</option></select></div>
    <div style="text-align:right;margin-top:20px"><button class="fbtn" onclick="csNext(2)">下一步 →</button></div></div></div>
  <div class="card" id="cs2" style="display:none"><div class="card-bd">
    <div class="flbl" style="margin-bottom:12px">款式列表 <span class="req">*</span></div>
    <div class="scfg-list" id="scfg"></div>
    <div class="add-btn" onclick="addSty()" style="margin-top:12px">+ 添加款式</div>
    <div style="display:flex;justify-content:space-between;margin-top:24px"><button class="fbtn fbtn-o" onclick="csNext(1)">← 上一步</button><button class="fbtn" onclick="csNext(3)">下一步 →</button></div></div></div>
  <div class="card" id="cs3" style="display:none"><div class="card-bd">
    <div class="tabs"><div class="tab-i active" onclick="cTab(this,'ct-sz')">尺码配置</div><div class="tab-i" onclick="cTab(this,'ct-ad')">地址配置</div></div>
    <div class="tab-c active" id="ct-sz"><div class="flbl">男款尺码</div><div style="font-size:12px;color:#999;margin-bottom:8px">格式：尺码,衣长,胸围,腰围,肩宽,袖长</div>
    <textarea class="fctl" id="szm" rows="6" style="font-family:monospace;font-size:13px">S,60,104,-,45.5,55
M,62,108,-,47,56
L,64,112,-,48.5,57
XL,66,116,-,50,58
XXL,68,120,-,51.5,59
XXXL,70,124,-,53,60</textarea>
    <div class="flbl" style="margin-top:16px">女款尺码</div>
    <textarea class="fctl" id="szf" rows="6" style="font-family:monospace;font-size:13px">XS,56,96,-,43,53
S,58,100,-,44.5,54
M,60,104,-,46,55
L,62,108,-,47.5,56
XL,64,112,-,49,57
XXL,66,116,-,50.5,58</textarea></div>
    <div class="tab-c" id="ct-ad"><div class="flbl">职场地址列表</div><div style="font-size:12px;color:#999;margin-bottom:8px">格式：ID,名称,区域</div>
    <textarea class="fctl" id="adcfg" rows="10" style="font-family:monospace;font-size:13px">sz-1,深圳-腾讯大厦,深圳
sz-2,深圳-腾讯滨海大厦,深圳
sz-3,深圳-金地威新,深圳
bj-1,北京-总部大厦,北京
bj-2,北京-融科资讯中心,北京
sh-1,上海-腾讯大厦,上海
gz-1,广州-TIT创意园,广州
cd-1,成都-腾讯大厦,成都
wh-1,武汉-光谷研发中心,武汉</textarea></div>
    <div style="display:flex;justify-content:space-between;margin-top:24px"><button class="fbtn fbtn-o" onclick="csNext(2)">← 上一步</button><button class="fbtn" onclick="savePj()">✅ 发布项目</button></div></div></div>`;
  rStyCfg();
}

function csNext(s){
  if(s===2&&cStep===1&&!g('pt').value.trim()){showMsg('请输入项目名称','e');return}
  cStep=s;
  document.querySelectorAll('#csteps .step-i').forEach((el,i)=>{el.classList.remove('active','done');if(i+1===cStep)el.classList.add('active');if(i+1<cStep)el.classList.add('done')});
  for(let i=1;i<=3;i++)g('cs'+i).style.display=i===cStep?'block':'none';
}
function cTab(el,id){el.parentElement.querySelectorAll('.tab-i').forEach(t=>t.classList.remove('active'));el.classList.add('active');el.parentElement.parentElement.querySelectorAll('.tab-c').forEach(t=>t.classList.remove('active'));g(id).classList.add('active')}
function rStyCfg(){
  const el=g('scfg');if(!el)return;
  el.innerHTML=tStyles.map((s,i)=>`<div class="scfg-item"><div class="scfg-img" onclick="upImg(${i})">${s.img?`<img src="${s.img}">`:s.emoji}</div><div class="scfg-fields"><input placeholder="名称" value="${s.name}" onchange="tStyles[${i}].name=this.value"><select onchange="tStyles[${i}].gender=this.value"><option value="male" ${s.gender==='male'?'selected':''}>男款</option><option value="female" ${s.gender==='female'?'selected':''}>女款</option></select><input placeholder="颜色" value="${s.color}" onchange="tStyles[${i}].color=this.value"></div><button class="scfg-rm" onclick="tStyles.splice(${i},1);rStyCfg()">✕</button></div>`).join('');
}
function addSty(){tStyles.push({id:'s-'+Date.now(),name:'',gender:'male',color:'',emoji:'👕',img:''});rStyCfg()}
function upImg(i){const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{tStyles[i].img=ev.target.result;rStyCfg()};r.readAsDataURL(f)};inp.click()}

function savePj(){
  const title=g('pt').value.trim();if(!title){showMsg('请输入项目名称','e');return}
  if(!tStyles.length){showMsg('请至少添加一个款式','e');return}
  const parseSz=id=>{const t=g(id).value.trim();if(!t)return[];return t.split('\n').map(l=>{const p=l.split(',').map(s=>s.trim());return{code:p[0],height:p[1]||'-',chest:p[2]||'-',waist:p[3]||'-',shoulder:p[4]||'-',sleeve:p[5]||'-'}})};
  const parseAd=()=>{const t=g('adcfg').value.trim();if(!t)return[];return t.split('\n').map(l=>{const p=l.split(',').map(s=>s.trim());return{id:p[0],name:p[1],region:p[2]}})};
  const proj={id:'proj-'+Date.now(),title,desc:g('pd').value,start:g('ps').value,deadline:g('pdl').value,season:g('psn').value,styles:tStyles.map(s=>({...s})),sizes:{male:parseSz('szm'),female:parseSz('szf')},addresses:parseAd(),status:'active',createdAt:new Date().toISOString()};
  const projs=ls(SK.proj);projs.push(proj);ls(SK.proj,projs);
  localStorage.setItem(SK.active,JSON.stringify(proj));
  addLog('project','新建项目：'+title);showMsg('项目创建成功！已同步至H5','s');go('proj');
}

// ========== 选款数据 ==========
let subPage=1;const PS=15;
function rSubs(c){
  const subs=ls(SK.subs).sort((a,b)=>new Date(b.submitTime)-new Date(a.submitTime));
  const depts=[...new Set(subs.map(s=>s.dept))].sort();
  const styles=[...new Set(subs.map(s=>s.styleName))];
  const sizes=[...new Set(subs.map(s=>s.size))];
  c.innerHTML=`<h2 style="font-size:20px;font-weight:700;margin-bottom:20px">选款数据管理</h2>
  <div class="fbar"><div class="fitem"><label>部门：</label><select class="fsel" id="fd" onchange="subPage=1;rSubs(g('content'))"><option value="">全部</option>${depts.map(d=>`<option>${d}</option>`).join('')}</select></div>
  <div class="fitem"><label>款式：</label><select class="fsel" id="fs" onchange="subPage=1;rSubs(g('content'))"><option value="">全部</option>${styles.map(s=>`<option>${s}</option>`).join('')}</select></div>
  <div class="fitem"><label>尺码：</label><select class="fsel" id="fz" onchange="subPage=1;rSubs(g('content'))"><option value="">全部</option>${sizes.map(s=>`<option>${s}</option>`).join('')}</select></div>
  <div class="fitem"><label>搜索：</label><input class="finp" id="fq" placeholder="姓名/工号" oninput="subPage=1;rSubs(g('content'))"></div>
  <button class="fbtn" onclick="expCSV()">📥 导出Excel</button></div>
  <div class="card"><div class="card-bd-np"><table class="dtable"><thead><tr><th>#</th><th>姓名</th><th>工号</th><th>部门</th><th>款式</th><th>尺码</th><th>地址</th><th>时间</th><th>来源</th><th>操作</th></tr></thead>
  <tbody id="stb"></tbody></table></div></div>`;
  setTimeout(()=>fSubs(),10);
}
function fSubs(){
  let subs=ls(SK.subs).sort((a,b)=>new Date(b.submitTime)-new Date(a.submitTime));
  const fd=g('fd'),fs=g('fs'),fz=g('fz'),fq=g('fq');
  if(fd&&fd.value)subs=subs.filter(s=>s.dept===fd.value);
  if(fs&&fs.value)subs=subs.filter(s=>s.styleName===fs.value);
  if(fz&&fz.value)subs=subs.filter(s=>s.size===fz.value);
  if(fq&&fq.value){const q=fq.value.toLowerCase();subs=subs.filter(s=>s.name.toLowerCase().includes(q)||s.empId.toLowerCase().includes(q))}
  const start=(subPage-1)*PS,page=subs.slice(start,start+PS);
  const tb=g('stb');if(!tb)return;
  tb.innerHTML=page.map((s,i)=>`<tr><td>${start+i+1}</td><td>${s.name}</td><td>${s.empId}</td><td>${s.dept}</td><td>${s.styleName}</td><td>${s.size}</td><td>${s.addressName}</td><td>${fmtTime(s.submitTime)}</td><td><span class="tag ${s.source==='h5'?'tag-b':'tag-o'}">${s.source}</span></td><td><button class="hbtn" style="font-size:12px;padding:4px 10px" onclick="delSub('${s.empId}')">删除</button></td></tr>`).join('')||'<tr><td colspan="10" style="text-align:center;color:#999;padding:30px">暂无数据</td></tr>';
}
function delSub(eid){if(!confirm('确认删除？'))return;let s=ls(SK.subs);s=s.filter(x=>x.empId!==eid);ls(SK.subs,s);addLog('modify','删除选款：'+eid);rSubs(g('content'));showMsg('已删除','s')}
function expCSV(){
  const subs=ls(SK.subs);
  let csv='\uFEFF姓名,工号,部门,款式,尺码,地址,备注,提交时间,来源\n';
  subs.forEach(s=>{csv+=`${s.name},${s.empId},${s.dept},${s.styleName},${s.size},${s.addressName},${s.remark||''},${fmtTime(s.submitTime)},${s.source}\n`});
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='选款数据.csv';a.click();
  addLog('submit','导出选款数据');showMsg('数据已导出','s');
}

// ========== 缺漏排查 ==========
function rMiss(c){
  const emps=ls(SK.emp),subs=ls(SK.subs),subIds=new Set(subs.map(s=>s.empId));
  const depts=[...new Set(emps.map(e=>e.dept))].sort();
  const missing=emps.filter(e=>!subIds.has(e.empId)),done=emps.filter(e=>subIds.has(e.empId));
  c.innerHTML=`<h2 style="font-size:20px;font-weight:700;margin-bottom:20px">缺漏排查 & 补登</h2>
  <div class="stat-cards" style="grid-template-columns:repeat(3,1fr)"><div class="stat-card"><div class="stat-card-title">总员工数</div><div class="stat-card-value">${emps.length}</div></div>
  <div class="stat-card"><div class="stat-card-title">已提交</div><div class="stat-card-value" style="color:#52c41a">${done.length}</div></div>
  <div class="stat-card"><div class="stat-card-title">未提交</div><div class="stat-card-value" style="color:#ff4d4f">${missing.length}</div></div></div>
  <div class="fbar"><div class="fitem"><label>部门：</label><select class="fsel" id="mfd" onchange="rMiss(g('content'))"><option value="">全部</option>${depts.map(d=>`<option>${d}</option>`).join('')}</select></div>
  <button class="fbtn" onclick="expMiss()">📥 导出未提交名单</button><button class="fbtn" style="background:#fa8c16" onclick="showSup()">📝 手动补登</button></div>
  <div class="card"><div class="card-bd-np"><table class="dtable"><thead><tr><th>姓名</th><th>工号</th><th>部门</th><th>状态</th><th>操作</th></tr></thead>
  <tbody>${missing.map(e=>`<tr><td>${e.name}</td><td>${e.empId}</td><td>${e.dept}</td><td><span class="tag tag-r">未提交</span></td><td><button class="hbtn" style="font-size:12px;padding:4px 10px" onclick="quickSup('${e.empId}')">补登</button></td></tr>`).join('')||'<tr><td colspan="5" style="text-align:center;color:#52c41a;padding:30px">🎉 全部已提交！</td></tr>'}</tbody></table></div></div>`;
}
function expMiss(){
  const emps=ls(SK.emp),subs=ls(SK.subs),subIds=new Set(subs.map(s=>s.empId));
  const missing=emps.filter(e=>!subIds.has(e.empId));
  let csv='\uFEFF姓名,工号,部门,常用职场\n';
  missing.forEach(e=>{csv+=`${e.name},${e.empId},${e.dept},${e.workplace||''}\n`});
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='未提交员工名单.csv';a.click();
  showMsg('名单已导出','s');
}
function showSup(){
  const emps=ls(SK.emp),subs=ls(SK.subs),subIds=new Set(subs.map(s=>s.empId));
  const missing=emps.filter(e=>!subIds.has(e.empId));
  g('sup-emp').innerHTML='<option value="">请选择</option>'+missing.map(e=>`<option value="${e.empId}">${e.name} (${e.empId}) - ${e.dept}</option>`).join('');
  const stys=lsg(SK.active)?.styles||[{id:'male-white',name:'男款-白色'},{id:'male-blue',name:'男款-浅蓝色'},{id:'female-white',name:'女款-白色'},{id:'female-pink',name:'女款-樱花粉'}];
  g('sup-sty').innerHTML='<option value="">请选择</option>'+stys.map(s=>`<option value="${s.id}" data-n="${s.name}">${s.name}</option>`).join('');
  const addrs=lsg(SK.active)?.addresses||[{id:'sz-1',name:'深圳-腾讯大厦'},{id:'sz-2',name:'深圳-滨海大厦'},{id:'bj-1',name:'北京-总部大厦'},{id:'sh-1',name:'上海-腾讯大厦'}];
  g('sup-addr').innerHTML='<option value="">请选择</option>'+addrs.map(a=>`<option value="${a.id}">${a.name}</option>`).join('');
  g('modal-sup').classList.add('show');
}
function quickSup(eid){showSup();setTimeout(()=>{g('sup-emp').value=eid},100)}
function doSupplement(){
  const eid=g('sup-emp').value,sty=g('sup-sty'),sz=g('sup-sz').value,addr=g('sup-addr');
  if(!eid||!sty.value||!sz||!addr.value){showMsg('请填写完整信息','e');return}
  const emp=ls(SK.emp).find(e=>e.empId===eid);if(!emp)return;
  const subs=ls(SK.subs);
  subs.push({style:sty.value,styleName:sty.options[sty.selectedIndex].dataset.n||sty.options[sty.selectedIndex].text,size:sz,address:addr.value,addressName:addr.options[addr.selectedIndex].text,remark:'',empId:emp.empId,name:emp.name,dept:emp.dept,submitTime:new Date().toISOString(),source:'补登'});
  ls(SK.subs,subs);addLog('supplement','补登：'+emp.name);closeM('modal-sup');showMsg('补登成功','s');rMiss(g('content'));
}

// ========== 下单明细 ==========
function rOrder(c){
  const subs=ls(SK.subs);
  const map={};subs.forEach(s=>{const k=`${s.styleName}|${s.size}`;map[k]=(map[k]||0)+1});
  const entries=Object.entries(map).sort((a,b)=>b[1]-a[1]);
  const total=subs.length;
  c.innerHTML=`<h2 style="font-size:20px;font-weight:700;margin-bottom:20px">文化衫下单明细</h2>
  <div class="fbar"><button class="fbtn" onclick="expOrder()">📥 导出下单明细</button></div>
  <div class="card"><div class="card-bd-np"><table class="dtable"><thead><tr><th>款式</th><th>尺码</th><th>数量</th><th>占比</th></tr></thead>
  <tbody>${entries.map(([k,v])=>{const[sn,sz]=k.split('|');return`<tr><td>${sn}</td><td>${sz}</td><td><strong>${v}</strong></td><td>${Math.round(v/total*100)}%</td></tr>`}).join('')||'<tr><td colspan="4" style="text-align:center;color:#999;padding:30px">暂无数据</td></tr>'}</tbody></table></div></div>
  <div class="card"><div class="card-hd"><div class="card-tt">汇总</div></div><div class="card-bd"><div style="font-size:15px;font-weight:600">共计 ${total} 件文化衫</div>
  <div style="margin-top:10px;font-size:13px;color:#666">${Object.entries(countBy(subs,'styleName')).map(([k,v])=>`${k}：${v}件`).join(' | ')}</div></div></div>`;
}
function expOrder(){
  const subs=ls(SK.subs);const map={};subs.forEach(s=>{const k=`${s.styleName}|${s.size}`;map[k]=(map[k]||0)+1});
  let csv='\uFEFF款式,尺码,数量\n';Object.entries(map).forEach(([k,v])=>{const[sn,sz]=k.split('|');csv+=`${sn},${sz},${v}\n`});
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='下单明细.csv';a.click();showMsg('已导出','s');
}

// ========== 装箱邮寄 ==========
function rShip(c){
  const subs=ls(SK.subs);const byAddr={};
  subs.forEach(s=>{const k=s.addressName||'未知';if(!byAddr[k])byAddr[k]=[];byAddr[k].push(s)});
  c.innerHTML=`<h2 style="font-size:20px;font-weight:700;margin-bottom:20px">装箱邮寄明细</h2>
  <div class="fbar"><button class="fbtn" onclick="expShip()">📥 导出邮寄明细</button></div>
  ${Object.entries(byAddr).map(([addr,items])=>`
  <div class="card"><div class="card-hd"><div class="card-tt">📍 ${addr} <span class="tag tag-b">${items.length}件</span></div></div>
  <div class="card-bd-np"><table class="dtable"><thead><tr><th>姓名</th><th>工号</th><th>部门</th><th>款式</th><th>尺码</th></tr></thead>
  <tbody>${items.map(s=>`<tr><td>${s.name}</td><td>${s.empId}</td><td>${s.dept}</td><td>${s.styleName}</td><td>${s.size}</td></tr>`).join('')}</tbody></table></div></div>`).join('')||'<div class="empty"><div class="empty-icon">📦</div><div class="empty-text">暂无数据</div></div>'}`;
}
function expShip(){
  const subs=ls(SK.subs);let csv='\uFEFF地址,姓名,工号,部门,款式,尺码\n';
  subs.forEach(s=>{csv+=`${s.addressName},${s.name},${s.empId},${s.dept},${s.styleName},${s.size}\n`});
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='装箱邮寄明细.csv';a.click();showMsg('已导出','s');
}

// ========== 员工管理 ==========
function rEmp(c){
  const emps=ls(SK.emp);
  c.innerHTML=`<h2 style="font-size:20px;font-weight:700;margin-bottom:20px">员工信息管理</h2>
  <div class="fbar"><div class="fitem"><label>搜索：</label><input class="finp" id="eq" placeholder="姓名/工号/部门" oninput="fEmp()"></div>
  <button class="fbtn" onclick="g('modal-emp').classList.add('show')">➕ 新增</button><button class="fbtn fbtn-o" onclick="showMsg('Excel导入功能演示中','i')">📤 导入Excel</button><button class="fbtn fbtn-o" onclick="showMsg('HR同步功能演示中','i')">🔄 同步HR</button></div>
  <div class="card"><div class="card-bd-np"><table class="dtable"><thead><tr><th>姓名</th><th>工号</th><th>部门</th><th>常用职场</th><th>状态</th><th>操作</th></tr></thead>
  <tbody id="etb">${emps.map(e=>`<tr><td>${e.name}</td><td>${e.empId}</td><td>${e.dept}</td><td>${e.workplace||'-'}</td><td><span class="tag tag-g">在职</span></td><td><button class="hbtn" style="font-size:12px;padding:4px 10px" onclick="delEmp('${e.empId}')">删除</button></td></tr>`).join('')}</tbody></table></div></div>`;
}
function fEmp(){
  const q=g('eq').value.toLowerCase();const emps=ls(SK.emp).filter(e=>e.name.toLowerCase().includes(q)||e.empId.toLowerCase().includes(q)||e.dept.toLowerCase().includes(q));
  g('etb').innerHTML=emps.map(e=>`<tr><td>${e.name}</td><td>${e.empId}</td><td>${e.dept}</td><td>${e.workplace||'-'}</td><td><span class="tag tag-g">在职</span></td><td><button class="hbtn" style="font-size:12px;padding:4px 10px" onclick="delEmp('${e.empId}')">删除</button></td></tr>`).join('');
}
function saveEmp(){
  const n=g('emp-n').value.trim(),i=g('emp-i').value.trim(),d=g('emp-d').value.trim(),w=g('emp-w').value.trim();
  if(!n||!i||!d){showMsg('请填写完整信息','e');return}
  const emps=ls(SK.emp);emps.push({name:n,empId:i,dept:d,workplace:w,status:'active'});ls(SK.emp,emps);
  addLog('modify','新增员工：'+n);closeM('modal-emp');showMsg('员工已添加','s');rEmp(g('content'));
}
function delEmp(eid){if(!confirm('确认删除？'))return;let emps=ls(SK.emp);emps=emps.filter(e=>e.empId!==eid);ls(SK.emp,emps);addLog('modify','删除员工：'+eid);rEmp(g('content'));showMsg('已删除','s')}

// ========== H5配置 ==========
function rH5Cfg(c){
  const proj=lsg(SK.active);
  const styles=proj?.styles||[{name:'男款-白色',emoji:'👕'},{name:'男款-浅蓝色',emoji:'👔'},{name:'女款-白色',emoji:'👚'},{name:'女款-樱花粉',emoji:'🌸'}];
  c.innerHTML=`<h2 style="font-size:20px;font-weight:700;margin-bottom:20px">H5前端配置</h2>
  <div class="tabs"><div class="tab-i active" onclick="h5Tab(this,'ht-img')">图片管理</div><div class="tab-i" onclick="h5Tab(this,'ht-sz')">尺码模板</div><div class="tab-i" onclick="h5Tab(this,'ht-ad')">职场地址</div><div class="tab-i" onclick="h5Tab(this,'ht-bs')">基础配置</div></div>
  <div class="tab-c active" id="ht-img"><div class="card"><div class="card-hd"><div class="card-tt">款式示意图管理</div><button class="hbtn" onclick="showMsg('批量上传功能演示中','i')">📤 批量上传</button></div>
  <div class="card-bd"><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px">${styles.map(s=>`<div style="border:1px solid #f0f0f0;border-radius:12px;overflow:hidden"><div style="height:160px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;font-size:60px">${s.img?`<img src="${s.img}" style="width:100%;height:100%;object-fit:cover">`:s.emoji}</div><div style="padding:12px;font-size:13px;font-weight:600">${s.name}</div></div>`).join('')}</div></div></div></div>
  <div class="tab-c" id="ht-sz"><div class="card"><div class="card-hd"><div class="card-tt">尺码模板</div><div style="display:flex;gap:8px"><button class="hbtn" onclick="showMsg('模板下载演示中','i')">📥 下载模板</button><button class="hbtn hbtn-p" onclick="showMsg('模板导入演示中','i')">📤 导入模板</button></div></div>
  <div class="card-bd"><p style="color:#999;font-size:13px">当前尺码数据来源于项目配置，可通过导入Excel模板进行更新。</p></div></div></div>
  <div class="tab-c" id="ht-ad"><div class="card"><div class="card-hd"><div class="card-tt">职场地址</div><div style="display:flex;gap:8px"><button class="hbtn" onclick="showMsg('模板下载演示中','i')">📥 下载模板</button><button class="hbtn hbtn-p" onclick="showMsg('模板导入演示中','i')">📤 导入模板</button></div></div>
  <div class="card-bd"><p style="color:#999;font-size:13px">当前地址数据来源于项目配置，可通过导入Excel模板进行更新。</p></div></div></div>
  <div class="tab-c" id="ht-bs"><div class="card"><div class="card-hd"><div class="card-tt">基础配置</div></div><div class="card-bd">
  <div class="frow"><label class="flbl">H5页面标题</label><input class="fctl" id="h5t" value="${proj?.title||'2026TEG夏季文化衫'}"></div>
  <div class="frow"><label class="flbl">选款截止时间</label><input class="fctl" type="datetime-local" id="h5dl" value="${proj?.deadline||'2026-05-30T18:00'}"></div>
  <div class="frow"><label class="flbl">温馨提示文案</label><textarea class="fctl" id="h5nt" rows="3">本次选款选码截止至2026年5月30日18:00，逾期将无法修改。</textarea></div>
  <button class="fbtn" onclick="saveH5()">💾 保存配置</button></div></div></div>`;
}
function h5Tab(el,id){el.parentElement.querySelectorAll('.tab-i').forEach(t=>t.classList.remove('active'));el.classList.add('active');el.parentElement.parentElement.querySelectorAll('.tab-c').forEach(t=>t.classList.remove('active'));g(id).classList.add('active')}
function saveH5(){
  let proj=lsg(SK.active)||{};proj.title=g('h5t').value;proj.deadline=g('h5dl').value;
  localStorage.setItem(SK.active,JSON.stringify(proj));addLog('config','更新H5配置');showMsg('配置已保存，已同步至H5','s');
}

// ========== 操作日志 ==========
function rLogs(c){
  const logs=ls(SK.logs).sort((a,b)=>new Date(b.time)-new Date(a.time));
  const types={submit:'选款提交',modify:'数据修改',supplement:'缺漏补登',config:'H5配置',project:'项目管理',system:'系统'};
  c.innerHTML=`<h2 style="font-size:20px;font-weight:700;margin-bottom:20px">操作日志</h2>
  <div class="fbar"><button class="fbtn" onclick="showMsg('日志导出功能演示中','i')">📥 导出日志</button></div>
  <div class="card"><div class="card-bd-np"><table class="dtable"><thead><tr><th>时间</th><th>操作人</th><th>类型</th><th>内容</th><th>结果</th></tr></thead>
  <tbody>${logs.slice(0,50).map(l=>`<tr><td>${fmtTime(l.time)}</td><td>${l.user}</td><td><span class="tag tag-b">${types[l.type]||l.type}</span></td><td>${l.content}</td><td><span class="tag tag-g">${l.result}</span></td></tr>`).join('')||'<tr><td colspan="5" style="text-align:center;color:#999;padding:30px">暂无日志</td></tr>'}</tbody></table></div></div>`;
}

// ========== 启动 ==========
initDemo();
render();
</script>
