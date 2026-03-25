// =============== TEG文化衫数据管理系统 JS ===============
const SK = { proj:'teg_projects', subs:'teg_submissions', emp:'teg_employees', logs:'teg_admin_logs', active:'teg_h5_active_project', perm:'teg_permissions' };
const g = id => document.getElementById(id);
const ls = (k,v) => v !== undefined ? localStorage.setItem(k,JSON.stringify(v)) : JSON.parse(localStorage.getItem(k)||'[]');
const lsg = k => { try{return JSON.parse(localStorage.getItem(k))}catch(e){return null} };

// ========== 全局状态 ==========
let curMenu = 'admin'; // admin | dept | receiver
let curTab = 'main';   // main | normal | daily
let curPage = 1;
const PAGE_SIZE = 12;
let curDataCtx = {};  // 当前数据处理上下文
let curPermCtx = {};  // 当前权限设置上下文

// ========== 初始化演示数据 ==========
function initDemo(){
  if(!localStorage.getItem(SK.emp)){
    const depts=['TEG-基础架构部','TEG-AI平台部','TEG-数据平台部','TEG-云架构平台部','TEG-安全平台部','TEG-运营技术部'];
    const names=['张三','李四','王五','赵六','陈七','刘八','周九','吴十','郑十一','孙十二','钱十三','冯十四','褚十五','卫十六','蒋十七','沈十八','韩十九','杨二十','朱二一','秦二二','尤二三','许二四','何二五','吕二六','施二七','张二八','孔二九','曹三十'];
    const emps=names.map((n,i)=>({name:n,empId:`T2024${String(i+1).padStart(4,'0')}`,dept:depts[i%depts.length],workplace:['深圳-腾讯滨海大厦','北京-总部大厦','上海-腾讯大厦','深圳-腾讯大厦'][i%4],status:'active',wxName:n+'_wx'}));
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
    ls(SK.proj,[
      {id:'default',title:'2026TEG夏季文化衫',projId:'T01',desc:'TEG夏季文化衫选款选码',start:'2026-03-20T09:00',deadline:'2026-05-30T18:00',season:'2026-summer',status:'active',createdAt:new Date().toISOString(),type:'main'},
      {id:'proj2',title:'2026TEG冬季文化衫',projId:'T02',desc:'TEG冬季文化衫选款选码',start:'2026-09-01T09:00',deadline:'2026-11-30T18:00',season:'2026-winter',status:'inactive',createdAt:new Date().toISOString(),type:'normal'}
    ]);
  }
  if(!localStorage.getItem(SK.perm)){
    ls(SK.perm,{
      admin:['admin_wx','manager_wx'],
      dept:{},
      receiver:{}
    });
  }
  if(!localStorage.getItem(SK.logs)) ls(SK.logs,[{time:new Date().toISOString(),user:'管理员',type:'system',content:'系统初始化',result:'成功'}]);
}

// ========== 工具函数 ==========
function fmtTime(t){if(!t)return'-';const d=new Date(t);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}
function fmtDateRange(s,e){if(!s||!e)return'-';return `${fmtTime(s)} 至 ${fmtTime(e)}`}
function addLog(type,content){const logs=ls(SK.logs);logs.push({time:new Date().toISOString(),user:'管理员',type,content,result:'成功'});ls(SK.logs,logs)}
function showMsg(text,type='info'){const el=g('gmsg');el.className=`msg show msg-${type[0]}`;el.textContent=text;setTimeout(()=>el.classList.remove('show'),2500)}
function closeM(id){g(id).classList.remove('show')}
function refreshAll(){render();showMsg('数据已刷新','s')}
function onGlobalSearch(){}

// ========== 导航 ==========
function goMenu(menu){
  curMenu=menu;
  curTab='main';
  curPage=1;
  document.querySelectorAll('.menu-item').forEach(m=>m.classList.toggle('active',m.dataset.p===menu));
  render();
}

function switchTab(tab){
  curTab=tab;
  curPage=1;
  render();
}

