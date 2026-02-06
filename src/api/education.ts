/**
 * Employee Education API
 * 
 * UAE Labor Law education, company policies,
 * tips, guides, and FAQ for employees.
 */

import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// ============================================================
// UAE LABOR LAW EDUCATION
// ============================================================

const UAE_LABOR_LAW = {
  overview: {
    title: 'UAE Labor Law Overview',
    description: 'Federal Decree-Law No. 33 of 2021 on Regulation of Labour Relations',
    effectiveDate: '2022-02-02',
    summary: 'The UAE Labor Law governs employment relationships in the private sector, covering working hours, leave entitlements, end of service benefits, and employee rights.'
  },
  
  topics: [
    {
      id: 'working-hours',
      title: '⏰ Working Hours',
      icon: '⏰',
      content: `
## Working Hours in UAE

### Standard Working Hours
- **Maximum**: 8 hours per day, 48 hours per week
- **During Ramadan**: Reduced by 2 hours per day

### Breaks
- Employees must not work more than 5 consecutive hours without a break
- Break time is not counted as working hours

### Fridays
- Friday is the official weekly rest day
- Working on Friday requires 50% premium OR a substitute day off

### Overtime
- Maximum 2 hours overtime per day
- **Overtime Pay**: 
  - Normal days: 125% of hourly wage
  - Night hours (10pm-4am): 150% of hourly wage
  - Fridays/Holidays: 150% of hourly wage
      `,
      quiz: [
        {
          question: 'What is the maximum working hours per week in UAE?',
          options: ['40 hours', '45 hours', '48 hours', '50 hours'],
          correct: 2,
          explanation: 'UAE Labor Law allows maximum 48 hours per week (8 hours per day, 6 days).'
        },
        {
          question: 'What is the overtime rate for working on Friday?',
          options: ['100%', '125%', '150%', '200%'],
          correct: 2,
          explanation: 'Working on Fridays or holidays entitles employees to 150% of their normal wage.'
        }
      ]
    },
    {
      id: 'annual-leave',
      title: '🏖️ Annual Leave',
      icon: '🏖️',
      content: `
## Annual Leave Entitlements

### Basic Entitlement
- **30 calendar days** per year (after completing 1 year of service)
- Employees with 6 months but less than 1 year: **2 days per month**

### Key Rules
1. Leave salary is paid in **advance** before the leave starts
2. Public holidays falling during leave are **not counted** as leave days
3. Sick leave during annual leave: Annual leave is suspended

### Carry Forward
- Unused leave can be carried forward to next year
- Must be used within **2 years** of accrual
- Employer can require employee to take leave or pay cash equivalent

### Leave Calculation
- Based on **basic salary + housing allowance**
- Excludes other allowances unless specified in contract
      `,
      quiz: [
        {
          question: 'How many days of annual leave are UAE employees entitled to?',
          options: ['21 days', '25 days', '30 days', '35 days'],
          correct: 2,
          explanation: 'After 1 year of service, employees are entitled to 30 calendar days of annual leave.'
        }
      ]
    },
    {
      id: 'sick-leave',
      title: '🏥 Sick Leave',
      icon: '🏥',
      content: `
## Sick Leave Entitlements

### Total Entitlement: 90 Days per Year

| Period | Pay Rate |
|--------|----------|
| First 15 days | **Full pay** (100%) |
| Next 30 days | **Half pay** (50%) |
| Remaining 45 days | **No pay** (0%) |

### Requirements
- Must complete **3 months probation** to be eligible
- Medical certificate required for absences **over 2 days**
- Certificate must be from UAE-licensed medical facility

### Important Notes
- Sick leave resets each year
- Chronic illness may have special provisions
- Employer can request medical examination
      `,
      quiz: [
        {
          question: 'How many days of fully paid sick leave are employees entitled to?',
          options: ['10 days', '15 days', '30 days', '90 days'],
          correct: 1,
          explanation: 'The first 15 days of sick leave are at full pay, followed by 30 days at half pay.'
        }
      ]
    },
    {
      id: 'maternity-paternity',
      title: '👶 Maternity & Paternity',
      icon: '👶',
      content: `
## Maternity Leave

### Entitlement: 60 Days Total
- **First 45 days**: Full pay
- **Next 15 days**: Half pay
- Can extend with **45 days unpaid** leave

### Additional Rights
- 2 nursing breaks per day (30 mins each) for 6 months after birth
- Cannot be terminated during maternity leave
- Job protection for 6 months after return

---

## Paternity Leave

### Entitlement: 5 Working Days
- Must be taken within **6 months** of child's birth
- Full pay during leave
- Introduced in 2021 labor law update
      `,
      quiz: [
        {
          question: 'How many days of paternity leave are fathers entitled to?',
          options: ['3 days', '5 days', '10 days', '15 days'],
          correct: 1,
          explanation: 'Fathers are entitled to 5 working days of paid paternity leave.'
        }
      ]
    },
    {
      id: 'end-of-service',
      title: '💰 End of Service Benefits',
      icon: '💰',
      content: `
## End of Service Gratuity

### Calculation (Unlimited Contract)

| Service Period | Gratuity |
|----------------|----------|
| Less than 1 year | No gratuity |
| 1-5 years | **21 days** basic salary per year |
| More than 5 years | **30 days** basic salary per year (for years after 5) |

### Maximum Cap
- Total gratuity cannot exceed **2 years' salary**

### When NOT Entitled
- Terminated during probation
- Dismissal for gross misconduct (Article 44)
- Resignation before 1 year of service

### When Fully Entitled
- End of contract
- Resignation after 1+ years
- Redundancy
- Death or permanent disability
      `,
      quiz: [
        {
          question: 'After 5 years of service, what is the gratuity rate per year?',
          options: ['15 days', '21 days', '30 days', '45 days'],
          correct: 2,
          explanation: 'After 5 years, employees are entitled to 30 days basic salary for each additional year.'
        }
      ]
    },
    {
      id: 'notice-period',
      title: '📝 Notice Period',
      icon: '📝',
      content: `
## Notice Period Requirements

### Minimum Notice
- **30 days** minimum for both employer and employee
- Contract may specify longer period (up to 90 days)

### During Notice Period
- Employee continues to work and receive full salary
- Employee entitled to 1 day off per week for job searching

### Payment in Lieu
- Either party can pay salary instead of notice period
- Calculated based on last drawn salary

### Resignation Without Notice
- Employee may need to compensate employer
- Equals salary for notice period
      `
    },
    {
      id: 'probation',
      title: '🆕 Probation Period',
      icon: '🆕',
      content: `
## Probation Period

### Maximum Duration
- **6 months** maximum
- Cannot be extended or renewed

### During Probation
- Either party can terminate with **14 days notice**
- No end of service gratuity if terminated during probation

### After Probation
- Employee becomes "confirmed"
- Full labor law protections apply
- Gratuity calculation begins from start date
      `
    }
  ]
};

