import { useEffect, useState } from "react";
import { AnimalService } from "@/lib/livestockService";
import type { Animal, AnimalBreed, AnimalGender, AnimalSpecies, AnimalStatus } from "@/types/livestock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ClipboardList } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const speciesOptions: AnimalSpecies[] = [
  "dairy_cattle",
  "beef_cattle",
  "sheep",
  "goats",
  "poultry",
  "pigs",
  "horses",
  "other",
];

const breedOptions: AnimalBreed[] = [
  "Holstein",
  "Jersey",
  "Angus",
  "Hereford",
  "Dorper",
  "RhodeIslandRed",
  "Arabian",
  "other",
];

const statusOptions: AnimalStatus[] = ["active", "quarantine", "sold", "deceased"];

const initialFormState = {
  earTag: "",
  name: "",
  gender: "female" as AnimalGender,
  species: "dairy_cattle" as AnimalSpecies,
  breed: "Holstein" as AnimalBreed,
  birthDate: "",
  status: "active" as AnimalStatus,
  locationId: "",
  locationName: "",
  acquisitionCost: "",
  currentWeight: "",
  expectedWeight: "",
};

type AnimalFormData = typeof initialFormState;

const AnimalsPage = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AnimalFormData>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadAnimals = async () => {
      try {
        const data = await AnimalService.getAll();
        setAnimals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load animals.");
      } finally {
        setIsLoading(false);
      }
    };
    loadAnimals();
  }, []);

  const handleFormChange = (field: string, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => setFormData(initialFormState);

  const handleCreateAnimal = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      if (!formData.earTag.trim() || !formData.breed.trim() || !formData.birthDate || !formData.locationId.trim()) {
        throw new Error("Please fill in required fields before saving.");
      }

      const created = await AnimalService.create({
        earTag: formData.earTag.trim(),
        name: formData.name.trim() || undefined,
        gender: formData.gender,
        species: formData.species,
        breed: formData.breed,
        birthDate: new Date(formData.birthDate),
        status: formData.status,
        locationId: formData.locationId.trim(),
        locationName: formData.locationName.trim() || undefined,
        acquisitionCost: formData.acquisitionCost ? Number(formData.acquisitionCost) : undefined,
        currentWeight: formData.currentWeight ? Number(formData.currentWeight) : undefined,
        expectedWeight: formData.expectedWeight ? Number(formData.expectedWeight) : undefined,
      });

      setAnimals((current) => [created, ...current]);
      toast({
        title: "Animal added",
        description: `The animal ${created.earTag} was added to the herd successfully.`,
      });
      resetForm();
      setIsDialogOpen(false);
      setError(null);
    } catch (err) {
      toast({
        title: "Add animal failed",
        description: err instanceof Error ? err.message : "Unable to save animal.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">Loading animals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Animal Herd</h1>
          <p className="text-sm text-muted-foreground">
            Track individual livestock records and add new animals to the system.
          </p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Animal
        </Button>
      </div>

      {animals.length === 0 ? (
        <Card className="rounded-xl border border-border bg-card p-6 text-center">
          <ClipboardList className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No animals found yet. Use the Add Animal button to begin.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {animals.map((animal) => (
            <Card key={animal.id} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">
                    {animal.species.replace("_", " ")}
                  </p>
                  <h2 className="text-lg font-semibold">{animal.name || animal.earTag}</h2>
                  <p className="text-sm text-muted-foreground">Tag: {animal.earTag}</p>
                </div>
                <Badge variant={animal.status === "active" ? "secondary" : "outline"}>
                  {animal.status}
                </Badge>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p>Breed: {animal.breed}</p>
                <p>Gender: {animal.gender}</p>
                <p>Location: {animal.locationName || animal.locationId}</p>
                <p>Birth date: {animal.birthDate.toLocaleDateString()}</p>
                {animal.currentWeight !== undefined && <p>Weight: {animal.currentWeight} kg</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Animal</DialogTitle>
            <DialogDescription>
              Create a new animal record with the minimum required details.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4 pt-2" onSubmit={handleCreateAnimal}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="earTag">Ear Tag</Label>
                <Input
                  id="earTag"
                  value={formData.earTag}
                  onChange={(event) => handleFormChange("earTag", event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) => handleFormChange("name", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleFormChange("gender", value)}>
                  <SelectTrigger id="gender">
                    <SelectValue>{formData.gender}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="species">Species</Label>
                <Select value={formData.species} onValueChange={(value) => handleFormChange("species", value)}>
                  <SelectTrigger id="species">
                    <SelectValue>{formData.species}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {speciesOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed">Breed</Label>
                <Select value={formData.breed} onValueChange={(value) => handleFormChange("breed", value)}>
                  <SelectTrigger id="breed">
                    <SelectValue>{formData.breed}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {breedOptions.map((breed) => (
                      <SelectItem key={breed} value={breed}>
                        {breed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(event) => handleFormChange("birthDate", event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleFormChange("status", value)}>
                  <SelectTrigger id="status">
                    <SelectValue>{formData.status}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="locationId">Location ID</Label>
                <Input
                  id="locationId"
                  value={formData.locationId}
                  onChange={(event) => handleFormChange("locationId", event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationName">Location name</Label>
                <Input
                  id="locationName"
                  value={formData.locationName}
                  onChange={(event) => handleFormChange("locationName", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acquisitionCost">Acquisition cost</Label>
                <Input
                  id="acquisitionCost"
                  type="number"
                  value={formData.acquisitionCost}
                  onChange={(event) => handleFormChange("acquisitionCost", event.target.value)}
                  min={0}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentWeight">Current weight</Label>
                <Input
                  id="currentWeight"
                  type="number"
                  value={formData.currentWeight}
                  onChange={(event) => handleFormChange("currentWeight", event.target.value)}
                  min={0}
                  step="0.1"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="expectedWeight">Expected weight</Label>
                <Input
                  id="expectedWeight"
                  type="number"
                  value={formData.expectedWeight}
                  onChange={(event) => handleFormChange("expectedWeight", event.target.value)}
                  min={0}
                  step="0.1"
                />
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <DialogFooter className="justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save Animal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnimalsPage;
