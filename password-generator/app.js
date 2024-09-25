(() => {
	// Constants
	const STORAGE_KEY = 'password-generator';
	const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
	const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const allNumbers = '0123456789';
	const allSymbols = '~!@#$%^&"*';

	// DOM Elements
	const elInstallCont = document.querySelector('.install-promotion-container');
	const elNum = document.querySelector('#include-numbers');
	const elLc = document.querySelector('#include-lowercase');
	const elUc = document.querySelector('#include-uppercase');
	const elSC = document.querySelector('#include-special-chars');
	const elPass = document.querySelector('.gen-password');
	const elWordPass = document.querySelector('.gen-password-word');
	const inputSlider = document.querySelector('#input-slider');
	const elSliderValue = document.querySelector('#sliderValue');
	const elCopyBtn = document.querySelector('#btn-copy');
	const elGenBtn = document.querySelector('#btn-generate');
	const elRandPassRadio = document.querySelector('#random-password');
	const elRandPassCont = document.querySelector('.random-password-container');
	const inputSliderWord = document.querySelector('#input-slider-word');
	const elSliderWordValue = document.querySelector('#sliderWordValue');
	const elWordPassRadio = document.querySelector('#word-password');
	const elWordPassCont = document.querySelector('.word-password-container');
	const elGenWordBtn = document.querySelector('#btn-generate-word');
	const elCopyWordBtn = document.querySelector('#btn-copy-word');
	const elInstallBtn = document.querySelector('#btn-install-app');

	let deferredPrompt;

	// Local Storage Helpers
	const setLocalStorage = (key, value) => localStorage.setItem(key, value);
	const getLocalStorage = (key) => localStorage.getItem(key);
	const removeLocalStorage = (key) => localStorage.removeItem(key);

	// Configuration Helpers
	const setupDefaultConfig = () => {
		if (!getLocalStorage(STORAGE_KEY)) {
			// Set default configuration if not present in localStorage
			setLocalStorage(STORAGE_KEY, JSON.stringify({
				numbers: true,
				lowercase: true,
				uppercase: true,
				specialChars: true,
				randomPassword: true,
				wordPassword: false,
				randomPasswordLength: 12,
				wordPasswordLength: 3
			}));
		} else {
			// Load stored config and apply to UI elements
			const config = JSON.parse(getLocalStorage(STORAGE_KEY));
			elNum.checked = config.numbers;
			elLc.checked = config.lowercase;
			elUc.checked = config.uppercase;
			elSC.checked = config.specialChars;
			inputSlider.value = config.randomPasswordLength;
			elSliderValue.innerText = config.randomPasswordLength;
			inputSliderWord.value = config.wordPasswordLength;
			elSliderWordValue.innerText = config.wordPasswordLength;
	
			// Set radio buttons for password type
			if (config.randomPassword) {
				elRandPassRadio.checked = true;
				handlePasswordTypeChange({ target: elRandPassRadio });
			} else if (config.wordPassword) {
				elWordPassRadio.checked = true;
				handlePasswordTypeChange({ target: elWordPassRadio });
			}
		}
	};

	const updateConfig = () => {
		const config = {
			numbers: elNum.checked,
			lowercase: elLc.checked,
			uppercase: elUc.checked,
			specialChars: elSC.checked,
			randomPassword: elRandPassRadio.checked,
			wordPassword: elWordPassRadio.checked,
			randomPasswordLength: inputSlider.value,
			wordPasswordLength: inputSliderWord.value
		}
		setLocalStorage(STORAGE_KEY, JSON.stringify(config));
	}

	// PWA Install Prompt Handlers
	const showInstallAppSection = () => {
		elInstallCont.classList.remove('hidden');
	}

	const hideInstallAppSection = () => {
		elInstallCont.classList.add('hidden');
	}

	// Service Worker Registration
	const registerServiceWorker = () => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('sw.js').then(
				(reg) => console.log('Service worker registration successful:', reg),
				(err) => console.error(`Service worker registration failed: ${err}`)
			);
		} else {
			console.error('Service workers are not supported.');
		}
	}

	// Resize Window Logic
	const handleWindowResize = () => {
		const isBrowser = matchMedia("(display-mode: browser)").matches;
		if (!isBrowser) {
			window.resizeTo(412, 915);
		}
	};

	// Password Type Toggle
	const handlePasswordTypeChange = (e) => {
		if (e.target.id == 'word-password') {
			elRandPassCont.classList.add('hidden');
			elWordPassCont.classList.remove('hidden');
		} else {
			elRandPassCont.classList.remove('hidden');
			elWordPassCont.classList.add('hidden');
		}
	}

	// Password Generation Logic
	const generateRandomPassword = () => {
		let allChars = '';
		let password = '';

		allChars += elNum.checked ? allNumbers : '';
		allChars += elLc.checked ? lowerChars : '';
		allChars += elUc.checked ? upperChars : '';
		allChars += elSC.checked ? allSymbols : '';

		for (let i = 0; i < inputSlider.value; i++) {
			password += allChars.charAt(Math.floor(Math.random() * allChars.length));
		}

		elCopyBtn.innerText = 'Copier';
		elCopyBtn.classList.replace('btn-success', 'btn-primary');
		elPass.innerText = password;
	}

	const generateWordPassword = () => {
		let password = '';
		for (let i = 0; i < inputSliderWord.value; i++) {
			password += words[Math.floor(Math.random() * words.length)];
			password += i != inputSliderWord.value - 1 ? '-' : '';
		}

		elCopyWordBtn.innerText = 'Copier';
		elCopyWordBtn.classList.replace('btn-success', 'btn-primary');
		elWordPass.innerText = password;
	}

	// Clipboard Copy Handlers
	const copyPasswordToClipboard = (passwordElement, copyBtn) => {
		if (passwordElement.innerText) {
			navigator.clipboard.writeText(passwordElement.innerText);
			copyBtn.innerText = 'Copié!';
			copyBtn.classList.replace('btn-primary', 'btn-success');

			setTimeout(() => {
				copyBtn.innerText = 'Copier';
				copyBtn.classList.replace('btn-success', 'btn-primary');
			}, 3000)
		}
	}

	const copyPassword = () => copyPasswordToClipboard(elPass, elCopyBtn);
	const copyWordPassword = () => copyPasswordToClipboard(elWordPass, elCopyWordBtn);

	// Event Listeners
	const setupEventListeners = () => {
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			showInstallAppSection();
		});

		window.addEventListener('appinstalled', (e) => {
			hideInstallAppSection();
			deferredPrompt = null;
		})

		elNum.addEventListener('change', updateConfig);
		elLc.addEventListener('change', updateConfig);
		elUc.addEventListener('change', updateConfig);
		elSC.addEventListener('change', updateConfig);
		inputSlider.addEventListener('input', updateConfig);
		inputSliderWord.addEventListener('input', updateConfig);
		elRandPassRadio.addEventListener('click', updateConfig);
		elWordPassRadio.addEventListener('click', updateConfig);

		elGenBtn.addEventListener('click', generateRandomPassword);
		elCopyBtn.addEventListener('click', copyPassword);

		elGenWordBtn.addEventListener('click', generateWordPassword);
		elCopyWordBtn.addEventListener('click', copyWordPassword);

		// Check if working with change event, else switch to click event
		elRandPassRadio.addEventListener('change', handlePasswordTypeChange);
		elWordPassRadio.addEventListener('change', handlePasswordTypeChange);

		inputSlider.addEventListener('input', () => {
			elSliderValue.innerText = inputSlider.value;
		});

		inputSliderWord.addEventListener('input', () => {
			elSliderWordValue.innerText = inputSliderWord.value;
		});

		elInstallBtn.addEventListener('click', async () => {
			deferredPrompt.prompt();
			await deferredPrompt.userChoice;
			deferredPrompt = null;
		});
	}

	const init = () => {
		registerServiceWorker();
		handleWindowResize();
		setupDefaultConfig();
		setupEventListeners();
	}

	// DOM Ready
	document.addEventListener('DOMContentLoaded', init);
})()