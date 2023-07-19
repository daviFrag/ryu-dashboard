import axios from 'axios';
import { NetTopology } from './zustand/net';

const BACK_URL = 'http://127.0.0.1:7000';

export const loadTopology = (topo: NetTopology) => {
  return axios.post(BACK_URL + '/topology', topo, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
