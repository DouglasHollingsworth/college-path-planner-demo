// Personalized 9th-12th grade action plan for Student Launch.
(function(){
  const routeNames={direct:'4-Year University',transfer:'Community College → Transfer',associate:'Associate Degree',dual:'Dual Enrollment',honors:'Honors College',stem:'Engineering / STEM',premed:'Pre-Med / Health',rotc:'ROTC + College',academy:'Service Academy',hbcu:'HBCU',technical:'Technical College',apprentice:'Apprenticeship',gap:'Structured Gap Year',online:'Online / Hybrid Degree',military:'Military Enlistment',work:'Direct-to-Work',entrepreneur:'Entrepreneurship',cert:'Industry Certification'};
  const routeSet=()=>new Set(S?.routes||[]);
  const has=(id)=>routeSet().has(id);
  const grade=()=>String(S?.profile?.gradeLevel||'').trim();
  const topPath=()=>S?.paths?.[0]?.name||S?.profile?.schoolPathway||'';
  const school=()=>S?.profile?.schoolName||'';
  const schoolPath=()=>S?.profile?.schoolPathway||'';
  const gpa=()=>Number(S?.acad?.wgpa||S?.acad?.ugpa||0)||0;
  const sat=()=>Number(S?.acad?.sat||0)||0;
  const act=()=>Number(S?.acad?.actComposite||S?.acad?.act||0)||0;
  const afqt=()=>Number(S?.acad?.asvabAfqt||0)||0;
  const interests=()=>[S?.profile?.interests,S?.profile?.careerIdeas,S?.profile?.strengths,topPath(),schoolPath()].filter(Boolean).join(' ');
  const norm=(s)=>String(s||'').toLowerCase();
  const isStem=()=>/computer|engineering|physics|math|robot|aerospace|ai|cyber|mechatronic/.test(norm(interests()));
  const isHealth=()=>/health|medical|nursing|biology|patient|pharmacy|sports medicine|pre-med/.test(norm(interests()));

  const universal={
    '9th':[
      'Protect GPA from day one and review graduation-credit progress each semester.',
      'Explore at least 2 career clusters before locking into a major or training route.',
      'Join one activity, club, sport, service project, job, or leadership experience you can build on over time.',
      'Start a simple achievements list: courses, projects, awards, work, service, certifications and leadership.'
    ],
    '10th':[
      'Review graduation progress and choose junior-year courses that support your strongest career directions.',
      'Take a PSAT/pre-ACT or other baseline test if available and identify weak academic areas early.',
      'Research dual enrollment, CTAE, certification, work-based-learning or apprenticeship options available through your school.',
      'Build one real project, certification, job experience, portfolio item or leadership result tied to your interests.'
    ],
    '11th':[
      'Narrow to 2-3 post-high-school routes and compare time, cost, income potential and entry requirements.',
      'Complete SAT/ACT testing if college or scholarship routes may benefit from scores; retest only when it can improve an outcome.',
      'Build a working school/program list with reach, target and likely options or equivalent training/employment choices.',
      'Start scholarship, financial-aid and benefit research before senior-year deadlines arrive.'
    ],
    '12th':[
      'Turn the plan into deadlines: applications, FAFSA/aid, scholarships, training enrollment, military processing or job applications.',
      'Compare final offers using net cost, debt, completion time, placement/outcomes and fit rather than sticker price alone.',
      'Request official transcripts, recommendations and required documents early enough to fix errors.',
      'Choose a primary route and a realistic backup route before graduation.'
    ]
  };

  function routeTasks(g){
    const tasks=[];
    if(has('direct')||has('honors')||has('stem')||has('premed')||has('hbcu')){
      if(g==='9th'||g==='10th') tasks.push('College route: build course rigor gradually and learn what admissions requirements your likely colleges expect.');
      if(g==='11th') tasks.push('College route: build a balanced college list, check testing policies, estimate net price and note priority scholarship deadlines.');
      if(g==='12th') tasks.push('College route: submit applications and financial-aid forms by each official deadline; compare aid packages before committing.');
    }
    if(has('transfer')||has('associate')||has('technical')||has('cert')){
      if(g==='10th'||g==='11th') tasks.push('Career/2-year route: compare credentials by completion time, transferability, licensing, job placement and total cost.');
      if(g==='12th') tasks.push('Career/2-year route: verify admissions, program start dates, placement testing, licensing requirements and employer demand before enrolling.');
    }
    if(has('apprentice')||has('work')){
      if(g==='10th'||g==='11th') tasks.push('Work route: build employable proof now—credential, portfolio, references, work-based learning, internship or paid experience.');
      if(g==='12th') tasks.push('Work route: create a resume, references and target-employer list; verify whether roles require a license, certification, age minimum or apprenticeship sponsor.');
    }
    if(has('military')){
      if(g==='10th') tasks.push('Military route: learn the differences among branches and career fields before talking to recruiters about a specific job.');
      if(g==='11th') tasks.push(`Military route: ${afqt()?`review your AFQT ${afqt()} as a planning signal`:'take or prepare for the ASVAB when appropriate'} and compare branch/job requirements using official sources.`);
      if(g==='12th') tasks.push('Military route: verify ASVAB/line-score, medical, legal, citizenship, fitness and job-availability requirements with the branch before signing anything.');
    }
    if(has('rotc')||has('academy')){
      if(g==='10th') tasks.push('Officer route: keep academics strong and begin building leadership, fitness and service experience.');
      if(g==='11th') tasks.push('Officer route: research ROTC scholarships or service-academy nomination, medical and fitness timelines well before senior year.');
      if(g==='12th') tasks.push('Officer route: track nomination, scholarship, medical, fitness and application deadlines separately—many occur earlier than standard college deadlines.');
    }
    if(has('entrepreneur')){
      tasks.push(g==='12th'?'Entrepreneurship route: graduate with a simple offer, target customer, proof of demand, startup budget and first-90-day revenue plan.':'Entrepreneurship route: test one small real-world offer, project or sale so you learn from customers before graduation.');
    }
    return tasks;
  }

  function academicSignals(g){
    const tasks=[];
    if((g==='11th'||g==='12th')&&(has('direct')||has('honors')||has('stem')||has('premed')||has('hbcu'))){
      const tests=[]; if(sat())tests.push(`SAT ${sat()}`); if(act())tests.push(`ACT ${act()}`);
      tasks.push(tests.length?`Testing signal: you have ${tests.join(' / ')}. Compare those scores with current official admissions and scholarship policies for each target school.`:'Testing signal: no SAT/ACT score is saved. Check whether your target colleges or scholarships require or reward testing before deciding whether to test.');
    }
    if(gpa()) tasks.push(`Academic signal: current saved GPA is ${gpa()}. Use it to shape course choices and school/program ranges, but verify how each institution recalculates GPA.`);
    if(isStem()&&(g==='9th'||g==='10th'||g==='11th')) tasks.push('STEM signal: prioritize the strongest realistic math/science progression available at your school and add hands-on technical projects where possible.');
    if(isHealth()&&(g==='9th'||g==='10th'||g==='11th')) tasks.push('Health signal: prioritize biology/chemistry foundations and look for health-science, patient-care, sports-medicine, pharmacy or related school experiences if available.');
    return tasks;
  }

  function schoolTasks(){
    const tasks=[];
    if(school()&&schoolPath()) tasks.push(`Local opportunity: you selected ${schoolPath()} at ${school()}. Ask your counselor how to enter or continue that pathway and what courses/certifications come next.`);
    else if(school()) tasks.push(`Local opportunity: review verified pathways, dual enrollment, CTAE, work-based learning and certifications available through ${school()}.`);
    else tasks.push('Local opportunity: add your high school so Student Launch can surface school-specific pathways and programs when verified.');
    return tasks;
  }

  function buildPlan(){
    const g=grade()||'11th';
    return [...(universal[g]||universal['11th']),...schoolTasks(),...academicSignals(g),...routeTasks(g)];
  }

  function ensureUI(){
    const home=document.getElementById('home'); if(!home||document.getElementById('gradeActionPlan'))return;
    const panel=document.createElement('div');
    panel.id='gradeActionPlan'; panel.className='panel'; panel.style.marginTop='12px';
    panel.innerHTML='<div class="row"><div><div class="eyebrow">Personalized Launch Plan</div><h2 id="planTitle">Your grade-by-grade action plan</h2><p class="muted" id="planContext"></p></div><button type="button" class="btn" data-go="profile">Update Profile</button></div><div id="planTasks" class="list"></div><div class="card notice" style="margin-top:10px"><b>Planning guidance</b><p>Deadlines and eligibility change. Verify applications, testing, military qualifications, aid, licensing and school requirements with official sources.</p></div>';
    home.appendChild(panel);
  }

  function renderPlan(){
    ensureUI(); const box=document.getElementById('planTasks'); if(!box)return;
    const g=grade();
    document.getElementById('planTitle').textContent=g?`${g} Grade Launch Plan`:'Set your grade level to personalize this plan';
    const routes=(S?.routes||[]).map(id=>routeNames[id]||id);
    document.getElementById('planContext').textContent=[school(),schoolPath(),routes.length?`Routes: ${routes.join(' · ')}`:'',topPath()?`Top direction: ${topPath()}`:''].filter(Boolean).join(' · ') || 'Complete your profile and Path Scan to make this more specific.';
    if(!g){box.innerHTML='<div class="card"><b>Add your current grade</b><p>Go to Profile and choose 9th, 10th, 11th or 12th grade. Student Launch will then generate the right stage plan.</p></div>';return;}
    const done=S.planChecks||{};
    box.innerHTML=buildPlan().map((task,i)=>`<label class="card check"><input type="checkbox" data-plan-check="${i}" ${done[`${g}-${i}`]?'checked':''}><span><b>${i+1}. ${task}</b></span></label>`).join('');
    box.querySelectorAll('[data-plan-check]').forEach(el=>el.addEventListener('change',()=>{S.planChecks=S.planChecks||{};S.planChecks[`${g}-${el.dataset.planCheck}`]=el.checked;localStorage.setItem(CORE_KEY,JSON.stringify(S));}));
  }

  const previous=window.render;
  if(typeof previous==='function') window.render=function(){previous();renderPlan();};
  document.getElementById('runScan')?.addEventListener('click',()=>setTimeout(renderPlan,0));
  document.getElementById('saveProfile')?.addEventListener('click',()=>setTimeout(renderPlan,0));
  document.getElementById('saveAcad')?.addEventListener('click',()=>setTimeout(renderPlan,0));
  document.addEventListener('click',e=>{if(e.target.closest('[data-pathway]')||e.target.closest('[onclick*="toggleRoute"]'))setTimeout(renderPlan,0)});
  renderPlan();
})();