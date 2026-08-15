// Student-first guided layout for Student Launch.
(function(){
  const map={
    me:['profile','academics'],
    school:['school'],
    options:['scan','routes','colleges'],
    plan:['funding','home'],
    launch:['resources']
  };

  const hero=document.querySelector('.hero');
  const oldNav=document.getElementById('nav');
  if(!hero||!oldNav||document.getElementById('journeyNav')) return;

  // Student-facing hero: one clear question, three clear actions.
  hero.innerHTML=`
    <div class="eyebrow">Your next move</div>
    <h1 id="journeyHeroTitle">What should I do next?</h1>
    <p id="journeyHeroSub">Build your profile once, then Student Launch connects your school, strengths, options, money and next actions into one plan.</p>
    <div class="journeyPrimaryActions">
      <button type="button" class="journeyAction primaryJourney" data-journey-go="plan"><span class="journeyIcon">→</span><span><b>Continue My Plan</b><small>Go to the next useful step</small></span></button>
      <button type="button" class="journeyAction" data-journey-go="options"><span class="journeyIcon">⌁</span><span><b>Explore My Options</b><small>College, trade, military, work + more</small></span></button>
      <button type="button" class="journeyAction" data-journey-go="progress"><span class="journeyIcon">✓</span><span><b>See My Progress</b><small>What is done and what comes next</small></span></button>
    </div>`;

  const journey=document.createElement('nav');
  journey.id='journeyNav';
  journey.className='journeyNav';
  journey.setAttribute('aria-label','Student Launch journey');
  journey.innerHTML=`
    <button type="button" data-step="me"><span>1</span><b>Me</b><small>Profile + scores</small></button>
    <button type="button" data-step="school"><span>2</span><b>My School</b><small>Programs nearby</small></button>
    <button type="button" data-step="options"><span>3</span><b>My Options</b><small>Compare routes</small></button>
    <button type="button" data-step="plan"><span>4</span><b>My Plan</b><small>Money + timeline</small></button>
    <button type="button" data-step="launch"><span>5</span><b>My Launch</b><small>Finish + act</small></button>`;
  oldNav.parentNode.insertBefore(journey,oldNav.nextSibling);
  oldNav.classList.add('legacyNavHidden');

  // School Setup is intentionally removed from the student flow. Keep it available to admins by ?admin=1.
  const adminMode=new URLSearchParams(location.search).get('admin')==='1';
  const setup=document.getElementById('setup');
  if(setup) setup.classList.toggle('studentHidden',!adminMode);

  function currentStep(){
    const active=document.querySelector('.view.on')?.id||'home';
    return Object.entries(map).find(([,views])=>views.includes(active))?.[0] || 'plan';
  }
  function show(view){
    if(typeof go==='function') go(view);
    else {
      document.querySelectorAll('.view').forEach(x=>x.classList.toggle('on',x.id===view));
    }
    sync();
  }
  function firstIncompleteStep(){
    const p=S?.profile||{}, a=S?.acad||{};
    if(!p.name || p.name==='New Student' || !p.gradeLevel) return 'me';
    if(!p.schoolName) return 'school';
    if(!(S?.paths||[]).length && !(S?.routes||[]).length) return 'options';
    return 'plan';
  }
  function stepTarget(step){
    if(step==='me') return 'profile';
    if(step==='school') return 'profile'; // school search lives in Profile today
    if(step==='options') return 'scan';
    if(step==='plan') return 'home';
    return 'resources';
  }
  function sync(){
    const active=currentStep();
    journey.querySelectorAll('[data-step]').forEach(btn=>{
      const on=btn.dataset.step===active;
      btn.classList.toggle('on',on);
      btn.setAttribute('aria-current',on?'step':'false');
    });
    const p=S?.profile||{};
    const title=document.getElementById('journeyHeroTitle');
    const sub=document.getElementById('journeyHeroSub');
    if(title) title.textContent=p.name && p.name!=='New Student' ? `What should ${p.name} do next?` : 'What should I do next?';
    if(sub){
      const next=firstIncompleteStep();
      const labels={me:'Start with your profile and academic signals.',school:'Add your high school so local opportunities can be matched.',options:'Run Path Scan and compare the routes that fit you.',plan:'Your plan is ready to organize into next actions.'};
      sub.textContent=labels[next]||'Your plan is ready.';
    }
  }

  journey.addEventListener('click',e=>{
    const btn=e.target.closest('[data-step]'); if(!btn) return;
    show(stepTarget(btn.dataset.step));
    if(btn.dataset.step==='school') setTimeout(()=>document.getElementById('schoolLookup')?.scrollIntoView({behavior:'smooth',block:'center'}),120);
  });

  hero.addEventListener('click',e=>{
    const btn=e.target.closest('[data-journey-go]'); if(!btn) return;
    const action=btn.dataset.journeyGo;
    if(action==='progress'){show('home'); setTimeout(()=>document.getElementById('gradeActionPlan')?.scrollIntoView({behavior:'smooth',block:'start'}),120);return;}
    if(action==='options'){show('scan');return;}
    const step=firstIncompleteStep(); show(stepTarget(step));
    if(step==='school') setTimeout(()=>document.getElementById('schoolLookup')?.scrollIntoView({behavior:'smooth',block:'center'}),120);
  });

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view],[data-go]')) setTimeout(sync,0);
  });
  const prior=window.render;
  if(typeof prior==='function') window.render=function(){prior();sync();};
  sync();
})();