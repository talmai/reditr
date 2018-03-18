import jss from 'react-jss'

Function.prototype.style = function(styles) {
  return jss(styles)(this);
};

export default (object, style = null) => {
  if (!style) {
    style = object.style()
  }
  return jss(style)(object)
}
