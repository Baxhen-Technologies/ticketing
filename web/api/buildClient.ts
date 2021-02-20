import axios from 'axios';

export const buildClient = ({ req }: { req?: { headers: object } }) => {
  if (typeof window === 'undefined') {
    return axios.create({
      baseURL: 'http://www.baxhen-ticketing-prod.xyz',
      headers: req.headers,
    });
  } else {
    return axios.create({
      baseURL: '',
    });
  }
};
