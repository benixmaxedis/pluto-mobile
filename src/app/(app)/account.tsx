import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { useAuthStore } from '@/store/auth-store';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function AccountScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const userId = useAuthStore((s) => s.userId);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Account</Text>

        {/* ── User info ───────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {userId ? userId.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {userId ?? 'Not signed in'}
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>local@pluto.app</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Display Name</Text>
            <Text style={styles.infoValue}>Pluto User</Text>
          </View>
        </View>

        {/* ── Navigation ──────────────────────────────── */}
        <Text style={styles.sectionTitle}>Manage</Text>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.linkRow, pressed && styles.linkPressed]}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.linkText}>Settings</Text>
            <Text style={styles.chevron}>{'>'}</Text>
          </Pressable>
        </View>

        {/* ── Sign out ────────────────────────────────── */}
        <View style={[styles.card, { marginTop: spacing.xl }]}>
          <Pressable
            style={({ pressed }) => [styles.signOutButton, pressed && styles.linkPressed]}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.actions.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
  },
  infoLabel: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: fontSize.base,
    color: colors.text.primary,
    flexShrink: 1,
    textAlign: 'right',
    maxWidth: '60%',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  linkPressed: {
    opacity: 0.6,
  },
  linkText: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.text.primary,
  },
  chevron: {
    fontSize: fontSize.base,
    color: colors.text.muted,
  },
  signOutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  signOutText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.error,
  },
});
