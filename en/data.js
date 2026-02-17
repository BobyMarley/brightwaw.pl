(function(){
  const roomData={kompleksowa:{},generalna:{}};
  let currentType='kompleksowa';
  
  function loadRoom(room){
    const d=roomData[currentType]?.[room];
    if(!d)return;
    const c=document.querySelector(`.cleaning-content[data-room="${room}"]`);
    const roomImages={'1':'/public/rooms/room.png','2':'/public/rooms/corridor.png','3':'/public/rooms/kitchen.png','4':'/public/rooms/bathroom.png'};
    if(c&&d.items)c.innerHTML=`<ul>${d.items.map(i=>`<li><i class="fa-solid fa-check"></i>${i}</li>`).join('')}</ul><div class="cleaning-image"><img src="${roomImages[room]}" alt="${d.title||'Cleaning'}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" /></div>`;
  }
  
  Promise.all([
    fetch('/data/en/tabData_by_kompleksowa.json').then(r=>r.json()),
    fetch('/data/en/tabData_by_generalna.json').then(r=>r.json())
  ]).then(([kompData,genData])=>{
    Object.keys(kompData).forEach(k=>{roomData.kompleksowa[k]=kompData[k];});
    Object.keys(genData).forEach(k=>{roomData.generalna[k]=genData[k];});
    setTimeout(()=>loadRoom(1),100);
  });
  
  document.addEventListener('click',e=>{
    if(e.target.closest('.cleaning-tab')){
      const r=e.target.closest('.cleaning-tab').dataset.room;
      document.querySelectorAll('.cleaning-tab').forEach(t=>t.classList.remove('active'));
      e.target.closest('.cleaning-tab').classList.add('active');
      document.querySelectorAll('.cleaning-content').forEach(c=>c.classList.remove('active'));
      document.querySelector(`.cleaning-content[data-room="${r}"]`).classList.add('active');
    }
    if(e.target.closest('.cleaning-type-btn')){
      currentType=e.target.closest('.cleaning-type-btn').dataset.type;
      document.querySelectorAll('.cleaning-type-btn').forEach(b=>b.classList.remove('active'));
      e.target.closest('.cleaning-type-btn').classList.add('active');
      const h=document.getElementById('cleaning-type-heading');
      if(h)h.textContent=currentType==='generalna'?"What's Included in General Cleaning":"What's Included in Regular Cleaning";
      [1,2,3,4].forEach(loadRoom);
    }
  });
})();
