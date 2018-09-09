const config = {
  input: './data/locations.json',
  output: './locations.json'
};

const locationsBlob = require(config.input);
const fs = require('fs');

const output = [];
const locStack = [];

const addToOutput = (location, currentLocStack) => {
  // convert the existing access rules into arrays
  let accessRules = [];
  if (location.access_rules)
  accessRules = location.access_rules.map( ruleList => ruleList.split(',') );

  // then prepend all the accessRules with the location stack contents
  const newAccessRules = accessRules.map( ruleList => {
    return currentLocStack.map( loc => {
        ruleList.unshift(loc);
        return loc
    })
  }).filter(ruleList => ruleList.length > 0);

  output.push(Object.assign(location, {
    access_rules: newAccessRules,
    code: getCodeName(location)
  }));
}

const getCodeName = (location) => location.name.toLowerCase().replace(/ /g, '');

const parseLocations = (blob) => {

  blob.forEach( location => {
    addToOutput(location, locStack);
    if (!location.hasOwnProperty('children')){
      // if the location has no child locations, 
      // then we have reached a leaf node and can
      return;
    } else {
      // Otherwise, we want to add this to the locations stack,
      // recurse with its children, and pop off the stack when its done.
      locStack.push(getCodeName(location));
      parseLocations(location.children);
      locStack.pop();
    }
  });

};

parseLocations(locationsBlob);
fs.writeFile(config.output, JSON.stringify(output), 'utf8', () => {});
