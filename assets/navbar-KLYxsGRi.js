import{C as p,A as h,D as k,$ as d,a as u,c as w,s as f,i as C}from"./modal-CeTxlxxR.js";function D(){p.init();let e=h.getCurrentUser();e||(e=k[0]);const b=d("#navbarUserAvatar"),r=d("#navbarUserName"),o=d("#navbarUserRole"),n=d(".navbar-user-chip");b&&(b.textContent=e.avatar||(h.isAdmin()?"👑":"👨‍🏫")),r&&(r.textContent=e.name||"ผู้ใช้งานระบบ");const l=h.isAdmin();if(o&&(l?(o.textContent="👑 แอดมิน (กำหนดสถานะได้)",o.style.background="linear-gradient(135deg, var(--cmu-purple-700) 0%, #451d5b 100%)",o.style.color="#fcd34d",o.style.border="1px solid rgba(252, 211, 77, 0.4)"):(o.textContent=`${e.role||"อาจารย์"} (ดูสถานะเท่านั้น 🔒)`,o.style.background="",o.style.color="",o.style.border="")),n&&!n.dataset.hasProfileListener){if(n.dataset.hasProfileListener="true",n.setAttribute("title","คลิกเพื่อแก้ไขบัญชีส่วนตัว (ชื่อ, ตำแหน่ง, รหัสผ่าน, เบอร์โทร)"),!n.querySelector(".user-chip-hint-icon")){const i=document.createElement("span");i.className="user-chip-hint-icon",i.innerHTML=`
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      `,n.appendChild(i)}u(n,"click",i=>{if(i.preventDefault(),window.location.pathname.includes("user-management.html")){const g=document.getElementById("tabBtnProfile");g&&g.click()}else window.location.href="/user-management.html?tab=profile"})}const s=d(".navbar-actions"),m=d("#themeToggleBtn");let a=d("#navbarCloudSyncBtn");s&&!a&&(a=document.createElement("button"),a.id="navbarCloudSyncBtn",a.className="navbar-sync-chip",a.type="button",a.title="🟢 เชื่อมต่อฐานข้อมูลออนไลน์ JSON (ข้อมูลซิงค์กันทุกเครื่อง)",a.innerHTML=`
      <span class="sync-dot"></span>
      <span class="sync-text">คลาวด์ JSON ออนไลน์</span>
    `,m?s.insertBefore(a,m):s.appendChild(a),u(a,"click",i=>{i.preventDefault(),T()}));let t=d("#navbarUserMgmtBtn");s&&(t||(t=document.createElement("button"),t.id="navbarUserMgmtBtn",t.className="btn-navbar-admin-mgmt",t.type="button",t.title="จัดการผู้ใช้งานและกำหนดสิทธิ์ (Admin Only)",t.innerHTML=`
        <span class="mgmt-icon">👥</span>
        <span>จัดการผู้ใช้</span>
        <span class="badge badge-purple" style="font-size: 10px; padding: 1px 5px;">Admin</span>
      `,m?s.insertBefore(t,m):s.appendChild(t),u(t,"click",i=>{if(i.preventDefault(),window.location.pathname.includes("user-management.html")){const g=document.getElementById("tabBtnUsers");g&&g.click()}else window.location.href="/user-management.html?tab=users"})),t&&(t.style.display=l?"inline-flex":"none"));const c=d("#btnAdminUserMgmtAction");c&&(c.style.display=l?"inline-flex":"none",c.dataset.hasListener||(c.dataset.hasListener="true",u(c,"click",()=>{window.location.href="/user-management.html?tab=users"})));const y=d("#themeToggleBtn");if(y){const i=localStorage.getItem(w.STORAGE_KEYS.THEME)||"light";document.documentElement.setAttribute("data-theme",i),u(y,"click",()=>{const S=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",S),localStorage.setItem(w.STORAGE_KEYS.THEME,S),f({type:"info",title:"เปลี่ยนธีม",message:S==="dark"?"เปิดใช้งานโหมดมืด (Dark Mode)":"เปิดใช้งานโหมดสว่าง (Light Mode)",duration:2e3})})}const v=d("#logoutBtn");v&&u(v,"click",i=>{i.preventDefault(),h.logout(),f({type:"info",title:"ออกจากระบบแล้ว",message:"กำลังกลับสู่หน้าเข้าสู่ระบบ..."}),setTimeout(()=>{window.location.href="/index.html"},700)})}function T(){let e=d("#cloudSyncModal");if(!e){e=document.createElement("div"),e.id="cloudSyncModal",e.className="modal-backdrop",e.setAttribute("aria-hidden","true"),e.innerHTML=`
      <div class="modal-container" style="max-width: 580px; width: 92%;">
        <div class="modal-header">
          <div class="modal-header-title-group" style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.35rem; color: #10b981; flex-shrink: 0;">☁️</div>
            <div>
              <h3 class="modal-title" style="font-size: 1.1rem; font-weight: 700;">ฐานข้อมูลออนไลน์ Cloud JSON</h3>
              <p class="modal-subtitle" style="font-size: 0.8125rem; color: var(--text-muted); margin: 0;">ข้อมูลซิงค์ออนไลน์เรียลไทม์ทุกเครื่องโดยไม่ต้องย้ายระบบใหม่</p>
            </div>
          </div>
          <button type="button" class="modal-close-btn" data-modal-close aria-label="ปิดหน้าต่าง">✕</button>
        </div>

        <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px; padding: 20px;">
          <!-- Live Status Card -->
          <div style="background: var(--bg-surface-elevated, #f8fafc); border: 1.5px solid var(--border-subtle, #e2e8f0); border-radius: 12px; padding: 14px 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span id="cloudModalSyncDot" class="sync-dot" style="width: 10px; height: 10px; border-radius: 50%; background-color: #f59e0b; display: inline-block;"></span>
                <span id="cloudModalSyncTitle" style="font-weight: 700; color: var(--text-main); font-size: 0.9375rem;">สถานะ: กำลังตรวจสอบ...</span>
              </div>
              <span id="cloudLastSyncTime" style="font-size: 0.75rem; color: var(--text-muted);">-</span>
            </div>
            <p id="cloudModalSyncDesc" style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.5; margin: 0 0 12px 0;">
              กำลังตรวจสอบการเชื่อมต่อฐานข้อมูลออนไลน์...
            </p>
            <div id="cloudDataStats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center;">
              <!-- Dynamic stats -->
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button id="btnManualSyncNow" type="button" class="btn btn-primary" style="justify-content: center; padding: 10px 14px; font-weight: 600;">
              <span>🔄 ซิงค์ข้อมูลเดี๋ยวนี้</span>
            </button>
            <button id="btnExportJsonBackup" type="button" class="btn btn-secondary" style="justify-content: center; padding: 10px 14px; font-weight: 600;">
              <span>📥 ดาวน์โหลด JSON ทั้งหมด</span>
            </button>
          </div>

          <!-- File Import Action -->
          <div style="background: var(--bg-surface, #fff); border: 1.5px dashed var(--cmu-purple-300, #d8b4fe); border-radius: 10px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
            <div>
              <div style="font-weight: 700; font-size: 0.84rem; color: var(--text-main);">ย้ายข้อมูลข้ามเครื่องด้วยไฟล์ JSON</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">นำเข้าไฟล์ JSON สำรองจากเครื่องอื่น (ทำงานได้ทันทีไม่ต้องต่อ Database)</div>
            </div>
            <input type="file" id="inputImportJsonFile" accept=".json" style="display: none;" />
            <button id="btnTriggerImportJson" type="button" class="btn btn-outline btn-sm" style="flex-shrink: 0;">
              <span>📤 เลือกไฟล์ JSON</span>
            </button>
          </div>

          <!-- Cloud Database Setup (Firebase Realtime Database) -->
          <details id="detailsCloudConfig" style="font-size: 0.8125rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 10px;" open>
            <summary style="cursor: pointer; font-weight: 700; color: var(--cmu-purple-800); user-select: none;">🌐 เชื่อมต่อ Firebase Realtime Database (ออนไลน์ทุกเครื่อง)</summary>
            <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
              <div style="background: rgba(111, 44, 145, 0.05); border: 1px solid var(--cmu-purple-200); border-radius: 8px; padding: 10px 12px; font-size: 0.75rem; line-height: 1.5; color: var(--text-main);">
                <strong>💡 วิธีทำให้เห็นออนไลน์ตรงกันทุกเครื่อง (ฟรี 100% โดย Google):</strong>
                <ol style="margin: 4px 0 0 16px; padding: 0;">
                  <li>เข้า <a href="https://console.firebase.google.com" target="_blank" rel="noopener" style="color: var(--cmu-purple-700); font-weight: 700; text-decoration: underline;">console.firebase.google.com</a> ด้วยบัญชี Google</li>
                  <li>สร้าง Project แล้วเลือกเมนู <strong>Build &gt; Realtime Database</strong> &gt; กด <strong>Create Database</strong></li>
                  <li>ที่แท็บ <strong>Rules</strong> เปลี่ยน <code>.read</code> และ <code>.write</code> เป็น <code>true</code> แล้วกด Publish</li>
                  <li>คัดลอก URL ของ Database (ขึ้นต้นด้วย <code>https://...firebasedatabase.app</code>) มาวางในช่องด้านล่าง</li>
                </ol>
              </div>

              <label for="inputFirebaseDbUrl" style="font-size: 0.75rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">Firebase Realtime Database URL:</label>
              <div style="display: flex; gap: 8px;">
                <input type="text" id="inputFirebaseDbUrl" class="table-input" placeholder="https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app" style="padding: 8px 10px; font-size: 0.8125rem; flex: 1;" />
                <button id="btnSaveCloudConfig" type="button" class="btn btn-sm btn-primary" style="flex-shrink: 0; padding: 0 16px;">
                  <span>บันทึกและเชื่อมต่อ</span>
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>
    `,document.body.appendChild(e);const r=e.querySelector("#btnManualSyncNow"),o=e.querySelector("#btnExportJsonBackup"),n=e.querySelector("#btnTriggerImportJson"),l=e.querySelector("#inputImportJsonFile"),s=e.querySelector("#btnSaveCloudConfig"),m=e.querySelector("#inputFirebaseDbUrl");r&&u(r,"click",async()=>{r.disabled=!0,r.innerHTML="<span>⚡ กำลังซิงค์ข้อมูล...</span>";try{await p.pull(!0),await p.push(),f({type:"success",title:"ซิงค์ข้อมูลสำเร็จ",message:"ข้อมูลในเครื่องและบนคลาวด์ตรงกัน 100% เรียบร้อยแล้ว"}),x(e)}catch(a){f({type:"error",title:"การซิงค์ล้มเหลว",message:a.message||"ไม่สามารถเชื่อมต่อได้ในขณะนี้"})}finally{r.disabled=!1,r.innerHTML="<span>🔄 ซิงค์ข้อมูลเดี๋ยวนี้</span>"}}),o&&u(o,"click",()=>{p.downloadJSONBackup()}),n&&l&&(u(n,"click",()=>{l.click()}),u(l,"change",a=>{var y;const t=(y=a.target.files)==null?void 0:y[0];if(!t)return;const c=new FileReader;c.onload=async v=>{try{const i=v.target.result;await p.importJSONData(i),x(e),setTimeout(()=>{window.location.reload()},1e3)}catch{f({type:"error",title:"อ่านไฟล์ไม่สำเร็จ",message:"ไฟล์ JSON เสียหายหรือไม่ถูกต้อง"})}},c.readAsText(t),l.value=""})),s&&m&&u(s,"click",async()=>{const a=m.value.trim();p.saveConfig({firebaseUrl:a}),f({type:"success",title:"บันทึกการตั้งค่าแล้ว",message:a?"เชื่อมต่อ Firebase Realtime Database เรียบร้อย":"รีเซ็ตกลับเป็นโหมดเครื่อง"});const t=await p.pull(!0);(!(t!=null&&t.data)||!t.data.projects||t.data.projects.length===0)&&await p.push(),x(e)})}x(e),C(e).open()}function x(e){const b=e.querySelector("#cloudDataStats"),r=e.querySelector("#inputFirebaseDbUrl"),o=e.querySelector("#cloudLastSyncTime"),n=e.querySelector("#cloudModalSyncTitle"),l=e.querySelector("#cloudModalSyncDesc"),s=e.querySelector("#cloudModalSyncDot"),m=!!(p.config.firebaseUrl&&p.config.firebaseUrl.trim());if(n&&l&&s&&(m?(s.style.backgroundColor="#10b981",n.textContent="สถานะ: เชื่อมต่อ Firebase ออนไลน์แล้ว",n.style.color="#10b981",l.textContent="ข้อมูลโครงการและกิจกรรมจะซิงค์หากันอัตโนมัติแบบเรียลไทม์ระหว่างทุกเครื่อง"):(s.style.backgroundColor="#f59e0b",n.textContent="สถานะ: ข้อมูลบันทึกเฉพาะในเครื่องนี้ (Local Only)",n.style.color="#d97706",l.innerHTML="เนื่องจากเว็บเปิดบน GitHub Pages ข้อมูลจึงถูกจำไว้ในเครื่องนี้เท่านั้น หากต้องการให้เห็นออนไลน์ตรงกันทุกเครื่อง กรุณาสร้าง <strong>Firebase Realtime Database</strong> (ฟรีโดย Google) แล้วนำ URL มาวางในช่องด้านล่าง")),r&&(r.value=p.config.firebaseUrl||""),o){const a=new Date().toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit",second:"2-digit"});o.textContent=`อัปเดต: ${a} น.`}if(b){let a=0,t=0,c=0;try{a=JSON.parse(localStorage.getItem("satit_cmu_projects_data")||"[]").length,t=JSON.parse(localStorage.getItem("satit_cmu_activities_data")||"[]").length,c=JSON.parse(localStorage.getItem("satit_cmu_users_data")||"[]").length}catch{}b.innerHTML=`
      <div style="background: var(--bg-surface, #fff); padding: 8px; border-radius: 8px; border: 1px solid var(--border-subtle);">
        <div style="font-size: 1.15rem; font-weight: 700; color: var(--cmu-purple-700);">${a}</div>
        <div style="font-size: 0.6875rem; color: var(--text-muted);">โครงการ</div>
      </div>
      <div style="background: var(--bg-surface, #fff); padding: 8px; border-radius: 8px; border: 1px solid var(--border-subtle);">
        <div style="font-size: 1.15rem; font-weight: 700; color: #10b981;">${t}</div>
        <div style="font-size: 0.6875rem; color: var(--text-muted);">กิจกรรม</div>
      </div>
      <div style="background: var(--bg-surface, #fff); padding: 8px; border-radius: 8px; border: 1px solid var(--border-subtle);">
        <div style="font-size: 1.15rem; font-weight: 700; color: #3b82f6;">${c}</div>
        <div style="font-size: 0.6875rem; color: var(--text-muted);">บัญชีผู้ใช้</div>
      </div>
    `}}export{D as i};
