import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { StepOne } from './steps/step-one';
import { StepTwo } from './steps/step-two';
import { StepThree } from './steps/step-three';
import { useNavigate } from 'react-router-dom';

interface RegisterStepIndicatorProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setShowSuccess: (value: boolean) => void;
}

const steps = [
  { title: 'Dados Pessoais', subtitle: 'dados pessoais do cliente' },
  { title: 'Dados Bancários', subtitle: 'dados bancários do cliente' },
  { title: 'CNH', subtitle: 'dados da CNH do cliente' },
];

export const RegisterStepIndicator = ({
  currentStep,
  setCurrentStep,
  setShowSuccess,
}: RegisterStepIndicatorProps) => {
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/clientes');
      }, 2000);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepOne />;
      case 2:
        return <StepTwo />;
      case 3:
        return <StepThree />;
      default:
        return null;
    }
  };

  const romanNumerals = ['I', 'II', 'III'];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              {romanNumerals[currentStep - 1]}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{steps[currentStep - 1].title}</h3>
              <p className="text-sm text-gray-600">
                Abaixo estão os campos em relação aos {steps[currentStep - 1].subtitle}.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="p-6">
        {renderStepContent()}

        <div className="flex justify-end mt-8">
          <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
            {currentStep === steps.length ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Concluir Cadastro
              </>
            ) : (
              <>
                Próxima Etapa
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
