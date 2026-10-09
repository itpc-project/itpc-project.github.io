import{$ as e,a as A,s as g,b as F,A as x,e as b,i as U}from"./modal-CRjSveqs.js";/* empty css              */import{i as Y}from"./navbar-LLI8q1FF.js";import{P as k,S as G,A as D,a as E}from"./activity-service-9m2hQTaj.js";let j="all";document.addEventListener("DOMContentLoaded",()=>{Y();const n=new URLSearchParams(window.location.search).get("id");let i=null;if(n)i=k.getProjectById(n);else try{const l=sessionStorage.getItem("satit_cmu_active_project");l&&(i=JSON.parse(l))}catch{}i||(i=G[4]),sessionStorage.setItem("satit_cmu_active_project",JSON.stringify(i)),L(i),q(i),O(i),h(i),window.addEventListener("satit-cmu-cloud-synced",()=>{const l=k.getProjectById(i.id);l&&(i=l,L(i)),h(i)});const c=e("#addActivityBtn");c&&A(c,"click",()=>{g({type:"info",title:"กำลังเปิดแบบฟอร์ม",message:`เปิดแบบฟอร์มขออนุมัติกิจกรรมสำหรับ "${i.title}"`}),setTimeout(()=>{window.location.href=`/activity-form.html?id=${encodeURIComponent(i.id)}&mode=new`},350)})});function O(a){const n=F(".status-filter-chip");n.forEach(i=>{i.addEventListener("click",()=>{j=i.getAttribute("data-filter")||"all",n.forEach(l=>l.classList.remove("is-active")),i.classList.add("is-active"),h(a)})})}function L(a){const n=e("#projectHeaderIcon"),i=e("#projectHeaderTitle"),c=e("#projectHeaderCode"),l=e("#projectHeaderYear"),y=e("#projectHeaderDept"),o=e("#projectHeaderActivitySubtitle"),t=e("#projectHeaderGrade"),s=e("#projectHeaderPerson"),r=e("#projectHeaderBudget"),p=e("#projectHeaderDateRange"),d=e("#projectHeaderLocation"),v=e("#projectHeaderCard"),u=e("#btnEditProject");if(n&&(n.textContent=a.icon||"📁"),i&&(i.textContent=a.title),c&&(c.textContent=a.code),l&&(l.textContent=`ปีงบประมาณ ${a.fiscalYear||"2569"}`),y&&(y.textContent=a.department||"โรงเรียนสาธิต มช."),o&&(o.textContent=a.activityName||"",o.style.display=a.activityName?"block":"none"),t&&(t.textContent=a.gradeLevel||"ทุกระดับชั้น"),s&&(s.textContent=a.responsiblePerson||"ไม่ระบุ"),r&&(r.textContent=`${(Number(a.budget)||0).toLocaleString()} บาท`),p&&(p.textContent=a.dateRange||"ตลอดปีการศึกษา"),d&&(d.textContent=a.location||"โรงเรียนสาธิต มช."),v&&a.themeColor&&v.style.setProperty("--project-theme",a.themeColor),u){const m=x.isAdmin();u.style.display=m?"inline-flex":"none"}}function h(a){const n=e("#activitiesGrid"),i=e("#activitiesCountBadge");if(!n)return;const c=D.getActivitiesByProject(a.id);i&&(i.textContent=`${c.length} กิจกรรม`),J(c);const l=j==="all"?c:c.filter(t=>t.status===j);if(c.length===0){n.innerHTML=`
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
    `;const t=e("#emptyAddBtn");t&&A(t,"click",()=>{window.location.href=`/activity-form.html?id=${encodeURIComponent(a.id)}&mode=new`});return}if(l.length===0){const t=E[j]||{label:"สถานะนี้"};n.innerHTML=`
      <div class="activities-empty-state" style="grid-column: 1 / -1; padding: var(--space-8) var(--space-4);">
        <div class="empty-state-icon" style="font-size: 1.5rem; width: 3.5rem; height: 3.5rem;">🔍</div>
        <h4 style="font-family: var(--font-family-thai); font-size: var(--font-size-base); font-weight: 700; margin-bottom: var(--space-2);">
          ไม่พบกิจกรรมที่มีสถานะ "${t.label}"
        </h4>
        <p style="font-family: var(--font-family-thai); font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: var(--space-4);">
          สามารถเลือกดูสถานะอื่น หรือเลือก "ทั้งหมด" เพื่อดูกิจกรรมทั้งหมด (${c.length} กิจกรรม)
        </p>
        <button type="button" class="btn btn-secondary btn-sm" id="btnResetFilter">
          <span>แสดงกิจกรรมทั้งหมด</span>
        </button>
      </div>
    `;const s=e("#btnResetFilter");s&&A(s,"click",()=>{j="all",F(".status-filter-chip").forEach(r=>{r.classList.toggle("is-active",r.getAttribute("data-filter")==="all")}),h(a)});return}const y=x.isAdmin(),o=x.getCurrentUser();n.innerHTML=l.map(t=>{var P,w,$,C;const s=E[t.status]||E.review,r=!!t.isLocked,p=!!(o&&(t.creatorId===o.id||((P=t.creatorEmail)==null?void 0:P.toLowerCase())===((w=o.email)==null?void 0:w.toLowerCase())||o.name&&(t.creatorName===o.name||t.responsiblePerson===o.name))),d=t.status==="edit",v=y||!r&&p||r&&p&&d;let u="";y?u=`
          <div class="activity-status-wrapper">
            <div class="activity-status-pill ${s.badgeClass}" title="👑 สิทธิ์แอดมิน: คลิกเพื่อเปลี่ยนสถานะกิจกรรม">
              <span class="status-dot"></span>
              <select class="activity-status-select" data-id="${t.id}" aria-label="สถานะกิจกรรม ${b(t.title)}">
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
        `:u=`
          <div class="activity-status-wrapper">
            <div class="activity-status-pill ${s.badgeClass} is-locked" data-action="locked-status" data-id="${t.id}" title="🔒 เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเปลี่ยนสถานะได้ (สถานะปัจจุบัน: ${s.label})">
              <span class="status-dot"></span>
              <span class="status-locked-label">${s.label}</span>
              <span class="status-lock-icon" aria-hidden="true">🔒</span>
            </div>
          </div>
        `;let m="";v?m=`
          <button type="button" class="btn btn-primary btn-sm btn-edit-form" data-id="${t.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>แก้ไขแบบฟอร์ม</span>
          </button>
        `:m=`
          <button type="button" class="btn btn-secondary btn-sm btn-edit-form" data-id="${t.id}" title="เปิดดูแบบฟอร์ม (โหมดดูอย่างเดียว)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>ดูแบบฟอร์ม 🔒</span>
          </button>
        `;let f="";return r&&d&&p?f='<span class="badge" style="background: rgba(249, 115, 22, 0.12); color: #ea580c; font-size: 0.68rem; font-weight: 700; border: 1px solid rgba(249, 115, 22, 0.3);">✏️ เปิดให้แก้ไข</span>':r&&(f='<span class="badge" style="background: rgba(239, 68, 68, 0.1); color: #dc2626; font-size: 0.68rem; font-weight: 700; border: 1px solid rgba(239, 68, 68, 0.25);">🔒 ล็อค</span>'),`
      <article class="activity-card" data-id="${t.id}" data-status="${s.key}">
        <div>
          <!-- Header พร้อมตัวเลือกสถานะ (แอดมินเปลี่ยนได้ / อาจารย์ดูได้อย่างเดียว) -->
          <div class="activity-card-header">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="activity-code-badge">${b(t.code)}</span>
              ${f}
            </div>
            ${u}
          </div>

          <!-- Activity Title -->
          <h4 class="activity-card-title">${b(t.title)}</h4>

          <!-- Metadata Grid -->
          <div class="activity-meta-grid">
            <div class="activity-meta-item">
              <span class="activity-meta-label">กำหนดการ</span>
              <span class="activity-meta-value">
                <span>📅</span>
                <span>${b(t.dateRange||"-")}</span>
              </span>
            </div>
            <div class="activity-meta-item">
              <span class="activity-meta-label">สถานที่</span>
              <span class="activity-meta-value">
                <span>📍</span>
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${b(t.location||"-")}</span>
              </span>
            </div>
            <div class="activity-meta-item">
              <span class="activity-meta-label">ผู้เข้าร่วม</span>
              <span class="activity-meta-value">
                <span>👥</span>
                <span>${(($=t.participants)==null?void 0:$.students)||0} คน (รวม ${((C=t.participants)==null?void 0:C.total)||0})</span>
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
          ${t.creatorName?`
            <div style="margin-top: 8px; font-size: 0.72rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
              <span>👤 ผู้สร้าง: ${b(t.creatorName)}</span>
              ${p?'<span style="color: var(--cmu-purple-700); font-weight: 700;">(คุณ)</span>':""}
            </div>
          `:""}
        </div>

        <!-- Action Buttons -->
        <div class="activity-card-actions">
          ${m}
        </div>
      </article>
    `}).join(""),y?n.querySelectorAll(".activity-status-select").forEach(t=>{t.addEventListener("change",s=>{s.stopPropagation();const r=t.getAttribute("data-id"),p=t.value,d=D.updateActivityStatus(r,p);if(d&&d.success){const v=E[p]||E.review;g({type:"success",title:"แอดมินอัปเดตสถานะกิจกรรมสำเร็จ 👑",message:`ปรับสถานะเป็น "${v.label}" เรียบร้อยแล้ว`}),h(a)}else g({type:"error",title:"ไม่สามารถเปลี่ยนสถานะได้",message:(d==null?void 0:d.message)||"เฉพาะแอดมินเท่านั้นที่สามารถเปลี่ยนสถานะได้"})})}):n.querySelectorAll(".activity-status-pill.is-locked").forEach(t=>{t.addEventListener("click",s=>{s.stopPropagation(),g({type:"warning",title:"สถานะถูกล็อค 🔒",message:"คุณไม่มีสิทธิ์: เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถกำหนดหรือเปลี่ยนสถานะกิจกรรมได้"})})}),n.querySelectorAll(".btn-edit-form").forEach(t=>{t.addEventListener("click",()=>{const s=t.getAttribute("data-id");window.location.href=`/activity-form.html?id=${encodeURIComponent(a.id)}&actId=${encodeURIComponent(s)}`})})}function q(a){const n=e("#editProjectModal");if(!n)return;const i=U(n,{staticBackdrop:!0}),c=e("#btnEditProject"),l=e("#btnSaveProject"),y=()=>{const o=k.getProjectById(a.id),t=e("#editProjectTitle"),s=e("#editProjectActivityName"),r=e("#editProjectResponsiblePerson"),p=e("#editProjectBudget"),d=e("#editProjectGradeLevel"),v=e("#editProjectDateRange"),u=e("#editProjectLocation"),m=e("#editProjectDepartment"),f=e("#editProjectFiscalYear");t&&(t.value=o.title||""),s&&(s.value=o.activityName||""),r&&(r.value=o.responsiblePerson||""),p&&(p.value=o.budget||0),d&&(d.value=o.gradeLevel||""),v&&(v.value=o.dateRange||""),u&&(u.value=o.location||""),m&&(m.value=o.department||""),f&&(f.value=o.fiscalYear||"2569")};c&&A(c,"click",o=>{o.preventDefault(),y(),i.open();const t=e("#editProjectTitle");t&&setTimeout(()=>t.focus(),100)}),l&&A(l,"click",()=>{var P,w,$,C,I,B,S,H,N,T,R,M,z,_;const o=(P=e("#editProjectTitle"))==null?void 0:P.value.trim(),t=(w=e("#editProjectActivityName"))==null?void 0:w.value.trim(),s=($=e("#editProjectResponsiblePerson"))==null?void 0:$.value.trim(),r=(C=e("#editProjectBudget"))==null?void 0:C.value,p=(I=e("#editProjectGradeLevel"))==null?void 0:I.value.trim(),d=(B=e("#editProjectDateRange"))==null?void 0:B.value.trim(),v=(S=e("#editProjectLocation"))==null?void 0:S.value.trim(),u=(H=e("#editProjectDepartment"))==null?void 0:H.value.trim(),m=(N=e("#editProjectFiscalYear"))==null?void 0:N.value.trim();if(!o){g({type:"warning",title:"กรุณากรอกชื่อโครงการ",message:"ชื่อโครงการต้องไม่เป็นค่าว่าง"}),(T=e("#editProjectTitle"))==null||T.focus();return}if(!s){g({type:"warning",title:"กรุณากรอกผู้รับผิดชอบ",message:"กรุณาระบุชื่ออาจารย์ผู้รับผิดชอบโครงการ"}),(R=e("#editProjectResponsiblePerson"))==null||R.focus();return}if(r===""||isNaN(Number(r))){g({type:"warning",title:"กรุณากรอกงบประมาณ",message:"กรุณาระบุจำนวนงบประมาณเป็นตัวเลข"}),(M=e("#editProjectBudget"))==null||M.focus();return}if(!p){g({type:"warning",title:"กรุณากรอกกลุ่มเป้าหมาย",message:"กรุณาระบุระดับชั้นหรือกลุ่มเป้าหมายผู้เข้าร่วม"}),(z=e("#editProjectGradeLevel"))==null||z.focus();return}if(!d){g({type:"warning",title:"กรุณากรอกกำหนดการ",message:"กรุณาระบุช่วงวันและเวลาจัดโครงการ"}),(_=e("#editProjectDateRange"))==null||_.focus();return}const f=k.updateProject(a.id,{title:o,activityName:t,responsiblePerson:s,budget:Number(r),gradeLevel:p,dateRange:d,location:v,department:u,fiscalYear:m||"2569"});f&&(Object.assign(a,f),L(a),h(a),g({type:"success",title:"บันทึกโครงการสำเร็จ! ✨",message:`อัปเดตข้อมูลโครงการ "${f.title}" เรียบร้อยแล้ว`}),i.close())})}function J(a){const n=(i,c)=>{const l=document.getElementById(i);l&&(l.textContent=String(c))};n("countAll",a.length),n("countReview",a.filter(i=>i.status==="review").length),n("countProgress",a.filter(i=>i.status==="in-progress").length),n("countEdit",a.filter(i=>i.status==="edit").length),n("countCompleted",a.filter(i=>i.status==="completed").length),n("countCancelled",a.filter(i=>i.status==="cancelled").length)}
