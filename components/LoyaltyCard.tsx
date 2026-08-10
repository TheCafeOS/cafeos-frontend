import { Gift, Loader2 } from "lucide-react";

import type {
  LoyaltyProgram,
  PublicLoyaltyCustomerProfile,
} from "@/types/loyalty";

type LoyaltyCardProps = {
  program: LoyaltyProgram | null;
  profile: PublicLoyaltyCustomerProfile | null;
  isLoading: boolean;
  error: string;
  emptyMessage?: string;
};

export default function LoyaltyCard({
  program,
  profile,
  isLoading,
  error,
  emptyMessage,
}: LoyaltyCardProps) {
  if (isLoading) {
    return (
      <div className="mx-auto mb-6 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-[#171A20] p-5 shadow-sm">
          <div className="flex items-center gap-3 text-neutral-200">
            <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
            <span className="text-sm">Loading loyalty progress...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mb-6 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!program) {
    return null;
  }

  if (!profile) {
    return (
      <div className="mx-auto mb-6 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-[#171A20] p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
              <Gift className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-100">
                {program.rewardName}
              </p>

              <p className="mt-1 text-sm text-neutral-400">
                {emptyMessage ??
                  "Place your first order to unlock loyalty rewards."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

const programProgress = profile.programs.find(
  (item) => item.programId === program.id,
);

const progressCount = programProgress?.progressCount ?? 0;
const purchaseThreshold =
  programProgress?.purchaseThreshold ??
  program.purchaseThreshold;

  const progressPercentage = Math.min(
    100,
    (progressCount / Math.max(purchaseThreshold, 1)) * 100,
  );

  const remainingPurchases = Math.max(
    0,
    purchaseThreshold - progressCount,
  );

  const rewardTitle =
    program.rewardQuantity > 1
      ? `${program.rewardQuantity} × ${program.rewardName}`
      : program.rewardName;

  const progressMessage =
    remainingPurchases === 0
      ? "🎉 Your reward is unlocked!"
      : remainingPurchases === 1
        ? "Just 1 more purchase to unlock your reward"
        : `${remainingPurchases} more purchases to unlock your reward`;

  return (
    <div className="mx-auto mb-6 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#111318] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
        <div className="space-y-5 p-5 sm:p-7">
          {/* Loyalty introduction */}
          <div className="rounded-3xl border border-orange-500/10 bg-gradient-to-br from-orange-500/[0.07] via-transparent to-transparent p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                <Gift className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300/80">
                  Your Loyalty Reward
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {rewardTitle}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">
                  Make {purchaseThreshold}{" "}
                  {purchaseThreshold === 1 ? "purchase" : "purchases"} and
                  unlock {rewardTitle}.
                </p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="rounded-3xl border border-white/10 bg-[#171A20] p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300/80">
                    Your Progress
                  </p>

                  <p className="mt-1.5 text-lg font-semibold leading-tight text-white sm:text-xl">
                    {progressMessage}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-medium text-neutral-400">
                  {progressCount} / {purchaseThreshold}
                </p>
              </div>

              <div
                className="relative h-3 overflow-hidden rounded-full bg-white/10"
                aria-label={`${progressCount} of ${purchaseThreshold} purchases completed`}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <p className="text-xs text-neutral-500">
                {progressCount} of {purchaseThreshold}{" "}
                {purchaseThreshold === 1 ? "purchase" : "purchases"} completed
              </p>
            </div>
          </div>

          {/* Reward details + rewards */}
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            {/* Your reward */}
            <div className="rounded-3xl border border-white/10 bg-[#171A20] p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-orange-400" />

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300/80">
                  Your Reward
                </p>
              </div>

              <div className="mt-4 rounded-3xl bg-white/5 p-4 sm:p-5">
                <p className="text-sm text-neutral-400">Reward</p>

                <p className="mt-1.5 text-lg font-semibold text-white">
                  {rewardTitle}
                </p>
              </div>

              <div className="mt-3 rounded-3xl bg-white/5 p-4 sm:p-5">
                <p className="text-sm text-neutral-400">
                  Minimum order value
                </p>

                <p className="mt-1.5 text-lg font-semibold text-white">
                  ₹
                  {Number(
                    program.minimumOrderValue ?? 0,
                  ).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Rewards */}
            <div className="rounded-3xl border border-white/10 bg-[#171A20] p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300/80">
                  Your Rewards
                </p>

                {profile.rewards.length > 0 && (
                  <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-300">
                    {profile.rewards.length}
                  </span>
                )}
              </div>

              {profile.rewards.length > 0 ? (
                <ul className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
                  {profile.rewards.map((reward) => (
                    <li
                      key={reward.id}
                      className="rounded-3xl border border-white/5 bg-white/5 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                          <Gift className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-medium text-white">
                              Loyalty Reward
                            </p>

                            <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                              {reward.status}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-neutral-400">
                            Unlocked{" "}
                            {new Date(
                              reward.createdAt,
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 rounded-3xl bg-white/5 p-5">
                  <p className="text-sm font-medium text-neutral-200">
                    No rewards unlocked yet.
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Keep ordering to unlock your first loyalty reward.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}