// ========== 分页工具 ==========
function renderPagination(total,page,onChange){
  const totalPages=Math.max(1,Math.ceil(total/PAGE_SIZE));
  const pages=[];
  for(let i=1;i<=totalPages;i++) pages.push(i);
  return `<div class="pagination">
    <div class="pagination-info">共 ${total} 条</div>
    <div class="pagination-btns">
      <button class="page-btn" onclick="${onChange}(${Math.max(1,page-1)})" ${page<=1?'disabled':''}>‹</button>
      ${pages.map(p=>`<button class="page-btn ${p===page?'active':''}" onclick="${onChange}(${p})">${p}</button>`).join('')}
      <button class="page-btn" onclick="${onChange}(${Math.min(totalPages,page+1)})" ${page>=totalPages?'disabled':''}>›</button>
      <span style="font-size:12px;color:#999;margin-left:8px">前往</span>
    </div>
  </div>`;
}

// ========== 主渲染 ==========
function render(){
  const c=g('content');
  if(curMenu==='admin') renderAdmin(c);
  else if(curMenu==='dept') renderDept(c);
  else if(curMenu==='receiver') renderReceiver(c);
}

// ===============================================================
// ========== 2.1 管理员看板 ==========
// ===============================================================
function renderAdmin(c){
  const projs=ls(SK.proj);
  const filteredProjs=filterProjsByTab(projs);

  c.innerHTML=`
  <div class="top-tabs">
    <button class="top-tab ${curTab==='main'?'active':''}" onclick="switchTab('main')">主要活动</button>
    <button class="top-tab ${curTab==='normal'?'active':''}" onclick="switchTab('normal')">普通活动</button>
    <button class="top-tab ${curTab==='daily'?'active':''}" onclick="switchTab('daily')">日常活动</button>
  </div>

  <div class="filter-bar">
    <div class="filter-item"><span class="filter-label">项目标题</span><input class="filter-input" id="f-title" placeholder="项目标题搜索" oninput="render()"></div>
    <div class="filter-item"><span class="filter-label">状态</span>
      <select class="filter-select" id="f-status" onchange="render()"><option value="">全部</option><option value="active">进行中</option><option value="inactive">已结束</option></select>
    </div>
    <button class="btn btn-primary" onclick="render()">筛选</button>
    <button class="btn btn-outline" onclick="resetFilters()">重置</button>
    <div style="flex:1"></div>
    <button class="dl-template" onclick="showMsg('下载模板功能演示中','i')">⬇ 下载模板</button>
  </div>

  <div class="page-title">管理员看板</div>

  <div class="card">
    <div class="card-bd-np">
      <table class="dtable">
        <thead><tr>
          <th>序号</th><th>标题</th><th>活动时间</th><th>状态</th><th>操作</th>
        </tr></thead>
        <tbody id="admin-table-body"></tbody>
      </table>
    </div>
  </div>
  <div id="admin-pagination"></div>`;

  renderAdminTable(filteredProjs);
}

function filterProjsByTab(projs){
  const tabType={main:'main',normal:'normal',daily:'daily'};
  let filtered=projs.filter(p=>(p.type||'main')===tabType[curTab]);
  const fTitle=g('f-title');
  const fStatus=g('f-status');
  if(fTitle&&fTitle.value) filtered=filtered.filter(p=>p.title.includes(fTitle.value));
  if(fStatus&&fStatus.value) filtered=filtered.filter(p=>p.status===fStatus.value);
  return filtered;
}

function renderAdminTable(projs){
  const start=(curPage-1)*PAGE_SIZE;
  const page=projs.slice(start,start+PAGE_SIZE);
  const tb=g('admin-table-body');
  if(!tb) return;
  tb.innerHTML=page.map((p,i)=>`<tr>
    <td>${start+i+1}</td>
    <td>${p.title}</td>
    <td>${fmtDateRange(p.start,p.deadline)}</td>
    <td><span class="tag ${p.status==='active'?'tag-green':'tag-red'}">${p.status==='active'?'进行中':'已结束'}</span></td>
    <td>
      <button class="action-link action-link-green" onclick="openDataSelect('admin','${p.id}')">数据处理</button>
      <button class="action-link action-link-orange" onclick="openPermSetting('admin','${p.id}')">权限设置</button>
    </td>
  </tr>`).join('')||'<tr><td colspan="5" style="text-align:center;color:#999;padding:40px">暂无数据</td></tr>';

  const pagEl=g('admin-pagination');
  if(pagEl) pagEl.innerHTML=renderPagination(projs.length,curPage,'goAdminPage');
}

function goAdminPage(p){curPage=p;render();}

