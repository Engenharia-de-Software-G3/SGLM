export interface VeiculoFormulario {
  marca: string;
  modelo: string;
  placa: string;
  ano: string;
  cor: string;
  combustivel: string;
  categoria: string;
  renavam: string;
  chassi: string;
  motor: string;
  portas: string;
  assentos: string;
  transmissao: string;
  valorDiario: string;
  quilometragemCompra?: string;
  quilometragemAtual: string;
  proximaManutencao: string;
  numeroDocumento?: string;
  dataCompra?: string;
  local?: string;
  nome?: string;
  observacoes?: string;
  status: 'Disponível' | 'Locado' | 'Manutenção';
}
