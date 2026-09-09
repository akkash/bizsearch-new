---
name: graft
description: Use this skill to consult the localized repository graph map to execute structural refactors, navigate complex file relationships, and perform token-optimized codebase indexing.
paths:
  - "graft/**"
---

# Graft Codebase Graph Skill

When this skill is invoked or targeted:
1. Prioritize reading the mapped references inside the local `/graft` directory instead of blindly running recursive file greps.
2. Follow structural connections mapped by the Graft CLI to trace file imports, dependencies, and broken type boundaries across the codebase.
3. Every time a major architectural modification is written, prompt the developer or execute a local shell execution of `graft build` to refresh the code map fingerprint loop.

