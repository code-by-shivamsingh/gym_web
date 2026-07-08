import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, LayoutAnimation, Platform, UIManager } from "react-native";
import { useTheme } from "../../utils/ThemeContext";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What are your gym timings?",
    answer: "We are open from 5:00 AM to 11:00 PM Monday through Friday, 6:00 AM to 10:00 PM on Saturdays, and 8:00 AM to 8:00 PM on Sundays.",
    category: "general"
  },
  {
    question: "Do you provide personal trainers?",
    answer: "Yes, our Premium and Elite membership plans include certified personal trainers. You can also book individual consultation slots via our trainers page.",
    category: "coaching"
  },
  {
    question: "Do I get a customized diet plan?",
    answer: "Yes, both Premium and Elite plans include fully customized diet and meal structures prepared by our certified nutritional consultants, retrievable directly from your member dashboard.",
    category: "nutrition"
  },
  {
    question: "Is there a free trial available?",
    answer: "Absolutely! New local residents can enjoy a free one-day trial workout pass to test our machines and locker amenities before signing up.",
    category: "general"
  },
  {
    question: "Do you have locker facilities?",
    answer: "Yes, smart keyless lockers and private changing stalls are provided to all active members at no extra cost.",
    category: "general"
  },
  {
    question: "Can I freeze or pause my membership subscription?",
    answer: "Yes, Elite membership plan holders can freeze their subscriptions once per calendar year for up to 30 days. Contact our front desk or support portal to register a freeze.",
    category: "membership"
  },
  {
    question: "What is your refund policy on membership signups?",
    answer: "Memberships are non-refundable after purchase, but you can cancel next month's auto-renewals anytime from your member billing settings.",
    category: "membership"
  },
  {
    question: "How do I download my payment invoice PDF?",
    answer: "Log into your Member Dashboard, navigate to the Payments section, and click 'Download PDF' on any of your billing logs to instantly obtain your invoice statement.",
    category: "membership"
  }
];

const CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "general", label: "General & Hours" },
  { id: "membership", label: "Memberships & Bills" },
  { id: "coaching", label: "Personal Training" },
  { id: "nutrition", label: "Diet & Nutrition" }
];

export default function FAQScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Filter FAQs based on query and category tabs
  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleInquireSupport = () => {
    if (navigation) {
      navigation.navigate("ContactWeb");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Search Input Box */}
      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="Search frequently asked questions..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={(txt) => {
            setSearchQuery(txt);
            setExpandedIndex(null);
          }}
          style={[styles.searchInput, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              setSearchQuery("");
              setExpandedIndex(null);
            }}
          >
            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "bold" }}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Category Selector */}
      <View style={[styles.filterWrapper, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  setActiveCategory(cat.id);
                  setExpandedIndex(null);
                }}
                activeOpacity={0.8}
                style={[
                  styles.filterBtn,
                  {
                    backgroundColor: isActive ? colors.primary : colors.card,
                    borderColor: isActive ? colors.primary : colors.border
                  }
                ]}
              >
                <Text style={[styles.filterBtnText, { color: isActive ? colors.black : colors.textMuted }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>HELP & SUPPORT</Text>
        <Text style={[styles.sectionHeading, { color: colors.text }]}>Frequently Asked Questions</Text>

        {filteredFaqs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No matching questions found</Text>
            <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
              Try refining your search keyword or switching the category tab filters.
            </Text>
          </View>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <View
                key={index}
                style={[
                  styles.faqBox,
                  {
                    backgroundColor: colors.card,
                    borderColor: isExpanded ? colors.primary : colors.border,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => toggleExpand(index)}
                  activeOpacity={0.7}
                  style={styles.headerBtn}
                >
                  <Text style={[styles.questionText, { color: colors.text }]}>{faq.question}</Text>
                  <Text style={[styles.signText, { color: colors.primary }]}>
                    {isExpanded ? "−" : "+"}
                  </Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={[styles.answerContainer, { borderTopColor: colors.border }]}>
                    <Text style={[styles.answerText, { color: colors.textMuted }]}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}

        {/* Live Support Inquiry CTA */}
        <View style={[styles.supportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.supportSubtitle, { color: colors.primary }]}>STILL HAVE QUESTIONS?</Text>
          <Text style={[styles.supportHeading, { color: colors.text }]}>Contact Live Support Desk</Text>
          <Text style={[styles.supportDesc, { color: colors.textMuted }]}>
            Our member service desk is available to help resolve technical billing queries or coach changes instantly.
          </Text>
          <TouchableOpacity
            onPress={handleInquireSupport}
            activeOpacity={0.8}
            style={[styles.supportBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.supportBtnText}>INQUIRE SUPPORT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    position: "relative",
  },
  searchInput: {
    height: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingRight: 60,
    fontSize: 14,
  },
  clearBtn: {
    position: "absolute",
    right: 32,
    top: 32,
  },
  filterWrapper: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginTop: 10,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 6,
    marginBottom: 20,
  },
  faqBox: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  headerBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
  },
  questionText: {
    fontSize: 15,
    fontWeight: "bold",
    flex: 1,
    paddingRight: 10,
    lineHeight: 20,
  },
  signText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  answerContainer: {
    borderTopWidth: 1,
    padding: 18,
    paddingTop: 12,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  supportCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    marginTop: 30,
    alignItems: "center",
  },
  supportSubtitle: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  supportHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 8,
  },
  supportDesc: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  supportBtn: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  supportBtnText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
