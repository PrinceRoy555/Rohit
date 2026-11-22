/**
 * Test Public Website Form & Query Compatibility against Current firestore.rules
 */
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import fs from 'fs';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';

const PROJECT_ID = 'rohit-72bfa';
const rules = fs.readFileSync('C:/Users/ASUS/OneDrive/Desktop/rohitwork/firestore.rules', 'utf8');

async function testPublicCompatibility() {
  console.log('==================================================================');
  console.log('  TESTING REAL PUBLIC WEBSITE PAYLOADS AGAINST PROPOSED RULES     ');
  console.log('==================================================================\n');

  let testEnv: RulesTestEnvironment;
  try {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules,
        host: '127.0.0.1',
        port: 8080
      }
    });
  } catch (err: any) {
    console.error('Fatal connecting to emulator:', err);
    process.exit(1);
  }

  try {
    await testEnv.clearFirestore();
  } catch (clearErr) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      await testEnv.clearFirestore();
    } catch {
      // Ignored
    }
  }

  // Seed fixtures
  await testEnv.withSecurityRulesDisabled(async (adminContext) => {
    const adminDb = adminContext.firestore();
    await setDoc(doc(adminDb, 'insights', 'insight_test_01'), {
      title: 'Test Insight',
      slug: 'ai-trends-2026',
      status: 'published',
      content: 'This is a test insight post.',
      createdAt: new Date().toISOString()
    });
    await setDoc(doc(adminDb, 'insights', 'insight_draft_01'), {
      title: 'Draft Insight',
      slug: 'draft-post',
      status: 'draft',
      content: 'Secret draft post.',
      createdAt: new Date().toISOString()
    });
    await setDoc(doc(adminDb, 'siteConfig', 'live'), {
      heroTitle: 'Creative Agency',
      status: 'active'
    });
    await setDoc(doc(adminDb, 'siteConfig', 'draft'), {
      heroTitle: 'Unpublished Redesign',
      status: 'draft'
    });
  });

  const visitor = testEnv.unauthenticatedContext().firestore();

  // 1. ContactSection.tsx payload
  console.log('1. ContactSection.tsx payload:');
  await assertSucceeds(addDoc(collection(visitor, 'contactEnquiries'), {
    name: 'Sunil Verma',
    email: 'sunil@example.com',
    selectedService: 'Web App Development',
    projectDescription: 'We need a high quality web app with 3D elements.',
    consentAccepted: true,
    source: 'website-contact-form',
    status: 'new',
    createdAt: new Date().toISOString()
  }));
  console.log('  [PASS] ContactSection.tsx (source: website-contact-form) is accepted');

  // 2. ContactPage.tsx payload
  console.log('\n2. ContactPage.tsx payload:');
  await assertSucceeds(addDoc(collection(visitor, 'contactEnquiries'), {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 9988776655',
    selectedService: 'General Creative Enquiry',
    budgetRange: 'Not specified',
    projectDescription: 'Need branding and web redesign for retail chain.',
    consentAccepted: true,
    source: 'contact_page',
    status: 'new',
    createdAt: new Date().toISOString()
  }));
  console.log('  [PASS] ContactPage.tsx (source: contact_page) is accepted');

  // 3. cmsApi.ts submitContactInquiry payload
  console.log('\n3. cmsApi.ts payload:');
  await assertSucceeds(addDoc(collection(visitor, 'contactEnquiries'), {
    name: 'Amit Patel',
    email: 'amit@example.com',
    selectedService: 'General Inquiry',
    projectDescription: 'Inquiry via CMS API helper.',
    consentAccepted: true,
    source: 'website-contact',
    status: 'new',
    createdAt: new Date().toISOString()
  }));
  console.log('  [PASS] cmsApi.ts (source: website-contact) is accepted');

  // 4. AIChatbot.tsx (submitChatbotLead) payload
  console.log('\n4. AIChatbot.tsx (submitChatbotLead) payload:');
  await assertSucceeds(addDoc(collection(visitor, 'chatbotLeads'), {
    name: 'Chatbot Visitor',
    email: 'bot_visitor@example.com',
    source: 'uni-ai-chatbot',
    status: 'new',
    createdAt: new Date().toISOString(),
    requiredService: 'Full Stack Development',
    projectDescription: 'User requested consultation via chatbot prompt.',
    pageUrl: 'https://rohitwork.in/'
  }));
  console.log('  [PASS] AIChatbot.tsx lead is accepted');

  // 5. PricingSection.tsx (submitQuoteRequest) payload
  console.log('\n5. PricingSection.tsx (submitQuoteRequest) payload:');
  await assertSucceeds(addDoc(collection(visitor, 'quoteRequests'), {
    name: 'Rajesh Khanna',
    email: 'rajesh@enterprise.com',
    packageName: 'Full Agency Retainer',
    requiredService: 'Creative Retainer',
    projectDescription: 'Monthly retainer for video and design assets.',
    source: 'website-pricing',
    status: 'new',
    createdAt: new Date().toISOString(),
    pageUrl: 'https://rohitwork.in/pricing'
  }));
  console.log('  [PASS] PricingSection.tsx quote request is accepted');

  // 6. Footer newsletter (subscribeToNewsletter) payload
  console.log('\n6. Newsletter subscription payload:');
  await assertSucceeds(setDoc(doc(visitor, 'newsletterSubscribers', 'hash_test_email'), {
    email: 'subscriber@gmail.com',
    emailNormalised: 'subscriber@gmail.com',
    status: 'active',
    source: 'website-newsletter',
    subscribedAt: new Date().toISOString()
  }));
  console.log('  [PASS] Newsletter subscription is accepted');

  // 7. SiteConfig /siteConfig/live read & draft block
  console.log('\n7. SiteConfig read tests:');
  const liveSnap = await assertSucceeds(getDoc(doc(visitor, 'siteConfig', 'live')));
  console.log('  [PASS] Visitor can read /siteConfig/live (exists: ' + liveSnap.exists() + ')');
  await assertFails(getDoc(doc(visitor, 'siteConfig', 'draft')));
  console.log('  [PASS] Visitor CANNOT read /siteConfig/draft');

  // 8. fetchInsights query: where('status', '==', 'published')
  console.log('\n8. fetchInsights query with status filter:');
  const qPublished = query(collection(visitor, 'insights'), where('status', '==', 'published'));
  const snapPub = await assertSucceeds(getDocs(qPublished));
  console.log('  [PASS] fetchInsights query succeeded, found ' + snapPub.size + ' published documents');

  // 9. fetchInsightBySlug query: slug + status published
  console.log('\n9. fetchInsightBySlug with slug and status published:');
  const qSlug = query(collection(visitor, 'insights'), where('slug', '==', 'ai-trends-2026'), where('status', '==', 'published'));
  const snapSlug = await assertSucceeds(getDocs(qSlug));
  console.log('  [PASS] fetchInsightBySlug succeeded, found ' + snapSlug.size + ' document');

  // 10. Attempt to query draft insight as unauthenticated visitor
  console.log('\n10. Unauthenticated visitor querying draft insight:');
  const qDraft = query(collection(visitor, 'insights'), where('slug', '==', 'draft-post'), where('status', '==', 'draft'));
  await assertFails(getDocs(qDraft));
  console.log('  [PASS] Draft insight query is strictly blocked by security rules');

  console.log('\n==================================================================');
  console.log('  ALL 10 PUBLIC WEBSITE TESTS PASSED WITH 100% ACCURACY           ');
  console.log('==================================================================\n');

  await testEnv.cleanup();
  process.exit(0);
}

testPublicCompatibility().catch((err) => {
  console.error(err);
  process.exit(1);
});
