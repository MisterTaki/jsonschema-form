import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Form, Button } from 'antd';
import _ from 'lodash';

const prefixCls = 'jsonSchema-form';

const { Item: FormItem } = Form;

@Form.create()
export default class JsonSchemaForm extends PureComponent {
  static propTypes = {
    propForm: PropTypes.func,
    className: PropTypes.string,
    wrapperClassName: PropTypes.string,
    layout: PropTypes.oneOf(['horizontal', 'vertical', 'inline']),
    hideRequiredMark: PropTypes.bool,
    submitLoading: PropTypes.bool,
    submitLabel: PropTypes.string,
    onSubmit: PropTypes.func,
  }

  static defaultProps = {
    propForm: form => console.log(form),
    className: '',
    wrapperClassName: '',
    layout: 'horizontal',
    hideRequiredMark: false,
    submitLoading: false,
    submitLabel: 'submit',
    onSubmit: (e, { validateFieldsAndScroll }) => {
      alert('sss');
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

    propForm(form);
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
    } = this.props;

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
            fields
          </div>
          <div className={`${prefixCls}-submit-btn-wrapper`}>
            <Button
              className={`${prefixCls}-submit-btn`}
              type="primary"
              htmlType="submit"
            >
              {submitLabel}
            </Button>
          </div>
        </Form>
      </div>
    )
  }
};