// ===============================================================
// ========== 2.2 部门看板 ==========
// ===============================================================
function renderDept(c){
  const projs=ls(SK.proj);
  const filteredProjs=filterProjsByTab(projs);

  c.innerHTML=`
  <div class="top-tabs">
    <button class="top-tab ${curTab==='main'?'active':''}" onclick="switchTab('main')">主要活动</button>
    <button class="top-tab ${curTab==='normal'?'active':''}" onclick="switchTab('normal')">普通活动</button>
    <button class="top-tab ${curTab==='daily'?'active':''}" onclick="switchTab('daily')">日常活动</button>
  </div>

  <div class="filter-bar">
    <div class="filter-item"><span class="filter-label">项目标题</span><input class="filter-input" id="f-title" placeholder="项目标题搜索" oninput="render()"></div>
    <div class="filter-item"><span class="filter-label">状态</span>
      <select class="filter-select" id="f-status" onchange="render()"><option value="">全部</option><option value="active">进行中</option><option value="inactive">已结束</option></select>
    </div>
    <button class="btn btn-primary" onclick="render()">筛选</button>
    <button class="btn btn-outline" onclick="resetFilters()">重置</button>
    <div style="flex:1"></div>
    <button class="dl-template" onclick="showMsg('下载模板功能演示中','i')">⬇ 下载模板</button>
  </div>

  <div class="page-title">部门看板</div>

  <div class="card">
    <div class="card-bd-np">
      <table class="dtable">
        <thead><tr>
          <th>序号</th><th>部门名称</th><th>标题</th><th>活动时间</th><th>状态</th><th>操作</th>
        </tr></thead>
        <tbody id="dept-table-body"></tbody>
      </table>
    </div>
  </div>
  <div id="dept-pagination"></div>`;

  renderDeptTable(filteredProjs);
}

function renderDeptTable(projs){
  const emps=ls(SK.emp);
  const depts=[...new Set(emps.map(e=>e.dept))].sort();
  // 每个部门×项目 = 一行
  const rows=[];
  depts.forEach(dept=>{
    projs.forEach(p=>{
      rows.push({dept,proj:p});
    });
  });

  const start=(curPage-1)*PAGE_SIZE;
  const page=rows.slice(start,start+PAGE_SIZE);
  const tb=g('dept-table-body');
  if(!tb)return;
  tb.innerHTML=page.map((r,i)=>`<tr>
    <td>${start+i+1}</td>
    <td>${r.dept}</td>
    <td>${r.proj.title}</td>
    <td>${fmtDateRange(r.proj.start,r.proj.deadline)}</td>
    <td><span class="tag ${r.proj.status==='active'?'tag-green':'tag-red'}">${r.proj.status==='active'?'进行中':'已结束'}</span></td>
    <td>
      <button class="action-link action-link-green" onclick="openDeptData('${encodeURIComponent(r.dept)}','${r.proj.id}')">数据处理</button>
      <button class="action-link action-link-orange" onclick="openPermSetting('dept','${encodeURIComponent(r.dept)}')">权限设置</button>
    </td>
  </tr>`).join('')||'<tr><td colspan="6" style="text-align:center;color:#999;padding:40px">暂无数据</td></tr>';

  const pagEl=g('dept-pagination');
  if(pagEl) pagEl.innerHTML=renderPagination(rows.length,curPage,'goDeptPage');
}

function goDeptPage(p){curPage=p;render();}

// ========== 2.2.1 部门数据处理（全屏大屏显示） ==========
function openDeptData(deptEncoded,projId){
  const dept=decodeURIComponent(deptEncoded);
  const subs=ls(SK.subs).filter(s=>s.dept===dept);
  const emps=ls(SK.emp).filter(e=>e.dept===dept);

  let html=`<div style="margin-bottom:16px">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px">📊 ${dept} - 数据详情</div>
    <div class="export-bar">
      <button class="btn btn-primary" onclick="exportDeptCSV('${deptEncoded}')">📥 导出</button>
    </div>
  </div>`;

  html+=`<div class="table-scroll-wrap">
  <table class="dtable" style="font-size:12px">
    <thead><tr><th>序号</th><th>姓名</th><th>款式</th><th>尺码</th><th>门店</th><th>地址</th><th>门店编码/物编码</th><th>数量编码/时间</th><th>操作</th></tr></thead>
    <tbody>${subs.map((s,i)=>`<tr>
      <td>${i+1}</td>
      <td>${s.name}</td>
      <td>${s.styleName}</td>
      <td>${s.size}</td>
      <td>${s.addressName}</td>
      <td>${s.addressName}</td>
      <td>${s.empId}</td>
      <td>${fmtTime(s.submitTime)}</td>
      <td>
        <button class="action-link action-link-green" onclick="showPersonDetail('${s.empId}')">负责人详情</button>
      </td>
    </tr>`).join('')||'<tr><td colspan="9" style="text-align:center;color:#999;padding:30px">暂无数据</td></tr>'}</tbody>
  </table>
  </div>`;

  g('data-view-title').textContent=dept+' - 数据处理';
  g('data-view-body').innerHTML=html;
  g('modal-data-view').classList.add('show');
}

