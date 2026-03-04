# Quinn Admin Setup

## Create Test Directory

Create and navigate to an empty folder for testing:

```bash
mkdir quinn-admin-skills-test
cd quinn-admin-skills-test
```

## Install Dependencies

Install CLI and SDK in your project directory:

```bash
npm install @totoday/quinn-cli @totoday/quinn-sdk
```

## Login

```bash
npx quinn login --email <youremail>
```

You'll be prompted to enter your password.

## Install Skill

```bash
npx skills add https://github.com/totoday/quinn-platform --skills quinn-admin
```

During installation, you'll make three selections:

1. **Select agents**: Choose which agents to install to (select as needed)
2. **Installation scope**: Select `project`
3. **Installation method**: Select `recommended`

Once complete, you can use the quinn-admin skill in supported AI agents.
