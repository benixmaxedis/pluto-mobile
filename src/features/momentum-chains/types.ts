import type { InferSelectModel } from 'drizzle-orm';
import type { momentumChains, momentumChainSteps } from '@/lib/db/schema';

export type MomentumChain = InferSelectModel<typeof momentumChains>;
export type MomentumChainStep = InferSelectModel<typeof momentumChainSteps>;

export interface ChainWithSteps extends MomentumChain {
  steps: MomentumChainStep[];
}
