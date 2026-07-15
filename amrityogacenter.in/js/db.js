/*
=========================================
AMRIT YOGA CENTER - DATABASE LAYER (LOCALSTORAGE & SUPABASE)
=========================================
*/

// Toggle true to connect to Supabase Cloud Database
const USE_SUPABASE = true; 
const SUPABASE_URL = "https://kxsovgiapzbpxahtkbuo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4c292Z2lhcHpicHhhaHRrYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDAzMjcsImV4cCI6MjA5NTk3NjMyN30.cKlyTzjutLCrFsqflsMBVGZa1HtuygD_RqL3ctMorVM";

let dbClient = null;
if (USE_SUPABASE) {
  if (typeof window.supabase !== "undefined" && window.supabase.createClient) {
    dbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } else {
    console.error("Supabase Client is not loaded. Please ensure the CDN script is loaded in your HTML.");
  }
}


// Standard pre-populated default database
const DEFAULT_DATABASE = {
  admin_creds: {
    username: "admin",
    password: "yogamrit@2026"
  },
  homepage: {
    tagline: "An Ultimate Health, Mind & Soul Resolution",
    phone_primary: "7737773384",
    phone_support: "7597955294",
    address: "3-M-7, 2nd Floor, Near Vinay Stationers, Govt. Hospital Road, Bapunagar, Bhilwara, Rajasthan 311001",
    email: "info@yogamrityoga.com",
    insta: '{"insta_username":"@amrityogacenter","insta_url":"https://instagram.com/amrityogacenter","youtube_name":"@amrityogacenter","youtube_url":"https://youtube.com/@amrityogacenter?si=tCfleC7CalYBflIM"}',
    about_image: "images/about_hero.jpg",
    about_image_align: "center",
    map_link: "https://maps.app.goo.gl/Po9V2UMN3C3fHnXMA",
    stat_medals: "15",
    stat_students: "2000",
    stat_years: "12",
    stat_competitors: "150",
    highlight_title_1: "National Yoga Gold Medalist",
    highlight_desc_1: "Our head coach Suresh Kumar secured the National Championship, demonstrating impeccable execution, technique, and posture mastery in competitive yoga sport.",
    highlight_title_2: "AIU Silver Medalist",
    highlight_desc_2: "Achieved top honors at the All India Inter-University (AIU) Championships, representing elite athletic coordination and competitive excellence on a national university platform.",
    gallery_category_limits: '{}'
  },
  coach: {
    name: "Suresh Kumar",
    title: "National Yoga Gold Medalist & AIU Silver Medalist",
    experience: "9+ Years",
    image: "images/coach_medal.jpg",
    image_align: "top", // Default to top so his face is perfectly visible
    quote: "True transformation begins when discipline becomes a habit. Yoga is not only about flexibility; it is about building strength, focus, confidence, and a powerful mindset for life.",
    achievements: [
      "National Gold Medalist",
      "AIU Silver Medalist (2024)",
      "Yoga Federation of India Competitor",
      "Khelo India Participant",
      "6-Time National Level Participant",
      "4 National Gold Medals",
      "1 National Silver Medal",
      "300+ Students Trained",
      "7+ Student Medal Winners"
    ]
  },
  timeline: [
    { id: 1, year: "2014", title: "Began Professional Yogic Training", desc: "Initiated intense traditional and athletic yoga practice, focusing on posture mechanics and deep structural flexibility." },
    { id: 2, year: "2021", title: "All India Inter-University (AIU) Silver Medalist", desc: "Secured the national Silver Medal at the prestigious AIU Championships, demonstrating elite athletic alignment and posture control." },
    { id: 3, year: "2024", title: "National Yoga Sports Gold Medalist", desc: "Achieved peak athletic honor by winning the Gold Medal at the National Yogasana Sports Championship." },
    { id: 4, year: "2026", title: "7th District Yogasana Championship Director", desc: "Hosted, trained, and led Amrit academy students to sweep medals at the District Yogasana Sports Championship in Bhilwara." }
  ],
  services: [
    { id: 1, title: "Personal Yoga Classes", icon: "fa-user-tie", desc: "One-on-one sessions customized entirely to your fitness goals, medical history, and availability." },
    { id: 2, title: "Group Yoga Classes", icon: "fa-users", desc: "Energetic and motivating group sessions focusing on flexibility, strength, and community wellness." },
    { id: 3, title: "Home Yoga Classes", icon: "fa-house-chimney", desc: "Experience customized professional fitness guidance in the safety and comfort of your private space." },
    { id: 4, title: "Competition Yoga Training", icon: "fa-trophy", desc: "Advanced posture mastery, stamina building, and artistic alignment routines for future champions." },
    { id: 5, title: "Kids Yoga", icon: "fa-child-reaching", desc: "Specialized batches targeting concentration, memory, growth, and structural spine alignments in children." },
    { id: 6, title: "Women's Wellness Yoga", icon: "fa-person-dress", desc: "Nurturing postures targeting pelvic floor strength, back pain relief, posture correction, and general energy." },
    { id: 7, title: "Weight Loss Programs", icon: "fa-weight-scale", desc: "High-intensity dynamic vinyasa flow paired with metabolism boosting poses and diet guidance." },
    { id: 8, title: "Flexibility Training", icon: "fa-person-running", desc: "Focusing on deep muscle stretching, joint unlocking, and maximizing passive athletic range safely." },
    { id: 9, title: "Meditation", icon: "fa-om", desc: "Scientific dhyana techniques, chakra visualization, and deep mental focus building practices." },
    { id: 10, title: "Pranayama", icon: "fa-wind", desc: "Deep scientific breathing sequences to enrich oxygen levels, cleanse lungs, and charge energy meridians." },
    { id: 11, title: "Stress Relief Programs", icon: "fa-spa", desc: "Calming restorative sequences, deep yoga nidra, and mindfulness to completely clear anxiety." },
    { id: 12, title: "Advanced Asana Training", icon: "fa-fire-flame-curved", desc: "Scorpion forearm stands, backbend dropbacks, leg-behind-head alignments for advanced master practitioners." }
  ],
  gallery: [
    { id: 1, src: "images/championship_2026.png", title: "7th District Championship", caption: "Coach Suresh Kumar with academy children representing Bhilwara", category: "kids" },
    { id: 2, src: "images/splits_pose.png", title: "Hamstring Splits (Hanumanasana)", caption: "Precise deep muscle stretch alignment", category: "training" },
    { id: 3, src: "images/bow_pose_three.png", title: "Standing Bow (Natarajasana)", caption: "Synchronized balance across skill levels", category: "competitions" },
    { id: 4, src: "images/forearm_stand.png", title: "Forearm Scorpion Balance", caption: "Advanced posture control demonstration", category: "competitions" },
    { id: 5, src: "images/bow_pose_two.png", title: "Synchronized King Dancer", caption: "Spine flexibility and balance training", category: "training" },
    { id: 6, src: "images/gallery_awards.jpg", title: "Trophy Room Showcase", caption: "Accolades, medals, and university trophies", category: "awards" }
  ],
  reviews: [
    { id: 1, name: "Rajesh Sharma", rating: 5, text: "Joining Amrit has radically solved my chronic back stiffness and posture alignment problems within just 3 months. The athletic insight of a national gold medalist is completely visible in how every muscle stretch is taught. Truly world-class training in Bhilwara!", avatar_url: null, approved: true, created_at: "2026-06-01T12:00:00.000Z" },
    { id: 2, name: "Meenakshi Soni", rating: 5, text: "We admitted our 9-year-old child to the competitive batch. The physical strength and mental concentration she developed is phenomenal. She won her first district-level medal last month under Amrit's guidance. The coaches understand children's physics beautifully.", avatar_url: null, approved: true, created_at: "2026-06-02T12:00:00.000Z" },
    { id: 3, name: "Kriti Vyas", rating: 5, text: "Their targeted weight loss and hormonal therapy programs are highly scientific. The pranayama and dynamic sequences helped me shed 14 kgs and resolve severe digestive issues. Their glassmorphic studio atmosphere adds to the premium feel.", avatar_url: null, approved: true, created_at: "2026-06-03T12:00:00.000Z" }
  ],
  gallery_categories: [
    { id: "training", name: "Training Batches" },
    { id: "kids", name: "Kids Classes" },
    { id: "competitions", name: "Competitions" },
    { id: "awards", name: "Awards & Medals" }
  ],
  youtube_videos: [
    { id: 1, video_id: "c8hjhRqItyk", title: "Yoga for Flexibility & Stretching Flow", desc: "A premium session focusing on deep joint releases, flexibility, and muscle recovery alignments." },
    { id: 2, video_id: "v7AYKMP6rOE", title: "Power Vinyasa Core Flow", desc: "Advanced metabolic strength building poses and core control flows under direct coaching." },
    { id: 3, video_id: "Eml2xnoLpYE", title: "10 Min Daily Mind & Body Reset", desc: "Clean, quick restorative breathing alignments and sun salutations for dynamic active energy." }
  ],
  trial_bookings: []
};

