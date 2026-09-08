# Capstone Reflection

## What was hardest?

The hardest part of StudyFlow was not building the visible interface; it was making the product feel reliable in real user conditions. The streamed AI flow required careful handling for request validation, partial responses, retry states, stop behavior, and provider failure handling. The app needed to preserve the user’s context and keep the chat usable even when the external model or stream unexpectedly failed.

The Learning Constellation was another major challenge. Connecting the 3D scene to real persisted StudyFlow data required replacing demo-only logic with a data model that reflected real courses, assignments, tasks, and progress. Keeping the nodes readable while preserving useful connections and avoiding overlap became a real design and engineering problem. The visual polish was important, but the real challenge was making the scene reliable and useful with actual data instead of synthetic examples.

Cross-browser testing also created a surprising amount of complexity. Although the core feature was valid, headless Firefox and other browser engines exposed differences in WebGL support and interaction behavior. That required the product to treat the fallback path as a supported experience rather than a broken one, which is a important production lesson.

## What would I do differently next time?

I would define the underlying data model and browser strategy earlier. A clearer early mapping of courses, tasks, assignments, and progress would have reduced UI churn and made the charting and AI context integration easier to reason about. I would also define the cross-browser and fallback strategy earlier so that capability checks and accessible alternatives are built into the plan rather than added as a late stabilization step.

If the project were expected to scale beyond a local-first product, I would also introduce persistent backend storage and authentication earlier. That would shift the architecture from a strong single-user prototype toward a multi-user production system with a shared data source and more predictable collaboration flows.

## One thing I learned that surprised me

The biggest surprise was that shipping a feature is not the same as shipping a production-ready product. A feature can look complete long before the work around it is finished: streaming AI state, retry logic, empty-state design, browser capability handling, mobile interaction constraints, API protections, documentation accuracy, and deployment safety all required careful work. The visible product was only one part of the finished outcome.

That lesson was especially clear in StudyFlow: the app had to be robust in the browser, resilient in the presence of partial failures, and honest about the limits of the local-first data model. In the end, the product became more reliable because it was designed around real-world constraints instead of just the main happy path.
