import React, {useState, useRef } from 'react';
import { SymbolView } from 'expo-symbols';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, TextInput, View, Animated, Modal, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Region } from 'react-native-maps';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { addEvent } from '@/firebase/events';
import { getUserAvatar } from '@/firebase/users';

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
  const [expandedHangoutId, setExpandedHangoutId] = useState<string | null>(null);
  
  // Form State Fields
  const [activityName, setActivityName] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedType, setSelectedType] = useState('Studying');
  const [locationDescription, setLocationDescription] = useState('');
  
  // Coordinates for the new event
  const [eventCoordinates, setEventCoordinates] = useState<Region>({
    latitude: 1.2966,
    longitude: 103.7764,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Mock list of events the user has joined
  const [myEvents, setMyEvents] = useState([
    { id: 'j1', name: 'CS2100 Midterm Grind', type: 'Studying', location: 'COM1 SR1', time: '14:00 - 18:00', host: 'Alex Tan' },
    { id: 'j2', name: 'Board Games Night', type: 'Hangout', location: 'UTown ERC', time: '19:00 - 23:00', host: 'Sarah Wee' }
  ]);

  // Animated Hooks for screen Transitions & Toast status alert
  const viewFadeAnim = useRef(new Animated.Value(1)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const handleCreateEvent = async () => {
    if (!activityName) return;

    try {
      const avatar = await getUserAvatar() || 'dawg'; // fallback to dawg if not set

      await addEvent({
        title: activityName,
        category: 'Hangout', // Default category for now
        location: locationDescription,
        time: time,
        latitude: eventCoordinates.latitude,
        longitude: eventCoordinates.longitude,
        avatar: avatar
      }, "anonymous_user");

      const newEvent = {
        id: Math.random().toString(),
        name: activityName,
        type: 'Hangout',
        color: '#8B5CF6',
        time: time || 'TBD',
        location: locationDescription || 'Campus',
        host: 'Me'
      };
      setMyEvents([newEvent, ...myEvents]);

      // Clear form fields cleanly
      setActivityName('');
      setTime('');
      setDuration('');
      setLocationDescription('');

      // Trigger Success Banner Transition Sequence
      setShowToast(true);
      setIsCreating(false);
      Animated.sequence([
        Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(1800),
        Animated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true })
      ]).start(() => {
        setShowToast(false);
        // Fade back the screen text elegantly
        Animated.timing(viewFadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    } catch (error) {
      console.error(error);
    }
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
                <View key={event.id}>
                  <TouchableOpacity 
                    activeOpacity={0.7} 
                    onPress={() => setExpandedHangoutId(expandedHangoutId === event.id ? null : event.id)}
                  >
                    <View style={styles.joinedCard}>
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
                  </TouchableOpacity>

                  {/* Collapsible Detail Section */}
                  {expandedHangoutId === event.id && (
                    <View style={styles.expandedDetail}>
                      <View style={styles.expandedRow}>
                        <ThemedText type="defaultSemiBold" style={styles.expandedLabel}>📍 Location</ThemedText>
                        <ThemedText style={styles.expandedValue}>{event.location}</ThemedText>
                      </View>
                      <View style={styles.expandedRow}>
                        <ThemedText type="defaultSemiBold" style={styles.expandedLabel}>🕒 Time</ThemedText>
                        <ThemedText style={styles.expandedValue}>{event.time}</ThemedText>
                      </View>
                      <View style={styles.expandedRow}>
                        <ThemedText type="defaultSemiBold" style={styles.expandedLabel}>👤 Host</ThemedText>
                        <ThemedText style={styles.expandedValue}>{event.host}</ThemedText>
                      </View>
                      <View style={styles.expandedRow}>
                        <ThemedText type="defaultSemiBold" style={styles.expandedLabel}>🎯 Type</ThemedText>
                        <ThemedText style={styles.expandedValue}>{event.type}</ThemedText>
                      </View>
                      {/* Future: Anonymous chatroom section goes here */}
                    </View>
                  )}
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

              {/* Map Selection Simulation Block -> Replaced with real MapView */}
              <View style={styles.inputGroup}>
                <ThemedText type="defaultSemiBold" style={styles.fieldLabel}>Pin Location on Campus Map</ThemedText>
                <View style={styles.mapSelectorBox}>
                  <MapView
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    mapType="satellite"
                    initialRegion={eventCoordinates}
                    onRegionChangeComplete={setEventCoordinates}
                  />
                  <View style={styles.darkOverlay} pointerEvents="none" />
                  
                  {/* Fixed Center Pin */}
                  <View style={styles.centerPinContainer} pointerEvents="none">
                    <SymbolView name="mappin" size={32} tintColor="#EF4444" />
                  </View>
                  
                  <View style={styles.mapHintBadge}>
                    <ThemedText style={styles.mapHintText}>Drag map to pin location</ThemedText>
                  </View>
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
  modalContent: { flex: 1 },
  inputGroup: { gap: Spacing.four, marginBottom: Spacing.six },
  fieldLabel: { fontSize: 14, color: '#374151' },
  textInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, fontSize: 15, color: '#111827' },
  rowInputs: { flexDirection: 'row' },
  tagsContainer: { gap: Spacing.two, paddingVertical: 4 },
  tagItem: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, borderRadius: 20, backgroundColor: '#E5E7EB' },
  selectedTagItem: { backgroundColor: '#2563EB' },
  tagText: { color: '#4B5563', fontSize: 13 },
  selectedTagText: { color: '#FFFFFF', fontWeight: '600' },
  mapSelectorBox: {
    height: 180,
    backgroundColor: '#F3F4F6',
    borderRadius: Spacing.three,
    marginBottom: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  darkOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  centerPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32, // Offset for pin height so the tip points to center
    marginLeft: -16,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  mapHintBadge: {
    position: 'absolute',
    bottom: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 20,
  },
  mapHintText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  textArea: { minHeight: 70, textAlignVertical: 'top' },

  // Toast status alert box positioning styles
  toastAlert: { position: 'absolute', top: '45%', alignSelf: 'center', backgroundColor: 'rgba(17, 24, 39, 0.9)', paddingHorizontal: Spacing.five, paddingVertical: Spacing.three, borderRadius: Spacing.four, zIndex: 1000, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  toastText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },

  // Collapsible Detail Styles
  expandedDetail: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: Spacing.three,
    borderBottomRightRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  expandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandedLabel: {
    fontSize: 13,
    color: '#4B5563',
  },
  expandedValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
});