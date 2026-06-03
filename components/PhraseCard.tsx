import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Translation } from '@/lib/supabase';

type Props = {
  item: Translation;
  onPress?: () => void;
  locked?: boolean;
};

export function PhraseCard({ item, onPress, locked = false }: Props) {
  const tierColors = item.tier === 'free' ? Colors.free : Colors.paid;

  return (
    <TouchableOpacity
      style={[styles.card, locked && styles.locked]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Tier badge */}
      <View style={[styles.badge, { backgroundColor: tierColors.bg }]}>
        <Text style={[styles.badgeText, { color: tierColors.text }]}>
          {item.tier === 'free' ? 'FREE' : 'PRO'}
        </Text>
      </View>

      {/* Main content */}
      <Text style={styles.english}>{item.english_text}</Text>
      <Text style={[styles.translation, locked && styles.blur]}>
        {locked ? '••••••' : item.translated_text}
      </Text>
      {!locked && item.pronunciation ? (
        <Text style={styles.pronunciation}>/{item.pronunciation}/</Text>
      ) : null}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.type}>{item.type}</Text>
      </View>

      {locked && (
        <View style={styles.lockOverlay}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockText}>Pro</Text>
        </View>
      )}
    </TouchableOpacity>
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
  locked: {
    opacity: 0.7,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  english: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  translation: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  blur: {
    color: Colors.border,
  },
  pronunciation: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  category: {
    fontSize: 12,
    color: Colors.textMid,
  },
  type: {
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'capitalize',
  },
  lockOverlay: {
    position: 'absolute',
    right: 16,
    top: 16,
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 16,
  },
  lockText: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: '700',
  },
});
