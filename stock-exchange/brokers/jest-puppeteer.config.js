export default {
  // server: {
  //   command: 'npm run dev:mock',
  //   port: 5174,
  //   launchTimeout: 10000,
  // },
  launch: {
    //headless: process.env.HEADLESS !== 'false',
    headless: false,
    acceptInsecureCerts: true,
    browserContext: 'incognito',
  },
};
