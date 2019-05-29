import _ from 'lodash';
import { CONDITION } from '../constant/keys';
/*
  condition demo:
  [
    {
      target: 'a',
      condition: '=',
      value: 1,
    },
    '&&',
    [
      {
        target: 'b',
        condition: '>',
        value: 1,
      },
      '||',
      {
        target: 'c',
        condition: '<',
        value: 1,
      },
    ],
  ]
*/

const getSingleBool = (formValues, { target, value, condition = '=' } = {}) => {
  if (target && value) {
    const targetValue = _.get(formValues, target);
    switch (condition) {
      case '=':
        return targetValue === value;
      case '>':
        return targetValue > value;
      case '<':
        return targetValue < value;
      case '>=':
        return targetValue >= value;
      case '<=':
        return targetValue <= value;
      case 'indexOf': {
        if (_.isArray(targetValue)) {
          if (_.isArray(value)) {
            return value.every(item => targetValue.indexOf(item) > -1);
          }
          return targetValue.indexOf(value) > -1;
        }
        return false;
      }
      default:
        return false;
    }
  }
  return false;
};

const changeBool = (beforeBool, symbol, currentBool) => {
  if (beforeBool !== undefined) {
    if (symbol) {
      if (symbol === '&&') {
        return beforeBool && currentBool;
      }
      if (symbol === '||') {
        return beforeBool || currentBool;
      }
    }
    return false;
  }
  return currentBool;
};

export const getConditionalValue = (formValues = {}, condition = true) => {
  if (!_.isArray(condition)) {
    if (_.isBoolean(condition)) {
      return condition;
    }
    if (_.isPlainObject(condition)) {
      const { target, value } = condition;
      if (value !== undefined) {
        return getSingleBool(formValues, condition);
      }
      return _.get(formValues, target);
    }
  }

  let bool;
  let symbol;
  condition.forEach((item) => {
    if (_.isPlainObject(item)) {
      const currentBool = getSingleBool(formValues, item);
      bool = changeBool(bool, symbol, currentBool);
    }
    if (_.isString(item)) {
      symbol = item;
    }
    if (_.isArray(item)) {
      const currentBool = transformConditional(formValues, item);
      bool = changeBool(bool, symbol, currentBool);
    }
  });
  return bool;
};

export const parseFieldItem = (formValues, fieldItem, conditions) => {
  const parsedFieldItem = {};
  Object.keys(fieldItem).forEach(key => {
    const keyValue = fieldItem[key];
    parsedFieldItem[key] = keyValue;
    if (_.isPlainObject(keyValue)) {
      const {
        [CONDITION]: condition,
        true: trueValue = true,
        false: falseValue = false,
      } = keyValue;

      if (condition) {
        const targetCondition = _.get(conditions, condition);
        if (targetCondition) {
          const conditionalValue = getConditionalValue(formValues, targetCondition)
          console.log('conditionalValue', conditionalValue);
          if (_.isBoolean(conditionalValue)) {
            parsedFieldItem[key] = conditionalValue ? trueValue : falseValue;
          } else {
            parsedFieldItem[key] = keyValue[conditionalValue];
          }
        }
      }
    }
  });
  return parsedFieldItem;
}

export default parseFieldItem;
