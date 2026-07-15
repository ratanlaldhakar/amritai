-- 1. Add priority column to the faqs table if it does not exist
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0 NOT NULL;

-- 2. Clear old FAQ seed data
TRUNCATE TABLE public.faqs;

-- 3. Seed new verified FAQs for Bapunagar, Bhilwara center in English & Hindi/Hinglish
INSERT INTO public.faqs (category, question, answer, is_published, priority) VALUES
(
  'location',
  'Where is Amrit Yoga Center located? / सेंटर कहाँ पर है?',
  'Amrit Yoga Center is located at **3-M-7, 2nd Floor, Near Vinay Stationers, Government Hospital Road, Bapunagar, Bhilwara (Rajasthan)**.

📍 **Google Maps Location:** https://share.google/gWGqpGx96XOUYENLW

---
अमृत योग सेंटर **3-M-7, द्वितीय मंजिल, विनय स्टेशनर्स के पास, गवर्नमेंट हॉस्पिटल रोड, बापू नगर, भीलवाड़ा (राजस्थान)** में स्थित है।

📍 **गूगल मैप्स लोकेशन:** https://share.google/gWGqpGx96XOUYENLW',
  true,
  10
),
(
  'classes',
  'What are the batch timings? / बैच का समय क्या है?',
  'We have convenient morning and evening batches:

🌅 **Morning Yoga Batches (प्रातःकालीन बैच):**
1. **Yoga Therapy Batch:** 6:00 AM to 7:00 AM (Special attention for therapy & ailments)
2. **Advanced Yoga Batch:** 7:00 AM to 8:00 AM
3. **Basic to Advanced Yoga Batch:** 8:00 AM to 9:00 AM

🌇 **Evening Yoga Batches (सायंकालीन बैच):**
1. **Advanced Yoga Batch (for Yogasana Sports):** 5:00 PM to 6:00 PM
2. **Basic Yoga Batch:** 6:00 PM to 7:00 PM

*Note: Batch timings can be customized upon request.*

---
हमारे प्रातःकालीन और सायंकालीन बैचों का समय इस प्रकार है:

🌅 **सुबह के बैच:**
1. **योग थेरेपी बैच:** सुबह 6:00 से 7:00 (बीमारियों और दर्द से राहत के लिए)
2. **एडवांस योग बैच:** सुबह 7:00 से 8:00
3. **बेसिक से एडवांस योग बैच:** सुबह 8:00 से 9:00

🌇 **शाम के बैच:**
1. **एडवांस योग बैच (योगासन स्पोर्ट्स के लिए):** शाम 5:00 से 6:00
2. **बेसिक योग बैच:** शाम 6:00 से 7:00

*ध्यान दें: बैच के समय में आपके अनुरोध पर बदलाव किया जा सकता है।*',
  true,
  9
),
(
  'pricing',
  'What are the membership fees? / फीस कितनी है?',
  'Our membership plans for offline group classes are:

- **1 Month Plan:** ₹1,500 (Perfect for Beginners & Flexible Start)
- **3 Months Plan:** ₹4,000 (Save ₹500 - Build Consistency & Discipline)
- **6 Months Plan:** ₹7,500 (Save ₹1,500 - Regular Practice = Better Results)
- **1 Year Plan:** ₹14,000 (Save ₹4,000 - Complete Life Transformation)

---
हमारे मेंबरशिप प्लान्स (ऑफ़लाइन ग्रुप क्लासेज के लिए) इस प्रकार हैं:

- **1 महीना प्लान:** ₹1,500 (शुरुआती लोगों के लिए परफेक्ट)
- **3 महीने प्लान:** ₹4,000 (₹500 की बचत - निरंतरता और अनुशासन के लिए)
- **6 महीने प्लान:** ₹7,500 (₹1,500 की बचत - बेहतर परिणाम)
- **1 साल प्लान:** ₹14,000 (₹4,000 की बचत - संपूर्ण जीवन परिवर्तन)',
  true,
  8
),
(
  'pricing',
  'Do you offer Home Visit or Private Group Classes? / क्या आप होम विजिट या पर्सनल क्लास देते हैं?',
  'Yes, we offer customized Home Visits and Private Group Classes:

- 👥 **Up to 4 Members:** ₹12,000 per month
- ➕ **Per Additional Member (5–7):** +₹1,000 per person per month
- 👨‍👩‍👧‍👦 **7 Members Total:** ₹15,000 per month flat
- 🎁 **Above 7 Members:** ₹15,000 per month flat (No extra charge for additional members!)

---
हाँ, हम होम विजिट और प्राइवेट ग्रुप क्लासेज भी प्रदान करते हैं:

- 👥 **4 सदस्यों तक:** ₹12,000 प्रति महीना
- ➕ **अतिरिक्त सदस्य (5 से 7):** +₹1,000 प्रति व्यक्ति प्रति महीना
- 👨‍👩‍👧‍👦 **कुल 7 सदस्य होने पर:** ₹15,000 प्रति महीना फ्लैट
- 🎁 **7 से अधिक सदस्य होने पर:** ₹15,000 प्रति महीना (7 से ऊपर के सदस्यों के लिए कोई अतिरिक्त शुल्क नहीं!)',
  true,
  7
),
(
  'classes',
  'What types of yoga do you teach? / आप किस तरह का योग सिखाते हैं?',
  'We offer training in a wide range of yoga practices:

- **Aasana & Pranayam** (Physical postures and breathwork)
- **Meditation & Shatkarma** (Mindfulness and body cleansing)
- **Therapy Yoga** (For back pain, joint issues, and health recovery)
- **Power Yoga & Hatha Yoga** (Strength, weight loss, and traditional flow)
- **Ashtanga Vinyasa** (Dynamic sequences)
- **Acro Yoga, Rope Yoga, and Aerial Yoga** (Advanced and specialized tools)
- **Weight Loss Training**

---
हम विभिन्न प्रकार की योग शैलियाँ और स्वास्थ्य प्रोग्राम सिखाते हैं:

- **आसन और प्राणायाम** (शारीरिक मुद्राएं और श्वास नियंत्रण)
- **ध्यान (Meditation) और षटकर्म** (मानसिक शांति और शरीर शुद्धि)
- **थेरेपी योग** (कमर दर्द, जोड़ों के दर्द और स्वास्थ्य सुधार के लिए)
- **पावर योग और हठ योग** (ताकत, वजन घटाने और पारंपरिक योग)
- **अष्टांग विन्यास** (डायनेमिक योग क्रम)
- **एक्रो योग, रोप (रस्सी) योग, और एरियल (हवा में) योग**
- **वजन घटाने (Weight Loss) की ट्रेनिंग**',
  true,
  6
),
(
  'teachers',
  'Who is the yoga teacher? / योग टीचर कौन हैं?',
  'Our classes are guided by **Suresh Kumar**, a certified Yoga Expert and **National Yoga Gold Medalist**. He specializes in traditional yoga, advanced yogasana training, and therapy yoga, ensuring safety and precision.

---
हमारे यहाँ योग कक्षाएं **सुरेश कुमार** (योग एक्सपर्ट और **नेशनल योग गोल्ड मेडल विजेता**) के मार्गदर्शन में होती हैं। वे पारंपरिक योग, एडवांस योगासन ट्रेनिंग और थेरेपी योग के विशेषज्ञ हैं।',
  true,
  5
),
(
  'general',
  'Do you offer trial classes? / क्या मैं ट्रायल क्लास ले सकता हूँ?',
  'Yes! We offer a **FREE trial class** for new visitors.
- **Who can join?** All age groups (from kids to adults) are welcome!
- **How to join?** You can register for your trial class directly by providing your Name, Age, and preferred Batch.

---
हाँ! हम नए आगंतुकों के लिए **एक फ्री ट्रायल क्लास** प्रदान करते हैं।
- **कौन शामिल हो सकता है?** सभी आयु वर्ग के लोग (बच्चों से लेकर बड़ों तक) शामिल हो सकते हैं!
- **कैसे जुड़ें?** आप अपना नाम, उम्र और पसंदीदा बैच बताकर सीधे ट्रायल क्लास बुक कर सकते हैं।',
  true,
  4
),
(
  'general',
  'What are the guidelines and payment terms? / फीस जमा करने और क्लास के क्या नियम हैं?',
  'Please keep the following important notes in mind:

1. **Advance Fees:** Fees must be paid in advance at the start of your cycle.
2. **Custom Timings:** Batch timings can be customized on request.
3. **Special Attention:** Special care and guidance are provided for therapy cases and advanced sports yogasana training.
4. **All Are Welcome:** All age groups from children to adults welcome.

---
कृपया निम्नलिखित महत्वपूर्ण बातों का ध्यान रखें:

1. **एडवांस फीस:** फीस का भुगतान एडवांस में करना होता है।
2. **बैच समय:** जरूरत के अनुसार बैच के समय में बदलाव किया जा सकता है।
3. **विशेष ध्यान:** योग थेरेपी और एडवांस योगासन ट्रेनिंग के लिए व्यक्तिगत विशेष ध्यान दिया जाता है।
4. **सभी का स्वागत है:** बच्चों से लेकर वयस्कों तक, सभी आयु वर्ग के लोग भाग ले सकते हैं।',
  true,
  3
),
(
  'general',
  'How can I contact or follow Amrit Yoga? / संपर्क या सोशल मीडिया डिटेल्स क्या हैं?',
  'Here are our official contact channels:

- ☎️ **Phone/WhatsApp:** +91-7737773384 / +91-7597955294
- 🌐 **Website:** https://amrityogacenter.in
- 📸 **Instagram:** https://www.instagram.com/amrityogacenter

---
आप इन माध्यमों से हमसे संपर्क या जुड़ सकते हैं:

- ☎️ **फ़ोन/व्हाट्सएप:** +91-7737773384 / +91-7597955294
- 🌐 **वेबसाइट:** https://amrityogacenter.in
- 📸 **इंस्टाग्राम:** https://www.instagram.com/amrityogacenter',
  true,
  2
)
ON CONFLICT DO NOTHING;
