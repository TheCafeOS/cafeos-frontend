"use client";

import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent as AlertDialogContentComponent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getCustomerLoyaltyProfile,
  getLoyaltyCustomers,
  getLoyaltyProgram,
  redeemReward,
  updateLoyaltyProgram,
} from "@/services/loyalty.service";
import type {
  LoyaltyCustomerListItem,
  LoyaltyCustomerProfile,
  LoyaltyProgramRequest,
  LoyaltyReward,
} from "@/types/loyalty";

const emptyForm: LoyaltyProgramRequest = {
  rewardName: "",
  purchaseThreshold: 0,
  rewardQuantity: 0,
  minimumOrderValue: 0,
  isActive: false,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type RewardWithRedemption = LoyaltyReward & {
  redeemedAt?: string | null;
};

export default function LoyaltyPage() {
  const [form, setForm] = useState<LoyaltyProgramRequest>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<LoyaltyCustomerListItem[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [customerProfile, setCustomerProfile] = useState<LoyaltyCustomerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [redeemingRewardId, setRedeemingRewardId] = useState<string | null>(null);
  const [confirmingReward, setConfirmingReward] = useState<RewardWithRedemption | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!dialogOpen || !selectedPhone) {
      return;
    }

    let isActive = true;

    async function loadProfile() {
      if (!selectedPhone) {
        return;
      }

      try {
        setProfileLoading(true);
        setProfileError(null);
        const profile = await getCustomerLoyaltyProfile(selectedPhone);

        if (isActive) {
          setCustomerProfile(profile);
        }
      } catch (error) {
        console.error(error);

        if (isActive) {
          setProfileError("Failed to load customer details.");
        }
      } finally {
        if (isActive) {
          setProfileLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [dialogOpen, selectedPhone]);

  useEffect(() => {
    async function loadProgram() {
      try {
        setLoading(true);
        const program = await getLoyaltyProgram();

        if (!program) {
          setForm(emptyForm);
          return;
        }

        setForm({
          rewardName: program.rewardName,
          purchaseThreshold: Number(program.purchaseThreshold),
          rewardQuantity: Number(program.rewardQuantity),
          minimumOrderValue: Number(program.minimumOrderValue),
          isActive: program.isActive,
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load loyalty program.");
      } finally {
        setLoading(false);
      }
    }

    async function loadCustomers() {
      try {
        setCustomersLoading(true);
        const response = await getLoyaltyCustomers({
          page,
          search: debouncedSearch.trim() || undefined,
        });
        setCustomers(response.data);
        setPagination(response.pagination);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load loyalty customers.");
      } finally {
        setCustomersLoading(false);
      }
    }

    void loadProgram();
    void loadCustomers();
  }, [debouncedSearch, page]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      await updateLoyaltyProgram(form);
      toast.success("Loyalty settings updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update loyalty settings.");
    } finally {
      setSaving(false);
    }
  }

  function openCustomerDialog(phone: string) {
    setSelectedPhone(phone);
    setCustomerProfile(null);
    setProfileError(null);
    setDialogOpen(true);
  }

  async function refreshCustomerProfile() {
    if (!selectedPhone) {
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError(null);
      const profile = await getCustomerLoyaltyProfile(selectedPhone);
      setCustomerProfile(profile);
    } catch (error) {
      console.error(error);
      setProfileError("Failed to load customer details.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleRedeemReward(reward: RewardWithRedemption) {
    if (!selectedPhone || !customerProfile) {
      return;
    }

    try {
      setRedeemingRewardId(reward.id);
  await redeemReward(customerProfile.customer.id, reward.id);

      toast.success("Reward redeemed successfully.");
      await refreshCustomerProfile();
      await refreshCustomers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to redeem reward.");
    } finally {
      setRedeemingRewardId(null);
      setConfirmingReward(null);
    }
  }

  async function refreshCustomers() {
    try {
      const response = await getLoyaltyCustomers({
        page,
        search: debouncedSearch.trim() || undefined,
      });
      setCustomers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error(error);
      toast.error("Failed to refresh loyalty customers.");
    }
  }

  return (
    <DashboardShell
      title="Loyalty"
      description="Configure the reward experience for returning guests."
    >
      <div className="space-y-6">
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Gift className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-stone-900">
                Owner loyalty setup
              </h2>
              <p className="text-sm text-stone-500">
                Define the reward, purchase threshold, and eligibility for your loyalty program.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rewardName">Reward name</Label>
                <Input
                  id="rewardName"
                  value={form.rewardName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      rewardName: event.target.value,
                    }))
                  }
                  placeholder="Free coffee"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseThreshold">Purchase threshold</Label>
                <Input
                  id="purchaseThreshold"
                  type="number"
                  min="1"
                  value={form.purchaseThreshold}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      purchaseThreshold: Number(event.target.value),
                    }))
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rewardQuantity">Reward quantity</Label>
                <Input
                  id="rewardQuantity"
                  type="number"
                  min="1"
                  value={form.rewardQuantity}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      rewardQuantity: Number(event.target.value),
                    }))
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumOrderValue">Minimum order value</Label>
                <Input
                  id="minimumOrderValue"
                  type="number"
                  min="0"
                  value={form.minimumOrderValue}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      minimumOrderValue: Number(event.target.value),
                    }))
                  }
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <Checkbox
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    isActive: checked === true,
                  }))
                }
                disabled={loading}
              />

              <div className="space-y-1">
                <Label htmlFor="isActive" className="cursor-pointer">
                  Activate loyalty rewards
                </Label>
                <p className="text-sm text-stone-500">
                  Turn the loyalty program on or off for your restaurant.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading || saving}>
                {saving ? "Saving..." : "Save loyalty settings"}
              </Button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Gift className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-stone-900">
                Loyalty Customers
              </h2>
              <p className="text-sm text-stone-500">
                Review customer engagement and reward activity.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Input
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(1);
              }}
              placeholder="Search by phone or name"
            />

            {customersLoading ? (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                Loading customers...
              </div>
            ) : customers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
                No loyalty customers yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-600">
                  <tr>
                    <th className="px-3 py-3 font-medium">Phone</th>
                    <th className="px-3 py-3 font-medium">Name</th>
                    <th className="px-3 py-3 font-medium">Visit Count</th>
                    <th className="px-3 py-3 font-medium">Progress Count</th>
                    <th className="px-3 py-3 font-medium">Total Spend</th>
                    <th className="px-3 py-3 font-medium">Available Rewards</th>
                    <th className="px-3 py-3 font-medium">Redeemed Rewards</th>
                    <th className="px-3 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="bg-white">
                      <td className="px-3 py-3 text-stone-700">{customer.phone}</td>
                      <td className="px-3 py-3 text-stone-700">{customer.name ?? "—"}</td>
                      <td className="px-3 py-3 text-stone-700">{customer.visitCount}</td>
                      <td className="px-3 py-3 text-stone-700">{customer.progressCount}</td>
                      <td className="px-3 py-3 text-stone-700">{formatCurrency(customer.totalSpend)}</td>
                      <td className="px-3 py-3 text-stone-700">{customer.availableRewards}</td>
                      <td className="px-3 py-3 text-stone-700">{customer.redeemedRewards}</td>
                      <td className="px-3 py-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openCustomerDialog(customer.phone)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}

            {pagination && (
              <div className="flex flex-col gap-3 border-t border-stone-200 pt-4 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Page {pagination.page} of {pagination.totalPages} • {pagination.totalItems} total customers
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0 sm:max-w-2xl">
          <div className="p-6">
            <DialogHeader className="mb-5">
              <DialogTitle>Customer details</DialogTitle>
              <DialogDescription>
                Review loyalty activity and reward history for this customer.
              </DialogDescription>
            </DialogHeader>

            {profileLoading ? (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                Loading customer details...
              </div>
            ) : profileError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
                {profileError}
              </div>
            ) : customerProfile ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-sm text-stone-500">Phone</p>
                    <p className="mt-1 font-medium text-stone-900">{customerProfile.customer.phone}</p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-sm text-stone-500">Name</p>
                    <p className="mt-1 font-medium text-stone-900">{customerProfile.customer.name ?? "—"}</p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-sm text-stone-500">Visit Count</p>
                    <p className="mt-1 font-medium text-stone-900">{customerProfile.customer.visitCount}</p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-sm text-stone-500">Progress Count</p>
                    <p className="mt-1 font-medium text-stone-900">{customerProfile.customer.progressCount}</p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-sm text-stone-500">Purchase Threshold</p>
                    <p className="mt-1 font-medium text-stone-900">{customerProfile.progress.purchaseThreshold}</p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-sm text-stone-500">Total Spend</p>
                    <p className="mt-1 font-medium text-stone-900">{formatCurrency(customerProfile.customer.totalSpend)}</p>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:col-span-2">
                    <p className="text-sm text-stone-500">Last Order Date</p>
                    <p className="mt-1 font-medium text-stone-900">{formatDate(customerProfile.customer.lastOrderAt)}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-stone-900">Progress</p>
                    <p className="text-sm text-stone-600">
                      {customerProfile.progress.progressCount} / {customerProfile.progress.purchaseThreshold}
                    </p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-amber-600"
                      style={{
                        width: `${Math.min(100, (customerProfile.progress.progressCount / Math.max(customerProfile.progress.purchaseThreshold, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-stone-900">Rewards</p>
                    <Badge variant="secondary">
                      {customerProfile.rewards.length}
                    </Badge>
                  </div>

                  {customerProfile.rewards.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
                      No rewards yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                    {customerProfile.rewards.map((reward) => {
                        const rewardWithRedemption = reward as RewardWithRedemption;
 const status = rewardWithRedemption.redeemedAt
  ? "Redeemed"
  : "Available";
                        return (
                          <div key={reward.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <Badge
  className={
    status === "Available"
      ? "border-green-200 bg-green-100 text-green-700"
      : "border-stone-300 bg-stone-200 text-stone-700"
  }
>
  {status}
</Badge>
                              <div className="flex items-center gap-2">
                                
                                {status === "Available" ? (
                                  <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    disabled={redeemingRewardId === reward.id}
                                    onClick={() => setConfirmingReward(rewardWithRedemption)}
                                  >
                                    {redeemingRewardId === reward.id ? "Redeeming..." : "Redeem"}
                                  </Button>
                                ) : null}
                              </div>
                            </div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <div>
                                <p className="text-xs uppercase tracking-wide text-stone-500">Created Date</p>
                                <p className="mt-1 text-sm text-stone-700">{formatDate(reward.createdAt)}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-wide text-stone-500">Redeemed Date</p>
                                <p className="mt-1 text-sm text-stone-700">{formatDate(rewardWithRedemption.redeemedAt ?? null)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(confirmingReward)} onOpenChange={(open) => !open && setConfirmingReward(null)}>
        <AlertDialogContentComponent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm reward redemption</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to redeem this reward?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmingReward) {
                  void handleRedeemReward(confirmingReward);
                }
              }}
              disabled={redeemingRewardId !== null}
            >
              {redeemingRewardId !== null ? "Redeeming..." : "Redeem"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContentComponent>
      </AlertDialog>
    </DashboardShell>
  );
}
