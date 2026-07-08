import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");

interface GalleryItem {
  url: string;
  category: string;
  title: string;
}

const GALLERY_IMAGES: GalleryItem[] = [
  { url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600", category: "gym", title: "Smart Machine Row" },
  { url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600", category: "strength", title: "Heavy Dumbbell Racks" },
  { url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600", category: "cardio", title: "Smart Treadmills Grid" },
  { url: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=600", category: "gym", title: "Main Exercise Deck" },
  { url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600", category: "cardio", title: "Cycling Spin Studio" },
  { url: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=600", category: "strength", title: "Barbell Bench Press Deck" },
  { url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600", category: "transformations", title: "Fat Burn Achievement" },
  { url: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=600", category: "transformations", title: "Muscle Hypertrophy Progress" },
  { url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800", category: "strength", title: "Weight Lifting" },
  { url: "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?q=80&w=800", category: "strength", title: "Dumbbell Workout" },
  { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800", category: "gym", title: "Personal Trainer" },
  { url: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=800", category: "transformations", title: "Female Athlete" },
  { url: "https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?q=80&w=800", category: "transformations", title: "Male Athlete" },
  { url: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?q=80&w=800", category: "gym", title: "Functional Training" },
  { url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800", category: "cardio", title: "Treadmill Zone" },
  { url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800", category: "cardio", title: "Yoga & Stretching" },
  { url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=800", category: "cardio", title: "Group Fitness" },
  { url: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=800", category: "strength", title: "Boxing Training" },
  { url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800", category: "gym", title: "Machine Workout" },
  { url: "https://images.unsplash.com/photo-1621293954908-907141467fc7?q=80&w=800", category: "gym", title: "Gym Reception" },
  { url: "https://images.unsplash.com/photo-1620138546344-7b2c08e5c6d3?q=80&w=800", category: "gym", title: "Locker Room" },
  { url: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=800", category: "gym", title: "Nutrition Corner" },
  { url: "https://images.unsplash.com/photo-1502904582529-0a151b6c376f?q=80&w=800", category: "transformations", title: "Motivational Scene" }
];

const CATEGORIES = [
  { id: "all", label: "Show All" },
  { id: "gym", label: "Gym Floor" },
  { id: "cardio", label: "Cardio Zone" },
  { id: "strength", label: "Strength & Weights" },
  { id: "transformations", label: "Transformations" }
];

export default function GalleryScreen() {
  const { colors } = useTheme();
  const [filter, setFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const filteredImages = filter === "all" ? GALLERY_IMAGES : GALLERY_IMAGES.filter(item => item.category === filter);

  const renderImageItem = useCallback(({ item }: { item: GalleryItem }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setSelectedImage(item)}
        style={[styles.imageWrapper, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover" />
        <View style={styles.overlay}>
          <Text style={[styles.imageTitle, { color: "#ffffff" }]} numberOfLines={1}>
            {item.title}
          </Text>
          <MaterialCommunityIcons name="magnify-plus-outline" size={20} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  }, [colors]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Horizontal Category Filters Bar */}
      <View style={[styles.filterWrapper, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {CATEGORIES.map((cat) => {
            const isActive = filter === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setFilter(cat.id)}
                style={[
                  styles.filterBtn,
                  {
                    backgroundColor: isActive ? colors.primary : colors.card,
                    borderColor: isActive ? colors.primary : colors.border
                  }
                ]}
              >
                <Text style={[styles.filterBtnText, { color: isActive ? "#000000" : colors.textMuted }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.container}>
        <FlatList
          data={filteredImages}
          keyExtractor={(item) => item.url}
          numColumns={2}
          contentContainerStyle={{ padding: 6, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          renderItem={renderImageItem}
        />

        {/* Premium Full-Screen Modal Preview */}
        <Modal
          visible={selectedImage !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedImage(null)}
        >
          <View style={styles.modalContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <SafeAreaView style={styles.modalSafeArea}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedImage(null)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="close" size={28} color="#ffffff" />
              </TouchableOpacity>
              
              {selectedImage && (
                <View style={styles.modalContent}>
                  <Image
                    source={{ uri: selectedImage.url }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                  <Text style={[styles.modalTitle, { color: colors.primary }]}>
                    {selectedImage.title}
                  </Text>
                  <Text style={[styles.modalCategory, { color: colors.textMuted }]}>
                    {selectedImage.category.toUpperCase()}
                  </Text>
                </View>
              )}
            </SafeAreaView>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterWrapper: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  filterContent: {
    paddingHorizontal: 12,
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
  container: {
    flex: 1,
  },
  imageWrapper: {
    width: (width - 24) / 2,
    height: 160,
    margin: 6,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  imageTitle: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalSafeArea: {
    flex: 1,
    width: "100%",
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 16,
    marginRight: 8,
    marginTop: 8,
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  modalImage: {
    width: width - 24,
    height: width - 24,
    borderRadius: 16,
  },
  modalTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  modalCategory: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
