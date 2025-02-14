import { Input, Text, View, YStack, Button, XStack, Stack } from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";
import React, { useState } from "react";
import { 
  Dimensions, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import { THEME_COLORS } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";

const screenHeight = Dimensions.get("window").height;

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const { signUp, isLoading } = useAuth();

  const handleSignup = async () => {
    try {
      // Basic validation
      if (!formData.name || !formData.email || !formData.phone || !formData.password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      // Create account
      await signUp({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      Alert.alert(
        'Success', 
        'Account created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace("/(auth)/login")
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create account');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View flex={1} backgroundColor="#000">
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            <Stack flex={1}>
              <View height={screenHeight * 0.3}>
                <LinearGradient
                  position="absolute"
                  height="100%"
                  width="100%"
                  colors={[THEME_COLORS.primary, "#000"]}
                  start={[0, 0]}
                  end={[0, 1]}
                />
              </View>

              <YStack flex={1} padding={24} space="$4">
                <Animated.View entering={FadeInDown.delay(200)}>
                  <Text fontSize={32} fontWeight="800" color={THEME_COLORS.primary}>
                    Create Account
                  </Text>
                  <Text fontSize={16} color="#fff" opacity={0.8}>
                    Join Sahayak to access government schemes
                  </Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400)}>
                  <YStack space="$4">
                    <Input
                      value={formData.name}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                      backgroundColor="#111"
                      borderColor="#333"
                      size="$4"
                      color="#fff"
                      placeholder="Full Name"
                    />

                    <Input
                      value={formData.email}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                      backgroundColor="#111"
                      borderColor="#333"
                      size="$4"
                      color="#fff"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholder="Email Address"
                    />

                    <Input
                      value={formData.phone}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                      backgroundColor="#111"
                      borderColor="#333"
                      size="$4"
                      color="#fff"
                      keyboardType="phone-pad"
                      maxLength={10}
                      placeholder="Phone Number"
                    />

                    <Input
                      value={formData.password}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                      backgroundColor="#111"
                      borderColor="#333"
                      size="$4"
                      color="#fff"
                      secureTextEntry
                      placeholder="Password"
                    />

                    <Input
                      value={formData.confirmPassword}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                      backgroundColor="#111"
                      borderColor="#333"
                      size="$4"
                      color="#fff"
                      secureTextEntry
                      placeholder="Confirm Password"
                    />

                    <Button
                      backgroundColor={THEME_COLORS.primary}
                      disabled={isLoading}
                      onPress={handleSignup}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </YStack>
                </Animated.View>

                <XStack justifyContent="center" space="$2">
                  <Text color="#666">Already have an account?</Text>
                  <Text 
                    color={THEME_COLORS.primary} 
                    fontWeight="600"
                    onPress={() => router.push("/(auth)/login")}
                  >
                    Login
                  </Text>
                </XStack>
              </YStack>
            </Stack>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Add any additional styles here if needed
}); 