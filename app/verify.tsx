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

export default function VerifyScreen() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Verify Account', headerShown: true }} />
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <CheckCircle2 size={48} color="#007AFF" strokeWidth={2} />
            </View>
            <Text style={styles.title}>Verify Your Account</Text>
            <Text style={styles.subtitle}>
              We&apos;ve sent verification codes to your email and phone
            </Text>
          </View>

          <View style={styles.verificationSection}>
            <View style={styles.verificationCard}>
              <View style={styles.cardHeader}>
                <Mail size={24} color={isEmailVerified ? '#10B981' : '#007AFF'} />
                <Text style={styles.cardTitle}>Email Verification</Text>
                {isEmailVerified && (
                  <CheckCircle2 size={20} color="#10B981" />
                )}
              </View>
              <Text style={styles.cardSubtitle}>{user.email}</Text>

              {!isEmailVerified ? (
                <>
                  <TextInput
                    style={styles.codeInput}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#999"
                    value={emailCode}
                    onChangeText={setEmailCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isVerifyingEmail}
                  />

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.sendButton, isSendingEmail && styles.buttonDisabled]}
                      onPress={handleSendEmailCode}
                      disabled={isSendingEmail}
                    >
                      {isSendingEmail ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                      ) : (
                        <Text style={styles.sendButtonText}>Send Code</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.verifyButton, isVerifyingEmail && styles.buttonDisabled]}
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

            <View style={styles.verificationCard}>
              <View style={styles.cardHeader}>
                <Phone size={24} color={isPhoneVerified ? '#10B981' : '#007AFF'} />
                <Text style={styles.cardTitle}>Phone Verification</Text>
                {isPhoneVerified && (
                  <CheckCircle2 size={20} color="#10B981" />
                )}
              </View>
              <Text style={styles.cardSubtitle}>{user.phone}</Text>

              {!isPhoneVerified ? (
                <>
                  <TextInput
                    style={styles.codeInput}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#999"
                    value={phoneCode}
                    onChangeText={setPhoneCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isVerifyingPhone}
                  />

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.sendButton, isSendingPhone && styles.buttonDisabled]}
                      onPress={handleSendPhoneCode}
                      disabled={isSendingPhone}
                    >
                      {isSendingPhone ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                      ) : (
                        <Text style={styles.sendButtonText}>Send Code</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.verifyButton, isVerifyingPhone && styles.buttonDisabled]}
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
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a' }}>Made a mistake?</Text>
            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ marginBottom: 8, color: '#666' }}>Change Email</Text>
                <TextInput
                  style={styles.inputInline}
                  placeholder="Enter new email"
                  placeholderTextColor="#999"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TouchableOpacity
                  style={[styles.verifyButton, isUpdatingEmail && styles.buttonDisabled]}
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
                <Text style={{ marginBottom: 8, color: '#666' }}>Change Phone</Text>
                <TextInput
                  style={styles.inputInline}
                  placeholder="Enter new phone"
                  placeholderTextColor="#999"
                  value={newPhone}
                  onChangeText={setNewPhone}
                  keyboardType="phone-pad"
                />
                <TouchableOpacity
                  style={[styles.verifyButton, isUpdatingPhone && styles.buttonDisabled]}
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
    backgroundColor: '#F8F9FA',
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
    backgroundColor: '#E8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  verificationSection: {
    gap: 20,
  },
  verificationCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E8E8E8',
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
    color: '#1a1a1a',
    flex: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  codeInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sendButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  sendButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  verifyButton: {
    flex: 1,
    backgroundColor: '#007AFF',
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
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#E8E8E8',
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
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#007AFF',
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
