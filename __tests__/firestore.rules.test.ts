import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const rulesPath = path.resolve(__dirname, '../firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');
  
  testEnv = await initializeTestEnvironment({
    projectId: 'feedbacks-test',
    firestore: {
      rules,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

// ===========================
// TEST DATA HELPERS
// ===========================

const testUserId = 'user123';
const testUserEmail = 'user@example.com';
const testUserData = {
  name: 'Test User',
  email: testUserEmail,
  professionalSector: 'Tecnología',
};

const anotherUserId = 'user456';
const anotherUserData = {
  name: 'Another User',
  email: 'another@example.com',
  professionalSector: 'Salud',
};

// ===========================
// USERS COLLECTION TESTS
// ===========================

describe('Users Collection', () => {
  test('User can create their own profile', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await assertSucceeds(
      db.collection('users').doc(testUserId).set(testUserData)
    );
  });

  test('User cannot create another user profile', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await assertFails(
      db.collection('users').doc(anotherUserId).set(anotherUserData)
    );
  });

  test('User can read their own profile', async () => {
    const admin = testEnv.authenticatedContext(testUserId).firestore();
    await admin.collection('users').doc(testUserId).set(testUserData);

    const user = testEnv.authenticatedContext(testUserId).firestore();
    await assertSucceeds(
      user.collection('users').doc(testUserId).get()
    );
  });

  test('User cannot read another user profile', async () => {
    const admin = testEnv.authenticatedContext(testUserId).firestore();
    await admin.collection('users').doc(anotherUserId).set(anotherUserData);

    const user = testEnv.authenticatedContext(testUserId).firestore();
    await assertFails(
      user.collection('users').doc(anotherUserId).get()
    );
  });

  test('User can update their own profile', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await db.collection('users').doc(testUserId).set(testUserData);

    await assertSucceeds(
      db.collection('users').doc(testUserId).update({
        name: 'Updated Name',
      })
    );
  });

  test('User cannot update another user profile', async () => {
    const admin = testEnv.authenticatedContext(testUserId).firestore();
    await admin.collection('users').doc(anotherUserId).set(anotherUserData);

    const user = testEnv.authenticatedContext(testUserId).firestore();
    await assertFails(
      user.collection('users').doc(anotherUserId).update({ name: 'Hacked' })
    );
  });

  test('User cannot list all users', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await assertFails(
      db.collection('users').get()
    );
  });

  test('User cannot delete their profile from client', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await db.collection('users').doc(testUserId).set(testUserData);

    await assertFails(
      db.collection('users').doc(testUserId).delete()
    );
  });

  test('Reject user creation with invalid email', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await assertFails(
      db.collection('users').doc(testUserId).set({
        name: 'Test User',
        email: 'invalid-email',
        professionalSector: 'Tecnología',
      })
    );
  });

  test('Reject user creation with invalid sector', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await assertFails(
      db.collection('users').doc(testUserId).set({
        name: 'Test User',
        email: testUserEmail,
        professionalSector: 'InvalidSector',
      })
    );
  });

  test('Accept user creation with null sector', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await assertSucceeds(
      db.collection('users').doc(testUserId).set({
        name: 'Test User',
        email: testUserEmail,
        professionalSector: null,
      })
    );
  });

  test('Anonymous user cannot create a profile', async () => {
    const db = testEnv.authenticatedContext(testUserId, { isAnonymous: true }).firestore();
    await assertFails(
      db.collection('users').doc(testUserId).set(testUserData)
    );
  });
});

// ===========================
// RECOMMENDATIONS COLLECTION TESTS
// ===========================

