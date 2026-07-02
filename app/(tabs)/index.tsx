import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { ActionChip } from '@/components/ActionChip';
import { CategoryCard } from '@/components/CategoryCard';
import { LanguagePicker } from '@/components/LanguagePicker';
import { PhraseCard } from '@/components/PhraseCard';
import { Colors } from '@/constants/Colors';
import { usePhrasebookState } from '@/hooks/usePhrasebookState';
import { useLanguages } from '@/hooks/useLanguages';
import { useTranslations } from '@/hooks/useTranslations';
import { demoCategories } from '@/lib/demo-data';
import { buildCategorySummaries } from '@/lib/phrasebook';
import { Translation } from '@/lib/phrasebook-types';
import {
  getQuickPracticeSessionKey,
  getTodayTripKit,
  getTripKitPhrases,
  tripKits,
} from '@/lib/trip-kits';

const CATEGORY_EMOJI: Record<string, string> = {
  Greetings: '👋',
  Emergency: '🚨',
  Directions: '🧭',
  'Food & Drink': '🍽️',
  Shopping: '🛍️',
  Transport: '🚕',
  Accommodation: '🛏️',
  Wildlife: '🦁',
  Numbers: '🔢',
  Health: '🩺',
  Culture: '🌍',
  Time: '⏰',
  Colors: '🎨',
};

const JOURNEYS = [
  {
    title: 'Start polite',
    category: 'Greetings',
    emoji: '🤝',
    copy: 'Hello, thanks, please, and the phrases you reach for first.',
  },
  {
    title: 'Stay safe',
    category: 'Emergency',
    emoji: '🆘',
    copy: 'Help, hospital, police, and urgent communication.',
  },
  {
    title: 'Move around',
    category: 'Directions',
    emoji: '🗺️',
    copy: 'Ask where things are, understand turns, and get unstuck.',
  },
];

const QUICK_CATEGORY_SET = [
  'Greetings',
  'Emergency',
  'Directions',
  'Food & Drink',
  'Transport',
  'Shopping',
];

type PersonalCollectionId = 'saved' | 'favorites' | 'recent';

function takeTranslationsByIds(phraseIds: string[], phraseLookup: Map<string, Translation>, limit = 6) {
  return phraseIds
    .map((phraseId) => phraseLookup.get(phraseId) ?? null)
    .filter((item): item is Translation => item !== null)
    .slice(0, limit);
}

