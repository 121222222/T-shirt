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
    // 构建默认H5数据（对应index.html前端内容）
    const defaultH5Pages = Array.from({length:10},()=>({
      bgImg:'', bgColor:'#000000',
      loadingImg:'', loadingHide:false,
      logoImg:'', logoHide:true,
      percentColor:'#ffffff',
      texts:[], images:[], toggles:{},
      musicSource:'library', musicChoice:'',
      accessControl:false,
      hidePage:false
    }));
    // 首页文字
    defaultH5Pages[0].texts=['2026TEG','夏季文化衫'];
    // 温馨提示
    defaultH5Pages[2].texts=['温馨提示','本次选款选码截止至2026年5月30日18:00，逾期将无法修改。未成功提交的同学后续不会安排补发。请在规定时间内选择最适合你的文化衫吧~','我知道了'];
    // 选择款式标题
    defaultH5Pages[3].texts=['Step1：选择款式','经典T恤，分男、女款式，多种颜色可挑选'];
    // 选择尺码标题
    defaultH5Pages[4].texts=['Step2：选择尺码','','确定尺码'];
    // 选择地址
    defaultH5Pages[5].texts=['Step3：选择地址','','办公地点','请勾选办公地点所在城市和大厦','备注','如果没有找到您所在的地区和办公大厦，请在备注栏手动输入，如：深圳 金地威新','注意事项','文化衫选款选码截止至2026年5月30日18:00，逾期无法修改，未成功提交的同学后续不会安排补发。','提交本次选码结果'];
    // 选款确认
    defaultH5Pages[6].texts=['Step4：选款选码确认','在5月30日18:00前，请务必核对填写信息并确认提交成功','确定尺码','生成分享图'];
    // 选码结束通知
    defaultH5Pages[8].texts=['选码结束通知','已超过最晚选择时间，系统根据去年选择的尺码，安排随机款式发放。新入职但未选码的，现场随机款式发放，尺码有可能无法满足，敬请谅解。','我知道了'];

    const defaultH5Data = {
      h5Title:'2026TEG夏季文化衫',
      h5Subtitle:'SUMMER COLLECTION',
      h5ShareImg:'',
      pages:defaultH5Pages,
      materials:[
        {img:'',name:'男款-白色',btnText:'查看详情',btnTextColor:true,btnColor:'#000',detailImg:''},
        {img:'',name:'男款-浅蓝色',btnText:'查看详情',btnTextColor:true,btnColor:'#000',detailImg:''},
        {img:'',name:'女款-白色',btnText:'查看详情',btnTextColor:true,btnColor:'#000',detailImg:''},
        {img:'',name:'女款-樱花粉',btnText:'查看详情',btnTextColor:true,btnColor:'#000',detailImg:''}
      ],
      sizes:[],
      configData:{startTime:'2026-03-20T09:00',endTime:'2026-05-30T18:00'}
    };

    ls(SK.proj,[
      {id:'default',title:'2026TEG夏季文化衫',projId:'T01',desc:'TEG夏季文化衫选款选码',start:'2026-03-20T09:00',deadline:'2026-05-30T18:00',season:'2026-summer',status:'active',createdAt:new Date().toISOString(),type:'bg',h5Data:defaultH5Data,permUsers:[]},
      {id:'proj2',title:'2026TEG冬季文化衫',projId:'T02',desc:'TEG冬季文化衫选款选码',start:'2026-09-01T09:00',deadline:'2026-11-30T18:00',season:'2026-winter',status:'inactive',createdAt:new Date().toISOString(),type:'dept'}
    ]);
  }
  // 升级：为已有的default项目补充h5Data（若缺失）
  {
    const existProjs=ls(SK.proj);
    let changed=false;
    existProjs.forEach(p=>{
      if(p.id==='default'&&!p.h5Data){
        const defaultH5Pages2 = Array.from({length:10},()=>({
          bgImg:'', bgColor:'#000000',
          loadingImg:'', loadingHide:false,
          logoImg:'', logoHide:true,
          percentColor:'#ffffff',
          texts:[], images:[], toggles:{},
          musicSource:'library', musicChoice:'',
          accessControl:false,
          hidePage:false
        }));
        defaultH5Pages2[0].texts=['2026TEG','夏季文化衫'];
        defaultH5Pages2[2].texts=['温馨提示','本次选款选码截止至2026年5月30日18:00，逾期将无法修改。','我知道了'];
        defaultH5Pages2[3].texts=['Step1：选择款式','经典T恤，分男、女款式'];
        defaultH5Pages2[4].texts=['Step2：选择尺码','','确定尺码'];
        defaultH5Pages2[5].texts=['Step3：选择地址','','办公地点','请勾选办公地点所在城市和大厦','备注','如果没有找到您所在的地区和办公大厦，请在备注栏手动输入','注意事项','文化衫选款选码截止至2026年5月30日18:00','提交本次选码结果'];
        defaultH5Pages2[6].texts=['Step4：选款选码确认','在5月30日18:00前请务必核对','确定尺码','生成分享图'];
        defaultH5Pages2[8].texts=['选码结束通知','已超过最晚选择时间，系统根据去年选择的尺码，安排随机款式发放。','我知道了'];
        p.h5Data={
          h5Title:p.title||'2026TEG夏季文化衫',
          h5Subtitle:p.desc||'SUMMER COLLECTION',
          h5ShareImg:'',
          pages:defaultH5Pages2,
          materials:[
            {img:'',name:'男款-白色',btnText:'查看详情',btnTextColor:true,btnColor:'#000',detailImg:''},
            {img:'',name:'男款-浅蓝色',btnText:'查看详情',btnTextColor:true,btnColor:'#000',detailImg:''},
            {img:'',name:'女款-白色',btnText:'查看详情',btnTextColor:true,btnColor:'#000',detailImg:''},
            {img:'',name:'女款-樱花粉',btnText:'查看详情',btnTextColor:true,btnColor:'#000',detailImg:''}
          ],
          sizes:[],
          configData:{startTime:p.start?p.start.slice(0,16):'',endTime:p.deadline?p.deadline.slice(0,16):''}
        };
        if(!p.permUsers) p.permUsers=[];
        changed=true;
      }
    });
    if(changed) ls(SK.proj,existProjs);
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
  if(curMenu==='newProj') renderNewProject();
  else if(curMenu==='projMgr') renderProjMgr(c);
  else if(curMenu==='admin') renderAdmin(c);
  else if(curMenu==='dept') renderDept(c);
  else if(curMenu==='receiver') renderReceiver(c);
  else if(curMenu==='userMgr') renderUserMgr(c);
}

// ===============================================================
// ========== 1. 文化衫项目管理 ==========
// ===============================================================
let projMgrTab = 'ongoing'; // ongoing | staged | expired
let projMgrPage = 1;
let npStep = 1; // 新建项目当前步骤
let npPermUsers = []; // 新建项目-权限用户列表
let npImgData = ''; // 新建项目-上传的图片base64
let editProjId = ''; // 当前编辑项目ID
let editProjPermId = ''; // 当前权限设置项目ID
let deleteProjId = ''; // 待删除项目ID

function renderProjMgr(c){
  const projs=ls(SK.proj);
  // 按tab筛选
  const now=new Date();
  let filtered=projs;
  if(projMgrTab==='ongoing'){
    filtered=projs.filter(p=>p.status==='active');
  }else if(projMgrTab==='staged'){
    filtered=projs.filter(p=>p.status==='inactive'&&p.deadline&&new Date(p.deadline)>=now);
  }else if(projMgrTab==='expired'){
    filtered=projs.filter(p=>p.status==='inactive'&&(!p.deadline||new Date(p.deadline)<now));
  }

  // 筛选条件
  const fTitle=g('pm-f-title');
  const fStatus=g('pm-f-status');
  if(fTitle&&fTitle.value) filtered=filtered.filter(p=>p.title.includes(fTitle.value));
  if(fStatus&&fStatus.value) filtered=filtered.filter(p=>p.status===fStatus.value);

  c.innerHTML=`
  <div class="proj-mgr-header">
    <div class="page-title" style="margin-bottom:0;color:var(--teal)">📋 文化衫项目管理</div>
  </div>

  <div class="top-tabs">
    <button class="top-tab ${projMgrTab==='ongoing'?'active':''}" onclick="switchProjMgrTab('ongoing')">正期活动</button>
    <button class="top-tab ${projMgrTab==='staged'?'active':''}" onclick="switchProjMgrTab('staged')">阶段活动</button>
    <button class="top-tab ${projMgrTab==='expired'?'active':''}" onclick="switchProjMgrTab('expired')">过期活动</button>
  </div>

  <div class="filter-bar">
    <div class="filter-item"><span class="filter-label">项目标题</span><input class="filter-input" id="pm-f-title" placeholder="项目标题搜索" oninput="render()"></div>
    <div class="filter-item"><span class="filter-label">状态</span>
      <select class="filter-select" id="pm-f-status" onchange="render()"><option value="">全部</option><option value="active">进行中</option><option value="inactive">已结束</option></select>
    </div>
    <button class="btn btn-primary" onclick="render()">筛选</button>
    <button class="btn btn-outline" onclick="resetProjMgrFilters()">重置</button>
    <div style="flex:1"></div>
    <button class="dl-template" onclick="showMsg('下载模板功能演示中','i')">⬇ 下载模板</button>
  </div>

  <div style="margin-bottom:16px">
    <button class="proj-mgr-title-btn" onclick="openNewProject()">新建项目</button>
  </div>

  <div class="card">
    <div class="card-bd-np">
      <table class="dtable">
        <thead><tr>
          <th>序号</th><th>任务ID</th><th>标题</th><th>活动时间</th><th>状态</th><th>操作</th>
        </tr></thead>
        <tbody id="pm-table-body"></tbody>
      </table>
    </div>
  </div>
  <div id="pm-pagination"></div>`;

  renderProjMgrTable(filtered);
}

function switchProjMgrTab(tab){
  projMgrTab=tab;
  projMgrPage=1;
  render();
}

function resetProjMgrFilters(){
  const ft=g('pm-f-title'),fs=g('pm-f-status');
  if(ft) ft.value='';
  if(fs) fs.value='';
  projMgrPage=1;
  render();
}

function renderProjMgrTable(projs){
  const start=(projMgrPage-1)*PAGE_SIZE;
  const page=projs.slice(start,start+PAGE_SIZE);
  const tb=g('pm-table-body');
  if(!tb)return;
  tb.innerHTML=page.map((p,i)=>`<tr>
    <td>${start+i+1}</td>
    <td>${p.projId||'-'}</td>
    <td>${p.title}</td>
    <td>${fmtDateRange(p.start,p.deadline)}</td>
    <td><span class="tag ${p.status==='active'?'tag-green':'tag-red'}">${p.status==='active'?'进行中':'已结束'}</span></td>
    <td>
      <button class="action-link" onclick="openViewProject('${p.id}')">查看项目</button>
      <button class="action-link action-link-green" onclick="openEditProj('${p.id}')">项目设置</button>
      <button class="action-link action-link-orange" onclick="openProjPerm('${p.id}')">权限设置</button>
      <button class="action-link action-link-red" onclick="openDeleteProj('${p.id}')">删除项目</button>
    </td>
  </tr>`).join('')||'<tr><td colspan="6" style="text-align:center;color:#999;padding:40px">暂无数据</td></tr>';

  const pagEl=g('pm-pagination');
  if(pagEl) pagEl.innerHTML=renderPagination(projs.length,projMgrPage,'goProjMgrPage');
}

function goProjMgrPage(p){projMgrPage=p;render();}

// ========== 1.1 新建项目（大页面流程） ==========
// 新建项目数据模型
let npData = {
  h5Title:'', h5Subtitle:'', h5ShareImg:'',
  pages:[], // 13个页面的配置数据
  materials:[], // 物料列表
  sizes:[], // 尺码列表
  configData:{} // 第三步配置数据
};
let npCurPage = 0; // 当前选中的H5页面索引(0-9)
let editingProjId = ''; // 正在编辑的项目ID（空=新建模式）

// 10个H5页面定义
const H5_PAGES = [
  {id:'p1', name:'首页', desc:'背景图片设置'},
  {id:'p2', name:'首页-2', desc:'替换背景图片'},
  {id:'p3', name:'温馨提示', desc:'替换背景图片+文字'},
  {id:'p4', name:'选择款式', desc:'物料配置+标题'},
  {id:'p5', name:'选择尺码', desc:'尺码导入+标题'},
  {id:'p6', name:'选择地址', desc:'地址+备注+注意事项'},
  {id:'p7', name:'选款确认', desc:'信息配置'},
  {id:'p8', name:'分享页', desc:'主背景+图片+logo+文字'},
  {id:'p9', name:'选码结束通知', desc:'背景色+文字'},
  {id:'p10', name:'访问权限', desc:'访问权限+背景图+文字'}
];

