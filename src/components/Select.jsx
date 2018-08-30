import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Select } from 'antd';

const prefixCls = 'jsonSchema-select';

const { Option } = Select;

const AdvancedSelect = (props) => {
  const { _options: options = [], ...selectProps } = props;

  return (
    <Select {...selectProps}>
      {options.map(({ label, value }) => (
        <Option
          key={value}
          value={value}
        >
          {label}
        </Option>
      ))}
    </Select>
  );
}

export default AdvancedSelect;
