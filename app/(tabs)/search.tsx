import React, { useEffect, useState } from 'react';
import {
  View, TextInput, FlatList, Text, StyleSheet, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { ActionChip } from '@/components/ActionChip';
import { useLanguages } from '@/hooks/useLanguages';
import { useSearch } from '@/hooks/useTranslations';
import { LanguagePicker } from '@/components/LanguagePicker';
import { PhraseCard } from '@/components/PhraseCard';
import { Colors } from '@/constants/Colors';

const QUICK_SEARCHES = [
  'thank you',
  'hello',
  'where is',
  'how much',
  'water',
  'help',
];

export default function SearchScreen() {
  const [language, setLanguage] = useState('af');
  const [query, setQuery] = useState('');
  const {
    languages,
    loading: languagesLoading,
    error: languagesError,
  } = useLanguages();
  const activeLanguage = languages.some((item) => item.code === language)
    ? language
    : languages[0]?.code ?? language;

  const { results, loading, error } = useSearch(activeLanguage, query);
  const combinedError = languagesError ?? error;
  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;
  const suggestionTerms = QUICK_SEARCHES.filter((term) => term !== trimmedQuery).slice(0, 4);

  useEffect(() => {
    if (activeLanguage !== language) {
      setLanguage(activeLanguage);
    }
  }, [activeLanguage, language]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Quick Find</Text>
        <Text style={styles.subtitle}>
          Search by meaning, local phrase, pronunciation, or category.
        </Text>
      </View>

      <LanguagePicker
        error={languagesError}
        languages={languages}
        loading={languagesLoading}
        selected={activeLanguage}
        onChange={setLanguage}
      />

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Try “thank you”, “water”, or “where is”"
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {!loading && !hasQuery ? (
        <View>
          <Text style={styles.helper}>
            Search across English, local phrases, pronunciation, notes, and category names. Tap a result to save it, favorite it, or report a correction.
          </Text>
          <View style={styles.quickWrap}>
            {QUICK_SEARCHES.map((term) => (
              <ActionChip
                key={term}
                label={term}
                onPress={() => setQuery(term)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />}
      {!loading && combinedError ? <Text style={styles.error}>{combinedError}</Text> : null}

      {!loading && hasQuery && results.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No results for "{trimmedQuery}"</Text>
          <Text style={styles.emptyCopy}>
            Try a shorter phrase, search in English, or use a broader topic such as greetings, food, or transport.
          </Text>
          <View style={styles.quickWrap}>
            {suggestionTerms.map((term) => (
              <ActionChip
                key={term}
                label={term}
                onPress={() => setQuery(term)}
              />
            ))}
          </View>
        </View>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PhraseCard item={item} />}
        ListHeaderComponent={hasQuery && results.length > 0 ? (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsLabel}>
              {results.length} result{results.length === 1 ? '' : 's'}
            </Text>
            <Text style={styles.resultsCopy}>
              Best matches for "{trimmedQuery}" in {languages.find((item) => item.code === activeLanguage)?.name ?? 'this language'}.
            </Text>
          </View>
        ) : null}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: Colors.textMid,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
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
  helper: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginHorizontal: 16,
    marginTop: 6,
  },
  quickWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 14,
  },
  resultsHeader: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
  },
  resultsLabel: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  resultsCopy: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  error: { textAlign: 'center', color: Colors.danger, marginTop: 24, marginHorizontal: 16 },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 18,
    padding: 16,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyCopy: {
    color: Colors.textMid,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  list: { paddingBottom: 32, paddingTop: 10 },
});
