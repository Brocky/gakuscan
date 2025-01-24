# GakuScan(学スキャン) Design Philosophy  

GakuScan was created with the goal of providing a streamlined, efficient, and immersive tool to aid in learning Japanese. This document outlines the core design principles and decisions that shaped the development of the application.  
  
## Exploring Modern JavaScript
One of the guiding principles behind GakuScan's development was a desire to explore the capabilities of **modern JavaScript**. Recent advancements in the language and browser APIs allow developers to achieve functionality that once required heavy frameworks or complex setups.  

By embracing vanilla JavaScript, GakuScan demonstrates:  
- **Native Capabilities**: Modern ES6+ features like modules, async/await, and template literals provide powerful tools for building applications without external libraries.  
- **Simplicity with Power**: Even complex functionality, such as OCR integration and DOM manipulation, can be implemented concisely using modern JavaScript.  
- **Learning Opportunity**: This approach highlights how far JavaScript has evolved, providing a chance to learn and appreciate its modern potential.  

## Minimalism First
GakuScan was designed with a strong commitment to minimalism. This meant:  
- **Minimal Dependencies**: The application relies on as few external libraries as possible to ensure simplicity and maintainability.  
- **No Frameworks**: Frameworks often add unnecessary complexity and overhead. GakuScan is built using plain JavaScript, HTML, and CSS, ensuring clarity and direct control over every aspect of the codebase.  
- **No TypeScript or Build Process**: By avoiding TypeScript or any tools requiring a build pipeline, the project remains lightweight and accessible. Developers can easily understand, modify, and deploy the application without additional tools or setup.

## Focus on Local Functionality
The initial vision for GakuScan was a fully local web app that required no server interaction, ensuring user privacy and a seamless offline experience. This decision was driven by:  
- **User Empowerment**: Allowing users to use the tool without relying on external services.  
- **Privacy-First Design**: Keeping user data private and under their control.  

However, due to modern browser security features, fully local functionality was not achievable. Issues such as restrictions on `file://` URLs and the security policies surrounding `localhost` necessitated hosting the app on a web server. Despite this, the core principle of keeping operations client-side remains intact.  

## Efficiency and Accessibility
- **Performance**: The absence of heavy dependencies and frameworks ensures GakuScan loads quickly and runs smoothly.  
- **Ease of Use**: The interface is designed to be intuitive and distraction-free, allowing users to focus on their learning journey.  

## Why Avoid Additional Complexity?
1. **Maintainability**: A minimalistic approach makes the codebase easier to understand, extend, and debug.  
2. **Longevity**: GakuScan can continue to function effectively without requiring constant updates to stay compatible with evolving third-party tools or frameworks.  
3. **Accessibility for Developers**: Developers familiar with basic web technologies can contribute to the project without needing to learn specific frameworks or tools.  

## Final Notes
GakuScan embodies the philosophy of doing more with less while exploring the possibilities of modern JavaScript. It demonstrates that powerful tools can be built with simplicity at their core, without sacrificing user experience or functionality.  

If you share this philosophy, have ideas to improve the app, or simply want to connect with the community, we invite you to join our [official Discord server](https://discord.com/invite/mDumA87rph). There, you can discuss GakuScan’s development, offer feedback, and collaborate with like-minded individuals.  

Thank you for using GakuScan! 🚀
