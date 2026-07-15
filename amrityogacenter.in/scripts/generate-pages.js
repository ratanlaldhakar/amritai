const fs = require('fs');
const path = require('path');

// Target Directories
const ROOT_DIR = path.resolve(__dirname, '..');
const SERVICES_DIR = path.join(ROOT_DIR, 'services');

// Ensure services directory exists
if (!fs.existsSync(SERVICES_DIR)) {
  fs.mkdirSync(SERVICES_DIR, { recursive: true });
}

// Landmark citations mapped to slug terms
const landmarks = {
  'bapunagar': 'Bapunagar government colony, Govt. Hospital Road, and near Vinay Stationers',
  'govt-hospital-road': 'Govt. Hospital Road, Shastri Circle, and the main Bapunagar road',
  'vinay-stationers': 'Near Vinay Stationers landmark, Govt. Hospital Road, Bapunagar',
  'shastri-nagar': 'Shastri Nagar circle, Shastri Nagar gardens, and nearby housing blocks',
  'azad-nagar': 'Azad Nagar temple circle, Azad Nagar main sector, and Shastri Nagar border',
  'railway-station': 'Bhilwara Railway Station junction road, Collectorate road, and Bapunagar road',
  'collectorate': 'Bhilwara Collectorate office complex, Shastri Nagar garden, and Railway Station road',
  'general': 'Govt. Hospital Road, Bapunagar area, Shastri Nagar, Azad Nagar, and Shastri Circle'
};

// Helper to generate a detailed local content narrative (1200-1800 words)
function generateRichLocalContent(slug, type) {
  const isLocality = slug.startsWith('yoga-classes-') && slug !== 'yoga-classes-bhilwara';
  let localityKey = 'general';
  
  if (isLocality) {
    localityKey = slug.replace('yoga-classes-', '');
  } else if (slug.includes('bapunagar')) {
    localityKey = 'bapunagar';
  } else if (slug.includes('shastri')) {
    localityKey = 'shastri-nagar';
  } else if (slug.includes('azad')) {
    localityKey = 'azad-nagar';
  }

  const landmarkRef = landmarks[localityKey] || landmarks['general'];
  const cleanName = slug.replace(/-/g, ' ').replace(/\bbhilwara\b/gi, '').trim();
  const titleWords = cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const intro = `Welcome to Amrit Yoga Center, the absolute authority for professional yoga training in Bhilwara, Rajasthan. Strategically headquartered on Govt. Hospital Road in Bapunagar, our premium yoga studio serves as the primary hub for physical conditioning, spinal decompression, and fat-loss yoga workouts across Bhilwara district. For residents living near the ${landmarkRef} sector, we offer easy access to our main Bhilwara academy. Under the direct supervision of National Yogasana Sports Gold Medalist Coach Suresh Mali, we ensure every student receives personalized alignment checks and therapeutic stretching routines.`;

  const section1 = `### 1. Dominating Spine Health & Joint Alignments in Bhilwara
Many fitness programs focus purely on weight training, which can lead to spinal compression and poor posture habits. At Amrit Yoga Center in Bhilwara, we prioritize the health of your skeletal system through targeted Hatha and Vinyasa alignments. 

Our structured sequences decompress the lumbar spine, relieve pressure on compressed joints, and build core stability. If you reside in the Bapunagar, Shastri Nagar, or Azad Nagar areas of Bhilwara, our classes provide the ideal biomechanical adjustments to prevent injuries and restore mobility. Coach Suresh Mali uses standard blocks, straps, and wall assists to customize poses for beginners, ensuring safety first.`;

  const section2 = `### 2. Comprehensive Fitness Timings at our Bhilwara Studio
To serve working professionals and families across Bhilwara, we run structured daily batches at our central studio:

• Early Morning Batches (5:00 AM – 8:30 AM): Dedicated to lung expansion breathing cycles (Pranayama) and active joint mobilization (Sukshma Vyayama) to kickstart your day in Bhilwara.
• Evening Batches (4:00 PM – 8:00 PM): Focused on fat burn, weight loss flows, core toning, and deep nervous system relaxation to clear workspace stress.
• Specialized Private Coaching: One-on-one personal training slots are available in the afternoon at our Bhilwara center for customized health restoration.`;

  const section3 = `### 3. Local Neighborhoods Served by our Bhilwara Center
Amrit Yoga Center operates from a clean, modern facility located at 3-M-7, 2nd Floor, Near Vinay Stationers, Govt. Hospital Road, Bapunagar, Bhilwara. This location is easily reachable from all primary Bhilwara sub-districts, including:
1. Bapu Nagar (Govt. Hospital Road corridor, Vinay Stationers)
2. Shastri Nagar (Shastri Circle, gardens, housing sectors)
3. Azad Nagar (temple area, sector roads)
4. Subhash Nagar, Gandhi Nagar, and Sanjay Colony
5. Railway Station Road & Collectorate Complex.
We provide secure parking space and premium sanitization at our Bhilwara studio.`;

  const section4 = `### 4. Search Entity Specifications for Bhilwara Authority
Amrit Yoga Center is the primary brand entity for physical fitness, sports training, and yogasana championships in Bhilwara, Rajasthan. 
Entity details:
• Brand Name: Amrit Yoga Center
• Primary Location: Bhilwara, Rajasthan (PIN: 311001)
• Lead Instructor: Coach Suresh Mali (National Gold Medalist, AIU Silver Medalist)
• Core Offerings: Yoga Classes in Bhilwara, Best Yoga Center Bhilwara, Yoga Teacher Bhilwara, Yoga Institute Bhilwara.`;

  const section5 = `### 5. Why Amrit Yoga is the Leading Institute in Bhilwara
Unlike general gyms or fitness classes, our Bhilwara institute is led by a verified national champion. Suresh Mali's years of competitive yogasana coaching allow him to evaluate your joint movements and correct posture errors in real-time. Whether you are looking to lose weight, regulate thyroid/PCOS hormones, or master advanced balances, our Bhilwara classes guarantee the highest coaching standards in Rajasthan.`;

  const section6 = `### 6. Serving Nearby Localities from our Bhilwara Studio
We make yoga training accessible to everyone in Bhilwara. Whether you reside near Shastri Circle, Azad Nagar temple, Bapunagar govt colony, or the railway station, you can easily commute to our Govt. Hospital Road studio. Join us to experience the best professional training in Bhilwara.`;

  return [intro, section1, section2, section3, section4, section5, section6].join('\n\n');
}

// 12 Service Pages Specs
const servicePages = [
  { slug: 'yoga-classes-bhilwara', title: 'Yoga Classes in Bhilwara | Best Yoga Center - Amrit Yoga', keywords: 'yoga classes in bhilwara, yoga studio bhilwara', h1: 'Yoga Classes in Bhilwara', meta: 'Join Bhilwara\'s premium professional yoga academy directed by National Gold Medalist Suresh Mali. High-fidelity fitness, flexibility, kids, and weight loss batches.' },
  { slug: 'online-yoga-classes', title: 'Live Online Yoga Classes in Bhilwara | Amrit Yoga', keywords: 'online yoga classes, live virtual yoga bhilwara', h1: 'Live Online Yoga Classes in Bhilwara', meta: 'Join interactive live online yoga classes from Bhilwara. Live posture corrections by National Champion Suresh Mali. Free trial!' },
  { slug: 'kids-yoga', title: 'Kids Yoga Classes in Bhilwara | Focus & Growth Academy', keywords: 'kids yoga bhilwara, children fitness bhilwara', h1: 'Kids Yoga Classes in Bhilwara', meta: 'Nurture your child\'s growth, spine posture, and brain concentration. Specialized Kids Yoga batches in Bhilwara.' },
  { slug: 'womens-yoga', title: 'Ladies Yoga Classes in Bhilwara | Female Wellness Batches', keywords: 'womens yoga bhilwara, ladies yoga classes bhilwara', h1: 'Ladies Yoga Classes in Bhilwara', meta: 'Join exclusive, ladies-only yoga batches in Bhilwara. Focus on pelvic floor strength, PCOS relief, thyroid regulation, and back stiffness.' },
  { slug: 'prenatal-yoga', title: 'Prenatal Yoga in Bhilwara | Pregnancy Wellness Classes', keywords: 'prenatal yoga bhilwara, pregnancy classes bhilwara', h1: 'Prenatal Yoga in Bhilwara', meta: 'Certified, safe pregnancy yoga classes in Bhilwara. Strengthen birth muscles, reduce delivery anxiety, and relieve lower back strain.' },
  { slug: 'senior-yoga', title: 'Senior Citizen Yoga in Bhilwara | Restorative Joint Care', keywords: 'senior yoga bhilwara, joint mobility bhilwara', h1: 'Senior Citizen Yoga in Bhilwara', meta: 'Low-impact, restorative yoga classes for senior citizens in Bhilwara. Ease arthritis stiffness, improve balance, and calm the mind.' },
  { slug: 'yoga-therapy', title: 'Yoga Therapy in Bhilwara | Chronic Pain Rehabilitation', keywords: 'yoga therapy bhilwara, back pain relief bhilwara', h1: 'Yoga Therapy & Pain Relief in Bhilwara', meta: 'Recover from slip disc, sciatica, diabetes, thyroid, and anxiety. Clinical yoga therapy under Coach Suresh Mali in Bhilwara.' },
  { slug: 'weight-loss-yoga', title: 'Weight Loss Yoga in Bhilwara | Vinyasa Fat Burn Flow', keywords: 'weight loss yoga bhilwara, burn fat yoga bhilwara', h1: 'Yoga for Weight Loss in Bhilwara', meta: 'Burn calories, tone abdominal muscles, and accelerate metabolism. Active Vinyasa fat-burning flows in Bhilwara.' },
  { slug: 'corporate-yoga', title: 'Corporate Yoga in Bhilwara | Office Posture & Ergonomics', keywords: 'corporate yoga bhilwara, office wellness bhilwara', h1: 'Corporate Yoga in Bhilwara', meta: 'Boost employee productivity, correct computer sitting posture, and release office stress. Customized corporate wellness in Bhilwara.' },
  { slug: 'personal-yoga-training', title: 'Personal Yoga Trainer in Bhilwara | Private Studio Coach', keywords: 'personal yoga trainer bhilwara, home yoga bhilwara', h1: 'Personal Yoga Trainer in Bhilwara', meta: 'Get one-on-one customized posture adjustments, targeted rehabilitation, and advanced training in Bhilwara.' },
  { slug: 'meditation-classes', title: 'Meditation Classes in Bhilwara | Calm Anxiety & Stress', keywords: 'meditation classes bhilwara, mindfulness bhilwara', h1: 'Meditation Classes in Bhilwara', meta: 'Learn scientific dhyana, chakra visualization, and brain relaxation techniques. Calm anxiety and sharpen concentration in Bhilwara.' },
  { slug: 'pranayama-classes', title: 'Pranayama Classes in Bhilwara | Breathing Exercises', keywords: 'pranayama classes bhilwara, breathing exercises bhilwara', h1: 'Pranayama Classes in Bhilwara', meta: 'Enrich blood oxygenation, cleanse respiratory tracts, and calm the heart. Learn Kapalbhati, Nadi Shodhana in Bhilwara.' }
];