// ============================================================
// TIPS & GUIDES
// ============================================================

const TIPS_AND_GUIDES = [
  {
    id: 'clock-in-tips',
    category: 'attendance',
    title: '🕐 Clock In/Out Tips',
    icon: '🕐',
    content: `
## Getting the Most from Attendance Tracking

### Do's ✅
- Clock in as soon as you arrive
- Enable GPS for accurate location tracking
- Clock out before leaving the premises
- Report any issues immediately to HR

### Don'ts ❌
- Don't forget to clock out
- Don't clock in from home if working at office
- Don't share your login credentials

### Pro Tips 💡
- Add the HR Pass to your home screen for quick access
- Set a reminder alarm for clock-in time
- Check your weekly hours every Friday
    `
  },
  {
    id: 'leave-tips',
    category: 'leave',
    title: '🏖️ Leave Request Best Practices',
    icon: '🏖️',
    content: `
## How to Request Leave Effectively

### Planning Ahead
- Submit annual leave requests at least **2 weeks** in advance
- Check team calendar for conflicts
- Discuss with your manager before submitting

### Documentation
- Sick leave > 2 days requires medical certificate
- Keep your reference number for tracking
- Attach supporting documents when required

### Tips for Approval
- Avoid peak business periods if possible
- Ensure work handover is arranged
- Update your out-of-office message
    `
  },
  {
    id: 'document-request-tips',
    category: 'documents',
    title: '📄 Document Request Guide',
    icon: '📄',
    content: `
## Requesting HR Documents

### Common Documents
| Document | Processing Time |
|----------|-----------------|
| Salary Certificate | 2 business days |
| Employment Letter | 2 business days |
| NOC (No Objection Certificate) | 3 business days |
| Experience Letter | 3 business days |
| Bank Letter | 2 business days |

### Tips
- Mention the purpose (visa, bank, embassy)
- Provide exact recipient name if needed
- For urgent requests, select "Urgent" option
- Keep your reference number to track status
    `
  },
  {
    id: 'overtime-tips',
    category: 'attendance',
    title: '⏱️ Overtime Guidelines',
    icon: '⏱️',
    content: `
## Managing Overtime

### Getting Approval
- Pre-approval required for planned overtime
- Log actual hours worked
- Choose payment or offset days

### Offset Days
- 1 overtime hour = 1.25 offset hours (weekday)
- 1 overtime hour = 1.5 offset hours (Friday/holiday)
- Use within 3 months

### Limits
- Maximum 2 hours overtime per day
- Maximum 144 hours overtime per year
    `
  }
];

