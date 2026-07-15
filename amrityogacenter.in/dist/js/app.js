/*
=========================================
AMRIT YOGA CENTER - INTERACTIVE SCRIPTING V3
=========================================
*/

// Premium avatar generation system
function getAvatarFallbackHTML(name, customClass = "testimonial-avatar") {
  const cleanName = (name || "Anonymous").trim();
  const initials = cleanName
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
    
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  const bg = `hsl(${h}, 70%, 40%)`;
  
  return `<div class="${customClass} initials-avatar" style="background-color: ${bg}; display: inline-flex; align-items: center; justify-content: center; color: #ffffff; font-weight: bold; font-size: 1.1rem; text-transform: uppercase; user-select: none; border-radius: 50%; font-family: 'Outfit', sans-serif;">${initials}</div>`;
}

function getAvatarHTML(avatarUrl, name, customClass = "testimonial-avatar") {
  if (avatarUrl) {
    const escapedName = (name || "Anonymous").replace(/'/g, "\\'");
    return `<img src="${avatarUrl}" alt="${name}" class="${customClass}" onerror="this.outerHTML=window.getAvatarFallbackHTML('${escapedName}', '${customClass}')">`;
  }
  return getAvatarFallbackHTML(name, customClass);
}

window.getAvatarFallbackHTML = getAvatarFallbackHTML;
window.getAvatarHTML = getAvatarHTML;

document.addEventListener('DOMContentLoaded', async () => {
  // Register GSAP ScrollTrigger
  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch (e) {
    console.warn("GSAP ScrollTrigger registration skipped:", e);
  }
  
  // Initialize Theme Switcher immediately to apply saved theme preferences without delay
  try {
    initThemeSwitcher();
    console.log("Successfully initialized ThemeSwitcher immediately");
  } catch (e) {
    console.error("Error initializing ThemeSwitcher immediately:", e);
  }
  
  // 1. DYNAMIC DATA RENDERING ENGINE (POPULATE DOM)
  try {
    await renderDynamicContent();
  } catch (e) {
    console.error("FATAL: Failed to render dynamic content from database:", e);
  }
  
  // 2. INITIALIZE INTERACTIVE UI TRIGGERS (AFTER DOM INJECTION)
  const initializers = [
    { name: "Header", fn: initHeader },
    { name: "CustomCursor", fn: initCustomCursor },
    { name: "TiltEffects", fn: initTiltEffects },
    { name: "ScrollAnimations", fn: initScrollAnimations },
    { name: "StatsCounter", fn: initStatsCounter },
    { name: "CircularInfographic", fn: initCircularInfographic },
    { name: "GalleryFilterAndLightbox", fn: initGalleryFilterAndLightbox },
    { name: "TestimonialsSlider", fn: initTestimonialsSlider },
    { name: "ReviewSubmissionSystem", fn: initReviewSubmissionSystem },
    { name: "TrialBookingSystem", fn: initTrialBookingSystem },
    { name: "MobileNavbarAutoHide", fn: initMobileNavbarAutoHide }
  ];

  initializers.forEach(init => {
    try {
      init.fn();
      console.log(`Successfully initialized: ${init.name}`);
    } catch (e) {
      console.error(`Error initializing ${init.name}:`, e);
    }
  });
});

/* 
=========================================
0. POPULATE TESTIMONIALS SCROLL GRID
=========================================
*/
function populateTestimonialsGrid(reviews) {
  const container = document.getElementById("testimonials-grid-container");
  if (!container) return;
  
  container.innerHTML = "";
  
  const approvedReviews = (reviews || []).filter(r => r.approved !== false);
  
  if (!approvedReviews.length) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: var(--color-text-secondary); padding: 40px;">
        <p>No verified reviews found. Click 'Share Your Experience' below to submit a review.</p>
      </div>
    `;
    return;
  }
  
  const width = window.innerWidth;
  let numCols = 3;
  if (width <= 768) {
    numCols = 1;
  } else if (width <= 991) {
    numCols = 2;
  }
  
  // Distribute reviews round-robin across columns
  const colsData = Array.from({ length: numCols }, () => []);
  approvedReviews.forEach((r, idx) => {
    colsData[idx % numCols].push(r);
  });
  
  // Render columns
  colsData.forEach((colReviews, colIdx) => {
    if (colReviews.length === 0) return;
    
    const colDiv = document.createElement("div");
    colDiv.className = `testimonials-column col-${colIdx + 1}`;
    
    const innerDiv = document.createElement("div");
    // Alternate direction: first and third scroll up, second scrolls down
    const directionClass = (colIdx === 1) ? "scroll-down" : "scroll-up";
    innerDiv.className = `testimonials-column-inner ${directionClass}`;
    
    // Set different animation durations/speeds
    const speeds = [30, 38, 26];
    const speed = speeds[colIdx % speeds.length];
    innerDiv.style.animationDuration = `${speed}s`;
    
    // Build the list of cards for this column
    // We want at least 4 cards before duplicating, so we repeat if necessary
    let displayReviews = [...colReviews];
    while (displayReviews.length < 4) {
      displayReviews = displayReviews.concat(colReviews);
    }
    
    // Duplicate the final set once for seamless looping
    const finalSet = [...displayReviews, ...displayReviews];
    
    finalSet.forEach(r => {
      const stars = '<i class="fa-solid fa-star"></i>'.repeat(r.rating) + '<i class="fa-regular fa-star"></i>'.repeat(5 - r.rating);
      const card = document.createElement("div");
      card.className = "testimonial-card glass-panel";
      
      const isVerified = (r.verified !== false);
      const verifiedBadge = isVerified ? `<p><i class="fa-solid fa-circle-check" style="color:var(--color-saffron); margin-right:4px;"></i> Verified Practitioner</p>` : '';
      
      card.innerHTML = `
        <i class="fa-solid fa-quote-left quote-icon"></i>
        <div class="testimonial-rating">${stars}</div>
        <p class="testimonial-text">"${r.text}"</p>
        <div class="testimonial-user">
          ${window.getAvatarHTML(r.avatar_url, r.name, "testimonial-avatar")}
          <div class="testimonial-info">
            <h4>${r.name}</h4>
            ${verifiedBadge}
          </div>
        </div>
      `;
      innerDiv.appendChild(card);
    });
    
    colDiv.appendChild(innerDiv);
    container.appendChild(colDiv);
  });
}

async function renderDynamicContent() {
  console.log("Starting dynamic content rendering...");
  
  // Fetch data records from dbService with robust fallbacks
  let hp = null;
  try { hp = await dbService.getHomepage(); } catch(e) { console.error("Error fetching homepage:", e); }
  if (!hp) hp = (window.getLocalDB ? window.getLocalDB().homepage : null) || (window.DEFAULT_DATABASE ? window.DEFAULT_DATABASE.homepage : {});

  let coach = null;
  try { coach = await dbService.getCoach(); } catch(e) { console.error("Error fetching coach:", e); }
  if (!coach) coach = (window.getLocalDB ? window.getLocalDB().coach : null) || (window.DEFAULT_DATABASE ? window.DEFAULT_DATABASE.coach : {});

  let services = null;
  try { services = await dbService.getServices(); } catch(e) { console.error("Error fetching services:", e); }
  if (!services || !Array.isArray(services)) services = (window.getLocalDB ? window.getLocalDB().services : null) || (window.DEFAULT_DATABASE ? window.DEFAULT_DATABASE.services : []);

  let timeline = null;
  try { timeline = await dbService.getTimeline(); } catch(e) { console.error("Error fetching timeline:", e); }
  if (!timeline || !Array.isArray(timeline)) timeline = (window.getLocalDB ? window.getLocalDB().timeline : null) || (window.DEFAULT_DATABASE ? window.DEFAULT_DATABASE.timeline : []);

  let gallery = null;
  try { gallery = await dbService.getGallery(); } catch(e) { console.error("Error fetching gallery:", e); }
  if (!gallery || !Array.isArray(gallery)) gallery = (window.getLocalDB ? window.getLocalDB().gallery : null) || (window.DEFAULT_DATABASE ? window.DEFAULT_DATABASE.gallery : []);

  let reviews = null;
  try { reviews = await dbService.getReviews(); } catch(e) { console.error("Error fetching reviews:", e); }
  if (!reviews || !Array.isArray(reviews)) reviews = (window.getLocalDB ? window.getLocalDB().reviews : null) || (window.DEFAULT_DATABASE ? window.DEFAULT_DATABASE.reviews : []);
  
  // A. POPULATE HOMEPAGE INFORMATION WIDGETS
  // Navbar WhatsApp CTA (Desktop: WhatsApp Web, Mobile: WhatsApp App)
  const navCta = document.getElementById("nav-cta-btn");
  if (navCta) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const waPhone = "917742658593";
    const waText = encodeURIComponent("Namaste Suresh Ji, I would like to know more about Amrit Yoga Center™ and book a free trial class.");
    if (isMobile) {
      navCta.href = `https://wa.me/${waPhone}?text=${waText}`;
    } else {
      navCta.href = `https://web.whatsapp.com/send?phone=${waPhone}&text=${waText}`;
    }
  }
  
  // Hero CTA buttons
  const heroCall = document.getElementById("hero-call-btn");
  if (heroCall) heroCall.href = `tel:${hp.phone_primary}`;
  
  // Contact panel elements
  const contactAddress = document.getElementById("contact-address-text");
  if (contactAddress) contactAddress.innerHTML = hp.address.replace(/,/g, ",<br>");
  const contactPhone = document.getElementById("contact-phone-primary");
  if (contactPhone) {
    contactPhone.href = `tel:${hp.phone_primary}`;
    contactPhone.textContent = `+91 ${hp.phone_primary}`;
  }
  const contactSupport = document.getElementById("contact-phone-support");
  if (contactSupport) {
    contactSupport.href = `tel:${hp.phone_support}`;
    contactSupport.textContent = `+91 ${hp.phone_support}`;
  }
  
  // Parse social links JSON from hp.insta
  let socialData = {
    insta_username: "@amrityogacenter",
    insta_url: "https://instagram.com/amrityogacenter",
    youtube_name: "@amrityogacenter",
    youtube_url: "https://youtube.com/@amrityogacenter?si=tCfleC7CalYBflIM"
  };
  if (hp.insta && hp.insta.trim().startsWith('{')) {
    try {
      socialData = JSON.parse(hp.insta);
    } catch(e) {
      console.error("Error parsing hp.insta:", e);
    }
  } else if (hp.insta) {
    // Fallback
    socialData.insta_username = hp.insta;
    socialData.insta_url = `https://instagram.com/${hp.insta.replace('@', '')}`;
  }
  
  // Inject Google Analytics (GA4) and Google Search Console verification dynamically if present in config
  if (socialData.ga_measurement_id && socialData.ga_measurement_id.trim()) {
    const gaId = socialData.ga_measurement_id.trim();
    const scriptTag = document.createElement('script');
    scriptTag.async = true;
    scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(scriptTag);
    
    const inlineScript = document.createElement('script');
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
    document.head.appendChild(inlineScript);
    console.log(`Dynamic GA4 successfully injected: ${gaId}`);
  }
  
  if (socialData.gsc_verification_id && socialData.gsc_verification_id.trim()) {
    const gscId = socialData.gsc_verification_id.trim();
    const metaTag = document.createElement('meta');
    metaTag.name = 'google-site-verification';
    metaTag.content = gscId;
    document.head.appendChild(metaTag);
    console.log(`Dynamic Google Search Console verification injected.`);
  }

  const contactInsta = document.getElementById("contact-insta-handle");
  if (contactInsta) {
    contactInsta.textContent = socialData.insta_username;
    contactInsta.href = socialData.insta_url;
  }
  const contactYoutube = document.getElementById("contact-youtube-handle");
  if (contactYoutube) {
    contactYoutube.textContent = socialData.youtube_name;
    contactYoutube.href = socialData.youtube_url;
  }
  
  // Contact button triggers
  const btnCall = document.getElementById("contact-btn-call-trigger");
  if (btnCall) btnCall.href = `tel:${hp.phone_primary}`;
  const btnWa = document.getElementById("contact-btn-wa-trigger");
  if (btnWa) btnWa.href = `https://wa.me/91${hp.phone_primary}?text=Namaste! I am inquiring about admissions at Amrit Yoga Center™.`;
  const btnInsta = document.getElementById("contact-btn-insta-trigger");
  if (btnInsta) btnInsta.href = socialData.insta_url;
  const btnYoutube = document.getElementById("contact-btn-youtube-trigger");
  if (btnYoutube) btnYoutube.href = socialData.youtube_url;
  
  // Set dynamic map directions link
  const btnMaps = document.querySelector(".contact-btn-maps");
  if (btnMaps) btnMaps.href = hp.map_link || "https://share.google/5AmTYJHojblGNDEIl";
  
  // Footer elements
  const footerTagline = document.getElementById("footer-tagline-text");
  if (footerTagline) footerTagline.textContent = hp.tagline;
  const footerInstaIcon = document.getElementById("footer-insta-icon");
  if (footerInstaIcon) footerInstaIcon.href = socialData.insta_url;
  const footerYoutubeIcon = document.getElementById("footer-youtube-icon");
  if (footerYoutubeIcon) footerYoutubeIcon.href = socialData.youtube_url;
  const footerWaIcon = document.getElementById("footer-wa-icon");
  if (footerWaIcon) footerWaIcon.href = `https://wa.me/91${hp.phone_primary}`;
  const footerCallIcon = document.getElementById("footer-call-icon");
  if (footerCallIcon) footerCallIcon.href = `tel:${hp.phone_primary}`;
  
  const footerAddress = document.getElementById("footer-address-text");
  if (footerAddress) footerAddress.textContent = hp.address;
  const footerPhone = document.getElementById("footer-phone-text");
  if (footerPhone) {
    footerPhone.href = `tel:${hp.phone_primary}`;
    footerPhone.textContent = `+91 ${hp.phone_primary}`;
  }
  const footerEmail = document.getElementById("footer-email-text");
  if (footerEmail) footerEmail.textContent = hp.email;
  const footerInstaText = document.getElementById("footer-insta-text");
  if (footerInstaText) {
    footerInstaText.textContent = socialData.insta_username;
    footerInstaText.href = socialData.insta_url;
  }
  
  // H. POPULATE ACHIEVEMENTS STATS & HIGHLIGHTS LIVE
  const statMedals = document.getElementById("stat-medals");
  if (statMedals) statMedals.setAttribute("data-target", hp.stat_medals || "15");
  const statStudents = document.getElementById("stat-students");
  if (statStudents) statStudents.setAttribute("data-target", hp.stat_students || "2000");
  const statYears = document.getElementById("stat-years");
  if (statYears) statYears.setAttribute("data-target", hp.stat_years || "12");
  const statCompetitors = document.getElementById("stat-competitors");
  if (statCompetitors) statCompetitors.setAttribute("data-target", hp.stat_competitors || "150");

  const highlightTitle1 = document.getElementById("highlight-title-1");
  if (highlightTitle1) highlightTitle1.textContent = hp.highlight_title_1 || "";
  const highlightDesc1 = document.getElementById("highlight-desc-1");
  if (highlightDesc1) highlightDesc1.textContent = hp.highlight_desc_1 || "";
  const highlightTitle2 = document.getElementById("highlight-title-2");
  if (highlightTitle2) highlightTitle2.textContent = hp.highlight_title_2 || "";
  const highlightDesc2 = document.getElementById("highlight-desc-2");
  if (highlightDesc2) highlightDesc2.textContent = hp.highlight_desc_2 || "";
  
  // Dynamic About / Why Choose image and vertical alignment
  const elAboutImg = document.getElementById("about-image");
  if (elAboutImg) {
    if (hp.about_image) elAboutImg.src = hp.about_image;
    if (hp.about_image_align) {
      elAboutImg.style.objectPosition = `center ${hp.about_image_align}`;
    } else {
      elAboutImg.style.objectPosition = "center center";
    }
  }
  
  // B. POPULATE COACH DETAILS & TIMELINE
  const elCoachName = document.getElementById("coach-title-name");
  if (elCoachName) elCoachName.textContent = `Meet Head Coach ${coach.name}`;
  const elCoachSub = document.getElementById("coach-sub-title");
  if (elCoachSub) elCoachSub.textContent = coach.title;
  const elCoachBio = document.getElementById("coach-bio-lead");
  if (elCoachBio) elCoachBio.innerHTML = `Coach <strong>${coach.name}</strong> is an elite competitive yoga coach, national-level gold medalist, and AIU silver medalist with over <strong>${coach.experience}</strong> of coaching experience.`;
  const elCoachQuote = document.getElementById("coach-quote-text");
  if (elCoachQuote) elCoachQuote.textContent = `"${coach.quote}"`;
  const elCoachImg = document.getElementById("coach-image");
  if (elCoachImg) {
    elCoachImg.src = coach.image;
    if (coach.image_align) {
      elCoachImg.style.objectPosition = `center ${coach.image_align}`;
    } else {
      elCoachImg.style.objectPosition = "center top"; // Recommended top crop default
    }
  }
  
  // Render timeline milestones list
  const timelineContainer = document.getElementById("coach-timeline");
  if (timelineContainer) {
    timelineContainer.innerHTML = "";
    timeline.forEach(item => {
      const milestone = document.createElement("div");
      milestone.className = "timeline-item";
      milestone.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-date">${item.year}</div>
        <div class="timeline-title">${item.title}</div>
        <div class="timeline-desc">${item.desc}</div>
      `;
      timelineContainer.appendChild(milestone);
    });
  }
  
  // C. POPULATE 12 SERVICE CARDS
  const servicesGrid = document.getElementById("services-grid");
  if (servicesGrid) {
    servicesGrid.innerHTML = "";
    services.forEach(s => {
      const card = document.createElement("div");
      card.className = "service-card glass-panel";
      card.setAttribute("data-tilt", "");
      card.innerHTML = `
        <div class="service-icon-box">
          <i class="fa-solid ${s.icon}"></i>
        </div>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
        <a href="https://wa.me/91${hp.phone_primary}?text=Namaste!%20I%20am%20interested%20in%20${encodeURIComponent(s.title)}." target="_blank" class="service-learn-more">
          Inquire Now <i class="fa-solid fa-arrow-right"></i>
        </a>
      `;
      servicesGrid.appendChild(card);
    });
  }
  
  // D. POPULATE GALLERY MASONRY PHOTOS & DYNAMIC FILTER BUTTONS
  // Populating gallery grid and filters is handled dynamically inside initGalleryFilterAndLightbox.
  
  // E. POPULATE TESTIMONIALS SCROLL GRID
  window.cachedReviews = reviews;
  populateTestimonialsGrid(reviews);
  
  // I. POPULATE YOUTUBE VIDEOS GRID
  const videosGrid = document.getElementById("videos-grid");
  if (videosGrid) {
    videosGrid.innerHTML = "";
    const youtubeVideos = await dbService.getYoutubeVideos();
    if (!youtubeVideos || youtubeVideos.length === 0) {
      videosGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--color-text-secondary); padding: 40px;">
          <p>No videos available at the moment. Please check back later.</p>
        </div>
      `;
    } else {
      youtubeVideos.forEach(v => {
        const card = document.createElement("div");
        card.className = "video-card";
        card.innerHTML = `
          <div class="video-wrapper">
            <iframe 
              src="https://www.youtube.com/embed/${v.video_id}" 
              title="${v.title}"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowfullscreen>
            </iframe>
          </div>
          <div class="video-info">
            <h3>${v.title}</h3>
            <p>${v.desc}</p>
          </div>
        `;
        videosGrid.appendChild(card);
      });
    }
  }
  
  console.log("Completed dynamic content injection!");
}

