import axios from 'axios';

const api = 'https://viacep.com.br/ws';

export const getAddressByCep = (cep: string) => {
  return axios.get(`${api}/${cep}/json/`);
};
