import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Phone, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api-client';
import { useThemeColors } from '@/lib/use-theme-colors';

export default function VerifyScreen() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingPhone, setIsSendingPhone] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);

  useEffect(() => {
    if (user) {
      setIsEmailVerified(user.email_verified);
      setIsPhoneVerified(user.phone_verified);
    }
  }, [user]);

  const handleSendEmailCode = async () => {
    if (!user) return;
    setIsSendingEmail(true);
    try {
      const result = await api.verification.sendEmailCode();
      Alert.alert('Success', result.message || 'Verification code sent to your email');
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'message' in error 
        ? String(error.message)
        : 'Failed to send code';
      Alert.alert('Error', message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSendPhoneCode = async () => {
    if (!user) return;
    setIsSendingPhone(true);
    try {
      const result = await api.verification.sendPhoneCode(user.phone);
      Alert.alert('Success', result.message || 'Verification code sent to your phone');
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'message' in error 
        ? String(error.message)
        : 'Failed to send code';
      Alert.alert('Error', message);
    } finally {
      setIsSendingPhone(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!user || emailCode.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit code');
      return;
    }
    setIsVerifyingEmail(true);
    try {
      const result = await api.verification.verifyEmail(emailCode);
      await refreshUser();
      setIsEmailVerified(true);
      setEmailCode('');
      Alert.alert('Success', result.message || 'Email verified successfully!');
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'message' in error 
        ? String(error.message)
        : 'Invalid or expired code';
      Alert.alert('Error', message);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!user || phoneCode.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit code');
      return;
    }
    setIsVerifyingPhone(true);
    try {
      const result = await api.verification.verifyPhone(phoneCode);
      await refreshUser();
      setIsPhoneVerified(true);
      setPhoneCode('');
      Alert.alert('Success', result.message || 'Phone verified successfully!');
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'message' in error 
        ? String(error.message)
        : 'Invalid or expired code';
      Alert.alert('Error', message);
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleContinue = () => {
    if (!(isEmailVerified && isPhoneVerified)) {
      return;
    }
    router.replace('/');
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.secondaryBackground }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Verify Account', headerShown: true }} />
      <View style={[styles.container, { backgroundColor: colors.secondaryBackground, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <CheckCircle2 size={48} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Verify Your Account</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              We&apos;ve sent verification codes to your email and phone
            </Text>
          </View>

          <View style={styles.verificationSection}>
            <View style={[styles.verificationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Mail size={24} color={isEmailVerified ? '#10B981' : '#007AFF'} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Email Verification</Text>
                {isEmailVerified && (
                  <CheckCircle2 size={20} color="#10B981" />
                )}
              </View>
              <Text style={[styles.cardSubtitle, { color: colors.secondaryText }]}>{user.email}</Text>

              {!isEmailVerified ? (
                <>
                  <TextInput
                    style={[styles.codeInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={colors.secondaryText}
                    value={emailCode}
                    onChangeText={setEmailCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isVerifyingEmail}
                  />

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.sendButton, { backgroundColor: colors.card, borderColor: colors.primary }, isSendingEmail && styles.buttonDisabled]}
                      onPress={handleSendEmailCode}
                      disabled={isSendingEmail}
                    >
                      {isSendingEmail ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Text style={[styles.sendButtonText, { color: colors.primary }]}>Send Code</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.verifyButton, { backgroundColor: colors.primary }, isVerifyingEmail && styles.buttonDisabled]}
                      onPress={handleVerifyEmail}
                      disabled={isVerifyingEmail || emailCode.length !== 6}
                    >
                      {isVerifyingEmail ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.verifyButtonText}>Verify</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.verifiedBadge}>
                  <CheckCircle2 size={20} color="#10B981" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>

            <View style={[styles.verificationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Phone size={24} color={isPhoneVerified ? '#10B981' : '#007AFF'} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Phone Verification</Text>
                {isPhoneVerified && (
                  <CheckCircle2 size={20} color="#10B981" />
                )}
              </View>
              <Text style={[styles.cardSubtitle, { color: colors.secondaryText }]}>{user.phone}</Text>

              {!isPhoneVerified ? (
                <>
                  <TextInput
                    style={[styles.codeInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={colors.secondaryText}
                    value={phoneCode}
                    onChangeText={setPhoneCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isVerifyingPhone}
                  />

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.sendButton, { backgroundColor: colors.card, borderColor: colors.primary }, isSendingPhone && styles.buttonDisabled]}
                      onPress={handleSendPhoneCode}
                      disabled={isSendingPhone}
                    >
                      {isSendingPhone ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Text style={[styles.sendButtonText, { color: colors.primary }]}>Send Code</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.verifyButton, { backgroundColor: colors.primary }, isVerifyingPhone && styles.buttonDisabled]}
                      onPress={handleVerifyPhone}
                      disabled={isVerifyingPhone || phoneCode.length !== 6}
                    >
                      {isVerifyingPhone ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.verifyButtonText}>Verify</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.verifiedBadge}>
                  <CheckCircle2 size={20} color="#10B981" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </View>

          <View style={{ marginTop: 24, gap: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Made a mistake?</Text>
            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ marginBottom: 8, color: colors.secondaryText }}>Change Email</Text>
                <TextInput
                  style={[styles.inputInline, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  placeholder="Enter new email"
                  placeholderTextColor={colors.secondaryText}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TouchableOpacity
                  style={[styles.verifyButton, { backgroundColor: colors.primary }, isUpdatingEmail && styles.buttonDisabled]}
                  onPress={async () => {
                    if (!newEmail) return;
                    setIsUpdatingEmail(true);
                    try {
                      const res = await api.auth.updateEmail(newEmail);
                      await refreshUser();
                      setNewEmail('');
                      Alert.alert('Updated', res.message);
                    } catch (e: unknown) {
                      const m = e && typeof e === 'object' && 'message' in e ? String((e as any).message) : 'Failed to update email';
                      Alert.alert('Error', m);
                    } finally {
                      setIsUpdatingEmail(false);
                    }
                  }}
                >
                  {isUpdatingEmail ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.verifyButtonText}>Save Email</Text>}
                </TouchableOpacity>
              </View>

              <View>
                <Text style={{ marginBottom: 8, color: colors.secondaryText }}>Change Phone</Text>
                <TextInput
                  style={[styles.inputInline, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                  placeholder="Enter new phone"
                  placeholderTextColor={colors.secondaryText}
                  value={newPhone}
                  onChangeText={setNewPhone}
                  keyboardType="phone-pad"
                />
                <TouchableOpacity
                  style={[styles.verifyButton, { backgroundColor: colors.primary }, isUpdatingPhone && styles.buttonDisabled]}
                  onPress={async () => {
                    if (!newPhone) return;
                    setIsUpdatingPhone(true);
                    try {
                      const res = await api.auth.updatePhone(newPhone);
                      await refreshUser();
                      setNewPhone('');
                      Alert.alert('Updated', res.message);
                    } catch (e: unknown) {
                      const m = e && typeof e === 'object' && 'message' in e ? String((e as any).message) : 'Failed to update phone';
                      Alert.alert('Error', m);
                    } finally {
                      setIsUpdatingPhone(false);
                    }
                  }}
                >
                  {isUpdatingPhone ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.verifyButtonText}>Save Phone</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              { backgroundColor: colors.primary, shadowColor: colors.primary },
              (!isEmailVerified || !isPhoneVerified) && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!isEmailVerified || !isPhoneVerified}
          >
            <Text
              style={[
                styles.continueButtonText,
              ]}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  verificationSection: {
    gap: 20,
  },
  verificationCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  codeInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 2,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sendButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  verifyButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  inputInline: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  continueButton: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonSecondary: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E8E8E8',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  continueButtonTextSecondary: {
    color: '#666',
  },
});
