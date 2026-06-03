import React, { useState } from 'react';
import {
  View, TextInput, FlatList, Text, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useSearch } from '@/hooks/useTranslations';
import { useSubscription } from '@/hooks/useSubscription';
import { LanguagePicker } from '@/components/LanguagePicker';
import { PhraseCard } from '@/components/PhraseCard';
import { PaywallModal } from '@/components/PaywallModal';
import { Colors } from '@/constants/Colors';
import { PlanKey } from '@/lib/stripe';

export default function SearchScreen() {
  const [language, setLanguage] = useState('af');
  const [query, setQuery] = useState('');
  const [paywallVisible, setPaywallVisible] = useState(false);

  const { results, loading } = useSearch(language, query);
  const { isActive } = useSubscription();

  return (
    <View style={styles.container}>
      <LanguagePicker selected={language} onChange={setLanguage} />

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search English or translation…"
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />}

      {!loading && query.trim() !== '' && results.length === 0 && (
        <Text style={styles.empty}>No results for "{query}"</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
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
        keyboardShouldPersistTaps="handled"
      />

      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onSelectPlan={(_plan: PlanKey) => setPaywallVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: { paddingHorizontal: 16, paddingBottom: 8 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 24, fontSize: 15 },
  list: { paddingBottom: 32 },
});
