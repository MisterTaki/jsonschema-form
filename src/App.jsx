import React from 'react';
import { hot } from 'react-hot-loader'; // eslint-disable-line import/no-extraneous-dependencies
import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';

import JsonSchemaForm from './JsonSchemaForm';

const App = () => (
  <LocaleProvider locale={zhCN}>
    <JsonSchemaForm
      className="JsonSchemaForm"
    />
  </LocaleProvider>
);

export default hot(module)(App);
