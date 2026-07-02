import React from 'react';
import {
  Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Language } from '@/lib/phrasebook-types';

type Props = {
  error?: string | null;
  languages: Language[];
  loading?: boolean;
  onChange: (code: string) => void;
  selected: string;
};

export function LanguagePicker({
  selected,
  onChange,
  languages,
  loading = false,
  error = null,
}: Props) {
  if (loading) return <ActivityIndicator color={Colors.primary} style={{ margin: 8 }} />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (languages.length === 0) return <Text style={styles.error}>No languages available yet.</Text>;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {languages.map((lang) => {
        const active = lang.code === selected;
        return (
          <TouchableOpacity
            key={lang.code}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(lang.code)}
          >
            {lang.flag_emoji ? (
              <Text style={styles.flag}>{lang.flag_emoji}</Text>
            ) : null}
            <Text style={[styles.label, active && styles.labelActive]}>
              {lang.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 5,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  flag: {
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMid,
  },
  labelActive: {
    color: '#fff',
    fontWeight: '700',
  },
  error: {
    color: Colors.danger,
    marginHorizontal: 16,
    marginTop: 10,
  },
});
