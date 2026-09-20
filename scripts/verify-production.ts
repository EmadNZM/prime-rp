/**
 * PRIME RP - Automated Production Verification Test Suite
 * Tests all newly implemented hardening, validation, security, and bridge layers.
 */

import { 
  ticketCreateSchema, 
  ticketReplySchema,
  reportCreateSchema, 
  checkoutCreateSchema,
  jobApplicationCreateSchema,
  fivemBridgeSyncSchema,
  leaderboardEntrySchema,
  userRoleUpdateSchema
} from '../server/middleware/validation';
import { fiveMService } from '../server/services/fivemService';
import { paymentService } from '../server/services/paymentService';
import { validateEnvironment } from '../server/config/env';
import { orderRepository } from '../server/db/repositories/OrderRepository';
import { productRepository } from '../server/db/repositories/ProductRepository';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('--- STARTING PRIME RP COMPREHENSIVE PRODUCTION VERIFICATION ---');

  // Test Suite 1: Environment Security Validation
  console.log('\n[Suite 1] Environment & Security Constraints');
  const envValidation = validateEnvironment();
  assert(typeof envValidation.isProductionReady === 'boolean', 'validateEnvironment returns boolean readiness');
  assert(envValidation.missingCritical.includes('OWNER_DISCORD_ID') || envValidation.critical.ownerId === 'configured', 'Owner ID check enforced');

  // Test Suite 2: Zod Input Validation & Schema Hardening
  console.log('\n[Suite 2] Zod Validation & Input Sanitization');
  
  // Ticket Creation
  const validTicket = ticketCreateSchema.safeParse({
    subject: 'مساعدة في السيرفر',
    category: 'GENERAL',
    priority: 'HIGH',
    message: 'أحتاج مساعدة بخصوص استرجاع مركبتي.'
  });
  assert(validTicket.success, 'Valid ticket input passes Zod schema');

  const invalidTicket = ticketCreateSchema.safeParse({
    subject: 'A', // too short
    category: 'INVALID_CATEGORY',
    message: ''
  });
  assert(!invalidTicket.success, 'Invalid ticket input rejected with clear errors');

  // Report Creation
  const validReport = reportCreateSchema.safeParse({
    category: 'CHEATING',
    reason: 'استخدام برامج مساعدة غير قانونية في منطقة الريدزون',
    targetName: 'Player123'
  });
  assert(validReport.success, 'Valid report input passes Zod schema');

  const invalidReport = reportCreateSchema.safeParse({
    category: 'INVALID_CATEGORY',
    reason: ''
  });
  assert(!invalidReport.success, 'Invalid report category rejected');

  // Job Application
  const validJobApp = jobApplicationCreateSchema.safeParse({
    characterName: 'John Doe',
    characterAge: 25,
    experience: 'خبرة سنتين في قسم الشرطة وسيرفرات رول بلاي سابقة',
    dailyAvailability: '4-6 ساعات يومياً'
  });
  assert(validJobApp.success, 'Valid job application passes Zod schema');

  const invalidJobAge = jobApplicationCreateSchema.safeParse({
    characterName: 'Kid',
    characterAge: 12, // under 16
    experience: 'test',
    dailyAvailability: '1 hour'
  });
  assert(!invalidJobAge.success, 'Job applicant under 16 is rejected');

  // Role Update Protection
  const invalidOwnerAssignment = userRoleUpdateSchema.safeParse({
    role: 'OWNER'
  });
  assert(!invalidOwnerAssignment.success, 'Attempt to assign OWNER role is rejected by schema');

  // Test Suite 3: FiveM Telemetry & Bridge Synchronization
  console.log('\n[Suite 3] FiveM Bridge Push & Player Telemetry');
  
  const sampleBridgePayload = {
    serverName: 'PRIME RP | OFFICIAL SERVER',
    activePlayers: 42,
    maxPlayers: 128,
    status: 'ONLINE' as const,
    players: [
      { id: 1, name: 'Commander_Ahmed', ping: 22, identifiers: ['discord:111111111'] },
      { id: 2, name: 'Officer_Salem', ping: 35, identifiers: ['steam:12345678'] }
    ],
    leaderboard: [
      {
        id: 'lb_test_1',
        name: 'Commander_Ahmed',
        category: 'wealth' as const,
        rank: 1,
        score: 5000000,
        formattedScore: '$5,000,000'
      }
    ]
  };

  const bridgeValidation = fivemBridgeSyncSchema.safeParse(sampleBridgePayload);
  assert(bridgeValidation.success, 'Bridge telemetry payload validates successfully');

  const syncedStatus = fiveMService.updateFromBridge(sampleBridgePayload);
  assert(syncedStatus.isOnline === true, 'FiveM service records online status from bridge');
  assert(syncedStatus.activePlayers === 42, 'FiveM service updates active players count to 42');
  assert(syncedStatus.maxPlayers === 128, 'FiveM service updates max players capacity to 128');

  const bridgePlayers = fiveMService.getBridgeCachedPlayers();
  assert(bridgePlayers.length === 2, 'Cached players list correctly populated from bridge sync');
  assert(bridgePlayers[0]?.name === 'Commander_Ahmed', 'Player details correctly preserved');

  const activePlayers = await fiveMService.getPlayers();
  assert(Array.isArray(activePlayers), 'getPlayers returns valid player array');

  // Test Suite 4: Payment Idempotency & Order Fulfillment
  console.log('\n[Suite 4] Payment Idempotency & Order Fulfillment');
  
  // Find an existing product or create order
  const products = await productRepository.getAll();
  const targetProduct = products[0];
  assert(Boolean(targetProduct && targetProduct.id), 'Found store product for testing');

  // Create a pending order in repository
  const testOrder = await orderRepository.create('usr_test_verification', targetProduct.id);
  assert(Boolean(testOrder && testOrder.id), 'Test order created in repository');
  assert(testOrder?.status === 'PENDING', 'Initial order status is PENDING');

  // First fulfillment attempt
  const firstFulfill = await paymentService.fulfillOrder(testOrder!.id, 'TEST_SUITE');
  assert(firstFulfill.success === true, 'First fulfillment attempt succeeds');
  assert(!firstFulfill.alreadyCompleted, 'First fulfillment correctly marked as new');

  // Second fulfillment attempt (test idempotency)
  const secondFulfill = await paymentService.fulfillOrder(testOrder!.id, 'TEST_SUITE');
  assert(secondFulfill.success === true, 'Second fulfillment attempt succeeds safely (idempotent)');
  assert(secondFulfill.alreadyCompleted === true, 'Second fulfillment correctly detected order already fulfilled');

  // Webhook handling with invalid signature
  const webhookResult = await paymentService.handleWebhook('STRIPE', { test: true }, 'invalid_signature');
  assert(webhookResult.handled === false || !process.env.STRIPE_WEBHOOK_SECRET, 'Stripe webhook fails closed with invalid signature when secret is configured');

  console.log('\n========================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('[Verification Suite] Fatal test runner error:', err);
  process.exit(1);
});
