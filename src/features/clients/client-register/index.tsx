import { useState } from 'react';
import { Layout } from '../../../shared/components/layout';
import { useNavigate } from 'react-router-dom';
import { ReturnHeader } from '@/shared/components/return-header';
import { SuccessRegisterCard } from './components/success-register-card';
import { RegisterStepIndicator } from './components/register-step-indicator';

export const ClientRegister = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/clientes');
    }
  };

  if (showSuccess) {
    return (
      <Layout showHeader={false}>
        <div className="flex-1 flex items-center justify-center">
          <SuccessRegisterCard />
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={false}>
      <div className="flex-1 overflow-auto">
        <ReturnHeader title="Cadastro" onBack={handleBack} />
        <RegisterStepIndicator
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          setShowSuccess={setShowSuccess}
        />
      </div>
    </Layout>
  );
};
