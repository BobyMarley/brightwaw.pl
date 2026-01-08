function gtag_report_conversion(){if(typeof gtag==='function'){gtag('event','conversion',{'send_to':'AW-11273981561/WS4pCP3WgfUZEPmc7f8p'})}return false}
document.addEventListener('DOMContentLoaded',()=>{
const h=document.querySelector('.hamburger-menu'),o=document.querySelector('.overlay'),hdr=document.querySelector('.header');
h&&h.addEventListener('click',()=>{o.classList.toggle('active');document.body.style.overflow=o.classList.contains('active')?'hidden':'auto'});
o&&o.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{o.classList.remove('active');document.body.style.overflow='auto'}));
const scr=()=>window.scrollY>50?hdr.classList.add('scrolled'):hdr.classList.remove('scrolled');
window.addEventListener('scroll',scr,{passive:true});
document.querySelectorAll('.faq details').forEach(d=>d.addEventListener('toggle',()=>{const a=d.querySelector('i');a&&(a.style.transform=d.open?'rotate(180deg)':'')}));
setTimeout(()=>{
const p=document.getElementById('phone');
if(p&&typeof IMask!=='undefined'){
const m=IMask(p,{mask:'+48 000 000 000',lazy:false});
p.style.transition='background .3s,box-shadow .3s';
const u=()=>{
const f=m.unmaskedValue.length,pct=f/9*100;
if(f===0){p.style.background='#fff';p.style.boxShadow='none'}
else if(f<9){p.style.background='linear-gradient(90deg,#c8e6c9 '+pct+'%,#fff '+pct+'%)';p.style.boxShadow='inset 0 0 0 2px #ffa726'}
else{p.style.background='#c8e6c9';p.style.boxShadow='inset 0 0 0 2px #66bb6a'}
};
m.on('accept',u);p.addEventListener('focus',()=>m.updateValue());u()
}
},500);
const s=document.querySelector('.team-slider'),pb=document.querySelector('.slider-prev'),nb=document.querySelector('.slider-next');
if(s&&pb&&nb){
pb.addEventListener('click',()=>s.scrollBy({left:-300,behavior:'smooth'}));
nb.addEventListener('click',()=>s.scrollBy({left:300,behavior:'smooth'}));
['mouseenter','mouseleave'].forEach(e=>{
pb.addEventListener(e,()=>{pb.style.background=e==='mouseenter'?'#0f85c9':'#fff';pb.style.color=e==='mouseenter'?'#fff':'#0f85c9'});
nb.addEventListener(e,()=>{nb.style.background=e==='mouseenter'?'#0f85c9':'#fff';nb.style.color=e==='mouseenter'?'#fff':'#0f85c9'})
})
}
});
