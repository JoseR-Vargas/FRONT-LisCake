/**
 * LisCake - JavaScript Functionality
 * Siguiendo principios SOLID: SRP, Open/Closed, DRY, YAGNI
 */

// === CONFIGURACIÓN ===
const CONFIG = {
	whatsappNumber: '59899123456',
	baseWhatsAppURL: 'https://wa.me/'
};

// === HELPERS (SRP: Single Responsibility Principle) ===

/**
 * Validador de formularios - SRP: Solo valida
 */
class FormValidator {
	static validateName(name) {
		const trimmedName = name.trim();
		if (!trimmedName) {
			return { isValid: false, message: 'El nombre es obligatorio' };
		}
		if (trimmedName.length < 2) {
			return { isValid: false, message: 'El nombre debe tener al menos 2 caracteres' };
		}
		return { isValid: true, message: '' };
	}

	static validatePhone(phone) {
		const cleanPhone = phone.replace(/\D/g, '');
		if (!cleanPhone) {
			return { isValid: false, message: 'El teléfono es obligatorio' };
		}
		if (cleanPhone.length < 8 || cleanPhone.length > 9) {
			return { isValid: false, message: 'Ingresá un teléfono válido (8-9 dígitos)' };
		}
		return { isValid: true, message: 'Teléfono válido' };
	}
}

/**
 * Constructor de mensajes WhatsApp - SRP: Solo construye URLs
 */
class WhatsAppMessageBuilder {
	static buildMessage(formData) {
		const { nombre, telefono, opcion, mensaje } = formData;
		
		let messageText = `¡Hola! Soy ${nombre}\n`;
		messageText += `Mi teléfono: ${telefono}\n`;
		messageText += `Modalidad: ${opcion === 'retiro' ? 'Retiro en local' : 'Envío a domicilio'}\n`;
		
		if (mensaje.trim()) {
			messageText += `\nMensaje: ${mensaje}`;
		}
		
		messageText += '\n\n¡Gracias!';
		
		return messageText;
	}

	static buildWhatsAppURL(message) {
		const encodedMessage = encodeURIComponent(message);
		return `${CONFIG.baseWhatsAppURL}${CONFIG.whatsappNumber}?text=${encodedMessage}`;
	}
}

/**
 * Manejador de UI - SRP: Solo maneja la interfaz
 */
class UIHandler {
	static showFieldError(fieldId, message) {
		const helper = document.getElementById(`${fieldId}Helper`);
		if (helper) {
			helper.textContent = message;
			helper.className = 'form-helper error';
		}
	}

	static showFieldSuccess(fieldId, message) {
		const helper = document.getElementById(`${fieldId}Helper`);
		if (helper) {
			helper.textContent = message;
			helper.className = 'form-helper success';
		}
	}

	static clearFieldMessage(fieldId) {
		const helper = document.getElementById(`${fieldId}Helper`);
		if (helper) {
			helper.textContent = '';
			helper.className = 'form-helper';
		}
	}

	static formatPhoneInput(input) {
		// Permitir solo números
		input.addEventListener('input', (e) => {
			e.target.value = e.target.value.replace(/\D/g, '');
		});
	}
}

// === CONTROLADOR PRINCIPAL (Open/Closed: Abierto para extensión) ===

/**
 * Controlador principal del formulario - Coordina todas las operaciones
 */
class ContactFormController {
	constructor(formId) {
		this.form = document.getElementById(formId);
		this.isFormValid = false;
		this.init();
	}

	init() {
		if (!this.form) {
			console.error('Formulario no encontrado');
			return;
		}

		this.setupEventListeners();
		this.setupPhoneInput();
	}

	setupEventListeners() {
		// Validación en tiempo real
		const nameInput = this.form.querySelector('#nombre');
		const phoneInput = this.form.querySelector('#telefono');
		
		if (nameInput) {
			nameInput.addEventListener('blur', () => this.validateField('nombre'));
			nameInput.addEventListener('input', () => UIHandler.clearFieldMessage('nombre'));
		}

		if (phoneInput) {
			phoneInput.addEventListener('blur', () => this.validateField('telefono'));
			phoneInput.addEventListener('input', () => UIHandler.clearFieldMessage('telefono'));
		}

		// Submit del formulario
		this.form.addEventListener('submit', (e) => this.handleSubmit(e));
	}

	setupPhoneInput() {
		const phoneInput = this.form.querySelector('#telefono');
		if (phoneInput) {
			UIHandler.formatPhoneInput(phoneInput);
		}
	}

	validateField(fieldName) {
		const input = this.form.querySelector(`#${fieldName}`);
		if (!input) return false;

		let validation;
		
		switch (fieldName) {
			case 'nombre':
				validation = FormValidator.validateName(input.value);
				break;
			case 'telefono':
				validation = FormValidator.validatePhone(input.value);
				break;
			default:
				return true;
		}

		if (validation.isValid) {
			UIHandler.showFieldSuccess(fieldName, validation.message);
		} else {
			UIHandler.showFieldError(fieldName, validation.message);
		}

		return validation.isValid;
	}

	validateForm() {
		const isNameValid = this.validateField('nombre');
		const isPhoneValid = this.validateField('telefono');
		
		this.isFormValid = isNameValid && isPhoneValid;
		return this.isFormValid;
	}

	getFormData() {
		const formData = new FormData(this.form);
		return {
			nombre: formData.get('nombre') || '',
			telefono: formData.get('telefono') || '',
			opcion: formData.get('opcion') || 'retiro',
			mensaje: formData.get('mensaje') || ''
		};
	}

	handleSubmit(event) {
		event.preventDefault();
		
		if (!this.validateForm()) {
			return;
		}

		const formData = this.getFormData();
		const message = WhatsAppMessageBuilder.buildMessage(formData);
		const whatsappURL = WhatsAppMessageBuilder.buildWhatsAppURL(message);
		
		// Abrir WhatsApp en nueva ventana
		window.open(whatsappURL, '_blank', 'noopener,noreferrer');
		
		// Opcional: Reset del formulario después del envío
		setTimeout(() => {
			this.resetForm();
		}, 1000);
	}

	resetForm() {
		this.form.reset();
		
		// Limpiar mensajes de validación
		['nombre', 'telefono'].forEach(field => {
			UIHandler.clearFieldMessage(field);
		});
	}
}

// === NAVEGACIÓN SUAVE ===

/**
 * Manejador de navegación - SRP: Solo maneja scroll suave
 */
class SmoothNavigation {
	static init() {
		const navLinks = document.querySelectorAll('a[href^="#"]');
		
		navLinks.forEach(link => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				
				const targetId = link.getAttribute('href').substring(1);
				const targetElement = document.getElementById(targetId);
				
				if (targetElement) {
					const headerHeight = document.querySelector('.header').offsetHeight;
					const targetPosition = targetElement.offsetTop - headerHeight - 20;
					
					window.scrollTo({
						top: targetPosition,
						behavior: 'smooth'
					});
				}
			});
		});
	}
}

// === INICIALIZACIÓN ===

/**
 * Inicializador de la aplicación - Punto de entrada único
 */
class App {
	static init() {
		// Esperar a que el DOM esté listo
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => this.setup());
		} else {
			this.setup();
		}
	}

	static setup() {
		try {
			// Inicializar controlador del formulario
			new ContactFormController('contactForm');
			
			// Inicializar navegación suave
			SmoothNavigation.init();
			
			console.log('LisCake app inicializada correctamente');
		} catch (error) {
			console.error('Error al inicializar la aplicación:', error);
		}
	}
}

// === PUNTO DE ENTRADA ===
App.init();
