const socket = io();
let username = '';
let userList = [];

let login = document.querySelector('#login  ');
let chatPage = document.querySelector('#chatPage');

let loginInput = document.querySelector('#inputName');
let textInput = document.querySelector('#chatTextInput');


login.style.display = 'flex';
chatPage.style.display = 'none';
loginInput.focus();


const renderUserList = () => {
  let ul = document.querySelector('.userList');
  ul.innerHTML = '';

  userList.forEach(i => {
    ul.innerHTML += '<li>• ' + i + '</i>'
  })
}

const addMessage = (type, user, msg) => {
  let ul = document.querySelector('.right');

  switch (type) {
    case 'status':
      ul.innerHTML += '<li class="m-status">' + msg + '</li>';
      break;
    case 'msg':

      if (username === user) {
        ul.innerHTML += '<li class="m-txt-me"><span class="me">' + "Eu" + ': </span> ' + msg + '</li>';
      } else {
        ul.innerHTML += '<li class="m-txt-not-me"><span class="not-me">' + user + ': </span> ' + msg + '</li>';
      }
      break;
  }
  ul.scrollTop = ul.scrollHeight;
}

loginInput.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    let name = loginInput.value.trim();
    if (name !== '') {
      username = name;
      document.title = 'Chat (' + username + ')';
      socket.emit('join-request', username);
    }
  }
});

socket.on('user-ok', (list) => {
  login.style.display = 'none';
  chatPage.style.display = 'flex';
  textInput.focus();
  addMessage('status', null, 'Você entrou no chat');
  userList = list;
  renderUserList();
});


socket.on('list-update', data => {
  if (data.joined) {
    addMessage('status', null, data.joined + " entrou no chat.");
  }
  if (data.left) {
    addMessage('status', null, data.joined + " saiu no chat.");
  }
  userList = data.list;
  renderUserList();
})

textInput.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    let txt = textInput.value.trim();
    textInput.value = '';
    if (txt !== '') {
      addMessage('msg', username, txt)
      socket.emit('send-msg', txt);
    }
  }
});

socket.on('show-msg', (data) => {
  addMessage('msg', data.username, data.message)
})


socket.on('disconnect', () => {
  addMessage('status', null, 'Voce foi desconectado.');
  userList = [];
  renderUserList();
});

socket.on('reconnect_error', () => {
  addMessage('status', null, 'Tentando reconectar...')
});

socket.on('reconnect', () => {
  addMessage('status', null, 'Reconectado!');

  if (username.trim() !== '') {
    socket.emit('join-request', username)
  }


})