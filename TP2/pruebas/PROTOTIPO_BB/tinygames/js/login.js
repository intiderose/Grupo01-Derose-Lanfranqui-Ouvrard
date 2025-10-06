document.addEventListener('DOMContentLoaded', () => {
    // Toggle password visibility
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('login-pass');

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const eyeOpen = togglePasswordBtn.querySelectorAll('.eye-open');
            const eyeClosed = togglePasswordBtn.querySelector('.eye-closed');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeOpen.forEach(el => el.style.display = 'none');
                eyeClosed.style.display = 'block';
                togglePasswordBtn.setAttribute('aria-label', 'Ocultar contraseña');
            } else {
                passwordInput.type = 'password';
                eyeOpen.forEach(el => el.style.display = 'block');
                eyeClosed.style.display = 'none';
                togglePasswordBtn.setAttribute('aria-label', 'Mostrar contraseña');
            }
        });
    }

    // Form validation function
    function showError(input) {
        input.classList.add('error');
        setTimeout(() => {
            input.classList.remove('error');
        }, 400);
    }

    const emailInput = document.getElementById('login-email');
    const form = document.querySelector('.login-box form');

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            let isFormValid = true;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            // Limpiar errores previos para re-validar
            emailInput.classList.remove('error');
            passwordInput.classList.remove('error');

            // Validar campo de email
            if (!emailInput.value || !emailRegex.test(emailInput.value)) {
                showError(emailInput);
                isFormValid = false;
            }

            // Validar campo de contraseña
            if (passwordInput.value.length === 0) {
                showError(passwordInput);
                isFormValid = false;
            }

            if (isFormValid) {
                // Si el formulario es válido, redirigir
                window.location.href = 'index.html';
            }
        });
    }
});
