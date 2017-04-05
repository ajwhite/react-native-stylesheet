import React from 'react';
import {parse} from 'css';
const stylesheet = require('./stylesheet');

const parsed = parse(stylesheet);

const componentType = component => component.type.displayName;

function transformToCamelCase (propertyName) {
  return propertyName.replace(/(-.)/g, v => v[1].toUpperCase());
}

function ruleToStyle (rule) {
  return rule.declarations.reduce((styles, {property, value}) => {
    styles[transformToCamelCase(property)] = value;
    return styles;
  }, {});
}

function getComponentStyles (component, rules) {
  var type = componentType(component);

  var applicableRules = rules.filter(rule => rule.selectors.indexOf(type) > -1);

  var styles = applicableRules.map(ruleToStyle);

  return styles;
}

function componentStyleizer (styleAST) {
  return function styleizeComponent (component, path) {
    if (!React.isValidElement(component)) {
      return component;
    }

    var children = component.props.children;

    if (Array.isArray(children)) {
      children = children.map(styleizeComponent);
    }

    var styles = getComponentStyles(component, styleAST.rules);

    if (styles.length > 0) {
      return React.cloneElement(component, {
        style: styles.concat(component.props.style),
        children
      });
    }

    return component;
  }
}

export default class StylesheetProvider extends React.Component {
  constructor (props) {
    super(props);

    this.stylizer = componentStyleizer(parsed.stylesheet);
  }
  render() {
    console.log('child', this.props.children);
    return this.stylizer(this.props.children);
  }
}
