// Calendar-aware launch timeline for Student Launch.
// Uses the student's current grade and today's date to turn the annual plan into "Now / Next / Later" actions.
(function(){
  const has=id=>(S?.routes||[]).includes(id);
  const grade=()=>String(S?.profile?.gradeLevel||'').trim();
  const school=()=>S?.profile?.schoolName||'';
  const pathway=()=>S?.profile?.schoolPathway||'';
  const afqt=()=>Number(S?.acad?.asvabAfqt||0)||0;
  const hasCollege=()=>['direct','honors','stem','premed','hbcu','transfer','associate','online'].some(has);
  const hasCareer=()=>['technical','cert','apprentice','work'].some(has);
  const hasOfficer=()=>has('rotc')||has('academy');
  const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];

  function season(month){
    if(month>=7&&month<=9) return 'fall';
    if(month>=10||month<=1) return 'winter';
    if(month>=2&&month<=4) return 'spring';
    return 'summer';
  }

  function genericForGrade(g,period){
    const map={
      '9th':{
        now:['Check your current classes against graduation requirements and fix schedule issues early.','Choose one activity, club, sport, service role, job or project to build consistently this year.'],
        next:['Review first progress/report-card results and get help quickly in any weak class.','Explore at least two career clusters and save the ones that still interest you.'],
        later:['Plan next-year courses around graduation requirements plus your strongest pathway interests.','Update your achievements list before the school year ends.']
      },
      '10th':{
        now:['Review sophomore-year course rigor and graduation-credit progress.','Identify dual-enrollment, CTAE, certification or work-based-learning options you may be able to use next year.'],
        next:['Use PSAT/pre-ACT or classroom performance to find academic gaps worth improving before junior year.','Build one concrete project, certification, portfolio item or work experience tied to a career interest.'],
        later:['Choose junior-year courses that support your top career/college directions.','Start a rough list of post-high-school routes and what each one costs or requires.']
      },
      '11th':{
        now:['Narrow to two or three realistic post-high-school routes and identify what each requires this year.','Build an initial college, training, apprenticeship, military or employment target list.'],
        next:['If testing could help your route, make an SAT/ACT/ASVAB preparation and testing plan using official dates.','Start a scholarship/aid/benefit tracker before senior-year deadlines stack up.'],
        later:['End junior year with a senior-year application list, resume/activity record and document checklist.','Use summer to visit, compare, prepare applications, improve skills or gain relevant work experience.']
      },
      '12th':{
        now:['Create one deadline tracker for every application, financial-aid form, scholarship, training program, military step and job route you are considering.','Confirm your graduation-credit status and correct any transcript or schedule issues immediately.'],
        next:['Complete the highest-priority applications first and request transcripts/recommendations early.','Compare routes using net cost, debt, completion time, career outcomes and fit—not just the name of the school or program.'],
        later:['Choose a primary plan and a realistic backup plan before graduation.','Complete enrollment, onboarding, housing, orientation, military processing, licensing, apprenticeship or employment steps required for your chosen route.']
      }
    };
    return map[g]?.[period]||[];
  }

  function routeNow(g){
    const tasks=[];
    if(hasCollege()){
      if(g==='11th') tasks.push('College lane: identify target schools and check their current testing, course, application and scholarship requirements on official sites.');
      if(g==='12th') tasks.push('College lane: record each school’s official application and priority-aid deadlines; submit earlier applications first when appropriate.');
    }
    if(hasCareer()){
      if(g==='11th'||g==='12th') tasks.push('Career-training lane: compare program start dates, credential value, licensing, placement outcomes, transferability and total cost.');
    }
    if(has('military')){
      if(g==='11th') tasks.push(`Military lane: ${afqt()?`use your saved AFQT ${afqt()} only as a planning signal and verify current branch/job standards`:'decide when ASVAB preparation/testing makes sense'} using official military sources.`);
      if(g==='12th') tasks.push('Military lane: verify current ASVAB/line-score, medical, fitness, legal, citizenship and job-availability requirements before making a commitment.');
    }
    if(hasOfficer()) tasks.push(g==='12th'?'Officer lane: separately track ROTC/service-academy nomination, scholarship, medical, fitness and application requirements because their timelines can differ from ordinary college applications.':'Officer lane: begin leadership, fitness and official ROTC/service-academy timeline research well before senior year.');
    if(has('entrepreneur')) tasks.push('Entrepreneurship lane: test a small real offer now and track customer response, revenue, costs and what you learned.');
    return tasks;
  }

  function schoolNow(){
    if(school()&&pathway()) return [`School lane: ask how to enter or continue ${pathway()} at ${school()} and which course, credential or work-based-learning step comes next.`];
    if(school()) return [`School lane: review pathways, dual enrollment, certifications and work-based-learning options available through ${school()}.`];
    return ['School lane: add your high school so Student Launch can connect your timeline to verified local opportunities.'];
  }

  function buckets(){
    const now=new Date(); const m=now.getMonth(); const g=grade(); const s=season(m);
    const labels={fall:['NOW — FALL','NEXT 60–90 DAYS','WINTER → SPRING'],winter:['NOW — WINTER','NEXT 60–90 DAYS','SPRING → SUMMER'],spring:['NOW — SPRING','NEXT 60–90 DAYS','SUMMER → FALL'],summer:['NOW — SUMMER','NEXT 60–90 DAYS','FALL START']};
    const base=labels[s];
    const nowTasks=[...genericForGrade(g,'now'),...schoolNow(),...routeNow(g)];
    const nextTasks=genericForGrade(g,'next');
    const laterTasks=genericForGrade(g,'later');
    return {date:`${monthNames[m]} ${now.getFullYear()}`,items:[{label:base[0],tasks:nowTasks},{label:base[1],tasks:nextTasks},{label:base[2],tasks:laterTasks}]};
  }

  function ensure(){
    const home=document.getElementById('home'); if(!home||document.getElementById('calendarLaunchPlan'))return;
    const panel=document.createElement('div'); panel.id='calendarLaunchPlan'; panel.className='panel'; panel.style.marginTop='12px';
    panel.innerHTML='<div class="eyebrow">Calendar-Aware Plan</div><h2>What should I do when?</h2><p class="muted" id="calendarContext"></p><div id="calendarBuckets" class="grid"></div><div class="card notice" style="margin-top:10px"><b>Use official dates</b><p>Student Launch organizes timing, but it does not invent deadlines. Always verify exact dates and eligibility with the school, testing agency, college, scholarship, employer, apprenticeship program or military branch.</p></div>';
    const gradePlan=document.getElementById('gradeActionPlan');
    if(gradePlan) gradePlan.insertAdjacentElement('afterend',panel); else home.appendChild(panel);
  }

  function renderTimeline(){
    ensure(); const box=document.getElementById('calendarBuckets'); if(!box)return;
    const g=grade(); const data=buckets();
    document.getElementById('calendarContext').textContent=g?`Built for a ${g}-grade student using the current point in the school year (${data.date}).`:`Add your grade level to generate a calendar-aware timeline. Current month: ${data.date}.`;
    if(!g){box.innerHTML='<div class="card"><b>Grade level needed</b><p>Choose your current grade under Profile first.</p></div>';return;}
    const done=S.calendarChecks||{};
    box.innerHTML=data.items.map((bucket,bi)=>`<div class="card"><div class="eyebrow">${bucket.label}</div><div class="list">${bucket.tasks.map((task,ti)=>{const key=`${g}-${data.date}-${bi}-${ti}`;return `<label class="check"><input type="checkbox" data-calendar-key="${key}" ${done[key]?'checked':''}><span>${task}</span></label>`}).join('')}</div></div>`).join('');
    box.querySelectorAll('[data-calendar-key]').forEach(el=>el.addEventListener('change',()=>{S.calendarChecks=S.calendarChecks||{};S.calendarChecks[el.dataset.calendarKey]=el.checked;localStorage.setItem(CORE_KEY,JSON.stringify(S));}));
  }

  const prior=window.render;
  if(typeof prior==='function') window.render=function(){prior();renderTimeline();};
  ['runScan','saveProfile','saveAcad'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>setTimeout(renderTimeline,0)));
  document.addEventListener('click',e=>{if(e.target.closest('[data-pathway]')||e.target.closest('[onclick*="toggleRoute"]'))setTimeout(renderTimeline,0)});
  renderTimeline();
})();