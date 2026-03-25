// =============== TEG文化衫数据管理系统 JS ===============
const SK = { proj:'teg_projects', subs:'teg_submissions', emp:'teg_employees', logs:'teg_admin_logs', active:'teg_h5_active_project', perm:'teg_permissions' };
const g = id => document.getElementById(id);
const ls = (k,v) => v !== undefined ? localStorage.setItem(k,JSON.stringify(v)) : JSON.parse(localStorage.getItem(k)||'[]');
const lsg = k => { try{return JSON.parse(localStorage.getItem(k))}catch(e){return null} };

// ========== 全局状态 ==========
let curMenu = 'admin'; // admin | dept | receiver
let curTab = 'all';    // all | bg | dept | daily
let curPage = 1;
const PAGE_SIZE = 12;
let curDataCtx = {};  // 当前数据处理上下文
let curPermCtx = {};  // 当前权限设置上下文

// ========== 初始化演示数据 ==========
function initDemo(){
  if(!localStorage.getItem(SK.emp)){
    const org1List=['TEG','IEG','PCG'];
    const org2Map={'TEG':['基础架构部','AI平台部','数据平台部'],'IEG':['互动娱乐部','光子工作室','天美工作室'],'PCG':['社交平台部','应用平台部','内容平台部']};
    const org3Map={'基础架构部':['云服务组','网络组','存储组'],'AI平台部':['算法组','训练平台组','推理平台组'],'数据平台部':['数据仓库组','数据治理组','BI工具组'],'互动娱乐部':['策划组','美术组','程序组'],'光子工作室':['战斗组','关卡组','引擎组'],'天美工作室':['J1项目组','J2项目组','J3项目组'],'社交平台部':['IM组','朋友圈组','搜索组'],'应用平台部':['浏览器组','应用商店组','安全组'],'内容平台部':['信息流组','视频组','直播组']};
    const buildings=['深圳-腾讯滨海大厦','北京-总部大厦','上海-腾讯大厦','深圳-腾讯大厦','成都-腾讯大厦','广州-TIT创意园'];
    const names=['张三','李四','王五','赵六','陈七','刘八','周九','吴十','郑十一','孙十二','钱十三','冯十四','褚十五','卫十六','蒋十七','沈十八','韩十九','杨二十','朱二一','秦二二','尤二三','许二四','何二五','吕二六','施二七','张二八','孔二九','曹三十'];
    const emps=names.map((n,i)=>{
      const o1=org1List[i%3];
      const o2List=org2Map[o1];const o2=o2List[i%o2List.length];
      const o3List=org3Map[o2];const o3=o3List[i%o3List.length];
      return {name:n,empId:`T2024${String(i+1).padStart(4,'0')}`,org1:o1,org2:o2,org3:o3,dept:`${o1}-${o2}`,workplace:buildings[i%buildings.length],status:'active',wxName:n+'_wx'};
    });
    ls(SK.emp,emps);
  }
  if(!localStorage.getItem(SK.subs)||ls(SK.subs).length===0){
    const emps=ls(SK.emp);
    // 款式：款式名称 + 颜色分开
    const styleConfigs=[
      {id:'male-green',styleName:'款式名称1',color:'军绿色',group:'男款'},
      {id:'male-khaki',styleName:'款式名称1',color:'卡其色',group:'男款'},
      {id:'female-khaki',styleName:'款式名称2',color:'浅卡其色',group:'女款'},
      {id:'female-pink',styleName:'款式名称2',color:'粉色',group:'女款'}
    ];
    const szs=['XS','S','M','L','XL','XXL','3XL'];
    const regions=['深圳地区','北京地区','上海地区','成都地区'];
    const buildingsByRegion={'深圳地区':['腾讯滨海大厦','腾讯大厦'],'北京地区':['总部大厦'],'上海地区':['腾讯大厦'],'成都地区':['腾讯大厦']};
    const receiverByBuilding={'腾讯滨海大厦':'楼宇收货1','腾讯大厦':'楼宇收货2','总部大厦':'楼宇收货3'};
    const subs=[];
    for(let i=0;i<Math.floor(emps.length*0.6);i++){
      const e=emps[i],sc=styleConfigs[~~(Math.random()*4)],szi=~~(Math.random()*szs.length);
      const region=regions[i%regions.length];
      const blds=buildingsByRegion[region];const bld=blds[i%blds.length];
      const receiver=receiverByBuilding[bld]||'收货人1';
      const d=new Date();d.setDate(d.getDate()-~~(Math.random()*7));
      subs.push({
        style:sc.id,styleName:sc.styleName,color:sc.color,styleGroup:sc.group,
        size:szs[szi],
        region:region,building:bld,receiver:receiver,
        address:region+'-'+bld,addressName:region+'-'+bld,
        remark:'',empId:e.empId,name:e.name,dept:e.dept,
        org1:e.org1,org2:e.org2,org3:e.org3,
        workplace:e.workplace,
        submitTime:d.toISOString(),source:Math.random()>.3?'h5':'补登'
      });
    }
    ls(SK.subs,subs);
  }
  if(!localStorage.getItem(SK.proj)){
    ls(SK.proj,[
      {id:'default',title:'2026TEG夏季文化衫',projId:'T01',desc:'TEG夏季文化衫选款选码',start:'2026-03-20T09:00',deadline:'2026-05-30T18:00',season:'2026-summer',status:'active',createdAt:new Date().toISOString(),type:'bg'},
      {id:'proj2',title:'2026TEG冬季文化衫',projId:'T02',desc:'TEG冬季文化衫选款选码',start:'2026-09-01T09:00',deadline:'2026-11-30T18:00',season:'2026-winter',status:'inactive',createdAt:new Date().toISOString(),type:'dept'}
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
  curTab='all';
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
    <button class="top-tab ${curTab==='all'?'active':''}" onclick="switchTab('all')">全部</button>
    <button class="top-tab ${curTab==='bg'?'active':''}" onclick="switchTab('bg')">BG文化衫</button>
    <button class="top-tab ${curTab==='dept'?'active':''}" onclick="switchTab('dept')">部门文化衫</button>
    <button class="top-tab ${curTab==='daily'?'active':''}" onclick="switchTab('daily')">活动文化衫</button>
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
  let filtered=projs;
  if(curTab!=='all'){
    const tabType={bg:'bg',dept:'dept',daily:'daily'};
    filtered=projs.filter(p=>(p.type||'bg')===tabType[curTab]);
  }
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
    <button class="top-tab ${curTab==='all'?'active':''}" onclick="switchTab('all')">全部</button>
    <button class="top-tab ${curTab==='bg'?'active':''}" onclick="switchTab('bg')">BG文化衫</button>
    <button class="top-tab ${curTab==='dept'?'active':''}" onclick="switchTab('dept')">部门文化衫</button>
    <button class="top-tab ${curTab==='daily'?'active':''}" onclick="switchTab('daily')">活动文化衫</button>
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
    <thead><tr><th>企业微信名</th><th>一级组织</th><th>二级组织</th><th>三级组织</th><th>服装款式</th><th>服装颜色</th><th>服装尺码</th><th>员工所在楼宇</th><th>服装收货楼宇</th><th>操作</th></tr></thead>
    <tbody>${subs.map((s,i)=>`<tr>
      <td>${s.name||'-'}</td>
      <td>${s.org1||'-'}</td>
      <td>${s.org2||'-'}</td>
      <td>${s.org3||'-'}</td>
      <td>${s.styleName||'-'}</td>
      <td>${s.color||'-'}</td>
      <td>${s.size||'-'}</td>
      <td>${s.workplace||'-'}</td>
      <td>${s.building||s.addressName||'-'}</td>
      <td>
        <button class="action-link action-link-green" onclick="editDeptSub('${dept}',${i})">修改</button>
        <button class="action-link action-link-orange" onclick="manualAddSub('${deptEncoded}')">手动补登</button>
      </td>
    </tr>`).join('')||'<tr><td colspan="10" style="text-align:center;color:#999;padding:30px">暂无数据</td></tr>'}</tbody>
  </table>
  </div>`;

  g('data-view-title').textContent=dept+' - 数据处理';
  g('data-view-body').innerHTML=html;
  g('modal-data-view').classList.add('show');
}

// 部门数据-修改
function editDeptSub(dept,idx){
  const subs=ls(SK.subs).filter(s=>s.dept===dept);
  if(!subs[idx]){showMsg('未找到该记录','e');return;}
  const s=subs[idx];
  showMsg(`修改功能演示中 - ${s.name} 的记录`,'i');
}

// 部门数据-手动补登
function manualAddSub(deptEncoded){
  const dept=decodeURIComponent(deptEncoded);
  showMsg(`手动补登功能演示中 - ${dept}`,'i');
}

function exportDeptCSV(deptEncoded){
  const dept=decodeURIComponent(deptEncoded);
  const subs=ls(SK.subs).filter(s=>s.dept===dept);
  let csv='\uFEFF企业微信名,一级组织,二级组织,三级组织,服装款式,服装颜色,服装尺码,员工所在楼宇,服装收货楼宇\n';
  subs.forEach(s=>{csv+=`${s.name},${s.org1||''},${s.org2||''},${s.org3||''},${s.styleName||''},${s.color||''},${s.size},${s.workplace||''},${s.building||s.addressName||''}\n`});
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
    <button class="top-tab ${curTab==='all'?'active':''}" onclick="switchTab('all')">全部</button>
    <button class="top-tab ${curTab==='bg'?'active':''}" onclick="switchTab('bg')">BG文化衫</button>
    <button class="top-tab ${curTab==='dept'?'active':''}" onclick="switchTab('dept')">部门文化衫</button>
    <button class="top-tab ${curTab==='daily'?'active':''}" onclick="switchTab('daily')">活动文化衫</button>
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

  // 获取所有款式和颜色（按款式分组）
  const styleNames=[...new Set(subs.map(s=>s.styleName||'未知'))].sort();
  const colorsByStyle={};
  styleNames.forEach(sn=>{
    colorsByStyle[sn]=[...new Set(subs.filter(s=>s.styleName===sn).map(s=>s.color||'未知'))].sort();
  });
  const allSizes=['XS','S','M','L','XL','XXL','3XL','4XL','5XL'];

  // 统计：region|building|dept|styleName|color|size → count
  const countMap={};
  subs.forEach(s=>{
    const key=`${s.region||'未知'}|${s.building||'未知'}|${s.dept||'未知'}|${s.styleName||'未知'}|${s.color||'未知'}|${s.size}`;
    countMap[key]=(countMap[key]||0)+1;
  });

  // 构建层级数据：地区 → 楼宇 → 部门
  const regionMap={};
  subs.forEach(s=>{
    const rg=s.region||'未知地区';
    const bd=s.building||'未知楼宇';
    const rc=s.receiver||'收货人';
    const dp=s.dept||'未知部门';
    if(!regionMap[rg]) regionMap[rg]={};
    if(!regionMap[rg][bd]) regionMap[rg][bd]={receiver:rc,depts:new Set()};
    regionMap[rg][bd].depts.add(dp);
  });

  // 计算每款式列数 = 每颜色(9尺码+1颜色汇总) + 1款式小计 = colors*(sizes+1)+1
  // 总数据列 = sum(每款式列数) + 1(合计)

  let html=`<div style="margin-bottom:16px">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px">📦 ${addr} - 收货数据</div>
    <div class="export-bar">
      <button class="btn btn-primary" onclick="exportReceiverCSV('${addrEncoded}')">📥 导出数据</button>
    </div>
  </div>`;

  // 每个颜色占的列数 = 1(颜色名) + sizes + 1(颜色汇总) = allSizes.length + 2
  const colsPerColor = allSizes.length + 2;
  // 每个款式占的列数 = 所有颜色列 + 1(款式汇总)
  // = colorsByStyle[sn].length * colsPerColor + 1

  html+=`<div class="table-scroll-wrap">
  <table class="size-detail-table" style="font-size:11px">
    <thead>`;

  // ===== 表头第1行：左侧固定列(rowspan=2) + 每款式名称(colspan) + 合计(rowspan=2) =====
  html+=`<tr>
    <th rowspan="2" style="min-width:50px;font-size:11px">地区</th>
    <th rowspan="2" style="min-width:50px;font-size:11px">楼宇</th>
    <th rowspan="2" style="min-width:60px;font-size:11px">楼宇收货人</th>
    <th rowspan="2" style="min-width:60px;font-size:11px">部门</th>
    <th rowspan="2" style="min-width:60px;font-size:11px">部门对接人</th>`;
  styleNames.forEach(sn=>{
    const styleColSpan = colorsByStyle[sn].length * colsPerColor + 1;
    html+=`<th colspan="${styleColSpan}" class="group-header" style="background:#e8f0fe;font-size:11px">${sn}</th>`;
  });
  html+=`<th rowspan="2" class="grand-total" style="min-width:35px;font-size:11px">合计</th></tr>`;

  // ===== 表头第2行：[颜色名][XS][S]...[5XL][颜色X汇总] 重复每颜色 + [款式X汇总] =====
  html+=`<tr>`;
  styleNames.forEach(sn=>{
    colorsByStyle[sn].forEach(co=>{
      html+=`<th class="color-header" style="font-size:10px;white-space:nowrap">${co}</th>`;
      allSizes.forEach(sz=>{
        html+=`<th style="font-size:10px">${sz}</th>`;
      });
      html+=`<th class="total-col" style="font-size:10px;white-space:nowrap">${co}汇总</th>`;
    });
    html+=`<th class="total-col" style="background:#fff3e0;font-size:10px;white-space:nowrap">${sn}汇总</th>`;
  });
  html+=`</tr>`;

  html+=`</thead><tbody>`;

  // ===== 数据行 =====
  Object.entries(regionMap).forEach(([region,buildings])=>{
    let regionRowSpan=0;
    Object.values(buildings).forEach(bi=>{regionRowSpan+=bi.depts.size;});
    let isFirstRegion=true;

    Object.entries(buildings).forEach(([bldName,bldInfo])=>{
      const deptArr=[...bldInfo.depts];
      let isFirstBld=true;

      deptArr.forEach(dept=>{
        const deptSubs=subs.filter(s=>s.region===region&&s.building===bldName&&s.dept===dept);
        const contacts=[...new Set(deptSubs.map(s=>s.name))].slice(0,2).join('/');

        html+=`<tr>`;
        if(isFirstRegion){
          html+=`<td rowspan="${regionRowSpan}">${region}</td>`;
          isFirstRegion=false;
        }
        if(isFirstBld){
          html+=`<td rowspan="${deptArr.length}">${bldName}</td>`;
          html+=`<td rowspan="${deptArr.length}">${bldInfo.receiver}</td>`;
          isFirstBld=false;
        }
        html+=`<td>${dept}</td><td>${contacts}</td>`;

        let rowTotal=0;
        styleNames.forEach(sn=>{
          let styleSubTotal=0;
          colorsByStyle[sn].forEach(co=>{
            html+=`<td></td>`; // 颜色名列占位
            let colorTotal=0;
            allSizes.forEach(sz=>{
              const key=`${region}|${bldName}|${dept}|${sn}|${co}|${sz}`;
              const cnt=countMap[key]||0;
              colorTotal+=cnt;
              html+=`<td class="num">${cnt||''}</td>`;
            });
            styleSubTotal+=colorTotal;
            html+=`<td class="total-col">${colorTotal||''}</td>`;
          });
          rowTotal+=styleSubTotal;
          html+=`<td class="total-col" style="background:#fff3e0">${styleSubTotal||''}</td>`;
        });
        html+=`<td class="grand-total">${rowTotal}</td></tr>`;
      });
    });
  });

  // ===== 地区小计行（按地区汇总） =====
  Object.entries(regionMap).forEach(([region,buildings])=>{
    html+=`<tr style="font-weight:600;background:#fafafa"><td colspan="5" style="text-align:right">${region} 小计</td>`;
    let regionTotal=0;
    styleNames.forEach(sn=>{
      let styleSubTotal=0;
      colorsByStyle[sn].forEach(co=>{
        html+=`<td></td>`; // 颜色名列占位
        let colorTotal=0;
        allSizes.forEach(sz=>{
          let cnt=0;
          Object.entries(buildings).forEach(([bldName,bldInfo])=>{
            [...bldInfo.depts].forEach(dept=>{
              const key=`${region}|${bldName}|${dept}|${sn}|${co}|${sz}`;
              cnt+=(countMap[key]||0);
            });
          });
          colorTotal+=cnt;
          html+=`<td class="num">${cnt||''}</td>`;
        });
        styleSubTotal+=colorTotal;
        html+=`<td class="total-col">${colorTotal||''}</td>`;
      });
      regionTotal+=styleSubTotal;
      html+=`<td class="total-col" style="background:#fff3e0">${styleSubTotal||''}</td>`;
    });
    html+=`<td class="grand-total">${regionTotal}</td></tr>`;
  });

  // ===== 总合计行 =====
  html+=`<tr style="font-weight:700;background:#f5f5f5"><td colspan="5" style="text-align:right">合计</td>`;
  let allTotal=0;
  styleNames.forEach(sn=>{
    let styleSubTotal=0;
    colorsByStyle[sn].forEach(co=>{
      html+=`<td></td>`; // 颜色名列占位
      let colorTotal=0;
      allSizes.forEach(sz=>{
        const cnt=subs.filter(s=>(s.styleName||'未知')===sn&&(s.color||'未知')===co&&s.size===sz).length;
        colorTotal+=cnt;
        html+=`<td class="num">${cnt||''}</td>`;
      });
      allTotal+=colorTotal;
      styleSubTotal+=colorTotal;
      html+=`<td class="total-col">${colorTotal||''}</td>`;
    });
    html+=`<td class="total-col" style="background:#fff3e0">${styleSubTotal||''}</td>`;
  });
  html+=`<td class="grand-total">${allTotal}</td></tr>`;

  html+=`</tbody></table></div>`;

  g('data-view-title').textContent=addr+' - 收货数据';
  g('data-view-body').innerHTML=html;
  g('modal-data-view').classList.add('show');
}

// ========== 收货人数据导出 ==========
function exportReceiverCSV(addrEncoded){
  const addr=decodeURIComponent(addrEncoded);
  const subs=ls(SK.subs).filter(s=>s.addressName===addr);
  let csv='\uFEFF企业微信名,一级组织,二级组织,三级组织,服装款式,服装颜色,服装尺码,员工所在楼宇,服装收货楼宇\n';
  subs.forEach(s=>{csv+=`${s.name},${s.org1||''},${s.org2||''},${s.org3||''},${s.styleName||''},${s.color||''},${s.size},${s.workplace||''},${s.building||s.addressName||''}\n`});
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
        <thead><tr><th>企业微信名</th><th>一级组织</th><th>二级组织</th><th>三级组织</th><th>服装款式</th><th>服装颜色</th><th>服装尺码</th><th>员工所在楼宇</th><th>服装收货楼宇</th></tr></thead>
        <tbody>${subs.map((s,i)=>`<tr>
          <td>${s.name||'-'}</td><td>${s.org1||'-'}</td><td>${s.org2||'-'}</td><td>${s.org3||'-'}</td><td>${s.styleName||'-'}</td><td>${s.color||'-'}</td><td>${s.size||'-'}</td><td>${s.workplace||'-'}</td><td>${s.building||s.addressName||'-'}</td>
        </tr>`).join('')}</tbody>
      </table>
      </div>
      <div style="margin-top:8px;font-size:12px;color:#999">共 ${subs.length} 条</div>
    </div>`;
  }

  // 下单数据 - 款式×颜色×尺码矩阵
  if(showOrder){
    // 获取所有款式名和颜色
    const styleNames=[...new Set(subs.map(s=>s.styleName||'未知'))].sort();
    const colorsByStyle={};
    styleNames.forEach(sn=>{
      colorsByStyle[sn]=[...new Set(subs.filter(s=>s.styleName===sn).map(s=>s.color||'未知'))].sort();
    });
    const allSizes=['XS','S','M','L','XL','XXL','3XL','4XL','5XL'];

    // 统计数据
    const countMap={};
    subs.forEach(s=>{
      const key=`${s.styleName||'未知'}|${s.color||'未知'}|${s.size}`;
      countMap[key]=(countMap[key]||0)+1;
    });
    const getCount=(sn,co,sz)=>countMap[`${sn}|${co}|${sz}`]||0;

    // 计算总列数：每个款式下每个颜色占allSizes.length列
    let totalColorCols=0;
    styleNames.forEach(sn=>{totalColorCols+=colorsByStyle[sn].length;});

    html+=`<div style="margin-bottom:24px">
      <div style="font-size:15px;font-weight:700;margin-bottom:12px;color:#1a1a2e">📦 下单数据</div>
      <div class="table-scroll-wrap">
      <table class="size-detail-table" style="font-size:12px">
        <thead>
          <tr>
            <th rowspan="3" style="min-width:50px">款式</th>
            ${styleNames.map(sn=>`<th colspan="${colorsByStyle[sn].length * allSizes.length}" class="group-header">${sn}</th>`).join('')}
          </tr>
          <tr>
            ${styleNames.map(sn=>colorsByStyle[sn].map(co=>`<th colspan="${allSizes.length}" class="color-header">${co}</th>`).join('')).join('')}
          </tr>
          <tr>
            ${styleNames.map(sn=>colorsByStyle[sn].map(co=>allSizes.map(sz=>`<th>${sz}</th>`).join('')).join('')).join('')}
          </tr>
        </thead>
        <tbody>`;

    // 行1: 尺码小计(件) - 每个尺码列的总数
    html+=`<tr><td style="font-weight:600">尺码小计(件)</td>`;
    styleNames.forEach(sn=>{
      colorsByStyle[sn].forEach(co=>{
        allSizes.forEach(sz=>{
          html+=`<td class="num">${getCount(sn,co,sz)}</td>`;
        });
      });
    });
    html+=`</tr>`;

    // 行2: 颜色小计(件)
    html+=`<tr><td style="font-weight:600">颜色小计(件)</td>`;
    styleNames.forEach(sn=>{
      colorsByStyle[sn].forEach(co=>{
        const colorTotal=allSizes.reduce((sum,sz)=>sum+getCount(sn,co,sz),0);
        html+=`<td class="total-col" colspan="${allSizes.length}">${colorTotal}</td>`;
      });
    });
    html+=`</tr>`;

    // 行3: 款式小计(件)
    html+=`<tr><td style="font-weight:600">款式小计(件)</td>`;
    styleNames.forEach(sn=>{
      const styleTotal=colorsByStyle[sn].reduce((sum,co)=>allSizes.reduce((s2,sz)=>s2+getCount(sn,co,sz),sum),0);
      const colSpan=colorsByStyle[sn].length*allSizes.length;
      html+=`<td class="total-col" colspan="${colSpan}">${styleTotal}</td>`;
    });
    html+=`</tr>`;

    // 行4: 合计(件)
    const grandTotal=subs.length;
    const totalCols=styleNames.reduce((s,sn)=>s+colorsByStyle[sn].length*allSizes.length,0);
    html+=`<tr style="font-weight:700;background:#f5f5f5"><td style="font-weight:700">合计(件)</td><td class="grand-total" colspan="${totalCols}">${grandTotal}</td></tr>`;

    html+=`</tbody></table></div>
      <div style="margin-top:8px;font-size:12px;color:#999">共 ${subs.length} 件</div>
    </div>`;
  }

  // 装箱数据 - 按地区/楼宇/部门 + 款式×颜色×尺码矩阵
  if(showBox){
    // 获取所有款式和颜色
    const styleNames=[...new Set(subs.map(s=>s.styleName||'未知'))].sort();
    const colorsByStyle={};
    styleNames.forEach(sn=>{
      colorsByStyle[sn]=[...new Set(subs.filter(s=>s.styleName===sn).map(s=>s.color||'未知'))].sort();
    });
    const allSizes=['XS','S','M','L','XL','XXL','3XL','4XL','5XL'];

    const countMap={};
    subs.forEach(s=>{
      const key=`${s.region||'未知'}|${s.building||'未知'}|${s.dept||'未知'}|${s.styleName||'未知'}|${s.color||'未知'}|${s.size}`;
      countMap[key]=(countMap[key]||0)+1;
    });

    // 构建层级数据：地区 → 楼宇 → 部门
    const regionMap={};
    subs.forEach(s=>{
      const rg=s.region||'未知地区';
      const bd=s.building||'未知楼宇';
      const rc=s.receiver||'收货人';
      const dp=s.dept||'未知部门';
      if(!regionMap[rg]) regionMap[rg]={};
      if(!regionMap[rg][bd]) regionMap[rg][bd]={receiver:rc,depts:new Set()};
      regionMap[rg][bd].depts.add(dp);
    });

    // 计算表头
    html+=`<div style="margin-bottom:24px">
      <div style="font-size:15px;font-weight:700;margin-bottom:12px;color:#1a1a2e">🚚 装箱数据</div>
      <div class="table-scroll-wrap">
      <table class="size-detail-table" style="font-size:12px">
        <thead>
          <tr>
            <th rowspan="2" style="min-width:60px">地区</th>
            <th rowspan="2" style="min-width:60px">楼宇</th>
            <th rowspan="2" style="min-width:70px">楼宇收货人</th>
            <th rowspan="2" style="min-width:80px">部门</th>
            <th rowspan="2" style="min-width:70px">部门对接人</th>
            ${styleNames.map(sn=>colorsByStyle[sn].map(co=>`<th colspan="${allSizes.length+1}" class="color-header">${co}</th>`).join('')).join('')}
            <th rowspan="2" class="grand-total" style="min-width:40px">合计</th>
          </tr>
          <tr>
            ${styleNames.map(sn=>colorsByStyle[sn].map(co=>[...allSizes.map(sz=>`<th>${sz}</th>`),`<th class="total-col">${sn}汇总</th>`].join('')).join('')).join('')}
          </tr>
        </thead>
        <tbody>`;

    // 数据行
    Object.entries(regionMap).forEach(([region,buildings])=>{
      let regionRowSpan=0;
      Object.values(buildings).forEach(bi=>{regionRowSpan+=bi.depts.size;});
      let isFirstRegion=true;

      Object.entries(buildings).forEach(([bldName,bldInfo])=>{
        const deptArr=[...bldInfo.depts];
        let isFirstBld=true;

        deptArr.forEach(dept=>{
          // 找该部门的对接人
          const deptSubs=subs.filter(s=>s.region===region&&s.building===bldName&&s.dept===dept);
          const contacts=[...new Set(deptSubs.map(s=>s.name))].slice(0,2).join('/');

          html+=`<tr>`;
          if(isFirstRegion){
            html+=`<td rowspan="${regionRowSpan}">${region}</td>`;
            isFirstRegion=false;
          }
          if(isFirstBld){
            html+=`<td rowspan="${deptArr.length}">${bldName}</td>`;
            html+=`<td rowspan="${deptArr.length}">${bldInfo.receiver}</td>`;
            isFirstBld=false;
          }
          html+=`<td>${dept}</td><td>${contacts}</td>`;

          let rowTotal=0;
          styleNames.forEach(sn=>{
            colorsByStyle[sn].forEach(co=>{
              let colorStyleTotal=0;
              allSizes.forEach(sz=>{
                const key=`${region}|${bldName}|${dept}|${sn}|${co}|${sz}`;
                const cnt=countMap[key]||0;
                colorStyleTotal+=cnt;
                html+=`<td class="num">${cnt||''}</td>`;
              });
              rowTotal+=colorStyleTotal;
              html+=`<td class="total-col">${colorStyleTotal||''}</td>`;
            });
          });
          html+=`<td class="grand-total">${rowTotal}</td></tr>`;
        });
      });
    });

    // 合计行
    html+=`<tr style="font-weight:700;background:#f5f5f5"><td colspan="5" style="text-align:right">合计</td>`;
    let allTotal=0;
    styleNames.forEach(sn=>{
      colorsByStyle[sn].forEach(co=>{
        let colorTotal=0;
        allSizes.forEach(sz=>{
          const cnt=subs.filter(s=>(s.styleName||'未知')===sn&&(s.color||'未知')===co&&s.size===sz).length;
          colorTotal+=cnt;
          html+=`<td class="num">${cnt||''}</td>`;
        });
        allTotal+=colorTotal;
        html+=`<td class="total-col">${colorTotal}</td>`;
      });
    });
    html+=`<td class="grand-total">${allTotal}</td></tr>`;

    html+=`</tbody></table></div></div>`;
  }

  g('data-view-title').textContent='数据处理';
  g('data-view-body').innerHTML=html;
  g('modal-data-view').classList.add('show');
}

// ========== 管理员导出全部数据 ==========
function exportAdminAllData(){
  const subs=ls(SK.subs);
  let csv='\uFEFF企业微信名,一级组织,二级组织,三级组织,服装款式,服装颜色,服装尺码,员工所在楼宇,服装收货楼宇\n';
  subs.forEach(s=>{csv+=`${s.name},${s.org1||''},${s.org2||''},${s.org3||''},${s.styleName||''},${s.color||''},${s.size},${s.workplace||''},${s.building||s.addressName||''}\n`});
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
