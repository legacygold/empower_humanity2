// Redeem.js - Submodule for redeeming PTLX rewards

// 1️⃣ Dispatch function to handle actions from this submodule
function dispatch(action, payload) {
  console.log(`Action: ${action}, Payload: ${payload}`); 
document.querySelectorAll('.redeem-btn').forEach(button => {  
  button.onclick = () => {  
    // Define paths for reward assets (if not fetched via Router)  
    const path = '/HMP/EH2/PTLX/ptlx-rewards/redeem/redeem.html';  
    openSubmodule(path); // New function for dynamic loading  
  };  
});
} 

/* ----------  BACK BUTTON HANDLER (FIXED for dynamic buttons) ---------- */
function  bindBackButton() {
  // Use event delegation since #backBtn is created dynamically
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('backBtn')) { // ✅ All Back buttons
      hideCurrentScreen(); // ✅ Always call before navigation
      popScreen();
    }
  });
}