describe('Recommendations Collection', () => {
  test('Anyone can read recommendations', async () => {
    const admin = testEnv.authenticatedContext(testUserId).firestore();
    const recData = {
      userId: testUserId,
      userName: 'Test User',
      text: 'This is a great service recommendation',
      sector: 'Tecnología',
      createdAt: new Date(),
    };
    await admin.collection('recommendations').doc('rec1').set(recData);

    const unauth = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(
      unauth.collection('recommendations').doc('rec1').get()
    );
  });

  test('Authenticated user can create recommendation for themselves', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await assertSucceeds(
      db.collection('recommendations').doc().set({
        userId: testUserId,
        userName: 'Test User',
        text: 'Great recommendation text',
        sector: 'Tecnología',
        createdAt: new Date(),
      })
    );
  });

  test('User cannot create recommendation with another user ID', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await assertFails(
      db.collection('recommendations').doc().set({
        userId: anotherUserId,
        userName: 'Another User',
        text: 'Fraudulent recommendation',
        sector: 'Tecnología',
        createdAt: new Date(),
      })
    );
  });

  test('Reject recommendation with invalid sector', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await assertFails(
      db.collection('recommendations').doc().set({
        userId: testUserId,
        userName: 'Test User',
        text: 'Recommendation text',
        sector: 'InvalidSector',
        createdAt: new Date(),
      })
    );
  });

  test('Owner can update their recommendation', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await db.collection('recommendations').doc('rec1').set({
      userId: testUserId,
      userName: 'Test User',
      text: 'Original text',
      sector: 'Tecnología',
      createdAt: new Date(),
    });

    await assertSucceeds(
      db.collection('recommendations').doc('rec1').update({
        text: 'Updated text',
      })
    );
  });

  test('Non-owner cannot update recommendation', async () => {
    const admin = testEnv.authenticatedContext(testUserId).firestore();
    await admin.collection('recommendations').doc('rec1').set({
      userId: testUserId,
      userName: 'Test User',
      text: 'Original text',
      sector: 'Tecnología',
      createdAt: new Date(),
    });

    const user = testEnv.authenticatedContext(anotherUserId).firestore();
    await assertFails(
      user.collection('recommendations').doc('rec1').update({
        text: 'Hacked text',
      })
    );
  });

  test('Recommendation cannot be deleted from client', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await db.collection('recommendations').doc('rec1').set({
      userId: testUserId,
      userName: 'Test User',
      text: 'Text',
      sector: 'Tecnología',
      createdAt: new Date(),
    });

    await assertFails(
      db.collection('recommendations').doc('rec1').delete()
    );
  });

  test('Anonymous user cannot create recommendation', async () => {
    const db = testEnv.authenticatedContext(testUserId, { isAnonymous: true }).firestore();
    await assertFails(
      db.collection('recommendations').doc().set({
        userId: testUserId,
        userName: 'Test User',
        text: 'Text',
        sector: 'Tecnología',
        createdAt: new Date(),
      })
    );
  });
});

// ===========================
// CHAT MESSAGES COLLECTION TESTS
// ===========================

describe('Chat Messages Collection', () => {
  test('Non-anonymous user can create chat message', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await assertSucceeds(
      db.collection('chatMessages').doc().set({
        userId: testUserId,
        userName: 'Test User',
        text: 'Hello everyone!',
        createdAt: new Date(),
      })
    );
  });

  test('Anonymous user cannot create chat message', async () => {
    const db = testEnv.authenticatedContext(testUserId, { isAnonymous: true }).firestore();
    await assertFails(
      db.collection('chatMessages').doc().set({
        userId: testUserId,
        userName: 'Guest User',
        text: 'Hello!',
        createdAt: new Date(),
      })
    );
  });

  test('Unauthenticated user cannot create chat message', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      db.collection('chatMessages').doc().set({
        userId: 'unknown',
        userName: 'Unknown',
        text: 'Hello!',
        createdAt: new Date(),
      })
    );
  });

  test('User cannot create message with another user ID', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await assertFails(
      db.collection('chatMessages').doc().set({
        userId: anotherUserId,
        userName: 'Another User',
        text: 'Fraudulent message',
        createdAt: new Date(),
      })
    );
  });

  test('Non-anonymous user can list chat messages', async () => {
    const admin = testEnv.authenticatedContext(testUserId).firestore();
    await admin.collection('chatMessages').doc('msg1').set({
      userId: testUserId,
      userName: 'Test User',
      text: 'Message 1',
      createdAt: new Date(),
    });

    const user = testEnv.authenticatedContext(anotherUserId).firestore();
    await assertSucceeds(
      user.collection('chatMessages').get()
    );
  });

  test('Anonymous user cannot list chat messages', async () => {
    const db = testEnv.authenticatedContext(testUserId, { isAnonymous: true }).firestore();
    await assertFails(
      db.collection('chatMessages').get()
    );
  });

  test('Chat messages are immutable - cannot update', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await db.collection('chatMessages').doc('msg1').set({
      userId: testUserId,
      userName: 'Test User',
      text: 'Original message',
      createdAt: new Date(),
    });

    await assertFails(
      db.collection('chatMessages').doc('msg1').update({
        text: 'Edited message',
      })
    );
  });

  test('Chat messages are immutable - cannot delete', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await db.collection('chatMessages').doc('msg1').set({
      userId: testUserId,
      userName: 'Test User',
      text: 'Message',
      createdAt: new Date(),
    });

    await assertFails(
      db.collection('chatMessages').doc('msg1').delete()
    );
  });
});

