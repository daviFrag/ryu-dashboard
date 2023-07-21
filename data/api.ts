import axios from 'axios';
import { NetTopology } from './zustand/net';

export const BACK_URL = 'http://127.0.0.1:7000';

export const loadTopology = async (topo: NetTopology) => {
  return await axios.post(BACK_URL + '/api/topology', topo, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
