import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

pdfMake.vfs = pdfFonts.vfs;

export interface ClientData {
  nomeCompleto: string;
  cpf: string;
  cnpj?: string;
  rg?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  nacionalidade?: string;
  estadoCivil?: string;
  profissao?: string;
}

export interface VehicleData {
  marca: string;
  modelo: string;
  placa: string;
  renavam?: string; // Made optional to align with /src/services/vehicle/types
  chassi: string;
  motor?: string; // Made optional to align with /src/services/vehicle/types
  cor: string;
  ano: string;
  quilometragem?: string; // Made optional to align with /src/services/vehicle/types
}

export interface LocacaoData {
  id: string;
  clienteId: string;
  nomeLocatario: string;
  placaVeiculo: string;
  dataInicio: string;
  dataFim: string;
  valor: number | string;
  periodicidadePagamento: string;
  status?: 'ativa' | 'finalizada' | 'cancelada';
  dataCadastro?: string; // Made optional to align with LocacaoInterface
  dataAtualizacao?: string; // Made optional to align with LocacaoInterface
}


export interface ContractData {
  id: string;
  client: ClientData;
  vehicle: VehicleData;
  locacao: LocacaoData;
}

function numeroExtenso(n: number): string {
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dezenas = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  if (n === 0) return 'zero';
  if (n < 10) return unidades[n];
  if (n < 20) return especiais[n - 10];
  if (n < 100) {
    const d = Math.floor(n / 10);
    const u = n % 10;
    return dezenas[d] + (u > 0 ? ' e ' + unidades[u] : '');
  }
  if (n < 1000) {
    const c = Math.floor(n / 100);
    const resto = n % 100;
    let str = centenas[c];
    if (resto === 0) return str;
    if (resto < 100) str += ' e ' + numeroExtenso(resto);
    return str;
  }
  return ''; // Para valores maiores, expandir se necessário
}

const company = {
  nome: 'SGLM',
  endereco: 'Endereço da Empresa Exemplo',
  cnpj: '00.000.000/0000-00',
  donoNome: 'Erick Gomes',
  donoNacionalidade: 'Brasileiro',
  donoStatusCivil: 'Solteiro',
  donoProfissao: 'Desenvolvedor',
  donoCidade: 'João Pessoa',
  donoCpf: '000.000.000-00',
  cidade: 'João Pessoa',
  email: 'contato@sg lm.com',
  whatsapp: '(00) 00000-0000',
};

const periodMap: Record<string, string> = {
  'Diária': 'diariamente',
  'Semanal': 'semanalmente',
  'Quinzenal': 'quinzenalmente',
  'Mensal': 'mensalmente',
};