function exportDeptCSV(deptEncoded){
  const dept=decodeURIComponent(deptEncoded);
  const subs=ls(SK.subs).filter(s=>s.dept===dept);
  let csv='\uFEFF姓名,款式,尺码,地址,工号,时间\n';
  subs.forEach(s=>{csv+=`${s.name},${s.styleName},${s.size},${s.addressName},${s.empId},${fmtTime(s.submitTime)}\n`});
  downloadCSV(csv,`${dept}_数据.csv`);
}

// ========== 负责人详情弹窗 ==========
function showPersonDetail(empId){
  const emp=ls(SK.emp).find(e=>e.empId===empId);
  if(!emp){showMsg('未找到员工信息','e');return;}
  g('detail-body').innerHTML=`
    <div class="detail-row"><div class="detail-label">企业微信号</div><div class="detail-value">${emp.wxName||emp.name+'_wx'}</div></div>
    <div class="detail-row"><div class="detail-label">姓名</div><div class="detail-value">${emp.name}</div></div>
    <div class="detail-row"><div class="detail-label">部门</div><div class="detail-value">${emp.dept}</div></div>
    <div class="detail-row"><div class="detail-label">所在地</div><div class="detail-value">${emp.workplace||'-'}</div></div>
    <div class="detail-row"><div class="detail-label">工号</div><div class="detail-value">${emp.empId}</div></div>
  `;
  g('modal-detail').classList.add('show');
}

// ===============================================================
// ========== 2.3 收货人看板 ==========
// ===============================================================
function renderReceiver(c){
  const projs=ls(SK.proj);
  const filteredProjs=filterProjsByTab(projs);
  const subs=ls(SK.subs);
  const emps=ls(SK.emp);

  c.innerHTML=`
  <div class="top-tabs">
    <button class="top-tab ${curTab==='main'?'active':''}" onclick="switchTab('main')">主要活动</button>
    <button class="top-tab ${curTab==='normal'?'active':''}" onclick="switchTab('normal')">普通活动</button>
    <button class="top-tab ${curTab==='daily'?'active':''}" onclick="switchTab('daily')">日常活动</button>
  </div>

  <div class="filter-bar">
    <div class="filter-item"><span class="filter-label">项目标题</span><input class="filter-input" id="f-title" placeholder="项目标题搜索" oninput="render()"></div>
    <div class="filter-item"><span class="filter-label">状态</span>
      <select class="filter-select" id="f-status" onchange="render()"><option value="">全部</option><option value="active">进行中</option><option value="inactive">已结束</option></select>
    </div>
    <button class="btn btn-primary" onclick="render()">筛选</button>
    <button class="btn btn-outline" onclick="resetFilters()">重置</button>
    <div style="flex:1"></div>
    <button class="dl-template" onclick="showMsg('下载模板功能演示中','i')">⬇ 下载模板</button>
  </div>

  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
    <div class="page-title" style="margin-bottom:0">收货人看板</div>
    <span class="tag tag-yellow" style="font-size:12px">收货人入口</span>
  </div>

  <div class="card">
    <div class="card-bd-np">
      <table class="dtable">
        <thead><tr>
          <th>序号</th><th>收货地区</th><th>收货人</th><th>收货部门</th><th>标题</th><th>活动时间</th><th>状态</th><th>操作</th>
        </tr></thead>
        <tbody id="receiver-table-body"></tbody>
      </table>
    </div>
  </div>
  <div id="receiver-pagination"></div>`;

  renderReceiverTable(filteredProjs);
}

