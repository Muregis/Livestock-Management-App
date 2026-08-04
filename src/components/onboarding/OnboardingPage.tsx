import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, User, BarChart3, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const registrationSchema = z.object({
  farmName: z.string().min(2, "Farm name must be at least 2 characters"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  farmType: z.enum(["dairy", "beef", "sheep", "goats", "poultry", "rabbits", "pigs", "mixed", "other"]),
  numberOfAnimals: z.number().min(1, "Must have at least 1 animal"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      farmType: "dairy",
      numberOfAnimals: 10,
    },
  });

  const watchedValues = watch();

  const steps = [
    { title: "Farm Info", icon: Home },
    { title: "Owner Details", icon: User },
    { title: "Animals", icon: BarChart3 },
    { title: "Review", icon: Shield },
  ];

  const onSubmit = (data: RegistrationFormData) => {
    if (step < 4) {
      setStep(step + 1);
      return;
    }

    localStorage.setItem("onboardingData", JSON.stringify(data));
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Onboarding complete</h1>
        <p className="mx-auto max-w-xl text-sm text-slate-600 mb-6">
          Your farm onboarding data is saved and ready to use. Sign in with your account to continue.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button className="w-full sm:w-auto" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setCompleted(false)}>
            Edit Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 grid grid-cols-4 gap-3">
          {steps.map((stepItem, index) => {
            const Icon = stepItem.icon;
            const active = index + 1 === step;
            return (
              <div key={stepItem.title} className={`rounded-2xl border p-3 text-center ${active ? "border-primary bg-primary/10" : "border-slate-200 bg-white"}`}>
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {stepItem.title}
                </p>
              </div>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{step === 1 ? "Farm Information" : step === 2 ? "Owner Details" : step === 3 ? "Animal Setup" : "Review & Submit"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="farmName">Farm Name</Label>
                    <Input id="farmName" {...register("farmName")} placeholder="Green Pastures Farm" />
                    {errors.farmName && <p className="text-sm text-destructive">{errors.farmName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farmType">Farm Type</Label>
                    <Select {...register("farmType") as any}>
                      <SelectTrigger id="farmType">
                        <SelectValue placeholder="Select farm type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dairy">Dairy Cattle</SelectItem>
                        <SelectItem value="beef">Beef Cattle</SelectItem>
                        <SelectItem value="sheep">Sheep</SelectItem>
                        <SelectItem value="goats">Goats</SelectItem>
                        <SelectItem value="poultry">Poultry</SelectItem>
                        <SelectItem value="rabbits">Rabbits</SelectItem>
                        <SelectItem value="pigs">Pigs</SelectItem>
                        <SelectItem value="mixed">Mixed Livestock</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.farmType && <p className="text-sm text-destructive">{errors.farmType.message}</p>}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <Input id="ownerName" {...register("ownerName")} placeholder="Jane Doe" />
                    {errors.ownerName && <p className="text-sm text-destructive">{errors.ownerName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register("email")} placeholder="owner@example.com" />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" {...register("phone")} placeholder="+1 555 987 6543" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="numberOfAnimals">Number of Animals</Label>
                    <Input id="numberOfAnimals" type="number" {...register("numberOfAnimals", { valueAsNumber: true })} min={1} />
                    {errors.numberOfAnimals && <p className="text-sm text-destructive">{errors.numberOfAnimals.message}</p>}
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="font-medium">Your current onboarding values</p>
                    <dl className="mt-3 grid gap-2">
                      <div className="flex justify-between"><span>Farm Name</span><span>{watchedValues.farmName || "—"}</span></div>
                      <div className="flex justify-between"><span>Farm Type</span><span>{watchedValues.farmType || "—"}</span></div>
                      <div className="flex justify-between"><span>Owner</span><span>{watchedValues.ownerName || "—"}</span></div>
                      <div className="flex justify-between"><span>Email</span><span>{watchedValues.email || "—"}</span></div>
                      <div className="flex justify-between"><span>Animals</span><span>{watchedValues.numberOfAnimals ?? "—"}</span></div>
                    </dl>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h2 className="text-lg font-semibold">Review your onboarding details</h2>
                    <div className="mt-4 grid gap-3">
                      <div className="flex justify-between"><span className="font-medium">Farm Name</span><span>{watchedValues.farmName}</span></div>
                      <div className="flex justify-between"><span className="font-medium">Farm Type</span><span>{watchedValues.farmType}</span></div>
                      <div className="flex justify-between"><span className="font-medium">Owner</span><span>{watchedValues.ownerName}</span></div>
                      <div className="flex justify-between"><span className="font-medium">Email</span><span>{watchedValues.email}</span></div>
                      <div className="flex justify-between"><span className="font-medium">Phone</span><span>{watchedValues.phone || "—"}</span></div>
                      <div className="flex justify-between"><span className="font-medium">Number of Animals</span><span>{watchedValues.numberOfAnimals}</span></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                ) : (
                  <div />
                )}
                <Button type="submit">
                  {step === 4 ? "Finish Setup" : "Continue"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
