// Real operator photos stay in the canonical machine/tool store in this browser.
const toolPhotoUI={toolId:null,busy:false,message:'',error:false,invoker:'workToolList'};
function toolPhotoKey(id){return tooling.jobMachineId+'|'+Number(id);}
function toolPhoto(id){const photo=tooling.store.toolImages[toolPhotoKey(id)];return photo&&typeof photo.dataUrl==='string'&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(photo.dataUrl)?photo:null;}
// Process reference photos (data/process.json → tool_reference_photos) show until the operator saves a photo of the real mounting.
const TOOL_REFERENCE_PHOTOS=__TOOL_REFERENCE_PHOTOS__;
function referencePhoto(id){return TOOL_REFERENCE_PHOTOS[Number(id)]||null;}
function shownToolPhoto(id){return toolPhoto(id)||referencePhoto(id);}
function toolPhotoMarkup(id,where){const photo=shownToolPhoto(id);return '<button class="tool-photo-button '+(where==='sidebar'?'sidebar-photo':'')+'" data-tool-photo="'+id+'" aria-label="'+(photo?'Ver foto':'Adicionar foto real')+' T'+id+'">'+(photo?'<img src="'+photo.dataUrl+'" alt="'+(photo.reference?'Foto de referência':'Foto enviada pelo operador')+' de T'+id+'">':'<span>Foto</span>')+'</button>';}
function bindToolPhotoButtons(){document.querySelectorAll('[data-tool-photo]').forEach(b=>b.onclick=()=>openToolPhoto(Number(b.dataset.toolPhoto)));}
function toolPhotoDialog(){let dialog=$('toolPhotoDialog');if(dialog)return dialog;dialog=document.createElement('dialog');dialog.id='toolPhotoDialog';dialog.className='tool-photo-dialog';dialog.setAttribute('aria-labelledby','toolPhotoTitle');dialog.addEventListener('close',()=>{$(toolPhotoUI.invoker)?.querySelector('[data-tool-photo="'+toolPhotoUI.toolId+'"]')?.focus({preventScroll:true});});document.body.append(dialog);return dialog;}
function openToolPhoto(id){if(toolPhotoUI.busy)return;toolPhotoUI.invoker=document.activeElement?.closest('#toolList')?'toolList':'workToolList';toolPhotoUI.toolId=id;toolPhotoUI.message='';toolPhotoUI.error=false;renderToolPhotoDialog();const dialog=toolPhotoDialog();if(!dialog.open)dialog.showModal();$('closeToolPhoto').focus();}
function renderToolPhotoDialog(){
 const id=toolPhotoUI.toolId,photo=toolPhoto(id),reference=referencePhoto(id),shown=photo||reference,dialog=toolPhotoDialog();
 dialog.innerHTML='<div class="tool-photo-head"><h3 id="toolPhotoTitle">T'+id+' · '+esc(toolNames[id])+'</h3><button id="closeToolPhoto">Fechar</button></div><div class="tool-photo-preview">'+(shown?'<img src="'+shown.dataUrl+'" alt="'+(photo?'Foto real de T'+id+' enviada pelo operador':'Foto de referência de T'+id+' na máquina')+'">':'<p>Sem foto desta montagem.</p>')+'</div><p class="tool-photo-origin">'+(photo?'Foto enviada pelo operador · '+esc(photo.filename):reference?'Foto de referência do processo · '+esc(reference.origin):'Fotografe a ferramenta e sua montagem real.')+'</p><div class="tool-photo-actions"><button id="chooseToolPhoto" '+(toolPhotoUI.busy?'disabled':'')+'>'+(photo?'Substituir foto':'Adicionar foto real')+'</button>'+(photo?'<button id="removeToolPhoto" '+(toolPhotoUI.busy?'disabled':'')+'>Remover foto</button>':'')+'</div><input id="toolPhotoFile" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden><p class="tool-photo-help">JPG, PNG ou WebP · até 12 MB · salva neste navegador.</p><p id="toolPhotoMessage" role="status" class="'+(toolPhotoUI.error?'invalid':'')+'">'+esc(toolPhotoUI.message)+'</p>';
 $('closeToolPhoto').onclick=()=>dialog.close();$('chooseToolPhoto').onclick=()=>$('toolPhotoFile').click();
 $('toolPhotoFile').onchange=async e=>{e.target.onchange=null;const file=e.target.files[0];if(file)await saveToolPhoto(id,file);};
 if(photo)$('removeToolPhoto').onclick=()=>{const old=tooling.store.toolImages[toolPhotoKey(id)];delete tooling.store.toolImages[toolPhotoKey(id)];if(!persist()){tooling.store.toolImages[toolPhotoKey(id)]=old;toolPhotoUI.message='Não foi possível salvar a remoção.';toolPhotoUI.error=true;}else{toolPhotoUI.message='Foto removida.';toolPhotoUI.error=false;}renderTools();renderToolPhotoDialog();$('chooseToolPhoto').focus();};
}
async function saveToolPhoto(id,file){
 if(toolPhotoUI.busy)return;toolPhotoUI.busy=true;toolPhotoUI.error=false;toolPhotoUI.message='Salvando foto…';renderToolPhotoDialog();
 let bitmap=null;
 try{
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>12*1024*1024)throw Error('Escolha JPG, PNG ou WebP de até 12 MB.');
  bitmap=await createImageBitmap(file);const scale=Math.min(1,768/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);
  let dataUrl;for(const quality of[.78,.64,.50,.38,.25]){dataUrl=canvas.toDataURL('image/jpeg',quality);if(dataUrl.length<=250000)break;}if(dataUrl.length>250000)throw Error('Foto muito grande para salvar. Use uma imagem menor.');
  const key=toolPhotoKey(id),old=tooling.store.toolImages[key];tooling.store.toolImages[key]={machineId:tooling.jobMachineId,toolId:id,dataUrl,filename:file.name.slice(0,120),width:canvas.width,height:canvas.height,source:'foto enviada pelo operador',at:new Date().toISOString()};
  if(!persist()){if(old)tooling.store.toolImages[key]=old;else delete tooling.store.toolImages[key];throw Error('Sem espaço neste navegador. A foto anterior foi preservada.');}
  toolPhotoUI.message='Foto salva para T'+id+'.';renderTools();
 }catch(e){toolPhotoUI.error=true;toolPhotoUI.message=e.message==='The source image could not be decoded.'?'Não foi possível ler esta imagem. Use JPG, PNG ou WebP.':e.message;}
 finally{bitmap?.close();toolPhotoUI.busy=false;if(toolPhotoUI.toolId===id&&toolPhotoDialog().open){renderToolPhotoDialog();$('chooseToolPhoto').focus();}}
}
