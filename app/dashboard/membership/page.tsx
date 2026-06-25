"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/src/components/organisms/DashboardLayout";
import { getUserProfile, createPaymentOrder, verifyPayment } from "@/src/dialogs/invoice_config/services";

export default function MembershipPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [renewalAmount, setRenewalAmount] = useState(1999);
  const [payMethod, setPayMethod] = useState("UPI");
  const [paying, setPaying] = useState(false);

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

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleRenew = async () => {
    try {
      setPaying(true);
      
      // Step 1: Create Order
      const orderRes = await createPaymentOrder(renewalAmount, payMethod);
      if (!orderRes.success) {
        alert(orderRes.message || "Failed to initiate payment");
        return;
      }

      // Step 2: Verify Order (simulate successful authorization)
      const verifyRes = await verifyPayment({
        orderId: orderRes.data._id,
        success: true,
      });

      if (verifyRes.success) {
        alert(`Payment of ₹${renewalAmount} via ${payMethod} completed successfully! Membership renewed for 30 days.`);
        setOpenCheckout(false);
        setLoading(true);
        await fetchProfile();
      } else {
        alert(verifyRes.message || "Payment verification failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing renewal payment");
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

        {/* Actions */}
        <div className="bg-black border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-6">Membership Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setOpenCheckout(true)}
              className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition"
            >
              Renew Membership (₹1,999)
            </button>
            <button
              onClick={() => {
                setRenewalAmount(4999);
                setOpenCheckout(true);
              }}
              className="border border-yellow-400 text-yellow-400 px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 hover:text-black transition"
            >
              Upgrade Plan (Elite - ₹4,999)
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {openCheckout && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 w-full max-w-md p-8 rounded-3xl border border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Membership Renewal</h2>
              <button onClick={() => setOpenCheckout(false)} className="text-red-400 text-xl font-bold">✕</button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-gray-400 text-sm">Renewal Price</p>
                <p className="text-3xl font-extrabold text-yellow-400 mt-1">₹{renewalAmount}</p>
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
                📌 This is a secure payment simulation. Confirming will create order record INV and extend membership expiry date by 30 days.
              </div>

              <button
                onClick={handleRenew}
                disabled={paying}
                className="w-full bg-yellow-400 text-black py-4 rounded-xl font-bold text-lg hover:scale-105 transition"
              >
                {paying ? "Verifying Transaction..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}