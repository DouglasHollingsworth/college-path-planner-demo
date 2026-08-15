// Student Launch Experience V2 — student-first navigation and progressive disclosure.
(function(){
  const stepMap={
    me:['profile','academics'],
    school:['school'],
    options:['scan','routes','colleges'],
    plan:['home','funding'],
    launch:['resources']
  };
  const labels={me:'Me',school:'My School',options:'My Options',plan:'My Plan',launch:'My Launch'};
  const stepTarget={me:'profile',school:'profile',options:'scan',plan:'home',launch:'resources'};

  function byId(id){return document.getElementById(id)}
  function activeView(){return document.querySelector('.view.on')?.id||'home'}
  function activeStep(){const view=activeView();return Object.entries(stepMap).find(([,views])=>views.includes(view))?.[0]||'plan'}
  function show(view){
    if(typeof go==='function') go(view);
    else document.querySelectorAll('.view').forEach(v=>v.classList.toggle('on',v.id===view));
    sync();
  }
  function nextStep(){
    const p=S?.profile||{};
    if(!p.name||p.name==='New Student'||!p.gradeLevel) return 'me';
    if(!p.schoolName) return 'school';
    if(!(S?.paths||[]).length && !(S?.routes||[]).length) return 'options';
    return 'plan';
  }
  function progress(){
    const p=S?.profile||{}, a=S?.acad||{};
    const checks=[
      !!(p.name&&p.name!=='New Student'&&p.gradeLevel),
      !!p.schoolName,
      !!((S?.paths||[]).length||(S?.routes||[]).length),
      !!(Object.keys(S?.planChecks||{}).some(k=>S.planChecks[k])),
      !!((S?.routes||[]).length&&((S?.paths||[]).length||p.schoolPathway))
    ];
    return {done:checks.filter(Boolean).length,total:checks.length,pct:Math.round(checks.filter(Boolean).length/checks.length*100),checks};
  }
  function sync(){
    const step=activeStep();
    document.querySelectorAll('[data-step]').forEach(btn=>{
      const on=btn.dataset.step===step;
      btn.classList.toggle('on',on);
      btn.setAttribute('aria-current',on?'step':'false');
    });
    const p=S?.profile||{};
    const n=nextStep();
    const heroTitle=byId('journeyHeroTitle');
    const heroSub=byId('journeyHeroSub');
    if(heroTitle) heroTitle.textContent=p.name&&p.name!=='New Student'?`${p.name}, here’s your next move.`:'Build a future that fits you.';
    if(heroSub){
      const copy={me:'Start with who you are, what you are good at, and the scores you already have.',school:'Connect your high school to reveal local pathways and opportunities.',options:'Compare college, trade, military, work, certifications, and other routes side by side.',plan:'Your options are taking shape. Turn them into a timeline, funding plan, and next actions.'};
      heroSub.textContent=copy[n]||'Your launch plan is ready to keep moving.';
    }
    const pInfo=progress();
    byId('progressPercent')&&(byId('progressPercent').textContent=`${pInfo.pct}%`);
    byId('progressRing')?.style.setProperty('--progress',`${pInfo.pct*3.6}deg`);
    byId('progressLabel')&&(byId('progressLabel').textContent=`${pInfo.done} of ${pInfo.total} launch stages started`);
    const nextLabel=byId('nextStepLabel');
    if(nextLabel) nextLabel.textContent=`Next: ${labels[n]}`;
    const school=byId('homeSchoolSignal');
    if(school) school.textContent=p.schoolName||'Add your school';
    const direction=byId('homeDirectionSignal');
    if(direction) direction.textContent=S?.paths?.[0]?.name||p.schoolPathway||'Still exploring';
    const grade=byId('homeGradeSignal');
    if(grade) grade.textContent=p.gradeLevel||'Set grade';
  }

  document.addEventListener('click',e=>{
    const stepBtn=e.target.closest('[data-step]');
    if(stepBtn){
      const step=stepBtn.dataset.step;
      show(stepTarget[step]);
      if(step==='school') setTimeout(()=>byId('schoolLookup')?.scrollIntoView({behavior:'smooth',block:'center'}),120);
      return;
    }
    const action=e.target.closest('[data-experience-action]');
    if(!action)return;
    const a=action.dataset.experienceAction;
    if(a==='continue'){
      const n=nextStep();show(stepTarget[n]);
      if(n==='school')setTimeout(()=>byId('schoolLookup')?.scrollIntoView({behavior:'smooth',block:'center'}),120);
    } else if(a==='explore') show('scan');
    else if(a==='progress'){show('home');setTimeout(()=>byId('gradeActionPlan')?.scrollIntoView({behavior:'smooth',block:'start'}),120);}
    else if(a==='academics') show('academics');
    else if(a==='funding') show('funding');
  });

  const prior=window.render;
  if(typeof prior==='function') window.render=function(){prior();sync();};
  ['saveProfile','saveAcad','runScan'].forEach(id=>byId(id)?.addEventListener('click',()=>setTimeout(sync,0)));
  sync();
})();