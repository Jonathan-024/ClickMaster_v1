// --- Navigation & menus globaux ---
(function(){
  const leftToggle = document.getElementById('leftMenuToggle');
  const leftDrawer = document.getElementById('leftDrawer');
  const userBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  const notifyBtn = document.getElementById('notifyBtn');

  // Toggle left drawer
  if (leftToggle && leftDrawer){
    leftToggle.addEventListener('click', (e)=>{
      e.stopPropagation();
      leftDrawer.classList.toggle('open');
      leftDrawer.setAttribute('aria-hidden', leftDrawer.classList.contains('open') ? 'false' : 'true');
      if (userDropdown && userDropdown.classList.contains('open')){
        userDropdown.classList.remove('open');
        userBtn && userBtn.setAttribute('aria-expanded', 'false');
        userDropdown.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Toggle user dropdown
  if (userBtn && userDropdown){
    userBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      userDropdown.classList.toggle('open');
      const expanded = userDropdown.classList.contains('open');
      userBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      userDropdown.setAttribute('aria-hidden', expanded ? 'false' : 'true');
      if (leftDrawer && leftDrawer.classList.contains('open')){
        leftDrawer.classList.remove('open');
        leftDrawer.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Close on outside click
  document.addEventListener('click', ()=>{
    if (userDropdown && userDropdown.classList.contains('open')){
      userDropdown.classList.remove('open');
      userBtn && userBtn.setAttribute('aria-expanded', 'false');
      userDropdown.setAttribute('aria-hidden', 'true');
    }
    if (leftDrawer && leftDrawer.classList.contains('open')){
      leftDrawer.classList.remove('open');
      leftDrawer.setAttribute('aria-hidden', 'true');
    }
  });

  // Notifications feedback
  if (notifyBtn){
    notifyBtn.addEventListener('click', (e)=>{
      e.stopPropagation();
      notifyBtn.animate(
        [{transform:'scale(1)'},{transform:'scale(0.96)'},{transform:'scale(1)'}],
        {duration:120}
      );
    });
  }
})();

// --- Password toggles globaux ---
function setupPasswordToggle(passwordFieldId, toggleCheckboxId) {
  const passwordField = document.getElementById(passwordFieldId);
  const toggleCheckbox = document.getElementById(toggleCheckboxId);
  if (passwordField && toggleCheckbox) {
    toggleCheckbox.addEventListener('change', () => {
      passwordField.type = toggleCheckbox.checked ? 'text' : 'password';
    });
  }
}

// Login
setupPasswordToggle('password', 'togglePasswordLogin');
// Register
setupPasswordToggle('password', 'togglePasswordRegister');
setupPasswordToggle('confirm_password', 'toggleConfirmPassword');
// Reset password
setupPasswordToggle('new_password', 'toggleNewPassword');
setupPasswordToggle('confirm_new_password', 'toggleConfirmNewPassword');
