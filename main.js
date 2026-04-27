/* Tailwind config is inlined in <head> for ATF-first loading */

/* ── Off-canvas menu logic ── */
function _blockScroll(e){
  /* Allow scrolling inside off-canvas menu and join modal */
  if(e.target.closest('#ocMenu')||e.target.closest('#joinModal'))return;
  e.preventDefault();
}
var _scrollBlocked=false;
function blockPageScroll(){
  if(_scrollBlocked)return;_scrollBlocked=true;
  document.addEventListener('wheel',_blockScroll,{passive:false});
  document.addEventListener('touchmove',_blockScroll,{passive:false});
}
function unblockPageScroll(){
  if(!_scrollBlocked)return;_scrollBlocked=false;
  document.removeEventListener('wheel',_blockScroll);
  document.removeEventListener('touchmove',_blockScroll);
}
function openOC(){
  blockPageScroll();
  /* Reset L1 scroll and close any open sub-panel */
  document.getElementById('ocL1').scrollTop=0;
  closeSub();
  document.getElementById('ocMenu').classList.add('oc-open');
  document.getElementById('ocOverlay').classList.add('oc-open');
}
function closeOC(){
  document.getElementById('ocMenu').classList.remove('oc-open');
  document.getElementById('ocOverlay').classList.remove('oc-open');
  unblockPageScroll();
  setTimeout(closeSub,400);
}
function openSub(id){
  var panel=document.getElementById('ocSub-'+id);
  panel.scrollTop=0;
  document.getElementById('ocL1').classList.add('oc-pushed');
  panel.classList.add('oc-active');
}
function closeSub(){
  document.getElementById('ocL1').classList.remove('oc-pushed');
  document.querySelectorAll('.oc-panel--l2').forEach(function(p){p.classList.remove('oc-active')});
  clearCitySearch();
}

/* ── City filter (Browse By City sub-panel) ── */
function filterCities(q){
  var term=(q||'').trim().toLowerCase();
  var clearBtn=document.getElementById('ocCitySearchClear');
  if(clearBtn) clearBtn.hidden=!term;

  function applyMatch(els){
    var visible=0;
    els.forEach(function(el){
      var hay=(el.dataset.city||'')+' '+el.textContent.toLowerCase();
      var match=!term || hay.indexOf(term)!==-1;
      el.classList.toggle('is-hidden',!match);
      if(match) visible++;
    });
    return visible;
  }
  var topVisible=applyMatch(document.querySelectorAll('#ocCityGrid .oc-city-tile'));
  var listVisible=applyMatch(document.querySelectorAll('#ocCityList .oc-city'));

  var topHd=document.querySelector('.oc-section-hd[data-section="top"]');
  var otherHd=document.querySelector('.oc-section-hd[data-section="other"]');
  if(topHd) topHd.hidden=topVisible===0;
  if(otherHd) otherHd.hidden=listVisible===0;

  var empty=document.getElementById('ocCityEmpty');
  if(empty){
    empty.hidden=(topVisible+listVisible)>0;
    if(!empty.hidden){
      var t=document.getElementById('ocCityEmptyTerm');
      if(t) t.textContent=q;
    }
  }
}
function clearCitySearch(){
  var input=document.getElementById('ocCitySearch');
  if(input && input.value){ input.value=''; filterCities(''); }
  else { filterCities(''); }
}

/* ── Sign In Modal Logic ── */
var jmMode='signin'; /* signin, otp-login, otp-verify, forgot */

/* Country codes data */
var jmCountries=[
  {code:'+91',iso:'in',name:'India'},
  {code:'+1',iso:'us',name:'United States'},
  {code:'+44',iso:'gb',name:'United Kingdom'},
  {code:'+971',iso:'ae',name:'UAE'},
  {code:'+65',iso:'sg',name:'Singapore'},
  {code:'+61',iso:'au',name:'Australia'},
  {code:'+1',iso:'ca',name:'Canada'},
  {code:'+64',iso:'nz',name:'New Zealand'},
  {code:'+49',iso:'de',name:'Germany'},
  {code:'+974',iso:'qa',name:'Qatar'},
  {code:'+968',iso:'om',name:'Oman'},
  {code:'+966',iso:'sa',name:'Saudi Arabia'},
  {code:'+965',iso:'kw',name:'Kuwait'},
  {code:'+973',iso:'bh',name:'Bahrain'},
  {code:'+60',iso:'my',name:'Malaysia'},
  {code:'+852',iso:'hk',name:'Hong Kong'},
  {code:'+254',iso:'ke',name:'Kenya'},
  {code:'+27',iso:'za',name:'South Africa'},
  {code:'+81',iso:'jp',name:'Japan'},
  {code:'+33',iso:'fr',name:'France'}
];
var jmSelCC={code:'+91',iso:'in'};

function openSignIn(){
  if(document.getElementById('ocMenu').classList.contains('oc-open'))closeOC();
  blockPageScroll();
  document.getElementById('joinModal').classList.add('jm-open');
  document.getElementById('joinOverlay').classList.add('jm-open');
  jmShowSignIn();
}
function closeSignIn(){
  document.getElementById('joinModal').classList.remove('jm-open');
  document.getElementById('joinOverlay').classList.remove('jm-open');
  unblockPageScroll();
  var ccl=document.getElementById('jmCCList');if(ccl)ccl.style.display='none';
}

function jmShowView(id){
  document.querySelectorAll('.jm-step').forEach(function(s){s.classList.remove('active')});
  document.getElementById(id).classList.add('active');
  var ccl=document.getElementById('jmCCList');if(ccl)ccl.style.display='none';
}
function jmShowSignIn(){jmShowView('jmSignIn');setTimeout(function(){document.getElementById('jmPhoneInput').focus()},100)}
function jmShowOTPLogin(){jmShowView('jmOTPLogin');setTimeout(function(){document.getElementById('jmOTPPhoneInput').focus()},100)}
function jmShowForgot(){jmShowView('jmForgot');setTimeout(function(){document.getElementById('jmForgotPhone').focus()},100)}

function jmSendOTP(){
  var ph=document.getElementById('jmOTPPhoneInput').value;
  document.getElementById('jmOtpSentTo').textContent='OTP has been sent to '+jmSelCC.code+' '+ph;
  jmShowView('jmOTPVerify');
  setTimeout(function(){document.querySelector('#jmOTPVerify [data-otp="0"]').focus()},100);
}

function jmDoSignIn(){/* TODO: API call - validate phone+password */closeSignIn();}
function jmVerifyOTP(){/* TODO: API call - verify OTP */closeSignIn();}
function jmResendOTP(){/* TODO: API call */}

/* Country code dropdown */
function jmToggleCCList(){
  var list=document.getElementById('jmCCList');
  if(list.style.display==='none'){
    list.style.display='flex';jmRenderCCOptions('');
    setTimeout(function(){document.getElementById('jmCCSearch').focus()},50);
  }else{list.style.display='none'}
}
function jmFilterCC(val){jmRenderCCOptions(val)}
function jmRenderCCOptions(filter){
  var cont=document.getElementById('jmCCOptions');
  var f=filter.toLowerCase();
  var html=jmCountries.filter(function(c){return !f||c.name.toLowerCase().includes(f)||c.code.includes(f)})
    .map(function(c){return '<div class="jm-cc-opt" onclick="jmPickCC(\''+c.code+'\',\''+c.iso+'\',\''+c.name+'\')">'
      +'<img src="https://flagcdn.com/w40/'+c.iso+'.png" alt="'+c.iso+'">'
      +'<span>'+c.name+'</span><span>'+c.code+'</span></div>'}).join('');
  cont.innerHTML=html||'<div style="padding:12px 16px;font-size:13px;color:var(--muted)">No results</div>';
}
function jmPickCC(code,iso,name){
  jmSelCC={code:code,iso:iso};
  document.querySelectorAll('.jm-cc-btn').forEach(function(btn){
    var img=btn.querySelector('img');var span=btn.querySelector('span');
    if(img)img.src='https://flagcdn.com/w40/'+iso+'.png';
    if(span)span.textContent=code;
  });
  document.getElementById('jmCCList').style.display='none';
  document.getElementById('jmCCSearch').value='';
  /* Update phone input max length */
  var maxL=code==='+91'?10:15;
  ['jmPhoneInput','jmOTPPhoneInput','jmForgotPhone'].forEach(function(id){
    var el=document.getElementById(id);if(el)el.maxLength=maxL;
  });
}

/* Password toggle */
function jmTogglePw(){
  var pw=document.getElementById('jmPwInput');
  pw.type=pw.type==='password'?'text':'password';
}

/* Phone validation - enable buttons */
document.getElementById('jmPhoneInput').addEventListener('input',function(){
  this.value=this.value.replace(/\D/g,'');
});
document.getElementById('jmOTPPhoneInput').addEventListener('input',function(){
  this.value=this.value.replace(/\D/g,'');
  document.getElementById('jmSendOTPBtn').disabled=this.value.length<10;
});

/* OTP boxes - auto-advance, backspace, paste */
document.querySelectorAll('.jm-otp-box').forEach(function(box,i,all){
  box.addEventListener('input',function(){
    this.value=this.value.replace(/\D/g,'').slice(0,1);
    if(this.value&&i<all.length-1)all[i+1].focus();
    var filled=Array.from(all).every(function(b){return b.value.length===1});
    document.getElementById('jmOtpBtn').disabled=!filled;
  });
  box.addEventListener('keydown',function(e){
    if(e.key==='Backspace'&&!this.value&&i>0){all[i-1].focus();all[i-1].value='';}
  });
  box.addEventListener('paste',function(e){
    e.preventDefault();
    var paste=(e.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'').slice(0,4);
    paste.split('').forEach(function(ch,j){if(all[i+j]){all[i+j].value=ch;}});
    var target=Math.min(i+paste.length,all.length-1);all[target].focus();
    var filled=Array.from(all).every(function(b){return b.value.length===1});
    document.getElementById('jmOtpBtn').disabled=!filled;
  });
});

(function(){document.querySelectorAll('.ed2-chip').forEach(b=>{b.addEventListener('click',function(){b.closest('.ed2-chips').querySelectorAll('.ed2-chip').forEach(x=>x.classList.remove('active'));this.classList.add('active')})})})();

/* ═══ DATA (from index.html) ═══ */
const DATA={
  mumbai:{cityName:"Mumbai",locations:[{id:"loc_gw",name:"Goregaon West",area:"Mumbai"},{id:"loc_ge",name:"Goregaon East",area:"Mumbai"},{id:"loc_aw",name:"Andheri West",area:"Mumbai"},{id:"loc_bkc",name:"Bandra Kurla Complex",area:"Mumbai"},{id:"loc_mw",name:"Malad West",area:"Mumbai"},{id:"loc_sid",name:"Siddharth Nagar",area:"Goregaon West"}],pincodes:[{id:"pin_400062",code:"400062",area:"Goregaon West"},{id:"pin_400064",code:"400064",area:"Malad West"}],projects:[{id:"prj_rex",name:"Raheja Exotica",micro:"Madh Island",category:"residential",availability:{buy:true,rent:true}},{id:"prj_bkc1",name:"One BKC Corporate",micro:"BKC",category:"commercial",availability:{buy:false,rent:true}},{id:"prj_nova",name:"Skyline Nova",micro:"Andheri East",category:"residential",availability:{buy:true,rent:false}}]},
  pune:{cityName:"Pune",locations:[{id:"loc_hinj",name:"Hinjewadi",area:"Pune"},{id:"loc_ban",name:"Baner",area:"Pune"},{id:"loc_sid_p",name:"Siddharth Nagar",area:"Kothrud"}],pincodes:[{id:"pin_411057",code:"411057",area:"Hinjewadi"}],projects:[{id:"prj_p1",name:"Zenith Greens",micro:"Baner",category:"residential",availability:{buy:true,rent:true}},{id:"prj_p2",name:"TechSquare SEZ",micro:"Hinjewadi",category:"commercial",availability:{buy:false,rent:true}}]},
  jaipur:{cityName:"Jaipur",locations:[{id:"loc_vn",name:"Vaishali Nagar",area:"Jaipur"},{id:"loc_mn",name:"Malviya Nagar",area:"Jaipur"},{id:"loc_sid_j",name:"Siddharth Nagar",area:"Tonk Road"}],pincodes:[{id:"pin_302021",code:"302021",area:"Vaishali Nagar"}],projects:[{id:"prj_j1",name:"PinkCity Heights",micro:"Vaishali Nagar",category:"residential",availability:{buy:true,rent:true}}]},
  delhi:{cityName:"Delhi",locations:[{id:"loc_saket_d",name:"Saket",area:"South Delhi"},{id:"loc_dwk",name:"Dwarka",area:"Delhi"},{id:"loc_gn",name:"Greater Kailash",area:"Delhi"}],pincodes:[{id:"pin_110017",code:"110017",area:"Saket"}],projects:[{id:"prj_d1",name:"DLF Capital Greens",micro:"Moti Nagar",category:"residential",availability:{buy:true,rent:true}}]},
  bengaluru:{cityName:"Bengaluru",locations:[{id:"loc_wh",name:"Whitefield",area:"Bengaluru"},{id:"loc_ec",name:"Electronic City",area:"Bengaluru"}],pincodes:[{id:"pin_560066",code:"560066",area:"Whitefield"}],projects:[{id:"prj_b1",name:"Prestige Tech Park",micro:"Marathahalli",category:"commercial",availability:{buy:false,rent:true}}]}
};
const CITY_KEYS=Object.keys(DATA);
const POPULAR_CITIES=["mumbai","delhi","bengaluru","pune","jaipur"];
const CITY_EMOJI={mumbai:"",delhi:"",bengaluru:"",pune:"",jaipur:""};
const MAX_MULTI=4;
const CAT_EMOJI={"Senior Living":"🧓","Co-Living":"🏘️","Co-Working":"💼","Warehouse":"📦","Auction Deals":"🔨","Fractional Ownership":"📊"};
const CATS=[{label:"Senior Living",url:"/senior-living"},{label:"Co-Living",url:"/co-living"},{label:"Co-Working",url:"/co-working"},{label:"Warehouse",url:"/warehouse"},{label:"Auction Deals",url:"/auction-deals"},{label:"Fractional Ownership",url:"/fractional-ownership"}];

function escapeHtml(str){return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}

let city="",mode="buy",type="homes",whereText="",multiLocs=[],selection=null,cityGateForced=true,panelOpen=false,modePop_=false,typePop_=false;
const $=s=>document.querySelector(s);

