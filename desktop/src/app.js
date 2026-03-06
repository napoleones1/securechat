// State
let currentUser = null;
let currentChat = null;
let chats = [];
let messages = [];

// Avatar utility functions
function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getAvatarUrl(user) {
  if (user && user.avatar && user.avatar.trim() !== '') {
    // Add timestamp to bypass cache
    const separator = user.avatar.includes('?') ? '&' : '?';
    return `${user.avatar}${separator}t=${Date.now()}`;
  }
  
  const name = user?.username || user?.name || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=007AFF&color=fff&size=200&bold=true`;
}

function setAvatarImage(imgElement, user, onError) {
  if (!imgElement) return;
  
  const avatarUrl = getAvatarUrl(user);
  
  imgElement.onerror = function() {
    console.error('Failed to load avatar:', this.src);
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=007AFF&color=fff&size=200&bold=true`;
    if (this.src !== fallbackUrl) {
      this.src = fallbackUrl;
    }
    if (onError) onError();
  };
  
  imgElement.onload = function() {
    console.log('Avatar loaded successfully:', this.src);
  };
  
  imgElement.src = avatarUrl;
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  setupEventListeners();
});

async function checkAuth() {
  const token = await api.getToken();
  if (token) {
    try {
      const response = await api.get('/auth/me');
      if (response.success) {
        currentUser = response.data;
        
        // Show admin panel button if user is admin
        const adminPanelBtn = document.getElementById('admin-panel-btn');
        if (adminPanelBtn && currentUser.role === 'admin') {
          adminPanelBtn.style.display = 'block';
        }
        
        await socketService.connect();
        showMainScreen();
        loadChats();
        setupSocketListeners();
      }
    } catch (error) {
      showAuthScreen();
    }
  } else {
    showAuthScreen();
  }
}

function setupEventListeners() {
  // Auth
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');
  const registerUsernameInput = document.getElementById('register-username');
  
  if (loginBtn) loginBtn.addEventListener('click', handleLogin);
  if (registerBtn) registerBtn.addEventListener('click', handleRegister);
  
  if (registerUsernameInput) {
    registerUsernameInput.addEventListener('input', (e) => {
      checkUsernameAvailability(e.target.value);
    });
  }
  
  if (showRegister) {
    showRegister.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('login-form').classList.add('hidden');
      document.getElementById('register-form').classList.remove('hidden');
    });
  }
  if (showLogin) {
    showLogin.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('register-form').classList.add('hidden');
      document.getElementById('login-form').classList.remove('hidden');
    });
  }

  // Main
  const logoutBtn = document.getElementById('logout-btn');
  const newChatBtn = document.getElementById('new-chat-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const closeProfileBtn = document.getElementById('close-profile-btn');
  const closeUserInfoBtn = document.getElementById('close-user-info-btn');
  const saveProfileBtn = document.getElementById('save-profile-btn');
  const sendBtn = document.getElementById('send-btn');
  const messageInput = document.getElementById('message-input');
  const userSearchInput = document.getElementById('user-search-input');
  const currentUserInfo = document.getElementById('current-user-info');
  const chatHeaderInfo = document.getElementById('chat-header-info');
  const attachBtn = document.getElementById('attach-btn');
  const attachMenu = document.getElementById('attach-menu');
  const voiceBtn = document.getElementById('voice-btn');
  const tabDirect = document.getElementById('tab-direct');
  const tabGroup = document.getElementById('tab-group');
  const createGroupBtn = document.getElementById('create-group-btn');
  
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (newChatBtn) newChatBtn.addEventListener('click', showNewChatModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', hideNewChatModal);
  if (closeProfileBtn) closeProfileBtn.addEventListener('click', hideProfileModal);
  if (closeUserInfoBtn) closeUserInfoBtn.addEventListener('click', hideUserInfoModal);
  if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfile);
  
  // Profile username availability checker
  const profileUsernameInput = document.getElementById('profile-username');
  if (profileUsernameInput) {
    profileUsernameInput.addEventListener('input', (e) => {
      const currentUsername = currentUser?.username?.replace(/^@/, '') || '';
      const inputUsername = e.target.value.trim();
      
      // Only check if username is different from current
      if (inputUsername && inputUsername.toLowerCase() !== currentUsername.toLowerCase()) {
        checkUsernameAvailability(inputUsername);
      } else {
        const feedback = document.getElementById('profile-username-feedback');
        if (feedback) feedback.style.display = 'none';
      }
    });
  }
  
  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  if (attachBtn) attachBtn.addEventListener('click', toggleAttachMenu);
  if (createGroupBtn) createGroupBtn.addEventListener('click', createGroup);
  
  // Tab switching
  if (tabDirect) {
    tabDirect.addEventListener('click', () => {
      tabDirect.classList.add('active');
      tabGroup.classList.remove('active');
      document.getElementById('direct-chat-content').classList.remove('hidden');
      document.getElementById('group-chat-content').classList.add('hidden');
    });
  }
  
  if (tabGroup) {
    tabGroup.addEventListener('click', () => {
      tabGroup.classList.add('active');
      tabDirect.classList.remove('active');
      document.getElementById('group-chat-content').classList.remove('hidden');
      document.getElementById('direct-chat-content').classList.add('hidden');
      loadUsersForGroup();
    });
  }
  
  // Voice button - press and hold to record
  if (voiceBtn) {
    let pressTimer;
    let startX = 0;
    let currentX = 0;
    let isRecording = false;
    
    voiceBtn.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      pressTimer = setTimeout(() => {
        startVoiceRecordingUI();
        isRecording = true;
      }, 200); // Start recording after 200ms
    });
    
    voiceBtn.addEventListener('mousemove', (e) => {
      if (isRecording) {
        currentX = e.clientX;
        const distance = startX - currentX;
        
        // Cancel if dragged left more than 100px
        if (distance > 100) {
          cancelVoiceRecording();
          isRecording = false;
        }
      }
    });
    
    voiceBtn.addEventListener('mouseup', () => {
      clearTimeout(pressTimer);
      if (isRecording) {
        stopVoiceRecordingUI();
        isRecording = false;
      }
    });
    
    voiceBtn.addEventListener('mouseleave', () => {
      clearTimeout(pressTimer);
      if (isRecording) {
        stopVoiceRecordingUI();
        isRecording = false;
      }
    });
    
    // Touch events for mobile-like behavior
    voiceBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startX = e.touches[0].clientX;
      pressTimer = setTimeout(() => {
        startVoiceRecordingUI();
        isRecording = true;
      }, 200);
    });
    
    voiceBtn.addEventListener('touchmove', (e) => {
      if (isRecording) {
        currentX = e.touches[0].clientX;
        const distance = startX - currentX;
        
        if (distance > 100) {
          cancelVoiceRecording();
          isRecording = false;
        }
      }
    });
    
    voiceBtn.addEventListener('touchend', () => {
      clearTimeout(pressTimer);
      if (isRecording) {
        stopVoiceRecordingUI();
        isRecording = false;
      }
    });
  }
  
  // Click on current user info to open profile
  if (currentUserInfo) {
    currentUserInfo.addEventListener('click', showProfileModal);
  }
  
  // Click on chat header to show user info or group info
  if (chatHeaderInfo) {
    chatHeaderInfo.addEventListener('click', () => {
      if (currentChat && currentChat.isGroupChat) {
        showGroupInfoModal();
      } else {
        showOtherUserInfo();
      }
    });
  }
  
  // Group Info modal buttons
  const closeGroupInfoBtn = document.getElementById('close-group-info-btn');
  const saveGroupInfoBtn = document.getElementById('save-group-info-btn');
  const leaveGroupBtn = document.getElementById('leave-group-btn');
  const groupAvatarUploadBtn = document.getElementById('group-avatar-upload-btn');
  const groupAvatarInput = document.getElementById('group-avatar-input');
  
  if (closeGroupInfoBtn) {
    closeGroupInfoBtn.addEventListener('click', hideGroupInfoModal);
  }
  
  if (saveGroupInfoBtn) {
    saveGroupInfoBtn.addEventListener('click', saveGroupInfo);
  }
  
  if (leaveGroupBtn) {
    leaveGroupBtn.addEventListener('click', leaveGroup);
  }
  
  if (groupAvatarUploadBtn) {
    groupAvatarUploadBtn.addEventListener('click', () => {
      groupAvatarInput?.click();
    });
  }
  
  if (groupAvatarInput) {
    groupAvatarInput.addEventListener('change', handleGroupAvatarUpload);
  }
  
  // Admin Panel buttons
  const adminPanelBtn = document.getElementById('admin-panel-btn');
  const closeAdminPanelBtn = document.getElementById('close-admin-panel-btn');
  const closeUserActionBtn = document.getElementById('close-user-action-btn');
  const closeGroupActionBtn = document.getElementById('close-group-action-btn');
  const adminSearchInput = document.getElementById('admin-search-input');
  const adminGroupsSearchInput = document.getElementById('admin-groups-search-input');
  const actionVerifyBtn = document.getElementById('action-verify-btn');
  const actionUnverifyBtn = document.getElementById('action-unverify-btn');
  const actionWarnBtn = document.getElementById('action-warn-btn');
  const actionBanBtn = document.getElementById('action-ban-btn');
  const actionUnbanBtn = document.getElementById('action-unban-btn');
  const adminTabUsers = document.getElementById('admin-tab-users');
  const adminTabGroups = document.getElementById('admin-tab-groups');
  const actionJoinGroupBtn = document.getElementById('action-join-group-btn');
  const actionViewGroupBtn = document.getElementById('action-view-group-btn');
  
  if (adminPanelBtn) {
    adminPanelBtn.addEventListener('click', showAdminPanel);
  }
  
  if (closeAdminPanelBtn) {
    closeAdminPanelBtn.addEventListener('click', hideAdminPanel);
  }
  
  if (closeUserActionBtn) {
    closeUserActionBtn.addEventListener('click', hideUserActions);
  }
  
  if (closeGroupActionBtn) {
    closeGroupActionBtn.addEventListener('click', hideGroupActions);
  }
  
  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', (e) => {
      searchAdminUsers(e.target.value);
    });
  }
  
  if (adminGroupsSearchInput) {
    adminGroupsSearchInput.addEventListener('input', (e) => {
      searchAdminGroups(e.target.value);
    });
  }
  
  if (actionVerifyBtn) {
    actionVerifyBtn.addEventListener('click', verifyUser);
  }
  
  if (actionUnverifyBtn) {
    actionUnverifyBtn.addEventListener('click', unverifyUser);
  }
  
  if (actionWarnBtn) {
    actionWarnBtn.addEventListener('click', warnUser);
  }
  
  if (actionBanBtn) {
    actionBanBtn.addEventListener('click', banUser);
  }
  
  if (actionUnbanBtn) {
    actionUnbanBtn.addEventListener('click', unbanUser);
  }
  
  // Admin tabs
  if (adminTabUsers) {
    adminTabUsers.addEventListener('click', () => {
      adminTabUsers.classList.add('active');
      adminTabGroups.classList.remove('active');
      adminTabUsers.style.borderBottom = '3px solid #007AFF';
      adminTabGroups.style.borderBottom = '3px solid transparent';
      document.getElementById('admin-users-tab-content').style.display = 'block';
      document.getElementById('admin-groups-tab-content').style.display = 'none';
    });
  }
  
  if (adminTabGroups) {
    adminTabGroups.addEventListener('click', () => {
      adminTabGroups.classList.add('active');
      adminTabUsers.classList.remove('active');
      adminTabGroups.style.borderBottom = '3px solid #007AFF';
      adminTabUsers.style.borderBottom = '3px solid transparent';
      document.getElementById('admin-groups-tab-content').style.display = 'block';
      document.getElementById('admin-users-tab-content').style.display = 'none';
      loadAllGroups();
    });
  }
  
  if (actionJoinGroupBtn) {
    actionJoinGroupBtn.addEventListener('click', joinGroupAsAdmin);
  }
  
  if (actionViewGroupBtn) {
    actionViewGroupBtn.addEventListener('click', viewGroupAsAdmin);
  }
  
  // Attach menu items
  document.getElementById('attach-image')?.addEventListener('click', () => {
    document.getElementById('image-input').click();
    hideAttachMenu();
  });
  
  document.getElementById('attach-video')?.addEventListener('click', () => {
    document.getElementById('video-input').click();
    hideAttachMenu();
  });
  
  document.getElementById('attach-audio')?.addEventListener('click', () => {
    startVoiceRecordingUI();
    hideAttachMenu();
  });
  
  document.getElementById('attach-file')?.addEventListener('click', () => {
    document.getElementById('file-input').click();
    hideAttachMenu();
  });
  
  // File inputs
  document.getElementById('image-input')?.addEventListener('change', (e) => handleFileUpload(e, 'image'));
  document.getElementById('video-input')?.addEventListener('change', (e) => handleFileUpload(e, 'video'));
  document.getElementById('file-input')?.addEventListener('change', (e) => handleFileUpload(e, 'file'));
  
  // Close attach menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!attachBtn?.contains(e.target) && !attachMenu?.contains(e.target)) {
      hideAttachMenu();
    }
  });
  
  if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
    messageInput.addEventListener('input', handleTyping);
  }
  if (userSearchInput) {
    userSearchInput.addEventListener('input', (e) => {
      searchUsers(e.target.value);
    });
  }
  
  // Group member search
  const groupMemberSearch = document.getElementById('group-member-search');
  if (groupMemberSearch) {
    groupMemberSearch.addEventListener('input', (e) => {
      searchUsersForGroup(e.target.value);
    });
  }
  
  // Group name input
  const groupNameInput = document.getElementById('group-name-input');
  if (groupNameInput) {
    groupNameInput.addEventListener('input', updateCreateGroupButton);
  }
}

