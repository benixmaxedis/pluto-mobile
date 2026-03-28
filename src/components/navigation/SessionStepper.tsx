import { Fragment } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Session } from '@/lib/constants';
import { SESSION_ORDER, getSessionLabel } from '@/lib/constants/sessions';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';

type Props = {
  value: Session;
  onChange: (session: Session) => void;
};

export function SessionStepper({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {SESSION_ORDER.map((session, index) => {
        const selected = value === session;
        return (
          <Fragment key={session}>
            {index > 0 ? <View style={styles.connector} /> : null}
            <Pressable
              onPress={() => onChange(session)}
              style={({ pressed }) => [
                styles.step,
                { opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <View style={styles.iconSlot}>
                {selected ? (
                  <Ionicons name="calendar-outline" size={16} color={colors.actions.primary} />
                ) : null}
              </View>
              <Text
                style={[
                  styles.label,
                  selected ? styles.labelSelected : styles.labelIdle,
                ]}
                numberOfLines={1}
              >
                {getSessionLabel(session)}
              </Text>
              <View style={[styles.underline, selected && styles.underlineSelected]} />
            </Pressable>
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    paddingVertical: spacing.xs,
  },
  connector: {
    flex: 1,
    alignSelf: 'center',
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 4,
    borderRadius: borderRadius.full,
    minWidth: 8,
    maxHeight: 2,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  iconSlot: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: fontSize.base,
    marginTop: 2,
    textAlign: 'center',
  },
  labelSelected: {
    fontWeight: '700',
    color: colors.text.primary,
  },
  labelIdle: {
    fontWeight: '500',
    color: colors.text.secondary,
  },
  underline: {
    marginTop: spacing.xs,
    height: 3,
    width: '70%',
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  underlineSelected: {
    backgroundColor: colors.actions.primary,
  },
});
