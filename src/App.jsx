import React from 'react';
import { hot } from 'react-hot-loader'; // eslint-disable-line import/no-extraneous-dependencies
import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';

import JsonSchemaForm from './JsonSchemaForm';

const jsonSchema = {
  providers: {
    template: [
      {
        label: 'webview',
        value: 'webview',
      },
      {
        label: 'posterImage',
        value: 'posterImage',
      },
    ],
    webview: [
      {
        label: 'webview-1',
        value: 'webview-1',
      },
    ],
    'linkage-select': {
      webview: [
        {
          label: 'linkage-webview-1',
          value: 'linkage-webview-1',
        },
      ],
      posterImage: [
        {
          label: 'linkage-posterImage-1',
          value: 'linkage-posterImage-1',
        },
      ],
    },
    fields: {
      webview: [
        {
          label: 'webview_select',
          key: 'webview_select',
          type: 'select',
          provider: 'webview',
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
      label: 'input',
      key: 'input',
      type: 'input',
      dynamic: true,
    },
    {
      label: 'template',
      key: 'template',
      type: 'select',
      provider: 'template',
      componentProps: {
        allowClear: true,
      },
    },
    {
      label: 'linkage-select',
      key: 'linkage-select',
      type: 'select',
      linkage: 'template',
      provider: 'linkage-select'
    },
    {
      label: 'linkage',
      key: 'fields',
      type: 'fields',
      linkage: 'template',
      provider: 'fields',
    },
  ],
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
