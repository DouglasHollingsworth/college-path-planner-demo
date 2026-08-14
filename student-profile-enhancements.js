// Universal high-school student profile enhancements for Student Launch.
// Keeps school-specific configuration optional while broadening planning beyond college-only routes.

(function () {
  const extraRoutes = [
    ['military','Military Enlistment','Compare service branches, ASVAB/AFQT readiness, benefits and career-field options.'],
    ['work','Direct-to-Work','Launch directly into employment with a skills, credential and income plan.'],
    ['entrepreneur','Entrepreneurship / Self-Employment','Build a business or independent-income route with milestones, skills and financial planning.'],
    ['cert','Industry Certification First','Earn a job-relevant certification before or instead of a degree.']
  ];
  extraRoutes.forEach(route => {
    if (!ROUTES.some(existing => existing[0] === route[0])) ROUTES.push(route);
  });

  const academicPanel = document.querySelector('#academics .panel');
  if (academicPanel && !document.getElementById('asvabAfqt')) {
    const scoreBlock = document.createElement('div');
    scoreBlock.className = 'card';
    scoreBlock.innerHTML = `
      <div class="eyebrow">Testing Profile</div>
      <h3>College + military readiness scores</h3>
      <p class="muted">Enter only scores you have. Student Launch uses them as planning signals; official eligibility must be verified with the testing agency, school, scholarship program, or military branch.</p>
      <div class="grid">
        <div class="field"><label>SAT Math</label><input id="satMath" inputmode="numeric"></div>
        <div class="field"><label>SAT Reading & Writing</label><input id="satRW" inputmode="numeric"></div>
        <div class="field"><label>ACT Composite</label><input id="actComposite" inputmode="numeric"></div>
        <div class="field"><label>ACT English</label><input id="actEnglish" inputmode="numeric"></div>
        <div class="field"><label>ACT Math</label><input id="actMath" inputmode="numeric"></div>
        <div class="field"><label>ACT Reading</label><input id="actReading" inputmode="numeric"></div>
        <div class="field"><label>ACT Science</label><input id="actScience" inputmode="numeric"></div>
        <div class="field"><label>ASVAB AFQT Percentile</label><input id="asvabAfqt" inputmode="numeric" placeholder="0-99"></div>
        <div class="field"><label>ASVAB / Military Notes</label><textarea id="asvabNotes" placeholder="Optional line scores, branch interests, recruiter-verified qualification notes..."></textarea></div>
      </div>`;
    academicPanel.appendChild(scoreBlock);
  }

  const profilePanel = document.querySelector('#profile .panel');
  if (profilePanel && !document.getElementById('gradeLevel')) {
    const launchBlock = document.createElement('div');
    launchBlock.className = 'card';
    launchBlock.innerHTML = `
      <div class="eyebrow">Launch Preferences</div>
      <h3>What happens after high school?</h3>
      <div class="grid">
        <div class="field"><label>Current grade level</label><select id="gradeLevel"><option value="">Select</option><option>9th</option><option>10th</option><option>11th</option><option>12th</option></select></div>
        <div class="field"><label>Preferred learning style</label><select id="learningStyle"><option value="">Select</option><option>Classroom / campus</option><option>Hands-on / applied</option><option>Online / hybrid</option><option>Work-based / apprenticeship</option><option>No preference yet</option></select></div>
        <div class="field"><label>Career ideas</label><textarea id="careerIdeas" placeholder="Careers, industries, jobs, businesses, military fields..."></textarea></div>
        <div class="field"><label>Strengths</label><textarea id="strengths" placeholder="Subjects, skills, leadership, technical ability, creativity..."></textarea></div>
      </div>`;
    profilePanel.insertBefore(launchBlock, document.getElementById('saveProfile'));
  }

  function ensureState() {
    S.profile = S.profile || {};
    S.acad = S.acad || {};
  }

  function hydrateExtras() {
    ensureState();
    const ids = ['gradeLevel','learningStyle','careerIdeas','strengths'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = S.profile[id] || ''; });
    const scoreIds = ['satMath','satRW','actComposite','actEnglish','actMath','actReading','actScience','asvabAfqt','asvabNotes'];
    scoreIds.forEach(id => { const el = document.getElementById(id); if (el) el.value = S.acad[id] || ''; });
  }

  function persistProfileExtras() {
    ensureState();
    ['gradeLevel','learningStyle','careerIdeas','strengths'].forEach(id => {
      const el = document.getElementById(id); if (el) S.profile[id] = el.value;
    });
    save();
    hydrateExtras();
  }

  function persistScoreExtras() {
    ensureState();
    ['satMath','satRW','actComposite','actEnglish','actMath','actReading','actScience','asvabAfqt','asvabNotes'].forEach(id => {
      const el = document.getElementById(id); if (el) S.acad[id] = el.value;
    });
    save();
    hydrateExtras();
  }

  document.getElementById('saveProfile')?.addEventListener('click', persistProfileExtras);
  document.getElementById('saveAcad')?.addEventListener('click', persistScoreExtras);

  const originalRender = render;
  window.render = function () {
    originalRender();
    hydrateExtras();
    const test = document.getElementById('snapTest');
    if (test && !S.acad.sat && !S.acad.act && S.acad.asvabAfqt) test.textContent = `ASVAB AFQT ${S.acad.asvabAfqt}`;
  };

  render();
  hydrateExtras();
})();