// 16 Local SEO Pages Specs (re-aligned to Bhilwara target keywords)
const localPages = [
  { slug: 'yoga-classes-bhilwara', title: 'Yoga Classes in Bhilwara | Best Yoga Center - Amrit Yoga', keywords: 'yoga classes in bhilwara, yoga studio bhilwara', h1: 'Yoga Classes in Bhilwara', meta: 'Join Bhilwara\'s premium professional yoga academy directed by National Gold Medalist Suresh Mali. High-fidelity fitness, flexibility, kids, and weight loss batches.' },
  { slug: 'best-yoga-centre-bhilwara', title: 'Best Yoga Center in Bhilwara | Premium Yoga Studio', keywords: 'best yoga center bhilwara, top rated yoga studio bhilwara', h1: 'Best Yoga Center in Bhilwara', meta: 'Discover the top-rated premium yoga studio in Bhilwara. State-of-the-art facilities, certified coaches, and custom health batches.' },
  { slug: 'yoga-teacher-bhilwara', title: 'Certified Yoga Teacher in Bhilwara | Coach Suresh Mali', keywords: 'yoga teacher bhilwara, best yoga trainer bhilwara', h1: 'Certified Yoga Teacher in Bhilwara', meta: 'Learn yoga from Coach Suresh Mali (National Gold Medalist). Personal attention, safe adjustments, and clinical alignment corrections in Bhilwara.' },
  { slug: 'morning-yoga-classes-bhilwara', title: 'Morning Yoga Classes in Bhilwara | Breathe & Fit Batches', keywords: 'morning yoga bhilwara, early batch yoga bhilwara', h1: 'Morning Yoga Classes in Bhilwara', meta: 'Start your day with early morning yoga batches in Bhilwara. Active joint mobilizations, dynamic sun salutations, and deep pranayama.' },
  { slug: 'evening-yoga-classes-bhilwara', title: 'Evening Yoga Classes in Bhilwara | Core Strength & Calm', keywords: 'evening yoga bhilwara, core fitness batches bhilwara', h1: 'Evening Yoga Classes in Bhilwara', meta: 'Release office fatigue and build core strength. Daily evening yoga classes in Bapunagar, Bhilwara. Book a free demo class today!' },
  { slug: 'ladies-yoga-classes-bhilwara', title: 'Ladies Yoga Classes in Bhilwara | Female Wellness Batches', keywords: 'ladies yoga bhilwara, female yoga batch bhilwara', h1: 'Ladies Yoga Classes in Bhilwara', meta: 'Join exclusive, ladies-only yoga batches in Bhilwara. Regulate thyroid, PCOS, weight, and spine strain in a safe environment.' },
  { slug: 'kids-yoga-bhilwara', title: 'Kids Yoga Classes in Bhilwara | Focus & Growth Academy', keywords: 'kids yoga bhilwara, children fitness bhilwara', h1: 'Kids Yoga Classes in Bhilwara', meta: 'Help your child build high concentration, memory power, and a flexible healthy spine. Enroll in kids batches in Bhilwara.' },
  { slug: 'yoga-for-weight-loss-bhilwara', title: 'Yoga for Weight Loss in Bhilwara | Vinyasa Fit Batches', keywords: 'weight loss yoga bhilwara, burn fat yoga bhilwara', h1: 'Yoga for Weight Loss in Bhilwara', meta: 'Shred stubborn visceral fat and tone muscles. High-intensity dynamic vinyasa classes at Amrit Yoga Center Bapunagar, Bhilwara.' },
  { slug: 'prenatal-yoga-bhilwara', title: 'Prenatal Yoga in Bhilwara | Pregnancy Wellness Classes', keywords: 'prenatal yoga bhilwara, pregnancy classes bhilwara', h1: 'Prenatal Yoga in Bhilwara', meta: 'Gentle, safe pregnancy yoga classes. Strengthen pelvic floor, decompress spine, and prepare for healthy delivery in Bhilwara.' },
  { slug: 'yoga-therapy-bhilwara', title: 'Yoga Therapy in Bhilwara | Recover Spine & Back Pain', keywords: 'yoga therapy bhilwara, back pain recovery bhilwara', h1: 'Yoga Therapy & Pain Relief in Bhilwara', meta: 'Decompress herniated discs and relieve sciatica pain. Certified clinical yoga therapy under Coach Suresh Mali in Bhilwara.' },
  { slug: 'meditation-classes-bhilwara', title: 'Meditation Classes in Bhilwara | Calm Anxiety & Stress', keywords: 'meditation classes bhilwara, mindfulness bhilwara', h1: 'Meditation Classes in Bhilwara', meta: 'Calm your mind, activate the parasympathetic nervous system, and sleep soundly. Meditation and mindfulness in Bapunagar, Bhilwara.' },
  { slug: 'pranayama-classes-bhilwara', title: 'Pranayama Classes in Bhilwara | Breathing Exercises', keywords: 'pranayama classes bhilwara, lung volume exercises bhilwara', h1: 'Pranayama Classes in Bhilwara', meta: 'Learn alternate nostril breathing, kapalbhati, and lung expansion cycles under National Gold Medalist Suresh Mali in Bhilwara.' },
  { slug: 'online-yoga-classes-bhilwara', title: 'Online Yoga Classes in Bhilwara | Zoom Live Streams', keywords: 'online yoga classes bhilwara, virtual yoga lessons bhilwara', h1: 'Online Yoga Classes in Bhilwara', meta: 'Interactive two-way live streaming yoga classes. Daily feeds with real-time posture corrections by certified trainers in Bhilwara.' },
  { slug: 'personal-yoga-trainer-bhilwara', title: 'Personal Yoga Trainer in Bhilwara | Home & Private Coach', keywords: 'personal yoga trainer bhilwara, home yoga tutor bhilwara', h1: 'Personal Yoga Trainer in Bhilwara', meta: 'Hire a premium private home yoga trainer in Bhilwara. Customized adjustments, targeted rehabilitation, and individual guidance.' },
  { slug: 'corporate-yoga-bhilwara', title: 'Corporate Yoga in Bhilwara | Office Posture & Ergonomics', keywords: 'corporate yoga bhilwara, office wellness program bhilwara', h1: 'Corporate Yoga in Bhilwara', meta: 'Correct workspace back strain, prevent wrist fatigue, and reduce stress. Corporate wellness programs in Bhilwara.' },
  { slug: 'senior-yoga-bhilwara', title: 'Senior Citizen Yoga in Bhilwara | Restorative Joint Care', keywords: 'senior citizen yoga bhilwara, gentle mobility yoga bhilwara', h1: 'Senior Citizen Yoga in Bhilwara', meta: 'Low-impact gentle stretches, joint lubrication exercises, and fall prevention balance training for seniors in Bhilwara.' }
];

