## Bonus

The application stores user feedback for each dashboard section using thumbs up/down votes. Each vote is saved with the user ID, dashboard section, content ID, vote value, timestamp, and a snapshot of the exact content that was shown to the user.

This feedback could later be used to improve recommendations by analyzing which types of content users prefer based on their onboarding preferences. For example, the system could learn which news sources, assets, AI insight styles, or meme types receive positive feedback from different investor profiles.

In a future recommendation pipeline, the stored feedback could be combined with user preferences to create a dataset for ranking content and improving prompt personalization. Positively rated content could increase the likelihood of recommending similar content, while negatively rated content could reduce it.

As more feedback is collected, the same dataset could also be used to evaluate recommendation quality and potentially fine-tune a model if enough high-quality training data becomes available.
