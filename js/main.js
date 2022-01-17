// Globals
const todoList = document.getElementById('todo-list');
const userSelect = document.getElementById('user-todo');
const form = document.querySelector('form');
const modal = document.querySelector('.modal');
let todos = [];
let users = [];

// Attach Events
document.addEventListener('DOMContentLoaded', initApp);
modal.addEventListener('click', closeModal);
form.addEventListener('submit', handleSubmit);

// Basic logic (for actions in the DOM)
function getUserName(userId) { 
  const user = users.find( u => u.id === userId); //         *_-_*
  return user.name;
}

function printTodo({id, userId, title, completed}) {
  const li = document.createElement('li');
  li.className = 'todo-item';
  li.dataset.id = id;
  li.innerHTML = `<span>${title} <i>by</i> <b>${getUserName(userId)}</b></span>`;

  const status = document.createElement('input');
  status.type = 'checkbox';
  status.checked = completed;
  status.addEventListener('change', handleTodoChange);

  const close = document.createElement('span');
  close.innerHTML = '&times;';
  close.className = 'close';
  close.addEventListener('click', handleClose);

  li.prepend(status);
  li.append(close);

  if(document.querySelector('#new-todo').value.trim()){
    todoList.prepend(li);  
  }

  document.querySelector('#new-todo').value = '';
}

function createUserOption(user) {
  const option = document.createElement('option');
  option.value = user.id;
  option.innerText = user.name;

  userSelect.append(option);
}

function removeTodo(todoId) {
  todos = todos.filter(todo => todo.id !== todoId);

  // removeEventListener's
  const todo = todoList.querySelector(`[data-id = "${todoId}"]`);
  todo.querySelector('input').removeEventListener('change', handleTodoChange);
  todo.querySelector('.close').removeEventListener('click', handleClose);

  // Remove from DOM
  todo.remove();
}

  // Error for user
function alertError(error) {
  // alert(error.message);
  modal.style.display = 'block';
  modal.firstElementChild.innerHTML = '<span>Error:</span> <br><br>' + error.message;
}

function closeModal(event) {
  if (event.target !== modal.children[0]) {
    modal.style.display = 'none';
  }
}
// Event logic
function initApp() {
  Promise.all([getAllTodos(), getAllUsers() ]).then(values => {
    [todos, users] = values;

    todos.forEach( (todo) => printTodo(todo) );
    users.forEach( (user) => createUserOption(user) );
  });
}
function handleSubmit(event) {
  event.preventDefault();
  // console.log(form.todo.value);
  // console.log(form.user.value);
  createTodo({
    userId: Number(form.user.value), 
    title: form.todo.value, 
    completed: false,
  })
}

function handleTodoChange() {
  const todoId = this.parentElement.dataset.id;
  const completed = this.checked;

  toggleTodoComplete(todoId, completed);

}
function handleClose() {
  const todoId = this.parentElement.dataset.id;
  deleteTodo(todoId);
}

// Async logic
async function getAllTodos() {
  try {
   const response = await fetch('https://jsonplaceholder.typicode.com/todos');
   const data = await response.json();

   return data;

  } catch (error) {
    alertError(error);
  }

}

async function getAllUsers() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const data = await response.json();

    return data;

  } catch (error) {
    alertError(error);
  }
 
}

  // createTodo on server
async function createTodo(todo) {
  try {
    if(document.querySelector('#new-todo').value.trim()){

      const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
      method: 'POST',
      body: JSON.stringify(todo),
      headers: {
        'Content-type': 'application/json', //         *_-_* 
      },
      });
      const newTodo = await response.json(); //         *_-_*
      console.log(newTodo)
      printTodo(newTodo); //         *_-_* 

    }
  } catch (error) {
    alertError(error);
  }
  
} 

// toggle data on server
async function toggleTodoComplete(todoId, completed) {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
    method: 'PATCH',
    body: JSON.stringify({completed: completed}),
    headers: {
      'Content-type': 'application/json',
    },
    });
    const data = await response.json();
    console.log(data);
    if(!response.ok) {
      throw new Error('Нарушена корректная работа сервера, пожалуйста попробуйте позжe.');
    }
  } catch (error) {
    alertError(error);
  }
  
}

async function deleteTodo(todoId) {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
    method: 'DELETE',
    headers: {
      'Content-type': 'application/json',
    },      
    });
    // const data = await response.json();
    // console.log(data);
    if(response.ok) {
      removeTodo(todoId);
    } else {
      throw new Error('Нарушена корректная работа сервера, пожалуйста попробуйте позжe.');
    }
  } catch (error) {
    alertError(error);
  }
  
  
}