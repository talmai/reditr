import jss from 'react-jss'

Function.prototype.style = function(styles) {
  return jss(styles)(this);
}

export default (object, style = null) => {
  return jss(style || object.style())(object)
}