function buildSugg(c,q){
  const d=DATA[c];if(!d)return{locations:[],projects:[],pincodes:[]};
  const ids=new Set(multiLocs.map(x=>x.id)),qt=q.trim().toLowerCase();
  if(!qt)return{locations:d.locations.filter(x=>!ids.has(x.id)).slice(0,5),projects:d.projects.slice(0,5),pincodes:d.pincodes.slice(0,5)};
  return{
    locations:d.locations.filter(x=>x.name.toLowerCase().includes(qt)&&!ids.has(x.id)).slice(0,6),
    projects:d.projects.filter(x=>x.name.toLowerCase().includes(qt)).slice(0,6),
    pincodes:/^[0-9]+$/.test(qt)?d.pincodes.filter(x=>x.code.startsWith(qt)).slice(0,6):[]
  };
}

function syncWhereTextFromMulti(){
  if(multiLocs.length) whereText=multiLocs.map(x=>x.name).join(", ");
  else whereText=$('#whereInput').value.trim();
}

function renderChips(){
  const row=$("#chipsRow"),inp=$("#whereInput");
  row.querySelectorAll(".chip-el").forEach(e=>e.remove());
  if(city){
    const c=document.createElement("span");
    c.className="chip-el inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-900 text-white text-xs font-semibold shrink-0 cursor-pointer";
    c.title="Click to change city";
    c.innerHTML=escapeHtml(DATA[city].cityName)+'<button class="chip-x w-3.5 h-3.5 rounded-full border-0 bg-white/20 text-white text-[10px] flex items-center justify-center p-0 cursor-pointer ml-0.5" aria-label="Clear city">&times;</button>';
    c.querySelector(".chip-x").addEventListener("click",e=>{e.stopPropagation();setCity("");});
    c.addEventListener("click",function(e){if(e.target.classList.contains("chip-x"))return;cityGateForced=true;openPanel();});
    row.insertBefore(c,inp);
  }
  const vis=multiLocs.slice(0,2),ov=multiLocs.length-vis.length;
  vis.forEach((l,i)=>{
    const c=document.createElement("span");
    c.className="chip-el inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-900 text-xs shrink-0";
    c.innerHTML=escapeHtml(l.name)+'<button class="chip-x w-3.5 h-3.5 rounded-full border-0 bg-gray-200 text-gray-900 text-[10px] flex items-center justify-center p-0 cursor-pointer ml-0.5" aria-label="Remove">&times;</button>';
    c.querySelector(".chip-x").addEventListener("click",e=>{e.stopPropagation();removeLoc(i);});
    row.insertBefore(c,inp);
  });
  if(ov>0){
    const m=document.createElement("span");
    m.className="chip-el inline-flex items-center px-2 py-0.5 rounded-full border border-dashed border-gray-300 text-xs cursor-pointer";
    m.textContent="+"+ov;
    m.addEventListener("click",e=>{e.stopPropagation();cityGateForced=false;openPanel();});
    row.insertBefore(m,inp);
  }
  const has=whereText.trim()||multiLocs.length||selection;
  const cb=$("#clearBtn");
  has?(cb.classList.remove("hidden"),cb.classList.add("flex")):(cb.classList.add("hidden"),cb.classList.remove("flex"));
  inp.placeholder=city?"Locality, project or pincode":"Search by city, locality, project or pin-code";
  inp.style.caretColor=city?"":"transparent";
  syncAllSearchBars();
}

function syncAllSearchBars(){
  let where="Anywhere";
  if(multiLocs.length){const ns=multiLocs.slice(0,2).map(l=>l.name);if(multiLocs.length>2)ns.push("+"+(multiLocs.length-2)+" more");where=ns.join(", ")}
  else if(selection&&selection.type==="citywide"&&city){where="All of "+DATA[city].cityName}
  else if(city){where=DATA[city].cityName}
  const modeStr=mode==="buy"?"Buy":"Rent";
  const typeStr=type==="homes"?"Homes":type==="workspaces"?"Workspaces":"Land";
  /* Compact desktop bar - separate fields */
  const cw=document.getElementById("compactWhere"),cm=document.getElementById("compactMode"),ct=document.getElementById("compactType");
  if(cw)cw.textContent=where;if(cm)cm.textContent=modeStr;if(ct)ct.textContent=typeStr;
  /* Mobile + mid-screen - two-line layout */
  const hasSearch=!!(city||multiLocs.length);
  const sub=modeStr+" · "+typeStr;
  /* Mid-screen (tablet) - separate fields */
  const midW=document.getElementById("midSearchWhere"),midM=document.getElementById("midSearchMode"),midT=document.getElementById("midSearchType");
  if(midW)midW.textContent=where;if(midM)midM.textContent=modeStr;if(midT)midT.textContent=typeStr;
  /* Mobile + mid-small (744–991px) - two-line pill */
  [["mobSearchLine1","mobSearchLine2","mobSearchIcon","mobSearchTrigger","12","22"],["midSmallLine1","midSmallLine2","midSmallIcon","midSmallTrigger","8","15"]].forEach(([l1id,l2id,iconId,btnId,padOn,padOff])=>{
    const l1=document.getElementById(l1id),l2=document.getElementById(l2id),ic=document.getElementById(iconId),bt=document.getElementById(btnId);
    if(!l1||!l2)return;
    if(hasSearch){l1.textContent=where;l2.textContent=sub;l2.style.display="";if(ic)ic.style.display="none";if(bt)bt.style.paddingTop=bt.style.paddingBottom=padOn+"px";}
    else{l1.textContent="Search Properties";l2.style.display="none";if(ic)ic.style.display="";if(bt)bt.style.paddingTop=bt.style.paddingBottom=padOff+"px";}
  });
}

function renderSelectedRowInPanel(container){
  if(!multiLocs.length)return;
  const div=document.createElement("div");
  div.style="padding:8px 10px 10px;border-bottom:1px solid #f0f0f0;margin-bottom:6px;";
  const top=document.createElement("div");
  top.style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;";
  top.innerHTML='<span style="font-size:12px;font-weight:600;color:#374151;font-family:inherit">Selected locations</span>'
    +'<button id="clearAllLocsBtn" style="font-size:12px;font-weight:600;color:#ee324b;background:none;border:none;cursor:pointer;font-family:inherit;padding:0">Clear all</button>';
  div.appendChild(top);
  const chipsRow=document.createElement("div");
  chipsRow.style="display:flex;flex-wrap:wrap;gap:6px;";
  multiLocs.forEach((l,i)=>{
    const chip=document.createElement("span");
    chip.style="display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:999px;background:#f3f4f6;font-size:12px;color:#111;";
    chip.innerHTML=escapeHtml(l.name)+'<button data-rm="'+i+'" style="width:16px;height:16px;border-radius:50%;border:0;background:#ddd;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;padding:0">&times;</button>';
    chipsRow.appendChild(chip);
  });
  div.appendChild(chipsRow);
  container.appendChild(div);
  div.querySelector("#clearAllLocsBtn").addEventListener("click",e=>{
    e.stopPropagation();multiLocs=[];selection=null;renderChips();renderPanel();
  });
  chipsRow.querySelectorAll("button[data-rm]").forEach(btn=>{
    btn.addEventListener("click",e=>{
      e.stopPropagation();removeLoc(Number(btn.dataset.rm));
    });
  });
}

function renderPanel(){
  const p=$("#wherePanel");
  if(!panelOpen){p.classList.add("hidden");return;}
  p.classList.remove("hidden");
  if(!city||cityGateForced){
    p.innerHTML=
      '<div style="display:flex;gap:0">'
      +'<div style="flex:1;padding-right:20px">'
        +'<div style="font-size:15px;font-weight:700;color:#141414;margin-bottom:4px">Start with your city</div>'
        +'<div style="font-size:13px;color:#9ca3af;margin-bottom:12px">This keeps results fast and accurate.</div>'
        +'<div style="position:relative;margin-bottom:16px">'
          +'<svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);pointer-events:none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>'
          +'<input id="deskCitySearch" type="text" placeholder="e.g. Mumbai, Pune, Delhi..." autocomplete="off" '
          +'style="width:100%;border:1.5px solid #e5e7eb;border-radius:14px;padding:9px 14px 9px 34px;font-size:14px;outline:none;font-family:inherit;color:#141414;box-sizing:border-box;transition:border-color .15s" '
          +'onfocus="this.style.borderColor=\'#141414\'" onblur="this.style.borderColor=\'#e5e7eb\'" />'
        +'</div>'
        +'<div style="font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#9ca3af;margin-bottom:10px">Popular cities</div>'
        +'<div id="deskCityChips" style="display:flex;flex-wrap:wrap;gap:8px">'
        +POPULAR_CITIES.map(k=>{const active=city===k;const em=CITY_EMOJI[k];return'<button class="city-chip" style="display:inline-flex;align-items:center;gap:6px;border:1.5px solid '+(active?"#141414":"#e5e7eb")+';background:'+(active?"#141414":"#fff")+';color:'+(active?"#fff":"#141414")+';padding:8px 14px;border-radius:999px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit" data-key="'+k+'">'+(em?'<span>'+em+'</span>':'')+escapeHtml(DATA[k].cityName)+'</button>'}).join("")
        +'</div>'
        +'<div id="deskCityEmpty" style="display:none;padding:20px 0;text-align:center;color:#9ca3af;font-size:13px">No cities found - try a different spelling</div>'
      +'</div>'
      +'<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 20px;position:relative;align-self:stretch">'
        +'<div style="width:1px;flex:1;background:#e8e8e8"></div>'
        +'<span style="padding:10px 0;font-size:11px;font-weight:600;color:#9ca3af;font-family:Inter,sans-serif">or</span>'
        +'<div style="width:1px;flex:1;background:#e8e8e8"></div>'
      +'</div>'
      +'<div style="width:170px;flex-shrink:0;display:flex;flex-direction:column;justify-content:center">'
        +'<div style="font-size:13px;font-weight:600;color:#111;margin-bottom:14px">Browse by category</div>'
        +'<div style="display:flex;flex-direction:column;gap:2px;max-height:240px;overflow-y:auto;scrollbar-width:thin">'
          +'<a href="#" class="sel-cat" style="display:block;padding:7px 10px;border-radius:8px;font-size:13px;font-weight:500;color:#374151;text-decoration:none;transition:background .15s" onmouseover="this.style.background=\'#f5f5f3\'" onmouseout="this.style.background=\'transparent\'">🧓 Senior Living</a>'
          +'<a href="#" class="sel-cat" style="display:block;padding:7px 10px;border-radius:8px;font-size:13px;font-weight:500;color:#374151;text-decoration:none;transition:background .15s" onmouseover="this.style.background=\'#f5f5f3\'" onmouseout="this.style.background=\'transparent\'">🏘️ Co-Living</a>'
          +'<a href="#" class="sel-cat" style="display:block;padding:7px 10px;border-radius:8px;font-size:13px;font-weight:500;color:#374151;text-decoration:none;transition:background .15s" onmouseover="this.style.background=\'#f5f5f3\'" onmouseout="this.style.background=\'transparent\'">💼 Co-Working</a>'
          +'<a href="#" class="sel-cat" style="display:block;padding:7px 10px;border-radius:8px;font-size:13px;font-weight:500;color:#374151;text-decoration:none;transition:background .15s" onmouseover="this.style.background=\'#f5f5f3\'" onmouseout="this.style.background=\'transparent\'">📦 Warehouse</a>'
          +'<a href="#" class="sel-cat" style="display:block;padding:7px 10px;border-radius:8px;font-size:13px;font-weight:500;color:#374151;text-decoration:none;transition:background .15s" onmouseover="this.style.background=\'#f5f5f3\'" onmouseout="this.style.background=\'transparent\'">🔨 Auction Deals</a>'
        +'</div>'
      +'</div>'
      +'</div>';
      
      +'<div style="margin-top:16px;padding-top:14px;border-top:1px solid #f0f0f0">'
      +'<div style="font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#9ca3af;margin-bottom:10px">Explore</div>'
      +'<div style="display:flex;flex-wrap:wrap;gap:8px">'
      +'<a href="#" style="border:1px solid #e5e7eb;background:#fff;padding:6px 14px;border-radius:999px;font-size:12px;color:#374151;text-decoration:none">🧓 Senior Living</a>'
      +'<a href="#" style="border:1px solid #e5e7eb;background:#fff;padding:6px 14px;border-radius:999px;font-size:12px;color:#374151;text-decoration:none">🏘️ Co-Living</a>'
      +'<a href="#" style="border:1px solid #e5e7eb;background:#fff;padding:6px 14px;border-radius:999px;font-size:12px;color:#374151;text-decoration:none">💼 Co-Working</a>'
      +'<a href="#" style="border:1px solid #e5e7eb;background:#fff;padding:6px 14px;border-radius:999px;font-size:12px;color:#374151;text-decoration:none">📦 Warehouse</a>'
      +'<a href="#" style="border:1px solid #e5e7eb;background:#fff;padding:6px 14px;border-radius:999px;font-size:12px;color:#374151;text-decoration:none">🔨 Auction Deals</a>'
      +'</div></div>'
    const wireChips=()=>{
      p.querySelectorAll(".city-chip").forEach(e=>e.addEventListener("click",()=>{
        setCity(e.dataset.key);cityGateForced=false;renderPanel();
        setTimeout(()=>$("#whereInput")?.focus(),50);
      }));
    };
    wireChips();
    const dcs=document.getElementById("deskCitySearch");
    dcs.focus();
    dcs.addEventListener("input",()=>{
      const q=dcs.value.trim().toLowerCase();
      const filtered=q?CITY_KEYS.filter(k=>DATA[k].cityName.toLowerCase().includes(q)):POPULAR_CITIES;
      const chipsDiv=document.getElementById("deskCityChips");
      const emptyDiv=document.getElementById("deskCityEmpty");
      if(!filtered.length){chipsDiv.style.display="none";emptyDiv.style.display="block";}
      else{chipsDiv.style.display="flex";emptyDiv.style.display="none";
        chipsDiv.innerHTML=filtered.map(k=>{const active=city===k;const em=CITY_EMOJI[k];return'<button class="city-chip" style="display:inline-flex;align-items:center;gap:6px;border:1.5px solid '+(active?"#141414":"#e5e7eb")+';background:'+(active?"#141414":"#fff")+';color:'+(active?"#fff":"#141414")+';padding:8px 14px;border-radius:999px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit" data-key="'+k+'">'+(em?'<span>'+em+'</span>':'')+escapeHtml(DATA[k].cityName)+'</button>'}).join("");
        wireChips();
      }
    });
    return;
  }
  const frag=document.createDocumentFragment();
  const wrapper=document.createElement("div");
  const header=document.createElement("div");
  header.style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px 10px;margin-bottom:4px;border-bottom:1px solid #f0f0f0;";
  header.innerHTML='<span style="font-size:12px;color:#9ca3af;font-family:inherit">Searching in <strong style="color:#141414;">'+escapeHtml(DATA[city].cityName)+'</strong></span>'
    +'<button id="changeCityBtn" style="font-size:12px;font-weight:600;color:#ee324b;background:none;border:none;cursor:pointer;font-family:inherit;padding:0;display:inline-flex;align-items:center;gap:4px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Change city</button>';
  wrapper.appendChild(header);
  if(multiLocs.length) renderSelectedRowInPanel(wrapper);
  const s=buildSugg(city,whereText);
  const has=s.locations.length||s.projects.length||s.pincodes.length;
  const acDiv=document.createElement("div");
  let h="";
  if(!whereText.trim()&&!multiLocs.length){
    h+='<div class="ac-item flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer text-sm sel-cw"><span class="text-sm">🌆</span><div><div class="font-semibold">All of '+escapeHtml(DATA[city].cityName)+'</div><div class="text-xs text-mu">Search across the entire city</div></div></div>';
  }
  if(s.locations.length){
    h+='<div class="text-[11px] text-mu font-semibold tracking-wider uppercase mt-2 mb-1">Locations</div>';
    s.locations.forEach(l=>{
      h+='<div class="ac-item flex items-center gap-2 p-2 rounded-xl cursor-pointer text-sm sel-loc" data-id="'+escapeHtml(l.id)+'">'
        +'<span style="width:24px;height:24px;border-radius:8px;background:#f3f4f6;display:grid;place-items:center;font-size:13px;flex-shrink:0">📍</span>'
        +'<div><div class="font-medium">'+escapeHtml(l.name)+'</div><div class="text-xs text-mu">'+escapeHtml(l.area)+'</div></div>'
        +'<span style="margin-left:auto;font-size:11px;color:#9ca3af;border:1px solid #e5e7eb;padding:2px 8px;border-radius:999px">Location</span>'
        +'</div>';
    });
  }
  if(s.projects.length){
    h+='<div class="text-[11px] text-mu font-semibold tracking-wider uppercase mt-2 mb-1">Projects</div>';
    s.projects.forEach(pr=>{
      const tag=pr.category==="commercial"?"Commercial":"Residential";
      h+='<div class="ac-item flex items-center gap-2 p-2 rounded-xl cursor-pointer text-sm sel-prj" data-id="'+escapeHtml(pr.id)+'">'
        +'<span style="width:24px;height:24px;border-radius:8px;background:#f3f4f6;display:grid;place-items:center;font-size:13px;flex-shrink:0">🏢</span>'
        +'<div><div class="font-medium">'+escapeHtml(pr.name)+'</div><div class="text-xs text-mu">'+escapeHtml(pr.micro)+', '+escapeHtml(DATA[city].cityName)+'</div></div>'
        +'<span style="margin-left:auto;font-size:11px;color:#9ca3af;border:1px solid #e5e7eb;padding:2px 8px;border-radius:999px">'+escapeHtml(tag)+'</span>'
        +'</div>';
    });
  }
  if(s.pincodes.length){
    h+='<div class="text-[11px] text-mu font-semibold tracking-wider uppercase mt-2 mb-1">Pincode</div>';
    s.pincodes.forEach(pin=>{
      h+='<div class="ac-item flex items-center gap-2 p-2 rounded-xl cursor-pointer text-sm sel-pin" data-id="'+escapeHtml(pin.id)+'">'
        +'<span style="width:24px;height:24px;border-radius:8px;background:#f3f4f6;display:grid;place-items:center;font-size:13px;flex-shrink:0">📮</span>'
        +'<div><div class="font-medium">'+escapeHtml(pin.code)+'</div><div class="text-xs text-mu">'+escapeHtml(pin.area)+', '+escapeHtml(DATA[city].cityName)+'</div></div>'
        +'<span style="margin-left:auto;font-size:11px;color:#9ca3af;border:1px solid #e5e7eb;padding:2px 8px;border-radius:999px">Pincode</span>'
        +'</div>';
    });
  }
  if(!has&&whereText.trim()) h='<div class="py-4 text-center text-mu text-sm">No results found</div>';

  acDiv.innerHTML=h;
  wrapper.appendChild(acDiv);
  p.innerHTML="";
  p.appendChild(wrapper);
  const ccb=p.querySelector("#changeCityBtn");
  if(ccb) ccb.addEventListener("click",e=>{e.stopPropagation();cityGateForced=true;renderPanel();setTimeout(()=>document.getElementById("deskCitySearch")?.focus(),30);});
  p.addEventListener("click",function handler(e){
    const item=e.target.closest(".ac-item");
    if(!item)return;
    if(item.classList.contains("sel-cw")){multiLocs=[];selection={type:"citywide"};whereText="";$("#whereInput").value="";closePanel();renderChips();return;}
    if(item.classList.contains("sel-loc")){const loc=DATA[city].locations.find(x=>x.id===item.dataset.id);if(loc)addLoc(loc);return;}
    if(item.classList.contains("sel-prj")){const pr=DATA[city].projects.find(x=>x.id===item.dataset.id);if(pr)routeToProject(pr);return;}
    if(item.classList.contains("sel-pin")){const pin=DATA[city].pincodes.find(x=>x.id===item.dataset.id);if(pin){selection={type:"pincode"};whereText=pin.code;$("#whereInput").value=pin.code;closePanel();renderChips();}return;}
  },{once:true});
  
}

