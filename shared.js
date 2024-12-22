let sharedVariable = '';

module.exports = {
  getSharedVariable: () => sharedVariable,
  setSharedVariable: (value) => { sharedVariable = value; }
};