// Initialize LocalStorage Database if not present
function initLocalStorageDB() {
  if (!localStorage.getItem("yogamrit_db")) {
    localStorage.setItem("yogamrit_db", JSON.stringify(DEFAULT_DATABASE));
    console.log("Initialized Amrit local database successfully!");
  } else {
    // Graceful migrations for existing databases
    let db = null;
    try {
      db = JSON.parse(localStorage.getItem("yogamrit_db"));
    } catch (e) {
      console.error("Error parsing local database during init:", e);
    }
    
    let dirty = false;
    if (!db || typeof db !== "object") {
      db = JSON.parse(JSON.stringify(DEFAULT_DATABASE));
      dirty = true;
    }
    
    // 1. Check top-level keys
    for (const key in DEFAULT_DATABASE) {
      if (db[key] === undefined || db[key] === null) {
        db[key] = JSON.parse(JSON.stringify(DEFAULT_DATABASE[key]));
        dirty = true;
        console.log(`Migrated missing table "${key}" from defaults!`);
      }
    }
    
    // 2. Specific sub-fields in homepage
    if (db.homepage) {
      for (const subKey in DEFAULT_DATABASE.homepage) {
        if (db.homepage[subKey] === undefined || db.homepage[subKey] === null) {
          db.homepage[subKey] = DEFAULT_DATABASE.homepage[subKey];
          dirty = true;
          console.log(`Migrated homepage field "${subKey}" from defaults!`);
        }
      }
      // Force map URL alignment to the new Google sharing link
      if (db.homepage.map_link !== "https://maps.app.goo.gl/Po9V2UMN3C3fHnXMA") {
        db.homepage.map_link = "https://maps.app.goo.gl/Po9V2UMN3C3fHnXMA";
        dirty = true;
        console.log("Forced map link update to https://maps.app.goo.gl/Po9V2UMN3C3fHnXMA!");
      }
    }
    
    // 3. Specific sub-fields in coach
    if (db.coach) {
      for (const subKey in DEFAULT_DATABASE.coach) {
        if (db.coach[subKey] === undefined || db.coach[subKey] === null) {
          db.coach[subKey] = JSON.parse(JSON.stringify(DEFAULT_DATABASE.coach[subKey]));
          dirty = true;
          console.log(`Migrated coach field "${subKey}" from defaults!`);
        }
      }
    }
    
    // 4. Migration for reviews table schema change in local storage
    if (db.reviews && Array.isArray(db.reviews)) {
      let reviewsMigrated = false;
      db.reviews = db.reviews.map(r => {
        if ('avatar' in r) {
          r.avatar_url = r.avatar;
          delete r.avatar;
          reviewsMigrated = true;
        }
        if (r.avatar_url && typeof r.avatar_url === 'string' && r.avatar_url.startsWith('images/')) {
          r.avatar_url = null; // Clear local avatars to force initials fallback
          reviewsMigrated = true;
        }
        if (!r.created_at) {
          r.created_at = new Date().toISOString();
          reviewsMigrated = true;
        }
        return r;
      });
      if (reviewsMigrated) {
        dirty = true;
        console.log("Migrated reviews from avatar to avatar_url & added created_at.");
      }
    }

    if (dirty) {
      localStorage.setItem("yogamrit_db", JSON.stringify(db));
      console.log("Completed self-healing Amrit local storage migrations!");
    }
  }
}
initLocalStorageDB();

