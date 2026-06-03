import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { PaywallModal } from '@/components/PaywallModal';
import { Colors } from '@/constants/Colors';
import { PLAN_LABELS, PlanKey } from '@/lib/stripe';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { subscription, isActive } = useSubscription();
  const [paywallVisible, setPaywallVisible] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  const planLabel = subscription
    ? PLAN_LABELS[subscription.plan as PlanKey]?.title ?? subscription.plan
    : 'Free';

  const periodEnd = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString()
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.email}>{user?.email}</Text>

        {/* Subscription card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Subscription</Text>
          <Row label="Plan" value={planLabel} />
          <Row label="Status" value={isActive ? '✅ Active' : '—'} />
          {periodEnd && <Row label="Renews / Expires" value={periodEnd} />}

          {!isActive && (
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => setPaywallVisible(true)}
            >
              <Text style={styles.upgradeBtnText}>Unlock All Phrases →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onSelectPlan={(_plan: PlanKey) => {
          setPaywallVisible(false);
          alert('Stripe payment sheet coming soon.');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, alignItems: 'center' },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  email: { fontSize: 16, color: Colors.textMid, marginBottom: 28 },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginBottom: 14, letterSpacing: 0.5, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { fontSize: 14, color: Colors.textMid },
  rowValue: { fontSize: 14, fontWeight: '600', color: Colors.text },
  upgradeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  upgradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  signOutBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: { color: Colors.danger, fontWeight: '600', fontSize: 15 },
});
