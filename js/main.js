// Fichier principal
console.log('Portfolio Artist Name - Galerie chargée');

// Parallax init extracted (conditional) — for .biography-hero or .page-biography body
(function() {
	// Check if we should enable parallax: either .biography-hero exists, or page-biography is set
	const bioHero = document.querySelector('.biography-hero');
	const isPageBio = document.body.classList.contains('page-biography');
	
	if (!bioHero && !isPageBio) return;
	if (window.__GRF_PARALLAX_INIT) return;
	window.__GRF_PARALLAX_INIT = true;

	let ticking = false;

	function updateParallax() {
		// Target both .biography-hero and .page-biography .hero
		const hero = document.querySelector('.biography-hero') || 
		             (isPageBio && document.querySelector('.hero'));
		if (!hero) return;
		
		const rect = hero.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (viewportHeight * 2)));
		const backgroundY = progress * 60;
		
		if (window.scrollY > 50) {
			hero.classList.add('parallax-active');
			hero.style.backgroundPosition = `center ${backgroundY}%`;
		} else {
			hero.classList.remove('parallax-active');
			hero.style.backgroundPosition = 'center top';
		}
		ticking = false;
	}

	function onScroll() {
		if (!ticking) {
			requestAnimationFrame(updateParallax);
			ticking = true;
		}
	}

	window.addEventListener('scroll', onScroll, { passive: true });
	// initial update
	requestAnimationFrame(updateParallax);
	console.log('✅ Parallax initialized on this page');
})();

/* ===== TYPEWRITER (conditional) ===== */
(function() {
	if (window.__GRF_TYPEWRITER_INIT) return;
	// Only initialize when there's an element with class .typewriter-text
	const el = document.querySelector('.typewriter-text');
	if (!el) return;
	window.__GRF_TYPEWRITER_INIT = true;

	const STATE = {
		isTyping: false,
		typingInterval: null
	};

	function startTypewriter(element, text, onComplete) {
		if (!element || STATE.isTyping) return;
		STATE.isTyping = true;
		element.textContent = '';
		element.classList.remove('completed');

		let index = 0;
		const total = text.length;

		function typeNext() {
			if (index >= total || !STATE.isTyping) {
				STATE.isTyping = false;
				element.classList.add('completed');
				if (onComplete) onComplete();
				return;
			}
			const ch = text.charAt(index);
			element.textContent = text.substring(0, index + 1);
			index++;

			let delay = 35;
			if (ch === '.') delay = 300;
			else if (ch === ',') delay = 150;
			else if (ch === '\n') delay = 400;

			STATE.typingInterval = setTimeout(typeNext, delay);
		}

		typeNext();
	}

	function skipTypewriter() {
		if (!STATE.isTyping) return;
		STATE.isTyping = false;
		if (STATE.typingInterval) {
			clearTimeout(STATE.typingInterval);
			STATE.typingInterval = null;
		}
		const elAll = document.querySelectorAll('.typewriter-text');
		elAll.forEach(el => {
			const full = el.getAttribute('data-text') || el.dataset.text || el.textContent;
			el.textContent = full;
			el.classList.add('completed');
		});
	}

	// Auto-start on DOMContentLoaded
	document.addEventListener('DOMContentLoaded', function() {
		const targets = document.querySelectorAll('.typewriter-text');
		targets.forEach(target => {
			const txt = target.getAttribute('data-text') || target.textContent || '';
			// store full text in data-text
			target.setAttribute('data-text', txt.trim());
			// clear initial content
			target.textContent = '';
			// start typing after small delay
			setTimeout(() => startTypewriter(target, target.getAttribute('data-text')), 500);
		});

		// Bind skip button if present
		const skipBtn = document.getElementById('skip-animation-btn');
		if (skipBtn) skipBtn.addEventListener('click', skipTypewriter);
	});
})();
