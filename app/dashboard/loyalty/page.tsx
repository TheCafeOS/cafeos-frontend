"use client";

import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getLoyaltyProgram,
  updateLoyaltyProgram,
} from "@/services/loyalty.service";
import type { LoyaltyProgramRequest } from "@/types/loyalty";

const emptyForm: LoyaltyProgramRequest = {
  rewardName: "",
  purchaseThreshold: 0,
  rewardQuantity: 0,
  minimumOrderValue: 0,
  isActive: false,
};

export default function LoyaltyPage() {
  const [form, setForm] = useState<LoyaltyProgramRequest>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

    void loadProgram();
  }, []);

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
      </div>
    </DashboardShell>
  );
}
