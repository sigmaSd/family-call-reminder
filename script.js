// deno-lint-ignore-file no-window
// Load family members from localStorage when the document is ready
document.addEventListener("DOMContentLoaded", loadMembers);

const familyMembersDiv = document.getElementById("familyMembers");

// Function to add a new family member
// deno-lint-ignore no-unused-vars
function addMember() {
  const name = document.getElementById("name").value;
  const days = document.getElementById("days").value;
  if (name && days) {
    const member = {
      name,
      days,
      lastCalled: Date.now(),
      isGreen: false,
    };
    saveMember(member);
    renderMember(member);
    document.getElementById("name").value = "";
    document.getElementById("days").value = "";
  }
}

// Save a family member to localStorage
function saveMember(member) {
  const members = JSON.parse(localStorage.getItem("members")) || [];
  members.push(member);
  localStorage.setItem("members", JSON.stringify(members));
}

// Load family members from localStorage
function loadMembers() {
  const members = JSON.parse(localStorage.getItem("members")) || [];
  // biome-ignore lint/complexity/noForEach: <explanation>
  members.forEach((member) => renderMember(member));
  checkReminders();
  setInterval(checkReminders, 1000 * 60); // Check reminders every minute
}

// Render a family member's div
function renderMember(member) {
  const memberDiv = document.createElement("div");
  memberDiv.className = `member ${member.isGreen ? "green" : "red"}`;
  memberDiv.innerText = member.name;
  memberDiv.dataset.name = member.name;
  memberDiv.dataset.days = member.days;
  memberDiv.dataset.lastCalled = member.lastCalled;
  memberDiv.dataset.isGreen = member.isGreen;
  memberDiv.onclick = (e) => handleMemberClick(e, memberDiv);
  memberDiv.ontouchstart = (e) => handleMemberTouch(e, memberDiv); // Handle touch events
  memberDiv.oncontextmenu = (e) => removeMember(e, memberDiv);
  familyMembersDiv.appendChild(memberDiv);
}

// Handle member click event
function handleMemberClick(event, memberDiv) {
  if (event.ctrlKey) {
    showPopup(event, memberDiv);
  } else {
    toggleMember(memberDiv);
  }
}

// Handle member touch event
function handleMemberTouch(event, memberDiv) {
  if (event.touches.length === 2) {
    showPopup(event, memberDiv);
  }
}

// Show a popup with reminder info
function showPopup(_event, memberDiv) {
  const popup = document.createElement("div");
  popup.className = "popup";
  const days = Number(memberDiv.dataset.days);
  const lastCalled = Number(memberDiv.dataset.lastCalled);
  const now = Date.now();
  const daysSinceLastCalled = Math.floor(
    (now - lastCalled) / (24 * 60 * 60 * 1000),
  );
  const daysLeft = days - daysSinceLastCalled;

  popup.innerText = `Reminder every ${days} days. Days left: ${
    daysLeft >= 0 ? daysLeft : 0
  }`;
  document.body.appendChild(popup);

  const rect = memberDiv.getBoundingClientRect();
  popup.style.top = `${rect.top + window.scrollY - popup.offsetHeight}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;

  setTimeout(() => {
    document.body.removeChild(popup);
  }, 3000); // Remove the popup after 3 seconds
}

// Toggle the call status of a family member
function toggleMember(memberDiv) {
  if (memberDiv.classList.contains("red")) {
    memberDiv.classList.remove("red");
    memberDiv.classList.add("green");
    memberDiv.dataset.lastCalled = Date.now();
    memberDiv.dataset.isGreen = "true";
  } else {
    memberDiv.classList.remove("green");
    memberDiv.classList.add("red");
    memberDiv.dataset.isGreen = "false";
  }
  updateLocalStorage(memberDiv);
}

// Update localStorage with the current state of a member
function updateLocalStorage(memberDiv) {
  const members = JSON.parse(localStorage.getItem("members")) || [];
  const updatedMembers = members.map((member) => {
    if (member.name === memberDiv.dataset.name) {
      return {
        name: member.name,
        days: member.days,
        lastCalled: memberDiv.dataset.lastCalled,
        isGreen: memberDiv.dataset.isGreen === "true",
      };
    }
    return member;
  });
  localStorage.setItem("members", JSON.stringify(updatedMembers));
}

// Remove a family member
function removeMember(event, memberDiv) {
  event.preventDefault(); // Prevent the default context menu from appearing
  const members = JSON.parse(localStorage.getItem("members")) || [];
  const updatedMembers = members.filter((member) =>
    member.name !== memberDiv.dataset.name
  );
  localStorage.setItem("members", JSON.stringify(updatedMembers));
  familyMembersDiv.removeChild(memberDiv);
}

// Check reminders and update member status
function checkReminders() {
  const members = document.getElementsByClassName("member");
  const now = Date.now();
  // biome-ignore lint/complexity/noForEach: <explanation>
  Array.from(members).forEach((member) => {
    const lastCalled = Number.parseInt(member.dataset.lastCalled);
    const days = Number.parseInt(member.dataset.days);
    const daysInMilliseconds = days * 24 * 60 * 60 * 1000;
    if (now - lastCalled >= daysInMilliseconds) {
      member.classList.add("red");
      member.classList.remove("green");
      member.dataset.isGreen = "false";
      updateLocalStorage(member);
    }
  });
}
