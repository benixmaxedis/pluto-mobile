import { useState } from 'react';
import { View, Text, Switch, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function SettingsScreen() {
  const { signOut } = useAuth();

  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Settings</Text>

        {/* ── Preferences ─────────────────────────────── */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <SettingRow
            label="Haptics"
            description="Vibration feedback on interactions"
            value={hapticsEnabled}
            onValueChange={setHapticsEnabled}
          />
          <View style={styles.separator} />
          <SettingRow
            label="Reduced Motion"
            description="Minimize animations throughout the app"
            value={reducedMotion}
            onValueChange={setReducedMotion}
          />
          <View style={styles.separator} />
          <SettingRow
            label="Notifications"
            description="Session reminders and nudges"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>

        {/* ── Account ─────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>

        {/* ── About ───────────────────────────────────── */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>App Version</Text>
            <Text style={styles.value}>{appVersion}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Toggle row component ─────────────────────────────────

interface SettingRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}

function SettingRow({ label, description, value, onValueChange }: SettingRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowTextContainer}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.actions.primary }}
        thumbColor={colors.text.primary}
      />
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  heading: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  rowTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.text.primary,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  value: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonPressed: {
    opacity: 0.6,
  },
  signOutText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.error,
  },
});
