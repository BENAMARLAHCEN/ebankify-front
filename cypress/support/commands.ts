// cypress/support/commands.ts
declare namespace Cypress {
    interface Chainable {
      login(username: string, password: string): void;
    }
  }
  
  Cypress.Commands.add('login', (username: string, password: string) => {
    cy.visit('/auth/login');
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
  });
  
  // Add this to tsconfig.json to recognize custom commands
  // {
  //   "compilerOptions": {
  //     "types": ["cypress"]
  //   }
  // }