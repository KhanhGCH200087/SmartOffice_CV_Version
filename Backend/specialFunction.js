//Đa số để sử dụng cho view hbs
const hbs = require('hbs'); // or express-handlebars depending on your setup

hbs.registerHelper('ifEqual', function (arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('ifConditionMatch', function (value1, target1, value2, target2, options) {
  const condition1 = target1 === undefined || value1 === target1;
  const condition2 = target2 === undefined || value2 === target2;

  if (condition1 && condition2) {
      return options.fn(this);  // Render content inside the block
  } else {
      return options.inverse(this);  // Render the {{else}} block content
  }
});

hbs.registerHelper('inc', function(index) {
    return index + 1;
});

hbs.registerHelper('some', (array, key, value) => {
    return array && array.some(item => item[key] === value);
});

hbs.registerHelper('hasFireDevice', function (devices) {
    return devices.some(device => device.type === "fire");
});