function routeToProject(pr){
  const avail=pr.availability;
  let activeMode=mode,notice="";
  if(activeMode==="buy"&&!avail.buy&&avail.rent){activeMode="rent";}
  if(activeMode==="rent"&&!avail.rent&&avail.buy){activeMode="buy";}
  selection={type:"project",id:pr.id,meta:pr};whereText=pr.name;multiLocs=[];
  $("#whereInput").value=pr.name;closePanel();renderChips();
  showToast("Opened "+pr.name,"Undo",()=>{openPanel();$("#whereInput")?.focus();});
}

function renderModePop(){const p=$("#modePop");if(!modePop_){p.classList.add("hidden");return}p.classList.remove("hidden");p.innerHTML=["buy","rent"].map(m=>'<div class="opt-item flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-sm '+(mode===m?"bg-slate-100":"")+'" data-m="'+m+'"><span>'+(m==="buy"?"Buy":"Rent")+'</span><span class="w-3 h-3 rounded-full border-2 '+(mode===m?"border-gray-900 bg-gray-900":"border-gray-400")+'"></span></div>').join("");p.querySelectorAll("[data-m]").forEach(e=>e.addEventListener("click",()=>{mode=e.dataset.m;$("#modeLbl").textContent=mode==="buy"?"Buy":"Rent";modePop_=false;renderModePop();syncAllSearchBars();}));}
function renderTypePop(){const p=$("#typePop");if(!typePop_){p.classList.add("hidden");return}p.classList.remove("hidden");p.innerHTML=["homes","workspaces","land"].map(t=>'<div class="opt-item flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-sm '+(type===t?"bg-slate-100":"")+'" data-t="'+t+'"><span>'+(t==="homes"?"Homes":t==="workspaces"?"Workspaces":"Land")+'</span><span class="w-3 h-3 rounded-full border-2 '+(type===t?"border-gray-900 bg-gray-900":"border-gray-400")+'"></span></div>').join("");p.querySelectorAll("[data-t]").forEach(e=>e.addEventListener("click",()=>{type=e.dataset.t;$("#typeLbl").textContent=type==="homes"?"Homes":type==="workspaces"?"Workspaces":"Land";typePop_=false;renderTypePop();syncAllSearchBars();}));}

function setCity(k){
  city=k;if(k){cityGateForced=false;}else{cityGateForced=true;}
  multiLocs=[];selection=null;whereText="";
  const wi=$("#whereInput");if(wi)wi.value="";
  renderChips();if(!k){openPanel();}
}
function alignPanelToSearchBar(){
  const sb=document.getElementById("searchBar");
  const wp=document.getElementById("wherePanel");
  const pill=document.getElementById("wherePill");
  if(!sb||!wp||!pill)return;
  const sbRect=sb.getBoundingClientRect();
  const pillRect=pill.getBoundingClientRect();
  wp.style.width=sbRect.width+"px";
  wp.style.left=(sbRect.left-pillRect.left)+"px";
}
function openPanel(){panelOpen=true;cityGateForced=!city||cityGateForced;renderPanel();$("#searchBar").classList.add("panel-open");$("#searchBar").style.boxShadow="0 2px 8px rgba(0,0,0,.06),0 8px 28px rgba(0,0,0,.14)";alignPanelToSearchBar();}
function closePanel(){panelOpen=false;renderPanel();$("#searchBar").classList.remove("panel-open");$("#searchBar").style.boxShadow="0 4px 24px rgba(0,0,0,.07)";}
function addLoc(l){
  if(multiLocs.some(x=>x.id===l.id))return;
  if(multiLocs.length>=MAX_MULTI){showToast("Max "+MAX_MULTI+" locations selected. Remove one to add more.","OK",()=>{});return;}
  multiLocs.push(l);selection={type:"multi"};whereText="";
  $("#whereInput").value="";renderChips();renderPanel();
}
function removeLoc(i){multiLocs.splice(i,1);if(!multiLocs.length)selection=null;else selection={type:"multi"};renderChips();renderPanel();}

function showToast(text,actionLabel,actionFn){
  let t=document.getElementById("deskToast");
  if(!t){t=document.createElement("div");t.id="deskToast";t.style="position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#111827;color:#fff;padding:11px 14px;border-radius:999px;display:none;gap:10px;align-items:center;box-shadow:0 16px 40px rgba(0,0,0,.25);z-index:99999;font-size:14px;font-family:'Inter',sans-serif;white-space:nowrap;";document.body.appendChild(t);}
  t.innerHTML='<span>'+escapeHtml(text)+'</span>'+'<button id="toastAct" style="border:0;background:rgba(255,255,255,.14);color:#fff;padding:5px 12px;border-radius:999px;cursor:pointer;font-size:13px;font-family:inherit">'+escapeHtml(actionLabel)+'</button>';
  t.style.display="inline-flex";
  document.getElementById("toastAct").onclick=()=>{t.style.display="none";actionFn();};
  clearTimeout(showToast._t);showToast._t=setTimeout(()=>{t.style.display="none";},4500);
}

