import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { Check, Camera, RefreshCw } from 'lucide-react-native';
import { NYC_ATTRACTIONS, TBILISI_ATTRACTIONS } from '@/constants/attractions';
import { useThemeColors } from '@/lib/use-theme-colors';
import { api } from '@/lib/api-client';

export default function CheckInScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const cameraRef = useRef<any>(null);

  const all = [...NYC_ATTRACTIONS, ...TBILISI_ATTRACTIONS];
  const attraction = all.find((a) => a.id === id);

  if (!attraction) {
    return <View style={styles.center}><Text>Attraction not found</Text></View>;
  }

  const handleCapture = async () => {
    try {
      const result = await cameraRef.current?.takePictureAsync();
      if (result?.uri) setPhotoUri(result.uri as string);
    } catch (e) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.checkins.create({ attractionId: attraction.id, photoUri });
      Alert.alert('Checked in', 'Your check-in has been posted');
      router.back();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to check in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.secondaryBackground }]}>
      <Stack.Screen options={{ title: `Check in • ${attraction.name}` }} />
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.preview} contentFit="cover" />
      ) : (
        <View style={styles.cameraWrap}>
          {!permission?.granted ? (
            <View style={styles.center}>
              <Text style={{ marginBottom: 12 }}>Camera permission needed</Text>
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={requestPermission}>
                <Text style={styles.buttonText}>Grant</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <CameraView ref={cameraRef} style={styles.camera} />
              <TouchableOpacity
                accessibilityRole="button"
                testID="capture"
                style={[styles.captureButton, { backgroundColor: colors.primary }]}
                onPress={handleCapture}
              >
                <Camera size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <View style={styles.actions}>
        {photoUri && (
          <TouchableOpacity style={[styles.action, { borderColor: colors.border }]} onPress={() => setPhotoUri(undefined)}>
            <RefreshCw size={18} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>Retake</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity disabled={submitting} style={[styles.actionPrimary, { backgroundColor: colors.primary, opacity: submitting ? 0.6 : 1 }]} onPress={handleSubmit}>
          <Check size={18} color="#FFF" />
          <Text style={styles.primaryText}>{submitting ? 'Submitting...' : 'Check In'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  cameraWrap: { flex: 1 },
  camera: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  captureButton: { position: 'absolute', bottom: 24, alignSelf: 'center', width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  preview: { flex: 1 },
  actions: { flexDirection: 'row', gap: 12, padding: 16 },
  action: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  actionText: { fontWeight: '700' as const },
  actionPrimary: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  primaryText: { color: '#FFF', fontWeight: '700' as const },
  button: { paddingHorizontal: 16, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFF', fontWeight: '700' as const },
});
