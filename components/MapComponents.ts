import { Platform } from 'react-native';

export * from './MapComponents.types';

if (Platform.OS === 'web') {
  const webExports = require('./MapComponents.web');
  module.exports = { ...module.exports, ...webExports };
} else {
  const nativeExports = require('./MapComponents.native');
  module.exports = { ...module.exports, ...nativeExports };
}