/* 
=========================================
1. HEADER SCROLL & HAMBURGER MENU
=========================================
*/
function initHeader() {
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (!header || !hamburger || !navMenu) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
  
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
  
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Cursor tracking for premium certificates button
  const certButtons = document.querySelectorAll('.nav-cert-btn');
  certButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      btn.style.setProperty('--mouse-x', `${x}px`);
      btn.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* 
=========================================
1B. DUAL LIGHT/DARK THEME SWITCHER
=========================================
*/
function initThemeSwitcher() {
  const toggleBtn = document.getElementById('theme-toggle');
  
  if (!toggleBtn) return;
  
  let savedTheme = localStorage.getItem('theme');
  
  // Set default theme to Light Mode on first visit
  if (!savedTheme) {
    localStorage.setItem('theme', 'light');
    savedTheme = 'light';
  }
  
  const isLight = savedTheme === 'light';
  
  if (isLight) {
    document.body.classList.add('light-theme');
    setTimeout(() => {
      if (window.updateThreeTheme) {
        window.updateThreeTheme(true);
      }
    }, 200);
  } else {
    document.body.classList.remove('light-theme');
  }
  
  toggleBtn.addEventListener('click', () => {
    const hasLightClass = document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', hasLightClass ? 'light' : 'dark');
    if (window.updateThreeTheme) {
      window.updateThreeTheme(hasLightClass);
    }
    
    // Mobile-Only Theme Toggle Spin Easing
    if (window.innerWidth <= 991) {
      gsap.to(toggleBtn, {
        rotation: '+=360',
        scale: 0.8,
        duration: 0.4,
        ease: 'back.out(1.5)',
        onComplete: () => {
          gsap.to(toggleBtn, { scale: 1, duration: 0.15 });
        }
      });
    }
  });
}

/* 
=========================================
2. CUSTOM ORGANIC CURSOR (Lag-Trail Follower)
=========================================
*/
function initCustomCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  
  if (!cursor || !follower) return;
  
  let posX = 0, posY = 0;
  let mouseX = 0, mouseY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });
  
  function updateFollower() {
    posX += (mouseX - posX) * 0.12;
    posY += (mouseY - posY) * 0.12;
    
    follower.style.left = posX + 'px';
    follower.style.top = posY + 'px';
    
    requestAnimationFrame(updateFollower);
  }
  updateFollower();
  
  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.6)';
    follower.style.transform = 'translate(-50%, -50%) scale(0.8)';
  });
  
  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    follower.style.transform = 'translate(-50%, -50%) scale(1)';
  });
  
  const hoverables = document.querySelectorAll('a, button, .benefit-node, .gallery-item, .service-card, .stat-card, .filter-btn, .theme-toggle-btn');
  hoverables.forEach(item => {
    item.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      follower.classList.add('hover');
    });
    
    item.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      follower.classList.remove('hover');
    });
  });
}

