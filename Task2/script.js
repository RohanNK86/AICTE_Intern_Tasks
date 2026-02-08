// DOM Elements
const navMenu = document.querySelector('.nav-menu');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelectorAll('.nav-link');
const registrationForm = document.getElementById('registrationForm');
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');
const todoCount = document.getElementById('todoCount');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');
const imageUrl = document.getElementById('imageUrl');
const imageCaption = document.getElementById('imageCaption');
const addImageBtn = document.getElementById('addImageBtn');
const imageGallery = document.getElementById('imageGallery');
const modal = document.getElementById('successModal');
const modalMessage = document.getElementById('modalMessage');
const closeBtn = document.querySelector('.close');

// State Management
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let images = JSON.parse(localStorage.getItem('galleryImages')) || [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderTodos();
    renderGallery();
    updateTodoCount();
});

// Event Listeners Setup
function setupEventListeners() {
    // Mobile Navigation
    hamburger.addEventListener('click', toggleMobileMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // Form Validation
    registrationForm.addEventListener('submit', handleFormSubmit);

    // Form field validation on blur
    const formInputs = registrationForm.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearError(input));
    });

    // Todo List
    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    clearCompletedBtn.addEventListener('click', clearCompleted);

    // Todo Filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });

    // Image Gallery
    addImageBtn.addEventListener('click', addImage);

    // Modal
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// Mobile Navigation Toggle
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// Smooth Scrolling
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Form Validation
function validateField(field) {
    const fieldName = field.name;
    const fieldValue = field.value.trim();
    const errorMessage = field.parentElement.querySelector('.error-message');

    let isValid = true;
    let errorText = '';

    // Required field validation
    if (field.hasAttribute('required') && !fieldValue) {
        isValid = false;
        errorText = `${getFieldLabel(fieldName)} is required`;
    }

    // Email validation
    if (fieldName === 'email' && fieldValue) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(fieldValue)) {
            isValid = false;
            errorText = 'Please enter a valid email address';
        }
    }

    // Phone validation
    if (fieldName === 'phone' && fieldValue) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(fieldValue) || fieldValue.length < 10) {
            isValid = false;
            errorText = 'Please enter a valid phone number';
        }
    }

    // Age validation
    if (fieldName === 'age' && fieldValue) {
        const age = parseInt(fieldValue);
        if (age < 6 || age > 18) {
            isValid = false;
            errorText = 'Age must be between 6 and 18';
        }
    }

    // Display error or clear it
    if (errorMessage) {
        errorMessage.textContent = errorText;
        field.style.borderColor = isValid ? '#e1e1e1' : '#e74c3c';
    }

    return isValid;
}

function getFieldLabel(fieldName) {
    const labels = {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email Address',
        phone: 'Phone Number',
        age: 'Age',
        campProgram: 'Camp Program'
    };
    return labels[fieldName] || fieldName;
}

function clearError(field) {
    const errorMessage = field.parentElement.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.textContent = '';
        field.style.borderColor = '#e1e1e1';
    }
}

function handleFormSubmit(e) {
    e.preventDefault();

    // Validate all fields
    const formInputs = registrationForm.querySelectorAll('input, select');
    let isFormValid = true;

    formInputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });

    if (isFormValid) {
        // Get form data
        const formData = new FormData(registrationForm);
        const data = Object.fromEntries(formData);

        // Store registration (in real app, this would be sent to server)
        localStorage.setItem('registration', JSON.stringify(data));

        // Show success message
        showModal('Registration successful! We\'ll contact you soon.');

        // Reset form
        registrationForm.reset();

        console.log('Form submitted successfully:', data);
    } else {
        showModal('Please correct the errors in the form', 'error');
    }
}

