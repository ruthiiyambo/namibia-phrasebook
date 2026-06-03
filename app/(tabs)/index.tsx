import React, { useState } from 'react';
import {
  View, FlatList, Text, StyleSheet, SectionList, ActivityIndicator,
} from 'react-native';
import { useTranslations } from '@/hooks/useTranslations';
import { useSubscription } from '@/hooks/useSubscription';
import { LanguagePicker } from '@/components/LanguagePicker';
import { PhraseCard } from '@/components/PhraseCard';
import { PaywallModal } from '@/components/PaywallModal';
import { Colors } from '@/constants/Colors';
import { Translation } from '@/lib/supabase';
import { PlanKey } from '@/lib/stripe';

// Group flat list of translations by category
function groupByCategory(items: Translation[]) {
  const map = new Map<string, Translation[]>();
  for (const item of items) {
    if (!map.has(item.category)) map.set(item.category, []);
    map.get(item.category)!.push(item);
  }
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
}

export default function BrowseScreen() {
  const [language, setLanguage] = useState('af');   // default: Afrikaans
  const [paywallVisible, setPaywallVisible] = useState(false);

  const { translations, loading, error } = useTranslations(language);
  const { isActive } = useSubscription();

  const sections = groupByCategory(translations);

  const handleSelectPlan = (_plan: PlanKey) => {
    // TODO: initiate Stripe payment sheet once backend is wired
    setPaywallVisible(false);
    alert('Stripe payment sheet coming soon — backend webhook needed first.');
  };

  return (
    <View style={styles.container}>
      <LanguagePicker selected={language} onChange={setLanguage} />

      {loading && <ActivityIndicator style={styles.spinner} color={Colors.primary} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {!loading && !error && (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const locked = item.tier === 'paid' && !isActive;
            return (
              <PhraseCard
                item={item}
                locked={locked}
                onPress={locked ? () => setPaywallVisible(true) : undefined}
              />
            );
          }}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
        />
      )}

      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onSelectPlan={handleSelectPlan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  spinner: { marginTop: 40 },
  error: { color: Colors.danger, textAlign: 'center', margin: 16 },
  list: { paddingBottom: 32 },
  sectionHeader: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
