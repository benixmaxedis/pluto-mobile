import { eq, and, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { momentumChains, momentumChainSteps } from '@/lib/db/schema';
import { generateId } from '@/lib/utils/id';
import { logEvent } from '@/features/activity/db/activity-queries';
import { EventType, EntityType } from '@/lib/constants';
import type { MomentumChainFormData, MomentumChainStepFormData } from '@/lib/validation';

export async function getAllChains() {
  return db.select().from(momentumChains).where(isNull(momentumChains.deletedAt));
}

export async function getActiveChains() {
  return db
    .select()
    .from(momentumChains)
    .where(and(isNull(momentumChains.deletedAt), eq(momentumChains.isActive, true)));
}

export async function getChainById(id: string) {
  const rows = await db
    .select()
    .from(momentumChains)
    .where(eq(momentumChains.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getChainsByDomain(domain: string) {
  return db
    .select()
    .from(momentumChains)
    .where(and(isNull(momentumChains.deletedAt), eq(momentumChains.domain, domain)));
}

export async function getChainSteps(chainId: string) {
  return db
    .select()
    .from(momentumChainSteps)
    .where(eq(momentumChainSteps.chainId, chainId))
    .orderBy(momentumChainSteps.orderIndex);
}

export async function createChain(
  data: MomentumChainFormData,
  steps: MomentumChainStepFormData[],
  userId?: string,
  createdBy: 'user' | 'system' | 'pluto' = 'user',
) {
  const chainId = generateId();
  const now = new Date().toISOString();

  await db.insert(momentumChains).values({
    id: chainId,
    userId: userId ?? null,
    name: data.name,
    domain: data.domain,
    description: data.description ?? null,
    isActive: data.isActive ?? true,
    createdBy,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
    syncVersion: 0,
  });

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    await db.insert(momentumChainSteps).values({
      id: generateId(),
      chainId,
      title: step.title,
      notes: step.notes ?? null,
      defaultSession: step.defaultSession ?? null,
      leadOffsetSessions: step.leadOffsetSessions ?? null,
      stepType: step.stepType ?? 'setup',
      orderIndex: i,
      isOptional: step.isOptional ?? false,
      createdAt: now,
      updatedAt: now,
    });
  }

  await logEvent({
    eventType: EventType.MOMENTUM_CHAIN_CREATED,
    entityType: EntityType.MOMENTUM_CHAIN,
    entityId: chainId,
    userId,
    payloadJson: { domain: data.domain, stepCount: steps.length, createdBy },
  });

  return chainId;
}

export async function updateChain(id: string, data: Partial<MomentumChainFormData>) {
  await db
    .update(momentumChains)
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    })
    .where(eq(momentumChains.id, id));

  const chain = await getChainById(id);
  await logEvent({
    eventType: EventType.MOMENTUM_CHAIN_UPDATED,
    entityType: EntityType.MOMENTUM_CHAIN,
    entityId: id,
    userId: chain?.userId ?? undefined,
  });
}

export async function toggleChainActive(id: string, isActive: boolean) {
  await db
    .update(momentumChains)
    .set({
      isActive,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    })
    .where(eq(momentumChains.id, id));
}

export async function softDeleteChain(id: string) {
  await db
    .update(momentumChains)
    .set({
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    })
    .where(eq(momentumChains.id, id));
}