/* 
=========================================
3. 3D TILT EFFECT (Card Parallax on Hover)
=========================================
*/
function initTiltEffects() {
  const tiltCards = document.querySelectorAll('[data-tilt]');
  
  if (window.innerWidth < 992) return;
  
  tiltCards.forEach(card => {
    let transitionTimeout;
    
    card.addEventListener('mouseenter', () => {
      // Smoothly ease into the initial tilt position when cursor first enters the card
      card.style.transition = 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.25s ease, box-shadow 0.25s ease';
      
      // Disable transition after entry has completed to allow responsive lag-free mouse following
      transitionTimeout = setTimeout(() => {
        card.style.transition = 'none';
      }, 250);
    });
    
    card.addEventListener('mousemove', (e) => {
      const cardRect = card.getBoundingClientRect();
      const mouseX = e.clientX - cardRect.left;
      const mouseY = e.clientY - cardRect.top;
      
      // Subtle 8-degree maximum tilt for premium professional feel
      const rotX = ((cardRect.height / 2 - mouseY) / (cardRect.height / 2)) * 8;
      const rotY = ((mouseX - cardRect.width / 2) / (cardRect.width / 2)) * 8;
      
      // Subtle 2px lift height
      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-2px)`;
      card.style.borderColor = 'rgba(255, 153, 51, 0.45)';
    });
    
    card.addEventListener('mouseleave', () => {
      // Cancel the pending enter transition clear
      clearTimeout(transitionTimeout);
      
      // Restore smooth transition for returning to rest position
      card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      card.style.borderColor = '';
      
      // Clean up the inline transition styles after the return completes
      setTimeout(() => {
        card.style.transition = '';
      }, 400);
    });
  });
}

/* 
=========================================
4. GSAP SCROLL-TRIGGERED ENTRANCES
=========================================
*/
function initScrollAnimations() {
  gsap.utils.toArray('.section-header').forEach(header => {
    gsap.from(header, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: header,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });
  
  if (document.getElementById('about-image')) {
    // 3D fold-in transition on scroll
    gsap.from('#about-image', {
      opacity: 0,
      rotationY: -15,
      rotationX: 5,
      scale: 0.92,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#about',
        start: 'top 75%'
      }
    });
  }
  
  if (document.getElementById('coach-image')) {
    // 3D fold-in flip on scroll
    gsap.from('#coach-image', {
      opacity: 0,
      rotationY: 15,
      rotationX: 5,
      scale: 0.92,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#coach',
        start: 'top 75%'
      }
    });
  }
  
  gsap.from('.about-feature-item', {
    opacity: 0,
    y: 30,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.about-features',
      start: 'top 85%'
    }
  });
  
  gsap.from('.timeline-item', {
    opacity: 0,
    x: -30,
    stagger: 0.2,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.timeline',
      start: 'top 80%'
    }
  });
  
  gsap.from('.service-card', {
    opacity: 0,
    y: 50,
    stagger: 0.08,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.services-grid',
      start: 'top 80%'
    }
  });
  
  gsap.from('.highlight-box', {
    opacity: 0,
    x: (i) => i === 0 ? -60 : 60,
    duration: 1.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.achievements-highlights',
      start: 'top 85%'
    }
  });

  // Mobile-only benefits cards scroll triggered entrance animation
  if (window.innerWidth <= 768) {
    gsap.from('.mobile-benefit-card', {
      opacity: 0,
      y: 40,
      scale: 0.95,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#mobile-benefits-list',
        start: 'top 85%'
      }
    });
  }
}

/* 
=========================================
5. STATS DYNAMIC COUNTERS
=========================================
*/
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  statNumbers.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-target'));
    
    ScrollTrigger.create({
      trigger: stat,
      start: 'top 85%',
      onEnter: () => {
        let counter = { value: 0 };
        gsap.to(counter, {
          value: target,
          duration: 2.2,
          ease: 'power2.out',
          onUpdate: () => {
            stat.textContent = Math.floor(counter.value) + '+';
          }
        });
      }
    });
  });
}

/* 
=========================================
6. INTERACTIVE CIRCULAR INFOGRAPHIC
=========================================
*/
const benefitData = {
  'weight-loss': {
    title: 'Weight Loss & Tone',
    icon: 'fa-weight-scale',
    desc: 'Boost metabolic operations, shred stubborn visceral fat, and strengthen lean muscles using active dynamic vinyasa flow schedules and custom core building poses under direct coaching.',
    bullets: [
      'Actively elevates heart rate and calories burn',
      'Tightens abdominal core muscles',
      'Regulates hunger hormones and digestive tracts'
    ]
  },
  'womens-health': {
    title: "Women's Wellness Yoga",
    icon: 'fa-person-dress',
    desc: 'Nurture pelvic floor strength, structural posture correction, and general energetic balance designed to align menstrual rhythms and build deep internal core stability.',
    bullets: [
      'Alleviates pelvic and lumbar stress points',
      'Strengthens lower back and deep pelvic joints',
      'Enhances natural structural alignment'
    ]
  },
  'hormonal-balance': {
    title: 'Hormonal Balance',
    icon: 'fa-yin-yang',
    desc: 'Deeply balancing sequences utilizing targeted compression postures to stimulate and soothe thyroid, adrenal, pineal, and general glandular operations.',
    bullets: [
      'Soothes endocrine fluctuations',
      'Supports optimal thyroid and metabolic functions',
      'Alleviates stress-induced high cortisol deposits'
    ]
  },
  'flexibility-mobility': {
    title: 'Flexibility & Mobility',
    icon: 'fa-person-running',
    desc: 'Unblock muscle fibers, loosen calcified connective tissues, and maximize active athletic range of motion using professional myofascial stretching protocols.',
    bullets: [
      'Unlocks tight hamstring and hip joints',
      'Improves vascular blood circulation throughout limbs',
      'Drastically reduces athletic skeletal injury risks'
    ]
  },
  'posture-improvement': {
    title: 'Posture Improvement',
    icon: 'fa-child',
    desc: 'Reverse desk-slouch damage, align spinal curves, and reinforce shoulder blades to establish an elegant, pain-free posture aligned to natural geometry.',
    bullets: [
      'Re-aligns slouched vertebrae structure',
      'Strengthens spinal cord suspension muscles',
      'Relieves chronic neck, shoulder, and upper back pains'
    ]
  },
  'stress-relief': {
    title: 'Stress Relief & Calm',
    icon: 'fa-spa',
    desc: 'Activate the parasympathetic nervous system (rest & digest) through restorative alignments, scientific breathing, and deep yoga-nidra meditation.',
    bullets: [
      'Calms heart rate and high blood pressure',
      'Clears mental clutter and cognitive exhaustions',
      'Restores deep sleep cycles and mental rest'
    ]
  },
  'mental-wellness': {
    title: 'Mental Wellness',
    icon: 'fa-brain',
    desc: 'Sharpen cognitive concentration, reinforce mental discipline, and build robust focus. Ideal for students, athletes, and professionals needing deep concentration.',
    bullets: [
      'Builds focus and analytical concentration skills',
      'Enhances oxygen supply to cortical zones',
      'Develops emotional steadiness and mental grit'
    ]
  },
  'energy-enhancement': {
    title: 'Energy Enhancement',
    icon: 'fa-bolt',
    desc: 'Recharge your pranic energy flows. Clear internal blocks, enhance cellular respiration, and feel active and rejuvenated throughout the day.',
    bullets: [
      'Restores stamina and physical cell oxygenations',
      'Recharges natural body vitality (Prana)',
      'Flushes out chronic lethargy and physical fatigue'
    ]
  }
};

function initCircularInfographic() {
  // Populate mobile benefits list dynamically
  const mobileList = document.getElementById("mobile-benefits-list");
  if (mobileList) {
    mobileList.innerHTML = "";
    Object.keys(benefitData).forEach(key => {
      const data = benefitData[key];
      const card = document.createElement("div");
      card.className = "mobile-benefit-card glass-panel";
      card.style.padding = "25px 20px";
      
      const bulletsHtml = data.bullets.map(b => `<li><i class="fa-solid fa-circle-check" style="color:var(--color-saffron); margin-right:8px;"></i> ${b}</li>`).join("");
      
      card.innerHTML = `
        <h4 style="color: var(--color-saffron); font-size: 1.25rem; margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid ${data.icon}"></i> ${data.title}
        </h4>
        <p style="font-size: 0.95rem; color: var(--color-text-secondary); margin-bottom: 15px; line-height: 1.6;">${data.desc}</p>
        <ul class="infographic-detail-list" style="margin-left: 0; display:flex; flex-direction:column; gap:8px; list-style:none;">
          ${bulletsHtml}
        </ul>
      `;
      mobileList.appendChild(card);
    });
  }

  const nodes = document.querySelectorAll('.benefit-node');
  const titleEl = document.getElementById('benefit-title');
  const descEl = document.getElementById('benefit-desc');
  const bulletsEl = document.getElementById('benefit-bullets');
  const orbit = document.querySelector('.infographic-orbit');
  
  if (!nodes.length || !titleEl) return;
  
  let currentRotation = 0;
  
  nodes.forEach((node) => {
    node.addEventListener('click', () => {
      nodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');
      
      currentRotation += 45;
      orbit.style.transform = `rotate(${currentRotation}deg)`;
      
      const benefitKey = node.getAttribute('data-benefit');
      const data = benefitData[benefitKey];
      
      if (!data) return;
      
      gsap.to('#detail-panel', {
        opacity: 0,
        y: 15,
        duration: 0.25,
        onComplete: () => {
          titleEl.innerHTML = `<i class="fa-solid ${data.icon}"></i> ${data.title}`;
          descEl.textContent = data.desc;
          
          bulletsEl.innerHTML = '';
          data.bullets.forEach(bullet => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${bullet}`;
            bulletsEl.appendChild(li);
          });
          
          gsap.to('#detail-panel', {
            opacity: 1,
            y: 0,
            duration: 0.35,
            ease: 'power2.out'
          });
        }
      });
    });
  });
}

