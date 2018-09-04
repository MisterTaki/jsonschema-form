import React from 'react';
import { hot } from 'react-hot-loader'; // eslint-disable-line import/no-extraneous-dependencies
import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';

import JsonSchemaForm from './JsonSchemaForm';

const jsonSchema = {
  providers: {
    template: [
      {
        label: 'template-select',
        key: 'template-select',
        type: 'select',
        provider: 'template-select'
      },
      {
        label: 'template-fields',
        key: 'template-fields',
        type: 'fields',
        linkage: 'template-select',
        provider: 'template-fields',
      },
    ],
    'template-select': [
      {
        label: 'webview',
        value: 'webview',
      },
      {
        label: 'posterImage',
        value: 'posterImage',
      },
    ],
    'template-fields': {
      webview: [
        {
          label: 'input',
          key: 'input',
          type: 'input',
        },
      ],
      posterImage: [
        {
          label: 'posterImage_media',
          key: 'posterImage_media',
          type: 'upload',
        },
      ],
    },
  },
  fields: [
    {
      label: 'template',
      key: 'template',
      type: 'fields',
      provider: 'template',
      dynamic: true,
    },
  ],
  initialValues: {
    template: [
      {
        'template-select': 'webview',
        'template-fields': {
          input: 'fields-1',
        },
      },
      {
        'template-select': 'webview',
        'template-fields': {
          input: 'fields-2',
        },
      },
    ],
  },
};

const App = () => (
  <LocaleProvider locale={zhCN}>
    <JsonSchemaForm
      wrapperClassName="JsonSchemaForm-wrapper"
      {...jsonSchema}
    />
  </LocaleProvider>
);

export default hot(module)(App);
