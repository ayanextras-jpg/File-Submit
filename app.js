import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAMW_pyCUW6xDxtE3DXJtHR9bJK-5Dymig",
  authDomain: "upload-system-c34ed.firebaseapp.com",
  projectId: "upload-system-c34ed",
  storageBucket: "upload-system-c34ed.firebasestorage.app",
  messagingSenderId: "253392821483",
  appId: "1:253392821483:web:a877fb3cdf4c9709f632ae",
  measurementId: "G-WLC8Z2MMR2"
};


// INITIALIZE FIREBASE
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


// ELEMENTS
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");

const usernameInput = document.getElementById("username");
const fileInput = document.getElementById("fileInput");
const userNote = document.getElementById("userNote");

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");

const welcomeUser = document.getElementById("welcomeUser");
const totalFiles = document.getElementById("totalFiles");
const historyDiv = document.getElementById("history");
const messageDiv = document.getElementById("message");

let currentUsername = "";


// NEXT BUTTON
nextBtn.addEventListener("click", async () => {

  const username = usernameInput.value.trim();

  if (!username) {
    alert("Please enter Telegram username");
    return;
  }

  currentUsername = username;

  step1.classList.add("hidden");
  step2.classList.remove("hidden");

  welcomeUser.innerText = `Welcome ${username}`;

  await loadUserHistory();
});


// SUBMIT BUTTON
submitBtn.addEventListener("click", async () => {

  const file = fileInput.files[0];
  const note = userNote.value.trim();

  if (!file) {
    alert("Please select XLSX file");
    return;
  }

  messageDiv.innerHTML = "Submitting...";

  try {

    await addDoc(collection(db, "submissions"), {
      username: currentUsername,
      fileName: file.name,
      note: note,
      status: "Pending",
      adminNote: "Waiting for review",
      createdAt: new Date()
    });

    messageDiv.innerHTML = "Submission successful";

    fileInput.value = "";
    userNote.value = "";

    await loadUserHistory();

  } catch (error) {

    console.log(error);

    messageDiv.innerHTML = "Submission failed";
  }
});


// LOAD USER HISTORY
async function loadUserHistory() {

  historyDiv.innerHTML = "Loading...";

  const q = query(
    collection(db, "submissions"),
    where("username", "==", currentUsername),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);

  totalFiles.innerText = `Total Files Submitted: ${querySnapshot.size}`;

  historyDiv.innerHTML = "";

  querySnapshot.forEach((doc) => {

    const data = doc.data();

    let statusClass = "status-pending";

    if (data.status === "Approved") {
      statusClass = "status-approved";
    }

    if (data.status === "Rejected") {
      statusClass = "status-rejected";
    }

    historyDiv.innerHTML += `
      <div class="history-card">
        <h4>${data.fileName}</h4>

        <p><strong>Status:</strong>
          <span class="${statusClass}">
            ${data.status}
          </span>
        </p>

        <p><strong>Your Note:</strong> ${data.note || "No note"}</p>

        <p><strong>Admin Note:</strong> ${data.adminNote}</p>
      </div>
    `;
  });

  if (querySnapshot.empty) {
    historyDiv.innerHTML = "No submissions found";
  }
}