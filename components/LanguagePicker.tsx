import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { supabase, Language } from '@/lib/supabase';

type Props = {
  selected: string;          // language code, e.g. 'af'
  onChange: (code: string) => void;
};

export function LanguagePicker({ selected, onChange }: Props) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('languages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        setLanguages((data as Language[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <ActivityIndicator color={Colors.primary} style={{ margin: 8 }} />;

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
});
