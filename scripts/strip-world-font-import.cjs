// Webpack loader for the generated ailu-world.css. Its Google Fonts @import blocks the first paint, and the
// site's own fonts replace those fonts in world-brand.css. The generated file itself stays untouched.
module.exports = function stripWorldFontImport(source) {
  return source.replace(/@import url\("https:\/\/fonts\.googleapis\.com[^"]*"\);\s*/, "");
};
