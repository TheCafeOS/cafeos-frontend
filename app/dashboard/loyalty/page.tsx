"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
  createLoyaltyProgram,
  deleteLoyaltyProgram,
  getCustomerLoyaltyProfile,
  getLoyaltyCustomers,
  getLoyaltyPrograms,
  redeemReward,
  updateLoyaltyProgram,
  updateLoyaltyProgramStatus,
} from "@/services/loyalty.service";
import type {
  LoyaltyCustomerListItem,
  LoyaltyCustomerProfile,
  LoyaltyProgram,
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

function isApiError(value: unknown): value is import("axios").AxiosError {
  return axios.isAxiosError(value);
}

export default function LoyaltyPage() {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [programsError, setProgramsError] = useState<string | null>(null);
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<LoyaltyProgram | null>(null);
  const [programForm, setProgramForm] = useState<LoyaltyProgramRequest>(emptyForm);
  const [programSaving, setProgramSaving] = useState(false);
  const [deletingProgram, setDeletingProgram] = useState<LoyaltyProgram | null>(null);
  const [statusUpdatingProgramId, setStatusUpdatingProgramId] = useState<string | null>(null);

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

  const programNamesById = useMemo(
    () =>
      programs.reduce<Record<string, string>>((acc, program) => {
        acc[program.id] = program.rewardName;
        return acc;
      }, {}),
    [programs],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    void loadPrograms();
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [debouncedSearch, page]);

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

  async function loadPrograms() {
    try {
      setProgramsLoading(true);
      setProgramsError(null);
      const response = await getLoyaltyPrograms();
      setPrograms(response);
    } catch (error) {
      console.error(error);
      setProgramsError("Failed to load loyalty programs.");
      toast.error("Failed to load loyalty programs.");
    } finally {
      setProgramsLoading(false);
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

  function openCustomerDialog(phone: string) {
    setSelectedPhone(phone);
    setCustomerProfile(null);
    setProfileError(null);
    setDialogOpen(true);
  }

  function openCreateProgramDialog() {
    setEditingProgram(null);
    setProgramForm(emptyForm);
    setProgramDialogOpen(true);
  }

  function openEditProgramDialog(program: LoyaltyProgram) {
    setEditingProgram(program);
    setProgramForm({
      rewardName: program.rewardName,
      purchaseThreshold: program.purchaseThreshold,
      rewardQuantity: program.rewardQuantity,
      minimumOrderValue: program.minimumOrderValue,
      isActive: program.isActive,
    });
    setProgramDialogOpen(true);
  }

  function closeProgramDialog() {
    setProgramDialogOpen(false);
    setEditingProgram(null);
    setProgramForm(emptyForm);
  }

  const isProgramFormValid =
    programForm.rewardName.trim().length > 0 &&
    programForm.purchaseThreshold >= 1 &&
    programForm.rewardQuantity >= 1 &&
    programForm.minimumOrderValue >= 0;

  async function handleProgramSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isProgramFormValid) {
      toast.error("Please fill in all loyalty program fields correctly.");
      return;
    }

    try {
      setProgramSaving(true);

      if (editingProgram) {
        await updateLoyaltyProgram(editingProgram.id, programForm);
        toast.success("Loyalty program updated successfully.");
      } else {
        await createLoyaltyProgram(programForm);
        toast.success("Loyalty program created successfully.");
      }

      await loadPrograms();
      closeProgramDialog();
    } catch (error) {
      console.error(error);
      toast.error(
        editingProgram
          ? "Failed to update loyalty program."
          : "Failed to create loyalty program.",
      );
    } finally {
      setProgramSaving(false);
    }
  }

  async function handleToggleProgramStatus(program: LoyaltyProgram) {
    try {
      setStatusUpdatingProgramId(program.id);
      await updateLoyaltyProgramStatus(program.id, !program.isActive);
      toast.success(
        program.isActive
          ? "Loyalty program disabled."
          : "Loyalty program enabled.",
      );
      await loadPrograms();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update loyalty program status.");
    } finally {
      setStatusUpdatingProgramId(null);
    }
  }

  function openDeleteProgramDialog(program: LoyaltyProgram) {
    setDeletingProgram(program);
  }

  async function handleDeleteProgram() {
    if (!deletingProgram) {
      return;
    }

    try {
      await deleteLoyaltyProgram(deletingProgram.id);
      toast.success("Loyalty program deleted successfully.");
      await loadPrograms();
    } catch (error) {
      console.error(error);

      if (isApiError(error) && error.response?.status === 409) {
        toast.error(
          "This program cannot be deleted because customers still have unredeemed rewards. Disable the program instead.",
        );
      } else {
        toast.error("Failed to delete loyalty program.");
      }
    } finally {
      setDeletingProgram(null);
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

  return (
    <DashboardShell
      title="Loyalty"
      description="Configure the reward experience for returning guests."
    >
      <div className="space-y-6">
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Gift className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-stone-900">Loyalty programs</h2>
                <p className="text-sm text-stone-500">
                  Manage multiple loyalty programs for your restaurant.
                </p>
              </div>
            </div>

            <Button type="button" onClick={openCreateProgramDialog}>
              Create loyalty program
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            {programsLoading ? (
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                Loading loyalty programs...
              </div>
            ) : programsError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
                {programsError}
              </div>
            ) : programs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-6 py-12 text-center text-sm text-stone-500">
                <p className="mb-4 text-base font-semibold text-stone-900">
                  No loyalty programs yet.
                </p>
                <p className="mb-6">
                  Create a loyalty program to reward returning guests.
                </p>
                <Button type="button" onClick={openCreateProgramDialog}>
                  Create loyalty program
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full text-left text-sm">
                  <thead className="bg-stone-50 text-stone-600">
                    <tr>
                      <th className="px-3 py-3 font-medium">Reward</th>
                      <th className="px-3 py-3 font-medium">Purchases</th>
                      <th className="px-3 py-3 font-medium">Quantity</th>
                      <th className="px-3 py-3 font-medium">Min Order</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-3 py-3 font-medium">Rewards</th>
                      <th className="px-3 py-3 font-medium">Customers</th>
                      <th className="px-3 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {programs.map((program) => (
                      <tr key={program.id} className="bg-white">
                        <td className="px-3 py-3 text-stone-700">{program.rewardName}</td>
                        <td className="px-3 py-3 text-stone-700">{program.purchaseThreshold}</td>
                        <td className="px-3 py-3 text-stone-700">{program.rewardQuantity}</td>
                        <td className="px-3 py-3 text-stone-700">{formatCurrency(program.minimumOrderValue)}</td>
                        <td className="px-3 py-3 text-stone-700">
                          <Badge variant={program.isActive ? "secondary" : "outline"}>
                            {program.isActive ? "Active" : "Disabled"}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-stone-700">{program.rewardCount ?? "—"}</td>
                        <td className="px-3 py-3 text-stone-700">{program.customerCount ?? "—"}</td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => openEditProgramDialog(program)}>
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              disabled={statusUpdatingProgramId === program.id}
                              onClick={() => void handleToggleProgramStatus(program)}
                            >
                              {statusUpdatingProgramId === program.id
                                ? "Saving..."
                                : program.isActive
                                ? "Disable"
                                : "Enable"}
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={() => openDeleteProgramDialog(program)}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Gift className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-stone-900">Loyalty Customers</h2>
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
                      <th className="px-3 py-3 font-medium">Programs / Progress</th>
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
                        <td className="px-3 py-3 text-stone-700">
                          <div className="flex flex-col gap-1">
                            {customer.programs.length > 0 ? (
                              customer.programs.map((program) => (
                                <div key={program.programId}>
                                  <span className="font-medium text-stone-900">
                                    {programNamesById[program.programId] ?? "Program unavailable"}
                                  </span>
                                  : {program.progressCount} / {program.purchaseThreshold}
                                </div>
                              ))
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-stone-700">{formatCurrency(customer.totalSpend)}</td>
                        <td className="px-3 py-3 text-stone-700">{customer.availableRewards}</td>
                        <td className="px-3 py-3 text-stone-700">{customer.redeemedRewards}</td>
                        <td className="px-3 py-3">
                          <Button type="button" variant="outline" size="sm" onClick={() => openCustomerDialog(customer.phone)}>
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
                    <p className="mt-1 font-medium text-stone-900">
                      {customerProfile.customer.phone}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-sm text-stone-500">Name</p>
                    <p className="mt-1 font-medium text-stone-900">
                      {customerProfile.customer.name ?? "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-sm text-stone-500">Visit Count</p>
                    <p className="mt-1 font-medium text-stone-900">
                      {customerProfile.customer.visitCount}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="text-sm text-stone-500">Total Spend</p>
                    <p className="mt-1 font-medium text-stone-900">
                      {formatCurrency(customerProfile.customer.totalSpend)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:col-span-2">
                    <p className="text-sm text-stone-500">Last Order Date</p>
                    <p className="mt-1 font-medium text-stone-900">
                      {formatDate(customerProfile.customer.lastOrderAt)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-stone-900">Program progress</p>
                      <p className="text-sm text-stone-500">
                        Track progress for each loyalty program.
                      </p>
                    </div>
                    <Badge variant="secondary">{customerProfile.progress.length}</Badge>
                  </div>

                  {customerProfile.progress.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
                      No program progress yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customerProfile.progress.map((program) => {
                        const progressPercent = Math.min(
                          100,
                          (program.progressCount / Math.max(program.purchaseThreshold, 1)) * 100,
                        );

                        return (
                          <div key={program.programId} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-stone-900">{program.rewardName}</p>
                                <p className="text-sm text-stone-500">
                                  {program.isActive ? "Active" : "Disabled"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-stone-900">
                                  {program.progressCount} / {program.purchaseThreshold} purchases
                                </p>
                                <p className="text-sm text-stone-500">
                                  Reward: {program.rewardQuantity} × {program.rewardName}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-200">
                              <div className="h-full rounded-full bg-amber-600" style={{ width: `${progressPercent}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-stone-900">Rewards</p>
                    <Badge variant="secondary">{customerProfile.rewards.length}</Badge>
                  </div>

                  {customerProfile.rewards.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
                      No rewards yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerProfile.rewards.map((reward) => {
                        const matchingProgram = customerProfile.progress.find(
                          (program) => program.programId === reward.programId,
                        );
                        const programName = matchingProgram?.rewardName ?? "Program unavailable";
                        const rewardQuantity = matchingProgram?.rewardQuantity;
                        const status = reward.status;
                        const displayName = rewardQuantity !== undefined ? `${rewardQuantity} × ${programName}` : "Reward details unavailable";

                        return (
                          <div key={reward.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-stone-900">{programName}</p>
                                <p className="text-sm text-stone-500">{displayName}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={
                                    status === "AVAILABLE"
                                      ? "border-green-200 bg-green-100 text-green-700"
                                      : "border-stone-700 bg-stone-700 text-white"
                                  }
                                >
                                  {status === "AVAILABLE" ? "Available" : "Redeemed"}
                                </Badge>
                                {reward.status === "AVAILABLE" ? (
                                  <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    disabled={redeemingRewardId === reward.id}
                                    onClick={() => setConfirmingReward(reward as RewardWithRedemption)}
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
                                <p className="mt-1 text-sm text-stone-700">{formatDate(reward.redeemedAt ?? null)}</p>
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

      <Dialog open={programDialogOpen} onOpenChange={(open) => !open && closeProgramDialog()}>
        <DialogContent className="max-w-2xl p-0 sm:max-w-2xl">
          <div className="p-6">
            <DialogHeader className="mb-5">
              <DialogTitle>{editingProgram ? "Edit loyalty program" : "Create loyalty program"}</DialogTitle>
              <DialogDescription>
                Configure the reward, purchase requirement, and activation state.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleProgramSave} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rewardName">Reward name</Label>
                  <Input
                    id="rewardName"
                    value={programForm.rewardName}
                    onChange={(event) =>
                      setProgramForm((current) => ({
                        ...current,
                        rewardName: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseThreshold">Purchases needed</Label>
                  <Input
                    id="purchaseThreshold"
                    type="number"
                    min={1}
                    value={programForm.purchaseThreshold}
                    onChange={(event) =>
                      setProgramForm((current) => ({
                        ...current,
                        purchaseThreshold: Number(event.target.value),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rewardQuantity">Reward quantity</Label>
                  <Input
                    id="rewardQuantity"
                    type="number"
                    min={1}
                    value={programForm.rewardQuantity}
                    onChange={(event) =>
                      setProgramForm((current) => ({
                        ...current,
                        rewardQuantity: Number(event.target.value),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimumOrderValue">Minimum order value</Label>
                  <Input
                    id="minimumOrderValue"
                    type="number"
                    min={0}
                    value={programForm.minimumOrderValue}
                    onChange={(event) =>
                      setProgramForm((current) => ({
                        ...current,
                        minimumOrderValue: Number(event.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <Checkbox
                  id="programActive"
                  checked={programForm.isActive}
                  onCheckedChange={(checked) =>
                    setProgramForm((current) => ({
                      ...current,
                      isActive: checked === true,
                    }))
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor="programActive" className="cursor-pointer">
                    Active program
                  </Label>
                  <p className="text-sm text-stone-500">
                    When active, this program can earn rewards for qualifying orders.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={closeProgramDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={programSaving || !isProgramFormValid}>
                  {programSaving
                    ? editingProgram
                      ? "Saving..."
                      : "Creating..."
                    : editingProgram
                    ? "Save program"
                    : "Create program"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deletingProgram)}
        onOpenChange={(open) => !open && setDeletingProgram(null)}
      >
        <AlertDialogContentComponent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete loyalty program</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingProgram ? `Delete the loyalty program for ${deletingProgram.rewardName}?` : "Delete this loyalty program?"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDeleteProgram()}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContentComponent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(confirmingReward)}
        onOpenChange={(open) => !open && setConfirmingReward(null)}
      >
        <AlertDialogContentComponent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm reward redemption</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmingReward
                ? `Redeem ${
                    customerProfile?.progress.find(
                      (program) => program.programId === confirmingReward.programId,
                    )?.rewardQuantity ?? 1
                  } × ${
                    customerProfile?.progress.find(
                      (program) => program.programId === confirmingReward.programId,
                    )?.rewardName ?? "this reward"
                  } for this customer?`
                : "Are you sure you want to redeem this reward?"}
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