function setupSocketListeners() {
  socketService.on('message:new', (message) => {
    if (currentChat && message.chat === currentChat._id) {
      displayMessage(message);
    }
    updateChatsList();
  });
  
  socketService.on('system:message', (data) => {
    console.log('System message received:', data);
    if (currentChat && data.message.chat === currentChat._id) {
      displayMessage(data.message);
    }
    updateChatsList();
  });

  socketService.on('message:delivered', (data) => {
    console.log('Message delivered:', data);
    updateMessageStatus(data.messageId, 'delivered');
  });

  socketService.on('message:read', (data) => {
    console.log('Message read:', data);
    updateMessageStatus(data.messageId, 'read');
  });

  socketService.on('chat:joined', (data) => {
    console.log('✅ Successfully joined chat:', data.chatId);
  });

  socketService.on('user:online', (data) => {
    console.log('User online:', data);
    updateUserStatus(data.userId, 'online');
  });

  socketService.on('user:offline', (data) => {
    console.log('User offline:', data);
    updateUserStatus(data.userId, 'offline');
  });

  socketService.on('typing:user', (data) => {
    console.log('Typing user event received:', data);
    
    // Update chat header if in current chat
    if (currentChat && data.chatId === currentChat._id) {
      showTypingIndicator(data.username);
    }
    
    // Update chat list preview with appropriate color
    const previewElement = document.getElementById(`chat-preview-${data.chatId}`);
    if (previewElement) {
      const chatItem = previewElement.closest('.chat-item');
      const isActive = chatItem && chatItem.classList.contains('active');
      
      previewElement.textContent = `${data.username} is typing...`;
      previewElement.style.color = isActive ? 'rgba(255, 255, 255, 0.9)' : '#4CAF50';
      previewElement.style.fontStyle = 'italic';
      previewElement.style.fontWeight = '600';
    }
  });

  socketService.on('typing:stop', (data) => {
    console.log('Typing stop event received:', data);
    
    // Update chat header if in current chat
    if (currentChat && data.chatId === currentChat._id) {
      hideTypingIndicator();
    }
    
    // Restore chat list preview
    const previewElement = document.getElementById(`chat-preview-${data.chatId}`);
    if (previewElement) {
      const chat = chats.find(c => c._id === data.chatId);
      if (chat) {
        const chatItem = previewElement.closest('.chat-item');
        const isActive = chatItem && chatItem.classList.contains('active');
        
        // Reconstruct the preview with status
        let lastMessage = 'No messages yet';
        let statusIcon = '';
        
        if (chat.lastMessage) {
          const msg = chat.lastMessage;
          
          if (msg.sender && msg.sender._id === currentUser._id) {
            const status = msg.status || 'sent';
            const sentColor = isActive ? 'rgba(255, 255, 255, 0.7)' : '#999';
            const deliveredColor = isActive ? 'rgba(255, 255, 255, 0.85)' : '#999';
            const readColor = isActive ? '#90EE90' : '#4CAF50';
            
            switch (status) {
              case 'sent':
                statusIcon = `<span style="color: ${sentColor}; margin-left: 4px;">✓</span>`;
                break;
              case 'delivered':
                statusIcon = `<span style="color: ${deliveredColor}; margin-left: 4px;">✓✓</span>`;
                break;
              case 'read':
                statusIcon = `<span style="color: ${readColor}; margin-left: 4px; font-weight: 600;">✓✓</span>`;
                break;
            }
          }
          
          if (msg.messageType === 'image') {
            lastMessage = '🖼️ Image';
          } else if (msg.messageType === 'video') {
            lastMessage = '🎥 Video';
          } else if (msg.messageType === 'audio') {
            lastMessage = '🎤 Voice message';
          } else if (msg.messageType === 'file') {
            lastMessage = '📄 File';
          } else {
            lastMessage = msg.content || 'No messages yet';
          }
        }
        
        previewElement.innerHTML = `${lastMessage}${statusIcon}`;
        previewElement.style.color = isActive ? 'rgba(255, 255, 255, 0.9)' : '#666';
        previewElement.style.fontStyle = 'normal';
        previewElement.style.fontWeight = 'normal';
      }
    }
  });
}

function updateMessageStatus(messageId, status) {
  const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
  if (!messageDiv) return;

  const statusSpan = messageDiv.querySelector('.message-status');
  if (!statusSpan) return;

  statusSpan.className = `message-status ${status}`;
  
  switch (status) {
    case 'delivered':
      statusSpan.textContent = '✓✓';
      break;
    case 'read':
      statusSpan.textContent = '✓✓';
      statusSpan.style.color = '#4CAF50';
      break;
  }
}

function showTypingIndicator(username) {
  const statusElement = document.getElementById('chat-status');
  if (statusElement) {
    statusElement.textContent = `${username} is typing...`;
    statusElement.style.color = '#007AFF';
  }
}

function hideTypingIndicator() {
  const statusElement = document.getElementById('chat-status');
  if (statusElement) {
    statusElement.textContent = 'Online';
    statusElement.style.color = '#4CAF50';
  }
}

function updateUserStatus(userId, status) {
  if (currentChat) {
    const otherUser = currentChat.participants.find(p => p._id === userId);
    if (otherUser) {
      const statusElement = document.getElementById('chat-status');
      if (statusElement) {
        statusElement.textContent = status === 'online' ? 'Online' : 'Offline';
        statusElement.style.color = status === 'online' ? '#4CAF50' : '#999';
      }
    }
  }
}

async function handleLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.success) {
      currentUser = response.data.user;
      await api.setToken(response.data.token);
      await socketService.connect();
      showMainScreen();
      loadChats();
      setupSocketListeners();
    }
  } catch (error) {
    alert(error.message);
  }
}

async function handleRegister() {
  const name = document.getElementById('register-name').value.trim();
  let username = document.getElementById('register-username').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;

  if (!name) {
    alert('Please enter your display name');
    return;
  }

  if (!username) {
    alert('Please enter a username');
    return;
  }

  // Remove @ if user typed it
  username = username.replace(/^@+/, '');
  
  // Validate username format
  if (!/^[a-z0-9_]+$/i.test(username)) {
    alert('Username can only contain letters, numbers, and underscores');
    return;
  }

  try {
    const response = await api.post('/auth/register', { name, username: `@${username.toLowerCase()}`, email, password });
    if (response.success) {
      currentUser = response.data.user;
      await api.setToken(response.data.token);
      await socketService.connect();
      showMainScreen();
      loadChats();
      setupSocketListeners();
    }
  } catch (error) {
    alert(error.message);
  }
}

async function handleLogout() {
  await api.post('/auth/logout');
  await api.clearToken();
  socketService.disconnect();
  currentUser = null;
  currentChat = null;
  chats = [];
  messages = [];
  showAuthScreen();
}

function showAuthScreen() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('main-screen').classList.add('hidden');
}

function showMainScreen() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('main-screen').classList.remove('hidden');
  
  // Display name in sidebar with badges
  const displayName = currentUser.name || currentUser.username;
  console.log('🔍 Setting sidebar name:', { displayName, isVerified: currentUser.isVerified, role: currentUser.role });
  
  const userNameElement = document.getElementById('user-name');
  if (userNameElement) {
    // Clear existing content
    userNameElement.textContent = '';
    
    // Add display name as text node
    userNameElement.appendChild(document.createTextNode(displayName));
    
    // Add verified badge if verified
    if (currentUser.isVerified) {
      const verifiedBadge = document.createElement('span');
      verifiedBadge.className = 'badge-verified';
      verifiedBadge.textContent = '✓';
      userNameElement.appendChild(verifiedBadge);
    }
    
    // Add admin badge if admin
    if (currentUser.role === 'admin') {
      const adminBadge = document.createElement('span');
      adminBadge.className = 'badge-admin';
      adminBadge.textContent = 'ADMIN';
      userNameElement.appendChild(adminBadge);
    }
    
    console.log('✅ Sidebar name set successfully');
  }
  
  // Set avatar using utility
  const avatarImg = document.getElementById('user-avatar');
  setAvatarImage(avatarImg, currentUser);
}

async function loadChats() {
  try {
    const response = await api.get('/chats');
    if (response.success) {
      chats = response.data;
      renderChats();
    }
  } catch (error) {
    console.error('Load chats error:', error);
  }
}

function renderChats() {
  const chatsList = document.getElementById('chats-list');
  chatsList.innerHTML = '';

  chats.forEach(chat => {
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    const isActive = currentChat && currentChat._id === chat._id;
    if (isActive) {
      chatItem.classList.add('active');
    }

    const chatName = getChatName(chat);
    const chatNameWithBadges = getChatNameWithBadges(chat);
    const chatAvatar = getChatAvatar(chat);
    
    // Get last message with status indicator
    let lastMessage = 'No messages yet';
    let statusIcon = '';
    
    if (chat.lastMessage) {
      const msg = chat.lastMessage;
      
      // Show status icon only for messages sent by current user
      if (msg.sender && msg.sender._id === currentUser._id) {
        const status = msg.status || 'sent';
        // Use white color for active chat, gray/green for inactive
        const sentColor = isActive ? 'rgba(255, 255, 255, 0.7)' : '#999';
        const deliveredColor = isActive ? 'rgba(255, 255, 255, 0.85)' : '#999';
        const readColor = isActive ? '#90EE90' : '#4CAF50';
        
        switch (status) {
          case 'sent':
            statusIcon = `<span style="color: ${sentColor}; margin-left: 4px;">✓</span>`;
            break;
          case 'delivered':
            statusIcon = `<span style="color: ${deliveredColor}; margin-left: 4px;">✓✓</span>`;
            break;
          case 'read':
            statusIcon = `<span style="color: ${readColor}; margin-left: 4px; font-weight: 600;">✓✓</span>`;
            break;
        }
      }
      
      // Format message content based on type
      let messagePreview = '';
      
      if (msg.messageType === 'system') {
        // System message - no sender name
        messagePreview = msg.content || 'System message';
      } else if (msg.messageType === 'image') {
        messagePreview = '🖼️ Image';
      } else if (msg.messageType === 'video') {
        messagePreview = '🎥 Video';
      } else if (msg.messageType === 'audio') {
        messagePreview = '🎤 Voice message';
      } else if (msg.messageType === 'file') {
        messagePreview = '📄 File';
      } else {
        messagePreview = msg.content || 'No messages yet';
      }
      
      // Add sender name for group chats (except system messages)
      if (chat.isGroupChat && msg.messageType !== 'system' && msg.sender) {
        const senderDisplayName = msg.sender._id === currentUser._id ? 'You' : (msg.sender.name || msg.sender.username);
        lastMessage = `${senderDisplayName}: ${messagePreview}`;
      } else {
        lastMessage = messagePreview;
      }
    }

    chatItem.innerHTML = `
      <img src="${chatAvatar}" 
           alt="Avatar" 
           class="avatar-small" 
           onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(chatName)}&background=007AFF&color=fff'" />
      <div class="chat-item-info">
        <div class="chat-item-name">${chatNameWithBadges}</div>
        <div class="chat-item-message" id="chat-preview-${chat._id}">
          ${lastMessage}${statusIcon}
        </div>
      </div>
    `;

    chatItem.addEventListener('click', () => openChat(chat));
    chatsList.appendChild(chatItem);
  });
}

function getChatName(chat) {
  if (chat.isGroupChat) {
    return chat.name;
  }
  const otherUser = chat.participants.find(p => p._id !== currentUser._id);
  return otherUser?.name || otherUser?.username || 'Unknown';
}

function getChatNameWithBadges(chat) {
  if (chat.isGroupChat) {
    return chat.name;
  }
  const otherUser = chat.participants.find(p => p._id !== currentUser._id);
  if (!otherUser) return 'Unknown';
  
  const displayName = otherUser.name || otherUser.username || 'Unknown';
  let html = displayName;
  
  if (otherUser.isVerified) {
    html += '<span class="badge-verified">✓</span>';
  }
  
  if (otherUser.role === 'admin') {
    html += '<span class="badge-admin">ADMIN</span>';
  }
  
  return html;
}

function setChatNameWithBadges(chat) {
  const chatNameElement = document.getElementById('chat-name');
  if (!chatNameElement) return;
  
  // Clear existing content
  chatNameElement.textContent = '';
  
  if (chat.isGroupChat) {
    // For group chat, just show name
    chatNameElement.textContent = chat.name;
  } else {
    // For direct chat, show name with badges
    const otherUser = chat.participants.find(p => p._id !== currentUser._id);
    if (otherUser) {
      const displayName = otherUser.name || otherUser.username || 'Unknown';
      
      // Add display name
      chatNameElement.appendChild(document.createTextNode(displayName));
      
      // Add verified badge if verified
      if (otherUser.isVerified) {
        const verifiedBadge = document.createElement('span');
        verifiedBadge.className = 'badge-verified';
        verifiedBadge.textContent = '✓';
        chatNameElement.appendChild(verifiedBadge);
      }
      
      // Add admin badge if admin
      if (otherUser.role === 'admin') {
        const adminBadge = document.createElement('span');
        adminBadge.className = 'badge-admin';
        adminBadge.textContent = 'ADMIN';
        chatNameElement.appendChild(adminBadge);
      }
    }
  }
}

function getChatAvatar(chat) {
  if (chat.isGroupChat) {
    return chat.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(chat.name) + '&background=007AFF&color=fff';
  }
  
  const otherUser = chat.participants.find(p => p._id !== currentUser._id);
  console.log('Getting avatar for chat:', chat._id);
  console.log('Other user:', otherUser);
  console.log('Other user avatar:', otherUser?.avatar);
  
  if (otherUser?.avatar && otherUser.avatar.trim() !== '') {
    // Add cache busting to uploaded avatars
    const timestamp = Date.now();
    const separator = otherUser.avatar.includes('?') ? '&' : '?';
    return `${otherUser.avatar}${separator}t=${timestamp}`;
  }
  
  // Generate avatar from username
  const name = otherUser?.username || 'User';
  const avatarUrl = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=007AFF&color=fff';
  console.log('Generated avatar URL:', avatarUrl);
  return avatarUrl;
}

