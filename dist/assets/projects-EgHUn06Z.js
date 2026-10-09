import{A as Q,$ as t,b as tt,a as n,s as p,e as u}from"./auth-service-C-dmPdyf.js";/* empty css              *//* empty css              */import{i as et}from"./navbar-C2ItTa6r.js";import{i as N}from"./modal-DXILHliY.js";import{P as b,A as at}from"./activity-service-DG0vMjhY.js";document.addEventListener("DOMContentLoaded",()=>{et();const M=Q.getCurrentUser(),R=t("#heroUserName");R&&M&&(R.textContent=M.name);const h=t("#projectsGrid"),x=t("#searchInput"),B=t("#fiscalYearSelect"),g=t("#statusSelect"),C=t("#gradeLevelSelect"),Y=tt(".filter-chip"),D=t("#newProjectBtn"),W=t("#newProjectModal"),S=t("#newProjectForm"),I=t("#importExcelBtn"),X=t("#importExcelModal"),o={search:"",fiscalYear:"all",gradeLevel:"all",status:"all"};T(),r(),x&&n(x,"input",a=>{o.search=a.target.value,r()}),B&&n(B,"change",a=>{o.fiscalYear=a.target.value,r()}),g&&n(g,"change",a=>{o.status=a.target.value,k(a.target.value),r()}),C&&n(C,"change",a=>{o.gradeLevel=a.target.value,r()}),Y.forEach(a=>{n(a,"click",()=>{const s=a.getAttribute("data-status");o.status=s,g&&(g.value=s),k(s),r()})});function k(a){Y.forEach(s=>{s.getAttribute("data-status")===a?s.classList.add("is-active"):s.classList.remove("is-active")})}const F=N(W);D&&n(D,"click",()=>{F.open()}),S&&n(S,"submit",a=>{a.preventDefault();const s=t("#newProjectTitle").value.trim(),d=t("#newActivityName").value.trim(),e=t("#newFiscalYear").value,i=t("#newGradeLevel").value,l=t("#newResponsiblePerson").value.trim(),c=t("#newBudget").value,P=t("#newStudents").value,v=t("#newTeachers").value,j=t("#newDateRange").value.trim(),m=t("#newLocation").value.trim();if(!s){p({type:"error",title:"ข้อมูลไม่ครบถ้วน",message:"กรุณากรอกชื่อโครงการ"});return}const f=b.createProject({title:s,activityName:d,fiscalYear:e,gradeLevel:i,responsiblePerson:l,budget:c,students:P,teachers:v,dateRange:j,location:m});p({type:"success",title:"สร้างโครงการสำเร็จ",message:`โครงการ "${f.title}" ถูกบันทึกเรียบร้อยแล้ว`}),F.close(),S.reset(),T(),r()});const G=N(X);I&&n(I,"click",()=>{G.open()});const U=t("#confirmUploadExcelBtn");U&&n(U,"click",()=>{p({type:"success",title:"นำเข้าข้อมูลจาก Excel สำเร็จ",message:"นำเข้าข้อมูลโครงการจากไฟล์ Excel_example.xlsx เรียบร้อย"}),G.close(),setTimeout(()=>{window.location.href="/project-activities.html?id=PRJ-CITIZEN-05"},500)});const H=t("#editProjectModal"),A=H?N(H,{staticBackdrop:!0}):null,O=t("#btnSaveProjectFromOverview");O&&n(O,"click",()=>{var f,y,w,E,L,$,_,q,J,V,Z,z,K;const a=(f=t("#editProjectId"))==null?void 0:f.value,s=(y=t("#editProjectTitle"))==null?void 0:y.value.trim(),d=(w=t("#editProjectActivityName"))==null?void 0:w.value.trim(),e=(E=t("#editProjectResponsiblePerson"))==null?void 0:E.value.trim(),i=(L=t("#editProjectBudget"))==null?void 0:L.value,l=($=t("#editProjectGradeLevel"))==null?void 0:$.value.trim(),c=(_=t("#editProjectDateRange"))==null?void 0:_.value.trim(),P=(q=t("#editProjectLocation"))==null?void 0:q.value.trim(),v=(J=t("#editProjectDepartment"))==null?void 0:J.value.trim(),j=(V=t("#editProjectFiscalYear"))==null?void 0:V.value.trim();if(!s){p({type:"warning",title:"กรุณากรอกชื่อโครงการ",message:"ชื่อโครงการต้องไม่เป็นค่าว่าง"}),(Z=t("#editProjectTitle"))==null||Z.focus();return}if(!e){p({type:"warning",title:"กรุณากรอกผู้รับผิดชอบ",message:"กรุณาระบุชื่ออาจารย์ผู้รับผิดชอบโครงการ"}),(z=t("#editProjectResponsiblePerson"))==null||z.focus();return}if(i===""||isNaN(Number(i))){p({type:"warning",title:"งบประมาณไม่ถูกต้อง",message:"กรุณากรอกจำนวนงบประมาณเป็นตัวเลข"}),(K=t("#editProjectBudget"))==null||K.focus();return}const m=b.updateProject(a,{title:s,activityName:d,responsiblePerson:e,budget:Number(i),gradeLevel:l,dateRange:c,location:P,department:v,fiscalYear:j||"2569"});m&&(p({type:"success",title:"บันทึกโครงการสำเร็จ! ✨",message:`อัปเดตข้อมูลโครงการ "${m.title}" เรียบร้อยแล้ว`}),A&&A.close(),T(),r())});function r(){if(!h)return;const a=Q.isAdmin(),s=b.filterProjects(o),d=t("#projectsCountBadge");if(d&&(d.textContent=`${s.length} โครงการ`),s.length===0){h.innerHTML=`
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
      `;const e=t("#resetFiltersBtn");e&&n(e,"click",()=>{x&&(x.value=""),B&&(B.value="all"),g&&(g.value="all"),C&&(C.value="all"),o.search="",o.fiscalYear="all",o.status="all",o.gradeLevel="all",k("all"),r()});return}h.innerHTML=s.map(e=>{const i=at.getActivitiesByProject(e.id),l=e.status==="approved"?"status-active":e.status==="active"?"status-pending":"status-draft";return`
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
      `}).join(""),h.querySelectorAll(".btn-card-edit-project").forEach(e=>{e.addEventListener("click",i=>{i.stopPropagation();const l=e.getAttribute("data-id"),c=b.getProjectById(l);if(c&&A){const P=t("#editProjectId"),v=t("#editProjectTitle"),j=t("#editProjectActivityName"),m=t("#editProjectResponsiblePerson"),f=t("#editProjectBudget"),y=t("#editProjectGradeLevel"),w=t("#editProjectDateRange"),E=t("#editProjectLocation"),L=t("#editProjectDepartment"),$=t("#editProjectFiscalYear");P&&(P.value=c.id),v&&(v.value=c.title||""),j&&(j.value=c.activityName||""),m&&(m.value=c.responsiblePerson||""),f&&(f.value=c.budget||0),y&&(y.value=c.gradeLevel||""),w&&(w.value=c.dateRange||""),E&&(E.value=c.location||""),L&&(L.value=c.department||""),$&&($.value=c.fiscalYear||"2569"),A.open(),v&&setTimeout(()=>v.focus(),100)}})}),h.querySelectorAll(".project-card").forEach(e=>{e.addEventListener("click",()=>{const i=e.getAttribute("data-id"),l=b.getProjectById(i);sessionStorage.setItem("satit_cmu_active_project",JSON.stringify(l)),p({type:"info",title:l.title,message:"กำลังเปิดหน้ารายการกิจกรรม..."}),setTimeout(()=>{window.location.href=`/project-activities.html?id=${encodeURIComponent(i)}`},300)})})}function T(){const a=b.getStatistics(),s=t("#statTotalProjects"),d=t("#statTotalBudget"),e=t("#statCompletedDocs"),i=t("#statActiveProjects");s&&(s.textContent=a.totalProjects),d&&(d.textContent=`${(a.totalBudget/1e3).toFixed(0)}k ฿`),e&&(e.textContent=`${a.completedDocs}/${a.totalDocs}`),i&&(i.textContent=a.activeProjects)}});