function initNpData(){
  npData = {
    h5Title:'', h5Subtitle:'', h5ShareImg:'',
    pages: H5_PAGES.map(()=>({
      bgImg:'', bgColor:'#000000',
      loadingImg:'', loadingHide:false,
      logoImg:'', logoHide:true,
      percentColor:'#ffffff',
      texts:[], images:[], toggles:{},
      musicSource:'library', musicChoice:'',
      accessControl:false,
      hidePage:false
    })),
    materials:[
      {img:'',name:'男款-军绿色',btnText:'查看详情',btnTextColor:true,btnColor:'#000',detailImg:''},
      {img:'',name:'男款-卡其色',btnText:'查看详情',btnTextColor:true,btnColor:'#000',detailImg:''},
      {img:'',name:'女款-棕色',btnText:'查看详情',btnTextColor:true,btnColor:'#000',detailImg:''},
      {img:'',name:'女款-浅卡其色',btnText:'查看详情',btnTextColor:true,btnColor:'#000',detailImg:''}
    ],
    sizes:[],
    configData:{}
  };
  npCurPage = 0;
}

function openNewProject(){
  npStep=1;
  npPermUsers=[];
  npImgData='';
  editingProjId='';
  initNpData();
  curMenu='newProj';
  document.querySelectorAll('.menu-item').forEach(m=>m.classList.remove('active'));
  renderNewProject();
}

function renderNewProject(){
  const c=g('content');
  let stepsHtml=`<div class="np-steps">`;
  const stepNames=['第一步：标题设置','第二步：制作H5','第三步：配置数据'];
  stepNames.forEach((name,i)=>{
    const stepNum=i+1;
    const cls=stepNum===npStep?'active':(stepNum<npStep?'done':'');
    stepsHtml+=`<div class="np-step-item ${cls}" onclick="npGoStep(${stepNum})">
      <span class="np-step-num">${stepNum<npStep?'✓':('0'+stepNum)}</span>
      <span>${name}</span>
    </div>`;
    if(i<2) stepsHtml+=`<span class="np-step-arrow">›</span>`;
  });
  stepsHtml+=`</div>`;

  let bodyHtml='';
  if(npStep===1) bodyHtml=renderNpStep1();
  else if(npStep===2) bodyHtml=renderNpStep2();
  else if(npStep===3) bodyHtml=renderNpStep3();

  const headerTitle = editingProjId?(npStep===1?'编辑项目':`编辑项目 - ${npData.h5Title||''}`):(npStep===1?'新建项目':'制作步骤');
  c.innerHTML=`<div class="np-page">
    <div class="np-page-header">
      <div style="display:flex;align-items:center;gap:12px">
        <button class="btn btn-outline" onclick="npBackToList()" style="padding:6px 14px;font-size:12px">← 返回列表</button>
        <div class="np-page-title">${headerTitle} <span class="info-icon" title="帮助">ⓘ</span></div>
      </div>
      <div class="np-header-btns">
        ${npStep>=2?'<button class="btn btn-outline" onclick="showMsg(\'模板素材包下载中\',\'i\')">模板素材包</button>':''}
        ${npStep>=2?'<button class="btn btn-primary" onclick="npPreviewH5()">预览H5</button>':''}
      </div>
    </div>
    ${stepsHtml}
    ${bodyHtml}
    <div class="np-footer">
      ${npStep>1?'<button class="btn btn-outline" onclick="npPrevStep()">上一步</button>':''}
      <button class="btn" style="background:#1565c0;color:#fff" onclick="npSaveProject()">保存</button>
      ${npStep<3?'<button class="btn btn-outline" onclick="npNextStep()">下一步</button>':''}
    </div>
  </div>`;

  // 在DOM更新后同步配置到iframe
  setTimeout(() => {
    if (npStep === 2 && g('np-h5-iframe')) {
      npSyncConfigToIframe();
    }
  }, 100);
}

// ===== 第一步：标题设置 =====
function renderNpStep1(){
  return `<div style="max-width:600px">
    <div class="np-config-section">
      <div class="np-field-row">
        <label class="np-field-label"><span class="req">*</span> H5主标题</label>
        <input class="np-field-input" id="np-h5-title" value="${npData.h5Title}" placeholder="最多可以输入12位" maxlength="12" oninput="npData.h5Title=this.value;npSyncConfigToIframe()">
      </div>
      <div class="np-field-row">
        <label class="np-field-label"><span class="req">*</span> H5副标题</label>
        <input class="np-field-input" id="np-h5-subtitle" value="${npData.h5Subtitle}" placeholder="最多可以输入21位" maxlength="21" oninput="npData.h5Subtitle=this.value;npSyncConfigToIframe()">
      </div>
      <div class="np-field-row" style="align-items:flex-start">
        <label class="np-field-label"><span class="req">*</span> H5转发图片</label>
        <div>
          <div class="np-img-upload" id="np-share-upload" onclick="document.getElementById('np-share-file').click()">
            ${npData.h5ShareImg?`<img src="${npData.h5ShareImg}"><div class="del-btn" onclick="event.stopPropagation();npData.h5ShareImg='';renderNewProject()">🗑</div>`:'<div style="font-size:24px;color:#ccc">☁</div><div class="np-img-upload-text">点击上传或拖拽文件到框</div>'}
          </div>
          <input type="file" id="np-share-file" accept="image/*" style="display:none" onchange="npUploadShareImg(this)">
          <div class="np-img-hint">尺寸：100*100PX　格式：png/jpg 且不超过2M</div>
        </div>
      </div>
    </div>
  </div>`;
}

function npUploadShareImg(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{npData.h5ShareImg=e.target.result;renderNewProject();npSyncConfigToIframe();};
  reader.readAsDataURL(file);
}

// ===== 第二步：制作H5（左侧手机预览+右侧配置） =====
function renderNpStep2(){
  // 构建缩略图列表
  let thumbs='';
  thumbs+=`<div class="np-thumb-nav" onclick="npScrollThumb(-1)">∧</div>`;
  H5_PAGES.forEach((pg,i)=>{
    thumbs+=`<div class="np-thumb-item ${i===npCurPage?'active':''}" onclick="npSelectPage(${i})">
      <div class="np-thumb-placeholder" style="font-size:9px;padding:2px">${pg.name}</div>
      <div class="np-thumb-label">${i+1}/13</div>
    </div>`;
  });
  thumbs+=`<div class="np-thumb-nav" onclick="npScrollThumb(1)">∨</div>`;

  // 手机预览内容
  let phoneContent = renderPhonePreview(npCurPage);

  // 右侧配置
  let configHtml = renderPageConfig(npCurPage);

  return `<div class="np-h5-layout">
    <div class="np-h5-left">
      <div class="np-phone-wrap">
        <div class="np-phone" style="border-radius:36px;overflow:hidden;">
          <iframe id="np-h5-iframe" src="index.html" style="width:100%;height:100%;border:none;" onload="npIframeLoaded()"></iframe>
        </div>
      </div>
      <div class="np-thumb-list" id="np-thumb-list">
        ${thumbs}
      </div>
    </div>
    <div class="np-h5-right">
      ${configHtml}
    </div>
  </div>`;
}

let npIframeReady = false;

function npSelectPage(idx){
  npCurPage=idx;
  // 只更新缩略图和右侧配置，不重新渲染整个页面（避免iframe重新加载）
  npUpdateThumbsAndConfig();
  // 通知iframe切换页面
  npSendToIframe('goto', idx);
}

// 快速更新缩略图激活状态和右侧配置（不触发iframe重载）
function npUpdateThumbsAndConfig(){
  // 更新缩略图激活状态
  const thumbItems = document.querySelectorAll('.np-thumb-item');
  thumbItems.forEach((el, i) => {
    el.classList.toggle('active', i === npCurPage);
  });
  // 更新右侧配置
  const rightPanel = document.querySelector('.np-h5-right');
  if(rightPanel){
    rightPanel.innerHTML = renderPageConfig(npCurPage);
  }
}

function npIframeLoaded(){
  npIframeReady = true;
  // iframe加载完成后，发送当前页面索引
  setTimeout(()=>{
    npSendToIframe('init');
    npSendToIframe('goto', npCurPage);
  }, 300);
}

function npSendToIframe(action, pageIndex, configData){
  const iframe = g('np-h5-iframe');
  if(!iframe || !iframe.contentWindow) return;
  iframe.contentWindow.postMessage({
    type: 'admin-preview',
    action: action,
    pageIndex: pageIndex !== undefined ? pageIndex : npCurPage,
    config: configData || null,
    h5Data: npData  // 发送完整H5配置数据
  }, '*');
}

// 监听iframe ready消息
window.addEventListener('message', function(e){
  if(e.data && e.data.type === 'h5-preview-ready'){
    npIframeReady = true;
    npSendToIframe('goto', npCurPage);
  }
});

function npScrollThumb(dir){
  const el=g('np-thumb-list');
  if(el) el.scrollBy({top:dir*120,behavior:'smooth'});
}