function renderReceiverTable(projs){
  const subs=ls(SK.subs);
  // 按地址构建行，每个地址关联收货人和部门
  const addrMap={};
  subs.forEach(s=>{
    const k=s.addressName||'未知';
    if(!addrMap[k]){addrMap[k]={addr:k,names:new Set(),depts:new Set()};}
    addrMap[k].names.add(s.name);
    addrMap[k].depts.add(s.dept);
  });
  const rows=[];
  Object.values(addrMap).forEach(info=>{
    projs.forEach(p=>{
      rows.push({addr:info.addr,names:[...info.names].join('、'),depts:[...info.depts].join('、'),proj:p});
    });
  });

  const start=(curPage-1)*PAGE_SIZE;
  const page=rows.slice(start,start+PAGE_SIZE);
  const tb=g('receiver-table-body');
  if(!tb)return;
  tb.innerHTML=page.map((r,i)=>`<tr>
    <td>${start+i+1}</td>
    <td>${r.addr}</td>
    <td><span style="max-width:150px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.names}">${r.names}</span></td>
    <td><span style="max-width:200px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.depts}">${r.depts}</span></td>
    <td>${r.proj.title}</td>
    <td>${fmtDateRange(r.proj.start,r.proj.deadline)}</td>
    <td><span class="tag ${r.proj.status==='active'?'tag-green':'tag-red'}">${r.proj.status==='active'?'进行中':'已结束'}</span></td>
    <td>
      <button class="action-link action-link-green" onclick="openReceiverData('${encodeURIComponent(r.addr)}')">数据查看</button>
      <button class="action-link action-link-orange" onclick="openPermSetting('receiver','${encodeURIComponent(r.addr)}')">权限设置</button>
    </td>
  </tr>`).join('')||'<tr><td colspan="8" style="text-align:center;color:#999;padding:40px">暂无数据</td></tr>';

  const pagEl=g('receiver-pagination');
  if(pagEl) pagEl.innerHTML=renderPagination(rows.length,curPage,'goReceiverPage');
}

function goReceiverPage(p){curPage=p;render();}

