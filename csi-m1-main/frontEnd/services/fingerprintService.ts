import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export class FingerprintService {
  private static readonly FINGERPRINT_DIR = `${FileSystem.documentDirectory}fingerprints/`;
  
  static async initialize() {
    const dirInfo = await FileSystem.getInfoAsync(this.FINGERPRINT_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.FINGERPRINT_DIR);
    }
  }

  static async enrollFingerprint(image: string, userId: string): Promise<boolean> {
    try {
      // Process and enhance fingerprint image
      const processed = await ImageManipulator.manipulateAsync(
        image,
        [
          { resize: { width: 500 } },
          { contrast: 1.2 },
          { brightness: -0.2 }
        ],
        { compress: 0.7, format: ImageManipulator.SaveFormat.PNG }
      );

      // Save processed fingerprint
      await FileSystem.writeAsStringAsync(
        `${this.FINGERPRINT_DIR}${userId}.png`,
        processed.uri,
        { encoding: FileSystem.EncodingType.Base64 }
      );

      return true;
    } catch (error) {
      console.error('Fingerprint enrollment failed:', error);
      return false;
    }
  }

  static async verifyFingerprint(image: string, userId: string): Promise<boolean> {
    try {
      // Get stored fingerprint
      const storedPrint = await FileSystem.readAsStringAsync(
        `${this.FINGERPRINT_DIR}${userId}.png`,
        { encoding: FileSystem.EncodingType.Base64 }
      );

      // Process new fingerprint
      const processed = await ImageManipulator.manipulateAsync(
        image,
        [
          { resize: { width: 500 } },
          { contrast: 1.2 },
          { brightness: -0.2 }
        ],
        { compress: 0.7, format: ImageManipulator.SaveFormat.PNG }
      );

      // Compare fingerprints (simplified comparison)
      const similarity = await this.compareFingerprints(processed.uri, storedPrint);
      return similarity > 0.8; // 80% similarity threshold

    } catch (error) {
      console.error('Fingerprint verification failed:', error);
      return false;
    }
  }

  private static async compareFingerprints(print1: string, print2: string): Promise<number> {
    // Implement fingerprint comparison algorithm
    // This is a simplified version - you should implement a proper algorithm
    return 0.9; // Placeholder
  }
} 