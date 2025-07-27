// Mock data
  const followers = Array.from({length: 128}, (_,i)=>({name:`Follower ${i+1}`}));
  const following = Array.from({length: 256}, (_,i)=>({name:`Following ${i+1}`}));
  const bookmarks = [
    {title:"How to write better JS"},
    {title:"CSS Tricks I love"},
    {title:"Intro to Web Accessibility"}
  ];
  const meetings = [
    {title:"Sprint Planning – 2025-07-12"},
    {title:"1:1 with Manager – 2025-07-18"},
    {title:"Product Sync – 2025-07-24"}
  ];

  // Elements
  const avatarBtn = document.getElementById('avatarBtn');
  const dropdown = document.getElementById('dropdown');
  const avatarInput = document.getElementById('avatarInput');
  const avatarImg = document.getElementById('avatarImg');
  const dropdownAvatar = document.getElementById('dropdownAvatar');
  const editAvatarBtn = document.getElementById('editAvatarBtn');
  const followersBtn = document.getElementById('followersBtn');
  const followingBtn = document.getElementById('followingBtn');
  const followersModal = document.getElementById('followersModal-menu');
  const followersType = document.getElementById('followersType');
  const peopleList = document.getElementById('peopleList');
  const genericModal = document.getElementById('genericModal');
  const genericTitle = document.getElementById('genericTitle');
  const genericList = document.getElementById('genericList');
  const bookmarkBtn = document.getElementById('bookmarkBtn');
  const meetBtn = document.getElementById('meetBtn');
  const aiAssistantBtn = document.getElementById('aiAssistantBtn');
  const aiModal = document.getElementById('aiModal');
  const aiForm = document.getElementById('aiForm');
  const aiInput = document.getElementById('aiInput');
  const aiMessages = document.getElementById('aiMessages');

  // Dropdown toggle
  avatarBtn.addEventListener('click', (e)=>{
    const isOpen = dropdown.classList.toggle('open');
    avatarBtn.setAttribute('aria-expanded', isOpen);
  });

  // Close on outside click / Escape
  document.addEventListener('click', (e)=>{
    if(!dropdown.contains(e.target) && !avatarBtn.contains(e.target)){
      closeDropdown();
    }
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
      closeDropdown();
      closeModals();
    }
  });
  function closeDropdown(){
    dropdown.classList.remove('open');
    avatarBtn.setAttribute('aria-expanded', 'false');
  }

  // Profile image change
  editAvatarBtn.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', (e)=>{
    const file = e.target.files[0];
    if(file){
      const url = URL.createObjectURL(file);
      avatarImg.src = dropdownAvatar.src = url;
    }
  });

  // Followers / Following
  followersBtn.addEventListener('click', ()=>{
    openPeopleModal('Followers', followers);
  });
  followingBtn.addEventListener('click', ()=>{
    openPeopleModal('Following', following);
  });
  function openPeopleModal(type, arr){
    followersType.textContent = type;
    peopleList.innerHTML = arr.map(p=>`<li>${p.name}</li>`).join('');
    followersModal.classList.add('open');
    followersModal.setAttribute('aria-hidden', 'false');
    closeDropdown();
  }

  // Bookmarks / Meeting history
  bookmarkBtn.addEventListener('click', ()=>{
    openGenericModal('Bookmarks', bookmarks);
  });
  meetBtn.addEventListener('click', ()=>{
    openGenericModal('Meeting history', meetings);
  });
  function openGenericModal(title, arr){
    genericTitle.textContent = title;
    genericList.innerHTML = arr.map(b=>`<li>${b.title}</li>`).join('');
    genericModal.classList.add('open');
    genericModal.setAttribute('aria-hidden', 'false');
    closeDropdown();
  }

  // AI Assistant
  aiAssistantBtn.addEventListener('click', ()=>{
    aiModal.classList.add('open');
    aiModal.setAttribute('aria-hidden', 'false');
    closeDropdown();
    aiInput.focus();
  });
  aiForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const text = aiInput.value.trim();
    if(!text) return;
    addAiMessage(text, 'user');
    aiInput.value = '';
    setTimeout(()=>{
      addAiMessage(generateFakeReply(text), 'bot');
      aiMessages.scrollTop = aiMessages.scrollHeight;
    }, 400);
  });
  function addAiMessage(text, who){
    const div = document.createElement('div');
    div.className = 'ai-msg ' + who;
    div.textContent = text;
    aiMessages.appendChild(div);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }
  function generateFakeReply(input){
    return "You said: " + input + ". (AI is offline in this demo)";
  }

  // Close modals
  document.querySelectorAll('[data-close]').forEach(btn=>{
    btn.addEventListener('click', ()=> closeModals());
  });
  function closeModals(){
    [followersModal, genericModal, aiModal].forEach(m=>{
      m.classList.remove('open');
      m.setAttribute('aria-hidden', 'true');
    });
  }
  document.addEventListener('click', (e)=>{
    if(e.target === followersModal) closeModals();
    if(e.target === genericModal) closeModals();
    if(e.target === aiModal) closeModals();
  });