// ===========================
// FEEDBACK LOGS COLLECTION TESTS
// ===========================

describe('Summarized Feedback Logs Collection', () => {
  test('Authenticated user can create feedback log', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await assertSucceeds(
      db.collection('summarizedFeedbackLogs').doc().set({
        originalFeedbackText: 'User feedback text',
        summaryText: 'Summarized feedback',
        userId: testUserId,
        createdAt: new Date(),
      })
    );
  });

  test('Authenticated user can create feedback log with null userId', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await assertSucceeds(
      db.collection('summarizedFeedbackLogs').doc().set({
        originalFeedbackText: 'Anonymous feedback',
        summaryText: 'Summarized anonymous feedback',
        userId: null,
        createdAt: new Date(),
      })
    );
  });

  test('Anonymous user can create feedback log', async () => {
    const db = testEnv.authenticatedContext(testUserId, { isAnonymous: true }).firestore();
    await assertSucceeds(
      db.collection('summarizedFeedbackLogs').doc().set({
        originalFeedbackText: 'Anonymous feedback',
        summaryText: 'Summarized feedback',
        createdAt: new Date(),
      })
    );
  });

  test('Unauthenticated user cannot create feedback log', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(
      db.collection('summarizedFeedbackLogs').doc().set({
        originalFeedbackText: 'Feedback',
        summaryText: 'Summary',
        createdAt: new Date(),
      })
    );
  });

  test('Any authenticated user can read feedback logs', async () => {
    const admin = testEnv.authenticatedContext(testUserId).firestore();
    await admin.collection('summarizedFeedbackLogs').doc('log1').set({
      originalFeedbackText: 'Feedback',
      summaryText: 'Summary',
      userId: testUserId,
      createdAt: new Date(),
    });

    const user = testEnv.authenticatedContext(anotherUserId).firestore();
    await assertSucceeds(
      user.collection('summarizedFeedbackLogs').doc('log1').get()
    );
  });

  test('Feedback logs are immutable - cannot update', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await db.collection('summarizedFeedbackLogs').doc('log1').set({
      originalFeedbackText: 'Original feedback',
      summaryText: 'Original summary',
      userId: testUserId,
      createdAt: new Date(),
    });

    await assertFails(
      db.collection('summarizedFeedbackLogs').doc('log1').update({
        summaryText: 'Updated summary',
      })
    );
  });

  test('Feedback logs are immutable - cannot delete', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await db.collection('summarizedFeedbackLogs').doc('log1').set({
      originalFeedbackText: 'Feedback',
      summaryText: 'Summary',
      userId: testUserId,
      createdAt: new Date(),
    });

    await assertFails(
      db.collection('summarizedFeedbackLogs').doc('log1').delete()
    );
  });

  test('Reject feedback log with empty text', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await assertFails(
      db.collection('summarizedFeedbackLogs').doc().set({
        originalFeedbackText: '',
        summaryText: 'Summary',
        userId: testUserId,
        createdAt: new Date(),
      })
    );
  });
});

// ===========================
// CATCH-ALL DENY TESTS
// ===========================

describe('Catch-All Deny Rules', () => {
  test('Prevent access to undefined collections', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await assertFails(
      db.collection('undefinedCollection').doc('doc1').get()
    );
  });

  test('Prevent write to undefined collections', async () => {
    const db = testEnv.authenticatedContext(testUserId).firestore();
    await assertFails(
      db.collection('undefinedCollection').doc('doc1').set({ data: 'test' })
    );
  });
});