/* Mobile search */
const mob={city:"",mode:"buy",type:"homes",locs:[],sel:null,text:"",cityGate:true,accOpen:"where"};
const MOB_POPULAR=["mumbai","delhi","bengaluru","pune","jaipur"];
function openMobileSearch(){
  mob.city=city;mob.mode=mode;mob.type=type;
  mob.locs=[...multiLocs];mob.sel=selection;mob.text=whereText;
  mob.cityGate=!city;mob.accOpen="where";
  document.getElementById("mobileModal").style.display="flex";
  document.body.style.overflow="hidden";
  mobRenderAll();mobOpenAcc("where");
}
function closeMobileSearch(){document.getElementById("mobileModal").style.display="none";document.body.style.overflow="";}
function mobSubmitSearch(){
  city=mob.city;mode=mob.mode;type=mob.type;
  multiLocs=[...mob.locs];selection=mob.sel;whereText=mob.text;
  cityGateForced=mob.cityGate;renderChips();
  const ml=document.getElementById("modeLbl"),tl=document.getElementById("typeLbl");
  if(ml)ml.textContent=mode==="buy"?"Buy":"Rent";
  if(tl)tl.textContent=type==="homes"?"Homes":type==="workspaces"?"Workspaces":"Land";
  syncAllSearchBars();closeMobileSearch();
}
function mobRenderAll(){mobRenderWhereVal();mobRenderModeVal();mobRenderTypeVal();mobRenderWhereBody();mobRenderModeBtns();mobRenderTypeBtns();}
function mobOpenAcc(which){
  mob.accOpen=which;
  ["where","mode","type"].forEach(s=>{
    const sec=document.getElementById("mobSec_"+s);
    const exp=document.getElementById("mobSec_"+s+"_expanded");
    const col=document.getElementById("mobSec_"+s+"_collapsed");
    if(!sec)return;
    if(s===which){
      sec.classList.add("active");sec.classList.remove("collapsed");
      if(exp)exp.style.display="block";if(col)col.style.display="none";
    }else{
      sec.classList.remove("active");sec.classList.add("collapsed");
      if(exp)exp.style.display="none";if(col)col.style.display="block";
    }
  });
  mobSyncCollapsedVals();
}
window.mobStepClick=function(which){
  if(mob.accOpen===which)return;
  mobOpenAcc(which);
};
function mobSyncCollapsedVals(){
  const wv=document.getElementById("mobWhereValCollapsed");
  if(wv){
    if(!mob.city)wv.textContent="Anywhere";
    else if(mob.locs.length){const ns=mob.locs.slice(0,2).map(l=>l.name).join(", ")+(mob.locs.length>2?" +"+(mob.locs.length-2):"");wv.textContent=ns;}
    else if(mob.sel&&mob.sel.type==="citywide")wv.textContent="All of "+DATA[mob.city].cityName;
    else wv.textContent=DATA[mob.city].cityName;
  }
  const mv=document.getElementById("mobModeValCollapsed");
  if(mv)mv.textContent=mob.mode==="buy"?"Buy":"Rent";
  const tv=document.getElementById("mobTypeValCollapsed");
  if(tv)tv.textContent=mob.type==="homes"?"Homes":mob.type==="workspaces"?"Workspaces":"Land";
}
function mobRenderWhereVal(){mobSyncCollapsedVals();}
function mobRenderModeVal(){}
function mobRenderTypeVal(){}
function mobRenderWhereBody(){
  const gate=document.getElementById("mobCityGate"),within=document.getElementById("mobWithinCity");
  const searchInput=document.getElementById("mobCitySearch");
  if(!gate||!within)return;
  if(!mob.city||mob.cityGate){
    gate.style.display="block";within.style.display="none";
    if(searchInput){searchInput.placeholder="Search city, locality...";searchInput.oninput=function(){mobFilterCities(this.value);};const w=document.getElementById("mobCitySearchWrap");if(w)w.style.display="block";}
    mobRenderCityChips("");
  }else{
    gate.style.display="none";within.style.display="block";
    const w=document.getElementById("mobCitySearchWrap");if(w)w.style.display="none";
    const pill=document.getElementById("mobCityPillName");if(pill)pill.textContent=DATA[mob.city].cityName;
    mobRenderSelectedChips();
    const inp=document.getElementById("mobLocInput");
    mobRenderAcSuggestions(inp?inp.value:"");
    mobUpdateWhereNext();
  }
}
function mobUpdateWhereNext(){
  const btn=document.getElementById("mobWhereNext");if(!btn)return;
  const lbl=document.getElementById("mobWhereNextLabel");
  if(mob.locs.length>0){
    btn.style.display="block";
    if(lbl)lbl.textContent=mob.locs.length===1?"1 location selected · Next":mob.locs.length+" locations · Next";
  }else{
    btn.style.display="none";
  }
}
function mobRenderCityChips(filter){
  const container=document.getElementById("mobCityChips");if(!container)return;
  const emptyDiv=document.getElementById("mobCityEmpty");
  const labelEl=document.getElementById("mobCityPopularLabel");
  const fl=filter.toLowerCase();
  const keys=fl?CITY_KEYS.filter(k=>DATA[k].cityName.toLowerCase().includes(fl)):MOB_POPULAR;
  if(!keys.length){container.style.display="none";if(emptyDiv)emptyDiv.style.display="block";if(labelEl)labelEl.style.display="none";return;}
  if(emptyDiv)emptyDiv.style.display="none";
  container.style.display="flex";
  if(labelEl){labelEl.textContent=fl?"Results":"Popular cities";labelEl.style.display="block";}
  container.innerHTML=keys.map(k=>{const active=mob.city===k;const emoji=CITY_EMOJI[k];return`<button class="mob-city-chip" style="display:inline-flex;align-items:center;gap:6px;border:1.5px solid ${active?"#141414":"#e5e7eb"};background:${active?"#141414":"#fff"};color:${active?"#fff":"#141414"};padding:9px 14px;border-radius:999px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0" onclick="mobSelectCity('${k}')">${emoji?`<span>${emoji}</span>`:''}${escapeHtml(DATA[k].cityName)}</button>`;}).join("");
}
window.mobFilterCities=function(val){mobRenderCityChips(val.trim());};
window.mobSelectCity=function(key){
  const prev=mob.city;mob.city=key;mob.cityGate=false;
  if(prev&&prev!==key){mob.locs=[];mob.sel=null;mob.text="";const i=document.getElementById("mobLocInput");if(i)i.value="";}
  mobRenderWhereBody();mobRenderWhereVal();
  setTimeout(()=>document.getElementById("mobLocInput")?.focus(),80);
};
window.mobChangeCity=function(){mob.cityGate=true;mobRenderWhereBody();};
function mobRenderSelectedChips(){
  const container=document.getElementById("mobSelectedChips");const clearLink=document.getElementById("mobLocClearLink");
  if(!container)return;
  if(!mob.locs.length){container.style.display="none";if(clearLink)clearLink.style.display="none";return;}
  container.style.display="flex";if(clearLink)clearLink.style.display="";
  container.innerHTML=mob.locs.map((loc,i)=>`<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:999px;background:#f3f4f6;font-size:12px;color:#111">${escapeHtml(loc.name)}<button onclick="mobRemoveLoc(${i})" style="width:16px;height:16px;border-radius:50%;border:0;background:#ddd;cursor:pointer;font-size:10px;display:flex;align-items:center;justify-content:center;padding:0">×</button></span>`).join("");
}
window.mobRemoveLoc=function(i){mob.locs.splice(i,1);if(!mob.locs.length&&mob.sel&&mob.sel.type==="multi")mob.sel=null;mobRenderSelectedChips();mobRenderWhereVal();mobRenderAcSuggestions(document.getElementById("mobLocInput")?.value||"");mobUpdateWhereNext();};
window.mobClearLocs=function(){mob.locs=[];mob.sel=null;mob.text="";const i=document.getElementById("mobLocInput");if(i)i.value="";mobRenderSelectedChips();mobRenderAcSuggestions("");mobRenderWhereVal();mobUpdateWhereNext();};
function mobBuildSugg(q){const d=DATA[mob.city];const ids=new Set(mob.locs.map(x=>x.id));const qt=q.trim().toLowerCase();if(!qt)return{locs:d.locations.filter(x=>!ids.has(x.id)).slice(0,5),projs:d.projects.slice(0,4),pins:d.pincodes.slice(0,4)};return{locs:d.locations.filter(x=>x.name.toLowerCase().includes(qt)&&!ids.has(x.id)).slice(0,6),projs:d.projects.filter(x=>x.name.toLowerCase().includes(qt)).slice(0,5),pins:/^[0-9]+$/.test(qt)?d.pincodes.filter(x=>x.code.startsWith(qt)).slice(0,5):[]};}
function mobRenderAcSuggestions(query){
  const box=document.getElementById("mobAcBox");if(!box)return;
  if(!mob.city){box.innerHTML="";return;}
  const{locs,projs,pins}=mobBuildSugg(query);
  const hasAny=locs.length||projs.length||pins.length;
  let h="";
  if(!query.trim()&&!mob.locs.length){h+=`<div class="mob-ac-item" style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;cursor:pointer;font-size:14px" onclick="event.stopPropagation();mobSelectCitywide()"><span style="font-size:18px">🌆</span><div><div style="font-weight:600">All of ${escapeHtml(DATA[mob.city].cityName)}</div><div style="font-size:12px;color:#6b7280">Search across the entire city</div></div></div>`;}
  if(locs.length){h+='<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin:10px 4px 4px">Locations</div>';locs.forEach(loc=>{h+=`<div class="mob-ac-item" style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;cursor:pointer;font-size:14px" onclick="mobSelectLoc('${loc.id}')"><span>📍</span><div><div style="font-weight:500">${escapeHtml(loc.name)}</div><div style="font-size:12px;color:#6b7280">${escapeHtml(loc.area)}</div></div></div>`;});}
  if(projs.length){h+='<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin:10px 4px 4px">Projects</div>';projs.forEach(proj=>{h+=`<div class="mob-ac-item" style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;cursor:pointer;font-size:14px" onclick="mobSelectProject('${proj.id}')"><span>🏢</span><div><div style="font-weight:500">${escapeHtml(proj.name)}</div><div style="font-size:12px;color:#6b7280">${escapeHtml(proj.micro)}</div></div></div>`;});}
  if(query.trim()&&!hasAny)h='<div style="padding:24px;text-align:center;color:#9ca3af;font-size:14px">No results found</div>';
  box.innerHTML=h;
}
window.mobOnLocInput=function(val){mob.text=val;mob.sel=null;mobRenderAcSuggestions(val);};
window.mobSelectCitywide=function(){mob.locs=[];mob.sel={type:"citywide"};mob.text="";const i=document.getElementById("mobLocInput");if(i)i.value="";mobRenderSelectedChips();mobRenderAcSuggestions("");mobRenderWhereVal();mobOpenAcc("mode");};
window.mobSelectLoc=function(id){const loc=DATA[mob.city].locations.find(x=>x.id===id);if(!loc)return;if(mob.locs.some(x=>x.id===id))return;if(mob.locs.length>=MAX_MULTI){mobShowToast("Max "+MAX_MULTI+" locations");return;}mob.locs.push(loc);mob.sel={type:"multi"};mob.text="";const i=document.getElementById("mobLocInput");if(i)i.value="";mobRenderSelectedChips();mobRenderAcSuggestions("");mobRenderWhereVal();mobUpdateWhereNext();};
window.mobSelectProject=function(id){const proj=DATA[mob.city].projects.find(x=>x.id===id);if(!proj)return;mob.sel={type:"project",id:proj.id,meta:proj};mob.text=proj.name;mob.locs=[];const i=document.getElementById("mobLocInput");if(i)i.value=proj.name;mobRenderWhereVal();mobSubmitSearch();setTimeout(()=>mobShowToast("Opened: "+proj.name),200);};
window.mobSelectPin=function(id){const pin=DATA[mob.city].pincodes.find(x=>x.id===id);if(!pin)return;mob.sel={type:"pincode"};mob.text=pin.code;const i=document.getElementById("mobLocInput");if(i)i.value=pin.code;mobRenderWhereVal();mobOpenAcc("mode");};
window.mobSetMode=function(m){mob.mode=m;mobRenderModeVal();mobRenderModeBtns();};
window.mobSetType=function(t){mob.type=t;mobRenderTypeVal();mobRenderTypeBtns();};
function mobRenderModeVal(){const el=document.getElementById("mobModeVal");if(el)el.textContent=mob.mode==="buy"?"Buy":"Rent";}
function mobRenderTypeVal(){const el=document.getElementById("mobTypeVal");if(el)el.textContent=mob.type==="homes"?"Homes":mob.type==="workspaces"?"Workspaces":"Land";}
function mobRenderModeBtns(){document.querySelectorAll(".mob-mode-btn").forEach(btn=>{const a=btn.dataset.m===mob.mode;if(a)btn.classList.add("chosen");else btn.classList.remove("chosen");btn.style.fontWeight=a?"600":"500";});mobSyncCollapsedVals();}
function mobRenderTypeBtns(){document.querySelectorAll(".mob-type-btn").forEach(btn=>{const a=btn.dataset.t===mob.type;if(a)btn.classList.add("chosen");else btn.classList.remove("chosen");btn.style.fontWeight=a?"600":"500";});mobSyncCollapsedVals();}
window.mobClearAll=function(){mob.city="";mob.mode="buy";mob.type="homes";mob.locs=[];mob.sel=null;mob.text="";mob.cityGate=true;const i=document.getElementById("mobLocInput");if(i)i.value="";const cs=document.getElementById("mobCitySearch");if(cs)cs.value="";mobRenderAll();mobOpenAcc("where");};
let mobToastT;
function mobShowToast(msg){const t=document.getElementById("mobToast");if(!t)return;t.textContent=msg;t.style.opacity="1";clearTimeout(mobToastT);mobToastT=setTimeout(()=>{t.style.opacity="0";},2800);}

