import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, User, BarChart3, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const registrationSchema = z.object({
  farmName: z.string().min(2, "Farm name must be at least 2 characters"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional().or(z.literal("")),
  farmType: z.enum(["dairy", "beef", "sheep", "goats", "poultry", "rabbits", "pigs", "mixed", "other"]),
  numberOfAnimals: z.number().min(1, "Must have at least 1 animal"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

type EnrollmentResult = {
  success: boolean;
  message: string;
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<EnrollmentResult | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, trigger, control, formState: { errors } } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      farmType: "dairy",
      numberOfAnimals: 10,
    },
  });

  const watchedValues = watch();

  const handleStepContinue = async () => {
    const fieldsByStep: Record<number, Array<keyof RegistrationFormData>> = {
      1: ["farmName", "farmType"],
      2: ["ownerName", "email", "password", "phone"],
      3: ["numberOfAnimals"],
    };

    const fields = fieldsByStep[step] ?? [];
    const isValid = await trigger(fields as any);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const steps = [
    { title: "Farm Info", icon: Home },
    { title: "Owner Details", icon: User },
    { title: "Animals", icon: BarChart3 },
    { title: "Review", icon: Shield },
  ];

  const createUserProfile = async (userId: string, values: RegistrationFormData) => {
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .insert([{
        id: userId,
        email: values.email,
        name: values.ownerName,
        role: "viewer",
        permissions: ["read"],
        phone: values.phone || null,
        is_active: true,
        hire_date: new Date().toISOString(),
      }])
      .select("id")
      .maybeSingle();

    if (profileError || !profile) {
      console.error("[OnboardingPage] unable to create profile row", profileError?.message || "no row returned");
      setErrorMessage("Account was created, but the onboarding profile could not be saved. Please log in after email confirmation and try again.");
      return false;
    }

    return true;
  };

  const onSubmit = async (data: RegistrationFormData) => {
    if (step < 4) {
      setStep(step + 1);
      return;
    }

    setErrorMessage(null);

    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        throw error;
      }

      let userId = signUpData?.user?.id;
      if (!userId) {
        const sessionResult = await supabase.auth.getUser();
        userId = sessionResult.data.user?.id;
      }

      if (!userId) {
        throw new Error("Failed to create auth user.");
      }

      const profileCreated = await createUserProfile(userId, data);
      if (!profileCreated) {
        return;
      }

      localStorage.setItem("onboardingData", JSON.stringify(data));
      setCompleted(true);
      setResult({
        success: true,
        message: "Your account was created. Use the login form to sign in once your email is confirmed.",
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to complete onboarding.");
    }
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
        {result && (
          <div className="mx-auto mb-6 max-w-xl rounded-xl border border-green-200 bg-green-50 p-4 text-left text-sm text-green-800">
            {result.message}
          </div>
        )}
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
                    <Controller
                      name="farmType"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
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
                      )}
                    />
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
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" {...register("password")} placeholder="••••••••" />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
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

              {errorMessage && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                  {errorMessage}
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
                {step === 4 ? (
                  <Button type="submit">Finish Setup</Button>
                ) : (
                  <Button type="button" onClick={handleStepContinue}>
                    Continue
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}