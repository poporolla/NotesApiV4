const uri = 'api/Notes';
let notes = [];
let editingNote = undefined;

//загрузка записей с сервера
function getNotes() {
	let token = sessionStorage.getItem(tokenKey);
	if (token === null) {
		logOut();
	}
	else {
		fetch(uri, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Authorization': 'Bearer ' + token
			}
		})
			.then(response => response.json())
			.then(data => _displayNotes(data))
			.catch(error => {
				console.error('Unable to get items.', error);
				logOut();
			});
	}
}


//удалить запись
function deleteNote(id) {
	let token = sessionStorage.getItem(tokenKey);
	if (token === null) {
		logOut();
	}
	else {
		fetch(`${uri}/${id}`, {
			method: 'DELETE',
			headers: {
				'Authorization': 'Bearer ' + token
			}
		})
			.then(() => notes.splice(notes.findIndex(n => n.id == id), 1))
			.then(() => _displayNotes(notes))
			.catch(error => {
				console.error('Unable to delete note.', error);
				logOut();
			});
	}
}

//сохранить изменения в записи
function updateNote(note) {
	let token = sessionStorage.getItem(tokenKey);
	notes.splice(notes.findIndex(n => n.id == note.id), 1, note);
	if (token === null) {
		logOut();
	}
	else {
		fetch(`${uri}/${note.id}`, {
			method: 'PUT',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
			},
			body: JSON.stringify(note)
		})
			.then(() => notes.splice(notes.findIndex(n => n.id == note.id), 1, note))
			.catch(error => {
				console.error('Unable to update item.', error);
				logOut();
			});
	}
}

//сделать запись важной
function makeImportant(id) {
	let note = notes.find(el => el.id == id);
	if (note.isImportant == true) {
		note.isImportant = false;
	}
	else {
		note.isImportant = true;
	}
	updateNote(note);
	_displayNotes(notes)
}


//когда выбрана запись для редактирования
function noteSelected(id) {
	let onEditingIdInput = document.getElementById("edit-id");
	let textEditFieldInput = document.getElementById("edit-text");
	document.getElementById("editingNoteTextForm").classList.remove("hiddenElement");
	let newNote = notes.find(el => el.id == id);
	if (newNote !== undefined) {
		if (onEditingIdInput.value > 0) {
			let tempEditingNote = document.getElementById(`note-${onEditingIdInput.value}`);
			if (tempEditingNote !== null) tempEditingNote.classList.remove("onEditing");
		}


		editingNote = newNote;

		onEditingIdInput.value = newNote.id;
		textEditFieldInput.value = newNote.text;

		document.getElementById(`note-${newNote.id}`).classList.add('onEditing');
		textEditFieldInput.focus();
	}
	else {
		document.getElementById("editingNoteTextForm").classList.add("hiddenElement");
	}


}

//сохранение текста при смене записи для редактирования
function saveChangedText() {
	let onEditingIdInput = document.getElementById("edit-id");
	let textEditFieldInput = document.getElementById("edit-text");

	let oldNote = notes.find(el => el.id == onEditingIdInput.value);
	if (oldNote !== undefined && textEditFieldInput.value != oldNote.text) {
		oldNote.text = textEditFieldInput.value;
		updateNote(oldNote);
	}
}

// сохранение при закрытии вкладки
window.addEventListener('unload', () => saveChangedText());

//вывод записей, загруженных в getNote
function _displayNotes(data) {

	const importantNotes = document.getElementById("importantNotes");
	importantNotes.innerHTML = "";

	const allNotes = document.getElementById("allNotes");
	allNotes.innerHTML = "";

	data.forEach(note => {

		//important notes
		if (note.isImportant == true) {
			let importantElement = document.createElement("li");

			let importantElementButton = document.createElement("a");
			importantElementButton.innerText = note.name;
			importantElementButton.setAttribute('onclick', `noteSelected(${note.id})`);

			importantElement.appendChild(importantElementButton);
			importantNotes.appendChild(importantElement);
		}

		//all notes
		let noteElement = document.createElement("li");
		noteElement.id = `note-${note.id}`;

		let importanceButton = document.createElement("a");
		importanceButton.setAttribute('aria-label', `Make Note Important`);
		importanceButton.setAttribute('onclick', `makeImportant(${note.id})`);
		importanceButton.innerText = String.fromCharCode(10025);
		if (note.isImportant == true) {
			importanceButton.classList.add("important-button");
		}
		importanceButton.classList.add("greyBackground", "whiteBorder");
		noteElement.appendChild(importanceButton);

		let noteName = document.createElement("a");
		noteName.setAttribute('onclick', `noteSelected(${note.id})`);
		noteName.setAttribute('ondblclick', `editNoteName(${note.id})`);
		noteName.innerText = note.name;
		noteName.classList.add("greyBackground", "whiteBorder");
		noteElement.appendChild(noteName);

		let noteNameEditingForm = document.createElement("form");
		noteNameEditingForm.setAttribute('onsubmit', `saveNoteName(${note.id}); return false`);
		let noteNameEditingTextBox = document.createElement("input");
		noteNameEditingTextBox.type = "text";
		noteNameEditingTextBox.value = note.name;
		noteNameEditingTextBox.maxLength = 16;
		noteNameEditingTextBox.setAttribute('onfocusout', `saveNoteName(${note.id})`);
		noteNameEditingTextBox.style.display = 'none';
		noteNameEditingTextBox.classList.add("greyBackground", "whiteBorder");
		noteNameEditingForm.appendChild(noteNameEditingTextBox);
		noteElement.appendChild(noteNameEditingForm);

		let noteDeleteButton = document.createElement("a");
		noteDeleteButton.setAttribute('onclick', `deleteNote(${note.id})`);
		noteDeleteButton.innerText = String.fromCharCode(10134);
		noteDeleteButton.classList.add("greyBackground", "whiteBorder");
		noteElement.appendChild(noteDeleteButton);

		if (allNotes.firstChild !== null) {
			allNotes.insertBefore(noteElement, allNotes.firstChild);
		}
		else {
			allNotes.appendChild(noteElement);
		}

	});
	notes = data;
	if (!notes.some(el => el.isImportant === true) === true) importantNotes.style.display = 'none';
	else importantNotes.style.display = 'block';
	if (editingNote !== undefined) noteSelected(editingNote.id); //select new note for editing
}