/* ═══ INIT ═══ */
document.addEventListener("DOMContentLoaded",()=>{
  renderChips();
  const wi=$("#whereInput");
  wi.addEventListener("focus",()=>{if(!city){cityGateForced=true;openPanel();wi.blur();return;}openPanel();});
  wi.addEventListener("pointerdown",e=>{if(!city){e.preventDefault();cityGateForced=true;openPanel();setTimeout(()=>document.getElementById("deskCitySearch")?.focus(),30);}});
  wi.addEventListener("keydown",e=>{
    if(!city){e.preventDefault();cityGateForced=true;openPanel();setTimeout(()=>document.getElementById("deskCitySearch")?.focus(),30);return;}
    if(e.key==="Enter"){e.preventDefault();if(!city){openPanel();return;}syncWhereTextFromMulti();closePanel();}
  });
  wi.addEventListener("input",()=>{if(!city)return;whereText=wi.value;selection=null;renderPanel();});
  $("#clearBtn").addEventListener("click",e=>{
    e.stopPropagation();selection=null;whereText="";wi.value="";multiLocs=[];
    renderChips();cityGateForced=!city;openPanel();
    setTimeout(()=>{if(city)wi.focus();else document.getElementById("deskCitySearch")?.focus();},30);
  });
  $("#modeBtn").addEventListener("click",e=>{e.stopPropagation();closePanel();typePop_=false;renderTypePop();modePop_=!modePop_;renderModePop();});
  $("#typeBtn").addEventListener("click",e=>{e.stopPropagation();closePanel();modePop_=false;renderModePop();typePop_=!typePop_;renderTypePop();});
  $("#goBtn").addEventListener("click",()=>{
    if(!city){cityGateForced=true;openPanel();setTimeout(()=>document.getElementById("deskCitySearch")?.focus(),30);return;}
    syncWhereTextFromMulti();closePanel();
  });
  document.addEventListener("pointerdown",e=>{
    if(panelOpen&&!$("#wherePill").contains(e.target))closePanel();
    if(modePop_&&!$("#modeWrap").contains(e.target)){modePop_=false;renderModePop();}
    if(typePop_&&!$("#typeWrap").contains(e.target)){typePop_=false;renderTypePop();}
  });
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){closePanel();modePop_=false;typePop_=false;renderModePop();renderTypePop();wi.blur();}
  });

  /* ── FILTER CHIPS ── */
  document.querySelectorAll(".fchip,.chip").forEach(chip=>{
    chip.addEventListener("click",()=>{
      chip.closest("div").querySelectorAll(".fchip,.chip").forEach(c=>c.classList.remove("active"));
      chip.classList.add("active");
    });
  });

  /* ── NAV SCROLL ── */
  let navCol=false,navForceOpen=false;
  const nTabs=$("#navTabs"),cS=$("#compactSearch"),eS=$("#expandedSearch"),mN=$("#mainNav"),midS=$("#midSearchTrigger"),midSm=$("#midSmallTrigger");
  const isMidScreen=()=>window.innerWidth>=744&&window.innerWidth<1080;
  const isMidLarge=()=>window.innerWidth>=992&&window.innerWidth<1080;
  const isMidSmall=()=>window.innerWidth>=744&&window.innerWidth<992;
  function showMidTrigger(){if(isMidSmall()){if(midSm)midSm.style.display="flex";if(midS)midS.style.display="none";}else{if(midS)midS.style.display="flex";if(midSm)midSm.style.display="none";}}
  function hideMidTriggers(){if(midS)midS.style.display="none";if(midSm)midSm.style.display="none";}
  const overlay=document.createElement("div");overlay.className="nav-overlay";document.body.appendChild(overlay);
  overlay.addEventListener("click",()=>{navForceOpen=false;collapseNav();closePanel();});
  const dNR=$("#desktopNavRow");
  function collapseNav(){navCol=true;navForceOpen=false;overlay.classList.remove("active");eS.style.display="none";eS.style.pointerEvents="none";hideMidTriggers();nTabs.style.display="none";cS.style.display="flex";void cS.offsetWidth;cS.style.opacity="1";cS.style.transform="scale(1)";if(dNR)dNR.style.height="68px";mN.style.boxShadow="0 1px 0 rgba(0,0,0,.08)";mN.style.borderBottom="1px solid transparent";mN.classList.remove("nav-force-open");}
  function expandNav(){navCol=false;cS.style.opacity="0";cS.style.transform="scale(0.92)";if(dNR)dNR.style.height="";mN.style.borderBottom="1px solid var(--rule)";setTimeout(()=>{cS.style.display="none";nTabs.style.display="none";if(isMidScreen()){eS.style.display="none";showMidTrigger();}else{eS.style.display="flex";hideMidTriggers();}eS.style.pointerEvents="auto";if(navForceOpen)mN.classList.add("nav-force-open");},150);mN.style.boxShadow="none";if(navForceOpen)overlay.classList.add("active");}
  cS.style.display="none";
  let mobTabsHidden=false;
  const mobTabsRow=document.getElementById("mobTabsRow");
  window.addEventListener("scroll",()=>{
    const y=window.scrollY;
    const isMob=window.innerWidth<744;
    if(isMob){
      const msr=document.getElementById("mobSearchRow");
      if(y>8&&!mobTabsHidden){
        mobTabsRow.classList.add("tabs-scrolled");mobTabsHidden=true;
        mN.style.boxShadow="0 1px 0 rgba(0,0,0,.07),0 2px 8px rgba(0,0,0,.04)";
        if(msr)msr.classList.add("mob-scrolled");
      }
      else if(y<=8&&mobTabsHidden){
        mobTabsRow.classList.remove("tabs-scrolled");mobTabsHidden=false;
        mN.style.boxShadow="none";
        if(msr)msr.classList.remove("mob-scrolled");
      }
    }else if(!isMidScreen()){
      if(y>8&&!navCol&&!navForceOpen){collapseNav();}
      else if(y<=8&&navCol&&!navForceOpen){expandNav();}
    }else{
      if(y>8){
        mN.style.boxShadow="0 1px 0 rgba(0,0,0,.07),0 2px 8px rgba(0,0,0,.04)";
        if(dNR)dNR.style.height="72px";
        mN.classList.add("mid-scrolled");
      }else{
        mN.style.boxShadow="none";
        if(dNR)dNR.style.height="";
        mN.classList.remove("mid-scrolled");
      }
    }
  },{passive:true});
  cS.addEventListener("click",()=>{if(isMidScreen()){openMobileSearch();return;}navForceOpen=true;expandNav();setTimeout(()=>{openPanel();$("#whereInput")?.focus();},350);});
  document.addEventListener("pointerdown",e=>{if(navForceOpen&&!mN.contains(e.target)&&!e.target.closest("#wherePanel")&&!e.target.closest("#modePop")&&!e.target.closest("#typePop")){navForceOpen=false;closePanel();if(window.scrollY>50)collapseNav();}});

  /* ── RESIZE: reset nav state on breakpoint cross ── */
  let lastWasMid=isMidScreen(), lastWasLarge=window.innerWidth>=1080;
  window.addEventListener("resize",()=>{
    const mid=isMidScreen(), large=window.innerWidth>=1080, mob=window.innerWidth<744;
    if(mid){
      if(!lastWasMid){
        navCol=false;navForceOpen=false;
        eS.style.display="none";eS.style.pointerEvents="none";
        cS.style.display="none";cS.style.opacity="";cS.style.transform="";
        nTabs.style.display="none";
        if(dNR)dNR.style.height="";
        mN.style.boxShadow="none";mN.classList.remove("nav-force-open");
        overlay.classList.remove("active");
      }
      showMidTrigger();
    }else if(large&&!lastWasLarge){
      navCol=false;navForceOpen=false;
      cS.style.display="none";cS.style.opacity="";cS.style.transform="";
      nTabs.style.display="none";hideMidTriggers();
      eS.style.display="";eS.style.pointerEvents="auto";
      if(dNR)dNR.style.height="";
      mN.style.boxShadow="none";mN.classList.remove("nav-force-open");
      overlay.classList.remove("active");
    }
    syncAllSearchBars();
    lastWasMid=mid;lastWasLarge=large;
  });

  /* ── GSAP (nav scroll handled by the main hero entrance block below) ── */
  gsap.registerPlugin(ScrollTrigger);

  /* ═══ SECTION ANIMATIONS ═══ */
  const _e="power3.out";
  function _up(selector,delay){
    const nodes=typeof selector==='string'?document.querySelectorAll(selector):[selector];
    nodes.forEach((el,i)=>{
      if(!el)return;
      /* Skip elements already in viewport */
      var rect=el.getBoundingClientRect();
      if(rect.top<window.innerHeight*0.85){return;}
      /* Set hidden immediately, reveal on scroll */
      gsap.set(el,{opacity:0,y:18});
      ScrollTrigger.create({trigger:el,start:"top 85%",once:true,
        onEnter:function(){
          gsap.to(el,{opacity:1,y:0,duration:0.65,ease:_e,delay:(delay||0)+i*0.08});
        }
      });
    });
  }

  /* Apply reveal to all major content elements across all sections */
  document.querySelectorAll('#smooth-content > section').forEach(function(sec){
    /* Section-level: eyebrows, headings, leads, wrappers' direct children */
    sec.querySelectorAll('.eyebrow, .display, .lead, .ed2-hero, .ed2-card, .ed2-chips, .intl2-report, .intl2-card, .intl2-chips, .ds-hdr, .ds-hero, .ds-sc, .ds-cc, .ds-dc, .ds-spot, .ds-ctas, .gt-ep-row, .gt-card, .gt-ctas, .voice-card, .iv-feat, .iv-card, .iv-ctas, .ge-flag, .ge-card, .ge-ctas, .ge-strip-item, .ev-mini, .svc-card, .tool-card, .eco-section-header, .eco-card, .fb-hero, .fb-sp, .fd-header, .fd-visual, .fd-desc, .fd-features, .fd-cta-row, .vw-hdr, .vw-pipeline, .vw-card, .vw-cta, .bc-hdr, .bc-stat, .bc-card, .bc-cta, .cn-hdr, .cn-left, .cn-dash, .cn-benefit, .ppl-hdr, .ppl-track-wrap, .gs-hdr, .gs-card, .gs-cta, .tl-hdr, .tl-card, .eco-hdr').forEach(function(el){
      _up(el);
    });
  });

  /* Clear GSAP inline styles after reveal so CSS hover works */
  document.querySelectorAll('.ds-hero,.ds-sc,.ds-cc,.ds-dc,.iv-feat,.iv-card,.ge-flag,.ge-card,.vw-card,.bc-card,.gs-card,.tl-card').forEach(function(el){
    ScrollTrigger.create({
      trigger:el,start:"top 85%",once:true,
      onEnter:function(){
        setTimeout(function(){
          el.style.removeProperty('transform');
          el.style.removeProperty('translate');
          el.style.removeProperty('rotate');
          el.style.removeProperty('scale');
          el.style.removeProperty('opacity');
        },1200);
      }
    });
  });

  /* ── People auto-playing carousel ── */
  (function(){
    var wrap=document.getElementById('pplTrackWrap');
    var track=document.getElementById('pplTrack');
    if(!wrap||!track)return;
    var GAP=24;
    var slides=track.querySelectorAll('.ppl-slide');
    var total=slides.length;
    var current=0;
    var autoTimer=null;
    var INTERVAL=4000;

    function cardW(){var s=slides[0];return s?s.offsetWidth+GAP:420;}
    function maxX(){return -(track.scrollWidth-wrap.offsetWidth);}
    function goTo(idx,dur){
      current=idx;
      var target=Math.max(maxX(),Math.min(0,-idx*cardW()));
      gsap.to(track,{x:target,duration:dur||0.7,ease:'power2.inOut'});
    }
    function advance(){
      if(current>=total-1)goTo(0,0.9);
      else goTo(current+1);
    }
    function startAuto(){stopAuto();autoTimer=setInterval(advance,INTERVAL);}
    function stopAuto(){if(autoTimer){clearInterval(autoTimer);autoTimer=null;}}

    /* Start auto-play only when in viewport */
    var pplObs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){startAuto();}else{stopAuto();}
      });
    },{threshold:0.15});
    pplObs.observe(wrap);

    wrap.addEventListener('mouseenter',stopAuto);
    wrap.addEventListener('mouseleave',function(){if(wrap.getBoundingClientRect().top<window.innerHeight)startAuto()});

    var prev=document.getElementById('pplPrev');
    var next=document.getElementById('pplNext');
    if(prev)prev.addEventListener('click',function(){stopAuto();if(current>0)goTo(current-1);else goTo(total-1);startAuto();});
    if(next)next.addEventListener('click',function(){stopAuto();advance();startAuto();});

    /* Pointer drag with velocity - touch-aware */
    var isDragging=false,isLocked=false,dragStartX=0,dragStartY=0,dragStartVal=0;
    var lastDragX=0,lastDragT=0,velX=0,curX=0,hasMoved=false,pointerId=null;
    function getX(){var t=gsap.getProperty(track,'x');return typeof t==='number'?t:0;}

    /* Prevent click if dragged */
    wrap.addEventListener('click',function(e){if(hasMoved)e.preventDefault();},true);

    wrap.addEventListener('pointerdown',function(e){
      if(e.pointerType==='mouse'||e.pointerType==='pen'){
        wrap.setPointerCapture(e.pointerId);
      }
      gsap.killTweensOf(track);stopAuto();
      isDragging=true;isLocked=false;hasMoved=false;
      dragStartX=lastDragX=e.clientX;dragStartY=e.clientY;
      curX=dragStartVal=getX();
      lastDragT=Date.now();velX=0;pointerId=e.pointerId;
    });
    wrap.addEventListener('pointermove',function(e){
      if(!isDragging)return;
      var dx=e.clientX-dragStartX;
      var dy=e.clientY-dragStartY;
      /* On touch: wait for clear horizontal intent before locking */
      if(!isLocked&&e.pointerType==='touch'){
        if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){
          isDragging=false;return;/* vertical scroll - release */
        }
        if(Math.abs(dx)>8){
          isLocked=true;
          wrap.setPointerCapture(pointerId);
          wrap.classList.add('is-dragging');
        }
        return;
      }
      if(!isLocked&&e.pointerType!=='touch'){isLocked=true;wrap.classList.add('is-dragging');}
      var now=Date.now(),dt=Math.max(now-lastDragT,1);
      velX=(e.clientX-lastDragX)/dt;
      lastDragX=e.clientX;lastDragT=now;
      if(Math.abs(dx)>5)hasMoved=true;
      curX=dragStartVal+dx;
      curX=Math.max(maxX(),Math.min(0,curX));
      gsap.set(track,{x:curX});
    });
    wrap.addEventListener('pointerup',function(){
      if(!isDragging&&!isLocked){startAuto();return;}
      isDragging=false;
      wrap.classList.remove('is-dragging');
      if(!isLocked){startAuto();return;}
      isLocked=false;
      var momentum=velX*400;
      var target=Math.max(maxX(),Math.min(0,curX+momentum));
      current=Math.max(0,Math.min(total-1,Math.round(-target/cardW())));
      gsap.to(track,{x:Math.max(maxX(),Math.min(0,-current*cardW())),duration:0.7,ease:'power3.out'});
      startAuto();
    });
    wrap.addEventListener('pointercancel',function(){
      isDragging=false;isLocked=false;wrap.classList.remove('is-dragging');startAuto();
    });
  })();

  /* ── Brands auto-playing carousel ── */
  (function(){
    var wrap=document.getElementById('brdTrackWrap');
    var track=document.getElementById('brdTrack');
    if(!wrap||!track)return;
    var GAP=24;
    var slides=track.querySelectorAll('.brd-slide');
    var total=slides.length;
    var current=0;
    var autoTimer=null;
    var INTERVAL=4000;

    function cardW(){var s=slides[0];return s?s.offsetWidth+GAP:320;}
    function maxX(){return -(track.scrollWidth-wrap.offsetWidth);}
    function goTo(idx,dur){
      current=idx;
      var target=Math.max(maxX(),Math.min(0,-idx*cardW()));
      gsap.to(track,{x:target,duration:dur||0.7,ease:'power2.inOut'});
    }
    function advance(){
      if(current>=total-1)goTo(0,0.9);
      else goTo(current+1);
    }
    function startAuto(){stopAuto();autoTimer=setInterval(advance,INTERVAL);}
    function stopAuto(){if(autoTimer){clearInterval(autoTimer);autoTimer=null;}}

    var brdObs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){startAuto();}else{stopAuto();}
      });
    },{threshold:0.15});
    brdObs.observe(wrap);

    wrap.addEventListener('mouseenter',stopAuto);
    wrap.addEventListener('mouseleave',function(){if(wrap.getBoundingClientRect().top<window.innerHeight)startAuto()});

    var prev=document.getElementById('brdPrev');
    var next=document.getElementById('brdNext');
    if(prev)prev.addEventListener('click',function(){stopAuto();if(current>0)goTo(current-1);else goTo(total-1);startAuto();});
    if(next)next.addEventListener('click',function(){stopAuto();advance();startAuto();});

    /* Pointer drag */
    var isDragging=false,isLocked=false,dragStartX=0,dragStartY=0,dragStartVal=0;
    var lastDragX=0,lastDragT=0,velX=0,curX=0,hasMoved=false,pointerId=null;
    function getX(){var t=gsap.getProperty(track,'x');return typeof t==='number'?t:0;}

    wrap.addEventListener('click',function(e){if(hasMoved)e.preventDefault();},true);

    wrap.addEventListener('pointerdown',function(e){
      if(e.pointerType==='mouse'||e.pointerType==='pen'){
        wrap.setPointerCapture(e.pointerId);
      }
      gsap.killTweensOf(track);stopAuto();
      isDragging=true;isLocked=false;hasMoved=false;
      dragStartX=lastDragX=e.clientX;dragStartY=e.clientY;
      curX=dragStartVal=getX();
      lastDragT=Date.now();velX=0;pointerId=e.pointerId;
    });
    wrap.addEventListener('pointermove',function(e){
      if(!isDragging)return;
      var dx=e.clientX-dragStartX;
      var dy=e.clientY-dragStartY;
      if(!isLocked&&e.pointerType==='touch'){
        if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){
          isDragging=false;return;
        }
        if(Math.abs(dx)>8){
          isLocked=true;
          wrap.setPointerCapture(pointerId);
          wrap.classList.add('is-dragging');
        }
        return;
      }
      if(!isLocked&&e.pointerType!=='touch'){isLocked=true;wrap.classList.add('is-dragging');}
      var now=Date.now(),dt=Math.max(now-lastDragT,1);
      velX=(e.clientX-lastDragX)/dt;
      lastDragX=e.clientX;lastDragT=now;
      if(Math.abs(dx)>5)hasMoved=true;
      curX=dragStartVal+dx;
      curX=Math.max(maxX(),Math.min(0,curX));
      gsap.set(track,{x:curX});
    });
    wrap.addEventListener('pointerup',function(){
      if(!isDragging&&!isLocked){startAuto();return;}
      isDragging=false;
      wrap.classList.remove('is-dragging');
      if(!isLocked){startAuto();return;}
      isLocked=false;
      var momentum=velX*400;
      var target=Math.max(maxX(),Math.min(0,curX+momentum));
      current=Math.max(0,Math.min(total-1,Math.round(-target/cardW())));
      gsap.to(track,{x:Math.max(maxX(),Math.min(0,-current*cardW())),duration:0.7,ease:'power3.out'});
      startAuto();
    });
    wrap.addEventListener('pointercancel',function(){
      isDragging=false;isLocked=false;wrap.classList.remove('is-dragging');startAuto();
    });
  })();

});

