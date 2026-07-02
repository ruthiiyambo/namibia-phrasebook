import React from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { usePhrasebookState } from '@/hooks/usePhrasebookState';
import { getPhraseReportMailtoUrl } from '@/lib/app-info';
import { Translation } from '@/lib/phrasebook-types';

type Props = {
  item: Translation;
};

export function PhraseCard({ item }: Props) {
  const [expanded, setExpanded] = React.useState(false);
  const {
    addRecent,
    favoriteSet,
    markReported,
    reportedSet,
    savedForTripSet,
    toggleFavorite,
    toggleSavedForTrip,
  } = usePhrasebookState();
  const isFavorite = favoriteSet.has(item.id);
  const isReported = reportedSet.has(item.id);
  const isSavedForTrip = savedForTripSet.has(item.id);

  const openDetails = () => {
    setExpanded((current) => {
      const nextValue = !current;

      if (nextValue) {
        addRecent(item.id);
      }

      return nextValue;
    });
  };

  const handleReport = async () => {
    addRecent(item.id);
    markReported(item.id);

    try {
      await Linking.openURL(getPhraseReportMailtoUrl(item));
    } catch {
      Alert.alert(
        'Email app not available',
        'We could not open your email app. You can still send phrase feedback to the support email listed in About.',
      );
    }
  };

  return (
    <Pressable
      onPress={openDetails}
      style={[styles.card, expanded && styles.cardExpanded]}
    >
      <View style={styles.topRow}>
        <View style={styles.pillRow}>
          <Text style={styles.categoryPill}>{item.category}</Text>
          <Text style={styles.typePill}>{item.type}</Text>
        </View>
        <View style={styles.pillRow}>
          {isFavorite ? <Text style={styles.statePill}>Favorite</Text> : null}
          {isSavedForTrip ? <Text style={styles.statePillAlt}>Trip</Text> : null}
        </View>
      </View>

      <Text style={styles.englishLabel}>English</Text>
      <Text style={styles.english}>{item.english_text}</Text>

      <Text style={styles.translationLabel}>Local phrase</Text>
      <Text style={styles.translation}>{item.translated_text}</Text>
      <Text style={styles.tapHint}>
        {expanded ? 'Tap again to collapse.' : 'Tap to reveal notes and actions.'}
      </Text>

      {expanded ? (
        <>
          {item.pronunciation ? (
            <Text style={styles.pronunciation}>Say it like: {item.pronunciation}</Text>
          ) : null}
          {item.notes ? (
            <Text style={styles.notes}>When to use it: {item.notes}</Text>
          ) : null}

          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={(event) => {
                event.stopPropagation();
                addRecent(item.id);
                toggleFavorite(item.id);
              }}
              style={[styles.actionButton, isFavorite && styles.actionButtonActive]}
            >
              <Text style={[styles.actionLabel, isFavorite && styles.actionLabelActive]}>
                {isFavorite ? 'Favorited' : 'Favorite'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.86}
              onPress={(event) => {
                event.stopPropagation();
                addRecent(item.id);
                toggleSavedForTrip(item.id);
              }}
              style={[styles.actionButton, isSavedForTrip && styles.actionButtonAccent]}
            >
              <Text style={[styles.actionLabel, isSavedForTrip && styles.actionLabelAccent]}>
                {isSavedForTrip ? 'Saved for trip' : 'Save for trip'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.86}
              onPress={(event) => {
                event.stopPropagation();
                void handleReport();
              }}
              style={[styles.actionButton, isReported && styles.actionButtonMuted]}
            >
              <Text style={[styles.actionLabel, isReported && styles.actionLabelMuted]}>
                {isReported ? 'Correction suggested' : 'Report phrase'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardExpanded: {
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    backgroundColor: Colors.primaryLight,
    color: Colors.primary,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typePill: {
    backgroundColor: Colors.surfaceAlt,
    color: Colors.textMid,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    textTransform: 'capitalize',
  },
  statePill: {
    backgroundColor: '#FDE68A',
    color: '#92400E',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statePillAlt: {
    backgroundColor: Colors.primary,
    color: '#fff',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  englishLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  english: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  translationLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  translation: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
  },
  tapHint: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  pronunciation: {
    fontSize: 13,
    color: Colors.textMid,
    marginBottom: 8,
  },
  notes: {
    color: Colors.textMid,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: Colors.surfaceAlt,
    borderColor: Colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  actionButtonActive: {
    backgroundColor: '#FDE68A',
    borderColor: '#F59E0B',
  },
  actionButtonAccent: {
    backgroundColor: Colors.primaryLight,
    borderColor: '#8FD19E',
  },
  actionButtonMuted: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  actionLabel: {
    color: Colors.textMid,
    fontSize: 12,
    fontWeight: '800',
  },
  actionLabelActive: {
    color: '#92400E',
  },
  actionLabelAccent: {
    color: Colors.primary,
  },
  actionLabelMuted: {
    color: '#3730A3',
  },
});
