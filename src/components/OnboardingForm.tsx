import React, { useState } from 'react';

export function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);
  const handleSubmit = () => console.log('Complete', formData);

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Onboarding - Step {step}</h2>
      
      {step === 1 && (
        <>
          <div>
            <label>Farm Name:</label>
            <input 
              type="text" 
              onChange={(e) => setFormData({...formData, farmName: e.target.value})}
              placeholder="Enter farm name"
            />
          </div>
          <div>
            <label>Owner Name:</label>
            <input 
              type="text" 
              onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
              placeholder="Enter owner name"
            />
          </div>
        </>
      )}
      
      {step === 2 && (
        <>
          <div>
            <label>Email:</label>
            <input 
              type="email" 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Enter email"
            />
          </div>
          <div>
            <label>Phone:</label>
            <input 
              type="tel" 
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="Enter phone"
            />
          </div>
        </>
      )}
      
      {step === 3 && (
        <>
          <div>
            <label>Farm Type:</label>
            <select 
              onChange={(e) => setFormData({...formData, farmType: e.target.value})}
            >
              <option value="dairy">Dairy Cattle</option>
              <option value="beef">Beef Cattle</option>
              <option value="mixed">Mixed</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label>Number of Animals:</label>
            <input 
              type="number" 
              onChange={(e) => setFormData({...formData, animalCount: e.target.value})}
              min="1"
            />
          </div>
        </>
      )}
      
      <div style={{ marginTop: '20px' }}>
        {step > 1 && <button onClick={handlePrev}>Back</button>}
        {step < 3 && <button onClick={handleNext}>Next</button>}
        {step === 3 && <button onClick={handleSubmit}>Submit</button>}
      </div>
    </div>
  );
}