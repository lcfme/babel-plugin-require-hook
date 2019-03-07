module.exports = (src, file, state) => {
  if (src === 'shouldchange') {
    return 'changed';
  }
};