//creating new note
function createNewNote() {
	const allNotes = document.getElementById("allNotes");

	let noteElement = document.createElement("li");


	let noteNameEditingForm = document.createElement("form");
	noteNameEditingForm.action = `javascript: saveNewNote();`;
	noteNameEditingForm.setAttribute('onfocusout', `this.submit()`);
	noteNameEditingForm.id = 'newNoteCreatingNameForm';
	let noteNameEditingTextBox = document.createElement("input");
	noteNameEditingTextBox.type = "text";
	noteNameEditingTextBox.value = "New Note";
	noteNameEditingTextBox.maxLength = 16;
	noteNameEditingTextBox.id = "newNoteCreatingNameTextBox";

	noteNameEditingForm.appendChild(noteNameEditingTextBox);
	noteElement.appendChild(noteNameEditingForm);

	if (allNotes.firstChild !== null) {
		allNotes.insertBefore(noteElement, allNotes.firstChild);
	}
	else {
		allNotes.appendChild(noteElement);
	}
	noteNameEditingTextBox.select();
	noteNameEditingTextBox.focus();
}

function saveNewNote() {
	let textBox = document.getElementById('newNoteCreatingNameTextBox');
	if (textBox !== null) {
		let note = {
			name: textBox.value,
			text: "",
			isImportant: false
		};
		addNote(note);
	}
}

function addNote(createdNote) {
	let token = sessionStorage.getItem(tokenKey);
	if (token === null) {
		logOut();
	}
	else {
		fetch(uri, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token
			},
			body: JSON.stringify(createdNote)
		})
			.then(response => response.json())
			.then(note => editingNote = note)
			.then(() => getNotes())
			.catch(error => {
				console.error('Unable to add note.', error);
				logOut();
			});
	}
}

//editing note name
function editNoteName(id) {
	let noteElement = document.getElementById(`note-${id}`);
	noteElement.children[1].style.display = 'none';
	noteElement.children[2].children[0].style.display = 'block';
	noteElement.children[2].children[0].select();
	noteElement.children[2].children[0].focus();
}


//save note name
function saveNoteName(id) {
	let note = notes.find(el => el.id == id);
	let noteElement = document.getElementById(`note-${id}`);
	note.name = noteElement.children[2].children[0].value;
	updateNote(note);
	_displayNotes(notes);
}


//часть с авторизацией

//логаут
function logOut() {
	console.log('logout called');
	document.getElementById("notesContent").style.display = "none";
	document.getElementById("loginForm").style.display = "block";
	document.getElementById("registerForm").style.display = "none";
	sessionStorage.removeItem(tokenKey);
}
function registerFormCalled() {
	console.log('register form called');
	document.getElementById("notesContent").style.display = "none";
	document.getElementById("loginForm").style.display = "none";
	document.getElementById("registerForm").style.display = "block";
	sessionStorage.removeItem(tokenKey);
}
// получаем токен
document.getElementById("submitLogin").addEventListener("click", e => {

	e.preventDefault();
	let loginData = {
		email: document.getElementById("emailLogin").value,
		password: document.getElementById("passwordLogin").value
	};
	getTokenAsync(loginData);
});

// register
document.getElementById("submitRegister").addEventListener("click", e => {

	e.preventDefault();

	let userLogin = document.getElementById("emailRegister").value;
	let userPassword = document.getElementById("passwordRegister").value;
	let userConfirmPassword = document.getElementById("passwordConfirmRegister").value;
	if (userLogin == "" || userPassword == "" || userConfirmPassword == "") return;
	console.log("proshel dalshe returna");
	if (userPassword != userConfirmPassword) {
		document.getElementById("passwordConfirmationNotify").style.display = "block";
		return;
	}
	let loginData = {
		email: userLogin,
		password: userPassword
	};


	fetch("api/Users", {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(loginData)
	})
		.then(() => getTokenAsync(loginData))
		.catch(error => {
			console.error('Unable to add note.', error);
			logOut();
		});
});





var tokenKey = "accessToken";
// отпавка запроса к контроллеру AccountController для получения токена
async function getTokenAsync(loginData) {
	const response = await fetch('/token', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(loginData)
	});
	const data = await response.json();

	// если запрос прошел нормально
	if (response.ok === true) {
		document.getElementById("notesContent").style.display = "block";
		document.getElementById("loginForm").style.display = "none";
		document.getElementById("registerForm").style.display = "none";
		document.getElementById("userNameEmail").innerText = data.username;
		// сохраняем в хранилище sessionStorage токен доступа
		sessionStorage.setItem(tokenKey, data.access_token);
		console.log(data.access_token);
		getNotes();
	}
	else {
		// если произошла ошибка, из errorText получаем текст ошибки
		console.log("Error: ", response.status, data.errorText);
	}
};