/* ── SCROLL SMOOTHER ── */
/* Remove ATF fallback — GSAP now controls entrance animations */
document.documentElement.classList.remove('gsap-pending');
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/* ── Mobile viewport stability ── */
/* Lock viewport height on mobile to prevent Chrome URL bar hide/show from causing layout jumps */
(function(){
  if(window.innerWidth >= 1024) return;
  /* Set --vh once on load, don't update on resize */
  var vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', vh + 'px');
  /* Tell ScrollTrigger to ignore mobile address bar resizes */
  ScrollTrigger.config({ ignoreMobileResize: true });
  /* Prevent ScrollTrigger from refreshing on small vertical resizes (URL bar) */
  var lastWidth = window.innerWidth;
  ScrollTrigger.addEventListener('refreshInit', function(){
    if(window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
  });
  /* Debounce refresh - only on orientation change, not URL bar */
  var refreshTimeout;
  window.addEventListener('resize', function(){
    if(window.innerWidth === lastWidth) return; /* vertical-only resize = URL bar, skip */
    lastWidth = window.innerWidth;
    clearTimeout(refreshTimeout);
    refreshTimeout = setTimeout(function(){ ScrollTrigger.refresh(); }, 300);
  });
})();
if(window.innerWidth >= 744){
  ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.2,
    effects: true
  });
}

/* ── HERO ENTRANCE ── */
/* ATF-first: nav visible via CSS fallback (.gsap-pending), hero animated via gsap.to() */
const isMob = window.innerWidth < 744;

if(isMob){
  // Mobile: layered reveal animation
  gsap.set('[data-anim]',{opacity:0,y:30});
  gsap.set('.hero-desc',{opacity:0,y:20});
  gsap.set('.eco-section',{opacity:0,y:40});
  const intro = gsap.timeline({delay:0.05});
  intro.from("#mainNav",{y:-80,opacity:0,duration:0.7,ease:"power3.out",clearProps:"all"},0);
  intro.to("#heroTop",{y:0,opacity:1,duration:0.5,ease:"expo.out"},0.2);
  intro.to('[data-anim="0"]',{opacity:1,y:0,duration:0.6,ease:"power2.out"},0.35);
  intro.to('[data-anim="1"]',{opacity:1,y:0,duration:0.8,ease:"back.out(1.4)"},0.5);
  intro.to('[data-anim="2"]',{opacity:1,y:0,duration:0.8,ease:"back.out(1.4)"},0.75);
  // Description fade in
  intro.to('.hero-desc',{opacity:1,y:0,duration:0.6,ease:"power2.out"}, 1.1);
  // Eco cards slide up
  intro.to('.eco-section',{opacity:1,y:0,duration:0.8,ease:"power2.out"}, 1.4);

} else {
  // Desktop: elegant entrance with proper timing
  const intro = gsap.timeline({delay:0.05});
  intro.from("#mainNav",{y:-80,opacity:0,duration:0.8,ease:"power3.out",clearProps:"all"},0);
  intro.to("#heroTop",{y:0,opacity:1,duration:1.0,ease:"expo.out"},0.25);
  // Cards stagger in - slow, confident reveal
  intro.from(".eco-card",{opacity:0, y:32, stagger:0.18, duration:0.9, ease:"back.out(1.2)"},0.7);
  // Illustrations fade in after cards
  intro.from(".eco-card-illus",{opacity:0, scale:0.9, stagger:0.12, duration:0.7, ease:"power2.out"},1.2);
}


/* Explore anchor removed */

/* ── ECO CAROUSEL - 1-up mobile / 2-up tablet ── */
/* Eco carousel - dots + autoplay (drag handled by shared drag-scroll utility) */
(function(){
  var track = document.getElementById('ecoTrack');
  var dotsWrap = document.getElementById('ecoDots');
  if(!track || !dotsWrap) return;
  var cards = Array.from(track.querySelectorAll('.eco-card'));
  var dots = [];
  var INTERVAL = 4000, resumeDelay = 5000;
  var autoTimer = null, resumeTimer = null;
  function isDesktop(){ return window.innerWidth >= 1080; }

  function getSnapCount(){
    if(isDesktop()) return 0;
    var maxScroll = track.scrollWidth - track.clientWidth;
    if(maxScroll <= 2) return 1;
    /* Center-mode: every card is a snap position */
    return cards.length;
  }

  function buildDots(){
    var count = getSnapCount();
    if(count === dots.length) return;
    dotsWrap.innerHTML = '';
    dots = [];
    for(var i = 0; i < count; i++){
      var btn = document.createElement('button');
      btn.className = 'eco-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('data-i', i);
      btn.addEventListener('click', (function(idx){
        return function(){ goTo(idx); pauseAuto(); };
      })(i));
      dotsWrap.appendChild(btn);
      dots.push(btn);
    }
  }

  function getActive(){
    /* Center-mode: find card closest to viewport center */
    var viewCenter = track.scrollLeft + track.clientWidth / 2;
    var best = 0, bestDist = Infinity;
    for(var i = 0; i < cards.length; i++){
      var cardCenter = cards[i].offsetLeft + cards[i].offsetWidth / 2;
      var d = Math.abs(cardCenter - viewCenter);
      if(d < bestDist){ bestDist = d; best = i; }
    }
    return best;
  }

  function updateDots(){
    var active = getActive();
    dots.forEach(function(d, i){ d.classList.toggle('active', i === active); });
  }

  function goTo(i){
    if(isDesktop() || !cards[i]) return;
    /* Disable snap during animation so GSAP can smoothly scroll */
    track.classList.add('is-animating');
    var target = cards[i].offsetLeft + cards[i].offsetWidth / 2 - track.clientWidth / 2;
    target = Math.max(0, Math.min(target, track.scrollWidth - track.clientWidth));
    gsap.to(track, { scrollLeft:target, duration:0.6, ease:'power2.out', overwrite:true,
      onComplete:function(){ track.classList.remove('is-animating'); }
    });
  }

  var scrollRaf = null;
  track.addEventListener('scroll', function(){
    if(scrollRaf) return;
    scrollRaf = requestAnimationFrame(function(){ updateDots(); scrollRaf = null; });
  }, {passive:true});

  /* ── One-slide-at-a-time drag (no momentum) ── */
  var dragStartX = 0, dragActive = false, dragMoved = false;
  track.addEventListener('mousedown', function(e){
    if(isDesktop() || e.button !== 0 || track.scrollWidth <= track.clientWidth + 2) return;
    dragActive = true; dragMoved = false;
    dragStartX = e.clientX;
    track.style.cursor = 'grabbing';
    stopAuto();
    e.preventDefault();
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragUp);
  });
  function onDragMove(e){ e.preventDefault(); dragMoved = true; }
  function onDragUp(e){
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragUp);
    if(!dragActive) return;
    dragActive = false;
    track.style.cursor = '';
    var dx = e.clientX - dragStartX;
    var current = getActive();
    if(dragMoved && Math.abs(dx) > 30){
      goTo(dx < 0 ? Math.min(current + 1, cards.length - 1) : Math.max(current - 1, 0));
    }
    resumeTimer = setTimeout(startAuto, resumeDelay);
  }
  track.addEventListener('click', function(e){ if(dragMoved){ e.preventDefault(); e.stopPropagation(); dragMoved = false; } }, true);

  /* Touch: native snap handles one-slide behavior, just manage autoplay */
  track.addEventListener('touchstart', function(){ stopAuto(); }, {passive:true});
  track.addEventListener('touchend', function(){ resumeTimer = setTimeout(startAuto, resumeDelay); }, {passive:true});

  function autoAdvance(){
    if(isDesktop()) return;
    var count = dots.length;
    var next = (getActive() + 1) % count;
    goTo(next);
  }
  function startAuto(){
    stopAuto();
    if(!isDesktop()) autoTimer = setInterval(autoAdvance, INTERVAL);
  }
  function stopAuto(){
    if(autoTimer){ clearInterval(autoTimer); autoTimer = null; }
    if(resumeTimer){ clearTimeout(resumeTimer); resumeTimer = null; }
  }
  function pauseAuto(){
    stopAuto();
    resumeTimer = setTimeout(startAuto, resumeDelay);
  }

  buildDots();
  /* Auto-play only when in viewport and on mobile */
  var edObs=new IntersectionObserver(function(entries){entries.forEach(function(e){
    if(e.isIntersecting&&!isDesktop())startAuto();else stopAuto();
  })},{threshold:0.15});
  edObs.observe(track);
  var resizeTimer;
  window.addEventListener('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      buildDots();
      if(isDesktop()) stopAuto();
      else if(!autoTimer&&track.getBoundingClientRect().top<window.innerHeight) startAuto();
      updateDots();
    }, 150);
  });
})();

/* ── HORIZONTAL SCROLL SECTION ── */
const hTrack = document.getElementById("hscrollTrack");
const hPanels = document.querySelectorAll(".hscroll-panel");
const progressBar = document.getElementById("hscrollProgress");

if(hTrack && hPanels.length > 1 && window.innerWidth >= 744) {
  const totalWidth = (hPanels.length - 1) * window.innerWidth;

  gsap.to(hTrack, {
    x: -totalWidth,
    ease:"none",
    scrollTrigger:{
      trigger: "#hscrollOuter",
      pin: true,
      scrub: 0.8,
      start: "top top",
      end: () => `+=${totalWidth}`,
      invalidateOnRefresh: true,
      onUpdate: self => {
        if(progressBar) progressBar.style.width = (25 + self.progress * 75) + "%";
      }
    }
  });

  // Parallax within each panel's content
  hPanels.forEach((panel, i) => {
    const content = panel.querySelector(".hscroll-content");
    if(content) {
      gsap.from(content, {
        opacity: 0,
        x: 40,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger:{
          trigger: panel,
          containerAnimation: ScrollTrigger.getById("hscroll"),
          start: "left 70%",
          toggleActions: "play none none reverse"
        }
      });
    }
  });
}

/* ── GSAP MARQUEE (enhanced with direction-awareness) ── */
// The CSS handles the infinite loop; GSAP reverses on scroll direction
let tickerDir = 1;
const tickerTrackEl = document.getElementById("tickerTrack");
if(tickerTrackEl) {
  ScrollTrigger.create({
    onUpdate: (self) => {
      const newDir = self.direction;
      if(newDir !== tickerDir) {
        tickerDir = newDir;
        tickerTrackEl.style.animationDirection = newDir === -1 ? "reverse" : "normal";
      }
    }
  });
}

/* ── SECTION REVEAL UTILITY ── */
function revealUp(selector, delay) {
  document.querySelectorAll(selector).forEach((el, i) => {
    gsap.from(el, {
      opacity:0, y:16, duration:0.7, ease:"power3.out",
      delay: (delay||0) + i*0.06,
      scrollTrigger:{trigger:el, start:"top 94%", once:true}
    });
  });
}
revealUp(".hscroll-content");

/* ── DRAGGABLE horizontal scroll on mobile ── */
if(window.innerWidth < 744 && hTrack) {
  Draggable.create(hTrack, {
    type:"x",
    bounds:{minX: -((hPanels.length-1) * window.innerWidth), maxX:0},
    inertia: true,
    cursor:"grab",
    activeCursor:"grabbing"
  });
}

/* YouTube facade: click thumbnail → load iframe */
function gtPlayVideo(el){
  if(el.querySelector('iframe')) return;
  var img=el.querySelector('img');
  var play=document.getElementById('gtPlayBtn');
  var tag=el.querySelector('.gt-feat__tag');
  var dur=el.querySelector('.gt-feat__dur');
  var iframe=document.createElement('iframe');
  iframe.src='https://www.youtube.com/embed/m0us2RQGskA?autoplay=1&rel=0&modestbranding=1';
  iframe.allow='accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture';
  iframe.allowFullscreen=true;
  if(img)img.style.display='none';
  if(play)play.style.display='none';
  if(tag)tag.style.display='none';
  if(dur)dur.style.display='none';
  el.appendChild(iframe);
}

/* Episode cards carousel nav */
(function(){
  var grid=document.getElementById('gtGrid');
  if(!grid) return;
  var prev=document.getElementById('gtPrev'),next=document.getElementById('gtNext'),count=document.getElementById('gtCount');
  var items=grid.children,total=items.length;
  function getActive(){var s=grid.scrollLeft,b=0,bd=Infinity;for(var i=0;i<total;i++){var d=Math.abs(items[i].offsetLeft-s);if(d<bd){bd=d;b=i;}}return b;}
  function update(){count.textContent=(getActive()+1)+' / '+total;}
  function scrollTo(i){var t=items[Math.max(0,Math.min(i,total-1))];gsap.to(grid,{scrollLeft:t.offsetLeft,duration:.5,ease:'power2.out'});setTimeout(update,550);}
  prev.addEventListener('click',function(){scrollTo(getActive()-1);});
  next.addEventListener('click',function(){scrollTo(getActive()+1);});
  grid.addEventListener('scroll',function(){requestAnimationFrame(update);});
  update();
})();

(function(){
  var grid=document.getElementById('ivGrid');
  if(!grid) return;
  var prev=document.getElementById('ivPrev'),next=document.getElementById('ivNext'),count=document.getElementById('ivCount');
  var items=grid.children,total=items.length;
  function getActive(){var s=grid.scrollLeft,b=0,bd=Infinity;for(var i=0;i<total;i++){var d=Math.abs(items[i].offsetLeft-grid.offsetLeft-s);if(d<bd){bd=d;b=i;}}return b;}
  function update(){count.textContent=(getActive()+1)+' / '+total;}
  function scrollTo(i){var t=items[Math.max(0,Math.min(i,total-1))];gsap.to(grid,{scrollLeft:t.offsetLeft-grid.offsetLeft,duration:.5,ease:'power2.out'});setTimeout(update,550);}
  prev.addEventListener('click',function(){scrollTo(getActive()-1);});
  next.addEventListener('click',function(){scrollTo(getActive()+1);});
  grid.addEventListener('scroll',function(){requestAnimationFrame(update);});
  update();
})();

(function(){
  /* ── Word-reveal on scroll for broker description ── */
  gsap.to(".fb-rw",{
    color:"var(--muted)",
    stagger:0.03,
    ease:"none",
    scrollTrigger:{
      trigger:"#fbRevealBlock",
      start:"top 85%",
      end:"top 40%",
      scrub:0.5
    }
  });

  /* ── Entrance animations for section elements ── */
  var sec = document.getElementById('forBrokers');
  if(!sec) return;

  var hero = sec.querySelector('.fb-hero');
  var features = sec.querySelector('.fb-features');
  var spCard = sec.querySelector('.fb-sp');

  /* Set initial states */
  if(hero) gsap.set(hero, { opacity: 0, y: 40 });
  gsap.set(features, { opacity: 0 });
  gsap.set(spCard, { opacity: 0, y: 36 });

  /* Hero entrance */
  if(hero) ScrollTrigger.create({
    trigger: hero, start: 'top 80%', once: true,
    onEnter: function(){ gsap.to(hero, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }); }
  });

  /* Ticker fade in */
  ScrollTrigger.create({
    trigger: features, start: 'top 85%', once: true,
    onEnter: function(){ gsap.to(features, { opacity: 1, duration: 0.6, ease: 'power2.out' }); }
  });

  /* SuperPro - wipe reveal + stagger */
  var spLogo = spCard ? spCard.querySelector('.fb-sp-logo') : null;
  var spDesc = spCard ? spCard.querySelector('.fb-sp-desc') : null;
  var spFeats = spCard ? spCard.querySelectorAll('.fb-sp-feat') : [];
  var spCta = spCard ? spCard.querySelector('.fb-sp-cta-row') : null;

  if(spLogo) gsap.set(spLogo, { clipPath: 'inset(0 100% 0 0)' });
  if(spDesc) gsap.set(spDesc, { opacity: 0 });
  if(spFeats.length) gsap.set(spFeats, { opacity: 0, y: 20 });
  if(spCta) gsap.set(spCta, { opacity: 0 });

  ScrollTrigger.create({
    trigger: spCard, start: 'top 75%', once: true,
    onEnter: function(){
      gsap.to(spCard, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
      if(spLogo) gsap.to(spLogo, { clipPath: 'inset(0 0% 0 0)', duration: 1, delay: 0.15, ease: 'power3.inOut' });
      if(spDesc) gsap.to(spDesc, { opacity: 1, duration: 0.5, delay: 0.8, ease: 'power2.out' });
      if(spFeats.length) gsap.to(spFeats, { opacity: 1, y: 0, duration: 0.5, delay: 1.0, stagger: 0.08, ease: 'power2.out' });
      if(spCta) gsap.to(spCta, { opacity: 1, duration: 0.5, delay: 1.4, ease: 'power2.out' });
    }
  });
})();

