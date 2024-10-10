export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  secret: {
    JWT: process.env.JWT_SECRET || 'secret',
    SALT: parseInt(process.env.SALT, 10) || 10,
  },
});
