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

import { parseFieldItem } from './utils';
import { CONDITION } from './constant/keys';
import * as Components from './components';

const { Item: FormItem } = Form;

let CONSTANT = {
  form: undefined,
  prefixCls: 'jsonSchema-form',
  keyType: {},
  components: {
    input: Input,
  },
};

Object.keys(Components).forEach((key) => {
  CONSTANT['components'][key.toLocaleLowerCase()] = Components[key];
})

const filterValues = (values) => {
  Object.keys(values).forEach((key) => {
    if (_.isArray(values[key])) {
      values[key] = values[key].filter(item => item !== undefined);
    }
    if (typeof values[key] === 'object') {
      filterValues(values[key]);
    }
  })
}

@Form.create({
  onFieldsChange(props, fields) {
    // TODO 检测级联变化 重置选择选项
    console.log('fields', fields);
  },
})
export default class JsonSchemaForm extends PureComponent {
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
          filterValues(values)
          console.log('Received filterValues of form: ', values);
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
    this.setState({
      ...this.initState(),
    });
    console.log('CONSTANT:', CONSTANT);
  }

  componentDidMount() {

  }

  initState = (props = this.props, parentKeys = []) => {
    const { keyType } = CONSTANT;
    const { fields, initialValues } = props;
    let uuid = {};
    let keys = {};

    fields.forEach((item) => {
      const {
        key,
        type,
        multiple = false,
        fields: childrenFields = [],
      } = item;

      let keyName = key;

      if (parentKeys.length > 0) {
        keyName = `${parentKeys.join('.')}.${key}`;
      }

      keyType[keyName] = type;

      if (multiple) {
        const initialValue = _.get(initialValues, keyName, []);
        const initialNum = initialValue.length || 1;
        uuid[keyName] = initialNum;
        keys[keyName] = Array.from(new Array(initialNum), (val, index) => index);
      }

      if (type === 'fields') {
        const { uuid: otherUuid, keys: otherKeys } = this.initState(
          { fields: childrenFields, initialValues },
          [...parentKeys, key]
        );
        uuid = {
          ...uuid,
          ...otherUuid,
        };
        keys = {
          ...keys,
          ...otherKeys,
        };
      }
    });

    return {
      uuid,
      keys,
    };
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

  handleOnChange = (item) => {
    const {
      form: {
        getFieldDecorator,
        getFieldsValue,
        getFieldValue,
        setFieldsValue,
        resetFields,
      },
      providers = {},
    } = this.props;
    const { type } = item;

    switch (type) {
      case 'select':

        break;

      default:
        break;
    }

    console.log('handleOnChange', item);
  }

  getCmpExtraProps = (type, provider) => {
    switch (type) {
      case 'select': {
        const { providers } = this.props;
        let targetProvider;
        targetProvider = providers[provider];
        return {
          _options: targetProvider || [],
        };
      }
      default:
        return {};
    }
  }

  getDecoratorKey = (parentKeys, key) => {
    if (parentKeys.length > 0) {
      return `${parentKeys.join('.')}.${key}`;
    }
    return key;
  }

  renderMultipleItem = (key, keys, label, finalFormItemProps, renderChildren, isFields = false) => {
    const { prefixCls } = CONSTANT;
    return (
      <Fragment key={key}>
        {keys.map((k, index) => (
          <FormItem
            key={`${key}-${k}`}
            className={`${prefixCls}-item`}
            label={index === 0 ? label : ''}
            {...finalFormItemProps}
          >
            {renderChildren(k)}
            {keys.length > 1 ? (
              <Fragment>
                <Button
                  style={{ width: '100%' }}
                  className={`${prefixCls}-minus-btn`}
                  type="dashed"
                  onClick={() => this.handleRemove(key, k)}
                >
                  <Icon type="minus" />
                </Button>
                {/* split line */}
                {isFields && (
                  <div
                    style={{
                      marginTop: 20,
                      borderBottom: '1px dashed #d9d9d9',
                    }}
                  />
                )}
              </Fragment>
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
          </Button>
        </FormItem>
      </Fragment>
    );
  }

  renderFormItems = (fields = [], parentKeys = []) => {
    const {
      form: {
        getFieldDecorator,
        getFieldsValue,
        getFieldValue,
        setFieldsValue,
        resetFields,
      },
      providers = {},
      fieldsCommon = {},
      initialValues = {},
      conditions = {},
    } = this.props;

    const formValues = getFieldsValue();

    return fields.map((item) => {
      const {
        key,
        label,
        type,
        provider,
        multiple,
        display,
        fields: childrenFields = [],
        formItemProps = {},
        componentProps = {},
        fieldDecorator = {},
      } = parseFieldItem(formValues, item, conditions);

      if (display === false) {
        return null;
      }

      if (type === 'fields') {
        if (multiple) {
          const { keys: { [key]: keys = [] } } = this.state;
          return this.renderMultipleItem(
            key,
            keys,
            '',
            {},
            (k) => this.renderFormItems(childrenFields, [...parentKeys, `${key}[${k}]`]),
            true,
          );
        }
        return this.renderFormItems(childrenFields, [...parentKeys, key]);
      }

      const { components, prefixCls } = CONSTANT;
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

      const componentExtraProps = this.getCmpExtraProps(type, provider);

      const finalComponentProps = {
        ...componentProps,
        ...componentExtraProps,
        onChange: () => {
          this.handleOnChange(item);

          // 默认
          const { onChange } = componentProps;
          if (onChange) {
            onChange(...arguments);
          }
        },
      };

      if (multiple) {
        const { keys: { [key]: keys = [] } } = this.state;
        const formItem = this.renderMultipleItem(
          key,
          keys,
          label,
          finalFormItemProps,
          (k) => {
            const targetMultipleKey = this.getDecoratorKey(parentKeys, `${key}[${k}]`);
            const multipleItem = (
              getFieldDecorator(targetMultipleKey, {
                initialValue: _.get(initialValues, targetMultipleKey),
                ...fieldDecorator,
              })(
                <TargetComponent
                  {...finalComponentProps}
                />
              )
            );
            // if (type === 'select') {
            //   const targetSelectValue = getFieldValue(targetMultipleKey);
            //   const hasTargetValue = providers[provider].some(({ value }) => value === targetSelectValue);
            //   if (!hasTargetValue) {
            //     const { multiple: selectMultiple } = componentProps;
            //     const resetValue = selectMultiple ? [] : undefined;
            //     setFieldsValue({ [targetMultipleKey]: resetValue });
            //   }
            // }
            return multipleItem;
          },
        );

        return formItem;
      }

      const targetKey = this.getDecoratorKey(parentKeys, key);

      const formItem = (
        <FormItem
          key={key}
          label={label}
          className={`${prefixCls}-item`}
          {...finalFormItemProps}
        >
          {getFieldDecorator(targetKey, {
            initialValue: _.get(initialValues, targetKey),
            ...fieldDecorator,
          })(
            <TargetComponent
              {...finalComponentProps}
            />
          )}
        </FormItem>
      );

      // if (type === 'select') {
      //   const targetSelectValue = getFieldValue(targetKey);
      //   const hasTargetValue = providers[provider].some(({ value }) => value === targetSelectValue);
      //   if (!hasTargetValue) {
      //     const { multiple: selectMultiple } = componentProps;
      //     const resetValue = selectMultiple ? [] : undefined;
      //     setFieldsValue({ [targetKey]: resetValue });
      //   }
      // }

      return formItem;
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
              style={{ width: '100%' }}
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
