/* Tailwind config is inlined in <head> for ATF-first loading */

/* ── Off-canvas menu logic ── */
function _blockScroll(e){
  /* Allow scrolling only inside the actual scrollable surfaces.
     `#ocMenu` as a whole is too coarse — its `.oc-hdr` and `.oc-footer`
     don't scroll, so wheels there fall through to the body.
     `.oc-panel` is the scrollable area inside the menu. */
  var t = e.target;
  if(t.closest && (t.closest('.oc-panel') || t.closest('#joinModal') || t.closest('#clModal'))) return;
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
  var ocL1=document.getElementById('ocL1');if(ocL1)ocL1.scrollTop=0;
  closeSub();
  var ocMenu=document.getElementById('ocMenu');if(ocMenu)ocMenu.classList.add('oc-open');
  var ocOverlay=document.getElementById('ocOverlay');if(ocOverlay)ocOverlay.classList.add('oc-open');
  /* Reflect open state on every off-canvas trigger button so AT users hear it. */
  document.querySelectorAll('[aria-controls="ocMenu"]').forEach(function(b){b.setAttribute('aria-expanded','true')});
}
function closeOC(){
  var ocMenu=document.getElementById('ocMenu');if(ocMenu)ocMenu.classList.remove('oc-open');
  var ocOverlay=document.getElementById('ocOverlay');if(ocOverlay)ocOverlay.classList.remove('oc-open');
  closeSub();
  unblockPageScroll();
  document.querySelectorAll('[aria-controls="ocMenu"]').forEach(function(b){b.setAttribute('aria-expanded','false')});
}

/* ── Collections modal (design.html only) ── */
function _clEsc(e){if(e.key==='Escape')closeCollections()}
function openCollections(){
  blockPageScroll();
  var m=document.getElementById('clModal');if(m)m.classList.add('cl-open');
  var o=document.getElementById('clOverlay');if(o)o.classList.add('cl-open');
  document.querySelectorAll('[aria-controls="clModal"]').forEach(function(b){b.setAttribute('aria-expanded','true')});
  document.addEventListener('keydown',_clEsc);
}
function closeCollections(){
  var m=document.getElementById('clModal');if(m)m.classList.remove('cl-open');
  var o=document.getElementById('clOverlay');if(o)o.classList.remove('cl-open');
  unblockPageScroll();
  document.querySelectorAll('[aria-controls="clModal"]').forEach(function(b){b.setAttribute('aria-expanded','false')});
  document.removeEventListener('keydown',_clEsc);
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
/* Bind city-search input via JS so Android IME composition (predictive text)
   reliably triggers filtering — inline oninput can miss composition updates. */
(function bindCitySearch(){
  function bind(){
    var input=document.getElementById('ocCitySearch');
    if(!input) return;
    var run=function(){ filterCities(input.value); };
    input.addEventListener('input',run);
    input.addEventListener('keyup',run);
    input.addEventListener('compositionupdate',run);
    input.addEventListener('compositionend',run);
    input.addEventListener('change',run);
    input.addEventListener('search',run);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind);
  else bind();
})();

/* ── Sign In Modal Logic ── */
var jmMode='signin'; /* signin, otp-login, otp-verify, forgot */
var jmFlow='login';  /* 'login' = sign-in/OTP-login · 'signup' = phone→OTP→profile details */
var jmSignupPkg='';  /* selected package/tier carried into a signup flow (for backend) */

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
  jmFlow='login';
  document.getElementById('joinModal').classList.add('jm-open');
  document.getElementById('joinOverlay').classList.add('jm-open');
  jmShowSignIn();
}

/* Sign-up flow entry — phone → OTP → profile details (name/email/company).
   Call with the selected package/tier so it travels to the backend, e.g.
   openSignUp('superpro') from a "Apply for SuperPro" CTA. */
function openSignUp(pkg){
  if(document.getElementById('ocMenu').classList.contains('oc-open'))closeOC();
  blockPageScroll();
  jmFlow='signup';
  jmSignupPkg=pkg||'';
  document.getElementById('joinModal').classList.add('jm-open');
  document.getElementById('joinOverlay').classList.add('jm-open');
  jmShowOTPLogin();
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
function jmShowOTPLogin(){
  var isSignup=jmFlow==='signup';
  document.getElementById('jmOTPHeading').textContent=isSignup?'Create your account':'Login with OTP';
  document.getElementById('jmOTPSubtext').textContent=isSignup
    ?'Verify your WhatsApp number to get started.'
    :"We'll send a one-time password to your WhatsApp number.";
  document.getElementById('jmOTPBackLink').style.display=isSignup?'none':'';
  jmShowView('jmOTPLogin');setTimeout(function(){document.getElementById('jmOTPPhoneInput').focus()},100);
}
function jmShowForgot(){jmShowView('jmForgot');setTimeout(function(){document.getElementById('jmForgotPhone').focus()},100)}

function jmSendOTP(){
  var ph=document.getElementById('jmOTPPhoneInput').value;
  document.getElementById('jmOtpSentTo').textContent='OTP has been sent to '+jmSelCC.code+' '+ph;
  document.getElementById('jmOtpBtn').textContent=jmFlow==='signup'?'Verify':'Verify & Sign In';
  jmShowView('jmOTPVerify');
  setTimeout(function(){document.querySelector('#jmOTPVerify [data-otp="0"]').focus()},100);
}

function jmDoSignIn(){/* TODO: API call - validate phone+password */closeSignIn();}
function jmVerifyOTP(){
  /* TODO: API call - verify OTP */
  if(jmFlow==='signup'){jmShowSignupDetails();return;}
  closeSignIn();
}
function jmShowSignupDetails(){
  jmShowView('jmSignupDetails');
  setTimeout(function(){document.getElementById('jmSignupName').focus()},100);
}
function jmSubmitSignup(){
  /* TODO: API call - create account with phone + name/email/company + package (jmSignupPkg) */
  closeSignIn();
}
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
(function(){
  var pi = document.getElementById('jmPhoneInput');
  if (pi) pi.addEventListener('input', function(){ this.value = this.value.replace(/\D/g,''); });
  var op = document.getElementById('jmOTPPhoneInput');
  if (op) op.addEventListener('input', function(){
    this.value = this.value.replace(/\D/g,'');
    var btn = document.getElementById('jmSendOTPBtn');
    if (btn) btn.disabled = this.value.length < 10;
  });
})();

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

/* Sign-up details - enable Create Account when name + valid email + company present */
(function(){
  var ids=['jmSignupName','jmSignupEmail','jmSignupCompany'];
  function v(id){var el=document.getElementById(id);return el?el.value.trim():'';}
  function check(){
    var ok=v('jmSignupName').length>1
      && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('jmSignupEmail'))
      && v('jmSignupCompany').length>0;
    var btn=document.getElementById('jmSignupBtn');if(btn)btn.disabled=!ok;
  }
  ids.forEach(function(id){var el=document.getElementById(id);if(el)el.addEventListener('input',check);});
})();

(function(){document.querySelectorAll('.ed2-chip').forEach(b=>{b.addEventListener('click',function(){b.closest('.ed2-chips').querySelectorAll('.ed2-chip').forEach(x=>x.classList.remove('active'));this.classList.add('active')})})})();

/* ═══ DATA (from index.html) ═══ */
const DATA={
  mumbai:{cityName:"Mumbai",locations:[{id:"loc_gw",name:"Goregaon West",parent:null},{id:"loc_ge",name:"Goregaon East",parent:null},{id:"loc_aw",name:"Andheri West",parent:null},{id:"loc_bkc",name:"Bandra Kurla Complex",parent:null},{id:"loc_mw",name:"Malad West",parent:null},{id:"loc_sid",name:"Siddharth Nagar",parent:"loc_gw"},{id:"loc_jaw",name:"Jawahar Nagar",parent:"loc_gw"},{id:"loc_moti",name:"Motilal Nagar",parent:"loc_gw"},{id:"loc_unnat",name:"Unnat Nagar",parent:"loc_gw"},{id:"loc_lokh",name:"Lokhandwala",parent:"loc_aw"},{id:"loc_versova",name:"Versova",parent:"loc_aw"},{id:"loc_orlem",name:"Orlem",parent:"loc_mw"}],pincodes:[{id:"pin_400062",code:"400062",area:"Goregaon West"},{id:"pin_400064",code:"400064",area:"Malad West"}],projects:[{id:"prj_rex",name:"Raheja Exotica",micro:"Madh Island",category:"residential",availability:{buy:true,rent:true}},{id:"prj_bkc1",name:"One BKC Corporate",micro:"BKC",category:"commercial",availability:{buy:false,rent:true}},{id:"prj_nova",name:"Skyline Nova",micro:"Andheri East",category:"residential",availability:{buy:true,rent:false}}]},
  pune:{cityName:"Pune",locations:[{id:"loc_hinj",name:"Hinjewadi",area:"Pune"},{id:"loc_ban",name:"Baner",area:"Pune"},{id:"loc_sid_p",name:"Siddharth Nagar",area:"Kothrud"}],pincodes:[{id:"pin_411057",code:"411057",area:"Hinjewadi"}],projects:[{id:"prj_p1",name:"Zenith Greens",micro:"Baner",category:"residential",availability:{buy:true,rent:true}},{id:"prj_p2",name:"TechSquare SEZ",micro:"Hinjewadi",category:"commercial",availability:{buy:false,rent:true}}]},
  jaipur:{cityName:"Jaipur",locations:[{id:"loc_vn",name:"Vaishali Nagar",area:"Jaipur"},{id:"loc_mn",name:"Malviya Nagar",area:"Jaipur"},{id:"loc_sid_j",name:"Siddharth Nagar",area:"Tonk Road"}],pincodes:[{id:"pin_302021",code:"302021",area:"Vaishali Nagar"}],projects:[{id:"prj_j1",name:"PinkCity Heights",micro:"Vaishali Nagar",category:"residential",availability:{buy:true,rent:true}}]},
  delhi:{cityName:"Delhi",locations:[{id:"loc_saket_d",name:"Saket",area:"South Delhi"},{id:"loc_dwk",name:"Dwarka",area:"Delhi"},{id:"loc_gn",name:"Greater Kailash",area:"Delhi"}],pincodes:[{id:"pin_110017",code:"110017",area:"Saket"}],projects:[{id:"prj_d1",name:"DLF Capital Greens",micro:"Moti Nagar",category:"residential",availability:{buy:true,rent:true}}]},
  bengaluru:{cityName:"Bengaluru",locations:[{id:"loc_wh",name:"Whitefield",area:"Bengaluru"},{id:"loc_ec",name:"Electronic City",area:"Bengaluru"}],pincodes:[{id:"pin_560066",code:"560066",area:"Whitefield"}],projects:[{id:"prj_b1",name:"Prestige Tech Park",micro:"Marathahalli",category:"commercial",availability:{buy:false,rent:true}}]}
};
/* ══════════════════════════════════════════════════════════════════════════
   ▼▼▼  TEMP CITY LIST — FRONT-END PLACEHOLDER ONLY · REMOVE BEFORE PRODUCTION
   ──────────────────────────────────────────────────────────────────────────
   The 5 cities in DATA above ship with full mock locality / project / pincode
   data. The names below exist ONLY to give the city type-ahead a realistic
   spread so the search UX can be demoed end-to-end. They carry NO locality
   data — selecting one yields a citywide ("All of <city>") search only.

   BACKEND (PHP) HANDOFF:
     Delete everything between "TEMP CITY START" and "TEMP CITY END" and have
     cityLookup() (just below) query your cities table instead, e.g.
       SELECT slug, name FROM cities WHERE name LIKE :q ORDER BY rank LIMIT 20;
     Each real city should bring its own localities/projects/pincodes the same
     shape as the DATA entries above.
   ══════════════════════════════════════════════════════════════════════════ */