const template = `
CONTRATO DE LOCAÇÃO DE VEÍCULO	

Pelo presente instrumento particular, de um lado:

[Nome da Empresa], pessoa jurídica de direito privado, estabelecido à [Endereço da Empresa], inscrito no CNPJ/MF sob o [CNPJ da Empresa], neste ato representada por seu Procurador o [Nome do dono da Empresa], [Nacionalidade do dono da Empresa], [Status Civíl do Dono da Empresa], [Profissão do dono da Empresa], [Cidade em que o Dono da Empresa Reside], portador do CPF/MF de nº [CPF do dono da Empresa] doravante denominado LOCADORA, e de outro lado;
[Nome do Cliente], [Nacionalidade do Cliente], [Status Civíl do Cliente], [Profissão do Cliente], portador da cédula de identidade nº [Nº do RG do Cliente], inscrito no CPF/MF nº [CPF do Cliente], e-mail [Email do Cliente], telefone [Telefone do Cliente], sediado [Endereço do Cliente], doravante denominada LOCATÁRIO, têm entre si como justo e contratado o que segue:
  
CLÁUSULA 1ª – DO OBJETO DO CONTRATO

1.1. Por meio deste contrato regula-se a locação do veículo:

· Veículo de marca: [Marca do veículo], Modelo: [Modelo do Veículo], Placa: [Placa do Veículo], Renavam nº [Renavam do Veículo], Chassi: [Chassi do Veículo], Motor: [Motor do Veículo], Cor: [Cor do Veículo], Ano: [Ano do Veículo], Quilometragem: [Quilometragem Atual do Veículo].

1.2. O veículo descrito acima será utilizado exclusivamente pelo LOCATÁRIO, não sendo permitido sub-rogar para terceiros os direitos por ele obtidos através do presente contrato, nem permitir que outra pessoa conduza o referido veículo sem a inequívoca e expressa autorização do LOCADOR, sob pena de rescisão contratual, multa de R$ 400,00 (quatrocentos reais) bem como responsabilização total por qualquer ato ou dano em relação ao veículo, inclusive os provenientes de caso fortuito ou força maior.  

CLÁUSULA 2ª – DO HORÁRIO DO ALUGUEL E LOCAL DE COLETA E DEVOLUÇÃO DO VEÍCULO
  
2.1. O veículo em questão permanecerá na posse do LOCATÁRIO por período integral, de segunda à domingo.  
  


2.2. O LOCATÁRIO deverá apresentar o veículo ao LOCADOR 01 (uma) vez por mês para a realização de vistoria, em data e endereço por este designado. 
  
2.3. A não apresentação do veículo no prazo e local supracitados acarretará ao LOCATÁRIO multa de R$ 20,00 (vinte reais) por dia de atraso, além de possível rescisão contratual.  
  
CLÁUSULA 3ª – DAS OBRIGAÇÕES DO LOCADOR
  
3.1. O veículo objeto do presente contrato será submetido à manutenção preventiva periódica, ou em decorrência de problemas mecânicos e/ou elétricos aos quais o LOCATÁRIO não deu causa, em oficina mecânica designada pelo LOCADOR, nos termos a seguir:
 
3.1.1. Troca do Kit de Tração: Sempre que houver barulho anormal e/ou apresentar desgaste excessivo;

3.1.2. Troca de Pneus: Quando estiverem no nível do Tread Wear Indicator (TWI).
  
3.2. Caso alguma das manutenções supracitadas, seja necessária antes ou durante o período estipulado, deverá ser arcada integralmente pelo LOCADOR, salvo nos casos em que o LOCATÁRIO tenha dado causa ao evento, por mau uso.
  
3.3. Os gastos decorrentes da manutenção preventiva periódica supracitada, bem como o valor pago pela mão de obra do profissional que realizará o serviço serão suportados pelo LOCADOR.
  
3.4. As manutenções que não foram citadas na cláusula 3.1 também terão que ser arcadas pelo LOCADOR, quando forem necessárias e atestadas pelo mecânico do mesmo.
  
3.5. No caso de problemas mecânicos e/ou elétricos (quebra, defeito e/ou desgaste) percebidos em ocasião diversa da manutenção preventiva periódica, o LOCATÁRIO deverá informar imediatamente ao LOCADOR, bem como apresentar o veículo a este, no prazo de 24 horas, para reparo a ser realizado em oficina mecânica designada pelo LOCADOR.

3.6. O LOCADOR obriga-se a manter Proteção Veicular contratada para o veículo objeto do presente contrato, com proteção para terceiros limitada a R$ 20.000,00 (vinte mil reais).
*OBS: Qualquer despesa com terceiros além deste valor (R$ 20.000,00), será de inteira responsabilidade do LOCATÀRIO.
3.7. É de responsabilidade do LOCADOR o pagamento do IPVA, Licenciamento, bem como o pagamento do Seguro Obrigatório do veículo objeto do presente contrato.

3.8. O LOCADOR não se obrigata a disponibilizar veículo reserva e não se responsabiliza caso o LOCATÁRIO não possa dirigir devido à indisponibilidade do veículo.

CLÁUSULA 4ª – DAS OBRIGAÇÕES DO LOCATÁRIO
  
4.1. É de responsabilidade do LOCATÁRIO a observância básica dos itens do veículo como calibragem dos pneus, nível de óleo do motor, nível de fluido de freio, observância da marcação, sistema de iluminação e sinalização, entre outros.

4.1.1. Quaisquer danos/avarias ao veículo serão apurados ao final do contrato e os custos de reparação serão arcados pelo LOCATÁRIO.

4.1.2. Os custos de revisões reparatórias causadas pelo mau uso dos veículos correrão por conta do LOCATÁRIO. Caso a bomba de combustível queime ou danifique por falta de combustível ou negligência quando o veículo estiver em posse do LOCATÁRIO, este deverá arcar com o valor integral da peça, mão de obra, reboque do veículo e demais valores inerentes ao reparo.

4.2. É de responsabilidade do LOCATÁRIO o pagamento de quaisquer multas relativas às infrações de trânsito inerentes à utilização do veículo cometidas na vigência deste contrato.
  
4.2.1. O pagamento das multas pelo LOCATÁRIO deve ser feito imediatamente após a constatação no sistema do DETRAN - PB, independentemente de qualquer procedimento, seja transferência de pontos ou recurso.
  
4.2.2. O LOCATÁRIO concorda que o LOCADOR irá indicá-lo como condutor/infrator responsável pelas infrações de trânsito apuradas durante a locação, nos termos do artigo 257, parágrafos 1º, 3º, 7º e 8º do Código de Trânsito. A partir da indicação, o LOCATÁRIO terá legitimidade para se defender perante o órgão autuador.
  
4.2.3. Qualquer questionamento sobre eventual improcedência de infração de trânsito deverá ser feito exclusivamente pelo LOCATÁRIO perante o órgão autuador.
  
4.2.4. Caso o LOCATÁRIO opte por recorrer da autuação e sendo o recurso vitorioso, o LOCADOR lhe fornecerá cópia da guia de pagamento para que ele solicite ao órgão o reembolso.
  
4.3. Em ocorrendo multas acima mencionadas, quando a autuação da infração chegar ao LOCADOR, deverá o LOCATÁRIO comparecer em local e data estipulados pelo LOCADOR para a assinatura do auto de infração com o intuito de transferência dos pontos para a sua CNH, sob pena de pagar ao LOCADOR a quantia de R$ 200,00 (duzentos reais), em caso de perda do prazo para a transferência dos pontos.
  
4.4. Caso o veículo seja rebocado por estacionamento irregular, ou outra hipótese a qual tenha dado causa, o LOCATÁRIO deverá arcar com todos os custos necessários para a recuperação do veículo junto ao respectivo depósito público. O LOCATÁRIO deverá arcar também com multa contratual de R$ 30,00 (trinta reais) por dia pelo período em que a moto estiver no depósito, a título de lucro cessante.
  
4.5. Caso o LOCATÁRIO estacione em local diferente do informado ao LOCADOR conforme declaração assinada, o LOCATÁRIO deverá arcar com qualquer dano ou prejuízo pecuniário ao veículo, inclusive inerentes a caso fortuito ou força maior.
  
4.6. É proibido o LOCATÁRIO acionar o serviço de Proteção Veicular do veículo objeto deste contrato sem a expressa permissão do LOCADOR, sob pena de multa de R$ 200,00 (duzentos reais), além da obrigação de arcar com eventuais custos de reboques e/ou transportes necessários, caso o serviço de Proteção Veicular não mais os disponibilize devido ao limite de utilizações mensais deste serviço.
  
4.7. O LOCATÁRIO se responsabiliza por quaisquer acessórios do veículo que estiverem em sua posse, como por exemplo chave de ignição, documento do veículo, etc. Caso algum acessório do veículo seja perdido ou danificado, o LOCATÁRIO deverá arcar com todos os custos necessários à reposição.
  
4.8. É proibido o LOCATÁRIO sair do perímetro urbano denominado Grande [Nome da Cidade] com o veículo objeto deste contrato sem a autorização expressa e por escrito do LOCADOR, sob pena de multa de R$ 150,00 (cento e cinquenta reais), além do pagamento dos custos para o retorno do veículo para [Nome da Cidade], bem como o pagamento de eventuais danos ocorridos com o veículo, inclusive caso fortuito e força maior.
  
4.9. Em caso de roubo ou furto do veículo, o LOCATÁRIO se compromete a avisar imediatamente ao LOCADOR, bem como a comparecer à delegacia de polícia mais próxima da residência do LOCADOR para registrar a ocorrência.
  


4.10. O LOCATÁRIO se compromete a comparecer à sede da empresa de Proteção Veicular, ou outro local especificado pela mesma, a fim de cumprir com procedimento de indenização do veículo.
  
4.11. Caso o LOCATÁRIO se envolva em sinistro estando sob efeito de álcool/entorpecentes, ou se não fizer o teste de embriaguez requerido pela autoridade, este deverá pagar ao LOCADOR o valor da tabela FIPE do veículo, caso a indenização da Proteção Veicular seja negada e/ou com todos os custos inerentes à recuperação do veículo junto ao depósito, em caso de reboque.

4.12. O LOCATÁRIO deve manter as características originais do veículo, portanto a instalação de adesivos, pinturas especiais, equipamentos ou acessórios no veículo alugado está sujeita à autorização prévia, por escrito, do LOCADOR. Neste caso, a retirada dos mesmos e a recuperação do veículo ao seu estado original são de responsabilidade do LOCATÁRIO.

4.13. É de responsabilidade do LOCATÁRIO o pagamento e a troca do óleo do motor a cada 1.000km rodados, de acordo com as especificações do fabricante do veículo. Será exigido foto do painel do veículo e nota fiscal da compra do óleo.

4.14. Aceitar que o LOCADOR promova, pelos meios processuais de que venha a dispor, o seu chamamento aos feitos judiciais promovidos por terceiros decorrentes de eventos com o veículo alugado, cabendo-lhe assumir o polo passivo nas demandas, inclusive quanto aos valores reclamados por terceiros e/ou para assegurar os direitos regressivos do LOCADOR. O LOCATÁRIO será responsável pelo pagamento de lucros cessantes que terceiros possam pleitear judicialmente em razão de conduta irregular do LOCATÁRIO.

4.15. Em caso de pneu furado, o LOCATÁRIO será responsável por todos os custos relacionados ao conserto, incluindo a substituição de câmara e/ou pneu e serviços de borracheiro. O LOCATÁRIO poderá acionar o serviço de reboque da Proteção Veicular, desde que autorizado previamente pelo LOCADOR, exclusivamente para transporte do veículo até a borracharia. Caso o LOCATÁRIO continue utilizando o veículo com o pneu furado, estará sujeito a arcar com os custos de eventuais danos à câmara, ao pneu e à roda.

CLÁUSULA 5ª – DAS OBRIGAÇÕES DECORRENTES DE COLISÕES E AVARIAS DO VEÍCULO

5.1. É de responsabilidade do LOCATÁRIO o pagamento do reboque, taxas e reparos ao veículo objeto do presente contrato ou a veículo de outrem na ocorrência de acidentes e colisões sofridas na vigência do presente contrato quando não contempladas pela cobertura da Proteção Veicular contratada para este veículo, independente de dolo, culpa, negligência, imprudência ou imperícia do LOCATÁRIO.

5.2. Na ocorrência da necessidade do pagamento da cota de participação da Proteção Veicular, a quantia será integralmente de responsabilidade do LOCATÁRIO, no valor de R$ 550,00 (quinhentos e cinquenta reais)
  
5.3. Será de responsabilidade do LOCATÁRIO o pagamento de taxas e diárias para a liberação do veículo decorrentes de reboque realizado pelo Poder Público, nos casos supracitados.

5.4. A responsabilidade determinada nos itens supracitados permanece estabelecida, inclusive, caso o LOCATÁRIO não se encontre no interior do veículo objeto do presente contrato.

CLÁUSULA 6ª – DO PAGAMENTO EM RAZÃO DA LOCAÇÃO DO VEÍCULO

6.1. O LOCATÁRIO pagará ao LOCADOR o valor de R$ [Valor Locacao] ([Valor Extenso]), [Periodicidade], realizado às terças feiras, até às 23:59h, sempre de forma antecipada ao período correspondente.

6.2. Caso o pagamento seja feito após a data acordada, o valor sofrerá um acréscimo de R$ 15,00 (quinze reais) a título de multa, bem como um acréscimo de R$ 7,00 (sete reais) por dia de atraso a título de juros.

6.3. Fica o LOCATÁRIO obrigado a encaminhar o comprovante de pagamento ao LOCADOR no dia do pagamento, valendo o mesmo como recibo.

CLÁUSULA 7ª – DA QUANTIA CAUÇÃO

7.1. Estabelecem as partes, a QUANTIA CAUÇÃO no valor total de R$ 0,00 (-------------------), a ser integralizada até o ato de retirada do veículo.

7.2. Ao término da vigência do presente contrato caberá ao LOCADOR restituir a integralidade da QUANTIA CAUÇÃO ao LOCATÁRIO no prazo de 25 (vinte e cinco) dias úteis a contar da devolução do veículo por parte do LOCATÁRIO conforme as seguintes CONDIÇÕES:

· A devolução do veículo em perfeito estado, em condição equivalente à observada ao último checklist de vistoria e após vistoria feita por vídeo enviada para o whatsapp do LOCADOR.
· A inexistência de aluguéis, multas de trânsito ou multas por descumprimento contratual pendentes por parte do LOCATÁRIO.
· Após feita a manutenção necessário do veículo, caso haja necessidade.
· Após descontados quaisquer outros débitos pendentes.

7.3. Na hipótese de não estarem observadas as condições acima dispostas, poderá o LOCADOR utilizar-se da QUANTIA CAUÇÃO para adimplir eventuais débitos ou reparar danos causados ao veículo que não decorram do desgaste natural e utilização adequada do bem, hipótese na qual só será de direito do LOCATÁRIO a quantia remanescente a tal utilização da QUANTIA CAUÇÃO, se houver.

7.4. Os gastos com o combustível do veículo deverão ser arcados integralmente pelo LOCATÁRIO, devendo sempre devolver o veículo com a mesma quantidade de combustível contida no veículo quando da entrega do mesmo pelo LOCADOR, sob pena de desconto na QUANTIA CAUÇÃO do valor necessário a atingir tal quantidade de combustível.

7.5. Qualquer valor inerente a cobrança por passagem, estacionamento ou pedágio do veículo durante a posse do LOCATÁRIO deverá por este ser arcado. Caso o LOCADOR seja cobrado por qualquer valor desta natureza, o LOCATÁRIO deverá reembolsá-lo imediatamente.

7.6. Caso o veículo seja devolvido sujo, será cobrada a lavagem simples (R$ 15,00) ou especial (R$ 45,00), dependendo do seu estado. Na hipótese de lavagem especial será cobrada também 1 diária de locação ou quantas forem necessárias até a disponibilização do veículo, limitadas a 10 diárias.

7.7. Quando o documento do veículo não for devolvido, será cobrado o reembolso das despesas para obtenção de 2ª via e, diante da impossibilidade do veículo não ser alugado.

CLÁUSULA 8ª – DA VIGÊNCIA E RESCISÃO

8.1. O presente contrato se inicia na data de sua assinatura com prazo mínimo de 30 dias de locação, após esse prazo a vigência é indeterminada, salvo manifestação de qualquer das partes em contrário, motivada por resilição ou descumprimento contratual ocasionado pela parte contrária.

8.1.1. Em caso de devolução antecipada o LOCATÁRIO pagará uma multa no valor de 50% das diárias canceladas, sem que recaiam quaisquer ônus ao LOCADOR.


8.2. É assegurado às partes a resilição do presente CONTRATO a qualquer tempo, bastando, para tanto, dar ciência a outra parte, cabendo ao LOCATÁRIO a devolução do veículo ao LOCADOR em local designado por este no seguinte prazo:

· 24 horas a contar da comunicação ao LOCADOR, no caso em que o LOCATÁRIO resilir o presente contrato.
· 24 horas a contar do momento em que teve ciência da resilição, quando realizada pelo LOCADOR.

8.3. O contrato poderá ser considerado rescindido de pleno direito pelo LOCADOR, independentemente de qualquer notificação, e este, sem mais formalidades, providenciará a retomada do veículo, sem que isso enseje ao LOCATÁRIO qualquer direito de retenção, indenização ou devolução da quantia caução, quando:

8.3.1. O veículo não for devolvido na data, hora e local previamente ajustados;

8.3.2. Ocorrer o uso inadequado do veículo;

8.3.3. Ocorrer apreensão do veículo locado por autoridades competentes;

8.3.4. O LOCATÁRIO não quitar seus débitos nos respectivos vencimentos;

8.3.5. O LOCATÁRIO acumular uma dívida superior a R$ 100,00 (cem reais) e não a quite imediatamente, caso no qual o veículo deverá ser entregue em local determinado pelo LOCADOR, imediatamente, sob pena de multa de R$ 150,00 (cento e cinquenta reais por dia), salvo acordo contrário entre as partes.

8.4. Fica desde já pactuada a total inexistência de vínculo trabalhista entre as partes do presente contrato, sendo indevida toda e qualquer incidência das obrigações previdenciárias e os encargos sociais, não havendo entre as partes qualquer tipo de subordinação e controle típicos de relações de emprego.

8.5. Nos termos do artigo 265 do Código Civil Brasileiro, inexiste solidariedade, seja contratual ou legal entre a Locador e o LOCATÁRIO, razão pela qual, com a locação e a efetiva retirada do veículo alugado, o LOCATÁRIO assume sua posse autônoma para todos os fins de direito, responsabilizando-se por eventuais indenizações decorrentes do uso e circulação do veículo, cuja responsabilidade perdurará até a efetiva devolução do veículo alugado.

CLÁUSULA 9ª – DA DEVOLUÇÃO DO VEÍCULO

9.1. Ao término do contrato, o veículo deve ser devolvido em local, dia e hora indicado pelo LOCADOR, sob pena de multa de R$ 50,00 (cinquenta reais) por dia.

9.2. A não devolução de veículo pelo LOCATÁRIO, após notificação realizada pelo LOCADOR, configura crime de APROPRIAÇÃO INDÉBITA conforme artigo 168 do Código Penal Brasileiro, com pena de reclusão de um a quatro anos de prisão e multa.

CLÁUSULA 10ª - DAS DISPOSIÇÕES GERAIS

10.1. Quaisquer notificações e comunicações enviadas sob esse contrato podem ser realizadas de forma eletrônica, através do e-mail [Email da Empresa] ou do WhatsApp [WhatsApp da Empresa], escritas ou por correspondência com aviso de recebimento aos endereços constantes do preâmbulo. Em havendo alteração do endereço ficam as partes obrigadas a fornecerem tal informação.

10.2. Todos os valores, despesas e encargos da locação constituem dívidas líquidas e certas para pagamento à vista, passíveis de cobrança executiva.

10.3. Eventuais tolerâncias do LOCADOR para com o LOCATÁRIO no cumprimento das obrigações ajustadas neste contrato constituem mera liberalidade, não importando em hipótese alguma em novação ou renúncia, permanecendo íntegras as cláusulas e condições aqui contratadas.

10.4. O LOCATÁRIO autoriza o LOCADOR a coletar, usar e divulgar a sua imagem para fins de cadastro, defesa e/ou promoção.

10.5. O LOCATÁRIO concorda que a sua assinatura no contrato implica ciência e adesão por si, seus herdeiros/sucessores a estas cláusulas.

10.6. Fica eleito o foro desta cidade e Comarca de [Nome da Cidade], como competente para dirimir quaisquer questões que possam advir da aplicação do presente CONTRATO, por mais privilegiado que seja ou venha a ser, qualquer Foro.




10.7. E, por estarem assim, justas e contratadas, as partes firmam o presente instrumento em 02 (duas) vias de igual teor e forma, para que produza seus efeitos legais, após ter lido o seu conteúdo ter sido claramente entendido e aceito.

PARÁGRAFO ÚNICO - Reajuste de Valor da Mensalidade:
 
O valor da mensalidade será reajustado anualmente, com referência ao índice de preços ao consumidor amplo (IPCA), calculado pelo Instituto Brasileiro de Geografia e Estatística (IBGE), para corrigir eventuais aumentos de preços de manutenções e todos os custos relacionados à motocicleta.
 
O reajuste será realizado anualmente, com base no índice de variação do IPCA do ano anterior, e será aplicado ao valor da mensalidade a partir do mês de janeiro do ano subsequente.
 
Exemplo: se o IPCA do ano anterior foi de 10%, o valor da mensalidade será reajustado em 10% a partir do mês de janeiro do ano subsequente."

[Nome da Cidade], [Data Atual].
  
  
____________________________________________  
[Nome do Dono da Empresa]
LOCADORA  
  
  
  
____________________________________________ 
[Nome do Cliente]
LOCATÁRIO  
  
  
  
___________________________________             ___________________________________  
                    Testemunha         	            	                           Testemunha  
`;



