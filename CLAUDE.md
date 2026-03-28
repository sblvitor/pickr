# Pickr

This is a live collaborative system that helps people decide on things. One user will create and join a session by typing a theme like "Dinner". Another users will join this session through a code that the first user will share. From there, they will input their options and when they are ready, the system is going to pick one option randomnly. The ideia is that all users on the same page can see what eachother is adding and the decision process itself.

## Tooling

- Package manager: **bun** (use `bun add`, `bun remove`, `bun run`, etc.)

<!-- intent-skills:start -->
# Skill mappings - when working in these areas, load the linked skill file into context.
skills:
  - task: "Set up or refactor TanStack DB collections and adapters for session/options data"
    load: "node_modules/@tanstack/db/skills/db-core/collection-setup/SKILL.md"
  - task: "Build or debug live query logic for real-time session state in the app"
    load: "node_modules/@tanstack/db/skills/db-core/live-queries/SKILL.md"
  - task: "Implement optimistic mutations and transaction flows when users add/update options"
    load: "node_modules/@tanstack/db/skills/db-core/mutations-optimistic/SKILL.md"
  - task: "Integrate TanStack DB with React hooks and component data flows"
    load: "node_modules/@tanstack/react-db/skills/react-db/SKILL.md"
  - task: "Wire TanStack DB to Electric sync for collaborative, near real-time updates"
    load: "node_modules/@tanstack/db/skills/db-core/SKILL.md"
<!-- intent-skills:end -->