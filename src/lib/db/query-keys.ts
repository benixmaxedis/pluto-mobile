export const queryKeys = {
  actions: {
    all: ['actions'] as const,
    byId: (id: string) => ['actions', id] as const,
    byDate: (date: string) => ['actions', 'date', date] as const,
    byTab: (tab: string) => ['actions', 'tab', tab] as const,
  },
  routineTemplates: {
    all: ['routine-templates'] as const,
    byId: (id: string) => ['routine-templates', id] as const,
    byCategory: (category: string) => ['routine-templates', 'category', category] as const,
  },
  routineInstances: {
    all: ['routine-instances'] as const,
    byDate: (date: string) => ['routine-instances', 'date', date] as const,
    byId: (id: string) => ['routine-instances', id] as const,
  },
  openLoops: {
    all: ['open-loops'] as const,
    byId: (id: string) => ['open-loops', id] as const,
    byCategory: (category: string) => ['open-loops', 'category', category] as const,
  },
  guideItems: {
    all: ['guide-items'] as const,
    byId: (id: string) => ['guide-items', id] as const,
    byCategory: (category: string) => ['guide-items', 'category', category] as const,
  },
  strategies: {
    all: ['strategies'] as const,
    byId: (id: string) => ['strategies', id] as const,
    byCategory: (category: string) => ['strategies', 'category', category] as const,
  },
  journal: {
    all: ['journal'] as const,
    byDate: (date: string) => ['journal', 'date', date] as const,
    byDateAndType: (date: string, type: string) => ['journal', date, type] as const,
  },
  activityEvents: {
    all: ['activity-events'] as const,
    byDate: (date: string) => ['activity-events', 'date', date] as const,
  },
  queue: {
    forSession: (date: string, session: string) => ['queue', date, session] as const,
  },
  momentumChains: {
    all: ['momentum-chains'] as const,
    byId: (id: string) => ['momentum-chains', id] as const,
    byDomain: (domain: string) => ['momentum-chains', 'domain', domain] as const,
  },
  chat: {
    all: ['chat-messages'] as const,
  },
} as const;
