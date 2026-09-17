const form=document.getElementById('audit-form'),statusEl=document.getElementById('form-status'),done=document.getElementById('form-done');
const FREE=/@(gmail|googlemail|yahoo|hotmail|outlook|live|icloud|aol|proton|protonmail|gmx|mail|yandex)\./i;
const MSG={work_email:'Please use your work email. We run one audit per company.',email:'That email address does not look right.',product_url:'Add a link to your game or app, like a store page.',rate_limit:'Too many requests from this connection. Try again in an hour.'};
function mark(id,bad){const el=document.getElementById(id);if(bad)el.setAttribute('aria-invalid','true');else el.removeAttribute('aria-invalid');return bad}
form.addEventListener('submit',async e=>{
  e.preventDefault();statusEl.textContent='';
  const f=new FormData(form),url=(f.get('product_url')||'').trim(),email=(f.get('email')||'').trim();
  const badUrl=mark('f-url',!/\.[a-z]{2,}/i.test(url)),badEmail=mark('f-email',!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email));
  if(badUrl){statusEl.textContent=MSG.product_url;document.getElementById('f-url').focus();return}
  if(badEmail){statusEl.textContent=MSG.email;document.getElementById('f-email').focus();return}
  if(FREE.test(email)){mark('f-email',true);statusEl.textContent=MSG.work_email;document.getElementById('f-email').focus();return}
  const btn=form.querySelector('button');btn.disabled=true;btn.textContent='SENDING…';
  try{
    const r=await fetch(form.action,{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({product_url:url,product_name:f.get('product_name'),competitors:f.get('competitors'),email,website:f.get('website')}),signal:AbortSignal.timeout(20000)});
    const j=await r.json().catch(()=>({}));
    if(!r.ok||!j.received){if(j.code==='work_email'||j.code==='email')mark('f-email',true);if(j.code==='product_url')mark('f-url',true);throw new Error(MSG[j.code]||'')}
    if(j.already){document.getElementById('done-title').textContent='We already have your company.';document.getElementById('done-text').textContent='Someone at your company asked for an audit. We run one per company, and it goes to the first address that asked.'}
    else if(j.waitlist){document.getElementById('done-title').textContent='You are on next week’s list.';document.getElementById('done-text').textContent='This week’s 20 audits are taken. Yours runs next week and arrives by email from Davorin.'}
    form.hidden=true;done.hidden=false;done.focus();
  }catch(err){statusEl.textContent=err.message||'We could not save your request. Please try again.'}
  finally{btn.disabled=false;btn.textContent='RUN MY CREATOR RADAR →'}
});
