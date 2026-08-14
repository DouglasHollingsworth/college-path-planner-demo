// Nationwide school search + school-specific pathway popup for Student Launch.
// Directory identity comes from the national CCD/NCES school directory via Urban Institute's Education Data API.
// Pathways are shown only when Student Launch has a verified school/district source; otherwise we show official lookup links.
(function () {
  const GCPS_SCHOOLS = [
    'Archer High School','Berkmar High School','Brookwood High School','Central Gwinnett High School',
    'Collins Hill High School','Dacula High School','Discovery High School','Duluth High School','Grayson High School',
    'Gwinnett School of Mathematics, Science, and Technology','Lanier High School','McClure Health Science High School',
    'Meadowcreek High School','Mill Creek High School','Mountain View High School','Norcross High School',
    'North Gwinnett High School','Parkview High School','Paul Duke STEM High School','Peachtree Ridge High School',
    'Phoenix High School','Seckinger High School','Shiloh High School','South Gwinnett High School'
  ];

  const VERIFIED = {
    'McClure Health Science High School': {
      district: 'Gwinnett County Public Schools', state: 'Georgia', city: 'Duluth',
      pathways: [
        'Allied Health & Medicine','Health Information Management','Patient Care Technician','Sports Medicine',
        'Exercise Physiology','Pharmacy Operations / Pharmacy Technician','Computer Science','Marketing','Audio / Video / Film'
      ],
      note: 'Verified from current McClure and GCPS program pages. Pharmacy Operations is listed for the 2026-27 school year.',
      sources: [
        ['McClure Pathway Information','https://mcclurehealthsciencehs.gcpsk12.org/academics/health-science/pathway-information'],
        ['GCPS McClure School Profile','https://www.gcpsk12.org/schools/school-profiles-and-lspi/school-profiles/high-schools/mcclure-health-science-high-school']
      ]
    },
    'Paul Duke STEM High School': {
      district: 'Gwinnett County Public Schools', state: 'Georgia', city: 'Norcross',
      pathways: ['Computer Science','Engineering','Mechatronics','Graphic Design','Audio / Video / Film','Cybersecurity','Artificial Intelligence'],
      note: 'Current GCPS materials describe STEM pathways including computer science, engineering, mechatronics, design/film and cybersecurity; GCPS announced an Artificial Intelligence pathway for 2026-27.',
      sources: [['GCPS College & Career Development','https://www.gcpsk12.org/programs-and-services/college-and-career-development']]
    }
  };

  const profilePanel = document.querySelector('#profile .panel');
  if (!profilePanel || document.getElementById('schoolLookup')) return;

  const block = document.createElement('div');
  block.className = 'card schoolLookupCard';
  block.innerHTML = `
    <div class="eyebrow">School Match</div>
    <h3>Find your high school</h3>
    <p class="muted">Search any U.S. public high school. Student Launch identifies the school from the national directory, then loads verified school-specific pathways when available.</p>
    <div class="schoolLookupRow">
      <div class="field schoolLookupField"><label>High school</label><input id="schoolLookup" autocomplete="off" placeholder="Example: Lincoln High School"></div>
      <button class="btn primary" id="schoolLookupBtn">Search U.S. Schools</button>
    </div>
    <div id="schoolLookupStatus" class="muted schoolLookupStatus"></div>
    <div id="schoolLookupResults" class="schoolLookupResults"></div>
    <div id="selectedSchoolBadge"></div>`;

  const firstField = profilePanel.querySelector('.grid');
  profilePanel.insertBefore(block, firstField || profilePanel.firstChild);

  const modal = document.createElement('div');
  modal.id = 'pathwayModal';
  modal.className = 'pathwayModal';
  modal.setAttribute('aria-hidden','true');
  modal.innerHTML = `<div class="pathwayModalPanel" role="dialog" aria-modal="true" aria-labelledby="pathwayModalTitle">
      <button class="btn pathwayClose" id="pathwayClose" aria-label="Close pathway list">×</button>
      <div class="eyebrow">School-Specific Pathways</div>
      <h2 id="pathwayModalTitle">School pathways</h2>
      <div id="pathwayModalBody"></div>
    </div>`;
  document.body.appendChild(modal);

  function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
  function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function allSchools(){
    const configured = Object.values(window.schools || {}).map(s=>s.name).filter(Boolean);
    return [...new Set([...GCPS_SCHOOLS,...configured])];
  }

  function configuredSchool(name){
    return Object.values(window.schools || {}).find(s=>s.name===name || s.short===name);
  }

  function saveSelectedSchool(school){
    const entry = typeof school === 'string' ? {name:school} : school;
    S.profile = S.profile || {};
    S.profile.schoolName = entry.name || '';
    S.profile.schoolDistrict = entry.district || '';
    S.profile.schoolCity = entry.city || '';
    S.profile.schoolState = entry.state || '';
    S.profile.schoolNcesId = entry.ncesId || '';
    localStorage.setItem(CORE_KEY, JSON.stringify(S));
    renderSelectedSchool();
  }

  function currentSchoolRecord(){
    return {
      name:S?.profile?.schoolName||'', district:S?.profile?.schoolDistrict||'', city:S?.profile?.schoolCity||'',
      state:S?.profile?.schoolState||S?.profile?.state||'', ncesId:S?.profile?.schoolNcesId||''
    };
  }

  function renderSelectedSchool(){
    const s = currentSchoolRecord();
    const badge = document.getElementById('selectedSchoolBadge');
    if (!badge) return;
    const meta=[s.district,s.city,s.state,s.ncesId?`NCES ${s.ncesId}`:''].filter(Boolean).join(' · ');
    badge.innerHTML = s.name ? `<div class="selectedSchool"><span>Selected school</span><b>${esc(s.name)}</b>${meta?`<small>${esc(meta)}</small>`:''}<button type="button" class="btn" id="viewSchoolPathways">View pathways</button></div>` : '';
    document.getElementById('viewSchoolPathways')?.addEventListener('click',()=>openSchool(s));
  }

  function localMatches(query){
    const q=norm(query); if(!q) return [];
    const words=q.split(' ');
    return allSchools().filter(name=>words.every(w=>norm(name).includes(w))).slice(0,6).map(name=>{
      const v=VERIFIED[name], c=configuredSchool(name);
      return {name,district:v?.district||c?.district||'Gwinnett County Public Schools',city:v?.city||'',state:v?.state||c?.state||'Georgia',source:'local'};
    });
  }

  function pick(obj, keys){for(const k of keys){if(obj && obj[k]!=null && obj[k]!=='') return obj[k]} return ''}
  function normalizeNational(row){
    return {
      name: pick(row,['school_name','name','school']),
      district: pick(row,['lea_name','district_name','agency_name']),
      city: pick(row,['city_location','city','school_city','mail_city']),
      state: pick(row,['state_location','state_abbr','state','state_name']),
      ncesId: String(pick(row,['ncessch','nces_school_id','school_id'])||''),
      source:'national'
    };
  }

  async function latestCcdYear(){
    try{
      const r=await fetch('https://educationdata.urban.org/api/v1/api-endpoints/?endpoint_id=24');
      if(!r.ok) throw new Error('metadata');
      const j=await r.json();
      const years=String(j?.results?.[0]?.years_available||'');
      const matches=years.match(/\d{4}/g)||[];
      return matches.length?matches[matches.length-1]:'2023';
    }catch(_){return '2023'}
  }

  async function nationalSearch(query){
    const year=await latestCcdYear();
    const url=`https://educationdata.urban.org/api/v1/schools/ccd/directory/${year}/?school_name=${encodeURIComponent(query.trim())}`;
    const r=await fetch(url);
    if(!r.ok) throw new Error('directory');
    const j=await r.json();
    return (j?.results||[]).map(normalizeNational).filter(x=>x.name).slice(0,12);
  }

  function renderSchoolButtons(schoolsFound){
    const out=document.getElementById('schoolLookupResults');
    const unique=[]; const seen=new Set();
    schoolsFound.forEach(s=>{const key=[norm(s.name),norm(s.district),norm(s.state)].join('|');if(!seen.has(key)){seen.add(key);unique.push(s)}});
    out.innerHTML=unique.slice(0,12).map((s,i)=>{
      const verified=!!VERIFIED[s.name] || !!(configuredSchool(s.name)?.programs||[]).length;
      const meta=[s.district,s.city,s.state].filter(Boolean).join(' · ');
      return `<button type="button" class="schoolResult" data-school-index="${i}"><span><b>${esc(s.name)}</b><small>${esc(meta||'U.S. school directory')}${verified?' · verified pathways available':''}</small></span><span class="pill">${verified?'VIEW':'SELECT'}</span></button>`;
    }).join('');
    out.querySelectorAll('[data-school-index]').forEach(btn=>btn.addEventListener('click',()=>{
      const s=unique[Number(btn.dataset.schoolIndex)]; saveSelectedSchool(s); out.innerHTML=''; document.getElementById('schoolLookup').value=s.name; openSchool(s);
    }));
  }

  function renderLocal(query){
    const matches=localMatches(query);
    if(matches.length) renderSchoolButtons(matches);
    else document.getElementById('schoolLookupResults').innerHTML='';
  }

  async function performSearch(){
    const input=document.getElementById('schoolLookup');
    const query=input.value.trim();
    const out=document.getElementById('schoolLookupResults');
    const status=document.getElementById('schoolLookupStatus');
    if(query.length<3){status.textContent='Type at least 3 characters.';return}
    const local=localMatches(query);
    status.textContent='Searching the U.S. public-school directory…';
    try{
      const national=await nationalSearch(query);
      const merged=[...local,...national];
      if(merged.length){renderSchoolButtons(merged);status.textContent=`${merged.length} possible match${merged.length===1?'':'es'} found. Choose the correct school.`;}
      else{
        status.textContent='No exact national-directory match returned. Try the full official school name.';
        out.innerHTML=`<div class="card notice"><b>Still not seeing it?</b><p>Use the official NCES School Locator, then return and enter the school exactly as listed.</p><div class="officialLinks"><a href="https://nces.ed.gov/ccd/schoolsearch/" target="_blank" rel="noopener">Open NCES School Locator ↗</a></div><button type="button" class="btn" id="useTypedSchool">Use typed school anyway</button></div>`;
        document.getElementById('useTypedSchool')?.addEventListener('click',()=>{const s={name:query,state:S?.profile?.state||''};saveSelectedSchool(s);out.innerHTML='';openSchool(s)});
      }
    }catch(_){
      status.textContent='National directory is temporarily unavailable. Local/verified matches still work.';
      if(local.length) renderSchoolButtons(local); else out.innerHTML=`<div class="card notice"><b>Directory unavailable</b><p>You can verify the school in the official NCES locator.</p><div class="officialLinks"><a href="https://nces.ed.gov/ccd/schoolsearch/" target="_blank" rel="noopener">Open NCES School Locator ↗</a></div></div>`;
    }
  }

  function openSchool(school){
    const record=typeof school==='string'?{name:school,state:S?.profile?.state||''}:school;
    const name=record.name; if(!name)return;
    const modal=document.getElementById('pathwayModal');
    const title=document.getElementById('pathwayModalTitle');
    const body=document.getElementById('pathwayModalBody');
    title.textContent=name;
    const verified=VERIFIED[name];
    const configured=configuredSchool(name);
    const configPrograms=(configured?.programs||[]).map(p=>p[1]).filter(Boolean);
    const pathways=verified?.pathways?.length?verified.pathways:configPrograms;
    const district=verified?.district||configured?.district||record.district||'';
    const state=verified?.state||configured?.state||record.state||S?.profile?.state||'';
    if(pathways.length){
      body.innerHTML=`${district?`<p class="muted">${esc(district)}${state?' · '+esc(state):''}</p>`:''}<div class="pathwayGrid">${pathways.map(p=>`<button type="button" class="pathwayChoice" data-pathway="${esc(p)}"><span>✓</span><b>${esc(p)}</b></button>`).join('')}</div>${verified?.note?`<div class="card notice"><b>Verification note</b><p>${esc(verified.note)}</p></div>`:''}${verified?.sources?.length?`<div class="officialLinks"><b>Official sources</b>${verified.sources.map(src=>`<a href="${src[1]}" target="_blank" rel="noopener">${esc(src[0])} ↗</a>`).join('')}</div>`:''}`;
      body.querySelectorAll('[data-pathway]').forEach(btn=>btn.addEventListener('click',()=>{S.profile=S.profile||{};S.profile.schoolPathway=btn.dataset.pathway;localStorage.setItem(CORE_KEY,JSON.stringify(S));body.querySelectorAll('.pathwayChoice').forEach(b=>b.classList.toggle('on',b.dataset.pathway===btn.dataset.pathway))}));
      if(S?.profile?.schoolPathway){const target=[...body.querySelectorAll('[data-pathway]')].find(b=>b.dataset.pathway===S.profile.schoolPathway);target?.classList.add('on')}
    }else{
      const ga=/georgia|\bga\b/i.test(state);
      const districtText=district?`<p class="muted">${esc(district)}${state?' · '+esc(state):''}</p>`:'';
      body.innerHTML=`${districtText}<div class="card notice"><b>School identified — pathways not verified yet</b><p>Student Launch will not invent this school's offerings. We identified the school, but the pathway layer still needs an official state, district, or school source.</p></div><div class="officialLinks"><b>Official verification sources</b>${ga?'<a href="https://app.gadoe.org/gcp/search" target="_blank" rel="noopener">Georgia Career Pipeline ↗</a>':''}${/gwinnett/i.test(district)?'<a href="https://www.gcpsk12.org/programs-and-services/college-and-career-development" target="_blank" rel="noopener">GCPS Pathway Offerings ↗</a>':''}<a href="https://nces.ed.gov/ccd/schoolsearch/" target="_blank" rel="noopener">NCES School Locator ↗</a></div>`;
    }
    modal.classList.add('open');modal.setAttribute('aria-hidden','false');
  }

  function close(){const modal=document.getElementById('pathwayModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
  document.getElementById('pathwayClose').addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  let timer;
  document.getElementById('schoolLookup').addEventListener('input',e=>{clearTimeout(timer);renderLocal(e.target.value);document.getElementById('schoolLookupStatus').textContent=e.target.value.trim().length>=3?'Press Search U.S. Schools for nationwide results.':''});
  document.getElementById('schoolLookup').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();performSearch()}});
  document.getElementById('schoolLookupBtn').addEventListener('click',performSearch);
  renderSelectedSchool();
})();