async function openChat(chat) {
  currentChat = chat;
  messages = [];
  
  document.getElementById('empty-state').classList.add('hidden');
  document.getElementById('chat-container').classList.remove('hidden');
  
  const chatName = getChatName(chat);
  const chatAvatar = getChatAvatar(chat);
  
  // Set chat name with badges using DOM
  setChatNameWithBadges(chat);
  
  // Set avatar with error fallback and cache busting
  const avatarImg = document.getElementById('chat-avatar');
  avatarImg.src = chatAvatar;
  avatarImg.onerror = function() {
    console.error('Failed to load chat avatar, using fallback');
    this.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(chatName) + '&background=007AFF&color=fff';
  };
  avatarImg.onload = function() {
    console.log('✅ Chat avatar loaded:', this.src);
  };
  
  // Set status - for groups show member count, for direct chats show online status
  const statusElement = document.getElementById('chat-status');
  if (chat.isGroupChat) {
    // Filter out super admin from count
    const visibleMembers = chat.participants ? chat.participants.filter(p => {
      const participant = typeof p === 'object' ? p : { _id: p };
      return participant.role !== 'admin'; // Exclude super admin
    }) : [];
    const memberCount = visibleMembers.length;
    
    const isAdminViewing = currentUser.role === 'admin' && !chat.participants.some(p => {
      const pId = typeof p === 'object' ? p._id : p;
      return pId === currentUser._id;
    });
    
    if (isAdminViewing) {
      statusElement.innerHTML = `${memberCount} members <span style="color: #FF9800; font-weight: 600; margin-left: 8px;">👁️ Admin View</span>`;
    } else {
      statusElement.textContent = `${memberCount} members`;
    }
    statusElement.style.color = '#666'; // Gray color for member count
  } else {
    const otherUser = chat.participants.find(p => p._id !== currentUser._id);
    if (otherUser && otherUser.status === 'online') {
      statusElement.textContent = 'Online';
      statusElement.style.color = '#4CAF50'; // Green for online
    } else {
      statusElement.textContent = 'Offline';
      statusElement.style.color = '#999'; // Gray for offline
    }
  }
  
  renderChats();
  
  // Join chat room FIRST
  console.log('Joining chat room:', chat._id);
  socketService.joinChat(chat._id);
  
  // Then load messages
  await loadMessages();
}

async function loadMessages() {
  try {
    const response = await api.get(`/messages/${currentChat._id}`);
    if (response.success) {
      messages = response.data;
      renderMessages();
    }
  } catch (error) {
    console.error('Load messages error:', error);
  }
}

function renderMessages() {
  const container = document.getElementById('messages-container');
  container.innerHTML = '';

  messages.forEach(message => {
    displayMessage(message);
  });

  container.scrollTop = container.scrollHeight;
}

function displayMessage(message) {
  const container = document.getElementById('messages-container');
  const messageDiv = document.createElement('div');
  
  // Handle system messages differently
  if (message.messageType === 'system') {
    messageDiv.className = 'message system-message';
    messageDiv.innerHTML = `
      <div class="system-message-content">
        ${message.content}
      </div>
    `;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
    return;
  }
  
  // Add special class for admin messages
  const isAdminMsg = message.isAdminMessage || (message.sender && message.sender.role === 'admin');
  const baseClass = message.sender._id === currentUser._id ? 'sent' : 'received';
  messageDiv.className = `message ${baseClass}${isAdminMsg ? ' admin-message' : ''}`;
  messageDiv.dataset.messageId = message._id;

  const time = new Date(message.createdAt).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Get sender name with badges for group chats
  let senderName = '';
  if (currentChat && currentChat.isGroupChat && message.sender._id !== currentUser._id) {
    const displayName = message.sender.name || message.sender.username || 'Unknown';
    const verifiedBadge = getVerifiedBadge(message.sender);
    const adminBadge = getAdminBadge(message.sender);
    senderName = `<div class="message-sender">${displayName}${verifiedBadge}${adminBadge}</div>`;
  }

  let contentHTML = '';

  // Render based on message type
  switch (message.messageType) {
    case 'image':
      contentHTML = `
        <div class="message-media">
          <img src="${message.fileUrl}" alt="${message.fileName}" onclick="window.open('${message.fileUrl}', '_blank')" style="cursor: pointer;" />
        </div>
      `;
      break;
    
    case 'video':
      contentHTML = `
        <div class="message-media">
          <video controls>
            <source src="${message.fileUrl}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      `;
      break;
    
    case 'audio':
      contentHTML = `
        <div class="message-audio">
          <span style="font-size: 24px;">🎤</span>
          <audio controls style="max-width: 250px;">
            <source src="${message.fileUrl}" type="audio/webm">
            <source src="${message.fileUrl}" type="audio/mpeg">
            Your browser does not support the audio tag.
          </audio>
        </div>
      `;
      break;
    
    case 'file':
      const fileSize = message.fileSize ? formatFileSize(message.fileSize) : '';
      contentHTML = `
        <div class="message-file">
          <span class="file-icon">📄</span>
          <div class="file-info">
            <div class="file-name">${message.fileName || 'File'}</div>
            <div class="file-size">${fileSize}</div>
          </div>
          <a href="${message.fileUrl}" download="${message.fileName}" style="text-decoration: none; font-size: 20px;">⬇️</a>
        </div>
      `;
      break;
    
    default: // text
      contentHTML = `<div>${message.content}</div>`;
  }

  const statusIcon = getStatusIcon(message);

  messageDiv.innerHTML = `
    <div class="message-bubble">
      ${senderName}
      ${contentHTML}
      <div class="message-time">
        ${time}
        ${statusIcon}
      </div>
    </div>
  `;

  container.appendChild(messageDiv);
  container.scrollTop = container.scrollHeight;

  // Mark as read if it's a received message
  if (message.sender._id !== currentUser._id && currentChat) {
    socketService.markAsRead(message._id, currentChat._id);
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

let typingTimeout = null;

function sendMessage() {
  const input = document.getElementById('message-input');
  const content = input.value.trim();

  if (!content || !currentChat) return;

  socketService.sendMessage({
    chatId: currentChat._id,
    content,
    messageType: 'text',
  });

  input.value = '';
  socketService.stopTyping(currentChat._id);
}

function handleTyping() {
  if (!currentChat) return;
  
  console.log('Sending typing start for chat:', currentChat._id);
  socketService.startTyping(currentChat._id);
  
  // Clear previous timeout
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }
  
  // Stop typing after 2 seconds of inactivity
  typingTimeout = setTimeout(() => {
    console.log('Sending typing stop for chat:', currentChat._id);
    socketService.stopTyping(currentChat._id);
  }, 2000);
}

function showNewChatModal() {
  document.getElementById('new-chat-modal').classList.remove('hidden');
}

function hideNewChatModal() {
  document.getElementById('new-chat-modal').classList.add('hidden');
  document.getElementById('user-search-input').value = '';
  document.getElementById('users-list').innerHTML = '';
  
  // Reset to direct chat tab
  document.getElementById('tab-direct').classList.add('active');
  document.getElementById('tab-group').classList.remove('active');
  document.getElementById('direct-chat-content').classList.remove('hidden');
  document.getElementById('group-chat-content').classList.add('hidden');
  
  // Reset group form
  document.getElementById('group-name-input').value = '';
  document.getElementById('group-member-search').value = '';
  selectedMembers = [];
  renderSelectedMembers();
}

async function searchUsers(query) {
  if (!query.trim()) {
    document.getElementById('users-list').innerHTML = '';
    return;
  }

  try {
    const response = await api.get(`/users?search=${query}`);
    if (response.success) {
      renderUsers(response.data);
    }
  } catch (error) {
    console.error('Search users error:', error);
  }
}

function renderUsers(users) {
  const usersList = document.getElementById('users-list');
  usersList.innerHTML = '';

  users.forEach(user => {
    const userItem = document.createElement('div');
    userItem.className = 'user-item';
    
    const displayName = user.name || user.username || 'Unknown';
    const verifiedBadge = getVerifiedBadge(user);
    const adminBadge = getAdminBadge(user);
    
    userItem.innerHTML = `
      <img src="${user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName) + '&background=007AFF&color=fff'}" alt="Avatar" class="avatar-small" />
      <div>
        <div style="font-weight: 600;">${displayName}${verifiedBadge}${adminBadge}</div>
        <div style="font-size: 13px; color: #666;">${user.username || user.email}</div>
      </div>
    `;

    userItem.addEventListener('click', () => createChat(user._id));
    usersList.appendChild(userItem);
  });
}

async function createChat(userId) {
  try {
    const response = await api.post('/chats', { userId });
    if (response.success) {
      hideNewChatModal();
      await loadChats();
      openChat(response.data);
    }
  } catch (error) {
    console.error('Create chat error:', error);
  }
}

function updateChatsList() {
  loadChats();
}


async function showProfileModal() {
  document.getElementById('profile-modal').classList.remove('hidden');
  
  // Fetch latest user data from server
  try {
    const response = await api.get('/auth/me');
    if (response.success) {
      currentUser = response.data;
      console.log('🔄 Refreshed user data:', JSON.stringify(currentUser, null, 2));
      console.log('🔄 Avatar from server:', currentUser.avatar);
    }
  } catch (error) {
    console.error('Failed to refresh user data:', error);
  }
  
  const avatarImg = document.getElementById('profile-avatar');
  const avatarPlaceholder = document.getElementById('avatar-placeholder');
  
  // Set placeholder text with display name
  if (avatarPlaceholder) {
    avatarPlaceholder.textContent = getInitials(currentUser.name || currentUser.username);
  }
  
  // Check if user has custom avatar
  const hasAvatar = currentUser.avatar && currentUser.avatar.trim() !== '';
  console.log('🔍 Has avatar?', hasAvatar);
  console.log('🔍 Avatar value:', currentUser.avatar);
  
  if (hasAvatar) {
    console.log('✅ Loading custom avatar');
    
    // Load avatar with cache busting
    const timestamp = Date.now();
    const avatarUrl = `${currentUser.avatar}?t=${timestamp}`;
    console.log('🔗 Avatar URL with cache busting:', avatarUrl);
    
    // Hide placeholder, show image
    if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
    avatarImg.style.display = 'block';
    avatarImg.src = avatarUrl;
    
    avatarImg.onerror = function() {
      console.error('❌ Failed to load avatar, showing placeholder');
      this.style.display = 'none';
      if (avatarPlaceholder) avatarPlaceholder.style.display = 'flex';
    };
    
    avatarImg.onload = function() {
      console.log('✅ Avatar loaded successfully in modal');
      this.style.display = 'block';
      if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
    };
  } else {
    console.log('ℹ️ No custom avatar, showing placeholder');
    // No avatar, show placeholder
    avatarImg.style.display = 'none';
    if (avatarPlaceholder) avatarPlaceholder.style.display = 'flex';
  }
  
  // Populate name field
  document.getElementById('profile-name').value = currentUser.name || '';
  
  // Populate username field (remove @ prefix for display)
  const usernameValue = currentUser.username || '';
  document.getElementById('profile-username').value = usernameValue.replace(/^@/, '');
  
  document.getElementById('profile-email').value = currentUser.email || '';
  document.getElementById('profile-bio').value = currentUser.bio || '';
  
  // Setup avatar upload
  const avatarInput = document.getElementById('avatar-input');
  if (avatarInput) {
    // Remove old listener and add new one
    avatarInput.onchange = null;
    avatarInput.onchange = handleAvatarUpload;
  }
}

async function hideProfileModal() {
  document.getElementById('profile-modal').classList.add('hidden');
  
  // Update sidebar avatar after closing modal
  const sidebarAvatar = document.getElementById('user-avatar');
  if (sidebarAvatar && currentUser) {
    const timestamp = Date.now();
    if (currentUser.avatar && currentUser.avatar.trim() !== '') {
      sidebarAvatar.src = `${currentUser.avatar}?t=${timestamp}`;
      console.log('✅ Sidebar avatar updated on modal close');
    } else {
      // Use UI Avatars as fallback with display name
      const name = currentUser.name || currentUser.username || 'User';
      sidebarAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=007AFF&color=fff&size=200&bold=true`;
    }
  }
  
  // Reload chats to update avatar in chat list
  await loadChats();
}

async function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Image size must be less than 5MB');
    return;
  }

  const avatarImg = document.getElementById('profile-avatar');
  const avatarPlaceholder = document.getElementById('avatar-placeholder');
  
  console.log('🔍 Avatar elements check:');
  console.log('avatarImg element:', avatarImg);
  console.log('avatarPlaceholder element:', avatarPlaceholder);
  
  if (!avatarImg || !avatarPlaceholder) {
    console.error('❌ Avatar elements not found!');
    alert('Error: Avatar elements not found in DOM');
    return;
  }

  try {
    console.log('📤 Uploading avatar...', file.name);
    
    // Upload file
    const formData = new FormData();
    formData.append('file', file);

    const token = await api.getToken();
    
    const response = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const data = await response.json();
    console.log('📥 Upload response:', data);

    if (!data.success) {
      console.error('❌ Upload failed:', data);
      alert('Upload gagal: ' + (data.message || 'Unknown error'));
      return;
    }

    const avatarUrl = `http://localhost:5000${data.data.fileUrl}`;
    console.log('🖼️ Avatar URL:', avatarUrl);
    
    // Update profile in database
    const updateResponse = await api.put('/users/profile', { avatar: avatarUrl });
    console.log('✅ Update response:', updateResponse);
    
    if (!updateResponse.success) {
      console.error('❌ Profile update failed:', updateResponse);
      alert('Gagal update profile: ' + (updateResponse.message || 'Unknown error'));
      return;
    }

    // CRITICAL: Update currentUser with the response
    currentUser = updateResponse.data;
    console.log('👤 Updated currentUser:', JSON.stringify(currentUser, null, 2));
    console.log('👤 Avatar field:', currentUser.avatar);
    
    // Now update UI with the uploaded image
    const timestamp = Date.now();
    const cachedUrl = `${avatarUrl}?t=${timestamp}`;
    
    console.log('🔄 Updating UI with:', cachedUrl);
    
    // FIRST: Hide placeholder
    if (avatarPlaceholder) {
      avatarPlaceholder.style.display = 'none';
      console.log('✅ Placeholder hidden');
    }
    
    // SECOND: Show and load image
    avatarImg.onload = function() {
      console.log('✅✅✅ Image LOADED successfully!');
      console.log('Image src:', this.src);
      console.log('Image display:', this.style.display);
      console.log('Image naturalWidth:', this.naturalWidth);
      console.log('Image naturalHeight:', this.naturalHeight);
    };
    
    avatarImg.onerror = function() {
      console.error('❌❌❌ Image FAILED to load!');
      console.error('Failed src:', this.src);
      // Show placeholder again if image fails
      if (avatarPlaceholder) {
        avatarPlaceholder.style.display = 'flex';
      }
      this.style.display = 'none';
    };
    
    avatarImg.style.display = 'block';
    avatarImg.src = cachedUrl;
    console.log('✅ Profile modal image src set to:', avatarImg.src);
    console.log('✅ Profile modal image display:', avatarImg.style.display);
    
    // THIRD: Update sidebar avatar
    const sidebarAvatar = document.getElementById('user-avatar');
    if (sidebarAvatar) {
      sidebarAvatar.src = cachedUrl;
      console.log('✅ Sidebar avatar updated');
    }
    
    // FOURTH: Reload chats to update avatar in chat list
    await loadChats();
    console.log('✅ Chats reloaded');
    
    // Show success message AFTER all updates
    setTimeout(() => {
      alert('✅ Avatar berhasil diupdate!');
    }, 100);
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Upload gagal: ' + error.message);
  }
}

async function saveProfile() {
  const name = document.getElementById('profile-name').value.trim();
  const username = document.getElementById('profile-username').value.trim();
  const bio = document.getElementById('profile-bio').value.trim();

  if (!name) {
    alert('Display name is required');
    return;
  }

  if (!username) {
    alert('Username is required');
    return;
  }

  // Validate username format
  if (!/^[a-z0-9_]+$/i.test(username)) {
    alert('Username can only contain letters, numbers, and underscores');
    return;
  }

  if (username.length < 2 || username.length > 30) {
    alert('Username must be between 2 and 30 characters');
    return;
  }

  try {
    const response = await api.put('/users/profile', { 
      name, 
      username: `@${username.toLowerCase()}`, 
      bio 
    });
    
    if (response.success) {
      currentUser = response.data;
      
      // Update sidebar with display name and badges using DOM
      const displayName = currentUser.name || currentUser.username;
      const userNameElement = document.getElementById('user-name');
      if (userNameElement) {
        userNameElement.textContent = '';
        userNameElement.appendChild(document.createTextNode(displayName));
        
        if (currentUser.isVerified) {
          const verifiedBadge = document.createElement('span');
          verifiedBadge.className = 'badge-verified';
          verifiedBadge.textContent = '✓';
          userNameElement.appendChild(verifiedBadge);
        }
        
        if (currentUser.role === 'admin') {
          const adminBadge = document.createElement('span');
          adminBadge.className = 'badge-admin';
          adminBadge.textContent = 'ADMIN';
          userNameElement.appendChild(adminBadge);
        }
      }
      
      // Update username display if exists
      const usernameDisplay = document.getElementById('user-username');
      if (usernameDisplay) {
        usernameDisplay.textContent = currentUser.username;
      }
      
      alert('Profile updated successfully!');
      hideProfileModal();
      
      // Reload chats to update name in chat list
      loadChats();
    }
  } catch (error) {
    alert('Failed to update profile: ' + error.message);
  }
}

function showOtherUserInfo() {
  if (!currentChat) return;
  
  // Get the other user from current chat
  const otherUser = currentChat.participants.find(p => p._id !== currentUser._id);
  if (!otherUser) return;
  
  console.log('Showing info for user:', otherUser);
  
  // Show modal
  document.getElementById('user-info-modal').classList.remove('hidden');
  
  const avatarImg = document.getElementById('user-info-avatar');
  const avatarPlaceholder = document.getElementById('user-info-avatar-placeholder');
  
  // Set placeholder text with display name
  if (avatarPlaceholder) {
    avatarPlaceholder.textContent = getInitials(otherUser.name || otherUser.username);
  }
  
  // Check if user has custom avatar
  const hasAvatar = otherUser.avatar && otherUser.avatar.trim() !== '';
  
  if (hasAvatar) {
    // Load avatar with cache busting
    const timestamp = Date.now();
    const avatarUrl = `${otherUser.avatar}?t=${timestamp}`;
    
    // Hide placeholder, show image
    if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
    avatarImg.style.display = 'block';
    avatarImg.src = avatarUrl;
    
    avatarImg.onerror = function() {
      console.error('Failed to load user avatar');
      this.style.display = 'none';
      if (avatarPlaceholder) avatarPlaceholder.style.display = 'flex';
    };
  } else {
    // No avatar, show placeholder
    avatarImg.style.display = 'none';
    if (avatarPlaceholder) avatarPlaceholder.style.display = 'flex';
  }
  
  // Set user info with display name and badges
  const displayName = otherUser.name || otherUser.username || 'Unknown';
  const usernameElement = document.getElementById('user-info-username');
  usernameElement.innerHTML = displayName + getVerifiedBadge(otherUser) + getAdminBadge(otherUser);
  document.getElementById('user-info-email').textContent = otherUser.username + ' • ' + (otherUser.email || 'Not available');
  document.getElementById('user-info-bio').textContent = otherUser.bio || 'No bio available';
  document.getElementById('user-info-status').textContent = otherUser.status || 'offline';
  
  // Style status
  const statusElement = document.getElementById('user-info-status');
  if (otherUser.status === 'online') {
    statusElement.style.color = '#4CAF50';
    statusElement.style.fontWeight = '600';
  } else {
    statusElement.style.color = '#999';
  }
}

function hideUserInfoModal() {
  document.getElementById('user-info-modal').classList.add('hidden');
}


// Attach menu functions
function toggleAttachMenu() {
  const attachMenu = document.getElementById('attach-menu');
  attachMenu.classList.toggle('hidden');
}

function hideAttachMenu() {
  const attachMenu = document.getElementById('attach-menu');
  attachMenu.classList.add('hidden');
}

// File upload handler
async function handleFileUpload(event, type) {
  const file = event.target.files[0];
  if (!file || !currentChat) return;

  // Validate file size (max 50MB)
  if (file.size > 50 * 1024 * 1024) {
    alert('File size must be less than 50MB');
    return;
  }

  try {
    console.log(`📤 Uploading ${type}:`, file.name);

    // Show uploading indicator
    const container = document.getElementById('messages-container');
    const uploadingDiv = document.createElement('div');
    uploadingDiv.className = 'message sent';
    uploadingDiv.innerHTML = `
      <div class="message-bubble">
        <div>Uploading ${file.name}...</div>
      </div>
    `;
    container.appendChild(uploadingDiv);
    container.scrollTop = container.scrollHeight;

    // Upload file
    const formData = new FormData();
    formData.append('file', file);

    const token = await api.getToken();
    
    const response = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      const fileUrl = `http://localhost:5000${data.data.fileUrl}`;
      
      // Remove uploading indicator
      uploadingDiv.remove();

      // Send message with file
      socketService.sendMessage({
        chatId: currentChat._id,
        content: file.name,
        messageType: type,
        fileUrl: fileUrl,
        fileName: file.name,
        fileSize: file.size
      });

      console.log(`✅ ${type} uploaded successfully`);
    } else {
      uploadingDiv.remove();
      alert('Upload failed: ' + (data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('Upload failed: ' + error.message);
  }

  // Reset input
  event.target.value = '';
}

// Voice recording
let mediaRecorder;
let audioChunks = [];
let recordingTimer;
let recordingSeconds = 0;

async function startVoiceRecordingUI() {
  if (!currentChat) {
    alert('Please select a chat first');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    recordingSeconds = 0;

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
      
      // Upload audio file
      await uploadVoiceMessage(audioFile);
      
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
      
      // Hide recording UI
      hideVoiceRecordingUI();
    };

    mediaRecorder.start();
    console.log('🎤 Recording started...');

    // Show recording UI
    showVoiceRecordingUI();

    // Start timer
    recordingTimer = setInterval(() => {
      recordingSeconds++;
      updateRecordingTimer();
    }, 1000);

  } catch (error) {
    console.error('Microphone access error:', error);
    alert('Could not access microphone. Please check permissions.');
  }
}

function stopVoiceRecordingUI() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    clearInterval(recordingTimer);
    console.log('🎤 Recording stopped');
  }
}

function cancelVoiceRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    clearInterval(recordingTimer);
    
    // Don't upload, just clean up
    if (mediaRecorder.stream) {
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    hideVoiceRecordingUI();
    console.log('🎤 Recording cancelled');
  }
}