// 手机预览内容（根据当前页面）- 保留原函数作为fallback
function renderPhonePreview(pageIdx){
  const pg = H5_PAGES[pageIdx];
  const pd = npData.pages[pageIdx];
  // 根据不同页面类型渲染不同预览
  const previewMap = {
    0:()=>`<div style="height:100%;background:${pd.bgImg?`url(${pd.bgImg}) center/cover`:'linear-gradient(135deg,#1a237e,#0d47a1)'};display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;padding:20px;text-align:center">
      <div style="font-size:20px;font-weight:700">${npData.h5Title||'项目标题'}</div>
      <div style="font-size:12px;margin-top:8px;opacity:.8">${npData.h5Subtitle||'副标题'}</div>
      ${pd.logoHide?'':(pd.logoImg?`<div style="margin-top:60px"><img src="${pd.logoImg}" style="max-width:190px;max-height:100px" alt="logo"></div>`:`<div style="margin-top:60px;font-size:12px;opacity:.8">TEG办公室 × 企业IT</div>`)}
      ${pd.loadingHide?'':(pd.loadingImg?`<div style="margin-top:30px"><img src="${pd.loadingImg}" style="width:60px;height:60px;animation:spin 1s linear infinite" alt="loading"></div>`:`<div style="margin-top:30px;font-size:28px;animation:spin 1s linear infinite;display:inline-block">⏳</div>`)}
      ${pd.loadingHide?'':`<div style="margin-top:12px;font-size:11px;color:${pd.percentColor||'#ffffff'}">100%</div>`}
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </div>`,
    1:()=>`<div style="height:100%;background:${pd.bgImg?`url(${pd.bgImg}) center/cover`:'linear-gradient(135deg,#1a237e 0%,#283593 50%,#1565c0 100%)'};display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;padding:20px;text-align:center">
      <div style="font-size:18px;font-weight:700">${npData.h5Title||'项目标题'}</div>
      ${pd.images[0]?`<img src="${pd.images[0]}" style="max-width:80%;max-height:120px;margin:16px 0;border-radius:8px">`:''}
      <div style="font-size:14px;color:${pd.toggles.text0_color||'#ffffff'}">${pd.texts[0]||''}</div>
      <div style="font-size:12px;margin-top:8px;color:${pd.toggles.text1_color||'#ffffff'}">${pd.texts[1]||''}</div>
      <div style="margin-top:20px;padding:12px 24px;background:rgba(255,255,255,.2);border-radius:24px;font-size:13px">选择款式及尺码</div>
    </div>`,
    2:()=>`<div style="height:100%;background:${pd.bgImg?`url(${pd.bgImg}) center/cover`:(pd.bgColor||'#000')};display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;padding:24px;text-align:center">
      <div style="font-size:16px;font-weight:700;color:${pd.toggles.text0_color||'#ff9800'}">${pd.texts[0]||'温馨提示'}</div>
      <div style="font-size:12px;margin-top:16px;line-height:1.8;color:${pd.toggles.text1_color||'#ffffff'}">${pd.texts[1]||'本次文化衫填写截止2025年9月23日18:00，期间每个同学填写次数不限，后台以大家最后一次成功提交数据为准。'}</div>
      <div style="margin-top:24px;padding:10px 32px;background:${pd.toggles.text2_btnColorVal||'#333333'};border-radius:24px;font-size:13px;color:${pd.toggles.text2_color||'#ffffff'}">${pd.texts[2]||'我知道了'}</div>
    </div>`,
    3:()=>{
      const materialCount = npData.materials.length;
      const isTwo = materialCount <= 2;
      if (isTwo) {
        // 2个款式：同一白色卡片内左右并排，紧凑布局无需滚动
        return `<div style="height:100%;background:${pd.bgImg?`url(${pd.bgImg}) center/cover`:'linear-gradient(180deg,#4a7c28 0%,#c4a265 60%,#d4b980 100%)'};padding:10px;display:flex;flex-direction:column;overflow:hidden">
      <div style="font-weight:700;font-size:13px;color:${pd.toggles.text0_color||'#000000'}">${pd.texts[0]||'Step1：选择款式'}</div>
      <div style="font-size:10px;color:${pd.toggles.text1_color||'#666'};margin-top:2px">${pd.texts[1]||'经典哈灵顿领夹克，分男、女款式'}</div>
      <div style="background:#fff;border-radius:12px;padding:10px;margin-top:6px;flex:1;min-height:0">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;height:100%">
          ${npData.materials.slice(0,2).map(m=>`<div style="background:#f8f8f8;border-radius:8px;padding:6px;text-align:center;display:flex;flex-direction:column"><div style="position:relative;flex:1;min-height:0;display:flex;align-items:center;justify-content:center"><div style="width:100%;height:70px;background:#e8e8e8;border-radius:6px;${m.img?`background:url(${m.img}) center/contain no-repeat`:'display:flex;align-items:center;justify-content:center'}"><span style="font-size:28px;color:#ccc">${m.img?'':'👕'}</span></div><div style="position:absolute;top:2px;right:2px;background:#666;color:#fff;font-size:7px;padding:2px 4px;border-radius:3px">查看详情</div></div><div style="font-size:9px;color:#333;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.name}</div></div>`).join('')}
        </div>
      </div>
      <div style="margin-top:8px;text-align:center;padding:8px;background:#333;color:#fff;border-radius:18px;font-size:11px;flex-shrink:0">确定款式</div>
    </div>`;
      } else {
        // 多于2个款式：两列网格布局
        return `<div style="height:100%;background:${pd.bgImg?`url(${pd.bgImg}) center/cover`:'#fff'};padding:16px;overflow-y:auto">
      <div style="font-weight:700;font-size:14px;color:${pd.toggles.text0_color||'#000000'}">${pd.texts[0]||'Step1：选择款式'}</div>
      <div style="font-size:11px;color:${pd.toggles.text1_color||'#666'};margin-top:4px">${pd.texts[1]||'经典哈灵顿领夹克，分男、女款式'}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">
        ${npData.materials.slice(0,4).map(m=>`<div style="background:#f5f5f5;border-radius:8px;padding:8px;text-align:center"><div style="position:relative"><div style="height:60px;background:#e0e0e0;border-radius:4px;${m.img?`background:url(${m.img}) center/cover`:''}"></div><div style="position:absolute;top:4px;right:4px;background:#666;color:#fff;font-size:9px;padding:2px 6px;border-radius:4px">查看详情</div></div><div style="font-size:10px;margin-top:4px">${m.name}</div></div>`).join('')}
      </div>
      <div style="margin-top:16px;text-align:center;padding:10px;background:#333;color:#fff;border-radius:24px;font-size:13px">确定款式</div>
    </div>`;
      }
    },
    4:()=>`<div style="height:100%;background:${pd.bgImg?`url(${pd.bgImg}) center/cover`:'#fff'};padding:16px;overflow-y:auto">
      <div style="font-weight:700;font-size:14px;color:${pd.toggles.text0_color||'#000000'}">${pd.texts[0]||'Step2：选择尺码'}</div>
      <div style="font-size:11px;color:${pd.toggles.text1_color||'#1565c0'};margin-top:4px">${pd.texts[1]||''}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:12px">
        ${['XS','S','M','L','XL','XXL','3XL','4XL','5XL'].map(s=>`<div style="width:40px;height:36px;border:1px solid #e0e0e0;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:11px;color:${pd.toggles.sizeTextColor||'#000000'};${s==='XL'?'background:#1565c0;color:#fff;border-color:#1565c0':''}">${s}</div>`).join('')}
      </div>
      <div style="margin-top:20px;text-align:center;padding:10px;background:#333;color:#fff;border-radius:24px;font-size:13px">确定尺码</div>
    </div>`,
    5:()=>`<div style="height:100%;background:#fff;padding:16px;overflow-y:auto">
      <div style="font-weight:700;font-size:14px;color:${pd.toggles.text0_color||'#000000'}">${pd.texts[0]||'Step3：选择地址'}</div>
      <div style="font-size:11px;color:${pd.toggles.text1_color||'#666'};margin-top:4px">${pd.texts[1]||''}</div>
      <div style="margin-top:12px;font-size:12px"><b>${pd.texts[2]||'办公地点'}：</b><span style="color:#999">选择地址 ▾</span></div>
      <div style="font-size:10px;color:#999;margin-top:4px">${pd.texts[3]||'请勾选办公地点所在城市和大厦'}</div>
      <div style="margin-top:16px"><b style="font-size:12px;color:${pd.toggles.text4_color||'#000'}">${pd.texts[4]||'备注'}</b><textarea style="width:100%;border:1px solid #e0e0e0;border-radius:6px;padding:6px;font-size:11px;margin-top:4px;resize:none" rows="2" readonly>${pd.texts[5]||'如果没有找到您所在地区...'}</textarea></div>
      <div style="margin-top:12px"><b style="font-size:12px;color:${pd.toggles.text6_color||'#000'}">${pd.texts[6]||'注意事项'}</b><div style="font-size:10px;color:#666;margin-top:4px;line-height:1.6">${pd.texts[7]||'文化衫选款选码截止至...'}</div></div>
      <div style="margin-top:16px;text-align:center;padding:10px;background:${pd.toggles.text8_btnColorVal||'#333'};color:${pd.toggles.text8_color||'#fff'};border-radius:24px;font-size:13px">${pd.texts[8]||'提交本次选码结果'}</div>
    </div>`,
    6:()=>{
      const firstMaterial = npData.materials[0] || {name:'男款-白色',img:''};
      return `<div style="height:100%;background:linear-gradient(180deg,#4a7c28 0%,#c4a265 60%,#d4b980 100%);padding:12px;display:flex;flex-direction:column;overflow:hidden">
      <div style="font-weight:700;font-size:13px;color:${pd.toggles.text0_color||'#1565c0'}">${pd.texts[0]||'Step2：选择尺码'}</div>
      <div style="font-size:10px;color:${pd.toggles.text1_color||'#666'};margin-top:2px">${pd.texts[1]||'在5月30日18:00前，请务必核对填写信息并确认提交成功'}</div>
      <div style="background:#fff;border-radius:12px;margin-top:8px;padding:12px;flex:1;min-height:0;overflow-y:auto">
        <div style="display:flex;align-items:center;gap:8px;padding-bottom:10px;border-bottom:1px solid #f0f0f0">
          <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#4caf50,#2e7d32);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700">张</div>
          <div><div style="font-size:12px;font-weight:600">张三</div><div style="font-size:9px;color:#888">TEG-基础架构部</div></div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;background:#f8f9fa;border-radius:8px;margin-top:10px;padding:10px">
          <div style="width:50px;height:50px;border-radius:8px;background:#e8f5e9;display:flex;align-items:center;justify-content:center;${firstMaterial.img?`background:url(${firstMaterial.img}) center/contain no-repeat #fff`:''}"><span style="font-size:24px">${firstMaterial.img?'':'👕'}</span></div>
          <div><div style="font-size:12px;font-weight:600">${firstMaterial.name}</div><div style="font-size:10px;color:#888">尺码 | M</div></div>
        </div>
        <div style="margin-top:10px">
          <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f5f5f5"><div style="width:24px;height:24px;border-radius:6px;background:#e8f5e9;display:flex;align-items:center;justify-content:center;font-size:12px">👕</div><div><div style="font-size:9px;color:#999">选择款式</div><div style="font-size:11px;font-weight:600">${firstMaterial.name}</div></div></div>
          <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f5f5f5"><div style="width:24px;height:24px;border-radius:6px;background:#fff3e0;display:flex;align-items:center;justify-content:center;font-size:12px">📏</div><div><div style="font-size:9px;color:#999">选择尺码</div><div style="font-size:11px;font-weight:600">M</div></div></div>
          <div style="display:flex;align-items:center;gap:8px;padding:8px 0"><div style="width:24px;height:24px;border-radius:6px;background:#fce4ec;display:flex;align-items:center;justify-content:center;font-size:12px">📍</div><div><div style="font-size:9px;color:#999">送达地址</div><div style="font-size:11px;font-weight:600">深圳-金地威新</div></div></div>
        </div>
      </div>
      <div style="margin-top:8px;text-align:center;padding:10px;background:#333;color:#fff;border-radius:20px;font-size:12px;flex-shrink:0">${pd.texts[2]||'确认提交'}</div>
    </div>`;
    },
    7:()=>`<div style="height:100%;background:linear-gradient(180deg,#4a7c28 0%,#c4a265 60%,#d4b980 100%);display:flex;flex-direction:column;justify-content:center;align-items:center;padding:20px">
      <div style="background:#fff;border-radius:16px;padding:24px 20px;width:100%;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
        <div style="font-size:48px;margin-bottom:12px">🎉</div>
        <div style="font-size:18px;font-weight:700;color:#333">${pd.texts[0]||'Step3：选择地址'}</div>
        <div style="font-size:11px;color:#888;margin-top:8px;line-height:1.6">${pd.texts[1]||'您的选款信息已记录，可在"我的记录"中查看。如需修改请在截止时间前操作。'}</div>
        <div style="background:#f8f9fa;border-radius:10px;padding:14px;margin-top:16px;text-align:left">
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:11px"><span style="color:#999">款式</span><span style="color:#333;font-weight:600">男款-白色</span></div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:11px"><span style="color:#999">尺码</span><span style="color:#333;font-weight:600">M</span></div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:11px"><span style="color:#999">送达地址</span><span style="color:#333;font-weight:600">深圳-金地威新</span></div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:11px"><span style="color:#999">提交时间</span><span style="color:#333;font-weight:600">2026/3/26 14:14:52</span></div>
        </div>
        <div style="display:flex;gap:10px;margin-top:16px">
          <div style="flex:1;padding:10px;border:1px solid #ddd;border-radius:20px;font-size:11px;color:#333">重新选择</div>
          <div style="flex:1;padding:10px;background:#333;color:#fff;border-radius:20px;font-size:11px">查看记录</div>
        </div>
      </div>
    </div>`,
    8:()=>`<div style="height:100%;background:${pd.bgColor||'#1a237e'};display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;padding:24px;text-align:center">
      <div style="font-size:16px;font-weight:700;color:${pd.toggles.text0_color||'#ffffff'}">${pd.texts[0]||'选码结束通知'}</div>
      <div style="font-size:11px;margin-top:16px;line-height:1.8;color:${pd.toggles.text1_color||'#ffffff'}">${pd.texts[1]||'已超过最晚选择时间，系统根据去年选择的尺码，安排随机款式发放。新入职但未选码的，现场随机款式发放，尺码有可能无法满足，敬请谅解。'}</div>
      <div style="margin-top:24px;padding:10px 32px;background:${pd.toggles.text2_btnColorVal||'#4CAF50'};border-radius:24px;font-size:13px;color:${pd.toggles.text2_color||'#ffffff'}">${pd.texts[2]||'我知道了'}</div>
    </div>`,
    9:()=>`<div style="height:100%;background:${pd.bgImg?`url(${pd.bgImg}) center/cover`:'linear-gradient(135deg,#1a237e,#283593)'};display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;padding:24px;text-align:center">
      <div style="font-size:13px;line-height:1.8;color:${pd.toggles.text0_color||'#ffffff'}">${pd.texts[0]||'亲，你不在本次活动内<br>非常感谢您给予我们活动的关注与支持'}</div>
    </div>`
  };
  return (previewMap[pageIdx]||previewMap[0])();
}

// 页面配置渲染（根据页面索引）
function renderPageConfig(pageIdx){
  const pd = npData.pages[pageIdx];
  const pg = H5_PAGES[pageIdx];

  // 通用图片上传块
  const imgBlock=(id,label,hint,val,field)=>`
    <div class="np-config-section">
      <div class="np-config-title">${label}</div>
      <div class="np-img-upload" onclick="document.getElementById('${id}').click()">
        ${val?`<img src="${val}"><div class="del-btn" onclick="event.stopPropagation();npData.pages[${pageIdx}].${field}='';renderNewProject()">🗑</div>`:'<div style="font-size:20px;color:#ccc">🗑</div>'}
      </div>
      <input type="file" id="${id}" accept="image/*" style="display:none" onchange="npPageImgUpload(this,${pageIdx},'${field}')">
      <div class="np-img-hint">${hint}</div>
    </div>`;

  // 通用替换文字块
  const textBlock=(label,val,maxLen,field,showTextColor=false,showBtnColor=false)=>`
    <div class="np-field-row">
      <label class="np-field-label">替换文字</label>
      <input class="np-field-input" value="${val||''}" maxlength="${maxLen}" placeholder="${label}" oninput="npPageTextChange(${pageIdx},'${field}',this.value)">
      <span class="np-char-count">${(val||'').length}/${maxLen}</span>
      ${showTextColor?`<span style="font-size:12px">文本颜色</span> <input type="checkbox" class="np-checkbox" ${pd.toggles[field+'_textColor']?'checked':''} onchange="npData.pages[${pageIdx}].toggles['${field}_textColor']=this.checked;npSyncConfigToIframe()"> <input type="color" class="np-color-dot" value="${pd.toggles[field+'_color']||'#000000'}" onchange="npData.pages[${pageIdx}].toggles['${field}_color']=this.value;npSyncConfigToIframe()">`:''}
      ${showBtnColor?`<span style="font-size:12px">按钮颜色</span> <input type="checkbox" class="np-checkbox" ${pd.toggles[field+'_btnColor']?'checked':''} onchange="npData.pages[${pageIdx}].toggles['${field}_btnColor']=this.checked;npSyncConfigToIframe()"> <input type="color" class="np-color-dot" value="${pd.toggles[field+'_btnColorVal']||'#000000'}" onchange="npData.pages[${pageIdx}].toggles['${field}_btnColorVal']=this.value;npSyncConfigToIframe()">`:''}
    </div>`;

  // 音乐区块
  const musicBlock=()=>`
    <div class="np-music-section">
      <div class="np-music-row">
        <span style="font-size:14px;font-weight:600">音乐来源</span>
        <label class="np-music-radio"><input type="radio" name="np-music-${pageIdx}" value="library" ${pd.musicSource!=='local'?'checked':''} onchange="npData.pages[${pageIdx}].musicSource='library'"> 音乐库</label>
        <label class="np-music-radio"><input type="radio" name="np-music-${pageIdx}" value="local" ${pd.musicSource==='local'?'checked':''} onchange="npData.pages[${pageIdx}].musicSource='local'"> 本地音乐</label>
      </div>
      <div class="np-config-subtitle">选择音乐</div>
      <div class="np-music-list">
        ${['抽奖bgm','拾光胶囊','人平周年庆','答题bgm'].map(m=>`
          <div class="np-music-item">
            <label><input type="radio" name="np-music-choice-${pageIdx}" value="${m}" ${pd.musicChoice===m?'checked':''} onchange="npData.pages[${pageIdx}].musicChoice='${m}'"> ${m}</label>
            <div class="np-music-play" onclick="showMsg('播放${m}','i')">▶</div>
          </div>
        `).join('')}
      </div>
    </div>`;

  // 隐藏/显示toggle
  const toggleLine=(label,field)=>`<div class="np-field-row"><span style="font-size:14px;font-weight:600">${label}</span> <span style="font-size:12px;color:#999;margin-left:4px">隐藏</span> <div class="np-toggle ${pd.toggles[field]?'on':''}" onclick="npData.pages[${pageIdx}].toggles['${field}']=!npData.pages[${pageIdx}].toggles['${field}'];renderNewProject()"></div></div>`;

  // 按页面类型返回不同配置
  switch(pageIdx){
    case 0: // 首页 - 背景图片+loading配置+百分比文字颜色+logo/主题
      return `
        ${imgBlock('np-p1-bg','背景图片设置','尺寸：750*1544PX　格式：png/jpg 且不超过2M',pd.bgImg,'bgImg')}
        ${toggleLine('loading配置','loadingHide')}
        ${imgBlock('np-p1-loading','','尺寸：200*200PX　格式：gif/png/jpg 且不超过2M',pd.loadingImg,'loadingImg')}
        <div class="np-field-row"><span style="font-size:14px;font-weight:600">百分比文字颜色</span> <input type="color" class="np-color-dot" value="${pd.percentColor||'#ffffff'}" onchange="npData.pages[${pageIdx}].percentColor=this.value;npSyncConfigToIframe()"></div>
        ${toggleLine('logo/主题','logoHide')}
        ${imgBlock('np-p1-logo','','尺寸：190*100PX　格式：png/jpg 且不超过2M',pd.logoImg,'logoImg')}`;

    case 1: // 首页-2 - 替换背景图片+替换图片+替换文字+音乐
      return `
        ${imgBlock('np-p2-bg','替换背景图片','尺寸：750*1544PX　格式：png/jpg 且不超过2M',pd.bgImg,'bgImg')}
        ${toggleLine('替换图片','img1Hide')}
        ${imgBlock('np-p2-img1','','尺寸：415*240PX　格式：png/jpg 且不超过2M',pd.images[0]||'','images_0')}
        ${textBlock('替换文字',pd.texts[0]||'',16,'text0',true,true)}
        ${textBlock('替换文字',pd.texts[1]||'',10,'text1',true,true)}
        ${musicBlock()}`;

    case 2: // 温馨提示 - 替换背景图片+替换文字
      return `
        ${imgBlock('np-p3-bg','替换背景图片','尺寸：750*1544PX　格式：png/jpg 且不超过2M',pd.bgImg,'bgImg')}
        ${textBlock('替换文字',pd.texts[0]||'温馨提示',20,'text0',true,true)}
        <div class="np-field-row">
          <label class="np-field-label">替换文字</label>
          <textarea class="np-field-textarea" rows="3" maxlength="80" oninput="npPageTextChange(${pageIdx},'text1',this.value)">${pd.texts[1]||''}</textarea>
          <span class="np-char-count">${(pd.texts[1]||'').length}/80</span>
          <span style="font-size:12px">文本颜色</span> <input type="color" class="np-color-dot" value="${pd.toggles.text1_color||'#ffffff'}" onchange="npData.pages[${pageIdx}].toggles.text1_color=this.value;npSyncConfigToIframe()">
        </div>
        ${textBlock('我知道了',pd.texts[2]||'我知道了',10,'text2',true,true)}
        ${musicBlock()}`;

    case 3: // 选择款式 - 替换背景图片+标题配置+物料表格
      return `
        ${imgBlock('np-p6-bg','替换背景图片','尺寸：750*1544PX　格式：png/jpg 且不超过2M',pd.bgImg,'bgImg')}
        <div class="np-config-section">
          <div class="np-config-title">标题配置</div>
          <div class="np-field-row">
            <label class="np-field-label">主文案</label>
            <input class="np-field-input" value="${pd.texts[0]||'Step1：选择款式'}" maxlength="30" oninput="npPageTextChange(${pageIdx},'text0',this.value)">
            <span class="np-char-count">${(pd.texts[0]||'').length}/30</span>
            <span style="font-size:12px">文本颜色</span> <input type="color" class="np-color-dot" value="${pd.toggles.text0_color||'#000000'}" onchange="npData.pages[${pageIdx}].toggles.text0_color=this.value;npSyncConfigToIframe()">
            <div class="np-toggle ${pd.toggles.text0_toggle?'on':''}" onclick="npData.pages[${pageIdx}].toggles.text0_toggle=!npData.pages[${pageIdx}].toggles.text0_toggle;renderNewProject()"></div>
          </div>
          <div class="np-field-row">
            <label class="np-field-label">副文案</label>
            <textarea class="np-field-textarea" rows="2" maxlength="50" oninput="npPageTextChange(${pageIdx},'text1',this.value)">${pd.texts[1]||''}</textarea>
            <span class="np-char-count">${(pd.texts[1]||'').length}/50</span>
            <span style="font-size:12px">文本颜色</span> <input type="color" class="np-color-dot" value="${pd.toggles.text1_color||'#000000'}" onchange="npData.pages[${pageIdx}].toggles.text1_color=this.value;npSyncConfigToIframe()">
            <div class="np-toggle ${pd.toggles.text1_toggle?'on':''}" onclick="npData.pages[${pageIdx}].toggles.text1_toggle=!npData.pages[${pageIdx}].toggles.text1_toggle;renderNewProject()"></div>
          </div>
        </div>
        ${renderMaterialsTable()}`;

    case 4: // 选择尺码 - 隐藏页面+背景+标题+尺码导入
      return `
        <div class="np-field-row"><span style="font-size:14px;font-weight:600">隐藏页面</span> <div class="np-toggle ${pd.hidePage?'on':''}" onclick="npData.pages[${pageIdx}].hidePage=!npData.pages[${pageIdx}].hidePage;renderNewProject()"></div></div>
        <div style="font-size:11px;color:#999;margin-bottom:16px">如果打开隐藏按钮，表示本页面不在H5中呈现。</div>
        ${imgBlock('np-p7-bg','替换背景图片','尺寸：750*1544PX　格式：png/jpg 且不超过2M',pd.bgImg,'bgImg')}
        <div class="np-config-section">
          <div class="np-config-title">标题配置</div>
          <div class="np-field-row">
            <label class="np-field-label">主文案</label>
            <input class="np-field-input" value="${pd.texts[0]||'Step2：选择尺码'}" maxlength="30" oninput="npPageTextChange(${pageIdx},'text0',this.value)">
            <span class="np-char-count">${(pd.texts[0]||'').length}/30</span>
            <span style="font-size:12px">文本颜色</span> <input type="color" class="np-color-dot" value="${pd.toggles.text0_color||'#000000'}" onchange="npData.pages[${pageIdx}].toggles.text0_color=this.value;npSyncConfigToIframe()">
            <div class="np-toggle ${pd.toggles.text0_toggle?'on':''}" onclick="npData.pages[${pageIdx}].toggles.text0_toggle=!npData.pages[${pageIdx}].toggles.text0_toggle;renderNewProject()"></div>
          </div>
          <div class="np-field-row">
            <label class="np-field-label">副文案</label>
            <input class="np-field-input" value="${pd.texts[1]||''}" maxlength="50" oninput="npPageTextChange(${pageIdx},'text1',this.value)">
            <span class="np-char-count">${(pd.texts[1]||'').length}/50</span>
          </div>
          <div class="np-field-row"><span style="font-size:14px;font-weight:600">文本颜色</span> <input type="color" class="np-color-dot" value="${pd.toggles.sizeTextColor||'#000000'}" onchange="npData.pages[${pageIdx}].toggles.sizeTextColor=this.value;npSyncConfigToIframe()"></div>
        </div>
        <div class="np-config-section">
          <div class="np-config-title"><span class="req">*</span> 导入尺码 <span style="font-size:11px;color:#999;font-weight:400">ⓘ建议尺码库不超过10种</span></div>
          <div class="np-size-btns">
            <button class="np-size-btn np-size-btn-primary" onclick="showMsg('批量导入功能演示中','i')">📋 批量导入</button>
            <button class="np-size-btn" onclick="showMsg('下载模板功能演示中','i')">⬇ 下载模板</button>
          </div>
        </div>`;

    case 5: // 选择地址 - 主文案+副文案+替换文字+备注信息+注意事项配置+底部按钮
      return `
        <div class="np-config-section">
          <div class="np-field-row">
            <label class="np-field-label">主文案</label>
            <input class="np-field-input" value="${pd.texts[0]||'Step3：选择地址'}" maxlength="30" oninput="npPageTextChange(${pageIdx},'text0',this.value)">
            <span class="np-char-count">${(pd.texts[0]||'').length}/30</span>
            <span style="font-size:12px">文本颜色</span> <input type="color" class="np-color-dot" value="${pd.toggles.text0_color||'#000000'}" onchange="npData.pages[${pageIdx}].toggles.text0_color=this.value;npSyncConfigToIframe()">
          </div>
          <div class="np-field-row">
            <label class="np-field-label">副文案</label>
            <input class="np-field-input" value="${pd.texts[1]||''}" maxlength="30" oninput="npPageTextChange(${pageIdx},'text1',this.value)">
            <span class="np-char-count">${(pd.texts[1]||'').length}/30</span>
            <span style="font-size:12px">文本颜色</span> <input type="color" class="np-color-dot" value="${pd.toggles.text1_color||'#000000'}" onchange="npData.pages[${pageIdx}].toggles.text1_color=this.value;npSyncConfigToIframe()">
            <div class="np-toggle ${pd.toggles.text1_toggle?'on':''}" onclick="npData.pages[${pageIdx}].toggles.text1_toggle=!npData.pages[${pageIdx}].toggles.text1_toggle;renderNewProject()"></div>
          </div>
        </div>
        <div class="np-config-section">
          <div class="np-config-title">替换文字</div>
          <div class="np-field-row">
            <label class="np-field-label">替换文案</label>
            <input class="np-field-input" value="${pd.texts[2]||'办公地点'}" maxlength="5" oninput="npPageTextChange(${pageIdx},'text2',this.value)">
            <span class="np-char-count">${(pd.texts[2]||'').length}/5</span>
          </div>
          <div class="np-field-row">
            <label class="np-field-label">提示文案</label>
            <input class="np-field-input" value="${pd.texts[3]||'请勾选办公地点所在城市和大厦'}" maxlength="14" oninput="npPageTextChange(${pageIdx},'text3',this.value)">
            <span class="np-char-count">${(pd.texts[3]||'').length}/14</span>
          </div>
        </div>
        <div class="np-config-section">
          <div class="np-config-title">备注信息配置</div>
          <div class="np-field-row">
            <label class="np-field-label">替换文案</label>
            <input class="np-field-input" value="${pd.texts[4]||'备注'}" maxlength="10" oninput="npPageTextChange(${pageIdx},'text4',this.value)">
            <span class="np-char-count">${(pd.texts[4]||'').length}/10</span>
            <span style="font-size:12px">文本颜色</span> <input type="color" class="np-color-dot" value="${pd.toggles.text4_color||'#000000'}" onchange="npData.pages[${pageIdx}].toggles.text4_color=this.value;npSyncConfigToIframe()">
          </div>
          <div class="np-field-row">
            <label class="np-field-label">提示文案</label>
            <textarea class="np-field-textarea" rows="2" maxlength="50" oninput="npPageTextChange(${pageIdx},'text5',this.value)">${pd.texts[5]||'如果没有找到您所在的地区和办公大厦，请在备注栏手动输入，如：深圳 金地威新'}</textarea>
            <span class="np-char-count">${(pd.texts[5]||'').length}/50</span>
          </div>
        </div>
        <div class="np-config-section">
          <div class="np-config-title">注意事项配置 <div class="np-toggle ${pd.toggles.noticeHide?'on':''}" onclick="npData.pages[${pageIdx}].toggles.noticeHide=!npData.pages[${pageIdx}].toggles.noticeHide;renderNewProject()" style="display:inline-block;vertical-align:middle;margin-left:4px"></div></div>
          <div class="np-field-row">
            <label class="np-field-label">替换文案</label>
            <input class="np-field-input" value="${pd.texts[6]||'注意事项'}" maxlength="10" oninput="npPageTextChange(${pageIdx},'text6',this.value)">
            <span class="np-char-count">${(pd.texts[6]||'').length}/10</span>
            <span style="font-size:12px">文本颜色</span> <input type="color" class="np-color-dot" value="${pd.toggles.text6_color||'#000000'}" onchange="npData.pages[${pageIdx}].toggles.text6_color=this.value;npSyncConfigToIframe()">
          </div>
          <div class="np-field-row">
            <label class="np-field-label">提示文案</label>
            <textarea class="np-field-textarea" rows="2" maxlength="80" oninput="npPageTextChange(${pageIdx},'text7',this.value)">${pd.texts[7]||''}</textarea>
            <span class="np-char-count">${(pd.texts[7]||'').length}/80</span>
          </div>
        </div>
        <div class="np-config-section">
          <div class="np-field-row">
            <label class="np-field-label">替换文字</label>
            <input class="np-field-input" value="${pd.texts[8]||'提交本次选码结果'}" maxlength="10" oninput="npPageTextChange(${pageIdx},'text8',this.value)">
            <span class="np-char-count">${(pd.texts[8]||'').length}/10</span>
            <span style="font-size:12px">文本颜色</span> <input type="checkbox" class="np-checkbox" ${pd.toggles.text8_textColor?'checked':''} onchange="npData.pages[${pageIdx}].toggles.text8_textColor=this.checked;npSyncConfigToIframe()"> <input type="color" class="np-color-dot" value="${pd.toggles.text8_color||'#ffffff'}" onchange="npData.pages[${pageIdx}].toggles.text8_color=this.value;npSyncConfigToIframe()">
            <span style="font-size:12px">按钮颜色</span> <input type="checkbox" class="np-checkbox" ${pd.toggles.text8_btnColor?'checked':''} onchange="npData.pages[${pageIdx}].toggles.text8_btnColor=this.checked;npSyncConfigToIframe()"> <input type="color" class="np-color-dot" value="${pd.toggles.text8_btnColorVal||'#333333'}" onchange="npData.pages[${pageIdx}].toggles.text8_btnColorVal=this.value;npSyncConfigToIframe()">
          </div>
        </div>`;

    case 6: // 选款确认 - 标题配置+信息配置+替换文字按钮
      return `
        <div class="np-config-section">
          <div class="np-config-title">标题配置</div>
          <div class="np-field-row">
            <label class="np-field-label">主文案</label>
            <input class="np-field-input" value="${pd.texts[0]||'Step4：选款选码确认'}" maxlength="30" oninput="npPageTextChange(${pageIdx},'text0',this.value)">
            <span class="np-char-count">${(pd.texts[0]||'').length}/30</span>
            <span style="font-size:12px">文本颜色</span> <input type="checkbox" class="np-checkbox" ${pd.toggles.text0_textColor?'checked':''} onchange="npData.pages[${pageIdx}].toggles.text0_textColor=this.checked;npSyncConfigToIframe()"> <input type="color" class="np-color-dot" value="${pd.toggles.text0_color||'#000000'}" onchange="npData.pages[${pageIdx}].toggles.text0_color=this.value;npSyncConfigToIframe()">
          </div>
          <div class="np-field-row">
            <label class="np-field-label">副文案</label>
            <input class="np-field-input" value="${pd.texts[1]||''}" maxlength="50" oninput="npPageTextChange(${pageIdx},'text1',this.value)">
            <span class="np-char-count">${(pd.texts[1]||'').length}/50</span>
            <span style="font-size:12px">文本颜色</span> <input type="checkbox" class="np-checkbox" ${pd.toggles.text1_textColor?'checked':''} onchange="npData.pages[${pageIdx}].toggles.text1_textColor=this.checked;npSyncConfigToIframe()"> <input type="color" class="np-color-dot" value="${pd.toggles.text1_color||'#666666'}" onchange="npData.pages[${pageIdx}].toggles.text1_color=this.value;npSyncConfigToIframe()">
            <div class="np-toggle ${pd.toggles.text1_toggle?'on':''}" onclick="npData.pages[${pageIdx}].toggles.text1_toggle=!npData.pages[${pageIdx}].toggles.text1_toggle;renderNewProject()"></div>
          </div>
        </div>
        <div class="np-config-section">
          <div class="np-config-title">信息配置</div>
          <div class="np-field-row" style="align-items:flex-start">
            <label class="np-field-label">主题背景</label>
            <div>
              <div class="np-img-upload" onclick="document.getElementById('np-p9-bg').click()">
                ${pd.bgImg?`<img src="${pd.bgImg}"><div class="del-btn" onclick="event.stopPropagation();npData.pages[${pageIdx}].bgImg='';renderNewProject()">🗑</div>`:'<div style="font-size:20px;color:#ccc">🗑</div>'}
              </div>
              <input type="file" id="np-p9-bg" accept="image/*" style="display:none" onchange="npPageImgUpload(this,${pageIdx},'bgImg')">
              <div class="np-img-hint">尺寸：582*582PX　格式：png/jpg 且不超过2M</div>
            </div>
          </div>
          <div class="np-field-row"><span style="font-size:14px">线条颜色</span> <input type="color" class="np-color-dot" value="${pd.toggles.lineColor||'#eeeeee'}" onchange="npData.pages[${pageIdx}].toggles.lineColor=this.value;npSyncConfigToIframe()"></div>
          <div class="np-field-row"><span style="font-size:14px">尺寸背景色</span> <input type="color" class="np-color-dot" value="${pd.toggles.sizeBgColor||'#f5f5f5'}" onchange="npData.pages[${pageIdx}].toggles.sizeBgColor=this.value;npSyncConfigToIframe()"></div>
        </div>
        <div class="np-field-row">
          <label class="np-field-label">替换文字</label>
          <input class="np-field-input" value="${pd.texts[2]||'确定尺码'}" maxlength="4" oninput="npPageTextChange(${pageIdx},'text2',this.value)">
          <span class="np-char-count">${(pd.texts[2]||'').length}/4</span>
          <span style="font-size:12px">文本颜色</span> <input type="checkbox" class="np-checkbox" ${pd.toggles.text2_textColor?'checked':''} onchange="npData.pages[${pageIdx}].toggles.text2_textColor=this.checked;npSyncConfigToIframe()"> <input type="color" class="np-color-dot" value="${pd.toggles.text2_color||'#1565c0'}" onchange="npData.pages[${pageIdx}].toggles.text2_color=this.value;npSyncConfigToIframe()">
          <span style="font-size:12px">按钮颜色</span> <input type="checkbox" class="np-checkbox" ${pd.toggles.text2_btnColor?'checked':''} onchange="npData.pages[${pageIdx}].toggles.text2_btnColor=this.checked;npSyncConfigToIframe()"> <input type="color" class="np-color-dot" value="${pd.toggles.text2_btnColorVal||'#ffffff'}" onchange="npData.pages[${pageIdx}].toggles.text2_btnColorVal=this.value;npSyncConfigToIframe()">
        </div>
        <div class="np-field-row">
          <label class="np-field-label">替换文字</label>
          <input class="np-field-input" value="${pd.texts[3]||'生成分享图'}" maxlength="5" oninput="npPageTextChange(${pageIdx},'text3',this.value)">
          <span class="np-char-count">${(pd.texts[3]||'').length}/5</span>
        </div>`;

    case 7: // 分享页 - 主背景图片+替换图片+logo+替换文字
      return `
        ${imgBlock('np-p11-bg','替换主背景图片','尺寸：656*1166PX　格式：png/jpg 且不超过2M',pd.bgImg,'bgImg')}
        ${imgBlock('np-p11-img1','替换图片','尺寸：650*930PX　格式：png/jpg 且不超过2M',pd.images[0]||'','images_0')}
        ${imgBlock('np-p11-logo','替换logo','尺寸：130*130PX　格式：png/jpg 且不超过1M',pd.logoImg,'logoImg')}
        ${textBlock('#WE ARE TEG# 我是第',pd.texts[0]||'#WE ARE TEG# 我是第',20,'text0',false,false)}`;

    case 8: // 选码结束通知 - 背景色+文字
      return `
        <div class="np-field-row"><span style="font-size:14px;font-weight:600">替换背景色</span> <span style="font-size:12px;margin-left:8px">背景颜色</span> <input type="color" class="np-color-dot" value="${pd.bgColor||'#1a237e'}" onchange="npData.pages[${pageIdx}].bgColor=this.value;npSyncConfigToIframe()"></div>
        <div class="np-field-row">
          <label class="np-field-label">替换文字</label>
          <input class="np-field-input" value="${pd.texts[0]||'选码结束通知'}" maxlength="20" oninput="npPageTextChange(${pageIdx},'text0',this.value)">
          <span class="np-char-count">${(pd.texts[0]||'').length}/20</span>
          <span style="font-size:12px">文本颜色</span> <input type="checkbox" class="np-checkbox" ${pd.toggles.text0_textColor?'checked':''} onchange="npData.pages[${pageIdx}].toggles.text0_textColor=this.checked;npSyncConfigToIframe()"> <input type="color" class="np-color-dot" value="${pd.toggles.text0_color||'#ffffff'}" onchange="npData.pages[${pageIdx}].toggles.text0_color=this.value;npSyncConfigToIframe()">
        </div>
        <div class="np-field-row">
          <label class="np-field-label">替换文字</label>
          <textarea class="np-field-textarea" rows="3" maxlength="80" oninput="npPageTextChange(${pageIdx},'text1',this.value)">${pd.texts[1]||''}</textarea>
          <span class="np-char-count">${(pd.texts[1]||'').length}/80</span>
          <span style="font-size:12px">文本颜色</span> <input type="checkbox" class="np-checkbox" ${pd.toggles.text1_textColor?'checked':''} onchange="npData.pages[${pageIdx}].toggles.text1_textColor=this.checked;npSyncConfigToIframe()"> <input type="color" class="np-color-dot" value="${pd.toggles.text1_color||'#ffffff'}" onchange="npData.pages[${pageIdx}].toggles.text1_color=this.value;npSyncConfigToIframe()">
        </div>
        <div class="np-field-row">
          <label class="np-field-label">替换文字</label>
          <input class="np-field-input" value="${pd.texts[2]||'我知道了'}" maxlength="6" oninput="npPageTextChange(${pageIdx},'text2',this.value)">
          <span class="np-char-count">${(pd.texts[2]||'').length}/6</span>
          <span style="font-size:12px">文本颜色</span> <input type="checkbox" class="np-checkbox" ${pd.toggles.text2_textColor?'checked':''} onchange="npData.pages[${pageIdx}].toggles.text2_textColor=this.checked;npSyncConfigToIframe()"> <input type="color" class="np-color-dot" value="${pd.toggles.text2_color||'#ffffff'}" onchange="npData.pages[${pageIdx}].toggles.text2_color=this.value;npSyncConfigToIframe()">
          <span style="font-size:12px">按钮颜色</span> <input type="checkbox" class="np-checkbox" ${pd.toggles.text2_btnColor?'checked':''} onchange="npData.pages[${pageIdx}].toggles.text2_btnColor=this.checked;npSyncConfigToIframe()"> <input type="color" class="np-color-dot" value="${pd.toggles.text2_btnColorVal||'#4CAF50'}" onchange="npData.pages[${pageIdx}].toggles.text2_btnColorVal=this.value;npSyncConfigToIframe()">
        </div>
        ${musicBlock()}`;

    case 9: // 访问权限 - 访问权限开关+背景图+文字+音乐
      return `
        <div class="np-field-row"><span style="font-size:14px;font-weight:600">访问权限</span> <div class="np-toggle ${pd.accessControl?'on':''}" onclick="npData.pages[${pageIdx}].accessControl=!npData.pages[${pageIdx}].accessControl;renderNewProject()"></div></div>
        <div style="font-size:11px;color:#999;margin-bottom:16px;line-height:1.6">开启后，只有您导入的名单成员才有权限访问该H5；<br>关闭则默认为全员开放，关闭时本页内容不用编辑。</div>
        ${imgBlock('np-p13-bg','替换背景图','尺寸：750*1544PX　格式：png/jpg 且不超过2M',pd.bgImg,'bgImg')}
        <div class="np-field-row" style="align-items:flex-start">
          <label class="np-field-label">替换文字</label>
          <div style="flex:1">
            <textarea class="np-field-textarea" rows="3" maxlength="120" oninput="npPageTextChange(${pageIdx},'text0',this.value)" placeholder="亲，你不在本次活动内&#10;非常感谢您给予我们活动的关注与支持">${pd.texts[0]||'亲，你不在本次活动内\n非常感谢您给予我们活动的关注与支持'}</textarea>
            <span class="np-char-count">${(pd.texts[0]||'').length}/120</span>
          </div>
          <span style="font-size:12px;margin-left:8px">文字颜色</span> <input type="checkbox" class="np-checkbox" ${pd.toggles.text0_textColor?'checked':''} onchange="npData.pages[${pageIdx}].toggles.text0_textColor=this.checked;npSyncConfigToIframe()"> <input type="color" class="np-color-dot" value="${pd.toggles.text0_color||'#ffffff'}" onchange="npData.pages[${pageIdx}].toggles.text0_color=this.value;npSyncConfigToIframe()">
        </div>
        ${musicBlock()}`;

    default:
      return `<div style="padding:40px;text-align:center;color:#999">页面配置加载中...</div>`;
  }
}

// 物料表格
function renderMaterialsTable(){
  let rows = npData.materials.map((m,i)=>`<tr>
    <td>
      <div class="np-material-img" onclick="document.getElementById('np-mat-img-${i}').click()">
        ${m.img?`<img src="${m.img}"><div class="del-btn" onclick="event.stopPropagation();npData.materials[${i}].img='';renderNewProject()">🗑</div>`:'<div style="font-size:14px;color:#ccc">🗑</div>'}
      </div>
      <input type="file" id="np-mat-img-${i}" accept="image/*" style="display:none" onchange="npMatImgUpload(this,${i},'img')">
    </td>
    <td><input class="np-field-input" style="max-width:120px" value="${m.name}" oninput="npData.materials[${i}].name=this.value;npSyncConfigToIframe()" maxlength="20"><span class="np-char-count">${m.name.length}/20</span></td>
    <td>
      <input class="np-field-input" style="max-width:100px" value="${m.btnText}" oninput="npData.materials[${i}].btnText=this.value;npSyncConfigToIframe()" maxlength="8"><span class="np-char-count">${m.btnText.length}/8</span>
      <div style="margin-top:4px;display:flex;align-items:center;gap:4px"><span style="font-size:11px">文本颜色</span><input type="checkbox" class="np-checkbox" ${m.btnTextColor?'checked':''} onchange="npData.materials[${i}].btnTextColor=this.checked;npSyncConfigToIframe()"> <span style="font-size:11px">文本颜色</span></div>
    </td>
    <td>
      <div class="np-material-img" onclick="document.getElementById('np-mat-detail-${i}').click()">
        ${m.detailImg?`<img src="${m.detailImg}"><div class="del-btn" onclick="event.stopPropagation();npData.materials[${i}].detailImg='';renderNewProject()">🗑</div>`:'<div style="font-size:14px;color:#ccc">🗑</div>'}
      </div>
      <input type="file" id="np-mat-detail-${i}" accept="image/*" style="display:none" onchange="npMatImgUpload(this,${i},'detailImg')">
    </td>
    <td>
      <button class="btn btn-primary" style="padding:4px 10px;font-size:11px" onclick="npAddMaterial(${i+1})">➕ 添加</button>
      <button class="btn btn-outline" style="padding:4px 10px;font-size:11px;color:#ff5252;border-color:#ff5252" onclick="npRemoveMaterial(${i})">删除</button>
    </td>
  </tr>`).join('');

  return `<div class="np-config-section">
    <table class="np-material-table">
      <thead><tr><th>物料图片</th><th>物料名称</th><th>按钮配置</th><th>详情图片</th><th>操作<span style="font-size:10px;color:#999">(最多添加个物料)</span></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="np-img-hint" style="margin-top:8px">物料图片尺寸：600x600px（或者宽高1:1比例）　格式：png/jpg且不超过2MB</div>
  </div>`;
}

// ===== 第三步：配置数据 =====
function renderNpStep3(){
  return `<div style="max-width:700px">
    <div class="np-config-section">
      <div class="np-config-title">活动配置</div>
      <div class="np-field-row">
        <label class="np-field-label"><span class="req">*</span> 活动开始时间</label>
        <input class="np-field-input" type="datetime-local" id="np-cfg-start" value="${npData.configData.startTime||''}" onchange="npData.configData.startTime=this.value">
      </div>
      <div class="np-field-row">
        <label class="np-field-label"><span class="req">*</span> 活动截止时间</label>
        <input class="np-field-input" type="datetime-local" id="np-cfg-end" value="${npData.configData.endTime||''}" onchange="npData.configData.endTime=this.value">
      </div>
    </div>
    <div class="np-config-section">
      <div class="np-config-title">权限设置</div>
      <p style="font-size:13px;color:#888;margin-bottom:8px">（手动添加企业微信名）</p>
      <div class="perm-list" id="np-perm-list">${npPermUsers.length===0?'<div style="text-align:center;color:#999;padding:30px">暂无权限用户</div>':npPermUsers.map((u,i)=>`<div class="perm-item"><span class="perm-name">${u}</span><button class="perm-remove" onclick="npRemovePerm(${i})">移除</button></div>`).join('')}</div>
      <div class="perm-add-row" style="margin-top:12px">
        <input class="perm-add-input" id="np-perm-input" placeholder="输入企业微信名">
        <button class="btn btn-primary" onclick="npAddPerm()">添加</button>
      </div>
    </div>
    <div class="np-config-section">
      <div class="np-config-title">数据导入</div>
      <div class="np-field-row">
        <label class="np-field-label">地址数据</label>
        <button class="np-size-btn np-size-btn-primary" onclick="showMsg('批量导入地址功能演示中','i')">📋 批量导入</button>
        <button class="np-size-btn" onclick="showMsg('下载地址模板功能演示中','i')">⬇ 下载模板</button>
      </div>
      <div class="np-field-row">
        <label class="np-field-label">白名单数据</label>
        <button class="np-size-btn np-size-btn-primary" onclick="showMsg('批量导入白名单功能演示中','i')">📋 批量导入</button>
        <button class="np-size-btn" onclick="showMsg('下载白名单模板功能演示中','i')">⬇ 下载模板</button>
      </div>
    </div>
  </div>`;
}

// ===== 辅助函数 =====
function npPageImgUpload(input,pageIdx,field){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    if(field.startsWith('images_')){
      const arrIdx=parseInt(field.split('_')[1]);
      if(!npData.pages[pageIdx].images) npData.pages[pageIdx].images=[];
      npData.pages[pageIdx].images[arrIdx]=e.target.result;
    }else{
      npData.pages[pageIdx][field]=e.target.result;
    }
    renderNewProject();
    // 同步配置到iframe实时预览
    npSyncConfigToIframe();
  };
  reader.readAsDataURL(file);
}

function npPageTextChange(pageIdx,field,value){
  if(field.startsWith('text')){
    const idx=parseInt(field.replace('text',''));
    if(!npData.pages[pageIdx].texts) npData.pages[pageIdx].texts=[];
    npData.pages[pageIdx].texts[idx]=value;
  }
  // 通知iframe同步更新配置数据
  npSyncConfigToIframe();
}

// 同步配置数据到iframe（用于实时预览）
function npSyncConfigToIframe(){
  npSendToIframe('updateConfig', npCurPage, {
    h5Title: npData.h5Title,
    h5Subtitle: npData.h5Subtitle,
    pages: npData.pages,
    materials: npData.materials
  });
}

function npMatImgUpload(input,matIdx,field){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{npData.materials[matIdx][field]=e.target.result;renderNewProject();npSyncConfigToIframe();};
  reader.readAsDataURL(file);
}

function npAddMaterial(afterIdx){
  npData.materials.splice(afterIdx,0,{img:'',name:'新物料',btnText:'查看详情',btnTextColor:true,btnColor:'#000',detailImg:''});
  renderNewProject();
}

function npRemoveMaterial(idx){
  if(npData.materials.length<=1){showMsg('至少保留一个物料','e');return;}
  npData.materials.splice(idx,1);
  renderNewProject();
}

function npGoStep(step){
  if(step>npStep && npStep===1){
    // 验证第一步
    if(!npData.h5Title){showMsg('请输入H5主标题','e');return;}
    if(!npData.h5Subtitle){showMsg('请输入H5副标题','e');return;}
  }
  npStep=step;
  renderNewProject();
}

function npNextStep(){
  if(npStep===1){
    if(!npData.h5Title){showMsg('请输入H5主标题','e');return;}
    if(!npData.h5Subtitle){showMsg('请输入H5副标题','e');return;}
  }
  npStep=Math.min(3,npStep+1);
  renderNewProject();
}

function npPrevStep(){
  npStep=Math.max(1,npStep-1);
  renderNewProject();
}

function npPreviewH5(){
  // 生成预览H5的URL
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');
  const previewUrl = baseUrl + 'index.html';
  
  // 显示二维码弹窗
  const modal = g('modal-preview-qr');
  if(modal){
    // 更新二维码内容
    generateQRCode(previewUrl);
    g('preview-qr-url').textContent = previewUrl;
    g('preview-qr-url').href = previewUrl;
    
    // 检测是否为本地文件，显示提示
    const localTip = g('preview-qr-local-tip');
    if(localTip){
      if(previewUrl.startsWith('file://') || window.location.protocol === 'file:'){
        localTip.style.display = 'block';
      }else{
        localTip.style.display = 'none';
      }
    }
    
    modal.classList.add('show');
  }
}

// 生成二维码（使用qrcode.js库生成真正可扫描的二维码）
function generateQRCode(url){
  const container = g('preview-qr-container');
  if(!container) return;
  
  // 清空容器
  container.innerHTML = '';
  
  // 使用qrcode.js生成二维码
  if(typeof QRCode !== 'undefined'){
    QRCode.toCanvas(url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    }, function(error, canvas){
      if(error){
        console.error('QR Code generation error:', error);
        container.innerHTML = '<div style="color:#999;font-size:12px">二维码生成失败</div>';
        return;
      }
      canvas.style.display = 'block';
      container.appendChild(canvas);
    });
  }else{
    // fallback：如果qrcode.js未加载，显示提示
    container.innerHTML = '<div style="color:#999;font-size:12px;padding:20px">二维码库加载中...<br>请稍后重试</div>';
  }
}

// 复制预览链接
function copyPreviewUrl(){
  const url = g('preview-qr-url').textContent;
  if(navigator.clipboard){
    navigator.clipboard.writeText(url).then(()=>showMsg('链接已复制到剪贴板','s')).catch(()=>showMsg('复制失败','e'));
  }else{
    // fallback
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showMsg('链接已复制到剪贴板','s');
  }
}

// 下载二维码图片
function downloadQRCode(){
  const container = g('preview-qr-container');
  const canvas = container ? container.querySelector('canvas') : null;
  if(!canvas){
    showMsg('二维码尚未生成','e');
    return;
  }
  const link = document.createElement('a');
  link.download = '文化衫H5预览二维码.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  showMsg('二维码已下载','s');
}

// ===== 返回项目列表 =====
function npBackToList(){
  editingProjId='';
  curMenu='projMgr';
  document.querySelectorAll('.menu-item').forEach(m=>m.classList.toggle('active',m.dataset.p==='projMgr'));
  render();
}

// ===== 查看/编辑已有项目 =====
function openViewProject(projId){
  const projs=ls(SK.proj);
  const p=projs.find(x=>x.id===projId);
  if(!p){showMsg('项目不存在','e');return;}

  editingProjId=projId;
  npStep=2; // 直接进入制作H5步骤
  npPermUsers=p.permUsers||[];

  // 如果项目有h5Data，加载它
  if(p.h5Data){
    npData=JSON.parse(JSON.stringify(p.h5Data));
    // 确保pages数组完整
    while(npData.pages.length<13){
      npData.pages.push({
        bgImg:'', bgColor:'#000000',
        loadingImg:'', loadingHide:false,
        logoImg:'', logoHide:true,
        percentColor:'#ffffff',
        texts:[], images:[], toggles:{},
        musicSource:'library', musicChoice:'',
        accessControl:false,
        hidePage:false
      });
    }
    if(!npData.materials||npData.materials.length===0){
      npData.materials=[
        {img:'',name:'男款-军绿色',btnText:'查看详情',btnTextColor:true,btnColor:'#000',detailImg:''},
        {img:'',name:'男款-卡其色',btnText:'查看详情',btnTextColor:true,btnColor:'#000',detailImg:''},
        {img:'',name:'女款-棕色',btnText:'查看详情',btnTextColor:true,btnColor:'#000',detailImg:''},
        {img:'',name:'女款-浅卡其色',btnText:'查看详情',btnTextColor:true,btnColor:'#000',detailImg:''}
      ];
    }
    if(!npData.configData) npData.configData={};
  }else{
    // 没有h5Data，用项目标题初始化
    initNpData();
    npData.h5Title=p.title||'';
    npData.h5Subtitle=p.desc||'';
    if(p.start) npData.configData.startTime=p.start.slice(0,16);
    if(p.deadline) npData.configData.endTime=p.deadline.slice(0,16);
  }

  npCurPage=0;
  curMenu='newProj';
  document.querySelectorAll('.menu-item').forEach(m=>m.classList.remove('active'));
  renderNewProject();
}

function npSaveProject(){
  if(!npData.h5Title){showMsg('请输入H5主标题','e');return;}

  const projs=ls(SK.proj);

  if(editingProjId){
    // 编辑模式：更新已有项目
    const idx=projs.findIndex(x=>x.id===editingProjId);
    if(idx===-1){showMsg('项目不存在','e');return;}

    projs[idx].title=npData.h5Title;
    projs[idx].desc=npData.h5Subtitle;
    projs[idx].start=npData.configData.startTime?npData.configData.startTime+':00':projs[idx].start;
    projs[idx].deadline=npData.configData.endTime?npData.configData.endTime+':00':projs[idx].deadline;
    projs[idx].h5Data=JSON.parse(JSON.stringify(npData));
    projs[idx].permUsers=npPermUsers;

    ls(SK.proj,projs);
    addLog('project','更新项目：'+npData.h5Title);
    // 显示保存成功弹窗，不退出界面
    g('modal-save-success').classList.add('show');
  }else{
    // 新建模式
    const newId='proj_'+Date.now();
    const newProjId='T'+String(projs.length+1).padStart(2,'0');
    const now=new Date();

    projs.push({
      id:newId,
      projId:newProjId,
      title:npData.h5Title,
      desc:npData.h5Subtitle,
      quantity:0,
      start:npData.configData.startTime?npData.configData.startTime+':00':now.toISOString(),
      deadline:npData.configData.endTime?npData.configData.endTime+':00':'',
      season:'',
      status:'active',
      createdAt:now.toISOString(),
      type:'bg',
      h5Data:JSON.parse(JSON.stringify(npData)),
      permUsers:npPermUsers
    });
    ls(SK.proj,projs);
    addLog('project','新建项目：'+npData.h5Title);
    // 新建成功后，切换到编辑模式，便于继续编辑
    editingProjId=newId;
    // 显示保存成功弹窗，不退出界面
    g('modal-save-success').classList.add('show');
  }
}

// 新建项目-权限用户管理
function npAddPerm(){
  const input=g('np-perm-input');
  const name=input.value.trim();
  if(!name){showMsg('请输入企业微信名','e');return;}
  if(npPermUsers.includes(name)){showMsg('该用户已存在','e');return;}
  npPermUsers.push(name);
  input.value='';
  renderNewProject();
  showMsg('已添加','s');
}

function npRemovePerm(idx){
  npPermUsers.splice(idx,1);
  renderNewProject();
  showMsg('已移除','s');
}

// ========== 1.1.1 项目设置 ==========
function openEditProj(projId){
  editProjId=projId;
  const projs=ls(SK.proj);
  const p=projs.find(x=>x.id===projId);
  if(!p){showMsg('项目不存在','e');return;}

  setTimeout(()=>{
    if(g('ep-title')) g('ep-title').value=p.title||'';
    if(g('ep-quantity')) g('ep-quantity').value=p.quantity||'';
    if(g('ep-start')) g('ep-start').value=p.start?p.start.slice(0,16):'';
    if(g('ep-deadline')) g('ep-deadline').value=p.deadline?p.deadline.slice(0,16):'';
    if(g('ep-status')) g('ep-status').value=p.status||'active';
  },50);
  g('modal-edit-proj').classList.add('show');
}

function saveEditProj(){
  const projs=ls(SK.proj);
  const idx=projs.findIndex(x=>x.id===editProjId);
  if(idx===-1){showMsg('项目不存在','e');return;}

  const title=g('ep-title').value.trim();
  if(!title){showMsg('请输入项目名称','e');return;}

  projs[idx].title=title;
  projs[idx].quantity=parseInt(g('ep-quantity').value)||0;
  projs[idx].start=g('ep-start').value?g('ep-start').value+':00':'';
  projs[idx].deadline=g('ep-deadline').value?g('ep-deadline').value+':00':'';
  projs[idx].status=g('ep-status').value;

  ls(SK.proj,projs);
  addLog('project','修改项目设置：'+title);
  closeM('modal-edit-proj');
  showMsg('项目设置已保存','s');
  render();
}

// ========== 1.1.2 权限设置 ==========
function openProjPerm(projId){
  editProjPermId=projId;
  const projs=ls(SK.proj);
  const p=projs.find(x=>x.id===projId);
  if(!p){showMsg('项目不存在','e');return;}

  g('proj-perm-title').textContent=p.title+' - 权限设置';
  const users=p.permUsers||[];
  renderProjPermList(users);
  if(g('proj-perm-add-input')) g('proj-perm-add-input').value='';
  g('modal-proj-perm').classList.add('show');
}

function renderProjPermList(users){
  const body=g('proj-perm-list-body');
  if(!body)return;
  if(!users||users.length===0){
    body.innerHTML='<div style="text-align:center;color:#999;padding:40px">暂无权限用户</div>';
    return;
  }
  body.innerHTML=users.map((u,i)=>`
    <div class="perm-item">
      <span class="perm-name">${u}</span>
      <button class="perm-remove" onclick="removeProjPermUser(${i})">移除</button>
    </div>
  `).join('');
}

function addProjPermUser(){
  const input=g('proj-perm-add-input');
  const name=input.value.trim();
  if(!name){showMsg('请输入企业微信名','e');return;}

  const projs=ls(SK.proj);
  const p=projs.find(x=>x.id===editProjPermId);
  if(!p)return;
  if(!p.permUsers) p.permUsers=[];
  if(p.permUsers.includes(name)){showMsg('该用户已存在','e');return;}

  p.permUsers.push(name);
  ls(SK.proj,projs);
  renderProjPermList(p.permUsers);
  input.value='';
  showMsg('已添加','s');
}

function removeProjPermUser(idx){
  const projs=ls(SK.proj);
  const p=projs.find(x=>x.id===editProjPermId);
  if(!p||!p.permUsers)return;
  p.permUsers.splice(idx,1);
  ls(SK.proj,projs);
  renderProjPermList(p.permUsers);
  showMsg('已移除','s');
}

function saveProjPerm(){
  addLog('perm','更新项目权限设置');
  closeM('modal-proj-perm');
  showMsg('权限已保存','s');
}

// ========== 1.1.3 删除项目 ==========
function openDeleteProj(projId){
  deleteProjId=projId;
  const projs=ls(SK.proj);
  const p=projs.find(x=>x.id===projId);
  const name=p?p.title:'未知项目';
  g('delete-confirm-text').textContent='是否确认删除 '+name+' ？';
  g('modal-delete-confirm').classList.add('show');
}

function confirmDeleteProj(){
  const projs=ls(SK.proj);
  const idx=projs.findIndex(x=>x.id===deleteProjId);
  if(idx===-1){showMsg('项目不存在','e');closeM('modal-delete-confirm');return;}

  const title=projs[idx].title;
  projs.splice(idx,1);
  ls(SK.proj,projs);
  addLog('project','删除项目：'+title);
  closeM('modal-delete-confirm');
  showMsg('项目已删除','s');
  render();
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

// ===============================================================
// ========== 用户管理与角色管理模块 ==========
// ===============================================================
const SK_USERS = 'teg_sys_users';
const SK_ROLES = 'teg_sys_roles';

// 用户管理状态
let umTab = 'user'; // user | role
let umPage = 1;
let umRolePage = 1;
let editingUserId = null;
let editingRoleId = null;
let currentPermRoleId = null;
let userAvatarData = '';

// 初始化用户和角色数据
function initUserRoleData(){
  if(!localStorage.getItem(SK_USERS)){
    const defaultUsers = [
      {id:'u1',avatar:'',name:'v_cxxche',username:'v_cxxche',phone:'13518611360',email:'cxxche@tencent.com',role:'管理员',status:true,lastLogin:'2026-03-25 15:37:29',createdAt:'2026-03-20 16:30:15'},
      {id:'u2',avatar:'',name:'vickyfan',username:'vickyfan',phone:'13518611360',email:'vickyfan@tencent.com',role:'管理员',status:true,lastLogin:'2025-11-02 22:02:09',createdAt:'2025-10-13 15:29:47'},
      {id:'u3',avatar:'',name:'v_qqqluo',username:'v_qqqluo',phone:'13644507301',email:'qqqluo@tencent.com',role:'管理员',status:true,lastLogin:'2025-11-10 18:45:11',createdAt:'2025-08-21 17:06:00'},
      {id:'u4',avatar:'',name:'v_bttzzou',username:'v_bttzzou',phone:'13518611360',email:'bttzzou@tencent.com',role:'管理员',status:true,lastLogin:'2025-03-10 15:44:51',createdAt:'2024-09-03 15:22:28'},
      {id:'u5',avatar:'',name:'evelynqu',username:'evelynqu',phone:'13518611360',email:'evelynqu@tencent.com',role:'管理员',status:true,lastLogin:'2025-10-04 16:21:41',createdAt:'2024-09-02 10:43:56'}
    ];
    ls(SK_USERS, defaultUsers);
  }
  if(!localStorage.getItem(SK_ROLES)){
    const defaultRoles = [
      {id:'r1',name:'普通用户',type:'admin',desc:'普通管理员',status:true,createdAt:'2022-06-17 18:06:19',permissions:['admin']},
      {id:'r2',name:'管理员',type:'admin',desc:'管理员',status:true,createdAt:'2022-03-24 17:15:25',permissions:['projMgr','admin','dept','receiver']},
      {id:'r3',name:'超级管理员',type:'superadmin',desc:'超级管理员，可授予其他管理员权限',status:true,createdAt:'2022-01-01 10:00:00',permissions:['projMgr','admin','dept','receiver']}
    ];
    ls(SK_ROLES, defaultRoles);
  }
}
initUserRoleData();

// 渲染用户管理页面
function renderUserMgr(c){
  // 取消侧边栏选中
  document.querySelectorAll('.menu-item').forEach(m=>m.classList.remove('active'));
  
  c.innerHTML=`
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
    <button class="btn btn-outline" onclick="goMenu('admin')" style="padding:6px 14px;font-size:12px">← 返回</button>
    <div class="page-title" style="margin-bottom:0;color:var(--teal)">${umTab==='user'?'用户管理':'角色管理'}</div>
  </div>
  
  <div class="um-tabs">
    <button class="um-tab ${umTab==='user'?'active':''}" onclick="switchUmTab('user')">用户管理</button>
    <button class="um-tab ${umTab==='role'?'active':''}" onclick="switchUmTab('role')">角色管理</button>
  </div>
  
  ${umTab==='user' ? renderUserList() : renderRoleList()}
  `;
}

function switchUmTab(tab){
  umTab = tab;
  umPage = 1;
  umRolePage = 1;
  render();
}

// 渲染用户列表
function renderUserList(){
  const users = ls(SK_USERS) || [];
  const start = (umPage-1)*PAGE_SIZE;
  const pageUsers = users.slice(start, start+PAGE_SIZE);
  
  return `
  <div class="card">
    <div class="card-hd">
      <div class="filter-bar" style="margin-bottom:0;flex:1">
        <div class="filter-item">
          <span class="filter-label">用户名</span>
          <input class="filter-input" id="um-f-username" placeholder="请输入用户名" style="min-width:140px">
        </div>
        <div class="filter-item">
          <span class="filter-label">姓名</span>
          <input class="filter-input" id="um-f-name" placeholder="请输入姓名" style="min-width:140px">
        </div>
        <div class="filter-item">
          <span class="filter-label">状态</span>
          <select class="filter-select" id="um-f-status" style="min-width:100px">
            <option value="">请选择</option>
            <option value="true">启用</option>
            <option value="false">禁用</option>
          </select>
        </div>
        <div class="filter-item">
          <span class="filter-label">时间</span>
          <input class="filter-input" type="date" id="um-f-start" style="min-width:120px">
          <span style="color:#999">至</span>
          <input class="filter-input" type="date" id="um-f-end" style="min-width:120px">
        </div>
        <button class="btn btn-primary" onclick="filterUsers()">筛选</button>
        <button class="btn btn-outline" onclick="resetUserFilter()">重置</button>
      </div>
    </div>
    <div class="card-bd">
      <button class="btn btn-primary" onclick="openUserEdit()" style="margin-bottom:16px">新建</button>
      <table class="dtable">
        <thead><tr>
          <th>序号</th>
          <th>姓名</th>
          <th>用户名</th>
          <th>联系方式</th>
          <th>角色名称</th>
          <th>状态</th>
          <th>最近登录时间</th>
          <th>创建时间</th>
          <th>操作</th>
        </tr></thead>
        <tbody>
          ${pageUsers.map((u,i)=>`<tr>
            <td>${start+i+1}</td>
            <td>${u.name}</td>
            <td>${u.username}</td>
            <td>${u.phone||'-'}</td>
            <td>${u.role}</td>
            <td><div class="um-toggle ${u.status?'on':''}" onclick="toggleUserStatus('${u.id}')"></div></td>
            <td>${u.lastLogin||'-'}</td>
            <td>${u.createdAt||'-'}</td>
            <td>
              <button class="action-link" onclick="resetUserPwd('${u.id}')">重置密码</button>
              <button class="action-link action-link-green" onclick="openUserEdit('${u.id}')">编辑</button>
              <button class="action-link action-link-red" onclick="deleteUser('${u.id}')">删除</button>
            </td>
          </tr>`).join('')||'<tr><td colspan="9" style="text-align:center;color:#999;padding:40px">暂无数据</td></tr>'}
        </tbody>
      </table>
      ${renderPagination(users.length, umPage, 'goUmPage')}
    </div>
  </div>
  `;
}

// 渲染角色列表
function renderRoleList(){
  const roles = ls(SK_ROLES) || [];
  const start = (umRolePage-1)*PAGE_SIZE;
  const pageRoles = roles.slice(start, start+PAGE_SIZE);
  const currentUserIsSuperAdmin = checkIsSuperAdmin();
  
  return `
  <div class="card">
    <div class="card-hd">
      <div class="filter-bar" style="margin-bottom:0;flex:1">
        <div class="filter-item">
          <span class="filter-label">角色</span>
          <input class="filter-input" id="um-f-role" placeholder="请输入角色" style="min-width:180px">
        </div>
        <div class="filter-item">
          <span class="filter-label">角色类型</span>
          <select class="filter-select" id="um-f-role-type" style="min-width:120px">
            <option value="">请选择类型</option>
            <option value="admin">管理员</option>
            <option value="superadmin">超级管理员</option>
          </select>
        </div>
        <div class="filter-item">
          <span class="filter-label">状态</span>
          <select class="filter-select" id="um-f-role-status" style="min-width:120px">
            <option value="">请选择状态</option>
            <option value="true">启用</option>
            <option value="false">禁用</option>
          </select>
        </div>
        <button class="btn btn-primary" onclick="filterRoles()">筛选</button>
        <button class="btn btn-outline" onclick="resetRoleFilter()">重置</button>
      </div>
    </div>
    <div class="card-bd">
      <button class="btn btn-primary" onclick="openRoleEdit()" style="margin-bottom:16px">新建</button>
      <table class="dtable">
        <thead><tr>
          <th>角色名称</th>
          <th>角色类型</th>
          <th>角色描述</th>
          <th>状态</th>
          <th>创建时间</th>
          <th>操作</th>
        </tr></thead>
        <tbody>
          ${pageRoles.map(r=>`<tr>
            <td>${r.name}</td>
            <td><span class="tag ${r.type==='superadmin'?'tag-orange':'tag-blue'}">${r.type==='superadmin'?'超级管理员':'管理员'}</span></td>
            <td>${r.desc||'-'}</td>
            <td><div class="um-toggle ${r.status?'on':''}" onclick="toggleRoleStatus('${r.id}')"></div></td>
            <td>${r.createdAt||'-'}</td>
            <td>
              ${currentUserIsSuperAdmin ? `<button class="action-link" onclick="openRolePerm('${r.id}')">权限管理</button>` : ''}
              <button class="action-link action-link-green" onclick="openRoleEdit('${r.id}')">编辑</button>
            </td>
          </tr>`).join('')||'<tr><td colspan="6" style="text-align:center;color:#999;padding:40px">暂无数据</td></tr>'}
        </tbody>
      </table>
      <div style="display:flex;justify-content:flex-end;margin-top:16px;align-items:center;gap:8px">
        <span style="font-size:13px;color:#999">共 ${roles.length} 条</span>
        <div class="pagination-btns">
          ${Array.from({length:Math.ceil(roles.length/PAGE_SIZE)||1},(_,i)=>`<button class="page-btn ${i+1===umRolePage?'active':''}" onclick="goUmRolePage(${i+1})">${i+1}</button>`).join('')}
        </div>
        <span style="font-size:12px;color:#999">跳转</span>
      </div>
    </div>
  </div>
  `;
}

function goUmPage(p){ umPage=p; render(); }
function goUmRolePage(p){ umRolePage=p; render(); }

// 用户状态切换
function toggleUserStatus(id){
  const users = ls(SK_USERS);
  const user = users.find(u=>u.id===id);
  if(user){
    user.status = !user.status;
    ls(SK_USERS, users);
    render();
    showMsg(user.status?'已启用':'已禁用','s');
  }
}

// 角色状态切换
function toggleRoleStatus(id){
  const roles = ls(SK_ROLES);
  const role = roles.find(r=>r.id===id);
  if(role){
    role.status = !role.status;
    ls(SK_ROLES, roles);
    render();
    showMsg(role.status?'已启用':'已禁用','s');
  }
}

// 打开用户编辑弹窗
function openUserEdit(id){
  editingUserId = id || null;
  userAvatarData = '';
  const modal = g('modal-user-edit');
  const title = g('user-edit-title');
  
  if(id){
    const users = ls(SK_USERS);
    const user = users.find(u=>u.id===id);
    if(user){
      title.textContent = '编辑';
      g('user-edit-name').value = user.name||'';
      g('user-edit-username').value = user.username||'';
      g('user-edit-phone').value = user.phone||'';
      g('user-edit-email').value = user.email||'';
      g('user-edit-pwd').value = '••••••••••••••••';
      userAvatarData = user.avatar||'';
      updateAvatarPreview();
    }
  }else{
    title.textContent = '新增';
    g('user-edit-name').value = '';
    g('user-edit-username').value = '';
    g('user-edit-phone').value = '';
    g('user-edit-email').value = '';
    g('user-edit-pwd').value = '';
    updateAvatarPreview();
  }
  
  modal.classList.add('show');
}

function updateAvatarPreview(){
  const upload = g('user-avatar-upload');
  if(userAvatarData){
    upload.innerHTML = `<img src="${userAvatarData}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"><div class="del-btn" onclick="event.stopPropagation();userAvatarData='';updateAvatarPreview()">🗑</div>`;
  }else{
    upload.innerHTML = `<div style="font-size:24px;color:#ccc" id="user-avatar-placeholder">☁</div><div class="np-img-upload-text" id="user-avatar-text">请上传头像</div>`;
  }
}

function uploadUserAvatar(input){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    userAvatarData = e.target.result;
    updateAvatarPreview();
  };
  reader.readAsDataURL(file);
}

function togglePwdVisible(){
  const pwd = g('user-edit-pwd');
  pwd.type = pwd.type==='password' ? 'text' : 'password';
}

function saveUserEdit(){
  const name = g('user-edit-name').value.trim();
  const username = g('user-edit-username').value.trim();
  const phone = g('user-edit-phone').value.trim();
  const email = g('user-edit-email').value.trim();
  
  if(!name){showMsg('请输入姓名','e');return;}
  if(!username){showMsg('请输入用户名','e');return;}
  
  const users = ls(SK_USERS);
  
  if(editingUserId){
    const idx = users.findIndex(u=>u.id===editingUserId);
    if(idx>=0){
      users[idx].name = name;
      users[idx].username = username;
      users[idx].phone = phone;
      users[idx].email = email;
      users[idx].avatar = userAvatarData;
    }
  }else{
    users.push({
      id: 'u'+Date.now(),
      avatar: userAvatarData,
      name: name,
      username: username,
      phone: phone,
      email: email,
      role: '管理员',
      status: true,
      lastLogin: '-',
      createdAt: fmtTime(new Date())
    });
  }
  
  ls(SK_USERS, users);
  closeM('modal-user-edit');
  render();
  showMsg('保存成功','s');
}

function deleteUser(id){
  if(!confirm('确定要删除该用户吗？')) return;
  let users = ls(SK_USERS);
  users = users.filter(u=>u.id!==id);
  ls(SK_USERS, users);
  render();
  showMsg('已删除','s');
}

function resetUserPwd(id){
  showMsg('密码已重置为默认密码','s');
}

function filterUsers(){
  // 简化筛选逻辑，实际可扩展
  render();
}

function resetUserFilter(){
  const els = ['um-f-username','um-f-name','um-f-status','um-f-start','um-f-end'];
  els.forEach(id=>{const el=g(id);if(el)el.value='';});
  render();
}

// 打开角色编辑弹窗
function openRoleEdit(id){
  editingRoleId = id || null;
  const modal = g('modal-role-edit');
  const title = g('role-edit-title');
  
  if(id){
    const roles = ls(SK_ROLES);
    const role = roles.find(r=>r.id===id);
    if(role){
      title.textContent = '编辑角色';
      g('role-edit-name').value = role.name||'';
      g('role-edit-type').value = role.type||'admin';
      g('role-edit-desc').value = role.desc||'';
    }
  }else{
    title.textContent = '新增角色';
    g('role-edit-name').value = '';
    g('role-edit-type').value = 'admin';
    g('role-edit-desc').value = '';
  }
  
  modal.classList.add('show');
}

function saveRoleEdit(){
  const name = g('role-edit-name').value.trim();
  const type = g('role-edit-type').value;
  const desc = g('role-edit-desc').value.trim();
  
  if(!name){showMsg('请输入角色名称','e');return;}
  
  const roles = ls(SK_ROLES);
  
  if(editingRoleId){
    const idx = roles.findIndex(r=>r.id===editingRoleId);
    if(idx>=0){
      roles[idx].name = name;
      roles[idx].type = type;
      roles[idx].desc = desc;
    }
  }else{
    roles.push({
      id: 'r'+Date.now(),
      name: name,
      type: type,
      desc: desc,
      status: true,
      createdAt: fmtTime(new Date()),
      permissions: []
    });
  }
  
  ls(SK_ROLES, roles);
  closeM('modal-role-edit');
  render();
  showMsg('保存成功','s');
}

function filterRoles(){
  render();
}

function resetRoleFilter(){
  const els = ['um-f-role','um-f-role-type','um-f-role-status'];
  els.forEach(id=>{const el=g(id);if(el)el.value='';});
  render();
}

// 检查当前用户是否为超级管理员
function checkIsSuperAdmin(){
  // 这里简化处理，默认当前登录用户是超级管理员
  // 实际项目中应该从用户信息中获取角色类型
  const currentUserRole = localStorage.getItem('teg_current_user_role') || 'superadmin';
  return currentUserRole === 'superadmin';
}

// 打开角色权限管理弹窗
function openRolePerm(id){
  // 检查是否为超级管理员
  if(!checkIsSuperAdmin()){
    showMsg('只有超级管理员才能进行权限管理','e');
    return;
  }
  
  currentPermRoleId = id;
  const roles = ls(SK_ROLES);
  const role = roles.find(r=>r.id===id);
  
  if(role){
    g('role-perm-current').textContent = '当前角色: ' + role.name;
    
    // 重置所有复选框
    document.querySelectorAll('.perm-item-check').forEach(cb=>cb.checked=false);
    g('perm-select-all').checked = false;
    
    // 设置已有权限
    const perms = role.permissions || [];
    perms.forEach(p=>{
      const cb = document.querySelector(`.perm-item-check[data-perm="${p}"]`);
      if(cb) cb.checked = true;
    });
    
    // 检查是否全选
    const allItems = document.querySelectorAll('.perm-item-check');
    const allChecked = Array.from(allItems).every(cb=>cb.checked);
    g('perm-select-all').checked = allChecked;
  }
  
  g('modal-role-perm').classList.add('show');
}

function toggleAllPerms(el){
  const checked = el.checked;
  document.querySelectorAll('.perm-item-check').forEach(cb=>cb.checked=checked);
}

function saveRolePerm(){
  const roles = ls(SK_ROLES);
  const idx = roles.findIndex(r=>r.id===currentPermRoleId);
  
  if(idx>=0){
    const perms = [];
    document.querySelectorAll('.perm-item-check:checked').forEach(cb=>{
      perms.push(cb.dataset.perm);
    });
    roles[idx].permissions = perms;
    ls(SK_ROLES, roles);
  }
  
  closeM('modal-role-perm');
  showMsg('权限已保存','s');
}

// ========== 启动 ==========
initDemo();
render();
