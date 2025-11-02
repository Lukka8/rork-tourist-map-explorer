import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  module.exports = require('./MapComponents.impl.web');
} else {
  module.exports = require('./MapComponents.impl.native');
}
