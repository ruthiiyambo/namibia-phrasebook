import React from 'react';
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { demoCategories, demoLanguages, demoTranslations } from '@/lib/demo-data';
import { AppInfo, getSupportMailtoUrl } from '@/lib/app-info';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const totalLanguages = demoLanguages.length;
  const totalPhrases = demoTranslations.length;
  const totalCategories = demoCategories.length;
  const compactStats = width < 420;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🇳🇦</Text>
        </View>
        <Text style={styles.email}>{AppInfo.name}</Text>
        <Text style={styles.subtitle}>
          {AppInfo.tagline}
        </Text>

        <View style={[styles.statRow, compactStats && styles.statRowCompact]}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalLanguages}</Text>
            <Text style={styles.statLabel}>Languages</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalPhrases}</Text>
            <Text style={styles.statLabel}>Workbook phrases</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalCategories}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What This App Does</Text>
          <Text style={styles.note}>
            {AppInfo.summary}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Works Offline</Text>
          <Row label="Connection" value="Not required for phrase browsing" />
          <Row label="Content source" value="Bundled workbook data" />
          <Row label="Accounts" value="Not required in v1" />
          <Text style={styles.note}>
            {AppInfo.offlineNote}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Languages Inside</Text>
          <Text style={styles.note}>
            {demoLanguages.map((language) => language.name).join(' • ')}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Support</Text>
          <Row label="Email" value={AppInfo.supportEmail} />
          <Text style={styles.note}>
            {AppInfo.supportNote}
          </Text>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => Linking.openURL(getSupportMailtoUrl())}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Email support</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Privacy & Data</Text>
          {AppInfo.privacyHighlights.slice(0, 3).map((item) => (
            <Text key={item} style={styles.bullet}>
              • {item}
            </Text>
          ))}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push('/privacy')}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Read privacy details</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, alignItems: 'center' },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  email: { fontSize: 20, color: Colors.text, fontWeight: '800', marginBottom: 6 },
  subtitle: {
    color: Colors.textMid,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 22,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  statRowCompact: {
    flexDirection: 'column',
  },
  statCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    flex: 1,
    padding: 16,
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: '#D8F3DC',
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginBottom: 14, letterSpacing: 0.5, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { fontSize: 14, color: Colors.textMid },
  rowValue: { fontSize: 14, fontWeight: '600', color: Colors.text, flexShrink: 1, textAlign: 'right' },
  note: { color: Colors.textMuted, fontSize: 13, lineHeight: 20, marginTop: 14 },
  bullet: {
    color: Colors.textMid,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
});
