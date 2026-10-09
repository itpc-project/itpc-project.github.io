import{$ as e,a as w,s as v,b as z,A as D,e as b}from"./auth-service-C-dmPdyf.js";import{i as Y}from"./navbar-C2ItTa6r.js";import{i as G}from"./modal-DXILHliY.js";import{P as j,S as U,A as _,a as h}from"./activity-service-DG0vMjhY.js";let P="all";document.addEventListener("DOMContentLoaded",()=>{Y();const n=new URLSearchParams(window.location.search).get("id");let a=null;if(n)a=j.getProjectById(n);else try{const r=sessionStorage.getItem("satit_cmu_active_project");r&&(a=JSON.parse(r))}catch{}a||(a=U[4]),sessionStorage.setItem("satit_cmu_active_project",JSON.stringify(a)),F(a),q(a),O(a),$(a);const o=e("#addActivityBtn");o&&w(o,"click",()=>{v({type:"info",title:"กำลังเปิดแบบฟอร์ม",message:`เปิดแบบฟอร์มขออนุมัติกิจกรรมสำหรับ "${a.title}"`}),setTimeout(()=>{window.location.href=`/activity-form.html?id=${encodeURIComponent(a.id)}&mode=new`},350)})});function O(i){const n=z(".status-filter-chip");n.forEach(a=>{a.addEventListener("click",()=>{P=a.getAttribute("data-filter")||"all",n.forEach(r=>r.classList.remove("is-active")),a.classList.add("is-active"),$(i)})})}function F(i){const n=e("#projectHeaderIcon"),a=e("#projectHeaderTitle"),o=e("#projectHeaderCode"),r=e("#projectHeaderYear"),u=e("#projectHeaderDept"),t=e("#projectHeaderActivitySubtitle"),s=e("#projectHeaderGrade"),l=e("#projectHeaderPerson"),d=e("#projectHeaderBudget"),c=e("#projectHeaderDateRange"),p=e("#projectHeaderLocation"),m=e("#projectHeaderCard"),f=e("#btnEditProject");if(n&&(n.textContent=i.icon||"📁"),a&&(a.textContent=i.title),o&&(o.textContent=i.code),r&&(r.textContent=`ปีงบประมาณ ${i.fiscalYear||"2569"}`),u&&(u.textContent=i.department||"โรงเรียนสาธิต มช."),t&&(t.textContent=i.activityName||"",t.style.display=i.activityName?"block":"none"),s&&(s.textContent=i.gradeLevel||"ทุกระดับชั้น"),l&&(l.textContent=i.responsiblePerson||"ไม่ระบุ"),d&&(d.textContent=`${(Number(i.budget)||0).toLocaleString()} บาท`),c&&(c.textContent=i.dateRange||"ตลอดปีการศึกษา"),p&&(p.textContent=i.location||"โรงเรียนสาธิต มช."),m&&i.themeColor&&m.style.setProperty("--project-theme",i.themeColor),f){const y=D.isAdmin();f.style.display=y?"inline-flex":"none"}}function $(i){const n=e("#activitiesGrid"),a=e("#activitiesCountBadge");if(!n)return;const o=_.getActivitiesByProject(i.id);a&&(a.textContent=`${o.length} กิจกรรม`),J(o);const r=P==="all"?o:o.filter(t=>t.status===P);if(o.length===0){n.innerHTML=`
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
    `;const t=e("#emptyAddBtn");t&&w(t,"click",()=>{window.location.href=`/activity-form.html?id=${encodeURIComponent(i.id)}&mode=new`});return}if(r.length===0){const t=h[P]||{label:"สถานะนี้"};n.innerHTML=`
      <div class="activities-empty-state" style="grid-column: 1 / -1; padding: var(--space-8) var(--space-4);">
        <div class="empty-state-icon" style="font-size: 1.5rem; width: 3.5rem; height: 3.5rem;">🔍</div>
        <h4 style="font-family: var(--font-family-thai); font-size: var(--font-size-base); font-weight: 700; margin-bottom: var(--space-2);">
          ไม่พบกิจกรรมที่มีสถานะ "${t.label}"
        </h4>
        <p style="font-family: var(--font-family-thai); font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: var(--space-4);">
          สามารถเลือกดูสถานะอื่น หรือเลือก "ทั้งหมด" เพื่อดูกิจกรรมทั้งหมด (${o.length} กิจกรรม)
        </p>
        <button type="button" class="btn btn-secondary btn-sm" id="btnResetFilter">
          <span>แสดงกิจกรรมทั้งหมด</span>
        </button>
      </div>
    `;const s=e("#btnResetFilter");s&&w(s,"click",()=>{P="all",z(".status-filter-chip").forEach(l=>{l.classList.toggle("is-active",l.getAttribute("data-filter")==="all")}),$(i)});return}const u=D.isAdmin();n.innerHTML=r.map(t=>{var d,c;const s=h[t.status]||h.review;let l="";return u?l=`
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
        `:l=`
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
            <span class="activity-code-badge">${b(t.code)}</span>
            ${l}
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
                <span>${((d=t.participants)==null?void 0:d.students)||0} คน (รวม ${((c=t.participants)==null?void 0:c.total)||0})</span>
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
    `}).join(""),u?n.querySelectorAll(".activity-status-select").forEach(t=>{t.addEventListener("change",s=>{s.stopPropagation();const l=t.getAttribute("data-id"),d=t.value,c=_.updateActivityStatus(l,d);if(c&&c.success){const p=h[d]||h.review;v({type:"success",title:"แอดมินอัปเดตสถานะกิจกรรมสำเร็จ 👑",message:`ปรับสถานะเป็น "${p.label}" เรียบร้อยแล้ว`}),$(i)}else v({type:"error",title:"ไม่สามารถเปลี่ยนสถานะได้",message:(c==null?void 0:c.message)||"เฉพาะแอดมินเท่านั้นที่สามารถเปลี่ยนสถานะได้"})})}):n.querySelectorAll(".activity-status-pill.is-locked").forEach(t=>{t.addEventListener("click",s=>{s.stopPropagation(),v({type:"warning",title:"สถานะถูกล็อค 🔒",message:"คุณไม่มีสิทธิ์: เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถกำหนดหรือเปลี่ยนสถานะกิจกรรมได้"})})}),n.querySelectorAll(".btn-edit-form").forEach(t=>{t.addEventListener("click",()=>{const s=t.getAttribute("data-id");window.location.href=`/activity-form.html?id=${encodeURIComponent(i.id)}&actId=${encodeURIComponent(s)}`})})}function q(i){const n=e("#editProjectModal");if(!n)return;const a=G(n,{staticBackdrop:!0}),o=e("#btnEditProject"),r=e("#btnSaveProject"),u=()=>{const t=j.getProjectById(i.id),s=e("#editProjectTitle"),l=e("#editProjectActivityName"),d=e("#editProjectResponsiblePerson"),c=e("#editProjectBudget"),p=e("#editProjectGradeLevel"),m=e("#editProjectDateRange"),f=e("#editProjectLocation"),y=e("#editProjectDepartment"),g=e("#editProjectFiscalYear");s&&(s.value=t.title||""),l&&(l.value=t.activityName||""),d&&(d.value=t.responsiblePerson||""),c&&(c.value=t.budget||0),p&&(p.value=t.gradeLevel||""),m&&(m.value=t.dateRange||""),f&&(f.value=t.location||""),y&&(y.value=t.department||""),g&&(g.value=t.fiscalYear||"2569")};o&&w(o,"click",t=>{t.preventDefault(),u(),a.open();const s=e("#editProjectTitle");s&&setTimeout(()=>s.focus(),100)}),r&&w(r,"click",()=>{var A,C,E,I,L,k,x,S,B,H,T,R,N,M;const t=(A=e("#editProjectTitle"))==null?void 0:A.value.trim(),s=(C=e("#editProjectActivityName"))==null?void 0:C.value.trim(),l=(E=e("#editProjectResponsiblePerson"))==null?void 0:E.value.trim(),d=(I=e("#editProjectBudget"))==null?void 0:I.value,c=(L=e("#editProjectGradeLevel"))==null?void 0:L.value.trim(),p=(k=e("#editProjectDateRange"))==null?void 0:k.value.trim(),m=(x=e("#editProjectLocation"))==null?void 0:x.value.trim(),f=(S=e("#editProjectDepartment"))==null?void 0:S.value.trim(),y=(B=e("#editProjectFiscalYear"))==null?void 0:B.value.trim();if(!t){v({type:"warning",title:"กรุณากรอกชื่อโครงการ",message:"ชื่อโครงการต้องไม่เป็นค่าว่าง"}),(H=e("#editProjectTitle"))==null||H.focus();return}if(!l){v({type:"warning",title:"กรุณากรอกผู้รับผิดชอบ",message:"กรุณาระบุชื่ออาจารย์ผู้รับผิดชอบโครงการ"}),(T=e("#editProjectResponsiblePerson"))==null||T.focus();return}if(d===""||isNaN(Number(d))){v({type:"warning",title:"กรุณากรอกงบประมาณ",message:"กรุณาระบุจำนวนงบประมาณเป็นตัวเลข"}),(R=e("#editProjectBudget"))==null||R.focus();return}if(!c){v({type:"warning",title:"กรุณากรอกกลุ่มเป้าหมาย",message:"กรุณาระบุระดับชั้นหรือกลุ่มเป้าหมายผู้เข้าร่วม"}),(N=e("#editProjectGradeLevel"))==null||N.focus();return}if(!p){v({type:"warning",title:"กรุณากรอกกำหนดการ",message:"กรุณาระบุช่วงวันและเวลาจัดโครงการ"}),(M=e("#editProjectDateRange"))==null||M.focus();return}const g=j.updateProject(i.id,{title:t,activityName:s,responsiblePerson:l,budget:Number(d),gradeLevel:c,dateRange:p,location:m,department:f,fiscalYear:y||"2569"});g&&(Object.assign(i,g),F(i),$(i),v({type:"success",title:"บันทึกโครงการสำเร็จ! ✨",message:`อัปเดตข้อมูลโครงการ "${g.title}" เรียบร้อยแล้ว`}),a.close())})}function J(i){const n=(a,o)=>{const r=document.getElementById(a);r&&(r.textContent=String(o))};n("countAll",i.length),n("countReview",i.filter(a=>a.status==="review").length),n("countProgress",i.filter(a=>a.status==="in-progress").length),n("countEdit",i.filter(a=>a.status==="edit").length),n("countCompleted",i.filter(a=>a.status==="completed").length),n("countCancelled",i.filter(a=>a.status==="cancelled").length)}
