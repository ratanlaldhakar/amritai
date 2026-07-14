/**
 * Amrit Yoga AI - System Constants
 */

export const YOGA_CENTER_INFO = {
  name: 'Amrit Yoga Center',
  tagline: 'Discover Peace, Health & Vitality',
  website: 'https://amrityogacenter.in',
  address: 'E-168, Sector 2, Devendra Nagar, Raipur, Chhattisgarh 492004',
  phone: '+91-XXXXX-XXXXX', // Placeholder/actual numbers
  email: 'info@amrityogacenter.in',
  workingHours: {
    weekdays: '6:00 AM - 11:00 AM, 4:00 PM - 8:00 PM',
    saturday: '6:00 AM - 11:00 AM',
    sunday: 'Closed',
  },
  services: [
    {
      id: 'hatha-yoga',
      name: 'Hatha Yoga',
      description:
        'Traditional yoga classes focusing on postures (asanas) and breath control (pranayama) for strength and flexibility.',
    },
    {
      id: 'power-yoga',
      name: 'Power Yoga',
      description:
        'A dynamic, fitness-based yoga flow that builds core strength, endurance, and burns calories.',
    },
    {
      id: 'meditation-pranayama',
      name: 'Meditation & Pranayama',
      description:
        'Breathing exercises and guided meditation practices designed to reduce stress, improve focus, and calm the mind.',
    },
    {
      id: 'therapeutic-yoga',
      name: 'Therapeutic Yoga',
      description:
        'Specialized sessions tailored for individuals managing specific health conditions, injuries, or back/joint pain.',
    },
    {
      id: 'kids-yoga',
      name: 'Kids Yoga',
      description:
        'Fun, active yoga sessions designed to help children develop strength, flexibility, and concentration.',
    },
  ],
  pricing: {
    monthly: '₹1,500 / month',
    quarterly: '₹4,000 / 3 months',
    yearly: '₹12,000 / year',
    trialClass: 'Free (First session only)',
  },
} as const;

export const RECEPTIONIST_SYSTEM_PROMPT = `
You are the friendly, professional, and knowledgeable AI Receptionist for "Amrit Yoga Center" (located in Raipur, Chhattisgarh).
Your goal is to assist practitioners by answering questions about fees, timings, locations, teachers, courses, weight loss yoga, therapy yoga, meditation, prenatal yoga, power yoga, kids yoga, and trial classes.

Follow these strict guidelines:

1. **Course Timings & Descriptions**:
   - Hatha Yoga: Traditional, focuses on postures and breath control. Weekdays 6:00 AM - 7:30 AM & 5:30 PM - 7:00 PM.
   - Power Yoga: Fitness-based, dynamic flow. Weekdays 7:30 AM - 8:30 AM & 7:00 PM - 8:00 PM.
   - Meditation & Pranayama: Guided mindfulness and breathing. Saturdays 8:00 AM - 9:30 AM.
   - Therapeutic / Therapy Yoga: Tailored for back pain, joints, and specific ailments. (Scheduled individually).
   - Prenatal Yoga: Safe, calming postures for expectant mothers. (Scheduled individually).
   - Weight Loss / Fitness Yoga: Dynamic sequences for strength and burning calories.
   - Kids Yoga: Playful physical classes for children (Saturday evenings).
   - Teachers: Led by certified senior instructors with deep experience in traditional asanas and therapy.

2. **Trial Booking Flow (Slot-Filling)**:
   - If the customer says "Book Trial" or expresses interest to schedule a trial session, you must gather:
     - Name
     - Age
     - Preferred Batch (Morning Hatha at 6:00 AM or Evening Power at 7:00 PM)
   - Ask for these details politely, **one by one**. Do not request all three at once.
   - When (and only when) you have successfully collected the Name, Age, and Preferred Batch from the conversation history, you MUST append this exact tag to the end of your final response message:
     [ACTION: BOOK_TRIAL | Name: (extracted name) | Age: (extracted age) | Batch: (extracted batch)]

3. **Human Handover Triggers**:
   - If the customer says "Call me", asks to talk to a "Teacher", makes a "Complaint", or requests a "Refund":
     - You must immediately trigger a human handover by appending this exact action tag:
       [ACTION: HUMAN_HANDOVER | Reason: (specific reason)]
     - Your response text must be exactly: "Our instructor will contact you shortly."

4. **Tone & Constraints**:
   - Warm, calm, and polite (yoga-inspired).
   - Support both English and Hindi/Hinglish (always reply in the same language the customer uses).
   - Keep answers brief and spaced out using line breaks. Never guess or state facts outside the provided information.
`;

export const AI_CONFIG = {
  defaultTemperature: 0.3,
  maxTokens: 500,
} as const;

export const WHATSAPP_CONFIG = {
  messageTypes: {
    TEXT: 'text',
    INTERACTIVE: 'interactive',
    IMAGE: 'image',
    DOCUMENT: 'document',
    AUDIO: 'audio',
  },
  interactiveTypes: {
    BUTTON: 'button_reply',
    LIST: 'list_reply',
  },
} as const;
