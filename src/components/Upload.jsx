import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  Button,
  Upload,
  Icon,
} from 'antd';

const prefixCls = 'jsonSchema-upload';

const AdvancedUpload = (props) => {
  // const { _options: options = [], ...selectProps } = props;

  return (
    <Upload>
      <Button>
        <Icon type="upload" /> Click to Upload
      </Button>
    </Upload>
  );
}

export default AdvancedUpload;
