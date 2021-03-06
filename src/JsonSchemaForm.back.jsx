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

const REGEXP = /\[[0-9]+\]/g;

let CONSTANT = {
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

const getChangedName = (fields) => {
  const keys = Object.keys(fields);
  if (keys.length > 1) {
    return fields.name;
  }
  return getChangedName(fields[keys[0]]);
}

@Form.create({
  onFieldsChange(props, fields) {
    console.log('fields', fields);
    // console.log('getChangedName', getChangedName(fields));
    // const { form: { resetFields }, keyType, linkages } = CONSTANT;
    // const changedName = getChangedName(fields);
    // if (changedName !== undefined) {
    //   console.log('getChangedName REGEXP', changedName.replace(REGEXP, ''));
    //   const replacedChangedName = changedName.replace(REGEXP, '');
    //   if (keyType[replacedChangedName] === 'select') {
    //     const linkageArr = linkages[replacedChangedName];
    //     if (linkageArr && linkageArr.length > 0) {
    //       resetFields(linkageArr);
    //     }
    //   }
    // }
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

  initState = (props, parentKeys = []) => {
    const { keyType, linkages } = CONSTANT;
    const { fields, initialValues } = props || this.props;
    let uuid = {};
    let keys = {};

    fields.forEach((item) => {
      const {
        key,
        type,
        linkage,
        dynamic = false,
      } = item;

      let keyName = key;

      if (parentKeys.length > 0) {
        keyName = `${parentKeys.join('.')}.${key}`;
      }

      keyType[keyName] = type;

      if (linkage) {
        if (!linkages[linkage]) {
          linkages[linkage] = [];
        }
        linkages[linkage].push(keyName);
      }

      if (dynamic) {
        const initialValue = _.get(initialValues, [...parentKeys, key], []);
        const initialNum = initialValue.length || 1;
        uuid[keyName] = initialNum;
        keys[keyName] = Array.from(new Array(initialNum), (val, index) => index);
      }

      if (type === 'fields') {
        const { providers } = props || this.props;
        let otherFields = providers[key] || [];
        if (linkage) {
          otherFields = Object.keys(otherFields).reduce((before, current) => {
            return before.concat(otherFields[current]);
          }, []);
          console.log('otherFields', otherFields);
        }
        const { uuid: otherUuid, keys: otherKeys } = this.initState(
          { fields: otherFields, providers, initialValues },
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

    const oldLinkages = { ...linkages };
    CONSTANT.linkages = {};
    this.initLinkages(oldLinkages);

    return {
      uuid,
      keys,
    };
  }

  initLinkages = (oldLinkages, props = this.props, parentKeys = []) => {
    const { linkages } = CONSTANT;
    const { fields, providers } = props;

    fields.forEach((item) => {
      const { key, type, linkage } = item;

      let keyName = key;

      if (parentKeys.length > 0) {
        keyName = `${parentKeys.join('.')}.${key}`;
      }

      const linkagesVal = oldLinkages[key];
      if (linkagesVal) {
        linkages[keyName] = linkagesVal;
      }

      if (type === 'fields') {
        const { providers } = props;
        let otherFields = providers[key] || [];
        if (linkage) {
          otherFields = Object.keys(otherFields).reduce((before, current) => {
            return before.concat(otherFields[current]);
          }, []);
          console.log('otherFields', otherFields);
        }
        this.initLinkages(
          oldLinkages,
          { fields: otherFields, providers },
          [...parentKeys, key]
        );
      }
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

  getDecoratorKey = (parentKeys, key) => {
    if (parentKeys.length > 0) {
      return `${parentKeys.join('.')}.${key}`;
    }
    return key;
  }

  renderDynamicItem = (key, keys, label, finalFormItemProps, renderChildren, isFields = false) => {
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
    const { fieldsCommon, initialValues, form: { getFieldDecorator } } = this.props;

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
        linkageValue = getFieldValue(this.getDecoratorKey(parentKeys, linkage));
        if (linkageValue === undefined) {
          return null;
        }
      }

      if (type === 'fields') {
        const { providers = {} } = this.props;
        const targetProvider = linkageValue
          ? providers[provider][linkageValue] || []
          : providers[provider] || [];

        if (!dynamic) {
          return this.renderFormItems(targetProvider, [...parentKeys, key]);
        }

        const { keys: { [key]: keys = [] } } = this.state;

        return this.renderDynamicItem(
          key,
          keys,
          '',
          {},
          (k) => this.renderFormItems(targetProvider, [...parentKeys, `${key}[${k}]`]),
          true,
        );
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

        const formItem = this.renderDynamicItem(
          key,
          keys,
          label,
          finalFormItemProps,
          (k) => {
            const dynamicItem = (
              getFieldDecorator(this.getDecoratorKey(parentKeys, `${key}[${k}]`), {
                initialValue: _.get(initialValues, this.getDecoratorKey(parentKeys, `${key}[${k}]`)),
                ...fieldDecorator,
              })(
                <TargetComponent
                  {...componentProps}
                  {...componentExtraProps}
                />
              )
            );
            if (type === 'select') {
              const { form: { getFieldValue, resetFields }, providers } = this.props;
              const targetSelectValue = getFieldValue(this.getDecoratorKey(parentKeys, `${key}[${k}]`));
              let hasTargetValue = true;
              if (linkage) {
                hasTargetValue = providers[provider][linkageValue].some(({ value }) => value === targetSelectValue);
              } else {
                hasTargetValue = providers[provider].some(({ value }) => value === targetSelectValue);
              }
              if (!hasTargetValue) {
                resetFields(this.getDecoratorKey(parentKeys, `${key}[${k}]`));
              }
            }
            return dynamicItem;
          },
        );

        return formItem;
      }

      const formItem = (
        <FormItem
          key={key}
          label={label}
          className={`${prefixCls}-item`}
          {...finalFormItemProps}
        >
          {getFieldDecorator(this.getDecoratorKey(parentKeys, key), {
            initialValue: _.get(initialValues, this.getDecoratorKey(parentKeys, key)),
            ...fieldDecorator,
          })(
            <TargetComponent
              {...componentProps}
              {...componentExtraProps}
            />
          )}
        </FormItem>
      );

      if (type === 'select') {
        const { form: { getFieldValue, resetFields }, providers } = this.props;
        const targetSelectValue = getFieldValue(this.getDecoratorKey(parentKeys, key));
        let hasTargetValue = true;
        if (linkage) {
          hasTargetValue = providers[provider][linkageValue].some(({ value }) => value === targetSelectValue);
        } else {
          hasTargetValue = providers[provider].some(({ value }) => value === targetSelectValue);
        }
        if (!hasTargetValue) {
          resetFields(this.getDecoratorKey(parentKeys, key));
        }
      }

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
