import {
  validateName,
  validateEmail,
  validateProjectDescription,
  validateAttachment,
  sanitizeText,
  normalizeEmail,
  hashEmailToDocId
} from '../../lib/validation';

export function runValidationTests(): boolean {
  console.log('[Test Suite] Running Firebase & Input Validation Tests...');

  // Test 1: Name validation
  const nameRes1 = validateName('Rohit Verma');
  const nameRes2 = validateName('A');
  if (!nameRes1.isValid || nameRes2.isValid) {
    throw new Error('Name validation test failed');
  }

  // Test 2: Email validation & normalization
  const emailRes = validateEmail('Workall724038@GMAIL.COM');
  const normEmail = normalizeEmail(' Workall724038@GMAIL.COM ');
  if (!emailRes.isValid || normEmail !== 'workall724038@gmail.com') {
    throw new Error('Email validation test failed');
  }

  // Test 3: Project description
  const descRes = validateProjectDescription('Need a high converting website layout');
  if (!descRes.isValid) {
    throw new Error('Project description test failed');
  }

  // Test 4: Sanitization
  const clean = sanitizeText('Hello <script>alert("xss")</script> World');
  if (clean !== 'Hello alert("xss") World') {
    throw new Error('Sanitization test failed');
  }

  // Test 5: Doc ID hash
  const docId1 = hashEmailToDocId('test@example.com');
  const docId2 = hashEmailToDocId('test@example.com');
  if (docId1 !== docId2) {
    throw new Error('Hash email doc ID test failed');
  }

  // Test 6: File attachment validation
  const validFile = new File(['dummy content'], 'brief.pdf', { type: 'application/pdf' });
  if (!validateAttachment(validFile).isValid) {
    throw new Error('Attachment validation test failed');
  }

  console.log('[Test Suite] All 6 validation unit tests passed successfully!');
  return true;
}
