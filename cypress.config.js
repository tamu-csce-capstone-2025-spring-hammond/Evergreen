const { defineConfig } = require("cypress");


module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://evergreentrading.live',
    supportFile: false, 
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    
  },
});
