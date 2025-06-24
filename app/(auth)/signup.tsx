import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen({ route }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const lang = route?.params?.lang || 'en';
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.emoji}>📝</Text>
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>Create your account to get started!</Text>
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="account-outline" size={22} color="#10B981" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />
      </View>
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="email-outline" size={22} color="#10B981" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email or Phone"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="lock-outline" size={22} color="#10B981" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      <TouchableOpacity style={styles.signupButton} 
        onPress={() => (navigation as any).replace('(tabs)')}> 
        <Text style={styles.signupButtonText}>Sign Up</Text>
        <MaterialCommunityIcons name="arrow-right" size={22} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} 
        onPress={() => (navigation as any).replace('(auth)/login', { lang })}>
        <Text style={styles.linkText}>Already have an account? <Text style={{ color: '#10B981', fontWeight: 'bold' }}>Login</Text></Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 54,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 28,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
    maxWidth: 350,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#111827',
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  link: {
    marginTop: 18,
  },
  linkText: {
    color: '#6B7280',
    fontSize: 15,
  },
}); 