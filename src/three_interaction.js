// Pointer events support desktop controls and genuine two-finger touch gestures.
function installThreeInteraction(canvas,view,draw){
 const points=new Map();const clampRadius=r=>Math.min(5000,Math.max(350,r));
 const zoomBy=factor=>{view.radius=clampRadius(view.radius*factor);draw()};
 const pairDistance=()=>{const [a,b]=[...points.values()];return Math.hypot(a.x-b.x,a.y-b.y)};
 canvas.tabIndex=0;canvas.setAttribute('aria-label','Vista 3D: um dedo gira; dois dedos aproximam ou afastam. Mouse: arrastar gira, Shift ou botão direito desloca, roda aproxima. Teclas de seta giram; + e - ajustam o zoom.');
 canvas.addEventListener('contextmenu',e=>e.preventDefault());
 canvas.addEventListener('pointerdown',e=>{e.preventDefault();points.set(e.pointerId,{x:e.clientX,y:e.clientY,pan:e.button===2||e.shiftKey});canvas.setPointerCapture(e.pointerId)});
 const finish=e=>points.delete(e.pointerId);
 canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);canvas.addEventListener('lostpointercapture',finish);window.addEventListener('blur',()=>points.clear());
 canvas.addEventListener('pointermove',e=>{
  const previous=points.get(e.pointerId);if(!previous)return;e.preventDefault();
  if(points.size>=2){const before=pairDistance();points.set(e.pointerId,{...previous,x:e.clientX,y:e.clientY});const after=pairDistance();if(before>0&&after>0)zoomBy(before/after);return}
  const dx=e.clientX-previous.x,dy=e.clientY-previous.y;
  if(previous.pan){const scale=view.radius/canvas.clientWidth;view.target.x-=dx*scale*Math.cos(view.yaw);view.target.z+=dx*scale*Math.sin(view.yaw);view.target.y+=dy*scale}
  else{view.yaw-=dx*.006;view.pitch=Math.max(.17,Math.min(1.48,view.pitch+dy*.004))}
  points.set(e.pointerId,{...previous,x:e.clientX,y:e.clientY});draw();
 });
 canvas.addEventListener('wheel',e=>{e.preventDefault();zoomBy(1+Math.sign(e.deltaY)*.07)},{passive:false});
 canvas.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(e.key))return;e.preventDefault();
  if(e.key==='ArrowLeft')view.yaw-=.08;if(e.key==='ArrowRight')view.yaw+=.08;if(e.key==='ArrowUp')view.pitch=Math.min(1.48,view.pitch+.08);if(e.key==='ArrowDown')view.pitch=Math.max(.17,view.pitch-.08);
  if(['+','='].includes(e.key))view.radius=clampRadius(view.radius*.9);if(e.key==='-')view.radius=clampRadius(view.radius*1.1);draw();
 });
 document.getElementById('zoom3DIn').onclick=()=>zoomBy(.8);document.getElementById('zoom3DOut').onclick=()=>zoomBy(1.25);
}
