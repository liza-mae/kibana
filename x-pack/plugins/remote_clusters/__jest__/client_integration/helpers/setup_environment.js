/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import axios from 'axios';

import { setHttpClient } from '../../../public/services/api';
import { init as initHttpRequests } from './http_requests';

export const setupEnvironment = () => {
  // axios has a $http like interface so using it to simulate $http
  setHttpClient(axios.create());

  const { server, httpRequestsMockHelpers } = initHttpRequests();

  return {
    server,
    httpRequestsMockHelpers,
  };
};
