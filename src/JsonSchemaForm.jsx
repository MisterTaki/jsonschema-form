import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import {
  Form,
  Input,
  Button,
  Icon,
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
      uuid: {},
      keys: {},
    };
  }

  componentWillMount() {
    this.initData();
  }

  componentDidMount() {

  }

  initData = (props) => {
    const { keyType, linkages } = CONSTANT;
    // init keyType & linkage & state
    const { fields } = props || this.props;
    const uuid = {};
    const keys = {};

    fields.forEach((item) => {
      const {
        key,
        type,
        linkage,
        dynamic = false,
      } = item;

      keyType[key] = type;

      if (linkage) {
        if (!linkages[linkage]) {
          linkages[linkage] = {};
        }
        linkages[linkage][key] = true;
      }

      if (dynamic) {
        uuid[key] = 1;
        keys[key] = [0];
      }
    })

    this.setState({
      uuid,
      keys,
    });
  }

  handleAdd = (key) => {
    const { uuid, keys } = this.state;
    const nextKeys = keys[key].concat(uuid[key]);
    this.setState({
      uuid: {
        ...uuid,
        [key]: uuid[key] + 1,
      },
      keys: {
        ...keys,
        [key]: nextKeys,
      },
    });
  }

  handleRemove = (key, k) => {
    const { keys } = this.state;
    const { [key]: targetKeys } = keys;
    if (targetKeys.length === 1) {
      return false;
    }
    return this.setState({
      keys: {
        ...keys,
        [key]: targetKeys.filter(item => item !== k),
      },
    });
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

  getDecoratorKey = (parentKeys, key, k) => {
    if (parentKeys.length > 0) {
      if (k !== undefined) {
        return `${parentKeys.join('.')}.${key}.${k}`;
      }
      return `${parentKeys.join('.')}.${key}`;
    }
    if (k !== undefined) {
      return `${key}.${k}`;
    }
    return key;
  }

  renderFormItems = (fields = [], parentKeys = []) => {
    const { fieldsCommon, form: { getFieldDecorator } } = this.props;

    return fields.map((item) => {
      const {
        formItemProps = {},
        componentProps = {},
        key,
        label,
        type,
        provider,
        linkage,
        dynamic,
        fieldDecorator = {},
      } = item;

      let linkageValue;

      const { components, prefixCls } = CONSTANT;

      // cascade
      if (linkage) {
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
          return this.renderFormItems(targetProvider[linkageValue], parentKeys.concat([key]));
        }
        targetProvider = providers[provider];
        return this.renderFormItems(targetProvider, parentKeys.concat([key]));
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

      if (dynamic) {
        const { keys: { [key]: keys = [] } } = this.state;
        return (
          <Fragment key={key}>
            {keys.map((k, index) => (
              <FormItem
                key={`${key}-${k}`}
                label={index === 0 ? label : ''}
                className={`${prefixCls}-item`}
                {...finalFormItemProps}
              >
                {getFieldDecorator(this.getDecoratorKey(parentKeys, key, k), fieldDecorator)(
                  <TargetComponent
                    {...componentProps}
                    {...componentExtraProps}
                  />
                )}
                {keys.length > 1 ? (
                  <Button
                    style={{ width: '100%' }}
                    className={`${prefixCls}-minus-btn`}
                    type="dashed"
                    onClick={() => this.handleRemove(key, k)}
                  >
                    <Icon type="minus" />
                    Subtract field
                  </Button>
                ) : null}
              </FormItem>
            ))}
            <FormItem>
              <Button
                style={{ width: '100%' }}
                className={`${prefixCls}-add-btn`}
                type="dashed"
                onClick={() => this.handleAdd(key)}
              >
                <Icon type="plus" />
                Add field
              </Button>
            </FormItem>
          </Fragment>
        );
      }

      return (
        <FormItem
          key={key}
          label={label}
          className={`${prefixCls}-item`}
          {...finalFormItemProps}
        >
          {getFieldDecorator(this.getDecoratorKey(parentKeys, key), fieldDecorator)(
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
