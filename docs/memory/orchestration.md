# Orchestration Memory

## Worker Topology
- Orchestrator coordinates schedules, dependency ordering, and replay control.
- Fixture/schedule worker manages windows and match state transitions.
- Ingestion worker stores raw envelopes.
- Entity-resolution worker links provider identifiers to canonical IDs.
- Normalization worker emits canonical facts.
- Validation worker executes rule packs.
- Enrichment worker adds derived metrics and intelligence.
- Publishing worker promotes validated facts.
- Monitoring worker watches freshness/quality budgets.
- Narrative worker turns facts into explainable summaries.
