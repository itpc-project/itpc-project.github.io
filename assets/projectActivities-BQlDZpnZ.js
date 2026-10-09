import{$ as o,a as b,s as p,b as w,A as f,e as d}from"./auth-service-CTnetkcV.js";import{i as $}from"./navbar-yfZPHOgh.js";import{P as E,S,A as h,a as u}from"./activity-service-CIrWOL9n.js";let y="all";document.addEventListener("DOMContentLoaded",()=>{$();const i=new URLSearchParams(window.location.search).get("id");let t=null;if(i)t=E.getProjectById(i);else try{const l=sessionStorage.getItem("satit_cmu_active_project");l&&(t=JSON.parse(l))}catch{}t||(t=S[4]),sessionStorage.setItem("satit_cmu_active_project",JSON.stringify(t)),x(t),A(t),k(t),g(t);const n=o("#addActivityBtn");n&&b(n,"click",()=>{p({type:"info",title:"กำลังเปิดแบบฟอร์ม",message:`เปิดแบบฟอร์มขออนุมัติกิจกรรมสำหรับ "${t.title}"`}),setTimeout(()=>{window.location.href=`/activity-form.html?id=${encodeURIComponent(t.id)}&mode=new`},350)})});function k(s){const i=w(".status-filter-chip");i.forEach(t=>{t.addEventListener("click",()=>{y=t.getAttribute("data-filter")||"all",i.forEach(l=>l.classList.remove("is-active")),t.classList.add("is-active"),g(s)})})}function x(s){const i=o("#projectHeaderIcon"),t=o("#projectHeaderTitle"),n=o("#projectHeaderCode"),l=o("#projectHeaderYear"),v=o("#projectHeaderGrade"),e=o("#projectHeaderPerson"),a=o("#projectHeaderCard");i&&(i.textContent=s.icon||"📁"),t&&(t.textContent=s.title),n&&(n.textContent=s.code),l&&(l.textContent=`ปีงบประมาณ ${s.fiscalYear}`),v&&(v.textContent=s.gradeLevel),e&&(e.textContent=`อาจารย์ผู้รับผิดชอบ: ${s.responsiblePerson}`),a&&s.themeColor&&a.style.setProperty("--project-theme",s.themeColor)}function g(s){const i=o("#activitiesGrid"),t=o("#activitiesCountBadge");if(!i)return;const n=h.getActivitiesByProject(s.id);t&&(t.textContent=`${n.length} กิจกรรม`),L(n);const l=y==="all"?n:n.filter(e=>e.status===y);if(n.length===0){i.innerHTML=`
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
    `;const e=o("#emptyAddBtn");e&&b(e,"click",()=>{window.location.href=`/activity-form.html?id=${encodeURIComponent(s.id)}&mode=new`});return}if(l.length===0){const e=u[y]||{label:"สถานะนี้"};i.innerHTML=`
      <div class="activities-empty-state" style="grid-column: 1 / -1; padding: var(--space-8) var(--space-4);">
        <div class="empty-state-icon" style="font-size: 1.5rem; width: 3.5rem; height: 3.5rem;">🔍</div>
        <h4 style="font-family: var(--font-family-thai); font-size: var(--font-size-base); font-weight: 700; margin-bottom: var(--space-2);">
          ไม่พบกิจกรรมที่มีสถานะ "${e.label}"
        </h4>
        <p style="font-family: var(--font-family-thai); font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: var(--space-4);">
          สามารถเลือกดูสถานะอื่น หรือเลือก "ทั้งหมด" เพื่อดูกิจกรรมทั้งหมด (${n.length} กิจกรรม)
        </p>
        <button type="button" class="btn btn-secondary btn-sm" id="btnResetFilter">
          <span>แสดงกิจกรรมทั้งหมด</span>
        </button>
      </div>
    `;const a=o("#btnResetFilter");a&&b(a,"click",()=>{y="all",w(".status-filter-chip").forEach(c=>{c.classList.toggle("is-active",c.getAttribute("data-filter")==="all")}),g(s)});return}const v=f.isAdmin();i.innerHTML=l.map(e=>{var m,r;const a=u[e.status]||u.review;let c="";return v?c=`
          <div class="activity-status-wrapper">
            <div class="activity-status-pill ${a.badgeClass}" title="👑 สิทธิ์แอดมิน: คลิกเพื่อเปลี่ยนสถานะกิจกรรม">
              <span class="status-dot"></span>
              <select class="activity-status-select" data-id="${e.id}" aria-label="สถานะกิจกรรม ${d(e.title)}">
                <option value="review" ${a.key==="review"?"selected":""}>รอตรวจ</option>
                <option value="in-progress" ${a.key==="in-progress"?"selected":""}>ดำเนินการ</option>
                <option value="edit" ${a.key==="edit"?"selected":""}>แก้ไข</option>
                <option value="completed" ${a.key==="completed"?"selected":""}>เสร็จสิ้น</option>
                <option value="cancelled" ${a.key==="cancelled"?"selected":""}>ยกเลิก</option>
              </select>
              <svg class="status-chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        `:c=`
          <div class="activity-status-wrapper">
            <div class="activity-status-pill ${a.badgeClass} is-locked" data-action="locked-status" data-id="${e.id}" title="🔒 เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเปลี่ยนสถานะได้ (สถานะปัจจุบัน: ${a.label})">
              <span class="status-dot"></span>
              <span class="status-locked-label">${a.label}</span>
              <span class="status-lock-icon" aria-hidden="true">🔒</span>
            </div>
          </div>
        `,`
      <article class="activity-card" data-id="${e.id}" data-status="${a.key}">
        <div>
          <!-- Header พร้อมตัวเลือกสถานะ (แอดมินเปลี่ยนได้ / อาจารย์ดูได้อย่างเดียว) -->
          <div class="activity-card-header">
            <span class="activity-code-badge">${d(e.code)}</span>
            ${c}
          </div>

          <!-- Activity Title -->
          <h4 class="activity-card-title">${d(e.title)}</h4>

          <!-- Metadata Grid -->
          <div class="activity-meta-grid">
            <div class="activity-meta-item">
              <span class="activity-meta-label">กำหนดการ</span>
              <span class="activity-meta-value">
                <span>📅</span>
                <span>${d(e.dateRange||"-")}</span>
              </span>
            </div>
            <div class="activity-meta-item">
              <span class="activity-meta-label">สถานที่</span>
              <span class="activity-meta-value">
                <span>📍</span>
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${d(e.location||"-")}</span>
              </span>
            </div>
            <div class="activity-meta-item">
              <span class="activity-meta-label">ผู้เข้าร่วม</span>
              <span class="activity-meta-value">
                <span>👥</span>
                <span>${((m=e.participants)==null?void 0:m.students)||0} คน (รวม ${((r=e.participants)==null?void 0:r.total)||0})</span>
              </span>
            </div>
            <div class="activity-meta-item">
              <span class="activity-meta-label">งบประมาณ</span>
              <span class="activity-meta-value" style="color: var(--cmu-purple-700); font-weight: 700;">
                <span>💰</span>
                <span>${(e.budget||0).toLocaleString()} บาท</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="activity-card-actions">
          <button type="button" class="btn btn-primary btn-sm btn-edit-form" data-id="${e.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <polyline points="13 8 17 12 13 16"></polyline>
            </svg>
            <span>เปิดแบบฟอร์ม</span>
          </button>
        </div>
      </article>
    `}).join(""),v?i.querySelectorAll(".activity-status-select").forEach(e=>{e.addEventListener("change",a=>{a.stopPropagation();const c=e.getAttribute("data-id"),m=e.value,r=h.updateActivityStatus(c,m);if(r&&r.success){const C=u[m]||u.review;p({type:"success",title:"แอดมินอัปเดตสถานะกิจกรรมสำเร็จ 👑",message:`ปรับสถานะเป็น "${C.label}" เรียบร้อยแล้ว`}),g(s)}else p({type:"error",title:"ไม่สามารถเปลี่ยนสถานะได้",message:(r==null?void 0:r.message)||"เฉพาะแอดมินเท่านั้นที่สามารถเปลี่ยนสถานะได้"})})}):i.querySelectorAll(".activity-status-pill.is-locked").forEach(e=>{e.addEventListener("click",a=>{a.stopPropagation(),p({type:"warning",title:"สถานะถูกล็อค 🔒",message:"คุณไม่มีสิทธิ์: เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถกำหนดหรือเปลี่ยนสถานะกิจกรรมได้"})})}),i.querySelectorAll(".btn-edit-form").forEach(e=>{e.addEventListener("click",()=>{const a=e.getAttribute("data-id");window.location.href=`/activity-form.html?id=${encodeURIComponent(s.id)}&actId=${encodeURIComponent(a)}`})})}function A(s){const i=o("#rolePermissionBanner");if(!i)return;const t=f.getCurrentUser(),n=f.isAdmin();n?i.innerHTML=`
      <div class="role-banner-admin">
        <div class="banner-left">
          <span class="banner-avatar">👑</span>
          <div>
            <div class="banner-title">
              <span>โหมดผู้ดูแลระบบ (Admin Access Mode)</span>
              <span class="badge badge-purple" style="font-size: 11px;">สิทธิ์เต็ม</span>
            </div>
            <div class="banner-desc">
              ผู้ใช้งาน: <strong>${d(t.name||"ผู้ดูแลระบบ")}</strong> • คุณมีสิทธิ์กำหนดและเปลี่ยนสถานะกิจกรรมได้ทุกสถานะ (รอตรวจ / ดำเนินการ / แก้ไข / เสร็จสิ้น / ยกเลิก)
            </div>
          </div>
        </div>
        <div class="banner-actions">
          <button type="button" class="btn-role-switch" id="btnSwitchRole" title="คลิกเพื่อสลับเป็นมุมมองอาจารย์ (สถานะจะถูกล็อค)">
            <span>👨‍🏫 สลับเป็นสิทธิ์อาจารย์ (ทดสอบการล็อคสถานะ)</span>
          </button>
        </div>
      </div>
    `:i.innerHTML=`
      <div class="role-banner-teacher">
        <div class="banner-left">
          <span class="banner-avatar">🔒</span>
          <div>
            <div class="banner-title">
              <span>โหมดอาจารย์ผู้รับผิดชอบ (Teacher Mode)</span>
              <span class="badge badge-blue" style="font-size: 11px;">ดูสถานะเท่านั้น</span>
            </div>
            <div class="banner-desc">
              ผู้ใช้งาน: <strong>${d(t.name||"อาจารย์ผู้รับผิดชอบ")}</strong> • <strong>สถานะกิจกรรมถูกล็อค</strong> (เฉพาะแอดมินเท่านั้นที่สามารถพิจารณากำหนดสถานะกิจกรรมได้)
            </div>
          </div>
        </div>
        <div class="banner-actions">
          <button type="button" class="btn-role-switch btn-switch-admin" id="btnSwitchRole" title="คลิกเพื่อสลับเป็นผู้ดูแลระบบ (เพื่อเปิดสิทธิ์แก้ไขสถานะ)">
            <span>👑 สลับเป็นสิทธิ์แอดมิน (เปิดสิทธิ์เปลี่ยนสถานะ)</span>
          </button>
        </div>
      </div>
    `;const l=o("#btnSwitchRole");l&&l.addEventListener("click",()=>{n?(f.switchRole("teacher"),p({type:"info",title:"สลับเป็นสิทธิ์อาจารย์แล้ว 👨‍🏫",message:"สถานะกิจกรรมในแต่ละกล่องถูกล็อคแล้ว (ดูได้อย่างเดียว)"})):(f.switchRole("admin"),p({type:"success",title:"สลับเป็นสิทธิ์แอดมินแล้ว 👑",message:"ปลดล็อคแล้ว! คุณสามารถกำหนดสถานะกิจกรรมในแต่ละกล่องได้อิสระ"})),$(),A(s),g(s)})}function L(s){const i=(t,n)=>{const l=document.getElementById(t);l&&(l.textContent=String(n))};i("countAll",s.length),i("countReview",s.filter(t=>t.status==="review").length),i("countProgress",s.filter(t=>t.status==="in-progress").length),i("countEdit",s.filter(t=>t.status==="edit").length),i("countCompleted",s.filter(t=>t.status==="completed").length),i("countCancelled",s.filter(t=>t.status==="cancelled").length)}