/* 
=========================================
7. MASONRY GALLERY WITH FILTERING & LIGHTBOX
=========================================
*/
async function initGalleryFilterAndLightbox() {
  const filtersContainer = document.getElementById("gallery-filters-container");
  const galleryGrid = document.getElementById("gallery-grid");
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  
  const fsModal = document.getElementById('gallery-fullscreen-modal');
  const fsTitle = document.getElementById('gallery-fs-title');
  const fsGrid = document.getElementById('gallery-fs-grid');
  const fsClose = document.getElementById('gallery-fs-close');
  
  if (!galleryGrid || !filtersContainer) return;
  
  // Fetch data
  let gallery = [];
  try {
    gallery = await dbService.getGallery();
  } catch(e) {
    console.error("Error fetching gallery:", e);
    gallery = (window.getLocalDB ? window.getLocalDB().gallery : null) || [];
  }
  
  let categories = [];
  try {
    categories = await dbService.getGalleryCategories();
  } catch(e) {
    console.error("Error fetching categories:", e);
    categories = (window.getLocalDB ? window.getLocalDB().gallery_categories : null) || [];
  }
  
  const visibleGallery = gallery.filter(item => item.visible !== false);
  const limits = await dbService.getGalleryCategoryLimits() || {};
  
  let activeCategory = 'all';
  let lightboxItems = [];
  let currentImgIndex = 0;
  let mobileShowAll = false;
  
  // Render filters with photo counts
  function renderFilterButtons() {
    filtersContainer.innerHTML = "";
    
    // All Photos button
    const totalCount = visibleGallery.length;
    const btnAll = document.createElement("button");
    btnAll.className = `filter-btn ${activeCategory === 'all' ? 'active' : ''}`;
    btnAll.setAttribute("data-filter", "all");
    btnAll.innerHTML = `All Photos <span class="filter-count">(${totalCount})</span>`;
    filtersContainer.appendChild(btnAll);
    
    categories.forEach(cat => {
      const count = visibleGallery.filter(item => item.category === cat.id).length;
      const btn = document.createElement("button");
      btn.className = `filter-btn ${activeCategory === cat.id ? 'active' : ''}`;
      btn.setAttribute("data-filter", cat.id);
      btn.innerHTML = `${cat.name} <span class="filter-count">(${count})</span>`;
      filtersContainer.appendChild(btn);
    });
    
    // Bind click events
    const filterBtns = filtersContainer.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-filter');
        mobileShowAll = false; // Reset mobile pagination state
        renderGrid();
      });
    });
  }
  
  // Render main grid
  function renderGrid() {
    galleryGrid.innerHTML = "";
    const filtered = visibleGallery.filter(item => activeCategory === 'all' || item.category === activeCategory);
    
    const isMobile = window.innerWidth <= 768;
    const mobileLimitVal = activeCategory === 'all'
      ? (limits['mobile_all'] || 6)
      : (limits['mobile_' + activeCategory] || limits['mobile_all'] || 6);

    const limit = isMobile 
      ? (mobileShowAll ? filtered.length : mobileLimitVal)
      : (activeCategory === 'all' ? (limits['all'] || 9) : (limits[activeCategory] || 6));
      
    const displayedItems = filtered.slice(0, limit);
    
    displayedItems.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "gallery-item";
      card.setAttribute("data-category", item.category);
      card.style.opacity = 0;
      card.style.transform = "scale(0.9)";
      card.innerHTML = `
        <img src="${item.src}" alt="${item.caption || item.title}" loading="lazy">
        <div class="gallery-overlay">
          <h4>${item.title}</h4>
          <p>${item.caption}</p>
        </div>
      `;
      
      card.addEventListener('click', () => {
        openLightbox(displayedItems, idx);
      });
      
      galleryGrid.appendChild(card);
      
      // Animate in
      gsap.to(card, { scale: 1, opacity: 1, duration: 0.4, delay: idx * 0.05 });
    });
    
    // Render overflow card if count exceeds limit (Desktop only)
    if (!isMobile && filtered.length > limit) {
      const remaining = filtered.length - limit;
      const overflowCard = document.createElement("div");
      overflowCard.className = "gallery-overflow-card";
      overflowCard.innerHTML = `
        <div class="overflow-icon"><i class="fa-solid fa-images"></i></div>
        <h4>+${remaining} More Photos</h4>
        <p>View Full Gallery</p>
      `;
      
      overflowCard.addEventListener('click', () => {
        openFullscreenModal(filtered);
      });
      
      galleryGrid.appendChild(overflowCard);
      gsap.to(overflowCard, { scale: 1, opacity: 1, duration: 0.4, delay: displayedItems.length * 0.05 });
    }
    
    // Manage dynamic premium "View More Photos" button for mobile
    let btnWrapper = document.getElementById("mobile-gallery-btn-wrapper");
    if (!btnWrapper) {
      btnWrapper = document.createElement("div");
      btnWrapper.id = "mobile-gallery-btn-wrapper";
      btnWrapper.style.display = "none";
      btnWrapper.style.justifyContent = "center";
      btnWrapper.style.marginTop = "30px";
      btnWrapper.style.width = "100%";
      
      const btn = document.createElement("button");
      btn.className = "btn btn-secondary";
      btn.id = "mobile-view-more-btn";
      btn.style.padding = "12px 28px";
      btn.innerHTML = `<i class="fa-solid fa-images" style="margin-right: 8px;"></i> View More Photos`;
      btn.addEventListener('click', () => {
        mobileShowAll = true;
        renderGrid();
      });
      btnWrapper.appendChild(btn);
      galleryGrid.parentNode.insertBefore(btnWrapper, galleryGrid.nextSibling);
    }
    
    const showButton = isMobile && !mobileShowAll && (filtered.length > mobileLimitVal);
    btnWrapper.style.display = showButton ? "flex" : "none";
  }
  
  // Fullscreen modal functions
  function openFullscreenModal(items) {
    if (!fsModal) return;
    
    // Set title
    let catName = "All Photos";
    if (activeCategory !== 'all') {
      const cat = categories.find(c => c.id === activeCategory);
      if (cat) catName = cat.name;
    }
    fsTitle.textContent = `Full Gallery - ${catName}`;
    
    // Populate grid
    fsGrid.innerHTML = "";
    items.forEach((item, idx) => {
      const card = document.createElement("div");
      card.className = "gallery-item";
      card.setAttribute("data-category", item.category);
      card.innerHTML = `
        <img src="${item.src}" alt="${item.caption || item.title}" loading="lazy">
        <div class="gallery-overlay">
          <h4>${item.title}</h4>
          <p>${item.caption}</p>
        </div>
      `;
      
      card.addEventListener('click', () => {
        openLightbox(items, idx);
      });
      
      fsGrid.appendChild(card);
    });
    
    fsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeFullscreenModal() {
    if (!fsModal) return;
    fsModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
  
  if (fsClose) {
    fsClose.addEventListener('click', closeFullscreenModal);
  }
  if (fsModal) {
    fsModal.addEventListener('click', (e) => {
      if (e.target === fsModal || e.target.classList.contains('gallery-fs-body')) {
        closeFullscreenModal();
      }
    });
  }
  
  // Lightbox functions
  function openLightbox(items, idx) {
    lightboxItems = items;
    currentImgIndex = idx;
    
    const item = lightboxItems[currentImgIndex];
    if (!item) return;
    
    lightboxImg.src = item.src;
    lightboxCaption.textContent = item.title;
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeLightbox() {
    lightbox.classList.remove('active');
    if (fsModal && fsModal.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }
  
  function navigateLightbox(direction) {
    if (!lightboxItems.length) return;
    currentImgIndex += direction;
    
    if (currentImgIndex < 0) {
      currentImgIndex = lightboxItems.length - 1;
    } else if (currentImgIndex >= lightboxItems.length) {
      currentImgIndex = 0;
    }
    
    gsap.to(lightboxImg, {
      opacity: 0,
      scale: 0.95,
      duration: 0.15,
      onComplete: () => {
        const nextItem = lightboxItems[currentImgIndex];
        lightboxImg.src = nextItem.src;
        lightboxCaption.textContent = nextItem.title;
        
        gsap.to(lightboxImg, {
          opacity: 1,
          scale: 1,
          duration: 0.25,
          ease: 'power2.out'
        });
      }
    });
  }
  
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => navigateLightbox(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigateLightbox(1));
  
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-container')) {
        closeLightbox();
      }
    });
  }
  
  document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    }
    if (fsModal && fsModal.classList.contains('active') && (!lightbox || !lightbox.classList.contains('active'))) {
      if (e.key === 'Escape') closeFullscreenModal();
    }
  });
  
  // Initial render
  renderFilterButtons();
  renderGrid();
}

