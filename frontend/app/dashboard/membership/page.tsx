"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/src/components/organisms/DashboardLayout";
import { getUserProfile, createPaymentOrder, verifyPayment, getMembershipPlans, cancelPayment } from "@/src/dialogs/invoice_config/services";

export default function MembershipPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [payMethod, setPayMethod] = useState("UPI");
  const [paying, setPaying] = useState(false);
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<"form" | "awaiting" | "verifying">("form");
  const [activeTxnId, setActiveTxnId] = useState<string | null>(null);
  const [activeQrCode, setActiveQrCode] = useState<string | null>(null);

  const handleCancelCheckout = async () => {
    if (activeTxnId) {
      try {
        await cancelPayment(activeTxnId);
      } catch (err) {
        console.error("Cancel order request failed:", err);
      }
    }
    setOpenCheckout(false);
    setPaymentStatus("form");
    setActiveTxnId(null);
    setActiveQrCode(null);
  };

  const fetchProfile = async () => {
    try {
      const res = await getUserProfile();
      if (res.success) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await getMembershipPlans();
      if (res.success && res.data) {
        setDbPlans(res.data);
      }
    } catch (err) {
      console.error("[WEB] Error loading database plans:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchPlans();
  }, []);

  // Auto-verify when user returns to tab
  useEffect(() => {
    const handleFocus = async () => {
      if (paymentStatus === "awaiting" && activeTxnId) {
        console.log("[WEB] Tab focused, auto-verifying payment...");
        try {
          setPaying(true);
          setPaymentStatus("verifying");
          const verifyRes = await verifyPayment(activeTxnId);
          if (verifyRes.success && verifyRes.data && verifyRes.data.status === "Completed") {
            alert(`Payment of ₹${selectedPlan?.price} via ${payMethod} completed successfully! Membership renewed for 30 days.`);
            setOpenCheckout(false);
            setPaymentStatus("form");
            setLoading(true);
            await fetchProfile();
          } else {
            // Keep status as awaiting
            setPaymentStatus("awaiting");
          }
        } catch (err) {
          console.error(err);
          setPaymentStatus("awaiting");
        } finally {
          setPaying(false);
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [paymentStatus, activeTxnId, selectedPlan, payMethod]);

  const handleOpenRenew = () => {
    const planName = profile?.memberDetails?.plan || "Basic";
    const matched = dbPlans.find((p) => p.name.toLowerCase() === planName.toLowerCase());
    if (matched) {
      setSelectedPlan(matched);
      setOpenCheckout(true);
    } else if (dbPlans.length > 0) {
      setSelectedPlan(dbPlans[0]);
      setOpenCheckout(true);
    }
  };

  const handleOpenUpgrade = () => {
    const matched = dbPlans.find((p) => p.name.toLowerCase() === "premium");
    if (matched) {
      setSelectedPlan(matched);
      setOpenCheckout(true);
    } else if (dbPlans.length > 0) {
      setSelectedPlan(dbPlans[dbPlans.length - 1]);
      setOpenCheckout(true);
    }
  };

  const handleRenew = async () => {
    if (!selectedPlan) {
      alert("No membership plan selected.");
      return;
    }
    try {
      setPaying(true);
      
      // Step 1: Create Order
      const orderRes = await createPaymentOrder(payMethod, selectedPlan._id);
      if (!orderRes.success || !orderRes.paymentUrl) {
        alert(orderRes.message || "Failed to initiate payment");
        return;
      }

      // Save active order details
      setActiveTxnId(orderRes.data._id);
      setActiveQrCode(orderRes.qrCodeBase64 || null);

      // Step 2: Open gateway checkout page in a new window/tab
      const newWin = window.open(orderRes.paymentUrl, "_blank");
      if (!newWin) {
        console.warn("[WEB] Popup blocker prevented redirect. User can scan the displayed QR Code instead.");
      }

      // Switch to awaiting validation step
      setPaymentStatus("awaiting");
    } catch (err) {
      console.error(err);
      alert("Error processing renewal payment");
    } finally {
      setPaying(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!activeTxnId) return;
    try {
      setPaying(true);
      setPaymentStatus("verifying");
      const verifyRes = await verifyPayment(activeTxnId);
      if (verifyRes.success && verifyRes.data && verifyRes.data.status === "Completed") {
        alert(`Payment of ₹${selectedPlan.price} via ${payMethod} completed successfully! Membership renewed for 30 days.`);
        setOpenCheckout(false);
        setPaymentStatus("form");
        setLoading(true);
        await fetchProfile();
      } else {
        alert(verifyRes.message || "Payment verification pending. Please complete transaction in checkout tab and try again.");
        setPaymentStatus("awaiting");
      }
    } catch (err) {
      console.error(err);
      alert("Verification check failed. Please retry.");
      setPaymentStatus("awaiting");
    } finally {
      setPaying(false);
    }
  };

  if (loading && !profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-yellow-400 font-bold text-xl animate-pulse">Loading Membership...</p>
        </div>
      </DashboardLayout>
    );
  }

  const member = profile?.memberDetails;
  const plan = member?.plan || "Basic Plan";
  const status = member?.status || "Active";
  const trainer = member?.trainer;

  const joinDate = member?.joinedDate
    ? new Date(member.joinedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";

  const expiryDate = member?.expiryDate
    ? new Date(member.expiryDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";

  const currentPlanDoc = dbPlans.find((p) => p.name.toLowerCase() === plan.toLowerCase());

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Membership Details</h1>

        {/* Current Plan */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <p className="text-gray-400">Current Plan</p>
              <h2 className="text-4xl font-bold text-yellow-400 mt-2">{plan}</h2>
              <p className="text-gray-400 mt-4 max-w-xl">
                Provides active access to strength equipment, cardio setups, locker amenities, and personalized routine checkups.
              </p>
            </div>

            <div>
              <p className="text-gray-400">Membership Status</p>
              <span
                className={`inline-block mt-3 px-5 py-2 rounded-full font-semibold ${
                  status === "Active"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Membership Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-yellow-400 text-xl font-bold">Start Date</h3>
            <p className="mt-3 text-zinc-300 font-semibold">{joinDate}</p>
          </div>

          <div className="bg-black border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-yellow-400 text-xl font-bold">Expiry Date</h3>
            <p className="mt-3 text-zinc-300 font-semibold">{expiryDate}</p>
          </div>

          <div className="bg-black border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-yellow-400 text-xl font-bold">Trainer Support</h3>
            <p className="mt-3 text-zinc-300 font-semibold">
              {trainer ? `${trainer.name} (${trainer.specialization || "General"})` : "No Personal Trainer Assigned"}
            </p>
          </div>
        </div>

        {/* Subscription Plans Grid */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-2">Available Subscription Plans</h2>
          <p className="text-gray-400 text-sm mb-6">Select a plan to subscribe, upgrade or renew your active tier.</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dbPlans.map((planDoc: any) => {
              const isCurrent = plan.toLowerCase() === planDoc.name.toLowerCase();
              return (
                <div
                  key={planDoc._id}
                  className={`rounded-2xl p-6 border flex flex-col justify-between ${
                    isCurrent
                      ? "border-yellow-400 bg-zinc-900/50"
                      : "border-zinc-800 bg-zinc-900"
                  }`}
                >
                  <div>
                    {isCurrent && (
                      <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold inline-block mb-4">
                        ACTIVE PLAN
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-white">{planDoc.name}</h3>
                    <p className="text-3xl font-extrabold text-yellow-400 mt-2">
                      ₹{planDoc.price}
                      <span className="text-xs text-gray-400 font-normal"> / month</span>
                    </p>
                    
                    <ul className="mt-4 space-y-2 text-xs text-zinc-300">
                      {planDoc.features?.map((feat: string, fIdx: number) => (
                        <li key={fIdx}>✅ {feat}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPlan(planDoc);
                      setOpenCheckout(true);
                    }}
                    className={`w-full mt-6 py-2.5 rounded-xl font-bold text-xs transition hover:scale-105 border-none cursor-pointer ${
                      isCurrent
                        ? "bg-zinc-800 text-zinc-400 hover:text-white"
                        : "bg-yellow-400 text-black hover:bg-yellow-300"
                    }`}
                  >
                    {isCurrent ? "Renew Subscription" : "Subscribe / Upgrade"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {openCheckout && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 w-full max-w-md p-8 rounded-3xl border border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Membership Renewal</h2>
              <button 
                onClick={handleCancelCheckout} 
                className="text-red-400 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {paymentStatus === "form" && (
              <div className="space-y-6">
                <div>
                  <p className="text-gray-400 text-sm">Selected Plan</p>
                  <p className="text-3xl font-extrabold text-yellow-400 mt-1">{selectedPlan?.name || ""} - ₹{selectedPlan?.price || 0}</p>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-semibold mb-2">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full bg-black border border-zinc-700 text-white p-3 rounded-xl outline-none focus:border-yellow-400"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe)</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="NetBanking">Net Banking</option>
                  </select>
                </div>

                <div className="bg-zinc-800/50 p-4 rounded-2xl text-zinc-400 text-sm">
                  📌 Confirming will initialize a secure transaction with the payment gateway.
                </div>

                <button
                  onClick={handleRenew}
                  disabled={paying}
                  className="w-full bg-yellow-400 text-black py-4 rounded-xl font-bold text-lg hover:scale-105 transition"
                >
                  {paying ? "Creating Order..." : "Confirm Payment"}
                </button>
              </div>
            )}

            {paymentStatus === "awaiting" && (
              <div className="space-y-6">
                <div>
                  <p className="text-gray-400 text-sm">Selected Plan</p>
                  <p className="text-3xl font-extrabold text-yellow-400 mt-1">{selectedPlan?.name || ""} - ₹{selectedPlan?.price || 0}</p>
                </div>

                {activeQrCode && (
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-zinc-800">
                    <img src={activeQrCode} alt="UPI QR Code" className="w-44 h-44" />
                    <p className="text-zinc-900 text-xs font-bold mt-2 text-center">Scan QR code via Google Pay, PhonePe, Paytm, or BHIM</p>
                  </div>
                )}

                <div className="bg-yellow-400/10 border border-yellow-400/20 p-4 rounded-2xl text-yellow-400 text-sm space-y-2">
                  <p className="font-bold">🌐 Checkout Tab Opened</p>
                  <p>A new browser window/tab has opened with the payment gateway checkout. Please complete the payment there.</p>
                  <p className="text-xs text-zinc-400">Once paid, return to this tab and click the verification button below.</p>
                </div>

                <button
                  onClick={handleVerifyPayment}
                  disabled={paying}
                  className="w-full bg-green-500 text-black py-4 rounded-xl font-bold text-lg hover:scale-105 transition"
                >
                  Verify Payment Status 🔄
                </button>

                <button
                  onClick={handleCancelCheckout}
                  className="w-full border border-zinc-700 text-zinc-400 py-3 rounded-xl font-bold text-sm hover:bg-zinc-800 transition"
                >
                  Cancel Checkout
                </button>
              </div>
            )}

            {paymentStatus === "verifying" && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-300 font-bold">Verifying Payment Status...</p>
                <p className="text-xs text-zinc-500">Checking banking credentials, please do not close.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}