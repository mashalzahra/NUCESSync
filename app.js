let notes=[]
let editingNoteId=null
function loadNotes(){
    const savedNotes=localStorage.getItem('quickNotes')
    return savedNotes ? JSON.parse(savedNotes): [] // If nothing is saved, return an empty array
}
function saveNote(event){
    event.preventDefault()   // Prevent form submission from refreshing the page
    const title = document.getElementById('noteTitle').value.trim();      //.val.trim to remove extra spaces
    const content = document.getElementById('noteContent').value.trim();
    const subject = document.getElementById('noteSubject').value.trim();
    const topic = document.getElementById('noteTopic').value.trim();

    if(editingNoteId){
      const noteIndex = notes.findIndex(note => note.id === editingNoteId)
      notes[noteIndex] = {
      ...notes[noteIndex],
      title: title,
      content: content,
      subject: subject,
      topic: topic
    }
    }
    else{
      notes.unshift({    // If adding a new note, add it to the start of the notes
        id: generateId(), // Generate a unique ID
        title: title,
        content: content,
        subject: subject,
        topic: topic
    })
    }
    closeNoteDialog()
    saveNotes() //to local storage
    renderNotes()
}
function generateId(){
    return Date.now().toString()
}
function saveNotes(){
    localStorage.setItem('quickNotes', JSON.stringify(notes))
}
function deleteNote(noteId){  //delete a note by ID
  notes= notes.filter(note => note.id!=noteId)
  saveNotes()        //update
  renderNotes()

}
function renderNotes(){   //display all
    const notesContainer = document.getElementById('notesContainer');
    notesContainer.innerHTML="" // Clear previous notes

  if(notes.length === 0) {    // Show empty state if no notes exist
    notesContainer.innerHTML = `
      <div class="empty-state">
        <h2>No notes yet</h2>
        <p>Create your first note to get started!</p>
        <button class="add-note-btn" onclick="openNoteDialog()">+ Add Your First Note</button>
      </div>
    `
    return
  }

  const grouped={}; //by sub
  notes.forEach(note=>{
    if(!grouped[note.subject]){
      grouped[note.subject] = [];
    }
    grouped[note.subject].push(note);
  })
  Object.keys(grouped).forEach(subject=>{
    const section= document.createElement("section");
    section.classList.add("subject-section");
    section.innerHTML=`
    <h2 class="subject-heading">${subject}</h2>
    <div class="notes-grid">
    ${grouped[subject].map(note=> ` 
      <div class="note-card">
      <div class="note-title">${note.title}</div>     
      <div class="note-content">${note.content}</div>
      <div class="note-actions">
      <button class="edit-btn" onclick="editNote('${note.id}')">✏️</button>
      <button class="delete-btn" onclick="deleteNote('${note.id}')">🗑️</button>
      </div>
      </div>
    `).join("")}
    </div>
    `;
    notesContainer.appendChild(section);
  })
}
function toggleExpand(element){
  element.classList.toggle('expanded');
  if(element.classList.contains('expanded')){
    element.style.maxHeight = 'none'; // Show full content
  }else{
    element.style.maxHeight = '4.5em'; // Collapse content
  }
}
function subjectAdd(){
  const subjectSelect = document.getElementById('noteSubject');
  let newSubjectInput = null;

  subjectSelect.addEventListener('change', ()=>{
    if (subjectSelect.value === 'add-new'){
      if (!newSubjectInput){  // Create a new input field if it doesn’t exist yet
        newSubjectInput = document.createElement('input');
        newSubjectInput.type = 'text';
        newSubjectInput.placeholder = 'Enter new subject name';
        newSubjectInput.className = 'form-input';
        newSubjectInput.style.marginTop = '8px';
        newSubjectInput.addEventListener('blur', () =>{     // When user clicks outside input, save new subject
          const val= newSubjectInput.value.trim();
          if(val){
            const option = document.createElement('option');
            option.value = val;
            option.textContent = val;
            subjectSelect.insertBefore(option, subjectSelect.lastElementChild);
            subjectSelect.value = val;
          }
          newSubjectInput.remove();
          newSubjectInput=null;
        });
        subjectSelect.parentNode.appendChild(newSubjectInput);
        newSubjectInput.focus();
      }
    }
  })
}

function openNoteDialog(noteId=null){
    const dialog= document.getElementById('noteDialog');
    const titleInput= document.getElementById('noteTitle');
    const contentInput= document.getElementById('noteContent');
    const subjectGroup= document.getElementById('subjectGroup');
    const topicGroup= document.getElementById('topicGroup');
  
    if(noteId){
      const noteToEdit= notes.find(note=> note.id===noteId)
      editingNoteId= noteId
      document.getElementById('dialogTitle').textContent='Edit Note'
      titleInput.value=noteToEdit.title
      contentInput.value= noteToEdit.content

      subjectGroup.style.display='none'; // Hide subject/topic fields when editing
      topicGroup.style.display='none';
    }
    else{
      editingNoteId=null
      document.getElementById('dialogTitle').textContent='Add New Note'
      titleInput.value=''
      contentInput.value= ''
      document.getElementById('noteTopic').value = '';
      document.getElementById('noteSubject').selectedIndex = 0;

      subjectGroup.style.display='block';
      topicGroup.style.display='block';

    } 
    dialog.showModal()     // Open the dialog
    titleInput.focus()    // Focus the title input for easy typing
}
function editNote(id){
  openNoteDialog(id);
}
function closeNoteDialog(){
    document.getElementById('noteDialog').close()
}
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme')
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
  document.getElementById('themeToggleBtn').textContent = isDark ? '☀️' : '🌙'
}
function applyStoredTheme() {
  if(localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme')
    document.getElementById('themeToggleBtn').textContent = '☀️'
  }
}
// Code to run when the page finishes loading
document.addEventListener('DOMContentLoaded', function(){
  applyStoredTheme()
  notes=loadNotes()
  renderNotes()
    document.getElementById('noteForm').addEventListener('submit', saveNote)        // Event listener for saving a note when form is submitted
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme)
    document.getElementById('noteDialog').addEventListener('click', function(event){  // Close dialog if user clicks outside the dialog content
        if(event.target==this){
            closeNoteDialog()
        }
    })
    subjectAdd();     // Initialize the add-new-subject dropdown feature----in end so that when html loads then even listeners attach ho
})