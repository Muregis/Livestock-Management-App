import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, User, BarChart3, Shield } from "lucide-react";

const registrationSchema = z.object({
  farmName: z.string().min(2, "Farm name must be at least 2 characters"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  farmType: z.enum(["dairy", "beef", "sheep", "goats", "poultry", "rabbits", "pigs", "mixed", "other"]),
  numberOfAnimals: z.number().min(1, "Must have at least 1 animal"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      farmType: "dairy",
      numberOfAnimals: 10,
    }
  });

  const handleNext = (data: any) => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setCompleted(true);
      console.log("Registration complete:", data);
    }
  };

  const steps = [
    { title: "Farm Info", icon: Home },
    { title: "Owner Details", icon: User },
    { title: "Animals", icon: BarChart3 },
    { title: "Review", icon: Shield },
  ];

  if (completed) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Livestock Management!</h2>
        <p className="text-gray-600 mb-4">Your account has been created successfully.</p>
        <Button onClick={() => window.location.href = "/"}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        {steps.map((stepItem, index) => {
          const Icon = stepItem.icon;
          const isActive = index + 1 === step;
          return (
            <div key={stepItem.title} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-600' : 'bg-gray-200'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="ml-2 text-sm font-medium">{stepItem.title}</span>
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Onboarding Step {step} of 4</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleSubmit(handleNext)} className="space-y-4">
              <div>
                <Label>Farm Name</Label>
                <Input {...register("farmName")} placeholder="John's Farm" />
                {errors.farmName && <span className="text-red-500 text-sm">{errors.farmName.message}</span>}
              </div>
              <Button type="submit" className="w-full">Continue</Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit(handleNext)} className="space-y-4">
              <div>
                <Label>Owner Name</Label>
                <Input {...register("ownerName")} placeholder="John Smith" />
                {errors.ownerName && <span className="text-red-500 text-sm">{errors.ownerName.message}</span>}
              </div>
              <div>
                <Label>Email</Label>
                <Input {...register("email")} type="email" placeholder="john@example.com" />
                {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
              </div>
              <Button type="submit" className="w-full">Continue</Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit(handleNext)} className="space-y-4">
              <div>
                <Label>Farm Type</Label>
                <Select onValueChange={(value) => console.log(value)} defaultValue={registrationSchema.shape.farmType._def.values[0]}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select farm type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dairy">Dairy Cattle</SelectItem>
                    <SelectItem value="beef">Beef Cattle</SelectItem>
                    <SelectItem value="sheep">Sheep & Goats</SelectItem>
                    <SelectItem value="poultry">Poultry</SelectItem>
                    <SelectItem value="rabbits">Rabbits</SelectItem>
                    <SelectItem value="pigs">Pigs</SelectItem>
                    <SelectItem value="mixed">Mixed Livestock</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Number of Animals</Label>
                <Input type="number" {...register("numberOfAnimals", { valueAsNumber: true })} min={1} />
              </div>
              <Button type="button" onClick={() => setStep(2)}>Back</Button>
              <Button type="submit" className="w-full">Continue</Button>
            </form>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <button onClick={() => setStep(3)} className="text-blue-600 text-sm">Back</button>
              <Button type="submit" className="w-full" onClick={() => setCompleted(true)}>Complete Setup</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}