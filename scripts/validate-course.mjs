#!/usr/bin/env node

import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const argumentsList = process.argv.slice(2);
const ignoreLocalOutput = argumentsList.includes("--ignore-local-output");
const rootArgument = argumentsList.find((argument) => !argument.startsWith("--"));
const repositoryRoot = path.resolve(
  rootArgument ?? path.join(path.dirname(fileURLToPath(import.meta.url)), ".."),
);
const errors = [];
const files = [];
const generatedDirectories = new Set(["coverage", "dist", "lib", "node_modules"]);

function repositoryPath(absolutePath) {
  return path.relative(repositoryRoot, absolutePath).split(path.sep).join("/");
}

function report(message) {
  errors.push(message);
}

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const absolutePath = path.join(directory, entry.name);
    const relativePath = repositoryPath(absolutePath);

    if (entry.isSymbolicLink()) {
      report(`${relativePath} is a symbolic link; inspect and document it before committing`);
      continue;
    }

    if (entry.isDirectory()) {
      if (generatedDirectories.has(entry.name)) {
        if (!ignoreLocalOutput) report(`${relativePath}/ is generated output and must not be committed`);
        continue;
      }
      walk(absolutePath);
      continue;
    }

    if (entry.isFile()) files.push(absolutePath);
  }
}

