const fs = require('fs');
const path = require('path');

const files = [
  'src/screens/ProfileScreen.js',
  'src/screens/NewGroupScreen.js',
  'src/screens/GroupInfoScreen.js'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace import
  content = content.replace(
    /import \{ launchImageLibrary \} from 'react-native-image-picker';/g,
    "import * as ImagePicker from 'expo-image-picker';"
  );
  
  // Replace launchImageLibrary calls - simple version
  content = content.replace(
    /launchImageLibrary\(/g,
    'ImagePicker.launchImageLibraryAsync('
  );
  
  // Replace mediaType
  content = content.replace(
    /mediaType: 'photo'/g,
    "mediaTypes: ImagePicker.MediaTypeOptions.Images"
  );
  
  // Replace result handling
  content = content.replace(
    /!result\.didCancel && result\.assets/g,
    '!result.canceled && result.assets'
  );
  
  fs.writeFileSync(file, content);
  console.log(`Fixed: ${file}`);
});

console.log('Done!');
