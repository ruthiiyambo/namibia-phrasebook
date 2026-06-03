import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { PLAN_LABELS, PlanKey } from '@/lib/stripe';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectPlan: (plan: PlanKey) => void;
};

export function PaywallModal({ visible, onClose, onSelectPlan }: Props) {
  const plans: PlanKey[] = ['trip_pass', 'yearly', 'lifetime'];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.flag}>🇳🇦</Text>
            <Text style={styles.title}>Unlock All Phrases</Text>
            <Text style={styles.subtitle}>
              Get full access to 600+ phrases across 3 languages — with pronunciation
              guides and offline support.
            </Text>
          </View>

          {/* Feature list */}
          {[
            '✅  All phrase categories (shopping, wildlife, health…)',
            '✅  Pronunciation guides for every phrase',
            '✅  Works offline once downloaded',
            '✅  Nama/Damara click-consonant audio (coming soon)',
          ].map((f) => (
            <Text key={f} style={styles.feature}>{f}</Text>
          ))}

          {/* Plan options */}
          <View style={styles.plans}>
            {plans.map((plan) => {
              const p = PLAN_LABELS[plan];
              const isHero = plan === 'trip_pass';
              return (
                <TouchableOpacity
                  key={plan}
                  style={[styles.plan, isHero && styles.planHero]}
                  onPress={() => onSelectPlan(plan)}
                >
                  {isHero && (
                    <View style={styles.heroTag}>
                      <Text style={styles.heroTagText}>MOST POPULAR</Text>
                    </View>
                  )}
                  <Text style={[styles.planTitle, isHero && styles.planTitleHero]}>
                    {p.title}
                  </Text>
                  <Text style={[styles.planPrice, isHero && styles.planPriceHero]}>
                    {p.price}
                  </Text>
                  <Text style={styles.planDesc}>{p.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={onClose} style={styles.skip}>
            <Text style={styles.skipText}>Maybe later</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            Payment is charged to your account at confirmation. Trip Pass is a
            one-time, non-renewing purchase. Subscriptions renew automatically;
            cancel any time in your account settings.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, gap: 16 },
  header: { alignItems: 'center', marginBottom: 8 },
  flag: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: Colors.textMid, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  feature: { fontSize: 14, color: Colors.textMid, marginVertical: 2 },
  plans: { gap: 12, marginTop: 8 },
  plan: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  planHero: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  heroTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 8,
  },
  heroTagText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  planTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  planTitleHero: { color: Colors.primary },
  planPrice: { fontSize: 22, fontWeight: '800', color: Colors.accent, marginVertical: 4 },
  planPriceHero: { color: Colors.primaryMid },
  planDesc: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  skip: { alignItems: 'center', paddingVertical: 8 },
  skipText: { color: Colors.textMuted, fontSize: 14 },
  legal: { fontSize: 11, color: Colors.textMuted, lineHeight: 16, textAlign: 'center' },
});
