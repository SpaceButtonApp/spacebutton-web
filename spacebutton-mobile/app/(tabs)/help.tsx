import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { BottomNav } from '@/components/BottomNav';
import { BackButton } from '@/components/BackButton';
import { Icon } from '@/components/Icons';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

const helpItems = [
  {
    icon: 'message-circle',
    title: 'Chat with Support',
    description: 'Get instant help from our team',
    action: 'chat',
  },
  {
    icon: 'mail',
    title: 'Email Support',
    description: 'support@spacebutton.com',
    action: 'email',
  },
  {
    icon: 'phone',
    title: 'Call Us',
    description: '+234 800 000 0000',
    action: 'phone',
  },
];

const faqItems = [
  {
    question: 'How do I post a listing?',
    answer: 'Tap the + button in the navigation bar to create a new listing. Fill in the property details and upload photos.',
  },
  {
    question: 'What are Connects?',
    answer: 'Connects allow you to contact property owners or interested tenants. Each connection uses one Connect.',
  },
  {
    question: 'How do I upgrade to Premium?',
    answer: 'Go to Settings > Premium to view and purchase premium plans for unlimited connects.',
  },
  {
    question: 'Is my information secure?',
    answer: 'Yes, we use industry-standard encryption to protect your data and never share your information without consent.',
  },
];

export default function HelpScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

  const handleAction = (action: string) => {
    switch (action) {
      case 'email':
        Linking.openURL('mailto:support@spacebutton.com');
        break;
      case 'phone':
        Linking.openURL('tel:+2348000000000');
        break;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: insets.top + Spacing.sm,
          },
        ]}
      >
        <BackButton fallbackUrl="/settings" />
        <Text style={[styles.title, { color: colors.foreground }]}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Options */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Contact Us
        </Text>
        {helpItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleAction(item.action)}
            style={[styles.helpItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.helpIcon, { backgroundColor: `${colors.primary}20` }]}>
              <Icon name={item.icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.helpContent}>
              <Text style={[styles.helpTitle, { color: colors.foreground }]}>
                {item.title}
              </Text>
              <Text style={[styles.helpDescription, { color: colors.mutedForeground }]}>
                {item.description}
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}

        {/* FAQ */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: Spacing.xl }]}>
          Frequently Asked Questions
        </Text>
        {faqItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
            style={[styles.faqItem, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.faqQuestion, { color: colors.foreground }]}>
                {item.question}
              </Text>
              <Icon
                name={expandedFaq === index ? 'chevron-down' : 'chevron-right'}
                size={20}
                color={colors.mutedForeground}
              />
            </View>
            {expandedFaq === index && (
              <Text style={[styles.faqAnswer, { color: colors.mutedForeground }]}>
                {item.answer}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.lg,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  helpIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    marginBottom: 2,
  },
  helpDescription: {
    fontSize: FontSize.sm,
  },
  faqItem: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    flex: 1,
    marginRight: Spacing.md,
  },
  faqAnswer: {
    fontSize: FontSize.sm,
    marginTop: Spacing.md,
    lineHeight: 22,
  },
});