// ========== 2.3.1 收货人数据查看（全屏大屏 + 详细尺码矩阵） ==========
function openReceiverData(addrEncoded){
  const addr=decodeURIComponent(addrEncoded);
  const subs=ls(SK.subs).filter(s=>s.addressName===addr);

  // 定义款式结构：男款（军绿色、卡其色）、女款（浅卡其色、粉色）
  const maleSizes=['XS','S','M','L','XL','XXL','3XL','4XL','5XL'];
  const femaleSizes=['XXS','XS','S','M','L','XL','XXL','3XL'];
  const maleColors=['军绿色','卡其色'];
  const femaleColors=['浅卡其色','粉色'];

  // 统计每个收货地区按款式/颜色/尺码的分布
  // 由于demo数据格式是 "男款-白色"，我们把它映射到矩阵
  const matrix={};
  subs.forEach(s=>{
    const key=`${s.styleName}|${s.size}`;
    matrix[key]=(matrix[key]||0)+1;
  });

  // 构建简易矩阵 - 基于实际数据中的款式
  const styleSet=new Set(subs.map(s=>s.styleName));
  const sizeSet=new Set(subs.map(s=>s.size));
  const styles=[...styleSet].sort();
  const sizes=[...sizeSet].sort();

  let html=`<div style="margin-bottom:16px">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px">📦 ${addr} - 收货数据</div>
    <div class="export-bar">
      <button class="btn btn-primary" onclick="exportReceiverCSV('${addrEncoded}')">📥 导出数据</button>
    </div>
  </div>`;

  // 基础明细表
  html+=`<div style="margin-bottom:24px">
    <div style="font-size:14px;font-weight:600;margin-bottom:10px">📋 收货明细</div>
    <div class="table-scroll-wrap" style="max-height:300px">
    <table class="dtable" style="font-size:12px">
      <thead><tr><th>序号</th><th>姓名</th><th>工号</th><th>部门</th><th>款式</th><th>尺码</th><th>提交时间</th></tr></thead>
      <tbody>${subs.map((s,i)=>`<tr>
        <td>${i+1}</td><td>${s.name}</td><td>${s.empId}</td><td>${s.dept}</td><td>${s.styleName}</td><td>${s.size}</td><td>${fmtTime(s.submitTime)}</td>
      </tr>`).join('')||'<tr><td colspan="7" style="text-align:center;color:#999;padding:30px">暂无数据</td></tr>'}</tbody>
    </table>
    </div>
    <div style="margin-top:8px;font-size:12px;color:#999">共 ${subs.length} 条记录</div>
  </div>`;

  // 款式×颜色×尺码矩阵表格（类似截图中的Excel样式）
  if(subs.length>0){
    html+=`<div style="margin-bottom:24px">
      <div style="font-size:14px;font-weight:600;margin-bottom:10px">📊 服装款式/颜色/尺码汇总</div>
      <div class="table-scroll-wrap">
      <table class="size-detail-table">
        <thead>
          <tr>
            <th rowspan="2" style="min-width:80px">收货地区</th>
            <th rowspan="2" style="min-width:60px">收货人</th>
            <th rowspan="2" style="min-width:100px">收货部门</th>`;

    // 按男款/女款分组 - 使用实际数据中的款式
    const maleStyles=styles.filter(s=>s.includes('男'));
    const femaleStyles=styles.filter(s=>s.includes('女'));
    const otherStyles=styles.filter(s=>!s.includes('男')&&!s.includes('女'));

    const allGroups=[];
    if(maleStyles.length>0) allGroups.push({label:'男款',styles:maleStyles});
    if(femaleStyles.length>0) allGroups.push({label:'女款',styles:femaleStyles});
    if(otherStyles.length>0) allGroups.push({label:'其他',styles:otherStyles});

    // 表头第一行：大类
    allGroups.forEach(grp=>{
      const colSpan=grp.styles.length*sizes.length+1;
      const cls=grp.label==='女款'?'female-header':'group-header';
      html+=`<th colspan="${colSpan}" class="${cls}">${grp.label}</th>`;
    });
    html+=`<th rowspan="2" class="grand-total" style="min-width:50px">总计</th></tr><tr>`;

    // 表头第二行：各颜色×尺码
    allGroups.forEach(grp=>{
      grp.styles.forEach(sty=>{
        sizes.forEach(sz=>{
          const cls=grp.label==='女款'?'female-color':'color-header';
          html+=`<th class="${cls}">${sz}</th>`;
        });
      });
      html+=`<th class="total-col">${grp.label}汇总</th>`;
    });
    html+=`</tr></thead><tbody>`;

    // 按收货人分行
    const byPerson={};
    subs.forEach(s=>{
      const pk=`${s.name}|${s.empId}`;
      if(!byPerson[pk]) byPerson[pk]={name:s.name,empId:s.empId,dept:s.dept,items:[]};
      byPerson[pk].items.push(s);
    });

    Object.values(byPerson).forEach(person=>{
      html+=`<tr><td>${addr}</td><td>${person.name}</td><td>${person.dept}</td>`;
      let grandTotal=0;
      allGroups.forEach(grp=>{
        let grpTotal=0;
        grp.styles.forEach(sty=>{
          sizes.forEach(sz=>{
            const cnt=person.items.filter(s=>s.styleName===sty&&s.size===sz).length;
            grpTotal+=cnt;
            html+=`<td class="num">${cnt||0}</td>`;
          });
        });
        grandTotal+=grpTotal;
        html+=`<td class="total-col">${grpTotal}</td>`;
      });
      html+=`<td class="grand-total">${grandTotal}</td></tr>`;
    });

    // 汇总行
    html+=`<tr style="font-weight:700;background:#f5f5f5"><td colspan="3" style="text-align:right">合计</td>`;
    let allTotal=0;
    allGroups.forEach(grp=>{
      let grpTotal=0;
      grp.styles.forEach(sty=>{
        sizes.forEach(sz=>{
          const cnt=subs.filter(s=>s.styleName===sty&&s.size===sz).length;
          grpTotal+=cnt;
          html+=`<td class="num">${cnt||0}</td>`;
        });
      });
      allTotal+=grpTotal;
      html+=`<td class="total-col">${grpTotal}</td>`;
    });
    html+=`<td class="grand-total">${allTotal}</td></tr>`;

    html+=`</tbody></table></div></div>`;
  }

  g('data-view-title').textContent=addr+' - 收货数据';
  g('data-view-body').innerHTML=html;
  g('modal-data-view').classList.add('show');
}

// ========== 收货人数据导出 ==========
function exportReceiverCSV(addrEncoded){
  const addr=decodeURIComponent(addrEncoded);
  const subs=ls(SK.subs).filter(s=>s.addressName===addr);
  let csv='\uFEFF序号,姓名,工号,部门,款式,尺码,提交时间\n';
  subs.forEach((s,i)=>{csv+=`${i+1},${s.name},${s.empId},${s.dept},${s.styleName},${s.size},${fmtTime(s.submitTime)}\n`});
  downloadCSV(csv,`${addr}_收货数据.csv`);
}

