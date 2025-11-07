import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export function useKeyboardHeight() {
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const onShow = (e: any) => {
      const h = e?.endCoordinates?.height ?? 0;
      setHeight(h);
    };
    const onHide = () => setHeight(0);

    const showSub = Keyboard.addListener('keyboardDidShow', onShow);
    const hideSub = Keyboard.addListener('keyboardDidHide', onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return height;
}