/* 
=========================================
8. TESTIMONIALS SLIDER (Auto-Play Carousel)
=========================================
*/
function initTestimonialsSlider() {
  const container = document.getElementById("testimonials-grid-container");
  if (!container) return;
  
  // A. Mobile touch-friendly pause/resume support
  const setupTouchListeners = () => {
    const columns = container.querySelectorAll('.testimonials-column-inner');
    
    container.addEventListener('touchstart', () => {
      columns.forEach(col => {
        col.style.animationPlayState = 'paused';
      });
    }, { passive: true });
    
    container.addEventListener('touchend', () => {
      columns.forEach(col => {
        col.style.animationPlayState = 'running';
      });
    }, { passive: true });
    
    container.addEventListener('touchcancel', () => {
      columns.forEach(col => {
        col.style.animationPlayState = 'running';
      });
    }, { passive: true });
  };
  
  // Set up listeners initially
  setupTouchListeners();
  
  // B. Resize breakpoint checking to prevent layout shifts (CLS) on minor resizes
  let lastCols = getNumCols();
  
  function getNumCols() {
    const width = window.innerWidth;
    if (width <= 768) return 1;
    if (width <= 991) return 2;
    return 3;
  }
  
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const currentCols = getNumCols();
      if (currentCols !== lastCols) {
        lastCols = currentCols;
        if (window.cachedReviews) {
          populateTestimonialsGrid(window.cachedReviews);
          setupTouchListeners(); // Rebind touch listeners to the newly rendered columns
        }
      }
    }, 150);
  });
}

