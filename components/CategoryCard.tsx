import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/Colors';

type Props = {
  active?: boolean;
  count: number;
  description: string;
  emoji: string;
  onPress: () => void;
  title: string;
};

export function CategoryCard({
  active = false,
  count,
  description,
  emoji,
  onPress,
  title,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, active && styles.cardActive]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.count, active && styles.countActive]}>
          {count} phrases
        </Text>
      </View>

      <Text style={[styles.title, active && styles.titleActive]}>{title}</Text>
      <Text style={[styles.description, active && styles.descriptionActive]}>
        {description}
      </Text>
      <Text style={[styles.cta, active && styles.ctaActive]}>
        Open phrases
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 168,
    padding: 16,
    width: 224,
  },
  cardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: '#0B2218',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  emoji: {
    fontSize: 22,
  },
  count: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  countActive: {
    color: '#D8F3DC',
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  titleActive: {
    color: '#fff',
  },
  description: {
    color: Colors.textMid,
    fontSize: 13,
    lineHeight: 20,
  },
  descriptionActive: {
    color: '#E8F5EC',
  },
  cta: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginTop: 14,
    textTransform: 'uppercase',
  },
  ctaActive: {
    color: '#FDE68A',
  },
});
