import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, Alert, Linking, Image, ScrollView, TextInput, Dimensions, AppState, AppStateStatus } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { useAppSelector } from "../../store/hooks";
import { getPayments, createPaymentOrder, verifyPayment, getMembershipPlans, BASE_URL, cancelPayment } from "../../services/api";
import * as Keychain from "react-native-keychain";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");

interface Payment {
  _id: string;
  orderId: string;
  paymentId?: string;
  invoiceNumber?: string;
  amount: number;
  method: string;
  status: "Pending" | "Completed" | "Failed" | "Cancelled";
  plan: string;
  transactionId: string;
  createdAt: string;
}

export default function MemberPaymentsScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const userProfile = useAppSelector((state) => state.userDetails.userProfile);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("latest");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Checkout Sheet States
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success' | 'failed' | 'awaiting_payment'>('idle');
  const [activeTxn, setActiveTxn] = useState<any>(null);
  
  // Processing Animation Checkpoints
  const [processingStep, setProcessingStep] = useState(0);
  const processingIntervalRef = useRef<any>(null);

  const processingStages = [
    "Checking Payment Parameters...",
    "Connecting Secure Banking Servers...",
    "Encrypting Transaction Packet...",
    "Processing Gateway Authorization...",
    "Verifying Cryptographic Signatures..."
  ];

  // Auto-progress stages during processing to avoid static screens
  useEffect(() => {
    if (paymentState === 'processing') {
      if (processingStep < 4) {
        setProcessingStep(0);
        processingIntervalRef.current = setInterval(() => {
          setProcessingStep((prev) => (prev < 3 ? prev + 1 : prev));
        }, 1500);
      }
    } else {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
        processingIntervalRef.current = null;
      }
    }
    return () => {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
      }
    };
  }, [paymentState]);

  const upiUrl = activeTxn?.upiUrl || null;
  const qrCodeBase64 = activeTxn?.qrCodeBase64 || null;
  const [dbPlans, setDbPlans] = useState<any[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await getMembershipPlans();
        if (res.success && res.data) {
          setDbPlans(res.data);
          const defaultPlan = res.data.find((p: any) => p.name === "Premium") || res.data[0];
          if (defaultPlan) {
            setSelectedPlan(defaultPlan);
          }
        }
      } catch (err) {
        console.warn("[FRONTEND] Error loading DB plans:", err);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    if (route?.params?.plan && dbPlans.length > 0) {
      const planName = route.params.plan;
      const matched = dbPlans.find((tier) => tier.name.toLowerCase() === planName.toLowerCase());
      if (matched) {
        setSelectedPlan(matched);
        setCheckoutVisible(true);
        if (navigation) {
          navigation.setParams({ plan: undefined });
        }
      }
    }
  }, [route?.params?.plan, dbPlans, navigation]);

  // Prevent old QR/UPI payment state from being reused when plan changes
  useEffect(() => {
    setActiveTxn(null);
    if (paymentState === 'awaiting_payment') {
      setPaymentState('idle');
    }
  }, [selectedPlan]);

  // AppState foreground listener for auto-verification on return
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && paymentState === "awaiting_payment" && activeTxn) {
        console.log("[FRONTEND] App returned to active. Auto-verifying order:", activeTxn._id);
        try {
          const verifyRes = await verifyPayment(activeTxn._id);
          if (verifyRes.success && verifyRes.data && verifyRes.data.status === 'Completed') {
            setActiveTxn(verifyRes.data);
            setPaymentState('success');
            fetchPayments();
          }
        } catch (err) {
          console.warn("[FRONTEND] Background verification error:", err);
        }
      }
    };
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [paymentState, activeTxn]);

  // Deep link payment callback handler
  useEffect(() => {
    const handleDeepLinkPayment = async () => {
      const { orderId, paymentStatus, amount, membershipPlan } = route?.params || {};
      if (orderId && paymentStatus) {
        console.log("[FRONTEND] Deep link payment parameters detected:", orderId, paymentStatus);
        
        const isSuccess = paymentStatus === 'Completed' || paymentStatus === 'success';
        if (isSuccess) {
          setLoading(true);
          try {
            const verifyRes = await verifyPayment(orderId);
            if (verifyRes.success) {
              Alert.alert(
                "Payment Success! ✅",
                `Your renewal payment of ₹${amount || verifyRes.data.amount} for the ${membershipPlan || verifyRes.data.plan} plan has been processed successfully. Membership activated!`,
                [{ text: "OK", onPress: () => { fetchPayments(); } }]
              );
            } else {
              Alert.alert("Verification Failed ❌", verifyRes.message || "We could not verify your payment status.");
            }
          } catch (err) {
            console.warn(err);
            Alert.alert("Verification Error", "An error occurred during payment verification.");
          } finally {
            setLoading(false);
            // Reset navigation params to prevent repetitive alerts
            navigation.setParams({ orderId: undefined, paymentStatus: undefined });
          }
        } else {
          Alert.alert(
            "Payment Cancelled / Failed ❌",
            "The subscription payment transaction was declined or cancelled. Please try again.",
            [{ text: "OK", onPress: () => { fetchPayments(); } }]
          );
          // Reset navigation params
          navigation.setParams({ orderId: undefined, paymentStatus: undefined });
        }
      }
    };
    handleDeepLinkPayment();
  }, [route?.params?.orderId, route?.params?.paymentStatus]);

  const fetchPayments = async () => {
    try {
      const res = await getPayments();
      if (res.success && res.data) {
        setPayments(res.data);
      }
    } catch (err) {
      console.warn("Failed fetching payments:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const handleSelectPlan = (planDoc: any) => {
    setSelectedPlan(planDoc);
  };

  const handleOpenCheckout = () => {
    if (!selectedPlan) {
      Alert.alert("Selection Needed", "Please select a membership plan to renew.");
      return;
    }
    setPaymentState('idle');
    setActiveTxn(null);
    setCheckoutVisible(true);
  };

  // Dynamic Payment Calculations (GST + Discount balancing)
  const getInvoiceBreakdown = () => {
    const total = selectedPlan?.price || 0;
    const gstRate = 0.18;
    const discountRate = 0.05;
    
    // Calculate subtotal and discount based on the target total
    const subtotal = Math.round(total / (1 + gstRate - discountRate));
    const discountAmount = Math.round(subtotal * discountRate);
    
    // Balance GST so that subtotal + gstAmount - discountAmount = total exactly
    const gstAmount = total - subtotal + discountAmount;
    
    return {
      subtotal,
      gstAmount,
      discountAmount,
      total
    };
  };

  const executePaymentFlow = async (methodName: string) => {
    let isFlowFinished = false;

    // Safety timeout: If payment gateway fails to redirect or respond within 15 seconds
    const gatewayTimeout = setTimeout(() => {
      if (!isFlowFinished) {
        console.warn("[PAYMENT FLOW] Gateway response timeout hit (15s). Resetting loader.");
        setSubmitting(false);
        setPaymentState('failed');
        Alert.alert(
          "Gateway Timeout",
          "The payment gateway took too long to initialize. Please check your network connection and try again."
        );
      }
    }, 15000);

    const cleanupTimeout = () => {
      isFlowFinished = true;
      clearTimeout(gatewayTimeout);
    };

    try {
      console.log(`[PAYMENT FLOW] 🚀 Initiating payment flow for method: ${methodName}`);
      setSubmitting(true);
      setProcessingStep(0);
      setPaymentState('processing');

      // 1. Create order record on the backend (handles Stripe/Razorpay/PhonePe or local Sandbox)
      console.log(`[PAYMENT FLOW] Calling API: createPaymentOrder | Plan: ${selectedPlan?.name} | Price: ${selectedPlan?.price}`);
      const res = await createPaymentOrder(selectedPlan.price, methodName, selectedPlan.name, selectedPlan._id);
      console.log(`[PAYMENT FLOW] API Response received from createPaymentOrder:`, res);
      
      if (!res.success || !res.data) {
        cleanupTimeout();
        setPaymentState('failed');
        Alert.alert("Checkout Blocked", res.message || "Failed to initialize secure checkout order.");
        setSubmitting(false);
        return;
      }

      const orderData = res.data;
      setActiveTxn({
        ...orderData,
        upiUrl: res.upiUrl,
        qrCodeBase64: res.qrCodeBase64,
        paymentUrl: res.paymentUrl
      });

      // 2. Route payment method execution
      const paymentUrl = res.paymentUrl;
      const upiUrl = res.upiUrl;

      if (methodName.startsWith('UPI Intent -') && upiUrl) {
        // Direct UPI app redirection (intent)
        try {
          console.log(`[PAYMENT FLOW] Verifying deep link capabilities for UPI Intent: ${upiUrl}`);
          const canOpen = await Linking.canOpenURL(upiUrl);
          console.log(`[PAYMENT FLOW] Linking.canOpenURL returned: ${canOpen}`);
          
          if (canOpen) {
            cleanupTimeout();
            console.log(`[PAYMENT FLOW] Redirection trigger: Opening intent UPI URL: ${upiUrl}`);
            await Linking.openURL(upiUrl);
          } else {
            // UPI Intent scheme not supported (e.g. emulator). Fallback to web checkout.
            console.warn(`[PAYMENT FLOW] UPI Intent not supported on device. Prompting fallback web checkout.`);
            Alert.alert(
              "UPI App Not Found",
              "No supported UPI applications were found on this device. Would you like to use the hosted web checkout instead?",
              [
                {
                  text: "Use Web Checkout",
                  onPress: async () => {
                    cleanupTimeout();
                    if (paymentUrl) {
                      try {
                        console.log(`[PAYMENT FLOW] Fallback redirect: Opening URL: ${paymentUrl}`);
                        await Linking.openURL(paymentUrl);
                      } catch (err) {
                        console.error("[PAYMENT FLOW] Error opening fallback URL:", err);
                      } finally {
                        setPaymentState('awaiting_payment');
                        setSubmitting(false);
                      }
                    } else {
                      Alert.alert("Error", "Web checkout URL is not available.");
                      setPaymentState('idle');
                    }
                  }
                },
                {
                  text: "Cancel",
                  onPress: () => {
                    cleanupTimeout();
                    setPaymentState('idle');
                  },
                  style: "cancel"
                }
              ]
            );
            setSubmitting(false);
            return;
          }
        } catch (linkErr) {
          console.warn("[FRONTEND] Intent redirection failed, falling back to web checkout:", linkErr);
          if (paymentUrl) {
            cleanupTimeout();
            await Linking.openURL(paymentUrl);
          } else {
            cleanupTimeout();
            setPaymentState('failed');
            Alert.alert("Redirection Error", "Failed to launch payment checkout.");
            setSubmitting(false);
            return;
          }
        }
      } else if (methodName === 'UPI QR Code') {
        // For QR Code, we don't open any external web page immediately.
        // We let the user scan the QR code rendered directly in-app.
        cleanupTimeout();
        console.log("[FRONTEND] UPI QR Code order created. Showing code in-app.");
      } else if (paymentUrl) {
        // Fallback for regular gateway checkouts or sandbox web pages
        try {
          console.log(`[PAYMENT FLOW] Verifying deep link capabilities for Web Checkout: ${paymentUrl}`);
          const canOpen = await Linking.canOpenURL(paymentUrl);
          cleanupTimeout();
          if (canOpen) {
            console.log(`[PAYMENT FLOW] Redirection trigger: Opening payment gateway page: ${paymentUrl}`);
            await Linking.openURL(paymentUrl);
          } else {
            console.log(`[PAYMENT FLOW] Hosted redirect fallback: Launching browser directly for URL: ${paymentUrl}`);
            Alert.alert("Hosted Checkout", "Opening payment gateway in web browser.");
            await Linking.openURL(paymentUrl);
          }
        } catch (webErr) {
          cleanupTimeout();
          console.warn("[FRONTEND] Web redirect failed:", webErr);
          await Linking.openURL(paymentUrl);
        }
      } else {
        cleanupTimeout();
        setPaymentState('failed');
        Alert.alert("Error", "Payment Gateway failed to issue a secure transaction session.");
        setSubmitting(false);
        return;
      }

      // 3. Set UI to awaiting_payment state
      setPaymentState('awaiting_payment');
      setSubmitting(false);
    } catch (err) {
      cleanupTimeout();
      setSubmitting(false);
      setPaymentState('failed');
      console.error("[PAYMENT FLOW] Create Order Error caught:", err);
      Alert.alert("Network Exception", "Failed to initiate payment gateway.");
    }
  };

  const handleCancelPayment = async () => {
    if (activeTxn) {
      try {
        console.log(`[PAYMENT FLOW] Cancelling payment session for order: ${activeTxn._id}`);
        await cancelPayment(activeTxn._id);
      } catch (err) {
        console.warn("Cancel order request failed:", err);
      }
    }
    setPaymentState('idle');
    setActiveTxn(null);
  };

  const handleVerifyPayment = async () => {
    if (!activeTxn) return;
    try {
      console.log(`[PAYMENT FLOW] Starting payment status verification for Order: ${activeTxn._id}`);
      setSubmitting(true);
      setPaymentState('processing');
      setProcessingStep(4); // "Verifying Cryptographic Signatures..." stage

      console.log(`[PAYMENT FLOW] Calling API: verifyPayment | Order ID: ${activeTxn._id}`);
      const verifyRes = await verifyPayment(activeTxn._id);
      console.log(`[PAYMENT FLOW] API Response received from verifyPayment:`, verifyRes);
      
      setSubmitting(false);

      if (verifyRes.success && verifyRes.data) {
        if (verifyRes.data.status === 'Completed') {
          setActiveTxn(verifyRes.data);
          setPaymentState('success');
          fetchPayments();
        } else {
          setPaymentState('awaiting_payment');
          Alert.alert("Verification Pending", "The payment is still pending approval from the gateway. Please complete the transaction and try again.");
        }
      } else {
        setPaymentState('awaiting_payment');
        Alert.alert("Payment Unverified", verifyRes.message || "Payment status check failed. Please ensure payment was completed.");
      }
    } catch (err) {
      setSubmitting(false);
      setPaymentState('awaiting_payment');
      console.error("[PAYMENT FLOW] Payment verification error caught:", err);
      Alert.alert("Verification Error", "Verification server is temporarily unreachable. Please retry shortly.");
    }
  };

  const handlePayViaQr = () => {
    setCheckoutVisible(false);
    executePaymentFlow('UPI QR Code');
  };

  const handlePayViaUpiApp = (appName: string) => {
    setCheckoutVisible(false);
    executePaymentFlow(`UPI Intent - ${appName.toUpperCase()}`);
  };

  const handleDownloadInvoice = (paymentId: string, transactionId: string) => {
    Alert.alert(
      "Download Invoice",
      `Would you like to download Invoice-${transactionId}.pdf?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Download",
          onPress: async () => {
            try {
              const credentials = await Keychain.getGenericPassword({
                service: "user_session",
              });
              const token = credentials ? credentials.password : "";
              const downloadUrl = `${BASE_URL}/api/invoices/${paymentId}?token=${encodeURIComponent(token)}`;

              try {
                const supported = await Linking.canOpenURL(downloadUrl);
                if (supported) {
                  await Linking.openURL(downloadUrl);
                } else {
                  // Fallback: directly try opening standard HTTP link to resolve emulator strict schemes
                  await Linking.openURL(downloadUrl);
                }
              } catch (linkErr) {
                // Direct fallback open attempt
                await Linking.openURL(downloadUrl);
              }
            } catch (err) {
              Alert.alert("Error", "Failed to start document download.");
            }
          }
        }
      ]
    );
  };

  const invoice = getInvoiceBreakdown();

  const renderPaymentStateScreen = () => {
    switch (paymentState) {
      case 'awaiting_payment':
        return (
          <View style={[styles.stateContainer, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', width: '100%', paddingBottom: 60, paddingTop: 40 }}>
              <View style={styles.gatewayHeader}>
                <View style={styles.sslBadge}>
                  <MaterialIcons name="security" size={14} color={colors.primary} />
                  <Text style={[styles.sslText, { color: colors.primary }]}>SECURE PAYMENT GATEWAY</Text>
                </View>
                <Text style={[styles.gatewayTitle, { color: colors.text, fontSize: 22, marginTop: 8 }]}>Payment in Progress</Text>
              </View>

              <View style={[styles.receiptBox, { backgroundColor: colors.card, borderColor: colors.border, width: '90%', marginVertical: 20 }]}>
                <Text style={[styles.receiptHeader, { color: colors.text, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8, marginBottom: 12 }]}>Order Reference</Text>
                <View style={styles.receiptRow}>
                  <Text style={{ color: colors.textMuted }}>Subscription Plan:</Text>
                  <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{selectedPlan?.name} Plan</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={{ color: colors.textMuted }}>Total Net Price:</Text>
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>₹{invoice.total.toLocaleString()}</Text>
                </View>
                <View style={styles.receiptRow}>
                  <Text style={{ color: colors.textMuted }}>Temp Order ID:</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>{activeTxn?.orderId || "N/A"}</Text>
                </View>
              </View>

              {qrCodeBase64 && (
                <View style={[styles.qrContainer, { backgroundColor: '#ffffff', borderColor: colors.border, width: '90%' }]}>
                  <Image
                    source={{ uri: qrCodeBase64 }}
                    style={{ width: 180, height: 180 }}
                    resizeMode="contain"
                  />
                  <Text style={[styles.scanPrompt, { color: '#000000' }]}>
                    Scan this QR code using Google Pay, PhonePe, Paytm, or BHIM to pay ₹{invoice.total.toLocaleString()}
                  </Text>
                </View>
              )}

              {upiUrl && (
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await Linking.openURL(upiUrl);
                    } catch (err) {
                      Alert.alert("Error", "Could not launch UPI payment application.");
                    }
                  }}
                  style={[styles.primaryActionBtn, { backgroundColor: colors.primary, width: '90%', height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 15 }]}
                >
                  <Text style={{ color: '#000000', fontWeight: 'bold', fontSize: 14 }}>LAUNCH UPI APP 📲</Text>
                </TouchableOpacity>
              )}

              <View style={{ width: '90%', padding: 16, backgroundColor: colors.card, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: colors.primary, marginBottom: 20 }}>
                <Text style={{ color: colors.text, fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>Instructions:</Text>
                {qrCodeBase64 ? (
                  <>
                    <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18, marginBottom: 6 }}>1. Scan the QR code using any UPI app on another device, or launch a local UPI app.</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18, marginBottom: 6 }}>2. Complete the transfer securely on the UPI app.</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18 }}>3. Tap the "Verify Payment Status" button below to instantly activate.</Text>
                  </>
                ) : (
                  <>
                    <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18, marginBottom: 6 }}>1. Complete your payment in the browser window that opened.</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18, marginBottom: 6 }}>2. Once authorized, return to this app.</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 18 }}>3. Tap the "Verify Payment Status" button below to activate your membership instantly.</Text>
                  </>
                )}
              </View>

              {activeTxn?.paymentUrl?.includes('sandbox-checkout') && (
                <View style={[styles.sandboxPanel, { borderColor: colors.primary, backgroundColor: colors.card, width: '90%', marginBottom: 25 }]}>
                  <Text style={{ color: colors.text, fontWeight: "bold", fontSize: 13 }}>🛠️ Sandbox Developer Tool:</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>Since this is a simulated transaction, you can manually complete/decline it via the sandbox dashboard below.</Text>
                  <TouchableOpacity
                    onPress={async () => {
                      if (activeTxn?.paymentUrl) {
                        await Linking.openURL(activeTxn.paymentUrl);
                      }
                    }}
                    style={{ backgroundColor: colors.primary + "15", borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: 8, alignItems: 'center', marginTop: 8 }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "bold" }}>OPEN SANDBOX CHECKOUT 🌐</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                onPress={handleVerifyPayment}
                style={[styles.primaryActionBtn, { backgroundColor: colors.primary, width: '90%', height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }]}
              >
                <Text style={{ color: '#000000', fontWeight: 'bold', fontSize: 14 }}>VERIFY PAYMENT STATUS 🔄</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancelPayment}
                style={{ alignSelf: "center", marginTop: 25 }}
              >
                <Text style={{ color: colors.accent, fontSize: 13, fontWeight: "bold" }}>CANCEL TRANSACTION ⚠️</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        );
      case 'processing':
        return (
          <View style={[styles.stateContainer, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 30 }} />
            <Text style={[styles.stateTitle, { color: colors.text }]}>Securing Transaction</Text>
            
            <View style={[styles.processingStepsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {processingStages.map((stage, idx) => {
                const isCurrent = idx === processingStep;
                const isPassed = idx < processingStep;
                return (
                  <View key={idx} style={styles.stepRow}>
                    {isPassed ? (
                      <MaterialIcons name="check-circle" size={18} color={colors.success} style={{ marginRight: 10 }} />
                    ) : isCurrent ? (
                      <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 10 }} />
                    ) : (
                      <MaterialIcons name="radio-button-unchecked" size={18} color={colors.textMuted} style={{ marginRight: 10 }} />
                    )}
                    <Text style={{ 
                      color: isCurrent ? colors.text : isPassed ? colors.textMuted : colors.textMuted + "50",
                      fontWeight: isCurrent ? "bold" : "normal",
                      fontSize: 13
                    }}>
                      {stage}
                    </Text>
                  </View>
                );
              })}
            </View>
            
            <Text style={[styles.stateDesc, { color: colors.textMuted, paddingHorizontal: 40 }]}>
              Please do not minimize the window or press back. We are validating cryptographically signed credentials.
            </Text>
          </View>
        );
      case 'success':
        return (
          <View style={[styles.stateContainer, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', width: '100%', paddingVertical: 40 }}>
              <View style={[styles.iconCircle, { backgroundColor: colors.success + "20", borderColor: colors.success, marginBottom: 15 }]}>
                <MaterialIcons name="check-circle" size={70} color={colors.success} />
              </View>
              <Text style={[styles.stateTitle, { color: colors.text, fontSize: 26 }]}>Payment Successful! 🎉</Text>
              <Text style={[styles.stateDesc, { color: colors.textMuted, marginTop: 4, marginBottom: 20 }]}>
                Membership subscription has been successfully activated.
              </Text>

              {activeTxn && (
                <View style={[styles.receiptBox, { backgroundColor: colors.card, borderColor: colors.border, width: '90%' }]}>
                  <Text style={[styles.receiptHeader, { color: colors.text }]}>Transaction Invoice Receipt</Text>
                  
                  <View style={styles.receiptRow}>
                    <Text style={{ color: colors.textMuted }}>Plan Name:</Text>
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{activeTxn.plan}</Text>
                  </View>
                  
                  <View style={styles.receiptRow}>
                    <Text style={{ color: colors.textMuted }}>Amount Paid:</Text>
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>₹{activeTxn.amount}</Text>
                  </View>

                  <View style={styles.receiptRow}>
                    <Text style={{ color: colors.textMuted }}>Payment Method:</Text>
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>{activeTxn.method}</Text>
                  </View>

                  <View style={styles.receiptRow}>
                    <Text style={{ color: colors.textMuted }}>Invoice Number:</Text>
                    <Text style={{ color: colors.text, fontSize: 12 }}>{activeTxn.invoiceNumber || "INV-GEN-10294"}</Text>
                  </View>

                  <View style={styles.receiptRow}>
                    <Text style={{ color: colors.textMuted }}>Order ID:</Text>
                    <Text style={{ color: colors.text, fontSize: 12 }}>{activeTxn.orderId}</Text>
                  </View>

                  <View style={styles.receiptRow}>
                    <Text style={{ color: colors.textMuted }}>Transaction ID:</Text>
                    <Text style={{ color: colors.text, fontSize: 11 }}>{activeTxn.transactionId}</Text>
                  </View>

                  <View style={styles.receiptRow}>
                    <Text style={{ color: colors.textMuted }}>Payment Date:</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                      {new Date(activeTxn.updatedAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              <View style={{ width: '90%', gap: 10, marginTop: 10 }}>
                <TouchableOpacity
                  onPress={() => activeTxn && handleDownloadInvoice(activeTxn._id, activeTxn.transactionId)}
                  style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={{ color: '#000000', fontWeight: 'bold' }}>DOWNLOAD INVOICE PDF 📄</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setPaymentState('idle');
                    setActiveTxn(null);
                  }}
                  style={[styles.downloadBtn, { borderColor: colors.border }]}
                >
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>RETURN TO BILLING PORTAL</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        );
      case 'failed':
        return (
          <View style={[styles.stateContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.accent + "20", borderColor: colors.accent, marginBottom: 20 }]}>
              <MaterialIcons name="error" size={70} color={colors.accent} />
            </View>
            <Text style={[styles.stateTitle, { color: colors.text }]}>Payment Declined</Text>
            <Text style={[styles.stateDesc, { color: colors.textMuted, paddingHorizontal: 20 }]}>
              The transaction was rejected by your card issuing bank or UPI interface. Please check credentials or choose another method.
            </Text>

            <View style={{ width: '90%', gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => {
                  setPaymentState('idle');
                  handleOpenCheckout();
                }}
                style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: '#000000', fontWeight: 'bold' }}>RETRY PAYMENT 💳</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setPaymentState('idle');
                  setActiveTxn(null);
                }}
                style={[styles.downloadBtn, { borderColor: colors.border }]}
              >
                <Text style={{ color: colors.text }}>CLOSE CHECKOUT</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const renderPaymentItem = useCallback(({ item }: { item: Payment }) => {
    const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const isCompleted = item.status === "Completed";

    let badgeBgColor = colors.accent + "20";
    let badgeBorderColor = colors.accent;
    let badgeTextColor = colors.accent;

    if (item.status === 'Completed') {
      badgeBgColor = colors.success + "20";
      badgeBorderColor = colors.success;
      badgeTextColor = colors.success;
    } else if (item.status === 'Failed') {
      badgeBgColor = "#ef444420";
      badgeBorderColor = "#ef4444";
      badgeTextColor = "#ef4444";
    } else if (item.status === 'Cancelled') {
      badgeBgColor = "#6b728020";
      badgeBorderColor = "#6b7280";
      badgeTextColor = "#6b7280";
    } else {
      badgeBgColor = "#facc1520";
      badgeBorderColor = "#facc15";
      badgeTextColor = "#facc15";
    }

    return (
      <View style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.transactionId, { color: colors.textMuted }]}>Ref: {item.transactionId}</Text>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor: badgeBgColor,
              borderColor: badgeBorderColor,
            }
          ]}>
            <Text style={[styles.statusText, { color: badgeTextColor }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View>
            <Text style={[styles.amount, { color: colors.text }]}>₹{item.amount.toLocaleString()}</Text>
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              Plan: {item.plan || "Premium"} | {item.method} | {dateStr}
            </Text>
          </View>

          {isCompleted && (
            <TouchableOpacity
              onPress={() => handleDownloadInvoice(item._id, item.transactionId)}
              style={[styles.downloadBtnItem, { borderColor: colors.primary }]}
            >
              <Text style={[styles.downloadBtnText, { color: colors.primary }]}>PDF 📄</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }, [colors]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {paymentState !== 'idle' ? (
        renderPaymentStateScreen()
      ) : (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {/* Plan Selector directly on Main Screen */}
            <View style={[styles.renewBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.renewTitle, { color: colors.text }]}>Renew Membership</Text>
              <Text style={[styles.renewDesc, { color: colors.textMuted, marginBottom: 12 }]}>
                Select your preferred membership tier to continue your training journey.
              </Text>

              {/* Tiers Grid */}
              <View style={styles.tierContainer}>
                {dbPlans.map((tier) => (
                  <TouchableOpacity
                    key={tier._id}
                    onPress={() => handleSelectPlan(tier)}
                    style={[
                      styles.tierCell,
                      {
                        borderColor: selectedPlan?._id === tier._id ? colors.primary : colors.border,
                        backgroundColor: selectedPlan?._id === tier._id ? colors.primary + "15" : colors.background,
                      }
                    ]}
                  >
                    <Text style={[styles.tierName, { color: colors.text }]}>{tier.name}</Text>
                    <Text style={[styles.tierPrice, { color: colors.primary }]}>₹{tier.price}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Invoice Breakdown */}
              <View style={[styles.breakdownCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.breakdownRow}>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>Plan Base Rate:</Text>
                  <Text style={{ color: colors.text, fontSize: 13 }}>₹{invoice.subtotal.toLocaleString()}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>GST (18%):</Text>
                  <Text style={{ color: colors.text, fontSize: 13 }}>+ ₹{invoice.gstAmount.toLocaleString()}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>Coupon Discount (5%):</Text>
                  <Text style={{ color: colors.success, fontSize: 13 }}>- ₹{invoice.discountAmount.toLocaleString()}</Text>
                </View>
                <View style={[styles.breakdownRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 8 }]}>
                  <Text style={{ color: colors.text, fontWeight: "bold", fontSize: 14 }}>Total Net Amount:</Text>
                  <Text style={{ color: colors.primary, fontWeight: "bold", fontSize: 15 }}>₹{invoice.total.toLocaleString()}</Text>
                </View>
              </View>

              {/* Explicit Pay Securely button */}
              <TouchableOpacity
                onPress={handleOpenCheckout}
                style={[styles.renewBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.renewBtnText}>PAY ₹{invoice.total.toLocaleString()} SECURELY 🔒</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.historyTitle, { color: colors.text }]}>Transaction History</Text>

            {/* Member Search Box */}
            <View style={[styles.searchBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <MaterialIcons name="search" size={18} color={colors.textMuted} style={{ marginRight: 6 }} />
              <TextInput
                placeholder="Search transaction ID, order ID, method..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ flex: 1, color: colors.text, fontSize: 12, padding: 0 }}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <MaterialIcons name="close" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Sorting & Filter Header */}
            <View style={styles.filterHeader}>
              <Text style={[styles.filterTitle, { color: colors.textMuted }]}>STATUS FILTERS</Text>
              <TouchableOpacity
                onPress={() => setSortOrder(p => p === "latest" ? "oldest" : "latest")}
                style={[styles.sortBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
              >
                <MaterialIcons name="sort" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={{ color: colors.text, fontSize: 10, fontWeight: "bold" }}>
                  {sortOrder === "latest" ? "Latest First" : "Oldest First"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Status Filter Scrollable Tabs */}
            <View style={{ height: 34, marginBottom: 12 }}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={["All", "Completed", "Pending", "Failed", "Cancelled"]}
                keyExtractor={(item) => item}
                contentContainerStyle={{ paddingHorizontal: 0 }}
                renderItem={({ item }) => {
                  const active = statusFilter === item;
                  return (
                    <TouchableOpacity
                      onPress={() => setStatusFilter(item)}
                      style={[
                        styles.filterTab,
                        {
                          borderColor: active ? colors.primary : colors.border,
                          backgroundColor: active ? colors.primary + "15" : colors.card
                        }
                      ]}
                    >
                      <Text style={{ color: active ? colors.primary : colors.textMuted, fontSize: 10, fontWeight: "bold" }}>
                        {item.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            {/* Filter/Sort processing logic before FlatList rendering */}
            {(() => {
              const filteredPayments = payments
                .filter((item) => {
                  if (statusFilter !== "All" && item.status !== statusFilter) return false;
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  const txnId = (item.transactionId || "").toLowerCase();
                  const orderId = (item.orderId || "").toLowerCase();
                  const method = (item.method || "").toLowerCase();
                  const amount = (item.amount || "").toString();
                  const planName = (item.plan || "").toLowerCase();
                  return (
                    txnId.includes(query) ||
                    orderId.includes(query) ||
                    method.includes(query) ||
                    amount.includes(query) ||
                    planName.includes(query)
                  );
                })
                .sort((a, b) => {
                  const dateA = new Date(a.createdAt).getTime();
                  const dateB = new Date(b.createdAt).getTime();
                  return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
                });

              return (
                <FlatList
                  data={filteredPayments}
                  renderItem={renderPaymentItem}
                  keyExtractor={(item) => item._id}
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                        No past payment transactions matched.
                      </Text>
                    </View>
                  }
                />
              );
            })()}
          </View>
        </ScrollView>
      )}

      {/* Checkout Redesign Modal (Razorpay/PhonePe Style Gateway Modal) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={checkoutVisible}
        onRequestClose={() => setCheckoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <MaterialIcons name="security" size={18} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.text }]}>Secure UPI Gateway</Text>
              </View>
              <TouchableOpacity onPress={() => setCheckoutVisible(false)} style={styles.closeBtn}>
                <MaterialIcons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={{ paddingVertical: 5 }}>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 15 }}>
                Choose UPI payment method for order: <Text style={{ color: colors.primary, fontWeight: 'bold' }}>₹{invoice.total.toLocaleString()}</Text>
              </Text>

              {/* Option 1: Open UPI Apps */}
              <Text style={[styles.sectionLabel, { color: colors.textMuted, marginBottom: 10 }]}>OPEN INSTALLED UPI APPS</Text>
              <View style={styles.appsContainer}>
                {[
                  { id: "phonepe", label: "PhonePe", icon: "phone", color: "#673ab7" },
                  { id: "gpay", label: "Google Pay", icon: "google", color: "#4285f4" },
                  { id: "paytm", label: "Paytm", icon: "wallet", color: "#00b9f5" },
                  { id: "bhim", label: "BHIM", icon: "bank", color: "#e65100" },
                  { id: "amazonpay", label: "Amazon Pay", icon: "cart", color: "#ff9900" }
                ].map((app) => (
                  <TouchableOpacity
                    key={app.id}
                    onPress={() => handlePayViaUpiApp(app.id)}
                    style={[styles.appCell, { backgroundColor: colors.background, borderColor: colors.border }]}
                  >
                    <View style={[styles.appIconCircle, { backgroundColor: app.color + "15" }]}>
                      <MaterialCommunityIcons name={app.icon as any} size={24} color={app.color} />
                    </View>
                    <Text style={[styles.appLabel, { color: colors.text }]}>{app.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Option 2: Scan QR Code */}
              <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 15, marginBottom: 10 }]}>SCAN UPI QR CODE</Text>
              <TouchableOpacity
                onPress={handlePayViaQr}
                style={[styles.qrSelectorBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <View style={[styles.qrSelectorIcon, { backgroundColor: colors.primary + "15" }]}>
                  <MaterialCommunityIcons name="qrcode-scan" size={26} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.qrSelectorTitle, { color: colors.text }]}>Generate & Scan QR Code</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>Generate order QR code to scan with any UPI App</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setCheckoutVisible(false)}
                style={[styles.downloadBtn, { borderColor: colors.border, marginTop: 25 }]}
              >
                <Text style={{ color: colors.text, fontWeight: "bold" }}>CANCEL & GO BACK</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ textAlign: "center", fontSize: 11, color: colors.textMuted + "70", marginTop: 12 }}>
              🛡 Secured with dynamic 256-bit SSL cryptographic encryption.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  renewBox: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  renewTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  renewDesc: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  renewBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  renewBtnText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "bold",
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  paymentCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
    paddingBottom: 10,
    marginBottom: 10,
  },
  transactionId: {
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  metaText: {
    fontSize: 12,
    marginTop: 4,
  },
  downloadBtnItem: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  downloadBtnText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeBtn: {
    padding: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1.2,
  },
  tierContainer: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 12,
  },
  tierCell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  tierName: {
    fontSize: 13,
    fontWeight: "bold",
  },
  tierPrice: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 4,
  },
  breakdownCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  appsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  appCell: {
    width: "31%",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  appIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  appLabel: {
    fontSize: 11,
    fontWeight: "bold",
  },
  qrSelectorBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  qrSelectorIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  qrSelectorTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  stateTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginTop: 15,
    textAlign: "center",
  },
  stateDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 20,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  receiptBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    width: "100%",
  },
  receiptHeader: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#27272a",
    paddingBottom: 6,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  downloadBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  primaryActionBtn: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    elevation: 2,
  },
  qrContainer: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gatewayHeader: {
    alignItems: "center",
    marginBottom: 15,
  },
  sslBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#22c55e15",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  sslText: {
    fontSize: 9,
    fontWeight: "bold",
  },
  gatewayTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scanPrompt: {
    fontSize: 13,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  sandboxPanel: {
    width: "90%",
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 16,
    marginTop: 25,
    gap: 8,
  },
  processingStepsCard: {
    width: "90%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginVertical: 20,
    gap: 12,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 10,
    height: 38,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.8,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  filterTab: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    justifyContent: "center",
    alignItems: "center",
    height: 26,
  }
});