function showVoiceRecordingUI() {
  const recordingUI = document.getElementById('voice-recording-ui');
  const inputContainer = document.querySelector('.message-input-container');
  
  if (recordingUI && inputContainer) {
    inputContainer.style.display = 'none';
    recordingUI.classList.remove('hidden');
  }
}

function hideVoiceRecordingUI() {
  const recordingUI = document.getElementById('voice-recording-ui');
  const inputContainer = document.querySelector('.message-input-container');
  
  if (recordingUI && inputContainer) {
    recordingUI.classList.add('hidden');
    inputContainer.style.display = 'flex';
  }
  
  recordingSeconds = 0;
  updateRecordingTimer();
}

function updateRecordingTimer() {
  const timerElement = document.getElementById('recording-timer');
  if (timerElement) {
    const minutes = Math.floor(recordingSeconds / 60);
    const seconds = recordingSeconds % 60;
    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

function showRecordingUI() {
  const container = document.getElementById('messages-container');
  const recordingDiv = document.createElement('div');
  recordingDiv.id = 'recording-indicator';
  recordingDiv.style.cssText = 'position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: #ff4444; color: white; padding: 15px 30px; border-radius: 25px; display: flex; align-items: center; gap: 10px; z-index: 100;';
  recordingDiv.innerHTML = `
    <span style="font-size: 20px;">🎤</span>
    <span>Recording... Click to stop</span>
  `;
  recordingDiv.onclick = () => {
    stopVoiceRecording();
    recordingDiv.remove();
  };
  document.body.appendChild(recordingDiv);
}

async function uploadVoiceMessage(audioFile) {
  try {
    console.log('📤 Uploading voice message...');

    const formData = new FormData();
    formData.append('file', audioFile);

    const token = await api.getToken();
    
    const response = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      const fileUrl = `http://localhost:5000${data.data.fileUrl}`;

      // Send message with audio
      socketService.sendMessage({
        chatId: currentChat._id,
        content: 'Voice message',
        messageType: 'audio',
        fileUrl: fileUrl,
        fileName: audioFile.name,
        fileSize: audioFile.size
      });

      console.log('✅ Voice message sent');
    } else {
      alert('Upload failed: ' + (data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Upload error:', error);
    alert('Upload failed: ' + error.message);
  }
}

// Message status indicator
function getStatusIcon(message) {
  if (!message.sender || message.sender._id !== currentUser._id) {
    return ''; // Don't show status for received messages
  }

  const status = message.status || 'sent';
  
  switch (status) {
    case 'sent':
      return '<span class="message-status sent">✓</span>';
    case 'delivered':
      return '<span class="message-status delivered">✓✓</span>';
    case 'read':
      return '<span class="message-status read">✓✓</span>';
    default:
      return '';
  }
}


// Group chat functionality
let selectedMembers = [];

async function loadUsersForGroup() {
  try {
    const response = await api.get('/users');
    if (response.success) {
      renderGroupUsers(response.data);
    }
  } catch (error) {
    console.error('Load users error:', error);
  }
}

async function searchUsersForGroup(query) {
  if (!query.trim()) {
    loadUsersForGroup();
    return;
  }

  try {
    const response = await api.get(`/users?search=${query}`);
    if (response.success) {
      renderGroupUsers(response.data);
    }
  } catch (error) {
    console.error('Search users error:', error);
  }
}

function renderGroupUsers(users) {
  const usersList = document.getElementById('group-users-list');
  usersList.innerHTML = '';

  users.forEach(user => {
    const isSelected = selectedMembers.some(m => m._id === user._id);
    
    const displayName = user.name || user.username || 'Unknown';
    const verifiedBadge = getVerifiedBadge(user);
    const adminBadge = getAdminBadge(user);
    
    const userItem = document.createElement('div');
    userItem.className = 'user-item' + (isSelected ? ' selected' : '');
    userItem.style.opacity = isSelected ? '0.5' : '1';
    userItem.innerHTML = `
      <img src="${user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName) + '&background=007AFF&color=fff'}" 
           alt="Avatar" 
           class="avatar-small" />
      <div>
        <div style="font-weight: 600;">${displayName}${verifiedBadge}${adminBadge}</div>
        <div style="font-size: 13px; color: #666;">${user.username || user.email}</div>
      </div>
      ${isSelected ? '<span style="margin-left: auto; color: #007AFF;">✓</span>' : ''}
    `;

    if (!isSelected) {
      userItem.addEventListener('click', () => addMemberToGroup(user));
    }
    
    usersList.appendChild(userItem);
  });
}

function addMemberToGroup(user) {
  if (selectedMembers.some(m => m._id === user._id)) return;
  
  selectedMembers.push(user);
  renderSelectedMembers();
  renderGroupUsers([]); // Re-render to update selection
  loadUsersForGroup();
  updateCreateGroupButton();
}

function removeMemberFromGroup(userId) {
  selectedMembers = selectedMembers.filter(m => m._id !== userId);
  renderSelectedMembers();
  loadUsersForGroup();
  updateCreateGroupButton();
}

function renderSelectedMembers() {
  const container = document.getElementById('selected-members');
  
  if (selectedMembers.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = selectedMembers.map(member => `
    <div class="selected-member">
      <span>${member.username}</span>
      <span class="remove-member" onclick="removeMemberFromGroup('${member._id}')">×</span>
    </div>
  `).join('');
}

function updateCreateGroupButton() {
  const groupName = document.getElementById('group-name-input').value.trim();
  const createBtn = document.getElementById('create-group-btn');
  
  if (createBtn) {
    // Minimal 1 member (karena pembuat grup sudah termasuk, total jadi 2)
    createBtn.disabled = !groupName || selectedMembers.length < 1;
  }
}

async function createGroup() {
  const groupName = document.getElementById('group-name-input').value.trim();
  
  if (!groupName) {
    alert('Please enter a group name');
    return;
  }
  
  if (selectedMembers.length < 1) {
    alert('Please select at least 1 member');
    return;
  }
  
  try {
    const participantIds = selectedMembers.map(m => m._id);
    
    const response = await api.post('/chats/group', {
      name: groupName,
      participants: participantIds
    });
    
    if (response.success) {
      console.log('Group created:', response.data);
      
      // Emit system message if available
      if (response.systemMessage) {
        socketService.socket.emit('system:message', {
          chatId: response.data._id,
          message: response.systemMessage
        });
      }
      
      // Reset form
      document.getElementById('group-name-input').value = '';
      selectedMembers = [];
      renderSelectedMembers();
      
      // Close modal and reload chats
      hideNewChatModal();
      await loadChats();
      
      // Open the new group chat
      openChat(response.data);
    }
  } catch (error) {
    console.error('Create group error:', error);
    alert('Failed to create group: ' + error.message);
  }
}

// Make removeMemberFromGroup available globally
window.removeMemberFromGroup = removeMemberFromGroup;


// Group Info Modal Functions
async function showGroupInfoModal() {
  if (!currentChat || !currentChat.isGroupChat) return;
  
  console.log('Opening group info for:', currentChat);
  
  try {
    // Fetch latest group data
    const response = await api.get(`/chats`);
    if (response.success) {
      const latestChat = response.data.find(c => c._id === currentChat._id);
      if (latestChat) {
        currentChat = latestChat;
      }
    }
    
    // Show modal
    document.getElementById('group-info-modal').classList.remove('hidden');
    
    // Check if current user is admin
    const isCreator = currentChat.admin && currentChat.admin._id === currentUser._id;
    const isAdmin = currentChat.admins && currentChat.admins.some(admin => {
      const adminId = typeof admin === 'object' ? admin._id : admin;
      return adminId === currentUser._id;
    });
    const canEdit = isCreator || isAdmin;
    
    console.log('User permissions:', { isCreator, isAdmin, canEdit });
    
    // Set group avatar
    const avatarImg = document.getElementById('group-info-avatar');
    const avatarPlaceholder = document.getElementById('group-info-avatar-placeholder');
    const avatarUploadBtn = document.getElementById('group-avatar-upload-btn');
    
    // Show/hide upload button based on admin status
    if (avatarUploadBtn) {
      avatarUploadBtn.style.display = canEdit ? 'flex' : 'none';
    }
    
    if (avatarPlaceholder) {
      avatarPlaceholder.textContent = getInitials(currentChat.name || 'Group');
    }
    
    const hasAvatar = currentChat.avatar && currentChat.avatar.trim() !== '';
    if (hasAvatar) {
      const timestamp = Date.now();
      const avatarUrl = `${currentChat.avatar}?t=${timestamp}`;
      
      if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
      avatarImg.style.display = 'block';
      avatarImg.src = avatarUrl;
      
      avatarImg.onerror = function() {
        this.style.display = 'none';
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'flex';
      };
    } else {
      avatarImg.style.display = 'none';
      if (avatarPlaceholder) avatarPlaceholder.style.display = 'flex';
    }
    
    // Set group name and bio
    const nameInput = document.getElementById('group-info-name');
    const bioInput = document.getElementById('group-info-bio');
    const saveBtn = document.getElementById('save-group-info-btn');
    
    nameInput.value = currentChat.name || '';
    bioInput.value = currentChat.bio || '';
    
    // Enable/disable editing based on admin status
    nameInput.disabled = !canEdit;
    bioInput.disabled = !canEdit;
    saveBtn.style.display = canEdit ? 'block' : 'none';
    
    // Show Leave Group button (hide for super admin viewing)
    const leaveBtn = document.getElementById('leave-group-btn');
    const isMember = currentChat.participants.some(p => p._id === currentUser._id);
    if (leaveBtn) {
      leaveBtn.style.display = isMember ? 'block' : 'none';
    }
    
    // Render members list
    renderGroupMembers(canEdit);
    
  } catch (error) {
    console.error('Error loading group info:', error);
    alert('Failed to load group info');
  }
}

function hideGroupInfoModal() {
  document.getElementById('group-info-modal').classList.add('hidden');
}

function renderGroupMembers(canEdit) {
  const membersList = document.getElementById('group-members-list');
  const membersCount = document.getElementById('group-members-count');
  
  if (!currentChat || !currentChat.participants) return;
  
  // Filter out super admin from member list
  const visibleMembers = currentChat.participants.filter(member => {
    const memberData = typeof member === 'object' ? member : { _id: member };
    return memberData.role !== 'admin'; // Hide super admin (role: 'admin')
  });
  
  membersCount.textContent = visibleMembers.length;
  
  membersList.innerHTML = visibleMembers.map(member => {
    const memberId = typeof member === 'object' ? member._id : member;
    const memberData = typeof member === 'object' ? member : { _id: member, username: 'Unknown' };
    
    // Check if member is creator
    const isCreator = currentChat.admin && (
      typeof currentChat.admin === 'object' 
        ? currentChat.admin._id === memberId 
        : currentChat.admin === memberId
    );
    
    // Check if member is admin
    const isAdmin = currentChat.admins && currentChat.admins.some(admin => {
      const adminId = typeof admin === 'object' ? admin._id : admin;
      return adminId === memberId;
    });
    
    // Determine role
    let role = 'Member';
    let roleClass = 'member-badge';
    if (isCreator) {
      role = 'Creator';
      roleClass = 'admin-badge';
    } else if (isAdmin) {
      role = 'Admin';
      roleClass = 'admin-badge';
    }
    
    // Show action buttons only if current user can edit and target is not creator
    const showActions = canEdit && !isCreator && memberId !== currentUser._id;
    
    return `
      <div class="group-member-item">
        <img src="${memberData.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(memberData.username) + '&background=007AFF&color=fff'}" 
             alt="Avatar" 
             class="avatar-small" />
        <div style="flex: 1;">
          <div style="font-weight: 600;">${memberData.username}</div>
          <span class="${roleClass}">${role}</span>
        </div>
        ${showActions ? `
          <div class="member-actions">
            ${!isAdmin ? `
              <button onclick="promoteToAdmin('${memberId}')" class="action-btn promote-btn">
                Make Admin
              </button>
            ` : `
              <button onclick="demoteFromAdmin('${memberId}')" class="action-btn demote-btn">
                Remove Admin
              </button>
            `}
            <button onclick="removeMember('${memberId}')" class="action-btn remove-btn">
              Remove
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

async function saveGroupInfo() {
  if (!currentChat || !currentChat.isGroupChat) return;
  
  const name = document.getElementById('group-info-name').value.trim();
  const bio = document.getElementById('group-info-bio').value.trim();
  
  if (!name) {
    alert('Group name is required');
    return;
  }
  
  try {
    const response = await api.put(`/chats/group/${currentChat._id}/info`, {
      name,
      bio
    });
    
    if (response.success) {
      currentChat = response.data;
      
      // Update chat header
      document.getElementById('chat-name').textContent = name;
      
      // Reload chats to update list
      await loadChats();
      
      alert('Group info updated successfully!');
    }
  } catch (error) {
    console.error('Error updating group info:', error);
    alert('Failed to update group info: ' + error.message);
  }
}

async function promoteToAdmin(userId) {
  if (!currentChat || !currentChat.isGroupChat) return;
  
  if (!confirm('Promote this member to admin?')) return;
  
  try {
    const response = await api.put(`/chats/group/${currentChat._id}/promote`, {
      userId
    });
    
    if (response.success) {
      currentChat = response.data;
      
      // Check if current user is still admin
      const isCreator = currentChat.admin && currentChat.admin._id === currentUser._id;
      const isAdmin = currentChat.admins && currentChat.admins.some(admin => {
        const adminId = typeof admin === 'object' ? admin._id : admin;
        return adminId === currentUser._id;
      });
      const canEdit = isCreator || isAdmin;
      
      renderGroupMembers(canEdit);
      alert('Member promoted to admin!');
    }
  } catch (error) {
    console.error('Error promoting member:', error);
    alert('Failed to promote member: ' + error.message);
  }
}

async function demoteFromAdmin(userId) {
  if (!currentChat || !currentChat.isGroupChat) return;
  
  if (!confirm('Remove admin privileges from this member?')) return;
  
  try {
    const response = await api.put(`/chats/group/${currentChat._id}/demote`, {
      userId
    });
    
    if (response.success) {
      currentChat = response.data;
      
      // Check if current user is still admin
      const isCreator = currentChat.admin && currentChat.admin._id === currentUser._id;
      const isAdmin = currentChat.admins && currentChat.admins.some(admin => {
        const adminId = typeof admin === 'object' ? admin._id : admin;
        return adminId === currentUser._id;
      });
      const canEdit = isCreator || isAdmin;
      
      renderGroupMembers(canEdit);
      alert('Admin privileges removed!');
    }
  } catch (error) {
    console.error('Error demoting admin:', error);
    alert('Failed to demote admin: ' + error.message);
  }
}

async function removeMember(userId) {
  if (!currentChat || !currentChat.isGroupChat) return;
  
  if (!confirm('Remove this member from the group?')) return;
  
  try {
    const response = await api.delete(`/chats/group/${currentChat._id}/member/${userId}`);
    
    if (response.success) {
      currentChat = response.data;
      
      // Check if current user is still admin
      const isCreator = currentChat.admin && currentChat.admin._id === currentUser._id;
      const isAdmin = currentChat.admins && currentChat.admins.some(admin => {
        const adminId = typeof admin === 'object' ? admin._id : admin;
        return adminId === currentUser._id;
      });
      const canEdit = isCreator || isAdmin;
      
      renderGroupMembers(canEdit);
      
      // Reload chats to update list
      await loadChats();
      
      alert('Member removed from group!');
    }
  } catch (error) {
    console.error('Error removing member:', error);
    alert('Failed to remove member: ' + error.message);
  }
}

// Make functions available globally
window.promoteToAdmin = promoteToAdmin;
window.demoteFromAdmin = demoteFromAdmin;
window.removeMember = removeMember;


async function handleGroupAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file || !currentChat || !currentChat.isGroupChat) return;

  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Image size must be less than 5MB');
    return;
  }

  try {
    console.log('📤 Uploading group avatar...', file.name);
    
    // Upload file
    const formData = new FormData();
    formData.append('file', file);

    const token = await api.getToken();
    
    const response = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const data = await response.json();
    console.log('📥 Upload response:', data);

    if (!data.success) {
      console.error('❌ Upload failed:', data);
      alert('Upload gagal: ' + (data.message || 'Unknown error'));
      return;
    }

    const avatarUrl = `http://localhost:5000${data.data.fileUrl}`;
    console.log('🖼️ Avatar URL:', avatarUrl);
    
    // Update group avatar in database
    const updateResponse = await api.put(`/chats/group/${currentChat._id}/info`, { 
      name: currentChat.name,
      bio: currentChat.bio,
      avatar: avatarUrl 
    });
    console.log('✅ Update response:', updateResponse);
    
    if (!updateResponse.success) {
      console.error('❌ Group update failed:', updateResponse);
      alert('Gagal update avatar grup: ' + (updateResponse.message || 'Unknown error'));
      return;
    }

    // Update currentChat with the response
    currentChat = updateResponse.data;
    console.log('👥 Updated group:', JSON.stringify(currentChat, null, 2));
    
    // Update UI with the uploaded image
    const timestamp = Date.now();
    const cachedUrl = `${avatarUrl}?t=${timestamp}`;
    
    console.log('🔄 Updating UI with:', cachedUrl);
    
    const avatarImg = document.getElementById('group-info-avatar');
    const avatarPlaceholder = document.getElementById('group-info-avatar-placeholder');
    
    // Hide placeholder
    if (avatarPlaceholder) {
      avatarPlaceholder.style.display = 'none';
      console.log('✅ Placeholder hidden');
    }
    
    // Show and load image
    avatarImg.onload = function() {
      console.log('✅✅✅ Group avatar LOADED successfully!');
    };
    
    avatarImg.onerror = function() {
      console.error('❌❌❌ Group avatar FAILED to load!');
      if (avatarPlaceholder) {
        avatarPlaceholder.style.display = 'flex';
      }
      this.style.display = 'none';
    };
    
    avatarImg.style.display = 'block';
    avatarImg.src = cachedUrl;
    console.log('✅ Group avatar updated in modal');
    
    // Update chat header avatar
    const chatAvatar = document.getElementById('chat-avatar');
    if (chatAvatar) {
      chatAvatar.src = cachedUrl;
      console.log('✅ Chat header avatar updated');
    }
    
    // Reload chats to update avatar in chat list
    await loadChats();
    console.log('✅ Chats reloaded');
    
    alert('✅ Avatar grup berhasil diupdate!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Upload gagal: ' + error.message);
  }
  
  // Reset input
  event.target.value = '';
}


// Admin Panel Functions
let allUsers = [];
let selectedUser = null;

async function showAdminPanel() {
  document.getElementById('admin-panel-modal').classList.remove('hidden');
  await loadAllUsers();
}

function hideAdminPanel() {
  document.getElementById('admin-panel-modal').classList.add('hidden');
}

async function loadAllUsers() {
  try {
    const response = await api.get('/admin/users');
    if (response.success) {
      allUsers = response.data;
      renderAdminUsers(allUsers);
    }
  } catch (error) {
    console.error('Error loading users:', error);
    alert('Failed to load users: ' + error.message);
  }
}

function renderAdminUsers(users) {
  const usersList = document.getElementById('admin-users-list');
  
  if (users.length === 0) {
    usersList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No users found</p>';
    return;
  }
  
  usersList.innerHTML = users.map(user => {
    const badges = [];
    if (user.role === 'admin') badges.push('<span class="badge badge-admin">ADMIN</span>');
    if (user.isVerified) badges.push('<span class="badge badge-verified">✓ Verified</span>');
    if (user.isBanned) badges.push('<span class="badge badge-banned">🚫 Banned</span>');
    if (user.warnings && user.warnings.length > 0) badges.push(`<span class="badge badge-warned">⚠️ ${user.warnings.length} Warning(s)</span>`);
    
    const avatarUrl = user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || user.username) + '&background=007AFF&color=fff';
    
    return `
      <div class="admin-user-item" onclick="showUserActions('${user._id}')">
        <img src="${avatarUrl}" alt="Avatar" />
        <div class="admin-user-info">
          <div class="admin-user-name">
            ${user.name || user.username}
            ${badges.join('')}
          </div>
          <div class="admin-user-email">${user.username} • ${user.email}</div>
          <div class="admin-user-stats">
            Joined: ${new Date(user.createdAt).toLocaleDateString()} • 
            Status: ${user.status || 'offline'}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function searchAdminUsers(query) {
  if (!query.trim()) {
    renderAdminUsers(allUsers);
    return;
  }
  
  const filtered = allUsers.filter(user => 
    user.username.toLowerCase().includes(query.toLowerCase()) ||
    user.email.toLowerCase().includes(query.toLowerCase())
  );
  
  renderAdminUsers(filtered);
}

function showUserActions(userId) {
  selectedUser = allUsers.find(u => u._id === userId);
  if (!selectedUser) return;
  
  document.getElementById('admin-panel-modal').classList.add('hidden');
  document.getElementById('user-action-modal').classList.remove('hidden');
  
  // Set user info
  const avatarUrl = selectedUser.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedUser.username) + '&background=007AFF&color=fff';
  document.getElementById('action-user-avatar').src = avatarUrl;
  document.getElementById('action-user-name').textContent = selectedUser.username;
  document.getElementById('action-user-email').textContent = selectedUser.email;
  
  // Set badges
  const badges = [];
  if (selectedUser.role === 'admin') badges.push('<span class="badge badge-admin">ADMIN</span>');
  if (selectedUser.isVerified) badges.push('<span class="badge badge-verified">✓ Verified</span>');
  if (selectedUser.isBanned) badges.push('<span class="badge badge-banned">🚫 Banned</span>');
  document.getElementById('action-user-badges').innerHTML = badges.join('');
  
  // Show/hide buttons based on user status
  const verifyBtn = document.getElementById('action-verify-btn');
  const unverifyBtn = document.getElementById('action-unverify-btn');
  const banBtn = document.getElementById('action-ban-btn');
  const unbanBtn = document.getElementById('action-unban-btn');
  const warnBtn = document.getElementById('action-warn-btn');
  
  // Cannot perform actions on admin users
  const isTargetAdmin = selectedUser.role === 'admin';
  
  if (isTargetAdmin) {
    verifyBtn.style.display = 'none';
    unverifyBtn.style.display = 'none';
    banBtn.style.display = 'none';
    unbanBtn.style.display = 'none';
    warnBtn.style.display = 'none';
  } else {
    verifyBtn.style.display = selectedUser.isVerified ? 'none' : 'block';
    unverifyBtn.style.display = selectedUser.isVerified ? 'block' : 'none';
    banBtn.style.display = selectedUser.isBanned ? 'none' : 'block';
    unbanBtn.style.display = selectedUser.isBanned ? 'block' : 'none';
    warnBtn.style.display = 'block';
  }
  
  // Show warnings if any
  if (selectedUser.warnings && selectedUser.warnings.length > 0) {
    document.getElementById('user-warnings-section').style.display = 'block';
    renderUserWarnings(selectedUser.warnings);
  } else {
    document.getElementById('user-warnings-section').style.display = 'none';
  }
}

function renderUserWarnings(warnings) {
  const warningsList = document.getElementById('user-warnings-list');
  warningsList.innerHTML = warnings.map(warning => `
    <div class="warning-item">
      <div>${warning.message}</div>
      <div class="warning-date">${new Date(warning.date).toLocaleString()}</div>
    </div>
  `).join('');
}

function hideUserActions() {
  document.getElementById('user-action-modal').classList.add('hidden');
  document.getElementById('admin-panel-modal').classList.remove('hidden');
}

async function verifyUser() {
  if (!selectedUser) return;
  
  try {
    const response = await api.put(`/admin/users/${selectedUser._id}/verify`);
    if (response.success) {
      alert('✅ User verified successfully!');
      hideUserActions();
      await loadAllUsers();
    }
  } catch (error) {
    alert('Failed to verify user: ' + error.message);
  }
}

async function unverifyUser() {
  if (!selectedUser) return;
  
  if (!confirm('Remove verification from this user?')) return;
  
  try {
    const response = await api.put(`/admin/users/${selectedUser._id}/unverify`);
    if (response.success) {
      alert('✅ Verification removed!');
      hideUserActions();
      await loadAllUsers();
    }
  } catch (error) {
    alert('Failed to remove verification: ' + error.message);
  }
}

async function warnUser() {
  if (!selectedUser) return;
  
  const message = prompt('Enter warning message:');
  if (!message || !message.trim()) return;
  
  try {
    const response = await api.post(`/admin/users/${selectedUser._id}/warn`, { message });
    if (response.success) {
      alert('⚠️ Warning sent successfully!');
      hideUserActions();
      await loadAllUsers();
    }
  } catch (error) {
    alert('Failed to send warning: ' + error.message);
  }
}

async function banUser() {
  if (!selectedUser) return;
  
  const reason = prompt('Enter ban reason:');
  if (reason === null) return; // User cancelled
  
  if (!confirm(`Ban user "${selectedUser.username}"?`)) return;
  
  try {
    const response = await api.put(`/admin/users/${selectedUser._id}/ban`, { 
      reason: reason || 'No reason provided' 
    });
    if (response.success) {
      alert('🚫 User banned successfully!');
      hideUserActions();
      await loadAllUsers();
    }
  } catch (error) {
    alert('Failed to ban user: ' + error.message);
  }
}

async function unbanUser() {
  if (!selectedUser) return;
  
  if (!confirm(`Unban user "${selectedUser.username}"?`)) return;
  
  try {
    const response = await api.put(`/admin/users/${selectedUser._id}/unban`);
    if (response.success) {
      alert('✅ User unbanned successfully!');
      hideUserActions();
      await loadAllUsers();
    }
  } catch (error) {
    alert('Failed to unban user: ' + error.message);
  }
}

// Make functions available globally
window.showUserActions = showUserActions;


// Helper function to get verified badge
function getVerifiedBadge(user) {
  if (user && user.isVerified) {
    return '<span style="color: #2196F3; margin-left: 4px; font-size: 14px;" title="Verified">✓</span>';
  }
}

// Helper function to get admin badge
function getAdminBadge(user) {
  if (user && user.role === 'admin') {
    return '<span class="badge-admin">ADMIN</span>';
  }
  return '';
}


// Admin Groups Management
let allGroups = [];
let selectedGroup = null;

async function loadAllGroups() {
  try {
    const response = await api.get('/admin/groups');
    if (response.success) {
      allGroups = response.data;
      renderAdminGroups(allGroups);
    }
  } catch (error) {
    console.error('Error loading groups:', error);
    alert('Failed to load groups: ' + error.message);
  }
}

function renderAdminGroups(groups) {
  const groupsList = document.getElementById('admin-groups-list');
  
  if (groups.length === 0) {
    groupsList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No groups found</p>';
    return;
  }
  
  groupsList.innerHTML = groups.map(group => {
    const avatarUrl = group.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(group.name) + '&background=007AFF&color=fff';
    const memberCount = group.participants ? group.participants.length : 0;
    const lastMessage = group.lastMessage ? 
      (group.lastMessage.content || 'Media') : 
      'No messages yet';
    
    return `
      <div class="admin-user-item" onclick="showGroupActions('${group._id}')">
        <img src="${avatarUrl}" alt="Avatar" />
        <div class="admin-user-info">
          <div class="admin-user-name">
            ${group.name}
          </div>
          <div class="admin-user-email">${memberCount} members</div>
          <div class="admin-user-stats">
            Last message: ${lastMessage}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function searchAdminGroups(query) {
  if (!query.trim()) {
    renderAdminGroups(allGroups);
    return;
  }
  
  const filtered = allGroups.filter(group => 
    group.name.toLowerCase().includes(query.toLowerCase())
  );
  
  renderAdminGroups(filtered);
}

function showGroupActions(groupId) {
  selectedGroup = allGroups.find(g => g._id === groupId);
  if (!selectedGroup) return;
  
  document.getElementById('admin-panel-modal').classList.add('hidden');
  document.getElementById('group-action-modal').classList.remove('hidden');
  
  // Set group info
  const avatarUrl = selectedGroup.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedGroup.name) + '&background=007AFF&color=fff';
  document.getElementById('action-group-avatar').src = avatarUrl;
  document.getElementById('action-group-name').textContent = selectedGroup.name;
  document.getElementById('action-group-members').textContent = `${selectedGroup.participants.length} members`;
  
  // Render members
  renderGroupActionMembers(selectedGroup.participants);
}

function renderGroupActionMembers(members) {
  const membersList = document.getElementById('group-action-members-list');
  
  membersList.innerHTML = members.map(member => {
    const avatarUrl = member.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(member.username) + '&background=007AFF&color=fff';
    const verifiedBadge = getVerifiedBadge(member);
    const adminBadge = getAdminBadge(member);
    
    return `
      <div class="admin-user-item" style="padding: 8px;">
        <img src="${avatarUrl}" alt="Avatar" style="width: 40px; height: 40px;" />
        <div class="admin-user-info">
          <div class="admin-user-name" style="font-size: 14px;">
            ${member.username}${verifiedBadge}${adminBadge}
          </div>
          <div class="admin-user-email" style="font-size: 12px;">${member.email}</div>
        </div>
        <button onclick="kickMemberFromGroup('${member._id}')" class="action-btn remove-btn" style="padding: 5px 10px; font-size: 12px;">
          Kick
        </button>
      </div>
    `;
  }).join('');
}

function hideGroupActions() {
  document.getElementById('group-action-modal').classList.add('hidden');
  document.getElementById('admin-panel-modal').classList.remove('hidden');
}

async function joinGroupAsAdmin() {
  if (!selectedGroup) return;
  
  try {
    const response = await api.post(`/admin/groups/${selectedGroup._id}/join`);
    if (response.success) {
      alert('✅ Joined group successfully!');
      hideGroupActions();
      await loadChats(); // Reload chats to show new group
    }
  } catch (error) {
    alert('Failed to join group: ' + error.message);
  }
}

async function viewGroupAsAdmin() {
  if (!selectedGroup) return;
  
  try {
    // Fetch latest group data
    const response = await api.get(`/admin/groups/${selectedGroup._id}`);
    if (response.success) {
      const groupData = response.data;
      
      // Close modals
      hideGroupActions();
      hideAdminPanel();
      
      // Open the group chat directly without joining
      // Admin can view and chat without being a participant
      openChat(groupData);
    }
  } catch (error) {
    console.error('Error loading group:', error);
    alert('Failed to load group: ' + error.message);
  }
}

async function kickMemberFromGroup(userId) {
  if (!selectedGroup) return;
  
  const member = selectedGroup.participants.find(p => p._id === userId);
  if (!member) return;
  
  if (!confirm(`Kick ${member.username} from this group?`)) return;
  
  try {
    const response = await api.delete(`/admin/groups/${selectedGroup._id}/members/${userId}`);
    if (response.success) {
      alert('✅ Member kicked successfully!');
      // Reload group data
      await loadAllGroups();
      // Update selected group
      selectedGroup = allGroups.find(g => g._id === selectedGroup._id);
      if (selectedGroup) {
        renderGroupActionMembers(selectedGroup.participants);
        document.getElementById('action-group-members').textContent = `${selectedGroup.participants.length} members`;
      }
    }
  } catch (error) {
    alert('Failed to kick member: ' + error.message);
  }
}

// Make functions available globally
window.showGroupActions = showGroupActions;
window.kickMemberFromGroup = kickMemberFromGroup;


async function leaveGroup() {
  if (!currentChat || !currentChat.isGroupChat) return;
  
  // Check if user is member
  const isMember = currentChat.participants.some(p => p._id === currentUser._id);
  if (!isMember) {
    alert('You are not a member of this group');
    return;
  }
  
  const isCreator = currentChat.admin && currentChat.admin._id === currentUser._id;
  const memberCount = currentChat.participants.length;
  
  let confirmMessage = 'Are you sure you want to leave this group?';
  
  if (isCreator && memberCount > 1) {
    confirmMessage = 'You are the creator of this group. If you leave, a new admin will be automatically assigned. Continue?';
  } else if (memberCount === 1) {
    confirmMessage = 'You are the last member. Leaving will delete this group. Continue?';
  }
  
  if (!confirm(confirmMessage)) return;
  
  try {
    const response = await api.post(`/chats/group/${currentChat._id}/leave`);
    
    if (response.success) {
      // Emit system message to other members via socket
      if (response.systemMessage && !response.deleted) {
        socketService.socket.emit('system:message', {
          chatId: currentChat._id,
          message: response.systemMessage
        });
      }
      
      if (response.deleted) {
        alert('✅ Group deleted (no members left)');
      } else {
        alert('✅ Left group successfully!');
      }
      
      // Close modal
      hideGroupInfoModal();
      
      // Reload chats
      await loadChats();
      
      // Show empty state
      document.getElementById('chat-container').classList.add('hidden');
      document.getElementById('empty-state').classList.remove('hidden');
      currentChat = null;
    }
  } catch (error) {
    console.error('Error leaving group:', error);
    alert('Failed to leave group: ' + error.message);
  }
}


// Username availability checker
let usernameCheckTimeout;
async function checkUsernameAvailability(username) {
  clearTimeout(usernameCheckTimeout);
  
  const feedback = document.getElementById('username-feedback') || document.getElementById('profile-username-feedback');
  if (!feedback) return;
  
  if (!username || username.length < 2) {
    feedback.style.display = 'none';
    return;
  }
  
  // Remove @ if present
  username = username.replace(/^@+/, '');
  
  // Validate format
  if (!/^[a-z0-9_]+$/i.test(username)) {
    feedback.style.display = 'block';
    feedback.style.color = '#f44336';
    feedback.textContent = '✗ Only letters, numbers, and underscores allowed';
    return;
  }
  
  usernameCheckTimeout = setTimeout(async () => {
    try {
      const response = await api.get(`/auth/check-username/@${username.toLowerCase()}`);
      
      feedback.style.display = 'block';
      if (response.available) {
        feedback.style.color = '#4CAF50';
        feedback.textContent = `✓ @${username.toLowerCase()} is available`;
      } else {
        feedback.style.color = '#f44336';
        feedback.textContent = `✗ @${username.toLowerCase()} is already taken`;
      }
    } catch (error) {
      console.error('Error checking username:', error);
    }
  }, 500);
}


// ==================== CALL FEATURE ====================

let activeCall = null;
let callStartTime = null;
let callTimer = null;

// Create Call UI dynamically
function createCallUI() {
  const callUI = `
    <!-- Incoming Call Modal -->
    <div id="incoming-call-modal" class="modal hidden" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.95); z-index: 10000; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center; padding: 40px;">
        <div style="margin-bottom: 20px;">
          <img id="incoming-call-avatar" src="" alt="Avatar" style="width: 120px; height: 120px; border-radius: 50%; margin-bottom: 20px; border: 3px solid #4CAF50;" />
          <h2 id="incoming-call-name" style="margin: 10px 0; color: white; font-size: 28px;">Unknown</h2>
          <p id="incoming-call-type" style="color: #4CAF50; font-size: 20px; margin: 15px 0;">📞 Incoming Call...</p>
        </div>
        <div style="display: flex; gap: 30px; justify-content: center; margin-top: 40px;">
          <button id="answer-call-btn" style="background: #4CAF50; color: white; border: none; padding: 20px 40px; border-radius: 50px; cursor: pointer; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(76,175,80,0.4);">
            ✓ Answer
          </button>
          <button id="reject-call-btn" style="background: #f44336; color: white; border: none; padding: 20px 40px; border-radius: 50px; cursor: pointer; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(244,67,54,0.4);">
            ✗ Reject
          </button>
        </div>
      </div>
    </div>

    <!-- Active Call Modal (Fullscreen) -->
    <div id="active-call-modal" class="modal hidden" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #000; z-index: 10000;">
      <!-- Minimize Button -->
      <button id="minimize-call-btn" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 16px; z-index: 10001; backdrop-filter: blur(10px);">
        ➖ Minimize
      </button>
      
      <!-- Video containers (fullscreen) -->
      <div id="video-container" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #000;">
        <video id="remote-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
        <video id="local-video" autoplay playsinline muted style="position: absolute; top: 20px; right: 20px; width: 200px; height: 150px; object-fit: cover; border-radius: 12px; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.5);"></video>
        
        <!-- Video call info overlay -->
        <div style="position: absolute; top: 20px; left: 20px; color: white; z-index: 10001;">
          <h2 id="video-call-name" style="margin: 0; font-size: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">Unknown</h2>
          <p id="video-call-timer" style="margin: 5px 0 0 0; font-size: 18px; font-family: monospace; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">00:00</p>
        </div>
      </div>
      
      <!-- Audio only UI (fullscreen) -->
      <div id="audio-only-ui" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);">
        <img id="active-call-avatar" src="" alt="Avatar" style="width: 150px; height: 150px; border-radius: 50%; margin-bottom: 30px; border: 4px solid white; box-shadow: 0 8px 24px rgba(0,0,0,0.3);" />
        <h2 id="active-call-name" style="margin: 10px 0; color: white; font-size: 32px;">Unknown</h2>
        <p id="active-call-status" style="color: #4CAF50; font-size: 20px; margin: 15px 0;">Connecting...</p>
        <p id="active-call-timer" style="color: rgba(255,255,255,0.8); font-size: 36px; margin: 20px 0; font-family: monospace;">00:00</p>
      </div>
      
      <!-- Control buttons (bottom center) -->
      <div style="position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); display: flex; gap: 20px; z-index: 10001;">
        <button id="mute-call-btn" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 18px 30px; border-radius: 50px; cursor: pointer; font-size: 18px; backdrop-filter: blur(10px); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
          🎤 Mute
        </button>
        <button id="video-call-btn" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 18px 30px; border-radius: 50px; cursor: pointer; font-size: 18px; display: none; backdrop-filter: blur(10px); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
          📹 Video
        </button>
        <button id="end-call-btn" style="background: #f44336; color: white; border: none; padding: 18px 35px; border-radius: 50px; cursor: pointer; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(244,67,54,0.5);">
          📴 End Call
        </button>
      </div>
    </div>
    
    <!-- Minimized Call Window -->
    <div id="minimized-call-window" class="hidden" style="position: fixed; bottom: 20px; right: 20px; width: 300px; background: rgba(0,0,0,0.9); border-radius: 12px; padding: 15px; z-index: 9999; box-shadow: 0 8px 24px rgba(0,0,0,0.5); backdrop-filter: blur(10px);">
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
        <img id="minimized-call-avatar" src="" alt="Avatar" style="width: 50px; height: 50px; border-radius: 50%;" />
        <div style="flex: 1;">
          <h3 id="minimized-call-name" style="margin: 0; color: white; font-size: 16px;">Unknown</h3>
          <p id="minimized-call-timer" style="margin: 5px 0 0 0; color: #4CAF50; font-size: 14px; font-family: monospace;">00:00</p>
        </div>
        <button id="maximize-call-btn" style="background: #4CAF50; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; font-size: 14px;">
          ⬆ Expand
        </button>
      </div>
      <div style="display: flex; gap: 10px;">
        <button id="minimized-mute-btn" style="flex: 1; background: rgba(255,255,255,0.2); color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 14px;">
          🎤 Mute
        </button>
        <button id="minimized-end-btn" style="flex: 1; background: #f44336; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 14px;">
          📴 End
        </button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', callUI);
}

// Initialize Call UI
createCallUI();

// Call button in chat header
function addCallButton() {
  // Remove existing call buttons if any
  const existingVoiceBtn = document.getElementById('call-btn');
  const existingVideoBtn = document.getElementById('video-call-btn-header');
  if (existingVoiceBtn) existingVoiceBtn.remove();
  if (existingVideoBtn) existingVideoBtn.remove();
  
  const chatHeader = document.querySelector('.chat-header');
  if (chatHeader) {
    // Voice call button
    const voiceBtn = document.createElement('button');
    voiceBtn.id = 'call-btn';
    voiceBtn.className = 'icon-btn';
    voiceBtn.innerHTML = '📞';
    voiceBtn.title = 'Voice Call';
    voiceBtn.style.cssText = 'margin-left: auto; background: #4CAF50; color: white; border: none; padding: 8px 12px; border-radius: 50%; cursor: pointer; font-size: 18px;';
    voiceBtn.onclick = () => initiateCall('voice');
    chatHeader.appendChild(voiceBtn);
    
    // Video call button
    const videoBtn = document.createElement('button');
    videoBtn.id = 'video-call-btn-header';
    videoBtn.className = 'icon-btn';
    videoBtn.innerHTML = '📹';
    videoBtn.title = 'Video Call';
    videoBtn.style.cssText = 'background: #2196F3; color: white; border: none; padding: 8px 12px; border-radius: 50%; cursor: pointer; font-size: 18px; margin-left: 5px;';
    videoBtn.onclick = () => initiateCall('video');
    chatHeader.appendChild(videoBtn);
    
    console.log('✅ Call buttons added to chat header');
  }
}

// Initiate outgoing call
async function initiateCall(callType = 'voice') {
  if (!currentChat || currentChat.isGroupChat) {
    alert('Calls are only available for direct chats');
    return;
  }

  const otherUser = currentChat.participants.find(p => p._id !== currentUser._id);
  if (!otherUser) return;

  const isVideo = callType === 'video';

  try {
    // Create call log
    const callResponse = await api.post('/calls', {
      receiver: otherUser._id,
      chat: currentChat._id,
      type: callType
    });

    if (!callResponse.success) {
      throw new Error('Failed to create call log');
    }

    activeCall = {
      id: callResponse.data._id,
      type: 'outgoing',
      callType: callType,
      otherUser: otherUser,
      callData: callResponse.data
    };

    // Initialize local stream (audio only for voice, audio+video for video call)
    await callService.initializeLocalStream(!isVideo);

    // Show active call UI
    showActiveCallModal(otherUser, 'Calling...', callType);

    // If video call, show video containers and local video
    if (isVideo) {
      showVideoUI();
      const localVideo = document.getElementById('local-video');
      if (localVideo && callService.localStream) {
        localVideo.srcObject = callService.localStream;
      }
    }

    // Create peer connection
    callService.createPeerConnection(
      (remoteStream) => {
        if (isVideo) {
          // Show remote video
          const remoteVideo = document.getElementById('remote-video');
          if (remoteVideo) {
            remoteVideo.srcObject = remoteStream;
          }
        } else {
          // Play remote audio
          const remoteAudio = new Audio();
          remoteAudio.srcObject = remoteStream;
          remoteAudio.play();
        }
      },
      (candidate) => {
        // Send ICE candidate
        socketService.emit('webrtc:ice-candidate', {
          otherUserId: otherUser._id,
          candidate,
          callId: activeCall.id
        });
      }
    );

    // Create and send offer
    const offer = await callService.createOffer();
    
    // Send call initiation
    socketService.emit('call:initiate', {
      receiverId: otherUser._id,
      chatId: currentChat._id,
      callId: activeCall.id,
      type: callType
    });

    // Send WebRTC offer
    socketService.emit('webrtc:offer', {
      receiverId: otherUser._id,
      offer,
      callId: activeCall.id
    });

    console.log(`📞 ${callType} call initiated`);

  } catch (error) {
    console.error('Error initiating call:', error);
    alert('Failed to start call: ' + error.message);
    endCall();
  }
}

// Handle incoming call
function handleIncomingCall(data) {
  const { callId, caller, chatId, type } = data;

  activeCall = {
    id: callId,
    type: 'incoming',
    callType: type || 'voice', // Store call type (voice or video)
    otherUser: caller,
    chatId: chatId
  };

  // Show incoming call modal
  document.getElementById('incoming-call-avatar').src = caller.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(caller.name)}&background=007AFF&color=fff`;
  document.getElementById('incoming-call-name').textContent = caller.name;
  
  // Update call type text
  const callTypeText = type === 'video' ? '📹 Incoming Video Call...' : '📞 Incoming Call...';
  document.getElementById('incoming-call-type').textContent = callTypeText;
  
  document.getElementById('incoming-call-modal').classList.remove('hidden');

  // Play ringtone (optional)
  playRingtone();
  
  console.log('📞 Incoming call:', { callId, caller: caller.name, type });
}

// Answer incoming call
async function answerCall() {
  if (!activeCall || activeCall.type !== 'incoming') return;

  const isVideo = activeCall.callType === 'video';

  try {
    // Hide incoming call modal
    document.getElementById('incoming-call-modal').classList.add('hidden');
    stopRingtone();

    // Show active call modal with call type
    showActiveCallModal(activeCall.otherUser, 'Connecting...', activeCall.callType);

    // Notify caller that call is answered
    socketService.emit('call:answer', {
      callerId: activeCall.otherUser.id,
      callId: activeCall.id
    });

    // Update status and start timer immediately
    document.getElementById('active-call-status').textContent = 'Connected';
    startCallTimer();

    // Update call log
    await api.put(`/calls/${activeCall.id}`, {
      status: 'answered',
      endTime: null
    });

    console.log('✅ Call answered, waiting for WebRTC offer...');

  } catch (error) {
    console.error('Error answering call:', error);
    alert('Failed to answer call: ' + error.message);
    endCall();
  }
}


// Reject incoming call
function rejectCall() {
  if (!activeCall) return;

  // Notify caller
  socketService.emit('call:reject', {
    callerId: activeCall.otherUser.id,
    callId: activeCall.id
  });

  // Update call log
  api.put(`/calls/${activeCall.id}`, {
    status: 'rejected',
    endTime: new Date()
  });

  // Hide modal
  document.getElementById('incoming-call-modal').classList.add('hidden');
  stopRingtone();

  activeCall = null;
  console.log('❌ Call rejected');
}

// End active call
function endCall() {
  if (!activeCall) return;

  // Stop call timer
  if (callTimer) {
    clearInterval(callTimer);
    callTimer = null;
  }

  // Notify other user
  if (activeCall.otherUser) {
    socketService.emit('call:end', {
      otherUserId: activeCall.otherUser.id || activeCall.otherUser._id,
      callId: activeCall.id
    });
  }

  // Update call log
  if (activeCall.id) {
    api.put(`/calls/${activeCall.id}`, {
      status: 'ended',
      endTime: new Date()
    });
  }

  // Clean up WebRTC
  callService.endCall();

  // Hide all call modals
  document.getElementById('active-call-modal').classList.add('hidden');
  document.getElementById('incoming-call-modal').classList.add('hidden');
  document.getElementById('minimized-call-window').classList.add('hidden');
  stopRingtone();

  activeCall = null;
  callStartTime = null;

  console.log('📴 Call ended');
}

// Toggle mute
function toggleMute() {
  const isMuted = callService.toggleMute();
  const muteBtn = document.getElementById('mute-call-btn');
  const minimizedMuteBtn = document.getElementById('minimized-mute-btn');
  
  if (muteBtn) {
    muteBtn.textContent = isMuted ? '🔇 Unmute' : '🎤 Mute';
    muteBtn.style.background = isMuted ? '#f44336' : 'rgba(255,255,255,0.2)';
  }
  
  if (minimizedMuteBtn) {
    minimizedMuteBtn.textContent = isMuted ? '🔇 Unmute' : '🎤 Mute';
    minimizedMuteBtn.style.background = isMuted ? '#f44336' : 'rgba(255,255,255,0.2)';
  }
}

// Toggle video
function toggleVideo() {
  const isVideoOff = callService.toggleVideo();
  const videoBtn = document.getElementById('video-call-btn');
  const localVideo = document.getElementById('local-video');
  
  if (videoBtn) {
    videoBtn.textContent = isVideoOff ? '📹 Turn On' : '📹 Turn Off';
    videoBtn.style.background = isVideoOff ? '#f44336' : 'rgba(255,255,255,0.2)';
  }
  
  // Hide/show local video element
  if (localVideo) {
    localVideo.style.display = isVideoOff ? 'none' : 'block';
  }
  
  console.log(isVideoOff ? '📹 Video turned off' : '📹 Video turned on');
}

// Minimize call window
function minimizeCall() {
  document.getElementById('active-call-modal').classList.add('hidden');
  document.getElementById('minimized-call-window').classList.remove('hidden');
  console.log('➖ Call minimized');
}

// Maximize call window
function maximizeCall() {
  document.getElementById('minimized-call-window').classList.add('hidden');
  document.getElementById('active-call-modal').classList.remove('hidden');
  console.log('⬆ Call maximized');
}

// Show active call modal
function showActiveCallModal(user, status, callType = 'voice') {
  const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=007AFF&color=fff`;
  
  document.getElementById('active-call-avatar').src = avatarUrl;
  document.getElementById('active-call-name').textContent = user.name;
  document.getElementById('active-call-status').textContent = status;
  document.getElementById('active-call-timer').textContent = '00:00';
  
  // Update video overlay info
  document.getElementById('video-call-name').textContent = user.name;
  document.getElementById('video-call-timer').textContent = '00:00';
  
  // Update minimized window
  document.getElementById('minimized-call-avatar').src = avatarUrl;
  document.getElementById('minimized-call-name').textContent = user.name;
  document.getElementById('minimized-call-timer').textContent = '00:00';
  
  document.getElementById('active-call-modal').classList.remove('hidden');
  
  // Show/hide video UI based on call type
  if (callType === 'video') {
    showVideoUI();
  } else {
    hideVideoUI();
  }
  
  console.log('📱 Active call modal shown:', { name: user.name, status, callType });
}

// Show video UI
function showVideoUI() {
  const videoContainer = document.getElementById('video-container');
  const audioOnlyUI = document.getElementById('audio-only-ui');
  const videoToggleBtn = document.getElementById('video-call-btn');
  
  if (videoContainer) videoContainer.style.display = 'block';
  if (audioOnlyUI) audioOnlyUI.style.display = 'none';
  if (videoToggleBtn) videoToggleBtn.style.display = 'inline-block';
  
  console.log('📹 Video UI shown');
}

// Hide video UI
function hideVideoUI() {
  const videoContainer = document.getElementById('video-container');
  const audioOnlyUI = document.getElementById('audio-only-ui');
  const videoToggleBtn = document.getElementById('video-call-btn');
  
  if (videoContainer) videoContainer.style.display = 'none';
  if (audioOnlyUI) audioOnlyUI.style.display = 'block';
  if (videoToggleBtn) videoToggleBtn.style.display = 'none';
  
  console.log('🎤 Audio-only UI shown');
}

// Start call timer
function startCallTimer() {
  // Stop existing timer if any
  if (callTimer) {
    clearInterval(callTimer);
  }
  
  callStartTime = Date.now();
  callTimer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    const timeText = `${minutes}:${seconds}`;
    
    // Update all timer elements
    const timerElement = document.getElementById('active-call-timer');
    const videoTimerElement = document.getElementById('video-call-timer');
    const minimizedTimerElement = document.getElementById('minimized-call-timer');
    
    if (timerElement) timerElement.textContent = timeText;
    if (videoTimerElement) videoTimerElement.textContent = timeText;
    if (minimizedTimerElement) minimizedTimerElement.textContent = timeText;
    
    console.log('⏱️ Call duration:', timeText);
  }, 1000);
  
  console.log('✅ Call timer started');
}

// Ringtone (simple beep)
let ringtoneInterval = null;
function playRingtone() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  ringtoneInterval = setInterval(() => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.1;
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  }, 1000);
}

function stopRingtone() {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
}

// Setup call event listeners
function setupCallEventListeners() {
  // Answer call button
  const answerBtn = document.getElementById('answer-call-btn');
  if (answerBtn) answerBtn.addEventListener('click', answerCall);

  // Reject call button
  const rejectBtn = document.getElementById('reject-call-btn');
  if (rejectBtn) rejectBtn.addEventListener('click', rejectCall);

  // End call button
  const endBtn = document.getElementById('end-call-btn');
  if (endBtn) endBtn.addEventListener('click', endCall);

  // Mute button
  const muteBtn = document.getElementById('mute-call-btn');
  if (muteBtn) muteBtn.addEventListener('click', toggleMute);

  // Toggle video button
  const videoBtn = document.getElementById('video-call-btn');
  if (videoBtn) videoBtn.addEventListener('click', toggleVideo);

  // Minimize button
  const minimizeBtn = document.getElementById('minimize-call-btn');
  if (minimizeBtn) minimizeBtn.addEventListener('click', minimizeCall);

  // Maximize button
  const maximizeBtn = document.getElementById('maximize-call-btn');
  if (maximizeBtn) maximizeBtn.addEventListener('click', maximizeCall);

  // Minimized mute button
  const minimizedMuteBtn = document.getElementById('minimized-mute-btn');
  if (minimizedMuteBtn) minimizedMuteBtn.addEventListener('click', toggleMute);

  // Minimized end button
  const minimizedEndBtn = document.getElementById('minimized-end-btn');
  if (minimizedEndBtn) minimizedEndBtn.addEventListener('click', endCall);

  // Socket events for calls
  socketService.on('call:incoming', handleIncomingCall);

  socketService.on('call:answered', (data) => {
    console.log('✅ Call answered by other user');
    document.getElementById('active-call-status').textContent = 'Connected';
    startCallTimer();
  });

  socketService.on('call:rejected', () => {
    alert('Call was rejected');
    endCall();
  });

  socketService.on('call:ended', () => {
    alert('Call ended by other user');
    endCall();
  });

  socketService.on('call:failed', (data) => {
    alert(data.message || 'Call failed');
    endCall();
  });

  // WebRTC signaling events
  socketService.on('webrtc:offer', async (data) => {
    const { offer, senderId } = data;
    
    // If peer connection not created yet, this is the receiver getting the offer
    if (!callService.peerConnection && activeCall) {
      const isVideo = activeCall.callType === 'video';
      
      // Initialize local stream if not already done
      if (!callService.localStream) {
        await callService.initializeLocalStream(!isVideo);
        
        // Show local video if video call
        if (isVideo) {
          const localVideo = document.getElementById('local-video');
          if (localVideo && callService.localStream) {
            localVideo.srcObject = callService.localStream;
          }
        }
      }
      
      // Create peer connection
      callService.createPeerConnection(
        (remoteStream) => {
          if (isVideo) {
            // Show remote video
            const remoteVideo = document.getElementById('remote-video');
            if (remoteVideo) {
              remoteVideo.srcObject = remoteStream;
              console.log('✅ Remote video stream connected');
            }
          } else {
            // Play remote audio
            const remoteAudio = new Audio();
            remoteAudio.srcObject = remoteStream;
            remoteAudio.play();
            console.log('✅ Remote audio stream connected');
          }
        },
        (candidate) => {
          // Send ICE candidate
          socketService.emit('webrtc:ice-candidate', {
            otherUserId: senderId,
            candidate,
            callId: activeCall.id
          });
        }
      );
    }
    
    await callService.setRemoteDescription(offer);
    const answer = await callService.createAnswer();
    socketService.emit('webrtc:answer', {
      callerId: senderId,
      answer,
      callId: activeCall.id
    });
  });

  socketService.on('webrtc:answer', async (data) => {
    const { answer } = data;
    await callService.setRemoteDescription(answer);
  });

  socketService.on('webrtc:ice-candidate', async (data) => {
    const { candidate } = data;
    await callService.addIceCandidate(candidate);
  });
}

// Initialize call feature when app loads
setTimeout(() => {
  setupCallEventListeners();
  console.log('📞 Call feature initialized');
}, 1000);

// Add call button when chat is opened
const originalOpenChat = openChat;
openChat = async function(chat) {
  await originalOpenChat(chat);
  if (!chat.isGroupChat) {
    addCallButton();
  }
};


// ==================== CALL LOG FEATURE ====================

// Load call history
async function loadCallHistory() {
  try {
    const response = await api.get('/calls/user/history');
    if (response.success) {
      renderCallHistory(response.data);
    }
  } catch (error) {
    console.error('Error loading call history:', error);
  }
}

// Render call history
function renderCallHistory(calls) {
  const callsList = document.getElementById('calls-list');
  if (!callsList) return;
  
  callsList.innerHTML = '';

  if (calls.length === 0) {
    callsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">No call history</div>';
    return;
  }

  calls.forEach(call => {
    const isOutgoing = call.caller._id === currentUser._id;
    const otherUser = isOutgoing ? call.receiver : call.caller;
    
    const callItem = document.createElement('div');
    callItem.className = 'chat-item';
    callItem.style.cursor = 'pointer';
    
    // Call icon based on status
    let callIcon = '📞';
    let callColor = '#666';
    if (call.status === 'missed') {
      callIcon = '📵';
      callColor = '#f44336';
    } else if (call.status === 'rejected') {
      callIcon = '🚫';
      callColor = '#f44336';
    } else if (call.status === 'answered' || call.status === 'ended') {
      callIcon = isOutgoing ? '📤' : '📥';
      callColor = '#4CAF50';
    }
    
    // Format duration
    let durationText = '';
    if (call.duration > 0) {
      const minutes = Math.floor(call.duration / 60);
      const seconds = call.duration % 60;
      durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      durationText = call.status.charAt(0).toUpperCase() + call.status.slice(1);
    }
    
    // Format time
    const callDate = new Date(call.createdAt);
    const now = new Date();
    const isToday = callDate.toDateString() === now.toDateString();
    const timeText = isToday 
      ? callDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : callDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    callItem.innerHTML = `
      <img src="${otherUser.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(otherUser.name || otherUser.username) + '&background=007AFF&color=fff'}" 
           alt="Avatar" 
           class="avatar-small" />
      <div class="chat-item-info">
        <div class="chat-item-name">${otherUser.name || otherUser.username}</div>
        <div class="chat-item-message" style="color: ${callColor};">
          ${callIcon} ${durationText}
        </div>
      </div>
      <div style="font-size: 12px; color: #999; margin-left: auto;">
        ${timeText}
      </div>
    `;
    
    // Click to open chat
    callItem.addEventListener('click', async () => {
      if (call.chat) {
        const chatResponse = await api.get(`/chats`);
        if (chatResponse.success) {
          const chat = chatResponse.data.find(c => c._id === call.chat._id || c._id === call.chat);
          if (chat) {
            openChat(chat);
            // Switch to chats tab
            document.getElementById('tab-chats').click();
          }
        }
      }
    });
    
    callsList.appendChild(callItem);
  });
}

// Tab switching
function setupCallLogTabs() {
  const tabChats = document.getElementById('tab-chats');
  const tabCalls = document.getElementById('tab-calls');
  const chatsList = document.getElementById('chats-list');
  const callsList = document.getElementById('calls-list');
  
  if (tabChats) {
    tabChats.addEventListener('click', () => {
      tabChats.classList.add('active');
      tabChats.style.color = '#007AFF';
      tabCalls.classList.remove('active');
      tabCalls.style.color = '#666';
      chatsList.classList.remove('hidden');
      callsList.classList.add('hidden');
    });
  }
  
  if (tabCalls) {
    tabCalls.addEventListener('click', () => {
      tabCalls.classList.add('active');
      tabCalls.style.color = '#007AFF';
      tabChats.classList.remove('active');
      tabChats.style.color = '#666';
      callsList.classList.remove('hidden');
      chatsList.classList.add('hidden');
      loadCallHistory();
    });
  }
}

// Initialize call log tabs
setTimeout(() => {
  setupCallLogTabs();
}, 1000);