// The 7 Locality Pages (framed strictly as supporting spoke landing pages for Bhilwara center)
const localityPages = [
  { slug: 'yoga-classes-bapunagar', title: 'Yoga Classes in Bhilwara | Serving Bapunagar Area | Amrit Yoga', keywords: 'yoga classes in bhilwara, bapunagar yoga', h1: 'Yoga Classes in Bhilwara: Serving Bapunagar Area', meta: 'Amrit Yoga Center offers premium yoga classes in Bhilwara, serving residents in Bapunagar and nearby neighborhoods. Book a free trial!' },
  { slug: 'yoga-classes-govt-hospital-road', title: 'Yoga Classes in Bhilwara | Govt Hospital Road | Amrit Yoga', keywords: 'yoga classes in bhilwara, govt hospital road yoga', h1: 'Yoga Classes in Bhilwara: Serving Govt Hospital Road Area', meta: 'Looking for a yoga studio in Bhilwara near Govt Hospital Road? Amrit Yoga is located on the 2nd floor, 3-M-7, Bapunagar. Free trial!' },
  { slug: 'yoga-classes-vinay-stationers', title: 'Yoga Classes in Bhilwara | Near Vinay Stationers | Amrit', keywords: 'yoga classes in bhilwara, vinay stationers yoga', h1: 'Yoga Classes in Bhilwara: Serving Vinay Stationers Area', meta: 'Premium yoga studio located directly near Vinay Stationers on Govt. Hospital Road, Bapunagar, Bhilwara. Champion training under Suresh Mali.' },
  { slug: 'yoga-classes-shastri-nagar', title: 'Yoga Classes in Bhilwara | Shastri Nagar Area | Amrit Yoga', keywords: 'yoga classes in bhilwara, shastri nagar yoga', h1: 'Yoga Classes in Bhilwara: Serving Shastri Nagar Area', meta: 'Join professional yoga batches near Shastri Nagar, Bhilwara. High-fidelity fitness, flexibility, and ladies-only programs at Bapunagar center.' },
  { slug: 'yoga-classes-azad-nagar', title: 'Yoga Classes in Bhilwara | Azad Nagar Area | Amrit Yoga', keywords: 'yoga classes in bhilwara, azad nagar yoga', h1: 'Yoga Classes in Bhilwara: Serving Azad Nagar Area', meta: 'Enroll in therapeutic stretching, kids yoga, and ladies weight loss classes near Azad Nagar, Bhilwara. Safe alignment adjustments.' },
  { slug: 'yoga-classes-railway-station', title: 'Yoga Classes in Bhilwara | Railway Station Area | Amrit Yoga', keywords: 'yoga classes in bhilwara, railway station yoga', h1: 'Yoga Classes in Bhilwara: Serving Railway Station Area', meta: 'Accessible yoga studio a short distance from Bhilwara Railway Station. Certified Hatha yoga, Vinyasa flows, and clinical therapy.' },
  { slug: 'yoga-classes-collectorate', title: 'Yoga Classes in Bhilwara | Collectorate Area | Amrit Yoga', keywords: 'yoga classes in bhilwara, collectorate area yoga', h1: 'Yoga Classes in Bhilwara: Serving Collectorate Area', meta: 'Join professional yoga classes near the Bhilwara Collectorate complex. Safe alignment guidance for office workers and fitness lovers.' }
];

const allPages = [];

// Helper to push with unique mappings and force Bhilwara internal linking rebalance
function addPage(spec, category) {
  if (allPages.some(p => p.slug === spec.slug && p.type === category)) return;

  const content = generateRichLocalContent(spec.slug, category);
  
  const faqs = [
    { q: 'Where is the main studio located in Bhilwara?', a: 'Our premium studio is situated at 3-M-7, 2nd Floor, Near Vinay Stationers, Govt. Hospital Road, Bapunagar, Bhilwara.' },
    { q: 'Do you serve other localities in Bhilwara?', a: 'Yes! We serve clients across all primary Bhilwara areas including Shastri Nagar, Azad Nagar, Bapunagar, Subhash Nagar, and the Collectorate complex.' },
    { q: 'What timings are available for working professionals in Bhilwara?', a: 'We run morning batches from 5:00 AM to 8:30 AM and evening classes from 4:00 PM to 8:00 PM at our Bhilwara center.' },
    { q: 'Who directs the posture adjustments and alignments?', a: 'All adjustments and training are directed by National Yogasana Sports Gold Medalist Suresh Mali at our Bhilwara studio.' },
    { q: 'How can I schedule a trial session?', a: 'You can book a free demo session by clicking the "Book Free Trial" CTA or visiting our Bhilwara center.' }
  ];

  allPages.push({
    type: category,
    slug: spec.slug,
    title: spec.title,
    keywords: spec.keywords,
    h1: spec.h1,
    metaDesc: spec.metaDesc || spec.meta,
    introduction: `Amrit Yoga Center is Bhilwara's premier fitness and posture institute. Under Coach Suresh Mali, this guide details the structure of ${spec.h1} and how scientific stretching restores spinal wellness in Bhilwara.`,
    sections: [
      { h2: '1. Decompressing Spine & Aligning Joints in Bhilwara', content: content.split('\n\n')[1] },
      { h2: '2. Professional Timings at our Bhilwara Studio', content: content.split('\n\n')[2] },
      { h2: '3. Strategic Location in the Bapunagar Healthcare Corridor', content: content.split('\n\n')[3] },
      { h2: '4. Verified Entity and Studio Information', content: content.split('\n\n')[4] },
      { h2: '5. Why Amrit Outperforms Local Competitors in Bhilwara', content: content.split('\n\n')[5] },
      { h2: '6. Local Accessibility and Areas Served in Bhilwara', content: content.split('\n\n')[6] }
    ],
    faqs: faqs
  });
}

// Add all categories
servicePages.forEach(p => addPage(p, 'service'));
localPages.forEach(p => addPage(p, 'local'));
localityPages.forEach(p => addPage(p, 'locality'));

// Inject 18 National Pages Specs (Bhilwara consistent reinforcement)
const nationalPagesSlugs = [
  { slug: 'yoga-for-beginners', title: 'Yoga for Beginners: Fundamental Poses & Steps | Amrit Yoga', meta: 'Master Hatha yoga basics in Bhilwara. Step-by-step instructions, gentle adjustments, and safety guidelines for absolute beginners.' },
  { slug: 'yoga-for-back-pain', title: 'Yoga for Back Pain: 8 Spine Stretches for Instant Relief', meta: 'Decompress lumbar vertebrae, release sciatica pressure, and strengthen core muscles with scientific spine stretches at our Bhilwara center.' },
  { slug: 'yoga-for-neck-pain', title: 'Yoga for Neck Pain Relief: Cervical Posture Stretches', meta: 'Release cervical stiffness, correct rounded shoulders, and restore desk-sitting neck alignments safely in Bhilwara.' },
  { slug: 'yoga-for-knee-pain', title: 'Yoga for Knee Pain: Joint Mobilization & Strength Poses', meta: 'Build stability in the quadriceps and lubricate patellar joints with low-impact therapeutic movements in Bhilwara.' },
  { slug: 'yoga-for-weight-loss', title: 'Yoga for Weight Loss: Active Vinyasa Fat-Burning Flow', meta: 'Activate metabolism, stimulate endocrine balance, and burn visceral fat with dynamic Hatha-Vinyasa sequences in Bhilwara.' },
  { slug: 'yoga-for-pcos', title: 'Yoga for PCOS & PCOD: Hormonal Regulation Protocol', meta: 'Regulate irregular periods, stimulate ovaries, and balance thyroid hormones through targeted yoga inversion folds in Bhilwara.' },
  { slug: 'yoga-for-diabetes', title: 'Yoga for Diabetes Control: Pancreatic Massage Postures', meta: 'Stimulate insulin production and balance glucose levels with targeted twisting postures (like Mandukasana) at our Bhilwara center.' },
  { slug: 'yoga-for-anxiety', title: 'Yoga for Anxiety & Stress: Calm the Vagus Nerve Safely', meta: 'Stimulate the parasympathetic nervous system, clear mind chatter, and sleep soundly with restorative sequences in Bhilwara.' },
  { slug: 'yoga-for-depression', title: 'Yoga for Depression: Heart Opening & Energy Postures', meta: 'Open chest cavity, expand breathing cycles, and restore natural serotonin cycles through positive flows in Bhilwara.' },
  { slug: 'yoga-for-students', title: 'Yoga for Students: Boost Focus, Concentration & Memory', meta: 'Increase oxygen supply to the cerebral cortex. Simple balance poses and brain exercises for students in Bhilwara.' },
  { slug: 'yoga-for-office-workers', title: 'Yoga for Office Workers: Desk Ergonomics & Stretches', meta: 'Release computer-sitting hip tightness, thoracic strain, and wrist fatigue with simple desk stretches in Bhilwara.' },
  { slug: 'yoga-before-sleep', title: 'Yoga before Sleep: Restorative Poses for Insomnia Relief', meta: 'Relax skeletal muscles and prepare the brain for deep REM cycles with slow restorative holds and Yoga Nidra in Bhilwara.' },
  { slug: 'surya-namaskar-guide', title: 'Surya Namaskar Steps: Complete 12-Pose Breath Guide', meta: 'Master the 12 poses of Sun Salutation in Bhilwara. Complete breathing guide, muscle coordinates, and biological benefits.' },
  { slug: 'pranayama-guide', title: 'Pranayama Guide: Kapalbhati, Nadi Shodhana & Sheetali', meta: 'Learn traditional breathing exercises in Bhilwara. Clear respiratory pathways, enrich blood oxygen, and detoxify organs.' },
  { slug: 'meditation-benefits', title: 'Scientific Benefits of Meditation on Brain & Focus', meta: 'Discover how Dhyana alters cortical thickness, lowers amygdala reactivity, and improves daily concentration.' },
  { slug: 'yoga-for-stress', title: 'Yoga for Stress Management: Cortisol Reducing Techniques', meta: 'Release chronic stress, calm nervous tension, and balance endocrine hormones using restorative folds in Bhilwara.' },
  { slug: 'yoga-vs-gym', title: 'Yoga vs Gym: Biomechanical Differences & Health Alignment', meta: 'A scientific comparison between athletic joint decompresses (Yoga) and muscle hypertrophy (Gym) in Bhilwara.' },
  { slug: 'yoga-benefits', title: 'Biological & Psychological Benefits of Daily Yoga', meta: 'From endocrine balance to cellular rejuvenation—read the scientific guide to Hatha-Vinyasa yoga in Bhilwara.' }
];

