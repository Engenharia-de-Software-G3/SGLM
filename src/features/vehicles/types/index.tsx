export interface VeiculoFormulario {
  marca: string;
  modelo: string;
  placa: string;
  ano: string;
  cor: string;
  chassi: string;
  quilometragemAtual: string;
  quilometragemCompra: string;
  dataCompra: string;
  local: string;
  nome: string;
  observacoes: string;
  status: 'Disponível' | 'Locado' | 'Manutenção';
  arquivo?: File | null;
}