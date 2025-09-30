#!/bin/bash
# ================================================================================
# Universal Git Management Tool | Professional Development Workflow
# ================================================================================
#
# TOOL: git.sh - Daily Git Operations Manager
# FUNCTION: Streamlined git workflow automation for development and releases
# ARCHITECTURE: Interactive menu system with direct command support
#
# USAGE:
# Interactive: ./git.sh
# Direct: ./git.sh [1-24] [optional-params]
#
# DAILY WORKFLOW (RECOMMENDED ORDER):
#   ./git.sh 1 "commit msg"   # 1. Commit your changes
#   ./git.sh 2                # 2. Push to develop
#   ./git.sh 3                # 3. Update main from develop
#   ./git.sh 4 "v1.2.0"       # 4. Create release tag
#
# SETUP WORKFLOW (FIRST TIME):
#   ./git.sh 23               # Fresh start (⚠️ RESETS EVERYTHING)
#   ./git.sh 6                # Setup remote origin
#   ./git.sh 5                # Check status
#
# CONFIGURATION: Edit the variables below for your project
# ================================================================================

set -e

# ================================================================================
# 🔧 PROJECT CONFIGURATION - EDIT THESE FOR YOUR PROJECT
# ================================================================================

# PROJECT DETAILS - Update these for each new project
PROJECT_NAME="Multi-AI File Paster"                                    # Display name for headers and releases
PROJECT_VERSION="v1.1.0"                                              # Current version (update manually or use git.sh 4 v1.2.0)
PROJECT_DESCRIPTION="Chrome Extension for auto-converting text to file attachments"  # Brief project description
REPO_URL="https://github.com/JosephMatino/MultiAiFilePaster.git"      # GitHub repository URL

# TEAM INFORMATION - Update for your team
LEAD_DEVELOPER="Joseph Matino"
LEAD_DEVELOPER_EMAIL="dev@josephmatino.com"
LEAD_DEVELOPER_SITE="https://josephmatino.com"

SCRUM_MASTER="Majok Deng"
SCRUM_MASTER_EMAIL="scrum@majokdeng.com"
SCRUM_MASTER_SITE="https://majokdeng.com"

ORGANIZATION="WekTurbo Designs - Hostwek LTD"
ORGANIZATION_SITE="https://hostwek.com/wekturbo"
SUPPORT_EMAIL="wekturbo@hostwek.com"

# PRODUCTION FILE FILTERING - Files/folders to exclude from main branch (production)
# Add any development-only files that shouldn't be in production releases
DEVELOPMENT_FILES=(
  "docs/internal/"              # Internal docs only
  "git.sh"                      # Not part of shipped extension build
  ".vscode/"                    # Editor / MCP config
  "mcp-servers/"                # Local MCP tooling
  ".venv/"                      # Virtual environment
  "pyrightconfig.json"          # Type checking config
  "requirements.txt"            # Python deps for MCP only
  "__pycache__/"                # Python caches
  ".augment/"                   # AI guidelines
  ".github/hooks/"              # Local git hooks (not needed in store package)
  ".github/instructions/"       # Internal AI/rules instructions
  "tests/"                      # Jest test suite (development only)
  # NOTE: Retain .github root markdown (SECURITY.md, CODE_OF_CONDUCT.md, etc.) on main
  # Add more: "dev-tools/", "*.dev.js" as future needs
)
# ================================================================================

# Professional color scheme
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Professional icons
ICON_SUCCESS="✅"
ICON_WARNING="⚠️"
ICON_ERROR="❌"
ICON_INFO="ℹ️"
ICON_ROCKET="🚀"
ICON_BRANCH="🌿"
ICON_TAG="🏷️"
ICON_PUSH="📤"
ICON_PULL="📥"
ICON_RESET="🔄"
ICON_DELETE="🗑️"

# Safety check functions
check_branch_safety() {
  local current_branch=$(git branch --show-current 2>/dev/null || echo "none")
  local operation="$1"

  case $operation in
    "commit")
      if [[ "$current_branch" == "main" ]]; then
        echo -e "${YELLOW}${ICON_WARNING} You're on main branch!${NC}"
        echo -e "${GRAY}It's recommended to work on develop branch${NC}"
        read -p "$(echo -e "${BOLD}Continue anyway? (y/N):${NC} ")" confirm
        [[ $confirm == [yY] ]] || return 1
      fi
      ;;
    "develop_push")
      if [[ "$current_branch" != "develop" ]]; then
        echo -e "${YELLOW}${ICON_WARNING} You're not on develop branch (current: ${current_branch})${NC}"
        echo -e "${GRAY}This will push to develop from ${current_branch}${NC}"
        read -p "$(echo -e "${BOLD}Continue? (y/N):${NC} ")" confirm
        [[ $confirm == [yY] ]] || return 1
      fi
      ;;
    "main_update")
      if [[ "$current_branch" == "main" ]]; then
        echo -e "${YELLOW}${ICON_WARNING} You're already on main branch${NC}"
        echo -e "${GRAY}This operation works best from develop branch${NC}"
      fi
      ;;
  esac
  return 0
}

check_remote_safety() {
  local remote_url=$(git remote get-url origin 2>/dev/null || echo "")
  if [[ -z "$remote_url" ]]; then
    echo -e "${RED}${ICON_ERROR} No remote origin configured${NC}"
    echo -e "${GRAY}Use option 6 to setup remote origin first${NC}"
    return 1
  fi
  return 0
}