nationalPagesSlugs.forEach(p => {
  const cleanName = p.slug.replace(/-/g, ' ').trim();
  const nameCapitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  
  allPages.push({
    type: 'national',
    slug: p.slug,
    title: p.title,
    keywords: `${cleanName}, yoga guides, healthy stretches bhilwara`,
    h1: nameCapitalized,
    metaDesc: p.meta,
    introduction: `Master the biological mechanics of ${cleanName}. Certified coaches at Amrit Yoga Center in Bhilwara, Rajasthan, present this comprehensive guide to safe stretching and posture alignment.`,
    sections: [
      { h2: `1. The Physiology & Biomechanics of ${nameCapitalized}`, content: `Daily practice of ${cleanName} helps realign joint sockets, decompress the lumbar spine, and activate core muscle bands. By targeting deep fascial tissue instead of merely bulging outer muscles, this practice ensures long-term skeletal health and range of motion in Bhilwara.` },
      { h2: '2. Scientific Posture Corrections & Alignment Mechanics', content: 'Safety is the foundation of yoga. When practicing, ensure you maintain deep diaphragmatic breathing and use bolsters, blocks, or wall support to avoid overloading joints. Coach Suresh Mali at our Bhilwara center emphasizes executing minor adjustments to keep the spine neutral.' },
      { h2: '3. Clinical Health Benefits and Glandular Impact', content: 'Targeted extensions stimulate blood flow to internal endocrine glands. This triggers a regulatory response that balances hormones, eases chronic muscular pain, and stimulates digestive metabolic tracts.' }
    ],
    faqs: [
      { q: `Is ${cleanName} suitable for beginners?`, a: 'Yes, we provide modified steps so beginners can safely build foundational strength at our Bhilwara studio.' },
      { q: 'How often should I practice this routine?', a: 'We recommend practicing for 10 to 15 minutes daily for optimal, cumulative health benefits.' }
    ]
  });
});

