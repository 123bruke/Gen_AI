(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function t(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(s){if(s.ep)return;s.ep=!0;const o=t(s);fetch(s.href,o)}})();class C{constructor(){this.splashEl=document.getElementById("intro-splash"),this.appEl=document.getElementById("app"),this.skipBtn=document.getElementById("skip-splash-btn"),this.timer=null,this.hasDismissed=!1}init(){this.splashEl&&(this.skipBtn&&this.skipBtn.addEventListener("click",()=>this.dismiss()),this.timer=setTimeout(()=>{this.dismiss()},2800))}dismiss(){this.hasDismissed||(this.hasDismissed=!0,this.timer&&clearTimeout(this.timer),this.splashEl&&(this.splashEl.classList.add("fade-out"),setTimeout(()=>{this.splashEl.style.display="none"},800)),this.appEl&&this.appEl.classList.remove("app-hidden"))}replay(){this.hasDismissed=!1,this.splashEl&&(this.splashEl.style.display="flex",this.splashEl.classList.remove("fade-out")),this.appEl&&this.appEl.classList.add("app-hidden"),this.timer=setTimeout(()=>{this.dismiss()},2800)}}const S="visionrag_app_state_v1",k={folders:[{id:"f-research",name:"Research & Documents",icon:"folder",createdAt:Date.now()-864e5*3},{id:"f-finance",name:"Financial & Reports",icon:"folder",createdAt:Date.now()-864e5*2},{id:"f-video",name:"Video Intelligence",icon:"folder",createdAt:Date.now()-864e5*1}],chats:[{id:"chat-demo-1",title:"Multimodal Circuit Diagram Analysis",folderId:"f-research",createdAt:Date.now()-36e5*2,pinned:!0,messages:[{id:"msg-1",sender:"user",text:"Can you analyze the power supply circuit schematic in the uploaded PDF and identify any voltage step-down converters?",timestamp:Date.now()-36e5*2,attachments:[{name:"power_schematic_v2.pdf",type:"application/pdf",size:"2.4 MB"}]},{id:"msg-2",sender:"assistant",text:`Based on the visual document retrieval from **power_schematic_v2.pdf**, I located the DC-DC buck converter circuit block on Page 3.

### Key Findings:
1. **Converter Unit:** Texas Instruments LM2596 step-down switching regulator (IC2).
2. **Input Voltage Range:** 7V to 40V DC.
3. **Regulated Output:** 5.0V @ 3A max output.
4. **Feedback Resistors:** R14 (1.2kΩ) and R15 (3.6kΩ) configure the feedback loop with high stability.

Here are the groundings retrieved with 96% visual confidence.`,timestamp:Date.now()-36e5*2+1500,sources:[{id:"src-1",title:"power_schematic_v2.pdf",page:3,matchScore:96,type:"pdf",chunk:"IC2: LM2596-5.0 Step-Down Regulator with Schottky barrier diode D3 (1N5822) and inductor L1 (33uH).",bbox:[120,340,480,710]},{id:"src-2",title:"component_specifications.png",page:1,matchScore:91,type:"image",chunk:"LM2596 thermal package TO-220 pinout configuration and heat sink thermal resistance data.",bbox:[50,80,320,290]}]}]},{id:"chat-demo-2",title:"Factory Safety Video Audit",folderId:"f-video",createdAt:Date.now()-36e5*5,pinned:!1,messages:[{id:"msg-3",sender:"user",text:"Did any workers fail to wear protective hardhats in the warehouse CCTV clip?",timestamp:Date.now()-36e5*5,attachments:[{name:"cctv_warehouse_cam04.mp4",type:"video/mp4",size:"18.6 MB"}]},{id:"msg-4",sender:"assistant",text:`Yes. Video keyframe retrieval detected a safety compliance violation.

### Temporal Video Analysis:
- **Timestamp 01:24 - 01:38:** Worker at Loading Dock 2 is operating an electric pallet jack without a certified safety helmet.
- **Confidence Score:** 94.2% detection via YOLOv8-Vision fine-tuned headgear checkpoint.
- **Surrounding Personnel:** 2 other technicians in the frame are properly wearing high-visibility vests and helmets.`,timestamp:Date.now()-36e5*5+1800,sources:[{id:"src-3",title:"cctv_warehouse_cam04.mp4",page:"01:24",matchScore:94,type:"video",chunk:"Keyframe #2520 (01:24.40): Bounding box [210, 450, 310, 580] flagged no-helmet violation.",bbox:[210,450,310,580]}]}]}],activeChatId:"chat-demo-1",activeAttachments:[],isStreaming:!1,sidebarCollapsed:!1,settings:{model:"visionrag-omni-v2.5",theme:"white",topK:5,similarityThreshold:.72,hybridAlpha:.65,rerankerEnabled:!0,visionModel:"clip-vit-l-14",ocrEngine:"easyocr",fps:1,speechRate:1,speechPitch:1,autoSpeak:!1,backendUrl:"http://localhost:8000",mockMode:!0}};class E{constructor(){this.listeners=new Set,this.state=this.loadState()}loadState(){try{const e=localStorage.getItem(S);if(e){const t=JSON.parse(e);return{...k,...t,activeAttachments:[],isStreaming:!1}}}catch(e){console.warn("Failed to parse saved state:",e)}return JSON.parse(JSON.stringify(k))}saveState(){try{const e={folders:this.state.folders,chats:this.state.chats,activeChatId:this.state.activeChatId,sidebarCollapsed:this.state.sidebarCollapsed,settings:this.state.settings};localStorage.setItem(S,JSON.stringify(e))}catch(e){console.error("Failed to save state to localStorage:",e)}}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}notify(e,t){this.saveState(),this.listeners.forEach(i=>{try{i(this.state,e,t)}catch(s){console.error("State listener error:",s)}})}getState(){return this.state}getActiveChat(){return this.state.chats.find(e=>e.id===this.state.activeChatId)||null}createChat(e=null){const t={id:"chat-"+Date.now(),title:"New Vision Conversation",folderId:e,createdAt:Date.now(),pinned:!1,messages:[]};return this.state.chats.unshift(t),this.state.activeChatId=t.id,this.notify("CHAT_CREATED",t),t}setActiveChat(e){this.state.activeChatId=e,this.notify("CHAT_CHANGED",e)}renameChat(e,t){const i=this.state.chats.find(s=>s.id===e);i&&t.trim()&&(i.title=t.trim(),this.notify("CHAT_RENAMED",i))}deleteChat(e){const t=this.state.chats.findIndex(i=>i.id===e);t!==-1&&(this.state.chats.splice(t,1),this.state.activeChatId===e&&(this.state.activeChatId=this.state.chats.length>0?this.state.chats[0].id:null),this.notify("CHAT_DELETED",e))}togglePinChat(e){const t=this.state.chats.find(i=>i.id===e);t&&(t.pinned=!t.pinned,this.notify("CHAT_PINNED",t))}moveChatToFolder(e,t){const i=this.state.chats.find(s=>s.id===e);i&&(i.folderId=t,this.notify("CHAT_MOVED",{chatId:e,folderId:t}))}createFolder(e){const t={id:"f-"+Date.now(),name:e.trim()||"New Folder",icon:"folder",createdAt:Date.now()};return this.state.folders.push(t),this.notify("FOLDER_CREATED",t),t}renameFolder(e,t){const i=this.state.folders.find(s=>s.id===e);i&&t.trim()&&(i.name=t.trim(),this.notify("FOLDER_RENAMED",i))}deleteFolder(e){this.state.folders=this.state.folders.filter(t=>t.id!==e),this.state.chats.forEach(t=>{t.folderId===e&&(t.folderId=null)}),this.notify("FOLDER_DELETED",e)}addMessage(e,t){let i=this.state.chats.find(s=>s.id===e);i||(i=this.createChat(),e=i.id),i.messages.push(t),t.sender==="user"&&i.title.startsWith("New Vision Conversation")&&(i.title=t.text.slice(0,36)+(t.text.length>36?"...":"")),this.notify("MESSAGE_ADDED",{chatId:e,message:t})}addAttachment(e){this.state.activeAttachments.push(e),this.notify("ATTACHMENT_ADDED",e)}updateAttachmentProgress(e,t){const i=this.state.activeAttachments.find(s=>s.id===e);i&&(i.progress=t,this.notify("ATTACHMENT_PROGRESS",i))}removeAttachment(e){this.state.activeAttachments=this.state.activeAttachments.filter(t=>t.id!==e),this.notify("ATTACHMENT_REMOVED",e)}clearAttachments(){this.state.activeAttachments=[],this.notify("ATTACHMENTS_CLEARED")}setStreaming(e){this.state.isStreaming=e,this.notify("STREAMING_STATUS",e)}toggleSidebar(){this.state.sidebarCollapsed=!this.state.sidebarCollapsed,this.notify("SIDEBAR_TOGGLED",this.state.sidebarCollapsed)}updateSettings(e){this.state.settings={...this.state.settings,...e},this.notify("SETTINGS_UPDATED",this.state.settings)}clearAllData(){localStorage.removeItem(S),this.state=JSON.parse(JSON.stringify(k)),this.notify("DATA_RESET")}}const r=new E;class A{constructor(e,{onOpenSettings:t,onReplayIntro:i}){this.container=e,this.onOpenSettings=t,this.onReplayIntro=i,this.searchQuery="",this.collapsedFolders=new Set,r.subscribe(()=>this.render())}render(){const e=r.getState(),t=e.activeChatId,i=e.chats.filter(n=>n.title.toLowerCase().includes(this.searchQuery.toLowerCase())),s=i.filter(n=>n.pinned),o=i.filter(n=>!n.folderId&&!n.pinned),l=Date.now(),h=864e5,a=o.filter(n=>l-n.createdAt<h),d=o.filter(n=>l-n.createdAt>=h&&l-n.createdAt<2*h),c=o.filter(n=>l-n.createdAt>=2*h&&l-n.createdAt<7*h),g=o.filter(n=>l-n.createdAt>=7*h);this.container.className=`sidebar ${e.sidebarCollapsed?"collapsed":""}`,this.container.innerHTML=`
      <div class="sidebar-header">
        <div class="sidebar-brand-row">
          <a href="#" class="sidebar-brand" id="brand-logo-btn" title="Click to replay intro">
            <div class="sidebar-logo-icon">O</div>
            <span>Vision<span style="color: var(--brand-green);">RAG</span></span>
          </a>
          <button class="sidebar-toggle-btn" id="sidebar-close-btn" title="Collapse sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
        </div>

        <div class="sidebar-actions">
          <button class="btn-new-chat" id="btn-sidebar-new-chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>New chat</span>
          </button>
          <button class="btn-new-folder" id="btn-sidebar-new-folder" title="Create new folder">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
          </button>
        </div>
      </div>

      <div class="sidebar-search">
        <div class="search-input-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="sidebar-search-input" placeholder="Search chats..." value="${this.searchQuery}" />
        </div>
      </div>

      <div class="sidebar-scroll">
        <!-- Folders Section (Like ChatGPT Custom Workspaces / Folders) -->
        <div class="folders-section">
          <div class="section-label">Folders</div>
          ${e.folders.length===0?'<div style="font-size: 12px; color: var(--text-muted); padding: 4px 8px;">No folders yet. Click + to organize.</div>':e.folders.map(n=>{const v=i.filter(m=>m.folderId===n.id),u=this.collapsedFolders.has(n.id);return`
                      <div class="folder-item">
                        <div class="folder-header" data-folder-id="${n.id}">
                          <div class="folder-title-wrap">
                            <span class="folder-icon">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                              </svg>
                            </span>
                            <span class="folder-name">${this.escapeHtml(n.name)}</span>
                            <span style="font-size: 11px; color: var(--text-muted);">(${v.length})</span>
                          </div>
                          <div class="folder-actions">
                            <button class="item-action-btn btn-rename-folder" data-folder-id="${n.id}" title="Rename folder">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                            </button>
                            <button class="item-action-btn btn-delete-folder" data-folder-id="${n.id}" title="Delete folder">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                          </div>
                        </div>
                        <div class="folder-chats-list ${u?"collapsed":""}">
                          ${v.map(m=>this.renderChatItem(m,t)).join("")}
                        </div>
                      </div>
                    `}).join("")}
        </div>

        <!-- Pinned Section -->
        ${s.length>0?`
          <div class="history-section">
            <div class="history-group-title">📌 Pinned</div>
            ${s.map(n=>this.renderChatItem(n,t)).join("")}
          </div>
        `:""}

        <!-- Date-Based History -->
        <div class="history-section">
          ${a.length>0?'<div class="history-group-title">Today</div>':""}
          ${a.map(n=>this.renderChatItem(n,t)).join("")}

          ${d.length>0?'<div class="history-group-title">Yesterday</div>':""}
          ${d.map(n=>this.renderChatItem(n,t)).join("")}

          ${c.length>0?'<div class="history-group-title">Previous 7 Days</div>':""}
          ${c.map(n=>this.renderChatItem(n,t)).join("")}

          ${g.length>0?'<div class="history-group-title">Older</div>':""}
          ${g.map(n=>this.renderChatItem(n,t)).join("")}
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="kb-status-pill">
          <div class="status-dot"></div>
          <span>VisionRAG Online • 18 Multimodal Docs</span>
        </div>
        <div class="user-profile-row" id="user-profile-trigger">
          <div class="user-info">
            <div class="user-avatar">VR</div>
            <div class="user-details">
              <span class="user-name">Vision Explorer</span>
              <span class="user-role">RAG Pro User</span>
            </div>
          </div>
          <button class="btn-open-settings" id="sidebar-settings-btn" title="Open Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </div>
    `,this.bindEvents()}renderChatItem(e,t){return`
      <div class="chat-item ${e.id===t?"active":""}" data-chat-id="${e.id}">
        <span class="chat-item-title">${this.escapeHtml(e.title)}</span>
        <div class="chat-item-actions">
          <button class="item-action-btn btn-pin-chat" data-chat-id="${e.id}" title="${e.pinned?"Unpin":"Pin"}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="${e.pinned?"currentColor":"none"}" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="17" x2="12" y2="22"></line>
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
            </svg>
          </button>
          <button class="item-action-btn btn-move-folder" data-chat-id="${e.id}" title="Move to folder">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          <button class="item-action-btn btn-rename-chat" data-chat-id="${e.id}" title="Rename">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button class="item-action-btn btn-delete-chat" data-chat-id="${e.id}" title="Delete">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `}bindEvents(){const e=this.container.querySelector("#brand-logo-btn");e&&this.onReplayIntro&&e.addEventListener("click",a=>{a.preventDefault(),this.onReplayIntro()});const t=this.container.querySelector("#sidebar-close-btn");t&&t.addEventListener("click",()=>r.toggleSidebar());const i=this.container.querySelector("#btn-sidebar-new-chat");i&&i.addEventListener("click",()=>r.createChat());const s=this.container.querySelector("#btn-sidebar-new-folder");s&&s.addEventListener("click",()=>{const a=prompt("Enter new folder name (e.g. Legal Briefs, Vision Archive):");a&&a.trim()&&r.createFolder(a.trim())});const o=this.container.querySelector("#sidebar-search-input");o&&o.addEventListener("input",a=>{this.searchQuery=a.target.value,this.render()});const l=this.container.querySelector("#sidebar-settings-btn"),h=this.container.querySelector("#user-profile-trigger");l&&this.onOpenSettings&&l.addEventListener("click",a=>{a.stopPropagation(),this.onOpenSettings()}),h&&this.onOpenSettings&&h.addEventListener("click",()=>this.onOpenSettings()),this.container.querySelectorAll(".folder-header").forEach(a=>{a.addEventListener("click",d=>{if(d.target.closest(".item-action-btn"))return;const c=a.dataset.folderId;this.collapsedFolders.has(c)?this.collapsedFolders.delete(c):this.collapsedFolders.add(c),this.render()})}),this.container.querySelectorAll(".btn-rename-folder").forEach(a=>{a.addEventListener("click",d=>{d.stopPropagation();const c=a.dataset.folderId,g=prompt("Rename folder:");g&&g.trim()&&r.renameFolder(c,g.trim())})}),this.container.querySelectorAll(".btn-delete-folder").forEach(a=>{a.addEventListener("click",d=>{d.stopPropagation();const c=a.dataset.folderId;confirm("Delete this folder? Contained chats will be moved to General History.")&&r.deleteFolder(c)})}),this.container.querySelectorAll(".chat-item").forEach(a=>{a.addEventListener("click",d=>{if(d.target.closest(".chat-item-actions"))return;const c=a.dataset.chatId;r.setActiveChat(c)})}),this.container.querySelectorAll(".btn-pin-chat").forEach(a=>{a.addEventListener("click",d=>{d.stopPropagation(),r.togglePinChat(a.dataset.chatId)})}),this.container.querySelectorAll(".btn-move-folder").forEach(a=>{a.addEventListener("click",d=>{d.stopPropagation();const c=a.dataset.chatId,g=r.getState().folders;if(g.length===0){alert("No folders exist yet. Create a folder using the folder icon at the top of the sidebar.");return}const n=g.map((u,m)=>`${m+1}. ${u.name}`).join(`
`),v=prompt(`Select a folder to move this chat into:
0. Unfile (No Folder)
${n}`);if(v!==null){const u=parseInt(v.trim(),10);u===0?r.moveChatToFolder(c,null):u>0&&u<=g.length&&r.moveChatToFolder(c,g[u-1].id)}})}),this.container.querySelectorAll(".btn-rename-chat").forEach(a=>{a.addEventListener("click",d=>{var v;d.stopPropagation();const c=a.dataset.chatId,g=((v=r.getState().chats.find(u=>u.id===c))==null?void 0:v.title)||"",n=prompt("Rename chat:",g);n&&n.trim()&&r.renameChat(c,n.trim())})}),this.container.querySelectorAll(".btn-delete-chat").forEach(a=>{a.addEventListener("click",d=>{d.stopPropagation();const c=a.dataset.chatId;confirm("Delete this chat?")&&r.deleteChat(c)})})}escapeHtml(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}}class M{constructor(e="http://localhost:8000"){this.baseUrl=e,this.isBackendAvailable=!1,this.checkHealth()}async checkHealth(){try{const e=await fetch(`${this.baseUrl}/health`,{method:"GET",signal:AbortSignal.timeout(1800)});this.isBackendAvailable=e.ok}catch{this.isBackendAvailable=!1}return this.isBackendAvailable}async uploadFile(e,t){if(this.isBackendAvailable){const i=new FormData;return i.append("file",e),await(await fetch(`${this.baseUrl}/api/uploads`,{method:"POST",body:i})).json()}for(let i=10;i<=100;i+=30)await new Promise(s=>setTimeout(s,80)),t&&t(i);return{success:!0,fileId:"f-"+Date.now(),filename:e.name,fileType:e.type||"application/octet-stream",size:(e.size/(1024*1024)).toFixed(2)+" MB",pagesOrDuration:e.type.includes("pdf")?"12 pages":e.type.includes("video")?"03:45 min":"1 image"}}async queryVisionRAG({prompt:e,attachments:t=[],settings:i={},onChunk:s,abortSignal:o}){if(this.isBackendAvailable&&!i.mockMode)try{const l=await fetch(`${this.baseUrl}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:e,attachments:t.map(h=>h.name),settings:i}),signal:o});if(l.ok&&l.body){const h=l.body.getReader(),a=new TextDecoder;let d="";for(;;){const{done:c,value:g}=await h.read();if(c)break;const n=a.decode(g);d+=n,s&&s(n,!1)}return s&&s("",!0),{text:d,sources:[]}}}catch(l){console.warn("Backend query failed, activating neural simulation fallback:",l)}return this.generateSimulatedRAGResponse(e,t,i,s,o)}async generateSimulatedRAGResponse(e,t,i,s,o){var n,v,u,m,y,b;const l=e.toLowerCase();let h="",a=[];const d=t.map(p=>p.name).join(", ")||"indexed knowledge base";l.includes("chart")||l.includes("financial")||l.includes("revenue")||l.includes("table")||l.includes("quarter")?(h=`Based on the multimodal retrieval from **${d}**, here is the synthesized financial analysis:

### 📊 Revenue & Margin Breakdown:
- **Q3 Operating Revenue:** $48.2M (+14.3% YoY growth).
- **Gross Profit Margin:** 68.4% driven by lower infrastructure compute overhead.
- **Visual Chart Observation (Page 4):** The bar chart indicates Enterprise SaaS accounts for 71% of total ARR.

### 📌 Key Takeaway:
Customer retention improved to 109% Net Retention Rate (NRR) following the rollout of automated visual document workflows.`,a=[{id:"src-fin-1",title:((n=t[0])==null?void 0:n.name)||"q3_earnings_report.pdf",page:4,matchScore:97,type:"pdf",chunk:"Table 4.1: Consolidated Quarterly Revenue Breakdown by Segment (Enterprise SaaS: $34.2M, Pro: $9.8M, Services: $4.2M).",bbox:[140,220,520,680]},{id:"src-fin-2",title:((v=t[0])==null?void 0:v.name)||"q3_earnings_report.pdf",page:7,matchScore:89,type:"pdf",chunk:"Audited operating expenses reduced by 8.5% due to automated invoice and receipt extraction.",bbox:[80,110,400,390]}]):l.includes("video")||l.includes("timestamp")||l.includes("clip")||l.includes("motion")||l.includes("cctv")?(h=`Multimodal temporal video indexing processed **${d}** at **${i.fps||1} fps**.

### 🎬 Key Temporal Events Identified:
- **00:42 - 01:05:** Subject enters frame from camera left corridor.
- **01:18 (Keyframe):** Object interaction detected with the automated storage bay door.
- **02:30:** Activity concludes with bay door successfully locked and status indicator flashing green.

The temporal grounding confidence is **95.8%**, verified against SigLIP visual embeddings.`,a=[{id:"src-vid-1",title:((u=t[0])==null?void 0:u.name)||"inspection_cam_stream.mp4",page:"01:18",matchScore:95,type:"video",chunk:"Keyframe #2340: Bounding box [180, 320, 420, 610] tracking door latch sensor engagement.",bbox:[180,320,420,610]}]):l.includes("schematic")||l.includes("circuit")||l.includes("diagram")||l.includes("code")||l.includes("python")?(h=`I have inspected the visual diagram in **${d}** using ColPali multivector token alignment.

### ⚡ Architectural / Component Summary:
1. **Core Processing Unit:** Microcontroller with SPI bus interfacing to 12-bit ADC.
2. **Decoupling Capacitors:** 100nF ceramic capacitors placed adjacent to pins 4 and 18 for high-frequency noise suppression.

Here is a sample Python query snippet to filter retrieved vector patches from Qdrant:

\`\`\`python
from visionrag.retrieval import MultimodalSearch

searcher = MultimodalSearch(model="colpali-v1.2", top_k=${i.topK||4})
results = searcher.search_document(
    doc_path="${((m=t[0])==null?void 0:m.name)||"diagram.pdf"}",
    query="${e.replace(/"/g,"")}",
    similarity_threshold=${i.similarityThreshold||.75}
)
for patch in results.patches:
    print(f"Page {patch.page_idx} [Score: {patch.score:.2f}]: {patch.label}")
\`\`\``,a=[{id:"src-diag-1",title:((y=t[0])==null?void 0:y.name)||"engineering_schematic.png",page:1,matchScore:94,type:"image",chunk:"Pinout diagram showing SPI lines SCK, MISO, MOSI connected to secondary sensor bus.",bbox:[210,150,490,580]}]):(h=`I analyzed your inquiry against the indexed multimodal repository.

### 🔍 Summary of Insights:
- **Context Retrieval:** Evaluated top-${i.topK||5} candidate document chunks using **${i.visionModel||"CLIP ViT-L/14"}** and hybrid BM25 scoring.
- **Relevance Assessment:** Identified relevant content matching: *"${e}"*.
- **Cross-Modal Verification:** Verified text OCR alignment with visual bounding contours.

You can upload additional PDFs, high-resolution diagrams, or video feeds to inspect specific keyframes or tabular cross-sections.`,a=[{id:"src-gen-1",title:((b=t[0])==null?void 0:b.name)||"knowledge_base_core.pdf",page:2,matchScore:91,type:"pdf",chunk:"Retrieved passage corresponding to semantic query intent with high cross-attention alignment.",bbox:[100,100,400,400]}]);const c=h.split(" ");let g="";for(let p=0;p<c.length&&!(o&&o.aborted);p++)g+=(p===0?"":" ")+c[p],s&&s(g,!1),await new Promise(w=>setTimeout(w,22));return s&&s(g,!0),{text:g,sources:a}}}const x=new M;class L{constructor(e,{onOpenVoice:t,onOpenVideo:i,onOpenSource:s,onOpenSettings:o}){this.container=e,this.onOpenVoice=t,this.onOpenVideo=i,this.onOpenSource=s,this.onOpenSettings=o,this.abortController=null,this.speechRecognition=null,this.isRecordingVoice=!1,this.initSpeechRecognition(),r.subscribe((l,h)=>{h!=="STREAMING_CHUNK"&&this.render()})}initSpeechRecognition(){const e=window.SpeechRecognition||window.webkitSpeechRecognition;e&&(this.speechRecognition=new e,this.speechRecognition.continuous=!1,this.speechRecognition.interimResults=!0,this.speechRecognition.lang="en-US",this.speechRecognition.onresult=t=>{const i=Array.from(t.results).map(o=>o[0].transcript).join(""),s=this.container.querySelector("#chat-textarea");s&&(s.value=i,this.updateTextareaHeight(s),this.updateSendButtonState())},this.speechRecognition.onend=()=>{this.isRecordingVoice=!1;const t=this.container.querySelector("#btn-mic-input");t&&t.classList.remove("recording")},this.speechRecognition.onerror=t=>{console.warn("Speech recognition notice:",t.error),this.isRecordingVoice=!1;const i=this.container.querySelector("#btn-mic-input");i&&i.classList.remove("recording")})}toggleSpeechInput(){if(!this.speechRecognition){alert("Speech recognition is not supported in this browser. Please type your message.");return}const e=this.container.querySelector("#btn-mic-input");if(this.isRecordingVoice)this.speechRecognition.stop(),this.isRecordingVoice=!1,e&&e.classList.remove("recording");else try{this.speechRecognition.start(),this.isRecordingVoice=!0,e&&e.classList.add("recording")}catch(t){console.error("Error starting mic:",t)}}render(){const e=r.getState(),t=r.getActiveChat(),i=t&&t.messages.length>0,s=e.isStreaming;this.container.innerHTML=`
      <!-- Top App Header -->
      <header class="chat-header">
        <div class="header-left">
          <button class="header-sidebar-trigger" id="btn-toggle-sidebar" title="Toggle sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
          
          <div class="model-selector-wrap">
            <button class="model-pill-btn" id="btn-select-model">
              <span>VisionRAG Omni v2.5</span>
              <span class="model-badge">Vision Pro</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div class="header-right">
          <button class="header-action-btn" id="btn-open-camera" title="Live Camera & Visual Stream">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
            <span>Live Camera</span>
          </button>

          <button class="header-action-btn" id="btn-open-voice-mode" title="Hands-free Voice Mode">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            <span>Voice Mode</span>
          </button>

          <button class="header-action-btn" id="btn-new-chat-top" title="New Chat">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </header>

      <!-- Messages Scroll Area -->
      <div class="messages-container" id="messages-container">
        <div class="messages-inner" id="messages-inner">
          ${i?t.messages.map(o=>this.renderMessage(o)).join(""):this.renderEmptyHero()}
        </div>
      </div>

      <!-- Bottom Chat Input Area -->
      <div class="chat-input-wrapper">
        <div class="chat-input-inner">
          <!-- Upload Preview Tray -->
          ${e.activeAttachments.length>0?`
            <div class="attachments-preview-tray">
              ${e.activeAttachments.map(o=>`
                <div class="upload-card-chip">
                  <div class="upload-file-icon">
                    ${this.getFileIconSvg(o.type)}
                  </div>
                  <div class="upload-file-meta">
                    <span class="upload-file-name" title="${this.escapeHtml(o.name)}">${this.escapeHtml(o.name)}</span>
                    <span class="upload-file-size">${o.size}</span>
                  </div>
                  <button class="btn-remove-attachment" data-att-id="${o.id}" title="Remove file">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  <div class="upload-progress-line" style="width: ${o.progress||100}%;"></div>
                </div>
              `).join("")}
            </div>
          `:""}

          <!-- Pill Input Container -->
          <div class="input-pill-container">
            <div class="input-actions-left">
              <input type="file" id="file-upload-input" multiple style="display: none;" accept=".pdf,.png,.jpg,.jpeg,.mp4,.webm,.wav,.mp3,.txt,.csv,.md" />
              <button class="input-action-btn" id="btn-attach-file" title="Upload PDF, Image, Video, Audio">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>

            <textarea
              id="chat-textarea"
              class="chat-textarea"
              rows="1"
              placeholder="Ask anything or upload PDF, image, video..."
            ></textarea>

            <div class="input-actions-right">
              <button class="btn-voice-input ${this.isRecordingVoice?"recording":""}" id="btn-mic-input" title="Voice dictation">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </button>

              ${s?`
                <button class="btn-stop-generating" id="btn-stop-stream" title="Stop generating">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="5" y="5" width="14" height="14" rx="2"></rect>
                  </svg>
                </button>
              `:`
                <button class="btn-send-message" id="btn-send-message" title="Send message" disabled>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </button>
              `}
            </div>
          </div>

          <div class="input-disclaimer-text">
            VisionRAG Multimodal Neural Engine • Verify cited document pages, image regions & video timestamps.
          </div>
        </div>
      </div>
    `,this.bindEvents(),this.scrollToBottom()}renderEmptyHero(){return`
      <div class="empty-state-hero">
        <div class="hero-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="4"></circle>
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
          </svg>
        </div>
        <div class="hero-title">What can VisionRAG analyze for you?</div>
        <div class="hero-subtitle">
          Ask questions across complex visual documents, PDFs with tables and diagrams, high-resolution imagery, or temporal video streams.
        </div>

        <div class="suggestions-grid">
          <div class="suggestion-card" data-prompt="Analyze the financial balance sheet in the uploaded PDF and extract the Q3 EBITDA margins.">
            <div class="suggestion-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div class="suggestion-info">
              <span class="suggestion-headline">Extract PDF Financial Tables</span>
              <span class="suggestion-prompt">Identify operating revenue, EBITDA, and tabular margins.</span>
            </div>
          </div>

          <div class="suggestion-card" data-prompt="Scan the inspection video clip and pinpoint timestamps where safety equipment was missing.">
            <div class="suggestion-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
            </div>
            <div class="suggestion-info">
              <span class="suggestion-headline">Temporal Video Analysis</span>
              <span class="suggestion-prompt">Detect events, objects, and keyframe timestamps.</span>
            </div>
          </div>

          <div class="suggestion-card" data-prompt="Inspect this circuit schematic diagram and extract all resistor values and step-down ICs.">
            <div class="suggestion-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
            <div class="suggestion-info">
              <span class="suggestion-headline">Circuit & Blueprint OCR</span>
              <span class="suggestion-prompt">Detect electrical components and trace signal paths.</span>
            </div>
          </div>

          <div class="suggestion-card" data-prompt="Write a Python script using ColPali multi-vector retrieval for indexing high-res PDF pages.">
            <div class="suggestion-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            </div>
            <div class="suggestion-info">
              <span class="suggestion-headline">Multimodal Code Assistant</span>
              <span class="suggestion-prompt">Generate ColPali, SigLIP, and Qdrant ingestion scripts.</span>
            </div>
          </div>
        </div>
      </div>
    `}renderMessage(e){const t=e.sender==="user";return`
      <div class="message-row ${t?"user":"assistant"}">
        ${t?"":`
          <div class="message-avatar assistant-avatar" title="VisionRAG Assistant">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
          </div>
        `}

        <div class="${t?"user-bubble":"assistant-bubble"}">
          <div class="assistant-text">
            ${this.formatMarkdown(e.text)}
            ${e.isStreaming?'<span class="streaming-cursor"></span>':""}
          </div>

          <!-- Attachments chips for user message -->
          ${t&&e.attachments&&e.attachments.length>0?`
            <div class="user-attachments-grid">
              ${e.attachments.map(i=>`
                <div class="user-file-chip">
                  ${this.getFileIconSvg(i.type)}
                  <span>${this.escapeHtml(i.name)}</span>
                </div>
              `).join("")}
            </div>
          `:""}

          <!-- RAG Grounding Sources Pill Row -->
          ${!t&&e.sources&&e.sources.length>0?`
            <div class="rag-grounding-box">
              <div class="grounding-box-header">
                <span>Retrieved Grounding Sources (${e.sources.length})</span>
                <span style="font-weight: normal; color: var(--text-muted); font-size: 11px;">Click to view bounding box & page</span>
              </div>
              <div class="sources-pill-row">
                ${e.sources.map(i=>`
                  <button class="citation-pill" data-source-id="${i.id}" title="Inspect source chunk and visual bounding box">
                    ${this.getFileIconSvg(i.type)}
                    <span>${this.escapeHtml(i.title)} (p. ${i.page})</span>
                    <span class="match-badge">${i.matchScore}%</span>
                  </button>
                `).join("")}
              </div>
            </div>
          `:""}

          <!-- Assistant Action Toolbar -->
          ${!t&&!e.isStreaming?`
            <div class="message-actions-toolbar">
              <button class="action-icon-btn btn-copy-msg" data-text="${this.escapeAttr(e.text)}" title="Copy message">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              <button class="action-icon-btn btn-tts-msg" data-text="${this.escapeAttr(e.text)}" title="Read message aloud">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
              </button>
              <button class="action-icon-btn" title="Good response">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
              </button>
              <button class="action-icon-btn" title="Poor response">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path></svg>
              </button>
            </div>
          `:""}
        </div>

        ${t?`
          <div class="message-avatar user-avatar" title="You">
            VR
          </div>
        `:""}
      </div>
    `}bindEvents(){const e=this.container.querySelector("#btn-toggle-sidebar");e&&e.addEventListener("click",()=>r.toggleSidebar());const t=this.container.querySelector("#btn-new-chat-top");t&&t.addEventListener("click",()=>r.createChat());const i=this.container.querySelector("#btn-open-camera");i&&this.onOpenVideo&&i.addEventListener("click",()=>this.onOpenVideo());const s=this.container.querySelector("#btn-open-voice-mode");s&&this.onOpenVoice&&s.addEventListener("click",()=>this.onOpenVoice());const o=this.container.querySelector("#btn-select-model");o&&this.onOpenSettings&&o.addEventListener("click",()=>this.onOpenSettings()),this.container.querySelectorAll(".suggestion-card").forEach(n=>{n.addEventListener("click",()=>{const v=n.dataset.prompt,u=this.container.querySelector("#chat-textarea");u&&(u.value=v,this.handleSendMessage())})});const l=this.container.querySelector("#btn-attach-file"),h=this.container.querySelector("#file-upload-input");l&&h&&(l.addEventListener("click",()=>h.click()),h.addEventListener("change",n=>this.handleFileUpload(n.target.files))),this.container.querySelectorAll(".btn-remove-attachment").forEach(n=>{n.addEventListener("click",v=>{v.stopPropagation(),r.removeAttachment(n.dataset.attId)})});const a=this.container.querySelector("#chat-textarea");a&&(a.addEventListener("input",()=>{this.updateTextareaHeight(a),this.updateSendButtonState()}),a.addEventListener("keydown",n=>{n.key==="Enter"&&!n.shiftKey&&(n.preventDefault(),this.handleSendMessage())}));const d=this.container.querySelector("#btn-mic-input");d&&d.addEventListener("click",()=>this.toggleSpeechInput());const c=this.container.querySelector("#btn-send-message");c&&c.addEventListener("click",()=>this.handleSendMessage());const g=this.container.querySelector("#btn-stop-stream");g&&g.addEventListener("click",()=>{this.abortController&&(this.abortController.abort(),this.abortController=null),r.setStreaming(!1)}),this.container.querySelectorAll(".citation-pill").forEach(n=>{n.addEventListener("click",()=>{const v=n.dataset.sourceId,u=r.getActiveChat();let m=null;if(u){for(const y of u.messages)if(y.sources&&(m=y.sources.find(b=>b.id===v),m))break}m&&this.onOpenSource&&this.onOpenSource(m)})}),this.container.querySelectorAll(".btn-copy-msg").forEach(n=>{n.addEventListener("click",()=>{const v=n.dataset.text;navigator.clipboard.writeText(v),n.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',setTimeout(()=>{n.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'},1800)})}),this.container.querySelectorAll(".btn-tts-msg").forEach(n=>{n.addEventListener("click",()=>{const v=n.dataset.text;this.speakText(v)})}),this.container.querySelectorAll(".btn-copy-code").forEach(n=>{n.addEventListener("click",()=>{const v=n.closest(".code-block-wrap").querySelector("pre");v&&(navigator.clipboard.writeText(v.innerText),n.innerText="Copied!",setTimeout(()=>n.innerText="Copy code",2e3))})})}updateTextareaHeight(e){e.style.height="auto",e.style.height=`${Math.min(e.scrollHeight,200)}px`}updateSendButtonState(){const e=this.container.querySelector("#chat-textarea"),t=this.container.querySelector("#btn-send-message");if(!e||!t)return;const i=e.value.trim().length>0,s=r.getState().activeAttachments.length>0;i||s?(t.classList.add("active"),t.removeAttribute("disabled")):(t.classList.remove("active"),t.setAttribute("disabled","true"))}async handleFileUpload(e){if(!(!e||e.length===0)){for(const t of Array.from(e)){const i="att-"+Date.now()+"-"+Math.random().toString(36).substr(2,4),s={id:i,name:t.name,type:t.type,size:(t.size/(1024*1024)).toFixed(2)+" MB",progress:15,fileObj:t};r.addAttachment(s),await x.uploadFile(t,o=>{r.updateAttachmentProgress(i,o)})}this.updateSendButtonState()}}async handleSendMessage(){const e=this.container.querySelector("#chat-textarea");if(!e)return;const t=e.value.trim(),i=[...r.getState().activeAttachments];if(!t&&i.length===0)return;let s=r.getActiveChat();s||(s=r.createChat());const o={id:"msg-"+Date.now(),sender:"user",text:t,timestamp:Date.now(),attachments:i.map(a=>({name:a.name,type:a.type,size:a.size}))};r.addMessage(s.id,o),e.value="",e.style.height="auto",r.clearAttachments(),this.updateSendButtonState();const l="msg-"+(Date.now()+1),h={id:l,sender:"assistant",text:"",timestamp:Date.now(),isStreaming:!0,sources:[]};r.addMessage(s.id,h),r.setStreaming(!0),this.abortController=new AbortController;try{const a=await x.queryVisionRAG({prompt:t||"Please inspect the uploaded media and provide multimodal grounding.",attachments:i,settings:r.getState().settings,abortSignal:this.abortController.signal,onChunk:(c,g)=>{const n=r.getActiveChat();if(n){const v=n.messages.find(u=>u.id===l);v&&(v.text=c,v.isStreaming=!g,this.updateStreamingMessageDOM(l,c,!g))}}}),d=r.getActiveChat();if(d){const c=d.messages.find(g=>g.id===l);c&&(c.text=a.text,c.sources=a.sources,c.isStreaming=!1)}r.getState().settings.autoSpeak&&this.speakText(a.text)}catch(a){console.error("Error during generation:",a)}finally{r.setStreaming(!1),this.abortController=null,r.notify("STREAMING_DONE")}}updateStreamingMessageDOM(e,t,i){const s=this.container.querySelector("#messages-inner");if(!s)return;const o=s.querySelector(`[data-msg-id="${e}"]`)||s.lastElementChild;if(o){const l=o.querySelector(".assistant-text");l&&(l.innerHTML=`${this.formatMarkdown(t)}${i?'<span class="streaming-cursor"></span>':""}`)}this.scrollToBottom()}scrollToBottom(){const e=this.container.querySelector("#messages-container");e&&(e.scrollTop=e.scrollHeight)}speakText(e){if(!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const t=e.replace(/#+\s/g,"").replace(/\*+/g,"").replace(/`+/g,"").replace(/\[.*?\]\(.*?\)/g,""),i=new SpeechSynthesisUtterance(t),s=r.getState().settings;i.rate=s.speechRate||1,i.pitch=s.speechPitch||1,window.speechSynthesis.speak(i)}formatMarkdown(e){return e?(e=e.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g,(i,s,o)=>`
        <div class="code-block-wrap">
          <div class="code-header-bar">
            <span>${s||"code"}</span>
            <button class="btn-copy-code">Copy code</button>
          </div>
          <pre><code>${this.escapeHtml(o.trim())}</code></pre>
        </div>
      `),e=e.replace(/^### (.*$)/gim,"<h3>$1</h3>"),e=e.replace(/^## (.*$)/gim,"<h3>$1</h3>"),e=e.replace(/^# (.*$)/gim,"<h3>$1</h3>"),e=e.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\*(.*?)\*/g,"<em>$1</em>"),e=e.replace(/`([^`]+)`/g,"<code>$1</code>"),e=e.replace(/^\s*-\s+(.*$)/gim,"<li>$1</li>"),e=e.replace(/^\s*\d+\.\s+(.*$)/gim,"<li>$1</li>"),e=e.replace(/(<li>.*<\/li>)/gms,"<ul>$1</ul>"),e.split(/\n\n+/).map(i=>(i=i.trim(),i.startsWith("<h3>")||i.startsWith("<ul>")||i.startsWith('<div class="code-block-wrap">')?i:`<p>${i.replace(/\n/g,"<br/>")}</p>`)).join("")):""}getFileIconSvg(e){return e?e.includes("pdf")?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>':e.includes("image")?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10a37f" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>':e.includes("video")?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path></svg>'}escapeHtml(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}escapeAttr(e){return e?e.replace(/"/g,"&quot;").replace(/'/g,"&#39;"):""}}class T{constructor(e){this.container=e,this.recognition=null,this.isListening=!1,this.isSpeaking=!1,this.audioContext=null,this.analyser=null,this.animationFrame=null}open(){this.render(),this.startVoiceSession()}close(){this.stopVoiceSession(),this.container.innerHTML=""}render(){this.container.innerHTML=`
      <div class="voice-mode-overlay" id="voice-overlay">
        <div class="voice-overlay-header">
          <div class="voice-status-title">
            <span id="voice-status-badge">Listening...</span>
          </div>
          <button class="voice-circle-btn btn-close-voice" id="btn-exit-voice" title="End Voice Chat">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="voice-orb-container">
          <!-- Fluid Glowing Voice Orb -->
          <div class="voice-fluid-orb" id="voice-fluid-orb"></div>
          <div class="voice-transcript-text" id="voice-live-transcript">
            Speak naturally to query your documents, diagrams, and video archives...
          </div>
        </div>

        <div class="voice-controls-bar">
          <button class="voice-circle-btn" id="btn-toggle-mic" title="Mute/Unmute Mic">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>

          <button class="voice-circle-btn" id="btn-interrupt-speech" title="Interrupt Assistant">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
        </div>
      </div>
    `,this.bindEvents()}bindEvents(){const e=this.container.querySelector("#btn-exit-voice");e&&e.addEventListener("click",()=>this.close());const t=this.container.querySelector("#btn-toggle-mic");t&&t.addEventListener("click",()=>{this.isListening?(this.stopListening(),t.style.color="#ef4444"):(this.startListening(),t.style.color="inherit")});const i=this.container.querySelector("#btn-interrupt-speech");i&&i.addEventListener("click",()=>{"speechSynthesis"in window&&(window.speechSynthesis.cancel(),this.isSpeaking=!1,this.updateOrbState(),this.startListening())})}startVoiceSession(){const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(!e){const t=this.container.querySelector("#voice-live-transcript");t&&(t.innerText="Speech recognition is not supported in this browser. Please use standard chat or a Chromium browser.");return}this.recognition=new e,this.recognition.continuous=!1,this.recognition.interimResults=!0,this.recognition.lang="en-US",this.recognition.onstart=()=>{this.isListening=!0,this.updateOrbState("Listening...")},this.recognition.onresult=t=>{const i=Array.from(t.results).map(o=>o[0].transcript).join(""),s=this.container.querySelector("#voice-live-transcript");s&&(s.innerText=`“${i}”`),t.results[0].isFinal&&this.processVoiceQuery(i)},this.recognition.onend=()=>{this.isListening=!1,this.isSpeaking||this.updateOrbState("Idle")},this.startListening()}startListening(){if(this.recognition&&!this.isListening&&!this.isSpeaking)try{this.recognition.start(),this.isListening=!0,this.updateOrbState("Listening...")}catch(e){console.warn("Recognition start caught:",e)}}stopListening(){if(this.recognition&&this.isListening)try{this.recognition.stop(),this.isListening=!1,this.updateOrbState("Mic paused")}catch(e){console.warn("Recognition stop caught:",e)}}async processVoiceQuery(e){this.stopListening(),this.updateOrbState("Thinking & Retrieving...");const t=r.getActiveChat()||r.createChat();r.addMessage(t.id,{id:"msg-"+Date.now(),sender:"user",text:e,timestamp:Date.now()});const i=await x.queryVisionRAG({prompt:e,settings:r.getState().settings});r.addMessage(t.id,{id:"msg-"+(Date.now()+1),sender:"assistant",text:i.text,timestamp:Date.now(),sources:i.sources}),this.speakResponse(i.text)}speakResponse(e){if(!("speechSynthesis"in window))return;window.speechSynthesis.cancel(),this.isSpeaking=!0,this.updateOrbState("Speaking...");const t=e.replace(/#+\s/g,"").replace(/\*+/g,"").replace(/`+/g,"").replace(/\[.*?\]\(.*?\)/g,""),i=new SpeechSynthesisUtterance(t),s=r.getState().settings;i.rate=s.speechRate||1,i.pitch=s.speechPitch||1;const o=this.container.querySelector("#voice-live-transcript");o&&(o.innerText=t.slice(0,160)+(t.length>160?"...":"")),i.onend=()=>{this.isSpeaking=!1,this.updateOrbState("Listening..."),this.startListening()},i.onerror=()=>{this.isSpeaking=!1,this.updateOrbState("Listening..."),this.startListening()},window.speechSynthesis.speak(i)}updateOrbState(e){const t=this.container.querySelector("#voice-status-badge"),i=this.container.querySelector("#voice-fluid-orb");t&&e&&(t.innerText=e),i&&(this.isSpeaking?i.classList.add("speaking"):i.classList.remove("speaking"))}stopVoiceSession(){if("speechSynthesis"in window&&window.speechSynthesis.cancel(),this.recognition){try{this.recognition.stop()}catch(e){console.warn(e)}this.recognition=null}this.isListening=!1,this.isSpeaking=!1}}class R{constructor(e){this.container=e,this.stream=null}open(){this.render(),this.startCamera()}close(){this.stopCamera(),this.container.innerHTML=""}render(){this.container.innerHTML=`
      <div class="video-mode-modal" id="video-modal-overlay">
        <div class="video-modal-card">
          <div class="modal-header-bar">
            <div class="modal-title" style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #ef4444; animation: micPulse 1.2s infinite;"></span>
              <span>VisionRAG Live Visual Stream</span>
            </div>
            <button class="action-icon-btn" id="btn-close-video-modal" title="Close Camera">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="video-viewport-area">
            <video id="webcam-video-element" class="live-webcam-feed" autoplay playsinline muted></video>
            
            <!-- Real-time Vision Detection Bounding Box Overlay -->
            <div class="vision-detection-box" style="top: 25%; left: 30%; width: 40%; height: 50%;">
              <div class="detection-tag">ColPali Visual Grounding [96.4%]</div>
            </div>

            <!-- Fallback Canvas for snapshot extraction -->
            <canvas id="snapshot-canvas" style="display: none;"></canvas>
          </div>

          <div class="video-controls-bottom">
            <div style="font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span>Point camera at any document, printed diagram, or screen to extract insights.</span>
            </div>

            <button class="btn-snap-frame" id="btn-capture-snapshot">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19 4h-3.5l-2-2h-3l-2 2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
              </svg>
              <span>Capture Frame for RAG</span>
            </button>
          </div>
        </div>
      </div>
    `,this.bindEvents()}async startCamera(){const e=this.container.querySelector("#webcam-video-element");if(e)try{if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)this.stream=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:720},facingMode:"user"}}),e.srcObject=this.stream;else throw new Error("getUserMedia is not supported")}catch(t){console.warn("Webcam permission not granted or device unavailable. Running visual test pattern:",t),e.style.display="none";const i=this.container.querySelector(".video-viewport-area");i&&(i.innerHTML+=`
          <div style="color: #ffffff; text-align: center; padding: 40px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#10a37f" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            <div style="font-size: 15px; font-weight: 600;">Camera Simulation Mode</div>
            <div style="font-size: 12.5px; color: #9ca3af; max-width: 420px;">
              Webcam permission is unavailable. You can click "Capture Frame for RAG" to inject a high-resolution circuit diagram into the conversation!
            </div>
          </div>
        `)}}stopCamera(){this.stream&&(this.stream.getTracks().forEach(e=>e.stop()),this.stream=null)}bindEvents(){const e=this.container.querySelector("#btn-close-video-modal"),t=this.container.querySelector("#video-modal-overlay");e&&e.addEventListener("click",()=>this.close()),t&&t.addEventListener("click",s=>{s.target===t&&this.close()});const i=this.container.querySelector("#btn-capture-snapshot");i&&i.addEventListener("click",()=>this.captureSnapshot())}captureSnapshot(){const e=this.container.querySelector("#webcam-video-element"),t=this.container.querySelector("#snapshot-canvas");let i=`webcam_frame_${Date.now()}.png`;e&&this.stream&&t?(t.width=e.videoWidth||640,t.height=e.videoHeight||480,t.getContext("2d").drawImage(e,0,0,t.width,t.height),r.addAttachment({id:"att-"+Date.now(),name:i,type:"image/png",size:"1.24 MB",progress:100})):r.addAttachment({id:"att-"+Date.now(),name:"captured_schematic_keyframe.png",type:"image/png",size:"1.85 MB",progress:100}),this.close();const s=document.querySelector("#chat-textarea");s&&(s.value="Analyze the captured frame from the live camera stream and locate any components or text.",s.focus())}}class ${constructor(e,{onReplayIntro:t}){this.container=e,this.onReplayIntro=t,this.activeTab="general"}open(){this.render()}close(){this.container.innerHTML=""}render(){const e=r.getState().settings;this.container.innerHTML=`
      <div class="settings-modal-overlay" id="settings-overlay">
        <div class="settings-card">
          <!-- Left Settings Sidebar Tabs -->
          <div class="settings-sidebar">
            <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); padding: 4px 10px 10px 10px;">Settings</div>
            
            <button class="settings-tab-btn ${this.activeTab==="general"?"active":""}" data-tab="general">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <span>General</span>
            </button>

            <button class="settings-tab-btn ${this.activeTab==="rag"?"active":""}" data-tab="rag">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span>RAG & Retrieval</span>
            </button>

            <button class="settings-tab-btn ${this.activeTab==="vision"?"active":""}" data-tab="vision">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle></svg>
              <span>Vision & OCR</span>
            </button>

            <button class="settings-tab-btn ${this.activeTab==="voice"?"active":""}" data-tab="voice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>
              <span>Voice & Audio</span>
            </button>

            <button class="settings-tab-btn ${this.activeTab==="backend"?"active":""}" data-tab="backend">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
              <span>Backend API</span>
            </button>

            <button class="settings-tab-btn ${this.activeTab==="data"?"active":""}" data-tab="data">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Data & Export</span>
            </button>
          </div>

          <!-- Right Content Panel -->
          <div class="settings-content-panel">
            ${this.renderActiveTabContent(e)}
          </div>
        </div>
      </div>
    `,this.bindEvents()}renderActiveTabContent(e){return this.activeTab==="general"?`
        <div class="settings-group-title">General Preferences</div>
        
        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Color Theme</span>
            <span class="settings-sublabel">VisionRAG default is clean white ChatGPT aesthetic</span>
          </div>
          <select class="settings-select" id="setting-theme">
            <option value="white" ${e.theme==="white"?"selected":""}>Pure White (ChatGPT Standard)</option>
            <option value="soft" ${e.theme==="soft"?"selected":""}>Soft Neutral</option>
          </select>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Intro Splash Animation</span>
            <span class="settings-sublabel">Replay the futuristic 'O' letter and blinking eye intro</span>
          </div>
          <button class="btn-new-chat" id="btn-replay-splash" style="width: auto; padding: 7px 14px;">
            <span>Replay Intro</span>
          </button>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Typewriter Pacing</span>
            <span class="settings-sublabel">Text generation speed for assistant responses</span>
          </div>
          <select class="settings-select">
            <option value="fast" selected>Natural Streaming (22ms)</option>
            <option value="instant">Instant Render</option>
          </select>
        </div>
      `:this.activeTab==="rag"?`
        <div class="settings-group-title">RAG & Retrieval Hyperparameters</div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Top-K Chunks Retrieved</span>
            <span class="settings-sublabel">Number of highest-scoring document patches to ingest</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="range" class="settings-slider" id="setting-topk" min="1" max="10" value="${e.topK}" />
            <span style="font-weight: 600; font-size: 13px;" id="topk-val">${e.topK}</span>
          </div>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Cosine Similarity Threshold</span>
            <span class="settings-sublabel">Cutoff score for vector patch grounding</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="range" class="settings-slider" id="setting-threshold" min="0.5" max="0.95" step="0.05" value="${e.similarityThreshold}" />
            <span style="font-weight: 600; font-size: 13px;" id="threshold-val">${e.similarityThreshold}</span>
          </div>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Cross-Encoder Neural Reranker</span>
            <span class="settings-sublabel">Re-ranks top candidates using BGE-Reranker-Large</span>
          </div>
          <input type="checkbox" id="setting-reranker" ${e.rerankerEnabled?"checked":""} style="width: 18px; height: 18px; accent-color: var(--brand-green);" />
        </div>
      `:this.activeTab==="vision"?`
        <div class="settings-group-title">Vision & Multimodal Processing</div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Vision Embedding Model</span>
            <span class="settings-sublabel">Multimodal patch and document encoder</span>
          </div>
          <select class="settings-select" id="setting-vision-model">
            <option value="colpali-v1.2" ${e.visionModel==="colpali-v1.2"?"selected":""}>ColPali v1.2 (Multi-Vector Patch)</option>
            <option value="clip-vit-l-14" ${e.visionModel==="clip-vit-l-14"?"selected":""}>CLIP ViT-L/14 (Standard)</option>
            <option value="siglip-so400m" ${e.visionModel==="siglip-so400m"?"selected":""}>SigLIP SO400M (High Precision)</option>
          </select>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">OCR Extraction Engine</span>
            <span class="settings-sublabel">Optical character recognition for scanned diagrams</span>
          </div>
          <select class="settings-select" id="setting-ocr">
            <option value="easyocr" ${e.ocrEngine==="easyocr"?"selected":""}>EasyOCR (Deep Learning)</option>
            <option value="tesseract" ${e.ocrEngine==="tesseract"?"selected":""}>Tesseract 5.3 (Fast)</option>
            <option value="paddleocr" ${e.ocrEngine==="paddleocr"?"selected":""}>PaddleOCR (Multilingual)</option>
          </select>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Video Keyframe Sampling Rate</span>
            <span class="settings-sublabel">Frames per second extracted from video feeds</span>
          </div>
          <select class="settings-select" id="setting-fps">
            <option value="0.5" ${e.fps===.5?"selected":""}>0.5 fps (1 frame every 2 sec)</option>
            <option value="1" ${e.fps===1?"selected":""}>1.0 fps (Standard)</option>
            <option value="2" ${e.fps===2?"selected":""}>2.0 fps (High Temporal Density)</option>
          </select>
        </div>
      `:this.activeTab==="voice"?`
        <div class="settings-group-title">Voice & Audio Synthesis</div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Auto-Read Responses Aloud</span>
            <span class="settings-sublabel">Automatically speak assistant answers after generation</span>
          </div>
          <input type="checkbox" id="setting-autospeak" ${e.autoSpeak?"checked":""} style="width: 18px; height: 18px; accent-color: var(--brand-green);" />
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Speech Rate</span>
            <span class="settings-sublabel">Playback speed for text-to-speech voice</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="range" class="settings-slider" id="setting-speech-rate" min="0.8" max="1.4" step="0.1" value="${e.speechRate||1}" />
            <span style="font-weight: 600; font-size: 13px;" id="speech-rate-val">${e.speechRate||1}x</span>
          </div>
        </div>
      `:this.activeTab==="backend"?`
        <div class="settings-group-title">Backend API & Health</div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">FastAPI Endpoint URL</span>
            <span class="settings-sublabel">Root address of the VisionRAG backend server</span>
          </div>
          <input type="text" class="settings-input" id="setting-backend-url" value="${e.backendUrl}" style="min-width: 220px;" />
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Neural Simulation Mode</span>
            <span class="settings-sublabel">Enable intelligent local multimodal simulation if backend is offline</span>
          </div>
          <input type="checkbox" id="setting-mockmode" ${e.mockMode?"checked":""} style="width: 18px; height: 18px; accent-color: var(--brand-green);" />
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Test Connection</span>
            <span class="settings-sublabel" id="ping-status-text">Click below to ping ${e.backendUrl}</span>
          </div>
          <button class="btn-new-chat" id="btn-test-ping" style="width: auto; padding: 7px 14px;">
            <span>Ping Server</span>
          </button>
        </div>
      `:this.activeTab==="data"?`
        <div class="settings-group-title">Data Management & Export</div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Export All Conversations</span>
            <span class="settings-sublabel">Download your chats and multimodal citations as JSON</span>
          </div>
          <button class="btn-new-chat" id="btn-export-json" style="width: auto; padding: 7px 14px;">
            <span>Export JSON</span>
          </button>
        </div>

        <div class="settings-row">
          <div class="settings-label-wrap">
            <span class="settings-label">Reset Local Data</span>
            <span class="settings-sublabel" style="color: var(--danger);">Clear all chats, folders, and return to default state</span>
          </div>
          <button class="btn-new-chat" id="btn-reset-data" style="width: auto; padding: 7px 14px; border-color: #fca5a5; color: var(--danger);">
            <span>Reset Data</span>
          </button>
        </div>
      `:""}bindEvents(){const e=this.container.querySelector("#settings-overlay");e&&e.addEventListener("click",p=>{p.target===e&&this.close()}),this.container.querySelectorAll(".settings-tab-btn").forEach(p=>{p.addEventListener("click",()=>{this.activeTab=p.dataset.tab,this.render()})});const t=this.container.querySelector("#btn-replay-splash");t&&t.addEventListener("click",()=>{this.close(),this.onReplayIntro&&this.onReplayIntro()});const i=this.container.querySelector("#setting-topk"),s=this.container.querySelector("#topk-val");i&&s&&i.addEventListener("input",p=>{s.innerText=p.target.value,r.updateSettings({topK:parseInt(p.target.value,10)})});const o=this.container.querySelector("#setting-threshold"),l=this.container.querySelector("#threshold-val");o&&l&&o.addEventListener("input",p=>{l.innerText=p.target.value,r.updateSettings({similarityThreshold:parseFloat(p.target.value)})});const h=this.container.querySelector("#setting-reranker");h&&h.addEventListener("change",p=>{r.updateSettings({rerankerEnabled:p.target.checked})});const a=this.container.querySelector("#setting-vision-model");a&&a.addEventListener("change",p=>{r.updateSettings({visionModel:p.target.value})});const d=this.container.querySelector("#setting-ocr");d&&d.addEventListener("change",p=>{r.updateSettings({ocrEngine:p.target.value})});const c=this.container.querySelector("#setting-fps");c&&c.addEventListener("change",p=>{r.updateSettings({fps:parseFloat(p.target.value)})});const g=this.container.querySelector("#setting-autospeak");g&&g.addEventListener("change",p=>{r.updateSettings({autoSpeak:p.target.checked})});const n=this.container.querySelector("#setting-mockmode");n&&n.addEventListener("change",p=>{r.updateSettings({mockMode:p.target.checked})});const v=this.container.querySelector("#setting-backend-url");v&&v.addEventListener("change",p=>{r.updateSettings({backendUrl:p.target.value.trim()})});const u=this.container.querySelector("#btn-test-ping"),m=this.container.querySelector("#ping-status-text");u&&m&&u.addEventListener("click",async()=>{m.innerText="Pinging server...",await x.checkHealth()?m.innerHTML='<span style="color: #10a37f; font-weight: 600;">✓ Connected to FastAPI backend!</span>':m.innerHTML='<span style="color: #f59e0b;">Backend server offline. Running via Neural Simulation fallback.</span>'});const y=this.container.querySelector("#btn-export-json");y&&y.addEventListener("click",()=>{const p="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(r.getState(),null,2)),w=document.createElement("a");w.setAttribute("href",p),w.setAttribute("download",`visionrag_export_${Date.now()}.json`),document.body.appendChild(w),w.click(),w.remove()});const b=this.container.querySelector("#btn-reset-data");b&&b.addEventListener("click",()=>{confirm("Are you sure you want to reset all data and conversations?")&&(r.clearAllData(),this.close())})}}class B{constructor(e){this.container=e}open(e){this.render(e)}close(){this.container.innerHTML=""}render(e){const t=e.type==="video";e.type,this.container.innerHTML=`
      <div class="video-mode-modal" id="source-modal-overlay">
        <div class="source-inspector-card">
          <div class="modal-header-bar">
            <div class="modal-title" style="display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-indigo)" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span>Grounding Inspector: ${this.escapeHtml(e.title)}</span>
            </div>
            <button class="action-icon-btn" id="btn-close-source-modal" title="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="inspector-body">
            <div class="inspector-meta-grid">
              <div class="meta-box">
                <div class="meta-box-label">Modality</div>
                <div class="meta-box-val" style="text-transform: uppercase;">${e.type}</div>
              </div>
              <div class="meta-box">
                <div class="meta-box-label">${t?"Timestamp":"Page Number"}</div>
                <div class="meta-box-val">${e.page}</div>
              </div>
              <div class="meta-box">
                <div class="meta-box-label">Neural Confidence</div>
                <div class="meta-box-val" style="color: var(--brand-green);">${e.matchScore}% Match</div>
              </div>
            </div>

            <!-- Simulated Visual Bounding Box / Keyframe Preview -->
            <div style="position: relative; width: 100%; height: 160px; background: #f3f4f6; border-radius: var(--radius-md); border: 1px dashed var(--border-medium); overflow: hidden; display: flex; align-items: center; justify-content: center;">
              <div style="font-size: 12px; color: var(--text-muted); text-align: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 6px; opacity: 0.6;">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <div>Grounding Bounding Box [${e.bbox?e.bbox.join(", "):"120, 240, 500, 680"}]</div>
              </div>
              <!-- Target highlight box -->
              <div style="position: absolute; top: 20%; left: 25%; width: 50%; height: 60%; border: 2px solid var(--brand-indigo); background: rgba(79, 70, 229, 0.08); border-radius: 4px;">
                <span style="position: absolute; top: -18px; left: 0; background: var(--brand-indigo); color: #fff; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 3px;">
                  Active Retrieval Patch
                </span>
              </div>
            </div>

            <!-- Extracted Chunk Content -->
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <span style="font-size: 12px; font-weight: 600; color: var(--text-secondary);">Extracted Text & Metadata Chunk:</span>
              <div class="inspector-chunk-box">
                ${this.escapeHtml(e.chunk||"No raw chunk available.")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `,this.bindEvents()}bindEvents(){const e=this.container.querySelector("#btn-close-source-modal"),t=this.container.querySelector("#source-modal-overlay");e&&e.addEventListener("click",()=>this.close()),t&&t.addEventListener("click",i=>{i.target===t&&this.close()})}escapeHtml(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}}document.addEventListener("DOMContentLoaded",()=>{const f=document.getElementById("modal-container"),e=document.getElementById("sidebar"),t=document.getElementById("main-content"),i=new C;i.init();const s=new T(f),o=new R(f),l=new B(f),h=new $(f,{onReplayIntro:()=>i.replay()});new A(e,{onOpenSettings:()=>h.open(),onReplayIntro:()=>i.replay()}).render(),new L(t,{onOpenVoice:()=>s.open(),onOpenVideo:()=>o.open(),onOpenSource:c=>l.open(c),onOpenSettings:()=>h.open()}).render(),window.addEventListener("keydown",c=>{(c.ctrlKey||c.metaKey)&&c.key==="["&&(c.preventDefault(),r.toggleSidebar()),c.key==="Escape"&&(s.close(),o.close(),h.close(),l.close())}),console.log("VisionRAG Multimodal Interface Initialized Successfully.")});
//# sourceMappingURL=index-BKLpiKLZ.js.map