print_header() {
  clear
  echo -e "${CYAN}"
  echo "  __  __       _ _   _         _    ___ "
  echo " |  \/  |_   _| | |_(_)       / \  |_ _|"
  echo " | |\/| | | | | | __| |_____ / _ \  | | "
  echo " | |  | | |_| | | |_| |_____/ ___ \ | | "
  echo " |_|  |_|\__,_|_|\__|_|    /_/   \_\___|"
  echo -e "${NC}"
  echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║${NC}                    ${BOLD}${WHITE}${PROJECT_NAME} Git Tool${NC}                        ${CYAN}║${NC}"
  echo -e "${CYAN}║${NC}                     ${GRAY}Professional Development Workflow${NC}                      ${CYAN}║${NC}"
  echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
  echo -e "${CYAN}║${NC} ${YELLOW}Lead Developer:${NC} ${LEAD_DEVELOPER} ${GRAY}| ${BLUE}${LEAD_DEVELOPER_SITE}${NC}           ${CYAN}║${NC}"
  echo -e "${CYAN}║${NC} ${YELLOW}Scrum Master:${NC} ${SCRUM_MASTER} ${GRAY}| ${BLUE}${SCRUM_MASTER_SITE}${NC}               ${CYAN}║${NC}"
  echo -e "${CYAN}║${NC} ${YELLOW}Organization:${NC} ${ORGANIZATION}                        ${CYAN}║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

show_current_status() {
  local current_branch=$(git branch --show-current 2>/dev/null || echo "none")
  local repo_status=$(git status --porcelain 2>/dev/null | wc -l)
  local commit_count=$(git rev-list --count HEAD 2>/dev/null || echo "0")
  local remote_url=$(git remote get-url origin 2>/dev/null || echo "")
  local remote_name="none"
  # Count only local branches (not remote tracking branches)
  local local_branches=$(git branch 2>/dev/null | wc -l)

  # Fetch remote branches to get accurate count (exclude HEAD symbolic reference)
  git fetch origin --quiet 2>/dev/null || true
  local remote_branches=$(git branch -r 2>/dev/null | grep -v "HEAD" | wc -l)

  if [[ -n "$remote_url" && "$remote_url" != "" ]]; then
    remote_name=$(echo "$remote_url" | sed 's/.*\///' | sed 's/\.git$//' 2>/dev/null || echo "unknown")
  fi

  echo -e "${GRAY}┌─ Repository Status ─────────────────────────────────────────────────────────┐${NC}"
  echo -e "${GRAY}│${NC} ${ICON_BRANCH} Branch: ${GREEN}${current_branch}${NC} ${GRAY}│${NC} ${ICON_INFO} Changes: ${YELLOW}${repo_status}${NC} ${GRAY}│${NC} Commits: ${BLUE}${commit_count}${NC} ${GRAY}│${NC}"
  echo -e "${GRAY}│${NC} ${ICON_PUSH} Remote: ${CYAN}${remote_name}${NC} ${GRAY}│${NC} Local Branches: ${PURPLE}${local_branches}${NC} ${GRAY}│${NC} Remote: ${PURPLE}${remote_branches}${NC} ${GRAY}│${NC}"
  echo -e "${GRAY}└─────────────────────────────────────────────────────────────────────────────┘${NC}"
  echo ""
}

show_menu() {
  print_header
  show_current_status

  echo -e "${BOLD}${CYAN}📋 DAILY WORKFLOW (CORRECT ORDER: 1→2→3→4)${NC}"
  echo -e "  ${GREEN}1.${NC}  📝 Add All & Commit ${GRAY}(Step 1: Save your changes)${NC}"
  echo -e "  ${GREEN}2.${NC}  ${ICON_PUSH} Push to Develop ${GRAY}(Step 2: Upload to develop branch)${NC}"
  echo -e "  ${GREEN}3.${NC}  ${ICON_PUSH} Update Main from Develop ${GRAY}(Step 3: Merge to production)${NC}"
  echo -e "  ${GREEN}4.${NC}  ${ICON_TAG} Create Release Tag ${GRAY}(Interactive: ./git.sh 4 OR Direct: ./git.sh 4 v1.2.0)${NC}"
  echo ""

  echo -e "${BOLD}${WHITE}🔧 SETUP & INFO${NC}"
  echo -e "  ${GREEN}5.${NC}  ${ICON_INFO} Complete Status & Info ${GRAY}(Check repository state)${NC}"
  echo -e "  ${GREEN}6.${NC}  ${ICON_PUSH} Manage Remote Origin ${GRAY}(Setup GitHub connection)${NC}"
  echo -e "  ${GREEN}7.${NC}  🚀 Check GitHub Actions ${GRAY}(View workflow status)${NC}"
  echo -e "  ${GREEN}25.${NC} 🔗 Install Git Hooks ${GRAY}(Setup pre-commit & post-commit validation)${NC}"
  echo ""

  echo -e "${BOLD}${WHITE}🌿 BRANCH MANAGEMENT${NC}"
  echo -e "  ${GREEN}8.${NC}  ${ICON_BRANCH} Switch Branch ${GRAY}(Change current branch)${NC}"
  echo -e "  ${GREEN}9.${NC}  ${ICON_INFO} List All Branches ${GRAY}(Show all branches)${NC}"
  echo -e "  ${GREEN}10.${NC} ${ICON_BRANCH} Setup Develop Branch ${GRAY}(Create/switch to develop)${NC}"
  echo -e "  ${GREEN}11.${NC} ${ICON_BRANCH} Setup Main Branch ${GRAY}(Create/switch to main)${NC}"
  echo ""

  echo -e "${BOLD}${WHITE}🏷️ TAG & RELEASE${NC}"
  echo -e "  ${GREEN}12.${NC} ${ICON_TAG} List All Tags ${GRAY}(Show version tags)${NC}"
  echo -e "  ${GREEN}13.${NC} ${ICON_PUSH} Push Specific Tag ${GRAY}(Upload existing tag)${NC}"
  echo -e "  ${GREEN}14.${NC} 📊 Show Commit History ${GRAY}(View recent commits)${NC}"
  echo ""

  echo -e "${BOLD}${YELLOW}⚠️  ADVANCED OPTIONS${NC}"
  echo -e "  ${YELLOW}15.${NC} ${ICON_PUSH} Push to Current Branch ${GRAY}(Push to any branch)${NC}"
  echo -e "  ${YELLOW}16.${NC} ${ICON_PUSH} Force Push Current ${GRAY}(⚠️  Overwrites remote!)${NC}"
  echo -e "  ${YELLOW}17.${NC} ${ICON_BRANCH} Rename Branch ${GRAY}(Rename current branch)${NC}"
  echo -e "  ${YELLOW}18.${NC} ${ICON_RESET} Reset Hard ${GRAY}(⚠️  Loses uncommitted changes!)${NC}"
  echo ""

  echo -e "${BOLD}${RED}🚨 DANGER ZONE - USE WITH CAUTION${NC}"
  echo -e "  ${RED}19.${NC} ${ICON_DELETE} Delete Branch ${GRAY}(⚠️  Permanent deletion - asks for confirmation)${NC}"
  echo -e "  ${RED}20.${NC} ${ICON_DELETE} Delete Tag ${GRAY}(⚠️  Removes tag & GitHub release - asks confirmation)${NC}"
  echo -e "  ${RED}21.${NC} ${ICON_PUSH} Push to Main ${GRAY}(❌ DON'T USE - use option 3 instead)${NC}"
  echo -e "  ${RED}22.${NC} ${ICON_RESET} Reset Remote Origin ${GRAY}(Removes GitHub connection - safe)${NC}"
  echo -e "  ${RED}23.${NC} ${ICON_ROCKET} Fresh Start ${GRAY}(⚠️  NEW PROJECT: Clears ALL history!)${NC}"
  echo -e "  ${RED}24.${NC} ${ICON_DELETE} Complete Reset ${GRAY}(🚨 NUCLEAR: Deletes EVERYTHING - requires typing confirmation!)${NC}"
  echo ""

  echo -e "${BOLD}${MAGENTA}🧪 TEST SUITE MANAGEMENT${NC}"
  echo -e "  ${MAGENTA}26.${NC} 🧪 Run All Tests ${GRAY}(Execute Jest test suite - 38 tests)${NC}"
  echo -e "  ${MAGENTA}27.${NC} 📊 Run Tests with Coverage ${GRAY}(Generate coverage report)${NC}"
  echo -e "  ${MAGENTA}28.${NC} 🎯 Interactive Test Menu ${GRAY}(Launch tests/test.sh)${NC}"
  echo ""

  echo -e "${BOLD}${RED}0.${NC}  🚪 Exit"
  echo ""
  echo -e "${GRAY}─────────────────────────────────────────────────────────────────────────────${NC}"
  echo -e "${BOLD}${CYAN}💡 Daily Workflow: 1 → 2 → 3 → 4 (Don't skip steps!)${NC}"
  echo -e "${GRAY}   Release Examples: ./git.sh 4 v1.2.0 \"Bug fixes\" OR ./git.sh 4 (interactive)${NC}"
  echo -e "${GRAY}   Test Suite: Use option 28 for interactive testing menu${NC}"
  read -p "$(echo -e "${BOLD}${CYAN}Choose option [0-28]:${NC} ")" choice
  echo ""
}

fresh_start() {
  echo -e "${RED}${ICON_WARNING} WARNING: This will delete ALL git history and start fresh!${NC}"
  echo -e "${YELLOW}${ICON_INFO} This will also clean ALL GitHub releases and tags!${NC}"
  echo -e "${GRAY}Local development virtual environment (.venv/) will be PRESERVED (untracked only).${NC}"
  read -p "$(echo -e "${BOLD}Continue? (y/N):${NC} ")" confirm
  if [[ $confirm != [yY] ]]; then
    echo -e "${YELLOW}${ICON_INFO} Operation cancelled.${NC}"
    return
  fi

  # Clean GitHub releases and tags first (if remote exists)
  local remote_url=$(git remote get-url origin 2>/dev/null || echo "")
  if [[ -n "$remote_url" ]]; then
    echo -e "${BLUE}${ICON_DELETE} Cleaning GitHub releases and tags...${NC}"

    # Delete all remote tags
    local remote_tags=($(git ls-remote --tags origin 2>/dev/null | awk '{print $2}' | sed 's|refs/tags/||' | grep -v '\^{}$' || true))
    for tag in "${remote_tags[@]}"; do
      if [[ -n "$tag" ]]; then
        echo -e "${GRAY}Deleting remote tag: ${tag}${NC}"
        git push origin ":refs/tags/$tag" 2>/dev/null || true
      fi
    done

    # Delete all local tags
    local local_tags=($(git tag -l))
    for tag in "${local_tags[@]}"; do
      if [[ -n "$tag" ]]; then
        echo -e "${GRAY}Deleting local tag: ${tag}${NC}"
        git tag -d "$tag" 2>/dev/null || true
      fi
    done
  fi

  echo -e "${BLUE}${ICON_RESET} Removing git history...${NC}"
  rm -rf .git
  git init

  echo -e "${GREEN}${ICON_BRANCH} Creating develop branch...${NC}"
  git checkout -b develop

  echo -e "${BLUE}📝 Adding all files...${NC}"
  git add .
  git commit -m "Initial commit - ${PROJECT_NAME} ${PROJECT_VERSION}

- ${PROJECT_DESCRIPTION}
- Professional GitHub workflow with CI/CD
- Production-ready release structure
- Dual-branch workflow (develop/main)"

  echo -e "${GREEN}${ICON_BRANCH} Creating main branch (production-only)...${NC}"
  git checkout -b main

  # Remove development files from main branch using configuration
  echo -e "${BLUE}${ICON_INFO} Removing development files from main...${NC}"
  for dev_file in "${DEVELOPMENT_FILES[@]}"; do
    # CRITICAL: NEVER delete git.sh from develop branch - it must always exist there
    if [[ "$dev_file" == "git.sh" ]]; then
      echo -e "${GRAY}Skipping git.sh removal (must stay on develop branch)${NC}"
      continue
    fi

    if [[ -e "$dev_file" ]]; then
      # SAFETY: Never physically delete existing local virtual environment directory.
      # We only want to untrack it if it was ever committed. Physical removal can
      # frustrate local development by forcing re-install of dependencies.
      if [[ "$dev_file" == ".venv/" ]]; then
        echo -e "${GRAY}Untracking (preserving local) virtual environment: ${dev_file}${NC}"
        git rm -r --cached "$dev_file" 2>/dev/null || true
      else
        echo -e "${GRAY}Removing: ${dev_file}${NC}"
        git rm -rf "$dev_file" 2>/dev/null || true
      fi
    fi
  done

  # Create production .gitignore for main
  create_production_gitignore

  # Commit production-ready main branch
  git add .
  git commit -m "production: clean main branch for deployment

- Removed development files ($(IFS=', '; echo "${DEVELOPMENT_FILES[*]}"))
- Production-ready .gitignore
- Clean structure for deployment/store submission" 2>/dev/null || true

  echo -e "${CYAN}${ICON_BRANCH} Switching back to develop...${NC}"
  git checkout develop

  echo -e "${GREEN}${ICON_SUCCESS} Fresh git setup complete!${NC}"
  echo -e "${GRAY}Current branch: ${GREEN}develop${NC}"
  echo -e "${GRAY}Available branches: ${GREEN}develop${NC}, ${GREEN}main${NC}"
}

# Helper function to create production .gitignore
create_production_gitignore() {
  cat > .gitignore << EOF
# Development files (excluded from production)
$(printf '%s\n' "${DEVELOPMENT_FILES[@]}")

# Node modules and dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary files
*.tmp
*.temp
*.log
EOF
}

switch_branch() {
  local branches=($(git branch | sed 's/\*//g' | sed 's/^[ \t]*//'))
  local selection="$2"

  if [ ${#branches[@]} -eq 0 ]; then
    echo -e "${RED}${ICON_ERROR} No branches found${NC}"
    return 1
  fi

  if [[ -z "$selection" ]]; then
    echo -e "${BOLD}${WHITE}Available Branches:${NC}"
    for i in "${!branches[@]}"; do
      local branch="${branches[$i]}"
      local current=""
      if [[ "$(git branch --show-current)" == "$branch" ]]; then
        current=" ${GREEN}(current)${NC}"
      fi
      echo -e "  ${GREEN}$((i+1)).${NC} ${branch}${current}"
    done
    echo ""
    read -p "$(echo -e "${BOLD}Select branch [1-${#branches[@]}]:${NC} ")" selection
  fi

  if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le "${#branches[@]}" ]; then
    local target_branch="${branches[$((selection-1))]}"
    git checkout "$target_branch"
    echo -e "${GREEN}${ICON_SUCCESS} Switched to branch: ${target_branch}${NC}"
  else
    echo -e "${RED}${ICON_ERROR} Invalid selection${NC}"
  fi
}

rename_branch() {
  local current_branch=$(git branch --show-current)
  local new_name="$2"

  echo -e "${BLUE}${ICON_INFO} Current branch: ${GREEN}${current_branch}${NC}"

  if [[ -z "$new_name" ]]; then
    read -p "$(echo -e "${BOLD}New branch name:${NC} ")" new_name
  fi

  if [[ -z "$new_name" ]]; then
    echo -e "${RED}${ICON_ERROR} Branch name required${NC}"
    return 1
  fi

  git branch -m "$new_name"
  echo -e "${GREEN}${ICON_SUCCESS} Branch renamed: ${current_branch} → ${new_name}${NC}"
}

delete_branch() {
  local branches=($(git branch | grep -v "$(git branch --show-current)" | sed 's/^[ \t]*//'))

  if [ ${#branches[@]} -eq 0 ]; then
    echo -e "${YELLOW}${ICON_WARNING} No other branches to delete${NC}"
    return
  fi

  echo -e "${BOLD}${WHITE}Branches available for deletion:${NC}"
  for i in "${!branches[@]}"; do
    echo -e "  ${RED}$((i+1)).${NC} ${branches[$i]}"
  done
  echo ""

  read -p "$(echo -e "${BOLD}Select branch to delete [1-${#branches[@]}]:${NC} ")" selection

  if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le "${#branches[@]}" ]; then
    local target_branch="${branches[$((selection-1))]}"
    echo -e "${RED}${ICON_WARNING} This will permanently delete branch: ${target_branch}${NC}"
    read -p "$(echo -e "${BOLD}Confirm deletion? (y/N):${NC} ")" confirm

    if [[ $confirm == [yY] ]]; then
      git branch -D "$target_branch"
      echo -e "${GREEN}${ICON_SUCCESS} Branch deleted: ${target_branch}${NC}"
    else
      echo -e "${YELLOW}${ICON_INFO} Deletion cancelled${NC}"
    fi
  else
    echo -e "${RED}${ICON_ERROR} Invalid selection${NC}"
  fi
}

list_branches() {
  echo -e "${BOLD}${WHITE}All Branches:${NC}"
  git branch -a
  echo ""
  read -p "$(echo -e "${GRAY}Press Enter to continue...${NC}")"
}

list_tags() {
  # Fetch tags from remote first
  git fetch --tags 2>/dev/null || true
  local tags=($(git tag -l))

  if [ ${#tags[@]} -eq 0 ]; then
    echo -e "${YELLOW}${ICON_INFO} No tags found${NC}"
    return
  fi

  echo -e "${BOLD}${WHITE}All Tags:${NC}"
  for tag in "${tags[@]}"; do
    echo -e "  ${BLUE}${ICON_TAG} ${tag}${NC}"
  done
  echo ""
  read -p "$(echo -e "${GRAY}Press Enter to continue...${NC}")"
}

delete_tag() {
  local tags=($(git tag -l))

  if [ ${#tags[@]} -eq 0 ]; then
    echo -e "${YELLOW}${ICON_WARNING} No tags to delete${NC}"
    return
  fi

  echo -e "${BOLD}${WHITE}Tags available for deletion:${NC}"
  for i in "${!tags[@]}"; do
    echo -e "  ${RED}$((i+1)).${NC} ${tags[$i]}"
  done
  echo ""

  read -p "$(echo -e "${BOLD}Select tag to delete [1-${#tags[@]}]:${NC} ")" selection

  if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le "${#tags[@]}" ]; then
    local target_tag="${tags[$((selection-1))]}"
    echo -e "${RED}${ICON_WARNING} This will delete tag: ${target_tag}${NC}"
    read -p "$(echo -e "${BOLD}Delete locally and remotely? (y/N):${NC} ")" confirm

    if [[ $confirm == [yY] ]]; then
      git tag -d "$target_tag"
      git push origin ":refs/tags/$target_tag" 2>/dev/null || true
      echo -e "${GREEN}${ICON_SUCCESS} Tag deleted: ${target_tag}${NC}"
    else
      echo -e "${YELLOW}${ICON_INFO} Deletion cancelled${NC}"
    fi
  else
    echo -e "${RED}${ICON_ERROR} Invalid selection${NC}"
  fi
}

push_tag() {
  local tags=($(git tag -l))

  if [ ${#tags[@]} -eq 0 ]; then
    echo -e "${YELLOW}${ICON_WARNING} No tags to push${NC}"
    return
  fi

  echo -e "${BOLD}${WHITE}Available Tags:${NC}"
  for i in "${!tags[@]}"; do
    echo -e "  ${GREEN}$((i+1)).${NC} ${tags[$i]}"
  done
  echo ""

  read -p "$(echo -e "${BOLD}Select tag to push [1-${#tags[@]}]:${NC} ")" selection

  if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le "${#tags[@]}" ]; then
    local target_tag="${tags[$((selection-1))]}"
    git push origin "$target_tag"
    echo -e "${GREEN}${ICON_SUCCESS} Tag pushed: ${target_tag}${NC}"
  else
    echo -e "${RED}${ICON_ERROR} Invalid selection${NC}"
  fi
}

show_commit_history() {
  echo -e "${BOLD}${WHITE}Recent Commit History:${NC}"
  git log --oneline --graph --decorate -10
}

setup_develop() {
  git checkout -b develop 2>/dev/null || git checkout develop
  echo -e "${GREEN}${ICON_SUCCESS} On develop branch${NC}"
}

setup_main() {
  git checkout -b main 2>/dev/null || git checkout main
  echo -e "${GREEN}${ICON_SUCCESS} On main branch${NC}"
}

add_commit() {
  # Safety check
  check_branch_safety "commit" || return 1

  local msg="$2"
  if [[ -z "$msg" ]]; then
    read -p "$(echo -e "${BOLD}Commit message:${NC} ")" msg
  fi

  if [[ -z "$msg" ]]; then
    echo -e "${RED}${ICON_ERROR} Commit message required${NC}"
    return 1
  fi

  # Check if there are changes to commit
  local repo_status=$(git status --porcelain 2>/dev/null | wc -l)
  if [[ "$repo_status" -eq 0 ]]; then
    echo -e "${YELLOW}${ICON_WARNING} No changes to commit${NC}"
    echo -e "${GRAY}Working directory is clean${NC}"
    return 0
  fi

  git add .
  git commit -m "$msg"
  echo -e "${GREEN}${ICON_SUCCESS} Committed: ${msg}${NC}"
  echo -e "${GRAY}Next step: Use option 2 to push to develop${NC}"
}

push_current() {
  local branch=$(git branch --show-current)
  local remote_url=$(git remote get-url origin 2>/dev/null || echo "")

  if [[ -z "$remote_url" ]]; then
    echo -e "${YELLOW}${ICON_WARNING} No remote origin configured${NC}"
    echo -e "${BLUE}${ICON_INFO} Setting up default remote: ${REPO_URL}${NC}"
    git remote add origin "$REPO_URL" || {
      echo -e "${RED}${ICON_ERROR} Failed to setup remote origin${NC}"
      echo -e "${GRAY}Use option 6 to setup remote origin manually${NC}"
      return 1
    }
    echo -e "${GREEN}${ICON_SUCCESS} Remote origin configured${NC}"
  fi

  echo -e "${BLUE}${ICON_PUSH} Pushing to ${branch}...${NC}"

  if ! git push -u origin "$branch" 2>/dev/null; then
    echo -e "${YELLOW}${ICON_WARNING} Push failed - remote ${branch} has different history${NC}"
    read -p "$(echo -e "${BOLD}Force push to ${branch}? (y/N):${NC} ")" confirm

    if [[ $confirm == [yY] ]]; then
      echo -e "${BLUE}${ICON_PUSH} Force pushing to ${branch}...${NC}"
      git push --force origin "$branch"
      echo -e "${GREEN}${ICON_SUCCESS} Force pushed to ${branch}${NC}"
    else
      echo -e "${YELLOW}${ICON_INFO} Push to ${branch} cancelled${NC}"
      return 1
    fi
  else
    echo -e "${GREEN}${ICON_SUCCESS} Pushed to ${branch}${NC}"
  fi
}

push_develop() {
  # Safety checks
  check_remote_safety || return 1
  check_branch_safety "develop_push" || return 1

  local remote_url=$(git remote get-url origin 2>/dev/null || echo "")

  if [[ -z "$remote_url" ]]; then
    echo -e "${YELLOW}${ICON_WARNING} No remote origin configured${NC}"
    echo -e "${BLUE}${ICON_INFO} Setting up default remote: ${REPO_URL}${NC}"
    git remote add origin "$REPO_URL" || {
      echo -e "${RED}${ICON_ERROR} Failed to setup remote origin${NC}"
      echo -e "${GRAY}Use option 6 to setup remote origin manually${NC}"
      return 1
    }
    echo -e "${GREEN}${ICON_SUCCESS} Remote origin configured${NC}"
  fi

  echo -e "${BLUE}${ICON_PUSH} Pushing to develop...${NC}"

  if ! git push -u origin develop 2>/dev/null; then
    echo -e "${YELLOW}${ICON_WARNING} Push failed - remote develop has different history${NC}"
    read -p "$(echo -e "${BOLD}Force push to develop? (y/N):${NC} ")" confirm

    if [[ $confirm == [yY] ]]; then
      echo -e "${BLUE}${ICON_PUSH} Force pushing to develop...${NC}"
      git push --force origin develop
      echo -e "${GREEN}${ICON_SUCCESS} Force pushed to develop${NC}"
    else
      echo -e "${YELLOW}${ICON_INFO} Push to develop cancelled${NC}"
      return 1
    fi
  else
    echo -e "${GREEN}${ICON_SUCCESS} Pushed to develop${NC}"
  fi

  echo -e "${GRAY}Next step: Use option 3 to update main from develop${NC}"
}

push_main() {
  echo -e "${YELLOW}${ICON_WARNING} Direct push to main is not recommended${NC}"
  echo -e "${BLUE}${ICON_INFO} Use option 3 (Update Main from Develop) instead${NC}"
  echo -e "${GRAY}This ensures proper production file structure${NC}"
  read -p "$(echo -e "${BOLD}Continue with direct push anyway? (y/N):${NC} ")" confirm

  if [[ $confirm != [yY] ]]; then
    echo -e "${GREEN}${ICON_SUCCESS} Cancelled - use option 3 instead${NC}"
    return 0
  fi

  local remote_url=$(git remote get-url origin 2>/dev/null || echo "")

  if [[ -z "$remote_url" ]]; then
    echo -e "${YELLOW}${ICON_WARNING} No remote origin configured${NC}"
    echo -e "${BLUE}${ICON_INFO} Setting up default remote: ${REPO_URL}${NC}"
    git remote add origin "$REPO_URL" || {
      echo -e "${RED}${ICON_ERROR} Failed to setup remote origin${NC}"
      echo -e "${GRAY}Use option 6 to setup remote origin manually${NC}"
      return 1
    }
    echo -e "${GREEN}${ICON_SUCCESS} Remote origin configured${NC}"
  fi

  echo -e "${BLUE}${ICON_PUSH} Pushing to main...${NC}"

  if ! git push -u origin main 2>/dev/null; then
    echo -e "${YELLOW}${ICON_WARNING} Push failed - remote main has different history${NC}"
    echo -e "${GRAY}This usually happens after a fresh start or force push${NC}"
    read -p "$(echo -e "${BOLD}Force push to main? (y/N):${NC} ")" confirm

    if [[ $confirm == [yY] ]]; then
      echo -e "${BLUE}${ICON_PUSH} Force pushing to main...${NC}"
      git push --force origin main
      echo -e "${GREEN}${ICON_SUCCESS} Force pushed to main${NC}"
    else
      echo -e "${YELLOW}${ICON_INFO} Push to main cancelled${NC}"
      echo -e "${GRAY}Tip: Use option 16 (Force Push) if you need to overwrite remote main${NC}"
      return 1
    fi
  else
    echo -e "${GREEN}${ICON_SUCCESS} Pushed to main${NC}"
  fi

  # Show main branch file structure (when on main branch)
  if [[ "$(git branch --show-current)" == "main" ]]; then
    echo -e "${BLUE}${ICON_INFO} Main branch file structure:${NC}"
    git ls-tree -r --name-only HEAD | head -15
    if [[ $(git ls-tree -r --name-only HEAD | wc -l) -gt 15 ]]; then
      echo -e "${GRAY}... and $(($(git ls-tree -r --name-only HEAD | wc -l) - 15)) more files${NC}"
    fi
  fi
}

create_tag() {
  # Safety checks
  check_remote_safety || return 1

  local tag="$2"
  local msg="$3"
  local remote_url=$(git remote get-url origin 2>/dev/null || echo "")
  local current_branch=$(git branch --show-current)

  # Interactive mode: no parameters provided
  if [[ $# -eq 1 ]]; then
    if [[ -z "$tag" ]]; then
      read -p "$(echo -e "${BOLD}Tag version (e.g., v1.1.0):${NC} ")" tag
    fi
    if [[ -z "$msg" ]]; then
      read -p "$(echo -e "${BOLD}Release description:${NC} ")" msg
    fi
  fi

  # Direct mode: validate required parameters
  if [[ -z "$tag" ]]; then
    echo -e "${RED}${ICON_ERROR} Tag version required${NC}"
    echo -e "${GRAY}Usage: ./git.sh 4 v1.2.0 \"Release description\"${NC}"
    return 1
  fi

  # Require description - no defaults
  if [[ -z "$msg" ]]; then
    echo -e "${RED}${ICON_ERROR} Release description required${NC}"
    echo -e "${GRAY}Usage: ./git.sh 4 v1.2.0 \"Release description\"${NC}"
    return 1
  fi

  # CRITICAL: Ensure we're on main branch for release tags
  if [[ "$current_branch" != "main" ]]; then
    echo -e "${YELLOW}${ICON_WARNING} Switching to main branch for release tag...${NC}"
    git checkout main || {
      echo -e "${RED}${ICON_ERROR} Failed to switch to main branch${NC}"
      return 1
    }
  fi

  echo -e "${BLUE}${ICON_TAG} Creating release tag: ${tag} from main branch${NC}"

  # Update version numbers across codebase before creating tag
  echo -e "${BLUE}🔄 Updating version numbers across codebase...${NC}"

  # Update manifest.json version (remove 'v' prefix for manifest)
  if [[ -f "manifest.json" ]]; then
    local version_number="${tag#v}"  # Remove 'v' prefix
    sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"$version_number\"/" manifest.json
    rm -f manifest.json.bak
    echo -e "${GREEN}  ✅ Updated manifest.json version to $version_number${NC}"
  fi

  # Update all JavaScript signature headers
  find src/ -name "*.js" -type f | while read -r file; do
    if head -10 "$file" | grep -q "PRODUCTION RELEASE"; then
      sed -i.bak "s/PRODUCTION RELEASE v[0-9]\+\.[0-9]\+\.[0-9]\+/PRODUCTION RELEASE $tag/" "$file"
      rm -f "$file.bak"
    fi
  done
  echo -e "${GREEN}  ✅ Updated all JavaScript signature headers to $tag${NC}"

  # Update git.sh PROJECT_VERSION
  sed -i.bak "s/PROJECT_VERSION=\"v[0-9]\+\.[0-9]\+\.[0-9]\+\"/PROJECT_VERSION=\"$tag\"/" git.sh
  rm -f git.sh.bak
  echo -e "${GREEN}  ✅ Updated git.sh PROJECT_VERSION to $tag${NC}"

  # Commit version updates
  git add manifest.json src/ git.sh
  git commit -m "🔖 Version bump to $tag - Release preparation

- Updated manifest.json version to ${tag#v}
- Updated all signature headers to $tag
- Updated git.sh PROJECT_VERSION
- Ready for release tag creation"

  # Create git tag with proper message format for GitHub releases
  local release_title="${PROJECT_NAME} ${tag} - ${msg}"

  git tag -a "$tag" -m "$release_title"
  git push origin "$tag"
  echo -e "${GREEN}${ICON_SUCCESS} Created and pushed git tag: ${tag}${NC}"

  # Create GitHub Release using gh CLI (if available)
  if command -v gh &> /dev/null; then
    echo -e "${BLUE}${ICON_INFO} Creating GitHub Release...${NC}"

    # Create release with gh CLI
    gh release create "$tag" \
      --title "$release_title" \
      --notes "$msg" \
      --latest \
      --verify-tag || {
      echo -e "${YELLOW}${ICON_WARNING} GitHub CLI release creation failed${NC}"
      echo -e "${GRAY}Tag created successfully, but GitHub Release must be created manually${NC}"
      echo -e "${GRAY}Visit: ${remote_url}/releases/new?tag=${tag}${NC}"
    }

    echo -e "${GREEN}${ICON_SUCCESS} GitHub Release created: ${release_title}${NC}"
    echo -e "${GRAY}View at: ${remote_url}/releases/tag/${tag}${NC}"
  else
    echo -e "${YELLOW}${ICON_WARNING} GitHub CLI (gh) not installed${NC}"
    echo -e "${GRAY}Git tag created successfully, but GitHub Release must be created manually${NC}"
    echo -e "${GRAY}Install gh CLI: https://cli.github.com/${NC}"
    echo -e "${GRAY}Or create release manually at: ${remote_url}/releases/new?tag=${tag}${NC}"
  fi

  # Switch back to original branch if it wasn't main
  if [[ "$current_branch" != "main" ]]; then
    echo -e "${CYAN}${ICON_BRANCH} Switching back to ${current_branch}...${NC}"
    git checkout "$current_branch"
  fi
}

reset_hard() {
  echo -e "${RED}${ICON_WARNING} WARNING: This will lose ALL uncommitted changes!${NC}"
  read -p "$(echo -e "${BOLD}Continue? (y/N):${NC} ")" confirm
  if [[ $confirm != [yY] ]]; then
    echo -e "${YELLOW}${ICON_INFO} Operation cancelled${NC}"
    return
  fi
  git reset --hard HEAD
  echo -e "${GREEN}${ICON_SUCCESS} Reset to HEAD${NC}"
}

show_status() {
  echo -e "${BOLD}${WHITE}📊 Complete Repository Status${NC}"
  echo ""

  # Current status
  echo -e "${BLUE}${ICON_INFO} Current Status:${NC}"
  git status
  echo ""

  # Branch information
  echo -e "${BLUE}${ICON_BRANCH} Branch Structure:${NC}"
  git branch -a
  echo ""

  # Recent commits
  echo -e "${BLUE}📝 Recent Commits:${NC}"
  git log --oneline --graph --decorate -8
  echo ""

  # Remote information
  echo -e "${BLUE}${ICON_PUSH} Remote Configuration:${NC}"
  if git remote -v 2>/dev/null | grep -q origin; then
    git remote -v
    echo ""
    echo -e "${GRAY}Testing remote connection...${NC}"
    if git ls-remote --heads origin >/dev/null 2>&1; then
      echo -e "${GREEN}  ✅ Remote connection working${NC}"
    else
      echo -e "${YELLOW}  ⚠️  Remote connection failed${NC}"
    fi
  else
    echo -e "${YELLOW}${ICON_WARNING} No remote configured${NC}"
    echo -e "${GRAY}Use option 6 to setup remote origin${NC}"
  fi

  echo ""
  echo -e "${BOLD}${WHITE}💡 Next Steps:${NC}"
  local current_branch=$(git branch --show-current 2>/dev/null || echo "none")
  local repo_status=$(git status --porcelain 2>/dev/null | wc -l)

  if [[ "$repo_status" -gt 0 ]]; then
    echo -e "${YELLOW}  • You have ${repo_status} uncommitted changes${NC}"
    echo -e "${GRAY}    Recommended: ./git.sh 1 \"commit message\"${NC}"
  else
    echo -e "${GREEN}  • Working directory clean${NC}"
  fi

  if [[ "$current_branch" == "develop" ]]; then
    echo -e "${GREEN}  • You're on develop branch (perfect for development)${NC}"
    echo -e "${GRAY}    Daily workflow: 1 → 2 → 3 → 4${NC}"
  elif [[ "$current_branch" == "main" ]]; then
    echo -e "${BLUE}  • You're on main branch (production)${NC}"
    echo -e "${GRAY}    Switch to develop: ./git.sh 8${NC}"
  fi

  echo ""
  read -p "$(echo -e "${GRAY}Press Enter to continue...${NC}")"
}

manage_remote() {
  local current_remote=$(git remote get-url origin 2>/dev/null || echo "none")

  echo -e "${BOLD}${WHITE}Remote Origin Management${NC}"
  echo -e "${GRAY}Current remote: ${CYAN}${current_remote}${NC}"
  echo ""
  echo -e "${GREEN}1.${NC} Set to default: ${REPO_URL}"
  echo -e "${GREEN}2.${NC} Enter custom URL"
  echo -e "${GREEN}3.${NC} Remove remote origin"
  echo -e "${GREEN}0.${NC} Cancel"
  echo ""

  read -p "$(echo -e "${BOLD}Choose option [0-3]:${NC} ")" choice

  case $choice in
    1)
      git remote remove origin 2>/dev/null || true
      if git remote add origin "$REPO_URL"; then
        echo -e "${GREEN}${ICON_SUCCESS} Set remote to: ${REPO_URL}${NC}"
        echo -e "${GRAY}Verifying connection...${NC}"
        git remote -v
      else
        echo -e "${RED}${ICON_ERROR} Failed to set remote${NC}"
      fi
      ;;
    2)
      read -p "$(echo -e "${BOLD}Enter remote URL:${NC} ")" custom_url
      if [[ -n "$custom_url" ]]; then
        git remote remove origin 2>/dev/null || true
        if git remote add origin "$custom_url"; then
          echo -e "${GREEN}${ICON_SUCCESS} Set remote to: ${custom_url}${NC}"
          echo -e "${GRAY}Verifying connection...${NC}"
          git remote -v
        else
          echo -e "${RED}${ICON_ERROR} Failed to set remote${NC}"
        fi
      else
        echo -e "${RED}${ICON_ERROR} URL required${NC}"
      fi
      ;;
    3)
      if git remote remove origin 2>/dev/null; then
        echo -e "${GREEN}${ICON_SUCCESS} Remote origin removed${NC}"
      else
        echo -e "${YELLOW}${ICON_WARNING} No remote origin to remove${NC}"
      fi
      ;;
    0)
      echo -e "${YELLOW}${ICON_INFO} Operation cancelled${NC}"
      ;;
    *)
      echo -e "${RED}${ICON_ERROR} Invalid option${NC}"
      ;;
  esac
}

check_github_actions() {
  local remote_url=$(git remote get-url origin 2>/dev/null || echo "")

  if [[ -z "$remote_url" ]]; then
    echo -e "${RED}${ICON_ERROR} No remote origin configured${NC}"
    return 1
  fi

  echo -e "${BOLD}${WHITE}GitHub Actions Status${NC}"
  echo -e "${GRAY}Repository: ${CYAN}${remote_url}${NC}"
  echo ""
  echo -e "${BLUE}${ICON_INFO} Checking workflow files...${NC}"

  if [[ -f ".github/workflows/ci.yml" ]]; then
    echo -e "${GREEN}${ICON_SUCCESS} CI workflow found${NC}"
  else
    echo -e "${YELLOW}${ICON_WARNING} CI workflow not found${NC}"
  fi

  if [[ -f ".github/workflows/release.yml" ]]; then
    echo -e "${GREEN}${ICON_SUCCESS} Release workflow found${NC}"
  else
    echo -e "${YELLOW}${ICON_WARNING} Release workflow not found${NC}"
  fi

  echo ""
  echo -e "${GRAY}To view workflow runs, visit:${NC}"
  echo -e "${BLUE}${remote_url}/actions${NC}"
}

force_push() {
  local branch=$(git branch --show-current)
  local auto_confirm="$2"
  local remote_url=$(git remote get-url origin 2>/dev/null || echo "")

  if [[ -z "$remote_url" ]]; then
    echo -e "${RED}${ICON_ERROR} No remote origin configured${NC}"
    echo -e "${GRAY}Use option 6 to setup remote origin first${NC}"
    return 1
  fi

  echo -e "${RED}${ICON_WARNING} WARNING: Force push will overwrite remote ${branch}!${NC}"

  if [[ -z "$auto_confirm" ]]; then
    read -p "$(echo -e "${BOLD}Continue? (y/N):${NC} ")" confirm
  else
    confirm="$auto_confirm"
    echo -e "${GRAY}Auto-confirmed: ${confirm}${NC}"
  fi

  if [[ $confirm != [yY] ]]; then
    echo -e "${YELLOW}${ICON_INFO} Operation cancelled${NC}"
    return
  fi

  git push --force origin "$branch"
  echo -e "${GREEN}${ICON_SUCCESS} Force pushed to ${branch}${NC}"
}

update_main_from_develop() {
  # Safety checks
  check_remote_safety || return 1
  check_branch_safety "main_update"

  local current_branch=$(git branch --show-current)
  local remote_url=$(git remote get-url origin 2>/dev/null || echo "")

  echo -e "${BLUE}${ICON_INFO} Current branch: ${GREEN}${current_branch}${NC}"
  echo -e "${BLUE}${ICON_PUSH} Updating main branch from develop...${NC}"

  # Ensure we're on develop
  if [[ "$current_branch" != "develop" ]]; then
    echo -e "${YELLOW}${ICON_WARNING} Switching to develop branch first...${NC}"
    git checkout develop || {
      echo -e "${RED}${ICON_ERROR} Failed to switch to develop branch${NC}"
      return 1
    }
  fi

  # Push develop first
  echo -e "${BLUE}${ICON_PUSH} Pushing develop...${NC}"
  if ! git push origin develop 2>/dev/null; then
    echo -e "${YELLOW}${ICON_WARNING} Develop push failed, trying force push...${NC}"
    git push --force origin develop
  fi

  # Switch to main and merge
  echo -e "${BLUE}${ICON_BRANCH} Switching to main...${NC}"
  git checkout main || {
    echo -e "${RED}${ICON_ERROR} Failed to switch to main branch${NC}"
    return 1
  }

  echo -e "${BLUE}${ICON_PUSH} Merging develop into main (production files only)...${NC}"

  # Instead of direct merge, copy only production files
  git checkout develop -- . 2>/dev/null || true

  # Remove development files from git index only (not from filesystem)
  for dev_file in "${DEVELOPMENT_FILES[@]}"; do
    # CRITICAL: NEVER delete git.sh from develop branch - it must always exist there
    if [[ "$dev_file" == "git.sh" ]]; then
      echo -e "${GRAY}Skipping git.sh removal (must stay on develop branch)${NC}"
      continue
    fi

    if [[ -e "$dev_file" ]]; then
      if [[ "$dev_file" == ".venv/" ]]; then
        echo -e "${GRAY}Untracking (preserving local) virtual environment: ${dev_file}${NC}"
        git rm -r --cached "$dev_file" 2>/dev/null || true
      else
        echo -e "${GRAY}Removing from git: ${dev_file}${NC}"
        git rm -r --cached "$dev_file" 2>/dev/null || true
      fi
    fi
  done

  # Stage the changes
  git add -A

  # Create production .gitignore
  create_production_gitignore

  # Commit production release
  git commit -m "production: merge develop for deployment release

- Updated from develop branch with latest features
- Excluded development files ($(IFS=', '; echo "${DEVELOPMENT_FILES[*]}"))
- Production-ready structure for deployment" || {
    echo -e "${YELLOW}${ICON_WARNING} No changes to commit${NC}"
  }

  # Push main
  echo -e "${BLUE}${ICON_PUSH} Pushing main...${NC}"
  if ! git push origin main 2>/dev/null; then
    echo -e "${YELLOW}${ICON_WARNING} Main push failed, trying force push...${NC}"
    git push --force origin main
  fi

  # Switch back to develop and restore all develop files
  echo -e "${BLUE}${ICON_BRANCH} Switching back to develop...${NC}"
  git checkout develop

  # Restore develop branch to have ALL files (including internal files)
  git reset --hard HEAD

  echo -e "${GREEN}${ICON_SUCCESS} Main branch updated from develop${NC}"

  # Show main branch file structure
  echo -e "${BLUE}${ICON_INFO} Main branch file structure:${NC}"
  git ls-tree -r --name-only main | head -20
  if [[ $(git ls-tree -r --name-only main | wc -l) -gt 20 ]]; then
    echo -e "${GRAY}... and $(($(git ls-tree -r --name-only main | wc -l) - 20)) more files${NC}"
  fi

  echo -e "${GRAY}Next step: Use option 4 to create a release tag${NC}"
}

reset_remote() {
  echo -e "${YELLOW}${ICON_WARNING} This will remove current remote origin configuration${NC}"
  echo -e "${GRAY}You will need to reconfigure it using option 6${NC}"
  read -p "$(echo -e "${BOLD}Continue? (y/N):${NC} ")" confirm

  if [[ $confirm != [yY] ]]; then
    echo -e "${YELLOW}${ICON_INFO} Operation cancelled${NC}"
    return
  fi

  git remote remove origin 2>/dev/null || true
  echo -e "${GREEN}${ICON_SUCCESS} Remote origin removed${NC}"
  echo -e "${BLUE}${ICON_INFO} Use option 6 to configure new remote origin${NC}"
}

install_hooks() {
  echo -e "${BLUE}${ICON_INFO} Installing Git Hooks...${NC}"

  # Check if hooks exist in .github/hooks/
  if [[ ! -f ".github/hooks/pre-commit" ]] || [[ ! -f ".github/hooks/post-commit" ]]; then
    echo -e "${RED}${ICON_ERROR} Hook files not found in .github/hooks/${NC}"
    echo -e "${GRAY}Expected files: .github/hooks/pre-commit, .github/hooks/post-commit${NC}"
    return 1
  fi

  # Install hooks
  echo -e "${BLUE}${ICON_INFO} Copying hooks to .git/hooks/${NC}"
  cp .github/hooks/pre-commit .git/hooks/pre-commit
  cp .github/hooks/post-commit .git/hooks/post-commit

  # Make sure they're executable
  chmod +x .git/hooks/pre-commit
  chmod +x .git/hooks/post-commit

  echo -e "${GREEN}${ICON_SUCCESS} Git hooks installed successfully!${NC}"
  echo -e "${GRAY}• pre-commit: Validates code quality before commits${NC}"
  echo -e "${GRAY}• post-commit: Shows next steps after commits${NC}"
  echo -e "${GRAY}Hooks will run automatically on git commit${NC}"
}

# ================================================================================
# 🧪 TEST SUITE MANAGEMENT (Options 26-28)
# ================================================================================

run_tests() {
  echo -e "${MAGENTA}${ICON_INFO} Running Jest Test Suite (38 tests)...${NC}"
  echo ""
  
  # Check if tests directory exists
  if [[ ! -d "tests" ]]; then
    echo -e "${RED}${ICON_ERROR} Tests directory not found${NC}"
    return 1
  fi
  
  # Check if node_modules exists
  if [[ ! -d "tests/node_modules" ]]; then
    echo -e "${YELLOW}${ICON_WARNING} Test dependencies not installed${NC}"
    echo -e "${GRAY}Installing dependencies...${NC}"
    (cd tests && npm install)
  fi
  
  # Run tests without coverage (fast)
  echo -e "${BLUE}${ICON_CHECK} Executing tests...${NC}"
  (cd tests && npm test -- --no-coverage)
  
  echo ""
  echo -e "${GREEN}${ICON_SUCCESS} Test execution complete${NC}"
}

run_tests_coverage() {
  echo -e "${MAGENTA}${ICON_INFO} Running Tests with Coverage Analysis...${NC}"
  echo ""
  
  # Check if tests directory exists
  if [[ ! -d "tests" ]]; then
    echo -e "${RED}${ICON_ERROR} Tests directory not found${NC}"
    return 1
  fi
  
  # Check if node_modules exists
  if [[ ! -d "tests/node_modules" ]]; then
    echo -e "${YELLOW}${ICON_WARNING} Test dependencies not installed${NC}"
    echo -e "${GRAY}Installing dependencies...${NC}"
    (cd tests && npm install)
  fi
  
  # Run tests with coverage
  echo -e "${BLUE}${ICON_CHECK} Executing tests with coverage...${NC}"
  (cd tests && npm run test:coverage)
  
  echo ""
  echo -e "${GREEN}${ICON_SUCCESS} Coverage report generated at tests/coverage/lcov-report/index.html${NC}"
  
  # Ask if user wants to open coverage report
  read -p "$(echo -e "${BOLD}Open coverage report in browser? (y/N):${NC} ")" open_coverage
  if [[ "$open_coverage" == "y" || "$open_coverage" == "Y" ]]; then
    if command -v xdg-open &> /dev/null; then
      xdg-open tests/coverage/lcov-report/index.html
    elif command -v open &> /dev/null; then
      open tests/coverage/lcov-report/index.html
    else
      echo -e "${YELLOW}${ICON_WARNING} Unable to open browser automatically${NC}"
      echo "Open: tests/coverage/lcov-report/index.html"
    fi
  fi
}

run_tests_interactive() {
  echo -e "${MAGENTA}${ICON_INFO} Launching Interactive Test Menu...${NC}"
  echo ""
  
  # Check if tests directory exists
  if [[ ! -d "tests" ]]; then
    echo -e "${RED}${ICON_ERROR} Tests directory not found${NC}"
    return 1
  fi
  
  # Check if test.sh exists
  if [[ ! -f "tests/test.sh" ]]; then
    echo -e "${RED}${ICON_ERROR} tests/test.sh not found${NC}"
    return 1
  fi
  
  # Make sure test.sh is executable
  chmod +x tests/test.sh 2>/dev/null || true
  
  # Execute test.sh
  (cd tests && ./test.sh)
}

complete_github_reset() {
  echo -e "${RED}${ICON_WARNING} 🚨 NUCLEAR OPTION: Complete Project Reset 🚨${NC}"
  echo -e "${RED}${BOLD}THIS WILL PERMANENTLY DELETE:${NC}"
  echo -e "${RED}  • ALL GitHub releases and tags${NC}"
  echo -e "${RED}  • ALL local tags${NC}"
  echo -e "${RED}  • ALL git history${NC}"
  echo -e "${RED}  • ALL branches (except develop/main)${NC}"
  echo -e "${RED}  • Your entire project history${NC}"
  echo ""
  echo -e "${YELLOW}${BOLD}⚠️  THIS ACTION CANNOT BE UNDONE! ⚠️${NC}"
  echo -e "${GRAY}Only use this if you want to start completely fresh${NC}"
  echo ""

  read -p "$(echo -e "${BOLD}${RED}Type 'DELETE_EVERYTHING' to confirm nuclear reset:${NC} ")" confirm

  if [[ "$confirm" != "DELETE_EVERYTHING" ]]; then
    echo -e "${GREEN}${ICON_SUCCESS} Smart choice! Operation cancelled${NC}"
    return
  fi

  local remote_url=$(git remote get-url origin 2>/dev/null || echo "")

  if [[ -n "$remote_url" ]]; then
    echo -e "${RED}${ICON_DELETE} Deleting ALL remote tags and releases...${NC}"

    # Delete all remote tags (this also deletes GitHub releases)
    local remote_tags=($(git ls-remote --tags origin 2>/dev/null | awk '{print $2}' | sed 's|refs/tags/||' | grep -v '\^{}$' || true))
    for tag in "${remote_tags[@]}"; do
      if [[ -n "$tag" ]]; then
        echo -e "${GRAY}Deleting remote tag/release: ${tag}${NC}"
        git push origin ":refs/tags/$tag" 2>/dev/null || true
      fi
    done

    # Delete all remote branches except main and develop
    local remote_branches=($(git ls-remote --heads origin 2>/dev/null | awk '{print $2}' | sed 's|refs/heads/||' | grep -v -E '^(main|develop)$' || true))
    for branch in "${remote_branches[@]}"; do
      if [[ -n "$branch" ]]; then
        echo -e "${GRAY}Deleting remote branch: ${branch}${NC}"
        git push origin ":$branch" 2>/dev/null || true
      fi
    done
  fi

  # Delete all local tags
  local local_tags=($(git tag -l))
  for tag in "${local_tags[@]}"; do
    if [[ -n "$tag" ]]; then
      echo -e "${GRAY}Deleting local tag: ${tag}${NC}"
      git tag -d "$tag" 2>/dev/null || true
    fi
  done

  # Delete all local branches except current, main, and develop
  local current_branch=$(git branch --show-current)
  local local_branches=($(git branch | sed 's/\*//g' | sed 's/^[ \t]*//' | grep -v -E "^(main|develop|${current_branch})$" || true))
  for branch in "${local_branches[@]}"; do
    if [[ -n "$branch" ]]; then
      echo -e "${GRAY}Deleting local branch: ${branch}${NC}"
      git branch -D "$branch" 2>/dev/null || true
    fi
  done

  echo -e "${GREEN}${ICON_SUCCESS} Complete GitHub reset finished!${NC}"
  echo -e "${BLUE}${ICON_INFO} Repository cleaned: no tags, releases, or extra branches${NC}"
  echo -e "${GRAY}Use option 23 (Fresh Start) to rebuild git history${NC}"
}



if [[ $# -ge 1 ]]; then
  case $1 in
    1) add_commit "$@" ;;
    2) push_develop "$@" ;;
    3) update_main_from_develop "$@" ;;
    4) create_tag "$@" ;;
    5) show_status "$@" ;;
    6) manage_remote "$@" ;;
    7) check_github_actions "$@" ;;
    8) switch_branch "$@" ;;
    9) list_branches "$@" ;;
    10) setup_develop "$@" ;;
    11) setup_main "$@" ;;
    12) list_tags "$@" ;;
    13) push_tag "$@" ;;
    14) show_commit_history "$@" ;;
    15) push_current "$@" ;;
    16) force_push "$@" ;;
    17) rename_branch "$@" ;;
    18) reset_hard "$@" ;;
    19) delete_branch "$@" ;;
    20) delete_tag "$@" ;;
    21) push_main "$@" ;;
    22) reset_remote "$@" ;;
    23) fresh_start "$@" ;;
    24) complete_github_reset "$@" ;;
    25) install_hooks "$@" ;;
    26) run_tests "$@" ;;
    27) run_tests_coverage "$@" ;;
    28) run_tests_interactive "$@" ;;
    *) echo -e "${RED}${ICON_ERROR} Invalid option: $1 (valid range: 1-28)${NC}" ;;
  esac
