import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// ============================================================
// CONFIG - Update this to your server IP
// ============================================================
const API_BASE = 'http://192.168.1.100:3000'; // CHANGE THIS!

// ============================================================
// TYPES
// ============================================================
type Screen = 'home' | 'education' | 'checkStatus' | 'profile' | 'topic';

interface ClockStatus {
  status: 'not_clocked_in' | 'clocked_in' | 'completed';
  message: string;
  action: string;
  clockedInAt?: string;
}

// ============================================================
// THEME
// ============================================================
const colors = {
  primary: '#6366F1',    // Indigo
  secondary: '#8B5CF6',  // Purple
  success: '#10B981',    // Green
  warning: '#F59E0B',    // Amber
  danger: '#EF4444',     // Red
  dark: '#1F2937',
  gray: '#6B7280',
  lightGray: '#E5E7EB',
  white: '#FFFFFF',
  background: '#F9FAFB',
  card: '#FFFFFF',
};

const { width } = Dimensions.get('window');

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [clockStatus, setClockStatus] = useState<ClockStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchRef, setSearchRef] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [education, setEducation] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [faq, setFaq] = useState<any[]>([]);

  // Demo user - in production, get from auth
  const user = {
    name: 'Ahmed Al Mansoori',
    position: 'Software Engineer',
    entity: 'TechCorp UAE',
    employeeId: 'EMP-001',
  };

  useEffect(() => {
    loadClockStatus();
    loadEducation();
  }, []);

  const loadClockStatus = async () => {
    // Simulate clock status
    setClockStatus({
      status: 'not_clocked_in',
      message: 'Ready to start your day',
      action: 'Clock In',
    });
  };

  const loadEducation = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/education/overview`);
      if (res.ok) {
        const data = await res.json();
        setEducation(data);
      }
    } catch (e) {
      console.log('Education load failed - using demo data');
      setEducation({
        sections: [
          { id: 'uae-labor-law', title: '📚 UAE Labor Law', topicCount: 7 },
          { id: 'tips-guides', title: '💡 Tips & Guides', topicCount: 4 },
          { id: 'faq', title: '❓ FAQ', topicCount: 8 },
        ],
      });
    }
  };

  const handleClock = async () => {
    setLoading(true);
    // Simulate clock action
    setTimeout(() => {
      if (clockStatus?.status === 'not_clocked_in') {
        setClockStatus({
          status: 'clocked_in',
          message: 'Clocked in at ' + new Date().toLocaleTimeString(),
          action: 'Clock Out',
          clockedInAt: new Date().toISOString(),
        });
      } else if (clockStatus?.status === 'clocked_in') {
        setClockStatus({
          status: 'completed',
          message: 'Great work today! 8h 15m',
          action: 'Done',
        });
      }
      setLoading(false);
    }, 1000);
  };

  const handleCheckStatus = async () => {
    if (!searchRef.trim()) {
      Alert.alert('Error', 'Please enter a reference number');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/portal/check-status/${searchRef}`);
      const data = await res.json();
      setSearchResult(data);
    } catch (e) {
      // Demo fallback
      setSearchResult({
        found: true,
        type: 'leave',
        reference: searchRef,
        status: { code: 'pending', label: 'Pending Approval', color: '#F59E0B' },
        details: {
          type: 'Annual Leave',
          startDate: '2026-02-10',
          endDate: '2026-02-14',
          submittedAt: '2026-02-01',
        },
      });
    }
    setLoading(false);
  };

  const loadTopic = async (topicId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/education/uae-labor-law/${topicId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTopic(data);
        setScreen('topic');
      }
    } catch (e) {
      // Demo topic
      setSelectedTopic({
        id: topicId,
        title: '📚 Topic Details',
        content: 'Content would load from server...',
      });
      setScreen('topic');
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClockStatus();
    setRefreshing(false);
  };

  // ============================================================
  // RENDER SCREENS
  // ============================================================

  const renderHome = () => (
    <ScrollView
      style={styles.scrollView}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Pass Card */}
      <View style={styles.passCard}>
        <View style={styles.passHeader}>
          <View style={styles.entityBadge}>
            <Text style={styles.entityText}>{user.entity}</Text>
          </View>
          <Ionicons name="qr-code" size={24} color={colors.white} />
        </View>

        <View style={styles.passBody}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userPosition}>{user.position}</Text>
          <Text style={styles.employeeId}>{user.employeeId}</Text>
        </View>

        {/* Stage Indicator */}
        <View style={styles.stageContainer}>
          <View style={styles.stageLine}>
            <View style={[styles.stageDot, styles.stageDotActive]} />
            <View style={[styles.stageTrack, styles.stageTrackActive]} />
            <View style={[styles.stageDot, styles.stageDotActive]} />
            <View style={[styles.stageTrack, styles.stageTrackActive]} />
            <View style={[styles.stageDot, styles.stageDotActive]} />
            <View style={styles.stageTrack} />
            <View style={styles.stageDot} />
          </View>
          <Text style={styles.stageLabel}>Stage: Confirmed</Text>
        </View>
      </View>

      {/* Clock Widget */}
      <View style={styles.clockWidget}>
        <View style={styles.clockInfo}>
          <Ionicons
            name={clockStatus?.status === 'clocked_in' ? 'time' : 'finger-print'}
            size={32}
            color={clockStatus?.status === 'clocked_in' ? colors.success : colors.primary}
          />
          <View style={styles.clockText}>
            <Text style={styles.clockAction}>{clockStatus?.action || 'Clock In'}</Text>
            <Text style={styles.clockMessage}>{clockStatus?.message}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.clockButton,
            clockStatus?.status === 'clocked_in' && styles.clockButtonOut,
            clockStatus?.status === 'completed' && styles.clockButtonDone,
          ]}
          onPress={handleClock}
          disabled={loading || clockStatus?.status === 'completed'}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.clockButtonText}>
              {clockStatus?.status === 'completed' ? '✓' : 'TAP'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Links */}
      <Text style={styles.sectionTitle}>Quick Links</Text>
      <View style={styles.quickLinks}>
        {[
          { icon: 'calendar', label: 'Leave', color: colors.primary },
          { icon: 'document-text', label: 'Documents', color: colors.secondary },
          { icon: 'time', label: 'Attendance', color: colors.success },
          { icon: 'book', label: 'Policies', color: colors.warning },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.quickLink}>
            <View style={[styles.quickLinkIcon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={24} color={item.color} />
            </View>
            <Text style={styles.quickLinkLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Cards */}
      <View style={styles.actionCards}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setScreen('checkStatus')}
        >
          <Ionicons name="search" size={28} color={colors.primary} />
          <Text style={styles.actionCardTitle}>Check Status</Text>
          <Text style={styles.actionCardDesc}>Track your requests</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setScreen('education')}
        >
          <Ionicons name="school" size={28} color={colors.secondary} />
          <Text style={styles.actionCardTitle}>Learn</Text>
          <Text style={styles.actionCardDesc}>UAE Labor Law</Text>
        </TouchableOpacity>
      </View>

      {/* View Profile Button */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => setScreen('profile')}
      >
        <Ionicons name="person-circle" size={24} color={colors.gray} />
        <Text style={styles.profileButtonText}>View Full Profile</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.gray} />
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderEducation = () => (
    <ScrollView style={styles.scrollView}>
      <Text style={styles.pageTitle}>📚 Employee Education</Text>
      <Text style={styles.pageSubtitle}>Learn about your rights and best practices</Text>

      {/* UAE Labor Law Topics */}
      <Text style={styles.sectionTitle}>UAE Labor Law</Text>
      {[
        { id: 'working-hours', icon: '⏰', title: 'Working Hours', quiz: true },
        { id: 'annual-leave', icon: '🏖️', title: 'Annual Leave', quiz: true },
        { id: 'sick-leave', icon: '🏥', title: 'Sick Leave', quiz: true },
        { id: 'maternity-paternity', icon: '👶', title: 'Maternity & Paternity', quiz: true },
        { id: 'end-of-service', icon: '💰', title: 'End of Service', quiz: true },
        { id: 'notice-period', icon: '📝', title: 'Notice Period' },
        { id: 'probation', icon: '🆕', title: 'Probation Period' },
      ].map((topic) => (
        <TouchableOpacity
          key={topic.id}
          style={styles.topicCard}
          onPress={() => loadTopic(topic.id)}
        >
          <Text style={styles.topicIcon}>{topic.icon}</Text>
          <View style={styles.topicInfo}>
            <Text style={styles.topicTitle}>{topic.title}</Text>
            {topic.quiz && (
              <View style={styles.quizBadge}>
                <Text style={styles.quizBadgeText}>Quiz</Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        </TouchableOpacity>
      ))}

      {/* Tips & FAQ */}
      <Text style={styles.sectionTitle}>Tips & Guides</Text>
      {[
        { icon: '🕐', title: 'Clock In/Out Tips' },
        { icon: '🏖️', title: 'Leave Request Best Practices' },
        { icon: '📄', title: 'Document Request Guide' },
      ].map((tip, i) => (
        <TouchableOpacity key={i} style={styles.topicCard}>
          <Text style={styles.topicIcon}>{tip.icon}</Text>
          <Text style={styles.topicTitle}>{tip.title}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.gray} />
        </TouchableOpacity>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderCheckStatus = () => (
    <ScrollView style={styles.scrollView}>
      <Text style={styles.pageTitle}>🔍 Check Request Status</Text>
      <Text style={styles.pageSubtitle}>Enter your reference number to track</Text>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="e.g., LV-202402-0001"
          value={searchRef}
          onChangeText={setSearchRef}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleCheckStatus}>
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Ionicons name="search" size={24} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>

      {searchResult && (
        <View style={styles.resultCard}>
          {searchResult.found ? (
            <>
              <View style={styles.resultHeader}>
                <Text style={styles.resultRef}>{searchResult.reference}</Text>
                <View style={[styles.statusBadge, { backgroundColor: searchResult.status?.color || colors.warning }]}>
                  <Text style={styles.statusText}>{searchResult.status?.label}</Text>
                </View>
              </View>
              <View style={styles.resultDetails}>
                <Text style={styles.resultType}>{searchResult.details?.type}</Text>
                <Text style={styles.resultDates}>
                  {searchResult.details?.startDate} → {searchResult.details?.endDate}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.notFound}>
              <Ionicons name="alert-circle" size={48} color={colors.warning} />
              <Text style={styles.notFoundText}>{searchResult.message}</Text>
            </View>
          )}
        </View>
      )}

      <Text style={styles.hint}>
        💡 Reference numbers start with LV (leave) or REQ (documents)
      </Text>
    </ScrollView>
  );

  const renderProfile = () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {user.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profilePosition}>{user.position}</Text>
        <Text style={styles.profileEntity}>{user.entity}</Text>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Employment</Text>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Employee ID</Text>
          <Text style={styles.profileValue}>{user.employeeId}</Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Department</Text>
          <Text style={styles.profileValue}>Engineering</Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Join Date</Text>
          <Text style={styles.profileValue}>Jan 15, 2024</Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Status</Text>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Active</Text>
          </View>
        </View>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Leave Balance</Text>
        <View style={styles.leaveGrid}>
          {[
            { type: 'Annual', used: 5, total: 30 },
            { type: 'Sick', used: 2, total: 15 },
            { type: 'Personal', used: 0, total: 3 },
          ].map((leave, i) => (
            <View key={i} style={styles.leaveCard}>
              <Text style={styles.leaveType}>{leave.type}</Text>
              <Text style={styles.leaveCount}>{leave.total - leave.used}</Text>
              <Text style={styles.leaveLabel}>days left</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.shareButton}>
        <Ionicons name="share-social" size={20} color={colors.primary} />
        <Text style={styles.shareButtonText}>Share Business Card</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderTopic = () => (
    <ScrollView style={styles.scrollView}>
      <Text style={styles.pageTitle}>{selectedTopic?.title || 'Topic'}</Text>
      <View style={styles.topicContent}>
        <Text style={styles.topicContentText}>
          {selectedTopic?.content || 'Loading content...'}
        </Text>
      </View>

      {selectedTopic?.quiz && (
        <TouchableOpacity style={styles.quizButton}>
          <Ionicons name="help-circle" size={24} color={colors.white} />
          <Text style={styles.quizButtonText}>Take Quiz</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {screen !== 'home' && (
            <TouchableOpacity onPress={() => setScreen('home')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.dark} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>
            {screen === 'home' ? 'HR Pass' : 
             screen === 'education' ? 'Learn' :
             screen === 'checkStatus' ? 'Check Status' :
             screen === 'profile' ? 'My Profile' : 'Details'}
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={24} color={colors.dark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {screen === 'home' && renderHome()}
        {screen === 'education' && renderEducation()}
        {screen === 'checkStatus' && renderCheckStatus()}
        {screen === 'profile' && renderProfile()}
        {screen === 'topic' && renderTopic()}

        {/* Bottom Nav */}
        <View style={styles.bottomNav}>
          {[
            { screen: 'home' as Screen, icon: 'home', label: 'Home' },
            { screen: 'education' as Screen, icon: 'school', label: 'Learn' },
            { screen: 'checkStatus' as Screen, icon: 'search', label: 'Status' },
            { screen: 'profile' as Screen, icon: 'person', label: 'Profile' },
          ].map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={styles.navItem}
              onPress={() => setScreen(item.screen)}
            >
              <Ionicons
                name={screen === item.screen ? item.icon : `${item.icon}-outline` as any}
                size={24}
                color={screen === item.screen ? colors.primary : colors.gray}
              />
              <Text style={[
                styles.navLabel,
                screen === item.screen && styles.navLabelActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark,
  },
  headerRight: {
    width: 32,
  },

  // Pass Card
  passCard: {
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    padding: 20,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  entityBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  entityText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  passBody: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  userPosition: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  employeeId: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  stageContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  stageLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  stageDotActive: {
    backgroundColor: colors.white,
  },
  stageTrack: {
    width: 40,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  stageTrackActive: {
    backgroundColor: colors.white,
  },
  stageLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },

  // Clock Widget
  clockWidget: {
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  clockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockText: {
    marginLeft: 12,
  },
  clockAction: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
  },
  clockMessage: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  clockButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockButtonOut: {
    backgroundColor: colors.danger,
  },
  clockButtonDone: {
    backgroundColor: colors.success,
  },
  clockButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // Quick Links
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginTop: 24,
    marginBottom: 12,
  },
  quickLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickLink: {
    alignItems: 'center',
    width: (width - 48) / 4,
  },
  quickLinkIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickLinkLabel: {
    fontSize: 12,
    color: colors.gray,
  },

  // Action Cards
  actionCards: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginTop: 12,
  },
  actionCardDesc: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
  },

  // Profile Button
  profileButton: {
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: colors.gray,
  },

  // Page Headers
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.dark,
    marginTop: 16,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 4,
    marginBottom: 24,
  },

  // Topic Cards
  topicCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  topicInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.dark,
  },
  quizBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  quizBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },

  // Search
  searchBox: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  searchButton: {
    width: 52,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultRef: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  resultDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  resultType: {
    fontSize: 14,
    color: colors.gray,
  },
  resultDates: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.dark,
    marginTop: 4,
  },
  notFound: {
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 12,
    textAlign: 'center',
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    color: colors.gray,
    textAlign: 'center',
  },

  // Profile Screen
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.white,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.dark,
  },
  profilePosition: {
    fontSize: 16,
    color: colors.gray,
    marginTop: 4,
  },
  profileEntity: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
  },
  profileSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  profileSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  profileLabel: {
    fontSize: 14,
    color: colors.gray,
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.dark,
  },
  activeBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  leaveGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  leaveCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  leaveType: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  leaveCount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  leaveLabel: {
    fontSize: 10,
    color: colors.gray,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // Topic Content
  topicContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  topicContentText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.dark,
  },
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 8,
  },
  quizButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },

  // Bottom Nav
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingBottom: 8,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 4,
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
