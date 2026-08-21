import { api } from '../client';

export const authRouter = {
  // Overriding typical POST to GET as per Postman Collection
  login() {
    return api.get('/Login');
  }
};
