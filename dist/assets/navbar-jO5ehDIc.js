import{C as u,A as h,D as k,$ as l,a as c,c as w,s as g,i as C}from"./modal-B-GR92uN.js";function E(){u.init();let e=h.getCurrentUser();e||(e=k[0]);const b=l("#navbarUserAvatar"),r=l("#navbarUserName"),a=l("#navbarUserRole"),i=l(".navbar-user-chip");b&&(b.textContent=e.avatar||(h.isAdmin()?"👑":"👨‍🏫")),r&&(r.textContent=e.name||"ผู้ใช้งานระบบ");const d=h.isAdmin();if(a&&(d?(a.textContent="👑 แอดมิน (กำหนดสถานะได้)",a.style.background="linear-gradient(135deg, var(--cmu-purple-700) 0%, #451d5b 100%)",a.style.color="#fcd34d",a.style.border="1px solid rgba(252, 211, 77, 0.4)"):(a.textContent=`${e.role||"อาจารย์"} (ดูสถานะเท่านั้น 🔒)`,a.style.background="",a.style.color="",a.style.border="")),i&&!i.dataset.hasProfileListener){if(i.dataset.hasProfileListener="true",i.setAttribute("title","คลิกเพื่อแก้ไขบัญชีส่วนตัว (ชื่อ, ตำแหน่ง, รหัสผ่าน, เบอร์โทร)"),!i.querySelector(".user-chip-hint-icon")){const n=document.createElement("span");n.className="user-chip-hint-icon",n.innerHTML=`
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      `,i.appendChild(n)}c(i,"click",n=>{if(n.preventDefault(),window.location.pathname.includes("user-management.html")){const f=document.getElementById("tabBtnProfile");f&&f.click()}else window.location.href="/user-management.html?tab=profile"})}const o=l(".navbar-actions"),m=l("#themeToggleBtn");let t=l("#navbarCloudSyncBtn");o&&!t&&(t=document.createElement("button"),t.id="navbarCloudSyncBtn",t.className="navbar-sync-chip",t.type="button",t.title="🟢 เชื่อมต่อฐานข้อมูลออนไลน์ JSON (ข้อมูลซิงค์กันทุกเครื่อง)",t.innerHTML=`
      <span class="sync-dot"></span>
      <span class="sync-text">คลาวด์ JSON ออนไลน์</span>
    `,m?o.insertBefore(t,m):o.appendChild(t),c(t,"click",n=>{n.preventDefault(),T()}));let s=l("#navbarUserMgmtBtn");o&&(s||(s=document.createElement("button"),s.id="navbarUserMgmtBtn",s.className="btn-navbar-admin-mgmt",s.type="button",s.title="จัดการผู้ใช้งานและกำหนดสิทธิ์ (Admin Only)",s.innerHTML=`
        <span class="mgmt-icon">👥</span>
        <span>จัดการผู้ใช้</span>
        <span class="badge badge-purple" style="font-size: 10px; padding: 1px 5px;">Admin</span>
      `,m?o.insertBefore(s,m):o.appendChild(s),c(s,"click",n=>{if(n.preventDefault(),window.location.pathname.includes("user-management.html")){const f=document.getElementById("tabBtnUsers");f&&f.click()}else window.location.href="/user-management.html?tab=users"})),s&&(s.style.display=d?"inline-flex":"none"));const p=l("#btnAdminUserMgmtAction");p&&(p.style.display=d?"inline-flex":"none",p.dataset.hasListener||(p.dataset.hasListener="true",c(p,"click",()=>{window.location.href="/user-management.html?tab=users"})));const y=l("#themeToggleBtn");if(y){const n=localStorage.getItem(w.STORAGE_KEYS.THEME)||"light";document.documentElement.setAttribute("data-theme",n),c(y,"click",()=>{const S=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",S),localStorage.setItem(w.STORAGE_KEYS.THEME,S),g({type:"info",title:"เปลี่ยนธีม",message:S==="dark"?"เปิดใช้งานโหมดมืด (Dark Mode)":"เปิดใช้งานโหมดสว่าง (Light Mode)",duration:2e3})})}const v=l("#logoutBtn");v&&c(v,"click",n=>{n.preventDefault(),h.logout(),g({type:"info",title:"ออกจากระบบแล้ว",message:"กำลังกลับสู่หน้าเข้าสู่ระบบ..."}),setTimeout(()=>{window.location.href="/index.html"},700)})}function T(){let e=l("#cloudSyncModal");if(!e){e=document.createElement("div"),e.id="cloudSyncModal",e.className="modal-backdrop",e.setAttribute("aria-hidden","true"),e.innerHTML=`
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
                <span class="sync-dot" style="width: 10px; height: 10px; border-radius: 50%; background-color: #10b981; display: inline-block;"></span>
                <span style="font-weight: 700; color: var(--text-main); font-size: 0.9375rem;">สถานะ: ออนไลน์เรียลไทม์ (Active)</span>
              </div>
              <span id="cloudLastSyncTime" style="font-size: 0.75rem; color: var(--text-muted);">เชื่อมต่อคลาวด์แล้ว</span>
            </div>
            <p style="font-size: 0.8125rem; color: var(--text-muted); line-height: 1.5; margin: 0 0 12px 0;">
              ข้อมูลทั้งหมด (โครงการ, กิจกรรม, แบบฟอร์ม, ผู้ใช้) ถูกจัดเก็บเป็น JSON และซิงค์ตรงกันอัตโนมัติบน GitHub Pages
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
              <div style="font-weight: 700; font-size: 0.84rem; color: var(--text-main);">นำเข้าข้อมูลจากไฟล์ JSON</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">ย้ายข้อมูลข้ามเครื่องหรือกู้คืนจากไฟล์ Backup</div>
            </div>
            <input type="file" id="inputImportJsonFile" accept=".json" style="display: none;" />
            <button id="btnTriggerImportJson" type="button" class="btn btn-outline btn-sm" style="flex-shrink: 0;">
              <span>📤 เลือกไฟล์ JSON</span>
            </button>
          </div>

          <!-- Advanced Settings (Firebase / Custom URL) -->
          <details style="font-size: 0.8125rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 10px;">
            <summary style="cursor: pointer; font-weight: 600; color: var(--cmu-purple-700); user-select: none;">⚙️ การตั้งค่า Cloud Endpoint หรือ Firebase (ทางเลือก)</summary>
            <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;">
              <label for="inputFirebaseDbUrl" style="font-size: 0.75rem; font-weight: 600; color: var(--text-main);">Firebase Realtime Database URL (ไม่บังคับ):</label>
              <input type="text" id="inputFirebaseDbUrl" class="table-input" placeholder="เช่น https://satit-cmu-project-default-rtdb.firebaseio.com" style="padding: 7px 10px; font-size: 0.8125rem;" />
              <p style="font-size: 0.6875rem; color: var(--text-muted); margin: 0;">หากเว้นว่าง ระบบจะใช้ Cloud JSON Sync มาตรฐานอัตโนมัติ</p>
              <button id="btnSaveCloudConfig" type="button" class="btn btn-sm btn-primary" style="align-self: flex-start; margin-top: 2px;">
                <span>บันทึกการตั้งค่า</span>
              </button>
            </div>
          </details>
        </div>
      </div>
    `,document.body.appendChild(e);const r=e.querySelector("#btnManualSyncNow"),a=e.querySelector("#btnExportJsonBackup"),i=e.querySelector("#btnTriggerImportJson"),d=e.querySelector("#inputImportJsonFile"),o=e.querySelector("#btnSaveCloudConfig"),m=e.querySelector("#inputFirebaseDbUrl");r&&c(r,"click",async()=>{r.disabled=!0,r.innerHTML="<span>⚡ กำลังซิงค์ข้อมูล...</span>";try{await u.pull(!0),await u.push(),g({type:"success",title:"ซิงค์ข้อมูลสำเร็จ",message:"ข้อมูลในเครื่องและบนคลาวด์ตรงกัน 100% เรียบร้อยแล้ว"}),x(e)}catch(t){g({type:"error",title:"การซิงค์ล้มเหลว",message:t.message||"ไม่สามารถเชื่อมต่อได้ในขณะนี้"})}finally{r.disabled=!1,r.innerHTML="<span>🔄 ซิงค์ข้อมูลเดี๋ยวนี้</span>"}}),a&&c(a,"click",()=>{u.downloadJSONBackup()}),i&&d&&(c(i,"click",()=>{d.click()}),c(d,"change",t=>{var y;const s=(y=t.target.files)==null?void 0:y[0];if(!s)return;const p=new FileReader;p.onload=async v=>{try{const n=v.target.result;await u.importJSONData(n),x(e),setTimeout(()=>{window.location.reload()},1e3)}catch{g({type:"error",title:"อ่านไฟล์ไม่สำเร็จ",message:"ไฟล์ JSON เสียหายหรือไม่ถูกต้อง"})}},p.readAsText(s),d.value=""})),o&&m&&c(o,"click",async()=>{const t=m.value.trim();u.saveConfig({firebaseUrl:t}),g({type:"success",title:"บันทึกการตั้งค่าแล้ว",message:t?"เปลี่ยนไปใช้ Firebase Realtime Database เรียบร้อย":"ใช้ Cloud Endpoint มาตรฐาน"}),await u.pull(!0),x(e)})}x(e),C(e).open()}function x(e){const b=e.querySelector("#cloudDataStats"),r=e.querySelector("#inputFirebaseDbUrl"),a=e.querySelector("#cloudLastSyncTime");if(r&&(r.value=u.config.firebaseUrl||""),a){const i=new Date().toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit",second:"2-digit"});a.textContent=`อัปเดต: ${i} น.`}if(b){let i=0,d=0,o=0;try{i=JSON.parse(localStorage.getItem("satit_cmu_projects_data")||"[]").length,d=JSON.parse(localStorage.getItem("satit_cmu_activities_data")||"[]").length,o=JSON.parse(localStorage.getItem("satit_cmu_users_data")||"[]").length}catch{}b.innerHTML=`
      <div style="background: var(--bg-surface, #fff); padding: 8px; border-radius: 8px; border: 1px solid var(--border-subtle);">
        <div style="font-size: 1.15rem; font-weight: 700; color: var(--cmu-purple-700);">${i}</div>
        <div style="font-size: 0.6875rem; color: var(--text-muted);">โครงการ</div>
      </div>
      <div style="background: var(--bg-surface, #fff); padding: 8px; border-radius: 8px; border: 1px solid var(--border-subtle);">
        <div style="font-size: 1.15rem; font-weight: 700; color: #10b981;">${d}</div>
        <div style="font-size: 0.6875rem; color: var(--text-muted);">กิจกรรม</div>
      </div>
      <div style="background: var(--bg-surface, #fff); padding: 8px; border-radius: 8px; border: 1px solid var(--border-subtle);">
        <div style="font-size: 1.15rem; font-weight: 700; color: #3b82f6;">${o}</div>
        <div style="font-size: 0.6875rem; color: var(--text-muted);">บัญชีผู้ใช้</div>
      </div>
    `}}export{E as i};
