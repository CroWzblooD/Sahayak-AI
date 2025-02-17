import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { Text } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { THEME_COLORS } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function EditProfileScreen() {
  const [formData, setFormData] = useState({
    name: "Ashish K Choudhary",
    age: "28",
    occupation: "Software Engineer",
    education: "B.Tech in Computer Science",
    email: "ashishkchoudhary@gmail.com",
    disability: "No",
    disabilityType: "",
    monthlyIncome: "₹75,000",
    category: "General",
    state: "Delhi",
    city: "New Delhi"
  });

  const handleSave = () => {
    // Save logic here
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={formData.age}
              onChangeText={(text) => setFormData({...formData, age: text})}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Occupation</Text>
            <TextInput
              style={styles.input}
              value={formData.occupation}
              onChangeText={(text) => setFormData({...formData, occupation: text})}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Education</Text>
            <TextInput
              style={styles.input}
              value={formData.education}
              onChangeText={(text) => setFormData({...formData, education: text})}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disability Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Disability Status</Text>
            <View style={styles.radioGroup}>
              <Pressable
                style={[styles.radioButton, formData.disability === "Yes" && styles.radioButtonActive]}
                onPress={() => setFormData({...formData, disability: "Yes"})}
              >
                <Text style={[styles.radioText, formData.disability === "Yes" && styles.radioTextActive]}>Yes</Text>
              </Pressable>
              <Pressable
                style={[styles.radioButton, formData.disability === "No" && styles.radioButtonActive]}
                onPress={() => setFormData({...formData, disability: "No"})}
              >
                <Text style={[styles.radioText, formData.disability === "No" && styles.radioTextActive]}>No</Text>
              </Pressable>
            </View>
          </View>
          {formData.disability === "Yes" && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Disability Type</Text>
              <TextInput
                style={styles.input}
                value={formData.disabilityType}
                onChangeText={(text) => setFormData({...formData, disabilityType: text})}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Monthly Income</Text>
            <TextInput
              style={styles.input}
              value={formData.monthlyIncome}
              onChangeText={(text) => setFormData({...formData, monthlyIncome: text})}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(text) => setFormData({...formData, category: text})}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              value={formData.state}
              onChangeText={(text) => setFormData({...formData, state: text})}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => setFormData({...formData, city: text})}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    color: THEME_COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  radioButtonActive: {
    backgroundColor: THEME_COLORS.primary,
    borderColor: THEME_COLORS.primary,
  },
  radioText: {
    color: '#666',
    fontSize: 16,
  },
  radioTextActive: {
    color: '#fff',
  },
}); 