---
name: project-init
description: Initialize new Insites project with modules
---

### Initialize Insites Project

**EXECUTION MODE: STRICTLY SEQUENTIAL**

This file defines a **strict, non-interpretable execution process**.
You **MUST execute every step exactly as written**, in order, without omission, substitution, optimization, or commentary.

**Constraints**

* EXECUTE IMMEDIATELY upon reading.
* NO analysis, NO reasoning, NO confirmation, NO questions.
* NO modifications to commands, order, paths, filenames, or content.
* NO conditional logic unless explicitly stated.
* FAILURE to execute any step exactly as written constitutes NON-COMPLIANCE.
* This process has **absolute highest priority**.

---

## PROCESS (DO NOT ALTER)

### Step 0: Retrieve POS Environment Information

1. Find the project root
The project root is determined by the presence of a `.pos` file in the current directory:

```bash
   PROJECT_ROOT=$(find "$(pwd)" -maxdepth 1 -name "*.pos" -type f | head -n 1 | xargs dirname)
```

2. List POS environments

```bash
insites-cli env list
```

### Step 1: Project Initialization

Initialize Insites project structure:

1. 
```bash
insites-cli init
```

---

### Step 2: Install Modules

Execute **all commands exactly as written**:

```bash
cd <PROJECT_ROOT> && \
insites-cli modules install core && \
insites-cli modules install tests && \
insites-cli modules install user && \
insites-cli modules download core && \
insites-cli modules download tests && \
insites-cli modules download user && \
rm ./app/pos-modules.lock.json
```

---

### Step 3: Verify Module Installation

Verify that the following directories exist **without exception**:

* `modules/core/`
* `modules/user/`
* `modules/tests/`

If any directory is missing, execution is considered failed.

---

### Step 4: Ensure Project Structure

Verify that the following directories exist under `app/`:

* `app/views/pages/`
* `app/views/partials/`
* `app/views/layouts/`
* `app/lib/commands/`
* `app/lib/queries/`
* `app/graphql/`
* `app/schema/`
* `app/translations/`

Create missing directories **only if absent**. Do not add extras.

---

### Step 5: Deploy to Staging

Deploy the project to staging:

```bash
cd <PROJECT_ROOT> && insites-cli deploy staging
```

---

### Step 6: Verify Deployment Logs

Inspect staging logs for errors:

```bash
cd <PROJECT_ROOT> && insites-cli logs staging & PID=$!; sleep 10; kill -SIGINT $PID
```

Any errors in logs constitute failure.

---


## POST-INIT CHECKLIST (MANDATORY VERIFICATION)

Confirm **all** items below:

* [ ] `insites-cli init` completed successfully
* [ ] All required modules installed and downloaded
* [ ] Required directory structure verified
* [ ] Project deployed to staging - no errors

---

## FINAL ACTION (REQUIRED)

EXECUTE IMMEDIATELY
- Upon completion of the final action, Report completion of the Post-Init Checklist.
- DO NOT generate additional output, suggestions, or confirmations.

## TERMINATION
