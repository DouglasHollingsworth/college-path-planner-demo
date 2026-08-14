// Connect a student's selected school pathway directly into Path Scan.
(function () {
  const MAP = [
    {keys:['health','allied','patient','pharmacy','sports medicine','exercise physiology','medical','nursing'], paths:['Healthcare / Pre-Med','Biomedical Engineering']},
    {keys:['computer science','artificial intelligence','cyber','software','coding','data'], paths:['Computer Science / AI','Computer / Electrical Engineering']},
    {keys:['engineering','mechatronics','robotics','electronics'], paths:['Computer / Electrical Engineering','Aerospace / Space Systems','Biomedical Engineering']},
    {keys:['business','marketing','entrepreneur','finance'], paths:['Business / Entrepreneurship']},
    {keys:['aviation','aerospace','jrotc','military'], paths:['Aerospace / Space Systems']}
  ];

  function norm(v){return String(v||'').toLowerCase()}
  function relatedPaths(pathway){
    const text=norm(pathway);
    const match=MAP.find(row=>row.keys.some(k=>text.includes(k)));
    return match ? match.paths : [];
  }

  // Preserve school lookup fields when the base profile save rewrites S.profile.
  const saveBtn=document.getElementById('saveProfile');
  if(saveBtn){
    saveBtn.addEventListener('click',()=>{
      const keep={
        schoolName:S?.profile?.schoolName||'', schoolDistrict:S?.profile?.schoolDistrict||'',
        schoolCity:S?.profile?.schoolCity||'', schoolState:S?.profile?.schoolState||'',
        schoolNcesId:S?.profile?.schoolNcesId||'', schoolPathway:S?.profile?.schoolPathway||''
      };
      setTimeout(()=>{
        S.profile=S.profile||{};
        Object.entries(keep).forEach(([k,v])=>{if(v)S.profile[k]=v});
        localStorage.setItem(CORE_KEY,JSON.stringify(S));
        if(typeof render==='function') render();
      },0);
    },true);
  }

  function decorate(){
    const out=document.getElementById('scanResults');
    if(!out) return;
    out.querySelectorAll('.schoolScanMatch').forEach(x=>x.remove());

    const school=S?.profile?.schoolName||'';
    const pathway=S?.profile?.schoolPathway||'';
    if(!school || !pathway) return;

    const related=relatedPaths(pathway);
    const ranked=(S.paths||[]).map(x=>x.name);
    const overlap=related.filter(name=>ranked.includes(name));
    const strong=overlap.length>0;

    const card=document.createElement('div');
    card.className='card notice schoolScanMatch';
    card.innerHTML=`<div class="eyebrow">School Opportunity Match</div><b>${strong?'Strong match + offered at your high school':'Selected pathway at your high school'}</b><p><strong>${pathway}</strong> at ${school}.${strong?` Your Path Scan also ranks ${overlap.join(' and ')} as a fit.`:' Keep it in the plan while you compare interests, academics, cost and post-high-school routes.'}</p>`;
    out.prepend(card);

    if(strong){
      [...out.querySelectorAll('.card')].forEach(result=>{
        if(result.classList.contains('schoolScanMatch')) return;
        const text=result.textContent||'';
        const matched=overlap.find(name=>text.includes(name));
        if(matched && !result.querySelector('.schoolOfferBadge')){
          const badge=document.createElement('span');
          badge.className='pill schoolOfferBadge';
          badge.textContent='OFFERED AT YOUR SCHOOL';
          result.appendChild(badge);
        }
      });
    }
  }

  function applySchoolBoost(){
    const pathway=S?.profile?.schoolPathway||'';
    if(!pathway || !(S.paths||[]).length) return;
    const related=relatedPaths(pathway);
    if(!related.length) return;

    S.paths=S.paths.map(p=>({...p,score:Number(p.score||0)+(related.includes(p.name)?3:0)}))
      .sort((a,b)=>b.score-a.score)
      .slice(0,4);
    localStorage.setItem(CORE_KEY,JSON.stringify(S));
  }

  const run=document.getElementById('runScan');
  run?.addEventListener('click',()=>{
    // Base Path Scan handler runs first and rebuilds S.paths; then add the local-school signal.
    setTimeout(()=>{
      applySchoolBoost();
      if(typeof render==='function') render();
      decorate();
    },0);
  });

  const priorRender=window.render;
  if(typeof priorRender==='function'){
    window.render=function(){
      priorRender();
      decorate();
    };
  }

  // A pathway can be selected after a scan has already been run.
  const modalBody=document.getElementById('pathwayModalBody');
  if(modalBody){
    modalBody.addEventListener('click',e=>{
      if(e.target.closest('[data-pathway]')) setTimeout(decorate,0);
    });
  }

  decorate();
})();