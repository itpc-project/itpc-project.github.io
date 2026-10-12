import{$ as e,a as S,s as y,b as _,A as N,e as $,i as F}from"./modal-CKzYp675.js";import{i as Y}from"./navbar-B7Tf-Fv9.js";import{P as R,S as q,A as U,a as L}from"./activity-service-DvGB3wHQ.js";let B="all";document.addEventListener("DOMContentLoaded",()=>{Y();const n=new URLSearchParams(window.location.search).get("id");let i=null;if(n)i=R.getProjectById(n);else try{const c=sessionStorage.getItem("satit_cmu_active_project");c&&(i=JSON.parse(c))}catch{}i||(i=q[4]),sessionStorage.setItem("satit_cmu_active_project",JSON.stringify(i)),T(i),O(i),G(i),A(i),window.addEventListener("satit-cmu-cloud-synced",()=>{const c=R.getProjectById(i.id);c&&(i=c,T(i)),A(i)});const r=e("#addActivityBtn");r&&S(r,"click",()=>{y({type:"info",title:"กำลังเปิดแบบฟอร์ม",message:`เปิดแบบฟอร์มขออนุมัติกิจกรรมสำหรับ "${i.title}"`}),setTimeout(()=>{window.location.href=`/activity-form.html?id=${encodeURIComponent(i.id)}&mode=new`},350)})});function G(a){const n=_(".status-filter-chip");n.forEach(i=>{i.addEventListener("click",()=>{B=i.getAttribute("data-filter")||"all",n.forEach(c=>c.classList.remove("is-active")),i.classList.add("is-active"),A(a)})})}function T(a){const n=e("#projectHeaderIcon"),i=e("#projectHeaderTitle"),r=e("#projectHeaderCode"),c=e("#projectHeaderYear"),h=e("#projectHeaderDept"),o=e("#projectHeaderActivitySubtitle"),t=e("#projectHeaderGrade"),s=e("#projectHeaderPerson"),l=e("#projectHeaderBudget"),p=e("#projectHeaderDateRange"),d=e("#projectHeaderLocation"),u=e("#projectHeaderCard"),m=e("#btnEditProject");if(n&&(n.textContent=a.icon||"📁"),i&&(i.textContent=a.title),r&&(r.textContent=a.code),c&&(c.textContent=`ปีงบประมาณ ${a.fiscalYear||"2569"}`),h&&(h.textContent=a.department||"โรงเรียนสาธิต มช."),o&&(o.textContent=a.activityName||"",o.style.display=a.activityName?"block":"none"),t&&(t.textContent=a.gradeLevel||"ทุกระดับชั้น"),s&&(s.textContent=a.responsiblePerson||"ไม่ระบุ"),l&&(l.textContent=`${(Number(a.budget)||0).toLocaleString()} บาท`),p&&(p.textContent=a.dateRange||"ตลอดปีการศึกษา"),d&&(d.textContent=a.location||"โรงเรียนสาธิต มช."),u&&a.themeColor&&u.style.setProperty("--project-theme",a.themeColor),m){const f=N.isAdmin();m.style.display=f?"inline-flex":"none"}}function A(a){const n=e("#activitiesGrid"),i=e("#activitiesCountBadge");if(!n)return;const r=U.getActivitiesByProject(a.id);i&&(i.textContent=`${r.length} กิจกรรม`),W(r);const c=B==="all"?r:r.filter(t=>t.status===B);if(r.length===0){n.innerHTML=`
      <div class="activities-empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">📋</div>
        <h4 style="font-family: var(--font-family-thai); font-size: var(--font-size-lg); font-weight: 700; margin-bottom: var(--space-2);">
          ยังไม่มีกิจกรรมที่ถูกบันทึกในโครงการนี้
        </h4>
        <p style="font-family: var(--font-family-thai); font-size: var(--font-size-sm); color: var(--text-muted); margin-bottom: var(--space-6);">
          กดปุ่ม "[เพิ่มกิจกรรม]" ด้านบนเพื่อเริ่มต้นกรอกแบบฟอร์มขออนุมัติบรรจุกิจกรรมตามแบบฟอร์ม Excel
        </p>
        <button type="button" class="btn btn-primary btn-sm" id="emptyAddBtn">
          <span>+ เพิ่มกิจกรรมใหม่</span>
        </button>
      </div>
    `;const t=e("#emptyAddBtn");t&&S(t,"click",()=>{window.location.href=`/activity-form.html?id=${encodeURIComponent(a.id)}&mode=new`});return}if(c.length===0){const t=L[B]||{label:"สถานะนี้"};n.innerHTML=`
      <div class="activities-empty-state" style="grid-column: 1 / -1; padding: var(--space-8) var(--space-4);">
        <div class="empty-state-icon" style="font-size: 1.5rem; width: 3.5rem; height: 3.5rem;">🔍</div>
        <h4 style="font-family: var(--font-family-thai); font-size: var(--font-size-base); font-weight: 700; margin-bottom: var(--space-2);">
          ไม่พบกิจกรรมที่มีสถานะ "${t.label}"
        </h4>
        <p style="font-family: var(--font-family-thai); font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: var(--space-4);">
          สามารถเลือกดูสถานะอื่น หรือเลือก "ทั้งหมด" เพื่อดูกิจกรรมทั้งหมด (${r.length} กิจกรรม)
        </p>
        <button type="button" class="btn btn-secondary btn-sm" id="btnResetFilter">
          <span>แสดงกิจกรรมทั้งหมด</span>
        </button>
      </div>
    `;const s=e("#btnResetFilter");s&&S(s,"click",()=>{B="all",_(".status-filter-chip").forEach(l=>{l.classList.toggle("is-active",l.getAttribute("data-filter")==="all")}),A(a)});return}const h=N.isAdmin(),o=N.getCurrentUser();n.innerHTML=c.map(t=>{var j,k,x,I;const s=L[t.status]||L.review,l=!!t.isLocked,p=!!(o&&(t.creatorId===o.id||((j=t.creatorEmail)==null?void 0:j.toLowerCase())===((k=o.email)==null?void 0:k.toLowerCase())||o.name&&(t.creatorName===o.name||t.responsiblePerson===o.name))),d=t.status==="edit",u=h||!l&&p||l&&p&&d;let m="";h?m=`
          <div class="activity-status-wrapper">
            <div class="activity-status-pill ${s.badgeClass}" title="👑 สิทธิ์แอดมิน: คลิกเพื่อเปลี่ยนสถานะกิจกรรม">
              <span class="status-dot"></span>
              <select class="activity-status-select" data-id="${t.id}" aria-label="สถานะกิจกรรม ${$(t.title)}">
                <option value="review" ${s.key==="review"?"selected":""}>รอตรวจ</option>
                <option value="in-progress" ${s.key==="in-progress"?"selected":""}>ดำเนินการ</option>
                <option value="edit" ${s.key==="edit"?"selected":""}>แก้ไข</option>
                <option value="completed" ${s.key==="completed"?"selected":""}>เสร็จสิ้น</option>
                <option value="cancelled" ${s.key==="cancelled"?"selected":""}>ยกเลิก</option>
              </select>
              <svg class="status-chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        `:m=`
          <div class="activity-status-wrapper">
            <div class="activity-status-pill ${s.badgeClass} is-locked" data-action="locked-status" data-id="${t.id}" title="🔒 เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเปลี่ยนสถานะได้ (สถานะปัจจุบัน: ${s.label})">
              <span class="status-dot"></span>
              <span class="status-locked-label">${s.label}</span>
              <span class="status-lock-icon" aria-hidden="true">🔒</span>
            </div>
          </div>
        `;let f="";u?f=`
          <button type="button" class="btn btn-primary btn-sm btn-edit-form" data-id="${t.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>แก้ไขแบบฟอร์ม</span>
          </button>
        `:f=`
          <button type="button" class="btn btn-secondary btn-sm btn-edit-form" data-id="${t.id}" title="เปิดดูแบบฟอร์ม (โหมดดูอย่างเดียว)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>ดูแบบฟอร์ม 🔒</span>
          </button>
        `;let g="";l&&d&&p?g='<span class="badge" style="background: rgba(249, 115, 22, 0.12); color: #ea580c; font-size: 0.68rem; font-weight: 700; border: 1px solid rgba(249, 115, 22, 0.3);">✏️ เปิดให้แก้ไข</span>':l&&(g='<span class="badge" style="background: rgba(239, 68, 68, 0.1); color: #dc2626; font-size: 0.68rem; font-weight: 700; border: 1px solid rgba(239, 68, 68, 0.25);">🔒 ล็อค</span>');const C=Array.isArray(t.selectedDocuments)?t.selectedDocuments:[];let E="";if(C.length>0){const H=C.map(v=>{let b="activity-doc-chip-other",w="📄",P=v;return v.includes("ขออนุญาติผู้ปกครอง")||v.includes("ขออนุญาตผู้ปกครอง")?(b="activity-doc-chip-parent",w="👨‍👩‍👦",P="ขออนุญาตผู้ปกครอง"):v.includes("นำนักเรียนเข้าสถานที่")||v.includes("เข้าสถานที่")?(b="activity-doc-chip-location",w="🏛️",P="ขอเข้าสถานที่"):v.includes("เป็นวิทยากร")||v.includes("วิทยากร")?(b="activity-doc-chip-speaker",w="🎤",P="ขอเชิญวิทยากร"):(v.startsWith("อื่น ๆ:")||v.startsWith("อื่นๆ:"))&&(b="activity-doc-chip-other",w="📝",P=v.replace(/^(อื่น ๆ:|อื่นๆ:)\s*/,"")),`
              <span class="activity-doc-chip ${b}" title="${$(v)}">
                <span>${w}</span>
                <span>${$(P)}</span>
              </span>
            `}).join("");E=`
          <div class="activity-docs-section" title="หนังสือราชการที่ขอออกเอกสารในกิจกรรมนี้">
            <div class="activity-docs-header">
              <span class="activity-docs-header-title">
                <span>📋</span>
                <span>หนังสือราชการที่ต้องการ</span>
              </span>
              <span class="badge badge-purple" style="font-size: 0.65rem; padding: 2px 7px; font-weight: 700;">${C.length} ฉบับ</span>
            </div>
            <div class="activity-docs-badges">
              ${H}
            </div>
          </div>
        `}else E="";return`
      <article class="activity-card" data-id="${t.id}" data-status="${s.key}">
        <div>
          <!-- Header พร้อมตัวเลือกสถานะ (แอดมินเปลี่ยนได้ / อาจารย์ดูได้อย่างเดียว) -->
          <div class="activity-card-header">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="activity-code-badge">${$(t.code)}</span>
              ${g}
            </div>
            ${m}
          </div>

          <!-- Activity Title -->
          <h4 class="activity-card-title">${$(t.title)}</h4>

          <!-- Metadata Grid -->
          <div class="activity-meta-grid">
            <div class="activity-meta-item">
              <span class="activity-meta-label">กำหนดการ</span>
              <span class="activity-meta-value">
                <span>📅</span>
                <span>${$(t.dateRange||"-")}</span>
              </span>
            </div>
            <div class="activity-meta-item">
              <span class="activity-meta-label">สถานที่</span>
              <span class="activity-meta-value">
                <span>📍</span>
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${$(t.location||"-")}</span>
              </span>
            </div>
            <div class="activity-meta-item">
              <span class="activity-meta-label">ผู้เข้าร่วม</span>
              <span class="activity-meta-value">
                <span>👥</span>
                <span>${((x=t.participants)==null?void 0:x.students)||0} คน (รวม ${((I=t.participants)==null?void 0:I.total)||0})</span>
              </span>
            </div>
            <div class="activity-meta-item">
              <span class="activity-meta-label">งบประมาณ</span>
              <span class="activity-meta-value" style="color: var(--cmu-purple-700); font-weight: 700;">
                <span>💰</span>
                <span>${(t.budget||0).toLocaleString()} บาท</span>
              </span>
            </div>
          </div>

          <!-- ข้อมูลหนังสือราชการที่ต้องการ -->
          ${E}

          ${t.creatorName?`
            <div style="margin-top: 8px; font-size: 0.72rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
              <span>👤 ผู้สร้าง: ${$(t.creatorName)}</span>
              ${p?'<span style="color: var(--cmu-purple-700); font-weight: 700;">(คุณ)</span>':""}
            </div>
          `:""}
        </div>

        <!-- Action Buttons -->
        <div class="activity-card-actions">
          ${f}
          <button type="button" class="btn btn-outline btn-sm btn-quick-word" data-id="${t.id}" title="สร้างเอกสาร Word ตามประเภทหนังสือที่ขอ (${C.length} ฉบับ)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span>สร้าง Word</span>
          </button>
        </div>
      </article>
    `}).join(""),h?n.querySelectorAll(".activity-status-select").forEach(t=>{t.addEventListener("change",s=>{s.stopPropagation();const l=t.getAttribute("data-id"),p=t.value,d=U.updateActivityStatus(l,p);if(d&&d.success){const u=L[p]||L.review;y({type:"success",title:"แอดมินอัปเดตสถานะกิจกรรมสำเร็จ 👑",message:`ปรับสถานะเป็น "${u.label}" เรียบร้อยแล้ว`}),A(a)}else y({type:"error",title:"ไม่สามารถเปลี่ยนสถานะได้",message:(d==null?void 0:d.message)||"เฉพาะแอดมินเท่านั้นที่สามารถเปลี่ยนสถานะได้"})})}):n.querySelectorAll(".activity-status-pill.is-locked").forEach(t=>{t.addEventListener("click",s=>{s.stopPropagation(),y({type:"warning",title:"สถานะถูกล็อค 🔒",message:"คุณไม่มีสิทธิ์: เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถกำหนดหรือเปลี่ยนสถานะกิจกรรมได้"})})}),n.querySelectorAll(".btn-edit-form").forEach(t=>{t.addEventListener("click",()=>{const s=t.getAttribute("data-id");window.location.href=`/activity-form.html?id=${encodeURIComponent(a.id)}&actId=${encodeURIComponent(s)}`})}),n.querySelectorAll(".btn-quick-word").forEach(t=>{t.addEventListener("click",s=>{s.stopPropagation();const l=t.getAttribute("data-id");window.location.href=`/activity-form.html?id=${encodeURIComponent(a.id)}&actId=${encodeURIComponent(l)}&openWord=1`})})}function O(a){const n=e("#editProjectModal");if(!n)return;const i=F(n,{staticBackdrop:!0}),r=e("#btnEditProject"),c=e("#btnSaveProject"),h=()=>{const o=R.getProjectById(a.id),t=e("#editProjectTitle"),s=e("#editProjectActivityName"),l=e("#editProjectResponsiblePerson"),p=e("#editProjectBudget"),d=e("#editProjectGradeLevel"),u=e("#editProjectDateRange"),m=e("#editProjectLocation"),f=e("#editProjectDepartment"),g=e("#editProjectFiscalYear");t&&(t.value=o.title||""),s&&(s.value=o.activityName||""),l&&(l.value=o.responsiblePerson||""),p&&(p.value=o.budget||0),d&&(d.value=o.gradeLevel||""),u&&(u.value=o.dateRange||""),m&&(m.value=o.location||""),f&&(f.value=o.department||""),g&&(g.value=o.fiscalYear||"2569")};r&&S(r,"click",o=>{o.preventDefault(),h(),i.open();const t=e("#editProjectTitle");t&&setTimeout(()=>t.focus(),100)}),c&&S(c,"click",()=>{var C,E,j,k,x,I,H,v,b,w,P,M,z,D;const o=(C=e("#editProjectTitle"))==null?void 0:C.value.trim(),t=(E=e("#editProjectActivityName"))==null?void 0:E.value.trim(),s=(j=e("#editProjectResponsiblePerson"))==null?void 0:j.value.trim(),l=(k=e("#editProjectBudget"))==null?void 0:k.value,p=(x=e("#editProjectGradeLevel"))==null?void 0:x.value.trim(),d=(I=e("#editProjectDateRange"))==null?void 0:I.value.trim(),u=(H=e("#editProjectLocation"))==null?void 0:H.value.trim(),m=(v=e("#editProjectDepartment"))==null?void 0:v.value.trim(),f=(b=e("#editProjectFiscalYear"))==null?void 0:b.value.trim();if(!o){y({type:"warning",title:"กรุณากรอกชื่อโครงการ",message:"ชื่อโครงการต้องไม่เป็นค่าว่าง"}),(w=e("#editProjectTitle"))==null||w.focus();return}if(!s){y({type:"warning",title:"กรุณากรอกผู้รับผิดชอบ",message:"กรุณาระบุชื่ออาจารย์ผู้รับผิดชอบโครงการ"}),(P=e("#editProjectResponsiblePerson"))==null||P.focus();return}if(l===""||isNaN(Number(l))){y({type:"warning",title:"กรุณากรอกงบประมาณ",message:"กรุณาระบุจำนวนงบประมาณเป็นตัวเลข"}),(M=e("#editProjectBudget"))==null||M.focus();return}if(!p){y({type:"warning",title:"กรุณากรอกกลุ่มเป้าหมาย",message:"กรุณาระบุระดับชั้นหรือกลุ่มเป้าหมายผู้เข้าร่วม"}),(z=e("#editProjectGradeLevel"))==null||z.focus();return}if(!d){y({type:"warning",title:"กรุณากรอกกำหนดการ",message:"กรุณาระบุช่วงวันและเวลาจัดโครงการ"}),(D=e("#editProjectDateRange"))==null||D.focus();return}const g=R.updateProject(a.id,{title:o,activityName:t,responsiblePerson:s,budget:Number(l),gradeLevel:p,dateRange:d,location:u,department:m,fiscalYear:f||"2569"});g&&(Object.assign(a,g),T(a),A(a),y({type:"success",title:"บันทึกโครงการสำเร็จ! ✨",message:`อัปเดตข้อมูลโครงการ "${g.title}" เรียบร้อยแล้ว`}),i.close())})}function W(a){const n=(i,r)=>{const c=document.getElementById(i);c&&(c.textContent=String(r))};n("countAll",a.length),n("countReview",a.filter(i=>i.status==="review").length),n("countProgress",a.filter(i=>i.status==="in-progress").length),n("countEdit",a.filter(i=>i.status==="edit").length),n("countCompleted",a.filter(i=>i.status==="completed").length),n("countCancelled",a.filter(i=>i.status==="cancelled").length)}
