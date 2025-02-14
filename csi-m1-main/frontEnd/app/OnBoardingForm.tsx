import React, { useState } from 'react';
import { 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Text, 
  Button, 
  YStack, 
  XStack, 
  Input, 
  Select, 
  Progress,
  ScrollView
} from 'tamagui';
import { THEME_COLORS } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'tamagui/linear-gradient';

export default function OnBoardingForm() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleComplete = () => {
    try {
      // Navigate to tabs index
      router.replace('/(tabs)/');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <YStack space="$4" animation="quick">
            <Text color="#fff" fontSize={24} fontWeight="bold">
              Tell us about yourself
            </Text>
            <Input
              placeholder="Age"
              keyboardType="numeric"
              backgroundColor="#111"
              borderColor="#333"
              color="#fff"
              size="$4"
            />
            <Input
              placeholder="Occupation"
              backgroundColor="#111"
              borderColor="#333"
              color="#fff"
              size="$4"
            />
          </YStack>
        );
      case 2:
        return (
          <YStack space="$4" animation="quick">
            <Text color="#fff" fontSize={24} fontWeight="bold">
              Financial Information
            </Text>
            <Input
              placeholder="Annual Income"
              keyboardType="numeric"
              backgroundColor="#111"
              borderColor="#333"
              color="#fff"
              size="$4"
            />
            <Input
              placeholder="Location (City)"
              backgroundColor="#111"
              borderColor="#333"
              color="#fff"
              size="$4"
            />
          </YStack>
        );
      case 3:
        return (
          <YStack space="$4" animation="quick">
            <Text color="#fff" fontSize={24} fontWeight="bold">
              Additional Details
            </Text>
            <Input
              placeholder="Education"
              backgroundColor="#111"
              borderColor="#333"
              color="#fff"
              size="$4"
            />
            <Input
              placeholder="Category (General/OBC/SC/ST)"
              backgroundColor="#111"
              borderColor="#333"
              color="#fff"
              size="$4"
            />
          </YStack>
        );
      case 4:
        return (
          <YStack space="$4" animation="quick">
            <Text color="#fff" fontSize={24} fontWeight="bold">
              Almost Done!
            </Text>
            <Text color="#fff" fontSize={16} opacity={0.8}>
              We'll personalize your experience based on your profile.
            </Text>
            <Button
              backgroundColor={THEME_COLORS.primary}
              onPress={handleComplete}
              size="$5"
              marginTop="$4"
            >
              Complete Setup
            </Button>
          </YStack>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={[THEME_COLORS.primary, '#000']}
          start={[0, 0]}
          end={[0, 0.3]}
          style={styles.gradient}
        />
        
        <ScrollView 
          bounces={false}
          contentContainerStyle={styles.scrollContent}
        >
          <YStack padding={20} space="$4">
            <Progress value={step * 25} backgroundColor="#333">
              <Progress.Indicator animation="bouncy" backgroundColor={THEME_COLORS.primary} />
            </Progress>

            {renderStep()}

            <XStack justifyContent="space-between" marginTop="$4">
              {step > 1 && (
                <Button 
                  onPress={() => setStep(step - 1)}
                  backgroundColor="#333"
                  size="$4"
                >
                  Previous
                </Button>
              )}
              {step < 4 && (
                <Button 
                  onPress={() => setStep(step + 1)}
                  backgroundColor={THEME_COLORS.primary}
                  alignSelf="flex-end"
                  size="$4"
                >
                  Next
                </Button>
              )}
            </XStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Dimensions.get('window').height * 0.3,
  },
  scrollContent: {
    flexGrow: 1,
  }
});