/* 
=========================================
9. INTERACTIVE REVIEWS SUBMISSION SYSTEM
=========================================
*/
function initReviewSubmissionSystem() {
  const openBtn = document.getElementById("open-review-modal-btn");
  const closeBtn = document.getElementById("close-review-modal-btn");
  const cancelBtn = document.getElementById("cancel-review-btn");
  const modal = document.getElementById("review-submission-modal");
  const form = document.getElementById("submit-review-form");
  const starNodes = document.querySelectorAll(".star-rating-node");
  const ratingInput = document.getElementById("input-rev-rating");
  const toast = document.getElementById("review-success-toast");
  
  if (!openBtn || !modal || !form) return;
  
  // Open modal
  openBtn.addEventListener("click", () => {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  });
  
  // Close modal helper
  const closeModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
    form.reset();
    resetStars();
    
    // Clear custom file upload preview state
    if (fileInput) fileInput.value = "";
    if (previewImg) previewImg.src = "";
    if (defaultContent) defaultContent.style.display = "flex";
    if (previewContent) previewContent.style.display = "none";
  };
  
  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);
  
  // Close modal on background click
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.classList.contains("lightbox-container")) {
      closeModal();
    }
  });
  
  // Drag & Drop & Click File Upload Logic
  const dragDropZone = document.getElementById("drag-drop-zone");
  const fileInput = document.getElementById("input-rev-file");
  const defaultContent = document.getElementById("upload-content-default");
  const previewContent = document.getElementById("upload-content-preview");
  const previewImg = document.getElementById("image-upload-preview");
  const removePreviewBtn = document.getElementById("remove-preview-btn");
  
  if (dragDropZone && fileInput) {
    // Click to upload
    dragDropZone.addEventListener("click", (e) => {
      if (e.target.closest("#remove-preview-btn")) return;
      fileInput.click();
    });
    
    // Drag effects
    dragDropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dragDropZone.classList.add("drag-over");
    });
    
    dragDropZone.addEventListener("dragleave", () => {
      dragDropZone.classList.remove("drag-over");
    });
    
    dragDropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dragDropZone.classList.remove("drag-over");
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });
    
    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    });
    
    const handleFileSelect = (file) => {
      const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowed.includes(file.type.toLowerCase())) {
        alert("Unsupported file format. Please upload JPG, JPEG, PNG, or WEBP.");
        fileInput.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Maximum image upload size is 5 MB.");
        fileInput.value = "";
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        previewImg.src = event.target.result;
        defaultContent.style.display = "none";
        previewContent.style.display = "flex";
      };
      reader.readAsDataURL(file);
    };
    
    if (removePreviewBtn) {
      removePreviewBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.value = "";
        previewImg.src = "";
        defaultContent.style.display = "flex";
        previewContent.style.display = "none";
      });
    }
  }
  
  // Star rating nodes hover & click selector
  starNodes.forEach(star => {
    star.addEventListener("click", () => {
      const val = parseInt(star.getAttribute("data-val"));
      ratingInput.value = val;
      
      // Update star designs with selected class for gold glow and scale animations
      starNodes.forEach((s, idx) => {
        if (idx < val) {
          s.classList.add("selected");
          s.style.color = ""; // Clear inline colors to allow CSS variables
        } else {
          s.classList.remove("selected");
          s.style.color = "";
        }
      });
    });
  });
  
  function resetStars() {
    ratingInput.value = "5";
    starNodes.forEach(s => {
      s.classList.add("selected");
      s.style.color = "";
    });
  }
  // Initialize stars as solid gold
  resetStars();
  
  // Form submission handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("input-rev-name").value;
    const rating = ratingInput.value;
    const text = document.getElementById("input-rev-text").value;
    const fileInput = document.getElementById("input-rev-file");
    const submitBtn = form.querySelector("button[type='submit']");
    
    if (!name || !text) return;
    
    let avatarUrl = null;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Maximum image upload size is 5 MB.");
        return;
      }
      
      // Validate file type
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type.toLowerCase())) {
        alert("Unsupported file format. Please upload JPG, JPEG, PNG, or WEBP.");
        return;
      }
      
      // Show loading state
      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Uploading...';
      
      try {
        avatarUrl = await dbService.uploadReviewAvatar(file);
      } catch (err) {
        console.error("Upload error:", err);
        alert("Profile photo upload failed: " + err.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
        return;
      }
      
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
    }
    
    // Add review with approved: false to database
    await dbService.addReview(name, rating, text, avatarUrl);
    
    // Close modal
    closeModal();
    
    // Trigger dynamic success glassmorphic notification toast
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 4500);
  });
}

