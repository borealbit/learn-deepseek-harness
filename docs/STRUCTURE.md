# Repository Structure

## Design goals

The structure separates canonical course content, translations, runnable artifacts, and maintenance policy. It is intentionally small at the beginning and expands only when a lesson has real content.

## Current structure

```text
.
├── README.md
├── README.zh-CN.md
├── README.ja.md
├── SYLLABUS.md
├── ROADMAP.md
├── CONTRIBUTING.md
├── AGENTS.md
├── course/
│   ├── README.md
│   ├── en/
│   │   └── README.md
│   ├── zh-CN/
│   │   └── README.md
│   └── ja/
│       └── README.md
├── docs/
│   ├── STRUCTURE.md
│   └── VERSIONING.md
├── projects/
│   └── README.md
├── plugins/
│   └── README.md
├── resources/
│   └── README.md
└── templates/
    └── module-template.md
```

## Directory responsibilities

| Path | Owns | Must not own |
|---|---|---|
| `course/en/` | Canonical lessons and navigation | Unreviewed translations |
| `course/zh-CN/` | Simplified Chinese translations | English-only technical changes |
| `course/ja/` | Native-reviewed Japanese translations | Machine-only final copy |
| `projects/` | Runnable course labs and capstone code | General third-party plugin mirrors |
| `plugins/` | Plugins authored and maintained by this course | Unreviewed plugin collections |
| `resources/` | Curated links, glossaries, and decision guides | Copied upstream documentation |
| `templates/` | Reusable authoring scaffolds | Completed lessons |
| `docs/` | Repository-wide policy and architecture | Module-specific teaching content |

## Planned module shape

A module is added only when drafting begins:

```text
course/en/NN-module-name/
├── README.md
├── assets/
└── exercises/
```

Add `assets/` and `exercises/` only when needed. Do not create empty placeholder directories.

Translated modules mirror the English path:

```text
course/zh-CN/NN-module-name/README.md
course/ja/NN-module-name/README.md
```

## Runnable artifact shape

```text
projects/project-name/
├── README.md
├── src/
├── tests/
├── fixtures/
└── evidence/
```

Every runnable project should document setup, permissions, expected output, tests, cleanup, and the exact DeepSeek Harness revision used.

## Translation parity

Each language index tracks one of four states:

| State | Meaning |
|---|---|
| `planned` | No draft exists |
| `draft` | Content exists but is not fully verified |
| `needs-review` | English changed or language review is pending |
| `verified` | Technical and language review completed |

English is verified first. A translation cannot be marked verified against an English module that is not itself verified.