// ===============================================================
// ========== 2.1.1 管理员数据处理 ==========
// ===============================================================
function openDataSelect(type,projId){
  curDataCtx={type,projId};
  // 重置选项
  if(g('chk-overview')) g('chk-overview').checked=true;
  if(g('chk-order')) g('chk-order').checked=false;
  if(g('chk-box')) g('chk-box').checked=false;
  g('modal-data-select').classList.add('show');
}

function viewSelectedData(){
  const showOverview=g('chk-overview').checked;
  const showOrder=g('chk-order').checked;
  const showBox=g('chk-box').checked;

  if(!showOverview&&!showOrder&&!showBox){showMsg('请至少选择一项数据','e');return;}

  closeM('modal-data-select');

  const subs=ls(SK.subs);
  const emps=ls(SK.emp);
  let html='<div class="export-bar"><button class="btn btn-primary" onclick="exportAdminAllData()">📥 导出数据</button></div>';

  // 总览表格
  if(showOverview){
    html+=`<div style="margin-bottom:24px">
      <div style="font-size:15px;font-weight:700;margin-bottom:12px;color:#1a1a2e">📋 总览表格</div>
      <div class="table-scroll-wrap">
      <table class="dtable" style="font-size:12px">
        <thead><tr><th>#</th><th>姓名</th><th>工号</th><th>部门</th><th>款式</th><th>尺码</th><th>地址</th><th>时间</th><th>来源</th></tr></thead>
        <tbody>${subs.map((s,i)=>`<tr>
          <td>${i+1}</td><td>${s.name}</td><td>${s.empId}</td><td>${s.dept}</td><td>${s.styleName}</td><td>${s.size}</td><td>${s.addressName}</td><td>${fmtTime(s.submitTime)}</td><td><span class="tag ${s.source==='h5'?'tag-blue':'tag-orange'}">${s.source}</span></td>
        </tr>`).join('')}</tbody>
      </table>
      </div>
      <div style="margin-top:8px;font-size:12px;color:#999">共 ${subs.length} 条</div>
    </div>`;
  }

  // 下单数据
  if(showOrder){
    const map={};subs.forEach(s=>{const k=`${s.styleName}|${s.size}`;map[k]=(map[k]||0)+1});
    const entries=Object.entries(map).sort((a,b)=>b[1]-a[1]);
    html+=`<div style="margin-bottom:24px">
      <div style="font-size:15px;font-weight:700;margin-bottom:12px;color:#1a1a2e">📦 下单数据</div>
      <div class="table-scroll-wrap">
      <table class="dtable" style="font-size:12px">
        <thead><tr><th>款式</th><th>尺码</th><th>数量</th><th>占比</th></tr></thead>
        <tbody>${entries.map(([k,v])=>{const[sn,sz]=k.split('|');return`<tr><td>${sn}</td><td>${sz}</td><td><strong>${v}</strong></td><td>${Math.round(v/subs.length*100)}%</td></tr>`}).join('')}</tbody>
      </table>
      </div>
      <div style="margin-top:8px;font-size:12px;color:#999">共 ${subs.length} 件</div>
    </div>`;
  }

  // 装箱数据
  if(showBox){
    const byAddr={};subs.forEach(s=>{const k=s.addressName||'未知';if(!byAddr[k])byAddr[k]=[];byAddr[k].push(s)});
    html+=`<div style="margin-bottom:24px">
      <div style="font-size:15px;font-weight:700;margin-bottom:12px;color:#1a1a2e">🚚 装箱数据</div>
      ${Object.entries(byAddr).map(([addr,items])=>`
        <div style="margin-bottom:16px">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px">📍 ${addr} <span class="tag tag-blue">${items.length}件</span></div>
          <div class="table-scroll-wrap" style="max-height:400px">
          <table class="dtable" style="font-size:12px">
            <thead><tr><th>姓名</th><th>工号</th><th>部门</th><th>款式</th><th>尺码</th></tr></thead>
            <tbody>${items.map(s=>`<tr><td>${s.name}</td><td>${s.empId}</td><td>${s.dept}</td><td>${s.styleName}</td><td>${s.size}</td></tr>`).join('')}</tbody>
          </table>
          </div>
        </div>
      `).join('')}
    </div>`;
  }

  g('data-view-title').textContent='数据处理';
  g('data-view-body').innerHTML=html;
  g('modal-data-view').classList.add('show');
}