// ============================================================
// FAQ
// ============================================================

const FAQ = [
  {
    id: 'faq-1',
    category: 'leave',
    question: 'Can I carry forward my unused annual leave?',
    answer: 'Yes, unused annual leave can be carried forward to the next year. However, it must be used within 2 years of accrual, or your employer may require you to take the leave or pay cash equivalent.'
  },
  {
    id: 'faq-2',
    category: 'leave',
    question: 'Do public holidays count as leave days?',
    answer: 'No. If a public holiday falls during your annual leave period, that day is not counted as a leave day. Your leave is effectively extended by the number of public holidays.'
  },
  {
    id: 'faq-3',
    category: 'attendance',
    question: 'What happens if I forget to clock out?',
    answer: 'Contact HR immediately to correct your attendance record. They can add a manual entry for you. Repeated instances may require a written explanation.'
  },
  {
    id: 'faq-4',
    category: 'salary',
    question: 'When is salary paid?',
    answer: 'Salaries must be paid through WPS (Wage Protection System) by the end of each month. If the last day falls on a weekend/holiday, payment is made the previous working day.'
  },
  {
    id: 'faq-5',
    category: 'documents',
    question: 'How do I get a salary certificate for a bank loan?',
    answer: 'Submit a document request through Quick Links → Document Request → Salary Certificate. Select the purpose as "Bank/Loan" and it will be ready within 2 business days.'
  },
  {
    id: 'faq-6',
    category: 'leave',
    question: 'Can I take leave during probation?',
    answer: 'Annual leave typically cannot be taken during probation unless approved by your manager. Sick leave is available after completing 3 months of the probation period.'
  },
  {
    id: 'faq-7',
    category: 'general',
    question: 'What is the notice period if I want to resign?',
    answer: 'The minimum notice period is 30 days, but check your employment contract as it may specify a longer period (up to 90 days). During notice, you are entitled to 1 day off per week for job searching.'
  },
  {
    id: 'faq-8',
    category: 'gratuity',
    question: 'How is end of service gratuity calculated?',
    answer: 'For 1-5 years of service: 21 days basic salary per year. For 5+ years: 30 days basic salary per year for years beyond 5. Total cannot exceed 2 years salary.'
  }
];

// ============================================================
// API ENDPOINTS
// ============================================================

/**
 * @route GET /api/education/overview
 * @desc Get education module overview
 * @access Public
 */
router.get('/overview', (req, res: Response) => {
  res.json({
    title: 'Employee Education Center',
    description: 'Learn about UAE labor law, company policies, and best practices',
    sections: [
      {
        id: 'uae-labor-law',
        title: '📚 UAE Labor Law',
        description: 'Your rights and entitlements under UAE law',
        topicCount: UAE_LABOR_LAW.topics.length
      },
      {
        id: 'tips-guides',
        title: '💡 Tips & Guides',
        description: 'Best practices for using HR services',
        topicCount: TIPS_AND_GUIDES.length
      },
      {
        id: 'faq',
        title: '❓ FAQ',
        description: 'Frequently asked questions',
        topicCount: FAQ.length
      }
    ]
  });
});

/**
 * @route GET /api/education/uae-labor-law
 * @desc Get UAE labor law topics list
 * @access Public
 */
router.get('/uae-labor-law', (req, res: Response) => {
  res.json({
    ...UAE_LABOR_LAW.overview,
    topics: UAE_LABOR_LAW.topics.map(t => ({
      id: t.id,
      title: t.title,
      icon: t.icon,
      hasQuiz: t.quiz && t.quiz.length > 0
    }))
  });
});