export default function BrowseScreen() {
  const { width } = useWindowDimensions();
  const [language, setLanguage] = useState('af');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTripKitId, setSelectedTripKitId] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<PersonalCollectionId>('saved');
  const {
    addRecent,
    favorites,
    hydrated,
    quickPractice,
    recent,
    resetQuickPractice,
    savePhrasesForTrip,
    savedForTrip,
    savedForTripSet,
    toggleQuickPracticePhrase,
  } = usePhrasebookState();
  const {
    languages,
    loading: languagesLoading,
    error: languagesError,
  } = useLanguages();
  const activeLanguage = languages.some((item) => item.code === language)
    ? language
    : languages[0]?.code ?? language;

  const { translations, loading, error } = useTranslations(activeLanguage);
  const phraseLookup = useMemo(
    () => new Map(translations.map((item) => [item.id, item])),
    [translations],
  );

  const categories = useMemo(
    () => buildCategorySummaries(translations, demoCategories).map((category) => ({
      ...category,
      emoji: CATEGORY_EMOJI[category.name] ?? '📚',
    })),
    [translations],
  );

  const selectedCategoryMeta = categories.find((category) => category.name === selectedCategory) ?? null;
  const selectedPhrases = selectedCategory
    ? translations.filter((item) => item.category === selectedCategory)
    : [];
  const essentials = translations
    .filter((item) => (
      item.difficulty === 'basic'
      && QUICK_CATEGORY_SET.includes(item.category)
    ))
    .slice(0, 10);
  const todaysTripKit = useMemo(
    () => getTodayTripKit(activeLanguage),
    [activeLanguage],
  );
  const todayPracticePhrases = useMemo(
    () => getTripKitPhrases(translations, todaysTripKit, 5),
    [todaysTripKit, translations],
  );
  const todaySessionKey = useMemo(
    () => getQuickPracticeSessionKey(activeLanguage, todaysTripKit.id),
    [activeLanguage, todaysTripKit.id],
  );
  const completedTodaySet = useMemo(
    () => new Set(quickPractice[todaySessionKey] ?? []),
    [quickPractice, todaySessionKey],
  );
  const selectedTripKit = tripKits.find((tripKit) => tripKit.id === selectedTripKitId) ?? null;
  const selectedTripKitPhrases = useMemo(
    () => (selectedTripKit ? getTripKitPhrases(translations, selectedTripKit, 8) : []),
    [selectedTripKit, translations],
  );
  const favoriteMatches = useMemo(
    () => takeTranslationsByIds(favorites, phraseLookup, favorites.length),
    [favorites, phraseLookup],
  );
  const recentMatches = useMemo(
    () => takeTranslationsByIds(recent, phraseLookup, recent.length),
    [phraseLookup, recent],
  );
  const savedTripMatches = useMemo(
    () => takeTranslationsByIds(savedForTrip, phraseLookup, savedForTrip.length),
    [phraseLookup, savedForTrip],
  );
  const favoritePhrases = favoriteMatches.slice(0, 6);
  const recentPhrases = recentMatches.slice(0, 6);
  const savedTripPhrases = savedTripMatches.slice(0, 6);
  const combinedError = languagesError ?? error;
  const totalCategories = categories.length;
  const compactLayout = width < 390;
  const completedTodayCount = todayPracticePhrases.filter((item) => completedTodaySet.has(item.id)).length;
  const todayProgress = todayPracticePhrases.length > 0
    ? Math.round((completedTodayCount / todayPracticePhrases.length) * 100)
    : 0;
  const selectedTripKitSavedCount = selectedTripKitPhrases.filter((item) => savedForTripSet.has(item.id)).length;
  const collectionConfig = {
    saved: {
      title: 'Saved for this trip',
      emptyTitle: 'Start a travel shortlist',
      emptyCopy: 'Save a phrase or save a full trip kit to keep the phrases you expect to use most.',
      phrases: savedTripPhrases,
      count: savedTripMatches.length,
    },
    favorites: {
      title: 'Favorites',
      emptyTitle: 'Favorite the phrases you love',
      emptyCopy: 'Tap into any phrase card and mark favorites to keep your best go-to lines close.',
      phrases: favoritePhrases,
      count: favoriteMatches.length,
    },
    recent: {
      title: 'Recent phrases',
      emptyTitle: 'Your recent phrases will appear here',
      emptyCopy: 'Open a few phrase cards and the app will keep a short recent history for quick return visits.',
      phrases: recentPhrases,
      count: recentMatches.length,
    },
  } satisfies Record<PersonalCollectionId, {
    title: string;
    emptyTitle: string;
    emptyCopy: string;
    phrases: Translation[];
    count: number;
  }>;
  const activeCollection = collectionConfig[selectedCollection];

  useEffect(() => {
    if (activeLanguage !== language) {
      setLanguage(activeLanguage);
    }
  }, [activeLanguage, language]);

  useEffect(() => {
    if (selectedCategory && !categories.some((category) => category.name === selectedCategory)) {
      setSelectedCategory(null);
    }
  }, [categories, selectedCategory]);

  useEffect(() => {
    if (selectedTripKit && selectedTripKitPhrases.length === 0) {
      setSelectedTripKitId(null);
    }
  }, [selectedTripKit, selectedTripKitPhrases.length]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Namibia Phrasebook</Text>
        <Text style={styles.title}>Find the right phrase quickly.</Text>
        <Text style={styles.subtitle}>
          Pick a language, open a situation, and jump straight to the phrases
          you need for greetings, food, directions, transport, health, and more.
        </Text>
      </View>

      <LanguagePicker
        error={languagesError}
        languages={languages}
        loading={languagesLoading}
        selected={activeLanguage}
        onChange={(code) => {
          setLanguage(code);
          setSelectedCategory(null);
        }}
      />

      {combinedError ? <Text style={styles.error}>{combinedError}</Text> : null}
      {!loading && !combinedError && translations.length === 0 ? (
        <Text style={styles.empty}>No phrases are available for this language yet.</Text>
      ) : null}

      {!loading && !combinedError && translations.length > 0 ? (
        <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Ready when you need it</Text>
              <Text style={styles.summaryCopy}>Bundled workbook phrases, practical travel kits, and saved lines that stay with you offline.</Text>
            </View>
            <View style={[styles.summaryRow, compactLayout && styles.summaryRowCompact]}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryNumber}>{translations.length}</Text>
                <Text style={styles.summaryLabel}>Phrases</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryNumber}>{totalCategories}</Text>
                <Text style={styles.summaryLabel}>Categories</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryNumber}>{savedTripMatches.length}</Text>
                <Text style={styles.summaryLabel}>Saved for trip</Text>
              </View>
            </View>
            <Text style={styles.summaryFootnote}>
              {favoriteMatches.length} favorites • {recentMatches.length} recent phrases
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.practiceCard}>
              <View style={styles.practiceHeader}>
                <View style={styles.practiceHeaderText}>
                  <Text style={styles.practiceEyebrow}>Today</Text>
                  <Text style={styles.practiceTitle}>{todaysTripKit.emoji} Quick Practice: {todaysTripKit.title}</Text>
                  <Text style={styles.practiceCopy}>
                    {todaysTripKit.description} Work through these five phrases and finish the set.
                  </Text>
                </View>
                <View style={styles.practiceCountBadge}>
                  <Text style={styles.practiceCountText}>{completedTodayCount}/{todayPracticePhrases.length || 5}</Text>
                </View>
              </View>

              <View style={styles.practiceTrack}>
                <View style={[styles.practiceTrackFill, { width: `${todayProgress}%` }]} />
              </View>

              {todayPracticePhrases.map((item, index) => {
                const completed = completedTodaySet.has(item.id);

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.88}
                    onPress={() => {
                      addRecent(item.id);
                      toggleQuickPracticePhrase(todaySessionKey, item.id);
                    }}
                    style={[styles.practiceRow, completed && styles.practiceRowDone]}
                  >
                    <View style={styles.practiceRowText}>
                      <Text style={[styles.practiceRowStep, completed && styles.practiceRowStepDone]}>
                        Phrase {index + 1}
                      </Text>
                      <Text style={[styles.practiceRowEnglish, completed && styles.practiceRowEnglishDone]}>
                        {item.english_text}
                      </Text>
                      <Text style={[styles.practiceRowTranslation, completed && styles.practiceRowTranslationDone]}>
                        {item.translated_text}
                      </Text>
                    </View>
                    <View style={[styles.practiceTick, completed && styles.practiceTickDone]}>
                      <Text style={[styles.practiceTickText, completed && styles.practiceTickTextDone]}>
                        {completed ? 'Done' : 'Tap'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {todayPracticePhrases.length > 0 && completedTodayCount === todayPracticePhrases.length ? (
                <Text style={styles.practiceSuccess}>Finished for today. Nice work.</Text>
              ) : (
                <Text style={styles.practiceHint}>Tap each phrase after you practice it aloud.</Text>
              )}

              <View style={styles.practiceActions}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => {
                    setSelectedTripKitId(todaysTripKit.id);
                    setSelectedCategory(null);
                  }}
                  style={styles.practiceActionButton}
                >
                  <Text style={styles.practiceActionText}>Open today&apos;s kit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => savePhrasesForTrip(todayPracticePhrases.map((item) => item.id))}
                  style={styles.practiceActionButtonAlt}
                >
                  <Text style={styles.practiceActionTextAlt}>Save these phrases</Text>
                </TouchableOpacity>

                {completedTodayCount > 0 ? (
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => resetQuickPractice(todaySessionKey)}
                    style={styles.practiceActionButtonGhost}
                  >
                    <Text style={styles.practiceActionTextGhost}>Reset</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Phrase Pocket</Text>
            <Text style={styles.sectionCopy}>
              Keep the phrases you saved, favorited, or used recently in one easy place.
            </Text>

            <View style={styles.chipWrap}>
              {([
                ['saved', 'Saved'],
                ['favorites', 'Favorites'],
                ['recent', 'Recent'],
              ] as [PersonalCollectionId, string][]).map(([collectionId, label]) => (
                <ActionChip
                  key={collectionId}
                  active={selectedCollection === collectionId}
                  label={`${label} (${collectionConfig[collectionId].count})`}
                  onPress={() => setSelectedCollection(collectionId)}
                />
              ))}
            </View>

            {!hydrated ? (
              <View style={styles.emptyFeatureCard}>
                <Text style={styles.emptyFeatureTitle}>Loading your phrase pocket</Text>
                <Text style={styles.emptyFeatureCopy}>Saved, favorite, and recent phrases will appear here in a moment.</Text>
              </View>
            ) : activeCollection.phrases.length > 0 ? (
              activeCollection.phrases.map((item) => (
                <PhraseCard key={item.id} item={item} />
              ))
            ) : (
              <View style={styles.emptyFeatureCard}>
                <Text style={styles.emptyFeatureTitle}>{activeCollection.emptyTitle}</Text>
                <Text style={styles.emptyFeatureCopy}>{activeCollection.emptyCopy}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trip Kits</Text>
            <Text style={styles.sectionCopy}>
              Open ready-made packs for common travel moments like taxis, lodges, markets, and safari days.
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.kitRow}
            >
              {tripKits.map((tripKit) => {
                const tripKitPreviewCount = getTripKitPhrases(translations, tripKit, 8).length;

                return (
                  <TouchableOpacity
                    key={tripKit.id}
                    activeOpacity={0.9}
                    onPress={() => {
                      setSelectedTripKitId(tripKit.id);
                      setSelectedCategory(null);
                    }}
                    style={[
                      styles.kitCard,
                      selectedTripKitId === tripKit.id && styles.kitCardActive,
                    ]}
                  >
                    <Text style={styles.kitEmoji}>{tripKit.emoji}</Text>
                    <Text style={[
                      styles.kitTitle,
                      selectedTripKitId === tripKit.id && styles.kitTitleActive,
                    ]}
                    >
                      {tripKit.title}
                    </Text>
                    <Text style={[
                      styles.kitCopy,
                      selectedTripKitId === tripKit.id && styles.kitCopyActive,
                    ]}
                    >
                      {tripKit.description}
                    </Text>
                    <Text style={[
                      styles.kitCount,
                      selectedTripKitId === tripKit.id && styles.kitCountActive,
                    ]}
                    >
                      {tripKitPreviewCount} phrases ready
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {selectedTripKit ? (
            <View style={styles.section}>
              <View style={[styles.sectionHeader, compactLayout && styles.sectionHeaderCompact]}>
                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>{selectedTripKit.emoji} {selectedTripKit.title}</Text>
                  <Text style={styles.sectionCopyInline}>
                    {selectedTripKit.description} Showing {selectedTripKitPhrases.length} phrases from the current language.
                  </Text>
                </View>

                <View style={styles.actionColumn}>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => savePhrasesForTrip(selectedTripKitPhrases.map((item) => item.id))}
                    style={styles.clearBtn}
                  >
                    <Text style={styles.clearBtnText}>
                      {selectedTripKitSavedCount === selectedTripKitPhrases.length && selectedTripKitPhrases.length > 0
                        ? 'Kit saved'
                        : 'Save this kit'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => setSelectedTripKitId(null)}
                    style={styles.clearBtn}
                  >
                    <Text style={styles.clearBtnText}>Close kit</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {selectedTripKitPhrases.map((item) => (
                <PhraseCard key={item.id} item={item} />
              ))}
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Start With a Situation</Text>
            <Text style={styles.sectionCopy}>
              Choose the moment you are in and open the phrases inside it.
            </Text>

            <View style={styles.journeyList}>
              {JOURNEYS.map((journey) => (
                <TouchableOpacity
                  key={journey.category}
                  activeOpacity={0.9}
                  onPress={() => {
                    setSelectedCategory(journey.category);
                    setSelectedTripKitId(null);
                  }}
                  style={styles.journeyCard}
                >
                  <View style={styles.journeyTop}>
                    <Text style={styles.journeyEmoji}>{journey.emoji}</Text>
                    <Text style={styles.journeyCategory}>{journey.category}</Text>
                  </View>
                  <Text style={styles.journeyTitle}>{journey.title}</Text>
                  <Text style={styles.journeyCopy}>{journey.copy}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jump to a Category</Text>
            <Text style={styles.sectionCopy}>
              Browse all topics when you want a wider view of the phrasebook.
            </Text>
            <View style={styles.chipWrap}>
              {categories.map((category) => (
                <ActionChip
                  key={category.name}
                  active={selectedCategory === category.name}
                  label={category.name}
                  onPress={() => {
                    setSelectedCategory(category.name);
                    setSelectedTripKitId(null);
                  }}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={[styles.sectionHeader, compactLayout && styles.sectionHeaderCompact]}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Browse Deeply</Text>
                <Text style={styles.sectionCopyInline}>
                  Open a full category when you want more context before choosing a phrase.
                </Text>
              </View>
              {selectedCategory ? (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text style={styles.clearBtnText}>Show all</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardRow}
            >
              {categories.map((category) => (
                <CategoryCard
                  key={category.name}
                  active={selectedCategory === category.name}
                  count={category.count}
                  description={category.description}
                  emoji={category.emoji}
                  onPress={() => {
                    setSelectedCategory(category.name);
                    setSelectedTripKitId(null);
                  }}
                  title={category.name}
                />
              ))}
            </ScrollView>
          </View>

          {selectedCategoryMeta && !selectedTripKit ? (
            <View style={styles.section}>
              <View style={styles.focusHeader}>
                <Text style={styles.focusEmoji}>{selectedCategoryMeta.emoji}</Text>
                <View style={styles.focusText}>
                  <Text style={styles.focusTitle}>{selectedCategoryMeta.name}</Text>
                  <Text style={styles.focusCopy}>
                    {selectedCategoryMeta.count} phrases available. Showing the first {Math.min(selectedPhrases.length, 14)} below.
                  </Text>
                </View>
              </View>
              {selectedPhrases.slice(0, 14).map((item) => (
                <PhraseCard key={item.id} item={item} />
              ))}
            </View>
          ) : !selectedTripKit ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Everyday Essentials</Text>
              <Text style={styles.sectionCopy}>
                Start here for quick everyday phrases that are useful in many situations.
              </Text>
              {essentials.map((item) => (
                <PhraseCard key={item.id} item={item} />
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 44 },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  eyebrow: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.text,
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 35,
  },
  subtitle: {
    color: Colors.textMid,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },
  error: {
    color: Colors.danger,
    marginHorizontal: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  empty: {
    color: Colors.textMuted,
    fontSize: 15,
    marginTop: 24,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 18,
  },
  summaryHeader: {
    marginBottom: 14,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
  },
  summaryCopy: {
    color: '#D8F3DC',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryRowCompact: {
    flexDirection: 'column',
  },
  summaryStat: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 14,
    flex: 1,
    padding: 12,
  },
  summaryNumber: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '800',
  },
  summaryLabel: {
    color: '#D8F3DC',
    fontSize: 12,
    marginTop: 4,
  },
  summaryFootnote: {
    color: '#D8F3DC',
    fontSize: 12,
    marginTop: 14,
  },
  section: {
    marginTop: 26,
  },
  practiceCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 24,
    borderWidth: 1,
    marginHorizontal: 16,
    padding: 18,
  },
  practiceHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  practiceHeaderText: {
    flex: 1,
  },
  practiceEyebrow: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  practiceTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 25,
    marginTop: 6,
  },
  practiceCopy: {
    color: Colors.textMid,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  practiceCountBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  practiceCountText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  practiceTrack: {
    backgroundColor: '#E5EFE7',
    borderRadius: 999,
    height: 10,
    marginTop: 16,
    overflow: 'hidden',
  },
  practiceTrackFill: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    height: '100%',
  },
  practiceRow: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    padding: 14,
  },
  practiceRowDone: {
    backgroundColor: Colors.primaryLight,
  },
  practiceRowText: {
    flex: 1,
  },
  practiceRowStep: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  practiceRowStepDone: {
    color: Colors.primary,
  },
  practiceRowEnglish: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  practiceRowEnglishDone: {
    color: Colors.primary,
  },
  practiceRowTranslation: {
    color: Colors.textMid,
    fontSize: 14,
    marginTop: 4,
  },
  practiceRowTranslationDone: {
    color: Colors.primaryMid,
  },
  practiceTick: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minWidth: 62,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  practiceTickDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  practiceTickText: {
    color: Colors.textMid,
    fontSize: 12,
    fontWeight: '800',
  },
  practiceTickTextDone: {
    color: '#fff',
  },
  practiceSuccess: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
  },
  practiceHint: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },
  practiceActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  practiceActionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  practiceActionButtonAlt: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  practiceActionButtonGhost: {
    backgroundColor: Colors.surfaceAlt,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  practiceActionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  practiceActionTextAlt: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  practiceActionTextGhost: {
    color: Colors.textMid,
    fontSize: 13,
    fontWeight: '800',
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginHorizontal: 16,
  },
  sectionCopy: {
    color: Colors.textMid,
    fontSize: 14,
    lineHeight: 22,
    marginHorizontal: 16,
    marginTop: 6,
  },
  journeyList: {
    gap: 12,
    marginTop: 14,
    paddingHorizontal: 16,
  },
  journeyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
  },
  journeyTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  journeyEmoji: {
    fontSize: 24,
  },
  journeyCategory: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  journeyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  journeyCopy: {
    color: Colors.textMid,
    fontSize: 14,
    lineHeight: 21,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
    paddingHorizontal: 16,
  },
  emptyFeatureCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 18,
  },
  emptyFeatureTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyFeatureCopy: {
    color: Colors.textMid,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  kitRow: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  kitCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 176,
    padding: 16,
    width: 220,
  },
  kitCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  kitEmoji: {
    fontSize: 24,
    marginBottom: 12,
  },
  kitTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  kitTitleActive: {
    color: '#fff',
  },
  kitCopy: {
    color: Colors.textMid,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  kitCopyActive: {
    color: '#D8F3DC',
  },
  kitCount: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: 14,
    textTransform: 'uppercase',
  },
  kitCountActive: {
    color: '#FDE68A',
  },
  sectionHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  sectionHeaderCompact: {
    flexDirection: 'column',
    gap: 12,
  },
  sectionHeaderText: {
    flex: 1,
    paddingRight: 12,
  },
  sectionCopyInline: {
    color: Colors.textMid,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  clearBtn: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  clearBtnText: {
    color: Colors.textMid,
    fontSize: 13,
    fontWeight: '700',
  },
  actionColumn: {
    gap: 10,
  },
  cardRow: {
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  focusHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    marginHorizontal: 16,
  },
  focusEmoji: {
    fontSize: 28,
  },
  focusText: {
    flex: 1,
  },
  focusTitle: {
    color: Colors.text,
    fontSize: 23,
    fontWeight: '800',
  },
  focusCopy: {
    color: Colors.textMid,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
});
