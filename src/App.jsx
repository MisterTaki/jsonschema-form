import React, { Fragment } from 'react';
import { hot } from 'react-hot-loader'; // eslint-disable-line import/no-extraneous-dependencies
import { LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import _ from 'lodash';

import JsonSchemaForm from './JsonSchemaForm';

const targetJson = {
  providers: {
    template: [
      {
        label: 'template-1',
        value: '1',
      },
      {
        label: 'template-2',
        value: '2',
      },
      {
        label: 'template-3',
        value: '3',
      },
    ],
    content: [
      {
        label: 'content-1',
        value: '1',
      }
    ]
  },
  initialValues: {},
  fields: [
    {
      key: 'template-first',
      provider: 'template',
      type: 'select',
    },
    {
      key: 'template-second',
      provider: 'template',
      type: 'select',
    },
    {
      key: 'content',
      type: {
        $$condition: 'content.type',
        1: 'input',
        2: 'select',
        3: 'input',
      },
      provider: {
        $$condition: 'content.type',
        2: 'content',
      },
      multiple: true,
      display: {
        $$condition: 'content.display',
      },
    }
  ],
  conditions: {
    content: {
      type: {
        target: 'template-first',
      },
      display: [
        {
          target: 'template-first',
          value: '2',
        },
        '||',
        {
          target: 'template-second',
          value: '2',
        },
      ],
    },
  },
};

const App = () => (
  <LocaleProvider locale={zhCN}>
    <Fragment>
      <JsonSchemaForm
        wrapperClassName="JsonSchemaForm-wrapper"
        {...targetJson}
      />
    </Fragment>
  </LocaleProvider>
);

export default hot(module)(App);