/* TEMP CITY START */
const TEMP_CITY_NAMES=[
  "Hyderabad","Chennai","Kolkata","Ahmedabad","Surat","Lucknow","Kanpur","Nagpur",
  "Indore","Thane","Bhopal","Visakhapatnam","Patna","Vadodara","Ghaziabad","Ludhiana",
  "Agra","Nashik","Faridabad","Meerut","Rajkot","Varanasi","Srinagar","Aurangabad",
  "Amritsar","Navi Mumbai","Prayagraj","Ranchi","Coimbatore","Gwalior","Vijayawada",
  "Jodhpur","Madurai","Raipur","Kota","Guwahati","Chandigarh","Mysuru","Tiruchirappalli",
  "Bareilly","Gurugram","Noida","Greater Noida","Jalandhar","Bhubaneswar","Salem",
  "Warangal","Thiruvananthapuram","Guntur","Bikaner","Jamshedpur","Bhilai","Cuttack",
  "Kochi","Nellore","Bhavnagar","Dehradun","Durgapur","Rourkela","Nanded","Kolhapur",
  "Ajmer","Ujjain","Siliguri","Jhansi","Jammu","Mangaluru","Belagavi","Tirunelveli",
  "Udaipur","Gaya","Panaji","Shimla","Pondicherry"
];
TEMP_CITY_NAMES.forEach(name=>{
  const key=name.toLowerCase().replace(/[^a-z0-9]+/g,"-");
  if(!DATA[key])DATA[key]={cityName:name,locations:[],projects:[],pincodes:[],_temp:true};
});
/* TEMP CITY END */
/* ▲▲▲  END TEMP CITY LIST  ▲▲▲ */

/* ══════════════════════════════════════════════════════════════════════════
   ▼▼▼  SEARCH BACKEND INTEGRATION — the ONE place the programmer wires PHP  ▼▼▼
   ──────────────────────────────────────────────────────────────────────────
   The existing ghar.tv search contract is preserved verbatim, so today's new
   UI hands off EXACTLY like the old one did:
     • Results page : searchpropbo.php?cityid=&propertysaleid=&propertytypeid=
                                       &locids=<csv>&sublocids=<csv>
     • Project page : viewpropertydec.php?robprojname=okiw9487<projectId>
   locids / sublocids are TWO INDEPENDENT comma lists (NOT paired, no 0 pad):
     whole locality  → its own id in locids
     a sub-area      → its own id in sublocids (backend resolves the parent)
   TO GO LIVE:
     1. Replace mock DATA above with PHP-injected data of the SAME shape
        (city → cityid + localities[] ; locality → id/name/parent).
     2. Point cityLookup() / buildSugg() at your endpoints (see their comments).
     3. Confirm the id maps below match your MySQL ids.
   Full guide: docs/SEARCH-HANDOFF.md
   ══════════════════════════════════════════════════════════════════════════ */
const SEARCH_ENDPOINT="searchpropbo.php";          // results page (unchanged)
const PROJECT_ENDPOINT="viewpropertydec.php";      // project detail page
const PROJECT_PREFIX="okiw9487";                   // robprojname id prefix
/* UI value → backend id. In the live code these were already ids; put the real
   MySQL ids here. (Left as 1/2/3 placeholders — confirm against your tables.) */
const MODE_ID={buy:"1",rent:"2"};                  // → propertysaleid
const TYPE_ID={homes:"1",workspaces:"2",land:"3"}; // → propertytypeid
/* DEV guard: on localhost the PHP pages don't exist, so we log the target URL
   instead of navigating into a 404. Harmless on the live domain. */
