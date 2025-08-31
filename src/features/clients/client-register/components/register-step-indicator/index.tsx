import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Check, ArrowRight, XCircle } from 'lucide-react';
import { StepOne } from './steps/step-one';
import { StepTwo } from './steps/step-two';
import { StepThree } from './steps/step-three';
import {
  stepOneSchema,
  stepTwoSchema,
  stepThreeSchema,
  type RegisterStepIndicatorProps,
  type StepOneData,
  type StepTwoData,
  type StepThreeData,
  initialStepOneData,
  initialStepTwoData,
  initialStepThreeData,
} from './@types';
import { useState } from 'react';


const steps = [
  { title: 'Dados Pessoais', subtitle: 'dados pessoais do cliente' },
  { title: 'Dados Bancários', subtitle: 'dados bancários do cliente' },
  { title: 'CNH', subtitle: 'dados da CNH do cliente' },
];

export const RegisterStepIndicator = ({
  currentStep,
  setCurrentStep,
  setShowSuccess,
  onFinish,
}: RegisterStepIndicatorProps) => {
  const [stepOneData, setStepOneData] = useState<StepOneData>(initialStepOneData);
  const [stepTwoData, setStepTwoData] = useState<StepTwoData>(initialStepTwoData);
  const [stepThreeData, setStepThreeData] = useState<StepThreeData>(initialStepThreeData);

  const handleNext = () => {
    if (currentStep === 1) {
      const parsed = stepOneSchema.safeParse(stepOneData);
      if (!parsed.success) {
        toast('Preencha todos os campos obrigatórios no passo 1.', { 
          icon: <XCircle className='text-red-500' size={20} />,
        });
        return;
      }
    }

    if (currentStep === 2) {
      const parsed = stepTwoSchema.safeParse(stepTwoData);
      if (!parsed.success) {
        toast('Preencha todos os campos obrigatórios no passo 2.', { 
          icon: <XCircle className='text-red-500' size={20} />,
        });
        return;
      }
    }

    if (currentStep === 3) {
      const parsed = stepThreeSchema.safeParse(stepThreeData);
      if (!parsed.success) {
        toast('Preencha todos os campos obrigatórios no passo 3.', { 
          icon: <XCircle className='text-red-500' size={20} />,
        });
        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      const hoje = new Date();
      const formattedDate = hoje.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      const newClient = {
        id: Date.now(),
        name: stepOneData.nome,
        description: `Desde ${formattedDate}`,
        ...stepOneData,
        ...stepTwoData,
        ...stepThreeData,
        status: 'Ativo',
        statusColor: 'bg-green-100 text-green-800',
      };

      setShowSuccess(true);

      if (onFinish) onFinish(newClient);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepOne data={stepOneData} setData={setStepOneData} />;
      case 2:
        return <StepTwo data={stepTwoData} setData={setStepTwoData} />;
      case 3:
        return <StepThree data={stepThreeData} setData={setStepThreeData} />;
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
