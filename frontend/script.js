// Base URL for API requests
const API_URL = '/.netlify/functions/users';

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  // Check if elements exist before adding event listeners
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const getUsersBtn = document.getElementById('get-users-btn');
  if (getUsersBtn) {
    getUsersBtn.addEventListener('click', getUsers);
  }

  // Load users if we're on an admin page
  if (document.getElementById('users-list')) {
    getUsers();
  }
});

// Register new user
async function handleRegister(event) {
  event.preventDefault();
  
  const registerStatus = document.getElementById('register-status');
  const formData = new FormData(event.target);
  
  // Validate password match
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  
  if (password !== confirmPassword) {
    registerStatus.textContent = 'Las contraseñas no coinciden';
    registerStatus.className = 'error';
    return;
  }
  
  // Create user object
  const userData = {
    nombres: formData.get('nombres'),
    apellidos: formData.get('apellidos'),
    email: formData.get('email'),
    tipoUsuario: formData.get('tipoUsuario'),
    nombreUsuario: formData.get('nombreUsuario'),
    password,
    confirmPassword
  };
  
  try {
    const response = await fetch(`${API_URL}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      registerStatus.textContent = 'Usuario registrado exitosamente';
      registerStatus.className = 'success';
      event.target.reset();
    } else {
      registerStatus.textContent = result.message || 'Error al registrar usuario';
      registerStatus.className = 'error';
    }
  } catch (error) {
    registerStatus.textContent = 'Error de conexión al servidor';
    registerStatus.className = 'error';
    console.error('Error:', error);
  }
}

// Login user
async function handleLogin(event) {
  event.preventDefault();
  
  const loginStatus = document.getElementById('login-status');
  const formData = new FormData(event.target);
  
  const userData = {
    nombreUsuario: formData.get('nombreUsuario'),
    password: formData.get('password')
  };
  
  try {
    const response = await fetch(`${API_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      loginStatus.textContent = 'Inicio de sesión exitoso';
      loginStatus.className = 'success';
      
      // Save user data to session storage
      sessionStorage.setItem('currentUser', JSON.stringify(result.user));
      
      // Redirect based on user type
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      loginStatus.textContent = result.message || 'Credenciales inválidas';
      loginStatus.className = 'error';
    }
  } catch (error) {
    loginStatus.textContent = 'Error de conexión al servidor';
    loginStatus.className = 'error';
    console.error('Error:', error);
  }
}

// Get all users
async function getUsers() {
  const usersList = document.getElementById('users-list');
  if (!usersList) return;
  
  try {
    const response = await fetch(`${API_URL}/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      renderUsersList(result.users);
    } else {
      usersList.innerHTML = `<p class="error">Error: ${result.message}</p>`;
    }
  } catch (error) {
    usersList.innerHTML = '<p class="error">Error de conexión al servidor</p>';
    console.error('Error:', error);
  }
}

// Render users list
function renderUsersList(users) {
  const usersList = document.getElementById('users-list');
  if (!usersList) return;
  
  if (users.length === 0) {
    usersList.innerHTML = '<p>No hay usuarios registrados</p>';
    return;
  }
  
  const tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Apellidos</th>
          <th>Email</th>
          <th>Tipo de Usuario</th>
          <th>Nombre de Usuario</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(user => `
          <tr>
            <td>${user.nombres}</td>
            <td>${user.apellidos}</td>
            <td>${user.email}</td>
            <td>${user.tipoUsuario}</td>
            <td>${user.nombreUsuario}</td>
            <td>
              <button onclick="editUser('${user.id}')">Editar</button>
              <button onclick="deleteUser('${user.id}')">Eliminar</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  usersList.innerHTML = tableHTML;
}

// Edit user
function editUser(userId) {
  // Redirect to edit page or open modal
  window.location.href = `edit-user.html?id=${userId}`;
}

// Delete user
async function deleteUser(userId) {
  if (!confirm('¿Está seguro de eliminar este usuario?')) return;
  
  try {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Usuario eliminado exitosamente');
      getUsers(); // Refresh the list
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    alert('Error de conexión al servidor');
    console.error('Error:', error);
  }
}

// Load user data for editing
async function loadUserForEdit(userId) {
  try {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Fill form with user data
      const user = result.user;
      document.getElementById('edit-id').value = user.id;
      document.getElementById('edit-nombres').value = user.nombres;
      document.getElementById('edit-apellidos').value = user.apellidos;
      document.getElementById('edit-email').value = user.email;
      document.getElementById('edit-tipo-usuario').value = user.tipoUsuario;
      document.getElementById('edit-nombre-usuario').value = user.nombreUsuario;
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    alert('Error de conexión al servidor');
    console.error('Error:', error);
  }
}

// Update user
async function updateUser(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const userId = formData.get('id');
  
  const userData = {
    nombres: formData.get('nombres'),
    apellidos: formData.get('apellidos'),
    email: formData.get('email'),
    tipoUsuario: formData.get('tipoUsuario'),
    nombreUsuario: formData.get('nombreUsuario')
  };
  
  // Add password only if it's provided
  const password = formData.get('password');
  if (password) {
    userData.password = password;
  }
  
  try {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Usuario actualizado exitosamente');
      window.location.href = 'dashboard.html'; // Redirect back to dashboard
    } else {
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    alert('Error de conexión al servidor');
    console.error('Error:', error);
  }
}

// Check if we're on the edit page and load user data
document.addEventListener('DOMContentLoaded', () => {
  const editForm = document.getElementById('edit-form');
  if (editForm) {
    editForm.addEventListener('submit', updateUser);
    
    // Get user ID from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    
    if (userId) {
      loadUserForEdit(userId);
    }
  }
});

// Check authentication status and redirect if needed
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const protectedPages = ['/dashboard.html', '/edit-user.html'];
  const authPages = ['/login.html', '/register.html', '/index.html', '/'];
  
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  
  // If on a protected page and not logged in
  if (protectedPages.some(page => currentPath.includes(page)) && !currentUser) {
    window.location.href = 'login.html';
  }
  
  // If logged in and on auth page, redirect to dashboard
  if (authPages.some(page => currentPath.includes(page)) && currentUser) {
    window.location.href = 'dashboard.html';
  }
  
  // Display user info if logged in
  const userInfo = document.getElementById('user-info');
  if (userInfo && currentUser) {
    userInfo.innerHTML = `
      <p>Bienvenido, ${currentUser.nombres} ${currentUser.apellidos}</p>
      <p>Tipo de usuario: ${currentUser.tipoUsuario}</p>
      <button onclick="logout()">Cerrar sesión</button>
    `;
  }
});

// Logout function
function logout() {
  sessionStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}