const IS_DEV=/^(localhost$|127\.|0\.0\.0\.0|\[?::1)/.test(location.hostname);
/* ▲▲▲  END SEARCH BACKEND INTEGRATION  ▲▲▲ */

const CITY_KEYS=Object.keys(DATA);
const POPULAR_CITIES=["bengaluru","hyderabad","pune","mumbai","delhi","ahmedabad","chennai","kolkata","kochi"];
const CITY_EMOJI={mumbai:"",delhi:"",bengaluru:"",pune:"",jaipur:""};
/* Display overrides + alt names for the popular tiles (purely cosmetic). */
const CITY_POP_LABEL={delhi:"Delhi NCR"};
const CITY_SUB={mumbai:"MMR",delhi:"Gurugram · Noida",bengaluru:"Bangalore",kochi:"Cochin",chennai:"Madras",kolkata:"Calcutta"};
/* Alt-spelling search aliases — so "bangalore"/"bombay"/"madras" still match. */
const CITY_ALIASES={bengaluru:"bangalore",mumbai:"bombay",delhi:"new delhi ncr",chennai:"madras",kolkata:"calcutta",kochi:"cochin",prayagraj:"allahabad",mysuru:"mysore",mangaluru:"mangalore",vadodara:"baroda",thiruvananthapuram:"trivandrum",puducherry:"pondicherry",gurugram:"gurgaon",visakhapatnam:"vizag"};
/* Per-city building-silhouette icons (same family as the nav "Browse by city" tiles). */
const CITY_ICON_GENERIC='<path d="M2 29h28"/><path d="M5 29V13h14v16"/><path d="M19 29V18h8v11"/><path d="M8 17h3M8 21h3M8 25h3M14 17h2M14 21h2M14 25h2M22 22h2M22 26h2"/>';
const CITY_ICONS={
  mumbai:'<path d="M2 29h28"/><path d="M4 29v-2h24v2"/><path d="M5 27V19M27 27V19"/><path d="M3.5 19a1.5 1.5 0 013 0M25.5 19a1.5 1.5 0 013 0"/><path d="M5 16v-2M27 16v-2"/><path d="M9 27V14h14v13"/><path d="M9 14a7 7 0 0114 0"/><path d="M13 27v-5a3 3 0 016 0v5"/><path d="M16 7V4"/>',
  bengaluru:'<path d="M2 29h28"/><path d="M3 29V19h26v10"/><path d="M6 29v-7M9 29v-7M23 29v-7M26 29v-7"/><path d="M11 19v-3h10v3"/><path d="M9 16a7 7 0 0114 0"/><path d="M16 9V5"/><circle cx="16" cy="4.5" r=".7" fill="currentColor"/>',
  chennai:'<path d="M2 29h28"/><path d="M6 29v-5h20v5"/><path d="M8 24v-4h16v4"/><path d="M10 20v-4h12v4"/><path d="M12 16v-3h8v3"/><path d="M14 13l2-4 2 4"/><path d="M14 29v-4h4v4"/><circle cx="16" cy="8" r=".7" fill="currentColor"/>',
  delhi:'<path d="M2 29h28"/><path d="M4 29v-2h24v2"/><path d="M7 27V13h18v14"/><path d="M11 27V17a5 5 0 0110 0v10"/><path d="M5 13h22"/><path d="M7 13v-3h18v3"/><path d="M5 10h22"/><path d="M14 10V7h4v3"/>',
  hyderabad:'<path d="M2 29h28"/><path d="M3 29V11h3v18"/><path d="M26 29V11h3v18"/><path d="M3 11c0-2 3-2 3 0M26 11c0-2 3-2 3 0"/><path d="M4.5 9V6M27.5 9V6"/><circle cx="4.5" cy="5.5" r=".5" fill="currentColor"/><circle cx="27.5" cy="5.5" r=".5" fill="currentColor"/><path d="M9 29V13h14v16"/><path d="M11 13V9M21 13V9"/><path d="M10 9c0-1.5 2-1.5 2 0M20 9c0-1.5 2-1.5 2 0"/><path d="M14 29v-6a2 2 0 014 0v6"/>',
  kolkata:'<path d="M2 29h28"/><path d="M2 29V21h28v8"/><path d="M11 21v-5h10v5"/><path d="M9 16a7 7 0 0114 0"/><path d="M16 9V6"/><circle cx="16" cy="5.5" r=".7" fill="currentColor"/><path d="M3.5 21a1.5 1.5 0 013 0"/><path d="M25.5 21a1.5 1.5 0 013 0"/><path d="M5 19v-2M27 19v-2"/><path d="M8 29V25a1.5 1.5 0 013 0v4"/><path d="M21 29V25a1.5 1.5 0 013 0v4"/>',
  pune:'<path d="M2 29h28"/><path d="M5 29V14h22v15"/><path d="M5 14v-2h2v2M9 14v-2h2v2M15 14v-2h2v2M21 14v-2h2v2M25 14v-2h2v2"/><path d="M3 29V11h2v18M27 29V11h2v18"/><path d="M11 29V20a5 5 0 0110 0v9"/><path d="M14 29v-3a2 2 0 014 0v3"/><path d="M6 19v3M26 19v3"/>',
  jaipur:'<path d="M2 29h28"/><path d="M5 29V15h22v14"/><path d="M5 15l11-7 11 7"/><path d="M9 29v-4a2 2 0 014 0v4"/><path d="M19 29v-4a2 2 0 014 0v4"/><path d="M14 29v-5h4v5"/><path d="M16 6v2"/>',
  ahmedabad:'<path d="M2 29h28"/><path d="M7 29V10M11 29V10"/><path d="M7 10a2 2 0 014 0"/><path d="M9 8V6"/><path d="M21 29V10M25 29V10"/><path d="M21 10a2 2 0 014 0"/><path d="M23 8V6"/><path d="M11 26h10M11 22h10"/><path d="M14 29v-7h4v7"/>',
  kochi:'<path d="M2 29h28"/><path d="M6 29V10"/><path d="M6 10l10 3"/><path d="M6 14l-3 4"/><path d="M16 13l-4 9M16 13l4 9"/><path d="M11 22h10"/><path d="M13 16h6M14 19h4"/>'
};
function cityIcon(k,size){const s=size||22;return '<svg viewBox="0 0 32 32" width="'+s+'" height="'+s+'" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+(CITY_ICONS[k]||CITY_ICON_GENERIC)+'</svg>';}
function cityLabel(k){return CITY_POP_LABEL[k]||DATA[k].cityName;}
/* Single source of truth for city type-ahead matching. Front-end-only today
   (filters the loaded DATA, prefix-matches first, honours alt spellings).
   Replace the body with a debounced backend call (e.g. /api/cities?q=) to keep
   the full Indian-cities list off the initial payload. */
function cityLookup(q){
  const t=(q||"").trim().toLowerCase();
  if(!t)return POPULAR_CITIES.slice();
  const starts=[],incl=[];
  CITY_KEYS.forEach(k=>{
    const name=DATA[k].cityName.toLowerCase(),alias=CITY_ALIASES[k]||"";
    if(name.startsWith(t)||alias.startsWith(t))starts.push(k);
    else if(name.includes(t)||alias.includes(t))incl.push(k);
  });
  return starts.concat(incl);
}
/* Vertical city tile (icon + label + optional alt name) — reused by the gate
   and the type-ahead results so they never drift apart. */
function cityTileHTML(k){
  const active=city===k,sub=CITY_SUB[k]||"";
  return '<button class="city-chip" data-key="'+k+'" style="display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;min-width:0;border:1.5px solid '+(active?"#141414":"#ececec")+';background:'+(active?"#141414":"#fff")+';border-radius:16px;padding:13px 8px 10px;cursor:pointer;font-family:inherit;transition:border-color .15s,background .15s,box-shadow .15s,transform .15s">'
    +'<span style="width:40px;height:40px;flex-shrink:0;display:grid;place-items:center;border-radius:12px;background:'+(active?"rgba(255,255,255,.16)":"#f7f5f1")+';color:'+(active?"#fff":"#141414")+'">'+cityIcon(k,22)+'</span>'
    +'<span style="min-width:0;max-width:100%;display:flex;flex-direction:column;gap:1px;line-height:1.15">'
      +'<span style="font-size:13px;font-weight:600;color:'+(active?"#fff":"#141414")+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escapeHtml(cityLabel(k))+'</span>'
      +(sub?'<span style="font-size:10px;font-weight:500;color:'+(active?"rgba(255,255,255,.7)":"#9ca3af")+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escapeHtml(sub)+'</span>':'')
    +'</span>'
  +'</button>';
}
function renderCityGrid(keys){return keys.map(cityTileHTML).join("");}
/* Full-width list row for type-ahead results — handles long city names
   (e.g. Thiruvananthapuram) without overflowing, the way Airbnb's list does. */
function cityRowHTML(k){
  const sub=CITY_SUB[k]||(DATA[k]&&DATA[k]._temp?"City":"");
  return '<button class="ac-item" data-key="'+k+'" style="display:flex;align-items:center;gap:11px;width:100%;text-align:left;min-width:0;border:0;background:transparent;padding:9px 8px;border-radius:12px;cursor:pointer;font-family:inherit">'
    +'<span style="width:34px;height:34px;flex-shrink:0;display:grid;place-items:center;border-radius:10px;background:#f7f5f1;color:#141414">'+cityIcon(k,19)+'</span>'
    +'<span style="min-width:0;display:flex;flex-direction:column;line-height:1.25">'
      +'<span style="font-size:14px;font-weight:600;color:#141414;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escapeHtml(cityLabel(k))+'</span>'
      +(sub?'<span style="font-size:11.5px;color:#9ca3af;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escapeHtml(sub)+'</span>':'')
    +'</span>'
  +'</button>';
}
function renderCityRows(keys){return keys.map(cityRowHTML).join("");}
const MAX_MULTI=4;
const CAT_EMOJI={"Senior Living":"🧓","Co-Living":"🏘️","Co-Working":"💼","Warehouse":"📦","Auction Deals":"🔨","Fractional Ownership":"📊"};
const CATS=[{label:"Senior Living",url:"/senior-living"},{label:"Co-Living",url:"/co-living"},{label:"Co-Working",url:"/co-working"},{label:"Warehouse",url:"/warehouse"},{label:"Auction Deals",url:"/auction-deals"},{label:"Fractional Ownership",url:"/fractional-ownership"}];

function escapeHtml(str){return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}

let city="",mode="buy",type="homes",whereText="",multiLocs=[],selection=null,cityGateForced=true,panelOpen=false,modePop_=false,typePop_=false,wherePrompt=null,refineParent=null,manageLocs=false;
const $=s=>document.querySelector(s);

/* ── Locality hierarchy helpers (City › Locality › Sub-locality, any depth) ──
   Today this walks the in-memory tree; in production the same shapes come from
   the backend (each locality carries id/name/parent). ── */
function locById(c,id){return (DATA[c].locations||[]).find(x=>x.id===id)||null;}
function locChildren(c,id){return (DATA[c].locations||[]).filter(x=>x.parent===id);}
function locHasChildren(c,id){return (DATA[c].locations||[]).some(x=>x.parent===id);}
function locBreadcrumb(c,loc){
  const parts=[];let cur=loc,g=0;
  while(cur&&cur.parent&&g<6){const p=locById(c,cur.parent);if(!p)break;parts.push(p.name);cur=p;g++;}
  if(!parts.length&&loc.area&&loc.area!==DATA[c].cityName)parts.push(loc.area);
  parts.push(DATA[c].cityName);
  return parts.join(" · ");
}
function buildSugg(c,q){
  const d=DATA[c];if(!d)return{locations:[],sublocations:[],projects:[],pincodes:[],refine:null};
  const ids=new Set(multiLocs.map(x=>x.id)),qt=q.trim().toLowerCase();
  const POP=5;   /* per-group cap for the idle "Popular …" shortcuts. Backend
                    should return each list pre-sorted by popularity/rank. */
  if(!qt){
    /* Refine mode: browse one locality's sub-areas (no city-wide lock-in). */
    if(refineParent){
      const parent=locById(c,refineParent);
      if(parent)return{locations:locChildren(c,refineParent).filter(x=>!ids.has(x.id)),sublocations:[],projects:[],pincodes:[],refine:parent};
    }
    /* A location is already selected → don't resurface the Popular idle
       shortcuts. The user proceeds from the selected chip(s), or types to
       add more. Popular only shows when nothing is picked yet. */
    if(ids.size)return{locations:[],sublocations:[],projects:[],pincodes:[],refine:null};
    /* Idle: curated "Popular …" shortcuts only — top localities, top
       sub-locations, top projects. Pincodes are precise-intent, so they
       are withheld until the user types (see the query branch below). */
    return{
      locations:d.locations.filter(x=>!x.parent&&!ids.has(x.id)).slice(0,POP),
      sublocations:d.locations.filter(x=>x.parent&&!ids.has(x.id)).slice(0,POP),
      projects:d.projects.slice(0,POP),
      pincodes:[],
      refine:null
    };
  }
  /* Query: flat search across EVERY level in the city, prefix matches first.
     Sub-locations fold into the single "Locations" result list here. */
  const starts=[],incl=[];
  d.locations.forEach(x=>{if(ids.has(x.id))return;const n=x.name.toLowerCase();if(n.startsWith(qt))starts.push(x);else if(n.includes(qt))incl.push(x);});
  return{
    locations:starts.concat(incl).slice(0,8),
    sublocations:[],
    projects:d.projects.filter(x=>x.name.toLowerCase().includes(qt)).slice(0,6),
    pincodes:/^[0-9]+$/.test(qt)?d.pincodes.filter(x=>x.code.startsWith(qt)).slice(0,6):[],
    refine:null
  };
}
/* Shared locality row — breadcrumb context + a "N areas ›" refine pill when the
   locality has sub-areas. Clicking the pill drills in; the row body selects. */
function locRowHTML(c,l){
  const kids=locChildren(c,l.id);
  const right=kids.length
    ? '<button class="loc-refine" data-id="'+escapeHtml(l.id)+'" aria-label="Show sub-areas of '+escapeHtml(l.name)+'" style="margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;gap:3px;border:1px solid #e5e7eb;background:#fff;border-radius:999px;padding:3px 7px 3px 10px;font-size:11px;font-weight:600;color:#374151;cursor:pointer;font-family:inherit;transition:border-color .15s,background .15s" onmouseover="this.style.background=\'#f7f5f1\';this.style.borderColor=\'#dcdcdc\'" onmouseout="this.style.background=\'#fff\';this.style.borderColor=\'#e5e7eb\'">'+kids.length+' areas<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>'
    : '<span style="margin-left:auto;flex-shrink:0;font-size:11px;color:#9ca3af;border:1px solid #e5e7eb;padding:2px 8px;border-radius:999px">Location</span>';
  return '<div class="ac-item flex items-center gap-2 p-2 rounded-xl cursor-pointer text-sm sel-loc" data-id="'+escapeHtml(l.id)+'">'
    +'<span style="width:24px;height:24px;border-radius:8px;background:#f3f4f6;display:grid;place-items:center;font-size:13px;flex-shrink:0">📍</span>'
    +'<div style="min-width:0"><div class="font-medium" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escapeHtml(l.name)+'</div><div class="text-xs text-mu" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escapeHtml(locBreadcrumb(c,l))+'</div></div>'
    +right
  +'</div>';
}

function syncWhereTextFromMulti(){
  if(multiLocs.length) whereText=multiLocs.map(x=>x.name).join(", ");
  else whereText=$('#whereInput').value.trim();
}

/* Build the existing-contract results URL from the current selection.
   Reads the shared state: city, mode, type, multiLocs, selection. */
function buildSearchUrl(){
  const cid=(DATA[city]&&DATA[city].cityid)||city;   // backend should set numeric cityid
  // locids and sublocids are TWO INDEPENDENT flat lists (matches live searchpropbo.php):
  //   whole locality → own id in locids;  sub-area → own id in sublocids (parent NOT added).
  const locids=[],sublocids=[];
  multiLocs.forEach(l=>{
    if(l.parent)sublocids.push(l.id);   // sub-area → own id in sublocids only
    else locids.push(l.id);             // whole locality → own id in locids only
  });
  let u=SEARCH_ENDPOINT+"?cityid="+encodeURIComponent(cid)
    +"&propertysaleid="+encodeURIComponent(MODE_ID[mode]||mode)
    +"&propertytypeid="+encodeURIComponent(TYPE_ID[type]||type)
    +"&locids="+encodeURIComponent(locids.join(","))
    +"&sublocids="+encodeURIComponent(sublocids.join(","));
  /* Pincode isn't in the legacy contract — passed as an extra param; confirm
     searchpropbo.php reads it (or map pincode→locality server-side). */
  if(selection&&selection.type==="pincode"&&whereText)u+="&pincode="+encodeURIComponent(whereText);
  return u;
}
/* THE single search-submit hook. Live → navigates to the PHP results page.
   Dev (localhost) → logs the exact URL so you can verify the contract. */
function executeSearch(){
  const url=buildSearchUrl();
  recordRecentSearch(url);   /* remember it for the empty-state Recent list */
  if(IS_DEV){console.log("[ghar search] →",url);if(typeof showToast==="function")showToast("Search → "+url,"Copy",()=>{try{navigator.clipboard.writeText(url)}catch(e){}});return;}
  window.location.href=url;
}

/* ── Recent Searches ─────────────────────────────────────────────────────
   Device-local (localStorage), anonymous — saved on every results-page
   submit, surfaced in the suggestion empty-state for one-tap re-entry.
   Reuses the existing row chassis (.ac-item / .mob-ac-item). When user
   accounts exist, sync this server-side; localStorage stays the
   logged-out fallback. ── */
const RECENTS_KEY="ghar:recentSearches",RECENTS_MAX=6;
const CLOCK_ICON='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
function recentsLoad(){try{const a=JSON.parse(localStorage.getItem(RECENTS_KEY));return Array.isArray(a)?a:[];}catch(e){return[];}}
function recentsSave(list){try{localStorage.setItem(RECENTS_KEY,JSON.stringify(list.slice(0,RECENTS_MAX)));}catch(e){}}
function recentLabel(){
  let where;
  if(multiLocs.length)where=multiLocs[0].name+(multiLocs.length>1?" +"+(multiLocs.length-1):"");
  else if(selection&&selection.type==="pincode"&&whereText)where=whereText;
  else where="All of "+((DATA[city]&&DATA[city].cityName)||city);
  const modeL=mode==="buy"?"Buy":"Rent";
  const typeL=type==="homes"?"Homes":type==="workspaces"?"Workspaces":"Land";
  return where+" · "+modeL+" · "+typeL;
}
function recordRecentSearch(url){
  if(!city)return;
  const entry={city:city,cityName:(DATA[city]&&DATA[city].cityName)||city,mode:mode,type:type,label:recentLabel(),url:url,ts:Date.now()};
  const list=recentsLoad().filter(e=>e.url!==url);   /* dedupe by url; newest first */
  list.unshift(entry);
  recentsSave(list);
}
function goRecent(url){
  if(IS_DEV){console.log("[ghar recent] →",url);if(typeof showToast==="function")showToast("Recent → "+url,"Copy",()=>{try{navigator.clipboard.writeText(url)}catch(e){}});return;}
  window.location.href=url;
}
/* Desktop empty-state block — rows reuse the .ac-item chassis, clicks go
   through renderPanel()'s delegated handler (.sel-recent branch). */
function recentsDeskHTML(){
  const rec=recentsLoad();if(!rec.length)return"";
  let h='<div style="display:flex;align-items:center;justify-content:space-between;margin:2px 1px 9px">'
    +'<div class="text-[11px] text-mu font-semibold tracking-wider uppercase">Recent searches</div>'
    +'<button id="clearRecentsBtn" style="font-size:11px;font-weight:600;color:#9ca3af;background:none;border:0;cursor:pointer;font-family:inherit;padding:2px 4px">Clear</button>'
    +'</div>';
  /* Compact horizontal pills — one line each — so recents stay a quick shortcut
     row instead of pushing the Popular list down. Only the "where" summary rides
     the pill; mode/type is restored with the search on click. */
  h+='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">';
  rec.slice(0,4).forEach((r,i)=>{
    const where=((r.label||"").split(" · ")[0])||r.label||"";
    h+='<button class="sel-recent" data-idx="'+i+'" title="'+escapeHtml(r.label||where)+'" style="display:inline-flex;align-items:center;gap:7px;max-width:220px;padding:7px 13px 7px 11px;border-radius:999px;border:1px solid #e8e6e1;background:#f7f5f1;cursor:pointer;font-family:inherit;transition:background .15s,border-color .15s" onmouseover="this.style.background=\'#efede8\';this.style.borderColor=\'#dedbd4\'" onmouseout="this.style.background=\'#f7f5f1\';this.style.borderColor=\'#e8e6e1\'">'
      +'<span style="color:#9a9488;flex-shrink:0;display:flex">'+CLOCK_ICON+'</span>'
      +'<span style="font-size:13px;font-weight:500;color:#141414;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escapeHtml(where)+'</span>'
    +'</button>';
  });
  h+='</div>';
  return h;
}
/* Mobile empty-state block — rows reuse the .mob-ac-item chassis. */
window.goRecentMob=function(i){const r=recentsLoad()[i];if(r)goRecent(r.url);};
window.clearRecentsMob=function(){recentsSave([]);mobRenderAcSuggestions((document.getElementById("mobLocInput")||{}).value||"");};
/* Recent searches on mobile reuse the portal carousel chassis — the persistent
   #mobRecents rail is wrapped/wired by wireRails() (same as the Popular cities
   chips), so it gets identical bleed, spacing, fade + "›" scroll cue. This just
   fills the pills and toggles the wrapper; the childList change pokes a resize
   so the chassis remeasures its arrows. */
function mobRenderRecents(show){
  const wrap=document.getElementById("mobRecentsWrap"),rail=document.getElementById("mobRecents");
  if(!wrap||!rail)return;
  const rec=recentsLoad();
  if(!show||!rec.length){wrap.style.display="none";return;}
  wrap.style.display="block";
  rail.innerHTML=rec.map((r,i)=>{
    const where=((r.label||"").split(" · ")[0])||r.label||"";
    return '<button onclick="event.stopPropagation();goRecentMob('+i+')" title="'+escapeHtml(r.label||where)+'" style="flex-shrink:0;display:inline-flex;align-items:center;gap:7px;max-width:240px;padding:10px 15px 10px 12px;border-radius:999px;border:1px solid #e8e6e1;background:#f7f5f1;cursor:pointer;font-family:inherit">'
      +'<span style="color:#9a9488;flex-shrink:0;display:flex">'+CLOCK_ICON+'</span>'
      +'<span style="font-size:13px;font-weight:500;color:#141414;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+escapeHtml(where)+'</span>'
    +'</button>';
  }).join("");
}

/* Desktop Search / Enter. Only commits when the "where" resolves to something
   real, so half-typed text like "Jawaha" never lands on a No-Results page.
   - city missing            → reopen the city gate
   - selection/locations set  → run
   - empty box               → run "All of <city>"
   - exactly one suggestion   → auto-pick it, run
   - many suggestions         → keep panel open, nudge "pick a location"
   - no suggestions           → keep panel open, offer the citywide fallback */
function attemptSearch(){
  if(!city){cityGateForced=true;openPanel();setTimeout(()=>document.getElementById("deskCitySearch")?.focus(),30);return;}
  wherePrompt=null;
  if(multiLocs.length||(selection&&selection.type)){syncWhereTextFromMulti();closePanel();executeSearch();return;}
  const q=($('#whereInput').value||"").trim();
  if(!q){selection={type:"citywide"};whereText="";closePanel();renderChips();executeSearch();return;}
  const s=buildSugg(city,q);
  const matches=[].concat(
    s.locations.map(x=>({kind:"loc",item:x})),
    s.projects.map(x=>({kind:"prj",item:x})),
    s.pincodes.map(x=>({kind:"pin",item:x}))
  );
  if(matches.length===1){
    const m=matches[0];
    if(m.kind==="loc"){addLoc(m.item);syncWhereTextFromMulti();closePanel();executeSearch();}
    else if(m.kind==="prj"){routeToProject(m.item);}
    else{selection={type:"pincode"};whereText=m.item.code;$('#whereInput').value=m.item.code;closePanel();renderChips();executeSearch();}
    return;
  }
  /* unresolved — block the search and guide inline (no browser alert) */
  wherePrompt=matches.length?"pick":"none";
  openPanel();
}

/* Crisp, always-centred chip close icon (the &times; glyph sits off-centre). */
const CHIP_X='<svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" style="display:block;pointer-events:none"><path d="M6 6l12 12M18 6L6 18"/></svg>';
function updateChipFade(){
  const s=$("#chipsRow");if(!s)return;
  s.classList.toggle("is-scrolled",s.scrollLeft>1);
}
function renderChips(){
  const row=$("#chipsRow"),inp=$("#whereInput"),host=$("#cityChipHost");
  row.querySelectorAll(".chip-el").forEach(e=>e.remove());
  if(host)host.innerHTML="";
  if(row&&!row._fadeBound){row._fadeBound=1;row.addEventListener("scroll",updateChipFade,{passive:true});}
  if(city){
    const c=document.createElement("span");
    c.className="chip-el inline-flex items-center gap-1.5 rounded-full bg-gray-900 text-white shrink-0 cursor-pointer";
    c.style.cssText="padding:6px 7px 6px 12px;font-size:13px;font-weight:600;line-height:1";
    c.title="Click to change city";
    c.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex-shrink:0;opacity:.85"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>'+escapeHtml(DATA[city].cityName)+'<button class="chip-x flex items-center justify-center shrink-0 border-0 p-0 cursor-pointer" style="width:19px;height:19px;border-radius:999px;background:rgba(255,255,255,.22);color:#fff;margin-left:1px;transition:background .15s" onmouseover="this.style.background=\'rgba(255,255,255,.42)\'" onmouseout="this.style.background=\'rgba(255,255,255,.22)\'" aria-label="Clear city">'+CHIP_X+'</button>';
    c.querySelector(".chip-x").addEventListener("click",e=>{e.stopPropagation();setCity("");});
    c.addEventListener("click",function(e){if(e.target.closest(".chip-x"))return;cityGateForced=true;openPanel();});
    (host||row).appendChild(c);
  }
  const vis=multiLocs.slice(0,2),ov=multiLocs.length-vis.length;
  vis.forEach((l,i)=>{
    const c=document.createElement("span");
    c.className="chip-el inline-flex items-center gap-1.5 rounded-full shrink-0";
    c.style.cssText="padding:6px 7px 6px 13px;font-size:13px;font-weight:500;line-height:1;background:#efede8;color:#141414";
    c.innerHTML=escapeHtml(l.name)+'<button class="chip-x flex items-center justify-center shrink-0 border-0 p-0 cursor-pointer" style="width:19px;height:19px;border-radius:999px;background:#e0ddd6;color:#8a8578;transition:background .15s,color .15s" onmouseover="this.style.background=\'#d3cfc5\';this.style.color=\'#141414\'" onmouseout="this.style.background=\'#e0ddd6\';this.style.color=\'#8a8578\'" aria-label="Remove">'+CHIP_X+'</button>';
    c.querySelector(".chip-x").addEventListener("click",e=>{e.stopPropagation();removeLoc(i);});
    row.insertBefore(c,inp);
  });
  if(ov>0){
    const m=document.createElement("span");
    m.className="chip-el inline-flex items-center rounded-full border border-dashed border-gray-300 text-gray-500 cursor-pointer shrink-0";
    m.style.cssText="padding:6px 12px;font-size:12px;font-weight:500;line-height:1";
    m.textContent="+"+ov;
    m.title="View all selected locations";
    m.addEventListener("click",e=>{e.stopPropagation();cityGateForced=false;manageLocs=true;openPanel();});
    row.insertBefore(m,inp);
  }
  const has=whereText.trim()||multiLocs.length||selection;
  const cb=$("#clearBtn");
  has?(cb.classList.remove("hidden"),cb.classList.add("flex")):(cb.classList.add("hidden"),cb.classList.remove("flex"));
  // Placeholder logic: selected locality chips already fill the field, so go
  // blank then. With only a city picked the field is empty + focused, so give
  // it a short prompt — otherwise the lone caret reads as a stray "(" bracket.
  inp.placeholder=multiLocs.length?"":(city?"Add a locality, project or pincode":"Search by city, locality, project or pin-code");
  inp.style.caretColor=city?"":"transparent";
  updateChipFade();
  syncAllSearchBars();
}

function syncAllSearchBars(){
  let where="Select City";
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

/* "+N" overflow view: the bar only shows the first two chips, so this lists
   every selected location as a removable pill. Opened from the "+N" chip. */
function renderManageLocs(p){
  p.style.maxHeight="";p.style.overflowY="";
  let pills="";
  multiLocs.forEach((l,i)=>{
    pills+='<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 6px 6px 13px;border-radius:999px;background:#efede8;font-size:13px;font-weight:500;color:#141414">'
      +escapeHtml(l.name)
      +'<button data-rm="'+i+'" style="width:19px;height:19px;border-radius:999px;border:0;background:#e0ddd6;color:#8a8578;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0" aria-label="Remove '+escapeHtml(l.name)+'">'+CHIP_X+'</button>'
      +'</span>';
  });
  p.innerHTML='<div style="padding:4px 4px 6px">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px 12px;border-bottom:1px solid #f0f0f0;margin-bottom:10px">'
      +'<span style="font-size:12px;font-weight:600;color:#374151;font-family:inherit">Selected locations · '+multiLocs.length+'</span>'
      +'<button id="clearAllLocsBtn" style="font-size:12px;font-weight:600;color:#ee324b;background:none;border:0;cursor:pointer;font-family:inherit;padding:0">Clear all</button>'
    +'</div>'
    +'<div style="display:flex;flex-wrap:wrap;gap:8px;padding:0 8px">'+pills+'</div>'
    +'<div style="padding:12px 8px 4px;font-size:12px;color:#9ca3af;font-family:inherit">Type in the box above to add another location.</div>'
  +'</div>';
  p.classList.remove("hidden");
  const cab=p.querySelector("#clearAllLocsBtn");
  if(cab)cab.addEventListener("click",e=>{e.stopPropagation();multiLocs=[];selection=null;manageLocs=false;renderChips();closePanel();});
  p.querySelectorAll("button[data-rm]").forEach(btn=>btn.addEventListener("click",e=>{e.stopPropagation();removeLoc(Number(btn.dataset.rm));}));
}
function renderPanel(){
  const p=$("#wherePanel");
  if(!panelOpen){p.classList.add("hidden");return;}
  p.classList.remove("hidden");
  /* "+N" chip → list every selected location for removal (bar shows only 2). */
  if(manageLocs&&multiLocs.length&&!whereText.trim()&&city&&!cityGateForced){renderManageLocs(p);return;}
  if(!city||cityGateForced){
    /* The gate is a two-column layout (cities + always-visible categories);
       lift the shared 420px dropdown cap so neither column is clipped. The
       left city column keeps its own scroll for long type-ahead lists. */
    p.style.maxHeight="min(86vh,580px)";p.style.overflowY="visible";
    refineParent=null;
    p.innerHTML=
      '<div style="padding:2px 2px 0">'
        +'<div style="display:flex;gap:0;align-items:stretch">'
          /* ══ LEFT PANEL: location selection (title + search + city list) ══ */
          +'<div style="flex:1;min-width:0;padding-right:18px">'
            +'<div style="font-size:16px;font-weight:700;color:#141414;margin-bottom:3px;letter-spacing:-.01em">Start with your city</div>'
            +'<div style="font-size:13px;color:#9ca3af;margin-bottom:14px">Pick a city to see localities, projects and live prices.</div>'
            +'<div style="position:relative;margin-bottom:16px">'
              +'<svg style="position:absolute;left:13px;top:50%;transform:translateY(-50%);pointer-events:none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>'
              +'<input id="deskCitySearch" type="text" placeholder="Search any city — e.g. Mumbai, Surat, Kochi" autocomplete="off" '
              +'style="width:100%;border:1.5px solid #e5e7eb;border-radius:14px;padding:11px 14px 11px 36px;font-size:14px;outline:none;font-family:inherit;color:#141414;box-sizing:border-box;transition:border-color .15s" '
              +'onfocus="this.style.borderColor=\'#141414\'" onblur="this.style.borderColor=\'#e5e7eb\'" />'
            +'</div>'
            +'<div id="deskCityLabel" style="font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#9ca3af;margin-bottom:11px">Popular cities</div>'
            /* Bleed padding (cancelled by negative margin) gives the tiles'
               hover lift + shadow room so the scroll edge doesn't crop them. */
            +'<div id="deskCityScroll" style="max-height:340px;overflow-y:auto;overscroll-behavior:contain;padding:10px;margin:-10px">'
              +'<div id="deskCityChips" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">'
              +renderCityGrid(POPULAR_CITIES)
              +'</div>'
              +'<div id="deskCityResults" style="display:none"></div>'
              +'<div id="deskCityEmpty" style="display:none;padding:22px 0;text-align:center;color:#9ca3af;font-size:13px"></div>'
            +'</div>'
          +'</div>'
          /* ── divider ── */
          +'<div style="align-self:stretch;display:flex;padding:0 16px"><div style="width:1px;background:#eceae6"></div></div>'
          /* ══ RIGHT PANEL: special categories — always visible ══ */
          +'<div style="width:184px;flex-shrink:0;align-self:stretch;display:flex;flex-direction:column;justify-content:space-between">'
            +'<div>'
              +'<div style="font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#9ca3af;margin-bottom:9px">Explore by category</div>'
              +'<div style="display:flex;flex-direction:column;gap:2px">'
              +CATS.map(c=>'<a href="'+c.url+'" class="sel-cat" style="display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:10px;font-size:13px;font-weight:500;color:#374151;text-decoration:none;transition:background .15s" onmouseover="this.style.background=\'#f7f5f1\'" onmouseout="this.style.background=\'transparent\'"><span style="font-size:15px;line-height:1;width:18px;text-align:center">'+(CAT_EMOJI[c.label]||'')+'</span>'+escapeHtml(c.label)+'</a>').join("")
              +'</div>'
            +'</div>'
            /* Distinct people-axis action, pinned to the bottom of the column. */
            +'<a href="/people" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:20px;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:13px;font-weight:600;color:#141414;text-decoration:none;transition:border-color .15s,background .15s,box-shadow .15s" onmouseover="this.style.borderColor=\'#141414\';this.style.background=\'#faf9f7\';this.style.boxShadow=\'0 4px 14px rgba(0,0,0,.06)\'" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.background=\'transparent\';this.style.boxShadow=\'none\'">'
              +'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
              +'Find Agents'
            +'</a>'
          +'</div>'
        +'</div>'
      +'</div>';
    const wireChips=()=>{
      p.querySelectorAll("[data-key]").forEach(e=>e.addEventListener("click",()=>{
        setCity(e.dataset.key);cityGateForced=false;renderPanel();
        setTimeout(()=>$("#whereInput")?.focus(),50);
      }));
    };
    wireChips();
    const dcs=document.getElementById("deskCitySearch");
    dcs.focus();
    dcs.addEventListener("input",()=>{
      const raw=dcs.value.trim();
      const q=raw.toLowerCase();
      const chipsDiv=document.getElementById("deskCityChips");
      const resultsDiv=document.getElementById("deskCityResults");
      const emptyDiv=document.getElementById("deskCityEmpty");
      const labelEl=document.getElementById("deskCityLabel");
      if(!q){
        /* Idle: curated popular-cities grid. */
        if(labelEl){labelEl.textContent="Popular cities";labelEl.style.display="block";}
        chipsDiv.style.display="grid";resultsDiv.style.display="none";emptyDiv.style.display="none";
        return;
      }
      /* Typing: switch to a full-width result list (prefix-first, alias-aware).
         Swap cityLookup() for a debounced /api/cities?q= call in production. */
      const filtered=cityLookup(q);
      if(labelEl){labelEl.textContent="Search results";labelEl.style.display="block";}
      chipsDiv.style.display="none";
      if(!filtered.length){
        resultsDiv.style.display="none";
        emptyDiv.textContent='No city matching "'+raw+'" yet — try another spelling.';
        emptyDiv.style.display="block";
      }else{
        emptyDiv.style.display="none";
        resultsDiv.style.display="block";
        resultsDiv.innerHTML=renderCityRows(filtered);
        wireChips();
      }
    });
    return;
  }
  /* Resolved/suggestions view — restore the shared dropdown height cap. */
  p.style.maxHeight="";p.style.overflowY="";
  const frag=document.createDocumentFragment();
  const wrapper=document.createElement("div");
  const header=document.createElement("div");
  header.style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px 10px;margin-bottom:4px;border-bottom:1px solid #f0f0f0;";
  header.innerHTML='<span style="font-size:12px;color:#9ca3af;font-family:inherit">Searching in <strong style="color:#141414;">'+escapeHtml(DATA[city].cityName)+'</strong></span>'
    +'<button id="changeCityBtn" style="font-size:12px;font-weight:600;color:#ee324b;background:none;border:none;cursor:pointer;font-family:inherit;padding:0;display:inline-flex;align-items:center;gap:4px;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Change city</button>';
  /* The "Searching in <city> · Change city" strip only earns its space on the
     very first entry — city picked, nothing selected, not yet typing — where it
     frames the Popular groups. The moment the user types OR has a location chip,
     it's friction (results should sit at the top) and redundant (the city pill
     in the bar changes the city), so we drop it. */
  if(!whereText.trim()&&!multiLocs.length) wrapper.appendChild(header);
  const s=buildSugg(city,whereText);
  /* Location(s) already chosen and the user isn't typing or drilling into
     sub-areas → Popular shortcuts are suppressed and there's nothing to add, so
     keep the panel closed (no blank box). Typing reopens it (see #whereInput
     input handler, which calls openPanel on every keystroke). */
  if(multiLocs.length&&!whereText.trim()&&!s.refine){
    panelOpen=false;p.classList.add("hidden");
    const sb=$("#searchBar");if(sb){sb.classList.remove("panel-open");sb.style.boxShadow="0 4px 24px rgba(0,0,0,.07)";}
    return;
  }
  const has=s.locations.length||s.sublocations.length||s.projects.length||s.pincodes.length;
  /* Idle = city chosen but nothing typed/selected yet → "Popular …" eyebrows.
     Once the user types (or has picked locations), the groups become live
     search results and the eyebrows drop the "Popular" prefix. */
  const isIdle=!whereText.trim()&&!multiLocs.length&&!s.refine;
  const acDiv=document.createElement("div");
  let h="";
  if(wherePrompt==="pick"&&has){
    h+='<div class="where-prompt"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#ee324b"/><path d="M12 7v6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="16.6" r="1.25" fill="#fff"/></svg>Pick a location from the list to continue</div>';
  }
  if(!whereText.trim()&&!multiLocs.length&&!s.refine){
    h+=recentsDeskHTML();
    /* Slim single-line citywide action — sits right under recents, above the
       Popular list, so browsing localities starts high in the panel. */
    h+='<div class="ac-item flex items-center gap-2.5 p-2 rounded-xl cursor-pointer text-sm sel-cw">'
      +'<span style="font-size:17px;line-height:1;width:22px;text-align:center;flex-shrink:0">🌆</span>'
      +'<span class="font-medium" style="color:#141414">All of '+escapeHtml(DATA[city].cityName)+'</span>'
      +'<span class="text-xs text-mu" style="margin-left:7px">search the entire city</span>'
      +'<svg style="margin-left:auto;flex-shrink:0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c7c3bb" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>'
    +'</div>';
    h+='<div style="height:1px;background:#eceae6;margin:12px 8px 13px"></div>';
  }
  if(s.refine){
    /* Drill-down view: back link, select-whole-locality, then its sub-areas. */
    h+='<button class="loc-back" style="display:flex;align-items:center;gap:6px;width:100%;text-align:left;border:0;background:transparent;padding:7px 8px;margin-bottom:2px;border-radius:10px;cursor:pointer;font-size:12px;font-weight:600;color:#6a6a6a;font-family:inherit;transition:background .15s" onmouseover="this.style.background=\'#f5f5f3\'" onmouseout="this.style.background=\'transparent\'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>All localities in '+escapeHtml(DATA[city].cityName)+'</button>';
    h+='<div class="ac-item flex items-center gap-2 p-2 rounded-xl cursor-pointer text-sm sel-loc" data-id="'+escapeHtml(s.refine.id)+'">'
      +'<span style="width:24px;height:24px;border-radius:8px;background:#fde8e8;display:grid;place-items:center;font-size:13px;flex-shrink:0">📍</span>'
      +'<div style="min-width:0"><div class="font-medium">All of '+escapeHtml(s.refine.name)+'</div><div class="text-xs text-mu">Whole locality · '+escapeHtml(DATA[city].cityName)+'</div></div>'
      +'<span style="margin-left:auto;font-size:11px;color:#9ca3af;border:1px solid #e5e7eb;padding:2px 8px;border-radius:999px">Locality</span>'
      +'</div>';
    h+='<div class="text-[11px] text-mu font-semibold tracking-wider uppercase mt-2 mb-1">Sub-areas of '+escapeHtml(s.refine.name)+'</div>';
    if(s.locations.length){s.locations.forEach(l=>{h+=locRowHTML(city,l);});}
    else{h+='<div style="padding:6px 8px;font-size:12.5px;color:#9ca3af">All sub-areas added.</div>';}
  }else if(s.locations.length){
    h+='<div class="text-[11px] text-mu font-semibold tracking-wider uppercase mt-2 mb-1">'+(isIdle?"Popular Localities":"Locations")+'</div>';
    s.locations.forEach(l=>{h+=locRowHTML(city,l);});
  }
  if(s.sublocations.length){
    h+='<div class="text-[11px] text-mu font-semibold tracking-wider uppercase mt-2 mb-1">Popular Sub-Locations</div>';
    s.sublocations.forEach(l=>{h+=locRowHTML(city,l);});
  }
  if(s.projects.length){
    h+='<div class="text-[11px] text-mu font-semibold tracking-wider uppercase mt-2 mb-1">'+(isIdle?"Popular Projects":"Projects")+'</div>';
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
  if(!has&&whereText.trim()){
    h='<div style="padding:14px 8px 6px;text-align:center">'
     +'<div class="text-sm" style="color:#374151;margin-bottom:3px">No exact match for "<strong style="color:#141414">'+escapeHtml(whereText.trim())+'</strong>" in '+escapeHtml(DATA[city].cityName)+'</div>'
     +'<div class="text-xs text-mu" style="margin-bottom:13px">Choose a suggestion as you type, or search the whole city.</div>'
     +'<div class="ac-item sel-cw" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1.5px solid #141414;border-radius:999px;padding:9px 18px;cursor:pointer;font-size:13px;font-weight:600;color:#141414"><span style="font-size:16px;line-height:1">🌆</span>Search all of '+escapeHtml(DATA[city].cityName)+'</div>'
     +'</div>';
  }

  acDiv.innerHTML=h;
  wrapper.appendChild(acDiv);
  p.innerHTML="";
  p.appendChild(wrapper);
  const ccb=p.querySelector("#changeCityBtn");
  if(ccb) ccb.addEventListener("click",e=>{e.stopPropagation();cityGateForced=true;renderPanel();setTimeout(()=>document.getElementById("deskCitySearch")?.focus(),30);});
  const crb=p.querySelector("#clearRecentsBtn");
  if(crb) crb.addEventListener("click",e=>{e.stopPropagation();recentsSave([]);renderPanel();});
  /* Recent pills are their own buttons (not .ac-item rows), so wire them here. */
  p.querySelectorAll(".sel-recent").forEach(el=>el.addEventListener("click",e=>{e.stopPropagation();const r=recentsLoad()[+el.dataset.idx];if(r)goRecent(r.url);}));
  p.addEventListener("click",function handler(e){
    const rf=e.target.closest(".loc-refine");
    if(rf){refineParent=rf.dataset.id;whereText="";const wi=$("#whereInput");if(wi)wi.value="";renderPanel();return;}
    if(e.target.closest(".loc-back")){refineParent=null;renderPanel();return;}
    const item=e.target.closest(".ac-item");
    if(!item)return;
    if(item.classList.contains("sel-recent")){const r=recentsLoad()[+item.dataset.idx];if(r)goRecent(r.url);return;}
    if(item.classList.contains("sel-cw")){multiLocs=[];selection={type:"citywide"};whereText="";$("#whereInput").value="";closePanel();renderChips();return;}
    if(item.classList.contains("sel-loc")){const loc=DATA[city].locations.find(x=>x.id===item.dataset.id);if(loc)addLoc(loc);return;}
    if(item.classList.contains("sel-prj")){const pr=DATA[city].projects.find(x=>x.id===item.dataset.id);if(pr)routeToProject(pr);return;}
    if(item.classList.contains("sel-pin")){const pin=DATA[city].pincodes.find(x=>x.id===item.dataset.id);if(pin){selection={type:"pincode"};whereText=pin.code;$("#whereInput").value=pin.code;closePanel();renderChips();}return;}
  },{once:true});
  
}

function routeToProject(pr){
  /* Existing contract: open the project detail page. */
  const url=PROJECT_ENDPOINT+"?robprojname="+encodeURIComponent(PROJECT_PREFIX+pr.id);
  if(!IS_DEV){window.location.href=url;return;}
  /* Dev (localhost): no PHP — keep the prototype behaviour + log the URL. */
  console.log("[ghar project] →",url);
  selection={type:"project",id:pr.id,meta:pr};whereText=pr.name;multiLocs=[];
  $("#whereInput").value=pr.name;closePanel();renderChips();
  showToast("Opened "+pr.name,"Undo",()=>{openPanel();$("#whereInput")?.focus();});
}

function renderModePop(){const p=$("#modePop");if(!modePop_){p.classList.add("hidden");return}p.classList.remove("hidden");p.innerHTML=["buy","rent"].map(m=>'<div class="opt-item flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-sm '+(mode===m?"bg-slate-100":"")+'" data-m="'+m+'"><span>'+(m==="buy"?"Buy":"Rent")+'</span><span class="w-3 h-3 rounded-full border-2 '+(mode===m?"border-gray-900 bg-gray-900":"border-gray-400")+'"></span></div>').join("");p.querySelectorAll("[data-m]").forEach(e=>e.addEventListener("click",()=>{mode=e.dataset.m;$("#modeLbl").textContent=mode==="buy"?"Buy":"Rent";modePop_=false;renderModePop();syncAllSearchBars();}));}
function renderTypePop(){const p=$("#typePop");if(!typePop_){p.classList.add("hidden");return}p.classList.remove("hidden");p.innerHTML=["homes","workspaces","land"].map(t=>'<div class="opt-item flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-sm '+(type===t?"bg-slate-100":"")+'" data-t="'+t+'"><span>'+(t==="homes"?"Homes":t==="workspaces"?"Workspaces":"Land")+'</span><span class="w-3 h-3 rounded-full border-2 '+(type===t?"border-gray-900 bg-gray-900":"border-gray-400")+'"></span></div>').join("");p.querySelectorAll("[data-t]").forEach(e=>e.addEventListener("click",()=>{type=e.dataset.t;$("#typeLbl").textContent=type==="homes"?"Homes":type==="workspaces"?"Workspaces":"Land";typePop_=false;renderTypePop();syncAllSearchBars();}));}

function setCity(k){
  city=k;if(k){cityGateForced=false;}else{cityGateForced=true;}
  multiLocs=[];selection=null;whereText="";refineParent=null;
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
function closePanel(){panelOpen=false;manageLocs=false;renderPanel();$("#searchBar").classList.remove("panel-open");$("#searchBar").style.boxShadow="0 4px 24px rgba(0,0,0,.07)";}
function addLoc(l){
  if(multiLocs.some(x=>x.id===l.id))return;
  if(multiLocs.length>=MAX_MULTI){showToast("Max "+MAX_MULTI+" locations selected. Remove one to add more.","OK",()=>{});return;}
  multiLocs.push(l);selection={type:"multi"};whereText="";manageLocs=false;
  $("#whereInput").value="";renderChips();renderPanel();
  /* Keep the cursor in the input so the next location can be typed
     immediately without re-clicking the field. */
  setTimeout(()=>$("#whereInput")?.focus(),0);
}
function removeLoc(i){multiLocs.splice(i,1);if(!multiLocs.length){selection=null;manageLocs=false;}else selection={type:"multi"};renderChips();renderPanel();}

function showToast(text,actionLabel,actionFn){
  let t=document.getElementById("deskToast");
  if(!t){t=document.createElement("div");t.id="deskToast";t.style="position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:#111827;color:#fff;padding:11px 14px;border-radius:999px;display:none;gap:10px;align-items:center;box-shadow:0 16px 40px rgba(0,0,0,.25);z-index:99999;font-size:14px;font-family:'Inter',sans-serif;white-space:nowrap;";document.body.appendChild(t);}
  t.innerHTML='<span>'+escapeHtml(text)+'</span>'+'<button id="toastAct" style="border:0;background:rgba(255,255,255,.14);color:#fff;padding:5px 12px;border-radius:999px;cursor:pointer;font-size:13px;font-family:inherit">'+escapeHtml(actionLabel)+'</button>';
  t.style.display="inline-flex";
  document.getElementById("toastAct").onclick=()=>{t.style.display="none";actionFn();};
  clearTimeout(showToast._t);showToast._t=setTimeout(()=>{t.style.display="none";},4500);
}

/* Mobile search */
const mob={city:"",mode:"buy",type:"homes",locs:[],sel:null,text:"",cityGate:true,accOpen:"where",refine:null};
const MOB_POPULAR=POPULAR_CITIES;
function openMobileSearch(){
  mob.city=city;mob.mode=mode;mob.type=type;
  mob.locs=[...multiLocs];mob.sel=selection;mob.text=whereText;
  mob.cityGate=!city;mob.accOpen="where";mob.refine=null;
  document.getElementById("mobileModal").style.display="flex";
  document.body.style.overflow="hidden";
  mobRenderAll();mobOpenAcc("where");
}
function closeMobileSearch(){document.getElementById("mobileModal").style.display="none";document.body.style.overflow="";}
function mobSubmitSearch(){
  /* Validate the "where" before running — mirrors desktop attemptSearch so a
     half-typed locality never submits into a No-Results page. */
  mobShowWherePrompt(null);
  if(!mob.city){mobOpenAcc("where");mobShowToast("Select a city to search");return;}
  if(!(mob.locs.length||(mob.sel&&mob.sel.type))){
    const q=(mob.text||"").trim();
    if(!q){mob.sel={type:"citywide"};}
    else{
      const s=mobBuildSugg(q);
      const matches=[].concat(
        s.locs.map(x=>({kind:"loc",item:x})),
        s.projs.map(x=>({kind:"prj",item:x})),
        s.pins.map(x=>({kind:"pin",item:x}))
      );
      if(matches.length===1){
        const m=matches[0];
        if(m.kind==="loc")mobSelectLoc(m.item.id);
        else if(m.kind==="prj"){mobSelectProject(m.item.id);return;}/* self-submits */
        else mobSelectPin(m.item.id);
      }else{
        /* Unresolved — block the search and show the inline alert (no submit). */
        mobOpenAcc("where");
        mobShowWherePrompt(matches.length?"pick":"none",q);
        const el=document.getElementById("mobWherePrompt");if(el)el.scrollIntoView({block:"nearest"});
        const inp=document.getElementById("mobLocInput");if(inp)inp.focus();
        return;
      }
    }
  }
  city=mob.city;mode=mob.mode;type=mob.type;
  multiLocs=[...mob.locs];selection=mob.sel;whereText=mob.text;
  cityGateForced=mob.cityGate;renderChips();
  const ml=document.getElementById("modeLbl"),tl=document.getElementById("typeLbl");
  if(ml)ml.textContent=mode==="buy"?"Buy":"Rent";
  if(tl)tl.textContent=type==="homes"?"Homes":type==="workspaces"?"Workspaces":"Land";
  syncAllSearchBars();closeMobileSearch();
  /* Hand off via the same hook as desktop (project → detail page, else results). */
  if(selection&&selection.type==="project"&&selection.meta)routeToProject(selection.meta);
  else executeSearch();
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
    if(!mob.city)wv.textContent="Select City";
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
function mobRenderWhereBody(){
  const gate=document.getElementById("mobCityGate"),within=document.getElementById("mobWithinCity");
  const searchInput=document.getElementById("mobCitySearch");
  if(!gate||!within)return;
  if(!mob.city||mob.cityGate){
    gate.style.display="block";within.style.display="none";
    if(searchInput){searchInput.placeholder="Search for a city";searchInput.oninput=function(){mobFilterCities(this.value);};const w=document.getElementById("mobCitySearchWrap");if(w)w.style.display="block";}
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
    if(lbl)lbl.textContent="Continue";
  }else{
    btn.style.display="none";
  }
}
function mobRenderCityChips(filter){
  const container=document.getElementById("mobCityChips");if(!container)return;
  const emptyDiv=document.getElementById("mobCityEmpty");
  const labelEl=document.getElementById("mobCityPopularLabel");
  const fl=filter.toLowerCase();
  const keys=fl?cityLookup(fl):MOB_POPULAR;
  if(!keys.length){container.style.display="none";if(emptyDiv)emptyDiv.style.display="block";if(labelEl)labelEl.style.display="none";return;}
  if(emptyDiv)emptyDiv.style.display="none";
  container.style.display="flex";
  if(labelEl){labelEl.textContent=fl?"Results":"Popular cities";labelEl.style.display="block";}
  container.innerHTML=keys.map(k=>{const active=mob.city===k;return`<button class="mob-city-chip" style="display:inline-flex;align-items:center;gap:7px;border:1.5px solid ${active?"#141414":"#e5e7eb"};background:${active?"#141414":"#fff"};color:${active?"#fff":"#141414"};padding:8px 14px 8px 11px;border-radius:999px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0" onclick="mobSelectCity('${k}')"><span style="display:inline-flex;color:${active?"#fff":"#141414"}">${cityIcon(k,17)}</span>${escapeHtml(cityLabel(k))}</button>`;}).join("");
}
window.mobFilterCities=function(val){mobRenderCityChips(val.trim());};
window.mobSelectCity=function(key){
  const prev=mob.city;mob.city=key;mob.cityGate=false;mob.refine=null;
  if(prev&&prev!==key){mob.locs=[];mob.sel=null;mob.text="";const i=document.getElementById("mobLocInput");if(i)i.value="";}
  mobRenderWhereBody();mobRenderWhereVal();
  setTimeout(()=>document.getElementById("mobLocInput")?.focus(),80);
};
window.mobChangeCity=function(){mob.cityGate=true;mobRenderWhereBody();};
function mobRenderSelectedChips(){
  const wrap=document.getElementById("mobSelectedWrap");
  const container=document.getElementById("mobSelectedChips");
  if(!container)return;
  if(!mob.locs.length){if(wrap)wrap.style.display="none";return;}
  if(wrap)wrap.style.display="block";
  container.innerHTML=mob.locs.map((loc,i)=>`<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 4px 6px 13px;border-radius:999px;background:#f3f4f6;font-size:13px;color:#111">${escapeHtml(loc.name)}<button onclick="mobRemoveLoc(${i})" aria-label="Remove ${escapeHtml(loc.name)}" style="width:18px;height:18px;border-radius:50%;border:0;background:#e2e4e8;color:#6b7280;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0">${CHIP_X}</button></span>`).join("");
}
window.mobRemoveLoc=function(i){mob.locs.splice(i,1);if(!mob.locs.length&&mob.sel&&mob.sel.type==="multi")mob.sel=null;mobRenderSelectedChips();mobRenderWhereVal();mobRenderAcSuggestions(document.getElementById("mobLocInput")?.value||"");mobUpdateWhereNext();};
window.mobClearLocs=function(){mob.locs=[];mob.sel=null;mob.text="";mob.refine=null;const i=document.getElementById("mobLocInput");if(i)i.value="";mobRenderSelectedChips();mobRenderAcSuggestions("");mobRenderWhereVal();mobUpdateWhereNext();};
/* Inline validation alert for the mobile Where step (mirrors desktop .where-prompt). */
function mobShowWherePrompt(kind,q){
  const el=document.getElementById("mobWherePrompt");if(!el)return;
  if(!kind){el.style.display="none";el.innerHTML="";return;}
  const badge='<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#ee324b"/><path d="M12 7v6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="16.6" r="1.25" fill="#fff"/></svg>';
  if(kind==="pick"){
    el.innerHTML='<div class="where-prompt">'+badge+'Pick a location from the list to continue</div>';
  }else{
    el.innerHTML='<div class="where-prompt">'+badge+'No exact match for "'+escapeHtml(q)+'" in '+escapeHtml(DATA[mob.city].cityName)+'</div>'
      +'<button onclick="event.stopPropagation();mobSearchCitywide()" style="width:100%;display:inline-flex;align-items:center;justify-content:center;gap:8px;margin-top:8px;border:1.5px solid #141414;border-radius:14px;padding:12px;font-size:14px;font-weight:600;color:#141414;background:#fff;cursor:pointer;font-family:inherit"><span style="font-size:17px;line-height:1">🌆</span>Search all of '+escapeHtml(DATA[mob.city].cityName)+'</button>';
  }
  el.style.display="block";
}
window.mobSearchCitywide=function(){mob.locs=[];mob.sel={type:"citywide"};mob.text="";const i=document.getElementById("mobLocInput");if(i)i.value="";mobShowWherePrompt(null);mobRenderSelectedChips();mobUpdateWhereNext();mobSubmitSearch();};
function mobBuildSugg(q){
  const d=DATA[mob.city];const ids=new Set(mob.locs.map(x=>x.id));const qt=q.trim().toLowerCase();
  if(!qt){
    if(mob.refine){const parent=locById(mob.city,mob.refine);if(parent)return{locs:locChildren(mob.city,mob.refine).filter(x=>!ids.has(x.id)),sublocs:[],projs:[],pins:[],refine:parent};}
    /* A location is already selected → hide the Popular idle shortcuts
       (matches desktop). User proceeds from the chip(s) or types to add more. */
    if(ids.size)return{locs:[],sublocs:[],projs:[],pins:[],refine:null};
    /* Mobile idle stays deliberately SHORT — the modal is small and the
       Mode/Type steps sit right below, so we surface only a compact Popular
       Localities group (top 4). Sub-locations, projects and pincodes are all
       withheld until the user types. Desktop has room for the fuller three-
       group set — see buildSugg(). (Reversible: add sublocs/projs back here.) */
    return{locs:d.locations.filter(x=>!x.parent&&!ids.has(x.id)).slice(0,4),sublocs:[],projs:[],pins:[],refine:null};
  }
  const starts=[],incl=[];d.locations.forEach(x=>{if(ids.has(x.id))return;const n=x.name.toLowerCase();if(n.startsWith(qt))starts.push(x);else if(n.includes(qt))incl.push(x);});
  return{locs:starts.concat(incl).slice(0,8),sublocs:[],projs:d.projects.filter(x=>x.name.toLowerCase().includes(qt)).slice(0,5),pins:/^[0-9]+$/.test(qt)?d.pincodes.filter(x=>x.code.startsWith(qt)).slice(0,5):[],refine:null};
}
/* Mobile locality row — breadcrumb + "N areas ›" drill-in pill (mirrors desktop). */
function mobLocRowHTML(loc){
  const kids=locChildren(mob.city,loc.id);
  const right=kids.length?`<button onclick="event.stopPropagation();mobRefine('${loc.id}')" aria-label="Sub-areas of ${escapeHtml(loc.name)}" style="margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;gap:2px;border:1px solid #e5e7eb;background:#fff;border-radius:999px;padding:6px 8px 6px 12px;font-size:12px;font-weight:600;color:#374151;font-family:inherit">${kids.length} areas<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>`:'';
  return `<div class="mob-ac-item" style="display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:12px;cursor:pointer;font-size:14px" onclick="mobSelectLoc('${loc.id}')"><span>📍</span><div style="min-width:0"><div style="font-weight:500;line-height:1.2">${escapeHtml(loc.name)}</div><div style="font-size:12px;line-height:1.2;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(locBreadcrumb(mob.city,loc))}</div></div>${right}</div>`;
}
function mobRenderAcSuggestions(query){
  mobShowWherePrompt(null);   /* any typing/selection dismisses the validation alert */
  const box=document.getElementById("mobAcBox");if(!box)return;
  if(!mob.city){box.innerHTML="";return;}
  const r=mobBuildSugg(query);const{locs,sublocs,projs,pins}=r;
  const hasAny=locs.length||(sublocs&&sublocs.length)||projs.length||pins.length;
  /* Recents ride their own persistent chassis rail (above #mobAcBox), shown only
     on the idle first-entry state. */
  mobRenderRecents(!query.trim()&&!mob.locs.length&&!r.refine);
  let h="";
  if(r.refine){
    h+=`<button onclick="mobRefineBack()" style="display:flex;align-items:center;gap:6px;width:100%;text-align:left;border:0;background:transparent;padding:6px 8px;border-radius:10px;font-size:13px;font-weight:600;color:#6a6a6a;font-family:inherit"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>All localities in ${escapeHtml(DATA[mob.city].cityName)}</button>`;
    h+=`<div class="mob-ac-item" style="display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:12px;cursor:pointer;font-size:14px" onclick="mobSelectLoc('${r.refine.id}')"><span style="width:28px;height:28px;border-radius:8px;background:#fde8e8;display:grid;place-items:center">📍</span><div><div style="font-weight:600;line-height:1.2">All of ${escapeHtml(r.refine.name)}</div><div style="font-size:12px;line-height:1.2;color:#6b7280">Whole locality · ${escapeHtml(DATA[mob.city].cityName)}</div></div></div>`;
    h+=`<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin:14px 4px 2px">Sub-areas of ${escapeHtml(r.refine.name)}</div>`;
    if(locs.length){locs.forEach(loc=>{h+=mobLocRowHTML(loc);});}else{h+='<div style="padding:6px 10px;color:#9ca3af;font-size:14px">All sub-areas added.</div>';}
    box.innerHTML=h;return;
  }
  if(!query.trim()&&!mob.locs.length){
    /* Slim single-line citywide action (mirrors desktop) — sits under recents,
       above Popular, so browsing localities starts high in the modal. */
    h+=`<div class="mob-ac-item" style="display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:12px;cursor:pointer;font-size:14px" onclick="event.stopPropagation();mobSelectCitywide()"><span style="font-size:18px;line-height:1;width:24px;text-align:center;flex-shrink:0">🌆</span><span style="font-weight:500;color:#141414">All of ${escapeHtml(DATA[mob.city].cityName)}</span><span style="font-size:12px;color:#6b7280;margin-left:6px">entire city</span><svg style="margin-left:auto;flex-shrink:0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c7c3bb" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></div>`;
    h+='<div style="height:1px;background:#eceae6;margin:12px 6px 13px"></div>';
  }
  if(locs.length){h+=`<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin:14px 4px 2px">${query.trim()?"Locations":"Popular Localities"}</div>`;locs.forEach(loc=>{h+=mobLocRowHTML(loc);});}
  if(sublocs&&sublocs.length){h+=`<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin:14px 4px 2px">Popular Sub-Locations</div>`;sublocs.forEach(loc=>{h+=mobLocRowHTML(loc);});}
  if(projs.length){h+=`<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin:14px 4px 2px">${query.trim()?"Projects":"Popular Projects"}</div>`;projs.forEach(proj=>{h+=`<div class="mob-ac-item" style="display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:12px;cursor:pointer;font-size:14px" onclick="mobSelectProject('${proj.id}')"><span>🏢</span><div><div style="font-weight:500;line-height:1.2">${escapeHtml(proj.name)}</div><div style="font-size:12px;line-height:1.2;color:#6b7280">${escapeHtml(proj.micro)}</div></div></div>`;});}
  if(pins.length){h+=`<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#9ca3af;margin:14px 4px 2px">Pincodes</div>`;pins.forEach(pin=>{h+=`<div class="mob-ac-item" style="display:flex;align-items:center;gap:10px;padding:6px 10px;border-radius:12px;cursor:pointer;font-size:14px" onclick="mobSelectPin('${pin.id}')"><span>📮</span><div><div style="font-weight:500;line-height:1.2">${escapeHtml(pin.code)}</div><div style="font-size:12px;line-height:1.2;color:#6b7280">${escapeHtml(pin.area)}</div></div></div>`;});}
  if(query.trim()&&!hasAny)h='<div style="padding:16px;text-align:center;color:#9ca3af;font-size:14px">No results found</div>';
  box.innerHTML=h;
}
window.mobRefine=function(id){mob.refine=id;mob.text="";const i=document.getElementById("mobLocInput");if(i)i.value="";mobRenderAcSuggestions("");};
window.mobRefineBack=function(){mob.refine=null;mobRenderAcSuggestions("");};
window.mobOnLocInput=function(val){mob.text=val;mob.sel=null;mob.refine=null;mobRenderAcSuggestions(val);};
window.mobSelectCitywide=function(){mob.locs=[];mob.sel={type:"citywide"};mob.text="";const i=document.getElementById("mobLocInput");if(i)i.value="";mobRenderSelectedChips();mobRenderAcSuggestions("");mobRenderWhereVal();mobOpenAcc("mode");};
window.mobSelectLoc=function(id){const loc=DATA[mob.city].locations.find(x=>x.id===id);if(!loc)return;if(mob.locs.some(x=>x.id===id))return;if(mob.locs.length>=MAX_MULTI){mobShowToast("Max "+MAX_MULTI+" locations");return;}mob.locs.push(loc);mob.sel={type:"multi"};mob.text="";const i=document.getElementById("mobLocInput");if(i)i.value="";mobRenderSelectedChips();mobRenderAcSuggestions("");mobRenderWhereVal();mobUpdateWhereNext();if(i)setTimeout(()=>i.focus(),0);};
window.mobSelectProject=function(id){const proj=DATA[mob.city].projects.find(x=>x.id===id);if(!proj)return;mob.sel={type:"project",id:proj.id,meta:proj};mob.text=proj.name;mob.locs=[];const i=document.getElementById("mobLocInput");if(i)i.value=proj.name;mobRenderWhereVal();mobSubmitSearch();setTimeout(()=>mobShowToast("Opened: "+proj.name),200);};
window.mobSelectPin=function(id){const pin=DATA[mob.city].pincodes.find(x=>x.id===id);if(!pin)return;mob.sel={type:"pincode"};mob.text=pin.code;const i=document.getElementById("mobLocInput");if(i)i.value=pin.code;mobRenderWhereVal();mobOpenAcc("mode");};
window.mobSetMode=function(m){mob.mode=m;mobRenderModeVal();mobRenderModeBtns();};
window.mobSetType=function(t){mob.type=t;mobRenderTypeVal();mobRenderTypeBtns();};
function mobRenderModeVal(){const el=document.getElementById("mobModeVal");if(el)el.textContent=mob.mode==="buy"?"Buy":"Rent";}
function mobRenderTypeVal(){const el=document.getElementById("mobTypeVal");if(el)el.textContent=mob.type==="homes"?"Homes":mob.type==="workspaces"?"Workspaces":"Land";}
function mobRenderModeBtns(){document.querySelectorAll(".mob-mode-btn").forEach(btn=>{const a=btn.dataset.m===mob.mode;if(a)btn.classList.add("chosen");else btn.classList.remove("chosen");btn.style.fontWeight=a?"600":"500";});mobSyncCollapsedVals();}
function mobRenderTypeBtns(){document.querySelectorAll(".mob-type-btn").forEach(btn=>{const a=btn.dataset.t===mob.type;if(a)btn.classList.add("chosen");else btn.classList.remove("chosen");btn.style.fontWeight=a?"600":"500";});mobSyncCollapsedVals();}
window.mobClearAll=function(){mob.city="";mob.mode="buy";mob.type="homes";mob.locs=[];mob.sel=null;mob.text="";mob.cityGate=true;mob.refine=null;const i=document.getElementById("mobLocInput");if(i)i.value="";const cs=document.getElementById("mobCitySearch");if(cs)cs.value="";mobRenderAll();mobOpenAcc("where");};
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
    if(e.key==="Enter"){e.preventDefault();attemptSearch();}
  });
  wi.addEventListener("input",()=>{if(!city)return;whereText=wi.value;selection=null;wherePrompt=null;refineParent=null;manageLocs=false;openPanel();});
  $("#clearBtn").addEventListener("click",e=>{
    e.stopPropagation();selection=null;whereText="";wi.value="";multiLocs=[];refineParent=null;
    renderChips();cityGateForced=!city;openPanel();
    setTimeout(()=>{if(city)wi.focus();else document.getElementById("deskCitySearch")?.focus();},30);
  });
  $("#modeBtn").addEventListener("click",e=>{e.stopPropagation();closePanel();typePop_=false;renderTypePop();modePop_=!modePop_;renderModePop();});
  $("#typeBtn").addEventListener("click",e=>{e.stopPropagation();closePanel();modePop_=false;renderModePop();typePop_=!typePop_;renderTypePop();});
  $("#goBtn").addEventListener("click",()=>{attemptSearch();});
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
    /* Inner pages: no scroll animation on the nav at any viewport. */
    if(document.body.classList.contains("simple-nav"))return;
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

  /* ── GSAP plugin registration moved to top-level (line ~851) so it runs once
     at parse time, before DOMContentLoaded fires. ScrollTrigger is idempotent
     to re-registration, but a single canonical call keeps the call graph clean. */

  /* Section entrance reveals stripped — will re-introduce a tuned system
     after carousel issues are sorted. */

  /* ── People + Brands carousels — share the chassis (initCarousel) with
     Intelligence / Architecture / Editorial / etc. via the .rail-outer +
     .rail co-classes added in the HTML. The chassis already handles
     desktop GSAP-transform drag and the mobile native-scroll switch, so
     no custom IIFE is needed here — just two init calls. ~300 lines of
     duplicated logic removed. */
  function _initRailById(outerId, trackId, prevId, nextId) {
    var outer = document.getElementById(outerId);
    var track = document.getElementById(trackId);
    if (!outer || !track || typeof window.initCarousel !== 'function') return;
    window.initCarousel({
      outer: outer,
      track: track,
      prevBtn: document.getElementById(prevId),
      nextBtn: document.getElementById(nextId),
      autoplayMs: 4000,
      snap: 'card'
    });
  }
  _initRailById('pplTrackWrap', 'pplTrack', 'pplPrev', 'pplNext');
  _initRailById('brdTrackWrap', 'brdTrack', 'brdPrev', 'brdNext');
});

/* Section entrance reveal observer stripped — `.reveal-rise` /
   `.reveal-stagger` CSS is also disabled, so the classes are no-op
   in markup. Re-introduce after carousels are stable. */

/* ScrollSmoother removed — the page doesn't use data-speed/data-lag
   parallax effects, so native browser scroll is fine. ScrollTrigger
   stays registered for the few remaining guarded triggers. */
gsap.registerPlugin(ScrollTrigger);

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
/* ScrollSmoother.create() removed. */

/* Hero entrance animations stripped — nav, hero h1, eco cards, and
   illustrations all render in their natural CSS state on load. */


/* Explore anchor removed */

/* ── ECO CAROUSEL - 1-up mobile / 2-up tablet ── */
/* Eco carousel - dots + autoplay (drag handled by shared drag-scroll utility) */
(function(){
  var track = document.querySelector('.e4-hero .e4-track');
  var dotsWrap = document.getElementById('ecoDots');
  if(!track || !dotsWrap) return;
  var cards = Array.from(track.querySelectorAll('.e4-card'));
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
      btn.className = 'e4-dot' + (i === 0 ? ' active' : '');
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
    /* Advance regardless of viewport width — eco hero auto-cycles on
       both mobile and desktop (user request). */
    var count = dots.length || cards.length;
    if(!count) return;
    var next = (getActive() + 1) % count;
    /* On desktop the carousel isn't a scroll-snap rail (all 4 cards
       are visible at once), so the goTo() scroll-target call is a
       no-op there. But desktop builds dots = 0, so this just guards
       against running with no targets. */
    goTo(next);
  }
  function startAuto(){
    stopAuto();
    if(dots.length > 1) autoTimer = setInterval(autoAdvance, INTERVAL);
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
  /* Auto-play whenever the carousel is in viewport. Pauses when
     scrolled out. Was previously gated to mobile-only; now runs on
     every width that has a multi-page snap track. */
  var edObs=new IntersectionObserver(function(entries){entries.forEach(function(e){
    if(e.isIntersecting) startAuto(); else stopAuto();
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

  /* hscroll panel content fade stripped. */
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

/* revealUp utility + .hscroll-content reveal stripped. */

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
  function scrollTo(i){var t=items[Math.max(0,Math.min(i,total-1))];grid.scrollTo({left:t.offsetLeft,behavior:'smooth'});setTimeout(update,550);}
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
  function scrollTo(i){var t=items[Math.max(0,Math.min(i,total-1))];grid.scrollTo({left:t.offsetLeft-grid.offsetLeft,behavior:'smooth'});setTimeout(update,550);}
  prev.addEventListener('click',function(){scrollTo(getActive()-1);});
  next.addEventListener('click',function(){scrollTo(getActive()+1);});
  grid.addEventListener('scroll',function(){requestAnimationFrame(update);});
  update();
})();

/* For Brokers reveal block stripped — word color scrub + hero/features/
   SuperPro entrance animations all removed. Section renders static. */

/* Brokers orbit SVG: entrance timeline + continuous loops (orbit pulse,
   node float, spoke/node red scan) all stripped. SVG renders static.
   The continuous repeat:-1 tweens were keeping RAF awake forever and
   stealing frame budget from carousels lower on the page. */

(function(){
  var el=document.querySelector('.fb-features');
  if(!el)return;
  var items=Array.from(el.children).filter(function(c){return c.classList.contains('fb-feat')}),total=items.length,autoTimer=null,INTERVAL=3500;
  function center(i){var t=items[i];return t.offsetLeft+t.offsetWidth/2-el.clientWidth/2;}
  function getActive(){var s=el.scrollLeft+el.clientWidth/2,b=0,bd=Infinity;for(var i=0;i<total;i++){var mid=items[i].offsetLeft+items[i].offsetWidth/2;var d=Math.abs(mid-s);if(d<bd){bd=d;b=i;}}return b;}
  function goTo(i){var target=Math.max(0,Math.min(center(i),el.scrollWidth-el.clientWidth));el.scrollTo({left:target,behavior:'smooth'});}
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

/* For Developers section entrance + ecosystem SVG timeline stripped. */

(function(){
  var el=document.querySelector('.fd-features');
  if(!el)return;
  var items=Array.from(el.querySelectorAll('.fd-feat')),total=items.length,autoTimer=null,INTERVAL=3500;
  function center(i){var t=items[i];return t.offsetLeft+t.offsetWidth/2-el.clientWidth/2;}
  function getActive(){var s=el.scrollLeft+el.clientWidth/2,b=0,bd=Infinity;for(var i=0;i<total;i++){var mid=items[i].offsetLeft+items[i].offsetWidth/2;var d=Math.abs(mid-s);if(d<bd){bd=d;b=i;}}return b;}
  function goTo(i){var target=Math.max(0,Math.min(center(i),el.scrollWidth-el.clientWidth));el.scrollTo({left:target,behavior:'smooth'});}
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
    function scrollTo(i){var t=items[Math.max(0,Math.min(i,total-1))];cardsEl.scrollTo({left:t.offsetLeft,behavior:'smooth'});setTimeout(update,550);}
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
    function goTo(i){var t=items[Math.max(0,Math.min(i,total-1))];var target=Math.min(t.offsetLeft,spotEl.scrollWidth-spotEl.clientWidth);spotEl.scrollTo({left:target,behavior:'smooth'});}
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
    grid.scrollTo({left:target,behavior:'smooth'});
  }
  grid.addEventListener('scroll',updateDots);
  buildDots();window.addEventListener('resize',buildDots);
})();

/* Ecosystem .eco-map reveal observer stripped — CSS now defaults
   .eco-ring/.eco-node/.eco-center to opacity:1 (was 0 + animated in
   on viewport entry via .eco-visible). */

(function(){
  /* Guarded: Developer Mandate word reveal is index.html-only. */
  if (!document.querySelector('#fdRevealBlock')) return;

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
                /* Looping arrow + pct animations run on desktop only — on
                   mobile they sit on the main thread forever (repeat:-1)
                   and steal frame budget from carousels lower on the page. */
                if(window.innerWidth >= 744){
                  gsap.to(growth.querySelector('.cn-grow-arrow'),{
                    y:-3,duration:.8,ease:'sine.inOut',yoyo:true,repeat:-1
                  });
                  gsap.to(growth.querySelector('.cn-grow-pct'),{
                    opacity:.6,duration:1,ease:'sine.inOut',yoyo:true,repeat:-1
                  });
                }
              }
            }
          });
          obs.disconnect();
        }
      });
    },{threshold:0.5});
    obs.observe(counter.closest('.cn-card-earn'));
  })();

  /* (Ecosystem observer moved OUT of this guarded IIFE — see top of file
     above this block. Was being skipped on index4 because #fdRevealBlock
     doesn't exist there.) */

  /* People drag-scroll removed - replaced with continuous ticker */

  /* Community closer entrance + scrub-parallax stripped. The scrub:true
     ScrollTriggers were running ~3 tweens on every scroll frame, which
     was a meaningful contributor to vertical-scroll lag. */
})();