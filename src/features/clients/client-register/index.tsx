import { useState } from 'react';
import { Layout } from '../../../shared/components/layout';
import { useNavigate } from 'react-router-dom';
import { ReturnHeader } from '@/shared/components/return-header';
import { SuccessRegisterCard } from './components/success-register-card';
import { RegisterStepIndicator } from './components/register-step-indicator';
import { Toaster } from 'sonner';
import type { NewClient } from './components/register-step-indicator/@types';
import { CreateClientInterface } from '@/services/client/types';
import { useCreateClientMutation } from '@/services/client';

export const ClientRegister = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const { mutateAsync: createClient } = useCreateClientMutation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/clientes');
    }
  };

  async function handleFinish (newClient: NewClient)  {
    const payload: CreateClientInterface = {
      cpf: newClient.cpfcnpj,
      dadosPessoais: {
        nome: newClient.nome,
        dataNascimento: newClient.dataNascimento,
      },
      endereco: {
        cep: newClient.cep,
        rua: newClient.rua,
        numero: newClient.numero,
        bairro: newClient.bairro,
        cidade: newClient.cidade,
        estado: newClient.estado,
      },
      contato: {
        email: newClient.email,
        telefone: newClient.telefone,
      }, 
      documentos: {
        cnh: {
          numero: newClient.cnhNumero,
          categoria: newClient.categoria,
          dataValidade: newClient.validade,
        },
      },
    }


    try {
      await createClient(payload)
      setTimeout(() => {
        navigate('/clientes')
      }, 1000)
    } catch (error) {
      console.log({error})
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
        <Toaster />
        <RegisterStepIndicator
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          setShowSuccess={setShowSuccess}
          onFinish={handleFinish}
        />
      </div>
    </Layout>
  );
};
