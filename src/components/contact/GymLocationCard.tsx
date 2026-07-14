import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { WebView } from "react-native-webview";

interface GymLocationCardProps {
  gymSettings: {
    gymName: string;
    address: string;
    mobile: string;
    whatsapp: string;
  };
}

export default function GymLocationCard({ gymSettings }: GymLocationCardProps) {
  const gymLat = 26.266999;
  const gymLng = 78.212097;
  const isValidCoords = typeof gymLat === "number" && typeof gymLng === "number" && !isNaN(gymLat) && !isNaN(gymLng);

  const handleGetDirections = () => {
    const mapsUrl = "https://maps.app.goo.gl/ZyUj4eMVYHLTKQkd6";
    Linking.openURL(mapsUrl).catch(() => {
      Alert.alert("Error", "Could not open Google Maps link.");
    });
  };

  const handleCall = () => {
    const cleanNum = gymSettings.mobile.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${cleanNum}`).catch(() => {
      Alert.alert("Error", "Could not launch phone dialer.");
    });
  };

  const handleWhatsApp = () => {
    const cleanNum = gymSettings.whatsapp.replace(/[^0-9]/g, "");
    Linking.openURL(`https://wa.me/${cleanNum}?text=Hello%20Forge%20Gym!`).catch(() => {
      Alert.alert("Error", "Could not open WhatsApp.");
    });
  };

  return (
    <View style={styles.container}>
      {/* Reach Out Header */}
      <View style={styles.headerBlock}>
        <Text style={styles.reachOutSpan}>Reach Out</Text>
        <Text style={styles.hqHeading}>HQ & Operating Hours</Text>
        <Text style={styles.hqSubtitle}>
          Drop by the gym floor for a tour. Our member support desks are open daily during our regular hours.
        </Text>
      </View>

      {/* Grid of 3 Cards: Address, Contacts, WhatsApp */}
      <View style={styles.cardsStack}>
        {/* Address Card */}
        <View style={styles.detailCard}>
          <Text style={styles.cardHeaderYellow}>📍 Address</Text>
          <Text style={styles.cardBodyText}>{gymSettings.address}</Text>
        </View>

        {/* Contacts Card */}
        <View style={styles.detailCard}>
          <Text style={styles.cardHeaderYellow}>📞 Contacts</Text>
          <Text style={styles.contactLabel}>Phone:</Text>
          <TouchableOpacity onPress={handleCall}>
            <Text style={styles.contactValueYellow}>{gymSettings.mobile}</Text>
          </TouchableOpacity>
          <Text style={[styles.contactLabel, { marginTop: 8 }]}>Email:</Text>
          <Text style={styles.cardBodyText}>support@forgegym.com</Text>
        </View>

        {/* WhatsApp Card */}
        <View style={[styles.detailCard, styles.whatsappCardBorder]}>
          <View style={styles.whatsappHeaderRow}>
            <MaterialCommunityIcons name="whatsapp" color="#25D366" size={20} />
            <Text style={styles.cardHeaderGreen}>WhatsApp</Text>
          </View>
          <Text style={[styles.cardBodyText, { marginBottom: 12 }]}>
            Chat directly with our support desk.
          </Text>
          <TouchableOpacity onPress={handleWhatsApp} style={styles.whatsappBtn}>
            <MaterialCommunityIcons name="whatsapp" color="#FFFFFF" size={16} />
            <Text style={styles.whatsappBtnText}>Start Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Opening Hours Table */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Opening Hours</Text>
        <View style={styles.hoursCard}>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursDay}>Monday - Friday</Text>
            <Text style={styles.hoursTime}>5:00 AM - 11:00 PM</Text>
          </View>
          <View style={styles.hoursRow}>
            <Text style={styles.hoursDay}>Saturday</Text>
            <Text style={styles.hoursTime}>6:00 AM - 10:00 PM</Text>
          </View>
          <View style={[styles.hoursRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.hoursDay}>Sunday</Text>
            <Text style={styles.hoursTime}>8:00 AM - 8:00 PM</Text>
          </View>
        </View>
      </View>

      {/* Find Our Gym Map Section */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Find Our Gym</Text>
        <Text style={styles.sectionSubtitle}>
          Drop by for a trial session or consult our elite trainers.
        </Text>
        <View style={styles.mapWrapper}>
          {Platform.OS === "android" ? (
            <WebView
              source={{ html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                  <style>
                    html, body {
                      margin: 0;
                      padding: 0;
                      width: 100%;
                      height: 100%;
                      background-color: #171717;
                    }
                    iframe {
                      width: 100%;
                      height: 100%;
                      border: none;
                    }
                  </style>
                </head>
                <body>
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3577.8355760587824!2d78.2120977803729!3d26.266999317831875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c11c74047d41%3A0xa8c5a70276f502e!2sFORGE%20Fitness%20%26%20Fuel!5e0!3m2!1sen!2sin!4v1783508398789!5m2!1sen!2sin" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </body>
                </html>
              ` }}
              style={styles.map}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              scalesPageToFit={true}
            />
          ) : isValidCoords ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: gymLat,
                longitude: gymLng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              zoomEnabled={true}
              scrollEnabled={true}
              rotateEnabled={true}
              pitchEnabled={true}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              <Marker
                coordinate={{ latitude: gymLat, longitude: gymLng }}
                title={gymSettings.gymName || "Forge Gym"}
                description={gymSettings.address}
                pinColor="#FFC107"
              />
            </MapView>
          ) : (
            <View style={styles.mapFallback}>
              <MaterialIcons name="map" color="#555" size={48} />
              <Text style={styles.fallbackText}>Map coordinates unavailable</Text>
            </View>
          )}
        </View>

        {/* Directions CTA Button */}
        <TouchableOpacity
          onPress={handleGetDirections}
          activeOpacity={0.8}
          style={styles.directionsBtn}
        >
          <Text style={styles.directionsText}>🗺️ GET DIRECTIONS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  headerBlock: {
    marginBottom: 24,
  },
  reachOutSpan: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFC107",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  hqHeading: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 6,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  hqSubtitle: {
    fontSize: 14,
    color: "#999999",
    lineHeight: 22,
  },
  cardsStack: {
    gap: 16,
    marginBottom: 32,
  },
  detailCard: {
    backgroundColor: "#171717",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333333",
    padding: 20,
  },
  whatsappCardBorder: {
    borderColor: "#25D366" + "30", // green tint border
  },
  cardHeaderYellow: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFC107",
    marginBottom: 8,
  },
  cardHeaderGreen: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#25D366",
  },
  whatsappHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  cardBodyText: {
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 20,
  },
  contactLabel: {
    fontSize: 11,
    color: "#666666",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  contactValueYellow: {
    fontSize: 14,
    color: "#FFC107",
    fontWeight: "bold",
    marginTop: 2,
    textDecorationLine: "underline",
  },
  whatsappBtn: {
    height: 40,
    backgroundColor: "#25D366",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  whatsappBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  sectionBlock: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#999999",
    marginTop: -8,
    marginBottom: 12,
  },
  hoursCard: {
    backgroundColor: "#171717",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333333",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  hoursDay: {
    fontSize: 14,
    color: "#CCCCCC",
    fontWeight: "500",
  },
  hoursTime: {
    fontSize: 14,
    color: "#FFC107",
    fontWeight: "bold",
  },
  mapWrapper: {
    height: 200,
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333333",
    backgroundColor: "#171717",
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    color: "#666666",
    fontSize: 12,
    marginTop: 8,
  },
  directionsBtn: {
    height: 52,
    backgroundColor: "#FFC107",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FFC107",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  directionsText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
