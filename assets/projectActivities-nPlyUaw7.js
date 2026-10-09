import{$ as e,a as j,s as v,b as D,A as F,e as h,i as Y}from"./modal-p2G16e7R.js";import{i as G}from"./navbar-CjFqYHRh.js";import{P as $,S as U,A as z,a as P}from"./activity-service-Cg2JPrTs.js";let w="all";document.addEventListener("DOMContentLoaded",()=>{G();const n=new URLSearchParams(window.location.search).get("id");let i=null;if(n)i=$.getProjectById(n);else try{const o=sessionStorage.getItem("satit_cmu_active_project");o&&(i=JSON.parse(o))}catch{}i||(i=U[4]),sessionStorage.setItem("satit_cmu_active_project",JSON.stringify(i)),E(i),q(i),O(i),b(i),window.addEventListener("satit-cmu-cloud-synced",()=>{const o=$.getProjectById(i.id);o&&(i=o,E(i)),b(i)});const l=e("#addActivityBtn");l&&j(l,"click",()=>{v({type:"info",title:"กำลังเปิดแบบฟอร์ม",message:`เปิดแบบฟอร์มขออนุมัติกิจกรรมสำหรับ "${i.title}"`}),setTimeout(()=>{window.location.href=`/activity-form.html?id=${encodeURIComponent(i.id)}&mode=new`},350)})});function O(a){const n=D(".status-filter-chip");n.forEach(i=>{i.addEventListener("click",()=>{w=i.getAttribute("data-filter")||"all",n.forEach(o=>o.classList.remove("is-active")),i.classList.add("is-active"),b(a)})})}function E(a){const n=e("#projectHeaderIcon"),i=e("#projectHeaderTitle"),l=e("#projectHeaderCode"),o=e("#projectHeaderYear"),u=e("#projectHeaderDept"),t=e("#projectHeaderActivitySubtitle"),s=e("#projectHeaderGrade"),c=e("#projectHeaderPerson"),d=e("#projectHeaderBudget"),r=e("#projectHeaderDateRange"),p=e("#projectHeaderLocation"),m=e("#projectHeaderCard"),f=e("#btnEditProject");if(n&&(n.textContent=a.icon||"📁"),i&&(i.textContent=a.title),l&&(l.textContent=a.code),o&&(o.textContent=`ปีงบประมาณ ${a.fiscalYear||"2569"}`),u&&(u.textContent=a.department||"โรงเรียนสาธิต มช."),t&&(t.textContent=a.activityName||"",t.style.display=a.activityName?"block":"none"),s&&(s.textContent=a.gradeLevel||"ทุกระดับชั้น"),c&&(c.textContent=a.responsiblePerson||"ไม่ระบุ"),d&&(d.textContent=`${(Number(a.budget)||0).toLocaleString()} บาท`),r&&(r.textContent=a.dateRange||"ตลอดปีการศึกษา"),p&&(p.textContent=a.location||"โรงเรียนสาธิต มช."),m&&a.themeColor&&m.style.setProperty("--project-theme",a.themeColor),f){const y=F.isAdmin();f.style.display=y?"inline-flex":"none"}}function b(a){const n=e("#activitiesGrid"),i=e("#activitiesCountBadge");if(!n)return;const l=z.getActivitiesByProject(a.id);i&&(i.textContent=`${l.length} กิจกรรม`),J(l);const o=w==="all"?l:l.filter(t=>t.status===w);if(l.length===0){n.innerHTML=`
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
    `;const t=e("#emptyAddBtn");t&&j(t,"click",()=>{window.location.href=`/activity-form.html?id=${encodeURIComponent(a.id)}&mode=new`});return}if(o.length===0){const t=P[w]||{label:"สถานะนี้"};n.innerHTML=`
      <div class="activities-empty-state" style="grid-column: 1 / -1; padding: var(--space-8) var(--space-4);">
        <div class="empty-state-icon" style="font-size: 1.5rem; width: 3.5rem; height: 3.5rem;">🔍</div>
        <h4 style="font-family: var(--font-family-thai); font-size: var(--font-size-base); font-weight: 700; margin-bottom: var(--space-2);">
          ไม่พบกิจกรรมที่มีสถานะ "${t.label}"
        </h4>
        <p style="font-family: var(--font-family-thai); font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: var(--space-4);">
          สามารถเลือกดูสถานะอื่น หรือเลือก "ทั้งหมด" เพื่อดูกิจกรรมทั้งหมด (${l.length} กิจกรรม)
        </p>
        <button type="button" class="btn btn-secondary btn-sm" id="btnResetFilter">
          <span>แสดงกิจกรรมทั้งหมด</span>
        </button>
      </div>
    `;const s=e("#btnResetFilter");s&&j(s,"click",()=>{w="all",D(".status-filter-chip").forEach(c=>{c.classList.toggle("is-active",c.getAttribute("data-filter")==="all")}),b(a)});return}const u=F.isAdmin();n.innerHTML=o.map(t=>{var d,r;const s=P[t.status]||P.review;let c="";return u?c=`
          <div class="activity-status-wrapper">
            <div class="activity-status-pill ${s.badgeClass}" title="👑 สิทธิ์แอดมิน: คลิกเพื่อเปลี่ยนสถานะกิจกรรม">
              <span class="status-dot"></span>
              <select class="activity-status-select" data-id="${t.id}" aria-label="สถานะกิจกรรม ${h(t.title)}">
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
        `:c=`
          <div class="activity-status-wrapper">
            <div class="activity-status-pill ${s.badgeClass} is-locked" data-action="locked-status" data-id="${t.id}" title="🔒 เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเปลี่ยนสถานะได้ (สถานะปัจจุบัน: ${s.label})">
              <span class="status-dot"></span>
              <span class="status-locked-label">${s.label}</span>
              <span class="status-lock-icon" aria-hidden="true">🔒</span>
            </div>
          </div>
        `,`
      <article class="activity-card" data-id="${t.id}" data-status="${s.key}">
        <div>
          <!-- Header พร้อมตัวเลือกสถานะ (แอดมินเปลี่ยนได้ / อาจารย์ดูได้อย่างเดียว) -->
          <div class="activity-card-header">
            <span class="activity-code-badge">${h(t.code)}</span>
            ${c}
          </div>

          <!-- Activity Title -->
          <h4 class="activity-card-title">${h(t.title)}</h4>

          <!-- Metadata Grid -->
          <div class="activity-meta-grid">
            <div class="activity-meta-item">
              <span class="activity-meta-label">กำหนดการ</span>
              <span class="activity-meta-value">
                <span>📅</span>
                <span>${h(t.dateRange||"-")}</span>
              </span>
            </div>
            <div class="activity-meta-item">
              <span class="activity-meta-label">สถานที่</span>
              <span class="activity-meta-value">
                <span>📍</span>
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${h(t.location||"-")}</span>
              </span>
            </div>
            <div class="activity-meta-item">
              <span class="activity-meta-label">ผู้เข้าร่วม</span>
              <span class="activity-meta-value">
                <span>👥</span>
                <span>${((d=t.participants)==null?void 0:d.students)||0} คน (รวม ${((r=t.participants)==null?void 0:r.total)||0})</span>
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
        </div>

        <!-- Action Buttons -->
        <div class="activity-card-actions">
          <button type="button" class="btn btn-primary btn-sm btn-edit-form" data-id="${t.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <polyline points="13 8 17 12 13 16"></polyline>
            </svg>
            <span>เปิดแบบฟอร์ม</span>
          </button>
        </div>
      </article>
    `}).join(""),u?n.querySelectorAll(".activity-status-select").forEach(t=>{t.addEventListener("change",s=>{s.stopPropagation();const c=t.getAttribute("data-id"),d=t.value,r=z.updateActivityStatus(c,d);if(r&&r.success){const p=P[d]||P.review;v({type:"success",title:"แอดมินอัปเดตสถานะกิจกรรมสำเร็จ 👑",message:`ปรับสถานะเป็น "${p.label}" เรียบร้อยแล้ว`}),b(a)}else v({type:"error",title:"ไม่สามารถเปลี่ยนสถานะได้",message:(r==null?void 0:r.message)||"เฉพาะแอดมินเท่านั้นที่สามารถเปลี่ยนสถานะได้"})})}):n.querySelectorAll(".activity-status-pill.is-locked").forEach(t=>{t.addEventListener("click",s=>{s.stopPropagation(),v({type:"warning",title:"สถานะถูกล็อค 🔒",message:"คุณไม่มีสิทธิ์: เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถกำหนดหรือเปลี่ยนสถานะกิจกรรมได้"})})}),n.querySelectorAll(".btn-edit-form").forEach(t=>{t.addEventListener("click",()=>{const s=t.getAttribute("data-id");window.location.href=`/activity-form.html?id=${encodeURIComponent(a.id)}&actId=${encodeURIComponent(s)}`})})}function q(a){const n=e("#editProjectModal");if(!n)return;const i=Y(n,{staticBackdrop:!0}),l=e("#btnEditProject"),o=e("#btnSaveProject"),u=()=>{const t=$.getProjectById(a.id),s=e("#editProjectTitle"),c=e("#editProjectActivityName"),d=e("#editProjectResponsiblePerson"),r=e("#editProjectBudget"),p=e("#editProjectGradeLevel"),m=e("#editProjectDateRange"),f=e("#editProjectLocation"),y=e("#editProjectDepartment"),g=e("#editProjectFiscalYear");s&&(s.value=t.title||""),c&&(c.value=t.activityName||""),d&&(d.value=t.responsiblePerson||""),r&&(r.value=t.budget||0),p&&(p.value=t.gradeLevel||""),m&&(m.value=t.dateRange||""),f&&(f.value=t.location||""),y&&(y.value=t.department||""),g&&(g.value=t.fiscalYear||"2569")};l&&j(l,"click",t=>{t.preventDefault(),u(),i.open();const s=e("#editProjectTitle");s&&setTimeout(()=>s.focus(),100)}),o&&j(o,"click",()=>{var A,C,I,L,k,x,S,B,H,T,R,N,M,_;const t=(A=e("#editProjectTitle"))==null?void 0:A.value.trim(),s=(C=e("#editProjectActivityName"))==null?void 0:C.value.trim(),c=(I=e("#editProjectResponsiblePerson"))==null?void 0:I.value.trim(),d=(L=e("#editProjectBudget"))==null?void 0:L.value,r=(k=e("#editProjectGradeLevel"))==null?void 0:k.value.trim(),p=(x=e("#editProjectDateRange"))==null?void 0:x.value.trim(),m=(S=e("#editProjectLocation"))==null?void 0:S.value.trim(),f=(B=e("#editProjectDepartment"))==null?void 0:B.value.trim(),y=(H=e("#editProjectFiscalYear"))==null?void 0:H.value.trim();if(!t){v({type:"warning",title:"กรุณากรอกชื่อโครงการ",message:"ชื่อโครงการต้องไม่เป็นค่าว่าง"}),(T=e("#editProjectTitle"))==null||T.focus();return}if(!c){v({type:"warning",title:"กรุณากรอกผู้รับผิดชอบ",message:"กรุณาระบุชื่ออาจารย์ผู้รับผิดชอบโครงการ"}),(R=e("#editProjectResponsiblePerson"))==null||R.focus();return}if(d===""||isNaN(Number(d))){v({type:"warning",title:"กรุณากรอกงบประมาณ",message:"กรุณาระบุจำนวนงบประมาณเป็นตัวเลข"}),(N=e("#editProjectBudget"))==null||N.focus();return}if(!r){v({type:"warning",title:"กรุณากรอกกลุ่มเป้าหมาย",message:"กรุณาระบุระดับชั้นหรือกลุ่มเป้าหมายผู้เข้าร่วม"}),(M=e("#editProjectGradeLevel"))==null||M.focus();return}if(!p){v({type:"warning",title:"กรุณากรอกกำหนดการ",message:"กรุณาระบุช่วงวันและเวลาจัดโครงการ"}),(_=e("#editProjectDateRange"))==null||_.focus();return}const g=$.updateProject(a.id,{title:t,activityName:s,responsiblePerson:c,budget:Number(d),gradeLevel:r,dateRange:p,location:m,department:f,fiscalYear:y||"2569"});g&&(Object.assign(a,g),E(a),b(a),v({type:"success",title:"บันทึกโครงการสำเร็จ! ✨",message:`อัปเดตข้อมูลโครงการ "${g.title}" เรียบร้อยแล้ว`}),i.close())})}function J(a){const n=(i,l)=>{const o=document.getElementById(i);o&&(o.textContent=String(l))};n("countAll",a.length),n("countReview",a.filter(i=>i.status==="review").length),n("countProgress",a.filter(i=>i.status==="in-progress").length),n("countEdit",a.filter(i=>i.status==="edit").length),n("countCompleted",a.filter(i=>i.status==="completed").length),n("countCancelled",a.filter(i=>i.status==="cancelled").length)}
