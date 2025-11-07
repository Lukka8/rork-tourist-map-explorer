import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';

import { useThemeColors } from '@/lib/use-theme-colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-context';
import { Mail, Phone, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
  const colors = useThemeColors();
  const { user, updateEmailAndPhone } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState<string>(user?.email ?? '');
  const [phone, setPhone] = useState<string>(user?.phone ?? '');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const canSubmit = useMemo(() => {
    const emailChanged = email.trim() !== (user?.email ?? '');
    const phoneChanged = phone.trim() !== (user?.phone ?? '');
    const hasAny = emailChanged || phoneChanged;
    const emailValid = !emailChanged || /.+@.+\..+/.test(email.trim());
    const phoneValid = !phoneChanged || /^(\+|00)?[0-9\-\s()]{6,}$/.test(phone.trim());
    return hasAny && emailValid && phoneValid;
  }, [email, phone, user?.email, user?.phone]);

  const onSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      await updateEmailAndPhone({
        email: email.trim() !== (user?.email ?? '') ? email.trim() : undefined,
        phone: phone.trim() !== (user?.phone ?? '') ? phone.trim() : undefined,
      });
      Alert.alert(
        'Verification required',
        'We updated your contact info. Please verify your new email/phone to continue using all features.',
        [{ text: 'OK', onPress: () => router.replace('/verify') }]
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update. Please try again.';
      Alert.alert('Update failed', message);
    } finally {
      setSubmitting(false);
    }
  }, [email, phone, updateEmailAndPhone, user?.email, user?.phone, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.secondaryBackground, paddingTop: Platform.OS === 'web' ? insets.top : 0 }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.headerRow}>
          <ShieldCheck size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Update contact info</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
          If you lost access to your old email or phone, add a new one here. We will require verification.
        </Text>

        <View style={styles.inputRow}>
          <Mail size={18} color={colors.secondaryText} />
          <TextInput
            testID="account-email-input"
            placeholder="Email"
            placeholderTextColor={colors.secondaryText}
            style={[styles.input, { color: colors.text }]}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputRow}>
          <Phone size={18} color={colors.secondaryText} />
          <TextInput
            testID="account-phone-input"
            placeholder="Phone"
            placeholderTextColor={colors.secondaryText}
            style={[styles.input, { color: colors.text }]}
            keyboardType={Platform.OS === 'web' ? 'default' : 'phone-pad'}
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <TouchableOpacity
          testID="account-save-button"
          disabled={!canSubmit || submitting}
          onPress={onSubmit}
          style={[
            styles.saveButton,
            { backgroundColor: canSubmit ? colors.primary : colors.border },
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveText}>Save and verify</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: '800' as const },
  subtitle: { fontSize: 14 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  input: { flex: 1, fontSize: 16 },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveText: { color: '#FFF', fontWeight: '800' as const, fontSize: 16 },
});
