module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "plugin:jsx-a11y/recommended"],
  rules: {
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/alt-text": "error",
  },
};
