const header=document.querySelector('#siteHeader');const menu=document.querySelector('.menu-toggle');const nav=document.querySelector('#mainNav');const hero=document.querySelector('.hero');const backTop=document.querySelector('.back-top');const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;function setHeaderHeight(){document.documentElement.style.setProperty('--header-height',`${header.offsetHeight}px`);document.body.style.paddingTop=`${header.offsetHeight}px`}function handleScroll(){const y=window.scrollY;header.classList.toggle('scrolled',y>60);backTop.classList.toggle('visible',y>400)}setHeaderHeight();handleScroll();window.addEventListener('resize',()=>{setHeaderHeight();if(window.innerWidth>=768){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')}});window.addEventListener('scroll',handleScroll,{passive:true});menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Menü schließen':'Menü öffnen');menu.querySelector('i').className=open?'bi bi-x-lg':'bi bi-list';document.body.classList.toggle('menu-open',open)});nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Menü öffnen');menu.querySelector('i').className='bi bi-list';document.body.classList.remove('menu-open')}));backTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced?'auto':'smooth'}));requestAnimationFrame(()=>hero.classList.add('is-ready'));const sections=document.querySelectorAll('[data-reveal]');sections.forEach(section=>Array.from(section.children).forEach((child,index)=>child.style.transitionDelay=`${index*80}ms`));if(reduced){sections.forEach(section=>section.classList.add('revealed'))}else{const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target)}})},{threshold:.14,rootMargin:'0px 0px -8%'});sections.forEach(section=>observer.observe(section))}

(function(){
  const NAMESPACE = "Julians Fahrschule";
  const WEBHOOK_URL = "https://barista-confined-headset.ngrok-free.dev/webhook/chat";
  const launcher = document.getElementById('ai-chat-launcher');
  const panel = document.getElementById('ai-chat-panel');
  const closeBtn = document.getElementById('ai-chat-close');
  const messages = document.getElementById('ai-chat-messages');
  const form = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');

  let sessionId = localStorage.getItem('ai_chat_session');
  if(!sessionId){ sessionId='sess_'+Math.random().toString(36).slice(2); localStorage.setItem('ai_chat_session', sessionId); }

  let greeted = false;

  function setOpen(open){
    panel.hidden = !open;
    launcher.classList.toggle('open', open);
    launcher.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    if(open){
      if(!greeted){
        addBotMessage("Hi! I'm your AI assistant. Ask me anything about our products, services, or how we can help.");
        greeted = true;
      }
      setTimeout(()=>input.focus(), 150);
    }
  }

  function toggle(){ setOpen(panel.hidden); }

  launcher.addEventListener('click', toggle);
  launcher.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggle(); } });
  closeBtn.addEventListener('click', ()=>setOpen(false));

  function addMsg(text, who){
    const el = document.createElement('div');
    el.className = 'ai-chat-msg ' + who;
    if(who === 'bot'){
      const icon = document.createElement('span');
      icon.className = 'ai-chat-bot-icon';
      icon.innerHTML = '<i class="bi bi-stars"></i>';
      const textSpan = document.createElement('span');
      textSpan.textContent = text;
      el.appendChild(icon);
      el.appendChild(textSpan);
    } else {
      el.textContent = text;
    }
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  function addBotMessage(text){ addMsg(text, 'bot'); }

  function showTyping(){
    const el = document.createElement('div');
    el.className = 'ai-chat-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;
    addMsg(text, 'user');
    input.value = '';
    const typing = showTyping();
    try{
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ message: text, namespace: NAMESPACE, sessionId })
      });
      const data = await res.json();
      typing.remove();
      addBotMessage(data.reply || "Sorry, I didn't get a response. Please try again.");
    }catch(err){
      typing.remove();
      addBotMessage("I'm having trouble connecting right now. Please try again in a moment.");
    }
  });
})();
