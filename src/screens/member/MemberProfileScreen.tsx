import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Modal, KeyboardAvoidingView, Platform } from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { useTheme } from "../../utils/ThemeContext";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { updateUserProfile, uploadAvatar } from "../../services/api";
import { setUserProfile } from "../../store/slices/userDetailsSlice";

export default function MemberProfileScreen() {
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.userDetails.userProfile);

  const [name, setName] = useState(profile?.name || "");
  const [mobile, setMobile] = useState(profile?.mobile || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      const res = await updateUserProfile({ name, mobile });
      if (res.success && res.data) {
        dispatch(setUserProfile(res.data));
        Alert.alert("Success", "Profile updated successfully.");
      } else {
        Alert.alert("Update Failed", res.message || "Failed to update details.");
      }
    } catch (err) {
      Alert.alert("Error", "Server update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleImagePicker = async (type: "camera" | "library") => {
    setImageModalVisible(false);
    const options = {
      mediaType: "photo" as const,
      quality: 0.8 as const,
      maxWidth: 600,
      maxHeight: 600,
    };

    const callback = async (response: any) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Error", "Picker Error: " + response.errorMessage);
        return;
      }

      const asset = response.assets?.[0];
      if (asset?.uri) {
        try {
          setUploading(true);
          const res = await uploadAvatar(asset.uri);
          if (res.success && res.data) {
            dispatch(setUserProfile(res.data));
            Alert.alert("Success", "Avatar updated successfully.");
          } else {
            Alert.alert("Upload Failed", res.message || "Image upload failed.");
          }
        } catch (err) {
          Alert.alert("Error", "Image upload failed.");
        } finally {
          setUploading(false);
        }
      }
    };

    if (type === "camera") {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
  };

  const avatarSource = profile?.profileImage
    ? { uri: profile.profileImage }
    : { uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png" };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        {...({ keyboardShouldPersistTaps: "handled" } as any)}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
        >
          {/* Avatar Box */}
      <View style={styles.avatarContainer}>
        <View style={styles.imageWrapper}>
          <Image source={avatarSource} style={styles.avatarImage} />
          {uploading && (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setImageModalVisible(true)}
          style={[styles.uploadBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.uploadBtnText}>CHANGE PHOTO</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Form */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Personal Details</Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Email Address</Text>
          <TextInput
            value={profile?.email}
            editable={false}
            style={[styles.input, styles.disabledInput, { color: colors.textMuted, backgroundColor: colors.background, borderColor: colors.border }]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Mobile Number</Text>
          <TextInput
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
          />
        </View>

        <TouchableOpacity
          onPress={handleUpdateProfile}
          disabled={saving}
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        >
          {saving ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Gym Subscription details */}
      {profile?.role === "Member" && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 20 }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Gym Subscription Details</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Active Plan:</Text>
            <Text style={[styles.detailValue, { color: colors.primary }]}>
              {profile.memberDetails?.plan || "Basic"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Status:</Text>
            <Text style={[
              styles.statusText,
              { color: profile.memberDetails?.status === "Active" ? colors.success : colors.accent }
            ]}>
              {profile.memberDetails?.status || "Active"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Expiry Date:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {profile.memberDetails?.expiryDate
                ? new Date(profile.memberDetails.expiryDate).toLocaleDateString()
                : "N/A"}
            </Text>
          </View>
        </View>
      )}

      {/* Custom Media Selection Picker Sheet */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setImageModalVisible(false)}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Select Profile Source</Text>

            <TouchableOpacity
              onPress={() => handleImagePicker("camera")}
              style={[styles.sheetBtn, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.sheetBtnText, { color: colors.text }]}>📸 Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleImagePicker("library")}
              style={[styles.sheetBtn, { borderBottomColor: colors.border }]}
            >
              <Text style={[styles.sheetBtnText, { color: colors.text }]}>🖼️ Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setImageModalVisible(false)}
              style={styles.cancelBtn}
            >
              <Text style={[styles.cancelBtnText, { color: colors.accent }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  imageWrapper: {
    position: "relative",
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 65,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadBtn: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadBtnText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "bold",
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  disabledInput: {
    opacity: 0.6,
  },
  saveBtn: {
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "bold",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  sheetBtn: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  sheetBtnText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  cancelBtn: {
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "bold",
  },
});