(function(){
  var svg = document.querySelector('.fb-orbit-svg');
  if(!svg) return;

  var center = svg.querySelector('.fb-orb-center');
  var inner = svg.querySelector('.fb-orb-inner');
  var outer = svg.querySelector('.fb-orb-outer');
  var spokes = svg.querySelectorAll('.fb-orb-spoke');
  var nodes = svg.querySelectorAll('.fb-orb-node');
  var dots = svg.querySelectorAll('.fb-orb-dot');

  /* Compute stroke lengths for draw animation */
  var innerCirc = 2 * Math.PI * 48; /* r=48 */
  var outerCirc = 2 * Math.PI * 100; /* r=100 */

  /* Set initial states */
  gsap.set(center, { scale: 0, opacity: 0, transformOrigin: '150px 130px' });
  gsap.set(inner, { strokeDasharray: innerCirc, strokeDashoffset: innerCirc });
  gsap.set(outer, { strokeDasharray: outerCirc, strokeDashoffset: outerCirc, opacity: 0 });
  gsap.set(dots, { scale: 0, opacity: 0, transformOrigin: 'center center' });

  spokes.forEach(function(s){
    var len = s.getTotalLength();
    s.style.strokeDasharray = len;
    s.style.strokeDashoffset = len;
  });

  nodes.forEach(function(n){
    /* Get the first circle in each node group for transform origin */
    var c = n.querySelector('circle');
    var cx = c ? c.getAttribute('cx') : '150';
    var cy = c ? c.getAttribute('cy') : '130';
    gsap.set(n, { scale: 0, opacity: 0, transformOrigin: cx + 'px ' + cy + 'px' });
  });

  /* Build timeline */
  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#forBrokers',
      start: 'top 70%',
      once: true
    }
  });

  /* 1. Center materializes */
  tl.to(center, {
    scale: 1, opacity: 1, duration: 0.6,
    ease: 'back.out(1.4)'
  });

  /* 2. Inner orbit draws */
  tl.to(inner, {
    strokeDashoffset: 0, duration: 0.8,
    ease: 'power2.inOut'
  }, '-=0.3');

  /* 3. Outer orbit draws */
  tl.to(outer, { opacity: 1, duration: 0.01 }, '-=0.5');
  tl.to(outer, {
    strokeDashoffset: 0, duration: 1,
    ease: 'power2.inOut'
  }, '-=0.5');

  /* 4. Spokes extend outward */
  tl.to(spokes, {
    strokeDashoffset: 0, duration: 0.5,
    ease: 'power2.out',
    stagger: 0.06
  }, '-=0.6');

  /* 5. Nodes pop in sequentially around the clock */
  tl.to(nodes, {
    scale: 1, opacity: 1, duration: 0.45,
    ease: 'back.out(2.5)',
    stagger: 0.1
  }, '-=0.3');

  /* 6. Inner orbit dots fade in */
  tl.to(dots, {
    scale: 1, opacity: 1, duration: 0.3,
    ease: 'power2.out',
    stagger: 0.08
  }, '-=0.2');

  /* 7. Continuous - inner orbit breathes (scale pulse, no position change) */
  tl.call(function(){
    gsap.to(inner, {
      scale: 1.06,
      transformOrigin: '150px 130px',
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  });

  /* 8. Continuous - all nodes float gently, staggered */
  tl.call(function(){
    nodes.forEach(function(n, i){
      var c = n.querySelector('circle');
      var cx = c ? c.getAttribute('cx') : '150';
      var cy = c ? c.getAttribute('cy') : '130';
      gsap.to(n, {
        y: -4,
        duration: 2.2 + (i * 0.25),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.35,
        transformOrigin: cx + 'px ' + cy + 'px'
      });
    });
  });

  /* 9. Continuous - sequential spoke+node red scan */
  tl.call(function(){
    /* Store original colors */
    var spokeOrig = [];
    spokes.forEach(function(s){ spokeOrig.push(s.getAttribute('stroke')); });
    var nodeOrig = [];
    nodes.forEach(function(n){
      var c = n.querySelector('circle');
      nodeOrig.push({
        stroke: c ? c.getAttribute('stroke') : 'rgba(0,0,0,.14)',
        strokeWidth: c ? (parseFloat(c.getAttribute('stroke-width')) || 1.2) : 1.2
      });
    });

    var scanTl = gsap.timeline({ repeat: -1, delay: 1 });

    spokes.forEach(function(spoke, i){
      var node = nodes[i];
      var circle = node.querySelector('circle');
      var t = i * 1.4; /* time offset per node */

      /* Spoke fills red */
      scanTl.to(spoke, {
        stroke: 'rgba(238,50,75,.4)', strokeWidth: 1.5,
        duration: 0.4, ease: 'power2.inOut'
      }, t);

      /* Node border pulses red */
      if(circle){
        scanTl.to(circle, {
          stroke: 'rgba(238,50,75,.35)', strokeWidth: 2,
          duration: 0.35, ease: 'power2.inOut'
        }, t + 0.25);
      }

      /* Spoke fades back */
      scanTl.to(spoke, {
        stroke: spokeOrig[i], strokeWidth: 1,
        duration: 0.5, ease: 'power2.out'
      }, t + 0.7);

      /* Node border fades back */
      if(circle){
        scanTl.to(circle, {
          stroke: nodeOrig[i].stroke, strokeWidth: nodeOrig[i].strokeWidth,
          duration: 0.45, ease: 'power2.out'
        }, t + 0.8);
      }
    });
  });
})();

(function(){
  var el=document.querySelector('.fb-features');
  if(!el)return;
  var items=Array.from(el.children).filter(function(c){return c.classList.contains('fb-feat')}),total=items.length,autoTimer=null,INTERVAL=3500;
  function center(i){var t=items[i];return t.offsetLeft+t.offsetWidth/2-el.clientWidth/2;}
  function getActive(){var s=el.scrollLeft+el.clientWidth/2,b=0,bd=Infinity;for(var i=0;i<total;i++){var mid=items[i].offsetLeft+items[i].offsetWidth/2;var d=Math.abs(mid-s);if(d<bd){bd=d;b=i;}}return b;}
  function goTo(i){var target=Math.max(0,Math.min(center(i),el.scrollWidth-el.clientWidth));gsap.to(el,{scrollLeft:target,duration:.6,ease:'power2.inOut'});}
  function startAuto(){stopAuto();if(el.scrollWidth<=el.clientWidth+2)return;autoTimer=setInterval(function(){
    var cur=getActive();goTo(cur>=total-1?0:cur+1);
  },INTERVAL);}
  function stopAuto(){if(autoTimer){clearInterval(autoTimer);autoTimer=null;}}
  el.addEventListener('pointerdown',function(){stopAuto()});
  el.addEventListener('pointerup',function(){if(el.getBoundingClientRect().top<window.innerHeight)startAuto()});
  var fbObs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting)startAuto();else stopAuto()})},{threshold:0.15});
  fbObs.observe(el);
})();

(function(){
  /* Cursor glow */
  var cards=document.querySelectorAll('.ge-flag,.ge-card');
  if(!cards.length)return;
  cards.forEach(function(el){
    el.addEventListener('mousemove',function(e){
      var r=el.getBoundingClientRect();
      el.style.setProperty('--gx',(e.clientX-r.left)+'px');
      el.style.setProperty('--gy',(e.clientY-r.top)+'px');
    });
    el.addEventListener('mouseleave',function(){
      el.style.removeProperty('--gx');
      el.style.removeProperty('--gy');
    });
  });

  /* Mobile carousel dots */
  var wrap=document.getElementById('geCardsWrap');
  var dots=document.querySelectorAll('#geDots .ge-dot');
  if(!wrap||!dots.length)return;
  var items=wrap.children;
  function updateDots(){
    var sl=wrap.scrollLeft,best=0,bd=Infinity;
    for(var i=0;i<items.length;i++){
      var d=Math.abs(items[i].offsetLeft-wrap.offsetLeft-sl);
      if(d<bd){bd=d;best=i;}
    }
    dots.forEach(function(dot,i){dot.classList.toggle('active',i===best);});
  }
  wrap.addEventListener('scroll',function(){requestAnimationFrame(updateDots);});
  dots.forEach(function(dot,i){
    dot.addEventListener('click',function(){
      var t=items[i];if(!t)return;
      wrap.scrollTo({left:t.offsetLeft-wrap.offsetLeft,behavior:'smooth'});
    });
  });
})();

(function(){
  var sec=document.getElementById('forDevelopers');
  if(!sec)return;
  var svg=sec.querySelector('.fd-eco-svg');
  var feats=sec.querySelector('.fd-features');
  var cta=sec.querySelector('.fd-cta-row');

  /* Feature/CTA entrance */
  if(feats) gsap.set(feats,{opacity:0,y:20});
  if(cta) gsap.set(cta,{opacity:0,y:12});
  if(feats){ScrollTrigger.create({trigger:feats,start:'top 82%',once:true,onEnter:function(){gsap.to(feats,{opacity:1,y:0,duration:.6,ease:'power2.out'});}});}
  if(cta){ScrollTrigger.create({trigger:cta,start:'top 90%',once:true,onEnter:function(){gsap.to(cta,{opacity:1,y:0,duration:.45,ease:'power2.out'});}});}

  /* Ecosystem graphic animation (desktop only) */
  if(!svg||window.innerWidth<1024)return;
  var center=svg.querySelector('.fd-eco-center');
  var inner=svg.querySelector('.fd-eco-inner');
  var outer=svg.querySelector('.fd-eco-outer');
  var spokes=svg.querySelectorAll('.fd-eco-spoke');
  var nodes=svg.querySelectorAll('.fd-eco-node');
  var labels=svg.querySelectorAll('.fd-eco-label');
  var dots=svg.querySelectorAll('.fd-eco-dot');

  var innerCirc=2*Math.PI*68;
  var outerCirc=2*Math.PI*148;

  gsap.set(center,{scale:0,opacity:0,svgOrigin:'210 210'});
  gsap.set(inner,{strokeDasharray:innerCirc,strokeDashoffset:innerCirc});
  gsap.set(outer,{strokeDasharray:outerCirc,strokeDashoffset:outerCirc,opacity:0});
  gsap.set(dots,{scale:0,opacity:0,transformOrigin:'center center'});
  gsap.set(labels,{opacity:0});
  spokes.forEach(function(s){var l=s.getTotalLength();s.style.strokeDasharray=l;s.style.strokeDashoffset=l;});
  nodes.forEach(function(n){
    var c=n.querySelector('circle');
    gsap.set(n,{scale:0,opacity:0,svgOrigin:c.getAttribute('cx')+' '+c.getAttribute('cy')});
  });

  var tl=gsap.timeline({scrollTrigger:{trigger:sec,start:'top 70%',once:true}});
  tl.to(center,{scale:1,opacity:1,duration:.6,ease:'back.out(1.4)',svgOrigin:'210 210'});
  tl.to(inner,{strokeDashoffset:0,duration:.8,ease:'power2.inOut'},'-=.3');
  tl.to(outer,{opacity:1,duration:.01},'-=.5');
  tl.to(outer,{strokeDashoffset:0,duration:1,ease:'power2.inOut'},'-=.5');
  tl.to(spokes,{strokeDashoffset:0,duration:.5,ease:'power2.out',stagger:.06},'-=.6');
  tl.to(nodes,{scale:1,opacity:1,duration:.45,ease:'back.out(2.5)',stagger:{each:.1,from:'start'}},'-=.3');
  tl.to(labels,{opacity:1,duration:.3,stagger:.08},'-=.2');
  tl.to(dots,{scale:1,opacity:1,duration:.3,ease:'power2.out',stagger:.06},'-=.3');

  /* Continuous - node pulse + lift */
  tl.call(function(){
    nodes.forEach(function(n,i){
      var c=n.querySelector('circle');
      var cx=c.getAttribute('cx'), cy=c.getAttribute('cy');
      /* Gentle lift */
      gsap.to(n,{y:-5,duration:2.4+(i*.3),repeat:-1,yoyo:true,ease:'sine.inOut',delay:i*.5,svgOrigin:cx+' '+cy});
      /* Subtle scale pulse */
      gsap.to(n,{scale:1.05,duration:2+(i*.2),repeat:-1,yoyo:true,ease:'sine.inOut',delay:i*.4,svgOrigin:cx+' '+cy});
    });
  });
})();

(function(){
  var el=document.querySelector('.fd-features');
  if(!el)return;
  var items=Array.from(el.querySelectorAll('.fd-feat')),total=items.length,autoTimer=null,INTERVAL=3500;
  function center(i){var t=items[i];return t.offsetLeft+t.offsetWidth/2-el.clientWidth/2;}
  function getActive(){var s=el.scrollLeft+el.clientWidth/2,b=0,bd=Infinity;for(var i=0;i<total;i++){var mid=items[i].offsetLeft+items[i].offsetWidth/2;var d=Math.abs(mid-s);if(d<bd){bd=d;b=i;}}return b;}
  function goTo(i){var target=Math.max(0,Math.min(center(i),el.scrollWidth-el.clientWidth));gsap.to(el,{scrollLeft:target,duration:.6,ease:'power2.inOut'});}
  function startAuto(){stopAuto();if(el.scrollWidth<=el.clientWidth+2)return;autoTimer=setInterval(function(){
    var cur=getActive();goTo(cur>=total-1?0:cur+1);
  },INTERVAL);}
  function stopAuto(){if(autoTimer){clearInterval(autoTimer);autoTimer=null;}}
  el.addEventListener('pointerdown',function(){stopAuto()});
  el.addEventListener('pointerup',function(){if(el.getBoundingClientRect().top<window.innerHeight)startAuto()});
  var fdObs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting)startAuto();else stopAuto()})},{threshold:0.15});
  fdObs.observe(el);
})();

