import { api } from '@/lib/axios';
import {
  VehicleData,
  CreateVehicleInterface,
  ListManyVehicles,
  SingleVehicleResponse,
  UpdateVehicleInterface,
} from './types';

// Interface for raw vehicle data from the backend
interface RawVehicle {
  id: string | number;
  placa: string;
  marca: string;
  modelo: string;
  ano?: string;
  anoModelo?: {
    fabricacao?: number;
    modelo?: number;
  };
  cor: string;
  chassi: string;
  renavam?: string;
  motor?: string;
  quilometragem?: number;
}

function convertDateToISO(dateString: string): string {
  if (!dateString) return new Date().toISOString();

  const [day, month, year] = dateString.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString();
}

function parseAno(anoString: string): { fabricacao: number; modelo: number } {
  if (!anoString) return { fabricacao: new Date().getFullYear(), modelo: new Date().getFullYear() };

  const [fabricacao, modelo] = anoString.split('/');
  return {
    fabricacao: parseInt(fabricacao) || new Date().getFullYear(),
    modelo: parseInt(modelo) || new Date().getFullYear(),
  };
}

export async function getVehiclesFunction(): Promise<ListManyVehicles> {
  try {
    console.log('🚗 Fetching vehicles from:', import.meta.env.VITE_API_URL);
    const response = await api.get('/veiculos');

    if (response.status !== 200) {
      throw new Error('Erro ao buscar veículos');
    }

    const data = response.data;
    console.log('📊 Raw API response:', data);

    const vehicles = (data.veiculos || []).map((vehicle: RawVehicle) => ({
      id: vehicle.id,
      placa: vehicle.placa,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      ano: vehicle.anoModelo
        ? `${vehicle.anoModelo.fabricacao || ''}/${vehicle.anoModelo.modelo || ''}`
        : vehicle.ano || '',
      cor: vehicle.cor,
      chassi: vehicle.chassi,
      renavam: vehicle.renavam,
      motor: vehicle.motor,
      quilometragem: vehicle.quilometragem?.toString() || '0',
    }));

    console.log('✅ Mapped vehicles:', vehicles);

    return {
      vehicles,
      ultimoDoc: data.paginacao?.proximoDocId || null,
    };
  } catch (error) {
    console.error('❌ Error fetching vehicles:', error);
    throw error;
  }
}

export async function createVehicleFunction(payload: CreateVehicleInterface) {
  try {
    console.log('➕ Creating vehicle with payload:', payload);

    const anoData = parseAno(payload.ano);

    const backendPayload = {
      chassi: payload.chassi,
      placa: payload.placa.replace(/-/g, ''),
      modelo: payload.modelo,
      marca: payload.marca,
      renavam: payload.renavam || '',
      anoFabricacao: anoData.fabricacao,
      anoModelo: anoData.modelo,
      quilometragem: parseInt(payload.quilometragemAtual) || 0,
      quilometragemNaCompra: parseInt(payload.quilometragemCompra) || 0,
      dataCompra: convertDateToISO(payload.dataCompra),
      cor: payload.cor,
      local: payload.local || '',
      nome: payload.nome || '',
      observacoes: payload.observacoes || '',
    };

    console.log('📤 Sending to backend:', backendPayload);

    const response = await api.post('/veiculos', backendPayload);

    if (response.status === 201) {
      console.log('✅ Vehicle created successfully:', response.data);
      return response.data;
    }

    throw new Error('Erro ao criar veículo');
  } catch (error: unknown) {
    console.error('❌ Error creating vehicle:', error);
    if (error instanceof Error) {
      console.error('❌ Error response:', error.message);
    }
    throw error;
  }
}

export async function getVehicleFunction(chassi: string) {
  try {
    console.log('🔍 Fetching vehicle by chassi:', chassi);

    const response = await api.get('/veiculos', {
      params: {
        filtros: JSON.stringify({ chassi }),
      },
    });

    console.log('📊 Vehicle search response:', response.data);

    if (!response.data.veiculos || response.data.veiculos.length === 0) {
      throw new Error('Veículo não encontrado');
    }

    const vehicle: RawVehicle = response.data.veiculos[0];

    const mappedVehicle = {
      id: vehicle.id,
      placa: vehicle.placa,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      ano: vehicle.anoModelo
        ? `${vehicle.anoModelo.fabricacao || ''}/${vehicle.anoModelo.modelo || ''}`
        : vehicle.ano || '',
      cor: vehicle.cor,
      chassi: vehicle.chassi,
      renavam: vehicle.renavam,
      motor: vehicle.motor,
      quilometragem: vehicle.quilometragem?.toString() || '0',
    };

    console.log('✅ Mapped vehicle:', mappedVehicle);
    return mappedVehicle as SingleVehicleResponse;
  } catch (error) {
    console.error('❌ Error fetching vehicle by chassi:', error);
    throw error;
  }
}

export async function updateVehicleFunction(chassi: string, payload: UpdateVehicleInterface) {
  try {
    console.log('✏️ Updating vehicle:', chassi, payload);

    const response = await api.put(`/veiculos/${chassi}`, payload);

    if (response.status !== 200) {
      throw new Error('Erro ao atualizar veículo');
    }

    console.log('✅ Vehicle updated successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error updating vehicle:', error);
    throw error;
  }
}

export async function deleteVehicleFunction(chassi: string) {
  try {
    console.log('🗑️ Deleting vehicle:', chassi);

    const response = await api.delete(`/veiculos/${chassi}`);

    if (response.status !== 200) {
      throw new Error('Erro ao deletar veículo');
    }

    console.log('✅ Vehicle deleted successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting vehicle:', error);
    throw error;
  }
}

export async function getVehicleByPlaca(placa: string): Promise<VehicleData> {
  try {
    const cleanPlaca = placa.replace(/[^A-Za-z0-9]/g, '');
    const response = await api.get('/veiculos', {
      params: {
        filtros: JSON.stringify({ placa: cleanPlaca }),
      },
    });

    const data = response.data;
    if (!data.veiculos || data.veiculos.length === 0) {
      throw new Error('Veículo não encontrado');
    }

    const vehicle: RawVehicle = data.veiculos[0];
    return {
      id: vehicle.id,
      placa: vehicle.placa,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      ano: vehicle.anoModelo
        ? `${vehicle.anoModelo.fabricacao}/${vehicle.anoModelo.modelo}`
        : vehicle.ano || '',
      cor: vehicle.cor,
      chassi: vehicle.chassi,
      renavam: vehicle.renavam,
      motor: vehicle.motor,
      quilometragem: vehicle.quilometragem?.toString() || '0',
    };
  } catch (error) {
    console.error('Erro ao buscar veículo por placa:', error);
    throw new Error('Erro ao buscar veículo por placa');
  }
}