// Todo List Functions
function addTodo() {
    const todoText = todoInput.value.trim();

    if (!todoText) {
        showModal('Please enter a task', 'error');
        return;
    }

    const todo = {
        id: Date.now(),
        text: todoText,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.unshift(todo);
    saveTodos();
    renderTodos();
    todoInput.value = '';
    updateTodoCount();

    showModal('Task added successfully!');
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateTodoCount();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
    updateTodoCount();

    showModal('Task deleted');
}

function clearCompleted() {
    const completedCount = todos.filter(t => t.completed).length;
    if (completedCount === 0) {
        showModal('No completed tasks to clear', 'error');
        return;
    }

    todos = todos.filter(t => !t.completed);
    saveTodos();
    renderTodos();
    updateTodoCount();

    showModal(`Cleared ${completedCount} completed task(s)`);
}

function renderTodos() {
    const filteredTodos = getFilteredTodos();

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `
            <li class="todo-empty">
                <p>No tasks found. Add your first task above!</p>
            </li>
        `;
        return;
    }

    todoList.innerHTML = filteredTodos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="todo-delete" onclick="deleteTodo(${todo.id})">Delete</button>
        </li>
    `).join('');
}

function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(t => !t.completed);
        case 'completed':
            return todos.filter(t => t.completed);
        default:
            return todos;
    }
}

function updateTodoCount() {
    const activeTodos = todos.filter(t => !t.completed).length;
    todoCount.textContent = `${activeTodos} task${activeTodos !== 1 ? 's' : ''} remaining`;
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Image Gallery Functions
function addImage() {
    const url = imageUrl.value.trim();
    const caption = imageCaption.value.trim();

    if (!url) {
        showModal('Please enter an image URL', 'error');
        return;
    }

    // Validate URL format
    try {
        new URL(url);
    } catch {
        showModal('Please enter a valid URL', 'error');
        return;
    }

    const image = {
        id: Date.now(),
        url: url,
        caption: caption || 'Untitled Image',
        addedAt: new Date().toISOString()
    };

    images.unshift(image);
    saveGallery();
    renderGallery();

    // Clear inputs
    imageUrl.value = '';
    imageCaption.value = '';

    showModal('Image added to gallery!');
}

function deleteImage(id) {
    images = images.filter(img => img.id !== id);
    saveGallery();
    renderGallery();

    showModal('Image removed from gallery');
}

function renderGallery() {
    if (images.length === 0) {
        imageGallery.innerHTML = `
            <div class="gallery-empty">
                <p>No images in gallery yet. Add your first image above!</p>
            </div>
        `;
        return;
    }

    imageGallery.innerHTML = images.map(image => `
        <figure class="image-card">
            <button class="gallery-delete" onclick="deleteImage(${image.id})" aria-label="Delete image">×</button>
            <img src="${image.url}" alt="${escapeHtml(image.caption)}" 
                 onerror="this.src='https://picsum.photos/seed/error${image.id}/400/300.jpg'"
                 loading="lazy" tabindex="0" data-caption="${escapeHtml(image.caption)}">
            <figcaption>
                ${escapeHtml(image.caption)}
                ${!image.caption ? '<span class="caption-muted">Untitled</span>' : ''}
            </figcaption>
        </figure>
    `).join('');
}

function saveGallery() {
    localStorage.setItem('galleryImages', JSON.stringify(images));
}

// Modal Functions
function showModal(message, type = 'success') {
    modalMessage.textContent = message;
    modal.style.display = 'block';

    // Auto close after 3 seconds
    setTimeout(() => {
        closeModal();
    }, 3000);
}

function closeModal() {
    modal.style.display = 'none';
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add some default sample images if gallery is empty
if (images.length === 0) {
    const sampleImages = [
        {
            id: Date.now() + 1,
            url: 'https://picsum.photos/seed/camp1/400/300.jpg',
            caption: 'Summer Camp Activities',
            addedAt: new Date().toISOString()
        },
        {
            id: Date.now() + 2,
            url: 'https://picsum.photos/seed/camp2/400/300.jpg',
            caption: 'Outdoor Adventures',
            addedAt: new Date().toISOString()
        },
        {
            id: Date.now() + 3,
            url: 'https://picsum.photos/seed/camp3/400/300.jpg',
            caption: 'Camp Fire Nights',
            addedAt: new Date().toISOString()
        }
    ];

    images = sampleImages;
    saveGallery();
}

// Add some default sample todos if todo list is empty
if (todos.length === 0) {
    const sampleTodos = [
        {
            id: Date.now() + 4,
            text: 'Pack sleeping bag',
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 5,
            text: 'Bring sunscreen',
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: Date.now() + 6,
            text: 'Register for activities',
            completed: true,
            createdAt: new Date().toISOString()
        }
    ];

    todos = sampleTodos;
    saveTodos();
}

// Gallery Lightbox System
(function () {
    const gallery = document.getElementById('imageGallery');

    // Delegated click & keyboard event to open lightbox
    const modal = document.getElementById('lightboxModal');
    const modalImg = modal.querySelector('img');
    const modalCaption = modal.querySelector('.lightbox-caption');
    const closeBtn = modal.querySelector('.lightbox-close');

    function openLightbox(src, caption) {
        modalImg.src = src;
        modalImg.alt = caption || '';
        modalCaption.textContent = caption || '';
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function closeLightbox() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        modalImg.src = '';
        document.body.style.overflow = '';
    }

    gallery.addEventListener('click', function (e) {
        const img = e.target.closest('img');
        if (!img) return;
        openLightbox(img.src, img.dataset.caption || img.alt);
    });

    gallery.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.tagName === 'IMG') {
            e.preventDefault();
            openLightbox(e.target.src, e.target.dataset.caption || e.target.alt);
        }
    });

    // Close lightbox events
    modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target === closeBtn) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeLightbox();
    });
})();