import React, { useState, useEffect } from 'react';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, TextInput, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getUserAvatar, updateUserAvatar } from '@/firebase/users';

const AVAILABLE_INTERESTS = ['Studying', 'Sports', 'Hangout', 'Nature', 'Food', 'Gaming', 'Music', 'Hackathons'];

export const AVATAR_MAP: Record<string, any> = {
  'dawg': require('@/assets/avatars/dawg.png'),
  'gorrila': require('@/assets/avatars/gorrila.png'),
  'beardedboy': require('@/assets/avatars/beardedboy.png'),
  'goose': require('@/assets/avatars/goose.png'),
  'girlcoloured': require('@/assets/avatars/girlcoloured.png'),
};
const MOCK_AVATAR_KEYS = Object.keys(AVATAR_MAP);

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();
  
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  // Profile States
  const [name, setName] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatarKey, setSelectedAvatarKey] = useState(MOCK_AVATAR_KEYS[0]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Studying', 'Food']);
  const [showAllAvatars, setShowAllAvatars] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    // Load avatar from Firebase on mount
    getUserAvatar().then(avatar => {
      if (avatar && AVATAR_MAP[avatar]) {
        setSelectedAvatarKey(avatar);
      }
    });
  }, []);

  const handleSelectAvatar = (key: string) => {
    setSelectedAvatarKey(key);
    updateUserAvatar(key);
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={{
        paddingTop: Platform.OS === 'android' ? insets.top : Spacing.four,
        paddingBottom: insets.bottom + Spacing.four,
        alignItems: 'center',
      }}
    >
      <ThemedView style={styles.container}>
        
        {/* Profile Hero Header Section */}
        <View style={styles.heroSection}>
          <View style={styles.avatarWrapper}>
            <Image source={AVATAR_MAP[selectedAvatarKey]} style={styles.mainAvatar} />
            {isEditing && (
              <View style={styles.editBadge}>
                <SymbolView name="pencil" size={12} tintColor="#FFFFFF" />
              </View>
            )}
          </View>
          
          <ThemedText type="subtitle" style={styles.profileTitle}>
            {name || 'Your Campus Persona'}
          </ThemedText>
          <ThemedText style={styles.handleText} themeColor="textSecondary">
            {telegramId ? `@${telegramId.replace('@', '')}` : 'No Telegram linked'}
          </ThemedText>
        </View>

        {/* Form Sections Area - Fades when locked */}
        <View 
          style={[styles.formContainer, !isEditing && { opacity: 0.5 }]} 
          pointerEvents={isEditing ? 'auto' : 'none'}
        >
          
          {/* Identity Section Card */}
          <View style={styles.formCard}>
            <ThemedText type="defaultSemiBold" style={styles.sectionLabel}>About You</ThemedText>
            
            <View style={styles.inputWrapper}>
              <ThemedText type="small" style={styles.inputLabel}>DISPLAY NAME</ThemedText>
              <TextInput
                style={styles.textInput}
                placeholder="What should peers call you?"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputWrapper}>
              <ThemedText type="small" style={styles.inputLabel}>TELEGRAM HANDLE (OPTIONAL)</ThemedText>
              <View style={styles.prefixInputContainer}>
                <ThemedText style={styles.prefixText}>@</ThemedText>
                <TextInput
                  style={[styles.textInput, { flex: 1, borderLeftWidth: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
                  placeholder="tele_handle"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={telegramId}
                  onChangeText={setTelegramId}
                  editable={isEditing}
                />
              </View>
            </View>
          </View>

          {/* Avatar Collection Selection Row */}
          <View style={styles.formCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ThemedText type="defaultSemiBold" style={styles.sectionLabel}>Choose Your Avatar</ThemedText>
              {MOCK_AVATAR_KEYS.length > 4 && (
                <TouchableOpacity onPress={() => setShowAllAvatars(!showAllAvatars)} style={{ padding: 4 }}>
                  <SymbolView 
                    name={{ 
                      ios: showAllAvatars ? 'chevron.up' : 'chevron.down', 
                      android: showAllAvatars ? 'keyboard_arrow_up' : 'keyboard_arrow_down',
                      web: showAllAvatars ? 'keyboard_arrow_up' : 'keyboard_arrow_down' 
                    }} 
                    size={24} 
                    tintColor="#6B7280" 
                  />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.avatarGrid}>
              {MOCK_AVATAR_KEYS.slice(0, showAllAvatars ? MOCK_AVATAR_KEYS.length : 4).map((avatarKey, index) => (
                <TouchableOpacity 
                  key={avatarKey}
                  style={[styles.avatarOptionWrapper, selectedAvatarKey === avatarKey && styles.selectedAvatarOption]}
                  onPress={() => handleSelectAvatar(avatarKey)}
                >
                  <Image source={AVATAR_MAP[avatarKey]} style={styles.gridAvatar} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Interests Section Chips */}
          <View style={styles.formCard}>
            <ThemedText type="defaultSemiBold" style={styles.sectionLabel}>Your Campus Interests</ThemedText>
            <ThemedText type="small" style={styles.cardHelperText}>
              Select the matching tags to help match you with correct activities.
            </ThemedText>
            <View style={styles.interestsGrid}>
              {AVAILABLE_INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <TouchableOpacity
                    key={interest}
                    style={[styles.chipItem, isSelected && styles.chipItemSelected]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <ThemedText style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {interest}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Personal Bio Area */}
          <View style={styles.formCard}>
            <ThemedText type="defaultSemiBold" style={styles.sectionLabel}>Introduce Yourself</ThemedText>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Tell people your year, major, or what kind of hangouts you are down for..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={bio}
              onChangeText={setBio}
              editable={isEditing}
            />
          </View>

        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <ThemedText style={styles.actionButtonText}>
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </ThemedText>
        </TouchableOpacity>

        {Platform.OS === 'web' && <WebBadge />}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    maxWidth: MaxContentWidth,
    width: '100%',
    paddingHorizontal: Spacing.four,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.one,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.two,
  },
  mainAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#E5E7EB',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#2563EB',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  handleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    gap: Spacing.four,
    width: '100%',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Spacing.three,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: Spacing.three,
  },
  sectionLabel: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
  },
  cardHelperText: {
    color: '#6B7280',
    marginTop: -Spacing.one,
    lineHeight: 16,
  },
  inputWrapper: {
    gap: Spacing.one,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 15,
    color: '#111827',
  },
  prefixInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  prefixText: {
    paddingLeft: Spacing.three,
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: '#E5E7EB',
    borderTopLeftRadius: Spacing.two,
    borderBottomLeftRadius: Spacing.two,
    paddingVertical: Spacing.two,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    justifyContent: 'flex-start',
    paddingVertical: 4,
  },
  avatarOptionWrapper: {
    borderRadius: 28,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatarOption: {
    borderColor: '#2563EB',
  },
  gridAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chipItem: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipItemSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  chipText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.three,
  },
  actionButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});