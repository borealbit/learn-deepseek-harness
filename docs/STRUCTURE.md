# Repository Structure

## Design goals

The structure separates canonical English course content, runnable artifacts, licensing, and maintenance policy. Future translation directories remain frozen until English v1. Directories expand only when a lesson has real content.

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
├── LICENSE
├── LICENSE-CODE
├── LICENSES.md
├── NOTICE
├── course/
│   ├── README.md
│   ├── en/
│   │   ├── README.md
│   │   └── 00-quick-start/
│   │       ├── README.md
│   │       └── CHECKLIST.md
│   ├── zh-CN/
│   │   └── README.md
│   └── ja/
│       └── README.md
├── docs/
│   ├── STRUCTURE.md
│   └── VERSIONING.md
├── projects/
│   ├── README.md
│   └── quick-start-workspace/
│       ├── README.md
│       ├── package.json
│       ├── notes/
│       │   └── project-goals.md
│       └── src/
│           └── greeting.js
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
| `course/zh-CN/` | Frozen Simplified Chinese placeholders; future translations | English-only technical changes |
| `course/ja/` | Frozen Japanese placeholders; future native-reviewed translations | Machine-only final copy |
| `projects/` | Runnable course labs and capstone code | General third-party plugin mirrors |
| `plugins/` | Plugins authored and maintained by this course | Unreviewed plugin collections |
| `resources/` | Curated links, glossaries, and decision guides | Copied upstream documentation |
| `templates/` | Reusable authoring scaffolds | Completed lessons |
| `docs/` | Repository-wide policy and architecture | Module-specific teaching content |
| `LICENSE*`, `NOTICE` | License scope, official terms, copyright, and attribution | Third-party relicensing claims |

## Licensing boundary

`LICENSES.md` is the authoritative map. In summary, original educational material uses CC BY 4.0; original software and code samples use Apache-2.0. Mixed files follow the rules in that document.

## Planned module shape

A module is added only when drafting begins:

```text
course/en/NN-module-name/
├── README.md
├── assets/
└── exercises/
```

Add `assets/` and `exercises/` only when needed. Do not create empty placeholder directories.

When localization reopens, translated modules mirror the English path:

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

Every runnable project should document setup, permissions, expected output, tests, cleanup, and the exact DeepSeek Harness package and source revision used.

## Future translation parity

When localization resumes, each language index will track one of four states:

| State | Meaning |
|---|---|
| `planned` | No draft exists |
| `draft` | Content exists but is not fully verified |
| `needs-review` | English changed or language review is pending |
| `verified` | Technical and language review completed |

English is verified first. A translation cannot be marked verified against an English module that is not itself verified.
