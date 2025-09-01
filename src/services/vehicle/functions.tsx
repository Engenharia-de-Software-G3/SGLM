import { api } from '@/lib/axios';
import {
  VehicleData,
  CreateVehicleInterface,
  ListManyVehicles,
  SingleVehicleResponse,
  UpdateVehicleInterface,
  GetVehiclesParams,
} from './types';

export function formatDateToServer(dateString: string | undefined): string {
  if (!dateString) return '';
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
}

export function formatDateToClient(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}

export async function getVehiclesFunction({status, page, search}: GetVehiclesParams): Promise<ListManyVehicles> {
  try {

    console.log('🔍 Querying by status:', status, 'page:', page, 'search:', search);

    const response = await api.get('/veiculos', {
      params: {
        status: status ? status : undefined,
        page: page ? page : undefined,
        search: search ? search : undefined,
      },
    });

    if (response.status !== 200) {
      throw new Error('Erro ao buscar veículos');
    }

    const data = response.data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.veiculos.map((vehicle: any) => {
      try {
        vehicle.ano = vehicle.anoModelo.fabricacao + '/' + vehicle.anoModelo.modelo;
        vehicle.dataCompra = formatDateToClient(vehicle.dataCompra);
        vehicle.dataVenda = formatDateToClient(vehicle.dataVenda);
        vehicle.dataAtualizacao = formatDateToClient(vehicle.dataAtualizacao);
        vehicle.dataCadastro = formatDateToClient(vehicle.dataCadastro);
      } catch (error) {
        console.error('❌ Error formatting vehicle:', error);
      }

      return vehicle;
    })

    return data as ListManyVehicles;
  } catch (error) {
    console.error('❌ Error fetching vehicles:', error);
    throw error;
  }
}

export async function createVehicleFunction(input: CreateVehicleInterface) {
  try {
    
    const { dataCadastro, dataVenda, dataCompra, dataAtualizacao, ano } = input;

    const payload = { ...input, anoModelo: {
      fabricacao: ano.split('/')[0],
      modelo: ano.split('/')[1],
    }, 
    dataCadastro: formatDateToServer(dataCadastro),
    dataVenda: formatDateToServer(dataVenda),
    dataCompra: formatDateToServer(dataCompra),
    dataAtualizacao: formatDateToServer(dataAtualizacao),
   };

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
    const response = await api.get(`/veiculos/${id}`);

    if (!response) {
      throw new Error('Veículo não encontrado');
    }

    const vehicle: VehicleData = {...response.data.veiculo, dataCompra: response.data.veiculo.dataCompra.split('T')[0]};

    vehicle.dataCompra = vehicle.dataCompra.split('T')[0];
    vehicle.ano = response.data.veiculo.anoModelo.fabricacao + '/' + response.data.veiculo.anoModelo.modelo;

    console.log(vehicle.ano)

    return vehicle as SingleVehicleResponse;
  } catch (error) {
    console.error('❌ Error fetching vehicle by id:', error);
    throw error;
  }
}

export async function updateVehicleFunction(id: string, payload: UpdateVehicleInterface) {
  try {
    console.log('✏️ Updating vehicle:', id, payload);


    const send = { 
      renavam: payload.renavam || undefined,
      cor: payload.cor || undefined,
      quilometragem: payload.quilometragemAtual || undefined,
      quilometragemNaCompra: payload.quilometragemCompra || undefined,
      dataCompra: formatDateToServer(payload.dataCompra) || undefined,
      local: payload.local || undefined,
      nome: payload.nome || undefined,
      observacoes: payload.observacoes || undefined,
      status: payload.status || undefined,
    }

    const response = await api.put(`/veiculos/${id}`, send);

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