else
  while true; do
    show_menu
    case $choice in
      1) add_commit ;;
      2) push_develop ;;
      3) update_main_from_develop ;;
      4) create_tag ;;
      5) show_status ;;
      6) manage_remote ;;
      7) check_github_actions ;;
      8) switch_branch ;;
      9) list_branches ;;
      10) setup_develop ;;
      11) setup_main ;;
      12) list_tags ;;
      13) push_tag ;;
      14) show_commit_history ;;
      15) push_current ;;
      16) force_push ;;
      17) rename_branch ;;
      18) reset_hard ;;
      19) delete_branch ;;
      20) delete_tag ;;
      21) push_main ;;
      22) reset_remote ;;
      23) fresh_start ;;
      24) complete_github_reset ;;
      25) install_hooks ;;
      26) run_tests ;;
      27) run_tests_coverage ;;
      28) run_tests_interactive ;;
      0)
        echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${CYAN}║${NC}                           ${BOLD}${WHITE}Thank you for using${NC}                              ${CYAN}║${NC}"
        echo -e "${CYAN}║${NC}                      ${BOLD}${WHITE}${PROJECT_NAME} Git Tool${NC}                       ${CYAN}║${NC}"
        echo -e "${CYAN}║${NC}                                                                              ${CYAN}║${NC}"
        echo -e "${CYAN}║${NC}                    ${YELLOW}Developed by ${LEAD_DEVELOPER}${NC}                           ${CYAN}║${NC}"
        echo -e "${CYAN}║${NC}                  ${BLUE}${LEAD_DEVELOPER_SITE}${NC}                             ${CYAN}║${NC}"
        echo -e "${CYAN}║${NC}                     ${YELLOW}Scrum Master: ${SCRUM_MASTER}${NC}                          ${CYAN}║${NC}"
        echo -e "${CYAN}║${NC}                    ${BLUE}${SCRUM_MASTER_SITE}${NC}                               ${CYAN}║${NC}"
        echo -e "${CYAN}║${NC}                                                                              ${CYAN}║${NC}"
        echo -e "${CYAN}║${NC}              ${GRAY}${ORGANIZATION}${NC}                            ${CYAN}║${NC}"
        echo -e "${CYAN}║${NC}                    ${BLUE}${ORGANIZATION_SITE}${NC}                         ${CYAN}║${NC}"
        echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${GREEN}${ICON_SUCCESS} Happy coding! 🚀${NC}"
        break ;;
      *) echo -e "${RED}${ICON_ERROR} Invalid option${NC}" ;;
    esac
    echo ""
    read -p "$(echo -e "${GRAY}Press Enter to continue...${NC}")"
  done
fi