/*
=========================================
10. INTERACTIVE FREE TRIAL BOOKING SYSTEM & EMAILJS
=========================================
*/
function initTrialBookingSystem() {
  // Initialize EmailJS with Public Key
  if (typeof emailjs !== "undefined") {
    try {
      emailjs.init("unI9GpMpWuyCcYJoT");
      console.log("EmailJS initialized successfully.");
    } catch(e) {
      console.error("EmailJS initialization failed:", e);
    }
  }

  const modal = document.getElementById("trial-booking-modal");
  const form = document.getElementById("submit-trial-form");
  const closeBtn = document.getElementById("close-trial-modal-btn");
  const cancelBtn = document.getElementById("cancel-trial-btn");

  const thankYouModal = document.getElementById("trial-thankyou-modal");
  const closeThankYouBtn = document.getElementById("close-thankyou-btn");
  const closeThankYouXBtn = document.getElementById("close-thankyou-modal-btn");

  const closeThankYou = () => {
    if (thankYouModal) {
      thankYouModal.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  };

  if (closeThankYouBtn) closeThankYouBtn.addEventListener("click", closeThankYou);
  if (closeThankYouXBtn) closeThankYouXBtn.addEventListener("click", closeThankYou);
  if (thankYouModal) {
    thankYouModal.addEventListener("click", (e) => {
      if (e.target === thankYouModal) {
        closeThankYou();
      }
    });
  }

  const openButtons = [];
  document.querySelectorAll("a, button").forEach(el => {
    const text = el.textContent || "";
    if (text.toLowerCase().includes("free trial") && !el.classList.contains("nav-wa-btn")) {
      openButtons.push(el);
    }
  });

  openButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    });
  });

  const closeModal = () => {
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "auto";
    }
    if (form) form.reset();
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("input-trial-name").value.trim();
      const phone = document.getElementById("input-trial-phone").value.trim();
      const age = document.getElementById("input-trial-age").value;
      const gender = document.getElementById("select-trial-gender").value;
      const city = document.getElementById("input-trial-city").value.trim();
      const mode = document.getElementById("select-trial-mode").value;
      const batch = document.getElementById("select-trial-batch").value;
      const goal = document.getElementById("select-trial-goal").value;
      const experienceEl = document.getElementById("select-trial-experience");
      const experience = experienceEl ? experienceEl.value : "";
      const sourceEl = document.getElementById("select-trial-source");
      const source = sourceEl ? sourceEl.value : "";
      const notes = document.getElementById("input-trial-notes").value.trim();
      
      const submitBtn = form.querySelector("button[type='submit']");
      
      if (!name || !phone) return;

      if (!/^[0-9]{10}$/.test(phone)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
      }

      const originalHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Booking...';

      let dbRecord = null;
      try {
        dbRecord = await dbService.addTrialBooking(name, phone, age, gender, city, mode, batch, goal, experience, source, notes);
      } catch (dbErr) {
        console.error("Database save error:", dbErr);
        alert("Booking failed to save: " + dbErr.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
        return;
      }

      if (typeof emailjs !== "undefined") {
        try {
          const templateParams = {
            booking_name: name,
            booking_phone: phone,
            booking_age: age || "Not specified",
            booking_gender: gender,
            booking_city: city,
            booking_mode: mode,
            booking_batch: batch,
            booking_goal: goal,
            booking_experience: experience || "Not specified",
            booking_source: source || "Not specified",
            booking_notes: notes || "No additional notes",
            created_at: new Date().toLocaleString()
          };

          console.log("Sending EmailJS notification with params:", templateParams);
          await emailjs.send(
            "service_8sb3twf",
            "template_v12c1d5",
            templateParams
          );
          console.log("EmailJS notification sent successfully!");
        } catch (emailErr) {
          console.error("EmailJS sending failed:", emailErr);
          console.log("Booking saved successfully! (Note: Email notification failed to send).");
        }
      } else {
        console.warn("EmailJS library not loaded. Email notification skipped.");
        console.log("Booking saved successfully! (Note: Email notifications are currently unavailable).");
      }

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;

      // Close the booking modal and reset form
      closeModal();

      // Show separate Premium Success Modal
      if (thankYouModal) {
        thankYouModal.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    });
  }
}

