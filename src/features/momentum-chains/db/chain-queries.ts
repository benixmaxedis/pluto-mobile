import { getSupabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/auth';
import { camelRows, camelRow, snakeKeys } from '@/lib/supabase/rows';
import { generateId } from '@/lib/utils/id';
import { logEvent } from '@/features/activity/db/activity-queries';
import { EventType, EntityType } from '@/lib/constants';
import type { MomentumChainFormData, MomentumChainStepFormData } from '@/lib/validation';

async function uid(): Promise<string> {
  return getCurrentUserId();
}

export async function getAllChains() {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('momentum_chains')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function getActiveChains() {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('momentum_chains')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .eq('is_active', true);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function getChainById(id: string) {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('momentum_chains')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? camelRow(data as Record<string, unknown>) : null;
}

export async function getChainsByDomain(domain: string) {
  const userId = await uid();
  const { data, error } = await getSupabase()
    .from('momentum_chains')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .eq('domain', domain);
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function getChainSteps(chainId: string) {
  const { data, error } = await getSupabase()
    .from('momentum_chain_steps')
    .select('*')
    .eq('chain_id', chainId)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return camelRows((data ?? []) as Record<string, unknown>[]);
}

export async function createChain(
  data: MomentumChainFormData,
  steps: MomentumChainStepFormData[],
  userIdParam?: string,
  createdBy: 'user' | 'system' | 'pluto' = 'user',
) {
  const userId = userIdParam ?? (await uid());
  const chainId = generateId();
  const now = new Date().toISOString();

  const chainRow = snakeKeys({
    id: chainId,
    userId,
    name: data.name,
    domain: data.domain,
    description: data.description ?? null,
    isActive: data.isActive ?? true,
    createdBy,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'synced',
    syncVersion: 0,
  });

  const { error: ce } = await getSupabase().from('momentum_chains').insert(chainRow);
  if (ce) throw ce;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    const stepRow = snakeKeys({
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
    const { error: se } = await getSupabase().from('momentum_chain_steps').insert(stepRow);
    if (se) throw se;
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
  const patch = snakeKeys({
    ...data,
    updatedAt: new Date().toISOString(),
    syncStatus: 'synced',
  } as Record<string, unknown>);
  const { error } = await getSupabase().from('momentum_chains').update(patch).eq('id', id);
  if (error) throw error;

  const chain = await getChainById(id);
  await logEvent({
    eventType: EventType.MOMENTUM_CHAIN_UPDATED,
    entityType: EntityType.MOMENTUM_CHAIN,
    entityId: id,
    userId: chain?.userId as string | undefined,
  });
}

export async function toggleChainActive(id: string, isActive: boolean) {
  const { error } = await getSupabase()
    .from('momentum_chains')
    .update(
      snakeKeys({
        isActive,
        updatedAt: new Date().toISOString(),
        syncStatus: 'synced',
      }),
    )
    .eq('id', id);
  if (error) throw error;
}

export async function softDeleteChain(id: string) {
  const now = new Date().toISOString();
  const { error } = await getSupabase()
    .from('momentum_chains')
    .update(
      snakeKeys({
        deletedAt: now,
        updatedAt: now,
        syncStatus: 'synced',
      }),
    )
    .eq('id', id);
  if (error) throw error;
}
