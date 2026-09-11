const DATA_URL="data.json";
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);

async function loadData(){
  try{
    const res=await fetch(DATA_URL);
    const data=await res.json();
    render(data);
  }catch(e){
    console.error("Could not load data.json",e);
  }
}
function render(d){
  $("#tagline").textContent=d.profile.tagline;
  $("#intro").textContent=d.profile.intro;
  $("#bioName").textContent=d.profile.name;
  $("#bioText").textContent=d.profile.bio;
  $("#location").textContent=d.profile.location;
  $("#education").textContent=d.profile.education;
  $("#motto").textContent=d.profile.motto;
  $("#journeyList").innerHTML=d.journey.map(x=>`<article class="timeline-item reveal"><div class="timeline-dot">${x.icon}</div><div class="timeline-content"><small>${x.year}</small><h3>${x.title}</h3><p>${x.text}</p></div></article>`).join("");
  $("#hobbiesList").innerHTML=d.hobbies.map(x=>`<article class="hobby-card reveal"><div class="hobby-icon">${x.icon}</div><h3>${x.title}</h3><p>${x.text}</p></article>`).join("");
  $("#favoritesList").innerHTML=d.favorites.map(x=>`<article class="favorite-card reveal"><div class="icon">${x.icon}</div><div><span>${x.label}</span><strong>${x.value}</strong></div></article>`).join("");
  $("#idolsList").innerHTML=d.idols.map(x=>`<article class="idol-card reveal"><div class="idol-img" style="background-image:url('${x.image}')"></div><div class="idol-info"><span class="role">${x.role} • ${x.country}</span><h3>${x.name}</h3><p>${x.reason}</p><a href="${x.link}" target="_blank" rel="noopener">learn more ↗</a></div></article>`).join("");
  $("#dreamsList").innerHTML=d.dreams.map(x=>`<article class="dream-card reveal"><div class="icon">${x.icon}</div><h3>${x.title}</h3><p>${x.text}</p></article>`).join("");
  $("#skillsList").innerHTML=d.skills.map(x=>`<div class="skill reveal"><div class="skill-top"><span>${x.name}</span><span>${x.level}%</span></div><div class="skill-track"><div class="skill-bar" data-level="${x.level}"></div></div></div>`).join("");
  $("#projectsList").innerHTML=d.projects.map((x,i)=>`<article class="project-card reveal" data-category="${x.category}"><div class="project-icon">${x.icon}</div><h3>${x.title}</h3><p>${x.text}</p><div class="project-tools">${x.tools}</div></article>`).join("");
  $("#currentlyList").innerHTML=d.currently.map(x=>`<article class="currently-card reveal"><span>${x.label}</span><p>${x.value}</p></article>`).join("");
  window.funFacts=d.funFacts;
  $("#igLink").href=d.social.instagram;
  $("#ghLink").href=d.social.github;
  $("#emailLink").href=d.social.email;
  activateReveal();
}
function activateReveal(){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("visible");
        if(entry.target.querySelector(".skill-bar")){
          const bar=entry.target.querySelector(".skill-bar");
          bar.style.width=bar.dataset.level+"%";
        }
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.12});
  $$(".reveal:not(.visible)").forEach(el=>observer.observe(el));
}
document.addEventListener("DOMContentLoaded",()=>{
  loadData();
  $("#year").textContent=new Date().getFullYear();

  $("#themeToggle").addEventListener("click",()=>{
    document.body.classList.toggle("dark");
    $("#themeToggle").textContent=document.body.classList.contains("dark")?"☀":"☾";
    localStorage.setItem("portfolio-theme",document.body.classList.contains("dark")?"dark":"light");
  });
  if(localStorage.getItem("portfolio-theme")==="dark"){document.body.classList.add("dark");$("#themeToggle").textContent="☀"}

  $("#menuBtn").addEventListener("click",()=>$("#navLinks").classList.toggle("open"));
  $$("#navLinks a").forEach(a=>a.addEventListener("click",()=>$("#navLinks").classList.remove("open")));

  $("#funFactBtn").addEventListener("click",()=>{
    const facts=window.funFacts||[];
    if(!facts.length)return;
    const current=$("#funResult").textContent;
    let next=facts[Math.floor(Math.random()*facts.length)];
    while(facts.length>1 && next===current) next=facts[Math.floor(Math.random()*facts.length)];
    $("#funResult").textContent=next;
  });

  $$("#projectFilters button").forEach(btn=>{
    btn.addEventListener("click",()=>{
      $$("#projectFilters button").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      const f=btn.dataset.filter;
      $$(".project-card").forEach(card=>{
        card.style.display=(f==="all"||card.dataset.category===f)?"flex":"none";
      });
    });
  });

  const top=$("#topBtn");
  window.addEventListener("scroll",()=>top.classList.toggle("show",scrollY>500));
  top.addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));

  const dot=$(".cursor-dot"), ring=$(".cursor-ring");
  window.addEventListener("mousemove",e=>{
    dot.style.left=e.clientX+"px";dot.style.top=e.clientY+"px";
    ring.style.left=e.clientX+"px";ring.style.top=e.clientY+"px";
  });
  setTimeout(()=>{ $("#loader").style.opacity="0"; setTimeout(()=>$("#loader").style.display="none",650)},700);
});