export function generateContractPDF(contractData: ContractData, mode: 'download' | 'open' = 'download') {
  const { client, vehicle, locacao } = contractData;

  const valorNumerico = typeof locacao.valor === 'string' ? Number(locacao.valor) : locacao.valor;
  if (isNaN(valorNumerico)) {
    throw new Error('Valor da locação inválido');
  }
  const valorLocacao = valorNumerico.toFixed(2);

  let filled = template
    .replace(/\[Nome da Empresa\]/g, company.nome)
    .replace(/\[Endereço da Empresa\]/g, company.endereco)
    .replace(/\[CNPJ da Empresa\]/g, company.cnpj)
    .replace(/\[Nome do dono da Empresa\]/g, company.donoNome)
    .replace(/\[Nacionalidade do dono da Empresa\]/g, company.donoNacionalidade)
    .replace(/\[Status Civíl do Dono da Empresa\]/g, company.donoStatusCivil)
    .replace(/\[Profissão do dono da Empresa\]/g, company.donoProfissao)
    .replace(/\[Cidade em que o Dono da Empresa Reside\]/g, company.donoCidade)
    .replace(/\[CPF do dono da Empresa\]/g, company.donoCpf)
    .replace(/\[Email da Empresa\]/g, company.email)
    .replace(/\[WhatsApp da Empresa\]/g, company.whatsapp)
    .replace(/\[Nome do Cliente\]/g, client.nomeCompleto)
    .replace(/\[Nacionalidade do Cliente\]/g, client.nacionalidade || 'Brasileiro')
    .replace(/\[Status Civíl do Cliente\]/g, client.estadoCivil || 'Solteiro')
    .replace(/\[Profissão do Cliente\]/g, client.profissao || 'Autônomo')
    .replace(/\[Nº do RG do Cliente\]/g, client.rg || 'Não informado')
    .replace(/\[CPF do Cliente\]/g, client.cpf)
    .replace(/\[Email do Cliente\]/g, client.email || 'Não informado')
    .replace(/\[Telefone do Cliente\]/g, client.telefone || 'Não informado')
    .replace(/\[Endereço do Cliente\]/g, client.endereco || 'Não informado')
    .replace(/\[Marca do veículo\]/g, vehicle.marca || 'Não informado')
    .replace(/\[Modelo do Veículo\]/g, vehicle.modelo || 'Não informado')
    .replace(/\[Placa do Veículo\]/g, vehicle.placa)
    .replace(/\[Renavam do Veículo\]/g, vehicle.renavam || 'Não informado')
    .replace(/\[Chassi do Veículo\]/g, vehicle.chassi || 'Não informado')
    .replace(/\[Motor do Veículo\]/g, vehicle.motor || 'Não informado')
    .replace(/\[Cor do Veículo\]/g, vehicle.cor || 'Não informado')
    .replace(/\[Ano do Veículo\]/g, vehicle.ano || 'Não informado')
    .replace(/\[Quilometragem Atual do Veículo\]/g, vehicle.quilometragem || '0')
    .replace(/\[Nome da Cidade\]/g, company.cidade)
    .replace(/\[Data Atual\]/g, new Date().toLocaleDateString('pt-BR'))
    .replace(/\[Valor Locacao\]/g, valorLocacao)
    .replace(/\[Valor Extenso\]/g, numeroExtenso(valorNumerico) + ' reais')
    .replace(/\[Periodicidade\]/g, periodMap[locacao.periodicidadePagamento] || 'semanalmente');

    const docDefinition: TDocumentDefinitions = {
      pageMargins: [40, 60, 40, 60], 
      content: [
        {
          text: filled,
          fontSize: 12,
          lineHeight: 1.2,
        },
      ],
    };

  const pdf = pdfMake.createPdf(docDefinition);

  if (mode === 'download') {
    pdf.download(`contrato_${contractData.id}.pdf`);
  } else {
    pdf.open();
  }

  // TODO: Enviar por email
  // pdf.getBlob((blob) => {
  //   // Use emailjs or similar to send blob as attachment to client.email
  // });
}