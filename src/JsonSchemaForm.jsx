import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import {
  Form,
  Input,
  Button,
} from 'antd';

import * as Components from './components';

const { Item: FormItem } = Form;

const CONSTANT = {
  form: undefined,
  prefixCls: 'jsonSchema-form',
  keyType: {},
  linkages: {},
  components: {
    input: Input,
  },
};

Object.keys(Components).forEach((key) => {
  CONSTANT['components'][key.toLocaleLowerCase()] = Components[key];
})

@Form.create({
  onValuesChange(props, changedValues, allValues) {
    const { form: { setFieldsValue }, keyType, linkages } = CONSTANT;
    Object.keys(changedValues).forEach((key) => {
      const linkageKeyMap = linkages[key];
      if (linkageKeyMap) {
        Object.keys(linkageKeyMap).forEach((item) => {
          const linkageType = keyType[item];
          if (linkageType === 'select') {
            setFieldsValue({ [item]: undefined });
          }
        })
      }
    })
  },
})
export default class JsonSchemaForm extends PureComponent {
  static propTypes = {
    propForm: PropTypes.func,
    className: PropTypes.string,
    wrapperClassName: PropTypes.string,
    layout: PropTypes.oneOf(['horizontal', 'vertical', 'inline']),
    hideRequiredMark: PropTypes.bool,
    providers: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.array, PropTypes.object])),
    fields: PropTypes.arrayOf(PropTypes.shape({
      formItemProps: PropTypes.object,
      componentProps: PropTypes.object,
      key: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
      label: PropTypes.string,
      type: PropTypes.string,
      provider: PropTypes.string,
      fieldDecorator: PropTypes.object,
    })),
    fieldsCommon: PropTypes.shape({
      formItemProps: PropTypes.object,
      componentProps: PropTypes.object,
    }),
    submitLoading: PropTypes.bool,
    submitLabel: PropTypes.string,
    onSubmit: PropTypes.func,
  }

  static defaultProps = {
    propForm: form => console.log('propForm:', form),
    className: '',
    wrapperClassName: '',
    layout: 'horizontal',
    hideRequiredMark: false,
    providers: {},
    fields: [],
    fieldsCommon: {},
    submitLoading: false,
    submitLabel: 'submit',
    onSubmit: (e, { validateFieldsAndScroll }) => {
      e.preventDefault();
      validateFieldsAndScroll((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values);
        }
      });
    },
  }

  constructor(props) {
    super(props);

    const { propForm, form } = props;

    CONSTANT.form = form;
    propForm(form);

    this.state = {

    };
  }

  getCmpExtraProps = (type, provider, linkageValue) => {
    switch (type) {
      case 'select': {
        const { providers } = this.props;
        let targetProvider;
        if (linkageValue) {
          const targetProviderMap = providers[provider] || {};
          targetProvider = targetProviderMap[linkageValue];
        } else {
          targetProvider = providers[provider];
        }
        return {
          _options: targetProvider || [],
        };
      }
      default:
        return {};
    }
  }

  renderFormItems = (fields = []) => {
    const { fieldsCommon, form: { getFieldDecorator } } = this.props;

    return fields.map((item) => {
      const {
        formItemProps = {},
        componentProps = {},
        key,
        label,
        type,
        linkage,
        provider,
        fieldDecorator = {},
      } = item;

      let linkageValue;

      const { keyType, linkages, components } = CONSTANT;

      keyType[key] = type;

      // cascade
      if (linkage) {
        if (!linkages[linkage]) {
          linkages[linkage] = {};
        }
        if (key) {
          linkages[linkage][key] = true;
        }
        const { form: { getFieldValue } } = this.props;
        linkageValue = getFieldValue(linkage);
        if (linkageValue === undefined) {
          return null;
        }
      }

      if (type === 'fields') {
        const { providers = {} } = this.props;
        let targetProvider;
        if (linkageValue) {
          targetProvider = providers[provider] || {};
          return this.renderFormItems(targetProvider[linkageValue]);
        }
        targetProvider = providers[provider];
        return this.renderFormItems(targetProvider);
      }

      const TargetComponent = components[type];

      if (!TargetComponent) {
        console.warn(`JsonSchemaForm doesn't support type:'${type}' component.`);
        return null;
      }

      const { formItemProps: commonFormItemProps = {} } = fieldsCommon;

      const finalFormItemProps = {
        ...commonFormItemProps,
        ...formItemProps,
      };

      const componentExtraProps = this.getCmpExtraProps(type, provider, linkageValue);

      return (
        <FormItem
          key={key}
          label={label}
          className={`${CONSTANT.prefixCls}-item`}
          {...finalFormItemProps}
        >
          {getFieldDecorator(key, fieldDecorator)(
            <TargetComponent
              {...componentProps}
              {...componentExtraProps}
            />
          )}
        </FormItem>
      )
    });
  }

  render() {
    const {
      form,
      layout,
      hideRequiredMark,
      wrapperClassName,
      className,
      submitLabel,
      onSubmit,
      fields,
    } = this.props;

    const { prefixCls } = CONSTANT;

    const wrapperCls = classNames(wrapperClassName, `${prefixCls}-wrapper`);
    const cls = classNames(className, prefixCls);

    return (
      <div className={wrapperCls}>
        <Form
          className={cls}
          layout={layout}
          hideRequiredMark={hideRequiredMark}
          onSubmit={(e) => onSubmit(e, form)}
        >
          <div className={`${prefixCls}-fields-wrapper`}>
            {this.renderFormItems(fields)}
          </div>
          <FormItem>
            <Button
              className={`${prefixCls}-submit-btn`}
              type="primary"
              htmlType="submit"
            >
              {submitLabel}
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
};
