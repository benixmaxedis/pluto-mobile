import { createChain, getActiveChains } from './chain-queries';
import type { MomentumChainFormData, MomentumChainStepFormData } from '@/lib/validation';

/**
 * Seeds 3 starter Momentum Chains if none exist yet.
 * Called during onboarding or first app launch.
 */
export async function seedStarterChains(userId?: string): Promise<void> {
  const existing = await getActiveChains();
  if (existing.length > 0) {
    return; // Already seeded — skip
  }

  // ── Exercise chain ──────────────────────────────────────
  const exerciseChain: MomentumChainFormData = {
    name: 'Exercise',
    domain: 'exercise',
    description: 'Reduce friction for getting to the gym by preparing the night before.',
    isActive: true,
  };

  const exerciseSteps: MomentumChainStepFormData[] = [
    {
      title: 'Pack gym bag',
      notes: 'Prepare clothes, shoes, water bottle, and towel.',
      defaultSession: 'afternoon',
      stepType: 'setup',
      isOptional: false,
    },
    {
      title: 'Put bag by door',
      notes: 'Place your packed bag where you will see it on your way out.',
      defaultSession: 'evening',
      stepType: 'setup',
      isOptional: false,
    },
    {
      title: 'Go to gym',
      notes: 'Grab your bag and go — everything is ready.',
      defaultSession: 'morning',
      stepType: 'execution',
      isOptional: false,
    },
  ];

  // ── Nutrition chain ─────────────────────────────────────
  const nutritionChain: MomentumChainFormData = {
    name: 'Healthy Meal',
    domain: 'nutrition',
    description: 'Chain of small steps so a healthy meal happens without decision fatigue.',
    isActive: true,
  };

  const nutritionSteps: MomentumChainStepFormData[] = [
    {
      title: 'Decide meal',
      notes: 'Pick a simple recipe or meal idea during a low-stakes moment.',
      defaultSession: 'morning',
      stepType: 'setup',
      isOptional: false,
    },
    {
      title: 'Buy ingredients',
      notes: 'Pick up what you need on the way home or order for delivery.',
      defaultSession: 'afternoon',
      stepType: 'setup',
      isOptional: false,
    },
    {
      title: 'Prep food',
      notes: 'Wash, chop, and measure so cooking is effortless.',
      defaultSession: 'afternoon',
      stepType: 'setup',
      isOptional: false,
    },
    {
      title: 'Eat meal',
      notes: 'Enjoy the meal you prepared.',
      defaultSession: 'evening',
      stepType: 'execution',
      isOptional: false,
    },
  ];

  // ── Sleep chain ─────────────────────────────────────────
  const sleepChain: MomentumChainFormData = {
    name: 'Wind-Down for Sleep',
    domain: 'sleep',
    description: 'Gradual wind-down sequence to improve sleep quality.',
    isActive: true,
  };

  const sleepSteps: MomentumChainStepFormData[] = [
    {
      title: 'Start wind-down',
      notes: 'Dim lights, stop stimulating content, switch to calm activities.',
      defaultSession: 'evening',
      stepType: 'wind_down',
      isOptional: false,
    },
    {
      title: 'Put phone away',
      notes: 'Charge your phone outside the bedroom or turn on Do Not Disturb.',
      defaultSession: 'evening',
      stepType: 'wind_down',
      isOptional: false,
    },
    {
      title: 'Lights out',
      notes: 'Get into bed and turn off the lights.',
      defaultSession: 'evening',
      stepType: 'execution',
      isOptional: false,
    },
  ];

  await createChain(exerciseChain, exerciseSteps, userId, 'system');
  await createChain(nutritionChain, nutritionSteps, userId, 'system');
  await createChain(sleepChain, sleepSteps, userId, 'system');
}
