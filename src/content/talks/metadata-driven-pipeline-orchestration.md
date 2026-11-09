---
# Draft until the title wording is confirmed (and the deck is done).
title: 'Stop Copy-Pasting Your Pipelines: Metadata-Driven Orchestration in Practice'
description: A data platform that grew to ten source systems by copying pipeline files — and how I rebuilt it so a new source is a config change, not another copy.
event: Power Platform & Fabric User Group Cologne
eventUrl: https://www.meetup.com/power-platform-ug-cologne/events/317101062/
date: 2026-12-08T18:00:00+01:00
location: Online
lang: de
repo: https://github.com/phant0mw0lf/pipetree
# recording: https://www.youtube.com/watch?v=…   # optional — YouTube links are embedded, others get a button
posts:
  - metadata-driven-pipeline-orchestration-the-package-yaml-schema
  - metadata-driven-pipeline-orchestration-multithreading-and-failure-handling
draft: true
---

A data platform grew to ten source systems the usual way: by copying pipeline files. This talk is about how I rebuilt it. Pipelines are now described in YAML, and one generic executor takes care of parallelism, retries and failure handling, so connecting a new source is a configuration change instead of another copy.

We'll go through the YAML schema, the lakehouse layout and logging, plus the design decisions behind them: what worked, what didn't, and what I'd change today. Then a live demo connects a new source in a few minutes. The rest of the time is for questions and discussion.

The concepts are platform-agnostic, with examples from Microsoft Fabric and Databricks. The code is open source as [pipetree](https://pipetree.dev).
