import{A as D,$ as e,b as R,a as n,s as g,e as o}from"./auth-service-CTnetkcV.js";/* empty css              */import{i as B}from"./modal-CRDmLndU.js";import{i as U}from"./navbar-yfZPHOgh.js";import{P as f,A as G}from"./activity-service-CIrWOL9n.js";document.addEventListener("DOMContentLoaded",()=>{U();const y=D.getCurrentUser(),w=e("#heroUserName");w&&y&&(w.textContent=y.name);const p=e("#projectsGrid"),v=e("#searchInput"),u=e("#fiscalYearSelect"),d=e("#statusSelect"),m=e("#gradeLevelSelect"),x=R(".filter-chip"),j=e("#newProjectBtn"),S=e("#newProjectModal"),h=e("#newProjectForm"),$=e("#importExcelBtn"),k=e("#importExcelModal"),i={search:"",fiscalYear:"all",gradeLevel:"all",status:"all"};E(),r(),v&&n(v,"input",s=>{i.search=s.target.value,r()}),u&&n(u,"change",s=>{i.fiscalYear=s.target.value,r()}),d&&n(d,"change",s=>{i.status=s.target.value,b(s.target.value),r()}),m&&n(m,"change",s=>{i.gradeLevel=s.target.value,r()}),x.forEach(s=>{n(s,"click",()=>{const a=s.getAttribute("data-status");i.status=a,d&&(d.value=a),b(a),r()})});function b(s){x.forEach(a=>{a.getAttribute("data-status")===s?a.classList.add("is-active"):a.classList.remove("is-active")})}const C=B(S);j&&n(j,"click",()=>{C.open()}),h&&n(h,"submit",s=>{s.preventDefault();const a=e("#newProjectTitle").value.trim(),t=e("#newActivityName").value.trim(),c=e("#newFiscalYear").value,l=e("#newGradeLevel").value,A=e("#newResponsiblePerson").value.trim(),T=e("#newBudget").value,M=e("#newStudents").value,F=e("#newTeachers").value,I=e("#newDateRange").value.trim(),N=e("#newLocation").value.trim();if(!a){g({type:"error",title:"ข้อมูลไม่ครบถ้วน",message:"กรุณากรอกชื่อโครงการ"});return}const Y=f.createProject({title:a,activityName:t,fiscalYear:c,gradeLevel:l,responsiblePerson:A,budget:T,students:M,teachers:F,dateRange:I,location:N});g({type:"success",title:"สร้างโครงการสำเร็จ",message:`โครงการ "${Y.title}" ถูกบันทึกเรียบร้อยแล้ว`}),C.close(),h.reset(),E(),r()});const P=B(k);$&&n($,"click",()=>{P.open()});const L=e("#confirmUploadExcelBtn");L&&n(L,"click",()=>{g({type:"success",title:"นำเข้าข้อมูลจาก Excel สำเร็จ",message:"นำเข้าข้อมูลโครงการจากไฟล์ Excel_example.xlsx เรียบร้อย"}),P.close(),setTimeout(()=>{window.location.href="/project-activities.html?id=PRJ-CITIZEN-05"},500)});function r(){if(!p)return;const s=f.filterProjects(i),a=e("#projectsCountBadge");if(a&&(a.textContent=`${s.length} โครงการ`),s.length===0){p.innerHTML=`
        <div class="projects-empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h4 class="empty-state-title">ไม่พบโครงการที่ตรงกับเงื่อนไขการค้นหา</h4>
          <p class="empty-state-desc">ลองปรับคำค้นหาหรือเปลี่ยนตัวกรองระดับชั้น</p>
          <button type="button" class="btn btn-secondary btn-sm" id="resetFiltersBtn">
            รีเซ็ตตัวกรองทั้งหมด
          </button>
        </div>
      `;const t=e("#resetFiltersBtn");t&&n(t,"click",()=>{v&&(v.value=""),u&&(u.value="all"),d&&(d.value="all"),m&&(m.value="all"),i.search="",i.fiscalYear="all",i.status="all",i.gradeLevel="all",b("all"),r()});return}p.innerHTML=s.map(t=>{const c=G.getActivitiesByProject(t.id),l=t.status==="approved"?"status-active":t.status==="active"?"status-pending":"status-draft";return`
        <article class="project-card" data-id="${t.id}" style="--card-accent: ${t.themeColor||"#6F2C91"};" title="คลิกเพื่อเข้าสู่โครงการ ${o(t.title)}">
          <div>
            <!-- Header: Icon & Tags -->
            <div class="project-card-header">
              <div class="project-brand-badge">
                <div class="project-icon-box">${t.icon||"📁"}</div>
                <span class="project-code-tag">${o(t.code)}</span>
              </div>
              <div class="project-tags-group">
                <span class="badge badge-purple">ปี ${o(t.fiscalYear)}</span>
                <span class="status-pill ${l}">
                  <span class="badge-dot"></span>
                  <span>${o(t.statusLabel)}</span>
                </span>
              </div>
            </div>

            <!-- Title -->
            <h4 class="project-card-title">${o(t.title)}</h4>
            <div class="project-activity-name">
              ${o(t.activityName)}
            </div>

            <!-- Meta Grid -->
            <div class="project-meta-grid">
              <div class="meta-item">
                <span class="meta-label">อาจารย์ผู้รับผิดชอบ</span>
                <span class="meta-value">
                  <span>👨‍🏫</span>
                  <span>${o(t.responsiblePerson)}</span>
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">กลุ่มเป้าหมาย</span>
                <span class="meta-value">
                  <span>👥</span>
                  <span>${o(t.gradeLevel)}</span>
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">งบประมาณ</span>
                <span class="meta-value" style="color: ${t.themeColor||"var(--cmu-purple-700)"}; font-weight:700;">
                  <span>💰</span>
                  <span>${t.budget.toLocaleString()} บาท</span>
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">กำหนดการ</span>
                <span class="meta-value">
                  <span>📅</span>
                  <span>${o(t.dateRange)}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Card Footer: Clickable Action Link -->
          <div class="project-card-footer">
            <span class="project-activities-count">${c.length} กิจกรรม</span>
            <div class="project-enter-hint">
              <span>ดูกิจกรรมและจัดการเอกสาร</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
        </article>
      `}).join(""),p.querySelectorAll(".project-card").forEach(t=>{t.addEventListener("click",()=>{const c=t.getAttribute("data-id"),l=f.getProjectById(c);sessionStorage.setItem("satit_cmu_active_project",JSON.stringify(l)),g({type:"info",title:l.title,message:"กำลังเปิดหน้ารายการกิจกรรม..."}),setTimeout(()=>{window.location.href=`/project-activities.html?id=${encodeURIComponent(c)}`},300)})})}function E(){const s=f.getStatistics(),a=e("#statTotalProjects"),t=e("#statTotalBudget"),c=e("#statCompletedDocs"),l=e("#statActiveProjects");a&&(a.textContent=s.totalProjects),t&&(t.textContent=`${(s.totalBudget/1e3).toFixed(0)}k ฿`),c&&(c.textContent=`${s.completedDocs}/${s.totalDocs}`),l&&(l.textContent=s.activeProjects)}});
