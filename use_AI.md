## AI Tools Interaction Summary

I used AI tools throughout the assignment as a development assistant, mainly ChatGPT and Codex. I used them to help me understand the requirements, discuss implementation decisions, review existing code, investigate bugs, and improve the project step by step.

At the beginning, I used AI to break down the assignment requirements and plan the project structure and implementation. During development, I used Codex to inspect the existing code before making changes, explain the current behavior, and suggest focused improvements. This helped me work on features such as authentication, onboarding, user preferences, personalized dashboard content, API integrations, and the feedback mechanism.

An important part of my work with AI was reviewing its suggestions rather than accepting them automatically. When a proposed solution did not fit the requirements or I found a problem with the implementation, I investigated it further and adjusted the approach. For example, while reviewing the feedback mechanism, I identified that different AI-generated insights could receive the same content ID, causing feedback to be associated with the wrong content. After tracing the flow from the generated dashboard content to the feedback stored in SQLite, I changed the content ID logic so that each AI insight is identified by its actual content.

I also used AI to review external API integrations and fallback behavior. CryptoPanic was initially considered for the news section, but the API access required a paid plan, so I looked for an alternative and chose Marketaux. I also improved the fallback messages so they are clear and user-friendly and made sure the dashboard continues to behave consistently when an external service is unavailable.

After the main functionality was working, I used Codex to help improve the code organization by splitting larger files into smaller components and modules and organizing component-specific CSS. I wanted each component to have a clear responsibility, making the code easier to understand and maintain as the project grows.

I also used AI when reviewing the deployment setup. It helped me verify the configuration for deploying the React frontend, Express backend, and SQLite database together on Railway and identify the required environment variables and persistent storage configuration.

Overall AI helped me work more efficiently, investigate problems, and explore different solutions. I reviewed and tested the changes myself and remained responsible for understanding the implementation, identifying issues, deciding which suggestions to use, and validating the final result.