(function(){
  var cardsEl=document.querySelector('.ds-cards');
  var spotEl=document.querySelector('.ds-spot__grid');

  /* Main cards: pill arrow nav + counter */
  (function(){
    if(!cardsEl) return;
    var prev=document.getElementById('dsCardsPrev'),next=document.getElementById('dsCardsNext'),count=document.getElementById('dsCardsCount');
    var items=cardsEl.children,total=items.length;
    function getActive(){var s=cardsEl.scrollLeft,b=0,bd=Infinity;for(var i=0;i<total;i++){var d=Math.abs(items[i].offsetLeft-s);if(d<bd){bd=d;b=i;}}return b;}
    function update(){count.textContent=(getActive()+1)+' / '+total;}
    function scrollTo(i){var t=items[Math.max(0,Math.min(i,total-1))];gsap.to(cardsEl,{scrollLeft:t.offsetLeft,duration:.5,ease:'power2.out'});setTimeout(update,550);}
    prev.addEventListener('click',function(){scrollTo(getActive()-1);});
    next.addEventListener('click',function(){scrollTo(getActive()+1);});
    cardsEl.addEventListener('scroll',function(){requestAnimationFrame(update);});
    update();
  })();

  /* Designer spotlight: autoplay + dynamic dots */
  (function(){
    if(!spotEl) return;
    var dotsWrap=document.getElementById('dsDots');
    var items=Array.from(spotEl.children),total=items.length,autoTimer=null,INTERVAL=3500;
    var dots=[];

    function getSnapCount(){
      var maxScroll=spotEl.scrollWidth-spotEl.clientWidth;
      if(maxScroll<=2) return 0;
      var itemW=items[0].offsetWidth;
      var gap=parseInt(getComputedStyle(spotEl).columnGap||getComputedStyle(spotEl).gap)||16;
      var visible=Math.max(1,Math.round(spotEl.clientWidth/(itemW+gap)));
      return Math.max(1,total-visible+1);
    }

    function buildDots(){
      var count=getSnapCount();
      if(count===dots.length) return;
      dotsWrap.innerHTML='';dots=[];
      for(var i=0;i<count;i++){
        var btn=document.createElement('button');
        btn.className='ds-dot'+(i===0?' active':'');
        btn.setAttribute('data-i',i);
        btn.addEventListener('click',(function(idx){return function(){stopAuto();goTo(idx);startAuto();};})(i));
        dotsWrap.appendChild(btn);dots.push(btn);
      }
    }

    function getActive(){var s=spotEl.scrollLeft,b=0,bd=Infinity;var c=dots.length;for(var i=0;i<c;i++){var d=Math.abs(items[i].offsetLeft-s);if(d<bd){bd=d;b=i;}}return b;}
    function goTo(i){var t=items[Math.max(0,Math.min(i,total-1))];var target=Math.min(t.offsetLeft,spotEl.scrollWidth-spotEl.clientWidth);gsap.to(spotEl,{scrollLeft:target,duration:.6,ease:'power2.inOut',onComplete:updateDots});}
    function updateDots(){var a=getActive();dots.forEach(function(d,i){d.classList.toggle('active',i===a);});}
    function startAuto(){stopAuto();autoTimer=setInterval(function(){if(spotEl.scrollWidth<=spotEl.clientWidth+2)return;var c=dots.length;var n=(getActive()+1)%c;goTo(n);},INTERVAL);}
    function stopAuto(){if(autoTimer){clearInterval(autoTimer);autoTimer=null;}}
    spotEl.addEventListener('scroll',function(){requestAnimationFrame(updateDots);});
    spotEl.addEventListener('pointerdown',function(){stopAuto();});
    spotEl.addEventListener('pointerup',function(){if(spotEl.getBoundingClientRect().top<window.innerHeight)startAuto();});
    buildDots();updateDots();
    var dsObs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting)startAuto();else stopAuto()})},{threshold:0.15});
    dsObs.observe(spotEl);
    window.addEventListener('resize',function(){buildDots();updateDots();});
  })();
})();

(function(){
  /* Mark overflowing drag-scroll containers */
  function checkOverflow(){
    document.querySelectorAll('.drag-scroll').forEach(function(el){
      el.classList.toggle('is-overflowing',el.scrollWidth>el.clientWidth+2);
    });
  }
  checkOverflow();
  window.addEventListener('resize',checkOverflow);

  document.querySelectorAll('.drag-scroll').forEach(function(el){
    var startX,startScroll,lastX,lastT,vel,dragged;
    el.addEventListener('mousedown',function(e){
      if(e.button!==0 || el.scrollWidth<=el.clientWidth+2) return;
      gsap.killTweensOf(el,'scrollLeft');
      el.classList.add('is-dragging');
      startX=lastX=e.clientX; startScroll=el.scrollLeft;
      lastT=Date.now(); vel=0; dragged=false;
      document.addEventListener('mousemove',onMove);
      document.addEventListener('mouseup',onUp);
      document.addEventListener('mouseleave',onUp);
    });
    function onMove(e){
      e.preventDefault();
      dragged=true;
      var now=Date.now(),dt=now-lastT;
      if(dt>4){vel=(e.clientX-lastX)/dt;lastX=e.clientX;lastT=now}
      el.scrollLeft=startScroll-(e.clientX-startX);
    }
    function snapSettle(){
      /* Find nearest snap child and animate to it before re-enabling snap */
      var children = Array.from(el.children);
      if(!children.length){ el.classList.remove('is-dragging'); return; }
      var center = el.scrollLeft + el.clientWidth / 2;
      var best = 0, bestDist = Infinity;
      children.forEach(function(c, i){
        var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
        if(d < bestDist){ bestDist = d; best = i; }
      });
      var target = children[best].offsetLeft + children[best].offsetWidth / 2 - el.clientWidth / 2;
      target = Math.max(0, Math.min(target, el.scrollWidth - el.clientWidth));
      if(Math.abs(el.scrollLeft - target) < 2){
        el.classList.remove('is-dragging'); return;
      }
      gsap.to(el, { scrollLeft:target, duration:0.35, ease:'power2.out', overwrite:true,
        onComplete:function(){ el.classList.remove('is-dragging'); }
      });
    }
    function onUp(){
      document.removeEventListener('mousemove',onMove);
      document.removeEventListener('mouseup',onUp);
      document.removeEventListener('mouseleave',onUp);
      var momentum=vel*400;
      if(Math.abs(momentum)>5){
        gsap.to(el,{scrollLeft:el.scrollLeft-momentum,duration:.7,ease:'power3.out',overwrite:true,
          onComplete:snapSettle
        });
      } else {
        snapSettle();
      }
    }
    el.addEventListener('click',function(e){if(dragged){e.preventDefault();e.stopPropagation();dragged=false}},true);
  });
})();

/* ═══ INTELLIGENCE SECTION JS ═══ */
/* Mobile: extract Reports above carousel, move Rankings to first carousel item */
(function(){
  var grid=document.querySelector('.intl2-grid');
  var hero=grid&&grid.querySelector('.i-card--hero');
  var rank=grid&&grid.querySelector('.i-card--rank');
  if(!grid||!hero)return;
  var heroNext=hero.nextElementSibling;
  var rankNext=rank&&rank.nextElementSibling;
  function place(){
    if(window.innerWidth<744){
      if(hero.parentElement===grid){grid.parentElement.insertBefore(hero,grid);hero.classList.add('is-extracted')}
      if(rank&&grid.firstChild!==rank){grid.insertBefore(rank,grid.firstChild)}
    }else{
      if(hero.parentElement!==grid){grid.insertBefore(hero,grid.firstChild);hero.classList.remove('is-extracted')}
      if(rank&&rankNext&&rankNext.parentElement===grid){grid.insertBefore(rank,rankNext)}
    }
  }
  place();window.addEventListener('resize',place);
})();
/* Intelligence chip toggle */
(function(){
  document.querySelectorAll('.intl2-chip').forEach(function(b){
    b.addEventListener('click',function(e){
      if(b.tagName==='A')return;
      b.closest('.intl2-chips').querySelectorAll('.intl2-chip').forEach(function(x){x.classList.remove('active')});
      b.classList.add('active');
    });
  });
})();
/* Intelligence carousel dots */
(function(){
  var grid=document.querySelector('.intl2-grid');
  var dotsWrap=document.getElementById('intl2Dots');
  if(!grid||!dotsWrap)return;
  function getCards(){return Array.from(grid.children).filter(function(c){return c.classList.contains('i-card')&&!c.classList.contains('is-extracted')})}
  function getActive(){
    var cards=getCards();if(!cards.length)return 0;
    var center=grid.scrollLeft+grid.clientWidth/2;
    var best=0,bestDist=Infinity;
    cards.forEach(function(c,i){var d=Math.abs(c.offsetLeft+c.offsetWidth/2-center);if(d<bestDist){bestDist=d;best=i}});
    return best;
  }
  function buildDots(){
    var cards=getCards();dotsWrap.innerHTML='';
    if(grid.scrollWidth<=grid.clientWidth+2){dotsWrap.style.display='none';return}
    dotsWrap.style.display='';
    cards.forEach(function(_,i){var dot=document.createElement('button');dot.className='intl2-dot'+(i===0?' active':'');dot.addEventListener('click',function(){goTo(i)});dotsWrap.appendChild(dot)});
    updateDots();
  }
  function updateDots(){var active=getActive();dotsWrap.querySelectorAll('.intl2-dot').forEach(function(d,i){d.classList.toggle('active',i===active)})}
  function goTo(i){
    var cards=getCards();if(!cards[i])return;
    var target=cards[i].offsetLeft-parseInt(getComputedStyle(grid).paddingLeft);
    target=Math.max(0,Math.min(target,grid.scrollWidth-grid.clientWidth));
    grid.classList.add('is-animating');
    gsap.to(grid,{scrollLeft:target,duration:.45,ease:'power2.out',overwrite:true,onComplete:function(){grid.classList.remove('is-animating');updateDots()}});
  }
  grid.addEventListener('scroll',updateDots);
  buildDots();window.addEventListener('resize',buildDots);
})();

(function(){
  /* ── Developer Mandate: word-by-word color fill on scroll ── */
  gsap.to(".fd-rw",{
    color:"var(--ink)",
    stagger:0.03,
    ease:"none",
    scrollTrigger:{
      trigger:"#fdRevealBlock",
      start:"top 85%",
      end:"top 40%",
      scrub:0.5
    }
  });

  /* New sections use the same _up() reveal system defined in the main GSAP block above.
     Selectors are added to the querySelectorAll list in the existing section animation code. */

  /* Brand Connect chips removed */

  /* Services chips removed - cleaned up */

  /* ── Creator Network: earnings counter animation ── */
  (function(){
    var counter=document.getElementById('cnEarnCounter');
    if(!counter) return;
    var target=65430;
    var obj={val:0};
    var formatted=function(n){return Math.round(n).toLocaleString('en-IN')};
    counter.textContent=formatted(0);
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          var growth=document.getElementById('cnGrowth');
          gsap.to(obj,{val:target,duration:2,ease:'power2.out',
            onUpdate:function(){counter.textContent=formatted(obj.val)},
            onComplete:function(){
              gsap.fromTo(counter,{scale:1},{scale:1.15,duration:.2,yoyo:true,repeat:1,ease:'power2.out'});
              if(growth){
                gsap.to(growth,{opacity:1,duration:.3,delay:.1});
                // Looping float-up animation on the arrow
                gsap.to(growth.querySelector('.cn-grow-arrow'),{
                  y:-3,duration:.8,ease:'sine.inOut',yoyo:true,repeat:-1
                });
                // Subtle pulse on the percentage
                gsap.to(growth.querySelector('.cn-grow-pct'),{
                  opacity:.6,duration:1,ease:'sine.inOut',yoyo:true,repeat:-1
                });
              }
            }
          });
          obs.disconnect();
        }
      });
    },{threshold:0.5});
    obs.observe(counter.closest('.cn-card-earn'));
  })();

  /* ── Ecosystem: CSS-driven entrance via IntersectionObserver ── */
  var ecoMap=document.querySelector('.eco-map');
  if(ecoMap){
    var ecoObs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ecoMap.classList.add('eco-visible');ecoObs.disconnect();}
      });
    },{threshold:0.15});
    ecoObs.observe(ecoMap);
  }

  /* People drag-scroll removed - replaced with continuous ticker */

  /* ── Community closer — entrance + parallax ── */
  var ccCloser = document.querySelector('.community-closer');
  var ccNet = document.querySelector('.community-closer__net');
  var ccGlowL = document.querySelector('.community-closer__glow--left');
  var ccGlowR = document.querySelector('.community-closer__glow--right');
  var ccLine = document.querySelector('.community-closer__line');
  var ccLink = document.querySelector('.community-closer__link');
  if(ccCloser){
    /* Entrance: fade + rise */
    gsap.set([ccNet, ccGlowL, ccGlowR].filter(Boolean), {opacity:0, scale:0.9});
    gsap.set([ccLine, ccLink].filter(Boolean), {opacity:0, y:20});
    ScrollTrigger.create({
      trigger: ccCloser, start: 'top 85%', once: true,
      onEnter: function(){
        var tl = gsap.timeline({defaults:{ease:'power2.out'}});
        tl.to(ccNet, {opacity:0.12, scale:1, duration:0.8}, 0);
        if(ccGlowL) tl.to(ccGlowL, {opacity:1, scale:1, duration:0.8}, 0.1);
        if(ccGlowR) tl.to(ccGlowR, {opacity:1, scale:1, duration:0.8}, 0.2);
        if(ccLine) tl.to(ccLine, {opacity:1, y:0, duration:0.5}, 0.3);
        if(ccLink) tl.to(ccLink, {opacity:1, y:0, duration:0.5}, 0.45);
      }
    });
    /* Parallax: scrub */
    if(ccNet) gsap.to(ccNet, {
      y:-30, scale:1.08, ease:'none',
      scrollTrigger:{trigger:ccCloser, start:'top bottom', end:'bottom top', scrub:true}
    });
    if(ccGlowL) gsap.to(ccGlowL, {
      x:40, y:-20, ease:'none',
      scrollTrigger:{trigger:ccCloser, start:'top bottom', end:'bottom top', scrub:true}
    });
    if(ccGlowR) gsap.to(ccGlowR, {
      x:-40, y:15, ease:'none',
      scrollTrigger:{trigger:ccCloser, start:'top bottom', end:'bottom top', scrub:true}
    });
  }
})();