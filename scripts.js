/*  scripts.js  – Auto-Repair Demo  (Version ar-1.0.0)
   ------------------------------------------------------------------ */

   const IMGBB_API_KEY = 'd44d592f97ef193ce535a799d00ef632';   // stays the same

   /* repairs used in this demo */
   const REPAIRS = [
     {
       name: 'Air-Filter Replacement',
       before: 'https://f000.backblazeb2.com/file/EmbrFyr/AutoRepair-Demo/Before-After-Images/AirFilter-Before.jpg',
       after : 'https://f000.backblazeb2.com/file/EmbrFyr/AutoRepair-Demo/Before-After-Images/AirFilter-After-B.jpg'
     },
     {
       name: 'CV-Axle Replacement',
       before: 'https://f000.backblazeb2.com/file/EmbrFyr/AutoRepair-Demo/Before-After-Images/CV-Axle-Before.jpg',
       after : 'https://f000.backblazeb2.com/file/EmbrFyr/AutoRepair-Demo/Before-After-Images/CV-Axle-After.jpg'
     },
     {
       name: 'Oil-Dipstick Service',
       before: 'https://f000.backblazeb2.com/file/EmbrFyr/AutoRepair-Demo/Before-After-Images/Dipstick-Before.jpg',
       after : 'https://f000.backblazeb2.com/file/EmbrFyr/AutoRepair-Demo/Before-After-Images/Dipstick-After.jpg'
     },
     {
       name: 'Oil-Pan Gasket',
       before: 'https://f000.backblazeb2.com/file/EmbrFyr/AutoRepair-Demo/Before-After-Images/OilPan-Before.jpg',
       after : 'https://f000.backblazeb2.com/file/EmbrFyr/AutoRepair-Demo/Before-After-Images/OilPan-After.jpg'
     },
     {
       name: 'Serpentine-Belt Change',
       before: 'https://f000.backblazeb2.com/file/EmbrFyr/AutoRepair-Demo/Before-After-Images/SerpentineBelt-Before.jpg',
       after : 'https://f000.backblazeb2.com/file/EmbrFyr/AutoRepair-Demo/Before-After-Images/SerpentineBelt-After.jpg'
     },
     {
       name: 'Shock Absorber',
       before: 'https://f000.backblazeb2.com/file/EmbrFyr/AutoRepair-Demo/Before-After-Images/Shock-Before-A.jpg',
       after : 'https://f000.backblazeb2.com/file/EmbrFyr/AutoRepair-Demo/Before-After-Images/Shock-After.jpg'
     },
     {
       name: 'Water-Pump Replacement',
       before: 'https://f000.backblazeb2.com/file/EmbrFyr/AutoRepair-Demo/Before-After-Images/WaterPump-Before-A.jpg',
       after : 'https://f000.backblazeb2.com/file/EmbrFyr/AutoRepair-Demo/Before-After-Images/WaterPump-After.jpg'
     }
   ];
   
   /* generic helpers */
   const $  = id  => document.getElementById(id);
   const qs = sel => document.querySelector(sel);
   const qa = sel => document.querySelectorAll(sel);
   
   function showStep(id){
     qa('.step').forEach(s=>s.classList.remove('active'));
     $(id).classList.add('active');
   }
   
   /* ──────────────────────────────────────────────────────────
        0.  Role selection
      ──────────────────────────────────────────────────────────*/
   $('techDemoBtn').onclick     = ()=>showStep('techPhotoStep');
   $('frontDeskDemoBtn').onclick= ()=>showStep('frontDeskGallery');
   $('customerDemoBtn').onclick = ()=>showStep('customerChoice');
   
   /* ──────────────────────────────────────────────────────────
        1-2. Technician flow
      ──────────────────────────────────────────────────────────*/
   qa('.backToTechStart').forEach(btn=>btn.onclick=()=>showStep('techPhotoStep'));
   
   $('photoOptions').onclick=e=>{
     const btn=e.target.closest('.photo-option');
     if(!btn) return;
     const opt=btn.dataset.option;
     $('photoOptions').style.display='none';
     qa('.photo-section').forEach(s=>s.style.display='none');
   
     if(opt==='take'){
       $('takePhotoSection').style.display='block';
       startCamera();
     }else if(opt==='upload'){
       $('uploadPhotoSection').style.display='block';
     }else{
       $('urlPhotoSection').style.display='block';
     }
   };
   
   $('uploadInput').onchange=e=>{
     const f=e.target.files[0]; if(!f) return;
     const r=new FileReader();
     r.onload=ev=>loadImageForCrop(ev.target.result);
     r.readAsDataURL(f);
   };
   $('loadUrlImage').onclick=()=>{
     const u=$('imageUrlInput').value.trim();
     if(!u) return alert('Enter URL');
     loadImageForCrop(u,true);
   };
   
   $('capturePhoto').onclick=captureFromCamera;
   $('swapCamera').onclick=()=>{currentCamera=currentCamera==='environment'?'user':'environment';startCamera();};
   
   $('cropButton').onclick=()=>{
     if(!cropper) return;
     const cnv=cropper.getCroppedCanvas({width:1080,height:700});
     saveTechRepair(cnv.toDataURL('image/jpeg'));
   };
   $('fitEntireButton').onclick=()=>{
     const src=uploadedVehicleUrl||$('cropImage').src;
     if(!src) return;
     const img=new Image();img.crossOrigin='Anonymous';
     img.onload=()=>{
       const cnv=document.createElement('canvas');cnv.width=1080;cnv.height=700;
       const ctx=cnv.getContext('2d');
       ctx.drawImage(img,0,0,cnv.width,cnv.height);
       saveTechRepair(cnv.toDataURL('image/jpeg'));
     };
     img.src=src;
   };
   $('changePhoto').onclick=()=>{
     stopCamera();
     $('photoOptions').style.display='block';
     qa('.photo-section').forEach(s=>s.style.display='none');
   };
   
   function saveTechRepair(imgDataUrl){
     stopCamera();
     cropper?.destroy();cropper=null;
     Swal.fire({title:'Photo Saved (demo)',icon:'success',timer:1200,showConfirmButton:false});
     showStep('techInfoStep');
     $('yearInput').value  = randomYear();
     $('makeInput').value  = randomMake();
     $('modelInput').value = randomModel();
     $('repairSelect').value = '';
     uploadedVehicleUrl = imgDataUrl;   // store for demo
   }
   
   $('decodeVinBtn').onclick=()=>{
     // Simple VIN demo decode (randomise)
     $('yearInput').value  = randomYear();
     $('makeInput').value  = randomMake();
     $('modelInput').value = randomModel();
   };
   
   $('saveRepairBtn').onclick=()=>{
     Swal.fire({title:'Repair stored for this session!',icon:'success'});
     showStep('roleSelect');
   };
   $('backToTechPhoto').onclick=()=>showStep('techPhotoStep');
   
   /* ──────────────────────────────────────────────────────────
        3-4. Front-Desk gallery & detail
      ──────────────────────────────────────────────────────────*/
   function buildGallery(){
     const wrap=$('repairGallery');
     wrap.innerHTML='';
     REPAIRS.forEach((r,i)=>{
       const det=document.createElement('details');
       const sum=document.createElement('summary');
       sum.textContent=r.name;
       const div=document.createElement('div');div.className='ba-card';
       const bImg=document.createElement('img');bImg.src=r.before;bImg.alt=r.name+' before';
       const aImg=document.createElement('img');aImg.src=r.after; aImg.alt=r.name+' after';
       div.appendChild(bImg);div.appendChild(aImg);
       div.onclick=()=>openDetail(i);
       det.appendChild(sum);det.appendChild(div);
       wrap.appendChild(det);
     });
   }
   function openDetail(idx){
     const r=REPAIRS[idx];
     $('detailHeading').textContent=r.name;
     $('detailBefore').src=r.before;
     $('detailAfter').src =r.after;
     const msg = `Hi John,\n\nWe completed the ${r.name} on your 2015 Honda Civic. Check out your before & after photos and feel free to share!\n\njustshar.ing/demo-link`;
     $('shareMsg').value=msg;
     showStep('frontDeskDetail');
   }
   $('copyMsgBtn').onclick=async()=>{
     try{
       await navigator.clipboard.writeText($('shareMsg').value);
       Swal.fire({title:'Copied!',icon:'success',timer:900,showConfirmButton:false});
     }catch{alert('copy failed');}
   };
   $('showQRBtn').onclick=()=>{
     $('qrLinkTxt').textContent='justshar.ing/demo-link';
     $('qrImg').src='https://api.qrserver.com/v1/create-qr-code/?size=180x180&data='+encodeURIComponent('justshar.ing/demo-link');
     $('qrModal').classList.add('active');
   };
   $('closeQR').onclick=()=>$('qrModal').classList.remove('active');
   $('detailBack').onclick=()=>showStep('frontDeskGallery');
   $('frontDeskBack').onclick=()=>showStep('roleSelect');
   
   /* ──────────────────────────────────────────────────────────
        5. Customer flow
      ──────────────────────────────────────────────────────────*/
   let custIdx=0,custStep=0;
   $('separateBtn').onclick=()=>{
     custIdx = 0;
     custStep=0;
     loadSeparateImage();
     showStep('custSeparate');
   };
   function loadSeparateImage(){
     const pair = REPAIRS[custIdx%REPAIRS.length];
     $('custSeparateImg').src = custStep===0?pair.before:pair.after;
     $('custSeparateHeading').textContent = custStep===0?'Share BEFORE Photo':'Share AFTER Photo';
   }
   $('nextSeparateBtn').onclick=()=>{
     if(custStep===0){ custStep=1; loadSeparateImage(); return; }
     Swal.fire({title:'Thanks for sharing!',icon:'success'});
     showStep('roleSelect');
   };
   $('combinedBtn').onclick=()=>{
     const r=REPAIRS[0];
     makeCombined(r.before,r.after).then(url=>{
       $('combinedImg').src=url;
       showStep('custCombined');
     });
   };
   $('combinedDoneBtn').onclick=()=>{
     Swal.fire({title:'Thanks for sharing!',icon:'success'});
     showStep('roleSelect');
   };
   $('custBack').onclick=()=>showStep('roleSelect');
   
   /* ──────────────────────────────────────────────────────────
        Helpers – make combined image, camera / cropper
      ──────────────────────────────────────────────────────────*/
   async function makeCombined(beforeUrl,afterUrl){
     const [b,a] = await Promise.all([loadImg(beforeUrl),loadImg(afterUrl)]);
     const c=document.createElement('canvas');c.width=1080;c.height=700;
     const ctx=c.getContext('2d');
     ctx.drawImage(b,0,0,540,700);
     ctx.drawImage(a,540,0,540,700);
     ctx.fillStyle='#fff';ctx.fillRect(535,0,10,700); // divider
     return c.toDataURL('image/jpeg');
   }
   function loadImg(src){return new Promise(res=>{const i=new Image();i.crossOrigin='Anonymous';i.onload=()=>res(i);i.src=src;});}
   
   /* camera / cropper simplified */
   let cameraStream=null,currentCamera='environment',cropper=null,uploadedVehicleUrl='';
   function startCamera(){
     stopCamera();
     navigator.mediaDevices.getUserMedia({video:{facingMode:currentCamera}}).then(st=>{
       cameraStream=st;
       $('cameraPreview').srcObject=st;
     }).catch(()=>alert('Camera unavailable'));
   }
   function stopCamera(){ if(cameraStream){cameraStream.getTracks().forEach(t=>t.stop());cameraStream=null;} }
   function captureFromCamera(){
     const v=$('cameraPreview');if(!v) return;
     const cnv=document.createElement('canvas');cnv.width=1080;cnv.height=700;
     const ctx=cnv.getContext('2d');
     ctx.drawImage(v,0,0,cnv.width,cnv.height);
     loadImageForCrop(cnv.toDataURL('image/jpeg'));
   }
   function loadImageForCrop(src,isUrl=false){
     const img=$('cropImage');
     if(isUrl) img.crossOrigin='Anonymous';
     img.src=src;
     qa('.photo-section').forEach(s=>s.style.display='none');
     $('cropSection').style.display='block';
     cropper?.destroy();
     cropper=new Cropper(img,{aspectRatio:1080/700,viewMode:1,dragMode:'move',autoCropArea:1,
                              movable:true,zoomable:true,cropBoxResizable:false,cropBoxMovable:false});
   }
   
   /* ──────────────────────────────────────────────────────────
        Misc util
      ──────────────────────────────────────────────────────────*/
   function randomYear(){return Math.floor(Math.random()*13)+2012;}
   function randomMake(){return ['Honda','Toyota','Ford','Chevrolet','Nissan'][Math.floor(Math.random()*5)];}
   function randomModel(){return ['Civic','Camry','F-150','Silverado','Altima'][Math.floor(Math.random()*5)];}
   
   /* ──────────────────────────────────────────────────────────
        Init
      ──────────────────────────────────────────────────────────*/
   document.addEventListener('DOMContentLoaded',()=>{
     buildGallery();
     // populate repair dropdown for technician
     const sel=$('repairSelect');
     REPAIRS.forEach(r=>{
       const o=document.createElement('option');o.value=r.name;o.textContent=r.name;
       sel.appendChild(o);
     });
   });
   