// Read current database from LocalStorage with safe fallbacks
function getLocalDB() {
  const dbStr = localStorage.getItem("yogamrit_db");
  if (!dbStr) {
    localStorage.setItem("yogamrit_db", JSON.stringify(DEFAULT_DATABASE));
    return DEFAULT_DATABASE;
  }
  try {
    return JSON.parse(dbStr) || DEFAULT_DATABASE;
  } catch (e) {
    console.error("Error parsing local database:", e);
    localStorage.setItem("yogamrit_db", JSON.stringify(DEFAULT_DATABASE));
    return DEFAULT_DATABASE;
  }
}

// Write database to LocalStorage
function saveLocalDB(db) {
  localStorage.setItem("yogamrit_db", JSON.stringify(db));
}

// =========================================
// ABSTRACT DATABASE ACCESS SERVICE API
// =========================================
const dbService = {
  
  // A. HOMEPAGE CONTENT
  async getHomepage() {
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient.from('homepage').select('*').single();
      if (!error) return data;
    }
    return getLocalDB().homepage;
  },

  async updateHomepage(data) {
    if (USE_SUPABASE && dbClient) {
      // If we are updating the insta column, make sure we don't wipe out gallery limits stored inside it
      if (data.insta) {
        try {
          const { data: current, error } = await dbClient.from('homepage').select('*').single();
          if (!error && current) {
            // Only merge if the new column is NOT in the database (so we are fallback-storing inside 'insta')
            if (!('gallery_category_limits' in current)) {
              if (current.insta && current.insta.trim().startsWith('{')) {
                const currentObj = JSON.parse(current.insta);
                const newObj = JSON.parse(data.insta);
                if (currentObj.gallery_category_limits) {
                  newObj.gallery_category_limits = currentObj.gallery_category_limits;
                }
                data.insta = JSON.stringify(newObj);
              }
            }
          }
        } catch (e) {
          console.error("Error merging homepage settings:", e);
        }
      }
      await dbClient.from('homepage').update(data).eq('id', 1);
    }
    const db = getLocalDB();
    db.homepage = { ...db.homepage, ...data };
    saveLocalDB(db);
    return true;
  },

  // B. COACH SHOWCASE DETAILS
  async getCoach() {
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient.from('coach').select('*').single();
      if (!error) return data;
    }
    return getLocalDB().coach;
  },

  async updateCoach(data) {
    if (USE_SUPABASE && dbClient) {
      await dbClient.from('coach').update(data).eq('id', 1);
    }
    const db = getLocalDB();
    db.coach = { ...db.coach, ...data };
    saveLocalDB(db);
    return true;
  },

  // C. TIMELINE
  async getTimeline() {
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient.from('timeline').select('*').order('year', { ascending: true });
      if (!error) return data;
    }
    return getLocalDB().timeline;
  },

  async addTimelineItem(year, title, desc) {
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient.from('timeline').insert([{ year, title, desc }]).select();
      if (!error && data && data.length > 0) {
        const db = getLocalDB();
        db.timeline.push(data[0]);
        db.timeline.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        saveLocalDB(db);
        return data[0];
      }
    }
    const db = getLocalDB();
    const newItem = {
      id: Date.now(),
      year,
      title,
      desc
    };
    db.timeline.push(newItem);
    db.timeline.sort((a, b) => parseInt(a.year) - parseInt(b.year));
    saveLocalDB(db);
    return newItem;
  },

  async updateTimelineItem(id, year, title, desc) {
    if (USE_SUPABASE && dbClient) {
      await dbClient.from('timeline').update({ year, title, desc }).eq('id', id);
    }
    const db = getLocalDB();
    db.timeline = db.timeline.map(item => {
      if (item.id === parseInt(id)) {
        return { ...item, year, title, desc };
      }
      return item;
    });
    db.timeline.sort((a, b) => parseInt(a.year) - parseInt(b.year));
    saveLocalDB(db);
    return true;
  },

  async deleteTimelineItem(id) {
    if (USE_SUPABASE && dbClient) {
      await dbClient.from('timeline').delete().eq('id', id);
    }
    const db = getLocalDB();
    db.timeline = db.timeline.filter(item => item.id !== parseInt(id));
    saveLocalDB(db);
    return true;
  },

  // D. SERVICES
  async getServices() {
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient.from('services').select('*').order('id', { ascending: true });
      if (!error) return data;
    }
    return getLocalDB().services;
  },

  async updateService(id, title, desc) {
    if (USE_SUPABASE && dbClient) {
      await dbClient.from('services').update({ title, desc }).eq('id', id);
    }
    const db = getLocalDB();
    db.services = db.services.map(s => {
      if (s.id === parseInt(id)) {
        return { ...s, title, desc };
      }
      return s;
    });
    saveLocalDB(db);
    return true;
  },

  // E. REVIEWS / TESTIMONIAL MODERATION
  async uploadReviewAvatar(file) {
    if (USE_SUPABASE && dbClient) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        throw new Error("Invalid file type. Only JPG, JPEG, PNG, and WEBP formats are supported.");
      }
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File is too large. Maximum size allowed is 5 MB.");
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { data, error } = await dbClient.storage
        .from('review-avatars')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });
        
      if (error) {
        throw error;
      }
      
      const { data: urlData } = dbClient.storage
        .from('review-avatars')
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
    } else {
      // Local fallback using Base64 Data URL
      return new Promise((resolve, reject) => {
        if (file.size > 5 * 1024 * 1024) {
          reject(new Error("File is too large. Maximum size allowed is 5 MB."));
          return;
        }
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type.toLowerCase())) {
          reject(new Error("Invalid file type. Only JPG, JPEG, PNG, and WEBP formats are supported."));
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  },

  async getReviews(includePending = false) {
    if (USE_SUPABASE && dbClient) {
      let query = dbClient.from('reviews').select('*');
      if (!includePending) {
        query = query.eq('approved', true);
      }
      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;
      if (!error) return data;
    }
    const allReviews = getLocalDB().reviews;
    const sorted = [...allReviews].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    if (includePending) return sorted;
    return sorted.filter(r => r.approved === true);
  },

  async addReview(name, rating, text, avatar_url = null) {
    const createdAt = new Date().toISOString();
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient.from('reviews').insert([
        { name, rating: parseInt(rating), text, avatar_url, approved: false, created_at: createdAt }
      ]).select();
      if (!error && data && data.length > 0) {
        const db = getLocalDB();
        db.reviews.push(data[0]);
        saveLocalDB(db);
        return data[0];
      }
    }
    const db = getLocalDB();
    const newReview = {
      id: Date.now(),
      name,
      rating: parseInt(rating),
      text,
      avatar_url,
      approved: false,
      created_at: createdAt
    };
    db.reviews.push(newReview);
    saveLocalDB(db);
    return newReview;
  },

  async updateReview(id, name, rating, text, avatar_url = undefined, approved = null) {
    if (USE_SUPABASE && dbClient) {
      const updateData = { name, rating: parseInt(rating), text };
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
      if (approved !== null) updateData.approved = approved;
      
      await dbClient.from('reviews').update(updateData).eq('id', id);
    }
    const db = getLocalDB();
    db.reviews = db.reviews.map(r => {
      if (r.id === parseInt(id)) {
        const updated = { ...r, name, rating: parseInt(rating), text };
        if (avatar_url !== undefined) updated.avatar_url = avatar_url;
        if (approved !== null) updated.approved = approved;
        return updated;
      }
      return r;
    });
    saveLocalDB(db);
    return true;
  },

  async approveReview(id) {
    if (USE_SUPABASE && dbClient) {
      await dbClient.from('reviews').update({ approved: true }).eq('id', id);
    }
    const db = getLocalDB();
    db.reviews = db.reviews.map(r => {
      if (r.id === parseInt(id)) {
        return { ...r, approved: true };
      }
      return r;
    });
    saveLocalDB(db);
    return true;
  },

  async rejectReview(id) {
    return this.deleteReview(id);
  },

  async deleteReview(id) {
    if (USE_SUPABASE && dbClient) {
      await dbClient.from('reviews').delete().eq('id', id);
    }
    const db = getLocalDB();
    db.reviews = db.reviews.filter(r => r.id !== parseInt(id));
    saveLocalDB(db);
    return true;
  },

  // F. GALLERY MEDIA
  getLocalGalleryMetadata() {
    let metadata = {};
    try {
      const stored = localStorage.getItem("gallery_metadata");
      if (stored) metadata = JSON.parse(stored);
    } catch (e) {
      console.error("Error reading gallery metadata from localStorage:", e);
    }
    return metadata;
  },

  saveLocalGalleryMetadata(metadata) {
    try {
      localStorage.setItem("gallery_metadata", JSON.stringify(metadata));
    } catch (e) {
      console.error("Error saving gallery metadata to localStorage:", e);
    }
  },

  async getGalleryCategoryLimits() {
    // Primary: read from Supabase homepage table
    if (USE_SUPABASE && dbClient) {
      try {
        const { data, error } = await dbClient.from('homepage').select('*').single();
        if (!error && data) {
          // If the column exists, use it
          if ('gallery_category_limits' in data && data.gallery_category_limits) {
            const parsed = typeof data.gallery_category_limits === 'string'
              ? JSON.parse(data.gallery_category_limits)
              : data.gallery_category_limits;
            if (parsed && typeof parsed === 'object') {
              localStorage.setItem("gallery_category_limits", JSON.stringify(parsed));
              return parsed;
            }
          }
          // Fallback: If column does not exist, check if it's inside the 'insta' JSON
          else if (data.insta) {
            let socialData = {};
            if (data.insta.trim().startsWith('{')) {
              socialData = JSON.parse(data.insta);
            }
            if (socialData && socialData.gallery_category_limits) {
              localStorage.setItem("gallery_category_limits", JSON.stringify(socialData.gallery_category_limits));
              return socialData.gallery_category_limits;
            }
          }
        }
      } catch (e) {
        console.error("Error reading gallery limits from Supabase:", e);
      }
    }
    // Fallback: read from localStorage cache
    let limits = {};
    try {
      const stored = localStorage.getItem("gallery_category_limits");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          limits = parsed;
        }
      }
    } catch (e) {
      console.error("Error reading category limits from localStorage:", e);
    }
    return limits;
  },

  async saveGalleryCategoryLimits(limits) {
    // Primary: write to Supabase homepage table
    if (USE_SUPABASE && dbClient) {
      try {
        const { data, error } = await dbClient.from('homepage').select('*').single();
        if (!error && data) {
          // If the column exists in the database schema, write directly to it
          if ('gallery_category_limits' in data) {
            await dbClient.from('homepage').update({ gallery_category_limits: JSON.stringify(limits) }).eq('id', 1);
          }
          // Fallback: Store limits inside the 'insta' JSON string column
          else {
            let socialData = {};
            if (data.insta && data.insta.trim().startsWith('{')) {
              socialData = JSON.parse(data.insta);
            }
            socialData.gallery_category_limits = limits;
            await dbClient.from('homepage').update({ insta: JSON.stringify(socialData) }).eq('id', 1);
          }
        }
      } catch (e) {
        console.error("Error saving gallery limits to Supabase:", e);
      }
    }
    // Also update localStorage as cache/fallback
    try {
      localStorage.setItem("gallery_category_limits", JSON.stringify(limits));
    } catch (e) {
      console.error("Error saving category limits to localStorage:", e);
    }
  },

  async getGallery() {
    let supabaseItems = [];
    let localItems = (getLocalDB().gallery || []);
    
    if (USE_SUPABASE && dbClient) {
      try {
        const { data, error } = await dbClient.from('gallery').select('*');
        if (!error && data) {
          supabaseItems = data;
        } else {
          console.error("Supabase getGallery error, falling back to local only:", error);
        }
      } catch (err) {
        console.error("Supabase getGallery exception:", err);
      }
    }

    // Merge Supabase items and local items by unique id (deduplicate)
    const mergedMap = new Map();
    
    // 1. Load local/default items first
    localItems.filter(item => item !== null && item !== undefined).forEach(item => {
      if (item.id) {
        mergedMap.set(item.id.toString(), item);
      }
    });

    // 2. Load Supabase items (overwriting or merging with local items)
    supabaseItems.filter(item => item !== null && item !== undefined).forEach(item => {
      if (item.id) {
        const localItem = mergedMap.get(item.id.toString()) || {};
        mergedMap.set(item.id.toString(), {
          ...localItem,
          ...item
        });
      }
    });

    const rawItems = Array.from(mergedMap.values());
    const metadata = this.getLocalGalleryMetadata() || {};

    // Map and heal items
    const processed = rawItems.filter(item => item !== null && item !== undefined).map(item => {
      const itemOrder = (item.display_order !== undefined && item.display_order !== null) 
        ? parseInt(item.display_order) 
        : (metadata[item.id] && metadata[item.id].display_order !== undefined)
          ? parseInt(metadata[item.id].display_order)
          : 0;

      const itemFeatured = (item.featured !== undefined && item.featured !== null)
        ? (item.featured === true || item.featured === 'true')
        : (metadata[item.id] && metadata[item.id].featured !== undefined)
          ? metadata[item.id].featured
          : false;

      const itemVisible = (item.visible !== undefined && item.visible !== null)
        ? (item.visible === true || item.visible === 'true')
        : (metadata[item.id] && metadata[item.id].visible !== undefined)
          ? metadata[item.id].visible
          : true;

      return {
        ...item,
        display_order: itemOrder,
        featured: itemFeatured,
        visible: itemVisible
      };
    });

    // Sort: featured DESC, display_order ASC, id DESC
    processed.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      const orderDiff = (a.display_order || 0) - (b.display_order || 0);
      if (orderDiff !== 0) return orderDiff;
      
      const idA = a.id ? parseInt(a.id) || 0 : 0;
      const idB = b.id ? parseInt(b.id) || 0 : 0;
      return idB - idA;
    });

    return processed;
  },

  async addGalleryItem(src, title, caption, category, display_order = 0, featured = false, visible = true) {
    const newItemLocal = {
      id: Date.now(),
      src,
      title,
      caption,
      category,
      display_order: parseInt(display_order),
      featured: featured === true,
      visible: visible === true
    };

    let savedItem = newItemLocal;

    if (USE_SUPABASE && dbClient) {
      const insertData = { src, title, caption, category };
      insertData.display_order = parseInt(display_order);
      insertData.featured = featured === true;
      insertData.visible = visible === true;

      try {
        const { data, error } = await dbClient.from('gallery').insert([insertData]).select();
        if (!error && data && data.length > 0) {
          savedItem = data[0];
        } else if (error) {
          console.warn("[DB] Supabase insert failed with full columns, retrying with core columns only. Error:", error);
          const retryData = { src, title, caption, category };
          const { data: retryDataResp, error: retryError } = await dbClient.from('gallery').insert([retryData]).select();
          if (!retryError && retryDataResp && retryDataResp.length > 0) {
            savedItem = retryDataResp[0];
          }
        }
      } catch (err) {
        console.error("[DB] Exception during Supabase insert:", err);
      }
    }

    // Save metadata locally
    const metadata = this.getLocalGalleryMetadata();
    metadata[savedItem.id] = {
      display_order: parseInt(display_order),
      featured: featured === true,
      visible: visible === true
    };
    this.saveLocalGalleryMetadata(metadata);

    const db = getLocalDB();
    db.gallery = db.gallery || [];
    db.gallery.push({
      ...savedItem,
      display_order: parseInt(display_order),
      featured: featured === true,
      visible: visible === true
    });
    saveLocalDB(db);

    return savedItem;
  },

  async updateGalleryItem(id, title, caption, category, src = null, display_order = null, featured = null, visible = null) {
    const db = getLocalDB();
    const idInt = parseInt(id);

    // Prepare metadata
    const metadata = this.getLocalGalleryMetadata();
    if (!metadata[id]) metadata[id] = {};
    if (display_order !== null) metadata[id].display_order = parseInt(display_order);
    if (featured !== null) metadata[id].featured = featured === true;
    if (visible !== null) metadata[id].visible = visible === true;
    this.saveLocalGalleryMetadata(metadata);

    // Update locally
    db.gallery = (db.gallery || []).map(item => {
      if (item.id === idInt || item.id === id) {
        const updated = { ...item, title, caption, category };
        if (src) updated.src = src;
        if (display_order !== null) updated.display_order = parseInt(display_order);
        if (featured !== null) updated.featured = featured === true;
        if (visible !== null) updated.visible = visible === true;
        return updated;
      }
      return item;
    });
    saveLocalDB(db);

    // Update Supabase
    if (USE_SUPABASE && dbClient) {
      const updateData = { title, caption, category };
      if (src) updateData.src = src;
      if (display_order !== null) updateData.display_order = parseInt(display_order);
      if (featured !== null) updateData.featured = featured === true;
      if (visible !== null) updateData.visible = visible === true;

      try {
        const { error } = await dbClient.from('gallery').update(updateData).eq('id', id);
        if (error) {
          console.warn("[DB] Supabase update failed with full columns, retrying with core columns only. Error:", error);
          const retryData = { title, caption, category };
          if (src) retryData.src = src;
          await dbClient.from('gallery').update(retryData).eq('id', id);
        }
      } catch (err) {
        console.error("[DB] Exception updating Supabase gallery:", err);
      }
    }
    return true;
  },

  async deleteGalleryItem(id) {
    if (USE_SUPABASE && dbClient) {
      await dbClient.from('gallery').delete().eq('id', id);
    }
    const db = getLocalDB();
    db.gallery = (db.gallery || []).filter(item => item.id !== parseInt(id) && item.id !== id);
    saveLocalDB(db);

    // Clean up local metadata
    const metadata = this.getLocalGalleryMetadata();
    if (metadata[id]) {
      delete metadata[id];
      this.saveLocalGalleryMetadata(metadata);
    }
    return true;
  },

  // G. SECURITY CREDENTIALS
  async getAdminCreds() {
    const db = getLocalDB();
    return db.admin_creds || { username: "admin", password: "yogamrit@2026" };
  },

  async updateAdminCreds(username, password) {
    const db = getLocalDB();
    db.admin_creds = { username, password };
    saveLocalDB(db);
    return true;
  },

  // H. GALLERY CATEGORIES
  async getGalleryCategories() {
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient.from('gallery_categories').select('*');
      if (!error) return data;
    }
    const db = getLocalDB();
    return db.gallery_categories || DEFAULT_DATABASE.gallery_categories;
  },

  async addGalleryCategory(name) {
    const id = name.toLowerCase().trim().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient.from('gallery_categories').insert([{ id, name }]).select();
      if (!error && data && data.length > 0) {
        const db = getLocalDB();
        if (!db.gallery_categories) db.gallery_categories = [...DEFAULT_DATABASE.gallery_categories];
        if (!db.gallery_categories.find(c => c.id === id)) {
          db.gallery_categories.push(data[0]);
          saveLocalDB(db);
        }
        return data[0];
      }
    }
    const db = getLocalDB();
    if (!db.gallery_categories) {
      db.gallery_categories = [
        { id: "training", name: "Training Batches" },
        { id: "kids", name: "Kids Classes" },
        { id: "competitions", name: "Competitions" },
        { id: "awards", name: "Awards & Medals" }
      ];
    }
    if (db.gallery_categories.find(c => c.id === id)) {
      return false;
    }
    const newCategory = { id, name };
    db.gallery_categories.push(newCategory);
    saveLocalDB(db);
    return newCategory;
  },

  // I. YOUTUBE VIDEO SHOWCASE
  async getYoutubeVideos() {
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient.from('youtube_videos').select('*').order('id', { ascending: true });
      if (!error) return data;
    }
    return getLocalDB().youtube_videos || [];
  },

  async addYoutubeVideo(video_id, title, desc) {
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient.from('youtube_videos').insert([{ video_id, title, desc }]).select();
      if (!error && data && data.length > 0) {
        const db = getLocalDB();
        db.youtube_videos = db.youtube_videos || [];
        db.youtube_videos.push(data[0]);
        saveLocalDB(db);
        return data[0];
      }
    }
    const db = getLocalDB();
    const newItem = {
      id: Date.now(),
      video_id,
      title,
      desc
    };
    db.youtube_videos = db.youtube_videos || [];
    db.youtube_videos.push(newItem);
    saveLocalDB(db);
    return newItem;
  },

  async updateYoutubeVideo(id, video_id, title, desc) {
    if (USE_SUPABASE && dbClient) {
      await dbClient.from('youtube_videos').update({ video_id, title, desc }).eq('id', id);
    }
    const db = getLocalDB();
    db.youtube_videos = db.youtube_videos || [];
    db.youtube_videos = db.youtube_videos.map(v => {
      if (v.id === parseInt(id)) {
        return { ...v, video_id, title, desc };
      }
      return v;
    });
    saveLocalDB(db);
    return true;
  },

  async deleteYoutubeVideo(id) {
    if (USE_SUPABASE && dbClient) {
      await dbClient.from('youtube_videos').delete().eq('id', id);
    }
    const db = getLocalDB();
    db.youtube_videos = db.youtube_videos || [];
    db.youtube_videos = db.youtube_videos.filter(v => v.id !== parseInt(id));
    saveLocalDB(db);
    return true;
  },

  // J. FREE TRIAL BOOKINGS
  parseBookingDetails(b) {
    if (!b) return b;
    let mode = b.mode;
    let experience = b.experience;
    let source = b.source;
    let cleanNotes = b.notes || "";
    
    // Check if fields are missing/null, and try to parse from notes
    const modeMatch = cleanNotes.match(/\[Class Mode:\s*([^\]]+)\]/);
    const expMatch = cleanNotes.match(/\[Experience Level:\s*([^\]]+)\]/);
    const srcMatch = cleanNotes.match(/\[Source:\s*([^\]]+)\]/);
    
    if (modeMatch) {
      mode = modeMatch[1];
      cleanNotes = cleanNotes.replace(/\[Class Mode:\s*([^\]]+)\]\n?/, "");
    }
    if (expMatch) {
      experience = expMatch[1];
      cleanNotes = cleanNotes.replace(/\[Experience Level:\s*([^\]]+)\]\n?/, "");
    }
    if (srcMatch) {
      source = srcMatch[1];
      cleanNotes = cleanNotes.replace(/\[Source:\s*([^\]]+)\]\n?/, "");
    }
    
    return {
      ...b,
      mode: mode || "Personal Offline",
      experience: experience || "Not specified",
      source: source || "Not specified",
      notes: cleanNotes.trim()
    };
  },

  async getTrialBookings() {
    let bookings = [];
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient
        .from('trial_bookings')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) {
        bookings = data;
      }
    } else {
      const db = getLocalDB();
      const list = db.trial_bookings || [];
      bookings = [...list].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
    return bookings.map(b => this.parseBookingDetails(b));
  },

  async addTrialBooking(name, phone, age, gender, city, modeOrBatch, batchOrGoal, goalOrNotes, experienceOrNotes = "", source = "", notes = "") {
    let mode = "Personal Offline";
    let batch = "";
    let goal = "";
    let experience = "";
    let src = "";
    let actualNotes = "";

    const modeOptions = ["Personal Offline", "Group Offline", "Personal Online", "Group Online"];
    if (modeOptions.includes(modeOrBatch)) {
      mode = modeOrBatch;
      batch = batchOrGoal;
      goal = goalOrNotes;
      experience = experienceOrNotes;
      src = source;
      actualNotes = notes || "";
    } else {
      batch = modeOrBatch;
      goal = batchOrGoal;
      actualNotes = goalOrNotes || "";
    }

    const newRecord = {
      name,
      phone,
      age: age ? parseInt(age) : null,
      gender,
      city,
      mode,
      batch,
      goal,
      experience,
      source: src,
      notes: actualNotes,
      status: "New",
      created_at: new Date().toISOString()
    };
    
    if (USE_SUPABASE && dbClient) {
      try {
        const { data, error } = await dbClient
          .from('trial_bookings')
          .insert([newRecord])
          .select();
        if (!error && data && data.length > 0) {
          const db = getLocalDB();
          db.trial_bookings = db.trial_bookings || [];
          db.trial_bookings.push(data[0]);
          saveLocalDB(db);
          return this.parseBookingDetails(data[0]);
        }
        if (error) {
          throw error;
        }
      } catch (err) {
        console.warn("[DB] Supabase insert failed. Retrying with fallback serialization...", err);
        
        const serializedNotes = `[Class Mode: ${mode}]\n[Experience Level: ${experience || 'Not specified'}]\n[Source: ${src || 'Not specified'}]\n\n${actualNotes}`;
        
        const safeRecord = {
          name,
          phone,
          age: age ? parseInt(age) : null,
          gender,
          city,
          batch,
          goal,
          notes: serializedNotes,
          status: "New",
          created_at: newRecord.created_at
        };

        const { data, error: fallbackError } = await dbClient
          .from('trial_bookings')
          .insert([safeRecord])
          .select();

        if (!fallbackError && data && data.length > 0) {
          const db = getLocalDB();
          db.trial_bookings = db.trial_bookings || [];
          db.trial_bookings.push(data[0]);
          saveLocalDB(db);
          return this.parseBookingDetails(data[0]);
        }
      }
    }
    
    const db = getLocalDB();
    db.trial_bookings = db.trial_bookings || [];
    const localRecord = { ...newRecord, id: Date.now() };
    db.trial_bookings.push(localRecord);
    saveLocalDB(db);
    return this.parseBookingDetails(localRecord);
  },

  async updateTrialBookingStatus(id, status) {
    if (USE_SUPABASE && dbClient) {
      await dbClient.from('trial_bookings').update({ status }).eq('id', id);
    }
    const db = getLocalDB();
    db.trial_bookings = db.trial_bookings || [];
    db.trial_bookings = db.trial_bookings.map(b => {
      if (b.id === parseInt(id) || b.id === id) {
        return { ...b, status };
      }
      return b;
    });
    saveLocalDB(db);
    return true;
  },

  async deleteTrialBooking(id) {
    if (USE_SUPABASE && dbClient) {
      await dbClient.from('trial_bookings').delete().eq('id', id);
    }
    const db = getLocalDB();
    db.trial_bookings = db.trial_bookings || [];
    db.trial_bookings = db.trial_bookings.filter(b => b.id !== parseInt(id) && b.id !== id);
    saveLocalDB(db);
    return true;
  },

  // I. CERTIFICATE SYSTEM
  async getCertificates() {
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) return data;
      console.error("Error fetching certificates:", error);
    }
    const db = getLocalDB();
    return db.certificates || [];
  },

  async getCertificateById(id) {
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient
        .from('certificates')
        .select('*')
        .eq('certificate_id', id.toUpperCase())
        .single();
      if (!error) return data;
      console.error("Error fetching certificate by ID:", error);
    }
    const db = getLocalDB();
    return (db.certificates || []).find(c => c.certificate_id === id.toUpperCase()) || null;
  },

  async getCertificatesByMobile(mobile) {
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient
        .from('certificates')
        .select('*')
        .eq('mobile_number', mobile)
        .order('created_at', { ascending: false });
      if (!error) return data;
      console.error("Error fetching certificates by mobile:", error);
    }
    const db = getLocalDB();
    return (db.certificates || []).filter(c => c.mobile_number === mobile);
  },

  async createCertificate(certData) {
    let certificate_id = certData.certificate_id;
    if (USE_SUPABASE && dbClient) {
      const { data: generatedId, error: rpcError } = await dbClient.rpc('generate_certificate_id');
      if (!rpcError && generatedId) {
        certificate_id = generatedId;
      } else {
        console.error("Error generating ID via RPC, using fallback:", rpcError);
        certificate_id = `YM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const { data, error } = await dbClient
        .from('certificates')
        .insert([{ ...certData, certificate_id }])
        .select();
      if (!error && data && data.length > 0) {
        const db = getLocalDB();
        db.certificates = db.certificates || [];
        db.certificates.push(data[0]);
        saveLocalDB(db);
        return data[0];
      }
      if (error) throw new Error(error.message);
    }

    const db = getLocalDB();
    db.certificates = db.certificates || [];
    certificate_id = `YM-${new Date().getFullYear()}-${String(db.certificates.length + 1).padStart(4, '0')}`;
    const newCert = { ...certData, id: Date.now(), certificate_id, status: 'active', created_at: new Date().toISOString() };
    db.certificates.push(newCert);
    saveLocalDB(db);
    return newCert;
  },

  async updateCertificate(id, certData) {
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient
        .from('certificates')
        .update(certData)
        .eq('id', id)
        .select();
      if (!error && data && data.length > 0) {
        const db = getLocalDB();
        db.certificates = (db.certificates || []).map(c => c.id === id ? data[0] : c);
        saveLocalDB(db);
        return data[0];
      }
      if (error) throw new Error(error.message);
    }
    const db = getLocalDB();
    db.certificates = (db.certificates || []).map(c => {
      if (c.id === id || c.id === parseInt(id)) {
        return { ...c, ...certData };
      }
      return c;
    });
    saveLocalDB(db);
    return true;
  },

  async deleteCertificate(id) {
    if (USE_SUPABASE && dbClient) {
      await dbClient.from('certificates').delete().eq('id', id);
    }
    const db = getLocalDB();
    db.certificates = (db.certificates || []).filter(c => c.id !== id && c.id !== parseInt(id));
    saveLocalDB(db);
    return true;
  },

  async revokeCertificate(id, reason, date) {
    const revoked_at = date || new Date().toISOString();
    
    if (USE_SUPABASE && dbClient) {
      const { data: cert } = await dbClient.from('certificates').select('certificate_id').eq('id', id).single();
      
      if (cert) {
        await dbClient.from('certificates').update({ status: 'revoked' }).eq('id', id);
        await dbClient.from('revoked_certificates').upsert({
          id,
          certificate_id: cert.certificate_id,
          revoke_reason: reason,
          revoked_at
        });
      }
    }

    const db = getLocalDB();
    db.certificates = (db.certificates || []).map(c => {
      if (c.id === id || c.id === parseInt(id)) {
        return { ...c, status: 'revoked' };
      }
      return c;
    });
    db.revoked_logs = db.revoked_logs || [];
    db.revoked_logs.push({ id, certificate_id: id, revoke_reason: reason, revoked_at });
    saveLocalDB(db);
    return true;
  },

  async restoreCertificate(id) {
    console.log(`[restoreCertificate] Initiating restore for certificate: ${id}`);
    if (USE_SUPABASE && dbClient) {
      try {
        console.log(`[restoreCertificate] Querying Supabase: UPDATE certificates SET status='active' WHERE id='${id}'`);
        const { data: updateData, error: updateError } = await dbClient
          .from('certificates')
          .update({ status: 'active' })
          .eq('id', id)
          .select();
        
        console.log(`[restoreCertificate] Supabase UPDATE response:`, { data: updateData, error: updateError });
        if (updateError) throw updateError;
        
        if (!updateData || updateData.length === 0) {
          throw new Error("RLS policy violation: Anonymous update blocked on 'certificates' table.");
        }
        
        console.log(`[restoreCertificate] Querying Supabase: DELETE FROM revoked_certificates WHERE id='${id}'`);
        const { data: deleteData, error: deleteError } = await dbClient
          .from('revoked_certificates')
          .delete()
          .eq('id', id)
          .select();
          
        console.log(`[restoreCertificate] Supabase DELETE response:`, { data: deleteData, error: deleteError });
        if (deleteError) throw deleteError;
        
        if (!deleteData || deleteData.length === 0) {
          throw new Error("RLS policy violation: Anonymous delete blocked on 'revoked_certificates' table.");
        }
      } catch (err) {
        console.error("Supabase restore failed:", err);
        throw err;
      }
    }

    const db = getLocalDB();
    db.certificates = (db.certificates || []).map(c => {
      if (c.id === id || c.id === parseInt(id)) {
        const updated = { ...c, status: 'active' };
        delete updated.revoked_reason;
        delete updated.revoked_date;
        delete updated.revoked_at;
        return updated;
      }
      return c;
    });
    db.revoked_logs = (db.revoked_logs || []).filter(l => l.id !== id && l.id !== parseInt(id) && l.certificate_id !== id);
    saveLocalDB(db);
    return true;
  },

  async getRevokedCertificates() {
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient
        .from('revoked_certificates')
        .select(`
          id,
          certificate_id,
          revoke_reason,
          revoked_at,
          certificates (
            student_name,
            course_name,
            mobile_number
          )
        `);
      if (!error) {
        // format it cleanly
        return data.map(d => ({
          id: d.id,
          certificate_id: d.certificate_id,
          revoke_reason: d.revoke_reason,
          revoked_at: d.revoked_at,
          student_name: d.certificates?.student_name || "N/A",
          course_name: d.certificates?.course_name || "N/A",
          mobile_number: d.certificates?.mobile_number || "N/A"
        }));
      }
      console.error("Error fetching revoked certificates logs:", error);
    }
    const db = getLocalDB();
    return db.revoked_logs || [];
  },

  async getCertificateSettings() {
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient
        .from('certificate_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (!error) return data;
      console.error("Error fetching certificate settings:", error);
    }
    const db = getLocalDB();
    return db.certificate_settings || { id: 1, instructor_name: "Suresh Kumar", signature_url: "", seal_url: "" };
  },

  async updateCertificateSettings(settingsData) {
    if (USE_SUPABASE && dbClient) {
      const { data, error } = await dbClient
        .from('certificate_settings')
        .upsert({ id: 1, ...settingsData, updated_at: new Date().toISOString() })
        .select();
      if (!error && data && data.length > 0) {
        const db = getLocalDB();
        db.certificate_settings = data[0];
        saveLocalDB(db);
        return data[0];
      }
      if (error) throw new Error(error.message);
    }
    const db = getLocalDB();
    db.certificate_settings = { id: 1, ...settingsData };
    saveLocalDB(db);
    return true;
  }
};

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

// Export to window so other scripts (app.js, admin.html) can access it
window.dbService = dbService;
window.DEFAULT_DATABASE = DEFAULT_DATABASE;
window.getLocalDB = getLocalDB;
