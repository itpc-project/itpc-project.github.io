import{A as V,$ as t,b as Q,a as d,i as z,s as g,e as u}from"./modal-B-GR92uN.js";/* empty css              */import{i as W}from"./navbar-jO5ehDIc.js";import{P as b,A as X}from"./activity-service-B7Kgdrdd.js";document.addEventListener("DOMContentLoaded",()=>{W();const N=V.getCurrentUser(),Y=t("#heroUserName");Y&&N&&(Y.textContent=N.name);const y=t("#projectsGrid"),C=t("#searchInput"),A=t("#fiscalYearSelect"),f=t("#statusSelect"),S=t("#gradeLevelSelect"),D=Q(".filter-chip"),R=t("#newProjectBtn"),K=t("#newProjectModal"),T=t("#newProjectForm"),n={search:"",fiscalYear:"all",gradeLevel:"all",status:"all"};k(),o(),window.addEventListener("satit-cmu-cloud-synced",()=>{k(),o()}),C&&d(C,"input",a=>{n.search=a.target.value,o()}),A&&d(A,"change",a=>{n.fiscalYear=a.target.value,o()}),f&&d(f,"change",a=>{n.status=a.target.value,x(a.target.value),o()}),S&&d(S,"change",a=>{n.gradeLevel=a.target.value,o()}),D.forEach(a=>{d(a,"click",()=>{const s=a.getAttribute("data-status");n.status=s,f&&(f.value=s),x(s),o()})});function x(a){D.forEach(s=>{s.getAttribute("data-status")===a?s.classList.add("is-active"):s.classList.remove("is-active")})}const F=z(K);R&&d(R,"click",()=>{F.open()}),T&&d(T,"submit",a=>{a.preventDefault();const s=t("#newProjectTitle").value.trim(),r=t("#newActivityName").value.trim(),e=t("#newFiscalYear").value,i=t("#newGradeLevel").value,l=t("#newResponsiblePerson").value.trim(),c=t("#newBudget").value,P=t("#newStudents").value,v=t("#newTeachers").value,j=t("#newDateRange").value.trim(),p=t("#newLocation").value.trim();if(!s){g({type:"error",title:"ข้อมูลไม่ครบถ้วน",message:"กรุณากรอกชื่อโครงการ"});return}const m=b.createProject({title:s,activityName:r,fiscalYear:e,gradeLevel:i,responsiblePerson:l,budget:c,students:P,teachers:v,dateRange:j,location:p});g({type:"success",title:"สร้างโครงการสำเร็จ",message:`โครงการ "${m.title}" ถูกบันทึกเรียบร้อยแล้ว`}),F.close(),T.reset(),k(),o()});const M=t("#editProjectModal"),B=M?z(M,{staticBackdrop:!0}):null,I=t("#btnSaveProjectFromOverview");I&&d(I,"click",()=>{var m,h,w,L,$,E,G,H,O,U,_,q,J;const a=(m=t("#editProjectId"))==null?void 0:m.value,s=(h=t("#editProjectTitle"))==null?void 0:h.value.trim(),r=(w=t("#editProjectActivityName"))==null?void 0:w.value.trim(),e=(L=t("#editProjectResponsiblePerson"))==null?void 0:L.value.trim(),i=($=t("#editProjectBudget"))==null?void 0:$.value,l=(E=t("#editProjectGradeLevel"))==null?void 0:E.value.trim(),c=(G=t("#editProjectDateRange"))==null?void 0:G.value.trim(),P=(H=t("#editProjectLocation"))==null?void 0:H.value.trim(),v=(O=t("#editProjectDepartment"))==null?void 0:O.value.trim(),j=(U=t("#editProjectFiscalYear"))==null?void 0:U.value.trim();if(!s){g({type:"warning",title:"กรุณากรอกชื่อโครงการ",message:"ชื่อโครงการต้องไม่เป็นค่าว่าง"}),(_=t("#editProjectTitle"))==null||_.focus();return}if(!e){g({type:"warning",title:"กรุณากรอกผู้รับผิดชอบ",message:"กรุณาระบุชื่ออาจารย์ผู้รับผิดชอบโครงการ"}),(q=t("#editProjectResponsiblePerson"))==null||q.focus();return}if(i===""||isNaN(Number(i))){g({type:"warning",title:"งบประมาณไม่ถูกต้อง",message:"กรุณากรอกจำนวนงบประมาณเป็นตัวเลข"}),(J=t("#editProjectBudget"))==null||J.focus();return}const p=b.updateProject(a,{title:s,activityName:r,responsiblePerson:e,budget:Number(i),gradeLevel:l,dateRange:c,location:P,department:v,fiscalYear:j||"2569"});p&&(g({type:"success",title:"บันทึกโครงการสำเร็จ! ✨",message:`อัปเดตข้อมูลโครงการ "${p.title}" เรียบร้อยแล้ว`}),B&&B.close(),k(),o())});function o(){if(!y)return;const a=V.isAdmin(),s=b.filterProjects(n),r=t("#projectsCountBadge");if(r&&(r.textContent=`${s.length} โครงการ`),s.length===0){y.innerHTML=`
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
      `;const e=t("#resetFiltersBtn");e&&d(e,"click",()=>{C&&(C.value=""),A&&(A.value="all"),f&&(f.value="all"),S&&(S.value="all"),n.search="",n.fiscalYear="all",n.status="all",n.gradeLevel="all",x("all"),o()});return}y.innerHTML=s.map(e=>{const i=X.getActivitiesByProject(e.id),l=e.status==="approved"?"status-active":e.status==="active"?"status-pending":"status-draft";return`
        <article class="project-card" data-id="${e.id}" style="--card-accent: ${e.themeColor||"#6F2C91"};" title="คลิกเพื่อเข้าสู่โครงการ ${u(e.title)}">
          <div>
            <!-- Header: Icon & Tags -->
            <div class="project-card-header">
              <div class="project-brand-badge">
                <div class="project-icon-box">${e.icon||"📁"}</div>
                <span class="project-code-tag">${u(e.code)}</span>
              </div>
              <div class="project-tags-group">
                <span class="badge badge-purple">ปี ${u(e.fiscalYear)}</span>
                <span class="status-pill ${l}">
                  <span class="badge-dot"></span>
                  <span>${u(e.statusLabel)}</span>
                </span>
                ${a?`
                  <button type="button" class="btn-card-edit-project" data-id="${e.id}" title="แก้ไขข้อมูลโครงการ (สำหรับผู้มีสิทธิ์กำหนดสถานะ)">
                    <span>✏️ แก้ไข</span>
                  </button>
                `:""}
              </div>
            </div>

            <!-- Title -->
            <h4 class="project-card-title">${u(e.title)}</h4>
            <div class="project-activity-name">
              ${u(e.activityName)}
            </div>

            <!-- Meta Grid -->
            <div class="project-meta-grid">
              <div class="meta-item">
                <span class="meta-label">อาจารย์ผู้รับผิดชอบ</span>
                <span class="meta-value">
                  <span>👨‍🏫</span>
                  <span>${u(e.responsiblePerson)}</span>
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">กลุ่มเป้าหมาย</span>
                <span class="meta-value">
                  <span>👥</span>
                  <span>${u(e.gradeLevel)}</span>
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">งบประมาณ</span>
                <span class="meta-value" style="color: ${e.themeColor||"var(--cmu-purple-700)"}; font-weight:700;">
                  <span>💰</span>
                  <span>${e.budget.toLocaleString()} บาท</span>
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">กำหนดการ</span>
                <span class="meta-value">
                  <span>📅</span>
                  <span>${u(e.dateRange)}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Card Footer: Clickable Action Link -->
          <div class="project-card-footer">
            <span class="project-activities-count">${i.length} กิจกรรม</span>
            <div class="project-enter-hint">
              <span>ดูกิจกรรมและจัดการเอกสาร</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
        </article>
      `}).join(""),y.querySelectorAll(".btn-card-edit-project").forEach(e=>{e.addEventListener("click",i=>{i.stopPropagation();const l=e.getAttribute("data-id"),c=b.getProjectById(l);if(c&&B){const P=t("#editProjectId"),v=t("#editProjectTitle"),j=t("#editProjectActivityName"),p=t("#editProjectResponsiblePerson"),m=t("#editProjectBudget"),h=t("#editProjectGradeLevel"),w=t("#editProjectDateRange"),L=t("#editProjectLocation"),$=t("#editProjectDepartment"),E=t("#editProjectFiscalYear");P&&(P.value=c.id),v&&(v.value=c.title||""),j&&(j.value=c.activityName||""),p&&(p.value=c.responsiblePerson||""),m&&(m.value=c.budget||0),h&&(h.value=c.gradeLevel||""),w&&(w.value=c.dateRange||""),L&&(L.value=c.location||""),$&&($.value=c.department||""),E&&(E.value=c.fiscalYear||"2569"),B.open(),v&&setTimeout(()=>v.focus(),100)}})}),y.querySelectorAll(".project-card").forEach(e=>{e.addEventListener("click",()=>{const i=e.getAttribute("data-id"),l=b.getProjectById(i);sessionStorage.setItem("satit_cmu_active_project",JSON.stringify(l)),g({type:"info",title:l.title,message:"กำลังเปิดหน้ารายการกิจกรรม..."}),setTimeout(()=>{window.location.href=`/project-activities.html?id=${encodeURIComponent(i)}`},300)})})}function k(){const a=b.getStatistics(),s=t("#statTotalProjects"),r=t("#statTotalBudget"),e=t("#statCompletedDocs"),i=t("#statActiveProjects");s&&(s.textContent=a.totalProjects),r&&(r.textContent=`${(a.totalBudget/1e3).toFixed(0)}k ฿`),e&&(e.textContent=`${a.completedDocs}/${a.totalDocs}`),i&&(i.textContent=a.activeProjects)}});
