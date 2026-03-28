import { View, Text } from 'react-native';
import { Card } from '@/components/ui';
import { colors, spacing, typographyStyles } from '@/lib/theme';

interface SessionHistoryRowProps {
  title: string;
  entityLabel: 'Action' | 'Routine';
  outcome: 'completed' | 'skipped';
}

export function SessionHistoryRow({ title, entityLabel, outcome }: SessionHistoryRowProps) {
  const completed = outcome === 'completed';
  const outcomeLabel = completed ? 'Completed' : 'Missed';

  return (
    <Card
      style={{
        paddingVertical: spacing.xs + spacing.hairline,
        paddingHorizontal: spacing.sm,
      }}
    >
      <View style={{ gap: spacing.xs }}>
        <Text style={[typographyStyles.body, { color: colors.text.primary }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[typographyStyles.caption, { color: colors.text.secondary }]}>
          {entityLabel} · {outcomeLabel}
        </Text>
      </View>
    </Card>
  );
}
