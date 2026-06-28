import React, {useState, useRef } from 'react';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, TextInput, View, Animated, Modal, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Pre-defined campus tags
const EVENT_TYPES = ['Studying', 'Sports', 'Hangout', 'Nature', 'Food'];

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  // State Management
  const [isCreating, setIsCreating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Form State Fields
  const [activityName, setActivityName] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedType, setSelectedType] = useState('Studying');
  const [locationDescription, setLocationDescription] = useState('');

  // Localized Mock Data for Joined Events
  const [myEvents, setMyEvents] = useState([
    { id: 'j1', name: 'CS2100 Midterm Grind', type: 'Studying', location: 'COM1 SR1', time: '14:00 - 18:00', host: 'Alex Tan' },
    { id: 'j2', name: 'Board Games Night', type: 'Hangout', location: 'UTown ERC', time: '19:00 - 23:00', host: 'Sarah Wee' }
  ]);

  // Animated Hooks for screen Transitions & Toast status alert
  const viewFadeAnim = useRef(new Animated.Value(1)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const handleCreateEvent = () => {
    if (!activityName || !time || !locationDescription) return;

    // Simulate creation locally
    const newEvent = {
      id: String(Date.now()),
      name: activityName,
      type: selectedType,
      location: locationDescription,
      time: `${time} (${duration || '1h'})`,
      host: 'Me',
    };

    setIsCreating(false);
    setMyEvents([newEvent, ...myEvents]);

    // Clear form fields cleanly
    setActivityName('');
    setTime('');
    setDuration('');
    setLocationDescription('');

    // Trigger Success Banner Transition Sequence
    setShowToast(true);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true })
    ]).start(() => {
      setShowToast(false);
      // Fade back the screen text elegantly
      Animated.timing(viewFadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    });
  };

  return (
    <ThemedView style={[styles.outerFrame, { backgroundColor: theme.background }]}>
      
      {/* Primary My Events List Screen View */}
      <Animated.ScrollView
        style={[styles.scrollView, { opacity: viewFadeAnim }]}
        contentContainerStyle={{ 
          paddingTop: Platform.OS === 'android' ? insets.top : Spacing.four,
          paddingBottom: insets.bottom + 80 // Leave space clear of FAB overlap
        }}
      >
        <ThemedView style={styles.container}>
          <View style={styles.headerBlock}>
            <ThemedText type="title">My Hangouts</ThemedText>
            <ThemedText style={[styles.subtitleText, { fontStyle: 'italic' }]} themeColor="textSecondary">
              Hangouts you joined or organized across campus.
            </ThemedText>
          </View>

          {myEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={{ opacity: 0.5 }}>You haven't joined any events yet.</ThemedText>
            </View>
          ) : (
            <View style={styles.eventsGrid}>
              {myEvents.map((event) => (
                <View key={event.id} style={styles.joinedCard}>
                  <View style={styles.cardAccentLine} />
                  <View style={styles.cardMainBody}>
                    <ThemedText type="subtitle" style={styles.cardTitle}>{event.name}</ThemedText>
                    <ThemedText type="small" style={styles.cardMeta}>
                      {event.type} • Hosted by {event.host}
                    </ThemedText>
                    <ThemedText type="smallBold" style={styles.cardLocation}>📍 {event.location}</ThemedText>
                    <ThemedText type="small" style={styles.cardTime}>🕒 {event.time}</ThemedText>
                  </View>
                </View>
              ))}
            </View>
          )}

          {Platform.OS === 'web' && <WebBadge />}
        </ThemedView>
      </Animated.ScrollView>

      {/* Floating Action Creation Button (FAB) */}
      {!isCreating && (
        <TouchableOpacity 
          style={[styles.fabButton, { bottom: insets.bottom - 90 }]} 
          onPress={() => {
            viewFadeAnim.setValue(0.3); // Dim the background list context
            setIsCreating(true);
          }}
          activeOpacity={0.85}
        >
          <SymbolView
            name="plus.circle.fill"
            size={24}
            tintColor="#FFFFFF"
          />
          <ThemedText style={styles.fabText}>Host HERE!</ThemedText>
        </TouchableOpacity>
      )}

      {/* Creation Flow Overlay Workspace */}
      <Modal
        visible={isCreating}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setIsCreating(false);
          Animated.timing(viewFadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        }}
      >
        <ThemedView style={styles.modalWorkspace}>
          <SafeAreaView style={{ flex: 1 }}>
            
            {/* Modal Header Controls */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => {
                  setIsCreating(false);
                  Animated.timing(viewFadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
                }}
              >
                <ThemedText style={styles.cancelText}>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleCreateEvent}>
                <ThemedText style={[styles.doneText, !activityName && { opacity: 0.4 }]}>Create</ThemedText>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.formContainer}>
              
              {/* Event Properties Area */}
              <View style={styles.inputGroup}>
                <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>What is the activity name?</ThemedText>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., MA1511 Grind Session"
                  placeholderTextColor="#9CA3AF"
                  value={activityName}
                  onChangeText={setActivityName}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: Spacing.two }]}>
                  <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>Start Time</ThemedText>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., 14:00"
                    placeholderTextColor="#9CA3AF"
                    value={time}
                    onChangeText={setTime}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.two }]}>
                  <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>Duration</ThemedText>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., 2 hours"
                    placeholderTextColor="#9CA3AF"
                    value={duration}
                    onChangeText={setDuration}
                  />
                </View>
              </View>

              {/* Tag Category Picker */}
              <View style={styles.inputGroup}>
                <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>Select Event Type</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsContainer}>
                  {EVENT_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.tagItem, selectedType === type && styles.selectedTagItem]}
                      onPress={() => setSelectedType(type)}
                    >
                      <ThemedText style={[styles.tagText, selectedType === type && styles.selectedTagText]}>{type}</ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Map Selection Simulation Block */}
              <View style={styles.inputGroup}>
                <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>Pin Location on Campus Map</ThemedText>
                <View style={styles.miniMap}>
                  <ThemedText type="small" style={styles.mapPinIndicator}>📍 [ Select Campus Coordinates ]</ThemedText>
                </View>
              </View>

              {/* Descriptive details entry block */}
              <View style={styles.inputGroup}>
                <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>Location Description</ThemedText>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="e.g., UTown ERC Level 2, tables near the stairs"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                  value={locationDescription}
                  onChangeText={setLocationDescription}
                />
              </View>

            </ScrollView>
          </SafeAreaView>
        </ThemedView>
      </Modal>

      {/* Pop-up Overlay Feedback Alert Notification */}
      {showToast && (
        <Animated.View style={[styles.toastAlert, { opacity: toastOpacity }]}>
          <ThemedText style={styles.toastText}>🎉 Created successfully!</ThemedText>
        </Animated.View>
      )}

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  outerFrame: { flex: 1 },
  scrollView: { flex: 1 },
  container: { maxWidth: MaxContentWidth, width: '100%', alignSelf: 'center', paddingHorizontal: Spacing.four },
  headerBlock: { paddingVertical: Spacing.four, gap: Spacing.one },
  subtitleText: { fontSize: 14 },
  emptyContainer: { padding: Spacing.six, alignItems: 'center', justifyContent: 'center' },
  eventsGrid: { gap: Spacing.three, marginTop: Spacing.two },
  joinedCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: Spacing.three, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  cardAccentLine: { width: 5, backgroundColor: '#2563EB' },
  cardMainBody: { padding: Spacing.three, flex: 1, gap: 3 },
  cardTitle: { fontSize: 17, fontWeight: '700' },
  cardMeta: { fontSize: 12, color: '#6B7280' },
  cardLocation: { fontSize: 13, color: '#374151', marginTop: 2 },
  cardTime: { fontSize: 12, color: '#4B5563' },
  
  // Floating Action Trigger Style
  fabButton: { position: 'absolute', right: Spacing.four, flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5, zIndex: 99 },
  fabText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  
  // Custom Sheet Layout Styles
  modalWorkspace: { flex: 1, backgroundColor: '#F9FAFB' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  cancelText: { color: '#6B7280', fontSize: 16 },
  doneText: { color: '#2563EB', fontSize: 16, fontWeight: '700' },
  formContainer: { padding: Spacing.four, gap: Spacing.four },
  inputGroup: { gap: Spacing.two },
  fieldLabel: { fontSize: 14, color: '#374151' },
  textInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, fontSize: 15, color: '#111827' },
  rowInputs: { flexDirection: 'row' },
  tagsContainer: { gap: Spacing.two, paddingVertical: 4 },
  tagItem: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, borderRadius: 20, backgroundColor: '#E5E7EB' },
  selectedTagItem: { backgroundColor: '#2563EB' },
  tagText: { color: '#4B5563', fontSize: 13 },
  selectedTagText: { color: '#FFFFFF', fontWeight: '600' },
  miniMap: { height: 130, backgroundColor: '#D1D5DB', borderRadius: Spacing.two, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#9CA3AF' },
  mapPinIndicator: { color: '#4B5563', fontWeight: '500' },
  textArea: { minHeight: 70, textAlignVertical: 'top' },

  // Toast status alert box positioning styles
  toastAlert: { position: 'absolute', top: '45%', alignSelf: 'center', backgroundColor: 'rgba(17, 24, 39, 0.9)', paddingHorizontal: Spacing.five, paddingVertical: Spacing.three, borderRadius: Spacing.four, zIndex: 1000, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  toastText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 }
});