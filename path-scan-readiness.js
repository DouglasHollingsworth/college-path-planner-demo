// Connect GPA, SAT/ACT, ASVAB, and selected post-high-school routes into Path Scan.
// These are planning signals only — never admissions, scholarship, or military eligibility determinations.
(function(){
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const num=v=>{const n=Number(String(v||'').replace(/[^0-9.]/g,''));return Number.isFinite(n)?n:0};

  function academics(){
    const a=S.acad||{};
    const wgpa=num(a.wgpa), ugpa=num(a.ugpa), gpa=wgpa||ugpa;
    const sat=num(a.sat), satMath=num(a.satMath), satRW=num(a.satRW);
    const act=num(a.actComposite||a.act), actMath=num(a.actMath), actScience=num(a.actScience), actEnglish=num(a.actEnglish), actReading=num(a.actReading);
    const afqt=num(a.asvabAfqt);
    return {gpa,wgpa,ugpa,sat,satMath,satRW,act,actMath,actScience,actEnglish,actReading,afqt};
  }

  function routeNames(){
    const ids=S.routes||[];
    return ids.map(id=>ROUTES.find(r=>r[0]===id)?.[1]).filter(Boolean);
  }

  function academicBoosts(){
    const a=academics();
    const boosts={
      'Biomedical Engineering':0,
      'Computer / Electrical Engineering':0,
      'Computer Science / AI':0,
      'Aerospace / Space Systems':0,
      'Healthcare / Pre-Med':0,
      'Business / Entrepreneurship':0
    };

    // Normalize test sections to broad planning signals, not official cutoffs.
    const mathSignal=Math.max(
      a.satMath?clamp((a.satMath-400)/400,0,1):0,
      a.actMath?clamp((a.actMath-18)/18,0,1):0
    );
    const scienceSignal=a.actScience?clamp((a.actScience-18)/18,0,1):0;
    const verbalSignal=Math.max(
      a.satRW?clamp((a.satRW-400)/400,0,1):0,
      Math.max(a.actEnglish,a.actReading)?clamp((Math.max(a.actEnglish,a.actReading)-18)/18,0,1):0
    );
    const gpaSignal=a.gpa?clamp((a.gpa-2.0)/2.0,0,1):0;

    boosts['Computer / Electrical Engineering']+=Math.round(mathSignal*3+gpaSignal);
    boosts['Computer Science / AI']+=Math.round(mathSignal*3+gpaSignal);
    boosts['Aerospace / Space Systems']+=Math.round(mathSignal*3+gpaSignal);
    boosts['Biomedical Engineering']+=Math.round((mathSignal+scienceSignal)*1.5+gpaSignal);
    boosts['Healthcare / Pre-Med']+=Math.round(scienceSignal*2+gpaSignal*2);
    boosts['Business / Entrepreneurship']+=Math.round(verbalSignal*2+gpaSignal);

    return boosts;
  }

  function applyAcademicBoost(){
    if(!(S.paths||[]).length)return;
    const boosts=academicBoosts();
    S.paths=S.paths.map(p=>({...p,score:Number(p.score||0)+(boosts[p.name]||0)}))
      .sort((a,b)=>b.score-a.score).slice(0,4);
    localStorage.setItem(CORE_KEY,JSON.stringify(S));
  }

  function readinessCards(){
    const a=academics();
    const routes=routeNames();
    const cards=[];
    const hasCollegeScores=!!(a.sat||a.act||a.satMath||a.satRW||a.actMath||a.actScience||a.actEnglish||a.actReading);
    const hasGpa=!!a.gpa;

    if(hasGpa||hasCollegeScores){
      const parts=[];
      if(hasGpa)parts.push(`GPA ${a.gpa}`);
      if(a.sat)parts.push(`SAT ${a.sat}`);
      if(a.act)parts.push(`ACT ${a.act}`);
      cards.push({kind:'Academic readiness signal',text:`Student Launch is using ${parts.join(' · ') || 'the entered academic record'} to refine career and education-route recommendations. These are planning signals, not admissions or scholarship decisions.`});
    }

    if(a.afqt){
      const militarySelected=(S.routes||[]).includes('military') || (S.routes||[]).includes('rotc') || (S.routes||[]).includes('academy');
      cards.push({kind:'Military planning signal',text:`ASVAB AFQT ${a.afqt} is saved${militarySelected?' and a military-related route is selected':''}. Branch, job, medical, citizenship, and other qualification rules must still be verified through official military sources or a recruiter.`});
    }

    if(routes.length){
      cards.push({kind:'Post-high-school route fit',text:`Current route${routes.length===1?'':'s'}: ${routes.join(' · ')}. Path Scan now considers these choices alongside interests, academics, and school opportunities.`});
    }
    return cards;
  }

  function decorate(){
    const out=document.getElementById('scanResults');
    if(!out)return;
    out.querySelectorAll('.readinessSignal').forEach(x=>x.remove());
    const cards=readinessCards();
    if(!cards.length)return;
    const wrap=document.createElement('div');
    wrap.className='readinessSignal';
    wrap.innerHTML=`<div class="card notice"><div class="eyebrow">Whole-Student Readiness</div><b>Path Scan is using more than interests</b><div class="list">${cards.map(c=>`<div class="card"><b>${c.kind}</b><p>${c.text}</p></div>`).join('')}</div></div>`;
    const schoolMatch=out.querySelector('.schoolScanMatch');
    if(schoolMatch)schoolMatch.after(wrap); else out.prepend(wrap);
  }

  const run=document.getElementById('runScan');
  run?.addEventListener('click',()=>setTimeout(()=>{
    applyAcademicBoost();
    if(typeof render==='function')render();
    decorate();
  },5));

  const priorRender=window.render;
  if(typeof priorRender==='function'){
    window.render=function(){priorRender();decorate();};
  }

  ['saveAcad','saveProfile'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>setTimeout(decorate,10)));
  document.getElementById('routeList')?.addEventListener('click',()=>setTimeout(decorate,10));
  decorate();
})();