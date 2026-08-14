// School search + school-specific pathway popup for Student Launch.
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
    <p class="muted">Search your school to load school-specific pathways. Verified school offerings appear automatically; unverified schools fall back to official pathway sources instead of guessing.</p>
    <div class="schoolLookupRow">
      <div class="field schoolLookupField"><label>High school</label><input id="schoolLookup" autocomplete="off" placeholder="Start typing your high school..."></div>
      <button class="btn primary" id="schoolLookupBtn">Find School</button>
    </div>
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
  function allSchools(){
    const configured = Object.values(window.schools || {}).map(s=>s.name).filter(Boolean);
    return [...new Set([...GCPS_SCHOOLS,...configured])];
  }

  function saveSelectedSchool(name){
    S.profile = S.profile || {};
    S.profile.schoolName = name;
    localStorage.setItem(CORE_KEY, JSON.stringify(S));
    renderSelectedSchool();
  }

  function renderSelectedSchool(){
    const name = S?.profile?.schoolName || '';
    const badge = document.getElementById('selectedSchoolBadge');
    if (!badge) return;
    badge.innerHTML = name ? `<div class="selectedSchool"><span>Selected school</span><b>${name}</b><button type="button" class="btn" id="viewSchoolPathways">View pathways</button></div>` : '';
    document.getElementById('viewSchoolPathways')?.addEventListener('click',()=>openSchool(name));
  }

  function renderResults(query){
    const out = document.getElementById('schoolLookupResults');
    const q = norm(query);
    if (!q){ out.innerHTML=''; return; }
    const words = q.split(' ');
    const matches = allSchools().filter(name => words.every(w=>norm(name).includes(w))).slice(0,8);
    out.innerHTML = matches.length ? matches.map(name => {
      const verified = !!VERIFIED[name] || Object.values(window.schools || {}).some(s=>s.name===name && (s.programs||[]).length);
      return `<button type="button" class="schoolResult" data-school-name="${name.replace(/"/g,'&quot;')}"><span><b>${name}</b><small>${verified?'Pathways available':'School found · pathways need verification'}</small></span><span class="pill">${verified?'VIEW':'SELECT'}</span></button>`;
    }).join('') : `<div class="card notice"><b>No local match yet</b><p>You can still use “${query}”. Student Launch will save the school and show official lookup sources instead of inventing pathways.</p><button type="button" class="btn" id="useTypedSchool">Use this school</button></div>`;

    out.querySelectorAll('[data-school-name]').forEach(btn=>btn.addEventListener('click',()=>{
      const name=btn.dataset.schoolName; saveSelectedSchool(name); out.innerHTML=''; document.getElementById('schoolLookup').value=name; openSchool(name);
    }));
    document.getElementById('useTypedSchool')?.addEventListener('click',()=>{
      const name=query.trim(); saveSelectedSchool(name); out.innerHTML=''; openSchool(name);
    });
  }

  function configuredSchool(name){
    return Object.values(window.schools || {}).find(s=>s.name===name || s.short===name);
  }

  function openSchool(name){
    if(!name) return;
    const modal=document.getElementById('pathwayModal');
    const title=document.getElementById('pathwayModalTitle');
    const body=document.getElementById('pathwayModalBody');
    title.textContent=name;
    const verified=VERIFIED[name];
    const configured=configuredSchool(name);
    const configPrograms=(configured?.programs||[]).map(p=>p[1]).filter(Boolean);
    const pathways=verified?.pathways?.length ? verified.pathways : configPrograms;
    const district=verified?.district || configured?.district || '';
    const state=verified?.state || configured?.state || S?.profile?.state || '';
    if(pathways.length){
      body.innerHTML=`${district?`<p class="muted">${district}${state?' · '+state:''}</p>`:''}
        <div class="pathwayGrid">${pathways.map(p=>`<button type="button" class="pathwayChoice" data-pathway="${p.replace(/"/g,'&quot;')}"><span>✓</span><b>${p}</b></button>`).join('')}</div>
        ${verified?.note?`<div class="card notice"><b>Verification note</b><p>${verified.note}</p></div>`:''}
        ${verified?.sources?.length?`<div class="officialLinks"><b>Official sources</b>${verified.sources.map(s=>`<a href="${s[1]}" target="_blank" rel="noopener">${s[0]} ↗</a>`).join('')}</div>`:''}`;
      body.querySelectorAll('[data-pathway]').forEach(btn=>btn.addEventListener('click',()=>{
        S.profile = S.profile || {}; S.profile.schoolPathway=btn.dataset.pathway; localStorage.setItem(CORE_KEY,JSON.stringify(S));
        body.querySelectorAll('.pathwayChoice').forEach(b=>b.classList.toggle('on',b.dataset.pathway===btn.dataset.pathway));
      }));
      if(S?.profile?.schoolPathway) body.querySelector(`[data-pathway="${CSS.escape(S.profile.schoolPathway)}"]`)?.classList.add('on');
    } else {
      const ga = /georgia|\bga\b/i.test(state);
      body.innerHTML=`<div class="card notice"><b>School found, pathways not verified yet</b><p>Student Launch will not guess this school's programs. Use the official sources below while this school is added to the verified pathway index.</p></div>
        <div class="officialLinks"><b>Official pathway lookup</b>
          ${ga?'<a href="https://app.gadoe.org/gcp/search" target="_blank" rel="noopener">Georgia Career Pipeline ↗</a>':''}
          <a href="https://www.gcpsk12.org/programs-and-services/college-and-career-development" target="_blank" rel="noopener">GCPS High School Pathway Offerings ↗</a>
        </div>`;
    }
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
  }

  function close(){const modal=document.getElementById('pathwayModal'); modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');}
  document.getElementById('pathwayClose').addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  document.getElementById('schoolLookup').addEventListener('input',e=>renderResults(e.target.value));
  document.getElementById('schoolLookup').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();renderResults(e.target.value)}});
  document.getElementById('schoolLookupBtn').addEventListener('click',()=>renderResults(document.getElementById('schoolLookup').value));
  renderSelectedSchool();
})();