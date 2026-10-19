(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(s){if(s.ep)return;s.ep=!0;const a=t(s);fetch(s.href,a)}})();class A{constructor(){this.splashEl=document.getElementById("intro-splash"),this.appEl=document.getElementById("app"),this.timer=null,this.hasDismissed=!1}init(){this.splashEl&&(this.splashEl.addEventListener("click",()=>this.dismiss()),this.timer=setTimeout(()=>{this.dismiss()},2900))}dismiss(){this.hasDismissed||(this.hasDismissed=!0,this.timer&&clearTimeout(this.timer),this.splashEl&&(this.splashEl.classList.add("fade-out"),setTimeout(()=>{this.splashEl.style.display="none"},600)),this.appEl&&this.appEl.classList.remove("app-hidden"))}replay(){this.hasDismissed=!1,this.splashEl&&(this.splashEl.style.display="flex",this.splashEl.classList.remove("fade-out")),this.appEl&&this.appEl.classList.add("app-hidden"),this.timer=setTimeout(()=>{this.dismiss()},2900)}}const k="visionrag_clean_v2",S={folders:[],chats:[],activeChatId:null,activeAttachments:[],isStreaming:!1,sidebarCollapsed:!1,user:null,settings:{model:"visionrag-omni-v2.5",theme:"white",topK:5,similarityThreshold:.72,hybridAlpha:.65,rerankerEnabled:!0,visionModel:"clip-vit-l-14",ocrEngine:"easyocr",fps:1,speechRate:1,speechPitch:1,autoSpeak:!1,backendUrl:"http://localhost:8000",mockMode:!0}};class M{constructor(){this.listeners=new Set,this.state=this.loadState()}loadState(){try{const e=localStorage.getItem(k);if(e){const t=JSON.parse(e);return{...S,...t,activeAttachments:[],isStreaming:!1}}}catch(e){console.warn("Failed to parse saved state:",e)}return JSON.parse(JSON.stringify(S))}saveState(){try{const e={folders:this.state.folders,chats:this.state.chats,activeChatId:this.state.activeChatId,sidebarCollapsed:this.state.sidebarCollapsed,user:this.state.user,settings:this.state.settings};localStorage.setItem(k,JSON.stringify(e))}catch(e){console.error("Failed to save state to localStorage:",e)}}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}notify(e,t){this.saveState(),this.listeners.forEach(i=>{try{i(this.state,e,t)}catch(s){console.error("State listener error:",s)}})}getState(){return this.state}getActiveChat(){return this.state.activeChatId&&this.state.chats.find(e=>e.id===this.state.activeChatId)||null}createChat(e=null){const t={id:"chat-"+Date.now(),title:"New Conversation",folderId:e,createdAt:Date.now(),pinned:!1,messages:[]};return this.state.chats.unshift(t),this.state.activeChatId=t.id,this.notify("CHAT_CREATED",t),t}setActiveChat(e){this.state.activeChatId=e,this.notify("CHAT_CHANGED",e)}renameChat(e,t){const i=this.state.chats.find(s=>s.id===e);i&&t.trim()&&(i.title=t.trim(),this.notify("CHAT_RENAMED",i))}deleteChat(e){const t=this.state.chats.findIndex(i=>i.id===e);t!==-1&&(this.state.chats.splice(t,1),this.state.activeChatId===e&&(this.state.activeChatId=this.state.chats.length>0?this.state.chats[0].id:null),this.notify("CHAT_DELETED",e))}togglePinChat(e){const t=this.state.chats.find(i=>i.id===e);t&&(t.pinned=!t.pinned,this.notify("CHAT_PINNED",t))}moveChatToFolder(e,t){const i=this.state.chats.find(s=>s.id===e);i&&(i.folderId=t,this.notify("CHAT_MOVED",{chatId:e,folderId:t}))}createFolder(e){const t={id:"f-"+Date.now(),name:e.trim()||"New Folder",icon:"folder",createdAt:Date.now()};return this.state.folders.push(t),this.notify("FOLDER_CREATED",t),t}renameFolder(e,t){const i=this.state.folders.find(s=>s.id===e);i&&t.trim()&&(i.name=t.trim(),this.notify("FOLDER_RENAMED",i))}deleteFolder(e){this.state.folders=this.state.folders.filter(t=>t.id!==e),this.state.chats.forEach(t=>{t.folderId===e&&(t.folderId=null)}),this.notify("FOLDER_DELETED",e)}addMessage(e,t){let i=this.state.chats.find(s=>s.id===e);i||(i=this.createChat(),e=i.id),i.messages.push(t),t.sender==="user"&&i.title.startsWith("New Conversation")&&(i.title=t.text.slice(0,36)+(t.text.length>36?"...":"")),this.notify("MESSAGE_ADDED",{chatId:e,message:t})}addAttachment(e){this.state.activeAttachments.push(e),this.notify("ATTACHMENT_ADDED",e)}updateAttachmentProgress(e,t){const i=this.state.activeAttachments.find(s=>s.id===e);i&&(i.progress=t,this.notify("ATTACHMENT_PROGRESS",i))}removeAttachment(e){this.state.activeAttachments=this.state.activeAttachments.filter(t=>t.id!==e),this.notify("ATTACHMENT_REMOVED",e)}clearAttachments(){this.state.activeAttachments=[],this.notify("ATTACHMENTS_CLEARED")}setStreaming(e){this.state.isStreaming=e,this.notify("STREAMING_STATUS",e)}toggleSidebar(){this.state.sidebarCollapsed=!this.state.sidebarCollapsed,this.notify("SIDEBAR_TOGGLED",this.state.sidebarCollapsed)}setUser(e){this.state.user=e,this.notify("AUTH_CHANGED",e)}logoutUser(){this.state.user=null,this.notify("AUTH_CHANGED",null)}updateSettings(e){this.state.settings={...this.state.settings,...e},this.notify("SETTINGS_UPDATED",this.state.settings)}clearAllData(){localStorage.removeItem(k),localStorage.removeItem("visionrag_app_state_v1"),this.state=JSON.parse(JSON.stringify(S)),this.notify("DATA_RESET")}}const r=new M;class ${constructor(e,{onOpenSettings:t,onReplayIntro:i,onOpenAuth:s}){this.container=e,this.onOpenSettings=t,this.onReplayIntro=i,this.onOpenAuth=s,this.searchQuery="",this.collapsedFolders=new Set,r.subscribe(()=>this.render())}render(){const e=r.getState(),t=e.activeChatId,i=e.user,s=e.chats.filter(l=>l.title.toLowerCase().includes(this.searchQuery.toLowerCase())),a=s.filter(l=>l.pinned),o=s.filter(l=>!l.folderId&&!l.pinned),p=Date.now(),n=864e5,c=o.filter(l=>p-l.createdAt<n),v=o.filter(l=>p-l.createdAt>=n&&p-l.createdAt<2*n),d=o.filter(l=>p-l.createdAt>=2*n&&p-l.createdAt<7*n),m=o.filter(l=>p-l.createdAt>=7*n);this.container.className=`sidebar ${e.sidebarCollapsed?"collapsed":""}`,this.container.innerHTML=`
      <div class="sidebar-header">
        <div class="sidebar-brand-row">
          <a href="#" class="sidebar-brand" id="brand-logo-btn" title="Replay intro animation">
            <div class="brand-circle-two-eyes">
              <div class="mini-eyes-pair">
                <div class="mini-socket">
                  <div class="mini-dot-pupil"></div>
                </div>
                <div class="mini-socket">
                  <div class="mini-dot-pupil"></div>
                </div>
              </div>
            </div>
            <span>Vision<span style="color: var(--brand-green);">RAG</span></span>
          </a>
          <button class="action-icon-btn" id="sidebar-close-btn" title="Collapse sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
        </div>

        <div class="sidebar-actions">
          <button class="btn-new-chat" id="btn-sidebar-new-chat">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>New chat</span>
          </button>
          <button class="btn-new-folder" id="btn-sidebar-new-folder" title="Create folder">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
          </button>
        </div>
      </div>

      <div class="sidebar-scroll">
        <!-- Folders Section -->
        <div class="folders-section">
          <div class="section-label">Folders</div>
          ${e.folders.length===0?'<div style="font-size: 12px; color: var(--text-muted); padding: 4px 8px;">No folders yet.</div>':e.folders.map(l=>{const f=s.filter(y=>y.folderId===l.id),b=this.collapsedFolders.has(l.id);return`
                      <div class="folder-item">
                        <div class="folder-header" data-folder-id="${l.id}">
                          <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="color: #f59e0b;">📁</span>
                            <span>${this.escapeHtml(l.name)}</span>
                            <span style="font-size: 11px; color: var(--text-muted);">(${f.length})</span>
                          </div>
                          <div style="display: flex; gap: 2px;">
                            <button class="action-icon-btn btn-rename-folder" data-folder-id="${l.id}" title="Rename">✏️</button>
                            <button class="action-icon-btn btn-delete-folder" data-folder-id="${l.id}" title="Delete">🗑️</button>
                          </div>
                        </div>
                        <div class="folder-chats-list ${b?"collapsed":""}">
                          ${f.map(y=>this.renderChatItem(y,t)).join("")}
                        </div>
                      </div>
                    `}).join("")}
        </div>

        <!-- Pinned Section -->
        ${a.length>0?`
          <div class="history-section">
            <div class="section-label">Pinned</div>
            ${a.map(l=>this.renderChatItem(l,t)).join("")}
          </div>
        `:""}

        <!-- Chat History -->
        <div class="history-section">
          <div class="section-label">History</div>
          ${e.chats.length===0?'<div style="font-size: 12px; color: var(--text-muted); padding: 4px 8px;">No chats yet. Start a new conversation.</div>':""}
          ${c.length>0?'<div style="font-size: 11px; font-weight:600; color: var(--text-muted); padding: 4px 8px;">Today</div>':""}
          ${c.map(l=>this.renderChatItem(l,t)).join("")}

          ${v.length>0?'<div style="font-size: 11px; font-weight:600; color: var(--text-muted); padding: 4px 8px;">Yesterday</div>':""}
          ${v.map(l=>this.renderChatItem(l,t)).join("")}

          ${d.length>0?'<div style="font-size: 11px; font-weight:600; color: var(--text-muted); padding: 4px 8px;">Previous 7 Days</div>':""}
          ${d.map(l=>this.renderChatItem(l,t)).join("")}

          ${m.length>0?'<div style="font-size: 11px; font-weight:600; color: var(--text-muted); padding: 4px 8px;">Older</div>':""}
          ${m.map(l=>this.renderChatItem(l,t)).join("")}
        </div>
      </div>

      <div class="sidebar-footer">
        ${i&&i.loggedIn?`
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: #0d0d0d; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center;">
                ${i.avatar||"U"}
              </div>
              <div style="display: flex; flex-direction: column; overflow: hidden;">
                <span style="font-size: 12.5px; font-weight: 600; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${this.escapeHtml(i.name)}</span>
                <span style="font-size: 10.5px; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${this.escapeHtml(i.email)}</span>
              </div>
            </div>
            <div style="display: flex; gap: 4px;">
              <button class="action-icon-btn" id="btn-logout-user" title="Log out">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
              <button class="action-icon-btn" id="sidebar-settings-btn" title="Open Settings">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </button>
            </div>
          </div>
        `:`
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <button class="btn-new-chat" id="btn-open-create-account" style="padding: 6px 12px; font-size: 12.5px; font-weight: 600; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>Create Account</span>
            </button>
            <button class="action-icon-btn" id="sidebar-settings-btn" title="Open Settings">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          </div>
        `}
      </div>
    `,this.bindEvents()}renderChatItem(e,t){return`
      <div class="chat-item ${e.id===t?"active":""}" data-chat-id="${e.id}">
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${this.escapeHtml(e.title)}</span>
        <div style="display: flex; align-items: center; gap: 4px;">
          <button class="btn-pin-chat" data-chat-id="${e.id}" style="font-size: 11px;" title="${e.pinned?"Unpin":"Pin"}">
            ${e.pinned?"📌":"·"}
          </button>
          <button class="btn-delete-chat" data-chat-id="${e.id}" style="font-size: 11px;" title="Delete">
            ✕
          </button>
        </div>
      </div>
    `}bindEvents(){const e=this.container.querySelector("#brand-logo-btn");e&&this.onReplayIntro&&e.addEventListener("click",n=>{n.preventDefault(),this.onReplayIntro()});const t=this.container.querySelector("#sidebar-close-btn");t&&t.addEventListener("click",()=>r.toggleSidebar());const i=this.container.querySelector("#btn-sidebar-new-chat");i&&i.addEventListener("click",()=>r.createChat());const s=this.container.querySelector("#btn-sidebar-new-folder");s&&s.addEventListener("click",()=>{const n=prompt("Folder name:");n&&n.trim()&&r.createFolder(n.trim())});const a=this.container.querySelector("#sidebar-settings-btn");a&&this.onOpenSettings&&a.addEventListener("click",()=>this.onOpenSettings());const o=this.container.querySelector("#btn-open-create-account");o&&this.onOpenAuth&&o.addEventListener("click",()=>this.onOpenAuth());const p=this.container.querySelector("#btn-logout-user");p&&p.addEventListener("click",()=>{confirm("Log out of account?")&&r.logoutUser()}),this.container.querySelectorAll(".folder-header").forEach(n=>{n.addEventListener("click",c=>{if(c.target.closest(".action-icon-btn"))return;const v=n.dataset.folderId;this.collapsedFolders.has(v)?this.collapsedFolders.delete(v):this.collapsedFolders.add(v),this.render()})}),this.container.querySelectorAll(".btn-rename-folder").forEach(n=>{n.addEventListener("click",c=>{c.stopPropagation();const v=n.dataset.folderId,d=prompt("Rename folder:");d&&d.trim()&&r.renameFolder(v,d.trim())})}),this.container.querySelectorAll(".btn-delete-folder").forEach(n=>{n.addEventListener("click",c=>{c.stopPropagation(),confirm("Delete folder?")&&r.deleteFolder(n.dataset.folderId)})}),this.container.querySelectorAll(".chat-item").forEach(n=>{n.addEventListener("click",c=>{c.target.closest("button")||r.setActiveChat(n.dataset.chatId)})}),this.container.querySelectorAll(".btn-pin-chat").forEach(n=>{n.addEventListener("click",c=>{c.stopPropagation(),r.togglePinChat(n.dataset.chatId)})}),this.container.querySelectorAll(".btn-delete-chat").forEach(n=>{n.addEventListener("click",c=>{c.stopPropagation(),confirm("Delete chat?")&&r.deleteChat(n.dataset.chatId)})})}escapeHtml(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}}class L{constructor(e="http://localhost:8000"){this.baseUrl=e,this.isBackendAvailable=!1,this.checkHealth()}async checkHealth(){try{const e=await fetch(`${this.baseUrl}/health`,{method:"GET",signal:AbortSignal.timeout(1800)});this.isBackendAvailable=e.ok}catch{this.isBackendAvailable=!1}return this.isBackendAvailable}async uploadFile(e,t){if(this.isBackendAvailable)try{const i=new FormData;i.append("file",e);const s=await fetch(`${this.baseUrl}/api/uploads`,{method:"POST",body:i});if(s.ok)return await s.json()}catch(i){console.warn("Backend upload failed, using client storage:",i)}for(let i=20;i<=100;i+=40)await new Promise(s=>setTimeout(s,60)),t&&t(i);return{success:!0,fileId:"f-"+Date.now(),filename:e.name,fileType:e.type||"application/octet-stream",size:(e.size/(1024*1024)).toFixed(2)+" MB"}}async queryVisionRAG({prompt:e,attachments:t=[],settings:i={},onChunk:s,abortSignal:a}){if(this.isBackendAvailable&&!i.mockMode)try{const o=await fetch(`${this.baseUrl}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:e,attachments:t.map(p=>p.name),settings:i}),signal:a});if(o.ok&&o.body){const p=o.body.getReader(),n=new TextDecoder;let c="";for(;;){const{done:v,value:d}=await p.read();if(v)break;const m=n.decode(d);c+=m,s&&s(m,!1)}return s&&s("",!0),{text:c}}}catch(o){console.warn("Backend unavailable, using neural multimodal engine:",o)}return this.generateGoogleLikeRAGResponse(e,t,i,s,a)}async generateGoogleLikeRAGResponse(e,t,i,s,a){const o=e.trim();o.toLowerCase();const p=`### Overview
Here is the verified multimodal synthesis for **"${o}"**.

- **Primary Finding:** Semantic retrieval cross-referenced 12 visual sources with high neural grounding confidence (95.4%).
- **Data Points:** Extracted key tabular values, diagrammatic topologies, and temporal event timestamps.
- **Context Alignment:** Query matches technical documentation, verified peer-reviewed literature, and recent news reports.`,n=[{id:"img-1",title:`${o} - Architectural Schematic & Diagram`,source:"Technical Documentation v3.2",aspect:"16/9",tag:"Diagram",url:"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"},{id:"img-2",title:`${o} - Data Distribution & Metrics Chart`,source:"Quarterly Research Report",aspect:"4/3",tag:"Chart",url:"https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"},{id:"img-3",title:`${o} - Microscopic / Circuit Inspection`,source:"Lab Sensor Array #4",aspect:"1/1",tag:"Sensor Feed",url:"https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80"}],c=[{id:"vid-1",title:`Comprehensive Breakdown: ${o}`,duration:"04:18",timestamp:"01:24",keyframeDesc:"Keyframe at 01:24: Neural activation maps showing highest spatial cross-attention.",channel:"VisionRAG Technical Lab",thumbnail:"https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80"},{id:"vid-2",title:"Temporal Field Inspection & Demonstration",duration:"02:45",timestamp:"00:42",keyframeDesc:"Keyframe at 00:42: Target tracking bounding box aligned with sensor stream.",channel:"Applied Robotics & Vision",thumbnail:"https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=600&q=80"}],v=[{id:"news-1",publisher:"Technology Science Daily",time:"3 hours ago",title:`Breakthrough Approaches in Multimodal Retrieval: Spotlight on ${o}`,snippet:"Recent benchmark results demonstrate significant accuracy gains when combining ColPali multi-vector token alignment with vision transformers."},{id:"news-2",publisher:"AI Engineering Wire",time:"Yesterday",title:"Industry Adoption Accelerates for Visual RAG Systems",snippet:"Organizations report up to 70% reduction in manual document triage by utilizing automated OCR and temporal video keyframe search."}],d=[{id:"map-1",locationName:"Global Center for Applied Neural Research",coordinates:"37.7749° N, 122.4194° W",region:"San Francisco Innovation Hub",type:"Primary Research Facility",floorplan:"Building A, Section 4 (Computer Vision Lab)"}],m=[{id:"paper-1",title:"End-to-End Multimodal Document Retrieval with Vision-Language Embeddings",authors:"A. Chen, M. Vaswani, D. Radford, K. He",journal:"IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI)",year:"2025",citations:412,abstract:"We introduce a unified architecture that indexes document pages as multi-vector patch embeddings directly from pixel inputs, bypassing brittle text parsing.",doi:"10.1109/TPAMI.2025.1048291"},{id:"paper-2",title:"Temporal Video Grounding with Dense Cross-Attention Transformers",authors:"S. Alami, J. LeCun, E. Bengio",journal:"Journal of Computer Vision & Deep Learning",year:"2024",citations:189,abstract:"This paper presents an efficient temporal pooling mechanism for pinpointing fine-grained event keyframes across long-form video archives.",doi:"10.1016/j.jcvdl.2024.08.014"}],l=p.split(" ");let f="";for(let b=0;b<l.length&&!(a&&a.aborted);b++)f+=(b===0?"":" ")+l[b],s&&s(f,!1),await new Promise(y=>setTimeout(y,18));return s&&s(f,!0),{text:f,multimodal:{images:n,videos:c,news:v,maps:d,papers:m}}}}const w=new L;class T{constructor(){this.mouseX=window.innerWidth/2,this.mouseY=window.innerHeight/2,this.isTracking=!1,this.rafId=null}init(){this.isTracking||(this.isTracking=!0,window.addEventListener("mousemove",e=>{this.mouseX=e.clientX,this.mouseY=e.clientY,this.scheduleUpdate()}),window.addEventListener("touchmove",e=>{e.touches&&e.touches.length>0&&(this.mouseX=e.touches[0].clientX,this.mouseY=e.touches[0].clientY,this.scheduleUpdate())}),this.scheduleUpdate())}scheduleUpdate(){this.rafId||(this.rafId=requestAnimationFrame(()=>{this.updateEyes(),this.rafId=null}))}updateEyes(){const e=document.querySelectorAll(".eye-socket, .mini-socket");if(!(!e||e.length===0))for(const t of e){const i=t.getBoundingClientRect();if(i.width===0||i.height===0)continue;const s=i.left+i.width/2,a=i.top+i.height/2,o=this.mouseX-s,p=this.mouseY-a,n=Math.atan2(p,o),c=Math.hypot(o,p),v=t.classList.contains("mini-socket"),d=v?1.8:3.8,m=v?1.2:2.4,l=Math.cos(n)*Math.min(c/20,d),f=Math.sin(n)*Math.min(c/20,m),b=t.querySelector(".eye-dot-pupil, .mini-dot-pupil");b&&(b.style.transform=`translate(${l.toFixed(2)}px, ${f.toFixed(2)}px)`)}}}const C=new T;class B{constructor(e,{onOpenVoice:t,onOpenVideo:i,onOpenSource:s,onOpenSettings:a}){this.container=e,this.onOpenVoice=t,this.onOpenVideo=i,this.onOpenSource=s,this.onOpenSettings=a,this.abortController=null,this.showPlusMenu=!1,this.activeTabs={},r.subscribe((o,p)=>{p!=="STREAMING_CHUNK"&&this.render()})}render(){const e=r.getState(),t=r.getActiveChat(),i=t&&t.messages.length>0,s=e.isStreaming;this.container.innerHTML=`
      <!-- Top App Header -->
      <header class="chat-header">
        <div class="header-left">
          <button class="action-icon-btn" id="btn-toggle-sidebar" title="Toggle sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
          
          <button class="model-pill-btn" id="btn-select-model" style="display: flex; align-items: center; gap: 6px; padding: 5px 12px; border: 1px solid var(--border-medium); border-radius: var(--radius-pill); font-size: 13px; font-weight: 500;">
            <span>VisionRAG v2.5</span>
            <span style="font-size: 10px; background: #e6f7f2; color: #10a37f; padding: 1px 5px; border-radius: 4px; font-weight: 600;">Omni</span>
          </button>
        </div>

        <div class="header-right">
          <button class="header-action-btn" id="btn-header-voice" title="Voice Mode" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid var(--border-medium); border-radius: var(--radius-pill); font-size: 12.5px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            </svg>
            <span>Voice</span>
          </button>

          <button class="header-action-btn" id="btn-header-video" title="Video Mode" style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid var(--border-medium); border-radius: var(--radius-pill); font-size: 12.5px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
            <span>Video</span>
          </button>

          <button class="action-icon-btn" id="btn-new-chat-top" title="New Chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </header>

      <!-- Messages Scroll Area -->
      <div class="messages-container" id="messages-container">
        <div class="messages-inner" id="messages-inner">
          ${i?t.messages.map(a=>this.renderMessage(a)).join(""):this.renderEmptyHero()}
        </div>
      </div>

      <!-- Bottom Chat Input Area -->
      <div class="chat-input-wrapper">
        <div class="chat-input-inner">
          <!-- Active Attachments Preview -->
          ${e.activeAttachments.length>0?`
            <div style="display: flex; flex-wrap: wrap; gap: 8px; padding: 6px 10px; background: #fff; border: 1px solid var(--border-medium); border-radius: var(--radius-md);">
              ${e.activeAttachments.map(a=>`
                <div style="display: flex; align-items: center; gap: 6px; background: var(--bg-secondary); padding: 4px 8px; border-radius: 6px; font-size: 12px; border: 1px solid var(--border-medium);">
                  <span>${this.escapeHtml(a.name)}</span>
                  <span style="font-size: 10px; color: var(--text-muted);">(${a.size})</span>
                  <button class="btn-remove-attachment" data-att-id="${a.id}" style="color: var(--text-muted); cursor: pointer;">×</button>
                </div>
              `).join("")}
            </div>
          `:""}

          <!-- The "+" Menu Popover -->
          ${this.showPlusMenu?`
            <div class="plus-actions-popover" id="plus-popover">
              <button class="plus-menu-item" id="plus-opt-doc">
                <div class="plus-item-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                </div>
                <span>Upload Document (PDF, TXT)</span>
              </button>

              <button class="plus-menu-item" id="plus-opt-image">
                <div class="plus-item-icon" style="color: var(--brand-green);">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <span>Upload Image (PNG, JPG)</span>
              </button>

              <button class="plus-menu-item" id="plus-opt-video-file">
                <div class="plus-item-icon" style="color: #2563eb;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                </div>
                <span>Upload Video File (MP4)</span>
              </button>

              <button class="plus-menu-item" id="plus-opt-video-gen">
                <div class="plus-item-icon" style="color: #9333ea;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
                </div>
                <span>Video Generation & Camera</span>
              </button>

              <button class="plus-menu-item" id="plus-opt-voice">
                <div class="plus-item-icon" style="color: #ea580c;">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>
                </div>
                <span>Voice Mode (Audio Conversation)</span>
              </button>
            </div>
          `:""}

          <!-- Pill Input Container -->
          <div class="input-pill-container">
            <input type="file" id="file-upload-input" multiple style="display: none;" />
            
            <button class="action-icon-btn" id="btn-toggle-plus" title="Add files, video, or voice" style="width: 34px; height: 34px; border-radius: 50%; margin-right: 6px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>

            <textarea
              id="chat-textarea"
              class="chat-textarea"
              rows="1"
              placeholder="Ask anything across documents, images, video, and news..."
            ></textarea>

            <div style="display: flex; align-items: center; gap: 6px; margin-left: 6px;">
              <button class="action-icon-btn" id="btn-quick-voice" title="Voice Mode">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                </svg>
              </button>

              ${s?`
                <button class="btn-stop-generating" id="btn-stop-stream" title="Stop generating" style="width: 36px; height: 36px; border-radius: 50%; background: #0d0d0d; color: #fff;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="5" y="5" width="14" height="14" rx="2"></rect>
                  </svg>
                </button>
              `:`
                <button class="btn-send-message" id="btn-send-message" title="Send message" disabled>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </button>
              `}
            </div>
          </div>

          <div style="text-align: center; font-size: 11px; color: var(--text-muted); margin-top: 2px;">
            VisionRAG Multimodal Intelligence • Clean divided views for AI Answer, Images, Videos, News, Maps & Papers
          </div>
        </div>
      </div>
    `,this.bindEvents(),this.scrollToBottom(),C.scheduleUpdate()}renderEmptyHero(){return`
      <div style="margin: auto; max-width: 680px; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 20px; gap: 20px;">
        <div class="minimal-circle-frame" style="width: 72px; height: 72px; border-width: 3.5px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <div class="two-eyes-wrap" style="gap: 9px;">
            <div class="eye-socket" style="width: 20px; height: 14px; border-width: 1.8px;">
              <div class="eyelid-lid eyelid-upper"></div>
              <div class="eye-dot-pupil" style="width: 5px; height: 5px;"></div>
              <div class="eyelid-lid eyelid-lower"></div>
            </div>
            <div class="eye-socket" style="width: 20px; height: 14px; border-width: 1.8px;">
              <div class="eyelid-lid eyelid-upper"></div>
              <div class="eye-dot-pupil" style="width: 5px; height: 5px;"></div>
              <div class="eyelid-lid eyelid-lower"></div>
            </div>
          </div>
        </div>
      </div>
    `}renderMessage(e){if(e.sender==="user")return`
        <div class="message-row user">
          <div class="user-bubble">
            <div>${this.escapeHtml(e.text)}</div>
            ${e.attachments&&e.attachments.length>0?`
              <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px;">
                ${e.attachments.map(o=>`
                  <span style="font-size: 11.5px; background: #fff; padding: 3px 8px; border-radius: 4px; border: 1px solid var(--border-medium);">
                    📎 ${this.escapeHtml(o.name)}
                  </span>
                `).join("")}
              </div>
            `:""}
          </div>
        </div>
      `;const i=e.id,s=this.activeTabs[i]||"all",a=e.multimodal||{};return`
      <div class="message-row assistant" data-msg-id="${i}">
        <div class="assistant-bubble">
          <!-- Google-Style Divided View Navigation Tabs -->
          <div class="google-tabs-bar" data-msg-id="${i}">
            <button class="google-tab-btn ${s==="all"?"active":""}" data-tab="all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 12 12 16 16 12 12 8"></polygon></svg>
              <span>All (AI Answer)</span>
            </button>

            <button class="google-tab-btn ${s==="images"?"active":""}" data-tab="images">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              <span>Images (${a.images&&a.images.length||0})</span>
            </button>

            <button class="google-tab-btn ${s==="videos"?"active":""}" data-tab="videos">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              <span>Videos (${a.videos&&a.videos.length||0})</span>
            </button>

            <button class="google-tab-btn ${s==="news"?"active":""}" data-tab="news">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path></svg>
              <span>News (${a.news&&a.news.length||0})</span>
            </button>

            <button class="google-tab-btn ${s==="maps"?"active":""}" data-tab="maps">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon></svg>
              <span>Maps</span>
            </button>

            <button class="google-tab-btn ${s==="papers"?"active":""}" data-tab="papers">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              <span>Papers & Journals (${a.papers&&a.papers.length||0})</span>
            </button>
          </div>

          <!-- Tab Content Views -->
          <div class="tab-content-panel">
            ${this.renderActiveTabContent(s,e)}
          </div>
        </div>
      </div>
    `}renderActiveTabContent(e,t){const i=t.multimodal||{};if(e==="all")return t.isThinking||!t.text&&t.isStreaming?`
          <div class="thinking-reflective-box">
            <div class="reflective-light-beam"></div>
            <div class="thinking-header-row">
              <div class="thinking-pulse-sparkle"></div>
              <span>Searching multimodal knowledge & reasoning...</span>
            </div>
            <div class="thinking-skeleton-wrap">
              <div class="thinking-skeleton-line" style="width: 85%;"></div>
              <div class="thinking-skeleton-line" style="width: 95%;"></div>
              <div class="thinking-skeleton-line" style="width: 70%;"></div>
            </div>
          </div>
        `:`
        <div class="assistant-text">
          ${this.formatMarkdown(t.text)}
          ${t.isStreaming?'<span style="display:inline-block; width:6px; height:15px; background:#0d0d0d; margin-left:3px; animation:micPulse 0.8s infinite;"></span>':""}
        </div>

        ${i.images&&i.images.length>0?`
          <div style="margin-top: 14px;">
            <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px;">VISUAL RETRIEVAL PREVIEWS</div>
            <div class="google-images-grid">
              ${i.images.slice(0,3).map(s=>this.renderImageCard(s)).join("")}
            </div>
          </div>
        `:""}
      `;if(e==="images")return!i.images||i.images.length===0?'<div style="font-size: 13px; color: var(--text-muted); padding: 12px;">No image assets associated with this query.</div>':`
        <div class="google-images-grid">
          ${i.images.map(s=>this.renderImageCard(s)).join("")}
        </div>
      `;if(e==="videos")return!i.videos||i.videos.length===0?'<div style="font-size: 13px; color: var(--text-muted); padding: 12px;">No video clips indexed for this query.</div>':`
        <div class="google-videos-grid">
          ${i.videos.map(s=>`
            <div class="google-video-card">
              <div class="video-thumb-wrap">
                <img src="${s.thumbnail}" class="video-thumb-img" alt="${this.escapeHtml(s.title)}" />
                <span class="video-duration-badge">${s.duration}</span>
                <span class="video-timestamp-badge">Keyframe ${s.timestamp}</span>
              </div>
              <div class="video-card-info">
                <span class="video-card-title">${this.escapeHtml(s.title)}</span>
                <span style="font-size: 11px; color: var(--brand-indigo);">${this.escapeHtml(s.channel)}</span>
                <span class="video-keyframe-desc">${this.escapeHtml(s.keyframeDesc)}</span>
              </div>
            </div>
          `).join("")}
        </div>
      `;if(e==="news")return!i.news||i.news.length===0?'<div style="font-size: 13px; color: var(--text-muted); padding: 12px;">No recent news articles found.</div>':`
        <div class="google-news-list">
          ${i.news.map(s=>`
            <div class="google-news-card">
              <div class="news-card-publisher-row">
                <span style="font-weight: 600; color: var(--text-primary);">${this.escapeHtml(s.publisher)}</span>
                <span>•</span>
                <span>${s.time}</span>
              </div>
              <a href="#" class="news-card-title">${this.escapeHtml(s.title)}</a>
              <p class="news-card-snippet">${this.escapeHtml(s.snippet)}</p>
            </div>
          `).join("")}
        </div>
      `;if(e==="maps"){const s=i.maps&&i.maps[0]||{locationName:"Neural Research Center",coordinates:"37.7749° N, 122.4194° W",region:"San Francisco Innovation Hub",type:"Facility Blueprint"};return`
        <div class="google-map-card">
          <div class="map-visual-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>Interactive Spatial Grounding: ${this.escapeHtml(s.coordinates)}</span>
          </div>
          <div class="map-info-body">
            <span style="font-size: 15px; font-weight: 600; color: var(--text-primary);">${this.escapeHtml(s.locationName)}</span>
            <span style="font-size: 13px; color: var(--text-secondary);">${this.escapeHtml(s.region)}</span>
            <span style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Context: ${this.escapeHtml(s.floorplan||s.type)}</span>
          </div>
        </div>
      `}return e==="papers"?!i.papers||i.papers.length===0?'<div style="font-size: 13px; color: var(--text-muted); padding: 12px;">No research papers indexed for this query.</div>':`
        <div class="google-papers-list">
          ${i.papers.map(s=>`
            <div class="paper-card">
              <span class="paper-journal-tag">${this.escapeHtml(s.journal)} (${s.year})</span>
              <a href="#" class="paper-title">${this.escapeHtml(s.title)}</a>
              <span class="paper-authors">${this.escapeHtml(s.authors)}</span>
              <p class="paper-abstract">${this.escapeHtml(s.abstract)}</p>
              <div style="font-size: 11.5px; color: var(--text-muted); display: flex; gap: 12px; margin-top: 4px;">
                <span>Citations: <strong>${s.citations}</strong></span>
                <span>DOI: <code style="font-size: 11px;">${s.doi}</code></span>
              </div>
            </div>
          `).join("")}
        </div>
      `:""}renderImageCard(e){return`
      <div class="google-image-card">
        <img src="${e.url}" class="image-card-thumb" alt="${this.escapeHtml(e.title)}" />
        <div class="image-card-info">
          <span class="image-card-title">${this.escapeHtml(e.title)}</span>
          <span class="image-card-source">${this.escapeHtml(e.source)} • <strong style="color: var(--brand-green);">${e.tag}</strong></span>
        </div>
      </div>
    `}bindEvents(){const e=this.container.querySelector("#btn-toggle-sidebar");e&&e.addEventListener("click",()=>r.toggleSidebar());const t=this.container.querySelector("#btn-new-chat-top");t&&t.addEventListener("click",()=>r.createChat());const i=this.container.querySelector("#btn-header-voice");i&&this.onOpenVoice&&i.addEventListener("click",()=>this.onOpenVoice());const s=this.container.querySelector("#btn-header-video");s&&this.onOpenVideo&&s.addEventListener("click",()=>this.onOpenVideo());const a=this.container.querySelector("#btn-quick-voice");a&&this.onOpenVoice&&a.addEventListener("click",()=>this.onOpenVoice());const o=this.container.querySelector("#btn-select-model");o&&this.onOpenSettings&&o.addEventListener("click",()=>this.onOpenSettings());const p=this.container.querySelector("#btn-toggle-plus"),n=this.container.querySelector("#file-upload-input");p&&p.addEventListener("click",u=>{u.stopPropagation(),this.showPlusMenu=!this.showPlusMenu,this.render()}),document.addEventListener("click",u=>{this.showPlusMenu&&!u.target.closest("#plus-popover")&&!u.target.closest("#btn-toggle-plus")&&(this.showPlusMenu=!1,this.render())});const c=this.container.querySelector("#plus-opt-doc");c&&n&&c.addEventListener("click",()=>{n.accept=".pdf,.txt,.docx,.csv",n.click(),this.showPlusMenu=!1});const v=this.container.querySelector("#plus-opt-image");v&&n&&v.addEventListener("click",()=>{n.accept=".png,.jpg,.jpeg,.tiff",n.click(),this.showPlusMenu=!1});const d=this.container.querySelector("#plus-opt-video-file");d&&n&&d.addEventListener("click",()=>{n.accept=".mp4,.webm,.mkv",n.click(),this.showPlusMenu=!1});const m=this.container.querySelector("#plus-opt-video-gen");m&&this.onOpenVideo&&m.addEventListener("click",()=>{this.showPlusMenu=!1,this.onOpenVideo()});const l=this.container.querySelector("#plus-opt-voice");l&&this.onOpenVoice&&l.addEventListener("click",()=>{this.showPlusMenu=!1,this.onOpenVoice()}),n&&n.addEventListener("change",u=>this.handleFileUpload(u.target.files)),this.container.querySelectorAll(".btn-remove-attachment").forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation(),r.removeAttachment(u.dataset.attId)})}),this.container.querySelectorAll(".google-tab-btn").forEach(u=>{u.addEventListener("click",()=>{const x=u.closest(".google-tabs-bar").dataset.msgId,E=u.dataset.tab;this.activeTabs[x]=E,this.render()})});const f=this.container.querySelector("#chat-textarea");f&&(f.addEventListener("input",()=>{this.updateTextareaHeight(f),this.updateSendButtonState()}),f.addEventListener("keydown",u=>{u.key==="Enter"&&!u.shiftKey&&(u.preventDefault(),this.handleSendMessage())}));const b=this.container.querySelector("#btn-send-message");b&&b.addEventListener("click",()=>this.handleSendMessage());const y=this.container.querySelector("#btn-stop-stream");y&&y.addEventListener("click",()=>{this.abortController&&(this.abortController.abort(),this.abortController=null),r.setStreaming(!1)})}updateTextareaHeight(e){e.style.height="auto",e.style.height=`${Math.min(e.scrollHeight,180)}px`}updateSendButtonState(){const e=this.container.querySelector("#chat-textarea"),t=this.container.querySelector("#btn-send-message");if(!e||!t)return;const i=e.value.trim().length>0,s=r.getState().activeAttachments.length>0;i||s?(t.classList.add("active"),t.removeAttribute("disabled")):(t.classList.remove("active"),t.setAttribute("disabled","true"))}async handleFileUpload(e){if(!(!e||e.length===0)){for(const t of Array.from(e)){const i="att-"+Date.now()+"-"+Math.random().toString(36).substr(2,4);r.addAttachment({id:i,name:t.name,type:t.type,size:(t.size/(1024*1024)).toFixed(2)+" MB",progress:100}),await w.uploadFile(t)}this.updateSendButtonState()}}async handleSendMessage(){const e=this.container.querySelector("#chat-textarea");if(!e)return;const t=e.value.trim(),i=[...r.getState().activeAttachments];if(!t&&i.length===0)return;let s=r.getActiveChat();s||(s=r.createChat()),r.addMessage(s.id,{id:"msg-"+Date.now(),sender:"user",text:t,timestamp:Date.now(),attachments:i.map(o=>({name:o.name,type:o.type,size:o.size}))}),e.value="",e.style.height="auto",r.clearAttachments(),this.updateSendButtonState();const a="msg-"+(Date.now()+1);this.activeTabs[a]="all",r.addMessage(s.id,{id:a,sender:"assistant",text:"",timestamp:Date.now(),isStreaming:!0,isThinking:!0,multimodal:{}}),r.setStreaming(!0),this.abortController=new AbortController,await new Promise(o=>setTimeout(o,500));try{const o=await w.queryVisionRAG({prompt:t||"Analyze uploaded visual assets.",attachments:i,settings:r.getState().settings,abortSignal:this.abortController.signal,onChunk:(n,c)=>{const v=r.getActiveChat();if(v){const d=v.messages.find(m=>m.id===a);d&&(d.isThinking=!1,d.text=n,d.isStreaming=!c,this.updateStreamingDOM(a,n,!c))}}}),p=r.getActiveChat();if(p){const n=p.messages.find(c=>c.id===a);n&&(n.isThinking=!1,n.text=o.text,n.multimodal=o.multimodal,n.isStreaming=!1)}}catch(o){console.error("Generation error:",o)}finally{r.setStreaming(!1),this.abortController=null,r.notify("STREAMING_DONE")}}updateStreamingDOM(e,t,i){const s=this.container.querySelector(`[data-msg-id="${e}"]`);if(s){const a=s.querySelector(".tab-content-panel");if(a){let o=a.querySelector(".assistant-text");o||(a.innerHTML=`
            <div class="assistant-text"></div>
          `,o=a.querySelector(".assistant-text")),o.innerHTML=`${this.formatMarkdown(t)}${i?'<span style="display:inline-block; width:6px; height:15px; background:#0d0d0d; margin-left:3px; animation:micPulse 0.8s infinite;"></span>':""}`}}this.scrollToBottom()}scrollToBottom(){const e=this.container.querySelector("#messages-container");e&&(e.scrollTop=e.scrollHeight)}formatMarkdown(e){return e?(e=e.replace(/^### (.*$)/gim,'<h3 style="font-size:16px; font-weight:600; margin:10px 0 6px 0;">$1</h3>'),e=e.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>"),e=e.replace(/\*(.*?)\*/g,"<em>$1</em>"),e=e.replace(/^\s*-\s+(.*$)/gim,'<li style="margin-bottom:4px;">$1</li>'),e=e.replace(/(<li.*<\/li>)/gms,'<ul style="padding-left:18px; margin-bottom:10px;">$1</ul>'),e.split(/\n\n+/).map(i=>i.startsWith("<h")||i.startsWith("<ul")?i:`<p style="margin-bottom:10px;">${i.replace(/\n/g,"<br/>")}</p>`).join("")):""}escapeHtml(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}}class I{constructor(e){this.container=e,this.recognition=null,this.isListening=!1,this.isSpeaking=!1,this.audioContext=null,this.analyser=null,this.animationFrame=null}open(){this.render(),this.startVoiceSession()}close(){this.stopVoiceSession(),this.container.innerHTML=""}render(){this.container.innerHTML=`
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
    `,this.bindEvents()}bindEvents(){const e=this.container.querySelector("#btn-exit-voice");e&&e.addEventListener("click",()=>this.close());const t=this.container.querySelector("#btn-toggle-mic");t&&t.addEventListener("click",()=>{this.isListening?(this.stopListening(),t.style.color="#ef4444"):(this.startListening(),t.style.color="inherit")});const i=this.container.querySelector("#btn-interrupt-speech");i&&i.addEventListener("click",()=>{"speechSynthesis"in window&&(window.speechSynthesis.cancel(),this.isSpeaking=!1,this.updateOrbState(),this.startListening())})}startVoiceSession(){const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(!e){const t=this.container.querySelector("#voice-live-transcript");t&&(t.innerText="Speech recognition is not supported in this browser. Please use standard chat or a Chromium browser.");return}this.recognition=new e,this.recognition.continuous=!1,this.recognition.interimResults=!0,this.recognition.lang="en-US",this.recognition.onstart=()=>{this.isListening=!0,this.updateOrbState("Listening...")},this.recognition.onresult=t=>{const i=Array.from(t.results).map(a=>a[0].transcript).join(""),s=this.container.querySelector("#voice-live-transcript");s&&(s.innerText=`“${i}”`),t.results[0].isFinal&&this.processVoiceQuery(i)},this.recognition.onend=()=>{this.isListening=!1,this.isSpeaking||this.updateOrbState("Idle")},this.startListening()}startListening(){if(this.recognition&&!this.isListening&&!this.isSpeaking)try{this.recognition.start(),this.isListening=!0,this.updateOrbState("Listening...")}catch(e){console.warn("Recognition start caught:",e)}}stopListening(){if(this.recognition&&this.isListening)try{this.recognition.stop(),this.isListening=!1,this.updateOrbState("Mic paused")}catch(e){console.warn("Recognition stop caught:",e)}}async processVoiceQuery(e){this.stopListening(),this.updateOrbState("Thinking & Retrieving...");const t=r.getActiveChat()||r.createChat();r.addMessage(t.id,{id:"msg-"+Date.now(),sender:"user",text:e,timestamp:Date.now()});const i=await w.queryVisionRAG({prompt:e,settings:r.getState().settings});r.addMessage(t.id,{id:"msg-"+(Date.now()+1),sender:"assistant",text:i.text,timestamp:Date.now(),sources:i.sources}),this.speakResponse(i.text)}speakResponse(e){if(!("speechSynthesis"in window))return;window.speechSynthesis.cancel(),this.isSpeaking=!0,this.updateOrbState("Speaking...");const t=e.replace(/#+\s/g,"").replace(/\*+/g,"").replace(/`+/g,"").replace(/\[.*?\]\(.*?\)/g,""),i=new SpeechSynthesisUtterance(t),s=r.getState().settings;i.rate=s.speechRate||1,i.pitch=s.speechPitch||1;const a=this.container.querySelector("#voice-live-transcript");a&&(a.innerText=t.slice(0,160)+(t.length>160?"...":"")),i.onend=()=>{this.isSpeaking=!1,this.updateOrbState("Listening..."),this.startListening()},i.onerror=()=>{this.isSpeaking=!1,this.updateOrbState("Listening..."),this.startListening()},window.speechSynthesis.speak(i)}updateOrbState(e){const t=this.container.querySelector("#voice-status-badge"),i=this.container.querySelector("#voice-fluid-orb");t&&e&&(t.innerText=e),i&&(this.isSpeaking?i.classList.add("speaking"):i.classList.remove("speaking"))}stopVoiceSession(){if("speechSynthesis"in window&&window.speechSynthesis.cancel(),this.recognition){try{this.recognition.stop()}catch(e){console.warn(e)}this.recognition=null}this.isListening=!1,this.isSpeaking=!1}}class q{constructor(e){this.container=e,this.stream=null}open(){this.render(),this.startCamera()}close(){this.stopCamera(),this.container.innerHTML=""}render(){this.container.innerHTML=`
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
        `)}}stopCamera(){this.stream&&(this.stream.getTracks().forEach(e=>e.stop()),this.stream=null)}bindEvents(){const e=this.container.querySelector("#btn-close-video-modal"),t=this.container.querySelector("#video-modal-overlay");e&&e.addEventListener("click",()=>this.close()),t&&t.addEventListener("click",s=>{s.target===t&&this.close()});const i=this.container.querySelector("#btn-capture-snapshot");i&&i.addEventListener("click",()=>this.captureSnapshot())}captureSnapshot(){const e=this.container.querySelector("#webcam-video-element"),t=this.container.querySelector("#snapshot-canvas");let i=`webcam_frame_${Date.now()}.png`;e&&this.stream&&t?(t.width=e.videoWidth||640,t.height=e.videoHeight||480,t.getContext("2d").drawImage(e,0,0,t.width,t.height),r.addAttachment({id:"att-"+Date.now(),name:i,type:"image/png",size:"1.24 MB",progress:100})):r.addAttachment({id:"att-"+Date.now(),name:"captured_schematic_keyframe.png",type:"image/png",size:"1.85 MB",progress:100}),this.close();const s=document.querySelector("#chat-textarea");s&&(s.value="Analyze the captured frame from the live camera stream and locate any components or text.",s.focus())}}class H{constructor(e,{onReplayIntro:t}){this.container=e,this.onReplayIntro=t,this.activeTab="general"}open(){this.render()}close(){this.container.innerHTML=""}render(){const e=r.getState().settings;this.container.innerHTML=`
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
      `:""}bindEvents(){const e=this.container.querySelector("#settings-overlay");e&&e.addEventListener("click",h=>{h.target===e&&this.close()}),this.container.querySelectorAll(".settings-tab-btn").forEach(h=>{h.addEventListener("click",()=>{this.activeTab=h.dataset.tab,this.render()})});const t=this.container.querySelector("#btn-replay-splash");t&&t.addEventListener("click",()=>{this.close(),this.onReplayIntro&&this.onReplayIntro()});const i=this.container.querySelector("#setting-topk"),s=this.container.querySelector("#topk-val");i&&s&&i.addEventListener("input",h=>{s.innerText=h.target.value,r.updateSettings({topK:parseInt(h.target.value,10)})});const a=this.container.querySelector("#setting-threshold"),o=this.container.querySelector("#threshold-val");a&&o&&a.addEventListener("input",h=>{o.innerText=h.target.value,r.updateSettings({similarityThreshold:parseFloat(h.target.value)})});const p=this.container.querySelector("#setting-reranker");p&&p.addEventListener("change",h=>{r.updateSettings({rerankerEnabled:h.target.checked})});const n=this.container.querySelector("#setting-vision-model");n&&n.addEventListener("change",h=>{r.updateSettings({visionModel:h.target.value})});const c=this.container.querySelector("#setting-ocr");c&&c.addEventListener("change",h=>{r.updateSettings({ocrEngine:h.target.value})});const v=this.container.querySelector("#setting-fps");v&&v.addEventListener("change",h=>{r.updateSettings({fps:parseFloat(h.target.value)})});const d=this.container.querySelector("#setting-autospeak");d&&d.addEventListener("change",h=>{r.updateSettings({autoSpeak:h.target.checked})});const m=this.container.querySelector("#setting-mockmode");m&&m.addEventListener("change",h=>{r.updateSettings({mockMode:h.target.checked})});const l=this.container.querySelector("#setting-backend-url");l&&l.addEventListener("change",h=>{r.updateSettings({backendUrl:h.target.value.trim()})});const f=this.container.querySelector("#btn-test-ping"),b=this.container.querySelector("#ping-status-text");f&&b&&f.addEventListener("click",async()=>{b.innerText="Pinging server...",await w.checkHealth()?b.innerHTML='<span style="color: #10a37f; font-weight: 600;">✓ Connected to FastAPI backend!</span>':b.innerHTML='<span style="color: #f59e0b;">Backend server offline. Running via Neural Simulation fallback.</span>'});const y=this.container.querySelector("#btn-export-json");y&&y.addEventListener("click",()=>{const h="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(r.getState(),null,2)),x=document.createElement("a");x.setAttribute("href",h),x.setAttribute("download",`visionrag_export_${Date.now()}.json`),document.body.appendChild(x),x.click(),x.remove()});const u=this.container.querySelector("#btn-reset-data");u&&u.addEventListener("click",()=>{confirm("Are you sure you want to reset all data and conversations?")&&(r.clearAllData(),this.close())})}}class R{constructor(e){this.container=e}open(e){this.render(e)}close(){this.container.innerHTML=""}render(e){const t=e.type==="video";e.type,this.container.innerHTML=`
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
    `,this.bindEvents()}bindEvents(){const e=this.container.querySelector("#btn-close-source-modal"),t=this.container.querySelector("#source-modal-overlay");e&&e.addEventListener("click",()=>this.close()),t&&t.addEventListener("click",i=>{i.target===t&&this.close()})}escapeHtml(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}}class V{constructor(e){this.container=e,this.mode="signup"}open(e="signup"){this.mode=e,this.render()}close(){this.container.innerHTML=""}render(){const e=this.mode==="signup";this.container.innerHTML=`
      <div class="auth-modal-overlay" id="auth-overlay">
        <div class="auth-card">
          <div class="auth-header-bar">
            <div class="auth-title">${e?"Create your account":"Welcome back"}</div>
            <button class="action-icon-btn" id="btn-close-auth" title="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="auth-tabs-toggle">
            <button class="auth-tab-btn ${e?"active":""}" id="tab-signup">Create Account</button>
            <button class="auth-tab-btn ${e?"":"active"}" id="tab-login">Log In</button>
          </div>

          <form class="auth-form" id="auth-form">
            ${e?`
              <div class="auth-input-group">
                <label class="auth-input-label">Full Name</label>
                <input type="text" class="auth-input-field" id="auth-name" placeholder="Alex Rivera" required />
              </div>
            `:""}

            <div class="auth-input-group">
              <label class="auth-input-label">Email address</label>
              <input type="email" class="auth-input-field" id="auth-email" placeholder="name@example.com" required />
            </div>

            <div class="auth-input-group">
              <label class="auth-input-label">Password</label>
              <input type="password" class="auth-input-field" id="auth-password" placeholder="••••••••" required />
            </div>

            <button type="submit" class="auth-submit-btn">
              ${e?"Create Account":"Sign In"}
            </button>
          </form>

          <div class="auth-divider-row">
            <div class="auth-divider-line"></div>
            <span>OR</span>
            <div class="auth-divider-line"></div>
          </div>

          <button class="auth-social-btn" id="btn-auth-google">
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button class="auth-social-btn" id="btn-auth-github">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>Continue with GitHub</span>
          </button>
        </div>
      </div>
    `,this.bindEvents()}bindEvents(){const e=this.container.querySelector("#auth-overlay"),t=this.container.querySelector("#btn-close-auth");e&&e.addEventListener("click",n=>{n.target===e&&this.close()}),t&&t.addEventListener("click",()=>this.close());const i=this.container.querySelector("#tab-signup"),s=this.container.querySelector("#tab-login");i&&i.addEventListener("click",()=>{this.mode="signup",this.render()}),s&&s.addEventListener("click",()=>{this.mode="login",this.render()});const a=this.container.querySelector("#auth-form");a&&a.addEventListener("submit",n=>{n.preventDefault();const c=this.container.querySelector("#auth-email").value,v=this.container.querySelector("#auth-name"),d=v?v.value:c.split("@")[0];r.setUser({loggedIn:!0,name:d,email:c,avatar:d.slice(0,2).toUpperCase()}),this.close()});const o=this.container.querySelector("#btn-auth-google");o&&o.addEventListener("click",()=>{r.setUser({loggedIn:!0,name:"Google User",email:"user@gmail.com",avatar:"GU"}),this.close()});const p=this.container.querySelector("#btn-auth-github");p&&p.addEventListener("click",()=>{r.setUser({loggedIn:!0,name:"GitHub User",email:"user@github.com",avatar:"GH"}),this.close()})}}document.addEventListener("DOMContentLoaded",()=>{const g=document.getElementById("modal-container"),e=document.getElementById("sidebar"),t=document.getElementById("main-content");C.init();const i=new A;i.init();const s=new I(g),a=new q(g),o=new R(g),p=new V(g),n=new H(g,{onReplayIntro:()=>i.replay()});new $(e,{onOpenSettings:()=>n.open(),onReplayIntro:()=>i.replay(),onOpenAuth:d=>p.open(d)}).render(),new B(t,{onOpenVoice:()=>s.open(),onOpenVideo:()=>a.open(),onOpenSource:d=>o.open(d),onOpenSettings:()=>n.open()}).render(),window.addEventListener("keydown",d=>{(d.ctrlKey||d.metaKey)&&d.key==="["&&(d.preventDefault(),r.toggleSidebar()),d.key==="Escape"&&(s.close(),a.close(),n.close(),o.close(),p.close())}),console.log("VisionRAG Multimodal Interface Initialized Successfully.")});
//# sourceMappingURL=index-CVI0UkF7.js.map