function field(frontmatter, name) {
  const match = frontmatter.match(new RegExp(`^${name}:\\s*(.*)$`, "m"));
  return match?.[1]?.trim().replace(/^(["'])(.*)\1$/, "$2") ?? null;
}

function checkRequiredFiles() {
  const required = [
    ".github/workflows/verify.yml",
    "CHANGELOG.md",
    "LICENSE",
    "LICENSE-CODE",
    "LICENSES.md",
    "NOTICE",
    "README.md",
    "SECURITY.md",
    "SUPPORT.md",
    "SYLLABUS.md",
    "docs/LEARNER-GUIDE.md",
    "docs/VERIFICATION-MATRIX.md",
  ];
  for (const relativePath of required) {
    if (!existsSync(path.join(repositoryRoot, relativePath))) {
      report(`${relativePath} is required`);
    }
  }
}

function checkModules() {
  const courseRoot = path.join(repositoryRoot, "course/en");
  const expectedIds = Array.from({ length: 13 }, (_, index) => String(index).padStart(2, "0"));
  const moduleDirectories = readdirSync(courseRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  const actualIds = moduleDirectories.map((name) => name.slice(0, 2));

  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    report(`course/en must contain exactly Modules 00–12; found ${actualIds.join(", ")}`);
  }

  for (const directory of moduleDirectories) {
    const relativeReadme = `course/en/${directory}/README.md`;
    const readme = path.join(repositoryRoot, relativeReadme);
    if (!existsSync(readme)) {
      report(`${relativeReadme} is missing`);
      continue;
    }

    const content = readFileSync(readme, "utf8");
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (!frontmatterMatch) {
      report(`${relativeReadme} must start with YAML frontmatter`);
      continue;
    }

    const frontmatter = frontmatterMatch[1];
    const requiredFields = [
      "course_version",
      "upstream_repository",
      "upstream_ref",
      "install_package",
      "source_reviewed_on",
      "verified_on",
      "status",
      "platforms",
    ];
    for (const name of requiredFields) {
      if (field(frontmatter, name) === null) report(`${relativeReadme} is missing ${name}`);
    }

    const upstreamRef = field(frontmatter, "upstream_ref");
    if (upstreamRef && !/^[0-9a-f]{40}$/.test(upstreamRef)) {
      report(`${relativeReadme} upstream_ref must be a full immutable commit SHA`);
    }

    const installPackage = field(frontmatter, "install_package");
    if (installPackage && (!/^@deepseek-ai\/dsh@\d+\.\d+\.\d+/.test(installPackage) || /@(latest|next)$/i.test(installPackage))) {
      report(`${relativeReadme} install_package must use an exact version`);
    }

    const status = field(frontmatter, "status");
    if (!new Set(["archived", "draft", "needs-review", "verified"]).has(status)) {
      report(`${relativeReadme} has unsupported status ${JSON.stringify(status)}`);
    }
    if (status === "verified") {
      if (!field(frontmatter, "verified_on")) report(`${relativeReadme} is verified without verified_on`);
      if (field(frontmatter, "platforms") === "[]") report(`${relativeReadme} is verified without platforms`);
    }

    const artifacts = readdirSync(path.dirname(readme)).filter(
      (name) => name !== "README.md" && name.endsWith(".md"),
    );
    if (artifacts.length === 0) report(`${relativeReadme} needs at least one companion learning artifact`);
  }
}

function markdownTarget(rawTarget) {
  const trimmed = rawTarget.trim();
  if (trimmed.startsWith("<")) return trimmed.slice(1, trimmed.indexOf(">"));
  return trimmed.split(/\s+["']/)[0];
}

function checkMarkdown() {
  const markdownFiles = files.filter((file) => file.endsWith(".md"));
  const cjkPattern = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/u;

  for (const file of markdownFiles) {
    const relativePath = repositoryPath(file);
    const content = readFileSync(file, "utf8");
    const fences = content.match(/^\s*```/gm)?.length ?? 0;
    if (fences % 2 !== 0) report(`${relativePath} has an unbalanced fenced code block`);
    if (relativePath.startsWith("course/en/") && cjkPattern.test(content)) {
      report(`${relativePath} contains CJK text; English course files must remain English-only`);
    }

    for (const match of content.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = markdownTarget(match[1]);
      if (!target || target.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;

      let decodedTarget;
      try {
        decodedTarget = decodeURIComponent(target.replace(/[?#].*$/, ""));
      } catch {
        report(`${relativePath} contains an invalid encoded link: ${target}`);
        continue;
      }
      if (!decodedTarget) continue;

      const resolved = decodedTarget.startsWith("/")
        ? path.resolve(repositoryRoot, `.${decodedTarget}`)
        : path.resolve(path.dirname(file), decodedTarget);
      if (!resolved.startsWith(`${repositoryRoot}${path.sep}`) && resolved !== repositoryRoot) {
        report(`${relativePath} links outside the repository: ${target}`);
        continue;
      }
      if (!existsSync(resolved)) {
        report(`${relativePath} has a missing relative link: ${target}`);
      }
    }

    if (relativePath.startsWith("course/en/")) {
      for (const match of content.matchAll(/https:\/\/github\.com\/deepseek-ai\/deepseek-harness\/(?:blob|tree)\/([^/\s)#]+)/g)) {
        if (!/^[0-9a-f]{40}$/.test(match[1])) {
          report(`${relativePath} uses a moving upstream source link: ${match[0]}`);
        }
      }
    }
  }

  return markdownFiles.length;
}

function checkPackages() {
  const packageFiles = files.filter((file) => {
    const relativePath = repositoryPath(file);
    return /^(projects|plugins)\/[^/]+\/package\.json$/.test(relativePath);
  });

  for (const packageFile of packageFiles) {
    const relativePath = repositoryPath(packageFile);
    let manifest;
    try {
      manifest = JSON.parse(readFileSync(packageFile, "utf8"));
    } catch (error) {
      report(`${relativePath} is not valid JSON: ${error.message}`);
      continue;
    }

    if (manifest.author !== "Dom Liu") report(`${relativePath} must name Dom Liu as author`);
    if (manifest.license !== "Apache-2.0") report(`${relativePath} must use Apache-2.0`);
    if (!manifest.packageManager) report(`${relativePath} must pin packageManager`);
    if (!manifest.engines?.node) report(`${relativePath} must declare the supported Node range`);

    const directory = path.dirname(packageFile);
    for (const required of ["NOTICE", "README.md"]) {
      if (!existsSync(path.join(directory, required))) report(`${repositoryPath(directory)}/${required} is required`);
    }

    for (const group of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
      for (const [name, version] of Object.entries(manifest[group] ?? {})) {
        if (typeof version !== "string" || /^(?:\^|~|>|<|\*|latest$|next$|workspace:|file:|git\+)/i.test(version)) {
          report(`${relativePath} must pin ${group}.${name}; found ${JSON.stringify(version)}`);
        }
      }
    }
  }

  return packageFiles.length;
}

function checkForbiddenFiles() {
  for (const file of files) {
    const relativePath = repositoryPath(file);
    if (/\.(?:log|tgz)$/i.test(relativePath)) report(`${relativePath} is generated output`);
    if (relativePath.startsWith("projects/mode-comparison-lab/actual/")) {
      if (!ignoreLocalOutput) report(`${relativePath} is locally materialized evaluation output`);
    }
    if (/(?:^|\/)\.env(?:\.|$)/.test(relativePath) && !relativePath.endsWith(".example")) {
      report(`${relativePath} looks like a credential file`);
    }

    if (/\.(?:json|jsonl|js|mjs|ts|md|ya?ml|txt)$/i.test(relativePath)) {
      const content = readFileSync(file, "utf8");
      if (/(?:github_pat_[A-Za-z0-9_]{40,}|ghp_[A-Za-z0-9]{36,}|sk-[A-Za-z0-9]{32,})/.test(content)) {
        report(`${relativePath} contains a value shaped like a live credential`);
      }
    }
  }
}

function checkVerificationMatrix() {
  const matrixPath = path.join(repositoryRoot, "docs/VERIFICATION-MATRIX.md");
  if (!existsSync(matrixPath)) return;
  const content = readFileSync(matrixPath, "utf8");
  for (let index = 0; index <= 12; index += 1) {
    const id = String(index).padStart(2, "0");
    if (!new RegExp(`^\\|\\s*${id}\\s*\\|`, "m").test(content)) {
      report(`docs/VERIFICATION-MATRIX.md is missing Module ${id}`);
    }
  }
  if (!/maintained checks do not equal module verification/i.test(content)) {
    report("docs/VERIFICATION-MATRIX.md must distinguish maintained checks from verification");
  }
}

if (!existsSync(repositoryRoot)) {
  console.error(`Repository root does not exist: ${repositoryRoot}`);
  process.exit(2);
}

walk(repositoryRoot);
checkRequiredFiles();
checkModules();
const markdownCount = checkMarkdown();
const packageCount = checkPackages();
checkForbiddenFiles();
checkVerificationMatrix();

if (errors.length > 0) {
  console.error(`Course validation failed with ${errors.length} issue(s):`);
  for (const error of [...new Set(errors)].sort()) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Course validation passed: 13 modules, ${markdownCount} Markdown files, ${packageCount} maintained package manifests.`,
);