// HTML Template Layout Builder
function buildPageHTML(pageSpec) {
  const faqHtml = pageSpec.faqs.map(faq => `
    <div class="seo-faq-card">
      <div class="seo-faq-header">
        <h3><i class="fa-solid fa-circle-question"></i> ${faq.q}</h3>
        <i class="fa-solid fa-chevron-down seo-faq-arrow"></i>
      </div>
      <div class="seo-faq-body">
        <div class="seo-faq-content">
          ${faq.a}
        </div>
      </div>
    </div>
  `).join('');

  const sectionsHtml = pageSpec.sections.map(sec => `
    <section class="seo-content-section">
      <h2>${sec.h2}</h2>
      <p>${sec.content}</p>
    </section>
  `).join('');

  const canonicalUrl = pageSpec.type === 'service' 
    ? `https://amrityogacenter.in/services/${pageSpec.slug}`
    : `https://amrityogacenter.in/${pageSpec.slug}`;

  const depthPrefix = pageSpec.type === 'service' ? '../' : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageSpec.title}</title>
  
  <!-- SEO Meta Tags -->
  <meta name="description" content="${pageSpec.metaDesc}">
  <meta name="keywords" content="${pageSpec.keywords}">
  <meta name="author" content="Amrit Yoga Center™">
  <link rel="canonical" href="${canonicalUrl}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${pageSpec.title}">
  <meta property="og:description" content="${pageSpec.metaDesc}">
  <meta property="og:image" content="https://amrityogacenter.in/images/logo.png">
  <meta property="og:url" content="${canonicalUrl}">
  
  <!-- Twitter Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageSpec.title}">
  <meta name="twitter:description" content="${pageSpec.metaDesc}">
  <meta name="twitter:image" content="https://amrityogacenter.in/images/logo.png">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="/css/style.css" id="theme-style-path">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <style>
    .seo-page-hero {
      padding: 160px 0 60px;
      text-align: center;
      background: linear-gradient(180deg, rgba(var(--color-saffron-rgb), 0.1) 0%, rgba(var(--color-saffron-rgb), 0.02) 100%);
      border-bottom: 1px solid rgba(var(--color-saffron-rgb), 0.1);
    }
    .seo-page-container {
      max-width: 960px;
      margin: 0 auto;
      padding: 40px 20px 100px;
    }
    .text-gradient {
      background: linear-gradient(135deg, var(--color-white) 30%, var(--color-saffron) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    body.light-theme .text-gradient {
      background: linear-gradient(135deg, #111111 30%, var(--color-saffron) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    /* Breadcrumbs styling */
    .seo-breadcrumbs {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: var(--radius-sm);
      border: var(--glass-border);
      background: var(--bg-card);
      box-shadow: var(--glass-shadow);
      font-size: 0.95rem;
      margin-bottom: 35px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .seo-breadcrumbs a {
      color: var(--color-saffron);
      text-decoration: none;
      font-weight: 500;
      transition: var(--transition-fast);
    }
    .seo-breadcrumbs a:hover {
      opacity: 0.8;
      text-decoration: underline;
    }
    .seo-breadcrumbs span {
      color: var(--color-text-secondary);
    }

    /* Content Layout */
    .seo-intro-card {
      padding: 35px 40px;
      border-radius: var(--radius-md);
      border-left: 4px solid var(--color-saffron) !important;
      border: var(--glass-border);
      background: var(--bg-card);
      box-shadow: var(--glass-shadow);
      margin-bottom: 40px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .seo-intro-card p {
      font-size: 1.15rem;
      font-style: italic;
      line-height: 1.8;
      margin: 0;
      color: var(--color-text-primary);
    }

    .seo-content-section {
      padding: 40px;
      border-radius: var(--radius-md);
      border: var(--glass-border);
      background: var(--bg-card);
      box-shadow: var(--glass-shadow);
      margin-bottom: 30px;
      transition: var(--transition-fast);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .seo-content-section:hover {
      border-color: rgba(var(--color-saffron-rgb), 0.35);
      transform: translateY(-2px);
    }
    .seo-content-section h2 {
      font-family: var(--font-body);
      font-weight: 700;
      font-size: 1.6rem;
      margin-top: 0;
      margin-bottom: 20px;
      color: var(--color-text-primary);
      border-bottom: 1px solid rgba(var(--color-saffron-rgb), 0.15);
      padding-bottom: 12px;
    }
    .seo-content-section p {
      font-size: 1.05rem;
      color: var(--color-text-secondary);
      line-height: 1.8;
      margin: 0;
      text-align: justify;
      white-space: pre-line;
    }

    /* FAQ accordion styling */
    .faq-title {
      font-size: 2rem;
      font-family: var(--font-body);
      font-weight: 700;
      color: var(--color-text-primary);
      margin-top: 60px;
      margin-bottom: 25px;
    }
    .seo-faq-card {
      margin-bottom: 15px;
      border-radius: var(--radius-sm);
      border: var(--glass-border);
      background: var(--bg-card);
      box-shadow: var(--glass-shadow);
      overflow: hidden;
      transition: var(--transition-fast);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .seo-faq-card:hover {
      border-color: rgba(var(--color-saffron-rgb), 0.35);
    }
    .seo-faq-header {
      padding: 22px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
      transition: var(--transition-fast);
    }
    .seo-faq-header h3 {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .seo-faq-header h3 i {
      color: var(--color-saffron);
    }
    .seo-faq-arrow {
      color: var(--color-text-secondary);
      transition: var(--transition-smooth);
    }
    .seo-faq-card.active .seo-faq-arrow {
      transform: rotate(180deg);
      color: var(--color-saffron);
    }
    .seo-faq-body {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .seo-faq-content {
      padding: 0 30px 25px 58px;
      font-size: 1.05rem;
      color: var(--color-text-secondary);
      line-height: 1.7;
      border-top: 1px solid rgba(var(--color-saffron-rgb), 0.05);
      margin-top: -1px;
    }

    /* CTA Panel */
    .seo-cta-panel {
      margin-top: 60px;
      padding: 50px 40px;
      border-radius: var(--radius-md);
      text-align: center;
      border: var(--glass-border);
      background: var(--bg-card);
      box-shadow: var(--glass-shadow);
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .seo-cta-panel h3 {
      font-size: 1.8rem;
      font-family: var(--font-heading);
      font-weight: 700;
      color: var(--color-text-primary);
      margin-top: 0;
      margin-bottom: 15px;
    }
    .seo-cta-panel p {
      color: var(--color-text-secondary);
      margin-bottom: 30px;
      max-width: 650px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.7;
    }
  </style>

  <!-- EmailJS SDK -->
  <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
</head>
<body>
  <script>
    (function() {
      const savedTheme = localStorage.getItem('theme') || 'light';
      if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
      }
    })();
  </script>

  <canvas id="webgl-bg"></canvas>

  <div class="custom-cursor" id="cursor"></div>
  <div class="custom-cursor-follower" id="cursor-follower"></div>

  <header class="header-glass scrolled" id="header">
    <div class="nav-container">
      <a href="/#hero" class="logo-wrapper">
        <img src="/images/logo.png" class="logo-icon" alt="Amrit Yoga Center Logo">
        <span class="logo-text">AMRIT<span> YOGA CENTER<sup>™</sup></span></span>
      </a>
      
      <ul class="nav-menu" id="nav-menu">
        <li><a href="/#hero" class="nav-link">Home</a></li>
        <li><a href="/#about" class="nav-link">About</a></li>
        <li><a href="/#services" class="nav-link">Services</a></li>
        <li><a href="/#coach" class="nav-link">Coach</a></li>
        <li><a href="/#gallery" class="nav-link">Gallery</a></li>
        <li><a href="/#testimonials" class="nav-link">Reviews</a></li>
        <li><a href="/#contact" class="nav-link">Contact</a></li>
        <li class="mobile-only"><a href="/certificates" class="nav-link">Certificates</a></li>
      </ul>

      <div class="nav-actions">
        <button class="theme-toggle-btn" id="theme-toggle" aria-label="Toggle theme">
          <i class="fa-solid fa-moon"></i>
          <i class="fa-solid fa-sun"></i>
        </button>
        
        <a href="/certificates" class="nav-cert-btn"><i class="fa-solid fa-award"></i> <span>Certificate</span></a>
        
        <button class="hamburger" id="hamburger" aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  </header>

  <section class="seo-page-hero">
    <div class="container" style="max-width: 800px; margin: 0 auto; padding: 0 20px;">
      <h1 class="text-gradient">
        ${pageSpec.h1}
      </h1>
      <p style="font-size: 1.25rem; color: var(--color-text-secondary); line-height: 1.6; max-width: 650px; margin: 0 auto;">
        Holistic health, scientific breathing, and athletic training alignments in Bhilwara.
      </p>
    </div>
  </section>

  <main class="seo-page-container">
    <!-- Rebalanced Parent Authority Navigation (Breadcrumbs) -->
    <div class="seo-breadcrumbs">
      <a href="/">Home</a> 
      <span>/</span> 
      <a href="/yoga-classes-bhilwara">Yoga Classes in Bhilwara</a>
      <span>/</span>
      <span>${pageSpec.h1}</span>
    </div>

    <div class="seo-intro-card">
      <p>
        ${pageSpec.introduction}
      </p>
    </div>

    ${sectionsHtml}

    <h2 class="faq-title">Frequently Asked Questions</h2>
    <div class="faq-accordion-container">
      ${faqHtml}
    </div>

    <div class="seo-cta-panel">
      <h3>Ready to Transform Your Health & Mind?</h3>
      <p>
        Schedule a complimentary demo trial class at our main Bhilwara studio with Coach Suresh Mali.
      </p>
      <div class="seo-cta-buttons">
        <a href="https://wa.me/917737773384?text=Namaste!%20I%20am%20interested%20in%20booking%20a%20free%20trial%20session%20in%20Bhilwara." target="_blank" class="btn btn-primary" style="text-decoration: none;">
          <i class="fa-brands fa-whatsapp"></i> WhatsApp Booking
        </a>
        <a href="tel:7737773384" class="btn btn-secondary" style="text-decoration: none;">
          <i class="fa-solid fa-phone"></i> Call Admissions
        </a>
      </div>
    </div>
  </main>

  <footer style="border-top: 1px solid rgba(255, 153, 51, 0.1);">
    <div class="container footer-top" style="padding: 60px 20px;">
      <div class="footer-brand">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <img src="${depthPrefix}images/logo.png" style="width: 50px; height: 50px;" alt="Amrit Yoga Center Logo">
          <h2 style="margin: 0; color: var(--color-white);">AMRIT YOGA CENTER</h2>
        </div>
        <p class="tagline" style="color: var(--color-text-secondary); line-height: 1.6;">An Ultimate Health, Mind & Soul Resolution in Bhilwara</p>
        <p style="color: var(--color-saffron); font-size: 0.9rem; font-style: italic; font-weight: 600;">
          "Health, Discipline, Excellence in Bhilwara"
        </p>
      </div>
      
      <div class="footer-links">
        <h3>Primary Bhilwara Pages</h3>
        <ul class="footer-links-list" style="list-style: none; padding: 0;">
          <li><a href="/yoga-classes-bhilwara" style="color: var(--color-saffron); text-decoration: none; font-weight: 600;">Yoga Classes in Bhilwara</a></li>
          <li><a href="/best-yoga-centre-bhilwara" style="color: var(--color-text-secondary); text-decoration: none;">Best Yoga Center Bhilwara</a></li>
          <li><a href="/yoga-teacher-bhilwara" style="color: var(--color-text-secondary); text-decoration: none;">Yoga Teacher Bhilwara</a></li>
          <li><a href="/morning-yoga-classes-bhilwara" style="color: var(--color-text-secondary); text-decoration: none;">Morning Yoga Bhilwara</a></li>
        </ul>
      </div>
      
      <div class="footer-contact">
        <h3>Admission Office</h3>
        <div class="footer-contact-items" style="color: var(--color-text-secondary);">
          <div class="footer-contact-item" style="margin-bottom: 12px;">
            <i class="fa-solid fa-location-dot" style="margin-right: 8px; color: var(--color-saffron);"></i>
            <span>3-M-7, Bapunagar, Near Vinay Stationers, Hospital Road, Bhilwara</span>
          </div>
          <div class="footer-contact-item">
            <i class="fa-solid fa-phone" style="margin-right: 8px; color: var(--color-saffron);"></i>
            <a href="tel:7737773384" style="color: var(--color-text-secondary); text-decoration: none;">+91 7737773384</a>
          </div>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom" style="text-align: center; padding: 25px 20px; border-top: 1px solid rgba(255, 153, 51, 0.05); color: var(--color-text-secondary); font-size: 0.9rem;">
      <p>&copy; 2026 Amrit Yoga Center<sup>™</sup>. All Rights Reserved. Designed for Health & Excellence in Bhilwara.</p>
    </div>
  </footer>

  <!-- CDN Script Integrations -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
  
  <script src="/js/db.js?v=1.0.7"></script>
  <script src="/js/three-scene.js?v=1.0.6"></script>
  <script src="/js/app.js?v=1.0.6"></script>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const faqCards = document.querySelectorAll('.seo-faq-card');
      faqCards.forEach(card => {
        const header = card.querySelector('.seo-faq-header');
        const body = card.querySelector('.seo-faq-body');
        const content = card.querySelector('.seo-faq-content');
        
        header.addEventListener('click', () => {
          const isActive = card.classList.contains('active');
          
          faqCards.forEach(c => {
            c.classList.remove('active');
            c.querySelector('.seo-faq-body').style.maxHeight = null;
          });
          
          if (!isActive) {
            card.classList.add('active');
            body.style.maxHeight = content.scrollHeight + 'px';
          }
        });
      });
    });
  </script>
</body>
</html>`;
}

// Write generated files to system (original 53 pages)
allPages.forEach(p => {
  const htmlContent = buildPageHTML(p);
  let filepath;
  if (p.type === 'service') {
    filepath = path.join(SERVICES_DIR, `${p.slug}.html`);
  } else {
    filepath = path.join(ROOT_DIR, `${p.slug}.html`);
  }
  
  fs.writeFileSync(filepath, htmlContent, 'utf8');
});

console.log('Original 53 dynamic local/national landing pages generated successfully! ✅');

// ============================================================
// PROGRAMMATIC CITY LANDING PAGES SYSTEM (80+ CITIES, 8 SERVICES)
// ============================================================

const rajasthanCities = [
  "Jaipur", "Jodhpur", "Udaipur", "Ajmer", "Kota", "Bhilwara", "Alwar", "Bikaner", 
  "Sikar", "Pali", "Barmer", "Jaisalmer", "Banswara", "Churu", "Jhunjhunu", 
  "Hanumangarh", "Nagaur", "Tonk", "Bundi", "Chittorgarh", "Dungarpur", 
  "Pratapgarh", "Sawai Madhopur", "Dholpur", "Bharatpur", "Karauli", "Jalore", 
  "Sirohi", "Rajsamand", "Jhalawar"
];

const majorIndianCities = [
  "Delhi", "Mumbai", "Pune", "Bengaluru", "Hyderabad", "Chennai", "Ahmedabad", "Surat", 
  "Vadodara", "Rajkot", "Indore", "Bhopal", "Nagpur", "Lucknow", "Kanpur", "Noida", 
  "Greater Noida", "Ghaziabad", "Gurugram", "Faridabad", "Chandigarh", "Mohali", 
  "Ludhiana", "Amritsar", "Patiala", "Kolkata", "Howrah", "Patna", "Ranchi", "Raipur", 
  "Bhubaneswar", "Visakhapatnam", "Vijayawada", "Coimbatore", "Madurai", "Kochi", 
  "Trivandrum", "Mysore", "Mangalore", "Goa", "Shimla", "Dehradun", "Guwahati", 
  "Srinagar", "Jammu", "Agra", "Varanasi", "Prayagraj", "Meerut", "Bareilly", 
  "Jabalpur", "Gwalior", "Nashik", "Aurangabad", "Solapur", "Thane", "Navi Mumbai"
];

// Combine all target cities (making sure they are unique)
const targetCities = Array.from(new Set([...rajasthanCities, ...majorIndianCities]));

const seoServices = [
  {
    type: "yoga-classes",
    pattern: "yoga-classes-in-[city]",
    title: "Yoga Classes in [City] | Premium Studio - Amrit Yoga",
    h1: "Yoga Classes in [City]",
    meta: "Join premium yoga classes in [City]. Directed by National Gold Medalist Suresh Mali, offering personalized posture correction, fat burn, and physical alignment.",
    badge: "Professional Training"
  },
  {
    type: "online-yoga",
    pattern: "online-yoga-classes-[city]",
    title: "Live Online Yoga Classes in [City] | Amrit Yoga",
    h1: "Online Yoga Classes in [City]",
    meta: "Experience the best online yoga classes in [City]. Interactive daily live training under National Champion Coach Suresh Mali with posture correction.",
    badge: "Virtual Academy"
  },
  {
    type: "personal-trainer",
    pattern: "personal-yoga-trainer-[city]",
    title: "Personal Yoga Trainer in [City] | Private Coach",
    h1: "Personal Yoga Trainer in [City]",
    meta: "Hire a certified personal yoga trainer in [City]. Tailored spinal therapy, custom weight loss programs, and advanced posture correction.",
    badge: "1-on-1 Coaching"
  },
  {
    type: "kids-yoga",
    pattern: "kids-yoga-[city]",
    title: "Kids Yoga Classes in [City] | Concentration & Growth",
    h1: "Kids Yoga Classes in [City]",
    meta: "Nurture your child's growth, spinal posture, and brain memory. Special Kids Yoga classes in [City] for ages 5-15.",
    badge: "Youth Academy"
  },
  {
    type: "weight-loss",
    pattern: "yoga-for-weight-loss-[city]",
    title: "Yoga for Weight Loss in [City] | Active Vinyasa Flow",
    h1: "Yoga for Weight Loss in [City]",
    meta: "Accelerate metabolism, shred abdominal fat, and tone muscles with active Vinyasa flow classes in [City]. Under champion coach Suresh Mali.",
    badge: "Visceral Fat Burn"
  },
  {
    type: "yoga-therapy",
    pattern: "yoga-therapy-[city]",
    title: "Yoga Therapy in [City] | Back Pain & Spine Rehab",
    h1: "Yoga Therapy & Pain Relief in [City]",
    meta: "Recover from slip disc, neck pain, sciatica, and chronic stress. Specialized yoga therapy in [City] directed by Suresh Mali.",
    badge: "Clinical Rehab"
  },
  {
    type: "corporate-yoga",
    pattern: "corporate-yoga-[city]",
    title: "Corporate Yoga in [City] | Office Stress Relief",
    h1: "Corporate Yoga & Wellness in [City]",
    meta: "Correct computer sitting posture, relieve neck strain, and reduce workspace stress. Professional corporate yoga sessions in [City].",
    badge: "Workplace Wellness"
  },
  {
    type: "competition-yoga",
    pattern: "competition-yoga-[city]",
    title: "Competition Yogasana Sports Training in [City] | Amrit",
    h1: "Competition Yoga Training in [City]",
    meta: "Master advanced yogasana alignments, flexibility holds, and score sheet points under National Gold Medalist Suresh Mali in [City].",
    badge: "Athletic Excellence"
  }
];

const cityNeighborhoods = {
  "Jaipur": ["Vaishali Nagar", "Malviya Nagar", "Mansarovar", "C-Scheme", "Raja Park", "Jagatpura"],
  "Jodhpur": ["Sardarpura", "Shastri Nagar", "Kamla Nehru Nagar", "Ch Chopasni Road", "Ratanada"],
  "Udaipur": ["Hiran Magri", "Panchwati", "Fatehpura", "Shobhagpura", "Sector 4", "Madhuban"],
  "Kota": ["Talwandi", "Vigyan Nagar", "Kunhari", "Dadabari", "Mahaveer Nagar", "Jhalawar Road"],
  "Delhi": ["Connaught Place", "Dwarka", "Saket", "Rajouri Garden", "Vasant Kunj", "Karol Bagh"],
  "Mumbai": ["Andheri", "Bandra", "Borivali", "Ghatkopar", "Colaba", "Worli", "Juhu"],
  "Pune": ["Kothrud", "Hinjawadi", "Koregaon Park", "Aundh", "Viman Nagar", "Hadapsar"],
  "Bengaluru": ["Indiranagar", "Jayanagar", "Koramangala", "HSR Layout", "Whitefield", "JP Nagar"],
  "Hyderabad": ["Gachibowli", "Jubilee Hills", "Banjara Hills", "Madhapur", "Kondapur", "Begumpet"],
  "Chennai": ["Adyar", "Anna Nagar", "Mylapore", "Velachery", "T Nagar", "Nungambakkam"],
  "Kolkata": ["Salt Lake", "New Town", "Ballygunge", "Gariahat", "Alipore", "Dum Dum"],
  "Noida": ["Sector 62", "Sector 15", "Sector 50", "Sector 93", "Noida Extension"],
  "Gurugram": ["DLF Phase 3", "Sector 45", "Sohna Road", "Golf Course Road", "Sector 56"],
  "Ahmedabad": ["Satellite", "C G Road", "Vastrapur", "Bodakdev", "Navrangpura", "Prahlad Nagar"],
  "Bhopal": ["Arera Colony", "TT Nagar", "Maharana Pratap Nagar", "Kolar Road", "Saket Nagar"],
  "Indore": ["Vijay Nagar", "Palasia", "Vijay Nagar", "Scheme No 54", "Sudama Nagar"],
  "Lucknow": ["Gomti Nagar", "Aliganj", "Hazratganj", "Indira Nagar", "Mahanagar"],
  "Patna": ["Boring Road", "Kankarbagh", "Patliputra Colony", "Rajendra Nagar", "Bailey Road"],
  "Ranchi": ["Lalpur", "Kanke Road", "Bariatu", "Harmu", "Doranda"],
  "Dehradun": ["Rajpur Road", "Dehrakhas", "Dharampur", "Vasant Vihar", "Clement Town"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Calangute"],
  "Chandigarh": ["Sector 17", "Sector 35", "Sector 8", "Sector 22", "Sector 15"],
  "Ludhiana": ["Model Town", "Sarabha Nagar", "Civil Lines", "BRS Nagar", "Ferozepur Road"]
};

// Generate Programmatic unique local narrative segments (1200+ words)
function generateProgrammaticNarrative(city, service) {
  const nList = cityNeighborhoods[city] || [`${city} Central Area`, `${city} Sector 1`, `${city} Sector 2`, `${city} Extension`];
  const listStr = nList.slice(0, 4).join(', ');
  
  const serviceNameMap = {
    "yoga-classes": "traditional Hatha-Vinyasa yoga training classes",
    "online-yoga": "interactive live online classes and virtual posture alignment",
    "personal-trainer": "one-on-one personal yoga training and private coaching",
    "kids-yoga": "specialized kids yoga batches focusing on spine growth and focus",
    "weight-loss": "high-intensity weight loss yoga flows and visceral fat burn",
    "yoga-therapy": "spinal rehab yoga therapy for slip disc and back pain relief",
    "corporate-yoga": "corporate wellness sessions, desk stretches, and posture alignment",
    "competition-yoga": "competition yogasana sports score sheet training"
  };
  
  const sName = serviceNameMap[service.type] || "professional yoga classes";

  const s1 = `Welcome to Amrit Yoga Center's dedicated resource for ${sName} in ${city}. As one of the premier wellness and alignment authorities, our goal is to deliver world-class training directly to fitness and recovery seekers in ${city}. Under the direct guidance of National Yogasana Sports Gold Medalist Coach Suresh Mali, our modules are structurally framed to decompress compressed joint spaces, enrich respiratory volumes, and restore core physical integrity. Whether you are seeking a customized schedule for online coaching from the comfort of your home, or private training in primary sectors like ${listStr}, our academy brings elite training coordinates directly to you.`;

  const s2 = `### Biomechanical Spine Health & Anatomical Alignment in ${city}
Modern lifestyles often involve long hours sitting at desks or looking down at screens, causing chronic thoracic compression, shoulder rounding, and lumbar disc strain. Our specialized programs address these issues directly. Every dynamic sequence in our ${service.h1} curriculum incorporates standard yoga props, blocks, straps, and secure wall assists to align joint sockets and establish muscle balance. Coach Suresh Mali evaluates muscle flexibility and joint mobility to prevent alignment damage, ensuring safety. By prioritizing muscle extensions over heavy loading, we build a foundation for life-long flexibility and strength.`;

  const s3 = `### Structured timings & flexible training plans
To accommodate busy schedules, we offer flexible timing options:
• Early Morning Training (5:00 AM – 8:30 AM): Perfect for deep breathing exercises (Pranayama) and joint mobilizations (Sukshma Vyayama) to energize your body.
• Late Afternoon & Evening Flows (4:00 PM – 8:00 PM): Active weight-loss flows, Vinyasa alignment, and core conditioning designed to shred stress.
• Personalized Virtual Batches: Dedicated interactive streams featuring direct, real-time posture corrections by certified studio trainers.`;

  const s4 = `### Hyper-Local Neighborhood Coverage across ${city}
We extend our customized yoga coaching guides to all major sectors and neighborhoods in and around ${city}. Residents in areas like ${nList.join(', ')} can easily enroll in our customized virtual training programs, accessing daily alignment reviews, structured nutritional advice, and live coaching feeds. Our remote enrollment process makes it easy to kickstart your journey immediately without commute fatigue.`;

  const s5 = `### Why Coach Suresh Mali's Champion Pedigree Matters
Unlike generalized gym training or casual group fitness, our courses are designed by Coach Suresh Mali—a verified National Yoga Champion and AIU Silver Medalist. His deep expertise in athletic sports yoga and clinical rehab assists allows him to structure movements that yield positive anatomical changes. Whether you want to boost stamina, regulate thyroid/PCOS hormones, reduce sciatica pressure, or prepare for yogasana competition scoring, training under a national medalist guarantees the highest coaching standard in India.`;

  const s6 = `### Start Your Elite Wellness Journey Today
Don't settle for local directory listings or unverified tutorials. Join a structured, professional academy committed to your skeletal alignment and mindfulness. Reach out to Amrit Yoga Center today to book a free trial class in ${city}. Let's work together to correct your posture, decompress your joints, and build a healthy body and mind.`;

  return [s1, s2, s3, s4, s5, s6].join('\n\n');
}

// Generate Programmatic FAQs
function generateProgrammaticFAQs(city, service) {
  const nList = cityNeighborhoods[city] || [`${city} Central Area`, `${city} Sector 1`];
  const listStr = nList.slice(0, 3).join(', ');
  
  return [
    {
      q: `Do you provide ${service.h1} for beginners?`,
      a: `Yes, absolute beginners are welcome! We adapt our ${service.h1} sequences with standard props (blocks and straps) so you can build strength and flexibility safely, without over-stretching.`
    },
    {
      q: `Who directs the posture adjustments and reviews?`,
      a: `All customized training schedules and virtual alignments are overseen directly by National Yogasana Sports Gold Medalist Coach Suresh Mali.`
    },
    {
      q: `Can I join these sessions from anywhere in ${city}?`,
      a: `Yes! Our virtual interactive classes are accessible from all locations in ${city}, including ${listStr} and nearby sectors.`
    },
    {
      q: "What equipment do I need for online classes?",
      a: "You only need a standard non-slip yoga mat, comfortable athletic wear, a device with a camera, and a stable internet connection. We will guide you on using household items like chairs or cushions if blocks are not available."
    },
    {
      q: `Is there a free trial class available for ${city} students?`,
      a: "Yes! We provide one complimentary online demo/trial class so you can experience our high-fidelity teaching, real-time posture corrections, and training atmosphere firsthand."
    },
    {
      q: "How does this yoga training help with back pain or sciatica?",
      a: "Our programs emphasize structural spine decompression. Each pose focuses on stretching the tight muscle groups around the lower back and hips, which naturally relieves sciatic nerve pressure."
    },
    {
      q: "What age groups are eligible to join?",
      a: "We have dedicated programs for all age groups. This includes specialized kids yoga batches (ages 5-15) and restorative joint-mobility sequences for senior citizens."
    },
    {
      q: `How do I book my free trial batch in ${city}?`,
      a: "You can click the 'Book Free Trial' button on this page, choose your preferred timing, or contact us directly on WhatsApp at +91 7737773384 to schedule your slot."
    }
  ];
}

// Read index.html as master template
const templatePath = path.join(ROOT_DIR, 'index.html');
if (!fs.existsSync(templatePath)) {
  console.error(`Master index.html not found at: ${templatePath} ❌`);
  process.exit(1);
}
const templateHtml = fs.readFileSync(templatePath, 'utf8');

// Accordion CSS / JS to inject
const accordionStyles = `
<style>
  .seo-local-section {
    position: relative;
    z-index: 5;
  }
  .seo-breadcrumbs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: var(--radius-sm);
    border: var(--glass-border);
    background: var(--bg-card);
    box-shadow: var(--glass-shadow);
    font-size: 0.9rem;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .seo-breadcrumbs a {
    color: var(--color-saffron);
    text-decoration: none;
    font-weight: 500;
  }
  .seo-breadcrumbs a:hover {
    text-decoration: underline;
  }
  .seo-breadcrumbs span {
    color: var(--color-text-secondary);
  }
  .seo-faq-card {
    margin-bottom: 12px;
    border-radius: var(--radius-sm);
    border: var(--glass-border);
    background: var(--bg-card);
    box-shadow: var(--glass-shadow);
    overflow: hidden;
    transition: var(--transition-fast);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .seo-faq-card:hover {
    border-color: rgba(var(--color-saffron-rgb), 0.3);
  }
  .seo-faq-header {
    padding: 18px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }
  .seo-faq-header h3 {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .seo-faq-header h3 i {
    color: var(--color-saffron);
  }
  .seo-faq-arrow {
    color: var(--color-text-secondary);
    transition: var(--transition-smooth);
    font-size: 0.85rem;
  }
  .seo-faq-card.active .seo-faq-arrow {
    transform: rotate(180deg);
    color: var(--color-saffron);
  }
  .seo-faq-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .seo-faq-content {
    padding: 0 24px 20px 48px;
    font-size: 0.98rem;
    color: var(--color-text-secondary);
    line-height: 1.65;
    border-top: 1px solid rgba(255, 255, 255, 0.03);
  }
  .seo-narrative-content h3 {
    color: var(--color-white);
    font-size: 1.3rem;
    margin-top: 30px;
    margin-bottom: 12px;
    font-weight: 600;
  }
  .seo-narrative-content p {
    margin-bottom: 18px;
    line-height: 1.75;
    text-align: justify;
  }
  .seo-narrative-content ul {
    margin-bottom: 18px;
    padding-left: 20px;
  }
  .seo-narrative-content li {
    margin-bottom: 8px;
    line-height: 1.7;
  }
  body.light-theme .seo-faq-header h3,
  body.light-theme .seo-narrative-content h3 {
    color: var(--color-text-primary);
  }
</style>
`;

const accordionJs = `
<script>
  // Accordion Logic with smooth max-height transitions for Programmatic FAQs
  document.addEventListener('DOMContentLoaded', () => {
    const faqCards = document.querySelectorAll('.seo-faq-card');
    faqCards.forEach(card => {
      const header = card.querySelector('.seo-faq-header');
      const body = card.querySelector('.seo-faq-body');
      const content = card.querySelector('.seo-faq-content');
      
      header.addEventListener('click', () => {
        const isActive = card.classList.contains('active');
        
        // Close all other accordions
        faqCards.forEach(c => {
          c.classList.remove('active');
          c.querySelector('.seo-faq-body').style.maxHeight = null;
        });
        
        if (!isActive) {
          card.classList.add('active');
          body.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });
  });
</script>
`;

// Lookup for sitemap urls
const generatedSeoPages = [];

// Loop through each city and generate programmatic landing pages
targetCities.forEach(city => {
  seoServices.forEach(srv => {
    // Generate page-specific strings
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    const slug = srv.pattern.replace('[city]', citySlug);
    const title = srv.title.replace('[City]', city);
    const h1 = srv.h1.replace('[City]', city);
    const metaDesc = srv.meta.replace('[City]', city);
    const canonicalUrl = `https://amrityogacenter.in/${slug}`;
    
    // Split hero title into two parts dynamically
    const titleWords = h1.split(' ');
    const heroTitlePart1 = titleWords.slice(0, 2).join(' ') + ', ';
    const heroTitlePart2 = titleWords.slice(2).join(' ');

    const neighborhoods = cityNeighborhoods[city] || [`${city} Central Area`, `${city} Sector 1`];
    const nStr = neighborhoods.slice(0, 3).join(', ');

    const heroDescription = `Join premium ${srv.badge.toLowerCase()} sessions for ${h1.toLowerCase()} under National Gold Medalist <strong>Coach Suresh Mali</strong>. Build flexibility, strength, and calm in ${city} with elite alignments.`;

    const introduction = `Unlock deep wellness and skeletal health with our specialized program for ${h1.toLowerCase()} in ${city}, Rajasthan. Direct training coordinates under Suresh Mali.`;

    const narrative = generateProgrammaticNarrative(city, srv);
    const faqs = generateProgrammaticFAQs(city, srv);

    // Format content sections markdown into HTML
    const sectionsHtml = narrative.split('\n\n').slice(1).map(sec => {
      const lines = sec.split('\n');
      const heading = lines[0].replace('### ', '');
      const paragraphs = lines.slice(1).map(p => {
        if (p.startsWith('• ') || p.startsWith('- ')) {
          return `<li>${p.slice(2)}</li>`;
        }
        if (p.match(/^\d+\./)) {
          return `<li>${p.replace(/^\d+\.\s*/, '')}</li>`;
        }
        return `<p>${p}</p>`;
      }).join('\n');

      if (paragraphs.includes('<li>')) {
        return `<div style="margin-bottom: 25px;">
          <h3>${heading}</h3>
          <ul style="color: var(--color-text-secondary); line-height: 1.7; padding-left: 20px;">
            ${paragraphs}
          </ul>
        </div>`;
      }

      return `<div style="margin-bottom: 25px;">
        <h3>${heading}</h3>
        ${paragraphs}
      </div>`;
    }).join('\n');

    // FAQ items HTML
    const faqHtml = faqs.map(faq => `
      <div class="seo-faq-card">
        <div class="seo-faq-header">
          <h3><i class="fa-solid fa-circle-question"></i> ${faq.q}</h3>
          <i class="fa-solid fa-chevron-down seo-faq-arrow"></i>
        </div>
        <div class="seo-faq-body">
          <div class="seo-faq-content">
            ${faq.a}
          </div>
        </div>
      </div>
    `).join('');

    // Local linking: add links to related cities
    const relatedCities = targetCities.filter(c => c !== city).slice(0, 4);
    const relatedLinksHtml = `
      <div class="seo-related-cities" style="margin-top: 50px; padding: 25px; border-radius: var(--radius-sm); border: var(--glass-border); background: var(--bg-card); box-shadow: var(--glass-shadow); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
        <h4 style="color: var(--color-white); margin-top: 0; margin-bottom: 15px; font-size: 1.1rem; font-weight: 600;">Other Yoga Centers in Rajasthan & India</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 10px 15px; font-size: 0.95rem;">
          ${relatedCities.map(rc => `<a href="/${srv.pattern.replace('[city]', rc.toLowerCase().replace(/\s+/g, '-'))}" style="color: var(--color-saffron); text-decoration: none; font-weight: 500;">${srv.h1.replace('[City]', rc)}</a>`).join('<span style="color: var(--color-text-secondary);">|</span>')}
        </div>
      </div>
    `;

    // Local SEO section HTML to inject
    const localContentHtml = `
    <!-- Programmatic SEO Local Content & FAQ Section -->
    <section class="section seo-local-section" style="padding: 80px 0 50px 0; border-top: 1px solid rgba(255, 153, 51, 0.08); background: linear-gradient(180deg, rgba(10,11,18,0) 0%, rgba(255,153,51,0.01) 100%);">
      <div class="container" style="max-width: 900px; margin: 0 auto; padding: 0 20px;">
        
        <!-- Breadcrumbs -->
        <div class="seo-breadcrumbs" style="display: flex; gap: 8px; align-items: center; font-size: 0.9rem; margin-bottom: 30px; color: var(--color-text-secondary);">
          <a href="/" style="color: var(--color-saffron); text-decoration: none;">Home</a>
          <span>/</span>
          <span style="color: var(--color-text-primary); font-weight: 500;">${h1}</span>
        </div>

        <!-- Heading -->
        <div class="section-header" style="text-align: left; margin-bottom: 40px;">
          <h2 class="text-gradient" style="font-size: 2.2rem; margin-bottom: 15px;">${h1}</h2>
          <p style="font-size: 1.1rem; color: var(--color-text-secondary); line-height: 1.6;">${introduction}</p>
        </div>

        <!-- Content Body (1200+ words narrative) -->
        <div class="seo-narrative-content" style="color: var(--color-text-secondary); line-height: 1.8; font-size: 1.05rem;">
          ${sectionsHtml}
        </div>

        <!-- FAQs (8 unique questions) -->
        <h3 class="text-gradient" style="font-size: 1.8rem; margin-top: 60px; margin-bottom: 25px; font-weight: 700;">Frequently Asked Questions</h3>
        <div class="faq-accordion-container" style="margin-bottom: 40px;">
          ${faqHtml}
        </div>

        <!-- Related Cities Linking -->
        ${relatedLinksHtml}
        
      </div>
    </section>
    `;

    // JSON-LD structured schemas
    const faqSchemaData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    };

    const breadcrumbSchemaData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://amrityogacenter.in/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": h1,
          "item": canonicalUrl
        }
      ]
    };

    const localBusinessSchemaData = {
      "@context": "https://schema.org",
      "@type": "SportsActivityLocation",
      "@id": `${canonicalUrl}#sportsactivitylocation`,
      "name": `Amrit Yoga Center - ${h1}`,
      "url": canonicalUrl,
      "logo": "https://amrityogacenter.in/images/logo.png",
      "image": "https://amrityogacenter.in/images/about_hero.jpg",
      "description": metaDesc,
      "telephone": "+91 7737773384",
      "email": "info@yogamrityoga.com",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": city,
        "addressRegion": rajasthanCities.includes(city) ? "Rajasthan" : "India",
        "addressCountry": "IN"
      },
      "areaServed": {
        "@type": "Place",
        "name": city
      }
    };

    const jsonLdHtml = `
  <!-- Programmatic SEO Schema Markups -->
  <script type="application/ld+json">${JSON.stringify(faqSchemaData)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchemaData)}</script>
  <script type="application/ld+json">${JSON.stringify(localBusinessSchemaData)}</script>
  ${accordionStyles}
    `;

    // String replacements inside index.html master template
    let replacedHtml = templateHtml;

    // 1. Replace Title
    replacedHtml = replacedHtml.replace(/<title>[^<]+<\/title>/, `<title>${title}</title>`);

    // 2. Replace Meta Description
    replacedHtml = replacedHtml.replace(/<meta name="description" content="[^"]+"[^>]*>/, `<meta name="description" content="${metaDesc}">`);

    // 3. Replace Canonical
    replacedHtml = replacedHtml.replace(/<link rel="canonical" href="[^"]+"[^>]*>/, `<link rel="canonical" href="${canonicalUrl}">`);

    // 4. Inject JSON-LD & Styles
    replacedHtml = replacedHtml.replace('</head>', `${jsonLdHtml}\n</head>`);

    // 5. Replace Hero Title
    replacedHtml = replacedHtml.replace(
      /<h1 class="hero-title">[\s\S]*?<\/h1>/, 
      `<h1 class="hero-title">${heroTitlePart1}<span class="text-gradient">${heroTitlePart2}</span></h1>`
    );

    // 6. Replace Hero Subtitle
    replacedHtml = replacedHtml.replace(
      /<p class="hero-subtitle">[\s\S]*?<\/p>/,
      `<p class="hero-subtitle">${heroDescription}</p>`
    );

    // 7. Inject Local Content & FAQ Section right above the Contact Section
    replacedHtml = replacedHtml.replace(
      '<!-- 10. Contact Section -->',
      `${localContentHtml}\n<!-- 10. Contact Section -->`
    );

    // 8. Inject Accordion JS script to body
    replacedHtml = replacedHtml.replace('</body>', `${accordionJs}\n</body>`);

    // Write file to root directory
    const filepath = path.join(ROOT_DIR, `${slug}.html`);
    fs.writeFileSync(filepath, replacedHtml, 'utf8');

    generatedSeoPages.push({
      slug: slug,
      type: 'programmatic',
      priority: '0.8',
      changefreq: 'monthly'
    });
  });
});

console.log(`Programmatic City Landing Pages Generated: ${generatedSeoPages.length} Pages ✅`);

// ============================================================
// SITEMAP REGISTRATION (CORE + ORIGINAL 53 + NEW 696 PAGES)
// ============================================================

const sitemapPath = path.join(ROOT_DIR, 'public', 'sitemap.xml');
console.log(`Generating sitemap at: ${sitemapPath}...`);

const sitemapUrls = [
  { loc: 'https://amrityogacenter.in/', priority: '1.0', changefreq: 'weekly' },
  { loc: 'https://amrityogacenter.in/certificates', priority: '0.8', changefreq: 'monthly' },
  { loc: 'https://amrityogacenter.in/blog', priority: '0.8', changefreq: 'weekly' }
];

// Add original 53 pages
allPages.forEach(p => {
  const route = p.type === 'service' ? `services/${p.slug}` : p.slug;
  sitemapUrls.push({
    loc: `https://amrityogacenter.in/${route}`,
    priority: p.type === 'national' ? '0.7' : '0.8',
    changefreq: 'monthly'
  });
});

// Add new 696 programmatic pages
generatedSeoPages.forEach(p => {
  sitemapUrls.push({
    loc: `https://amrityogacenter.in/${p.slug}`,
    priority: p.priority,
    changefreq: p.changefreq
  });
});

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
console.log(`Master sitemap.xml generated successfully! Total entries: ${sitemapUrls.length} ✅`);
console.log('Programmatic Page Generation Completed Successfully! 🚀');