/**
 * @route GET /api/education/uae-labor-law/:topicId
 * @desc Get specific UAE labor law topic with content and quiz
 * @access Public
 */
router.get('/uae-labor-law/:topicId', (req, res: Response) => {
  const topic = UAE_LABOR_LAW.topics.find(t => t.id === req.params.topicId);
  
  if (!topic) {
    return res.status(404).json({ error: 'Topic not found' });
  }

  res.json(topic);
});

/**
 * @route GET /api/education/tips
 * @desc Get all tips and guides
 * @access Public
 */
router.get('/tips', (req, res: Response) => {
  const { category } = req.query;
  
  let tips = TIPS_AND_GUIDES;
  if (category) {
    tips = tips.filter(t => t.category === category);
  }

  res.json({
    count: tips.length,
    categories: [...new Set(TIPS_AND_GUIDES.map(t => t.category))],
    tips: tips.map(t => ({
      id: t.id,
      title: t.title,
      icon: t.icon,
      category: t.category
    }))
  });
});

/**
 * @route GET /api/education/tips/:tipId
 * @desc Get specific tip with full content
 * @access Public
 */
router.get('/tips/:tipId', (req, res: Response) => {
  const tip = TIPS_AND_GUIDES.find(t => t.id === req.params.tipId);
  
  if (!tip) {
    return res.status(404).json({ error: 'Tip not found' });
  }

  res.json(tip);
});

/**
 * @route GET /api/education/faq
 * @desc Get all FAQ
 * @access Public
 */
router.get('/faq', (req, res: Response) => {
  const { category } = req.query;
  
  let faq = FAQ;
  if (category) {
    faq = faq.filter(f => f.category === category);
  }

  res.json({
    count: faq.length,
    categories: [...new Set(FAQ.map(f => f.category))],
    faq
  });
});

/**
 * @route POST /api/education/quiz/:topicId/submit
 * @desc Submit quiz answers and get score
 * @access Private
 */
router.post('/quiz/:topicId/submit', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const topic = UAE_LABOR_LAW.topics.find(t => t.id === req.params.topicId);
  
  if (!topic || !topic.quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  const { answers } = req.body; // Array of answer indices
  
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Answers array required' });
  }

  let correct = 0;
  const results = topic.quiz.map((q, i) => {
    const isCorrect = answers[i] === q.correct;
    if (isCorrect) correct++;
    return {
      question: q.question,
      yourAnswer: q.options[answers[i]] || 'Not answered',
      correctAnswer: q.options[q.correct],
      isCorrect,
      explanation: q.explanation
    };
  });

  const score = Math.round((correct / topic.quiz.length) * 100);

  res.json({
    topicId: topic.id,
    topicTitle: topic.title,
    totalQuestions: topic.quiz.length,
    correctAnswers: correct,
    score,
    passed: score >= 70,
    results,
    message: score >= 70 
      ? '🎉 Great job! You passed the quiz!' 
      : '📚 Keep learning! Review the content and try again.'
  });
});

/**
 * @route GET /api/education/search
 * @desc Search across all education content
 * @access Public
 */
router.get('/search', (req, res: Response) => {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Search query required' });
  }

  const query = q.toLowerCase();
  const results: any[] = [];

  // Search UAE labor law topics
  UAE_LABOR_LAW.topics.forEach(topic => {
    if (topic.title.toLowerCase().includes(query) || 
        topic.content.toLowerCase().includes(query)) {
      results.push({
        type: 'uae-labor-law',
        id: topic.id,
        title: topic.title,
        icon: topic.icon,
        url: `/education/uae-labor-law/${topic.id}`
      });
    }
  });

  // Search tips
  TIPS_AND_GUIDES.forEach(tip => {
    if (tip.title.toLowerCase().includes(query) || 
        tip.content.toLowerCase().includes(query)) {
      results.push({
        type: 'tip',
        id: tip.id,
        title: tip.title,
        icon: tip.icon,
        url: `/education/tips/${tip.id}`
      });
    }
  });

  // Search FAQ
  FAQ.forEach(faq => {
    if (faq.question.toLowerCase().includes(query) || 
        faq.answer.toLowerCase().includes(query)) {
      results.push({
        type: 'faq',
        id: faq.id,
        title: faq.question,
        category: faq.category,
        url: `/education/faq#${faq.id}`
      });
    }
  });

  res.json({
    query: q,
    count: results.length,
    results
  });
});

export default router;