/* 
=========================================
10. SMART MOBILE AUTO-HIDE STICKY NAVBAR
=========================================
*/
function initMobileNavbarAutoHide() {
  const header = document.getElementById('header');
  const navMenu = document.getElementById('nav-menu');
  if (!header) return;

  let minScrollY = window.scrollY;
  let maxScrollY = window.scrollY;
  let isTouching = false;

  // Track touch state to prevent micro-scroll and touch jitter from triggering immediate hide on hold
  window.addEventListener('touchstart', () => {
    isTouching = true;
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isTouching = false;
  }, { passive: true });

  window.addEventListener('touchcancel', () => {
    isTouching = false;
  }, { passive: true });

  window.addEventListener('scroll', () => {
    // 4. Desktop behavior must remain completely unchanged.
    if (window.innerWidth > 768) {
      header.classList.remove('nav-hidden');
      return;
    }

    const currentScrollY = window.scrollY;

    // 3. When user reaches the top of the page: Navbar must always remain visible.
    if (currentScrollY <= 10) {
      header.classList.remove('nav-hidden');
      minScrollY = currentScrollY;
      maxScrollY = currentScrollY;
      return;
    }

    // Do not hide navbar if the mobile navigation menu overlay is open/active
    if (navMenu && navMenu.classList.contains('active')) {
      header.classList.remove('nav-hidden');
      minScrollY = currentScrollY;
      maxScrollY = currentScrollY;
      return;
    }

    const isHidden = header.classList.contains('nav-hidden');
    const DOWN_THRESHOLD = 15;            // Clear downward scroll threshold (touching)
    const MOMENTUM_DOWN_THRESHOLD = 5;    // Small downward threshold (not touching)
    const UP_THRESHOLD = 10;              // Upward scroll threshold to show navbar

    if (isHidden) {
      // Track the maximum Y reached while hidden
      if (currentScrollY > maxScrollY) {
        maxScrollY = currentScrollY;
      }
      
      const upDistance = maxScrollY - currentScrollY;
      if (upDistance > UP_THRESHOLD) {
        header.classList.remove('nav-hidden');
        minScrollY = currentScrollY; // Reset visible baseline
      }
    } else {
      // Track the minimum Y reached while visible
      if (currentScrollY < minScrollY) {
        minScrollY = currentScrollY;
      }
      
      const downDistance = currentScrollY - minScrollY;
      if (isTouching) {
        if (downDistance > DOWN_THRESHOLD) {
          header.classList.add('nav-hidden');
          maxScrollY = currentScrollY; // Reset hidden baseline
        }
      } else {
        if (downDistance > MOMENTUM_DOWN_THRESHOLD) {
          header.classList.add('nav-hidden');
          maxScrollY = currentScrollY; // Reset hidden baseline
        }
      }
    }
  });

  // Ensure resizing back to desktop resets any mobile hidden class
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      header.classList.remove('nav-hidden');
    }
  });
}
