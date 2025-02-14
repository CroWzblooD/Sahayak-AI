import { Input, Text, View, YStack, Button, XStack, Stack } from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";
import React, { useState, useEffect } from "react";
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
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import OTPTextInput from "react-native-otp-textinput";
import { router } from "expo-router";
import { THEME_COLORS } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';

const screenHeight = Dimensions.get("window").height;

export default function Login() {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const { signIn, verifyOTP, isLoading } = useAuth();
  const [showOTP, setShowOTP] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setIsBiometricSupported(compatible);
  };

  const handleLogin = async () => {
    try {
      await signIn({ email, password });
      router.replace("/OnBoardingForm");
    } catch (error) {
      Alert.alert('Error', 'Invalid credentials');
    }
  };

  const handleBiometricAuth = async () => {
    try {
      setIsAuthenticating(true);

      const savedUserId = await SecureStore.getItemAsync('userId');
      if (!savedUserId) {
        Alert.alert(
          'Not Registered',
          'Please sign up first to use biometric login.',
          [
            {
              text: 'Sign Up',
              onPress: () => router.push("/(auth)/signup")
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with biometric',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          await signIn({ token });
          router.replace("/OnBoardingForm");
        } else {
          // If token is missing, clear stored data and ask to login again
          await SecureStore.deleteItemAsync('userId');
          await SecureStore.deleteItemAsync('userToken');
          Alert.alert('Session Expired', 'Please login again');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleContinue = async () => {
    try {
      if (loginMethod === 'phone') {
        await signIn({ phone: phone });
        setShowOTP(true);
      } else {
        await handleLogin();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Login failed. Please try again.');
    }
  };

  const handleOTPVerification = async (otp: string) => {
    if (otp.length === 6) {
      try {
        await verifyOTP(otp);
        // After successful OTP verification, try biometric authentication
        await handleBiometricAuth();
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'OTP verification failed. Please try again.');
      }
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
                    Welcome Back
                  </Text>
                  <Text fontSize={16} color="#fff" opacity={0.8}>
                    Your AI-powered guide to government schemes
                  </Text>
                </Animated.View>

                <XStack justifyContent="center" space="$4" marginTop="$4">
                  <Button
                    backgroundColor={loginMethod === 'phone' ? THEME_COLORS.primary : '#333'}
                    onPress={() => setLoginMethod('phone')}
                    size="$4"
                  >
                    Phone
                  </Button>
                  <Button
                    backgroundColor={loginMethod === 'email' ? THEME_COLORS.primary : '#333'}
                    onPress={() => setLoginMethod('email')}
                    size="$4"
                  >
                    Email
                  </Button>
                </XStack>

                {loginMethod === 'phone' ? (
                  !showOTP ? (
                    <Animated.View entering={FadeInDown.delay(400)}>
                      <YStack space="$4">
                        <Input
                          value={phone}
                          onChangeText={(text) => setPhone(text)}
                          backgroundColor="#111"
                          borderColor="#333"
                          size="$4"
                          maxLength={10}
                          color="#fff"
                          keyboardType="phone-pad"
                          placeholder="Enter your mobile number"
                        />

                        <Button
                          backgroundColor={THEME_COLORS.primary}
                          disabled={phone.length !== 10 || isLoading}
                          opacity={phone.length === 10 ? 1 : 0.5}
                          onPress={handleContinue}
                        >
                          {isLoading ? "Sending OTP..." : "Continue"}
                        </Button>
                      </YStack>
                    </Animated.View>
                  ) : (
                    <Animated.View entering={FadeIn}>
                      <YStack space="$4" alignItems="center">
                        <Text color="#fff">
                          Enter OTP sent to +91 {phone}
                        </Text>

                        <OTPTextInput
                          handleTextChange={handleOTPVerification}
                          inputCount={6}
                          containerStyle={styles.otpContainer}
                          textInputStyle={styles.otpInput}
                        />

                        <XStack space="$2">
                          <Text color="#666">Didn't receive OTP?</Text>
                          <Text color={THEME_COLORS.primary} fontWeight="600">
                            Resend
                          </Text>
                        </XStack>
                      </YStack>
                    </Animated.View>
                  )
                ) : (
                  <Animated.View entering={FadeInDown.delay(400)}>
                    <YStack space="$4">
                      <Input
                        value={email}
                        onChangeText={(text) => setEmail(text)}
                        backgroundColor="#111"
                        borderColor="#333"
                        size="$4"
                        color="#fff"
                        keyboardType="email-address"
                        placeholder="Email Address"
                      />

                      <Input
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                        backgroundColor="#111"
                        borderColor="#333"
                        size="$4"
                        color="#fff"
                        secureTextEntry
                        placeholder="Password"
                      />

                      <Button
                        backgroundColor={THEME_COLORS.primary}
                        disabled={!email || !password || isLoading}
                        onPress={handleContinue}
                      >
                        {isLoading ? "Logging in..." : "Login"}
                      </Button>
                    </YStack>
                  </Animated.View>
                )}

                <Animated.View 
                  entering={FadeInDown.delay(400)}
                  style={styles.biometricContainer}
                >
                  <Button
                    size="$8"
                    circular
                    backgroundColor={THEME_COLORS.primary}
                    onPress={handleBiometricAuth}
                    disabled={!isBiometricSupported || isAuthenticating}
                    pressStyle={{ scale: 0.95 }}
                  >
                    <MaterialIcons 
                      name="fingerprint" 
                      size={48} 
                      color="white" 
                    />
                  </Button>
                  <Text 
                    color="#fff" 
                    marginTop="$4"
                    fontSize={16}
                  >
                    {isAuthenticating 
                      ? "Authenticating..." 
                      : "Touch the fingerprint sensor"}
                  </Text>
                </Animated.View>

                <XStack justifyContent="center" space="$2">
                  <Text color="#666">New to Sahayak?</Text>
                  <Text 
                    color={THEME_COLORS.primary} 
                    fontWeight="600"
                    onPress={() => router.push("/(auth)/signup")}
                  >
                    Sign Up
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
  otpContainer: {
    marginVertical: 20,
  },
  otpInput: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    width: 45,
    height: 45,
  },
  biometricContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
});
