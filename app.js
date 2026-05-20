import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://dmsfwjwnptjdaidgtlwk.supabase.co'

const supabaseKey = 'sb_publishable_LznntFt3RKsczJkidct0rw_ULShcv52'

const supabase = createClient(supabaseUrl, supabaseKey)


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

  loadHistory();
});


// SUBMIT BUTTON
submitBtn.addEventListener("click", async () => {

  const file = fileInput.files[0];
  const note = userNote.value.trim();

  if (!file) {
    alert("Please choose XLSX file");
    return;
  }

  messageDiv.innerHTML = "Uploading...";

  try {

    const fileName = `${Date.now()}_${file.name}`;

    // UPLOAD FILE
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    // FILE URL
    const { data } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    const fileURL = data.publicUrl;

    // SAVE DATABASE
    const { error: dbError } = await supabase
      .from('submissions')
      .insert([
        {
          username: currentUsername,
          file_name: file.name,
          file_url: fileURL,
          user_note: note,
          status: 'Pending',
          admin_note: 'Waiting for review'
        }
      ]);

    if (dbError) {
      throw dbError;
    }

    messageDiv.innerHTML = "Upload successful";

    fileInput.value = "";
    userNote.value = "";

    loadHistory();

  } catch (error) {

    console.log(error);

    messageDiv.innerHTML = "Submission failed";
  }
});


// LOAD HISTORY
async function loadHistory() {

  historyDiv.innerHTML = "Loading...";

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('username', currentUsername)
    .order('created_at', { ascending: false });

  if (error) {

    historyDiv.innerHTML = "Failed to load";

    return;
  }

  totalFiles.innerHTML = `Total Files Submitted: ${data.length}`;

  historyDiv.innerHTML = "";

  data.forEach(item => {

    historyDiv.innerHTML += `
      <div class="history-card">

        <h4>${item.file_name}</h4>

        <p>
          <strong>Status:</strong>
          ${item.status}
        </p>

        <p>
          <strong>Your Note:</strong>
          ${item.user_note || 'No note'}
        </p>

        <p>
          <strong>Admin Note:</strong>
          ${item.admin_note}
        </p>

        <a href="${item.file_url}" target="_blank">
          Download File
        </a>

      </div>
    `;
  });

  if (data.length === 0) {
    historyDiv.innerHTML = "No submissions found";
  }
}