// ========== 管理员导出全部数据 ==========
function exportAdminAllData(){
  const subs=ls(SK.subs);
  let csv='\uFEFF#,姓名,工号,部门,款式,尺码,地址,时间,来源\n';
  subs.forEach((s,i)=>{csv+=`${i+1},${s.name},${s.empId},${s.dept},${s.styleName},${s.size},${s.addressName},${fmtTime(s.submitTime)},${s.source}\n`});
  downloadCSV(csv,'管理员_数据导出.csv');
}

// ===============================================================
// ========== 权限设置（通用） ==========
// ===============================================================
function openPermSetting(type,key){
  curPermCtx={type,key:decodeURIComponent(key)};
  const perm=lsg(SK.perm)||{admin:[],dept:{},receiver:{}};
  let users=[];

  if(type==='admin'){
    users=perm.admin||[];
    g('perm-modal-title').textContent='管理员权限名单';
  }else if(type==='dept'){
    users=perm.dept?.[curPermCtx.key]||[];
    g('perm-modal-title').textContent=curPermCtx.key+' - 权限名单';
  }else if(type==='receiver'){
    users=perm.receiver?.[curPermCtx.key]||[];
    g('perm-modal-title').textContent=curPermCtx.key+' - 权限名单';
  }

  renderPermList(users);
  g('perm-add-input').value='';
  g('modal-perm').classList.add('show');
}

function renderPermList(users){
  const body=g('perm-list-body');
  if(!users||users.length===0){
    body.innerHTML='<div style="text-align:center;color:#999;padding:40px">暂无权限用户</div>';
    return;
  }
  body.innerHTML=users.map((u,i)=>`
    <div class="perm-item">
      <span class="perm-name">${u}</span>
      <button class="perm-remove" onclick="removePermUser(${i})">移除</button>
    </div>
  `).join('');
}

function addPermUser(){
  const input=g('perm-add-input');
  const name=input.value.trim();
  if(!name){showMsg('请输入企业微信名','e');return;}

  const perm=lsg(SK.perm)||{admin:[],dept:{},receiver:{}};
  let users=getPermUsers(perm);
  if(users.includes(name)){showMsg('该用户已存在','e');return;}

  users.push(name);
  setPermUsers(perm,users);
  ls(SK.perm,perm);
  renderPermList(users);
  input.value='';
  showMsg('已添加','s');
}

function removePermUser(idx){
  const perm=lsg(SK.perm)||{admin:[],dept:{},receiver:{}};
  let users=getPermUsers(perm);
  users.splice(idx,1);
  setPermUsers(perm,users);
  ls(SK.perm,perm);
  renderPermList(users);
  showMsg('已移除','s');
}

function getPermUsers(perm){
  if(curPermCtx.type==='admin') return perm.admin||[];
  if(curPermCtx.type==='dept'){
    if(!perm.dept) perm.dept={};
    if(!perm.dept[curPermCtx.key]) perm.dept[curPermCtx.key]=[];
    return perm.dept[curPermCtx.key];
  }
  if(curPermCtx.type==='receiver'){
    if(!perm.receiver) perm.receiver={};
    if(!perm.receiver[curPermCtx.key]) perm.receiver[curPermCtx.key]=[];
    return perm.receiver[curPermCtx.key];
  }
  return [];
}

function setPermUsers(perm,users){
  if(curPermCtx.type==='admin') perm.admin=users;
  else if(curPermCtx.type==='dept'){
    if(!perm.dept) perm.dept={};
    perm.dept[curPermCtx.key]=users;
  }else if(curPermCtx.type==='receiver'){
    if(!perm.receiver) perm.receiver={};
    perm.receiver[curPermCtx.key]=users;
  }
}

function savePerm(){
  addLog('perm','更新权限设置：'+curPermCtx.type+'/'+curPermCtx.key);
  closeM('modal-perm');
  showMsg('权限已保存','s');
}

// ========== 筛选重置 ==========
function resetFilters(){
  const ft=g('f-title'),fs=g('f-status');
  if(ft) ft.value='';
  if(fs) fs.value='';
  curPage=1;
  render();
}

// ========== 通用下载 ==========
function downloadCSV(csv,filename){
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();
  showMsg('数据已导出','s');
}

// ========== 启动 ==========
initDemo();
render();
