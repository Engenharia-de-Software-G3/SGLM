import { api } from '@/lib/axios';
import {
  VehicleData,
  CreateVehicleInterface,
  ListManyVehicles,
  SingleVehicleResponse,
  UpdateVehicleInterface,
} from './types';

// function convertDateToISO(dateString: string): string {
//   if (!dateString) {
//     const today = new Date();
//     return today.toISOString().split('T')[0];
//   }

//   const [day, month, year] = dateString.split('/');
//   const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
//   return date.toISOString().split('T')[0];
// }


export async function getVehiclesFunction(): Promise<ListManyVehicles> {
  try {
    const response = await api.get('/veiculos');

    if (response.status !== 200) {
      throw new Error('Erro ao buscar veículos');
    }

    const data = response.data;

    return data as ListManyVehicles;
  } catch (error) {
    console.error('❌ Error fetching vehicles:', error);
    throw error;
  }
}

export async function createVehicleFunction(payload: CreateVehicleInterface) {
  try {
    console.log('➕ Creating vehicle with payload:', payload);

    const response = await api.post('/veiculos', payload);

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

export async function getVehicleFunction(id: string) {
  try {
    console.log('🔍 Fetching vehicle by id:', id);

    const response = await api.get(`/veiculos/${id}`);

    console.log('📊 Vehicle search response:', response.data);

    if (!response) {
      throw new Error('Veículo não encontrado');
    }

    const vehicle: VehicleData = response.data;

    return vehicle as SingleVehicleResponse;
  } catch (error) {
    console.error('❌ Error fetching vehicle by id:', error);
    throw error;
  }
}

export async function updateVehicleFunction(id: string, payload: UpdateVehicleInterface) {
  try {
    console.log('✏️ Updating vehicle:', id, payload);

    const response = await api.put(`/veiculos/${id}`, payload);

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

export async function deleteVehicleFunction(id: string) {
  try {
    console.log('🗑️ Deleting vehicle:', id);

    const response = await api.delete(`/veiculos/${id}`);

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
    // VALIDAÇÃO CRÍTICA - evita busca com placa vazia
    if (!placa || placa.trim() === '') {
      throw new Error('Placa não fornecida');
    }

    const cleanPlaca = placa.replace(/[^A-Za-z0-9]/g, '');
    
    // Verifique novamente após a limpeza
    if (cleanPlaca === '') {
      throw new Error('Placa inválida');
    }

    const response = await api.get('/veiculos', {
      params: {
        filtros: JSON.stringify({ placa: cleanPlaca }),
      },
    });

    const data = response.data;
    if (!data.veiculos || data.veiculos.length === 0) {
      throw new Error('Veículo não encontrado');
    }

    return data.veiculos[0];
  } catch (error) {
    console.error('Erro ao buscar veículo por placa:', error);
    throw error; // Mantenha o erro original
  }
}
